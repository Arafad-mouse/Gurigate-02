-- Fix property_reviews guest_id column
-- Ensures guest_id column exists in property_reviews table
-- Date: 2026-06-11

-- Add guest_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'property_reviews'
    AND column_name = 'guest_id'
  ) THEN
    ALTER TABLE property_reviews ADD COLUMN guest_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- Drop existing policies that reference guest_id to recreate them properly
DROP POLICY IF EXISTS "Users can view reviews for approved properties" ON property_reviews;
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON property_reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON property_reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON property_reviews;

-- Recreate RLS policies
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

COMMIT;
