# Sprint 1 Backend Validation Guide

## Overview

This guide provides step-by-step instructions for validating the Inbox backend before proceeding to Sprint 2 (Realtime Validation).

## Prerequisites

- Supabase project access
- Database migration applied: `20260529_messaging_system.sql`
- Auto-conversation triggers applied: `20260529_auto_conversation_triggers.sql`
- SQL Editor access in Supabase Dashboard

---

## Phase 1: Automated Schema Validation

### Step 1: Run Validation Script

1. Open Supabase Dashboard → SQL Editor
2. Open file: `supabase/migrations/20260529_sprint1_validation.sql`
3. Execute the script
4. Review the NOTICE messages for results

### Expected Output

```
GROUP A: SCHEMA INTEGRITY
✓ PASS: All required columns exist
✓ PASS: All required columns exist
✓ PASS: All required columns exist
GROUP A RESULT: PASS

GROUP B: CONSTRAINTS
✓ PASS: Booking uniqueness constraint exists
✓ PASS: Participant uniqueness constraint exists
GROUP B RESULT: PASS

GROUP C: RLS POLICIES
✓ PASS: RLS enabled on messaging tables
⚠ WARNING: No explicit internal notes policy found
GROUP C RESULT: PASS

GROUP D: TRIGGERS
✓ PASS: Booking trigger exists
⚠ INFO: Support trigger function not created (table may not exist)
GROUP D RESULT: PASS

GROUP E: AUDIT LOGS
✓ PASS: Admin activity logs table exists
✓ PASS: Audit log function exists
GROUP E RESULT: PASS

GROUP F: SEARCH
✓ PASS: Search vector column exists
✓ PASS: GIN index exists
GROUP F RESULT: PASS

GROUP G: INTERNAL NOTES
✓ PASS: is_internal column exists
⚠ INFO: Manual verification required for RLS policy
GROUP G RESULT: PASS (manual RLS verification required)
```

**If any group shows FAIL**, do not proceed to manual tests. Fix the schema issue first.

---

## Phase 2: Manual Validation Tests

### Test 1: Booking Trigger Execution

**Objective**: Verify booking creation auto-creates conversation with participants and system message

**Steps**:

1. Create a test booking in Supabase:
```sql
INSERT INTO property_bookings (
  guest_id,
  property_id,
  check_in,
  check_out,
  total_price,
  currency,
  status
) VALUES (
  'YOUR_TEST_USER_ID',
  'YOUR_TEST_PROPERTY_ID',
  NOW() + INTERVAL '1 day',
  NOW() + INTERVAL '7 days',
  100000,  -- $1000.00 in cents
  'USD',
  'confirmed'
) RETURNING id;
```

2. Verify conversation was created:
```sql
SELECT id, type, status, priority, related_booking_id, created_at
FROM conversations
WHERE related_booking_id = <BOOKING_ID_FROM_STEP_1>;
```

**Expected**: 1 row returned with type='booking', status='active', priority='normal'

3. Verify participants were added:
```sql
SELECT cp.*, p.first_name, p.last_name
FROM conversation_participants cp
JOIN profiles p ON p.id = cp.user_id
WHERE conversation_id = <CONVERSATION_ID_FROM_STEP_2>;
```

**Expected**: 2 rows (guest + host)

4. Verify system message was created:
```sql
SELECT id, type, content, is_internal
FROM messages
WHERE conversation_id = <CONVERSATION_ID_FROM_STEP_2>
ORDER BY created_at;
```

**Expected**: 1 row with type='system', content='Booking created automatically', is_internal=false

**Result**: ✓ PASS / ✗ FAIL

---

### Test 2: Booking Uniqueness Constraint

**Objective**: Verify duplicate conversations cannot be created for same booking

**Steps**:

1. Attempt to create a second conversation for the same booking:
```sql
INSERT INTO conversations (
  type,
  status,
  priority,
  subject,
  created_by,
  related_booking_id
) VALUES (
  'booking',
  'active',
  'normal',
  'Duplicate Test',
  'YOUR_TEST_USER_ID',
  <BOOKING_ID_FROM_TEST_1>
);
```

**Expected**: ERROR - violates unique constraint "unique_booking_conversation"

**Result**: ✓ PASS (error expected) / ✗ FAIL (no error = constraint not working)

---

### Test 3: Participant Uniqueness Constraint

**Objective**: Verify same user cannot be added twice to same conversation

