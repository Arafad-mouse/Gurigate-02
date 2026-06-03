# Customer Capability Specification

**Phase:** 1A - Customer Capability Migration
**Created:** 2026-06-03
**Status:** Approved for Implementation

---

## Overview

The Customer capability provides a complete CRM layer for managing customer relationships within the GuriGate platform. This specification defines the complete feature set, data model, lifecycle, permissions, and acceptance criteria for the customer module migration from mock data to Supabase-backed implementation.

---

## 1. Capability Features

### 1.1 Customer List
- Paginated list of all customers
- Search by name
- Filter by customer type (tenant, renter, buyer, guest)
- Filter by lifecycle status (lead, active, inactive, suspended)
- Sort by creation date, last activity, total bookings, total rent paid
- Export to CSV

### 1.2 Customer Profile
- View complete customer profile
- Display customer information (type, lifecycle status, notes, tags)
- Display linked profile information (full name, phone)
- Display current property assignment
- Display metrics (total bookings, total rent paid, last activity)

### 1.3 Customer Search
- Full-text search by customer name
- Search by profile phone number
- Real-time search results
- Search history

### 1.4 Customer Filters
- Filter by customer type
- Filter by lifecycle status
- Filter by date range (created date, last activity)
- Filter by property assignment
- Combine multiple filters

### 1.5 Customer Notes
- Add notes to customer records
- Edit existing notes
- Note timestamps and author tracking
- Rich text support (optional)

### 1.6 Customer Tags
- Add tags to customer records
- Edit existing tags
- Tag management (create, delete, rename)
- Tag-based filtering

### 1.7 Booking History
- View all bookings for a customer
- Paginated booking list
- Booking status, dates, property information
- Link to booking details
- Sort by date, status

### 1.8 Payment History
- View all payments for a customer
- Paginated payment list
- Payment amount, date, method, status
- Link to payment details
- Sort by date, amount

### 1.9 Contract History
- View all contracts for a customer
- Paginated contract list
- Contract status, dates, property, rent
- Link to contract details
- Sort by date, status

### 1.10 Customer Metrics
- Total bookings count
- Total rent paid
- Outstanding balance
- Active contract (if any)
- Current property (if any)
- Last payment (if any)
- Last activity timestamp

### 1.11 Customer Lifecycle Status
- Lead: Initial prospect, no bookings yet
- Active: Has active bookings or contracts
- Inactive: No recent activity, may have past bookings
- Suspended: Account suspended (e.g., payment issues, policy violations)

---

## 2. Data Model

### 2.1 Database Schema

**customers table:**
```sql
- id: UUID (primary key)
- profile_id: UUID (foreign key to profiles)
- customer_type: enum (tenant, renter, buyer, guest)
- lifecycle_status: enum (lead, active, inactive, suspended)
- current_property_id: UUID (nullable, foreign key to properties)
- notes: text (nullable)
- tags: jsonb (nullable)
- total_bookings: integer (nullable, denormalized)
- total_rent_paid: numeric (nullable, denormalized)
- currency: varchar (nullable)
- last_activity_at: timestamp (nullable)
- preferences: jsonb (nullable)
- metadata: jsonb (nullable)
- deleted_at: timestamp (nullable, soft delete)
- deleted_by: UUID (nullable)
- created_by: UUID (nullable)
- updated_by: UUID (nullable)
- created_at: timestamp
- updated_at: timestamp
```

**Relationships:**
- Customer → Profile (1:1 via profile_id)
- Customer → Bookings (1:N via customer_id in bookings)
- Customer → Payments (1:N via bookings → payments)
- Customer → Contracts (1:N via bookings → contracts)
- Customer → Property (N:1 via current_property_id)

### 2.2 Domain Model

**CustomerRow:** Database row type (from Supabase types)
**Customer:** Domain entity (mapped from CustomerRow)
**CustomerMapper:** Transforms CustomerRow to Customer

