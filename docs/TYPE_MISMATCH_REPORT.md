# Type Mismatch Report

**Generated:** 2026-06-02
**Updated:** 2026-06-03
**Scope:** Frontend types vs Supabase database schema comparison
**Purpose:** Identify type mismatches between frontend interfaces and database schema to ensure type-safe migration

---

## Executive Summary

This report compares frontend TypeScript interfaces with Supabase-generated database types. The customer module migration has been successfully applied, adding the customers table and related enums. Some mismatches remain in the Customer module (frontend interfaces need refactoring) and several enum misalignments across Payment and Property modules.

**Migration Status:** The customer module migration (`20260602_customer_module_only.sql`) was successfully applied to the remote database on 2026-06-03. The customers table, customer_type enum, lifecycle_status enum, and payment_status enum updates are now in the database.

**Architecture Decision Reference:** Final architectural decisions are documented in `/docs/ARCHITECTURE_DECISIONS.md` and must be followed for all migration work.

---

## 1. Customer Module

### Status: PARTIAL MISMATCH - MIGRATION APPLIED

**Frontend Types:** `src/types/customer.ts`

**Database Schema:** `customers` table now exists with `profile_id` foreign key. Migration `20260602_customer_module_only.sql` was successfully applied on 2026-06-03.

**Architecture Decision:** Customer is a CRM layer that links to Profile via `profile_id`. Relationship model: Customer → Profile → Bookings → Contracts → Payments. See `/docs/ARCHITECTURE_DECISIONS.md` Decision 1.

### Type Comparison

| Frontend Interface | Database Table | Status | Mismatch Details |
|--------------------|----------------|--------|-------------------|
| `Customer`          | `customers` table | MISMATCH | Frontend uses `fullName`, `customerType`, `lifecycleStatus` - database uses `profile_id` (links to Profile), `customer_type`, `lifecycle_status` (snake_case) |
| `CustomerType`       | Enum `customer_type` | MATCH | Frontend: `'tenant' \| 'renter' \| 'buyer' \| 'guest'` - Database: `'tenant' \| 'renter' \| 'buyer' \| 'guest'` |
| `LifecycleStatus`   | Enum `lifecycle_status` | MATCH | Frontend: `'lead' \| 'active' \| 'inactive' \| 'suspended'` - Database: `'lead' \| 'active' \| 'inactive' \| 'suspended'` |
| `BookingSummary`     | `bookings` table        | MISMATCH | Frontend uses display strings (`property: string`) - database uses `property_id: string` |
| `PaymentSummary`     | `payments` table        | MISMATCH | Frontend uses `amountCents`, `type: 'rent'\|'deposit'\|'other'` - database uses `amount: number`, `reference_type: 'booking'\|'rent'` |
| `ContractSummary`    | `contracts` table      | MISMATCH | Frontend uses `rentCents` - database uses `monthly_rent: number` (not in cents) |
| `PropertySummary`    | `properties` table     | MISMATCH | Frontend uses display strings - database uses property IDs |
| `CustomerMetrics`    | `customer_metrics_view` | MISMATCH | Frontend metrics structure doesn't match database view (view exists but needs alignment) |
| `TimelineEvent`      | Aggregated from multiple tables | MISMATCH | Event types don't match database trigger/event system |

### Required Actions

1. **Refactor frontend interfaces** to use `profile_id` instead of inline user data, join with Profile for full_name
2. **Refactor frontend interfaces** to use database IDs instead of display strings
3. **Update CustomerMetrics interface** to match database view structure
4. **Implement timeline event system** using database triggers or event logging table

---

## 2. Payment Module

### Status: PARTIAL MISMATCH - ENUM CHANGES APPLIED

**Frontend Types:** `frontend/src/types/payment.ts`

**Database Schema:** `payments` table exists with partial alignment

**Architecture Decision:** Payment state machine has 8 states: pending → submitted → under_review → verified → completed, with terminal states failed/cancelled/refunded. See `/docs/ARCHITECTURE_DECISIONS.md` Decision 3.

**Migration Status:** The payment_status enum changes (adding 'under_review' and 'refunded') were successfully applied on 2026-06-03.

### Type Comparison

