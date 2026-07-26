-- ============================================================
-- GuriGate: Homes Marketplace Foundation
-- Date: 2026-08-15
--
-- Adds marketplace-specific infrastructure:
--   1. listing_pricing_overrides (seasonal/weekend custom pricing)
--   2. cancellation_policies (refund rules per listing)
--   3. homes_listings view (denormalized marketplace search view)
--   4. check_listing_availability() function
--   5. calculate_listing_pricing() function
--   6. Booking cancellation tracking columns
--
-- Architecture: The `properties` table IS the listing entity.
-- A "listing" in Homes Marketplace = a property where
--   published_to_homes = TRUE AND approval_status = 'approved'
-- ============================================================

-- ============================================================
-- 1. LISTING PRICING OVERRIDES
-- ============================================================

CREATE TABLE IF NOT EXISTS listing_pricing_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,

  -- Date range for the override
  start_date DATE NOT NULL,
  end_date DATE NOT NULL CHECK (end_date >= start_date),

  -- Pricing adjustment
  price_type TEXT NOT NULL CHECK (price_type IN ('fixed', 'multiplier')),
  price_value NUMERIC(10,2) NOT NULL CHECK (price_value > 0),

  -- Optional label for host UI (e.g. "Weekend", "Holiday", "Peak Season")
  label TEXT,

  -- Recurring pattern (for weekend rates that repeat weekly)
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_day_of_week SMALLINT CHECK (recurring_day_of_week >= 0 AND recurring_day_of_week <= 6),

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pricing_overrides_property ON listing_pricing_overrides(property_id);
CREATE INDEX IF NOT EXISTS idx_pricing_overrides_dates ON listing_pricing_overrides(property_id, start_date, end_date);

-- ============================================================
-- 2. CANCELLATION POLICIES
-- ============================================================

CREATE TABLE IF NOT EXISTS cancellation_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,

  -- Policy type
  policy_type TEXT NOT NULL CHECK (policy_type IN ('flexible', 'moderate', 'strict', 'super_strict', 'custom')),
  -- flexible: Full refund 1 day before check-in
  -- moderate: Full refund 5 days before, 50% after
  -- strict: 50% refund up to 1 week before, no refund after
  -- super_strict: 25% refund up to 30 days before, no refund after
  -- custom: host defines custom rules via custom_rules JSONB

  -- Custom rules (used when policy_type = 'custom')
  custom_rules JSONB DEFAULT '[]',

  -- Grace period (hours after booking where full refund is always available)
  grace_period_hours INTEGER DEFAULT 48 CHECK (grace_period_hours >= 0),

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_id)
);

-- ============================================================
-- 3. BOOKING CANCELLATION COLUMNS
-- ============================================================

DO $$
BEGIN
  -- Add cancellation tracking columns to property_bookings
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'property_bookings' AND column_name = 'cancelled_at'
  ) THEN
    ALTER TABLE property_bookings ADD COLUMN cancelled_at TIMESTAMP WITH TIME ZONE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'property_bookings' AND column_name = 'cancelled_by'
  ) THEN
    ALTER TABLE property_bookings ADD COLUMN cancelled_by UUID REFERENCES profiles(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'property_bookings' AND column_name = 'cancellation_reason'
  ) THEN
    ALTER TABLE property_bookings ADD COLUMN cancellation_reason TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'property_bookings' AND column_name = 'refund_amount'
  ) THEN
    ALTER TABLE property_bookings ADD COLUMN refund_amount NUMERIC(12,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'property_bookings' AND column_name = 'nights_count'
  ) THEN
    ALTER TABLE property_bookings ADD COLUMN nights_count INTEGER DEFAULT 1 CHECK (nights_count >= 1);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'property_bookings' AND column_name = 'price_per_night'
  ) THEN
    ALTER TABLE property_bookings ADD COLUMN price_per_night NUMERIC(10,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'property_bookings' AND column_name = 'cleaning_fee'
  ) THEN
    ALTER TABLE property_bookings ADD COLUMN cleaning_fee NUMERIC(10,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'property_bookings' AND column_name = 'service_fee'
  ) THEN
    ALTER TABLE property_bookings ADD COLUMN service_fee NUMERIC(10,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'property_bookings' AND column_name = 'host_payout_amount'
  ) THEN
    ALTER TABLE property_bookings ADD COLUMN host_payout_amount NUMERIC(12,2) DEFAULT 0;
  END IF;
