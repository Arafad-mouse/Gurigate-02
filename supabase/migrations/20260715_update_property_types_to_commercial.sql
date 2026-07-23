-- Migration: Update Property Types to Commercial Only
-- Date: 2026-07-15
-- Description: Update property types from residential to commercial for RMS module

-- Step 1: Update existing properties to map to commercial types
-- Map residential types to appropriate commercial defaults
UPDATE properties 
SET type = 'office_building' 
WHERE type IN ('apartment', 'house', 'villa', 'studio', 'condo', 'townhouse', 'cottage', 'penthouse', 'loft', 'other');

-- Keep hotel as is (it's already commercial)
-- Update any other non-commercial types to office_building as default
UPDATE properties 
SET type = 'office_building' 
WHERE type NOT IN ('office_building', 'commercial_complex', 'shopping_mall', 'retail_shop', 'warehouse', 'hotel', 'restaurant', 'mixed_use_building', 'industrial_building', 'business_center');

-- Step 2: Add check constraint to ensure only commercial property types are used
ALTER TABLE properties 
DROP CONSTRAINT IF EXISTS properties_type_check;

ALTER TABLE properties 
ADD CONSTRAINT properties_type_check 
CHECK (type IN ('office_building', 'commercial_complex', 'shopping_mall', 'retail_shop', 'warehouse', 'hotel', 'restaurant', 'mixed_use_building', 'industrial_building', 'business_center'));

-- Step 3: Update property_type enum if it exists in the database
-- (This depends on whether you have an enum type - adjust as needed)

-- Step 4: Add comment to document the change
COMMENT ON COLUMN properties.type IS 'Commercial property type for RMS: office_building, commercial_complex, shopping_mall, retail_shop, warehouse, hotel, restaurant, mixed_use_building, industrial_building, business_center';

-- Step 5: Verify the migration
SELECT type, COUNT(*) as count 
FROM properties 
GROUP BY type 
ORDER BY count DESC;
