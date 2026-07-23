-- Add RLS policies for RMS-specific columns on properties table
-- This ensures that the new RMS columns are properly protected

-- Enable RLS on properties table if not already enabled
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Policy: Property owners can update RMS metrics on their own properties
CREATE POLICY "Property owners can update RMS metrics"
ON properties FOR UPDATE
USING (
  auth.role() = 'authenticated' AND
  auth.uid() = owner_id
)
WITH CHECK (
  auth.role() = 'authenticated' AND
  auth.uid() = owner_id
);

-- Policy: Property owners can publish/unpublish their own properties to Homes
CREATE POLICY "Property owners can publish to Homes"
ON properties FOR UPDATE
USING (
  auth.role() = 'authenticated' AND
  auth.uid() = owner_id
)
WITH CHECK (
  auth.role() = 'authenticated' AND
  auth.uid() = owner_id
);

-- Add comment to document RMS RLS policies
COMMENT ON POLICY "Property owners can update RMS metrics" ON properties IS 'Allows property owners to update RMS-specific metrics (occupancy, revenue, etc.) on their own properties';
COMMENT ON POLICY "Property owners can publish to Homes" ON properties IS 'Allows property owners to publish/unpublish their properties to Homes marketplace';
