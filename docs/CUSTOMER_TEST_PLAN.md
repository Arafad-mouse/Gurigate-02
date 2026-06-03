# Customer Test Plan

**Created:** 2026-06-03
**Purpose:** Comprehensive test cases for Customer Capability

---

## Test Categories

### 1. Customer List

#### 1.1 Load Customers
- **Test:** Load customer list on page load
- **Expected:** Loading state shows, then customers display
- **Verify:** `useCustomers` hook returns data correctly
- **Edge Cases:** Empty list, network error

#### 1.2 Search Customers
- **Test:** Search by name, phone, or email
- **Expected:** Results filter based on query
- **Verify:** `searchCustomers` service method called
- **Edge Cases:** No results, special characters, case sensitivity

#### 1.3 Filter Customers
- **Test:** Filter by customer type (tenant, renter, buyer, guest)
- **Expected:** Results filter by type
- **Verify:** `getCustomers` with filters works
- **Edge Cases:** "All" option, invalid type

#### 1.4 Filter by Lifecycle Status
- **Test:** Filter by lifecycle status (lead, active, inactive, suspended)
- **Expected:** Results filter by status
- **Verify:** Lifecycle filter works
- **Edge Cases:** "All" option, invalid status

#### 1.5 Pagination
- **Test:** Navigate through pages
- **Expected:** Page changes, correct data loads
- **Verify:** Page state updates correctly
- **Edge Cases:** Last page, first page, page size change

#### 1.6 Page Size Change
- **Test:** Change items per page
- **Expected:** Page resets to 1, new page size applied
- **Verify:** `setPageSize` works
- **Edge Cases:** Invalid page size

#### 1.7 Export to CSV
- **Test:** Export filtered customers to CSV
- **Expected:** CSV file downloads with correct data
- **Verify:** `exportCustomers` service method
- **Edge Cases:** Empty results, large dataset

---

### 2. Customer Profile

#### 2.1 Load Customer Profile
- **Test:** Load single customer by ID
- **Expected:** Customer data displays correctly
- **Verify:** `useCustomer` hook returns data
- **Edge Cases:** Invalid ID, network error

#### 2.2 Edit Customer Profile
- **Test:** Update customer name, phone, notes
- **Expected:** Changes save and reflect immediately
- **Verify:** `updateCustomer` service method
- **Edge Cases:** Invalid data, concurrent edits

#### 2.3 Save Customer Profile
- **Test:** Save changes to customer profile
- **Expected:** Success message, data persists
- **Verify:** Database updated
- **Edge Cases:** Validation errors, network failure

#### 2.4 View Profile Fields
- **Test:** Display all profile fields correctly
- **Expected:** Name, phone, avatar, type, status show
- **Verify:** Domain entity fields map correctly
- **Edge Cases:** Missing optional fields

---

### 3. Customer Lifecycle

#### 3.1 Activate Customer
- **Test:** Activate a lead or inactive customer
- **Expected:** Status changes to active
- **Verify:** `updateLifecycleStatus` works
- **Edge Cases:** Invalid transition, already active

#### 3.2 Suspend Customer
- **Test:** Suspend an active customer
- **Expected:** Status changes to suspended
- **Verify:** `suspendCustomer` service method
- **Edge Cases:** Cannot suspend in current state

#### 3.3 Restore Customer
- **Test:** Restore a suspended customer
- **Expected:** Status changes to active
- **Verify:** `restoreCustomer` service method
- **Edge Cases:** Cannot restore in current state

#### 3.4 Deactivate Customer
- **Test:** Mark customer as inactive
- **Expected:** Status changes to inactive
- **Verify:** Lifecycle transition valid
- **Edge Cases:** Invalid transition

#### 3.5 Lifecycle Validation
- **Test:** Attempt invalid lifecycle transitions
- **Expected:** Transition rejected with error
- **Verify:** `CustomerLifecycle.canTransition` works
- **Edge Cases:** All invalid combinations

---

### 4. Customer Metrics

