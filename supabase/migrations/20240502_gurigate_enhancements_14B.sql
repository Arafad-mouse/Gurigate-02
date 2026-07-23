-- GuriGate Enhancements Migration 14B
-- Homes/Properties backend additions
-- This migration adds the complete backend features after 14A prepared the schema

-- ========================================
-- 1. ADD GURIGATE LANDING FIELDS TO PROPERTIES
-- ========================================

-- Add GuriGate-specific fields to existing properties table
-- (These should already exist from 14A, but ensuring they're properly set)
ALTER TABLE properties 
ALTER COLUMN is_featured SET DEFAULT FALSE,
ALTER COLUMN is_approved SET DEFAULT FALSE,
ALTER COLUMN view_count SET DEFAULT 0,
ALTER COLUMN price_unit_label SET DEFAULT 'for 2 nights',
ALTER COLUMN rating_avg SET DEFAULT 0,
ALTER COLUMN review_count SET DEFAULT 0;

-- Add constraints if not already present
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'properties_rating_avg_check') THEN
        ALTER TABLE properties ADD CONSTRAINT properties_rating_avg_check 
        CHECK (rating_avg >= 0 AND rating_avg <= 5);
    END IF;
END $$;

-- ========================================
-- 2. CREATE PROPERTY_REVIEWS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS property_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    guest_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(property_id, guest_id) -- One review per guest per property
);

-- Enable RLS on property_reviews
ALTER TABLE property_reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies for property_reviews
CREATE POLICY "Users can view reviews for approved properties" ON property_reviews
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM properties 
            WHERE properties.id = property_reviews.property_id
            AND properties.status = 'active'
            AND properties.is_approved = TRUE
        )
    );

CREATE POLICY "Authenticated users can create reviews" ON property_reviews
    FOR INSERT WITH CHECK (
        auth.uid() = guest_id AND
        EXISTS (
            SELECT 1 FROM properties 
            WHERE properties.id = property_reviews.property_id
            AND properties.status = 'active'
            AND properties.is_approved = TRUE
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

-- ========================================
-- 3. CREATE WISHLISTS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);

-- Enable RLS on wishlists
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- RLS policies for wishlists
CREATE POLICY "Users can view their own wishlists" ON wishlists
    FOR SELECT USING (
        auth.uid() = user_id
    );

CREATE POLICY "Authenticated users can add to wishlist" ON wishlists
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM properties 
            WHERE properties.id = wishlists.property_id
            AND properties.status = 'active'
            AND properties.is_approved = TRUE
        )
    );

CREATE POLICY "Users can remove from their wishlist" ON wishlists
    FOR DELETE USING (
        auth.uid() = user_id
    );

-- ========================================
-- 4. ADD PERFORMANCE INDEXES
-- ========================================

-- Property indexes (additional to 14A)
CREATE INDEX IF NOT EXISTS idx_properties_bedrooms ON properties(bedrooms);
CREATE INDEX IF NOT EXISTS idx_properties_max_guests ON properties(max_guests);

-- Full-text search index on title, description, city
CREATE INDEX IF NOT EXISTS idx_properties_search ON properties USING GIN (
    to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || 
    COALESCE((SELECT name FROM locations WHERE locations.id = properties.location_id), ''))
);

-- Rating index for sorting
CREATE INDEX IF NOT EXISTS idx_properties_rating ON properties(rating_avg DESC) WHERE rating_avg > 0;

-- Review count index
CREATE INDEX IF NOT EXISTS idx_properties_review_count ON properties(review_count DESC);

-- Combined index for active approved properties
CREATE INDEX IF NOT EXISTS idx_properties_active_approved ON properties(status, is_approved) 
WHERE status = 'active' AND is_approved = TRUE;

-- Property reviews indexes
CREATE INDEX IF NOT EXISTS idx_property_reviews_property ON property_reviews(property_id);
CREATE INDEX IF NOT EXISTS idx_property_reviews_guest ON property_reviews(guest_id);
CREATE INDEX IF NOT EXISTS idx_property_reviews_rating ON property_reviews(rating);

-- Wishlists indexes
CREATE INDEX IF NOT EXISTS idx_wishlists_user ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_property ON wishlists(property_id);

-- Property images indexes (additional)
CREATE INDEX IF NOT EXISTS idx_property_images_primary ON property_images(property_id, is_primary) WHERE is_primary = TRUE;

