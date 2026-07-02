-- ============================================================
-- GuriGate: Become a Host V2 Migration
-- Date: 2026-06-11
-- 
-- Extends the property schema to support:
--   1. Property category (Residential / Commercial / Land / Hospitality)
--   2. Extended property sub-types per category
--   3. Listing type (short_stay / long_rent / sale)
--   4. Admin approval workflow (approval_status)
--   5. Denormalised beds / bedroom_lock / max_guests on properties
--   6. Separate bathroom breakdown (property_bathrooms)
--   7. Host presence tracking (property_host_presence)
--   8. Master amenities catalogue + junction table (property_amenities)
--   9. Draft persistence (property_drafts)
--  10. Scoped Supabase Storage RLS for property-images bucket
--  11. upgrade_to_host() RPC for role promotion
-- ============================================================

-- ============================================================
-- 1. EXTEND property_type ENUM WITH NEW VALUES
-- ============================================================

DO $$ BEGIN ALTER TYPE property_type ADD VALUE 'duplex';            EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE property_type ADD VALUE 'private_room';      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE property_type ADD VALUE 'shared_room';       EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE property_type ADD VALUE 'guesthouse';        EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE property_type ADD VALUE 'office';            EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE property_type ADD VALUE 'shop';              EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE property_type ADD VALUE 'warehouse';         EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE property_type ADD VALUE 'restaurant';        EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE property_type ADD VALUE 'hotel';             EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE property_type ADD VALUE 'resort';            EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE property_type ADD VALUE 'hostel';            EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE property_type ADD VALUE 'lodge';             EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE property_type ADD VALUE 'residential_land';  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE property_type ADD VALUE 'commercial_land';   EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE property_type ADD VALUE 'farm_land';         EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 2. ALTER PROPERTIES TABLE
-- ============================================================

-- Property category: residential | commercial | land | hospitality
ALTER TABLE properties ADD COLUMN IF NOT EXISTS property_category TEXT NOT NULL DEFAULT 'residential';

-- Listing type: short_stay | long_rent | sale  (replaces badge semantically)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS listing_type TEXT NOT NULL DEFAULT 'short_stay';

-- Approval workflow: draft | pending | approved | rejected | suspended
ALTER TABLE properties ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'draft';

-- Admin approval tracking
ALTER TABLE properties ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Deprecate is_approved in favor of approval_status (kept for backward compatibility)
COMMENT ON COLUMN properties.is_approved IS 'DEPRECATED: Use approval_status instead. Kept for backward compatibility.';

-- SEO-friendly slug and analytics
ALTER TABLE properties ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Soft delete support
ALTER TABLE properties ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Denormalised capacity fields (also stored in property_features for joins)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS max_guests  INTEGER DEFAULT 1 CHECK (max_guests >= 1);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS bedrooms    INTEGER DEFAULT 0 CHECK (bedrooms >= 0);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS beds        INTEGER DEFAULT 1 CHECK (beds >= 1);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS bedroom_lock TEXT;

-- Note: Studio apartment constraint can be added later after data validation
-- ALTER TABLE properties ADD CONSTRAINT studio_bedrooms_zero
--   CHECK (type <> 'studio' OR bedrooms = 0);

CREATE INDEX IF NOT EXISTS idx_properties_category        ON properties(property_category);
CREATE INDEX IF NOT EXISTS idx_properties_listing_type    ON properties(listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_approval_status ON properties(approval_status);
CREATE INDEX IF NOT EXISTS idx_properties_owner_id       ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_slug            ON properties(slug);
CREATE INDEX IF NOT EXISTS idx_properties_type            ON properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_deleted_at      ON properties(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_properties_title           ON properties(title);

-- ============================================================
-- 3. ALTER PROPERTY_ADDRESSES TABLE
-- ============================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'property_addresses') THEN
    ALTER TABLE property_addresses ADD COLUMN IF NOT EXISTS apartment TEXT;
    ALTER TABLE property_addresses ADD COLUMN IF NOT EXISTS show_precise_location BOOLEAN NOT NULL DEFAULT TRUE;
  END IF;
END $$;

-- ============================================================
-- 4. ALTER PROPERTY_FEATURES TABLE
-- ============================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'property_features') THEN
    ALTER TABLE property_features ADD COLUMN IF NOT EXISTS beds INTEGER DEFAULT 1 CHECK (beds >= 0);
    ALTER TABLE property_features ADD COLUMN IF NOT EXISTS bedroom_lock TEXT;
  END IF;