**Steps**:

1. Attempt to add duplicate participant:
```sql
INSERT INTO conversation_participants (
  conversation_id,
  user_id,
  role,
  is_admin
) VALUES (
  <CONVERSATION_ID_FROM_TEST_1>,
  <GUEST_USER_ID_FROM_TEST_1>,
  'guest',
  false
);
```

**Expected**: ERROR - violates unique constraint on (conversation_id, user_id)

**Result**: ✓ PASS (error expected) / ✗ FAIL (no error = constraint not working)

---

### Test 4: RLS - Guest User Access

**Objective**: Verify guests can only see their own conversations

**Setup**: Create test users with different roles if not already exists

**Steps**:

1. Switch to guest user context in Supabase Auth
2. Run query as guest:
```sql
SELECT c.id, c.type, c.subject
FROM conversations c
JOIN conversation_participants cp ON cp.conversation_id = c.id
WHERE cp.user_id = auth.uid();
```

**Expected**: Returns only conversations where guest is a participant

3. Try to access admin conversation:
```sql
SELECT * FROM conversations WHERE type = 'admin';
```

**Expected**: Empty result (RLS blocks access)

**Result**: ✓ PASS / ✗ FAIL

---

### Test 5: RLS - Admin Global Access

**Objective**: Verify admins can access all conversations

**Steps**:

1. Switch to admin user context
2. Run query:
```sql
SELECT c.id, c.type, c.subject, cp.user_id
FROM conversations c
JOIN conversation_participants cp ON cp.conversation_id = c.id;
```

**Expected**: Returns all conversations with all participants

3. Query internal notes:
```sql
SELECT id, content, is_internal
FROM messages
WHERE is_internal = true;
```

**Expected**: Returns internal notes (admin has permission)

**Result**: ✓ PASS / ✗ FAIL

---

### Test 6: RLS - Internal Notes Visibility

**Objective**: Verify internal notes are hidden from non-admin users

**Steps**:

1. Create internal note as admin:
```sql
INSERT INTO messages (
  conversation_id,
  sender_id,
  type,
  content,
  is_internal
) VALUES (
  <CONVERSATION_ID_FROM_TEST_1>,
  <ADMIN_USER_ID>,
  'text',
  'This is an internal admin note',
  true
) RETURNING id;
```

2. Switch to guest user context
3. Query messages:
```sql
SELECT id, content, is_internal
FROM messages
WHERE conversation_id = <CONVERSATION_ID_FROM_TEST_1>;
```

**Expected**: Internal note not returned (RLS filters is_internal=true for non-admins)

4. Switch to admin context
5. Query messages again:
```sql
SELECT id, content, is_internal
FROM messages
WHERE conversation_id = <CONVERSATION_ID_FROM_TEST_1>;
```

**Expected**: Internal note returned

**Result**: ✓ PASS / ✗ FAIL

---

### Test 7: Soft Delete Logic

**Objective**: Verify messages are soft-deleted, not hard-deleted

**Steps**:

1. Create a test message:
```sql
INSERT INTO messages (
  conversation_id,
  sender_id,
  type,
  content,
  is_internal
) VALUES (
  <CONVERSATION_ID_FROM_TEST_1>,
  <GUEST_USER_ID>,
  'text',
  'Test message for deletion',
  false
) RETURNING id;
```

2. Soft delete the message:
```sql
UPDATE messages
SET deleted_at = NOW(),
    deleted_by = <ADMIN_USER_ID>
WHERE id = <MESSAGE_ID_FROM_STEP_1>;
```

3. Verify message still exists in database:
```sql
SELECT id, content, deleted_at, deleted_by
FROM messages
WHERE id = <MESSAGE_ID_FROM_STEP_1>;
```

**Expected**: Message exists with deleted_at and deleted_by populated

4. Verify it's filtered from normal queries:
```sql
SELECT id, content
FROM messages
WHERE conversation_id = <CONVERSATION_ID_FROM_TEST_1>
AND deleted_at IS NULL;
```

**Expected**: Soft-deleted message not returned

**Result**: ✓ PASS / ✗ FAIL

---

### Test 8: Audit Log Population

**Objective**: Verify admin actions are logged

**Steps**:

1. Perform an admin action (e.g., update conversation priority):
```sql
UPDATE conversations
SET priority = 'high'
WHERE id = <CONVERSATION_ID_FROM_TEST_1>;
```

