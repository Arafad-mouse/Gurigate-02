// Apply RLS fix to Supabase database
// This script applies the migration to fix infinite recursion
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hjhpdzmsfpkiewzibrtr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqaHBkem1zZnBraWV3emlicnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1ODE5NDksImV4cCI6MjA4NzE1Nzk0OX0.xkmk-6rrFxolOjg7n50akB5IiN6hN5L_hADTbDyPBiU';

// Note: This would need to be executed with a service role key to apply migrations
// For now, we'll simulate what the migration would do

const migrationSQL = `
-- Drop problematic policies that cause recursion
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
DROP POLICY IF EXISTS "Users can view their own wishlists" ON wishlists;
DROP POLICY IF EXISTS "Authenticated users can add to wishlist" ON wishlists;

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

-- Add required columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'properties' AND column_name = 'is_featured') THEN
    ALTER TABLE properties ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'properties' AND column_name = 'is_approved') THEN
    ALTER TABLE properties ADD COLUMN is_approved BOOLEAN DEFAULT TRUE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'properties' AND column_name = 'city') THEN
    ALTER TABLE properties ADD COLUMN city TEXT;
  END IF;
END $$;
`;

console.log('⚠️  Migration created but not applied');
console.log('⚠️  To apply this migration, you need to:');
console.log('1. Go to Supabase Dashboard');
console.log('2. Navigate to SQL Editor');
console.log('3. Copy and paste the migration SQL');
console.log('4. Execute the migration');
console.log('');
console.log('Migration SQL:');
console.log('='.repeat(50));
console.log(migrationSQL);
console.log('='.repeat(50));
