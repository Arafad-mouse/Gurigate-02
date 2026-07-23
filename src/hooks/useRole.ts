import { useContext } from 'react'
import { AuthContext } from '@/lib/auth-context'
import { USER_ROLE } from '@/constants/status'

/**
 * Hook to access user role information
 * Provides type-safe role checking and admin access control
 */
export function useRole() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useRole must be used within an AuthProvider')
  }

  const { profile } = context

  const isAdmin = profile?.role === USER_ROLE.ADMIN || profile?.role === USER_ROLE.SUPER_ADMIN
  const isSuperAdmin = profile?.role === USER_ROLE.SUPER_ADMIN
  const isManager = profile?.role === USER_ROLE.MANAGER || isAdmin
  const isHost = profile?.role === USER_ROLE.HOST || isManager
  const isGuest = profile?.role === USER_ROLE.GUEST || !profile?.role
  const isBanned = profile?.isBanned ?? false

  const hasRole = (roles: (typeof USER_ROLE)[keyof typeof USER_ROLE] | (typeof USER_ROLE)[keyof typeof USER_ROLE][]): boolean => {
    if (!profile) return false
    
    const rolesArray = Array.isArray(roles) ? roles : [roles]
    return profile.role ? rolesArray.includes(profile.role as any) : false
  }

  const canAccessAdmin = isAdmin || isSuperAdmin

  return {
    profile,
    role: profile?.role,
    isAdmin,
    isSuperAdmin,
    isManager,
    isHost,
    isGuest,
    isBanned,
    hasRole,
    canAccessAdmin,
  }
}