**Customer Domain Entity:**
```typescript
interface Customer {
  id: string;
  profileId: string;
  customerType: CustomerType;
  lifecycleStatus: LifecycleStatus;
  currentPropertyId: string | null;
  notes: string | null;
  tags: string[];
  totalBookings: number;
  totalRentPaid: number;
  currency: string;
  lastActivityAt: Date | null;
  preferences: Record<string, unknown>;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  
  // Computed from Profile
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
}
```

---

## 3. Lifecycle

### 3.1 Lifecycle States

```
Lead
  ↓ (first booking)
Active
  ↓ (no activity for 90 days)
Inactive
  ↓ (suspended by admin)
Suspended
  ↓ (restored by admin)
Active
```

### 3.2 State Transitions

| From | To | Trigger | Auto/Manual |
|------|---|--------|------------|
| Lead | Active | First booking created | Auto |
| Active | Inactive | No activity for 90 days | Auto |
| Inactive | Active | New booking created | Auto |
| Active | Suspended | Admin action (payment issue, policy violation) | Manual |
| Suspended | Active | Admin action (issue resolved) | Manual |
| Any | Deleted | Soft delete by admin | Manual |

### 3.3 Lifecycle Rules

- **Lead → Active:** Automatically triggered when first booking is created
- **Active → Inactive:** Automatically triggered after 90 days of inactivity
- **Inactive → Active:** Automatically triggered when new booking is created
- **Active → Suspended:** Manual action by admin (requires reason)
- **Suspended → Active:** Manual action by admin (requires resolution)
- **Suspension:** Suspended customers cannot create new bookings
- **Deletion:** Soft delete only, audit trail preserved

---

## 4. Relationships

### 4.1 Customer → Profile
- **Type:** 1:1
- **Foreign Key:** profile_id
- **Cascade:** Delete customer when profile is deleted
- **Data:** Customer stores profile_id, Profile stores user data (full_name, phone, avatar_url)

### 4.2 Customer → Bookings
- **Type:** 1:N
- **Foreign Key:** customer_id in bookings table
- **Cascade:** Set customer_id to NULL when customer is deleted
- **Data:** Bookings reference customer for tracking

### 4.3 Customer → Payments
- **Type:** 1:N (via Bookings)
- **Path:** Customer → Bookings → Payments
- **Cascade:** No direct cascade
- **Data:** Payments reference bookings, bookings reference customer

### 4.4 Customer → Contracts
- **Type:** 1:N (via Bookings)
- **Path:** Customer → Bookings → Contracts
- **Cascade:** No direct cascade
- **Data:** Contracts reference bookings, bookings reference customer

### 4.5 Customer → Property
- **Type:** N:1
- **Foreign Key:** current_property_id in customers table
- **Cascade:** Set to NULL when property is deleted
- **Data:** Current property assignment for customer

---

## 5. RBAC (Role-Based Access Control)

### 5.1 Roles

| Role | Description |
|------|-------------|
| Owner | Full access to all resources |
| Manager | Can manage customers in assigned properties |
| Admin | Can manage all customers |
| Super Admin | Full system access |

### 5.2 Permissions

| Action | Owner | Manager | Admin | Super Admin |
|--------|-------|---------|-------|-------------|
| View Customers | ✅ | ✅ (assigned) | ✅ | ✅ |
| Create Customer | ✅ | ✅ (assigned) | ✅ | ✅ |
| Edit Customer | ✅ | ✅ (assigned) | ✅ | ✅ |
| Delete Customer | ✅ | ❌ | ✅ | ✅ |
| Suspend Customer | ✅ | ❌ | ✅ | ✅ |
| Restore Customer | ✅ | ❌ | ✅ | ✅ |
| View Own Profile | ✅ | ✅ | ✅ | ✅ |
| Edit Own Profile | ✅ | ✅ | ✅ | ✅ |

### 5.3 RLS Policies

