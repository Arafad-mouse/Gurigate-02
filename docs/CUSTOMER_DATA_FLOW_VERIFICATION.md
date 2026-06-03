# Customer Data Flow Verification

**Created:** 2026-06-03
**Purpose:** Verify all customer data flows use real database data

---

## Data Flow Architecture

### Layer 1: Database (Supabase)

**Tables:**
- `customers` - Customer records
- `profiles` - User profiles (joined)
- `bookings` - Booking records (joined for history)
- `payments` - Payment records (joined for history)
- `contracts` - Contract records (joined for history)

**Access Method:** Supabase client via `customerRepository`

---

### Layer 2: Repository

**File:** `frontend/src/repositories/customerRepository.ts`

**Responsibilities:**
- Direct database queries
- Row-level data fetching
- Join operations (customers + profiles)
- Pagination handling

**Methods:**
- `listCustomers()` - Fetch customer list with pagination
- `getCustomerById()` - Fetch single customer
- `getCustomerWithBookings()` - Fetch customer with booking history
- `getCustomerWithPayments()` - Fetch customer with payment history
- `getCustomerWithContracts()` - Fetch customer with contract history
- `createCustomer()` - Insert new customer
- `updateCustomer()` - Update customer record
- `deleteCustomer()` - Delete customer record

**Data Source:** Supabase database (real data)

---

### Layer 3: Domain Layer

**Files:**
- `frontend/src/domain/customer/CustomerTypes.ts` - Domain types
- `frontend/src/domain/customer/CustomerMapper.ts` - Row to domain transformation
- `frontend/src/domain/customer/CustomerLifecycle.ts` - Lifecycle state machine
- `frontend/src/domain/customer/CustomerMetrics.ts` - Metrics calculation

**Responsibilities:**
- Domain entity definitions
- Business logic (lifecycle transitions, metrics calculation)
- Data transformation (database rows → domain entities)

**Data Source:** Repository (via Mapper)

**No Mock Data:** ✅ Domain layer has no mock data

---

### Layer 4: Service Layer

**File:** `frontend/src/services/customerService.ts`

**Responsibilities:**
- Orchestrates business logic
- Implements `ICustomerService` contract
- Uses repository for persistence
- Uses domain layer for business rules

**Methods:**
- `getCustomers()` - List with filters and pagination
- `getCustomerById()` - Single customer fetch
- `createCustomer()` - Create with lifecycle initialization
- `updateCustomer()` - Update with validation
- `deleteCustomer()` - Delete with checks
- `suspendCustomer()` - Lifecycle transition
- `restoreCustomer()` - Lifecycle transition
- `getCustomerMetrics()` - Calculate metrics
- `getCustomerHistory()` - Fetch history
- `searchCustomers()` - Search functionality
- `exportCustomers()` - CSV export
- `getDashboardMetrics()` - Dashboard aggregation

**Data Source:** Repository (real database data)

**No Mock Data:** ✅ Service layer has no mock data

---

### Layer 5: Hooks Layer

**Files:**
- `frontend/src/hooks/useCustomers.ts` - Customer list hook
- `frontend/src/hooks/useCustomer.ts` - Single customer hook
- `frontend/src/hooks/useCustomerMetrics.ts` - Metrics hook
- `frontend/src/hooks/useCustomerHistory.ts` - History hook

**Responsibilities:**
- React state management
- Service method calls
- Error handling
- Loading states

**Data Source:** Service layer (real database data)

**No Mock Data:** ✅ Hooks layer has no mock data

---

### Layer 6: View Models

**Files:**
- `frontend/src/view-models/CustomerCardViewModel.ts` - List display
- `frontend/src/view-models/CustomerMetricsViewModel.ts` - Metrics display
- `frontend/src/view-models/CustomerHistoryViewModel.ts` - History display

**Responsibilities:**
- Domain entity → UI-friendly transformation
- Formatting (dates, currency)
- Computed UI properties (isActive, isRecent, etc.)

**Data Source:** Domain entities (from hooks)

**No Mock Data:** ✅ View models have no mock data

---

### Layer 7: UI Components

**Files:**
- `frontend/src/pages/CustomerListPage.tsx` - Customer list page
- `frontend/src/pages/CustomerDetailPage.tsx` - Customer detail page

**Responsibilities:**
- Render UI
- Handle user interactions
- Display data from view models

**Data Source:** Hooks → View Models (real database data)

**No Mock Data:** ✅ UI components have no mock data

---

## Data Flow Verification

### Customer List Flow

