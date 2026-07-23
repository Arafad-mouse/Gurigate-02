# Post-Migration Schema Report

**Date:** 2026-06-03
**Migration:** 20260602_customer_module_only.sql
**Status:** Migration file created, not yet applied to remote database due to migration history synchronization issues

## Executive Summary

This report documents the schema changes introduced by the customer module migration. The migration adds the CRM layer for customers, updates payment status enums for the payment state machine, and establishes the necessary relationships for Phase 1 customer service migration.

**Note:** Due to migration history synchronization issues between local and remote databases, the migration could not be applied via Supabase CLI. The remote database appears to have a different migration history than expected. This report documents the intended changes so that the migration can be applied manually or after resolving the migration history issue.

## Migration Warnings

- **Migration History Mismatch:** Remote database migration history does not match local migration files
- **Failed Statements:** Multiple migration files failed to apply due to missing dependencies (e.g., `property_addresses` table not existing when expected)
- **Recommended Action:** Resolve migration history synchronization before applying new migrations, or apply this migration manually via Supabase dashboard SQL editor

## New Tables

### 1. customers

**Purpose:** CRM layer for customer management, linking to profiles without duplicating user data

**Columns:**
- `id` (UUID, PRIMARY KEY): Unique customer identifier
- `profile_id` (UUID, NOT NULL, FK → profiles.id): Links to auth layer profile
- `customer_type` (customer_type, NOT NULL, DEFAULT 'tenant'): Business relationship type
- `lifecycle_status` (lifecycle_status, NOT NULL, DEFAULT 'lead'): Lifecycle state
- `current_property_id` (UUID, FK → properties.id): Current property reference
- `notes` (TEXT): CRM notes
- `tags` (JSONB): Customer tags as JSON array
- `total_bookings` (INTEGER, DEFAULT 0): Total booking count
- `total_rent_paid` (DECIMAL(12,2), DEFAULT 0): Total rent paid
- `currency` (TEXT, DEFAULT 'USD'): Currency for amounts
- `last_activity_at` (TIMESTAMP WITH TIME ZONE): Last activity timestamp
- `preferences` (JSONB): Customer preferences
- `metadata` (JSONB): Additional metadata
- `deleted_at` (TIMESTAMP WITH TIME ZONE): Soft delete timestamp
- `deleted_by` (UUID, FK → profiles.id): User who performed soft delete
- `created_by` (UUID, FK → profiles.id): User who created record
- `updated_by` (UUID, FK → profiles.id): User who last updated record
- `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW()): Creation timestamp
- `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW()): Last update timestamp

**Constraints:**
- UNIQUE(profile_id): Ensures one customer record per profile
- CHECK(total_rent_paid >= 0): Ensures non-negative amounts

**Indexes:**
- `idx_customers_profile`: On profile_id
- `idx_customers_type`: On customer_type
- `idx_customers_lifecycle`: On lifecycle_status
- `idx_customers_deleted`: Partial index on deleted_at (WHERE deleted_at IS NOT NULL)
- `idx_customers_created`: On created_at DESC

**RLS Policies:**
- "Users can view their own customer profile": Authenticated users can view their own customer record
- "Admins can view all customers": Admins and super_admins can view all customers
- "Admins can manage customers": Admins and super_admins can perform all operations

## New Enums

### 1. customer_type

**Values:**
- `tenant`: Tenant customer
- `renter`: Renter customer
- `buyer`: Buyer customer
- `guest`: Guest customer

**Purpose:** Defines the business relationship type between customer and platform

### 2. lifecycle_status

**Values:**
- `lead`: Lead stage
- `active`: Active customer
- `inactive`: Inactive customer
- `suspended`: Suspended customer

**Purpose:** Defines the lifecycle state of a customer in the CRM system

## Updated Enums

### 1. payment_status

**New Values Added:**
- `under_review`: Added before 'verified' (payment under review)
- `refunded`: Added after 'completed' (payment refunded)

**Purpose:** Implements the payment state machine with 8 states:
- Flow: pending → submitted → under_review → verified → completed
- Terminal states: failed, cancelled, refunded

**Architecture Decision Reference:** See `/docs/ARCHITECTURE_DECISIONS.md` Decision 3

## Modified Tables

### 1. property_bookings

**New Column:**
- `customer_id` (UUID, FK → customers.id): Links to customer CRM layer

**New Index:**
- `idx_bookings_customer`: Partial index on customer_id (WHERE customer_id IS NOT NULL)

**Purpose:** Links bookings to the customer CRM layer for customer history tracking

## New Views

### 1. customer_metrics_view

**Purpose:** Provides customer metrics with profile information

**Columns:**
- `id`: Customer ID
- `profile_id`: Profile ID
- `user_name`: Full name from profiles
- `user_email`: Email from profiles
- `customer_type`: Customer type
- `lifecycle_status`: Lifecycle status
- `total_bookings`: Total booking count
- `total_rent_paid`: Total rent paid
- `currency`: Currency
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

