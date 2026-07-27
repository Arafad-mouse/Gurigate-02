-- Admin Role System Migration - Production Grade v2
-- Implements role-based access control with audit logging, soft deletes, and scalability features
-- Date: 2026-05-08

-- ========================================
-- 1. CREATE ENUM TYPES
-- ========================================

-- User role enum for role-based access control
CREATE TYPE user_role AS ENUM ('guest', 'host', 'manager', 'admin', 'super_admin');

-- Property approval status enum
CREATE TYPE approval_status AS ENUM ('draft', 'pending', 'approved', 'rejected', 'suspended');

-- Dispute status enum for bookings
CREATE TYPE dispute_status AS ENUM ('none', 'open', 'resolved', 'escalated');

-- Payment status enum - improved model
CREATE TYPE payment_status AS ENUM ('pending', 'submitted', 'under_review', 'verified', 'failed', 'refunded', 'completed');

-- Host verification status enum
CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected', 'suspended');

-- Notification queue status enum
CREATE TYPE notification_status AS ENUM ('pending', 'processing', 'sent', 'failed', 'retrying', 'cancelled');

-- ========================================
-- 2. SAFE ROLE MIGRATION FOR PROFILES
-- ========================================

-- Check if profiles table exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profiles' AND schemaname = 'public') THEN
        CREATE TABLE profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT,
            first_name TEXT,
            last_name TEXT,
            full_name TEXT,
            avatar_url TEXT,
            role user_role DEFAULT 'guest',
            is_banned BOOLEAN DEFAULT FALSE,
            verification_status verification_status DEFAULT 'unverified',
            banned_reason TEXT,
            permissions JSONB DEFAULT '{}',
            host_rating NUMERIC,
            host_response_rate NUMERIC,
            host_response_time INTEGER,
            host_completed_bookings INTEGER DEFAULT 0,
            risk_flags JSONB DEFAULT '[]',
            created_by_admin UUID REFERENCES profiles(id),
            updated_by_admin UUID REFERENCES profiles(id),
            deleted_at TIMESTAMP WITH TIME ZONE,
            deleted_by UUID REFERENCES profiles(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- Safe role migration - convert existing string role to enum
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'role' 
        AND data_type = 'character varying'
    ) THEN
        ALTER TABLE profiles
        ALTER COLUMN role TYPE user_role
        USING role::user_role;
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'role'
    ) THEN
        ALTER TABLE profiles ADD COLUMN role user_role DEFAULT 'guest';
    END IF;
END $$;

-- Add columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'is_banned'
    ) THEN
        ALTER TABLE profiles ADD COLUMN is_banned BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'verification_status'
    ) THEN
        ALTER TABLE profiles ADD COLUMN verification_status verification_status DEFAULT 'unverified';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'banned_reason'
    ) THEN
        ALTER TABLE profiles ADD COLUMN banned_reason TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'permissions'
    ) THEN
        ALTER TABLE profiles ADD COLUMN permissions JSONB DEFAULT '{}';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'host_rating'
    ) THEN
        ALTER TABLE profiles ADD COLUMN host_rating NUMERIC;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'host_response_rate'
    ) THEN
        ALTER TABLE profiles ADD COLUMN host_response_rate NUMERIC;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'host_response_time'
    ) THEN
        ALTER TABLE profiles ADD COLUMN host_response_time INTEGER;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'host_completed_bookings'
    ) THEN
        ALTER TABLE profiles ADD COLUMN host_completed_bookings INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'risk_flags'
    ) THEN
        ALTER TABLE profiles ADD COLUMN risk_flags JSONB DEFAULT '[]';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'created_by_admin'
    ) THEN
        ALTER TABLE profiles ADD COLUMN created_by_admin UUID REFERENCES profiles(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'updated_by_admin'
    ) THEN
        ALTER TABLE profiles ADD COLUMN updated_by_admin UUID REFERENCES profiles(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'deleted_at'
    ) THEN
        ALTER TABLE profiles ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'deleted_by'
    ) THEN
        ALTER TABLE profiles ADD COLUMN deleted_by UUID REFERENCES profiles(id);
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_banned ON profiles(is_banned);
CREATE INDEX IF NOT EXISTS idx_profiles_verification ON profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_profiles_deleted ON profiles(deleted_at) WHERE deleted_at IS NOT NULL;