**Customers Table:**
- **Users can view their own customer profile:** Authenticated users can view their own customer record via profile_id
- **Admins can view all customers:** Users with admin or super_admin role can view all customers
- **Admins can manage customers:** Users with admin or super_admin role can create, update, delete customers
- **Managers can view customers in assigned properties:** Users with manager role can view customers assigned to their properties

### 5.4 Permission Checks

Service layer must enforce:
- Manager role checks property assignment before allowing actions
- Admin/super_admin bypass property assignment checks
- Owner has full access to all resources
- Users can only view/edit their own profile data

---

## 6. Acceptance Criteria

### 6.1 Functional Requirements

- [ ] **CRUD works:** Create, Read, Update, Delete operations work correctly
- [ ] **Search works:** Full-text search by name returns correct results
- [ ] **Filters work:** Type, status, date range filters return correct results
- [ ] **Pagination works:** Page navigation displays correct data per page
- [ ] **Metrics work:** Customer metrics display accurate calculations
- [ ] **History works:** Booking, payment, contract history displays correctly
- [ ] **RLS works:** Row-level security policies enforce correct access
- [ ] **Build passes:** Application builds without errors
- [ ] **Type check passes:** TypeScript type checking passes without errors

### 6.2 Data Integrity

- [ ] **Profile linkage:** Customer correctly links to Profile via profile_id
- [ ] **Booking linkage:** Customer correctly links to Bookings via customer_id
- [ ] **Payment linkage:** Customer correctly retrieves payments via bookings
- [ ] **Contract linkage:** Customer correctly retrieves contracts via bookings
- [ ] **Soft delete:** Deleted customers are marked with deleted_at, not removed
- [ ] **Audit trail:** created_by, updated_by, deleted_by are tracked correctly

### 6.3 Lifecycle Management

- [ ] **Auto transitions:** Lead → Active on first booking
- [ ] **Auto transitions:** Active → Inactive after 90 days inactivity
- [ ] **Auto transitions:** Inactive → Active on new booking
- [ ] **Manual transitions:** Admin can suspend/restore customers
- [ ] **Suspension enforcement:** Suspended customers cannot create bookings

### 6.4 Performance

- [ ] **List performance:** Customer list loads within 2 seconds
- [ ] **Search performance:** Search results return within 1 second
- [ ] **Pagination performance:** Page navigation is instant
- [ ] **Metrics performance:** Customer metrics load within 1 second

### 6.5 UI/UX

- [ ] **Responsive design:** Customer pages work on mobile, tablet, desktop
- [ ] **Error handling:** Graceful error messages for failed operations
- [ ] **Loading states:** Loading indicators for async operations
- [ ] **Empty states:** Empty state messages when no data exists
- [ ] **Accessibility:** Keyboard navigation, screen reader support

---

## 7. Migration Order

### 7.1 Backend Migration

1. **customerRepository** (✅ Complete)
   - Database operations
   - Type definitions
   - CRUD methods
   - Search and filter methods
   - Metrics calculation

2. **Domain Layer** (Pending)
   - CustomerRow type
   - Customer domain entity
   - CustomerMapper
   - Domain type definitions

3. **customerService** (Pending)
   - Integrate customerRepository
   - Replace mock data with repository calls
   - Implement business logic
   - Add permission checks
   - Implement lifecycle management

### 7.2 Frontend Migration

4. **useCustomers Hook** (Pending)
   - List customers with pagination
   - Search customers
   - Filter customers
   - Export customers

5. **useCustomer Hook** (Pending)
   - Get customer by ID
   - Get customer profile
   - Get customer metrics
   - Get customer history (bookings, payments, contracts)
   - Update customer
   - Delete customer
   - Suspend/restore customer

6. **Customer List Page** (Pending)
   - Migrate to use useCustomers hook
   - Remove mock data
   - Test pagination, search, filters

7. **Customer Detail Page** (Pending)
   - Migrate to use useCustomer hook
   - Remove mock data
   - Test profile display, metrics, history

8. **Customer Edit Flow** (Pending)
   - Migrate to use useCustomer hook
   - Remove mock data
   - Test create, update, delete operations

