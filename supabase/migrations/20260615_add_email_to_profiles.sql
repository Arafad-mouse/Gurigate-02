-- Add email column to profiles table and create missing tables
-- Date: 2026-06-15

-- ========================================
-- 1. ADD EMAIL COLUMN TO PROFILES
-- ========================================

DO $$
BEGIN
    -- Check if email column exists in profiles table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'email'
    ) THEN
        -- Add email column if it doesn't exist
        ALTER TABLE profiles ADD COLUMN email TEXT;
        
        -- Create unique index on email
        CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email) WHERE email IS NOT NULL;
        
        -- Add comment
        COMMENT ON COLUMN profiles.email IS 'User email address';
    END IF;
END $$;

-- ========================================
-- 2. CREATE ENUM TYPES
-- ========================================

DO $$
BEGIN
    -- Create booking_status_extended enum if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status_extended') THEN
        CREATE TYPE booking_status_extended AS ENUM (
          'pending', 'confirmed', 'checked_in', 'checked_out', 
          'completed', 'cancelled', 'refunded', 'disputed'
        );
    END IF;

    -- Create transaction_status enum if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_status') THEN
        CREATE TYPE transaction_status AS ENUM (
          'pending', 'processing', 'completed', 'failed', 'refunded', 'disputed'
        );
    END IF;

    -- Create transaction_type enum if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
        CREATE TYPE transaction_type AS ENUM (
          'booking_payment', 'host_payout', 'platform_commission', 
          'refund', 'dispute_resolution', 'adjustment'
        );
    END IF;

    -- Create dispute_status_extended enum if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'dispute_status_extended') THEN
        CREATE TYPE dispute_status_extended AS ENUM (
          'open', 'investigating', 'resolved', 'closed', 'escalated'
        );
    END IF;

    -- Create dispute_type enum if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'dispute_type') THEN
        CREATE TYPE dispute_type AS ENUM (
          'property_misrepresentation', 'guest_damage', 'refund_request', 
          'payment_issue', 'host_complaint', 'other'
        );
    END IF;

    -- Create verification_document_type enum if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_document_type') THEN
        CREATE TYPE verification_document_type AS ENUM (
          'national_id', 'ownership_certificate', 'land_title', 
          'business_license', 'hotel_license', 'other'
        );
    END IF;

    -- Create verification_document_status enum if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_document_status') THEN
        CREATE TYPE verification_document_status AS ENUM (
          'pending', 'verified', 'rejected', 'expired'
        );
    END IF;
END $$;

-- ========================================
-- 3. CREATE PROPERTY_BOOKINGS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS property_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  host_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INTEGER NOT NULL CHECK (guests > 0),
  
  status TEXT DEFAULT 'pending' CHECK (
    status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'completed', 'cancelled', 'refunded', 'disputed')
  ),
  payment_status TEXT DEFAULT 'pending' CHECK (
    payment_status IN ('pending', 'partial', 'paid', 'refunded', 'failed')
  ),
  
  -- Pricing
  total_price NUMERIC(12, 2) NOT NULL CHECK (total_price >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  commission_amount NUMERIC(12, 2) DEFAULT 0 CHECK (commission_amount >= 0),
  tax_amount NUMERIC(12, 2) DEFAULT 0 CHECK (tax_amount >= 0),
  
  -- Timestamps
  checked_in_at TIMESTAMP WITH TIME ZONE,
  checked_out_at TIMESTAMP WITH TIME ZONE,
  
  -- Dispute status
  dispute_status TEXT DEFAULT 'none' CHECK (
    dispute_status IN ('none', 'open', 'investigating', 'resolved')
  ),
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  notes TEXT,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_property_bookings_property ON property_bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_property_bookings_guest ON property_bookings(guest_id);
CREATE INDEX IF NOT EXISTS idx_property_bookings_host ON property_bookings(host_id);
CREATE INDEX IF NOT EXISTS idx_property_bookings_status ON property_bookings(status);
CREATE INDEX IF NOT EXISTS idx_property_bookings_dates ON property_bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_property_bookings_created ON property_bookings(created_at DESC);

-- Enable RLS on property_bookings
ALTER TABLE property_bookings ENABLE ROW LEVEL SECURITY;

-- Admin policies for property_bookings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'property_bookings' 
    AND policyname = 'Admins can view all bookings'
  ) THEN
    CREATE POLICY "Admins can view all bookings" ON property_bookings
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role = 'admin'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'property_bookings' 
    AND policyname = 'Admins can update all bookings'
  ) THEN
    CREATE POLICY "Admins can update all bookings" ON property_bookings
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role = 'admin'
        )
      );
  END IF;
END $$;

