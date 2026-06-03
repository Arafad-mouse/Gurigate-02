# GuriGate Migration Guide

**Version:** 1.0  
**Date:** June 2, 2026  
**Status:** Production

---

## Executive Summary

This guide covers database migrations, schema changes, and data migration strategies for the GuriGate application. Migrations are managed through Supabase's migration system.

---

## Migration Overview

### Migration Files

All migrations are stored in `supabase/migrations/` directory with the following naming convention:

```
YYYYMMDD_description.sql
```

**Current Migrations:**
1. `20240502_gurigate_properties_schema.sql` - Initial property schema
2. `20240502_gurigate_enhancements.sql` - Property enhancements
3. `20240502_gurigate_enhancements_14A.sql` - Additional enhancements
4. `20240502_gurigate_enhancements_14B.sql` - More enhancements
5. `20240502_fix_rls_recursion.sql` - RLS recursion fix
6. `20260502_payments_flow.sql` - Payment flow tables
7. `20260506_security_fixes_final.sql` - Security fixes
8. `20260508_admin_role_system.sql` - Admin role system
9. `20260529_messaging_system.sql` - Messaging system
10. `20260529_auto_conversation_triggers.sql` - Auto conversation triggers
11. `20260529_sprint1_validation.sql` - Sprint 1 validation

---

## Creating New Migrations

### Step 1: Create Migration File

```bash
# Generate migration file with current timestamp
supabase migration new your_migration_name
```

Or manually create file:
```
supabase/migrations/20260601_new_feature.sql
```

### Step 2: Write Migration SQL

**Best Practices:**

- Use transactions for complex changes
- Include rollback comments
- Test in development first
- Document purpose and impact

**Example Migration:**

```sql
-- Migration: Add property views tracking
-- Purpose: Track property view counts for analytics
-- Impact: Adds new table and trigger
-- Rollback: Drop table and trigger

BEGIN;

-- Create property_views table
CREATE TABLE property_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX idx_property_views_property ON property_views(property_id);
CREATE INDEX idx_property_views_viewer ON property_views(viewer_id);

-- Create trigger to update view count
CREATE OR REPLACE FUNCTION update_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE properties
  SET view_count = view_count + 1
  WHERE id = NEW.property_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_view_count
AFTER INSERT ON property_views
FOR EACH ROW
EXECUTE FUNCTION update_view_count();

COMMIT;

-- Rollback:
-- DROP TRIGGER trigger_update_view_count ON property_views;
-- DROP FUNCTION update_view_count();
-- DROP TABLE property_views;
```

### Step 3: Test Migration

**Local Testing:**
```bash
# Apply migration to local database
supabase db push

# Or apply specific migration
supabase migration up your_migration_name
```

**Manual Testing in SQL Editor:**
1. Copy migration SQL
2. Paste into Supabase SQL Editor
3. Run on development project
4. Verify results
5. Test rollback if needed

### Step 4: Apply to Production

**Via Supabase CLI:**
```bash
# Link to production project
supabase link --project-ref your-prod-ref

# Apply migrations
supabase db push
```

**Via SQL Editor:**
1. Copy migration SQL
2. Paste into production SQL Editor
3. Run migration
4. Verify results
5. Monitor for errors

---

## Migration Types

### Schema Changes

**Adding Columns:**

```sql
ALTER TABLE properties ADD COLUMN featured BOOLEAN DEFAULT false;
```

**Modifying Columns:**

```sql
ALTER TABLE properties ALTER COLUMN price TYPE DECIMAL(10,2);
```

**Dropping Columns:**

```sql
-- Caution: Data loss
ALTER TABLE properties DROP COLUMN old_column;
```

**Renaming Columns:**

```sql
ALTER TABLE properties RENAME COLUMN old_name TO new_name;
```

### Table Changes

**Creating Tables:**

```sql
CREATE TABLE new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Dropping Tables:**

```sql
-- Caution: Data loss
DROP TABLE old_table;
```

**Renaming Tables:**

```sql
ALTER TABLE old_table RENAME TO new_table;
```

### Index Changes

**Creating Indexes:**

```sql
CREATE INDEX idx_table_column ON table(column);
```

**Dropping Indexes:**

```sql
DROP INDEX idx_table_column;
```

**Creating Composite Indexes:**

```sql
CREATE INDEX idx_table_columns ON table(column1, column2);
```

### RLS Policy Changes

**Adding Policies:**

```sql
CREATE POLICY "policy_name"
ON table FOR operation
TO role
USING (condition);
```

**Dropping Policies:**

```sql
DROP POLICY "policy_name" ON table;
```

**Modifying Policies:**

```sql
-- Drop and recreate
DROP POLICY "policy_name" ON table;
CREATE POLICY "policy_name" ON table ...;
```

### Function Changes

**Creating Functions:**

```sql
CREATE OR REPLACE FUNCTION function_name()
RETURNS type AS $$
BEGIN
  -- function body
END;
$$ LANGUAGE plpgsql;
```

**Dropping Functions:**

```sql
DROP FUNCTION function_name();
```

### Trigger Changes

**Creating Triggers:**

```sql
CREATE TRIGGER trigger_name
AFTER event ON table
FOR EACH ROW
EXECUTE FUNCTION function_name();
```

**Dropping Triggers:**

```sql
DROP TRIGGER trigger_name ON table;
```

---

## Data Migrations

### Adding Default Data

```sql
-- Insert default values
INSERT INTO configuration (key, value)
VALUES 
  ('maintenance_mode', 'false'),
  ('max_upload_size', '5242880')
ON CONFLICT (key) DO NOTHING;
```

### Updating Existing Data

```sql
-- Update all records
UPDATE properties SET status = 'active' WHERE status IS NULL;

