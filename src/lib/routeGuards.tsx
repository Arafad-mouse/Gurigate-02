import { Navigate } from 'react-router-dom'
import type { AuthProfile } from '@/services/authService'
import { isAdmin, isManager, isHost, isVerifiedHost, isBanned } from '@/services/authService'

interface RouteGuardProps {
  children: React.ReactNode
  profile: AuthProfile | null
  fallback?: React.ReactNode
}

// Admin-only route guard - requires admin or super_admin role
export function AdminRouteGuard({ children, profile, fallback }: RouteGuardProps) {
  if (!profile) {
    return <Navigate to="/profile" replace />
  }

  if (isBanned(profile)) {
    return fallback || <Navigate to="/" replace />
  }

  if (!isAdmin(profile)) {
    return fallback || <Navigate to="/" replace />
  }

  return <>{children}</>
}

// Manager+ route guard - requires manager, admin, or super_admin role
export function ManagerRouteGuard({ children, profile, fallback }: RouteGuardProps) {
  if (!profile) {
    return <Navigate to="/profile" replace />
  }

  if (isBanned(profile)) {
    return fallback || <Navigate to="/" replace />
  }

  if (!isManager(profile)) {
    return fallback || <Navigate to="/" replace />
  }

  return <>{children}</>
}

// Host+ route guard - requires host, manager, admin, or super_admin role
export function HostRouteGuard({ children, profile, fallback }: RouteGuardProps) {
  if (!profile) {
    return <Navigate to="/profile" replace />
  }

  if (isBanned(profile)) {
    return fallback || <Navigate to="/" replace />
  }

  if (!isHost(profile)) {
    return fallback || <Navigate to="/" replace />
  }

  return <>{children}</>
}

// Verified host route guard - requires verified host role
export function VerifiedHostRouteGuard({ children, profile, fallback }: RouteGuardProps) {
  if (!profile) {
    return <Navigate to="/profile" replace />
  }

  if (isBanned(profile)) {
    return fallback || <Navigate to="/" replace />
  }

  if (!isVerifiedHost(profile)) {
    return fallback || <Navigate to="/" replace />
  }

  return <>{children}</>
}

// Authenticated route guard - requires any authenticated user
export function AuthRouteGuard({ children, profile, fallback }: RouteGuardProps) {
  if (!profile) {
    return <Navigate to="/profile" replace />
  }

  if (isBanned(profile)) {
    return fallback || <Navigate to="/" replace />
  }

  return <>{children}</>
}

// Helper function to check if user has required role
export function hasRequiredRole(profile: AuthProfile | null, requiredRole: 'admin' | 'manager' | 'host' | 'verified_host'): boolean {
  if (!profile || isBanned(profile)) {
    return false
  }

  switch (requiredRole) {
    case 'admin':
      return isAdmin(profile)
    case 'manager':
      return isManager(profile)
    case 'host':
      return isHost(profile)
    case 'verified_host':
      return isVerifiedHost(profile)
    default:
      return false
  }
}
