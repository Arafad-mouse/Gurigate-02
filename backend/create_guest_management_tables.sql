-- Guest Management Module Database Setup
-- Run this in Supabase SQL Editor to create the required tables

-- ============================================
-- PROPERTIES TABLE (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  city TEXT,
  country TEXT,
  address TEXT,
  price_per_night DECIMAL(10, 2) NOT NULL,
  bedrooms INTEGER,
  bathrooms INTEGER,
  max_guests INTEGER,
  amenities TEXT[],
  images TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if table already exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'status') THEN
    ALTER TABLE properties ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'updated_at') THEN
    ALTER TABLE properties ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Create indexes for properties
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);

-- ============================================
-- GUEST PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS guest_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  phone TEXT,
  country TEXT,
  city TEXT,
  address TEXT,
  preferred_language TEXT DEFAULT 'en',
  total_bookings INTEGER DEFAULT 0,
  total_spending DECIMAL(10, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2),
  id_verified BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  risk_score INTEGER DEFAULT 0,
  risk_flags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_guest_profiles_user_id ON guest_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_guest_profiles_country ON guest_profiles(country);
CREATE INDEX IF NOT EXISTS idx_guest_profiles_total_bookings ON guest_profiles(total_bookings);
CREATE INDEX IF NOT EXISTS idx_guest_profiles_risk_score ON guest_profiles(risk_score);

-- ============================================
-- PROPERTY BOOKINGS TABLE (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS property_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests_count INTEGER DEFAULT 1,
  total_price DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'failed', 'refunded')),
  special_requests TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if table already exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_bookings' AND column_name = 'status') THEN
    ALTER TABLE property_bookings ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_bookings' AND column_name = 'payment_status') THEN
    ALTER TABLE property_bookings ADD COLUMN payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'failed', 'refunded'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_bookings' AND column_name = 'updated_at') THEN
    ALTER TABLE property_bookings ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Create indexes for property_bookings
CREATE INDEX IF NOT EXISTS idx_property_bookings_property_id ON property_bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_property_bookings_guest_id ON property_bookings(guest_id);
CREATE INDEX IF NOT EXISTS idx_property_bookings_check_in ON property_bookings(check_in);
CREATE INDEX IF NOT EXISTS idx_property_bookings_check_out ON property_bookings(check_out);
CREATE INDEX IF NOT EXISTS idx_property_bookings_status ON property_bookings(status);
CREATE INDEX IF NOT EXISTS idx_property_bookings_payment_status ON property_bookings(payment_status);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE guest_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Guest Profiles RLS Policies
DROP POLICY IF EXISTS "Users can view their own guest profile" ON guest_profiles;
CREATE POLICY "Users can view their own guest profile"
  ON guest_profiles FOR SELECT
  USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can insert their own guest profile" ON guest_profiles;
CREATE POLICY "Users can insert their own guest profile"
  ON guest_profiles FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can update their own guest profile" ON guest_profiles;
CREATE POLICY "Users can update their own guest profile"
  ON guest_profiles FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- Property Bookings RLS Policies
DROP POLICY IF EXISTS "Users can view their own bookings" ON property_bookings;
CREATE POLICY "Users can view their own bookings"
  ON property_bookings FOR SELECT
  USING (auth.uid()::text = guest_id::text);

DROP POLICY IF EXISTS "Users can create bookings" ON property_bookings;
CREATE POLICY "Users can create bookings"
  ON property_bookings FOR INSERT
  WITH CHECK (auth.uid()::text = guest_id::text);

-- Properties RLS Policies - only create if status column exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'status') THEN
    DROP POLICY IF EXISTS "Everyone can view active properties" ON properties;
    CREATE POLICY "Everyone can view active properties"
      ON properties FOR SELECT
      USING (status = 'active');
  END IF;
END $$;

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for each table
CREATE TRIGGER update_guest_profiles_updated_at
  BEFORE UPDATE ON guest_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_bookings_updated_at
  BEFORE UPDATE ON property_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Uncomment the following to insert sample data for testing

-- INSERT INTO properties (host_id, title, description, city, country, address, price_per_night, bedrooms, bathrooms, max_guests, status)
-- VALUES
--   ('test-host-id-1', 'Luxury Downtown Apartment', 'Modern apartment in city center', 'Hargeisa', 'Somalia', '123 Main St', 150.00, 2, 2, 4, 'active'),
--   ('test-host-id-1', 'Cozy Beach House', 'Beautiful house near the beach', 'Berbera', 'Somalia', '456 Ocean Ave', 200.00, 3, 2, 6, 'active');

-- INSERT INTO guest_profiles (user_id, phone, country, city, preferred_language, total_bookings, total_spending, id_verified, email_verified)
-- VALUES
--   ('test-guest-id-1', '+252612345678', 'Somalia', 'Hargeisa', 'en', 3, 450.00, true, true),
--   ('test-guest-id-2', '+252623456789', 'Kenya', 'Nairobi', 'en', 1, 150.00, true, true);

-- INSERT INTO property_bookings (property_id, guest_id, host_id, check_in, check_out, guests_count, total_price, status, payment_status)
-- VALUES
--   ((SELECT id FROM properties LIMIT 1), 'test-guest-id-1', 'test-host-id-1', CURRENT_DATE, CURRENT_DATE + INTERVAL '3 days', 2, 450.00, 'confirmed', 'paid'),
--   ((SELECT id FROM properties LIMIT 1), 'test-guest-id-2', 'test-host-id-1', CURRENT_DATE + INTERVAL '7 days', CURRENT_DATE + INTERVAL '10 days', 1, 150.00, 'confirmed', 'pending');
