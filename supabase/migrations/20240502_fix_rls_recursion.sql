-- Fix RLS infinite recursion by removing profiles references and simplifying policies
-- This migration fixes the infinite recursion error in properties table access

-- ========================================
-- 1. DROP PROBLEMATIC POLICIES
-- ========================================

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view addresses for approved properties" ON property_addresses;
DROP POLICY IF EXISTS "Property owners can manage their property addresses" ON property_addresses;
DROP POLICY IF EXISTS "Users can view pricing for approved properties" ON property_pricing;
DROP POLICY IF EXISTS "Property owners can manage their property pricing" ON property_pricing;
DROP POLICY IF EXISTS "Users can view features for approved properties" ON property_features;
DROP POLICY IF EXISTS "Property owners can manage their property features" ON property_features;
DROP POLICY IF EXISTS "Users can view images for approved properties" ON property_images;
DROP POLICY IF EXISTS "Property owners can manage their property images" ON property_images;
DROP POLICY IF EXISTS "Users can view reviews for approved properties" ON property_reviews;
DROP POLICY IF EXISTS "Property owners can view bookings for their properties" ON property_bookings;
DROP POLICY IF EXISTS "Authenticated users can create bookings" ON property_bookings;
DROP POLICY IF EXISTS "Users can view their own wishlists" ON wishlists;
DROP POLICY IF EXISTS "Authenticated users can add to wishlist" ON wishlists;

-- ========================================
-- 2. SIMPLIFIED PROPERTIES POLICIES
-- ========================================

-- Drop existing properties policies
DROP POLICY IF EXISTS "Users can view approved active properties" ON properties;
DROP POLICY IF EXISTS "Property owners can view their own properties" ON properties;
DROP POLICY IF EXISTS "Authenticated users can create properties" ON properties;
DROP POLICY IF EXISTS "Property owners can update their properties" ON properties;
DROP POLICY IF EXISTS "Property owners can delete their properties" ON properties;

-- Create new simplified properties policies
CREATE POLICY "Enable read access for all users" ON properties
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON properties
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for property owners" ON properties
  FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = owner_id);

CREATE POLICY "Enable delete for property owners" ON properties
  FOR DELETE USING (auth.role() = 'authenticated' AND auth.uid() = owner_id);

-- ========================================
-- 3. SIMPLIFIED RELATED TABLE POLICIES
-- ========================================

-- Property addresses
CREATE POLICY "Enable read access for property addresses" ON property_addresses
  FOR SELECT USING (true);

CREATE POLICY "Enable manage for property owners" ON property_addresses
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    auth.uid() = (SELECT owner_id FROM properties WHERE properties.id = property_addresses.property_id)
  );

-- Property pricing
CREATE POLICY "Enable read access for property pricing" ON property_pricing
  FOR SELECT USING (true);

CREATE POLICY "Enable manage for property owners" ON property_pricing
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    auth.uid() = (SELECT owner_id FROM properties WHERE properties.id = property_pricing.property_id)
  );

-- Property features
CREATE POLICY "Enable read access for property features" ON property_features
  FOR SELECT USING (true);

CREATE POLICY "Enable manage for property owners" ON property_features
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    auth.uid() = (SELECT owner_id FROM properties WHERE properties.id = property_features.property_id)
  );

-- Property images
CREATE POLICY "Enable read access for property images" ON property_images
  FOR SELECT USING (true);

CREATE POLICY "Enable manage for property owners" ON property_images
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    auth.uid() = (SELECT owner_id FROM properties WHERE properties.id = property_images.property_id)
  );

-- Property reviews
CREATE POLICY "Enable read access for property reviews" ON property_reviews
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON property_reviews
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for review authors" ON property_reviews
  FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = guest_id);

CREATE POLICY "Enable delete for review authors" ON property_reviews
  FOR DELETE USING (auth.role() = 'authenticated' AND auth.uid() = guest_id);

-- Property bookings
CREATE POLICY "Enable read access for bookings" ON property_bookings
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    (auth.uid() = guest_id OR auth.uid() = (SELECT owner_id FROM properties WHERE properties.id = property_bookings.property_id))
  );

CREATE POLICY "Enable insert for authenticated users" ON property_bookings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for booking participants" ON property_bookings
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND 
    (auth.uid() = guest_id OR auth.uid() = (SELECT owner_id FROM properties WHERE properties.id = property_bookings.property_id))
  );

CREATE POLICY "Enable delete for booking participants" ON property_bookings
  FOR DELETE USING (
    auth.role() = 'authenticated' AND 
    (auth.uid() = guest_id OR auth.uid() = (SELECT owner_id FROM properties WHERE properties.id = property_bookings.property_id))
  );

-- Wishlists
CREATE POLICY "Enable read access for wishlists" ON wishlists
  FOR SELECT USING (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Enable insert for authenticated users" ON wishlists
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Enable delete for wishlist owners" ON wishlists
  FOR DELETE USING (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- ========================================
-- 4. ENSURE PROPERTIES TABLE HAS REQUIRED COLUMNS
-- ========================================

-- Add is_featured column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'properties' AND column_name = 'is_featured') THEN
    ALTER TABLE properties ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Add is_approved column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'properties' AND column_name = 'is_approved') THEN
    ALTER TABLE properties ADD COLUMN is_approved BOOLEAN DEFAULT TRUE;
  END IF;
END $$;

-- Add city column if it doesn't exist (for filtering)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'properties' AND column_name = 'city') THEN
    ALTER TABLE properties ADD COLUMN city TEXT;
  END IF;
END $$;

-- ========================================
-- 5. UPDATE SAMPLE DATA
-- ========================================

-- Set some sample properties as featured
UPDATE properties 
SET is_featured = true 
WHERE id IN (
  SELECT id FROM properties 
  LIMIT 3
);

-- Set some cities for testing
UPDATE properties 
SET city = CASE 
  WHEN id % 3 = 0 THEN 'Hargeisa'
  WHEN id % 3 = 1 THEN 'Nairobi'
  ELSE 'Mogadishu'
END
WHERE city IS NULL OR city = '';

-- Ensure all properties are approved
UPDATE properties SET is_approved = true WHERE is_approved IS NULL;
