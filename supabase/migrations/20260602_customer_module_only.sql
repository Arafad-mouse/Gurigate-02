-- Customer Module Migration (Phase 1)
-- Date: 2026-06-02
-- Purpose: Add customer CRM layer for Phase 1 migration

-- Update payment_status enum for payment state machine
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'under_review' AND enumtypid = 'payment_status'::regtype) THEN
        ALTER TYPE payment_status ADD VALUE 'under_review' BEFORE 'verified';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'refunded' AND enumtypid = 'payment_status'::regtype) THEN
        ALTER TYPE payment_status ADD VALUE 'refunded' AFTER 'completed';
    END IF;
END $$;

-- Create customer_type enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'customer_type') THEN
        CREATE TYPE customer_type AS ENUM (
          'tenant',
          'renter',
          'buyer',
          'guest'
        );
    END IF;
END $$;

-- Create lifecycle_status enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lifecycle_status') THEN
        CREATE TYPE lifecycle_status AS ENUM (
          'lead',
          'active',
          'inactive',
          'suspended'
        );
    END IF;
END $$;

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  customer_type customer_type NOT NULL DEFAULT 'tenant',
  lifecycle_status lifecycle_status NOT NULL DEFAULT 'lead',
  current_property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  notes TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  total_bookings INTEGER DEFAULT 0,
  total_rent_paid DECIMAL(12,2) DEFAULT 0 CHECK (total_rent_paid >= 0),
  currency TEXT DEFAULT 'USD',
  last_activity_at TIMESTAMP WITH TIME ZONE,
  preferences JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES profiles(id),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id)
);

-- Create indexes for customers
CREATE INDEX IF NOT EXISTS idx_customers_profile ON customers(profile_id);
CREATE INDEX IF NOT EXISTS idx_customers_type ON customers(customer_type);
CREATE INDEX IF NOT EXISTS idx_customers_lifecycle ON customers(lifecycle_status);
CREATE INDEX IF NOT EXISTS idx_customers_deleted ON customers(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_created ON customers(created_at DESC);

-- Add customer_id to bookings table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'bookings' AND schemaname = 'public') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'bookings' AND column_name = 'customer_id'
        ) THEN
            ALTER TABLE bookings ADD COLUMN customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id) WHERE customer_id IS NOT NULL;

-- Enable RLS on customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'customers' 
        AND policyname = 'Users can view their own customer profile'
    ) THEN
        CREATE POLICY "Users can view their own customer profile" ON customers
          FOR SELECT USING (
            auth.role() = 'authenticated' AND
            profile_id = auth.uid()
          );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'customers' 
        AND policyname = 'Admins can view all customers'
    ) THEN
        CREATE POLICY "Admins can view all customers" ON customers
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
            )
          );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'customers' 
        AND policyname = 'Admins can manage customers'
    ) THEN
        CREATE POLICY "Admins can manage customers" ON customers
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
            )
          );
    END IF;
END $$;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create view for customer metrics
CREATE OR REPLACE VIEW customer_metrics_view AS
SELECT
  c.id,
  c.profile_id,
  p.full_name as user_name,
  c.customer_type,
  c.lifecycle_status,
  c.total_bookings,
  c.total_rent_paid,
  c.currency,
  c.created_at,
  c.updated_at
FROM customers c
LEFT JOIN profiles p ON p.id = c.profile_id
WHERE c.deleted_at IS NULL;

-- Grant permissions
GRANT USAGE ON TYPE customer_type TO authenticated, anon;
GRANT USAGE ON TYPE lifecycle_status TO authenticated, anon;
GRANT SELECT ON customer_metrics_view TO authenticated;
