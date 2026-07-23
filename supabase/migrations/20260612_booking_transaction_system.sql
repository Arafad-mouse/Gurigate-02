-- Booking & Transaction System Migration
-- Implements comprehensive booking management, transaction tracking, and dispute resolution
-- Date: 2026-06-12

-- ========================================
-- 1. CREATE MISSING ENUM TYPES
-- ========================================

-- Extended booking status enum
CREATE TYPE booking_status_extended AS ENUM (
  'pending', 'confirmed', 'checked_in', 'checked_out', 
  'completed', 'cancelled', 'refunded', 'disputed'
);

-- Transaction status enum
CREATE TYPE transaction_status AS ENUM (
  'pending', 'processing', 'completed', 'failed', 'refunded', 'disputed'
);

-- Transaction type enum
CREATE TYPE transaction_type AS ENUM (
  'booking_payment', 'host_payout', 'platform_commission', 
  'refund', 'dispute_resolution', 'adjustment'
);

-- Dispute status enum
CREATE TYPE dispute_status_extended AS ENUM (
  'open', 'investigating', 'resolved', 'closed', 'escalated'
);

-- Dispute type enum
CREATE TYPE dispute_type AS ENUM (
  'property_misrepresentation', 'guest_damage', 'refund_request', 
  'payment_issue', 'host_complaint', 'other'
);

-- Verification document type enum
CREATE TYPE verification_document_type AS ENUM (
  'national_id', 'ownership_certificate', 'land_title', 
  'business_license', 'hotel_license', 'other'
);

-- Verification status enum
CREATE TYPE verification_document_status AS ENUM (
  'pending', 'verified', 'rejected', 'expired'
);

