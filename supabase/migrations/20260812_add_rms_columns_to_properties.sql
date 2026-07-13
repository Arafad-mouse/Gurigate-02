-- Add RMS-specific columns to properties table
-- This migration adds columns needed for the Residential Management System (RMS) module

-- Add RMS columns if they don't exist
DO $$
BEGIN
  -- Add total_units column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'total_units'
  ) THEN
    ALTER TABLE properties ADD COLUMN total_units INTEGER DEFAULT 0 CHECK (total_units >= 0);
  END IF;

  -- Add occupied_units column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'occupied_units'
  ) THEN
    ALTER TABLE properties ADD COLUMN occupied_units INTEGER DEFAULT 0 CHECK (occupied_units >= 0);
  END IF;

  -- Add vacant_units column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'vacant_units'
  ) THEN
    ALTER TABLE properties ADD COLUMN vacant_units INTEGER DEFAULT 0 CHECK (vacant_units >= 0);
  END IF;

  -- Add occupancy_rate column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'occupancy_rate'
  ) THEN
    ALTER TABLE properties ADD COLUMN occupancy_rate DECIMAL(5,2) DEFAULT 0 CHECK (occupancy_rate >= 0 AND occupancy_rate <= 100);
  END IF;

  -- Add published_to_homes column for marketplace integration
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'published_to_homes'
  ) THEN
    ALTER TABLE properties ADD COLUMN published_to_homes BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add marketplace_listing_id column to link to marketplace listings
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'marketplace_listing_id'
  ) THEN
    ALTER TABLE properties ADD COLUMN marketplace_listing_id UUID;
  END IF;

  -- Add monthly_revenue column for RMS tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'monthly_revenue'
  ) THEN
    ALTER TABLE properties ADD COLUMN monthly_revenue DECIMAL(12,2) DEFAULT 0 CHECK (monthly_revenue >= 0);
  END IF;

  -- Add outstanding_rent column for RMS tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'outstanding_rent'
  ) THEN
    ALTER TABLE properties ADD COLUMN outstanding_rent DECIMAL(12,2) DEFAULT 0 CHECK (outstanding_rent >= 0);
  END IF;

  -- Add maintenance_count column for RMS tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'maintenance_count'
  ) THEN
    ALTER TABLE properties ADD COLUMN maintenance_count INTEGER DEFAULT 0 CHECK (maintenance_count >= 0);
  END IF;

  -- Add upcoming_lease_expiry column for RMS tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'upcoming_lease_expiry'
  ) THEN
    ALTER TABLE properties ADD COLUMN upcoming_lease_expiry INTEGER DEFAULT 0 CHECK (upcoming_lease_expiry >= 0);
  END IF;
END $$;

-- Create indexes for RMS columns
CREATE INDEX IF NOT EXISTS idx_properties_published_to_homes ON properties(published_to_homes) WHERE published_to_homes = TRUE;
CREATE INDEX IF NOT EXISTS idx_properties_occupancy_rate ON properties(occupancy_rate);
CREATE INDEX IF NOT EXISTS idx_properties_marketplace_listing ON properties(marketplace_listing_id) WHERE marketplace_listing_id IS NOT NULL;

-- Add comment to document RMS columns
COMMENT ON COLUMN properties.total_units IS 'Total number of units in the property (RMS)';
COMMENT ON COLUMN properties.occupied_units IS 'Number of currently occupied units (RMS)';
COMMENT ON COLUMN properties.vacant_units IS 'Number of currently vacant units (RMS)';
COMMENT ON COLUMN properties.occupancy_rate IS 'Occupancy rate percentage (RMS)';
COMMENT ON COLUMN properties.published_to_homes IS 'Whether property is published to Homes marketplace (RMS)';
COMMENT ON COLUMN properties.marketplace_listing_id IS 'Reference to marketplace listing if published (RMS)';
COMMENT ON COLUMN properties.monthly_revenue IS 'Total monthly rental revenue (RMS)';
COMMENT ON COLUMN properties.outstanding_rent IS 'Total outstanding rent payments (RMS)';
COMMENT ON COLUMN properties.maintenance_count IS 'Number of units under maintenance (RMS)';
COMMENT ON COLUMN properties.upcoming_lease_expiry IS 'Number of leases expiring in next 30 days (RMS)';
