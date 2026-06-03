# Service Migration Plan

**Generated:** 2026-06-02
**Scope:** Detailed migration plan for replacing mock services with Supabase-backed implementations
**Purpose:** Provide step-by-step migration sequence with dependencies, testing, and verification

---

## Migration Strategy

### Approach: Incremental, Dependency-First Migration

**Principles:**

1. **Database-first:** Apply schema migrations before service migration
2. **Type-safe:** Generate and align TypeScript types before implementation
3. **Test-driven:** Write integration tests for each service before migration
4. **Feature-flagged:** Use feature flags to enable migrated services gradually
5. **Rollback-ready:** Keep mock code behind flags until fully verified

### Migration Phases

| Phase | Services | Duration | Dependencies |
|-------|----------|----------|--------------|
| Phase 0 | Schema & Types | 1 day | None |
| Phase 1 | Customer Service | 2-3 days | Phase 0 |
| Phase 2 | Property Services | 2 days | Phase 0 |
| Phase 3 | Payment Service | 1 day | Phase 0 |
| Phase 4 | Messaging Service | 2-3 days | Phase 0 |
| Phase 5 | RMS Service | 2-3 days | Phase 0 |
| Phase 6 | Organizations & Subscriptions | 2 days | Phase 0 |
| Phase 7 | Commissions & Maintenance | 1-2 days | Phase 0 |
| Phase 8 | Booking Guests | 1 day | Phase 0 |

**Total Estimated Duration:** 14-18 days

---

## Phase 0: Schema & Types Foundation

### Objective: Ensure database schema is current and types are generated

### Tasks

**0.1 Apply Pending Migration**

- Apply migration `20260602_missing_modules.sql` to create missing tables
- Verify all tables created: `customers`, `organizations`, `organization_members`, `subscriptions`, `commissions`, `maintenance_requests`, `booking_guests`
- Verify all enums created: `commission_source`, `subscriber_type`, `maintenance_priority`, `maintenance_status`, `customer_type`, `lifecycle_status`
- Verify all views created: `active_subscriptions_view`, `customer_metrics_view`, `maintenance_requests_view`, `booking_guests_view`

**Verification:**

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('customers', 'organizations', 'subscriptions', 'commissions', 'maintenance_requests', 'booking_guests');

-- Check enums exist
SELECT typname FROM pg_type WHERE typtype = 'e';

-- Check views exist
SELECT table_name FROM information_schema.views 
WHERE table_schema = 'public';
```

**0.2 Regenerate Supabase Types**

```bash
cd frontend
supabase gen types typescript --linked --schema public > src/integrations/supabase/types.ts
```

**Verification:**

- File `src/integrations/supabase/types.ts` exists and is readable
- File size > 70KB (indicates full schema export)
- No null bytes in file

**0.3 Update Type Definitions**

- Update `src/types/customer.ts` to align with database schema
- Update `frontend/src/types/payment.ts` to align with `payment_status` enum
- Update `frontend/src/types/property.ts` to align with `property_type` and `property_status` enums
- Create new type files for messaging, RMS, organizations, subscriptions, commissions, maintenance, booking_guests

**Verification:**

- All type files compile without errors
- No `any` types in type definitions
- All enums match database enum values exactly

**Exit Criteria:**

- ✅ Migration applied successfully
- ✅ Types generated successfully
- ✅ All type files updated and compile
- ✅ No type errors in TypeScript compilation

---

## Phase 1: Customer Service Migration

### Objective: Replace fully mock-based customer service with Supabase implementation

### Dependencies

- Phase 0 complete (schema and types)

### Tasks

**1.1 Create Customer Repository**

**File:** `src/repositories/customerRepository.ts`

```typescript
import { supabase } from '@/lib/supabase';
import type { Database } from '@/integrations/supabase/types';

type CustomerRow = Database['public']['Tables']['customers']['Row'];
type CustomerInsert = Database['public']['Tables']['customers']['Insert'];
type CustomerUpdate = Database['public']['Tables']['customers']['Update'];

