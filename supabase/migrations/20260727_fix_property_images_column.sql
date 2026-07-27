-- Fix property_images table column name mismatch
-- The seed data uses 'listing_id' but the table schema has 'property_id'
-- This migration ensures the table has the correct column name

-- Check if listing_id column exists, if not rename property_id to listing_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'property_images' 
    AND column_name = 'property_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'property_images' 
    AND column_name = 'listing_id'
  ) THEN
    ALTER TABLE property_images RENAME COLUMN property_id TO listing_id;
  END IF;
END $$;

-- Ensure the foreign key references properties.id correctly
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'property_images_listing_id_fkey'
  ) THEN
    ALTER TABLE property_images 
    ADD CONSTRAINT property_images_listing_id_fkey 
    FOREIGN KEY (listing_id) REFERENCES properties(id) ON DELETE CASCADE;
  END IF;
END $$;
