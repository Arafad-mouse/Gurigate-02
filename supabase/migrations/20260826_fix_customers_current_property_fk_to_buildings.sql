-- Fix customers.current_property_id foreign key to reference buildings table instead of properties
-- RMS uses buildings, not properties

-- Drop existing foreign key constraint to properties
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'customers_current_property_id_fkey' 
    AND conrelid = 'customers'::regclass
  ) THEN
    ALTER TABLE customers DROP CONSTRAINT customers_current_property_id_fkey;
  END IF;
END $$;

-- Add foreign key constraint to buildings table
ALTER TABLE customers
ADD CONSTRAINT customers_current_property_id_fkey
FOREIGN KEY (current_property_id) REFERENCES buildings(id) ON DELETE SET NULL;

-- Validate the constraint
ALTER TABLE customers VALIDATE CONSTRAINT customers_current_property_id_fkey;