-- ========================================
-- 3. CREATE ADMIN ACTIVITY LOGS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES profiles(id),
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin ON admin_activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_target ON admin_activity_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON admin_activity_logs(created_at DESC);

-- ========================================
-- 4. CREATE PROPERTY_VIEWS ANALYTICS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS property_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL,
  user_id UUID REFERENCES profiles(id),
  ip_address TEXT,
  user_agent TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_views_property ON property_views(property_id);
CREATE INDEX IF NOT EXISTS idx_property_views_user ON property_views(user_id);
CREATE INDEX IF NOT EXISTS idx_property_views_date ON property_views(viewed_at DESC);

-- ========================================
-- 5. CREATE BOOKING DATE LOCKS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS booking_date_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL,
  booking_id UUID REFERENCES property_bookings(id) ON DELETE CASCADE,
  lock_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(property_id, lock_date)
);

CREATE INDEX IF NOT EXISTS idx_booking_locks_property ON booking_date_locks(property_id);
CREATE INDEX IF NOT EXISTS idx_booking_locks_date ON booking_date_locks(lock_date);
CREATE INDEX IF NOT EXISTS idx_booking_locks_expires ON booking_date_locks(expires_at);

-- ========================================
-- 6. UPDATE PROPERTIES TABLE
-- ========================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'properties' AND schemaname = 'public') THEN
        -- Add approval_status column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'properties' AND column_name = 'approval_status'
        ) THEN
            ALTER TABLE properties ADD COLUMN approval_status approval_status DEFAULT 'pending';
        END IF;

        -- Add approved_by column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'properties' AND column_name = 'approved_by'
        ) THEN
            ALTER TABLE properties ADD COLUMN approved_by UUID REFERENCES profiles(id);
        END IF;

        -- Add approved_at column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'properties' AND column_name = 'approved_at'
        ) THEN
            ALTER TABLE properties ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
        END IF;

        -- Add rejection_reason column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'properties' AND column_name = 'rejection_reason'
        ) THEN
            ALTER TABLE properties ADD COLUMN rejection_reason TEXT;
        END IF;

        -- Add slug for SEO-friendly URLs
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'properties' AND column_name = 'slug'
        ) THEN
            ALTER TABLE properties ADD COLUMN slug TEXT UNIQUE;
        END IF;

        -- Add SEO fields
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'properties' AND column_name = 'seo_title'
        ) THEN
            ALTER TABLE properties ADD COLUMN seo_title TEXT;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'properties' AND column_name = 'seo_description'
        ) THEN
            ALTER TABLE properties ADD COLUMN seo_description TEXT;
        END IF;

        -- Add soft delete columns
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'properties' AND column_name = 'deleted_at'
        ) THEN
            ALTER TABLE properties ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'properties' AND column_name = 'deleted_by'
        ) THEN
            ALTER TABLE properties ADD COLUMN deleted_by UUID REFERENCES profiles(id);
        END IF;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_properties_approval_status ON properties(approval_status);
CREATE INDEX IF NOT EXISTS idx_properties_deleted ON properties(deleted_at) WHERE deleted_at IS NOT NULL;

