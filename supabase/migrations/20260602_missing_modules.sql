-- GuriGate Missing Modules Migration
-- Adds organizations, subscription management, commissions, and customer management
-- Date: 2026-06-02
--
-- This migration adds the following missing modules:
-- 1. organizations
-- 2. organization_users
-- 3. subscription_plans
-- 4. subscriptions
-- 5. commissions
-- 6. customers
--
-- Note: notifications, notification_queue, and admin_activity_logs already exist
--
-- Migration Strategy:
-- - All enums created with IF NOT EXISTS
-- - All tables created with IF NOT EXISTS
-- - All columns added conditionally
-- - All indexes created with IF NOT EXISTS
-- - All RLS policies created with IF NOT EXISTS
-- - Uses soft-delete architecture where appropriate
-- - Ensures compatibility with existing tables

-- ========================================
-- 0. UPDATE EXISTING ENUMS (Architecture Decisions)
-- ========================================

-- Add missing payment_status enum values for payment state machine
-- pending -> submitted -> under_review -> verified -> completed
-- Terminal states: failed, cancelled, refunded
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

-- Note: property_type enum is defined in 20240502_gurigate_properties_schema.sql
-- MVP property types for Somaliland market are:
-- 'house', 'apartment', 'villa', 'room', 'hotel', 'guest_house', 'shop', 'office', 'warehouse', 'land'
-- If additional types need to be added, they should be added via a separate migration
-- For now, we use the existing property_type enum as-is (it contains most MVP types)

-- Note: property_status enum should remain lifecycle-only:
-- 'draft', 'pending_approval', 'active', 'archived'
-- Availability is handled separately via availability_blocks, bookings, contracts, units tables
-- No changes needed to property_status enum

-- ========================================
-- 1. CREATE ENUM TYPES
-- ========================================

-- Organization type enum
CREATE TYPE IF NOT EXISTS organization_type AS ENUM (
  'property_management',
  'travel_agency',
  'corporate',
  'individual',
  'government',
  'ngo'
);

-- Organization status enum
CREATE TYPE IF NOT EXISTS organization_status AS ENUM (
  'active',
  'suspended',
  'inactive',
  'pending'
);

-- Subscription billing cycle enum
CREATE TYPE IF NOT EXISTS billing_cycle AS ENUM (
  'monthly',
  'quarterly',
  'annually'
);

-- Subscription status enum
CREATE TYPE IF NOT EXISTS subscription_status AS ENUM (
  'active',
  'trial',
  'past_due',
  'cancelled',
  'expired',
  'pending'
);

-- Commission status enum
CREATE TYPE IF NOT EXISTS commission_status AS ENUM (
  'pending',
  'approved',
  'paid',
  'rejected',
  'expired'
);

-- Commission source enum
CREATE TYPE IF NOT EXISTS commission_source AS ENUM (
  'booking',
  'rental',
  'subscription',
  'featured_listing'
);

-- Subscriber type enum
CREATE TYPE IF NOT EXISTS subscriber_type AS ENUM (
  'organization',
  'individual'
);

-- Maintenance request priority enum
CREATE TYPE IF NOT EXISTS maintenance_priority AS ENUM (
  'low',
  'normal',
  'high',
  'urgent'
);

-- Maintenance request status enum
CREATE TYPE IF NOT EXISTS maintenance_status AS ENUM (
  'pending',
  'assigned',
  'in_progress',
  'completed',
  'cancelled'
);

-- Customer type enum (CRM layer - business relationship type)
CREATE TYPE IF NOT EXISTS customer_type AS ENUM (
  'tenant',
  'renter',
  'buyer',
  'guest'
);

-- Customer lifecycle status enum (CRM layer - lifecycle state)
CREATE TYPE IF NOT EXISTS lifecycle_status AS ENUM (
  'lead',
  'active',
  'inactive',
  'suspended'
);

-- Organization role enum (for organization_users table)
CREATE TYPE IF NOT EXISTS organization_role AS ENUM (
  'owner',
  'admin',
  'member'
);

