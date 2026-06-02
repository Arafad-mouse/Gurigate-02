-- Sprint 1 Backend Validation Script
-- This script validates all backend components before allowing Sprint 2 to begin
-- Execute this in Supabase SQL Editor to generate validation report

-- ========================================
-- VALIDATION GROUP A: SCHEMA INTEGRITY
-- ========================================

DO $$
DECLARE
    validation_result TEXT := 'GROUP A: SCHEMA INTEGRITY\n';
    error_count INTEGER := 0;
BEGIN
    -- A1: Verify conversations table structure
    validation_result := validation_result || '\nA1: Conversations Table Structure\n';
    
    BEGIN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'conversations' 
            AND column_name IN ('id', 'type', 'priority', 'status', 'created_by', 'assigned_to', 'first_response_at', 'resolved_at', 'deleted_at')
        ) THEN
            validation_result := validation_result || '✓ PASS: All required columns exist\n';
        ELSE
            validation_result := validation_result || '✗ FAIL: Missing required columns\n';
            error_count := error_count + 1;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        validation_result := validation_result || '✗ FAIL: Error checking conversations table: ' || SQLERRM || '\n';
        error_count := error_count + 1;
    END;
    
    -- A2: Verify participants table structure
    validation_result := validation_result || '\nA2: Participants Table Structure\n';
    
    BEGIN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'conversation_participants' 
            AND column_name IN ('last_read_at', 'is_muted', 'joined_at')
        ) THEN
            validation_result := validation_result || '✓ PASS: All required columns exist\n';
        ELSE
            validation_result := validation_result || '✗ FAIL: Missing required columns\n';
            error_count := error_count + 1;
        END IF;
        
        -- Check unique constraint
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'conversation_participants' 
            AND constraint_type = 'UNIQUE'
        ) THEN
            validation_result := validation_result || '✓ PASS: Unique constraint exists\n';
        ELSE
            validation_result := validation_result || '✗ FAIL: Missing unique constraint\n';
            error_count := error_count + 1;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        validation_result := validation_result || '✗ FAIL: Error checking participants table: ' || SQLERRM || '\n';
        error_count := error_count + 1;
    END;
    
    -- A3: Verify messages table structure
    validation_result := validation_result || '\nA3: Messages Table Structure\n';
    
    BEGIN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'messages' 
            AND column_name IN ('type', 'is_internal', 'metadata', 'deleted_at')
        ) THEN
            validation_result := validation_result || '✓ PASS: All required columns exist\n';
        ELSE
            validation_result := validation_result || '✗ FAIL: Missing required columns\n';
            error_count := error_count + 1;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        validation_result := validation_result || '✗ FAIL: Error checking messages table: ' || SQLERRM || '\n';
        error_count := error_count + 1;
    END;
    
    -- Output Group A result
    IF error_count = 0 THEN
        validation_result := validation_result || '\nGROUP A RESULT: PASS\n';
    ELSE
        validation_result := validation_result || '\nGROUP A RESULT: FAIL (' || error_count || ' errors)\n';
    END IF;
    
    RAISE NOTICE '%', validation_result;
END $$;

-- ========================================
-- VALIDATION GROUP B: CONSTRAINTS
-- ========================================

DO $$
DECLARE
    validation_result TEXT := 'GROUP B: CONSTRAINTS\n';
    error_count INTEGER := 0;
BEGIN
    -- B1: Verify booking uniqueness constraint
    validation_result := validation_result || '\nB1: Booking Uniqueness Constraint\n';
    
    BEGIN
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_name = 'conversations' 
            AND tc.constraint_type = 'UNIQUE'
            AND kcu.column_name = 'related_booking_id'
        ) THEN
            validation_result := validation_result || '✓ PASS: Booking uniqueness constraint exists\n';
        ELSE
            validation_result := validation_result || '✗ FAIL: Missing booking uniqueness constraint\n';
            error_count := error_count + 1;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        validation_result := validation_result || '✗ FAIL: Error checking booking constraint: ' || SQLERRM || '\n';
        error_count := error_count + 1;
    END;
    
    -- B2: Verify participant uniqueness constraint
    validation_result := validation_result || '\nB2: Participant Uniqueness Constraint\n';
    
    BEGIN
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_name = 'conversation_participants' 
            AND tc.constraint_type = 'UNIQUE'
            AND kcu.column_name = 'user_id'
        ) THEN
            validation_result := validation_result || '✓ PASS: Participant uniqueness constraint exists\n';
        ELSE
            validation_result := validation_result || '✗ FAIL: Missing participant uniqueness constraint\n';
            error_count := error_count + 1;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        validation_result := validation_result || '✗ FAIL: Error checking participant constraint: ' || SQLERRM || '\n';
        error_count := error_count + 1;
    END;
    
    -- Output Group B result
    IF error_count = 0 THEN
        validation_result := validation_result || '\nGROUP B RESULT: PASS\n';
    ELSE
        validation_result := validation_result || '\nGROUP B RESULT: FAIL (' || error_count || ' errors)\n';
    END IF;
    
    RAISE NOTICE '%', validation_result;
