-- Create documents table for V1 Document Management
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('lease', 'id', 'passport', 'registration', 'receipt', 'ownership', 'other')),
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INT NOT NULL,
  mime_type VARCHAR(100),

  -- Single relationship
  related_type VARCHAR(50) NOT NULL CHECK (related_type IN ('customer', 'lease', 'property', 'payment')),
  related_id UUID NOT NULL,

  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_documents_owner_id ON documents(owner_id);
CREATE INDEX idx_documents_related_type_id ON documents(related_type, related_id);
CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view documents from their own leases/properties
CREATE POLICY "Users can view documents from their leases" ON documents
  FOR SELECT USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM leases
      WHERE leases.owner_id = auth.uid()
      AND leases.id = documents.related_id
      AND documents.related_type = 'lease'
    )
    OR EXISTS (
      SELECT 1 FROM properties
      WHERE properties.owner_id = auth.uid()
      AND properties.id = documents.related_id
      AND documents.related_type = 'property'
    )
  );

CREATE POLICY "Users can insert their own documents" ON documents
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own documents" ON documents
  FOR DELETE USING (auth.uid() = owner_id);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_documents_updated_at();