2. Check audit logs:
```sql
SELECT *
FROM admin_activity_logs
WHERE action LIKE '%conversation%'
ORDER BY created_at DESC
LIMIT 5;
```

**Expected**: Log entry exists for the priority change

3. Test other actions:
   - Delete message (should log)
   - Close conversation (should log)
   - Assign conversation (should log)

**Result**: ✓ PASS / ✗ FAIL

---

### Test 9: Full-Text Search

**Objective**: Verify search uses tsvector index efficiently

**Steps**:

1. Create test messages with searchable content:
```sql
INSERT INTO messages (
  conversation_id,
  sender_id,
  type,
  content,
  is_internal
) VALUES 
  (<CONVERSATION_ID_FROM_TEST_1>, <GUEST_USER_ID>, 'text', 'booking confirmation request', false),
  (<CONVERSATION_ID_FROM_TEST_1>, <GUEST_USER_ID>, 'text', 'property inquiry about amenities', false),
  (<CONVERSATION_ID_FROM_TEST_1>, <GUEST_USER_ID>, 'text', 'payment question refund policy', false);
```

2. Test search with tsvector:
```sql
SELECT id, content, ts_rank(search_vector, to_tsquery('english', 'booking')) as rank
FROM messages
WHERE search_vector @@ to_tsquery('english', 'booking')
ORDER BY rank DESC;
```

**Expected**: Returns messages containing "booking" with relevance ranking

3. Verify index usage:
```sql
EXPLAIN ANALYZE
SELECT id, content
FROM messages
WHERE search_vector @@ to_tsquery('english', 'booking');
```

**Expected**: Shows "Index Scan" using the GIN index (not Seq Scan)

**Result**: ✓ PASS / ✗ FAIL

---

### Test 10: Support Trigger Fallback

**Objective**: Verify migration passes whether or not support_tickets table exists

**Steps**:

1. Check if support_tickets table exists:
```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'support_tickets'
);
```

2. If table exists:
   - Create test support ticket
   - Verify conversation auto-created
   - Verify trigger function exists

3. If table does not exist:
   - Verify migration still passed (no errors)
   - Verify trigger function not created (expected)
   - Verify notice logged: "support_tickets table does not exist - skipping support ticket trigger"

**Result**: ✓ PASS / ✗ FAIL

---

### Test 11: Host Permissions

**Objective**: Verify hosts can only view and send messages, no internal notes or other hosts' conversations

**Steps**:

1. Switch to host user context
2. Verify can view own conversations:
```sql
SELECT c.id, c.type, c.subject
FROM conversations c
JOIN conversation_participants cp ON cp.conversation_id = c.id
JOIN properties p ON p.id = c.related_property_id
WHERE cp.user_id = auth.uid()
AND p.owner_id = auth.uid();
```

**Expected**: Returns conversations for own properties only

3. Verify can send messages:
```sql
INSERT INTO messages (
  conversation_id,
  sender_id,
  type,
  content,
  is_internal
) VALUES (
  <OWN_CONVERSATION_ID>,
  auth.uid(),
  'text',
  'Test message from host',
  false
);
```

**Expected**: Message created successfully

4. Verify cannot view internal notes:
```sql
SELECT id, content, is_internal
FROM messages
WHERE conversation_id = <OWN_CONVERSATION_ID>
AND is_internal = true;
```

**Expected**: Empty result (internal notes hidden)

5. Verify cannot access other hosts' conversations:
```sql
SELECT c.id, c.subject
FROM conversations c
JOIN properties p ON p.id = c.related_property_id
WHERE p.owner_id != auth.uid();
```

