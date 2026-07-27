-- Fix leases.unit_id foreign key to reference units table instead of rooms
-- RMS uses units, not rooms

-- Drop existing foreign key constraint to rooms
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

-- Add foreign key constraint to units table
ALTER TABLE leases
ADD CONSTRAINT fk_leases_unit_id
FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL;

-- Validate the constraint
ALTER TABLE leases VALIDATE CONSTRAINT fk_leases_unit_id;