END $$;

-- ============================================================
-- 4. HOMES_LISTINGS VIEW (denormalized for marketplace search)
-- ============================================================

CREATE OR REPLACE VIEW homes_listings AS
SELECT
  p.id,
  p.title,
  p.description,
  p.type,
  p.property_category,
  p.listing_type,
  p.approval_status,
  p.status,
  p.is_featured,
  p.view_count,
  p.rating,
  p.review_count,
  p.max_guests,
  p.bedrooms,
  p.beds,
  p.slug,
  p.owner_id,
  p.published_to_homes,
  p.created_at,
  p.updated_at,

  -- Address
  pa.street,
  pa.city,
  pa.district,
  pa.state,
  pa.country,
  pa.latitude,
  pa.longitude,

  -- Pricing
  pp.base_price,
  pp.currency,
  pp.pricing_type,
  pp.security_deposit,
  pp.cleaning_fee,
  pp.service_fee,

  -- Features
  pf.bathrooms,
  pf.square_feet,
  pf.amenities,
  pf.rules,

  -- Primary image
  (SELECT pi.image_url FROM property_images pi
   WHERE pi.property_id = p.id AND pi.is_primary = TRUE LIMIT 1) AS primary_image_url,

  -- All images count
  (SELECT COUNT(*) FROM property_images pi WHERE pi.property_id = p.id) AS image_count,

  -- Host info
  pr.first_name AS host_first_name,
  pr.last_name AS host_last_name,
  pr.avatar_url AS host_avatar_url,

  -- Wishlist count (popularity signal)
  (SELECT COUNT(*) FROM wishlists w WHERE w.property_id = p.id) AS wishlist_count

FROM properties p
LEFT JOIN property_addresses pa ON pa.property_id = p.id
LEFT JOIN property_pricing pp ON pp.property_id = p.id
LEFT JOIN property_features pf ON pf.property_id = p.id
LEFT JOIN profiles pr ON pr.id = p.owner_id
WHERE p.published_to_homes = TRUE
  AND p.approval_status = 'approved'
  AND p.deleted_at IS NULL
  AND p.status = 'available';

-- ============================================================
-- 5. CHECK_LISTING_AVAILABILITY() FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION check_listing_availability(
  p_property_id UUID,
  p_check_in DATE,
  p_check_out DATE
)
RETURNS TABLE(
  is_available BOOLEAN,
  reason TEXT,
  minimum_stay INTEGER,
  maximum_stay INTEGER
) AS $$
DECLARE
  v_conflict_count INTEGER;
  v_block_count INTEGER;
  v_min_stay INTEGER;
  v_max_stay INTEGER;
  v_nights INTEGER;
