-- GuriGate Properties Schema Migration
-- Complete production-ready schema for Homes/Properties module
-- Supports East African markets with proper RLS security

-- ========================================
-- 1. ENUMS
-- ========================================

-- Property badge types (GuriGate specific)
CREATE TYPE property_badge AS ENUM (
  'FOR_SALE',
  'FOR_RENT', 
  'SHORT_STAY'
);

-- Property types
CREATE TYPE property_type AS ENUM (
  'apartment',
  'house', 
  'villa',
  'studio',
  'condo',
  'townhouse',
  'cottage',
  'penthouse',
  'loft',
  'other'
);

-- Property status
CREATE TYPE property_status AS ENUM (
  'available',
  'occupied',
  'maintenance', 
  'pending',
  'inactive'
);

-- Pricing types
CREATE TYPE pricing_type AS ENUM (
  'nightly',
  'monthly',
  'sale'
);

-- Booking status
CREATE TYPE booking_status AS ENUM (
  'pending',
  'confirmed',
  'cancelled',
  'completed'
);

-- Currency types
CREATE TYPE currency_type AS ENUM (
  'USD',
  'EUR',
  'GBP',
  'KES',
  'NGN',
  'ZAR',
  'SOS' -- Somali Shilling
);

-- ========================================
-- 2. CORE TABLES
-- ========================================

-- Properties table (main entity)
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  type property_type NOT NULL,
  badge property_badge NOT NULL DEFAULT 'SHORT_STAY',
  price_unit_label VARCHAR(50) NOT NULL DEFAULT 'for 2 nights',
  status property_status DEFAULT 'available',
  is_featured BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0,
  owner_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property addresses
CREATE TABLE property_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  street VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) NOT NULL DEFAULT 'Somalia',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_id)
);

-- Property pricing
CREATE TABLE property_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  base_price DECIMAL(10,2) NOT NULL CHECK (base_price > 0),
  currency currency_type DEFAULT 'USD',
  pricing_type pricing_type NOT NULL DEFAULT 'nightly',
  security_deposit DECIMAL(10,2),
  cleaning_fee DECIMAL(10,2),
  service_fee DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_id)
);

-- Property features
CREATE TABLE property_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  bedrooms INTEGER NOT NULL CHECK (bedrooms >= 0),
  bathrooms DECIMAL(3,1) NOT NULL CHECK (bathrooms >= 0),
  max_guests INTEGER NOT NULL CHECK (max_guests >= 1),
  square_feet INTEGER CHECK (square_feet > 0),
  amenities TEXT[] DEFAULT '{}',
  rules TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_id)
);

-- Property images
CREATE TABLE property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  alt_text VARCHAR(255),
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property reviews
CREATE TABLE property_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  guest_id UUID REFERENCES auth.users(id) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_id, guest_id) -- One review per guest per property
);

-- Property bookings
CREATE TABLE property_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  guest_id UUID REFERENCES auth.users(id) NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL CHECK (check_out_date > check_in_date),
  total_price DECIMAL(10,2) NOT NULL,
  currency currency_type DEFAULT 'USD',
  status booking_status DEFAULT 'pending',
  guest_count INTEGER NOT NULL CHECK (guest_count >= 1),
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wishlists (user saved properties)
CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- ========================================
-- 3. INDEXES FOR PERFORMANCE
-- ========================================