#### 4.1 Calculate Health Score
- **Test:** Display customer health score
- **Expected:** Score 0-100 calculated correctly
- **Verify:** `calculateHealthScore` method
- **Edge Cases:** No data, edge cases

#### 4.2 Outstanding Balance
- **Test:** Display outstanding balance
- **Expected:** Balance calculated from contracts - payments
- **Verify:** `calculateOutstandingBalance` method
- **Edge Cases:** No contracts, overpaid

#### 4.3 Booking Count
- **Test:** Display total bookings
- **Expected:** Count matches actual bookings
- **Verify:** Booking history query
- **Edge Cases:** No bookings

#### 4.4 Contract Count
- **Test:** Display active contracts
- **Expected:** Count matches active contracts
- **Verify:** Contract history query
- **Edge Cases:** No contracts, expired contracts

#### 4.5 Payment Count
- **Test:** Display payment count
- **Expected:** Count matches actual payments
- **Verify:** Payment history query
- **Edge Cases:** No payments

#### 4.6 Last Activity Date
- **Test:** Display last activity date
- **Expected:** Date from latest booking or payment
- **Verify:** `calculateLastActivityDate` method
- **Edge Cases:** No activity

#### 4.7 Inactivity Detection
- **Test:** Detect inactive customers (90+ days)
- **Expected:** Inactive status auto-applied
- **Verify:** `isInactive` method
- **Edge Cases:** Exactly 90 days, 89 days

---

### 5. Customer History

#### 5.1 Booking History
- **Test:** Display booking history
- **Expected:** All bookings show with details
- **Verify:** `getBookingHistory` service method
- **Edge Cases:** No bookings, pagination

#### 5.2 Payment History
- **Test:** Display payment history
- **Expected:** All payments show with details
- **Verify:** `getPaymentHistory` service method
- **Edge Cases:** No payments, pagination

#### 5.3 Contract History
- **Test:** Display contract history
- **Expected:** All contracts show with details
- **Verify:** `getContractHistory` service method
- **Edge Cases:** No contracts, pagination

#### 5.4 Timeline
- **Test:** Display chronological timeline
- **Expected:** Events ordered by date
- **Verify:** Timeline aggregation works
- **Edge Cases:** No events, same-day events

#### 5.5 History Pagination
- **Test:** Paginate history items
- **Expected:** Page changes load correct data
- **Verify:** Pagination in service
- **Edge Cases:** Last page, page size change

---

### 6. Permissions

#### 6.1 Owner Role
- **Test:** Owner can view own customer profile
- **Expected:** Profile loads successfully
- **Verify:** RLS policy allows owner access
- **Edge Cases:** Wrong owner

#### 6.2 Manager Role
- **Test:** Manager can view assigned property customers
- **Expected:** Assigned customers load
- **Verify:** RLS policy allows manager access
- **Edge Cases:** Unassigned property

#### 6.3 Admin Role
- **Test:** Admin can view all customers
- **Expected:** All customers load
- **Verify:** RLS policy allows admin access
- **Edge Cases:** Admin without permissions

#### 6.4 Super Admin Role
- **Test:** Super Admin can manage all customers
- **Expected:** Full CRUD access
- **Verify:** RLS policy allows super admin
- **Edge Cases:** Invalid role

#### 6.5 Permission Denial
- **Test:** Attempt unauthorized access
- **Expected:** Access denied error
- **Verify:** RLS policy blocks access
- **Edge Cases:** Role escalation attempt

---

### 7. Error Handling

#### 7.1 Network Failure
- **Test:** Simulate network failure
- **Expected:** Error message displays, graceful degradation
- **Verify:** Error caught in service/hook
- **Edge Cases:** Timeout, connection lost

#### 7.2 RLS Denial
- **Test:** Attempt unauthorized operation
- **Expected:** Permission denied error
- **Verify:** `CustomerServiceError.PERMISSION_DENIED`
- **Edge Cases:** Role change during session

#### 7.3 Empty State
- **Test:** View empty customer list
- **Expected:** Empty state message displays
- **Verify:** UI handles empty data
- **Edge Cases:** Zero customers, filtered to zero

