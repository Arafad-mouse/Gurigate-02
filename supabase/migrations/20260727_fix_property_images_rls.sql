-- Fix RLS policies for property_images to use correct column name (listing_id)
-- The table uses listing_id but policies were referencing property_id

-- Drop existing policies
DROP POLICY IF EXISTS "Public users can view images for approved properties" ON property_images;
DROP POLICY IF EXISTS "Authenticated users can view images for approved properties" ON property_images;
DROP POLICY IF EXISTS "Property owners can manage their property images" ON property_images;
DROP POLICY IF EXISTS "Enable read access for property images" ON property_images;
DROP POLICY IF EXISTS "Enable manage for property owners" ON property_images;
DROP POLICY IF EXISTS "Users can view images for approved properties" ON property_images;

-- Create new policies with correct column name (listing_id)
CREATE POLICY "Public users can view images for approved properties" ON property_images
  FOR SELECT USING (
    auth.role() = 'anon' AND
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_images.listing_id
      AND properties.approval_status = 'approved'
      AND properties.status = 'active'
    )
  );

CREATE POLICY "Authenticated users can view images for approved properties" ON property_images
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_images.listing_id
      AND properties.approval_status = 'approved'
      AND properties.status = 'active'
    )
  );

CREATE POLICY "Property owners can manage their property images" ON property_images
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_images.listing_id
      AND properties.owner_id = auth.uid()
    )
  );

-- Enable RLS on property_images
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