BEGIN
  v_nights := (p_check_out - p_check_in);

  -- Check for conflicting bookings (confirmed or checked_in)
  SELECT COUNT(*) INTO v_conflict_count
  FROM property_bookings
  WHERE property_id = p_property_id
    AND status IN ('confirmed', 'checked_in', 'awaiting_payment', 'pending')
    AND check_in < p_check_out
    AND check_out > p_check_in;

  -- Check for availability blocks
  SELECT COUNT(*) INTO v_block_count
  FROM availability_blocks
  WHERE property_id = p_property_id
    AND deleted_at IS NULL
    AND start_date < p_check_out
    AND end_date > p_check_in;

  -- Get stay restrictions from availability blocks
  SELECT
    COALESCE(MAX(minimum_stay), 1),
    COALESCE(MAX(maximum_stay), 365)
  INTO v_min_stay, v_max_stay
  FROM availability_blocks
  WHERE property_id = p_property_id
    AND deleted_at IS NULL
    AND start_date <= p_check_in;

  IF v_conflict_count > 0 THEN
    RETURN QUERY SELECT FALSE, 'Dates overlap with existing booking'::TEXT, v_min_stay, v_max_stay;
    RETURN;
  END IF;

  IF v_block_count > 0 THEN
    RETURN QUERY SELECT FALSE, 'Dates are blocked by host'::TEXT, v_min_stay, v_max_stay;
    RETURN;
  END IF;

  IF v_nights < v_min_stay THEN
    RETURN QUERY SELECT FALSE, ('Minimum stay is ' || v_min_stay || ' nights')::TEXT, v_min_stay, v_max_stay;
    RETURN;
  END IF;

  IF v_nights > v_max_stay THEN
    RETURN QUERY SELECT FALSE, ('Maximum stay is ' || v_max_stay || ' nights')::TEXT, v_min_stay, v_max_stay;
    RETURN;
  END IF;

  RETURN QUERY SELECT TRUE, NULL::TEXT, v_min_stay, v_max_stay;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 6. CALCULATE_LISTING_PRICING() FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION calculate_listing_pricing(
  p_property_id UUID,
  p_check_in DATE,
  p_check_out DATE,
  p_guest_count INTEGER DEFAULT 1
)
RETURNS TABLE(
  nights INTEGER,
  price_per_night NUMERIC,
  subtotal NUMERIC,
  cleaning_fee NUMERIC,
  service_fee NUMERIC,
  security_deposit NUMERIC,
  total NUMERIC,
  currency TEXT
) AS $$
DECLARE
  v_pricing RECORD;
  v_nights INTEGER;
  v_base_price NUMERIC;
  v_override_price NUMERIC;
  v_daily_price NUMERIC;
  v_subtotal NUMERIC := 0;
  v_cleaning_fee NUMERIC := 0;
  v_service_fee NUMERIC := 0;
  v_security_deposit NUMERIC := 0;
  v_currency TEXT := 'USD';
  v_current_date DATE;
BEGIN
  v_nights := (p_check_out - p_check_in);

  -- Get base pricing
  SELECT base_price, currency, pricing_type, security_deposit, cleaning_fee, service_fee
  INTO v_pricing
  FROM property_pricing
  WHERE property_id = p_property_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT 0, 0::NUMERIC, 0::NUMERIC, 0::NUMERIC, 0::NUMERIC, 0::NUMERIC, 0::NUMERIC, 'USD'::TEXT;
    RETURN;
  END IF;

  v_currency := v_pricing.currency;
  v_cleaning_fee := COALESCE(v_pricing.cleaning_fee, 0);
  v_service_fee := COALESCE(v_pricing.service_fee, 0);
  v_security_deposit := COALESCE(v_pricing.security_deposit, 0);
  v_base_price := v_pricing.base_price;

  -- Calculate per-night pricing with overrides
  v_current_date := p_check_in;
  WHILE v_current_date < p_check_out LOOP
    -- Check for pricing override on this date
    SELECT
      CASE WHEN price_type = 'fixed' THEN price_value
           WHEN price_type = 'multiplier' THEN v_base_price * price_value
           ELSE v_base_price
      END
    INTO v_override_price
    FROM listing_pricing_overrides
    WHERE property_id = p_property_id
      AND v_current_date >= start_date
      AND v_current_date <= end_date
      AND (
        is_recurring = FALSE
        OR (is_recurring = TRUE AND EXTRACT(DOW FROM v_current_date)::INTEGER = recurring_day_of_week)
      )
    LIMIT 1;

    v_daily_price := COALESCE(v_override_price, v_base_price);
    v_subtotal := v_subtotal + v_daily_price;
    v_current_date := v_current_date + 1;
  END LOOP;

  -- If pricing type is monthly, adjust
  IF v_pricing.pricing_type = 'monthly' THEN
    v_subtotal := v_base_price * CEIL(v_nights::NUMERIC / 30.0);
  ELSIF v_pricing.pricing_type = 'sale' THEN
    v_subtotal := v_base_price;
    v_nights := 0;
  END IF;

  RETURN QUERY SELECT
    v_nights,
    CASE WHEN v_nights > 0 THEN v_subtotal / v_nights ELSE v_subtotal END,
    v_subtotal,
    v_cleaning_fee,
    v_service_fee,
    v_security_deposit,
    v_subtotal + v_cleaning_fee + v_service_fee + v_security_deposit,
    v_currency;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 7. RLS POLICIES FOR NEW TABLES