| Frontend Interface | Database Table | Status | Mismatch Details |
|--------------------|----------------|--------|-------------------|
| `PaymentMethodId` | `payment_method` enum | MISMATCH | Frontend: `'card' \| 'zaad' \| 'edahab' \| 'premier_wallet' \| 'wadaag_pay'` - Database: `'platform' \| 'zaad' \| 'edahab' \| 'cash'` |
| `PaymentProvider` | `payment_provider` (column) | MISMATCH | Frontend has specific providers - database stores as string in `payments` table |
| `PaymentStatus` | `payment_status` enum | MATCH | Frontend: `'pending' \| 'submitted' \| 'verified' \| 'completed' \| 'failed' \| 'cancelled'` - Database: Now includes `'under_review'` and `'refunded'` |
| `PaymentRecord` | `payments` table Row | MISMATCH | Frontend uses `booking_id`, `wallet_phone` - database uses `reference_id`, `reference_type`, `payee_id`, `payer_id` |
| `BookingPaymentDetails` | Computed from `bookings` + `properties` | MISMATCH | Frontend has specific structure - no database view exists |
| `PaymentSummary` | Computed from `payments` | MISMATCH | Frontend uses `subtotal`, `cleaningFee`, `serviceFee` - database stores single `amount` |

### Required Actions

1. **Update `payment_method` enum** to include `'card'` and remove `'cash'` if not needed
2. **Create database view** for booking payment details
3. **Refactor `PaymentRecord`** to align with database schema (use `reference_id`/`reference_type` pattern)
4. **Implement payment calculation logic** for subtotal/fees in service layer
5. **Document state transition rules** in service layer to enforce valid transitions

---

## 3. Property Module

### Status: PARTIAL MISMATCH

**Frontend Types:** `frontend/src/types/property.ts`

**Database Schema:** `properties` table exists with related tables (`property_addresses`, `property_pricing`, `property_features`)

**Architecture Decision:** Property status is lifecycle-only (draft, pending_approval, active, archived). Availability is handled separately via availability_blocks, bookings, contracts, and units tables. Property types limited to 10 MVP types for Somaliland market. See `/docs/ARCHITECTURE_DECISIONS.md` Decisions 2 and 5.

### Type Comparison

| Frontend Interface | Database Table | Status | Mismatch Details |
|--------------------|----------------|--------|-------------------|
| `Property` | `properties` + related tables | MISMATCH | Frontend has nested objects - database has separate tables with foreign keys |
| `PropertyAddress` | `property_addresses` table | MISMATCH | Frontend has `state`, `postal_code` - database has `district`, `region` |
| `PropertyPricing` | `property_pricing` table | MISMATCH | Frontend has `pricing_type: 'nightly'\|'monthly'\|'sale'` - database uses `price_unit: 'total'\|'per_night'\|'per_month'` |
| `PropertyFeatures` | `property_features` table | PARTIAL | Frontend has `amenities: string[]`, `rules: string[]` - database has `amenities: Json`, `rules: Json` |
| `PropertyType` | `property_type` enum | MISMATCH | Frontend includes `'studio'`, `'condo'`, etc. - Database: Limited to 10 MVP types (house, apartment, villa, room, hotel, guest_house, shop, office, warehouse, land) |
| `PropertyStatus` | `property_status` enum | MISMATCH | Frontend: `'available' \| 'occupied' \| 'maintenance' \| 'pending' \| 'inactive'` - Database: Lifecycle-only (`'draft' \| 'pending_approval' \| 'active' \| 'archived'`) |

### Required Actions

1. **Update `property_type` enum** to use MVP set: `'house'`, `'apartment'`, `'villa'`, `'room'`, `'hotel'`, `'guest_house'`, `'shop'`, `'office'`, `'warehouse'`, `'land'`
2. **Keep `property_status` enum** as lifecycle-only: `'draft'`, `'pending_approval'`, `'active'`, `'archived'` - do NOT add availability values
3. **Create service layer mapping** to transform database flat structure to nested frontend objects
4. **Standardize pricing type enum** to match database `price_unit`
5. **Update address structure** to match database schema (use `district`/`region` instead of `state`/`postal_code`)
6. **Implement availability service** separately using `availability_blocks` table (not property status)

---

## 4. Messaging Module

### Status: NOT IMPLEMENTED IN FRONTEND

**Database Schema:** `conversations`, `conversation_participants`, `messages`, `message_attachments` tables exist

**Frontend Status:** No TypeScript types or services found

### Required Actions