export class CustomerRepository {
  static async list(params: {
    query?: string;
    customer_type?: string;
    lifecycle_status?: string;
    page?: number;
    pageSize?: number;
  }) {
    let query = supabase
      .from('customers')
      .select('*', { count: 'exact' });

    if (params.query) {
      query = query.or(`full_name.ilike.%${params.query}%,email.ilike.%${params.query}%,phone.ilike.%${params.query}%`);
    }

    if (params.customer_type && params.customer_type !== 'all') {
      query = query.eq('customer_type', params.customer_type);
    }

    if (params.lifecycle_status && params.lifecycle_status !== 'all') {
      query = query.eq('lifecycle_status', params.lifecycle_status);
    }

    if (params.page && params.pageSize) {
      const from = (params.page - 1) * params.pageSize;
      const to = from + params.pageSize - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return { items: data || [], total: count || 0 };
  }

  static async getById(id: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return data;
  }

  static async create(customer: CustomerInsert) {
    const { data, error } = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  static async update(id: string, updates: CustomerUpdate) {
    const { data, error } = await supabase
      .from('customers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  static async getBookings(customerId: string, page = 1, pageSize = 10) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('bookings')
      .select('*, properties(title)', { count: 'exact' })
      .eq('guest_id', customerId)
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { items: data || [], total: count || 0 };
  }

  static async getPayments(customerId: string, page = 1, pageSize = 10) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('payments')
      .select('*', { count: 'exact' })
      .or(`payee_id.eq.${customerId},payer_id.eq.${customerId}`)
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { items: data || [], total: count || 0 };
  }

  static async getContracts(customerId: string, page = 1, pageSize = 10) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('contracts')
      .select('*, properties(title), units(unit_number)', { count: 'exact' })
      .eq('tenant_id', customerId)
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { items: data || [], total: count || 0 };
  }

  static async getMetrics(customerId: string) {
    // Use customer_metrics_view if available, otherwise compute manually
    const { data, error } = await supabase
      .from('customer_metrics_view')
      .select('*')
      .eq('customer_id', customerId)
      .single();

    if (error) {
      // Fallback to manual computation
      const [bookings, payments, contracts] = await Promise.all([
        this.getBookings(customerId, 1, 1000),
        this.getPayments(customerId, 1, 1000),
        this.getContracts(customerId, 1, 1000),
      ]);

      const totalRentPaid = payments.items
        .filter(p => p.reference_type === 'rent' && p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);

      const activeContract = contracts.items.find(c => c.status === 'active');
      const outstandingBalance = activeContract
        ? Math.max(0, activeContract.monthly_rent - totalRentPaid)
        : 0;

      return {
        total_bookings: bookings.total,
        total_rent_paid: totalRentPaid,
        outstanding_balance: outstandingBalance,
        active_contract: activeContract,
      };
    }

    return data;
  }
}
```

**1.2 Update Customer Service**

**File:** `src/services/customerService.ts`

- Replace `MOCK_CUSTOMERS` array with `CustomerRepository` calls
- Replace `mockMetricsFor` with `CustomerRepository.getMetrics`
- Remove `shouldFail` function
- Implement real-time subscriptions using Supabase Realtime
- Update function signatures to match database schema

**1.3 Update Customer Types**

**File:** `src/types/customer.ts`

- Change `fullName` to `full_name` (snake_case to match database)
- Change `customerType` to `customer_type`
- Change `lifecycleStatus` to `lifecycle_status`
- Change `currentProperty` to `current_property_id` (use ID instead of display string)
- Update `BookingSummary`, `PaymentSummary`, `ContractSummary` to use database IDs
- Remove derived fields that will be computed from database views

**1.4 Write Integration Tests**

**File:** `src/services/__tests__/customerService.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CustomerRepository } from '../customerRepository';

