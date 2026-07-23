# GuriGate Testing Guide

**Version:** 1.0  
**Date:** June 2, 2026  
**Status:** Production

---

## Executive Summary

This guide provides comprehensive testing strategies and procedures for the GuriGate application. Currently, the application has 0% test coverage, which is a critical gap that needs to be addressed.

**Current Test Coverage:** 0%  
**Target Test Coverage:** 80%  
**Testing Framework:** To be implemented

---

## Testing Strategy

### Test Pyramid

```
        /\
       /E2E\        - 10% (End-to-End)
      /------\
     /Integration\   - 30% (Integration Tests)
    /------------\
   /   Unit Tests  \  - 60% (Unit Tests)
  /----------------\
```

### Test Categories

1. **Unit Tests** - Individual component and function tests
2. **Integration Tests** - Service and API integration tests
3. **E2E Tests** - End-to-end user flow tests
4. **Security Tests** - RLS policy and permission tests
5. **Performance Tests** - Load and stress tests

---

## Recommended Testing Framework

### Frontend Testing

**Framework:** Vitest + React Testing Library

**Installation:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Configuration (vitest.config.ts):**
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
})
```

### Backend Testing

**Framework:** Supabase Test Framework + pgTAP

**Tools:**
- pgTAP for database testing
- Supabase CLI for local testing
- Postman for API testing

---

## Unit Testing

### Component Testing

**Example Test Structure:**

```typescript
// src/components/__tests__/PropertyCard.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PropertyCard from '../PropertyCard'

describe('PropertyCard', () => {
  const mockProperty = {
    id: '1',
    title: 'Modern Apartment',
    price: '$450,000',
    rating: 4.8,
    image: 'https://example.com/image.jpg',
  }

  it('renders property information', () => {
    render(<PropertyCard property={mockProperty} />)
    expect(screen.getByText('Modern Apartment')).toBeInTheDocument()
    expect(screen.getByText('$450,000')).toBeInTheDocument()
  })

  it('calls onLike when like button is clicked', () => {
    const onLike = vi.fn()
    render(<PropertyCard property={mockProperty} onLike={onLike} />)
    const likeButton = screen.getByRole('button', { name: /like/i })
    likeButton.click()
    expect(onLike).toHaveBeenCalledOnce()
  })
})
```

### Hook Testing

**Example Test Structure:**

```typescript
// src/hooks/__tests__/useAuth.test.ts
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useAuth } from '../useAuth'

describe('useAuth', () => {
  it('returns user data when authenticated', async () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.user).toBeDefined()
  })

  it('signs out user', async () => {
    const { result } = renderHook(() => useAuth())
    await act(async () => {
      await result.current.signOut()
    })
    expect(result.current.user).toBeNull()
  })
})
```

### Service Testing

**Example Test Structure:**

```typescript
// src/services/__tests__/adminService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AdminService } from '../adminService'

describe('AdminService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches dashboard KPIs', async () => {
    const kpis = await AdminService.getDashboardKPIs()
    expect(kpis).toHaveProperty('totalProperties')
    expect(kpis).toHaveProperty('pendingApprovals')
  })

  it('approves property', async () => {
    const result = await AdminService.approveProperty('property-id')
    expect(result.approval_status).toBe('approved')
  })
})
```

---

## Integration Testing

### API Integration Tests

**Example Test Structure:**

```typescript
// src/integration/__tests__/propertyAPI.test.ts
import { describe, it, expect } from 'vitest'
import { supabase } from '@/lib/supabase'

describe('Property API Integration', () => {
  it('creates and retrieves property', async () => {
    const property = {
      title: 'Test Property',
      owner_id: 'test-user-id',
      approval_status: 'pending',
    }

    const { data: created, error: createError } = await supabase
      .from('properties')
      .insert(property)
      .select()
      .single()

    expect(createError).toBeNull()
    expect(created).toHaveProperty('id')

    const { data: retrieved } = await supabase
      .from('properties')
      .select()
      .eq('id', created.id)
      .single()

    expect(retrieved.title).toBe('Test Property')
  })
})
```

### Database Integration Tests

**Example Test Structure:**

```sql
-- supabase/tests/property_tests.sql
BEGIN;

-- Test property creation
INSERT INTO properties (owner_id, title, approval_status)
VALUES ('test-user-id', 'Test Property', 'pending');

-- Verify property was created
SELECT * FROM properties WHERE title = 'Test Property';

-- Test RLS policy
SET ROLE authenticated;
SELECT * FROM properties WHERE owner_id = auth.uid();

ROLLBACK;
```

---

## E2E Testing

### Playwright Setup

**Installation:**
```bash
npm install -D @playwright/test
```

**Configuration (playwright.config.ts):**
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
```

### Example E2E Test

```typescript
// e2e/booking.spec.ts
import { test, expect } from '@playwright/test'

test('complete booking flow', async ({ page }) => {
  // Navigate to property
  await page.goto('/property/1')
  
  // Select dates
  await page.fill('[data-testid="check-in"]', '2026-06-01')
  await page.fill('[data-testid="check-out"]', '2026-06-05')
  
  // Click reserve
  await page.click('[data-testid="reserve-button"]')
  
  // Verify redirect to payment
  await expect(page).toHaveURL('/payment')
  
  // Complete payment
  await page.selectOption('[data-testid="payment-method"]', 'dodo')
  await page.click('[data-testid="pay-button"]')
  
  // Verify booking confirmation
  await expect(page.locator('[data-testid="booking-confirmation"]')).toBeVisible()
})
```

---

## Security Testing

### RLS Policy Testing

**Test Structure:**