END $$;

-- ============================================================
-- 5. CREATE property_bathrooms TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS property_bathrooms (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id      UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  private_attached INTEGER NOT NULL DEFAULT 0 CHECK (private_attached >= 0),
  dedicated        INTEGER NOT NULL DEFAULT 0 CHECK (dedicated >= 0),
  shared           INTEGER NOT NULL DEFAULT 0 CHECK (shared >= 0),
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_id)
);

CREATE INDEX IF NOT EXISTS idx_property_bathrooms_property ON property_bathrooms(property_id);

ALTER TABLE property_bathrooms ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public can view bathrooms for approved properties" ON property_bathrooms
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM properties
        WHERE properties.id = property_bathrooms.property_id
          AND properties.approval_status = 'approved'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Owners can manage their property bathrooms" ON property_bathrooms
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM properties
        WHERE properties.id = property_bathrooms.property_id
          AND properties.owner_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Owners can insert property bathrooms" ON property_bathrooms
    FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM properties
        WHERE properties.id = property_bathrooms.property_id
          AND properties.owner_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 6. CREATE property_host_presence TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS property_host_presence (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id    UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  presence_types TEXT[] NOT NULL DEFAULT '{}',
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_id)
);

CREATE INDEX IF NOT EXISTS idx_property_host_presence_property ON property_host_presence(property_id);

ALTER TABLE property_host_presence ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public can view host presence for approved properties" ON property_host_presence
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM properties
        WHERE properties.id = property_host_presence.property_id
          AND properties.approval_status = 'approved'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Owners can manage their property host presence" ON property_host_presence
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM properties
        WHERE properties.id = property_host_presence.property_id
          AND properties.owner_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Owners can insert property host presence" ON property_host_presence
    FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM properties
        WHERE properties.id = property_host_presence.property_id
          AND properties.owner_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 7. CREATE amenities MASTER TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS amenities (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL UNIQUE,
  category   TEXT NOT NULL DEFAULT 'general',
  icon       TEXT,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_amenities_category  ON amenities(category);
CREATE INDEX IF NOT EXISTS idx_amenities_active     ON amenities(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_amenities_sort       ON amenities(sort_order);

ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can view active amenities" ON amenities
    FOR SELECT USING (is_active = TRUE);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage amenities" ON amenities
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 8. SEED AMENITIES MASTER DATA
-- ============================================================

INSERT INTO amenities (name, category, sort_order) VALUES
  ('Wifi',                   'guest_favorites',  1),
  ('TV',                     'guest_favorites',  2),
  ('Kitchen',                'guest_favorites',  3),
  ('Washer',                 'guest_favorites',  4),
  ('Free parking',           'guest_favorites',  5),
  ('Paid parking',           'guest_favorites',  6),
  ('Air conditioning',       'guest_favorites',  7),
  ('Dedicated workspace',    'guest_favorites',  8),
  ('Pool',                   'standout',         9),
  ('Hot tub',                'standout',        10),
  ('Patio',                  'standout',        11),
  ('BBQ grill',              'standout',        12),
  ('Outdoor dining area',    'standout',        13),
  ('Fire pit',               'standout',        14),
  ('Pool table',             'standout',        15),
  ('Indoor fireplace',       'standout',        16),
  ('Piano',                  'standout',        17),
  ('Exercise equipment',     'standout',        18),
  ('Lake access',            'standout',        19),
  ('Beach access',           'standout',        20),
  ('Ski in/ski out',         'standout',        21),
  ('Outdoor shower',         'standout',        22),
  ('Smoke alarm',            'safety',          23),
  ('First aid kit',          'safety',          24),
  ('Fire extinguisher',      'safety',          25),
  ('Carbon monoxide alarm',  'safety',          26)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- 9. CREATE property_amenities JUNCTION TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS property_amenities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  amenity_id  UUID NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_id, amenity_id)
);

