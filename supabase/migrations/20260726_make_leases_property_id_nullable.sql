-- Make property_id nullable in leases table for RMS architecture
-- RMS uses buildings instead of properties, so property_id should be nullable

-- Drop the NOT NULL constraint from property_id
ALTER TABLE leases ALTER COLUMN property_id DROP NOT NULL;

-- Note: The foreign key constraint fk_leases_property_id remains but allows NULL values
-- This allows RMS to create leases without linking to properties table