-- ========================================
-- 5. UPDATE PROPERTY_BOOKINGS TABLE
-- ========================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'property_bookings' AND schemaname = 'public') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'property_bookings' AND column_name = 'admin_note'
        ) THEN
            ALTER TABLE property_bookings ADD COLUMN admin_note TEXT;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'property_bookings' AND column_name = 'dispute_status'
        ) THEN
            ALTER TABLE property_bookings ADD COLUMN dispute_status dispute_status DEFAULT 'none';
        END IF;

        -- Add cancellation tracking
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'property_bookings' AND column_name = 'cancelled_by'
        ) THEN
            ALTER TABLE property_bookings ADD COLUMN cancelled_by UUID REFERENCES profiles(id);
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'property_bookings' AND column_name = 'cancellation_reason'
        ) THEN
            ALTER TABLE property_bookings ADD COLUMN cancellation_reason TEXT;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'property_bookings' AND column_name = 'cancelled_at'
        ) THEN
            ALTER TABLE property_bookings ADD COLUMN cancelled_at TIMESTAMP WITH TIME ZONE;
        END IF;

        -- Add soft delete
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'property_bookings' AND column_name = 'deleted_at'
        ) THEN
            ALTER TABLE property_bookings ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'property_bookings' AND column_name = 'deleted_by'
        ) THEN
            ALTER TABLE property_bookings ADD COLUMN deleted_by UUID REFERENCES profiles(id);
        END IF;
    END IF;
END $$;

-- ========================================
-- 7. UPDATE PAYMENTS TABLE WITH CURRENCY INFRASTRUCTURE
-- ========================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'payments' AND schemaname = 'public') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'payments' AND column_name = 'verified_by'
        ) THEN
            ALTER TABLE payments ADD COLUMN verified_by UUID REFERENCES profiles(id);
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'payments' AND column_name = 'verified_at'
        ) THEN
            ALTER TABLE payments ADD COLUMN verified_at TIMESTAMP WITH TIME ZONE;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'payments' AND column_name = 'proof_image'
        ) THEN
            ALTER TABLE payments ADD COLUMN proof_image TEXT;
        END IF;

        -- Safe migration to new payment status enum
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'payments' 
            AND column_name = 'status' 
            AND data_type = 'character varying'
        ) THEN
            ALTER TABLE payments
            ALTER COLUMN status TYPE payment_status
            USING status::payment_status;
        ELSIF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'payments' AND column_name = 'status'
        ) THEN
            ALTER TABLE payments ADD COLUMN status payment_status DEFAULT 'pending';
        END IF;

        -- Add currency infrastructure
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'payments' AND column_name = 'currency_code'
        ) THEN
            ALTER TABLE payments ADD COLUMN currency_code TEXT DEFAULT 'USD';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'payments' AND column_name = 'exchange_rate_snapshot'
        ) THEN
            ALTER TABLE payments ADD COLUMN exchange_rate_snapshot NUMERIC;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'payments' AND column_name = 'base_currency_amount'
        ) THEN
            ALTER TABLE payments ADD COLUMN base_currency_amount NUMERIC;
        END IF;

        -- Add soft delete
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'payments' AND column_name = 'deleted_at'
        ) THEN
            ALTER TABLE payments ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'payments' AND column_name = 'deleted_by'
        ) THEN
            ALTER TABLE payments ADD COLUMN deleted_by UUID REFERENCES profiles(id);
        END IF;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_verified ON payments(verified_at) WHERE verified_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_deleted ON payments(deleted_at) WHERE deleted_at IS NOT NULL;

-- ========================================
-- 8. CREATE NOTIFICATION TABLES WITH IMPROVED STATUS LIFECYCLE
-- ========================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

CREATE TABLE IF NOT EXISTS notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  recipient_id UUID REFERENCES profiles(id),
  recipient_email TEXT,
  channel TEXT NOT NULL,
  subject TEXT,
  body TEXT,
  metadata JSONB,
  status notification_status DEFAULT 'pending',
  retry_count INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON notification_queue(status);
CREATE INDEX IF NOT EXISTS idx_notification_queue_created ON notification_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_notification_queue_retry ON notification_queue(retry_count) WHERE status IN ('failed', 'retrying');

-- ========================================
-- 9. CREATE ADMIN FUNCTIONS WITH AUDIT LOGGING
-- ========================================

