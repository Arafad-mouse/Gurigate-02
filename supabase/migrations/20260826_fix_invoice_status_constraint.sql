-- Drop the existing status check constraint since the column is integer type
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_status_check;

-- Add a new check constraint that allows any integer value (status is managed by application)
ALTER TABLE invoices ADD CONSTRAINT invoices_status_check CHECK (status IS NOT NULL);