-- ============================================================

ALTER TABLE listing_pricing_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE cancellation_policies ENABLE ROW LEVEL SECURITY;

-- Pricing overrides: public can read for published listings, owners can manage
CREATE POLICY IF NOT EXISTS "Public can view pricing overrides for approved listings"
  ON listing_pricing_overrides FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = listing_pricing_overrides.property_id
      AND properties.published_to_homes = TRUE
      AND properties.approval_status = 'approved'
    )
  );

CREATE POLICY IF NOT EXISTS "Owners can manage their pricing overrides"
  ON listing_pricing_overrides FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = listing_pricing_overrides.property_id
      AND properties.owner_id = auth.uid()
    )
  );

-- Cancellation policies: public can read, owners can manage
CREATE POLICY IF NOT EXISTS "Public can view cancellation policies for approved listings"
  ON cancellation_policies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = cancellation_policies.property_id
      AND properties.published_to_homes = TRUE
      AND properties.approval_status = 'approved'
    )
  );

CREATE POLICY IF NOT EXISTS "Owners can manage their cancellation policies"
  ON cancellation_policies FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = cancellation_policies.property_id
      AND properties.owner_id = auth.uid()
    )
  );

-- Admin access
CREATE POLICY IF NOT EXISTS "Admins can view all pricing overrides"
  ON listing_pricing_overrides FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can view all cancellation policies"
  ON cancellation_policies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- ============================================================
-- 8. GRANT PERMISSIONS
-- ============================================================

GRANT SELECT ON homes_listings TO authenticated;
GRANT SELECT ON homes_listings TO anon;

GRANT SELECT ON listing_pricing_overrides TO authenticated;
GRANT SELECT ON listing_pricing_overrides TO anon;
GRANT INSERT ON listing_pricing_overrides TO authenticated;
GRANT UPDATE ON listing_pricing_overrides TO authenticated;
GRANT DELETE ON listing_pricing_overrides TO authenticated;

GRANT SELECT ON cancellation_policies TO authenticated;
GRANT SELECT ON cancellation_policies TO anon;
GRANT INSERT ON cancellation_policies TO authenticated;
GRANT UPDATE ON cancellation_policies TO authenticated;
GRANT DELETE ON cancellation_policies TO authenticated;

GRANT EXECUTE ON FUNCTION check_listing_availability TO authenticated;
GRANT EXECUTE ON FUNCTION check_listing_availability TO anon;
GRANT EXECUTE ON FUNCTION calculate_listing_pricing TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_listing_pricing TO anon;

-- ============================================================
-- 9. TRIGGERS FOR UPDATED_AT
-- ============================================================

DROP TRIGGER IF EXISTS update_pricing_overrides_updated_at ON listing_pricing_overrides;
CREATE TRIGGER update_pricing_overrides_updated_at
  BEFORE UPDATE ON listing_pricing_overrides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_cancellation_policies_updated_at ON cancellation_policies;
CREATE TRIGGER update_cancellation_policies_updated_at
  BEFORE UPDATE ON cancellation_policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