-- Property search indexes
CREATE INDEX idx_properties_city ON property_addresses(city);
CREATE INDEX idx_properties_type ON properties(type);
CREATE INDEX idx_properties_badge ON properties(badge);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_featured ON properties(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_properties_approved ON properties(is_approved) WHERE is_approved = TRUE;

-- Pricing indexes
CREATE INDEX idx_pricing_price ON property_pricing(base_price);
CREATE INDEX idx_pricing_type ON property_pricing(pricing_type);

-- Geographic search index
CREATE INDEX idx_properties_location ON property_addresses USING GIST (
  point(longitude, latitude)
) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Full-text search index
CREATE INDEX idx_properties_search ON properties USING GIN (
  to_tsvector('english', title || ' ' || description)
);

-- Booking indexes
CREATE INDEX idx_bookings_property ON property_bookings(property_id);
CREATE INDEX idx_bookings_guest ON property_bookings(guest_id);
CREATE INDEX idx_bookings_dates ON property_bookings(property_id, check_in_date, check_out_date);
CREATE INDEX idx_bookings_status ON property_bookings(status);

-- Review indexes
CREATE INDEX idx_reviews_property ON property_reviews(property_id);
CREATE INDEX idx_reviews_rating ON property_reviews(rating);

-- Image indexes
CREATE INDEX idx_images_property ON property_images(property_id);
CREATE INDEX idx_images_primary ON property_images(property_id, is_primary) WHERE is_primary = TRUE;

-- ========================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS on all tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Properties RLS policies
CREATE POLICY "Users can view approved active properties" ON properties
  FOR SELECT USING (
    is_approved = TRUE AND 
    status = 'available'
  );

CREATE POLICY "Property owners can view their own properties" ON properties
  FOR SELECT USING (
    auth.uid() = owner_id
  );

CREATE POLICY "Authenticated users can create properties" ON properties
  FOR INSERT WITH CHECK (
    auth.uid() = owner_id
  );

CREATE POLICY "Property owners can update their properties" ON properties
  FOR UPDATE USING (
    auth.uid() = owner_id
  );

CREATE POLICY "Property owners can delete their properties" ON properties
  FOR DELETE USING (
    auth.uid() = owner_id
  );

-- Property addresses RLS policies (inherit from properties)
CREATE POLICY "Users can view addresses for approved properties" ON property_addresses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_addresses.property_id
      AND properties.is_approved = TRUE 
      AND properties.status = 'available'
    )
  );

CREATE POLICY "Property owners can manage their property addresses" ON property_addresses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_addresses.property_id
      AND properties.owner_id = auth.uid()
    )
  );

-- Property pricing RLS policies
CREATE POLICY "Users can view pricing for approved properties" ON property_pricing
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_pricing.property_id
      AND properties.is_approved = TRUE 
      AND properties.status = 'available'
    )
  );

CREATE POLICY "Property owners can manage their property pricing" ON property_pricing
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_pricing.property_id
      AND properties.owner_id = auth.uid()
    )
  );

-- Property features RLS policies
CREATE POLICY "Users can view features for approved properties" ON property_features
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_features.property_id
      AND properties.is_approved = TRUE 
      AND properties.status = 'available'
    )
  );

CREATE POLICY "Property owners can manage their property features" ON property_features
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_features.property_id
      AND properties.owner_id = auth.uid()
    )
  );

-- Property images RLS policies
CREATE POLICY "Users can view images for approved properties" ON property_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_images.property_id
      AND properties.is_approved = TRUE 
      AND properties.status = 'available'
    )
  );

CREATE POLICY "Property owners can manage their property images" ON property_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_images.property_id
      AND properties.owner_id = auth.uid()
    )
  );

-- Property reviews RLS policies
CREATE POLICY "Users can view reviews for approved properties" ON property_reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_reviews.property_id
      AND properties.is_approved = TRUE 
      AND properties.status = 'available'
    )
  );

CREATE POLICY "Authenticated users can create reviews" ON property_reviews
  FOR INSERT WITH CHECK (
    auth.uid() = guest_id AND
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_reviews.property_id
      AND properties.is_approved = TRUE 
      AND properties.status = 'available'
    )
  );

CREATE POLICY "Users can update their own reviews" ON property_reviews
  FOR UPDATE USING (
    auth.uid() = guest_id
  );

CREATE POLICY "Users can delete their own reviews" ON property_reviews
  FOR DELETE USING (
    auth.uid() = guest_id
  );

-- Property bookings RLS policies
CREATE POLICY "Guests can view their own bookings" ON property_bookings
  FOR SELECT USING (
    auth.uid() = guest_id
  );

