-- Critical Security Fixes Migration (Corrected)
-- Addresses Supabase security vulnerabilities detected on 03 May 2026
-- 
-- Issues Fixed:
-- 1. Table publicly accessible (rls_disabled_in_public)
-- 2. Sensitive data publicly accessible (sensitive_columns_exposed)

-- ========================================
-- 1. REMOVE OVERLY PERMISSIVE POLICIES
-- ========================================

-- Drop all permissive policies that expose sensitive data
DROP POLICY IF EXISTS "Enable read access for all users" ON properties;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON properties;
DROP POLICY IF EXISTS "Enable update for property owners" ON properties;
DROP POLICY IF EXISTS "Enable delete for property owners" ON properties;

DROP POLICY IF EXISTS "Enable read access for property addresses" ON locations;
DROP POLICY IF EXISTS "Enable manage for property owners" ON locations;

DROP POLICY IF EXISTS "Enable read access for property pricing" ON properties;
DROP POLICY IF EXISTS "Enable manage for property owners" ON properties;

DROP POLICY IF EXISTS "Enable read access for property features" ON properties;
DROP POLICY IF EXISTS "Enable manage for property owners" ON properties;

DROP POLICY IF EXISTS "Enable read access for property images" ON property_images;
DROP POLICY IF EXISTS "Enable manage for property owners" ON property_images;

DROP POLICY IF EXISTS "Enable read access for property reviews" ON property_reviews;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON property_reviews;
DROP POLICY IF EXISTS "Enable update for review authors" ON property_reviews;
DROP POLICY IF EXISTS "Enable delete for review authors" ON property_reviews;

DROP POLICY IF EXISTS "Enable read access for bookings" ON bookings;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON bookings;
DROP POLICY IF EXISTS "Enable update for booking participants" ON bookings;
DROP POLICY IF EXISTS "Enable delete for booking participants" ON bookings;

DROP POLICY IF EXISTS "Enable read access for wishlists" ON wishlists;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON wishlists;
DROP POLICY IF EXISTS "Enable delete for wishlist owners" ON wishlists;

-- ========================================
-- 2. SECURE PROPERTIES TABLE POLICIES
-- ========================================

-- Public users can only view approved and active properties
CREATE POLICY "Public users can view approved active properties" ON properties
  FOR SELECT USING (
    auth.role() = 'anon' AND
    is_approved = TRUE AND 
    status = 'active'
  );

-- Authenticated users can view approved and active properties
CREATE POLICY "Authenticated users can view approved active properties" ON properties
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    is_approved = TRUE AND 
    status = 'active'
  );

-- Property owners can view their own properties regardless of status
CREATE POLICY "Property owners can view their own properties" ON properties
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    auth.uid() = owner_id
  );

-- Authenticated users can create properties (they become owners)
CREATE POLICY "Authenticated users can create properties" ON properties
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND 
    auth.uid() = owner_id
  );

-- Property owners can update their properties
CREATE POLICY "Property owners can update their properties" ON properties
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND 
    auth.uid() = owner_id
  );

-- Property owners can delete their properties
CREATE POLICY "Property owners can delete their properties" ON properties
  FOR DELETE USING (
    auth.role() = 'authenticated' AND 
    auth.uid() = owner_id
  );

-- ========================================
-- 3. SECURE LOCATIONS TABLE POLICIES
-- ========================================

-- Public users can view locations for approved active properties
CREATE POLICY "Public users can view locations for approved properties" ON locations
  FOR SELECT USING (
    auth.role() = 'anon' AND
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.location_id = locations.id
      AND properties.is_approved = TRUE 
      AND properties.status = 'active'
    )
  );

-- Authenticated users can view locations for approved active properties
CREATE POLICY "Authenticated users can view locations for approved properties" ON locations
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.location_id = locations.id
      AND properties.is_approved = TRUE 
      AND properties.status = 'active'
    )
  );

-- Property owners can manage locations for their properties
CREATE POLICY "Property owners can manage their property locations" ON locations
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.location_id = locations.id
      AND properties.owner_id = auth.uid()
    )
  );

-- ========================================
-- 4. SECURE PROPERTY IMAGES POLICIES
-- ========================================

-- Public users can view images for approved active properties
CREATE POLICY "Public users can view images for approved properties" ON property_images
  FOR SELECT USING (
    auth.role() = 'anon' AND
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_images.property_id
      AND properties.is_approved = TRUE 
      AND properties.status = 'active'
    )
  );

