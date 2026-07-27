-- Create buildings table for commercial property management
-- This table stores commercial buildings with their metrics

-- Check if table exists and add columns if needed
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'buildings' AND table_schema = 'public') THEN
    -- Create table if it doesn't exist
    CREATE TABLE buildings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      
      -- Building identification
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      
      -- Metrics (calculated from units)
      floors_count INTEGER NOT NULL DEFAULT 0 CHECK (floors_count >= 0),
      total_units INTEGER NOT NULL DEFAULT 0 CHECK (total_units >= 0),
      occupied_units INTEGER NOT NULL DEFAULT 0 CHECK (occupied_units >= 0),
      vacant_units INTEGER NOT NULL DEFAULT 0 CHECK (vacant_units >= 0),
      monthly_revenue NUMERIC NOT NULL DEFAULT 0 CHECK (monthly_revenue >= 0),
      occupancy_rate NUMERIC NOT NULL DEFAULT 0 CHECK (occupancy_rate >= 0 AND occupancy_rate <= 100),
      
      -- Metadata
      metadata JSONB DEFAULT '{}',
      
      -- Soft delete
      deleted_at TIMESTAMP WITH TIME ZONE,
      deleted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      
      -- Audit fields
      created_by UUID REFERENCES auth.users(id),
      updated_by UUID REFERENCES auth.users(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  ELSE
    -- Add missing columns if table exists
    -- First add owner_id if it doesn't exist (make it nullable temporarily)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'buildings' AND column_name = 'owner_id') THEN
      ALTER TABLE buildings ADD COLUMN owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'buildings' AND column_name = 'deleted_at') THEN
      ALTER TABLE buildings ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'buildings' AND column_name = 'deleted_by') THEN
      ALTER TABLE buildings ADD COLUMN deleted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'buildings' AND column_name = 'created_by') THEN
      ALTER TABLE buildings ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'buildings' AND column_name = 'updated_by') THEN
      ALTER TABLE buildings ADD COLUMN updated_by UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'buildings' AND column_name = 'metadata') THEN
      ALTER TABLE buildings ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;
    
    -- Add missing metric columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'buildings' AND column_name = 'floors_count') THEN
      ALTER TABLE buildings ADD COLUMN floors_count INTEGER NOT NULL DEFAULT 0 CHECK (floors_count >= 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'buildings' AND column_name = 'total_units') THEN
      ALTER TABLE buildings ADD COLUMN total_units INTEGER NOT NULL DEFAULT 0 CHECK (total_units >= 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'buildings' AND column_name = 'occupied_units') THEN
      ALTER TABLE buildings ADD COLUMN occupied_units INTEGER NOT NULL DEFAULT 0 CHECK (occupied_units >= 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'buildings' AND column_name = 'vacant_units') THEN
      ALTER TABLE buildings ADD COLUMN vacant_units INTEGER NOT NULL DEFAULT 0 CHECK (vacant_units >= 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'buildings' AND column_name = 'monthly_revenue') THEN
      ALTER TABLE buildings ADD COLUMN monthly_revenue NUMERIC NOT NULL DEFAULT 0 CHECK (monthly_revenue >= 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'buildings' AND column_name = 'occupancy_rate') THEN
      ALTER TABLE buildings ADD COLUMN occupancy_rate NUMERIC NOT NULL DEFAULT 0 CHECK (occupancy_rate >= 0 AND occupancy_rate <= 100);
    END IF;
  END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_buildings_owner ON buildings(owner_id);
CREATE INDEX IF NOT EXISTS idx_buildings_city ON buildings(city);
CREATE INDEX IF NOT EXISTS idx_buildings_deleted_at ON buildings(deleted_at) WHERE deleted_at IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ BEGIN
  CREATE POLICY "Public can view buildings" ON buildings
    FOR SELECT USING (deleted_at IS NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Only create owner-based policies if owner_id column exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'buildings' AND column_name = 'owner_id') THEN
    CREATE POLICY "Owners can manage their buildings" ON buildings
      FOR ALL USING (owner_id = auth.uid());
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'buildings' AND column_name = 'owner_id') THEN
    CREATE POLICY "Owners can insert buildings" ON buildings
      FOR INSERT WITH CHECK (owner_id = auth.uid());
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Updated at trigger
DO $$ BEGIN
  CREATE TRIGGER update_buildings_updated_at
    BEFORE UPDATE ON buildings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Comments
COMMENT ON TABLE buildings IS 'Commercial buildings with rental metrics';
COMMENT ON COLUMN buildings.owner_id IS 'Owner of the building';
COMMENT ON COLUMN buildings.floors_count IS 'Total number of floors';
COMMENT ON COLUMN buildings.total_units IS 'Total number of units';
COMMENT ON COLUMN buildings.occupied_units IS 'Number of occupied units';
COMMENT ON COLUMN buildings.vacant_units IS 'Number of vacant units';
COMMENT ON COLUMN buildings.monthly_revenue IS 'Total monthly revenue in cents';
COMMENT ON COLUMN buildings.occupancy_rate IS 'Occupancy rate percentage';
