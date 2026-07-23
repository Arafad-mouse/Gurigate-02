# Customer Domain Validation

**Created:** 2026-06-03
**Purpose:** Determine domain ownership of GuriGate Orders Page

---

## ORDERS Data Structure Analysis

### Current Mock Structure

```ts
{
  id: "ORD-1001",
  customer: "Axmed Cabdalle",
  email: "axmed@gmail.com",
  date: parseDate("Jul 8, 2024"),
  units: 3,
  property: "Burjiomar A",
  type: "Rental",
  rating: 4.9,
  status: "Active",
  avatar: null,
  paymentStatus: "Paid",
  paymentMethod: "Zaad"
}
```

### Field Domain Mapping

| Field | Domain | Rationale |
|-------|--------|-----------|
| `id` (ORD- prefix) | Booking/Order | Transaction identifier |
| `customer` | Customer | Joined customer name |
| `email` | Customer | Joined customer email |
| `date` | Booking | Transaction date |
| `units` | Booking | Number of units booked |
| `property` | Property | Joined property name |
| `type` | Booking | Rental, Purchase, Short Stay |
| `rating` | Booking/Review | Customer rating |
| `status` | Booking | Active, Unverified, Suspended, Deactivated, Pending |
| `avatar` | Customer | Joined customer avatar |
| `paymentStatus` | Payment | Paid, Pending, Refunded |
| `paymentMethod` | Payment | Zaad, eDahab, Premier Wallet |

---

## Domain Ownership Conclusion

**ORDERS represents: BOOKING/ORDER OPERATIONAL RECORDS**

This is NOT a customer domain entity. It is a composite operational record that joins multiple domains:

```
Booking/Order Domain (Primary)
  ├─ id, date, units, type, status, rating
  ├─ Customer Domain (Joined)
  │  └─ customer, email, avatar
  ├─ Property Domain (Joined)
  │  └─ property
  └─ Payment Domain (Joined)
     └─ paymentStatus, paymentMethod
```

---

## Architectural Implications

### Current Problem

The page is labeled "GuriGate Orders" but was being treated as a Customer UI migration target. This is incorrect.

### Correct Architecture

```
Orders Page
  ↓
Booking Service (Primary)
  ├─ Booking Repository
  ├─ Booking Domain
  └─ Booking Hooks
  ↓
Customer Service (Joined)
  ├─ Customer Repository
  ├─ Customer Domain
  └─ Customer Hooks
  ↓
Property Service (Joined)
  ├─ Property Repository
  ├─ Property Domain
  └─ Property Hooks
  ↓
Payment Service (Joined)
  ├─ Payment Repository
  ├─ Payment Domain
  └─ Payment Hooks
```

---

## Customer Capability Scope

### What Customer Capability DOES Cover

- Customer profiles and lifecycle management
- Customer metrics (health score, balance, activity)
- Customer history (bookings, payments, contracts)
- Customer search and filtering
- Customer CRUD operations

### What Customer Capability DOES NOT Cover

- Booking/Order operational records
- Payment transaction processing
- Property management
- Contract lifecycle

---

## Revised Migration Strategy

### Option A: Keep Orders Page Separate

**Approach:** Treat Orders Page as a separate Booking/Order capability

**Pros:**
- Respects domain boundaries
- Follows GuriGate PRD architecture
- Each domain has clear ownership

**Cons:**
- Requires Booking/Order capability to be built first
- Delays Orders Page migration
- Cross-domain integration complexity

**Effort:** HIGH (requires building Booking/Order capability)

---

### Option B: Create Composite View Model

**Approach:** Create a composite view model that joins Customer data for display only

**Pros:**
- Can migrate Orders Page now
- Customer hooks provide customer data
- View model handles domain joining
- Preserves domain boundaries

**Cons:**
- Still requires Booking/Order domain for full functionality
- Partial migration until Booking capability exists
- Temporary solution

**Effort:** MEDIUM (view model + partial migration)

---

### Option C: Create Dedicated Customer List Page

**Approach:** Create a new Customer List Page separate from Orders Page

**Pros:**
- Clean domain separation
- Customer capability gets its own UI
- Orders Page remains as-is until Booking capability
- Follows architectural principles

**Cons:**
- Requires building new Customer List Page
- Orders Page remains with mock data longer
- More UI work overall

**Effort:** MEDIUM (new Customer List Page)

---

## Recommendation

**Adopt Option C: Create Dedicated Customer List Page**

**Rationale:**

1. **Domain Integrity:** Preserves clear domain boundaries
2. **Customer Capability Completion:** Allows Customer Capability to be fully completed with proper UI
3. **Architectural Alignment:** Follows GuriGate PRD where Customers, Bookings, Payments are separate modules
4. **Reference Pattern:** Customer List Page becomes the reference implementation for future modules
5. **No Technical Debt:** Avoids forcing domains together

---

## Updated Migration Plan

### Phase 1: Create Customer List Page

**New File:** `frontend/src/pages/CustomerListPage.tsx`

**Features:**
- Customer list display
- Search by name, email, phone
- Filter by customer type (Tenant, Renter, Buyer, Guest)
- Filter by lifecycle status (Lead, Active, Inactive, Suspended)
- Pagination
- Export to CSV
- Customer detail drawer
- Add customer modal

**Hooks:**
- `useCustomers()` for list, search, filters, pagination
- `useCustomer()` for single customer operations
- `useCustomerMetrics()` for dashboard metrics
- `useCustomerHistory()` for history display

**View Models:**
- `CustomerCardViewModel` for list display
- `CustomerMetricsViewModel` for metrics display
- `CustomerHistoryViewModel` for timeline display

**Effort:** 4-6 hours

---

### Phase 2: Keep Orders Page As-Is

**Action:** Leave `Gurigate orders.tsx` unchanged for now

**Rationale:**
- Orders Page belongs to Booking/Order capability
- Will be migrated when Booking capability is built
- No premature domain mixing

**Effort:** 0 hours (deferred)

---

### Phase 3: Complete Customer Capability

**Tasks:**
- Migrate Customer List Page to use real data
- Create Customer Detail Page
- Create Customer Metrics widgets
- Create Customer History components
- Remove all customer mock data
- Verify RLS permissions
- Run build and type check
- Generate completion report

**Effort:** 8-12 hours

---

### Phase 4: Build Booking/Order Capability

**Future Work:**
- Build Booking domain layer
- Build Booking repository
- Build Booking service
- Build Booking hooks
- Migrate Orders Page to use Booking hooks
- Join Customer data for display

**Effort:** 16-20 hours (future sprint)

---

## Updated Status

```
Database ................. ✅
Types .................... ✅
Repository ............... ✅
Domain Layer ............. ✅
Mapper ................... ✅
Service Contract ......... ✅
Service Implementation ... ✅
Hooks .................... ✅
UI Migration Plan ........ ✅
Domain Validation ........ ✅

Customer List Page ........ NEXT
Orders Page .............. DEFERRED (Booking Capability)
View Models .............. NEXT
Customer Capability ...... IN PROGRESS
```

---

## Exit Criteria

Customer Capability is complete when:

- ✅ Customer List Page created and uses hooks
- ✅ Customer Detail Page created and uses hooks
- ✅ Customer Metrics widgets use hooks
- ✅ Customer History components use hooks
- ✅ No customer mock data remains
- ✅ Build passes
- ✅ Type check passes
- ✅ RLS verified
- ✅ Completion report generated

Orders Page migration is **NOT** part of Customer Capability completion.
