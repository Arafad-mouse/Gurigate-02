-- Critical Security Fixes Migration
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

DROP POLICY IF EXISTS "Enable read access for property addresses" ON property_addresses;
DROP POLICY IF EXISTS "Enable manage for property owners" ON property_addresses;

DROP POLICY IF EXISTS "Enable read access for property pricing" ON property_pricing;
DROP POLICY IF EXISTS "Enable manage for property owners" ON property_pricing;

DROP POLICY IF EXISTS "Enable read access for property features" ON property_features;
DROP POLICY IF EXISTS "Enable manage for property owners" ON property_features;

DROP POLICY IF EXISTS "Enable read access for property images" ON property_images;
DROP POLICY IF EXISTS "Enable manage for property owners" ON property_images;

DROP POLICY IF EXISTS "Enable read access for property reviews" ON property_reviews;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON property_reviews;
DROP POLICY IF EXISTS "Enable update for review authors" ON property_reviews;
DROP POLICY IF EXISTS "Enable delete for review authors" ON property_reviews;

DROP POLICY IF EXISTS "Enable read access for bookings" ON property_bookings;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON property_bookings;
DROP POLICY IF EXISTS "Enable update for booking participants" ON property_bookings;
DROP POLICY IF EXISTS "Enable delete for booking participants" ON property_bookings;

DROP POLICY IF EXISTS "Enable read access for wishlists" ON wishlists;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON wishlists;
DROP POLICY IF EXISTS "Enable delete for wishlist owners" ON wishlists;

-- ========================================
-- 2. SECURE PROPERTIES TABLE POLICIES
-- ========================================

-- Public users can only view approved and available properties
CREATE POLICY "Public users can view approved available properties" ON properties
  FOR SELECT USING (
    auth.role() = 'anon' AND
    is_approved = TRUE AND 
    status = 'available'
  );

-- Authenticated users can view approved and available properties
CREATE POLICY "Authenticated users can view approved available properties" ON properties
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    is_approved = TRUE AND 
    status = 'available'
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
-- 3. SECURE PROPERTY ADDRESSES POLICIES
-- ========================================

-- Public users can view addresses for approved available properties
CREATE POLICY "Public users can view addresses for approved properties" ON property_addresses
  FOR SELECT USING (
    auth.role() = 'anon' AND
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_addresses.property_id
      AND properties.is_approved = TRUE 
      AND properties.status = 'available'
    )
  );

-- Authenticated users can view addresses for approved available properties
CREATE POLICY "Authenticated users can view addresses for approved properties" ON property_addresses
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_addresses.property_id
      AND properties.is_approved = TRUE 
      AND properties.status = 'available'
    )
  );

-- Property owners can manage their property addresses
CREATE POLICY "Property owners can manage their property addresses" ON property_addresses
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    auth.uid() = (SELECT owner_id FROM properties WHERE properties.id = property_addresses.property_id)
  );

-- ========================================
-- 4. SECURE PROPERTY PRICING POLICIES
-- ========================================

-- Public users can view pricing for approved available properties
CREATE POLICY "Public users can view pricing for approved properties" ON property_pricing
  FOR SELECT USING (
    auth.role() = 'anon' AND
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_pricing.property_id
      AND properties.is_approved = TRUE 
      AND properties.status = 'available'
    )
  );

-- Authenticated users can view pricing for approved available properties
CREATE POLICY "Authenticated users can view pricing for approved properties" ON property_pricing
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_pricing.property_id
      AND properties.is_approved = TRUE 
      AND properties.status = 'available'
    )
  );

-- Property owners can manage their property pricing
CREATE POLICY "Property owners can manage their property pricing" ON property_pricing
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    auth.uid() = (SELECT owner_id FROM properties WHERE properties.id = property_pricing.property_id)
  );

-- ========================================
-- 5. SECURE PROPERTY FEATURES POLICIES
-- ========================================

-- Public users can view features for approved available properties
CREATE POLICY "Public users can view features for approved properties" ON property_features
  FOR SELECT USING (
    auth.role() = 'anon' AND
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_features.property_id
      AND properties.is_approved = TRUE 
      AND properties.status = 'available'
    )
  );

