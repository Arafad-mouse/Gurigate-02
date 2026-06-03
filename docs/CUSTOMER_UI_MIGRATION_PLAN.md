# Customer UI Migration Plan

**Created:** 2026-06-03
**Purpose:** Inventory and plan for migrating Customer UI from mock data to real data

---

## Current Component Inventory

### 1. GuriGate Orders Page

**Location:** `frontend/src/pages/Property management/Gurigate orders.tsx`

**Current Data Source:**
- Mock array: `ORDERS` (lines 49-62)
- Hardcoded customer data with 12 mock orders
- Static stat cards: `STAT_CARDS` (lines 78-83)

**Current Features:**
- Customer list display
- Search by name, email, order ID
- Filter by status (Active, Pending, Unverified, Suspended, Deactivated)
- Filter by type (Buyers, Orders, Short Stay)
- Date range filtering
- Pagination
- Export data function
- Add order modal
- Order detail drawer

**Target Hook:** `useCustomers()`

**Target Domain Model:** `Customer` from `frontend/src/domain/customer/CustomerTypes.ts`

**Migration Complexity:** **HIGH**

**Reasoning:**
- Page uses mock ORDERS array structure that differs from domain Customer model
- Current data structure: `{ id, customer, email, date, units, property, type, rating, status, avatar, paymentStatus, paymentMethod }`
- Domain Customer structure: `{ id, profile, customerType, lifecycleStatus, tags, assignedPropertyId, notes, metrics, createdAt, updatedAt }`
- Need to map between these structures
- Stat cards need to use real dashboard metrics from service
- Search logic needs to use service search method
- Filters need to map to domain enums (CustomerType, LifecycleStatus)
- Export needs to use service export method

---

### 2. GuriGate Footer

**Location:** `frontend/src/components/GuriGateFooter.tsx`

**Current Data Source:** None (static content)

**Current Features:**
- Static customer service email: `customerservice@gurigate.com`

**Target Hook:** None

**Target Domain Model:** None

**Migration Complexity:** **NONE**

**Reasoning:**
- No customer data, just static email reference
- No migration needed

---

### 3. Language Translations

**Location:** `frontend/src/lib/language.tsx`

**Current Data Source:** Static translation maps

**Current Features:**
- Translation for "Customer" key in Arabic and Somali

**Target Hook:** None

**Target Domain Model:** None

**Migration Complexity:** **NONE**

**Reasoning:**
- Just translation strings, no data logic
- No migration needed

---

## Migration Tasks

### Task 1: Migrate GuriGate Orders Page

**Steps:**

1. **Import hooks**
   - Import `useCustomers` from `../hooks/useCustomers`
   - Import `useCustomer` from `../hooks/useCustomer`
   - Import `useCustomerMetrics` from `../hooks/useCustomerMetrics`

2. **Replace mock data with hooks**
   - Remove `ORDERS` mock array
   - Remove `STAT_CARDS` mock array
   - Initialize `useCustomers()` hook
   - Initialize `useCustomerMetrics()` hook for dashboard

3. **Map data structures**
   - Map `Customer` domain model to table display format
   - Map `CustomerType.TENANT` to "Rental"
   - Map `CustomerType.BUYER` to "Purchase"
   - Map `CustomerType.GUEST` to "Short Stay"
   - Map `LifecycleStatus` to status display
   - Map customer profile fields to table columns

4. **Update search logic**
   - Replace local filter with `setSearchQuery` from hook
   - Use hook's search functionality

5. **Update filter logic**
   - Replace local status filter with `setFilters` from hook
   - Map UI filter values to domain enums
   - Use hook's filter functionality

6. **Update pagination**
   - Replace local pagination with hook's pagination
   - Use `page`, `pageSize`, `total` from hook
   - Use `setPage`, `setPageSize` from hook

7. **Update stat cards**
   - Replace static `STAT_CARDS` with real dashboard metrics
   - Use `getDashboardMetrics` from service
   - Display real counts and trends

8. **Update export**
   - Replace local export with `exportCustomers` from hook
   - Use service export method

9. **Update order detail drawer**
   - Use `useCustomer` hook for single customer
   - Display real customer data from domain model
   - Show real metrics from `useCustomerMetrics`

10. **Update add order modal**
    - Use `createCustomer` from `useCustomer` hook
    - Map form data to `CreateCustomerInput`
    - Handle lifecycle status on creation

**Estimated Effort:** 4-6 hours

---

### Task 2: Remove Mock Data

**Files to Clean:**

1. `frontend/src/pages/Property management/Gurigate orders.tsx`
   - Remove `ORDERS` array
   - Remove `STAT_CARDS` array
   - Remove local filtering logic
   - Remove local pagination logic

2. Search entire codebase for:
   - `mockCustomer`
   - `mockCustomers`
   - `CUSTOMERS` (constant arrays)
   - `customerFixtures`
   - `customerSeed`

**Estimated Effort:** 1-2 hours

---

### Task 3: Update Type References

**Type Mappings Needed:**

- Remove any references to mock order types
- Ensure all customer data uses `Customer` domain type
- Ensure all metrics use `CustomerMetrics` domain type
- Ensure all history uses `CustomerHistory` domain type

**Estimated Effort:** 1 hour

---

## Migration Complexity Summary

| Component | Complexity | Reason |
|-----------|------------|--------|
| GuriGate Orders Page | HIGH | Data structure mismatch, extensive mapping needed |
| GuriGate Footer | NONE | No data migration needed |
| Language Translations | NONE | No data migration needed |

**Overall Complexity:** HIGH

**Primary Challenge:** Mapping between mock order structure and domain Customer model

---

## Migration Order

1. **Phase 1:** Create data mapping utilities
   - Create helper functions to map Customer domain model to display format
   - Create helper functions to map UI filters to domain enums

2. **Phase 2:** Migrate GuriGate Orders Page
   - Replace mock data with hooks
   - Update all data access points
   - Test pagination, search, filters

3. **Phase 3:** Update stat cards
   - Replace static metrics with real dashboard metrics
   - Test metric calculations

4. **Phase 4:** Update export
   - Replace local export with service export
   - Test CSV generation

5. **Phase 5:** Remove mock data
   - Clean up all mock arrays
   - Search and remove dead code

6. **Phase 6:** Verification
   - Run type check
   - Run build
   - Test all features manually

---

## Success Criteria

Migration is complete when:

- ✅ GuriGate Orders Page uses `useCustomers` hook
- ✅ GuriGate Orders Page uses `useCustomer` hook for details
- ✅ GuriGate Orders Page uses `useCustomerMetrics` for dashboard
- ✅ All mock ORDERS data removed
- ✅ All mock STAT_CARDS data removed
- ✅ Search uses service search method
- ✅ Filters use domain enums
- ✅ Pagination uses hook pagination
- ✅ Export uses service export method
- ✅ Stat cards show real metrics
- ✅ Type check passes with 0 errors
- ✅ Build passes with 0 errors
- ✅ All features work with real database data

---

## Rollback Plan

If migration fails:

1. Keep original `Gurigate orders.tsx` as backup
2. Revert to mock data if hooks fail
3. Document any blockers in migration checklist
4. Proceed with Property Capability migration instead

---

## Notes

- The mock ORDERS structure is significantly different from domain Customer model
- Extensive mapping will be required
- Consider creating a display adapter pattern for cleaner mapping
- Stat cards will need real dashboard metrics from service
- This migration will serve as the reference pattern for other modules
