-- GuriGate Property Availability Blocks Migration
-- Adds availability management for Property aggregate
-- Date: 2026-06-03
--
-- This migration adds the availability_blocks table to support:
-- - Manual date blocking
-- - Maintenance scheduling
-- - Seasonal availability patterns
-- - Owner use blocks
-- - System-generated blocks
-- - Minimum/maximum stay rules
-- - Booking window restrictions
--
-- NOTE: This migration drops and recreates the existing availability_blocks table
-- to align with Property architecture requirements. Any existing data will be lost.

-- ========================================
-- 1. DROP EXISTING TABLE AND ENUM
-- ========================================

-- Drop existing table if it exists
DROP TABLE IF EXISTS availability_blocks CASCADE;

-- Drop existing enum if it exists
DROP TYPE IF EXISTS availability_reason CASCADE;

-- ========================================
-- 2. CREATE ENUM TYPES
-- ========================================

-- Availability block type enum
CREATE TYPE availability_block_type AS ENUM (
  'manual',
  'maintenance',
  'seasonal',
  'owner_use',
  'system'
);

-- ========================================
-- 2. CREATE AVAILABILITY_BLOCKS TABLE
-- ========================================

CREATE TABLE availability_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  
  -- Block classification
  block_type availability_block_type NOT NULL DEFAULT 'manual',
  
  -- Date range
  start_date DATE NOT NULL,
  end_date DATE NOT NULL CHECK (end_date > start_date),
  
  -- Reason/documentation
  reason TEXT,
  notes TEXT,
  
  -- Stay restrictions
  minimum_stay INTEGER CHECK (minimum_stay >= 1),
  maximum_stay INTEGER CHECK (maximum_stay >= minimum_stay OR maximum_stay IS NULL),
  
  -- Booking window rules
  advance_booking_days INTEGER CHECK (advance_booking_days >= 0),
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES profiles(id),
  
  -- Audit fields
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 3. CREATE INDEXES
-- ========================================

-- Primary lookup index
CREATE INDEX idx_availability_property_dates ON availability_blocks(property_id, start_date, end_date) 
  WHERE deleted_at IS NULL;

-- Block type index
CREATE INDEX idx_availability_block_type ON availability_blocks(block_type) 
  WHERE deleted_at IS NULL;

-- Date range index for availability queries
CREATE INDEX idx_availability_date_range ON availability_blocks(start_date, end_date) 
  WHERE deleted_at IS NULL;

-- Created by index
CREATE INDEX idx_availability_created_by ON availability_blocks(created_by) 
  WHERE deleted_at IS NULL;

-- Soft delete index
CREATE INDEX idx_availability_deleted ON availability_blocks(deleted_at) 
  WHERE deleted_at IS NOT NULL;

-- Geographic search optimization (for location-based availability)
CREATE INDEX idx_availability_property_location ON availability_blocks(property_id) 
  WHERE deleted_at IS NULL AND block_type IN ('seasonal', 'manual');

-- ========================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ========================================

ALTER TABLE availability_blocks ENABLE ROW LEVEL SECURITY;

-- Property owners can view their property availability blocks
CREATE POLICY "Property owners can view availability blocks" ON availability_blocks
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    deleted_at IS NULL AND
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = availability_blocks.property_id
      AND properties.owner_id = auth.uid()
    )
  );

-- Public can view availability blocks for approved properties (read-only)
CREATE POLICY "Public can view availability for approved properties" ON availability_blocks
  FOR SELECT USING (
    deleted_at IS NULL AND
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = availability_blocks.property_id
      AND properties.is_approved = TRUE 
      AND properties.status = 'active'
    )
  );

-- Property owners can create availability blocks
CREATE POLICY "Property owners can create availability blocks" ON availability_blocks
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = availability_blocks.property_id
      AND properties.owner_id = auth.uid()
    )
  );

-- Property owners can update their availability blocks
CREATE POLICY "Property owners can update availability blocks" ON availability_blocks
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = availability_blocks.property_id
      AND properties.owner_id = auth.uid()
    )
  );

-- Property owners can delete their availability blocks (soft delete)
CREATE POLICY "Property owners can delete availability blocks" ON availability_blocks
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = availability_blocks.property_id
      AND properties.owner_id = auth.uid()
    )
  );

-- Admins can view all availability blocks
CREATE POLICY "Admins can view all availability blocks" ON availability_blocks
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can manage all availability blocks
CREATE POLICY "Admins can manage availability blocks" ON availability_blocks
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ========================================
-- 5. TRIGGERS AND FUNCTIONS
-- ========================================

-- Update updated_at timestamp
CREATE TRIGGER update_availability_blocks_updated_at 
    BEFORE UPDATE ON availability_blocks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to check if a date range is available for booking