CREATE INDEX IF NOT EXISTS idx_property_amenities_property ON property_amenities(property_id);
CREATE INDEX IF NOT EXISTS idx_property_amenities_amenity  ON property_amenities(amenity_id);

ALTER TABLE property_amenities ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public can view amenities for approved properties" ON property_amenities
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM properties
        WHERE properties.id = property_amenities.property_id
          AND properties.approval_status = 'approved'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Owners can manage their property amenities" ON property_amenities
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM properties
        WHERE properties.id = property_amenities.property_id
          AND properties.owner_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Owners can insert property amenities" ON property_amenities
    FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM properties
        WHERE properties.id = property_amenities.property_id
          AND properties.owner_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 10. CREATE property_drafts TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS property_drafts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  title       TEXT NOT NULL DEFAULT 'Untitled Draft',
  current_step INTEGER NOT NULL DEFAULT 0,
  form_data   JSONB NOT NULL DEFAULT '{}',
  completed   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_drafts_user     ON property_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_property_drafts_property ON property_drafts(property_id) WHERE property_id IS NOT NULL;

ALTER TABLE property_drafts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage their own drafts" ON property_drafts
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 11. STORAGE: property-images BUCKET + SCOPED RLS
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop any overly-broad existing policies before re-creating scoped ones
DROP POLICY IF EXISTS "Users can upload images for their properties"   ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own property images"       ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own property images"     ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own property images"     ON storage.objects;

