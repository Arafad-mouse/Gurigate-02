-- Create leases table
CREATE TABLE IF NOT EXISTS leases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL,
  property_id UUID NOT NULL,
  unit_id UUID NOT NULL,
  lease_number VARCHAR(50) NOT NULL UNIQUE,
  lease_type VARCHAR(20) NOT NULL CHECK (lease_type IN ('Residential', 'Commercial')),
  status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Draft', 'Active', 'Expired', 'Terminated')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monthly_rent DECIMAL(10, 2) NOT NULL,
  security_deposit DECIMAL(10, 2) NOT NULL DEFAULT 0,
  payment_frequency VARCHAR(20) NOT NULL CHECK (payment_frequency IN ('Monthly', 'Quarterly', 'Yearly')),
  grace_period INT DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  payment_status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (payment_status IN ('Paid', 'Pending', 'Partial', 'Overdue')),
  outstanding_balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
  lease_agreement_url TEXT DEFAULT NULL,
  contract_url TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create lease documents table
CREATE TABLE IF NOT EXISTS lease_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id UUID NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('Lease Agreement', 'Signed Contract', 'Additional')),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create lease activities table
CREATE TABLE IF NOT EXISTS lease_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id UUID NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('Created', 'Payment Received', 'Renewed', 'Updated', 'Terminated')),
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX idx_leases_owner_id ON leases(owner_id);
CREATE INDEX idx_leases_customer_id ON leases(customer_id);
CREATE INDEX idx_leases_property_id ON leases(property_id);
CREATE INDEX idx_leases_unit_id ON leases(unit_id);
CREATE INDEX idx_leases_status ON leases(status);
CREATE INDEX idx_leases_lease_type ON leases(lease_type);
CREATE INDEX idx_leases_payment_status ON leases(payment_status);
CREATE INDEX idx_lease_documents_lease_id ON lease_documents(lease_id);
CREATE INDEX idx_lease_activities_lease_id ON lease_activities(lease_id);

-- Add lease_id column to rooms if not exists
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS lease_id UUID REFERENCES leases(id);

-- Enable RLS for leases table
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE lease_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE lease_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for leases
CREATE POLICY "Users can view their own leases" ON leases
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own leases" ON leases
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own leases" ON leases
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own leases" ON leases
  FOR DELETE USING (auth.uid() = owner_id);

-- Create RLS policy for lease documents
CREATE POLICY "Users can view lease documents of their leases" ON lease_documents
  FOR SELECT USING (
    lease_id IN (SELECT id FROM leases WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can insert documents for their leases" ON lease_documents
  FOR INSERT WITH CHECK (
    lease_id IN (SELECT id FROM leases WHERE owner_id = auth.uid())
  );

-- Create RLS policy for lease activities
CREATE POLICY "Users can view activities of their leases" ON lease_activities
  FOR SELECT USING (
    lease_id IN (SELECT id FROM leases WHERE owner_id = auth.uid())
  );
