# GuriGate RBAC Documentation

**Document Version:** 1.0  
**Date:** June 2, 2026  
**Author:** System Architecture Team

---

## 1. Overview

This document provides comprehensive documentation for the Role-Based Access Control (RBAC) system in the GuriGate platform, including roles, permissions, permission checks, and implementation details.

### RBAC Principles

- **Role-Based:** Users are assigned roles that determine their access level
- **Granular Permissions:** Each role has specific permissions for different actions
- **Hierarchical:** Roles form a hierarchy with increasing privileges
- **Flexible:** Permissions can be customized per user
- **Secure:** All access checks enforced at database and application levels

---

## 2. Role Hierarchy

### 2.1 Role Levels

```
super_admin (Level 5) - Full system access
  ↓
admin (Level 4) - Platform management
  ↓
manager (Level 3) - Property & customer management
  ↓
host (Level 2) - Property owner
  ↓
guest (Level 1) - Property seeker
```

### 2.2 Role Definitions

**guest**
- Default role for new users
- Can view properties
- Can create bookings
- Can submit reviews
- Can manage wishlist
- Limited access to own data

**host**
- All guest permissions
- Can create and manage own properties
- Can view bookings for own properties
- Can respond to reviews
- Can manage property availability

**manager**
- All host permissions
- Can approve/reject properties
- Can verify hosts
- Can verify payments
- Can resolve disputes
- Can view customer data

**admin**
- All manager permissions
- Can ban/unban users
- Can manage all users
- Can manage all properties
- Can manage all bookings
- Can manage all payments
- Can view audit logs

**super_admin**
- All admin permissions
- Can manage other admins
- Can modify system settings
- Can manage permissions
- Full system access

---

## 3. Permission System

### 3.1 Permission Categories

**Property Management (5 permissions):**
- `can_view_properties` - View property listings
- `can_create_properties` - Create new properties
- `can_edit_properties` - Edit properties
- `can_delete_properties` - Delete properties
- `can_approve_property` - Approve properties for listing

**User Management (5 permissions):**
- `can_view_users` - View user profiles
- `can_edit_users` - Edit user profiles
- `can_ban_user` - Ban users
- `can_unban_user` - Unban users
- `can_verify_host` - Verify host accounts

**Payment Management (5 permissions):**
- `can_view_payments` - View payment records
- `can_create_payments` - Create payment records
- `can_verify_payment` - Verify wallet payments
- `can_reject_payment` - Reject payments
- `can_refund_payment` - Process refunds

**Booking Management (4 permissions):**
- `can_view_bookings` - View booking records
- `can_create_bookings` - Create bookings
- `can_cancel_bookings` - Cancel bookings
- `can_resolve_dispute` - Resolve booking disputes

**System Operations (3 permissions):**
- `can_view_audit_logs` - View admin activity logs
- `can_manage_settings` - Modify system settings
- `can_manage_permissions` - Modify user permissions

**Messaging Operations (6 permissions):**
- `can_send_messages` - Send messages
- `can_manage_conversations` - Manage conversations
- `can_delete_messages` - Delete messages
- `can_view_internal_notes` - View internal notes
- `can_send_internal_notes` - Send internal notes
- `can_manage_messaging` - Full messaging management

### 3.2 Default Permissions by Role

**guest:**
- `can_view_properties`
- `can_create_bookings`
- `can_send_messages`

**host:**
- All guest permissions
- `can_create_properties`
- `can_edit_properties`
- `can_view_bookings`

**manager:**
- All host permissions
- `can_approve_property`
- `can_verify_host`
- `can_verify_payment`
- `can_resolve_dispute`
- `can_view_users`

**admin:**
- All manager permissions
- `can_delete_properties`
- `can_ban_user`
- `can_unban_user`
- `can_reject_payment`
- `can_refund_payment`
- `can_view_audit_logs`
- `can_manage_settings`

**super_admin:**
- All admin permissions
- `can_manage_permissions`
- `can_manage_messaging`

---

## 4. Permission Implementation

### 4.1 Database Schema

**profiles table:**
```sql
role TEXT DEFAULT 'guest' NOT NULL,
permissions JSONB DEFAULT '{}' NOT NULL,
is_banned BOOLEAN DEFAULT false NOT NULL,
```