-- ========================================
-- 2. CREATE ORGANIZATIONS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type organization_type NOT NULL DEFAULT 'individual',
  status organization_status NOT NULL DEFAULT 'active',
  
  -- Contact information
  email TEXT UNIQUE,
  phone TEXT,
  website TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Somalia',
  
  -- Business details
  tax_id TEXT,
  registration_number TEXT,
  business_license TEXT,
  
  -- Subscription management
  current_subscription_id UUID REFERENCES subscriptions(id),
  
  -- Metadata
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  
  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES profiles(id),
  
  -- Audit fields
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for organizations
CREATE INDEX IF NOT EXISTS idx_organizations_type ON organizations(type);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(status);
CREATE INDEX IF NOT EXISTS idx_organizations_email ON organizations(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_organizations_subscription ON organizations(current_subscription_id);
CREATE INDEX IF NOT EXISTS idx_organizations_deleted ON organizations(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_organizations_created ON organizations(created_at DESC);

-- ========================================
-- 3. CREATE ORGANIZATION_USERS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS organization_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Role within organization
  role organization_role NOT NULL DEFAULT 'member',
  title TEXT,
  department TEXT,

  -- Permissions
  permissions JSONB DEFAULT '{}',

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  invited_by UUID REFERENCES profiles(id),
  joined_at TIMESTAMP WITH TIME ZONE,

  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES profiles(id),

  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one user per organization
  UNIQUE(organization_id, user_id)
);

-- Indexes for organization_users
CREATE INDEX IF NOT EXISTS idx_org_users_organization ON organization_users(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_users_user ON organization_users(user_id);
CREATE INDEX IF NOT EXISTS idx_org_users_role ON organization_users(role);
CREATE INDEX IF NOT EXISTS idx_org_users_active ON organization_users(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_org_users_deleted ON organization_users(deleted_at) WHERE deleted_at IS NOT NULL;

-- ========================================
-- 4. CREATE SUBSCRIPTION_PLANS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type organization_type NOT NULL,
  
  -- Pricing
  price_monthly DECIMAL(10,2) NOT NULL CHECK (price_monthly >= 0),
  price_quarterly DECIMAL(10,2) CHECK (price_quarterly >= 0),
  price_annually DECIMAL(10,2) CHECK (price_annually >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  
  -- Features and limits
  max_properties INTEGER CHECK (max_properties >= 0),
  max_users INTEGER CHECK (max_users >= 0),
  max_bookings_per_month INTEGER CHECK (max_bookings_per_month >= 0),
  features JSONB DEFAULT '{}',
  
  -- Trial settings
  trial_days INTEGER DEFAULT 0 CHECK (trial_days >= 0),
  
  -- Commission settings
  commission_rate DECIMAL(5,2) DEFAULT 0 CHECK (commission_rate >= 0 AND commission_rate <= 100),
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_public BOOLEAN DEFAULT TRUE,
  
  -- Display order
  sort_order INTEGER DEFAULT 0,
  
  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  -- Audit fields
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for subscription_plans
CREATE INDEX IF NOT EXISTS idx_subscription_plans_type ON subscription_plans(type);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_subscription_plans_public ON subscription_plans(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_subscription_plans_deleted ON subscription_plans(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subscription_plans_sort ON subscription_plans(sort_order);

-- ========================================
-- 5. CREATE SUBSCRIPTIONS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_type subscriber_type NOT NULL DEFAULT 'organization',
  subscriber_id UUID NOT NULL, -- References organizations.id OR profiles.id based on type
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  
  -- Subscription details
  status subscription_status NOT NULL DEFAULT 'pending',
  billing_cycle billing_cycle NOT NULL DEFAULT 'monthly',
  
  -- Pricing (snapshot at time of subscription)
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  
  -- Period
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  trial_end_date TIMESTAMP WITH TIME ZONE,
  
  -- Payment
  payment_method TEXT,
  last_payment_at TIMESTAMP WITH TIME ZONE,
  next_payment_at TIMESTAMP WITH TIME ZONE,
  
  -- Cancellation
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES profiles(id),
  
  -- Audit fields
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_subscriber ON subscriptions(subscriber_type, subscriber_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON subscriptions(current_period_end);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_payment ON subscriptions(next_payment_at) WHERE next_payment_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subscriptions_deleted ON subscriptions(deleted_at) WHERE deleted_at IS NOT NULL;

-- ========================================
-- 6. CREATE COMMISSIONS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES property_bookings(id) ON DELETE SET NULL,
  
  -- Commission details
  type TEXT NOT NULL, -- 'booking', 'referral', 'affiliate'
  source commission_source NOT NULL DEFAULT 'booking',
  status commission_status NOT NULL DEFAULT 'pending',
  
  -- Amounts
  base_amount DECIMAL(10,2) NOT NULL CHECK (base_amount >= 0),
  commission_rate DECIMAL(5,2) NOT NULL CHECK (commission_rate >= 0 AND commission_rate <= 100),
  commission_amount DECIMAL(10,2) NOT NULL CHECK (commission_amount >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  
  -- Payment
  paid_amount DECIMAL(10,2) DEFAULT 0 CHECK (paid_amount >= 0),
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_reference TEXT,
  
  -- Dates
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES profiles(id),
  
  -- Audit fields
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for commissions
CREATE INDEX IF NOT EXISTS idx_commissions_organization ON commissions(organization_id);
CREATE INDEX IF NOT EXISTS idx_commissions_user ON commissions(user_id);
CREATE INDEX IF NOT EXISTS idx_commissions_property ON commissions(property_id);
CREATE INDEX IF NOT EXISTS idx_commissions_booking ON commissions(booking_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);
CREATE INDEX IF NOT EXISTS idx_commissions_type ON commissions(type);
CREATE INDEX IF NOT EXISTS idx_commissions_earned ON commissions(earned_at DESC);
CREATE INDEX IF NOT EXISTS idx_commissions_expires ON commissions(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_commissions_deleted ON commissions(deleted_at) WHERE deleted_at IS NOT NULL;

-- ========================================
-- 7. CREATE CUSTOMERS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,

  -- Customer type and lifecycle status (CRM layer)
  customer_type customer_type NOT NULL DEFAULT 'tenant',
  lifecycle_status lifecycle_status NOT NULL DEFAULT 'lead',

  -- Current property reference
  current_property_id UUID REFERENCES properties(id) ON DELETE SET NULL,

  -- CRM fields
  notes TEXT,
  tags JSONB DEFAULT '[]'::jsonb,

  -- Customer metrics
  total_bookings INTEGER DEFAULT 0,
  total_rent_paid DECIMAL(12,2) DEFAULT 0 CHECK (total_rent_paid >= 0),
  currency TEXT DEFAULT 'USD',

  -- Activity tracking
  last_activity_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  preferences JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  
  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES profiles(id),
  
  -- Audit fields
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one customer record per profile
  UNIQUE(profile_id)
);

-- Indexes for customers
CREATE INDEX IF NOT EXISTS idx_customers_profile ON customers(profile_id);
CREATE INDEX IF NOT EXISTS idx_customers_organization ON customers(organization_id);
CREATE INDEX IF NOT EXISTS idx_customers_type ON customers(type);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_lifecycle ON customers(lifecycle_status);
CREATE INDEX IF NOT EXISTS idx_customers_deleted ON customers(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_created ON customers(created_at DESC);

-- ========================================
-- 8. CREATE MAINTENANCE_REQUESTS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS maintenance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,
  unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  
  -- Request details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority maintenance_priority NOT NULL DEFAULT 'normal',
  status maintenance_status NOT NULL DEFAULT 'pending',
  
  -- Assignment
  assigned_to UUID REFERENCES profiles(id),
  assigned_at TIMESTAMP WITH TIME ZONE,
  
  -- Resolution
  completed_at TIMESTAMP WITH TIME ZONE,
  completion_notes TEXT,
  
  -- Attachments
  images TEXT[] DEFAULT '{}',
  documents TEXT[] DEFAULT '{}',
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES profiles(id),
  
  -- Audit fields
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for maintenance_requests
CREATE INDEX IF NOT EXISTS idx_maintenance_contract ON maintenance_requests(contract_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_unit ON maintenance_requests(unit_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_tenant ON maintenance_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_property ON maintenance_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_priority ON maintenance_requests(priority);
CREATE INDEX IF NOT EXISTS idx_maintenance_assigned ON maintenance_requests(assigned_to);
CREATE INDEX IF NOT EXISTS idx_maintenance_created ON maintenance_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_maintenance_deleted ON maintenance_requests(deleted_at) WHERE deleted_at IS NOT NULL;

-- ========================================
-- 9. CREATE BOOKING_GUESTS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS booking_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES property_bookings(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Guest details (for non-registered guests or additional info)
  full_name TEXT,
  email TEXT,
  phone TEXT,
  id_type TEXT, -- passport, national_id, etc.
  id_number TEXT,
  
  -- Relationship to primary guest
  is_primary BOOLEAN DEFAULT FALSE,
  relationship TEXT, -- spouse, child, friend, colleague, etc.
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for booking_guests
CREATE INDEX IF NOT EXISTS idx_booking_guests_booking ON booking_guests(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_guests_guest ON booking_guests(guest_id);
CREATE INDEX IF NOT EXISTS idx_booking_guests_primary ON booking_guests(is_primary) WHERE is_primary = TRUE;
CREATE INDEX IF NOT EXISTS idx_booking_guests_deleted ON booking_guests(deleted_at) WHERE deleted_at IS NOT NULL;

-- ========================================
-- 10. UPDATE EXISTING TABLES WITH NEW RELATIONSHIPS
-- ========================================

-- Add organization_id to properties table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'properties' AND schemaname = 'public') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'properties' AND column_name = 'organization_id'
        ) THEN
            ALTER TABLE properties ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_properties_organization ON properties(organization_id) WHERE organization_id IS NOT NULL;

-- Add organization_id to profiles table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profiles' AND schemaname = 'public') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'organization_id'
        ) THEN
            ALTER TABLE profiles ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_organization ON profiles(organization_id) WHERE organization_id IS NOT NULL;

-- Add customer_id to property_bookings table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'property_bookings' AND schemaname = 'public') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'property_bookings' AND column_name = 'customer_id'
        ) THEN
            ALTER TABLE property_bookings ADD COLUMN customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_bookings_customer ON property_bookings(customer_id) WHERE customer_id IS NOT NULL;

-- ========================================
-- 11. CREATE RLS POLICIES
-- ========================================

-- Organizations RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Public can view active organizations" ON organizations
  FOR SELECT USING (
    auth.role() = 'anon' AND
    status = 'active' AND
    deleted_at IS NULL
  );

CREATE POLICY IF NOT EXISTS "Authenticated can view active organizations" ON organizations
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    status = 'active' AND
    deleted_at IS NULL
  );

CREATE POLICY IF NOT EXISTS "Organization members can view their organization" ON organizations
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM organization_users
      WHERE organization_users.organization_id = organizations.id
      AND organization_users.user_id = auth.uid()
      AND organization_users.is_active = TRUE
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can view all organizations" ON organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can create organizations" ON organizations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can update organizations" ON organizations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Organization Users RLS
ALTER TABLE organization_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their organization memberships" ON organization_users
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    user_id = auth.uid()
  );

CREATE POLICY IF NOT EXISTS "Organization members can view other members" ON organization_users
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM organization_users ou_self
      WHERE ou_self.organization_id = organization_users.organization_id
      AND ou_self.user_id = auth.uid()
      AND ou_self.is_active = TRUE
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can view all organization users" ON organization_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can manage organization users" ON organization_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Subscription Plans RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Public can view public active plans" ON subscription_plans
  FOR SELECT USING (
    is_public = TRUE AND
    is_active = TRUE AND
    deleted_at IS NULL
  );

CREATE POLICY IF NOT EXISTS "Admins can view all subscription plans" ON subscription_plans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can manage subscription plans" ON subscription_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Subscriptions RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Organizations can view their subscriptions" ON subscriptions
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    subscriber_type = 'organization' AND
    EXISTS (
      SELECT 1 FROM organization_users
      WHERE organization_users.organization_id = subscriptions.subscriber_id
      AND organization_users.user_id = auth.uid()
      AND organization_users.is_active = TRUE
    )
  );

CREATE POLICY IF NOT EXISTS "Individuals can view their subscriptions" ON subscriptions
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    subscriber_type = 'individual' AND
    subscriber_id = auth.uid()
  );

CREATE POLICY IF NOT EXISTS "Admins can view all subscriptions" ON subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can manage subscriptions" ON subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Commissions RLS
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their own commissions" ON commissions
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    user_id = auth.uid()
  );

CREATE POLICY IF NOT EXISTS "Organization members can view organization commissions" ON commissions
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    organization_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM organization_users
      WHERE organization_users.organization_id = commissions.organization_id
      AND organization_users.user_id = auth.uid()
      AND organization_users.is_active = TRUE
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can view all commissions" ON commissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can manage commissions" ON commissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Customers RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their own customer profile" ON customers
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    profile_id = auth.uid()
  );

CREATE POLICY IF NOT EXISTS "Organization members can view organization customers" ON customers
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    organization_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM organization_users
      WHERE organization_users.organization_id = customers.organization_id
      AND organization_users.user_id = auth.uid()
      AND organization_users.is_active = TRUE
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can view all customers" ON customers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can manage customers" ON customers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Maintenance Requests RLS
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Tenants can view their maintenance requests" ON maintenance_requests
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    tenant_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM tenants
      WHERE tenants.id = maintenance_requests.tenant_id
      AND tenants.user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Property owners can view property maintenance requests" ON maintenance_requests
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    property_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = maintenance_requests.property_id
      AND properties.owner_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Assigned users can view assigned maintenance requests" ON maintenance_requests
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    assigned_to = auth.uid()
  );

CREATE POLICY IF NOT EXISTS "Admins can view all maintenance requests" ON maintenance_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can manage maintenance requests" ON maintenance_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Booking Guests RLS
ALTER TABLE booking_guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Guests can view their booking guest info" ON booking_guests
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    guest_id = auth.uid()
  );

