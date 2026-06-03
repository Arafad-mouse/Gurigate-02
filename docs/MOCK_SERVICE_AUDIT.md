# Mock Service Audit

**Generated:** 2026-06-02
**Scope:** Audit of all frontend services to identify mock data usage
**Purpose:** Identify which services are using mock data and require Supabase migration

---

## Executive Summary

This audit identifies all frontend services and their data sources. Currently, 3 services are fully mock-based, 2 services are partially connected to Supabase, and 7 modules have no service implementation. Critical mock dependencies exist in the Customer module which blocks production readiness.

---

## Service Inventory

### 1. Customer Service

**File:** `src/services/customerService.ts`

**Status:** FULLY MOCK

**Data Source:** In-memory `MOCK_CUSTOMERS` array

**Functions Audit:**

| Function | Data Source | Mock Status | Dependencies |
|----------|-------------|-------------|--------------|
| `listCustomers` | MOCK_CUSTOMERS array | ✅ Mock | None |
| `getCustomer` | MOCK_CUSTOMERS array | ✅ Mock | None |
| `getCustomerOverview` | MOCK_CUSTOMERS + `mockMetricsFor` | ✅ Mock | None |
| `getCustomerBookings` | Generated mock data | ✅ Mock | None |
| `getCustomerPayments` | Generated mock data | ✅ Mock | None |
| `getCustomerContracts` | Generated mock data | ✅ Mock | None |
| `getCustomerProperties` | Generated mock data | ✅ Mock | None |
| `getCustomerTimeline` | Aggregated mock data | ✅ Mock | None |
| `getCustomerDashboardMetrics` | MOCK_CUSTOMERS aggregation | ✅ Mock | None |
| `createCustomer` | MOCK_CUSTOMERS array mutation | ✅ Mock | None |
| `updateCustomer` | MOCK_CUSTOMERS array mutation | ✅ Mock | None |
| `sendMessage` | Console.log only | ✅ Mock | None |
| `assignProperty` | Console.log only | ✅ Mock | None |
| `createContract` | Console.log only | ✅ Mock | None |
| `suspendCustomer` | Console.log only | ✅ Mock | None |
| `exportCSV` | MOCK_CUSTOMERS array | ✅ Mock | None |
| `subscribeToCustomer` | Empty placeholder | ✅ Mock | None |
| `subscribeToPayments` | Empty placeholder | ✅ Mock | None |
| `subscribeToBookings` | Empty placeholder | ✅ Mock | None |

**Mock Data Size:** 24 customer records

**Failure Injection:** Dev-only failure injection via `?fail=` query parameter

**Critical Issues:**

- No database persistence - all data lost on refresh
- No RLS security - all data accessible to all users
- No real-time updates - subscriptions are empty placeholders
- No relationship integrity - foreign keys are fake IDs
- No business logic enforcement - all mutations bypass validation

**Migration Priority:** CRITICAL (blocks CRM module)

---

### 2. Property Service (guriGateProperties)

**File:** `frontend/src/services/guriGateProperties.ts`

**Status:** PARTIALLY CONNECTED

**Data Source:** Supabase `properties` table with type conversion

**Functions Audit:**

| Function | Data Source | Mock Status | Dependencies |
|----------|-------------|-------------|--------------|
| `getFeaturedProperties` | Supabase `properties` table | ❌ Real | `properties`, `locations`, `property_images` |
| `getPropertiesByCity` | Supabase `properties` table | ❌ Real | `properties`, `locations`, `property_images` |
| `getAllProperties` | Supabase `properties` table | ❌ Real | `properties`, `locations`, `property_images` |
| `searchProperties` | Supabase `properties` table | ❌ Real | `properties`, `locations`, `property_images` |
| `getPropertyById` | Supabase `properties` table | ❌ Real | `properties`, `locations`, `property_images` |
| `incrementViewCount` | Console.log only | ✅ Mock | None |
| `toggleWishlist` | Supabase `wishlists` table | ❌ Real | `wishlists`, auth |

**Type Conversion:** Converts database rows to `LandingProperty` format via `convertToLandingProperty`

**Critical Issues:**

- `incrementViewCount` is a no-op (console.log only)
- Type conversion layer creates potential data loss
- No error handling for missing relationships
- No caching strategy for frequent queries

**Migration Priority:** LOW (already functional, needs optimization)

---

### 3. Property Service (properties)

**File:** `frontend/src/services/properties.ts`

**Status:** PARTIALLY CONNECTED

**Data Source:** Supabase `properties` table with nested table inserts

**Functions Audit:**