-- ========================================
-- 2. CREATE BOOKING STATUS HISTORY TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS booking_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES property_bookings(id) ON DELETE CASCADE,
  old_status booking_status_extended,
  new_status booking_status_extended NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  change_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_history_booking ON booking_status_history(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_history_created ON booking_status_history(created_at DESC);

-- ========================================
-- 3. CREATE TRANSACTIONS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES property_bookings(id) ON DELETE SET NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  guest_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  host_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  transaction_type transaction_type NOT NULL,
  status transaction_status DEFAULT 'pending',
  
  -- Amounts
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  platform_commission NUMERIC(12, 2) DEFAULT 0 CHECK (platform_commission >= 0),
  host_payout NUMERIC(12, 2) DEFAULT 0 CHECK (host_payout >= 0),
  
  -- Payment method
  payment_method TEXT CHECK (
    payment_method IN ('zaad', 'edahab', 'premier_wallet', 'wadaag_pay', 'bank_transfer', 'card')
  ),
  payment_reference TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  notes TEXT,
  
  -- Audit
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
CREATE INDEX IF NOT EXISTS idx_transactions_deleted ON transactions(deleted_at) WHERE deleted_at IS NOT NULL;

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
  
  -- Review
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_host_verifications_host ON host_verifications(host_id);
CREATE INDEX IF NOT EXISTS idx_host_verifications_status ON host_verifications(status);
CREATE INDEX IF NOT EXISTS idx_host_verifications_type ON host_verifications(document_type);
CREATE INDEX IF NOT EXISTS idx_host_verifications_deleted ON host_verifications(deleted_at) WHERE deleted_at IS NOT NULL;

-- ========================================
-- 5. CREATE GUEST PROFILES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS guest_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Contact info
  phone_number TEXT,
  country TEXT,
  city TEXT,
  address TEXT,
  
  -- Preferences
  preferred_language TEXT DEFAULT 'en',
  notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": true}',
  
  -- Stats
  total_bookings INTEGER DEFAULT 0,
  total_spending NUMERIC(12, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  average_rating NUMERIC(3, 2),
  
  -- Verification
  id_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  
  -- Risk assessment
  risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_flags JSONB DEFAULT '[]',
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_guest_profiles_user ON guest_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_guest_profiles_country ON guest_profiles(country);
CREATE INDEX IF NOT EXISTS idx_guest_profiles_deleted ON guest_profiles(deleted_at) WHERE deleted_at IS NOT NULL;

-- ========================================
-- 6. CREATE DISPUTES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES property_bookings(id) ON DELETE SET NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  guest_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  host_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  dispute_type dispute_type NOT NULL,
  status dispute_status_extended DEFAULT 'open',
  
  -- Details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  amount_disputed NUMERIC(12, 2),
  
  -- Resolution
  resolution TEXT,
  resolution_amount NUMERIC(12, 2),
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  -- Assignment
  assigned_to UUID REFERENCES profiles(id),
  assigned_at TIMESTAMP WITH TIME ZONE,
  
  -- Priority
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Audit
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
CREATE INDEX IF NOT EXISTS idx_disputes_deleted ON disputes(deleted_at) WHERE deleted_at IS NOT NULL;

-- ========================================
-- 7. CREATE DISPUTE MESSAGES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS dispute_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  message TEXT NOT NULL,
  
  -- Attachments
  attachments JSONB DEFAULT '[]',
  
  -- Internal notes (admin only)
  is_internal_note BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dispute_messages_dispute ON dispute_messages(dispute_id);
CREATE INDEX IF NOT EXISTS idx_dispute_messages_sender ON dispute_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_dispute_messages_created ON dispute_messages(created_at DESC);

-- ========================================
-- 8. CREATE NOTIFICATION RECIPIENTS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS notification_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Delivery status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'read')),
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Error tracking
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Channel
  channel TEXT CHECK (channel IN ('email', 'sms', 'push', 'in_app')),
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_recipients_notification ON notification_recipients(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_recipients_recipient ON notification_recipients(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notification_recipients_status ON notification_recipients(status);

-- ========================================
-- 9. UPDATE PROPERTY_BOOKINGS TABLE
-- ========================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'property_bookings' AND schemaname = 'public') THEN
        -- Add check_in/check_out columns if they don't exist (migration from check_in_date/check_out_date)
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'property_bookings' AND column_name = 'check_in'
        ) THEN
            ALTER TABLE property_bookings RENAME COLUMN check_in_date TO check_in;
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'property_bookings' AND column_name = 'check_out'
        ) THEN
            ALTER TABLE property_bookings RENAME COLUMN check_out_date TO check_out;
        END IF;
        
        -- Add host_id column for faster queries
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'property_bookings' AND column_name = 'host_id'
        ) THEN
            ALTER TABLE property_bookings ADD COLUMN host_id UUID REFERENCES profiles(id);
        END IF;
        
        -- Add payment_status column
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'property_bookings' AND column_name = 'payment_status'
        ) THEN
            ALTER TABLE property_bookings ADD COLUMN payment_status TEXT DEFAULT 'pending' CHECK (
                payment_status IN ('pending', 'partial', 'paid', 'refunded', 'failed')
            );
        END IF;
        
        -- Add checked_in_at and checked_out_at columns
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'property_bookings' AND column_name = 'checked_in_at'
        ) THEN
            ALTER TABLE property_bookings ADD COLUMN checked_in_at TIMESTAMP WITH TIME ZONE;
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'property_bookings' AND column_name = 'checked_out_at'
        ) THEN
            ALTER TABLE property_bookings ADD COLUMN checked_out_at TIMESTAMP WITH TIME ZONE;
        END IF;
        
        -- Add commission_amount column
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'property_bookings' AND column_name = 'commission_amount'
        ) THEN
            ALTER TABLE property_bookings ADD COLUMN commission_amount NUMERIC(12, 2) DEFAULT 0;
        END IF;
        
        -- Add tax_amount column
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'property_bookings' AND column_name = 'tax_amount'
        ) THEN
            ALTER TABLE property_bookings ADD COLUMN tax_amount NUMERIC(12, 2) DEFAULT 0;
        END IF;
    END IF;
END $$;

-- Create index on host_id
CREATE INDEX IF NOT EXISTS idx_property_bookings_host ON property_bookings(host_id);
CREATE INDEX IF NOT EXISTS idx_property_bookings_payment_status ON property_bookings(payment_status);

-- ========================================
-- 10. CREATE ADMIN FUNCTIONS
-- ========================================

