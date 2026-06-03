# Architecture Decisions

**Generated:** 2026-06-02
**Status:** AUTHORITATIVE
**Purpose:** Final architectural decisions to guide Phase 0 migration and service implementation

---

## Overview

This document records final architectural decisions for GuriGate's data model and service architecture. These decisions are authoritative and must be followed across database schema, TypeScript types, service implementations, and documentation.

---

## Decision 1: Customer Relationship Model

### Status: FINAL

### Relationship Hierarchy

```
Customer (CRM Layer)
    ↓
Profile (Auth/User Layer)
    ↓
Bookings
    ↓
Contracts
    ↓
Payments
```

### Explanation

**Customer Table Purpose:**
- The `customers` table is a CRM layer, not a replacement for user authentication
- It links to `profiles` via `profile_id` (foreign key)
- Contains lifecycle metadata and business-specific customer information
- Enables customer relationship management independent of auth users

**Profile Table Purpose:**
- Represents authenticated users in the system
- Contains core user data (auth, basic profile info)
- Owned by Supabase Auth system
- One profile can have multiple customer relationships (different contexts)

**Relationship Semantics:**

- A `profile` represents a user account
- A `customer` represents a business relationship with that profile
- One profile → multiple customers (e.g., as tenant, as guest, as buyer)
- Customer lifecycle (lead → active → inactive → suspended) is independent of profile status

### Database Schema

```sql
-- customers table (CRM layer)
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  customer_type customer_type NOT NULL DEFAULT 'tenant',
  lifecycle_status lifecycle_status NOT NULL DEFAULT 'lead',
  current_property_id UUID REFERENCES properties(id),
  notes TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  total_bookings INTEGER DEFAULT 0,
  total_rent_paid NUMERIC DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enums for customer lifecycle
CREATE TYPE customer_type AS ENUM ('tenant', 'renter', 'buyer', 'guest');
CREATE TYPE lifecycle_status AS ENUM ('lead', 'active', 'inactive', 'suspended');
```

### TypeScript Types

```typescript
// src/types/customer.ts
export type CustomerType = 'tenant' | 'renter' | 'buyer' | 'guest';
export type LifecycleStatus = 'lead' | 'active' | 'inactive' | 'suspended';

export interface Customer {
  id: string;
  profile_id: string;  // Links to auth profile
  customer_type: CustomerType;
  lifecycle_status: LifecycleStatus;
  current_property_id: string | null;
  notes: string | null;
  tags: string[];
  total_bookings: number;
  total_rent_paid: number;
  last_activity_at: string | null;
  created_at: string;
  updated_at: string;
}

// Profile remains separate (auth layer)
export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: 'guest' | 'owner' | 'building_manager' | 'admin';
  created_at: string;
  updated_at: string;
}
```

### Service Implications

- `customerService` operates on `customers` table
- Must join with `profiles` for user details (full_name, email, phone)
- Bookings/payments/contracts queried via `profile_id` or customer-specific filters
- Customer lifecycle changes do not affect profile auth status

---

## Decision 2: Property Lifecycle Model

### Status: FINAL

### Property Status Enum (Approved)

```sql
CREATE TYPE property_status AS ENUM (
  'draft',
  'pending_approval',
  'active',
  'archived'
);
```

### Explanation

**Property Status Purpose:**
- Represents the administrative lifecycle of a property listing
- Not an availability indicator
- Managed by property owners and admins

**Status Meanings:**

- `draft`: Property created but not submitted for review
- `pending_approval`: Submitted, awaiting admin approval
- `active`: Approved and visible in marketplace
- `archived`: Removed from marketplace (not deleted)

### Availability Model

**Availability is NOT part of property status.** Availability is determined by:

1. **Bookings Table:** Date-based availability blocks
2. **Contracts Table:** Long-term occupancy (RMS)
3. **Units Table:** Per-unit availability for buildings
4. **Availability Blocks Table:** Manual availability blocks

### Database Schema