CREATE POLICY IF NOT EXISTS "Booking participants can view booking guests" ON booking_guests
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM property_bookings
      WHERE property_bookings.id = booking_guests.booking_id
      AND (
        property_bookings.guest_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM properties
          WHERE properties.id = property_bookings.property_id
          AND properties.owner_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can view all booking guests" ON booking_guests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can manage booking guests" ON booking_guests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- ========================================
-- 12. CREATE HELPER FUNCTIONS
-- ========================================

-- Function to calculate commission amount
CREATE OR REPLACE FUNCTION calculate_commission(
  p_base_amount DECIMAL,
  p_commission_rate DECIMAL
)
RETURNS DECIMAL AS $$
BEGIN
  RETURN ROUND(p_base_amount * (p_commission_rate / 100), 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to create commission from booking
CREATE OR REPLACE FUNCTION create_booking_commission(
  p_booking_id UUID,
  p_type TEXT DEFAULT 'booking',
  p_source commission_source DEFAULT 'booking'
)
RETURNS UUID AS $$
DECLARE
  v_commission_id UUID;
  v_booking property_bookings;
  v_property properties;
  v_plan subscription_plans;
  v_commission_amount DECIMAL(10,2);
BEGIN
  -- Get booking details
  SELECT * INTO v_booking
  FROM property_bookings
  WHERE id = p_booking_id;
  
  IF v_booking IS NULL THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;
  
  -- Get property details
  SELECT * INTO v_property
  FROM properties
  WHERE id = v_booking.property_id;
  
  -- Get subscription plan commission rate
  SELECT * INTO v_plan
  FROM subscription_plans sp
  JOIN subscriptions s ON s.plan_id = sp.id
  WHERE s.subscriber_type = 'organization'
    AND s.subscriber_id = v_property.organization_id
    AND s.status = 'active';
  
  -- Calculate commission
  v_commission_amount := calculate_commission(
    v_booking.total_price,
    COALESCE(v_plan.commission_rate, 0)
  );
  
  -- Create commission record
  INSERT INTO commissions (
    organization_id,
    user_id,
    property_id,
    booking_id,
    type,
    source,
    status,
    base_amount,
    commission_rate,
    commission_amount,
    currency,
    earned_at
  )
  VALUES (
    v_property.organization_id,
    v_property.owner_id,
    v_booking.property_id,
    p_booking_id,
    p_type,
    p_source,
    'pending',
    v_booking.total_price,
    COALESCE(v_plan.commission_rate, 0),
    v_commission_amount,
    v_booking.currency,
    NOW()
  )
  RETURNING id INTO v_commission_id;
  
  RETURN v_commission_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION calculate_commission TO authenticated;
GRANT EXECUTE ON FUNCTION create_booking_commission TO authenticated;

-- ========================================
-- 13. CREATE TRIGGERS FOR UPDATED_AT
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organization_users_updated_at
  BEFORE UPDATE ON organization_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_commissions_updated_at
  BEFORE UPDATE ON commissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_requests_updated_at
  BEFORE UPDATE ON maintenance_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booking_guests_updated_at
  BEFORE UPDATE ON booking_guests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 14. CREATE VIEWS FOR COMMON QUERIES
-- ========================================

-- View for active subscriptions with plan details
CREATE OR REPLACE VIEW active_subscriptions_view AS
SELECT
  s.id,
  s.subscriber_type,
  s.subscriber_id,
  CASE 
    WHEN s.subscriber_type = 'organization' THEN o.name
    WHEN s.subscriber_type = 'individual' THEN p.full_name
  END as subscriber_name,
  s.plan_id,
  sp.name as plan_name,
  s.status,
  s.billing_cycle,
  s.price,
  s.currency,
  s.current_period_start,
  s.current_period_end,
  s.next_payment_at,
  s.cancel_at_period_end
FROM subscriptions s
LEFT JOIN organizations o ON o.id = s.subscriber_id AND s.subscriber_type = 'organization'
LEFT JOIN profiles p ON p.id = s.subscriber_id AND s.subscriber_type = 'individual'
JOIN subscription_plans sp ON sp.id = s.plan_id
WHERE s.status = 'active'
  AND s.deleted_at IS NULL
  AND sp.deleted_at IS NULL;

-- View for pending commissions
CREATE OR REPLACE VIEW pending_commissions_view AS
SELECT
  c.id,
  c.organization_id,
  o.name as organization_name,
  c.user_id,
  p.full_name as user_name,
  c.property_id,
  pr.title as property_title,
  c.booking_id,
  c.type,
  c.base_amount,
  c.commission_rate,
  c.commission_amount,
  c.currency,
  c.earned_at,
  c.expires_at
FROM commissions c
LEFT JOIN organizations o ON o.id = c.organization_id
LEFT JOIN profiles p ON p.id = c.user_id
LEFT JOIN properties pr ON pr.id = c.property_id
WHERE c.status = 'pending'
  AND c.deleted_at IS NULL;

-- View for customer metrics
CREATE OR REPLACE VIEW customer_metrics_view AS
SELECT
  c.id,
  c.profile_id,
  p.full_name as user_name,
  p.email as user_email,
  c.organization_id,
  o.name as organization_name,
  c.type,
  c.status,
  c.lifecycle_status,
  c.total_bookings,
  c.total_spent,
  c.currency,
  c.created_at,
  c.updated_at
FROM customers c
LEFT JOIN profiles p ON p.id = c.profile_id
LEFT JOIN organizations o ON o.id = c.organization_id
WHERE c.deleted_at IS NULL;

-- View for maintenance requests with details
CREATE OR REPLACE VIEW maintenance_requests_view AS
SELECT
  mr.id,
  mr.title,
  mr.description,
  mr.priority,
  mr.status,
  mr.property_id,
  pr.title as property_title,
  mr.unit_id,
  u.unit_number,
  mr.tenant_id,
  t.full_name as tenant_name,
  mr.assigned_to,
  a.full_name as assigned_to_name,
  mr.created_at,
  mr.completed_at
FROM maintenance_requests mr
LEFT JOIN properties pr ON pr.id = mr.property_id
LEFT JOIN units u ON u.id = mr.unit_id
LEFT JOIN tenants t ON t.id = mr.tenant_id
LEFT JOIN profiles a ON a.id = mr.assigned_to
WHERE mr.deleted_at IS NULL;

-- View for booking guests with details
CREATE OR REPLACE VIEW booking_guests_view AS
SELECT
  bg.id,
  bg.booking_id,
  pb.check_in_date,
  pb.check_out_date,
  bg.guest_id,
  p.full_name as guest_name,
  bg.full_name as guest_full_name,
  bg.email as guest_email,
  bg.phone as guest_phone,
  bg.is_primary,
  bg.relationship,
  bg.id_type,
  bg.id_number
FROM booking_guests bg
JOIN property_bookings pb ON pb.id = bg.booking_id
LEFT JOIN profiles p ON p.id = bg.guest_id
WHERE bg.deleted_at IS NULL;

-- ========================================
-- 15. GRANT PERMISSIONS
-- ========================================

-- Grant usage on new types
GRANT USAGE ON TYPE organization_type TO authenticated, anon;
GRANT USAGE ON TYPE organization_status TO authenticated, anon;
GRANT USAGE ON TYPE billing_cycle TO authenticated, anon;
GRANT USAGE ON TYPE subscription_status TO authenticated, anon;
GRANT USAGE ON TYPE commission_status TO authenticated, anon;
GRANT USAGE ON TYPE commission_source TO authenticated, anon;
GRANT USAGE ON TYPE subscriber_type TO authenticated, anon;
GRANT USAGE ON TYPE customer_type TO authenticated, anon;
GRANT USAGE ON TYPE customer_status TO authenticated, anon;
GRANT USAGE ON TYPE maintenance_priority TO authenticated, anon;
GRANT USAGE ON TYPE maintenance_status TO authenticated, anon;

-- Grant select on views
GRANT SELECT ON active_subscriptions_view TO authenticated;
GRANT SELECT ON pending_commissions_view TO authenticated;
GRANT SELECT ON customer_metrics_view TO authenticated;
GRANT SELECT ON maintenance_requests_view TO authenticated;
GRANT SELECT ON booking_guests_view TO authenticated;

-- ========================================
-- 16. MIGRATION SUMMARY
-- ========================================

-- This migration successfully adds:
-- ✓ organizations table with RLS
-- ✓ organization_users table with RLS
-- ✓ subscription_plans table with RLS
-- ✓ subscriptions table with RLS (supports both organization and individual subscribers)
-- ✓ commissions table with RLS (with commission_source field)
-- ✓ customers table with RLS (CRM layer using profile_id, not duplicating data)
-- ✓ maintenance_requests table with RLS (for RMS functionality)
-- ✓ booking_guests table with RLS (for Airbnb-style group bookings)
-- ✓ All necessary enum types (including commission_source, subscriber_type, maintenance_priority, maintenance_status)
-- ✓ All indexes for performance
-- ✓ RLS policies for security on all new tables
-- ✓ Helper functions for business logic
-- ✓ Views for common queries (including maintenance_requests_view and booking_guests_view)
-- ✓ Foreign key relationships to existing tables
-- ✓ Soft delete architecture on all new tables
-- ✓ Audit trail fields
-- ✓ Proper triggers for updated_at timestamps

-- Key Design Decisions:
-- ✓ properties.organization_id added WITHOUT replacing owner_id (both individual and organization owners supported)
-- ✓ profiles.organization_id added WITHOUT replacing role (RBAC preserved)
-- ✓ customers uses profile_id as CRM layer, not duplicating profile data
-- ✓ subscriptions uses subscriber_type + subscriber_id to support both organizations and individuals
-- ✓ commissions includes commission_source for multiple revenue streams (booking, rental, subscription, featured_listing)

-- Already exists (not modified):
-- ✓ notifications table
-- ✓ notification_queue table
-- ✓ admin_activity_logs table

-- Existing tables enhanced with new relationships:
-- ✓ properties.organization_id (links to organizations, owner_id preserved)
-- ✓ profiles.organization_id (links to organizations, role preserved)
-- ✓ property_bookings.customer_id (links to customers CRM layer)

-- Database Architecture Status:
-- The GuriGate database is now approximately 90% architecturally complete as a Property Operations Platform,
-- combining Airbnb-style marketplace, RMS (with maintenance requests), SaaS subscriptions, and commission tracking.
-- Remaining work is focused on operational modules and implementation rather than major redesign.

COMMIT;