-- ========================================
-- 5. CREATE STORAGE BUCKET AND POLICIES
-- ========================================

-- Create storage bucket for property images
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for property-images bucket
CREATE POLICY "Users can upload images for their properties" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'property-images' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can view property images" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'property-images'
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
-- 6. CREATE TRIGGERS
-- ========================================

-- Update property rating trigger function (improved from 14A)
CREATE OR REPLACE FUNCTION update_property_rating_trigger()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE properties 
    SET 
        rating_avg = (
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

-- Trigger for automatic rating updates
CREATE TRIGGER property_reviews_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON property_reviews
    FOR EACH ROW EXECUTE FUNCTION update_property_rating_trigger();

-- Add triggers for updated_at columns
CREATE TRIGGER update_property_reviews_updated_at 
    BEFORE UPDATE ON property_reviews 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 7. CREATE VIEWS FOR COMMON QUERIES
-- ========================================

-- Featured properties view (joins all needed data)
CREATE OR REPLACE VIEW featured_properties_view AS
SELECT 
    p.*,
    l.name as location_name,
    l.district,
    pi.url as primary_image_url,
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'id', property_images.id,
                'url', property_images.url,
                'is_primary', property_images.is_primary,
                'sort_order', property_images.sort_order
            ) ORDER BY property_images.sort_order
        ) FILTER (WHERE property_images.id IS NOT NULL), 
        '[]'::json
    ) as images
FROM properties p
LEFT JOIN locations l ON p.location_id = l.id
LEFT JOIN property_images pi ON p.id = pi.property_id AND pi.is_primary = TRUE
LEFT JOIN property_images ON p.id = property_images.property_id
WHERE p.is_featured = TRUE 
  AND p.status = 'active'
  AND p.is_approved = TRUE
GROUP BY p.id, l.name, l.district, pi.url;

-- Properties by city view
CREATE OR REPLACE VIEW properties_by_city_view AS
SELECT 
    l.name as city,
    COUNT(*) as property_count,
    AVG(p.rating_avg) as avg_rating,
    MIN(p.price) as min_price,
    MAX(p.price) as max_price
FROM properties p
JOIN locations l ON p.location_id = l.id
WHERE p.status = 'active' 
  AND p.is_approved = TRUE
GROUP BY l.name
ORDER BY property_count DESC;

-- Properties with reviews view
CREATE OR REPLACE VIEW properties_with_reviews_view AS
SELECT 
    p.*,
    l.name as location_name,
    l.district,
    COUNT(pr.id) as total_reviews,
    COALESCE(AVG(pr.rating), 0) as average_rating,
    JSON_AGG(
        JSON_BUILD_OBJECT(
            'id', pr.id,
            'rating', pr.rating,
            'comment', pr.comment,
            'created_at', pr.created_at
        ) ORDER BY pr.created_at DESC
    ) FILTER (WHERE pr.id IS NOT NULL) as reviews
FROM properties p
LEFT JOIN locations l ON p.location_id = l.id
LEFT JOIN property_reviews pr ON p.id = pr.property_id
WHERE p.status = 'active' 
  AND p.is_approved = TRUE
GROUP BY p.id, l.name, l.district;

-- ========================================
-- 8. MIGRATE EXISTING DATA
-- ========================================

-- Set default values for existing properties
UPDATE properties 
SET 
    is_approved = TRUE,
    price_unit_label = CASE 
        WHEN price_unit = 'total' THEN ''
        WHEN price_unit = 'per_night' THEN 'for 2 nights'
        WHEN price_unit = 'per_month' THEN '/month'
        ELSE 'for 2 nights'
    END
WHERE is_approved IS NULL OR price_unit_label IS NULL;

-- Set featured status for high-rated properties
UPDATE properties 
SET is_featured = TRUE 
WHERE rating_avg >= 4.8 AND review_count >= 10 AND is_featured = FALSE;

-- ========================================
-- 9. SEED DATA FOR NEW TABLES
-- ========================================