DO $$ BEGIN
  CREATE POLICY "Public can view property images" ON storage.objects
    FOR SELECT USING (bucket_id = 'property-images');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can upload property images" ON storage.objects
    FOR INSERT WITH CHECK (
      bucket_id = 'property-images'
      AND auth.role() = 'authenticated'
      AND name LIKE (auth.uid()::text || '/%')
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their uploaded property images" ON storage.objects
    FOR UPDATE USING (
      bucket_id = 'property-images'
      AND auth.role() = 'authenticated'
      AND name LIKE (auth.uid()::text || '/%')
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their uploaded property images" ON storage.objects
    FOR DELETE USING (
      bucket_id = 'property-images'
      AND auth.role() = 'authenticated'
      AND name LIKE (auth.uid()::text || '/%')
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 12. upgrade_to_host() RPC FUNCTION
--     Callable by any authenticated user; only upgrades their own profile.
--     Does not demote admins or managers.
-- ============================================================

CREATE OR REPLACE FUNCTION upgrade_to_host()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET
    role       = 'host',
    updated_at = NOW()
  WHERE
    id = auth.uid()
    AND role NOT IN ('admin', 'host');
END;
$$;

GRANT EXECUTE ON FUNCTION upgrade_to_host() TO authenticated;

-- ============================================================
-- 13. updated_at TRIGGERS FOR NEW TABLES
-- ============================================================

DO $$ BEGIN
  CREATE TRIGGER update_property_bathrooms_updated_at
    BEFORE UPDATE ON property_bathrooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_property_host_presence_updated_at
    BEFORE UPDATE ON property_host_presence
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_property_drafts_updated_at
    BEFORE UPDATE ON property_drafts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 14. CATEGORY-SPECIFIC DETAIL TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS property_residential_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL UNIQUE REFERENCES properties(id) ON DELETE CASCADE,
  guests INTEGER DEFAULT 1,
  bedrooms INTEGER DEFAULT 0,
  beds INTEGER DEFAULT 1,
  private_bathrooms INTEGER DEFAULT 0,
  dedicated_bathrooms INTEGER DEFAULT 0,
  shared_bathrooms INTEGER DEFAULT 0,
  occupancy_mode TEXT,
  amenities TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS property_commercial_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL UNIQUE REFERENCES properties(id) ON DELETE CASCADE,
  floor_area NUMERIC,
  floors INTEGER DEFAULT 1,
  parking_spaces INTEGER DEFAULT 0,
  washrooms INTEGER DEFAULT 0,
  storage_rooms INTEGER DEFAULT 0,
  commercial_use_type TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS property_land_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL UNIQUE REFERENCES properties(id) ON DELETE CASCADE,
  size_value NUMERIC,
  size_unit TEXT DEFAULT 'sqm',
  boundary_geojson JSONB,
  land_features TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS property_hospitality_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL UNIQUE REFERENCES properties(id) ON DELETE CASCADE,
  total_rooms INTEGER DEFAULT 0,
  total_floors INTEGER DEFAULT 1,
  max_guests INTEGER DEFAULT 1,
  check_in_time TEXT,
  check_out_time TEXT,
  services TEXT[] DEFAULT '{}',
  facilities TEXT[] DEFAULT '{}',
  booking_mode TEXT DEFAULT 'manual',
  instant_booking BOOLEAN DEFAULT FALSE,
  min_stay_nights INTEGER DEFAULT 1,
  max_stay_nights INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS property_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_url TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hospitality_room_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  room_type TEXT NOT NULL,
  room_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE property_pricing ADD COLUMN IF NOT EXISTS lease_min_months INTEGER;

ALTER TABLE property_residential_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_commercial_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_land_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_hospitality_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitality_room_types ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Property owners manage residential details" ON property_residential_details
    FOR ALL USING (
      EXISTS (SELECT 1 FROM properties p WHERE p.id = property_id AND p.owner_id = auth.uid())
    )
    WITH CHECK (
      EXISTS (SELECT 1 FROM properties p WHERE p.id = property_id AND p.owner_id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Property owners manage commercial details" ON property_commercial_details
    FOR ALL USING (
      EXISTS (SELECT 1 FROM properties p WHERE p.id = property_id AND p.owner_id = auth.uid())
    )
    WITH CHECK (
      EXISTS (SELECT 1 FROM properties p WHERE p.id = property_id AND p.owner_id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Property owners manage land details" ON property_land_details
    FOR ALL USING (
      EXISTS (SELECT 1 FROM properties p WHERE p.id = property_id AND p.owner_id = auth.uid())
    )
    WITH CHECK (
      EXISTS (SELECT 1 FROM properties p WHERE p.id = property_id AND p.owner_id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Property owners manage hospitality details" ON property_hospitality_details
    FOR ALL USING (
      EXISTS (SELECT 1 FROM properties p WHERE p.id = property_id AND p.owner_id = auth.uid())
    )
    WITH CHECK (
      EXISTS (SELECT 1 FROM properties p WHERE p.id = property_id AND p.owner_id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Property owners manage property documents" ON property_documents
    FOR ALL USING (
      EXISTS (SELECT 1 FROM properties p WHERE p.id = property_id AND p.owner_id = auth.uid())
    )
    WITH CHECK (
      EXISTS (SELECT 1 FROM properties p WHERE p.id = property_id AND p.owner_id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Property owners manage hospitality room types" ON hospitality_room_types
    FOR ALL USING (
      EXISTS (SELECT 1 FROM properties p WHERE p.id = property_id AND p.owner_id = auth.uid())
    )
    WITH CHECK (
      EXISTS (SELECT 1 FROM properties p WHERE p.id = property_id AND p.owner_id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_property_residential_details_updated_at
    BEFORE UPDATE ON property_residential_details
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_property_commercial_details_updated_at
    BEFORE UPDATE ON property_commercial_details
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_property_land_details_updated_at
    BEFORE UPDATE ON property_land_details
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_property_hospitality_details_updated_at
    BEFORE UPDATE ON property_hospitality_details
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_property_documents_updated_at
    BEFORE UPDATE ON property_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_hospitality_room_types_updated_at
    BEFORE UPDATE ON hospitality_room_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
