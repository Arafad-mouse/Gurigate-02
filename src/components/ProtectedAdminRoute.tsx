import { Navigate } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '@/lib/auth-context'
import { useRole } from '@/hooks/useRole'
import { USER_ROLE } from '@/constants/status'

interface ProtectedAdminRouteProps {
  children: React.ReactNode
  requiredRoles?: (typeof USER_ROLE)[keyof typeof USER_ROLE][]
  requireSuperAdmin?: boolean
}

/**
 * Protected Route Component for Admin Panel
 * Enforces role-based access control for admin routes
 * Redirects unauthorized users to home page
 */
export function ProtectedAdminRoute({ 
  children, 
  requiredRoles, 
  requireSuperAdmin = false 
}: ProtectedAdminRouteProps) {
  const authContext = useContext(AuthContext)
  const { canAccessAdmin, isSuperAdmin, hasRole, isBanned } = useRole()
  
  const isLoading = authContext?.isLoading ?? false
  const profile = authContext?.profile

  // Show loading state while profile is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!profile) {
    return <Navigate to="/" replace />
  }

  // Redirect if user is banned
  if (isBanned) {
    return <Navigate to="/" replace />
  }

  // Redirect if user doesn't have admin access
  if (!canAccessAdmin) {
    return <Navigate to="/" replace />
  }

  // Check for super admin requirement
  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/admin/dashboard" replace />
  }

  // Check for specific role requirements
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = hasRole(requiredRoles)
    if (!hasRequiredRole) {
      return <Navigate to="/admin/dashboard" replace />
    }
  }

  return <>{children}</>
}
