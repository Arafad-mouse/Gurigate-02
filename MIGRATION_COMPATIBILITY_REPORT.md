# Migration Compatibility Report

**Date**: 2026-05-29  
**Migration**: `20260529_messaging_system.sql`  
**Status**: FAIL - Schema Mismatches Detected

---

## Critical Findings

### 1. Table Name Mismatch - CRITICAL

**Issue**: Messaging migration references `property_bookings` but actual schema may use `bookings`

**Evidence**:
- Line 71 in `20260529_messaging_system.sql`:
  ```sql
  related_booking_id UUID REFERENCES property_bookings(id),
  ```
- Line 81 in `20260529_auto_conversation_triggers.sql`:
  ```sql
  AFTER INSERT ON property_bookings
  ```

**Impact**: 
- Foreign key constraint will fail if `property_bookings` doesn't exist
- Booking trigger will fail to create
- All booking-related conversations will fail

**Required Fix**:
```sql
-- Option 1: Change migration to use 'bookings' instead of 'property_bookings'
-- Option 2: Verify which table actually exists in production and update accordingly
```

---

### 2. RMS Tables Not in Migrations - WARNING

**Issue**: Messaging migration references RMS tables (contracts, tenants, units) but these tables are not found in migration files

**Evidence**:
- Messaging migration includes:
  ```sql
  related_contract_id UUID,
  related_tenant_id UUID REFERENCES profiles(id),
  related_unit_id UUID,
  ```
- Enum types include: `rms_contract`, `rms_tenant`, `rms_unit`
- Grep search found no `CREATE TABLE (buildings|units|tenants|contracts)` in migrations

**Impact**:
- RMS-related foreign keys will fail if tables don't exist
- RMS conversation types will have no target tables

**Required Fix**:
- Verify if RMS tables exist in production schema
- If they exist, ensure they have proper structure
- If they don't exist, either create them or remove RMS references from messaging migration

---

### 3. Profiles Permissions Field - COMPATIBLE

**Status**: PASS

**Evidence**:
- Migration `20260508_admin_role_system.sql` lines 108-110:
  ```sql
  ALTER TABLE profiles ADD COLUMN permissions JSONB DEFAULT '{}';
  ```
- Messaging RLS policies correctly reference `profiles.role` field

**No action required**

---

### 4. Payments Table - COMPATIBLE

**Status**: PASS

**Evidence**:
- Messaging migration references `payments(id)` - line 73
- Payments table exists in migrations with `reference_type`, `reference_id`, `payer_id`, `payee_id`, `status`
- Structure is suitable for payment-context linking

**No action required**

---

### 5. Properties Ownership - COMPATIBLE

**Status**: PASS

**Evidence**:
- Messaging migration references `properties.owner_id` in RLS policy (line 514)
- Properties table exists with `owner_id` referencing `profiles.id`
- Host-level conversation filtering can be implemented correctly

**No action required**

---

## Summary

| Check | Status | Action Required |
|-------|--------|-----------------|
| property_bookings vs bookings | FAIL | Verify actual table name and update migration |
| RMS tables (contracts, tenants, units) | WARNING | Verify existence or remove references |
| Profiles permissions field | PASS | None |
| Payments table | PASS | None |
| Properties ownership | PASS | None |

---

## Required Actions Before Sprint 1 Validation

### Priority 1: Resolve Table Name Mismatch

1. Check actual schema to confirm whether `bookings` or `property_bookings` exists
2. Update messaging migration to use correct table name
3. Update auto-conversation trigger to use correct table name
4. Update validation script to check for correct table name

### Priority 2: Resolve RMS Table References

1. Verify if RMS tables exist in production
2. If they exist: ensure foreign key references are correct
3. If they don't exist: either create RMS tables or remove RMS-related fields from messaging migration

---

## Recommendation

**DO NOT PROCEED WITH SPRINT 1 VALIDATION**

The messaging migration has critical schema mismatches that will cause:
- Foreign key constraint failures
- Trigger execution failures
- RLS policy failures

**Correct Sequence**:
1. Fix schema mismatches in messaging migration
2. Re-run messaging migration
3. Execute Sprint 1 validation
4. If all groups PASS → Proceed to Sprint 1.5

---

## Next Steps

1. **User Action**: Confirm actual table name (`bookings` vs `property_bookings`)
2. **User Action**: Confirm RMS tables existence
3. **AI Action**: Update messaging migration based on confirmed schema
4. **AI Action**: Update validation script to match actual schema
5. **Execute**: Sprint 1 validation after fixes