| Function | Data Source | Mock Status | Dependencies |
|----------|-------------|-------------|--------------|
| `createProperty` | Supabase `properties` + related tables | ❌ Real | `properties`, `property_addresses`, `property_pricing`, `property_features`, auth |
| `getFeaturedProperties` | Supabase `featured_properties` view | ❌ Real | `featured_properties` view |
| `getPropertiesByCity` | Supabase `featured_properties` view | ❌ Real | `featured_properties` view |
| `getUserProperties` | Supabase `properties` table | ❌ Real | `properties`, auth |
| `getPropertyById` | Supabase `properties` table | ❌ Real | `properties` |
| `updateProperty` | Supabase `properties` table | ❌ Real | `properties` |
| `deleteProperty` | Supabase `properties` table | ❌ Real | `properties` |
| `uploadPropertyImage` | Supabase Storage | ❌ Real | `property-images` bucket |
| `validatePropertyData` | Pure validation function | ❌ Real | None |

**Critical Issues:**

- Uses `featured_properties` view which may not exist in current schema
- No transaction handling for multi-table inserts in `createProperty`
- No rollback on partial failure
- Image upload uses hardcoded bucket name

**Migration Priority:** MEDIUM (needs transaction handling)

---

### 4. Payment Service

**File:** `frontend/src/services/paymentService.ts`

**Status:** PARTIALLY CONNECTED WITH FALLBACK

**Data Source:** Supabase `payments` table + RPC function + mock fallback

**Functions Audit:**

| Function | Data Source | Mock Status | Dependencies |
|----------|-------------|-------------|--------------|
| `createWalletPayment` | Supabase RPC `create_local_wallet_payment` | ⚠️ Hybrid | `payments` table, RPC function, validation |
| `createDodoCheckout` | Supabase Edge Function `create-dodo-checkout` | ⚠️ Hybrid | Edge Function, `payments` table, auth |

**Fallback Behavior:**

- Falls back to `createMockWalletPayment` when:
  - Supabase not configured
  - `bookingId` missing
  - RPC call fails

**Mock Data:** Generated UUID-based mock records with metadata indicating reason

**Critical Issues:**

- No error boundary for RPC failures
- Mock fallback silently degrades functionality
- No retry logic for transient failures
- Edge function dependency not validated

**Migration Priority:** MEDIUM (functional but needs error handling)

---

## Not Implemented Modules

### 5. Messaging Service

**Status:** NOT IMPLEMENTED

**Database Tables:** `conversations`, `conversation_participants`, `messages`, `message_attachments`

**Required Functions:**

- `getConversations` - List user conversations
- `getConversationMessages` - Get messages for a conversation
- `sendMessage` - Send new message
- `uploadAttachment` - Upload file attachment
- `markAsRead` - Mark messages as read
- `subscribeToConversation` - Real-time message updates

**Migration Priority:** HIGH (communication module)

---

### 6. RMS Service (Rent Management System)

**Status:** NOT IMPLEMENTED

**Database Tables:** `buildings`, `units`, `tenants`, `contracts`

**Required Functions:**

- `getBuildings` - List buildings
- `getUnits` - List units for a building
- `getTenants` - List tenants
- `getContracts` - List contracts
- `createContract` - Create new contract
- `updateContract` - Update contract
- `terminateContract` - Terminate active contract

**Migration Priority:** HIGH (RMS module)

---

### 7. Organizations Service

**Status:** NOT IMPLEMENTED

**Database Tables:** `organizations`, `organization_members`

**Required Functions:**

- `getOrganizations` - List user organizations
- `createOrganization` - Create new organization
- `inviteMember` - Invite member to organization
- `updateMemberRole` - Update member role
- `removeMember` - Remove member from organization

**Migration Priority:** MEDIUM (SaaS multi-tenancy)

---

### 8. Subscriptions Service

**Status:** NOT IMPLEMENTED

**Database Tables:** `subscriptions`, `subscription_plans`

**Required Functions:**

- `getSubscriptions` - List subscriptions
- `createSubscription` - Create new subscription
- `updateSubscription` - Update subscription
- `cancelSubscription` - Cancel subscription
- `getSubscriptionMetrics` - Get subscription analytics

**Migration Priority:** MEDIUM (SaaS billing)

---

### 9. Commissions Service

**Status:** NOT IMPLEMENTED

**Database Tables:** `commissions`

**Required Functions:**

- `getCommissions` - List commissions
- `createCommission` - Create commission record
- `updateCommissionStatus` - Update commission status
- `getCommissionMetrics` - Get commission analytics

**Migration Priority:** LOW (finance module)

---

### 10. Maintenance Service

**Status:** NOT IMPLEMENTED

**Database Tables:** `maintenance_requests`

**Required Functions:**

- `getMaintenanceRequests` - List maintenance requests
- `createMaintenanceRequest` - Create new request
- `updateRequestStatus` - Update request status
- `assignTechnician` - Assign technician to request