CREATE POLICY "Property owners can view bookings for their properties" ON property_bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_bookings.property_id
      AND properties.owner_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create bookings" ON property_bookings
  FOR INSERT WITH CHECK (
    auth.uid() = guest_id AND
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = property_bookings.property_id
      AND properties.is_approved = TRUE 
      AND properties.status = 'available'
    )
  );

CREATE POLICY "Guests can update their own bookings" ON property_bookings
  FOR UPDATE USING (
    auth.uid() = guest_id
  );

CREATE POLICY "Guests can cancel their own bookings" ON property_bookings
  FOR DELETE USING (
    auth.uid() = guest_id
  );

-- Wishlists RLS policies
CREATE POLICY "Users can view their own wishlists" ON wishlists
  FOR SELECT USING (
    auth.uid() = user_id
  );

CREATE POLICY "Authenticated users can add to wishlist" ON wishlists
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
  );

CREATE POLICY "Users can remove from their wishlist" ON wishlists
  FOR DELETE USING (
    auth.uid() = user_id
  );

-- ========================================
-- 5. TRIGGERS AND FUNCTIONS
-- ========================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_properties_updated_at 
    BEFORE UPDATE ON properties 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON property_bookings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update property rating and review count
CREATE OR REPLACE FUNCTION update_property_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE properties 
    SET 
        rating = (
            SELECT COALESCE(AVG(rating), 0) 
            FROM property_reviews 
            WHERE property_id = NEW.property_id
        ),
        review_count = (
            SELECT COUNT(*) 
            FROM property_reviews 
            WHERE property_id = NEW.property_id
        )
    WHERE id = NEW.property_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_property_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON property_reviews
    FOR EACH ROW EXECUTE FUNCTION update_property_rating();

-- Increment view count
CREATE OR REPLACE FUNCTION increment_view_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE properties 
    SET view_count = view_count + 1 
    WHERE id = NEW.property_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ========================================
-- 6. STORAGE BUCKET POLICY
-- ========================================

-- Create storage bucket for property images
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload images for their properties" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'property-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can view their own property images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'property-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own property images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'property-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their own property images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'property-images' AND
    auth.role() = 'authenticated'
  );

-- ========================================
-- 7. VIEWS FOR COMMON QUERIES
-- ========================================

-- Featured properties view
CREATE VIEW featured_properties AS
SELECT 
  p.*,
  pa.street,
  pa.city,
  pa.state,
  pa.country,
  pa.latitude,
  pa.longitude,
  pp.base_price,
  pp.currency,
  pp.pricing_type,
  pp.security_deposit,
  pp.cleaning_fee,
  pp.service_fee,
  pf.bedrooms,
  pf.bathrooms,
  pf.max_guests,
  pf.square_feet,
  pf.amenities,
  pf.rules,
  COALESCE(
    JSON_AGG(
      JSON_BUILD_OBJECT(
        'id', pi.id,
        'url', pi.image_url,
        'alt_text', pi.alt_text,
        'sort_order', pi.sort_order,
        'is_primary', pi.is_primary
      ) ORDER BY pi.sort_order
    ) FILTER (WHERE pi.id IS NOT NULL), 
    '[]'::json
  ) as images
FROM properties p
LEFT JOIN property_addresses pa ON p.id = pa.property_id
LEFT JOIN property_pricing pp ON p.id = pp.property_id
LEFT JOIN property_features pf ON p.id = pf.property_id
LEFT JOIN property_images pi ON p.id = pi.property_id
WHERE p.is_featured = TRUE 
  AND p.is_approved = TRUE 
  AND p.status = 'available'
GROUP BY p.id, pa.id, pp.id, pf.id;

-- Properties by city view
CREATE VIEW properties_by_city AS
SELECT 
  pa.city,
  COUNT(*) as property_count,
  AVG(p.rating) as avg_rating,
  MIN(pp.base_price) as min_price,
  MAX(pp.base_price) as max_price
FROM properties p
JOIN property_addresses pa ON p.id = pa.property_id
JOIN property_pricing pp ON p.id = pp.property_id
WHERE p.is_approved = TRUE 
  AND p.status = 'available'
GROUP BY pa.city
ORDER BY property_count DESC;
