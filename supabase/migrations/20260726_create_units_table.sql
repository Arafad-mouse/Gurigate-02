-- Create units table for commercial property management
-- This table stores individual units within buildings/floors

-- Create enum types if they don't exist
DO $$ BEGIN
  CREATE TYPE unit_type AS ENUM (
    'office',
    'retail',
    'warehouse',
    'restaurant',
    'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE unit_status AS ENUM (
    'available',
    'reserved',
    'occupied',
    'under_maintenance',
    'cleaning',
    'blocked'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Check if table exists and add columns if needed
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'units' AND table_schema = 'public') THEN
    -- Create table if it doesn't exist
    CREATE TABLE units (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
      floor_id UUID REFERENCES floors(id) ON DELETE SET NULL,
      
      -- Unit identification
      unit_number TEXT NOT NULL,
      unit_type unit_type NOT NULL DEFAULT 'office',
      size NUMERIC NOT NULL DEFAULT 50 CHECK (size > 0),
      
      -- Status and availability
      status unit_status NOT NULL DEFAULT 'available',
      base_rent NUMERIC NOT NULL DEFAULT 0 CHECK (base_rent >= 0),
      
      -- Lease relationship
      current_lease_id UUID REFERENCES leases(id) ON DELETE SET NULL,
      
      -- Metadata
      metadata JSONB DEFAULT '{}',
      
      -- Soft delete
      deleted_at TIMESTAMP WITH TIME ZONE,
      deleted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      
      -- Audit fields
      created_by UUID REFERENCES auth.users(id),
      updated_by UUID REFERENCES auth.users(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      
      -- Constraints
      CONSTRAINT unique_unit_per_building UNIQUE (building_id, unit_number)
    );
  ELSE
    -- Add missing columns if table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'units' AND column_name = 'deleted_at') THEN
      ALTER TABLE units ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'units' AND column_name = 'deleted_by') THEN
      ALTER TABLE units ADD COLUMN deleted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'units' AND column_name = 'created_by') THEN
      ALTER TABLE units ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'units' AND column_name = 'updated_by') THEN
      ALTER TABLE units ADD COLUMN updated_by UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'units' AND column_name = 'metadata') THEN
      ALTER TABLE units ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;
  END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_units_building ON units(building_id);
CREATE INDEX IF NOT EXISTS idx_units_floor ON units(floor_id);
CREATE INDEX IF NOT EXISTS idx_units_status ON units(status);
CREATE INDEX IF NOT EXISTS idx_units_type ON units(unit_type);
CREATE INDEX IF NOT EXISTS idx_units_lease ON units(current_lease_id) WHERE current_lease_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_units_deleted_at ON units(deleted_at) WHERE deleted_at IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE units ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ BEGIN
  CREATE POLICY "Public can view units" ON units
    FOR SELECT USING (deleted_at IS NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Only create owner-based policies if buildings.owner_id exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'buildings' AND column_name = 'owner_id') THEN
    CREATE POLICY "Owners can manage their building units" ON units
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM buildings
          WHERE buildings.id = units.building_id
            AND buildings.owner_id = auth.uid()
        )
      );
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'buildings' AND column_name = 'owner_id') THEN
    CREATE POLICY "Owners can insert units" ON units
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM buildings
          WHERE buildings.id = units.building_id
            AND buildings.owner_id = auth.uid()
        )
      );
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Updated at trigger
DO $$ BEGIN
  CREATE TRIGGER update_units_updated_at
    BEFORE UPDATE ON units
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Comments
COMMENT ON TABLE units IS 'Individual units within commercial buildings';
COMMENT ON COLUMN units.building_id IS 'Reference to the building this unit belongs to';
COMMENT ON COLUMN units.floor_id IS 'Reference to the floor this unit is on';
COMMENT ON COLUMN units.unit_number IS 'Unique identifier for the unit within the building';
COMMENT ON COLUMN units.unit_type IS 'Type of unit (office, retail, warehouse, etc.)';
COMMENT ON COLUMN units.size IS 'Size in square meters';
COMMENT ON COLUMN units.status IS 'Current availability status';
COMMENT ON COLUMN units.base_rent IS 'Base monthly rent in cents';
COMMENT ON COLUMN units.current_lease_id IS 'Reference to the active lease for this unit';