```sql
-- Property status (lifecycle only)
ALTER TABLE properties
ADD COLUMN status property_status NOT NULL DEFAULT 'draft';

-- Availability is separate
CREATE TABLE availability_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  reason availability_reason NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE availability_reason AS ENUM ('booked', 'owner_blocked');
```

### TypeScript Types

```typescript
// src/types/property.ts
export type PropertyStatus = 'draft' | 'pending_approval' | 'active' | 'archived';

export interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  status: PropertyStatus;  // Lifecycle only
  // ... other fields
}

// Availability is separate concern
export interface AvailabilityBlock {
  id: string;
  property_id: string;
  booking_id: string | null;
  reason: 'booked' | 'owner_blocked';
  start_date: string;
  end_date: string;
}
```

### Service Implications

- Property service manages `status` for lifecycle
- Availability service (or booking service) manages date-based availability
- No mixing of lifecycle status with availability
- Frontend must query availability separately from property status

---

## Decision 3: Payment State Machine

### Status: FINAL

### Payment Status Enum (Approved)

```sql
CREATE TYPE payment_status AS ENUM (
  'pending',
  'submitted',
  'under_review',
  'verified',
  'completed',
  'failed',
  'cancelled',
  'refunded'
);
```

### State Machine

```
pending
    ↓
submitted
    ↓
under_review
    ↓
verified
    ↓
completed

[Transitions to terminal states:]
    → failed (from any state)
    → cancelled (from pending, submitted, under_review)
    → refunded (from completed only)
```

### State Definitions

- `pending`: Payment initiated but not yet submitted
- `submitted`: Payment submitted to payment processor
- `under_review`: Manual review required (for certain payment methods)
- `verified`: Payment verified by admin/payment provider
- `completed`: Payment successfully processed
- `failed`: Payment failed (insufficient funds, declined, etc.)
- `cancelled`: Payment cancelled by user
- `refunded`: Payment refunded after completion

### Database Schema

```sql
-- Updated payment status enum
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'under_review' BEFORE 'verified';
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'refunded' AFTER 'completed';

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  method payment_method NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  reference_id TEXT NOT NULL,
  reference_type payment_reference_type NOT NULL,
  payer_id UUID NOT NULL REFERENCES profiles(id),
  payee_id UUID NOT NULL REFERENCES profiles(id),
  note TEXT,
  proof_url TEXT,
  due_date DATE,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### TypeScript Types

```typescript
// frontend/src/types/payment.ts
export type PaymentStatus =
  | 'pending'
  | 'submitted'
  | 'under_review'
  | 'verified'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export interface PaymentRecord {
  id: string;
  amount: number;
  currency: string;
  method: PaymentMethodId;
  status: PaymentStatus;
  reference_id: string;
  reference_type: 'booking' | 'rent';
  payer_id: string;
  payee_id: string;
  note: string | null;
  proof_url: string | null;
  due_date: string | null;
  verified_at: string | null;
  verified_by: string | null;
  created_at: string;
  updated_at: string;
}
```

### Service Implications

- Payment service must enforce valid state transitions
- Cannot transition to `refunded` from non-`completed` states
- Cannot transition to `cancelled` from `completed` (must refund instead)
- Admin functions for manual state changes (with audit logging)

---

## Decision 4: Organization Naming Standard

### Status: FINAL

### Table Name: `organization_users`

**Decision:** Use `organization_users` (not `organization_members`)

### Rationale

- Consistent with Supabase Auth naming conventions (`users` table)
- Clearer semantic meaning (users belong to organizations)
- Aligns with common industry patterns
- Avoids ambiguity with "member" (could refer to other contexts)

### Database Schema

```sql
-- Organization users table (not organization_members)
CREATE TABLE organization_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role organization_role NOT NULL DEFAULT 'member',
  invited_by UUID REFERENCES profiles(id),
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

CREATE TYPE organization_role AS ENUM ('owner', 'admin', 'member');
```

### TypeScript Types

```typescript
// frontend/src/types/organization.ts
export type OrganizationRole = 'owner' | 'admin' | 'member';