describe('CustomerRepository', () => {
  const testCustomerId = 'test-customer-id';

  beforeEach(async () => {
    // Create test customer
    await CustomerRepository.create({
      profile_id: testCustomerId,
      customer_type: 'tenant',
      lifecycle_status: 'active',
    });
  });

  afterEach(async () => {
    // Cleanup test data
    await supabase.from('customers').delete().eq('profile_id', testCustomerId);
  });

  it('should list customers', async () => {
    const result = await CustomerRepository.list({ page: 1, pageSize: 10 });
    expect(result.items).toBeDefined();
    expect(result.total).toBeGreaterThanOrEqual(0);
  });

  it('should get customer by ID', async () => {
    const customer = await CustomerRepository.getById(testCustomerId);
    expect(customer).toBeDefined();
    expect(customer?.profile_id).toBe(testCustomerId);
  });

  it('should create customer', async () => {
    const newCustomer = await CustomerRepository.create({
      profile_id: 'new-test-id',
      customer_type: 'guest',
      lifecycle_status: 'lead',
    });

    expect(newCustomer).toBeDefined();
    expect(newCustomer.profile_id).toBe('new-test-id');

    // Cleanup
    await supabase.from('customers').delete().eq('profile_id', 'new-test-id');
  });

  it('should update customer', async () => {
    const updated = await CustomerRepository.update(testCustomerId, {
      lifecycle_status: 'inactive',
    });

    expect(updated).toBeDefined();
    expect(updated?.lifecycle_status).toBe('inactive');
  });
});
```

**1.5 Update UI Components**

**Files to update:**

- All components using `customerService`
- Update to handle new field names (snake_case)
- Update to handle database IDs instead of display strings
- Add loading states for async operations
- Add error boundaries for failed queries

**1.6 Feature Flag Integration**

```typescript
// src/config/featureFlags.ts
export const FEATURE_FLAGS = {
  USE_REAL_CUSTOMER_SERVICE: import.meta.env.VITE_USE_REAL_CUSTOMER_SERVICE === 'true',
};

// src/services/customerService.ts
import { FEATURE_FLAGS } from '@/config/featureFlags';

export async function listCustomers(params: ListParams) {
  if (FEATURE_FLAGS.USE_REAL_CUSTOMER_SERVICE) {
    return CustomerRepository.list(params);
  }
  // Fallback to mock for gradual rollout
  return mockListCustomers(params);
}
```

**Testing Strategy:**

1. **Unit Tests:** Test repository functions in isolation
2. **Integration Tests:** Test service layer with mock Supabase client
3. **E2E Tests:** Test full user flows with test database
4. **RLS Tests:** Verify row-level security policies work correctly

**Verification:**

- ✅ All tests pass
- ✅ No mock data in production builds
- ✅ RLS policies prevent unauthorized access
- ✅ Real-time subscriptions receive updates
- ✅ Error handling works correctly
- ✅ TypeScript compilation succeeds

**Rollback Plan:**

- Keep mock code behind feature flag until verified
- If critical issues found, disable feature flag to revert to mock
- Monitor error rates and performance metrics

**Exit Criteria:**

- ✅ All customer service functions use Supabase
- ✅ No mock data arrays remaining
- ✅ All tests passing
- ✅ RLS policies verified
- ✅ Feature flag enabled in production
- ✅ No performance degradation

---

## Phase 2: Property Services Migration

### Objective: Improve property services with transaction handling and remove mock code

### Dependencies

- Phase 0 complete

### Tasks

**2.1 Add Transaction Support to Property Service**

**File:** `frontend/src/services/properties.ts`

- Implement Supabase RPC function for property creation with transaction
- Add rollback handling for partial failures
- Implement `incrementViewCount` with actual database update

**RPC Function to Create:**

```sql
-- supabase/migrations/20260603_property_transaction.sql
CREATE OR REPLACE FUNCTION create_property_with_relations(
  p_title TEXT,
  p_description TEXT,
  p_type TEXT,
  p_owner_id UUID,
  p_address JSONB,
  p_pricing JSONB,
  p_features JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_property_id UUID;
  v_result JSONB;
BEGIN
  -- Start transaction (implicit in function)
  INSERT INTO properties (title, description, type, owner_id)
  VALUES (p_title, p_description, p_type, p_owner_id)
  RETURNING id INTO v_property_id;

  INSERT INTO property_addresses (property_id, street, city, state, postal_code, country)
  VALUES (
    v_property_id,
    p_address->>'street',
    p_address->>'city',
    p_address->>'state',
    p_address->>'postal_code',
    p_address->>'country'
  );

  INSERT INTO property_pricing (property_id, base_price, currency, pricing_type)
  VALUES (
    v_property_id,
    (p_pricing->>'base_price')::NUMERIC,
    p_pricing->>'currency',
    p_pricing->>'pricing_type'
  );

  INSERT INTO property_features (property_id, bedrooms, bathrooms, max_guests, square_feet)
  VALUES (
    v_property_id,
    (p_features->>'bedrooms')::INTEGER,
    (p_features->>'bathrooms')::INTEGER,
    (p_features->>'max_guests')::INTEGER,
    (p_features->>'square_feet')::INTEGER
  );

  v_result := jsonb_build_object('id', v_property_id, 'success', true);

  RETURN v_result;

EXCEPTION WHEN OTHERS THEN
  -- Transaction will rollback automatically
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
```

**Updated Property Service:**

```typescript
static async createProperty(propertyData: CreatePropertyRequest & {
  badge: PropertyBadge;
  price_unit_label: string;
}): Promise<Property> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase.rpc('create_property_with_relations', {
    p_title: propertyData.title,
    p_description: propertyData.description,
    p_type: propertyData.type,
    p_owner_id: user.id,
    p_address: propertyData.address,
    p_pricing: propertyData.pricing,
    p_features: propertyData.features,
  });

  if (error) {
    console.error('Property creation error:', error);
    throw new Error(error.message || 'Failed to create property');
  }

  if (!data || !data.success) {
    throw new Error(data?.error || 'Failed to create property');
  }

  return this.getPropertyById(data.id);
}