GRANT SELECT ON property_bookings TO authenticated;
GRANT INSERT ON property_bookings TO authenticated;
GRANT UPDATE ON property_bookings TO authenticated;

-- ========================================
-- 4. CREATE TRANSACTIONS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES property_bookings(id) ON DELETE SET NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  guest_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  host_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  transaction_type transaction_type NOT NULL,
  status transaction_status DEFAULT 'pending',
  
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  platform_commission NUMERIC(12, 2) DEFAULT 0 CHECK (platform_commission >= 0),
  host_payout NUMERIC(12, 2) DEFAULT 0 CHECK (host_payout >= 0),
  
  payment_method TEXT CHECK (
    payment_method IN ('zaad', 'edahab', 'premier_wallet', 'wadaag_pay', 'bank_transfer', 'card')
  ),
  payment_reference TEXT,
  
  metadata JSONB DEFAULT '{}',
  notes TEXT,
  
  processed_by UUID REFERENCES profiles(id),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_transactions_booking ON transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_transactions_property ON transactions(property_id);
CREATE INDEX IF NOT EXISTS idx_transactions_guest ON transactions(guest_id);
CREATE INDEX IF NOT EXISTS idx_transactions_host ON transactions(host_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at DESC);

-- ========================================
-- 4. CREATE HOST VERIFICATIONS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS host_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_type verification_document_type NOT NULL,
  document_url TEXT NOT NULL,
  document_number TEXT,
  issue_date DATE,
  expiry_date DATE,
  status verification_document_status DEFAULT 'pending',
  
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_host_verifications_host ON host_verifications(host_id);
CREATE INDEX IF NOT EXISTS idx_host_verifications_status ON host_verifications(status);
CREATE INDEX IF NOT EXISTS idx_host_verifications_type ON host_verifications(document_type);

-- ========================================
-- 5. CREATE DISPUTES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES property_bookings(id) ON DELETE SET NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  guest_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  host_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  dispute_type dispute_type NOT NULL,
  status dispute_status_extended DEFAULT 'open',
  
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  amount_disputed NUMERIC(12, 2),
  
  resolution TEXT,
  resolution_amount NUMERIC(12, 2),
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  assigned_to UUID REFERENCES profiles(id),
  assigned_at TIMESTAMP WITH TIME ZONE,
  
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_disputes_booking ON disputes(booking_id);
CREATE INDEX IF NOT EXISTS idx_disputes_property ON disputes(property_id);
CREATE INDEX IF NOT EXISTS idx_disputes_guest ON disputes(guest_id);
CREATE INDEX IF NOT EXISTS idx_disputes_host ON disputes(host_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_disputes_assigned ON disputes(assigned_to);
CREATE INDEX IF NOT EXISTS idx_disputes_created ON disputes(created_at DESC);

-- ========================================
-- 6. ENABLE RLS AND CREATE POLICIES
-- ========================================

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE host_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

-- Admin policies for transactions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'transactions' 
    AND policyname = 'Admins can view all transactions'
  ) THEN
    CREATE POLICY "Admins can view all transactions" ON transactions
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role = 'admin'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'transactions' 
    AND policyname = 'Admins can update all transactions'
  ) THEN
    CREATE POLICY "Admins can update all transactions" ON transactions
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role = 'admin'
        )
      );
  END IF;
END $$;

-- Admin policies for host_verifications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'host_verifications' 
    AND policyname = 'Admins can view all host_verifications'
  ) THEN
    CREATE POLICY "Admins can view all host_verifications" ON host_verifications
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role = 'admin'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'host_verifications' 
    AND policyname = 'Admins can update all host_verifications'
  ) THEN
    CREATE POLICY "Admins can update all host_verifications" ON host_verifications
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role = 'admin'
        )
      );
  END IF;
END $$;

-- Admin policies for disputes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'disputes' 
    AND policyname = 'Admins can view all disputes'
  ) THEN
    CREATE POLICY "Admins can view all disputes" ON disputes
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role = 'admin'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'disputes' 
    AND policyname = 'Admins can update all disputes'
  ) THEN
    CREATE POLICY "Admins can update all disputes" ON disputes
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role = 'admin'
        )
      );
  END IF;
END $$;

-- ========================================
-- 7. GRANT PERMISSIONS
-- ========================================

GRANT SELECT ON transactions TO authenticated;
GRANT INSERT ON transactions TO authenticated;
GRANT UPDATE ON transactions TO authenticated;

GRANT SELECT ON host_verifications TO authenticated;
GRANT INSERT ON host_verifications TO authenticated;
GRANT UPDATE ON host_verifications TO authenticated;

GRANT SELECT ON disputes TO authenticated;
GRANT INSERT ON disputes TO authenticated;
GRANT UPDATE ON disputes TO authenticated;