**permissions JSONB structure:**
```json
{
  "can_view_properties": true,
  "can_create_properties": false,
  "can_edit_properties": false,
  "can_delete_properties": false,
  "can_approve_property": false,
  "can_view_users": true,
  "can_edit_users": false,
  "can_ban_user": false,
  "can_unban_user": false,
  "can_verify_host": false,
  "can_view_payments": true,
  "can_create_payments": false,
  "can_verify_payment": false,
  "can_reject_payment": false,
  "can_refund_payment": false,
  "can_view_bookings": true,
  "can_create_bookings": true,
  "can_cancel_bookings": false,
  "can_resolve_dispute": false,
  "can_view_audit_logs": false,
  "can_manage_settings": false,
  "can_manage_permissions": false,
  "can_send_messages": true,
  "can_manage_conversations": false,
  "can_delete_messages": false,
  "can_view_internal_notes": false,
  "can_send_internal_notes": false,
  "can_manage_messaging": false
}
```

### 4.2 Permission Functions

**Location:** `src/lib/permissions.ts`

```typescript
export const DEFAULT_PERMISSIONS: Record<Role, Permission[]> = {
  guest: [
    'can_view_properties',
    'can_create_bookings',
    'can_send_messages'
  ],
  host: [
    'can_view_properties',
    'can_create_properties',
    'can_edit_properties',
    'can_view_bookings',
    'can_create_bookings',
    'can_send_messages'
  ],
  manager: [
    'can_view_properties',
    'can_create_properties',
    'can_edit_properties',
    'can_view_bookings',
    'can_create_bookings',
    'can_approve_property',
    'can_verify_host',
    'can_verify_payment',
    'can_resolve_dispute',
    'can_view_users',
    'can_send_messages'
  ],
  admin: [
    'can_view_properties',
    'can_create_properties',
    'can_edit_properties',
    'can_delete_properties',
    'can_view_bookings',
    'can_create_bookings',
    'can_cancel_bookings',
    'can_approve_property',
    'can_view_users',
    'can_edit_users',
    'can_ban_user',
    'can_unban_user',
    'can_verify_host',
    'can_view_payments',
    'can_create_payments',
    'can_verify_payment',
    'can_reject_payment',
    'can_refund_payment',
    'can_resolve_dispute',
    'can_view_audit_logs',
    'can_manage_settings',
    'can_send_messages',
    'can_manage_conversations'
  ],
  super_admin: [
    // All permissions
    'can_view_properties',
    'can_create_properties',
    'can_edit_properties',
    'can_delete_properties',
    'can_approve_property',
    'can_view_users',
    'can_edit_users',
    'can_ban_user',
    'can_unban_user',
    'can_verify_host',
    'can_view_payments',
    'can_create_payments',
    'can_verify_payment',
    'can_reject_payment',
    'can_refund_payment',
    'can_view_bookings',
    'can_create_bookings',
    'can_cancel_bookings',
    'can_resolve_dispute',
    'can_view_audit_logs',
    'can_manage_settings',
    'can_manage_permissions',
    'can_send_messages',
    'can_manage_conversations',
    'can_delete_messages',
    'can_view_internal_notes',
    'can_send_internal_notes',
    'can_manage_messaging'
  ]
};

export function getDefaultPermissions(role: Role): Record<Permission, boolean> {
  const permissions = DEFAULT_PERMISSIONS[role] || [];
  const permissionMap: Record<Permission, boolean> = {} as Record<Permission, boolean>;
  
  ALL_PERMISSIONS.forEach(permission => {
    permissionMap[permission] = permissions.includes(permission);
  });
  
  return permissionMap;
}
```

---

## 5. Permission Checking

### 5.1 Frontend Hooks

**usePermissions Hook:**
```typescript
// src/hooks/usePermissions.ts
export function usePermissions() {
  const { profile } = useProfile();
  const permissions = profile?.permissions || {};
  
  const hasPermission = useCallback((permission: Permission): boolean => {
    return !!permissions[permission];
  }, [permissions]);
  
  const hasAllPermissions = useCallback((requiredPermissions: Permission[]): boolean => {
    return requiredPermissions.every(permission => hasPermission(permission));
  }, [hasPermission]);
  
  const hasAnyPermission = useCallback((requiredPermissions: Permission[]): boolean => {
    return requiredPermissions.some(permission => hasPermission(permission));
  }, [hasPermission]);
  
  return {
    permissions,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission
  };
}
```

**useRole Hook:**
```typescript
// src/hooks/useRole.ts
export function useRole() {
  const { profile } = useProfile();
  const role = profile?.role || 'guest';
  
  const isGuest = role === 'guest';
  const isHost = role === 'host';
  const isManager = role === 'manager';
  const isAdmin = role === 'admin';
  const isSuperAdmin = role === 'super_admin';
  const isStaff = isManager || isAdmin || isSuperAdmin;
  
  return {
    role,
    isGuest,
    isHost,
    isManager,
    isAdmin,
    isSuperAdmin,
    isStaff
  };
}
```