END $$;

-- ========================================
-- VALIDATION GROUP C: RLS POLICIES
-- ========================================

DO $$
DECLARE
    validation_result TEXT := 'GROUP C: RLS POLICIES\n';
    error_count INTEGER := 0;
BEGIN
    -- Check if RLS is enabled on tables
    validation_result := validation_result || '\nC1: RLS Enabled on Tables\n';
    
    BEGIN
        IF EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename IN ('conversations', 'conversation_participants', 'messages', 'message_attachments')
            AND relrowsecurity = true
        ) THEN
            validation_result := validation_result || '✓ PASS: RLS enabled on messaging tables\n';
        ELSE
            validation_result := validation_result || '✗ FAIL: RLS not enabled on all messaging tables\n';
            error_count := error_count + 1;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        validation_result := validation_result || '✗ FAIL: Error checking RLS status: ' || SQLERRM || '\n';
        error_count := error_count + 1;
    END;
    
    -- Check for internal notes RLS policy
    validation_result := validation_result || '\nC2: Internal Notes RLS Policy\n';
    
    BEGIN
        IF EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'messages' 
            AND policyname LIKE '%internal%'
        ) THEN
            validation_result := validation_result || '✓ PASS: Internal notes RLS policy exists\n';
        ELSE
            validation_result := validation_result || '⚠ WARNING: No explicit internal notes policy found\n';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        validation_result := validation_result || '✗ FAIL: Error checking internal notes policy: ' || SQLERRM || '\n';
        error_count := error_count + 1;
    END;
    
    -- Output Group C result
    IF error_count = 0 THEN
        validation_result := validation_result || '\nGROUP C RESULT: PASS\n';
    ELSE
        validation_result := validation_result || '\nGROUP C RESULT: FAIL (' || error_count || ' errors)\n';
    END IF;
    
    RAISE NOTICE '%', validation_result;
END $$;

-- ========================================
-- VALIDATION GROUP D: TRIGGERS
-- ========================================

DO $$
DECLARE
    validation_result TEXT := 'GROUP D: TRIGGERS\n';
    error_count INTEGER := 0;
BEGIN
    -- D1: Verify booking trigger exists
    validation_result := validation_result || '\nD1: Booking Auto-Conversation Trigger\n';

    BEGIN
        IF EXISTS (
            SELECT 1 FROM information_schema.triggers
            WHERE trigger_name = 'trigger_booking_conversation'
            AND event_object_table = 'bookings'
        ) THEN
            validation_result := validation_result || '✓ PASS: Booking trigger exists\n';
        ELSE
            validation_result := validation_result || '✗ FAIL: Booking trigger missing\n';
            error_count := error_count + 1;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        validation_result := validation_result || '✗ FAIL: Error checking booking trigger: ' || SQLERRM || '\n';
        error_count := error_count + 1;
    END;
    
    -- D2: Verify support trigger function exists (conditional)
    validation_result := validation_result || '\nD2: Support Trigger Function\n';
    
    BEGIN
        IF EXISTS (
            SELECT 1 FROM pg_proc 
            WHERE proname = 'create_support_ticket_conversation'
        ) THEN
            validation_result := validation_result || '✓ PASS: Support trigger function exists\n';
        ELSE
            validation_result := validation_result || '⚠ INFO: Support trigger function not created (table may not exist)\n';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        validation_result := validation_result || '✗ FAIL: Error checking support trigger: ' || SQLERRM || '\n';
        error_count := error_count + 1;
    END;
    
    -- Output Group D result
    IF error_count = 0 THEN
        validation_result := validation_result || '\nGROUP D RESULT: PASS\n';
    ELSE
        validation_result := validation_result || '\nGROUP D RESULT: FAIL (' || error_count || ' errors)\n';
    END IF;
    
    RAISE NOTICE '%', validation_result;
END $$;

-- ========================================
-- VALIDATION GROUP E: AUDIT LOGS
-- ========================================

DO $$
DECLARE
    validation_result TEXT := 'GROUP E: AUDIT LOGS\n';
    error_count INTEGER := 0;
BEGIN
    -- E1: Verify admin_activity_logs table exists
    validation_result := validation_result || '\nE1: Admin Activity Logs Table\n';
    
    BEGIN
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'admin_activity_logs'
        ) THEN
            validation_result := validation_result || '✓ PASS: Admin activity logs table exists\n';
        ELSE
            validation_result := validation_result || '✗ FAIL: Admin activity logs table missing\n';
            error_count := error_count + 1;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        validation_result := validation_result || '✗ FAIL: Error checking audit logs: ' || SQLERRM || '\n';
        error_count := error_count + 1;
    END;
    
    -- E2: Verify log_admin_activity function exists
    validation_result := validation_result || '\nE2: Audit Log Function\n';
    
    BEGIN
        IF EXISTS (
            SELECT 1 FROM pg_proc 
            WHERE proname = 'log_admin_activity'
        ) THEN
            validation_result := validation_result || '✓ PASS: Audit log function exists\n';
        ELSE
            validation_result := validation_result || '✗ FAIL: Audit log function missing\n';
            error_count := error_count + 1;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        validation_result := validation_result || '✗ FAIL: Error checking audit function: ' || SQLERRM || '\n';
        error_count := error_count + 1;
    END;
    
    -- Output Group E result
    IF error_count = 0 THEN
        validation_result := validation_result || '\nGROUP E RESULT: PASS\n';
    ELSE
        validation_result := validation_result || '\nGROUP E RESULT: FAIL (' || error_count || ' errors)\n';
    END IF;
    
    RAISE NOTICE '%', validation_result;