9. **Customer Metrics** (Pending)
   - Migrate to use real data
   - Test metric calculations
   - Test dashboard integration

### 7.3 Cleanup

10. **Remove Mock Service** (Pending)
    - Delete mock data from customerService
    - Remove mock data generation
    - Clean up unused code

11. **Verification** (Pending)
    - Verify RLS permissions work correctly
    - Run build and type check
    - Manual testing of all features

---

## 8. Architecture Principles

### 8.1 Layered Architecture

```
Pages (UI)
  ↓
Hooks (State Management)
  ↓
Services (Business Logic)
  ↓
Repositories (Data Access)
  ↓
Supabase (Database)
```

### 8.2 Domain Layer Pattern

```
Database Row (CustomerRow)
  ↓
Mapper (CustomerMapper)
  ↓
Domain Entity (Customer)
  ↓
UI Components
```

**Purpose:** Prevent database schema changes from breaking the frontend. The domain layer provides a stable API for the UI while allowing the database schema to evolve.

### 8.3 Type Safety

- All database operations use Supabase-generated types
- Domain entities have their own type definitions
- UI components use domain types, not database types
- Mappers ensure type-safe transformations

### 8.4 Error Handling

- Repository errors are caught and re-thrown with context
- Service errors include user-friendly messages
- UI errors are displayed to users with recovery options
- All errors are logged for debugging

---

## 9. Testing Strategy

### 9.1 Unit Tests

- Repository methods (CRUD, search, filter)
- Mapper transformations
- Service business logic
- Lifecycle state transitions
- Permission checks

### 9.2 Integration Tests

- Service → Repository integration
- Hook → Service integration
- Page → Hook integration
- RLS policy enforcement

### 9.3 E2E Tests

- Customer list page
- Customer detail page
- Customer edit flow
- Customer search and filters
- Customer lifecycle transitions

---

## 10. Success Criteria

Phase 1A is complete when:

1. ✅ All customer pages use Supabase data (no mock data)
2. ✅ Customer CRUD operations work correctly
3. ✅ Search, filters, pagination work correctly
4. ✅ Customer metrics display accurate data
5. ✅ Booking, payment, contract history display correctly
6. ✅ Lifecycle transitions work (auto and manual)
7. ✅ RLS policies enforce correct access
8. ✅ Build passes without errors
9. ✅ Type check passes without errors
10. ✅ Mock customer service is completely removed

---

## 11. Dependencies

### 11.1 Completed

- ✅ Migration applied to database
- ✅ Supabase types regenerated
- ✅ customerRepository created
- ✅ Architecture decisions documented
- ✅ Type audit completed

### 11.2 Required

- Domain layer implementation
- Frontend interface refactoring
- customerService integration
- Hook implementation
- Page migration
- Mock data removal

---

## 12. Risks and Mitigations

### 12.1 Risks

- **Frontend interface mismatch:** Frontend types don't match database schema
  - **Mitigation:** Create domain layer to abstract database schema
- **RLS policy issues:** Permissions not enforced correctly
  - **Mitigation:** Test RLS policies thoroughly before deployment
- **Performance issues:** Large customer lists slow to load
  - **Mitigation:** Implement pagination, caching, and indexes
- **Data loss:** Migration errors could corrupt data
  - **Mitigation:** Backup database before migration, test in staging

### 12.2 Rollback Plan

If migration fails:
1. Restore database from backup
2. Revert frontend changes
3. Re-enable mock service
4. Investigate failure
5. Fix issues and retry

---

## 13. Timeline

**Estimated Duration:** 3-5 days

- Day 1: Domain layer, frontend interface refactoring
- Day 2: customerService integration, hooks
- Day 3: Page migration (list, detail)
- Day 4: Page migration (edit, metrics), cleanup
- Day 5: Testing, verification, bug fixes

---

## 14. Approval

**Approved by:** User
**Approval Date:** 2026-06-03
**Phase:** 1A - Customer Capability Migration
**Status:** Approved for Implementation
