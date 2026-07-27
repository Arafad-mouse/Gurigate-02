-- Add foreign key from leases.property_id to properties.id
-- This enables Supabase to auto-join leases with properties

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_leases_property_id' 
    AND conrelid = 'leases'::regclass
  ) THEN
    ALTER TABLE leases DROP CONSTRAINT fk_leases_property_id;
  END IF;
END $$;

ALTER TABLE leases
ADD CONSTRAINT fk_leases_property_id
FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL
NOT VALID;

-- Validate the property_id constraint
ALTER TABLE leases VALIDATE CONSTRAINT fk_leases_property_id;

-- Make unit_id nullable first (it's currently NOT NULL)
ALTER TABLE leases ALTER COLUMN unit_id DROP NOT NULL;

-- Clean up orphaned unit_id values (set to NULL where room doesn't exist)
UPDATE leases
SET unit_id = NULL
WHERE unit_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM rooms WHERE id = leases.unit_id);

-- Also add FK for unit_id to rooms if not exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_leases_unit_id' 
    AND conrelid = 'leases'::regclass
  ) THEN
    ALTER TABLE leases DROP CONSTRAINT fk_leases_unit_id;
  END IF;
END $$;

ALTER TABLE leases
ADD CONSTRAINT fk_leases_unit_id
FOREIGN KEY (unit_id) REFERENCES rooms(id) ON DELETE SET NULL;

-- Validate the unit_id constraint
ALTER TABLE leases VALIDATE CONSTRAINT fk_leases_unit_id;