CREATE OR REPLACE FUNCTION is_property_available(
  p_property_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS BOOLEAN AS $$
DECLARE
  v_block_count INTEGER;
BEGIN
  -- Check for any blocking availability blocks in the requested date range
  SELECT COUNT(*) INTO v_block_count
  FROM availability_blocks
  WHERE property_id = p_property_id
    AND deleted_at IS NULL
    AND (
      -- Block overlaps with requested range
      (start_date <= p_end_date AND end_date >= p_start_date)
    );
  
  -- Return true if no blocks found
  RETURN v_block_count = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get minimum stay requirement for a date range
CREATE OR REPLACE FUNCTION get_minimum_stay(
  p_property_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS INTEGER AS $$
DECLARE
  v_min_stay INTEGER;
BEGIN
  -- Get the minimum stay from any applicable availability block
  SELECT COALESCE(MIN(minimum_stay), 1) INTO v_min_stay
  FROM availability_blocks
  WHERE property_id = p_property_id
    AND deleted_at IS NULL
    AND start_date <= p_end_date
    AND end_date >= p_start_date
    AND minimum_stay IS NOT NULL;
  
  RETURN v_min_stay;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get maximum stay requirement for a date range
CREATE OR REPLACE FUNCTION get_maximum_stay(
  p_property_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS INTEGER AS $$
DECLARE
  v_max_stay INTEGER;
BEGIN
  -- Get the maximum stay from any applicable availability block
  SELECT COALESCE(MAX(maximum_stay), NULL) INTO v_max_stay
  FROM availability_blocks
  WHERE property_id = p_property_id
    AND deleted_at IS NULL
    AND start_date <= p_end_date
    AND end_date >= p_start_date
    AND maximum_stay IS NOT NULL;
  
  RETURN v_max_stay;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get advance booking window for a property
CREATE OR REPLACE FUNCTION get_advance_booking_days(
  p_property_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  v_advance_days INTEGER;
BEGIN
  -- Get the advance booking days from active availability blocks
  SELECT COALESCE(MAX(advance_booking_days), NULL) INTO v_advance_days
  FROM availability_blocks
  WHERE property_id = p_property_id
    AND deleted_at IS NULL
    AND advance_booking_days IS NOT NULL
    AND start_date <= CURRENT_DATE
    AND end_date >= CURRENT_DATE;
  
  RETURN v_advance_days;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 6. VIEWS FOR COMMON QUERIES
-- ========================================

-- Active availability blocks view
CREATE VIEW active_availability_blocks AS
SELECT 
  ab.*,
  p.title as property_title,
  p.type as property_type,
  p.status as property_status
FROM availability_blocks ab
JOIN properties p ON ab.property_id = p.id
WHERE ab.deleted_at IS NULL
ORDER BY ab.start_date ASC;

-- Property availability summary view
CREATE VIEW property_availability_summary AS
SELECT 
  p.id as property_id,
  p.title,
  p.status,
  COUNT(ab.id) as total_blocks,
  COUNT(ab.id) FILTER (WHERE ab.block_type = 'manual') as manual_blocks,
  COUNT(ab.id) FILTER (WHERE ab.block_type = 'maintenance') as maintenance_blocks,
  COUNT(ab.id) FILTER (WHERE ab.block_type = 'seasonal') as seasonal_blocks,
  COUNT(ab.id) FILTER (WHERE ab.block_type = 'owner_use') as owner_use_blocks,
  COUNT(ab.id) FILTER (WHERE ab.block_type = 'system') as system_blocks,
  MIN(ab.start_date) as next_block_start,
  MAX(ab.end_date) as furthest_block_end
FROM properties p
LEFT JOIN availability_blocks ab ON p.id = ab.property_id AND ab.deleted_at IS NULL
GROUP BY p.id, p.title, p.status
ORDER BY p.title;

-- ========================================
-- 7. GRANTS
-- ========================================

-- Grant usage on enum types
GRANT USAGE ON TYPE availability_block_type TO authenticated, anon;

-- Grant select on views
GRANT SELECT ON active_availability_blocks TO authenticated, anon;
GRANT SELECT ON property_availability_summary TO authenticated, anon;

-- ========================================
-- 8. COMMENTS
-- ========================================

COMMENT ON TABLE availability_blocks IS 'Manages property availability blocks for manual, maintenance, seasonal, owner use, and system-generated date restrictions';

COMMENT ON COLUMN availability_blocks.block_type IS 'Type of availability block: manual (user-initiated), maintenance (property repairs), seasonal (recurring patterns), owner_use (owner personal use), system (auto-generated)';

COMMENT ON COLUMN availability_blocks.minimum_stay IS 'Minimum number of nights required for bookings in this date range';

COMMENT ON COLUMN availability_blocks.maximum_stay IS 'Maximum number of nights allowed for bookings in this date range';

COMMENT ON COLUMN availability_blocks.advance_booking_days IS 'How many days in advance bookings can be made (0 = no restriction)';

COMMENT ON FUNCTION is_property_available IS 'Checks if a property is available for the given date range, considering all active availability blocks';

COMMENT ON FUNCTION get_minimum_stay IS 'Returns the minimum stay requirement for a property in the given date range';

COMMENT ON FUNCTION get_maximum_stay IS 'Returns the maximum stay requirement for a property in the given date range';

COMMENT ON FUNCTION get_advance_booking_days IS 'Returns the advance booking window restriction for a property';
