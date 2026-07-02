# Rental Management - Setup & Deployment Guide

## Quick Start

### Step 1: Apply Database Migration

Run the migration to create the `tenants` table with RLS policies:

```bash
# Using Supabase CLI
supabase migration up

# Or manually in Supabase Dashboard:
# 1. Go to SQL Editor
# 2. Copy contents of: supabase/migrations/20260702_create_tenants_table.sql
# 3. Execute the SQL
```

### Step 2: Seed Initial Data

After migration, seed the 12 existing tenants:

```bash
# First, get your user ID from Supabase Auth
# Then update supabase/seed_tenants.sql replacing 'YOUR_USER_ID'

# Execute seed script
psql -d your_database_url -f supabase/seed_tenants.sql
```

**Or manually in Supabase Dashboard:**
1. Go to SQL Editor
2. Copy contents of: `supabase/seed_tenants.sql`
3. Replace `'YOUR_USER_ID'` with your actual user ID
4. Execute the SQL

### Step 3: Verify Setup

Test the Rental Management module:

```bash
# Start dev server
npm run dev

# Navigate to Rental Management
# Should see 12 tenants loaded from database
# Dashboard KPI cards should show:
# - Total Tenants: 12
# - Active Leases: 12
# - Pending Payments: 2
# - Occupancy Rate: 100%
```

---

## Environment Configuration

### Required Environment Variables

Ensure your `.env.local` has Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Supabase Client Setup

Verify `src/lib/supabase.ts` is configured:

```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

---

## Testing Checklist

### Dashboard
- [ ] Total Tenants shows 12
- [ ] Active Leases shows 12
- [ ] Pending Payments shows 2 (Mustafe Nuur, Daud Xirsi)
- [ ] Occupancy Rate shows 100%

### Filtering
- [ ] Filter by "Burjiomar A" shows 3 tenants
- [ ] Filter by "Paid" shows 7 tenants
- [ ] Filter by "Pending" shows 2 tenants
- [ ] Filter by "Overdue" shows 3 tenants

### Search
- [ ] Search "Axmed" finds Axmed Cabdalle
- [ ] Search "+252 63 4112233" finds Axmed Cabdalle
- [ ] Search "A-101" finds Axmed Cabdalle

### Add Tenant
- [ ] Click "Add Tenant" button
- [ ] Fill form with:
  - Name: "Test Tenant"
  - Phone: "+252 63 1234567"
  - Unit: "A-999"
  - Rent: "200"
  - Next Due: (today's date)
  - Building: "Burjiomar A"
  - Rooms: "1"
- [ ] Click "Add Tenant"
- [ ] New tenant appears at top of table
- [ ] Total Tenants count increases to 13

### Update Payment Status
- [ ] Click payment icon on any tenant row
- [ ] Select "Paid" status
- [ ] Click "Save"
- [ ] Status updates in table
- [ ] Pending Payments count decreases

### Delete Tenant
- [ ] Click trash icon on any tenant row
- [ ] Confirm deletion
- [ ] Tenant removed from table
- [ ] Total Tenants count decreases

### Pagination
- [ ] Table shows 5 tenants per page
- [ ] Click "Next" button
- [ ] Shows tenants 6-10
- [ ] Click page number "3"
- [ ] Shows tenants 11-12

---

## Troubleshooting

### Issue: "User not authenticated"

**Cause:** User is not logged in

**Solution:**
1. Ensure you're logged into GuriGate
2. Check browser console for auth errors
3. Verify Supabase credentials in `.env.local`

### Issue: "No tenants found"

**Cause:** RLS policy blocking access or no data seeded

**Solution:**
1. Verify seed data was applied
2. Check RLS policies in Supabase Dashboard
3. Ensure `owner_id` in database matches logged-in user ID

### Issue: "Failed to add tenant"

**Cause:** Form validation or database error

**Solution:**
1. Check browser console for error message
2. Verify all required fields are filled
3. Check Supabase logs for database errors

### Issue: Filters not working

**Cause:** Filter values don't match database values

**Solution:**
1. Verify building names match exactly (case-sensitive)
2. Check payment_status values: 'Paid', 'Pending', 'Overdue'
3. Clear browser cache and reload

### Issue: Performance is slow

**Cause:** Missing indexes or large dataset

**Solution:**
1. Verify indexes were created in migration
2. Check Supabase query performance in logs
3. Ensure pagination is working (5 per page)

---

## Database Schema Reference

### Tenants Table

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PRIMARY KEY | Auto-generated |
| owner_id | UUID | NOT NULL, FK | References auth.users |
| property_id | UUID | FK | Optional property reference |
| building_id | TEXT | | Building name |
| unit_id | TEXT | | Unit number |
| full_name | TEXT | NOT NULL | Tenant name |
| phone | TEXT | NOT NULL | Contact phone |
| monthly_rent | DECIMAL | NOT NULL | Rent amount |
| payment_status | TEXT | CHECK | 'Paid', 'Pending', 'Overdue' |
| lease_status | TEXT | CHECK | 'active', 'inactive', 'terminated' |
| next_due_date | DATE | NOT NULL | Next payment due |
| move_in_date | DATE | NOT NULL | Lease start date |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update |

### Indexes

```sql
CREATE INDEX idx_tenants_owner_id ON public.tenants(owner_id);
CREATE INDEX idx_tenants_building_id ON public.tenants(building_id);
CREATE INDEX idx_tenants_payment_status ON public.tenants(payment_status);
CREATE INDEX idx_tenants_lease_status ON public.tenants(lease_status);
CREATE INDEX idx_tenants_created_at ON public.tenants(created_at DESC);
```

---

## RLS Policies

### Policy 1: Users can view their own tenants
```sql
SELECT auth.uid() = owner_id
```

### Policy 2: Users can insert their own tenants
```sql
INSERT: auth.uid() = owner_id
```

### Policy 3: Users can update their own tenants
```sql
UPDATE: auth.uid() = owner_id
```

### Policy 4: Users can delete their own tenants
```sql
DELETE: auth.uid() = owner_id
```

### Policy 5: Admins can view all tenants
```sql
SELECT: user.role = 'admin'
```

---

## API Reference

### TenantService Methods

#### `getTenants(params)`
```typescript
const result = await TenantService.getTenants({
  page: 1,
  pageSize: 5,
  building: 'Burjiomar A',
  status: 'Paid',
  search: 'Axmed'
});
// Returns: { items: Tenant[], total: number }
```

#### `getTenantById(id)`
```typescript
const tenant = await TenantService.getTenantById('uuid-here');
// Returns: Tenant
```

#### `createTenant(data)`
```typescript
const tenant = await TenantService.createTenant({
  full_name: 'John Doe',
  phone: '+252 63 1234567',
  building: 'Burjiomar A',
  unit: 'A-101',
  monthly_rent: 150,
  next_due_date: '2025-05-01',
  rooms: 1
});
// Returns: Tenant
```

#### `updateTenantPaymentStatus(id, status)`
```typescript
const tenant = await TenantService.updateTenantPaymentStatus(
  'uuid-here',
  'Paid'
);
// Returns: Tenant
```

#### `deleteTenant(id)`
```typescript
await TenantService.deleteTenant('uuid-here');
// Returns: void
```

#### `getTenantStats()`
```typescript
const stats = await TenantService.getTenantStats();
// Returns: { total_tenants, active_leases, pending_payments, occupancy_rate }
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] No console errors
- [ ] Database migration tested locally
- [ ] Seed data verified
- [ ] RLS policies enabled
- [ ] Environment variables configured

### Deployment
- [ ] Deploy to production
- [ ] Run migration on production database
- [ ] Seed production data
- [ ] Verify RLS policies on production
- [ ] Test with production user

### Post-Deployment
- [ ] Monitor error logs
- [ ] Verify data integrity
- [ ] Test all CRUD operations
- [ ] Check performance metrics
- [ ] Document any issues

---

## Support & Documentation

For more information, see:
- `RENTAL_MANAGEMENT_SUPABASE_IMPLEMENTATION.md` - Full implementation guide
- `src/services/tenantService.ts` - Service implementation
- `src/types/tenant.ts` - Type definitions
- `supabase/migrations/20260702_create_tenants_table.sql` - Database schema

---

## Status

✅ **Implementation Complete**
✅ **Ready for Deployment**
✅ **Production Ready**