### 5.2 Usage Examples

**Check Permission in Component:**
```typescript
function AdminButton() {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission('can_ban_user')) {
    return null;
  }
  
  return <Button>Ban User</Button>;
}
```

**Check Role in Component:**
```typescript
function AdminDashboard() {
  const { isAdmin, isSuperAdmin } = useRole();
  
  if (!isAdmin && !isSuperAdmin) {
    return <AccessDenied />;
  }
  
  return <Dashboard />;
}
```

**Route Protection:**
```typescript
function ProtectedRoute({ children, requiredPermission }: Props) {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
}
```

---

## 6. Database-Level Authorization

### 6.1 Row-Level Security (RLS)

RLS policies enforce access control at the database level.

**Example: Properties Table RLS:**
```sql
-- Public can view approved properties
CREATE POLICY "Public can view approved properties"
ON properties FOR SELECT
TO public
USING (
  approval_status = 'approved' 
  AND status = 'available' 
  AND deleted_at IS NULL
);

-- Owners can view own properties
CREATE POLICY "Owners can view own properties"
ON properties FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

-- Owners can insert properties
CREATE POLICY "Owners can insert properties"
ON properties FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

-- Admins can view all properties
CREATE POLICY "Admins can view all properties"
ON properties FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);
```

### 6.2 RPC Function Authorization

RPC functions check permissions before executing operations.

**Example: ban_user RPC:**
```sql
CREATE OR REPLACE FUNCTION ban_user(user_id UUID, reason TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role TEXT;
BEGIN
  -- Get current user's role
  SELECT role INTO current_user_role
  FROM profiles
  WHERE id = auth.uid();
  
  -- Check if user has permission
  IF current_user_role NOT IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION 'Permission denied: can_ban_user required';
  END IF;
  
  -- Check if user has specific permission
  IF NOT (permissions->>'can_ban_user')::boolean THEN
    RAISE EXCEPTION 'Permission denied: can_ban_user required';
  END IF;
  
  -- Ban user
  UPDATE profiles
  SET is_banned = true
  WHERE id = user_id;
  
  -- Log activity
  INSERT INTO admin_activity_logs (admin_id, action, entity_type, entity_id, details)
  VALUES (auth.uid(), 'ban_user', 'profile', user_id, jsonb_build_object('reason', reason));
  
  RETURN true;
END;
$$;
```

---

## 7. Permission Management

### 7.1 Granting Permissions

**Via Role Assignment:**
```typescript
// Assign role (automatically grants default permissions)
const { data, error } = await supabase
  .from('profiles')
  .update({ role: 'admin' })
  .eq('id', userId);
```

**Via Custom Permissions:**
```typescript
// Add custom permission to user
const { data, error } = await supabase
  .from('profiles')
  .update({ 
    permissions: {
      ...currentPermissions,
      'can_approve_property': true
    }
  })
  .eq('id', userId);
```

### 7.2 Revoking Permissions

**Via Role Change:**
```typescript
// Change role (automatically updates permissions)
const { data, error } = await supabase
  .from('profiles')
  .update({ role: 'guest' })
  .eq('id', userId);
```

**Via Custom Permission Removal:**
```typescript
// Remove specific permission
const { data, error } = await supabase
  .from('profiles')
  .update({ 
    permissions: {
      ...currentPermissions,
      'can_approve_property': false
    }
  })
  .eq('id', userId);
```

---

## 8. Audit Logging

### 8.1 Admin Activity Logs

All admin actions are logged for audit purposes.