-- Authenticated users can view features for approved available properties
CREATE POLICY "Authenticated users can view features for approved properties" ON property_features
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_features.property_id
      AND properties.is_approved = TRUE 
      AND properties.status = 'available'
    )
  );

-- Property owners can manage their property features
CREATE POLICY "Property owners can manage their property features" ON property_features
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    auth.uid() = (SELECT owner_id FROM properties WHERE properties.id = property_features.property_id)
  );

-- ========================================
-- 6. SECURE PROPERTY IMAGES POLICIES
-- ========================================

-- Public users can view images for approved available properties
CREATE POLICY "Public users can view images for approved properties" ON property_images
  FOR SELECT USING (
    auth.role() = 'anon' AND
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_images.property_id
      AND properties.is_approved = TRUE 
      AND properties.status = 'available'
    )
  );

-- Authenticated users can view images for approved available properties
CREATE POLICY "Authenticated users can view images for approved properties" ON property_images
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_images.property_id
      AND properties.is_approved = TRUE 
      AND properties.status = 'available'
    )
  );

-- Property owners can manage their property images
CREATE POLICY "Property owners can manage their property images" ON property_images
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    auth.uid() = (SELECT owner_id FROM properties WHERE properties.id = property_images.property_id)
  );

-- ========================================
-- 7. SECURE PROPERTY REVIEWS POLICIES
-- ========================================

-- Public users can view reviews for approved available properties
CREATE POLICY "Public users can view reviews for approved properties" ON property_reviews
  FOR SELECT USING (
    auth.role() = 'anon' AND
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_reviews.property_id
      AND properties.is_approved = TRUE 
      AND properties.status = 'available'
    )
  );

-- Authenticated users can view reviews for approved available properties
CREATE POLICY "Authenticated users can view reviews for approved properties" ON property_reviews
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_reviews.property_id
      AND properties.is_approved = TRUE 
      AND properties.status = 'available'
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
      AND properties.status = 'available'
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
-- 8. SECURE PROPERTY BOOKINGS POLICIES
-- ========================================

-- Bookings are private - only participants can view them
CREATE POLICY "Guests can view their own bookings" ON property_bookings
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    auth.uid() = guest_id
  );

-- Property owners can view bookings for their properties
CREATE POLICY "Property owners can view bookings for their properties" ON property_bookings
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    auth.uid() = (SELECT owner_id FROM properties WHERE properties.id = property_bookings.property_id)
  );

-- Authenticated users can create bookings for approved properties
CREATE POLICY "Authenticated users can create bookings" ON property_bookings
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    auth.uid() = guest_id AND
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_bookings.property_id
      AND properties.is_approved = TRUE 
      AND properties.status = 'available'
    )
  );

-- Guests can update their own bookings
CREATE POLICY "Guests can update their own bookings" ON property_bookings
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND 
    auth.uid() = guest_id
  );

-- Guests can cancel their own bookings
CREATE POLICY "Guests can cancel their own bookings" ON property_bookings
  FOR DELETE USING (
    auth.role() = 'authenticated' AND 
    auth.uid() = guest_id
  );

-- ========================================
-- 9. SECURE WISHLISTS POLICIES
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
      AND properties.status = 'available'
    )
  );

-- Users can remove from their wishlist
CREATE POLICY "Users can remove from their wishlist" ON wishlists
  FOR DELETE USING (
    auth.role() = 'authenticated' AND 
    auth.uid() = user_id
  );

-- ========================================
-- 10. ENSURE RLS IS ENABLED ON ALL TABLES
-- ========================================

-- Double-check RLS is enabled on all tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 11. AUDIT LOGGING FOR SECURITY EVENTS
-- ========================================

-- Create audit log table for security monitoring
CREATE TABLE IF NOT EXISTS security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  user_id UUID,
  action VARCHAR(20) NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only system and admins can view audit logs
CREATE POLICY "Only system can view audit logs" ON security_audit_log
  FOR SELECT USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'is_admin' = 'true'
    )
  );

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" ON security_audit_log
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- ========================================
-- 12. SECURITY VERIFICATION
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
    'properties', 'property_addresses', 'property_pricing', 
    'property_features', 'property_images', 'property_reviews',
    'property_bookings', 'wishlists'
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
