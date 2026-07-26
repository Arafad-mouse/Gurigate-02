-- Fix documents table column name from document_name to name
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' 
    AND column_name = 'document_name'
  ) THEN
    ALTER TABLE documents RENAME COLUMN document_name TO name;
  END IF;
END $$;