1. **Create frontend types** for messaging module matching database schema
2. **Implement messaging service** using Supabase Realtime for real-time updates
3. **Map database enums** to frontend types (`conversation_type`, `conversation_status`, `conversation_priority`, `message_content_type`)

---

## 5. RMS Module (Rent Management System)

### Status: NOT IMPLEMENTED IN FRONTEND

**Database Schema:** `buildings`, `units`, `tenants`, `contracts` tables exist

**Frontend Status:** No TypeScript types or services found

### Required Actions

1. **Create frontend types** for RMS module matching database schema
2. **Implement RMS services** for building/unit/tenant/contract management
3. **Map database enums** to frontend types (`unit_status`, `unit_type`, `contract_status`)

---

## 6. Organizations & Subscriptions Module

### Status: NOT IMPLEMENTED IN FRONTEND

**Database Schema:** `organizations`, `organization_users`, `subscriptions` tables exist (from migration)

**Architecture Decision:** Use `organization_users` table (not `organization_members`) for consistency with Supabase Auth naming conventions. See `/docs/ARCHITECTURE_DECISIONS.md` Decision 4.

**Frontend Status:** No TypeScript types or services found

### Required Actions

1. **Create frontend types** for organizations and subscriptions using `organization_users` table
2. **Implement organization service** for multi-tenant management using `organization_users` table
3. **Implement subscription service** for SaaS billing
4. **Map database enums** to frontend types (`subscriber_type`, `subscription_status`, `organization_role`)

---

## 7. Commissions Module

### Status: NOT IMPLEMENTED IN FRONTEND

**Database Schema:** `commissions` table exists (from migration)

**Frontend Status:** No TypeScript types or services found

### Required Actions

1. **Create frontend types** for commissions
2. **Implement commission service** for agent/host payouts
3. **Map database enum** (`commission_source`)

---

## 8. Maintenance Module

### Status: NOT IMPLEMENTED IN FRONTEND

**Database Schema:** `maintenance_requests` table exists (from migration)

**Frontend Status:** No TypeScript types or services found

### Required Actions

1. **Create frontend types** for maintenance requests
2. **Implement maintenance service** for property maintenance tracking
3. **Map database enums** (`maintenance_priority`, `maintenance_status`)

---

## 9. Booking Guests Module

### Status: NOT IMPLEMENTED IN FRONTEND

**Database Schema:** `booking_guests` table exists (from migration)

**Frontend Status:** No TypeScript types or services found

### Required Actions

1. **Create frontend types** for booking guests
2. **Implement booking guests service** for multi-guest bookings
3. **Integrate with existing booking service**

---

## Summary Statistics

| Module | Frontend Types       | Database Schema | Alignment Status    |
|--------|---------------|-----------------|------------------|
| Customer | ✅ Exists | ⏳ Pending migration | CRITICAL MISMATCH |
| Payment | ✅ Exists | ✅ Exists | PARTIAL MISMATCH |
| Property | ✅ Exists | ✅ Exists | PARTIAL MISMATCH |
| Messaging | ❌ Missing | ✅ Exists | NOT IMPLEMENTED |
| RMS | ❌ Missing | ✅ Exists | NOT IMPLEMENTED |
| Organizations | ❌ Missing | ✅ Exists | NOT IMPLEMENTED |
| Subscriptions | ❌ Missing | ✅ Exists | NOT IMPLEMENTED |
| Commissions | ❌ Missing | ✅ Exists | NOT IMPLEMENTED |
| Maintenance | ❌ Missing | ✅ Exists | NOT IMPLEMENTED |
| Booking Guests | ❌ Missing | ✅ Exists | NOT IMPLEMENTED |

---

## Recommendations

1. **Immediate Priority:** Apply migration `20260602_missing_modules.sql` to create missing tables
2. **Type Harmonization:** Create a centralized type generation script that maps Supabase types to frontend interfaces
3. **Enum Standardization:** Align all frontend enums with database enums, adding missing values to database where needed
4. **Service Layer Pattern:** Implement repository pattern to transform database rows to frontend domain objects
5. **Incremental Migration:** Start with Customer module (highest mismatch), then Property, then Payment
6. **Type Safety:** Use Supabase-generated types as source of truth, derive frontend types from them

---

## Next Steps

1. Review and approve this type mismatch report
2. Proceed to MOCK_SERVICE_AUDIT.md to identify which services need migration
3. Review SERVICE_MIGRATION_PLAN.md for detailed migration sequence
4. Begin type harmonization before service replacement
