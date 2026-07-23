# Customer Domain Model Documentation

**Created:** 2026-06-03
**Purpose:** Source of truth for Customer capability architecture

---

## Overview

This document defines the Customer domain model, which abstracts the database schema from the UI. This critical architectural decision prevents database schema changes from breaking the frontend.

---

## 1. Architecture Layers

```
Supabase Row (Database)
  ↓
Repository (Data Access)
  ↓
Mapper (Transformation)
  ↓
Domain Model (Business Logic)
  ↓
Service (Business Logic)
  ↓
Hook (State Management)
  ↓
UI (Presentation)
```

**Key Principle:** UI components never consume database rows directly. They always consume domain entities.

---

## 2. Database Row Structure

### 2.1 customers Table

```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  customer_type customer_type NOT NULL,
  lifecycle_status lifecycle_status NOT NULL,
  current_property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  notes TEXT,
  tags JSONB,
  total_bookings INTEGER,
  total_rent_paid NUMERIC,
  currency VARCHAR,
  last_activity_at TIMESTAMP,
  preferences JSONB,
  metadata JSONB,
  deleted_at TIMESTAMP,
  deleted_by UUID,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2.2 Database Types (snake_case)

- `customer_type`: enum (tenant, renter, buyer, guest)
- `lifecycle_status`: enum (lead, active, inactive, suspended)
- `profile_id`: UUID foreign key
- `created_at`: timestamp
- `updated_at`: timestamp
- `deleted_at`: timestamp (soft delete)

### 2.3 Relationships

- Customer → Profile (1:1 via profile_id)
- Customer → Bookings (1:N via customer_id in bookings)
- Customer → Payments (1:N via bookings → payments)
- Customer → Contracts (1:N via bookings → contracts)
- Customer → Property (N:1 via current_property_id)

---

## 3. Domain Structure

### 3.1 Customer Domain Entity

```typescript
interface Customer {
  id: string;
  profileId: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  customerType: CustomerType;
  lifecycleStatus: LifecycleStatus;
  currentPropertyId: string | null;
  currentPropertyName: string | null;
  notes: string | null;
  tags: string[];
  totalBookings: number;
  totalRentPaid: number;
  currency: string;
  lastActivityAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.2 Domain Types (camelCase)

- `customerType`: enum (Tenant, Renter, Buyer, Guest)
- `lifecycleStatus`: enum (Lead, Active, Inactive, Suspended)
- `profileId`: string
- `createdAt`: Date
- `updatedAt`: Date
- `lastActivityAt`: Date | null

### 3.3 Domain Enums

```typescript
enum CustomerType {
  TENANT = 'tenant',
  RENTER = 'renter',
  BUYER = 'buyer',
  GUEST = 'guest',
}

enum LifecycleStatus {
  LEAD = 'lead',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}
```

---

## 4. Mapper Rules

### 4.1 Transformation Direction

**Database → Domain (toDomain):**
- snake_case → camelCase
- string enums → TypeScript enums
- JSONB → parsed objects/arrays
- timestamps → Date objects
- null → null | undefined
- profile_id → profileId + fullName + phone + avatarUrl (from Profile join)

**Domain → Database (toInsert/toUpdate):**
- camelCase → snake_case
- TypeScript enums → string enums
- objects/arrays → JSONB strings
- Date objects → ISO strings
- null → null
- profileId → profile_id

### 4.2 Field Mapping

| Database Field | Domain Field | Transformation |
|----------------|-------------|----------------|
| customer_type | customerType | Enum mapping |
| lifecycle_status | lifecycleStatus | Enum mapping |
| profile_id | profileId | Direct copy |
| - | fullName | From profile.full_name |
| - | phone | From profile.phone |
| - | avatarUrl | From profile.avatar_url |
| current_property_id | currentPropertyId | Direct copy |
| - | currentPropertyName | From property join (service) |
| notes | notes | Direct copy |
| tags | tags | JSONB → array |
| total_bookings | totalBookings | Direct copy |
| total_rent_paid | totalRentPaid | Direct copy |
| currency | currency | Direct copy |
| last_activity_at | lastActivityAt | String → Date |
| created_at | createdAt | String → Date |
| updated_at | updatedAt | String → Date |

### 4.3 Enum Mapping

**Customer Type:**
- Database: 'tenant' → Domain: CustomerType.TENANT
- Database: 'renter' → Domain: CustomerType.RENTER
- Database: 'buyer' → Domain: CustomerType.BUYER
- Database: 'guest' → Domain: CustomerType.GUEST

**Lifecycle Status:**
- Database: 'lead' → Domain: LifecycleStatus.LEAD
- Database: 'active' → Domain: LifecycleStatus.ACTIVE
- Database: 'inactive' → Domain: LifecycleStatus.INACTIVE
- Database: 'suspended' → Domain: LifecycleStatus.SUSPENDED

### 4.4 Special Transformations

**Tags:**
- Database: JSONB array or string
- Domain: string[]
- Parser: Handles both JSON string and array formats

**Profile Data:**
- Database: profile_id only
- Domain: profileId + fullName + phone + avatarUrl
- Source: Profile table join in repository

**Property Name:**
- Database: current_property_id only
- Domain: currentPropertyId + currentPropertyName
- Source: Property table join in service (lazy loading)

---

## 5. Lifecycle Rules

### 5.1 State Machine

```
Lead
  ↓ (first booking)
Active
  ↓ (90 days inactivity)
Inactive
  ↓ (new booking)
Active
  ↓ (admin action)
Suspended
  ↓ (admin action)
Active
```

### 5.2 Valid Transitions

| From | To | Trigger | Auto/Manual |
|------|---|--------|------------|
| Lead | Active | First booking | Auto |
| Active | Inactive | 90 days inactivity | Auto |
| Inactive | Active | New booking | Auto |
| Active | Suspended | Admin action | Manual |
| Suspended | Active | Admin action | Manual |

### 5.3 Lifecycle Methods

**CustomerLifecycle class:**
- `canTransition(from, to)`: Check if transition is valid
- `canActivate(currentStatus)`: Check if can activate
- `canSuspend(currentStatus)`: Check if can suspend
- `canRestore(currentStatus)`: Check if can restore
- `canDeactivate(currentStatus)`: Check if can deactivate
- `transition(currentStatus, targetStatus)`: Attempt transition
- `onBookingCreated(currentStatus)`: Auto-transition on booking
- `onInactivityCheck(currentStatus, daysSinceLastActivity)`: Auto-transition on inactivity

### 5.4 Transition Reasons

- `FIRST_BOOKING`: Lead → Active
- `NO_ACTIVITY`: Active → Inactive
- `NEW_BOOKING`: Inactive → Active
- `PAYMENT_ISSUE`: Active → Suspended
- `POLICY_VIOLATION`: Active → Suspended
- `ISSUE_RESOLVED`: Suspended → Active
- `MANUAL`: Manual admin action

---

## 6. Metrics Rules

### 6.1 Metrics Calculation

**CustomerMetricsCalculator class:**
- `calculateMetrics(bookings, payments, contracts)`: Calculate all metrics
- `calculateOutstandingBalance(contracts, payments)`: Calculate balance
- `calculateLastActivityDate(bookings, payments)`: Find last activity
- `calculateDaysSinceLastActivity(lastActivityDate)`: Days since activity
- `isInactive(lastActivityDate)`: Check if inactive (90+ days)
- `calculateHealthScore(metrics)`: Calculate health score (0-100)
- `getHealthStatus(score)`: Get health status (excellent/good/fair/poor)

### 6.2 Metrics Fields

```typescript
interface CustomerMetrics {
  totalBookings: number;
  activeContracts: number;
  totalPaid: number;
  outstandingBalance: number;
  lastActivityDate: Date | null;
  lastPaymentAmount: number | null;
  lastPaymentDate: Date | null;
  currentProperty: string | null;
  currentPropertyUnit: string | null;
}
```

### 6.3 Calculation Rules

**Total Bookings:** Count of all bookings

**Active Contracts:** Count of contracts with status 'active'

**Total Paid:** Sum of all payment amounts

**Outstanding Balance:** 
- Sum of monthly rent from active contracts
- Minus sum of all payments
- Minimum 0

**Last Activity Date:**
- Max of booking start/end dates
- Max of payment dates

**Health Score (0-100):**
- Start at 100
- Deduct for outstanding balance (max -30)
- Deduct for inactivity (max -20)
- Boost for active contracts (+10)
- Boost for recent payments (+10)

---

## 7. Service Contracts

### 7.1 CustomerService Methods

**Read Operations:**
- `listCustomers(filters, pagination)`: List customers with filters
- `getCustomer(id)`: Get single customer
- `getCustomerMetrics(id)`: Get customer metrics
- `getCustomerHistory(id)`: Get booking/payment/contract history
- `searchCustomers(query, pagination)`: Search customers

**Write Operations:**
- `createCustomer(input)`: Create new customer
- `updateCustomer(id, input)`: Update customer
- `deleteCustomer(id)`: Soft delete customer
- `suspendCustomer(id, reason)`: Suspend customer
- `restoreCustomer(id)`: Restore suspended customer

**Lifecycle Operations:**
- `updateLifecycleStatus(id, status)`: Update lifecycle status
- `transitionLifecycle(id, targetStatus)`: Transition lifecycle state

### 7.2 Service Return Types

All service methods return domain entities, not database rows:

```typescript
// ✅ Correct
async getCustomer(id: string): Promise<Customer>

// ❌ Incorrect
async getCustomer(id: string): Promise<Database['public']['Tables']['customers']['Row']>
```

### 7.3 Service Error Handling

- Repository errors caught and re-thrown with context
- User-friendly error messages
- Validation errors returned clearly
- Permission errors indicate required role

---

## 8. UI Contracts

### 8.1 UI Components Consume

UI components consume domain types from hooks:

```typescript
// ✅ Correct
const { customer } = useCustomer(id);
// customer is of type Customer

// ❌ Incorrect
const { customer } = useCustomer(id);
// customer is of type Database['public']['Tables']['customers']['Row']
```

### 8.2 Hook Return Types

All hooks return domain entities:

```typescript
// useCustomers
interface UseCustomersReturn {
  customers: Customer[];
  loading: boolean;
  error: Error | null;
  total: number;
  page: number;
  pageSize: number;
  refetch: () => void;
}

// useCustomer
interface UseCustomerReturn {
  customer: Customer | null;
  metrics: CustomerMetrics | null;
  history: CustomerHistory | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}
```

### 8.3 Component Props

Component props use domain types:

```typescript
// ✅ Correct
interface CustomerCardProps {
  customer: Customer;
  onEdit: (id: string) => void;
}

// ❌ Incorrect
interface CustomerCardProps {
  customer: Database['public']['Tables']['customers']['Row'];
  onEdit: (id: string) => void;
}
```

---

## 9. File Structure

```
frontend/src/domain/customer/
├── CustomerTypes.ts          # Domain type definitions
├── CustomerLifecycle.ts      # Lifecycle state machine
├── CustomerMetrics.ts        # Metrics calculator
├── CustomerMapper.ts         # Row to domain transformation
└── index.ts                  # Barrel export (optional)

frontend/src/repositories/
└── customerRepository.ts     # Database operations

frontend/src/services/
└── customerService.ts        # Business logic

frontend/src/hooks/
├── useCustomers.ts           # Customer list hook
└── useCustomer.ts            # Customer detail hook

frontend/src/pages/
├── customers/
│   ├── index.tsx             # Customer list page
│   └── [id]/
│       └── index.tsx         # Customer detail page
```

---

## 10. Key Principles

### 10.1 Abstraction

- UI never sees database rows
- Database schema changes isolated to mapper
- Domain entities stable across schema changes

### 10.2 Type Safety

- All database operations use Supabase types
- All domain operations use domain types
- Mapper ensures type-safe transformations
- No `any` types in domain layer

### 10.3 Single Responsibility

- Repository: Data access only
- Mapper: Transformation only
- Service: Business logic only
- Hook: State management only
- UI: Presentation only

### 10.4 Testability

- Domain entities pure (no dependencies)
- Mapper pure (transformations only)
- Lifecycle logic pure (state machine)
- Metrics logic pure (calculations only)

---

## 11. Migration Path

### 11.1 Current State

- customerRepository: ✅ Complete
- Domain layer: ✅ Complete
- customerService: ❌ Uses mock data
- Hooks: ❌ Not created
- Pages: ❌ Use mock data

### 11.2 Migration Steps

1. ✅ Create domain layer (CustomerTypes, CustomerLifecycle, CustomerMetrics, CustomerMapper)
2. ⏳ Refactor customerService to use repository and domain types
3. ⏳ Create useCustomers hook
4. ⏳ Create useCustomer hook
5. ⏳ Migrate Customer List Page
6. ⏳ Migrate Customer Detail Page
7. ⏳ Migrate Customer Edit Flow
8. ⏳ Remove mock data from customerService
9. ⏳ Verify RLS permissions
10. ⏳ Run build and type check

---

## 12. Success Criteria

Domain layer is complete when:

1. ✅ All domain types defined
2. ✅ Mapper transforms correctly both directions
3. ✅ Lifecycle logic centralized
4. ✅ Metrics logic centralized
5. ✅ No database types in domain layer
6. ✅ No domain types in repository
7. ✅ Service returns domain entities
8. ✅ Hooks return domain entities
9. ✅ Components consume domain entities
10. ✅ Build passes without errors
11. ✅ Type check passes without errors

---

## 13. References

- `/docs/CUSTOMER_CAPABILITY_SPEC.md` - Complete capability specification
- `/docs/ARCHITECTURE_DECISIONS.md` - Architecture decisions
- `/docs/TYPE_MISMATCH_REPORT.md` - Type audit report
- `supabase/migrations/20260602_customer_module_only.sql` - Database schema