```sql
-- Test property RLS policies
BEGIN;

-- Test 1: Public users can only view approved properties
SET ROLE anon;
SELECT COUNT(*) FROM properties WHERE approval_status = 'approved';
-- Should return count
SELECT COUNT(*) FROM properties WHERE approval_status = 'pending';
-- Should return 0

-- Test 2: Property owners can view their own properties
SET ROLE authenticated;
SELECT COUNT(*) FROM properties WHERE owner_id = auth.uid();
-- Should return count

-- Test 3: Admins can view all properties
UPDATE profiles SET role = 'admin' WHERE id = auth.uid();
SELECT COUNT(*) FROM properties;
-- Should return total count

ROLLBACK;
```

### Permission Testing

**Test Structure:**

```typescript
// src/security/__tests__/permissions.test.ts
import { describe, it, expect } from 'vitest'
import { hasPermission } from '@/lib/permissions'

describe('Permission System', () => {
  it('grants approve property permission to admin', () => {
    const profile = { role: 'admin', permissions: [] }
    const result = hasPermission(profile, 'CAN_APPROVE_PROPERTY')
    expect(result).toBe(true)
  })

  it('denies approve property permission to guest', () => {
    const profile = { role: 'guest', permissions: [] }
    const result = hasPermission(profile, 'CAN_APPROVE_PROPERTY')
    expect(result).toBe(false)
  })

  it('grants custom permission if assigned', () => {
    const profile = { role: 'guest', permissions: ['CAN_APPROVE_PROPERTY'] }
    const result = hasPermission(profile, 'CAN_APPROVE_PROPERTY')
    expect(result).toBe(true)
  })
})
```

---

## Performance Testing

### Load Testing

**Tool:** k6

**Example Script:**

```javascript
// load-tests/property-search.js
import http from 'k6/http'
import { check, sleep } from 'k6'

export let options = {
  stages: [
    { duration: '30s', target: 100 },
    { duration: '1m', target: 200 },
    { duration: '20s', target: 0 },
  ],
}

export default function () {
  const response = http.get('https://api.gurigate.com/rest/v1/properties')
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  })
  sleep(1)
}
```

---

## Test Coverage Goals

### Minimum Coverage by Module

- **Marketplace:** 80%
- **RMS:** 70% (when implemented)
- **Customer:** 80%
- **Inbox:** 75%
- **Admin:** 85%
- **Services:** 90%
- **Hooks:** 85%
- **Utils:** 95%

---

## Test Execution

### Run All Tests

```bash
# Unit and integration tests
npm test

# E2E tests
npx playwright test

# Load tests
k6 run load-tests/property-search.js
```

### Run Specific Tests

```bash
# Unit tests only
npm test -- --run

# Specific file
npm test PropertyCard.test.tsx

# Watch mode
npm test -- --watch
```

### Coverage Report

```bash
npm test -- --coverage
```

Coverage report will be generated in `coverage/` directory.

---

## Continuous Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm test -- --run
      
      - name: Run E2E tests
        run: npx playwright test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Test Data Management

### Fixtures

Create test fixtures in `src/test/fixtures/`:

```typescript
// src/test/fixtures/properties.ts
export const mockProperties = [
  {
    id: '1',
    title: 'Test Property 1',
    approval_status: 'approved',
  },
  {
    id: '2',
    title: 'Test Property 2',
    approval_status: 'pending',
  },
]
```

### Test Database

Use separate test database or use transactions that roll back:

```typescript
beforeEach(async () => {
  // Setup test data
  await supabase.from('properties').insert(mockProperties)
})

afterEach(async () => {
  // Cleanup test data
  await supabase.from('properties').delete().in('id', mockProperties.map(p => p.id))
})
```

---

## Testing Best Practices

### Unit Tests

- Test individual functions in isolation
- Mock external dependencies
- Use descriptive test names
- Test happy path and error cases
- Keep tests fast (< 100ms each)

### Integration Tests

- Test real database interactions
- Use test database or transactions
- Test API contracts
- Verify data persistence
- Clean up after tests

### E2E Tests

- Test critical user flows
- Use realistic test data
- Test across browsers
- Keep tests stable
- Use page objects for reusability

---

## Common Testing Scenarios

### Authentication Flow

```typescript
test('user can sign up and sign in', async ({ page }) => {
  await page.goto('/signup')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('[type="submit"]')
  
  await expect(page).toHaveURL('/')
  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
})
```

### Property Approval Flow

```typescript
test('admin can approve property', async ({ page }) => {
  // Login as admin
  await loginAsAdmin(page)
  
  // Navigate to properties
  await page.goto('/admin/properties')
  
  // Approve property
  await page.click('[data-testid="approve-property-1"]')
  
  // Verify approval
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
})
```

### Payment Flow

```typescript
test('user can complete payment', async ({ page }) => {
  await page.goto('/payment')
  await page.selectOption('[data-testid="payment-method"]', 'zaad')
  await page.fill('[data-testid="wallet-phone"]', '+252612345678')
  await page.click('[data-testid="submit-payment"]')
  
  await expect(page).toHaveURL('/booking/confirmation')
})
```

---

## Debugging Tests

### Vitest Debugging

```bash
# Run tests in debug mode
npm test -- --inspect-brk --no-coverage
```

### Playwright Debugging

```bash
# Run tests in headed mode
npx playwright test --headed

# Run with UI mode
npx playwright test --ui
```

---

## Test Maintenance

### Regular Tasks

- Update tests when features change
- Remove obsolete tests
- Refactor duplicate test code
- Update test data
- Review and improve test coverage

### Test Review Checklist

- Are tests passing?
- Is coverage adequate?
- Are tests fast enough?
- Are tests stable (no flakiness)?
- Are tests well-documented?
- Are tests maintainable?

---

**Document Owner:** Development Team  
**Last Updated:** June 2, 2026  
**Next Review:** After test framework implementation