-- Helper function to log admin activity
CREATE OR REPLACE FUNCTION log_admin_activity(
  p_admin_id UUID,
  p_action_type TEXT,
  p_target_type TEXT,
  p_target_id UUID,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO admin_activity_logs (admin_id, action_type, target_type, target_id, metadata)
  VALUES (p_admin_id, p_action_type, p_target_type, p_target_id, p_metadata)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to approve a property
CREATE OR REPLACE FUNCTION approve_property(p_property_id UUID, p_admin_id UUID, p_note TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE properties 
  SET 
    approval_status = 'approved',
    approved_by = p_admin_id,
    approved_at = NOW(),
    rejection_reason = NULL,
    updated_by_admin = p_admin_id
  WHERE id = p_property_id;
  
  -- Log the action
  PERFORM log_admin_activity(
    p_admin_id,
    'approve_property',
    'property',
    p_property_id,
    jsonb_build_object('note', p_note)
  );
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject a property
CREATE OR REPLACE FUNCTION reject_property(p_property_id UUID, p_admin_id UUID, p_reason TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE properties 
  SET 
    approval_status = 'rejected',
    approved_by = p_admin_id,
    approved_at = NOW(),
    rejection_reason = p_reason,
    updated_by_admin = p_admin_id
  WHERE id = p_property_id;
  
  -- Log the action
  PERFORM log_admin_activity(
    p_admin_id,
    'reject_property',
    'property',
    p_property_id,
    jsonb_build_object('reason', p_reason)
  );
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to suspend a property
CREATE OR REPLACE FUNCTION suspend_property(p_property_id UUID, p_admin_id UUID, p_reason TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE properties 
  SET 
    approval_status = 'suspended',
    approved_by = p_admin_id,
    approved_at = NOW(),
    rejection_reason = p_reason,
    updated_by_admin = p_admin_id
  WHERE id = p_property_id;
  
  -- Log the action
  PERFORM log_admin_activity(
    p_admin_id,
    'suspend_property',
    'property',
    p_property_id,
    jsonb_build_object('reason', p_reason)
  );
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify a payment
CREATE OR REPLACE FUNCTION verify_payment(p_payment_id UUID, p_admin_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE payments 
  SET 
    status = 'verified',
    verified_by = p_admin_id,
    verified_at = NOW()
  WHERE id = p_payment_id;
  
  -- Log the action
  PERFORM log_admin_activity(
    p_admin_id,
    'verify_payment',
    'payment',
    p_payment_id,
    NULL
  );
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to ban a user
CREATE OR REPLACE FUNCTION ban_user(p_user_id UUID, p_admin_id UUID, p_reason TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  -- Prevent banning admins or super_admins
  IF EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = p_user_id 
    AND role IN ('admin', 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Cannot ban admin users';
  END IF;

  UPDATE profiles 
  SET 
    is_banned = TRUE,
    banned_reason = p_reason,
    updated_by_admin = p_admin_id
  WHERE id = p_user_id;
  
  -- Log the action
  PERFORM log_admin_activity(
    p_admin_id,
    'ban_user',
    'user',
    p_user_id,
    jsonb_build_object('reason', p_reason)
  );
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to unban a user
CREATE OR REPLACE FUNCTION unban_user(p_user_id UUID, p_admin_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE profiles 
  SET 
    is_banned = FALSE,
    banned_reason = NULL
  WHERE id = p_user_id;
  
  -- Log the action if admin_id provided
  IF p_admin_id IS NOT NULL THEN
    PERFORM log_admin_activity(
      p_admin_id,
      'unban_user',
      'user',
      p_user_id,
      NULL
    );
  END IF;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify a host
CREATE OR REPLACE FUNCTION verify_host(p_user_id UUID, p_admin_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE profiles 
  SET 
    verification_status = 'verified',
    role = 'host',
    updated_by_admin = p_admin_id
  WHERE id = p_user_id;
  
  -- Log the action
  PERFORM log_admin_activity(
    p_admin_id,
    'verify_host',
    'user',
    p_user_id,
    NULL
  );
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to soft delete a property
CREATE OR REPLACE FUNCTION soft_delete_property(p_property_id UUID, p_admin_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE properties 
  SET 
    deleted_at = NOW(),
    deleted_by = p_admin_id
  WHERE id = p_property_id;
  
  -- Log the action
  PERFORM log_admin_activity(
    p_admin_id,
    'delete_property',
    'property',
    p_property_id,
    NULL
  );
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 10. UPDATE RLS POLICIES FOR ADMIN ACCESS
-- ========================================

-- Enable RLS on profiles if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

-- Admins can view all profiles (including soft deleted)
CREATE POLICY IF NOT EXISTS "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Admins can update all profiles
CREATE POLICY IF NOT EXISTS "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Admins can view all properties (including soft deleted)
CREATE POLICY IF NOT EXISTS "Admins can view all properties" ON properties
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Admins can update all properties
CREATE POLICY IF NOT EXISTS "Admins can update all properties" ON properties
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Public users can only view approved, available, non-deleted properties
CREATE POLICY IF NOT EXISTS "Public users can view approved available properties" ON properties
  FOR SELECT USING (
    auth.role() = 'anon' AND
    approval_status = 'approved' AND 
    status = 'available' AND
    deleted_at IS NULL
  );

-- Admins can view all property_bookings (including soft deleted)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'property_bookings' AND schemaname = 'public') THEN
        ALTER TABLE property_bookings ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY IF NOT EXISTS "Admins can view all property_bookings" ON property_bookings
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM profiles 
              WHERE profiles.id = auth.uid() 
              AND profiles.role IN ('admin', 'super_admin')
            )
          );

        CREATE POLICY IF NOT EXISTS "Admins can update all property_bookings" ON property_bookings
          FOR UPDATE USING (
            EXISTS (
              SELECT 1 FROM profiles 
              WHERE profiles.id = auth.uid() 
              AND profiles.role IN ('admin', 'super_admin')
            )
          );
    END IF;
END $$;

-- Admins can view all payments (including soft deleted)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'payments' AND schemaname = 'public') THEN
        ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY IF NOT EXISTS "Admins can view all payments" ON payments
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM profiles 
              WHERE profiles.id = auth.uid() 
              AND profiles.role IN ('admin', 'super_admin')
            )
          );

        CREATE POLICY IF NOT EXISTS "Admins can update all payments" ON payments
          FOR UPDATE USING (
            EXISTS (
              SELECT 1 FROM profiles 
              WHERE profiles.id = auth.uid() 
              AND profiles.role IN ('admin', 'super_admin')
            )
          );
    END IF;
END $$;

-- ========================================
-- 11. GRANT EXECUTE PERMISSIONS
-- ========================================

GRANT EXECUTE ON FUNCTION approve_property TO authenticated;
GRANT EXECUTE ON FUNCTION reject_property TO authenticated;
GRANT EXECUTE ON FUNCTION suspend_property TO authenticated;
GRANT EXECUTE ON FUNCTION verify_payment TO authenticated;
GRANT EXECUTE ON FUNCTION ban_user TO authenticated;
GRANT EXECUTE ON FUNCTION unban_user TO authenticated;
GRANT EXECUTE ON FUNCTION verify_host TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_property TO authenticated;
GRANT EXECUTE ON FUNCTION log_admin_activity TO authenticated;

-- Grant access to admin activity logs
GRANT SELECT ON admin_activity_logs TO authenticated;
GRANT INSERT ON admin_activity_logs TO authenticated;

-- Grant access to notification tables
GRANT SELECT ON notifications TO authenticated;
GRANT INSERT ON notifications TO authenticated;
GRANT UPDATE ON notifications TO authenticated;

GRANT SELECT ON notification_queue TO authenticated;
GRANT INSERT ON notification_queue TO authenticated;
GRANT UPDATE ON notification_queue TO authenticated;

-- ========================================
-- 12. CREATE TRIGGER FOR UPDATED_AT
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at_trigger ON profiles;
CREATE TRIGGER update_profiles_updated_at_trigger
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

COMMIT;