**admin_activity_logs table:**
```sql
CREATE TABLE admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES profiles(id) NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Logged Actions:**
- Property approval/rejection/suspension
- User ban/unban/verification
- Payment verification/rejection
- Booking cancellation
- Dispute resolution
- Permission changes

### 8.2 Audit Log Query

```typescript
async function getAdminActivityLogs(filters: {
  adminId?: string;
  action?: string;
  entityType?: string;
  dateFrom?: Date;
  dateTo?: Date;
}) {
  let query = supabase
    .from('admin_activity_logs')
    .select(`
      *,
      admin:profiles!admin_activity_logs_admin_id_fkey (
        id,
        email,
        full_name,
        role
      )
    `);
  
  if (filters.adminId) {
    query = query.eq('admin_id', filters.adminId);
  }
  
  if (filters.action) {
    query = query.eq('action', filters.action);
  }
  
  if (filters.entityType) {
    query = query.eq('entity_type', filters.entityType);
  }
  
  if (filters.dateFrom) {
    query = query.gte('created_at', filters.dateFrom.toISOString());
  }
  
  if (filters.dateTo) {
    query = query.lte('created_at', filters.dateTo.toISOString());
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  return { data, error };
}
```

---

## 9. Best Practices

### 9.1 Permission Design

- **Principle of Least Privilege:** Grant only necessary permissions
- **Role-Based:** Use roles for common permission sets
- **Custom Permissions:** Use custom permissions for exceptions
- **Regular Reviews:** Review permissions regularly
- **Audit Trail:** Log all permission changes

### 9.2 Implementation Guidelines

- **Check at Multiple Layers:** Check permissions at frontend and backend
- **Use Hooks:** Use custom hooks for permission checking
- **Graceful Degradation:** Hide features without breaking the UI
- **Clear Messaging:** Show clear messages when access is denied
- **Consistent Naming:** Use consistent permission naming

### 9.3 Security Considerations

- **Never Trust Client:** Always verify permissions on the server
- **Use RLS:** Enforce access control at database level
- **Log Changes:** Log all permission changes
- **Regular Audits:** Regularly audit user permissions
- **Revoke Access:** Immediately revoke access when needed

---

## 10. Common Patterns

### 10.1 Permission-Based UI

```typescript
function PropertyActions({ property }: Props) {
  const { hasPermission } = usePermissions();
  const { isOwner } = useOwnership(property.owner_id);
  
  return (
    <div>
      {isOwner && (
        <Button onClick={() => editProperty(property)}>Edit</Button>
      )}
      
      {hasPermission('can_delete_properties') && (
        <Button onClick={() => deleteProperty(property)}>Delete</Button>
      )}
      
      {hasPermission('can_approve_property') && (
        <Button onClick={() => approveProperty(property)}>Approve</Button>
      )}
    </div>
  );
}
```

### 10.2 Role-Based Routing

```typescript
function AdminRoute({ children }: Props) {
  const { isAdmin, isSuperAdmin } = useRole();
  
  if (!isAdmin && !isSuperAdmin) {
    return <Navigate to="/" />;
  }
  
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin/*" element={
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      } />
    </Routes>
  );
}
```

### 10.3 Server-Side Permission Check

```typescript
// In Edge Function or RPC function
async function checkPermission(userId: string, permission: string): Promise<boolean> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('permissions, role')
    .eq('id', userId)
    .single();
  
  if (!profile) {
    return false;
  }
  
  // Check custom permission
  if (profile.permissions[permission]) {
    return true;
  }
  
  // Check default permission for role
  const defaultPermissions = getDefaultPermissions(profile.role);
  return !!defaultPermissions[permission];
}
```

---

## 11. Troubleshooting

### 11.1 Permission Not Working

**Check:**
1. User role is correct
2. Permissions are set correctly in database
3. RLS policies are enabled
4. Frontend permission check is correct
5. Backend permission check is correct

**Debug:**
```typescript
// Log permissions
console.log('User permissions:', profile.permissions);
console.log('Has permission:', hasPermission('can_approve_property'));
```

### 11.2 RLS Policy Blocking Access

**Check:**
1. RLS is enabled on table
2. Policy conditions are correct
3. User is authenticated
4. User has correct role
5. Policy uses correct auth.uid()

**Debug:**
```sql
-- Test RLS policy
SET LOCAL ROLE authenticated;
SELECT * FROM properties WHERE owner_id = auth.uid();
```

---

## 12. Future Enhancements

### 12.1 Planned Features

- **Permission Groups:** Group related permissions
- **Temporary Permissions:** Grant permissions for limited time
- **Permission Templates:** Reusable permission sets
- **Permission Inheritance:** Inherit from parent roles
- **Permission UI:** Admin UI for managing permissions
- **Permission Requests:** Users can request permissions
- **Permission Approval:** Approval workflow for permission requests

### 12.2 Advanced Features

- **Attribute-Based Access Control (ABAC):** Fine-grained access control
- **Dynamic Permissions:** Permissions based on context
- **Time-Based Permissions:** Permissions valid at specific times
- **Location-Based Permissions:** Permissions based on location
- **Machine Learning:** Automated permission recommendations

---

## 13. Documentation References

**Related Documents:**
- Security Documentation
- Database Documentation
- Backend Architecture Document

**Code References:**
- `src/lib/permissions.ts` - Permission definitions
- `src/hooks/usePermissions.ts` - Permission hooks
- `src/hooks/useRole.ts` - Role hooks
- `supabase/migrations/` - RLS policies and triggers

---

**End of RBAC Documentation**