**Migration Priority:** LOW (operations module)

---

### 11. Booking Guests Service

**Status:** NOT IMPLEMENTED

**Database Tables:** `booking_guests`

**Required Functions:**

- `getBookingGuests` - List guests for a booking
- `addBookingGuest` - Add guest to booking
- `removeBookingGuest` - Remove guest from booking
- `updateGuestDetails` - Update guest information

**Migration Priority:** LOW (booking enhancement)

---

## Summary Statistics

| Service | Status | Mock Functions | Real Functions | Total Functions |
|---------|--------|----------------|----------------|-----------------|
| Customer Service | FULLY MOCK | 19 | 0 | 19 |
| guriGateProperties | PARTIAL | 1 | 6 | 7 |
| properties | PARTIAL | 0 | 9 | 9 |
| paymentService | HYBRID | 1 (fallback) | 2 | 2 |
| Messaging | NOT IMPLEMENTED | 0 | 0 | 0 |
| RMS | NOT IMPLEMENTED | 0 | 0 | 0 |
| Organizations | NOT IMPLEMENTED | 0 | 0 | 0 |
| Subscriptions | NOT IMPLEMENTED | 0 | 0 | 0 |
| Commissions | NOT IMPLEMENTED | 0 | 0 | 0 |
| Maintenance | NOT IMPLEMENTED | 0 | 0 | 0 |
| Booking Guests | NOT IMPLEMENTED | 0 | 0 | 0 |
| **TOTAL** | - | **21** | **17** | **38** |

---

## Critical Mock Data Flows

### Customer Module Data Flow

```
UI Component → customerService → MOCK_CUSTOMERS array → UI Display
                                                    ↓
                                              No persistence
```

**Impact:** No customer data survives page refresh, blocking all CRM functionality

### Payment Module Fallback Flow

```
UI Component → paymentService → Supabase RPC
                                    ↓ (fail)
                              createMockWalletPayment
                                    ↓
                              Mock payment record
```

**Impact:** Silent degradation to mock mode without user awareness

---

## Mock Data Cleanup Requirements

### Customer Service

**Files to modify:**
- `src/services/customerService.ts` - Replace all mock functions with Supabase calls
- `src/types/customer.ts` - Align types with database schema

**Mock code to remove:**
- `MOCK_CUSTOMERS` array (lines 23-35)
- `mockMetricsFor` function (lines 37-67)
- `shouldFail` function (lines 14-20)
- All in-memory array mutations

**Supabase calls to add:**
- `supabase.from('customers').select()`
- `supabase.from('customers').insert()`
- `supabase.from('customers').update()`
- `supabase.from('bookings').select()` for customer bookings
- `supabase.from('payments').select()` for customer payments
- `supabase.from('contracts').select()` for customer contracts
- Supabase Realtime subscriptions

### Payment Service

**Files to modify:**
- `frontend/src/services/paymentService.ts` - Remove mock fallback

**Mock code to remove:**
- `createMockWalletPayment` function (lines 61-82)
- Fallback logic in `createWalletPayment` (lines 95-97)

**Supabase improvements:**
- Add error boundaries
- Add retry logic
- Remove silent fallback

### Property Service

**Files to modify:**
- `frontend/src/services/properties.ts` - Add transaction handling

**Improvements needed:**
- Add Supabase transaction for `createProperty`
- Implement `incrementViewCount` with actual database update
- Validate view existence before query

---

## Recommendations

1. **Immediate Priority:** Migrate Customer Service (highest mock dependency)
2. **Remove Silent Fallbacks:** Payment service should fail explicitly rather than degrading to mock
3. **Add Transaction Support:** Property service multi-table inserts need transaction handling
4. **Implement Missing Modules:** Prioritize Messaging and RMS services
5. **Add Integration Tests:** Each migrated service needs test coverage
6. **Monitor Rollout:** Use feature flags to gradually roll out migrated services
7. **Data Migration Plan:** Plan migration of any existing mock data to database

---

## Exit Criteria for Mock Removal

A service is considered fully migrated when:

- ✅ No mock data arrays or in-memory storage
- ✅ All functions use Supabase queries/RPCs
- ✅ Real-time subscriptions use Supabase Realtime
- ✅ Error handling is explicit (no silent fallbacks)
- ✅ RLS policies enforce security
- ✅ Integration tests pass
- ✅ TypeScript types match database schema
- ✅ No console.log-only implementations

---

## Next Steps

1. Review and approve this mock service audit
2. Review SERVICE_MIGRATION_PLAN.md for detailed migration sequence
3. Begin with Customer Service migration (highest priority)
4. Generate Service Migration Report after each service replacement