**Expected**: Empty result (other hosts' conversations blocked)

**Result**: ✓ PASS / ✗ FAIL

---

### Test 12: Manager Permissions

**Objective**: Verify managers can view assigned conversations, send messages, and view internal notes

**Steps**:

1. Switch to manager user context
2. Verify can view assigned conversations:
```sql
SELECT c.id, c.type, c.subject, c.assigned_to
FROM conversations c
WHERE c.assigned_to = auth.uid();
```

**Expected**: Returns conversations assigned to this manager

3. Verify can send messages:
```sql
INSERT INTO messages (
  conversation_id,
  sender_id,
  type,
  content,
  is_internal
) VALUES (
  <ASSIGNED_CONVERSATION_ID>,
  auth.uid(),
  'text',
  'Test message from manager',
  false
);
```

**Expected**: Message created successfully

4. Verify can view internal notes:
```sql
SELECT id, content, is_internal
FROM messages
WHERE conversation_id = <ASSIGNED_CONVERSATION_ID>
AND is_internal = true;
```

**Expected**: Returns internal notes

5. Verify cannot access unassigned conversations:
```sql
SELECT c.id, c.subject
FROM conversations c
WHERE c.assigned_to != auth.uid()
AND c.assigned_to IS NOT NULL;
```

**Expected**: Empty result (unassigned conversations blocked)

**Result**: ✓ PASS / ✗ FAIL

---

### Test 13: Admin Permissions

**Objective**: Verify admins have global access, can view internal notes, assign conversations, and change priority

**Steps**:

1. Switch to admin user context
2. Verify can view all conversations:
```sql
SELECT c.id, c.type, c.subject, c.assigned_to
FROM conversations c;
```

**Expected**: Returns all conversations

3. Verify can view internal notes:
```sql
SELECT id, content, is_internal
FROM messages
WHERE is_internal = true;
```

**Expected**: Returns all internal notes

4. Verify can assign conversation:
```sql
UPDATE conversations
SET assigned_to = <MANAGER_USER_ID>,
    assigned_at = NOW()
WHERE id = <CONVERSATION_ID>;
```

**Expected**: Assignment successful

5. Verify can change priority:
```sql
UPDATE conversations
SET priority = 'high'
WHERE id = <CONVERSATION_ID>;
```

**Expected**: Priority change successful

**Result**: ✓ PASS / ✗ FAIL

---

### Test 14: Super Admin Permissions

**Objective**: Verify super admins have full access (inherits from admin)

**Steps**:

1. Switch to super_admin user context
2. Verify can view all conversations:
```sql
SELECT c.id, c.type, c.subject
FROM conversations c;
```

**Expected**: Returns all conversations

3. Verify can view internal notes:
```sql
SELECT id, content, is_internal
FROM messages
WHERE is_internal = true;
```

**Expected**: Returns all internal notes

4. Verify can assign conversations:
```sql
UPDATE conversations
SET assigned_to = <MANAGER_USER_ID>
WHERE id = <CONVERSATION_ID>;
```

**Expected**: Assignment successful

5. Verify can change priority:
```sql
UPDATE conversations
SET priority = 'critical'
WHERE id = <CONVERSATION_ID>;
```

**Expected**: Priority change successful

**Result**: ✓ PASS / ✗ FAIL

---

## Phase 3: Validation Report

### Template

```
SPRINT 1 BACKEND VALIDATION REPORT
Date: YYYY-MM-DD
Validator: [Name]

AUTOMATED VALIDATION
====================
Group A (Schema Integrity): PASS/FAIL
Group B (Constraints): PASS/FAIL
Group C (RLS Policies): PASS/FAIL
Group D (Triggers): PASS/FAIL
Group E (Audit Logs): PASS/FAIL
Group F (Search): PASS/FAIL
Group G (Internal Notes): PASS/FAIL

MANUAL VALIDATION
=================
Test 1 (Booking Trigger): PASS/FAIL
Test 2 (Booking Uniqueness): PASS/FAIL
Test 3 (Participant Uniqueness): PASS/FAIL
Test 4 (Guest RLS): PASS/FAIL
Test 5 (Admin RLS): PASS/FAIL
Test 6 (Internal Notes Visibility): PASS/FAIL
Test 7 (Soft Delete): PASS/FAIL
Test 8 (Audit Logs): PASS/FAIL
Test 9 (Full-Text Search): PASS/FAIL
Test 10 (Support Trigger Fallback): PASS/FAIL

OVERALL RESULT
==============
SPRINT 1: PASS/FAIL

RISK REGISTER
============
Critical: [List any critical issues]
High: [List any high issues]
Medium: [List any medium issues]
Low: [List any low issues]

RECOMMENDATION
==============
[Proceed to Sprint 2 / Fix issues first]
```

---

## Exit Gate

**Sprint 1 is APPROVED only when:**

- All automated validation groups show PASS
- All manual tests show PASS
- Risk register has no Critical or High issues
- Validation report is complete

**If any test fails:**
1. Document the failure
2. Identify root cause
3. Implement fix
4. Re-run validation
5. Do not proceed to Sprint 2 until all tests pass

---

## Contact

For validation issues or questions, refer to the Inbox architecture documentation or contact the engineering team.
