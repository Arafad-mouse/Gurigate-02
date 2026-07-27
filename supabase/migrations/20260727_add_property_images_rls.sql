-- Add RLS policies for property_images table
-- RLS is enabled but no policies exist, preventing data access

-- Create policy for public users to view images for approved properties
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

-- Create policy for authenticated users to view images for approved properties
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

-- Create policy for property owners to manage their property images
CREATE POLICY "Property owners can manage their property images" ON property_images
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_images.listing_id
      AND properties.owner_id = auth.uid()
    )
  );
