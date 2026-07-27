-- Drop duplicate foreign key constraint on property_images
-- The column rename created a new FK but the old one still exists, causing PGRST201 errors

-- Drop the old foreign key constraint
ALTER TABLE property_images DROP CONSTRAINT IF EXISTS property_images_property_id_fkey;

-- Keep only the new constraint (property_images_listing_id_fkey)
