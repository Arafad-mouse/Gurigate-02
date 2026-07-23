# Customer Migration Checklist

**Phase:** 1A - Customer Capability Migration
**Created:** 2026-06-03
**Purpose:** Track migration progress from mock data to Supabase-backed implementation

---

## Phase 1A: Customer Capability Migration

### Foundation Layer

- [ ] **Domain Layer Complete**
  - [ ] CustomerTypes.ts created with all domain types
  - [ ] CustomerLifecycle.ts created with state machine
  - [ ] CustomerMetrics.ts created with calculator
  - [ ] CustomerMapper.ts created with transformations
  - [ ] CustomerServiceContract.ts created with service interface
  - [ ] CUSTOMER_DOMAIN_MODEL.md documented

- [ ] **Repository Layer Complete**
  - [ ] customerRepository.ts implements all CRUD operations
  - [ ] customerRepository.ts implements search and filters
  - [ ] customerRepository.ts implements metrics queries
  - [ ] customerRepository.ts implements history queries
  - [ ] customerRepository.ts uses Supabase types only
  - [ ] customerRepository.ts no mock data

- [ ] **Service Contract Complete**
  - [ ] ICustomerService interface defined
  - [ ] All service methods specified
  - [ ] Error types defined
  - [ ] Error codes defined
  - [ ] Contract documented

### Service Layer

- [ ] **customerService Refactored**
  - [ ] Implements ICustomerService contract
  - [ ] Uses customerRepository (not Supabase directly)
  - [ ] Returns domain entities (not database rows)
  - [ ] Implements business logic (lifecycle, metrics)
  - [ ] Implements permission checks
  - [ ] Error handling with CustomerServiceError
  - [ ] Mock data removed
  - [ ] All methods tested

### Hook Layer

- [ ] **useCustomers Hook Refactored**
  - [ ] Uses customerService (not mock data)
  - [ ] Returns domain entities
  - [ ] Implements loading states
  - [ ] Implements error handling
  - [ ] Implements pagination
  - [ ] Implements search
  - [ ] Implements filters
  - [ ] Implements refetch
  - [ ] Mock data removed

- [ ] **useCustomer Hook Refactored**
  - [ ] Uses customerService (not mock data)
  - [ ] Returns domain entities
  - [ ] Returns customer metrics
  - [ ] Returns customer history
  - [ ] Implements loading states
  - [ ] Implements error handling
  - [ ] Implements lifecycle operations
  - [ ] Implements tag operations
  - [ ] Implements property assignment
  - [ ] Mock data removed

### Page Layer

- [ ] **Customer List Page Connected**
  - [ ] Uses useCustomers hook
  - [ ] Displays real customer data
  - [ ] Pagination works
  - [ ] Search works
  - [ ] Filters work
  - [ ] Sort works
  - [ ] Export to CSV works
  - [ ] Loading states work
  - [ ] Error states work
  - [ ] Empty states work
  - [ ] Mock data removed

- [ ] **Customer Detail Page Connected**
  - [ ] Uses useCustomer hook
  - [ ] Displays real customer data
  - [ ] Profile section works
  - [ ] Metrics section works
  - [ ] Loading states work
  - [ ] Error states work
  - [ ] Mock data removed

- [ ] **Customer Edit Flow Connected**
  - [ ] Create customer works
  - [ ] Update customer works
  - [ ] Delete customer works
  - [ ] Suspend customer works
  - [ ] Restore customer works
  - [ ] Add tag works
  - [ ] Remove tag works
  - [ ] Update notes works
  - [ ] Assign property works
  - [ ] Remove property works
  - [ ] Form validation works
  - [ ] Success states work
  - [ ] Error states work
  - [ ] Mock data removed

### History Layer

- [ ] **Booking History Connected**
  - [ ] Displays real booking data
  - [ ] Pagination works
  - [ ] Sort works
  - [ ] Link to booking details works
  - [ ] Loading states work
  - [ ] Empty states work
  - [ ] Mock data removed

- [ ] **Payment History Connected**
  - [ ] Displays real payment data
  - [ ] Pagination works
  - [ ] Sort works
  - [ ] Link to payment details works
  - [ ] Loading states work
  - [ ] Empty states work
  - [ ] Mock data removed

