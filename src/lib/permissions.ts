// Centralized permission layer for GuriGate admin system
// Prevents scattered role logic across components

import type { AuthProfile } from '@/services/authService'
import { USER_ROLE } from '@/constants/status'

// Permission keys matching the permissions JSONB structure in profiles
export const PERMISSIONS = {
  // Property permissions
  CAN_VIEW_PROPERTIES: 'can_view_properties',
  CAN_APPROVE_PROPERTY: 'can_approve_property',
  CAN_REJECT_PROPERTY: 'can_reject_property',
  CAN_SUSPEND_PROPERTY: 'can_suspend_property',
  CAN_FEATURE_PROPERTY: 'can_feature_property',
  
  // User permissions
  CAN_VIEW_USERS: 'can_view_users',
  CAN_BAN_USER: 'can_ban_user',
  CAN_UNBAN_USER: 'can_unban_user',
  CAN_VERIFY_HOST: 'can_verify_host',
  CAN_MODIFY_ROLES: 'can_modify_roles',
  
  // Payment permissions
  CAN_VIEW_PAYMENTS: 'can_view_payments',
  CAN_VERIFY_PAYMENT: 'can_verify_payment',
  CAN_REJECT_PAYMENT: 'can_reject_payment',
  CAN_REFUND_PAYMENT: 'can_refund_payment',
  CAN_VIEW_FINANCIAL_REPORTS: 'can_view_financial_reports',
  
  // Booking permissions
  CAN_VIEW_BOOKINGS: 'can_view_bookings',
  CAN_CANCEL_BOOKING: 'can_cancel_booking',
  CAN_RESOLVE_DISPUTE: 'can_resolve_dispute',
  CAN_MODIFY_BOOKING_DATES: 'can_modify_booking_dates',
  
  // System permissions
  CAN_VIEW_AUDIT_LOGS: 'can_view_audit_logs',
  CAN_MANAGE_NOTIFICATIONS: 'can_manage_notifications',
  CAN_ACCESS_ADMIN_DASHBOARD: 'can_access_admin_dashboard',
} as const

export type PermissionKey = typeof PERMISSIONS[keyof typeof PERMISSIONS]

// Default permissions for each role
export const ROLE_DEFAULT_PERMISSIONS: Record<string, PermissionKey[]> = {
  [USER_ROLE.GUEST]: [
    PERMISSIONS.CAN_VIEW_PROPERTIES,
    PERMISSIONS.CAN_VIEW_BOOKINGS,
  ],
  
  [USER_ROLE.HOST]: [
    PERMISSIONS.CAN_VIEW_PROPERTIES,
    PERMISSIONS.CAN_VIEW_BOOKINGS,
    PERMISSIONS.CAN_VIEW_PAYMENTS,
  ],
  
  [USER_ROLE.MANAGER]: [
    PERMISSIONS.CAN_VIEW_PROPERTIES,
    PERMISSIONS.CAN_VIEW_USERS,
    PERMISSIONS.CAN_VIEW_BOOKINGS,
    PERMISSIONS.CAN_VIEW_PAYMENTS,
    PERMISSIONS.CAN_APPROVE_PROPERTY,
    PERMISSIONS.CAN_REJECT_PROPERTY,
    PERMISSIONS.CAN_VERIFY_HOST,
    PERMISSIONS.CAN_VERIFY_PAYMENT,
    PERMISSIONS.CAN_RESOLVE_DISPUTE,
    PERMISSIONS.CAN_ACCESS_ADMIN_DASHBOARD,
  ],
  
  [USER_ROLE.ADMIN]: [
    PERMISSIONS.CAN_VIEW_PROPERTIES,
    PERMISSIONS.CAN_APPROVE_PROPERTY,
    PERMISSIONS.CAN_REJECT_PROPERTY,
    PERMISSIONS.CAN_SUSPEND_PROPERTY,
    PERMISSIONS.CAN_FEATURE_PROPERTY,
    PERMISSIONS.CAN_VIEW_USERS,
    PERMISSIONS.CAN_BAN_USER,
    PERMISSIONS.CAN_UNBAN_USER,
    PERMISSIONS.CAN_VERIFY_HOST,
    PERMISSIONS.CAN_MODIFY_ROLES,
    PERMISSIONS.CAN_VIEW_PAYMENTS,
    PERMISSIONS.CAN_VERIFY_PAYMENT,
    PERMISSIONS.CAN_REJECT_PAYMENT,
    PERMISSIONS.CAN_REFUND_PAYMENT,
    PERMISSIONS.CAN_VIEW_FINANCIAL_REPORTS,
    PERMISSIONS.CAN_VIEW_BOOKINGS,
    PERMISSIONS.CAN_CANCEL_BOOKING,
    PERMISSIONS.CAN_RESOLVE_DISPUTE,
    PERMISSIONS.CAN_MODIFY_BOOKING_DATES,
    PERMISSIONS.CAN_VIEW_AUDIT_LOGS,
    PERMISSIONS.CAN_MANAGE_NOTIFICATIONS,
    PERMISSIONS.CAN_ACCESS_ADMIN_DASHBOARD,
  ],
  
  [USER_ROLE.SUPER_ADMIN]: [
    // Super admins have all permissions
    ...Object.values(PERMISSIONS),
  ],
} as const

/**
 * Check if a user has a specific permission
 * @param profile - User profile with role and permissions
 * @param permission - Permission key to check
 * @returns boolean indicating if user has permission
 */
