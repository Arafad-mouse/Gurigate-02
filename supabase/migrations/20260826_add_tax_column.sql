-- Add tax column to invoices table
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax DECIMAL(12, 2) NOT NULL DEFAULT 0;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