static async incrementViewCount(propertyId: string): Promise<void> {
  const { error } = await supabase.rpc('increment_property_view_count', {
    p_property_id: propertyId,
  });

  if (error) {
    console.error('Failed to increment view count:', error);
    // Non-critical, don't throw
  }
}
```

**2.2 Verify Views Exist**

- Check if `featured_properties` view exists in database
- If not, create view from migration

**2.3 Update Type Conversions**

- Remove unnecessary type conversions in `guriGateProperties.ts`
- Use Supabase types directly where possible
- Add proper error handling for missing relationships

**Verification:**

- ✅ Property creation uses transaction
- ✅ Rollback works on partial failure
- ✅ View count increments correctly
- ✅ No console.log-only implementations
- ✅ Error handling is explicit

**Exit Criteria:**

- ✅ All property operations use transactions
- ✅ No mock code remaining
- ✅ All tests passing

---

## Phase 3: Payment Service Migration

### Objective: Remove mock fallback and improve error handling

### Dependencies

- Phase 0 complete

### Tasks

**3.1 Remove Mock Fallback**

**File:** `frontend/src/services/paymentService.ts`

- Remove `createMockWalletPayment` function
- Remove fallback logic in `createWalletPayment`
- Add explicit error handling
- Add retry logic for transient failures

**Updated Payment Service:**

```typescript
static async createWalletPayment(input: CreateWalletPaymentInput): Promise<PaymentRecord> {
  const phoneError = validateWalletPhone(input.walletPhone);

  if (phoneError) {
    throw new PaymentError(phoneError, "INVALID_WALLET_PHONE");
  }

  const provider = getProviderForMethod(input.method);
  const walletPhone = normalizeWalletPhone(input.walletPhone);

  if (!input.bookingId) {
    throw new PaymentError(
      "Booking must be saved before creating payment.",
      "BOOKING_RECORD_REQUIRED"
    );
  }

  if (!isSupabaseConfigured) {
    throw new PaymentError(
      "Supabase must be configured for payments.",
      "SUPABASE_REQUIRED"
    );
  }

  // Add retry logic
  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await supabase.rpc("create_local_wallet_payment", {
      p_booking_id: input.bookingId,
      p_payment_provider: provider,
      p_payment_method: input.method,
      p_wallet_phone: walletPhone,
    });

    if (!error && data) {
      const [record] = data as WalletPaymentRpcResult[];
      if (record) {
        return mapWalletPayment(record);
      }
    }

    lastError = error;
    // Exponential backoff
    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
  }

  console.error("Wallet payment creation error after retries:", lastError);
  throw new PaymentError(
    lastError?.message || "Unable to submit wallet payment after retries.",
    "WALLET_PAYMENT_FAILED"
  );
}
```

**3.2 Update Payment Types**

- Add `'cancelled'` to `payment_status` enum in database
- Update `PaymentMethodId` to match database enum
- Remove `'cash'` if not needed

**Migration for enum update:**

```sql
-- supabase/migrations/20260603_payment_enum_update.sql
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'cancelled';
```

**Verification:**

- ✅ No mock fallback
- ✅ Explicit error messages
- ✅ Retry logic works
- ✅ All payment methods work

**Exit Criteria:**

- ✅ Mock fallback removed
- ✅ Error handling explicit
- ✅ Retry logic implemented
- ✅ All tests passing

---

## Phase 4: Messaging Service Implementation

### Objective: Implement messaging service from scratch using Supabase Realtime

### Dependencies

- Phase 0 complete

### Tasks

**4.1 Create Messaging Types**

**File:** `frontend/src/types/messaging.ts`

```typescript
export type ConversationType =
  | 'direct'
  | 'booking'
  | 'property'
  | 'payment'
  | 'support'
  | 'system'
  | 'rms_contract'
  | 'rms_tenant'
  | 'rms_unit';