-- Function to update booking status with history tracking
CREATE OR REPLACE FUNCTION update_booking_status(
  p_booking_id UUID,
  p_new_status booking_status_extended,
  p_changed_by UUID,
  p_change_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_old_status booking_status_extended;
BEGIN
  -- Get current status
  SELECT status INTO v_old_status
  FROM property_bookings
  WHERE id = p_booking_id;
  
  IF v_old_status IS NULL THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;
  
  -- Update booking status
  UPDATE property_bookings
  SET 
    status = p_new_status,
    updated_at = NOW()
  WHERE id = p_booking_id;
  
  -- Log status change in history
  INSERT INTO booking_status_history (
    booking_id, old_status, new_status, changed_by, change_reason
  ) VALUES (
    p_booking_id, v_old_status, p_new_status, p_changed_by, p_change_reason
  );
  
  -- Log admin activity
  PERFORM log_admin_activity(
    p_changed_by,
    'update_booking_status',
    'booking',
    p_booking_id,
    jsonb_build_object(
      'old_status', v_old_status,
      'new_status', p_new_status,
      'reason', p_change_reason
    )
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create transaction
CREATE OR REPLACE FUNCTION create_transaction(
  p_booking_id UUID,
  p_property_id UUID,
  p_guest_id UUID,
  p_host_id UUID,
  p_transaction_type transaction_type,
  p_amount NUMERIC,
  p_currency TEXT DEFAULT 'USD',
  p_platform_commission NUMERIC DEFAULT 0,
  p_host_payout NUMERIC DEFAULT 0,
  p_payment_method TEXT DEFAULT NULL,
  p_payment_reference TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}',
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_transaction_id UUID;
BEGIN
  INSERT INTO transactions (
    booking_id, property_id, guest_id, host_id,
    transaction_type, amount, currency,
    platform_commission, host_payout,
    payment_method, payment_reference,
    metadata, notes
  ) VALUES (
    p_booking_id, p_property_id, p_guest_id, p_host_id,
    p_transaction_type, p_amount, p_currency,
    p_platform_commission, p_host_payout,
    p_payment_method, p_payment_reference,
    p_metadata, p_notes
  )
  RETURNING id INTO v_transaction_id;
  
  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process transaction
CREATE OR REPLACE FUNCTION process_transaction(
  p_transaction_id UUID,
  p_processed_by UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE transactions
  SET 
    status = 'completed',
    processed_by = p_processed_by,
    processed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_transaction_id AND status = 'pending';
  
  -- Log admin activity
  PERFORM log_admin_activity(
    p_processed_by,
    'process_transaction',
    'transaction',
    p_transaction_id,
    NULL
  );
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create dispute
CREATE OR REPLACE FUNCTION create_dispute(
  p_booking_id UUID,
  p_property_id UUID,
  p_guest_id UUID,
  p_host_id UUID,
  p_dispute_type dispute_type,
  p_title TEXT,
  p_description TEXT,
  p_amount_disputed NUMERIC DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_dispute_id UUID;
BEGIN
  INSERT INTO disputes (
    booking_id, property_id, guest_id, host_id,
    dispute_type, title, description, amount_disputed
  ) VALUES (
    p_booking_id, p_property_id, p_guest_id, p_host_id,
    p_dispute_type, p_title, p_description, p_amount_disputed
  )
  RETURNING id INTO v_dispute_id;
  
  -- Update booking dispute status
  UPDATE property_bookings
  SET dispute_status = 'open'
  WHERE id = p_booking_id;
  
  RETURN v_dispute_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to resolve dispute
CREATE OR REPLACE FUNCTION resolve_dispute(
  p_dispute_id UUID,
  p_resolution TEXT,
  p_resolution_amount NUMERIC DEFAULT NULL,
  p_resolved_by UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE disputes
  SET 
    status = 'resolved',
    resolution = p_resolution,
    resolution_amount = p_resolution_amount,
    resolved_by = p_resolved_by,
    resolved_at = NOW(),
    updated_at = NOW()
  WHERE id = p_dispute_id;
  
  -- Update booking dispute status
  UPDATE property_bookings
  SET dispute_status = 'resolved'
  WHERE id = (SELECT booking_id FROM disputes WHERE id = p_dispute_id);
  
  -- Log admin activity
  PERFORM log_admin_activity(
    p_resolved_by,
    'resolve_dispute',
    'dispute',
    p_dispute_id,
    jsonb_build_object(
      'resolution', p_resolution,
      'resolution_amount', p_resolution_amount
    )
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to assign dispute
CREATE OR REPLACE FUNCTION assign_dispute(
  p_dispute_id UUID,
  p_assigned_to UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE disputes
  SET 
    assigned_to = p_assigned_to,
    assigned_at = NOW(),
    status = 'investigating',
    updated_at = NOW()
  WHERE id = p_dispute_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify host document
CREATE OR REPLACE FUNCTION verify_host_document(
  p_verification_id UUID,
  p_status verification_document_status,
  p_reviewed_by UUID,
  p_rejection_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE host_verifications
  SET 
    status = p_status,
    reviewed_by = p_reviewed_by,
    reviewed_at = NOW(),
    rejection_reason = p_rejection_reason,
    updated_at = NOW()
  WHERE id = p_verification_id;
  
  -- Log admin activity
  PERFORM log_admin_activity(
    p_reviewed_by,
    'verify_host_document',
    'host_verification',
    p_verification_id,
    jsonb_build_object(
      'status', p_status,
      'rejection_reason', p_rejection_reason
    )
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 11. UPDATE RLS POLICIES
-- ========================================

-- Enable RLS on new tables
ALTER TABLE booking_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE host_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_recipients ENABLE ROW LEVEL SECURITY;

-- Admin policies for new tables
CREATE POLICY IF NOT EXISTS "Admins can view all booking_status_history" ON booking_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can view all transactions" ON transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can update all transactions" ON transactions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can view all host_verifications" ON host_verifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can update all host_verifications" ON host_verifications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can view all guest_profiles" ON guest_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can view all disputes" ON disputes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can update all disputes" ON disputes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can view all dispute_messages" ON dispute_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can insert dispute_messages" ON dispute_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can view all notification_recipients" ON notification_recipients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- ========================================
-- 12. GRANT EXECUTE PERMISSIONS
-- ========================================

GRANT EXECUTE ON FUNCTION update_booking_status TO authenticated;
GRANT EXECUTE ON FUNCTION create_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION process_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION create_dispute TO authenticated;
GRANT EXECUTE ON FUNCTION resolve_dispute TO authenticated;
GRANT EXECUTE ON FUNCTION assign_dispute TO authenticated;
GRANT EXECUTE ON FUNCTION verify_host_document TO authenticated;

-- Grant access to new tables
GRANT SELECT ON booking_status_history TO authenticated;
GRANT INSERT ON booking_status_history TO authenticated;

GRANT SELECT ON transactions TO authenticated;
GRANT INSERT ON transactions TO authenticated;
GRANT UPDATE ON transactions TO authenticated;

GRANT SELECT ON host_verifications TO authenticated;
GRANT INSERT ON host_verifications TO authenticated;
GRANT UPDATE ON host_verifications TO authenticated;

GRANT SELECT ON guest_profiles TO authenticated;
GRANT INSERT ON guest_profiles TO authenticated;
GRANT UPDATE ON guest_profiles TO authenticated;

GRANT SELECT ON disputes TO authenticated;
GRANT INSERT ON disputes TO authenticated;
GRANT UPDATE ON disputes TO authenticated;

GRANT SELECT ON dispute_messages TO authenticated;
GRANT INSERT ON dispute_messages TO authenticated;
GRANT UPDATE ON dispute_messages TO authenticated;

GRANT SELECT ON notification_recipients TO authenticated;
GRANT INSERT ON notification_recipients TO authenticated;
GRANT UPDATE ON notification_recipients TO authenticated;

-- ========================================
-- 13. CREATE TRIGGERS FOR UPDATED_AT
-- ========================================

DROP TRIGGER IF EXISTS update_transactions_updated_at_trigger ON transactions;
CREATE TRIGGER update_transactions_updated_at_trigger
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_host_verifications_updated_at_trigger ON host_verifications;
CREATE TRIGGER update_host_verifications_updated_at_trigger
    BEFORE UPDATE ON host_verifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_guest_profiles_updated_at_trigger ON guest_profiles;
CREATE TRIGGER update_guest_profiles_updated_at_trigger
    BEFORE UPDATE ON guest_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_disputes_updated_at_trigger ON disputes;
CREATE TRIGGER update_disputes_updated_at_trigger
    BEFORE UPDATE ON disputes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

COMMIT;