- [ ] **Contract History Connected**
  - [ ] Displays real contract data
  - [ ] Pagination works
  - [ ] Sort works
  - [ ] Link to contract details works
  - [ ] Loading states work
  - [ ] Empty states work
  - [ ] Mock data removed

### Metrics Layer

- [ ] **Metrics Connected**
  - [ ] Displays real metrics data
  - [ ] Total bookings accurate
  - [ ] Active contracts accurate
  - [ ] Total paid accurate
  - [ ] Outstanding balance accurate
  - [ ] Last activity date accurate
  - [ ] Last payment accurate
  - [ ] Current property accurate
  - [ ] Health score accurate
  - [ ] Dashboard metrics accurate
  - [ ] Mock data removed

### Cleanup Layer

- [ ] **Mock Data Removed**
  - [ ] MOCK_CUSTOMERS deleted
  - [ ] mockMetricsFor deleted
  - [ ] shouldFail deleted
  - [ ] All mock functions deleted
  - [ ] Mock imports removed
  - [ ] No mock data references

### Verification Layer

- [ ] **Build Passes**
  - [ ] TypeScript compiles without errors
  - [ ] No type errors
  - [ ] No lint errors
  - [ ] Production build succeeds

- [ ] **Type Check Passes**
  - [ ] All domain types used correctly
  - [ ] No database types in UI
  - [ ] No domain types in repository
  - [ ] Service returns domain entities
  - [ ] Hooks return domain entities
  - [ ] Components consume domain entities

- [ ] **RLS Verified**
  - [ ] Users can view own customer profile
  - [ ] Admins can view all customers
  - [ ] Admins can manage customers
  - [ ] Managers can view assigned property customers
  - [ ] Permission checks work in service
  - [ ] Unauthorized access blocked

- [ ] **Runtime Verified**
  - [ ] Customer list loads
  - [ ] Customer detail loads
  - [ ] Customer create works
  - [ ] Customer update works
  - [ ] Customer delete works
  - [ ] Search works
  - [ ] Filters work
  - [ ] Pagination works
  - [ ] Metrics display correctly
  - [ ] History displays correctly
  - [ ] Lifecycle transitions work
  - [ ] No console errors
  - [ ] No runtime errors

### Documentation Layer

- [ ] **Documentation Updated**
  - [ ] CUSTOMER_CAPABILITY_SPEC.md complete
  - [ ] CUSTOMER_DOMAIN_MODEL.md complete
  - [ ] CUSTOMER_MIGRATION_CHECKLIST.md complete
  - [ ] PHASE1A_CUSTOMER_CAPABILITY_COMPLETE.md generated
  - [ ] TYPE_MISMATCH_REPORT.md updated
  - [ ] Architecture decisions documented

---

## Success Criteria

Phase 1A is complete when:

1. ✅ All domain layer files created and documented
2. ✅ Service contract defined and implemented
3. ✅ customerRepository uses Supabase (no mock data)
4. ✅ customerService uses repository (no Supabase direct)
5. ✅ customerService returns domain entities
6. ✅ Hooks use customerService (no mock data)
7. ✅ Hooks return domain entities
8. ✅ Pages use hooks (no mock data)
9. ✅ All customer data is real (no mock data)
10. ✅ Build passes without errors
11. ✅ Type check passes without errors
12. ✅ RLS policies enforce correctly
13. ✅ Runtime verification passes
14. ✅ Documentation complete
15. ✅ PHASE1A_CUSTOMER_CAPABILITY_COMPLETE.md generated

---

## Next Phase

After Phase 1A completion:

- Generate `/phase-reports/PHASE1A_CUSTOMER_CAPABILITY_COMPLETE.md`
- Review lessons learned
- Document patterns for future capabilities
- Begin Phase 1B: Property Capability Migration (using Customer as reference)

---

## Notes

- **Critical Rule:** Never allow UI to depend directly on repository methods
- **Critical Rule:** Never allow UI to consume database rows
- **Critical Rule:** Service must orchestrate business logic, repository must handle persistence
- **Critical Rule:** All layers must use domain types, not database types
- **Critical Rule:** Complete Customer capability before starting other modules