#### 7.4 Validation Error
- **Test:** Submit invalid customer data
- **Expected:** Validation error displays
- **Verify:** `CustomerServiceError.VALIDATION_ERROR`
- **Edge Cases:** Invalid email, missing required fields

#### 7.5 Not Found Error
- **Test:** Request non-existent customer
- **Expected:** Not found error displays
- **Verify:** `CustomerServiceError.NOT_FOUND`
- **Edge Cases:** Deleted customer, invalid ID

#### 7.6 Conflict Error
- **Test:** Attempt conflicting operation
- **Expected:** Conflict error displays
- **Verify:** `CustomerServiceError.CONFLICT`
- **Edge Cases:** Concurrent edits, duplicate data

---

### 8. Integration Tests

#### 8.1 End-to-End Customer Creation
- **Test:** Create customer from UI to database
- **Expected:** Customer appears in list, profile accessible
- **Verify:** Full flow works
- **Edge Cases:** Validation failures

#### 8.2 End-to-End Customer Update
- **Test:** Update customer from UI to database
- **Expected:** Changes persist across sessions
- **Verify:** Full flow works
- **Edge Cases:** Concurrent updates

#### 8.3 End-to-End Customer Deletion
- **Test:** Delete customer from UI
- **Expected:** Customer removed from list, soft delete in DB
- **Verify:** Full flow works
- **Edge Cases:** Restore attempt

#### 8.4 End-to-End Lifecycle Transition
- **Test:** Transition customer through lifecycle
- **Expected:** All valid transitions work
- **Verify:** Full lifecycle flow
- **Edge Cases:** Invalid transitions

---

### 9. Performance Tests

#### 9.1 Large Dataset
- **Test:** Load 1000+ customers
- **Expected:** Page loads within acceptable time
- **Verify:** Pagination works efficiently
- **Edge Cases:** Very large dataset

#### 9.2 Concurrent Requests
- **Test:** Multiple simultaneous requests
- **Expected:** All requests complete successfully
- **Verify:** No race conditions
- **Edge Cases:** High concurrency

#### 9.3 Search Performance
- **Test:** Search across large dataset
- **Expected:** Results return quickly
- **Verify:** Search query efficient
- **Edge Cases:** Complex search

---

### 10. Security Tests

#### 10.1 SQL Injection
- **Test:** Attempt SQL injection in search
- **Expected:** Query sanitized, no injection
- **Verify:** Parameterized queries
- **Edge Cases:** Various injection patterns

#### 10.2 XSS Prevention
- **Test:** Attempt XSS in customer notes
- **Expected:** Content sanitized, no script execution
- **Verify:** Output encoding
- **Edge Cases:** Various XSS patterns

#### 10.3 CSRF Protection
- **Test:** Attempt CSRF attack
- **Expected:** Request blocked
- **Verify:** CSRF token validation
- **Edge Cases:** Token manipulation

---

## Test Execution Order

1. **Unit Tests** (Domain Layer)
   - CustomerLifecycle tests
   - CustomerMetricsCalculator tests
   - CustomerMapper tests

2. **Integration Tests** (Service Layer)
   - CustomerService tests
   - Repository tests

3. **Hook Tests** (Hook Layer)
   - useCustomers tests
   - useCustomer tests
   - useCustomerMetrics tests
   - useCustomerHistory tests

4. **E2E Tests** (UI Layer)
   - Customer List page
   - Customer Detail page
   - Customer Edit flow

5. **Security Tests**
   - RLS policy tests
   - Permission tests
   - Security vulnerability tests

---

## Success Criteria

All tests pass when:

- ✅ All unit tests pass
- ✅ All integration tests pass
- ✅ All hook tests pass
- ✅ All E2E tests pass
- ✅ All security tests pass
- ✅ No critical bugs
- ✅ Performance acceptable
- ✅ Error handling robust
- ✅ Permissions enforced
- ✅ Data integrity maintained

---

## Notes

- Tests should be automated where possible
- Manual tests should have clear steps
- Test data should be realistic
- Edge cases must be covered
- Security tests are critical
- Performance tests should use realistic load