export type ConversationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type ConversationStatus = 'active' | 'archived' | 'closed';

export type MessageContentType =
  | 'text'
  | 'image'
  | 'document'
  | 'property_reference'
  | 'booking_reference'
  | 'payment_reference'
  | 'system';

export interface Conversation {
  id: string;
  type: ConversationType;
  priority: ConversationPriority;
  status: ConversationStatus;
  subject: string | null;
  assigned_to: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, unknown> | null;
  // Related entities
  related_booking_id?: string;
  related_property_id?: string;
  related_payment_id?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  type: MessageContentType;
  created_at: string;
  is_system: boolean | null;
  metadata: Record<string, unknown> | null;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  role: string | null;
  is_admin: boolean | null;
  joined_at: string | null;
  last_read_at: string | null;
}
```

**4.2 Create Messaging Repository**

**File:** `frontend/src/repositories/messagingRepository.ts`

```typescript
import { supabase } from '@/lib/supabase';
import type { Database } from '@/integrations/supabase/types';

export class MessagingRepository {
  static async getConversations(userId: string) {
    const { data, error } = await supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        conversations!inner(*)
      `)
      .eq('user_id', userId);

    if (error) throw error;

    return data?.map(p => p.conversations) || [];
  }

  static async getMessages(conversationId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return data || [];
  }

  static async sendMessage(conversationId: string, senderId: string, content: string, type = 'text') {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        type,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  static async subscribeToMessages(conversationId: string, callback: (message: Message) => void) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => callback(payload.new as Message)
      )
      .subscribe();
  }

  static async markAsRead(conversationId: string, userId: string) {
    const { error } = await supabase
      .from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);

    if (error) throw error;
  }
}
```

**4.3 Create Messaging Service**

**File:** `frontend/src/services/messagingService.ts`

```typescript
import { MessagingRepository } from '@/repositories/messagingRepository';

export class MessagingService {
  static async getConversations(userId: string) {
    return MessagingRepository.getConversations(userId);
  }

  static async getMessages(conversationId: string) {
    return MessagingRepository.getMessages(conversationId);
  }

  static async sendMessage(conversationId: string, content: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    return MessagingRepository.sendMessage(conversationId, user.id, content);
  }

  static subscribeToConversation(conversationId: string, callback: (message: Message) => void) {
    return MessagingRepository.subscribeToMessages(conversationId, callback);
  }

  static async markAsRead(conversationId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    return MessagingRepository.markAsRead(conversationId, user.id);
  }
}
```

**4.4 Enable Realtime**

```sql
-- Enable realtime for messaging tables
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table conversations;
```

**Verification:**

- ✅ Real-time subscriptions receive updates
- ✅ Messages persist correctly
- ✅ RLS policies prevent unauthorized access
- ✅ All tests passing

**Exit Criteria:**

- ✅ Messaging service fully implemented
- ✅ Real-time updates working
- ✅ No mock code

---

## Phase 5: RMS Service Implementation

### Objective: Implement RMS (Rent Management System) service from scratch

### Dependencies

- Phase 0 complete

### Tasks

**5.1 Create RMS Types**

**File:** `frontend/src/types/rms.ts`

```typescript
export type UnitStatus = 'vacant' | 'occupied' | 'maintenance';
export type UnitType = 'room' | 'apartment' | 'shop' | 'office';
export type ContractStatus = 'active' | 'expired' | 'terminated';

export interface Building {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  district: string | null;
  owner_id: string;
  image_url: string | null;
  created_at: string;
}

export interface Unit {
  id: string;
  building_id: string;
  unit_number: string;
  unit_type: UnitType;
  status: UnitStatus;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  monthly_rent: number;
}

export interface Tenant {
  id: string;
  profile_id: string;
  building_id: string;
  unit_id: string;
  move_in_date: string;
  move_out_date: string | null;
}

export interface Contract {
  id: string;
  tenant_id: string;
  unit_id: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  deposit_amount: number;
  status: ContractStatus;
}
```

**5.2 Create RMS Repository**

**File:** `frontend/src/repositories/rmsRepository.ts`

```typescript
import { supabase } from '@/lib/supabase';

export class RMSRepository {
  static async getBuildings(ownerId: string) {
    const { data, error } = await supabase
      .from('buildings')
      .select('*')
      .eq('owner_id', ownerId);

    if (error) throw error;

    return data || [];
  }

  static async getUnits(buildingId: string) {
    const { data, error } = await supabase
      .from('units')
      .select('*')
      .eq('building_id', buildingId);

    if (error) throw error;

    return data || [];
  }

  static async getTenants(buildingId: string) {
    const { data, error } = await supabase
      .from('tenants')
      .select('*, profiles(full_name, email, phone)')
      .eq('building_id', buildingId);

    if (error) throw error;

    return data || [];
  }

  static async getContracts(tenantId?: string, unitId?: string) {
    let query = supabase
      .from('contracts')
      .select('*');

    if (tenantId) query = query.eq('tenant_id', tenantId);
    if (unitId) query = query.eq('unit_id', unitId);

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  }

  static async createContract(contractData: {
    tenant_id: string;
    unit_id: string;
    start_date: string;
    end_date: string;
    monthly_rent: number;
    deposit_amount: number;
  }) {
    const { data, error } = await supabase
      .from('contracts')
      .insert(contractData)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  static async terminateContract(contractId: string) {
    const { data, error } = await supabase
      .from('contracts')
      .update({ 
        status: 'terminated',
        end_date: new Date().toISOString(),
      })
      .eq('id', contractId)
      .select()
      .single();

    if (error) throw error;

    return data;
  }
}
```

**5.3 Create RMS Service**

**File:** `frontend/src/services/rmsService.ts`

```typescript
import { RMSRepository } from '@/repositories/rmsRepository';

export class RMSService {
  static async getBuildings() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    return RMSRepository.getBuildings(user.id);
  }

  static async getUnits(buildingId: string) {
    return RMSRepository.getUnits(buildingId);
  }

  static async getTenants(buildingId: string) {
    return RMSRepository.getTenants(buildingId);
  }

  static async getContracts(filters?: { tenantId?: string; unitId?: string }) {
    return RMSRepository.getContracts(filters?.tenantId, filters?.unitId);
  }

  static async createContract(data: {
    tenant_id: string;
    unit_id: string;
    start_date: string;
    end_date: string;
    monthly_rent: number;
    deposit_amount: number;
  }) {
    return RMSRepository.createContract(data);
  }

  static async terminateContract(contractId: string) {
    return RMSRepository.terminateContract(contractId);
  }
}
```

**Verification:**

- ✅ All CRUD operations work
- ✅ RLS policies enforce ownership
- ✅ All tests passing

**Exit Criteria:**

- ✅ RMS service fully implemented
- ✅ All CRUD operations tested
- ✅ No mock code

---

## Phase 6: Organizations & Subscriptions Implementation

### Objective: Implement multi-tenant organization and subscription management

### Dependencies

- Phase 0 complete

### Tasks

**6.1 Create Organization Types**

**File:** `frontend/src/types/organization.ts`

```typescript
export type SubscriberType = 'individual' | 'organization';
export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled' | 'expired';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
}

export interface Subscription {
  id: string;
  subscriber_type: SubscriberType;
  subscriber_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  start_date: string;
  end_date: string | null;
  monthly_amount: number;
}
```

**6.2 Create Organization Repository**

**File:** `frontend/src/repositories/organizationRepository.ts`

```typescript
import { supabase } from '@/lib/supabase';

export class OrganizationRepository {
  static async getUserOrganizations(userId: string) {
    const { data, error } = await supabase
      .from('organization_members')
      .select(`
        organizations(*)
      `)
      .eq('user_id', userId);

    if (error) throw error;

    return data?.map(m => m.organizations) || [];
  }

  static async createOrganization(name: string, slug: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('organizations')
      .insert({ name, slug, owner_id: user.id })
      .select()
      .single();

    if (error) throw error;

    // Add owner as member
    await this.addMember(data.id, user.id, 'owner');

    return data;
  }

  static async addMember(organizationId: string, userId: string, role: 'admin' | 'member') {
    const { error } = await supabase
      .from('organization_members')
      .insert({
        organization_id: organizationId,
        user_id: userId,
        role,
      });

    if (error) throw error;
  }

  static async removeMember(organizationId: string, userId: string) {
    const { error } = await supabase
      .from('organization_members')
      .delete()
      .eq('organization_id', organizationId)
      .eq('user_id', userId);

    if (error) throw error;
  }
}
```

**6.3 Create Subscription Repository**

**File:** `frontend/src/repositories/subscriptionRepository.ts`

```typescript
import { supabase } from '@/lib/supabase';

export class SubscriptionRepository {
  static async getSubscriptions(subscriberId: string, subscriberType: 'individual' | 'organization') {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('subscriber_id', subscriberId)
      .eq('subscriber_type', subscriberType);

    if (error) throw error;

    return data || [];
  }

  static async createSubscription(data: {
    subscriber_type: SubscriberType;
    subscriber_id: string;
    plan_id: string;
    monthly_amount: number;
  }) {
    const { data: result, error } = await supabase
      .from('subscriptions')
      .insert({
        ...data,
        status: 'active',
        start_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return result;
  }

  static async cancelSubscription(subscriptionId: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ 
        status: 'cancelled',
        end_date: new Date().toISOString(),
      })
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) throw error;

    return data;
  }
}
```

**Verification:**

- ✅ Organization CRUD works
- ✅ Member management works
- ✅ Subscription lifecycle works
- ✅ RLS policies enforce access

**Exit Criteria:**

- ✅ Organizations service implemented
- ✅ Subscriptions service implemented
- ✅ All tests passing

---

## Phase 7: Commissions & Maintenance Implementation

### Objective: Implement finance and operations modules

### Dependencies

- Phase 0 complete

### Tasks

**7.1 Create Commissions Service**

**File:** `frontend/src/services/commissionsService.ts`

```typescript
import { supabase } from '@/lib/supabase';

export class CommissionsService {
  static async getCommissions(filters?: { agentId?: string; status?: string }) {
    let query = supabase.from('commissions').select('*');

    if (filters?.agentId) query = query.eq('agent_id', filters.agentId);
    if (filters?.status) query = query.eq('status', filters.status);

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  }

  static async createCommission(data: {
    agent_id: string;
    booking_id: string;
    amount: number;
    source: 'booking' | 'rental' | 'referral';
  }) {
    const { data: result, error } = await supabase
      .from('commissions')
      .insert({
        ...data,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    return result;
  }

  static async updateCommissionStatus(commissionId: string, status: string) {
    const { data, error } = await supabase
      .from('commissions')
      .update({ status })
      .eq('id', commissionId)
      .select()
      .single();

    if (error) throw error;

    return data;
  }
}
```

**7.2 Create Maintenance Service**

**File:** `frontend/src/services/maintenanceService.ts`

```typescript
import { supabase } from '@/lib/supabase';

export class MaintenanceService {
  static async getMaintenanceRequests(propertyId?: string, status?: string) {
    let query = supabase.from('maintenance_requests').select('*');

    if (propertyId) query = query.eq('property_id', propertyId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  }

  static async createMaintenanceRequest(data: {
    property_id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    requested_by: string;
  }) {
    const { data: result, error } = await supabase
      .from('maintenance_requests')
      .insert({
        ...data,
        status: 'open',
      })
      .select()
      .single();

    if (error) throw error;

    return result;
  }

  static async updateRequestStatus(requestId: string, status: string) {
    const { data, error } = await supabase
      .from('maintenance_requests')
      .update({ status })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  static async assignTechnician(requestId: string, technicianId: string) {
    const { data, error } = await supabase
      .from('maintenance_requests')
      .update({ assigned_to: technicianId })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;

    return data;
  }
}
```

**Verification:**

- ✅ Commission tracking works
- ✅ Maintenance request lifecycle works
- ✅ All tests passing

**Exit Criteria:**

- ✅ Commissions service implemented
- ✅ Maintenance service implemented
- ✅ All tests passing

---

## Phase 8: Booking Guests Implementation

### Objective: Implement multi-guest booking support

### Dependencies

- Phase 0 complete

### Tasks

**8.1 Create Booking Guests Service**

**File:** `frontend/src/services/bookingGuestsService.ts`

```typescript
import { supabase } from '@/lib/supabase';

export class BookingGuestsService {
  static async getBookingGuests(bookingId: string) {
    const { data, error } = await supabase
      .from('booking_guests')
      .select('*, profiles(full_name, email, phone)')
      .eq('booking_id', bookingId);

    if (error) throw error;

    return data || [];
  }

  static async addBookingGuest(data: {
    booking_id: string;
    guest_name: string;
    guest_email?: string;
    guest_phone?: string;
    is_primary: boolean;
  }) {
    const { data: result, error } = await supabase
      .from('booking_guests')
      .insert(data)
      .select()
      .single();

    if (error) throw error;

    return result;
  }

  static async removeBookingGuest(guestId: string) {
    const { error } = await supabase
      .from('booking_guests')
      .delete()
      .eq('id', guestId);

    if (error) throw error;
  }

  static async updateGuestDetails(guestId: string, updates: {
    guest_name?: string;
    guest_email?: string;
    guest_phone?: string;
  }) {
    const { data, error } = await supabase
      .from('booking_guests')
      .update(updates)
      .eq('id', guestId)
      .select()
      .single();

    if (error) throw error;

    return data;
  }
}
```

**Verification:**

- ✅ Guest management works
- ✅ Integration with booking service
- ✅ All tests passing

**Exit Criteria:**

- ✅ Booking guests service implemented
- ✅ All tests passing

---

## Post-Migration Tasks

### 1. Clean Up Mock Code

- Remove all mock data arrays
- Remove feature flags once verified
- Remove fallback logic
- Remove console.log-only implementations

### 2. Update Documentation

- Update API documentation
- Update component documentation
- Update architecture diagrams
- Update runbooks

### 3. Performance Monitoring

- Set up query performance monitoring
- Monitor slow queries
- Optimize indexes as needed
- Monitor Realtime subscription counts

### 4. Security Review

- Verify all RLS policies
- Run security advisory check
- Review API key usage
- Audit access logs

### 5. Data Migration

- Migrate any existing mock data to database
- Validate data integrity
- Test data rollback procedures

---

## Summary

| Phase | Service | Tables | Estimated Time | Risk Level |
|-------|---------|--------|----------------|------------|
| 0 | Schema & Types Foundation | All | 1 day | Low |
| 1 | Customer Service | customers, bookings, payments, contracts | 2-3 days | High |
| 2 | Property Services | properties, property_*, featured_properties view | 2 days | Medium |
| 3 | Payment Service | payments | 1 day | Medium |
| 4 | Messaging Service | conversations, messages, participants | 2-3 days | Medium |
| 5 | RMS Service | buildings, units, tenants, contracts | 2-3 days | Medium |
| 6 | Organizations & Subscriptions | organizations, subscriptions | 2 days | Medium |
| 7 | Commissions & Maintenance | commissions, maintenance_requests | 1-2 days | Low |
| 8 | Booking Guests | booking_guests | 1 day | Low |

**Total:** 14-18 days

---

## Success Criteria

Phase 1 migration is successful when:

- ✅ Zero mock data in customer service
- ✅ All customer data persists in database
- ✅ RLS policies prevent unauthorized access
- ✅ Real-time subscriptions work
- ✅ All integration tests pass
- ✅ No performance degradation
- ✅ TypeScript compilation succeeds
- ✅ Build passes without errors

---

## Next Steps

1. Review and approve this migration plan
2. Begin Phase 0 (Schema & Types Foundation)
3. Apply migration `20260602_missing_modules.sql`
4. Regenerate Supabase types
5. Update type definitions
6. Proceed to Phase 1 (Customer Service Migration)