-- Conditional update
UPDATE profiles 
SET role = 'guest' 
WHERE role IS NULL;
```

### Data Transformation

```sql
-- Transform data format
UPDATE properties
SET price = CAST(old_price AS DECIMAL(10,2))
WHERE old_price IS NOT NULL;
```

### Data Migration Between Tables

```sql
-- Copy data to new table
INSERT INTO new_table (id, name, created_at)
SELECT id, name, created_at FROM old_table;
```

---

## Rollback Procedures

### Rollback Strategy

**Option 1: Manual Rollback SQL**

Include rollback comments in every migration:

```sql
-- Migration: Add new column
ALTER TABLE properties ADD COLUMN new_column TEXT;

-- Rollback:
-- ALTER TABLE properties DROP COLUMN new_column;
```

**Option 2: Create Rollback Migration**

Create separate migration file to undo changes:

```
20260602_rollback_add_column.sql
```

```sql
ALTER TABLE properties DROP COLUMN new_column;
```

**Option 3: Database Restore**

Use Supabase point-in-time recovery:
1. Navigate to Database → Backups
2. Select backup point
3. Click "Restore"

### Rollback Checklist

- [ ] Identify migration to rollback
- [ ] Test rollback in development
- [ ] Backup current production state
- [ ] Apply rollback
- [ ] Verify data integrity
- [ ] Monitor for issues
- [ ] Document rollback

---

## Migration Best Practices

### Pre-Migration

1. **Backup Database**
   - Export current schema
   - Backup critical data
   - Document current state

2. **Test Thoroughly**
   - Test in development environment
   - Test with production-like data
   - Test rollback procedure

3. **Plan Downtime**
   - Schedule maintenance window if needed
   - Notify users in advance
   - Prepare rollback plan

4. **Review Dependencies**
   - Check for dependent code
   - Update application if needed
   - Coordinate with team

### During Migration

1. **Monitor Progress**
   - Watch for errors
   - Check performance
   - Monitor logs

2. **Verify Results**
   - Check schema changes
   - Verify data integrity
   - Test critical paths

3. **Document Changes**
   - Record migration details
   - Note any issues
   - Update documentation

### Post-Migration

1. **Validate System**
   - Run smoke tests
   - Monitor error rates
   - Check performance

2. **Update Documentation**
   - Update schema documentation
   - Update API documentation
   - Update migration log

3. **Clean Up**
   - Remove temporary files
   - Archive old data if needed
   - Update deployment scripts

---

## Common Migration Scenarios

### Scenario 1: Adding New Feature

**Steps:**
1. Create migration file
2. Add new tables/columns
3. Update RLS policies
4. Test in development
5. Apply to production
6. Update application code

### Scenario 2: Refactoring Schema

**Steps:**
1. Create migration file
2. Add new structure
3. Migrate data from old to new
4. Update application code
5. Test with new structure
6. Apply to production
7. Remove old structure (separate migration)

### Scenario 3: Performance Optimization

**Steps:**
1. Analyze slow queries
2. Create migration with indexes
3. Test performance improvement
4. Apply to production
5. Monitor performance

### Scenario 4: Security Fix

**Steps:**
1. Create migration with security changes
2. Update RLS policies
3. Test with different roles
4. Apply to production immediately (if critical)
5. Monitor for issues

---

## Migration Tools

### Supabase CLI Commands

```bash
# List migrations
supabase migration list

# Create new migration
supabase migration new migration_name

# Apply pending migrations
supabase db push

# Apply specific migration
supabase migration up migration_name

# Rollback migration
supabase migration down migration_name

# Reset database (development only)
supabase db reset
```

### SQL Editor

For manual migrations:
1. Navigate to SQL Editor
2. Write migration SQL
3. Test with "Run"
4. Save as query for reference

### Database Diff Tools

Use tools to compare schemas:
- Supabase Schema Diff
- pgAdmin Schema Diff
- Custom diff scripts

---

## Troubleshooting Migrations

### Issue: Migration Fails

**Solutions:**
1. Check SQL syntax
2. Verify table/column exists
3. Check for conflicts
4. Review error message
5. Test in isolation

### Issue: Data Loss

**Prevention:**
1. Always backup before migration
2. Test with production data copy
3. Use transactions
4. Have rollback plan

### Issue: Performance Impact

**Solutions:**
1. Run during low traffic
2. Use batch updates
3. Add indexes before data changes
4. Monitor performance

### Issue: Application Errors

**Solutions:**
1. Update application code before migration
2. Use feature flags
3. Deploy application update
4. Monitor error logs

---

## Migration Checklist

### Pre-Migration
- [ ] Migration file created
- [ ] SQL syntax validated
- [ ] Tested in development
- [ ] Rollback plan documented
- [ ] Database backed up
- [ ] Team notified
- [ ] Maintenance window scheduled

### During Migration
- [ ] Migration applied
- [ ] No errors encountered
- [ ] Results verified
- [ ] Data integrity checked
- [ ] Application tested

### Post-Migration
- [ ] System validated
- [ ] Documentation updated
- [ ] Team notified of completion
- [ ] Monitoring enabled
- [ ] Rollback plan archived

---

## Migration Log

Maintain a log of all migrations:

```markdown
| Date | Migration | Description | Status |
|------|-----------|-------------|--------|
| 2026-06-01 | 20260601_add_views | Add property views tracking | Applied |
| 2026-06-02 | 20260602_optimize_search | Add search indexes | Applied |
```

---

**Document Owner:** Development Team  
**Last Updated:** June 2, 2026  
**Next Review:** After each migration