-- Authenticated users can view images for approved active properties
CREATE POLICY "Authenticated users can view images for approved properties" ON property_images
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_images.property_id
      AND properties.is_approved = TRUE 
      AND properties.status = 'active'
    )
  );

-- Property owners can manage their property images
CREATE POLICY "Property owners can manage their property images" ON property_images
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_images.property_id
      AND properties.owner_id = auth.uid()
    )
  );

-- ========================================
-- 5. SECURE PROPERTY REVIEWS POLICIES
-- ========================================

-- Public users can view reviews for approved active properties
CREATE POLICY "Public users can view reviews for approved properties" ON property_reviews
  FOR SELECT USING (
    auth.role() = 'anon' AND
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_reviews.property_id
      AND properties.is_approved = TRUE 
      AND properties.status = 'active'
    )
  );

-- Authenticated users can view reviews for approved active properties
CREATE POLICY "Authenticated users can view reviews for approved properties" ON property_reviews
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_reviews.property_id
      AND properties.is_approved = TRUE 
      AND properties.status = 'active'
    )
  );

-- Authenticated users can create reviews for approved properties they've interacted with
CREATE POLICY "Authenticated users can create reviews" ON property_reviews
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    auth.uid() = guest_id AND
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_reviews.property_id
      AND properties.is_approved = TRUE 
      AND properties.status = 'active'
    )
  );

-- Users can update their own reviews
CREATE POLICY "Users can update their own reviews" ON property_reviews
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND 
    auth.uid() = guest_id
  );

-- Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews" ON property_reviews
  FOR DELETE USING (
    auth.role() = 'authenticated' AND 
    auth.uid() = guest_id
  );

-- ========================================
-- 6. SECURE BOOKINGS TABLE POLICIES
-- ========================================

-- Bookings are private - only participants can view them
CREATE POLICY "Guests can view their own bookings" ON bookings
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    auth.uid() = guest_id
  );

-- Property owners can view bookings for their properties
CREATE POLICY "Property owners can view bookings for their properties" ON bookings
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = bookings.property_id
      AND properties.owner_id = auth.uid()
    )
  );

-- Authenticated users can create bookings for approved properties
CREATE POLICY "Authenticated users can create bookings" ON bookings
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    auth.uid() = guest_id AND
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = bookings.property_id
      AND properties.is_approved = TRUE 
      AND properties.status = 'active'
    )
  );

-- Guests can update their own bookings
CREATE POLICY "Guests can update their own bookings" ON bookings
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND 
    auth.uid() = guest_id
  );

-- Guests can cancel their own bookings
CREATE POLICY "Guests can cancel their own bookings" ON bookings
  FOR DELETE USING (
    auth.role() = 'authenticated' AND 
    auth.uid() = guest_id
  );

-- ========================================
-- 7. SECURE WISHLISTS POLICIES
-- ========================================

-- Wishlists are private - only users can view their own
CREATE POLICY "Users can view their own wishlists" ON wishlists
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    auth.uid() = user_id
  );

-- Authenticated users can add to wishlist
CREATE POLICY "Authenticated users can add to wishlist" ON wishlists
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND 
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = wishlists.property_id
      AND properties.is_approved = TRUE 
      AND properties.status = 'active'
    )
  );

-- Users can remove from their wishlist
CREATE POLICY "Users can remove from their wishlist" ON wishlists
  FOR DELETE USING (
    auth.role() = 'authenticated' AND 
    auth.uid() = user_id
  );

-- ========================================
-- 8. ENSURE RLS IS ENABLED ON ALL TABLES
-- ========================================

-- Double-check RLS is enabled on all tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 9. SECURITY VERIFICATION
-- ========================================

-- Create a function to verify security policies are working
CREATE OR REPLACE FUNCTION verify_security_policies()
RETURNS TABLE(table_name TEXT, policy_count INT, has_public_access BOOLEAN) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname||'.'||tablename as table_name,
    COUNT(pol.policyname) as policy_count,
    EXISTS(
      SELECT 1 FROM pg_policies pol 
      WHERE pol.schemaname||'.'||pol.tablename = schemaname||'.'||tablename
      AND pol.roles = '{public}'
      AND pol.cmd = 'SELECT'
      AND pol.qual = 'true'
    ) as has_public_access
  FROM pg_tables t
  LEFT JOIN pg_policies pol ON t.schemaname = pol.schemaname AND t.tablename = pol.tablename
  WHERE t.schemaname = 'public' 
  AND t.tablename IN (
    'properties', 'locations', 'property_images', 'property_reviews',
    'bookings', 'wishlists'
  )
  GROUP BY schemaname, tablename
  ORDER BY tablename;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant usage to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

COMMIT;