```
User Request
  ↓
CustomerListPage
  ↓
useCustomers hook
  ↓
customerService.getCustomers()
  ↓
customerRepository.listCustomers()
  ↓
Supabase Database (customers + profiles)
  ↓
CustomerMapper.toDomain()
  ↓
Customer domain entity
  ↓
CustomerCardViewModelMapper.toViewModel()
  ↓
CustomerCardViewModel
  ↓
UI Display
```

**Verification:** ✅ Uses real database data through all layers

---

### Customer Detail Flow

```
User Request
  ↓
CustomerDetailPage
  ↓
useCustomer hook
  ↓
customerService.getCustomerById()
  ↓
customerRepository.getCustomerById()
  ↓
Supabase Database (customers + profiles)
  ↓
CustomerMapper.toDomain()
  ↓
Customer domain entity
  ↓
CustomerCardViewModelMapper.toViewModel()
  ↓
CustomerCardViewModel
  ↓
UI Display
```

**Verification:** ✅ Uses real database data through all layers

---

### Customer Metrics Flow

```
User Request
  ↓
CustomerDetailPage
  ↓
useCustomerMetrics hook
  ↓
customerService.getCustomerMetrics()
  ↓
CustomerMetricsCalculator.calculate()
  ↓
CustomerMetrics domain entity
  ↓
CustomerMetricsViewModelMapper.toViewModel()
  ↓
CustomerMetricsViewModel
  ↓
UI Display
```

**Verification:** ✅ Uses real database data through all layers

---

### Customer History Flow

```
User Request
  ↓
CustomerDetailPage
  ↓
useCustomerHistory hook
  ↓
customerService.getCustomerHistory()
  ↓
customerRepository.getCustomerWithBookings()
  ↓
customerRepository.getCustomerWithPayments()
  ↓
customerRepository.getCustomerWithContracts()
  ↓
Supabase Database (bookings, payments, contracts)
  ↓
CustomerHistory domain entity
  ↓
CustomerHistoryViewModelMapper.toViewModel()
  ↓
CustomerHistoryViewModel
  ↓
UI Display
```

**Verification:** ✅ Uses real database data through all layers

---

### Dashboard Metrics Flow

```
User Request
  ↓
CustomerListPage
  ↓
customerService.getDashboardMetrics()
  ↓
customerRepository.listCustomers()
  ↓
Supabase Database (all customers)
  ↓
CustomerMapper.toDomain() (batch)
  ↓
Domain entity filtering
  ↓
Dashboard metrics calculation
  ↓
UI Display
```

**Verification:** ✅ Uses real database data through all layers

---

## Mock Data Audit

### Search Results

**Pattern:** `mockCustomer|mockCustomers|CUSTOMERS|customerFixtures|customerSeed`

**Results:**
- No customer mock data found in Customer Capability files
- References found are in code comments and type definitions, not actual mock data

**ORDERS and STAT_CARDS:**
- Located in `frontend/src/pages/Property management/Gurigate orders.tsx`
- **NOT part of Customer Capability**
- Belongs to Booking/Order domain (per CUSTOMER_DOMAIN_VALIDATION.md)
- Will be migrated when Booking/Order capability is built

**Conclusion:** ✅ Customer Capability has no mock data

---

## RLS Verification

### RLS Policies Required

**customers table:**
- `SELECT` - Users can read customers
- `INSERT` - Users can create customers
- `UPDATE` - Users can update customers
- `DELETE` - Users can delete customers

**profiles table:**
- `SELECT` - Users can read profiles (joined with customers)

**bookings table:**
- `SELECT` - Users can read bookings (for customer history)

**payments table:**
- `SELECT` - Users can read payments (for customer history)

**contracts table:**
- `SELECT` - Users can read contracts (for customer history)

### RLS Status

**Status:** ⚠️ Requires verification

**Action:** Run RLS verification task

---

## Verification Checklist

- ✅ Database layer uses Supabase (real data)
- ✅ Repository layer queries database directly
- ✅ Domain layer has no mock data
- ✅ Service layer uses repository (real data)
- ✅ Hooks layer uses service (real data)
- ✅ View models transform domain entities (real data)
- ✅ UI components use hooks (real data)
- ✅ No customer mock data in Customer Capability
- ✅ ORDERS/STAT_CARDS excluded (Booking/Order domain)
- ⚠️ RLS policies require verification

---

## Conclusion

**Customer Data Flow Status:** ✅ VERIFIED

All customer data flows use real database data through the complete architecture:

```
Database → Repository → Domain → Service → Hooks → View Models → UI
```

No mock data exists in the Customer Capability. The ORDERS and STAT_CARDS mock data in Gurigate orders.tsx belongs to the Booking/Order domain and will be addressed when that capability is built.

**Next Steps:**
1. Verify RLS policies
2. Run build verification
3. Run type check verification
4. Generate completion report
