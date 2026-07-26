-- Drop foreign key constraint on invoices.tenant_id
-- The customer_id from leases may not always reference valid customers
-- We'll keep tenant_id as a UUID field without FK constraint for flexibility

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'invoices_tenant_id_fkey' 
    AND conrelid = 'invoices'::regclass
  ) THEN
    ALTER TABLE invoices DROP CONSTRAINT invoices_tenant_id_fkey;
  END IF;
END $$;