export function hasPermission(
  profile: AuthProfile | null,
  permission: PermissionKey
): boolean {
  if (!profile) return false
  
  // Super admins have all permissions
  if (profile.role === USER_ROLE.SUPER_ADMIN) return true
  
  // Check user-specific permissions (from permissions JSONB)
  const userPermissions = (profile as any).permissions as Record<string, boolean> | undefined
  if (userPermissions && userPermissions[permission] === true) {
    return true
  }
  
  // Check role default permissions
  const rolePermissions = ROLE_DEFAULT_PERMISSIONS[profile.role] || []
  return rolePermissions.includes(permission)
}

/**
 * Check if user can approve properties
 */
export function canApproveProperty(profile: AuthProfile | null): boolean {
  return hasPermission(profile, PERMISSIONS.CAN_APPROVE_PROPERTY)
}

/**
 * Check if user can reject properties
 */
export function canRejectProperty(profile: AuthProfile | null): boolean {
  return hasPermission(profile, PERMISSIONS.CAN_REJECT_PROPERTY)
}

/**
 * Check if user can suspend properties
 */
export function canSuspendProperty(profile: AuthProfile | null): boolean {
  return hasPermission(profile, PERMISSIONS.CAN_SUSPEND_PROPERTY)
}

/**
 * Check if user can feature properties
 */
export function canFeatureProperty(profile: AuthProfile | null): boolean {
  return hasPermission(profile, PERMISSIONS.CAN_FEATURE_PROPERTY)
}

/**
 * Check if user can ban users
 */
export function canBanUser(profile: AuthProfile | null): boolean {
  return hasPermission(profile, PERMISSIONS.CAN_BAN_USER)
}

/**
 * Check if user can unban users
 */
export function canUnbanUser(profile: AuthProfile | null): boolean {
  return hasPermission(profile, PERMISSIONS.CAN_UNBAN_USER)
}

/**
 * Check if user can verify hosts
 */
export function canVerifyHost(profile: AuthProfile | null): boolean {
  return hasPermission(profile, PERMISSIONS.CAN_VERIFY_HOST)
}

/**
 * Check if user can verify payments
 */
export function canVerifyPayment(profile: AuthProfile | null): boolean {
  return hasPermission(profile, PERMISSIONS.CAN_VERIFY_PAYMENT)
}

/**
 * Check if user can reject payments
 */
export function canRejectPayment(profile: AuthProfile | null): boolean {
  return hasPermission(profile, PERMISSIONS.CAN_REJECT_PAYMENT)
}

/**
 * Check if user can refund payments
 */
export function canRefundPayment(profile: AuthProfile | null): boolean {
  return hasPermission(profile, PERMISSIONS.CAN_REFUND_PAYMENT)
}

/**
 * Check if user can resolve disputes
 */
export function canResolveDispute(profile: AuthProfile | null): boolean {
  return hasPermission(profile, PERMISSIONS.CAN_RESOLVE_DISPUTE)
}

/**
 * Check if user can cancel bookings
 */
export function canCancelBooking(profile: AuthProfile | null): boolean {
  return hasPermission(profile, PERMISSIONS.CAN_CANCEL_BOOKING)
}

/**
 * Check if user can access admin dashboard
 */
export function canAccessAdminDashboard(profile: AuthProfile | null): boolean {
  return hasPermission(profile, PERMISSIONS.CAN_ACCESS_ADMIN_DASHBOARD)
}

/**
 * Check if user can view audit logs
 */
export function canViewAuditLogs(profile: AuthProfile | null): boolean {
  return hasPermission(profile, PERMISSIONS.CAN_VIEW_AUDIT_LOGS)
}

/**
 * Get all permissions for a user
 * @param profile - User profile
 * @returns Array of permission keys the user has
 */
export function getUserPermissions(profile: AuthProfile | null): PermissionKey[] {
  if (!profile) return []
  
  // Super admins have all permissions
  if (profile.role === USER_ROLE.SUPER_ADMIN) {
    return Object.values(PERMISSIONS)
  }
  
  // Start with role default permissions
  const rolePermissions = ROLE_DEFAULT_PERMISSIONS[profile.role] || []
  const permissions = new Set(rolePermissions)
  
  // Add user-specific permissions
  const userPermissions = (profile as any).permissions as Record<string, boolean> | undefined
  if (userPermissions) {
    Object.entries(userPermissions).forEach(([key, value]) => {
      if (value === true && Object.values(PERMISSIONS).includes(key as PermissionKey)) {
        permissions.add(key as PermissionKey)
      }
    })
  }
  
  return Array.from(permissions)
}

/**
 * Check if user has any of the specified permissions
 * @param profile - User profile
 * @param permissions - Array of permission keys to check
 * @returns boolean indicating if user has any of the permissions
 */
export function hasAnyPermission(
  profile: AuthProfile | null,
  permissions: PermissionKey[]
): boolean {
  return permissions.some(permission => hasPermission(profile, permission))
}

/**
 * Check if user has all of the specified permissions
 * @param profile - User profile
 * @param permissions - Array of permission keys to check
 * @returns boolean indicating if user has all of the permissions
 */
export function hasAllPermissions(
  profile: AuthProfile | null,
  permissions: PermissionKey[]
): boolean {
  return permissions.every(permission => hasPermission(profile, permission))
}
