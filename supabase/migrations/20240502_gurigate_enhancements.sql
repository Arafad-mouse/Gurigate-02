-- GuriGate Enhancements Migration
-- Adds missing features to existing properties schema
-- Migration 14: GuriGate landing page features

-- ========================================
-- 1. ADD GURIGATE LANDING FIELDS TO PROPERTIES
-- ========================================

-- Add GuriGate-specific fields to existing properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS price_unit_label VARCHAR(50) DEFAULT 'for 2 nights',
ADD COLUMN IF NOT EXISTS rating_avg DECIMAL(3,2) DEFAULT 0 CHECK (rating_avg >= 0 AND rating_avg <= 5),
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Create trigger function to update rating_avg and review_count
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

-- Trigger for automatic rating updates
CREATE TRIGGER property_reviews_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON property_reviews
    FOR EACH ROW EXECUTE FUNCTION update_property_rating_trigger();

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

-- Featured properties index
CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(is_featured) WHERE is_featured = TRUE;

-- Property type index
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type);

-- Bedrooms index for filtering
CREATE INDEX IF NOT EXISTS idx_properties_bedrooms ON properties(bedrooms);

-- Price index for filtering
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);

-- Full-text search index on title, description, city, district
CREATE INDEX IF NOT EXISTS idx_properties_search ON properties USING GIN (
    to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || city || ' ' || COALESCE(district, ''))
);

-- Rating index for sorting
CREATE INDEX IF NOT EXISTS idx_properties_rating ON properties(rating_avg DESC) WHERE rating_avg > 0;

-- Review count index
CREATE INDEX IF NOT EXISTS idx_properties_review_count ON properties(review_count DESC);

-- Combined index for active approved properties
CREATE INDEX IF NOT EXISTS idx_properties_active_approved ON properties(status, is_approved) 
WHERE status = 'active' AND is_approved = TRUE;

-- ========================================
-- 5. CREATE STORAGE BUCKET
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
-- 6. CREATE VIEWS FOR COMMON QUERIES
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

-- ========================================
-- 7. UPDATE UPDATED_AT TRIGGER
-- ========================================

-- Create or replace updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for new tables
CREATE TRIGGER update_property_reviews_updated_at 
    BEFORE UPDATE ON property_reviews 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    ON CONFLICT DO NOTHING;

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
