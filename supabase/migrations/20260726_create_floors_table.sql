-- Create floors table for commercial property management
-- This table stores floors within buildings

-- Check if table exists and add columns if needed
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'floors' AND table_schema = 'public') THEN
    -- Create table if it doesn't exist
    CREATE TABLE floors (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
      
      -- Floor identification
      floor_number INTEGER NOT NULL CHECK (floor_number > 0),
      units_count INTEGER NOT NULL DEFAULT 0 CHECK (units_count >= 0),
      
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
      CONSTRAINT unique_floor_per_building UNIQUE (building_id, floor_number)
    );
  ELSE
    -- Add missing columns if table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'floors' AND column_name = 'deleted_at') THEN
      ALTER TABLE floors ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'floors' AND column_name = 'deleted_by') THEN
      ALTER TABLE floors ADD COLUMN deleted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'floors' AND column_name = 'created_by') THEN
      ALTER TABLE floors ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'floors' AND column_name = 'updated_by') THEN
      ALTER TABLE floors ADD COLUMN updated_by UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'floors' AND column_name = 'metadata') THEN
      ALTER TABLE floors ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;
  END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_floors_building ON floors(building_id);
CREATE INDEX IF NOT EXISTS idx_floors_number ON floors(floor_number);
CREATE INDEX IF NOT EXISTS idx_floors_deleted_at ON floors(deleted_at) WHERE deleted_at IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE floors ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ BEGIN
  CREATE POLICY "Public can view floors" ON floors
    FOR SELECT USING (deleted_at IS NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Only create owner-based policies if buildings.owner_id exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'buildings' AND column_name = 'owner_id') THEN
    CREATE POLICY "Owners can manage their building floors" ON floors
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM buildings
          WHERE buildings.id = floors.building_id
            AND buildings.owner_id = auth.uid()
        )
      );
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'buildings' AND column_name = 'owner_id') THEN
    CREATE POLICY "Owners can insert floors" ON floors
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM buildings
          WHERE buildings.id = floors.building_id
            AND buildings.owner_id = auth.uid()
        )
      );
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Updated at trigger
DO $$ BEGIN
  CREATE TRIGGER update_floors_updated_at
    BEFORE UPDATE ON floors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Comments
COMMENT ON TABLE floors IS 'Floors within commercial buildings';
COMMENT ON COLUMN floors.building_id IS 'Reference to the building this floor belongs to';
COMMENT ON COLUMN floors.floor_number IS 'Floor number within the building';
COMMENT ON COLUMN floors.units_count IS 'Number of units on this floor';