-- Insert sample reviews for existing properties
INSERT INTO property_reviews (property_id, guest_id, rating, comment)
SELECT 
    p.id,
    '550e8400-e29b-41d4-a716-446655440101'::uuid, -- demo guest
    CASE WHEN p.rating_avg >= 4.5 THEN 5 
         WHEN p.rating_avg >= 4.0 THEN 4 
         WHEN p.rating_avg >= 3.5 THEN 3 
         ELSE 4 END,
    CASE 
        WHEN p.rating_avg >= 4.5 THEN 'Excellent property! Highly recommended.'
        WHEN p.rating_avg >= 4.0 THEN 'Great place, very satisfied with the stay.'
        WHEN p.rating_avg >= 3.5 THEN 'Good property, met expectations.'
        ELSE 'Nice property, had a pleasant stay.'
    END
FROM properties p 
WHERE p.is_approved = TRUE 
  AND p.status = 'active'
  AND NOT EXISTS (
      SELECT 1 FROM property_reviews pr 
      WHERE pr.property_id = p.id 
      AND pr.guest_id = '550e8400-e29b-41d4-a716-446655440101'::uuid
  )
LIMIT 10
ON CONFLICT (property_id, guest_id) DO NOTHING;

-- Insert sample wishlist entries
INSERT INTO wishlists (user_id, property_id)
SELECT 
    '550e8400-e29b-41d4-a716-446655440101'::uuid, -- demo user
    p.id
FROM properties p 
WHERE p.is_approved = TRUE 
  AND p.status = 'active'
  AND p.is_featured = TRUE
  AND NOT EXISTS (
      SELECT 1 FROM wishlists w 
      WHERE w.property_id = p.id 
      AND w.user_id = '550e8400-e29b-41d4-a716-446655440101'::uuid
  )
LIMIT 5
ON CONFLICT (user_id, property_id) DO NOTHING;

-- ========================================
-- 10. CREATE HELPER FUNCTIONS FOR FRONTEND
-- ========================================

-- Function to map purpose to badge for frontend
CREATE OR REPLACE FUNCTION get_property_badge(purpose property_purpose)
RETURNS TEXT AS $$
BEGIN
    CASE purpose
        WHEN 'sale' THEN RETURN 'FOR SALE';
        WHEN 'long_rent' THEN RETURN 'FOR RENT';
        WHEN 'short_stay' THEN RETURN 'SHORT STAY';
        ELSE RETURN 'SHORT STAY';
    END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get property with all related data
CREATE OR REPLACE FUNCTION get_property_details(property_uuid UUID)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    description TEXT,
    type property_type,
    purpose property_purpose,
    status property_status,
    price DECIMAL,
    price_unit price_unit,
    price_unit_label VARCHAR,
    bedrooms INTEGER,
    bathrooms DECIMAL,
    max_guests INTEGER,
    amenities TEXT[],
    lat DECIMAL,
    lng DECIMAL,
    location_name VARCHAR,
    location_district VARCHAR,
    is_featured BOOLEAN,
    is_approved BOOLEAN,
    rating_avg DECIMAL,
    review_count INTEGER,
    primary_image_url TEXT,
    images JSON,
    reviews JSON
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.description,
        p.type,
        p.purpose,
        p.status,
        p.price,
        p.price_unit,
        p.price_unit_label,
        p.bedrooms,
        p.bathrooms,
        p.max_guests,
        p.amenities,
        p.lat,
        p.lng,
        l.name,
        l.district,
        p.is_featured,
        p.is_approved,
        p.rating_avg,
        p.review_count,
        pi.url,
        COALESCE(
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'id', imgs.id,
                    'url', imgs.url,
                    'is_primary', imgs.is_primary,
                    'sort_order', imgs.sort_order
                ) ORDER BY imgs.sort_order
            ) FILTER (WHERE imgs.id IS NOT NULL), 
            '[]'::json
        ),
        COALESCE(
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'id', pr.id,
                    'rating', pr.rating,
                    'comment', pr.comment,
                    'created_at', pr.created_at
                ) ORDER BY pr.created_at DESC
            ) FILTER (WHERE pr.id IS NOT NULL), 
            '[]'::json
        )
    FROM properties p
    LEFT JOIN locations l ON p.location_id = l.id
    LEFT JOIN property_images pi ON p.id = pi.property_id AND pi.is_primary = TRUE
    LEFT JOIN property_images imgs ON p.id = imgs.property_id
    LEFT JOIN property_reviews pr ON p.id = pr.property_id
    WHERE p.id = property_uuid
      AND p.status = 'active'
      AND p.is_approved = TRUE
    GROUP BY p.id, l.name, l.district, pi.url;
END;
$$ LANGUAGE plpgsql;

COMMIT;