export interface OrganizationUser {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrganizationRole;
  invited_by: string | null;
  invited_at: string | null;
  joined_at: string | null;
  created_at: string;
  updated_at: string;
}
```

### Service Implications

- All services use `organization_users` table
- Repository class: `OrganizationUserRepository`
- Service class: `OrganizationService`
- No references to `organization_members` anywhere in codebase

---

## Decision 5: Property Type Standard

### Status: FINAL

### Property Type Enum (Somaliland MVP)

```sql
CREATE TYPE property_type AS ENUM (
  'house',
  'apartment',
  'villa',
  'room',
  'hotel',
  'guest_house',
  'shop',
  'office',
  'warehouse',
  'land'
);
```

### Rationale

**MVP-Focused:** Limited to property types relevant to Somaliland market

**Extensible:** Additional types can be added later via migration

**Clarity:** Each type has clear, distinct meaning in local market

### Type Definitions

- `house`: Detached single-family home
- `apartment`: Multi-unit residential building unit
- `villa`: Luxury detached home with amenities
- `room`: Single room rental (shared accommodation)
- `hotel`: Hotel room or suite
- `guest_house`: Small guest house or B&B
- `shop`: Retail space
- `office`: Commercial office space
- `warehouse`: Storage/industrial space
- `land`: Vacant land for sale/rent

### Database Schema

```sql
-- Property type enum (MVP set)
CREATE TYPE property_type AS ENUM (
  'house',
  'apartment',
  'villa',
  'room',
  'hotel',
  'guest_house',
  'shop',
  'office',
  'warehouse',
  'land'
);

ALTER TABLE properties
ADD COLUMN type property_type NOT NULL DEFAULT 'apartment';
```

### TypeScript Types

```typescript
// frontend/src/types/property.ts
export type PropertyType =
  | 'house'
  | 'apartment'
  | 'villa'
  | 'room'
  | 'hotel'
  | 'guest_house'
  | 'shop'
  | 'office'
  | 'warehouse'
  | 'land';

export const PROPERTY_TYPES: PropertyType[] = [
  'house',
  'apartment',
  'villa',
  'room',
  'hotel',
  'guest_house',
  'shop',
  'office',
  'warehouse',
  'land',
];
```

### Service Implications

- Property creation/validation uses MVP type set only
- Frontend dropdowns limited to these types
- Future expansion requires database migration + type update
- No placeholder "other" type (enforces explicit categorization)

---

## Migration Requirements

### Before Phase 0 Execution

1. **Update Migration Script:** Modify `20260602_missing_modules.sql` to reflect these decisions
2. **Update Type Definitions:** Align TypeScript types with database schema
3. **Update Documentation:** Ensure all docs reference correct table names and enums

### Specific Migration Changes Needed

**Customer Module:**
- Ensure `customers` table uses `profile_id` (not `user_id`)
- Add `customer_type` and `lifecycle_status` enums
- Document relationship hierarchy

**Property Module:**
- Keep `property_status` as lifecycle-only (4 values)
- Do NOT add availability-related status values
- Ensure `property_type` enum has MVP set (10 values)

**Payment Module:**
- Add `under_review` and `refunded` to `payment_status` enum
- Document state machine in migration comments

**Organization Module:**
- Use `organization_users` table (not `organization_members`)
- Add `organization_role` enum

---

## Compliance Checklist

Before proceeding with Phase 0:

- [ ] `customers` table uses `profile_id` foreign key
- [ ] `property_status` enum has exactly 4 lifecycle values
- [ ] `payment_status` enum has 8 values including `under_review` and `refunded`
- [ ] `organization_users` table used (not `organization_members`)
- [ ] `property_type` enum has exactly 10 MVP values
- [ ] TypeScript types match database schema exactly
- [ ] All documentation updated to reflect these decisions
- [ ] Migration script updated with correct schema

---

## Approval

**Decision Date:** 2026-06-02
**Approved By:** Architecture Review
**Status:** AUTHORITATIVE

These decisions are final and must be followed for all Phase 0 and Phase 1 implementation work.