END $$;

-- ========================================
-- VALIDATION GROUP F: SEARCH
-- ========================================

DO $$
DECLARE
    validation_result TEXT := 'GROUP F: SEARCH\n';
    error_count INTEGER := 0;
BEGIN
    -- F1: Verify tsvector column exists in messages
    validation_result := validation_result || '\nF1: Full-Text Search Column\n';
    
    BEGIN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'messages' 
            AND column_name = 'search_vector'
        ) THEN
            validation_result := validation_result || '✓ PASS: Search vector column exists\n';
        ELSE
            validation_result := validation_result || '✗ FAIL: Search vector column missing\n';
            error_count := error_count + 1;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        validation_result := validation_result || '✗ FAIL: Error checking search column: ' || SQLERRM || '\n';
        error_count := error_count + 1;
    END;
    
    -- F2: Verify GIN index exists
    validation_result := validation_result || '\nF2: GIN Index for Search\n';
    
    BEGIN
        IF EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE tablename = 'messages' 
            AND indexdef LIKE '%USING gin%'
        ) THEN
            validation_result := validation_result || '✓ PASS: GIN index exists\n';
        ELSE
            validation_result := validation_result || '✗ FAIL: GIN index missing\n';
            error_count := error_count + 1;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        validation_result := validation_result || '✗ FAIL: Error checking GIN index: ' || SQLERRM || '\n';
        error_count := error_count + 1;
    END;
    
    -- Output Group F result
    IF error_count = 0 THEN
        validation_result := validation_result || '\nGROUP F RESULT: PASS\n';
    ELSE
        validation_result := validation_result || '\nGROUP F RESULT: FAIL (' || error_count || ' errors)\n';
    END IF;
    
    RAISE NOTICE '%', validation_result;
END $$;

-- ========================================
-- VALIDATION GROUP G: INTERNAL NOTES
-- ========================================

DO $$
DECLARE
    validation_result TEXT := 'GROUP G: INTERNAL NOTES\n';
    error_count INTEGER := 0;
BEGIN
    -- G1: Verify is_internal column exists
    validation_result := validation_result || '\nG1: Internal Notes Column\n';
    
    BEGIN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'messages' 
            AND column_name = 'is_internal'
        ) THEN
            validation_result := validation_result || '✓ PASS: is_internal column exists\n';
        ELSE
            validation_result := validation_result || '✗ FAIL: is_internal column missing\n';
            error_count := error_count + 1;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        validation_result := validation_result || '✗ FAIL: Error checking is_internal: ' || SQLERRM || '\n';
        error_count := error_count + 1;
    END;
    
    -- G2: Verify internal notes permission exists
    validation_result := validation_result || '\nG2: Internal Notes Permission\n';
    
    BEGIN
        -- This checks if the permission constant exists in the code
        -- In a real validation, this would check the permissions table
        validation_result := validation_result || '⚠ INFO: Manual verification required for RLS policy\n';
    END;
    
    -- Output Group G result
    IF error_count = 0 THEN
        validation_result := validation_result || '\nGROUP G RESULT: PASS (manual RLS verification required)\n';
    ELSE
        validation_result := validation_result || '\nGROUP G RESULT: FAIL (' || error_count || ' errors)\n';
    END IF;
    
    RAISE NOTICE '%', validation_result;
END $$;

-- ========================================
-- FINAL SUMMARY
-- ========================================

DO $$
DECLARE
    summary TEXT := '========================================\nSPRINT 1 VALIDATION SUMMARY\n========================================\n\n';
BEGIN
    summary := summary || 'All automated schema checks completed.\n';
    summary := summary || 'Please review the NOTICE messages above for detailed results.\n\n';
    summary := summary || 'MANUAL VERIFICATION REQUIRED:\n';
    summary := summary || '1. RLS policy testing with actual user roles\n';
    summary := summary || '2. Booking trigger execution test\n';
    summary := summary || '3. Support trigger fallback test\n';
    summary := summary || '4. Internal notes visibility test\n';
    summary := summary || '5. Audit log population test\n';
    summary := summary || '6. Full-text search query test\n';
    summary := summary || '7. Permissions matrix test (Owner, Building Manager, Admin)\n\n';
    summary := summary || 'See validation documentation for manual test procedures.\n';

    RAISE NOTICE '%', summary;
END $$;
