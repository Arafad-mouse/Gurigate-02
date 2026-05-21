import { useContext } from 'react'
import { AuthContext } from '@/lib/auth-context'
import type { PermissionKey } from '@/lib/permissions'
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canApproveProperty,
  canRejectProperty,
  canSuspendProperty,
  canFeatureProperty,
  canBanUser,
  canUnbanUser,
  canVerifyHost,
  canVerifyPayment,
  canRejectPayment,
  canRefundPayment,
  canResolveDispute,
  canCancelBooking,
  canAccessAdminDashboard,
  canViewAuditLogs,
  getUserPermissions,
} from '@/lib/permissions'

/**
 * Hook to access permission checks for the current user
 * Provides type-safe permission checking based on role and user-specific permissions
 */
export function usePermissions() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('usePermissions must be used within an AuthProvider')
  }

  const { profile } = context

  return {
    profile,
    
    // Generic permission checks
    hasPermission: (permission: PermissionKey) => hasPermission(profile, permission),
    hasAnyPermission: (permissions: PermissionKey[]) => hasAnyPermission(profile, permissions),
    hasAllPermissions: (permissions: PermissionKey[]) => hasAllPermissions(profile, permissions),
    getUserPermissions: () => getUserPermissions(profile),
    
    // Property permissions
    canApproveProperty: () => canApproveProperty(profile),
    canRejectProperty: () => canRejectProperty(profile),
    canSuspendProperty: () => canSuspendProperty(profile),
    canFeatureProperty: () => canFeatureProperty(profile),
    
    // User permissions
    canBanUser: () => canBanUser(profile),
    canUnbanUser: () => canUnbanUser(profile),
    canVerifyHost: () => canVerifyHost(profile),
    
    // Payment permissions
    canVerifyPayment: () => canVerifyPayment(profile),
    canRejectPayment: () => canRejectPayment(profile),
    canRefundPayment: () => canRefundPayment(profile),
    
    // Booking permissions
    canResolveDispute: () => canResolveDispute(profile),
    canCancelBooking: () => canCancelBooking(profile),
    
    // System permissions
    canAccessAdminDashboard: () => canAccessAdminDashboard(profile),
    canViewAuditLogs: () => canViewAuditLogs(profile),
  }
}