**Query:**
```sql
SELECT
  c.id,
  c.profile_id,
  p.full_name as user_name,
  p.email as user_email,
  c.customer_type,
  c.lifecycle_status,
  c.total_bookings,
  c.total_rent_paid,
  c.currency,
  c.created_at,
  c.updated_at
FROM customers c
LEFT JOIN profiles p ON p.id = c.profile_id
WHERE c.deleted_at IS NULL
```

## New Functions

### 1. update_updated_at_column()

**Purpose:** Trigger function to automatically update updated_at timestamp

**Returns:** TRIGGER

**Implementation:**
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## New Triggers

### 1. update_customers_updated_at

**Table:** customers
**Timing:** BEFORE UPDATE
**For Each Row:** Yes
**Function:** update_updated_at_column()

**Purpose:** Automatically update updated_at timestamp on row updates

## New Permissions

### Type Usage Grants
- `GRANT USAGE ON TYPE customer_type TO authenticated, anon`
- `GRANT USAGE ON TYPE lifecycle_status TO authenticated, anon`

### View Select Grants
- `GRANT SELECT ON customer_metrics_view TO authenticated`

## Architecture Alignment

This migration aligns with the following architecture decisions documented in `/docs/ARCHITECTURE_DECISIONS.md`:

### Decision 1: Customer Relationship Model
- **Implementation:** Customer table uses `profile_id` to link to Profile (auth layer)
- **Relationship:** Customer → Profile → Bookings → Contracts → Payments
- **No Duplication:** Customer data is not duplicated from profiles; only CRM-specific fields are stored

### Decision 3: Payment State Machine
- **Implementation:** Added `under_review` and `refunded` to payment_status enum
- **States:** 8 states total (pending, submitted, under_review, verified, completed, failed, cancelled, refunded)
- **Flow:** pending → submitted → under_review → verified → completed
- **Terminal States:** failed, cancelled, refunded

## Phase 1 Relevance

This migration is specifically designed for Phase 1 customer service migration, which includes:
- customers module
- profiles module (existing)
- bookings module (existing)
- contracts module (existing)
- payments module (existing)

**Excluded from this migration:**
- organizations
- subscriptions
- commissions
- maintenance
- messaging

These will be added in future phases as needed.

## Next Steps

1. **Resolve Migration History:** Fix the migration history synchronization issue between local and remote databases
2. **Apply Migration:** Apply this migration manually via Supabase dashboard SQL editor or after resolving migration history
3. **Regenerate Types:** Run `supabase gen types typescript --linked --schema public` to regenerate TypeScript types
4. **Update Interfaces:** Update frontend TypeScript interfaces to match the new schema
5. **Run Type Audit:** Re-run the type audit to identify any remaining mismatches
6. **Begin customerService Migration:** Start migrating the customerService to use Supabase

## Migration File Location

- **File:** `supabase/migrations/20260602_customer_module_only.sql`
- **Full Migration:** `supabase/migrations/20260602_missing_modules.sql` (includes additional modules for future phases)

## Verification Checklist

After applying this migration, verify:

- [ ] customers table exists with all columns
- [ ] customer_type enum exists with correct values
- [ ] lifecycle_status enum exists with correct values
- [ ] payment_status enum includes 'under_review' and 'refunded'
- [ ] property_bookings.customer_id column exists
- [ ] All indexes are created
- [ ] RLS policies are enabled and working
- [ ] customer_metrics_view is accessible
- [ ] Triggers are functioning (updated_at updates automatically)
- [ ] Permissions are granted correctly

## Rollback Plan

If rollback is needed:

```sql
-- Drop views
DROP VIEW IF EXISTS customer_metrics_view;

-- Drop triggers
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;

-- Drop indexes
DROP INDEX IF EXISTS idx_customers_profile;
DROP INDEX IF EXISTS idx_customers_type;
DROP INDEX IF EXISTS idx_customers_lifecycle;
DROP INDEX IF EXISTS idx_customers_deleted;
DROP INDEX IF EXISTS idx_customers_created;
DROP INDEX IF EXISTS idx_bookings_customer;

-- Drop column from property_bookings
ALTER TABLE property_bookings DROP COLUMN IF EXISTS customer_id;

-- Drop table
DROP TABLE IF EXISTS customers;

-- Drop enums (note: cannot drop enum values, only entire enum)
DROP TYPE IF EXISTS customer_type;
DROP TYPE IF EXISTS lifecycle_status;

-- Note: payment_status enum values cannot be rolled back without recreating the enum
```

## Conclusion

This migration establishes the CRM layer for customer management and updates the payment state machine. The changes are aligned with the architecture decisions and are specifically scoped for Phase 1 customer service migration. The migration should be applied after resolving the migration history synchronization issue.
