import { useContext, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AuthContext } from '@/lib/auth-context'
import { AuthModal } from '@/components/AuthModal'

interface ProtectedBookingRouteProps {
  children: React.ReactNode
}

/**
 * Route guard for booking operations
 * Shows login modal when user tries to access protected booking routes
 * Preserves intended destination for post-login redirect
 */
export function ProtectedBookingRoute({ children }: ProtectedBookingRouteProps) {
  const authContext = useContext(AuthContext)
  const { session, isLoading } = authContext || { session: null, isLoading: false }
  const [showAuthModal, setShowAuthModal] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !session) {
      // Store the intended destination in sessionStorage
      try {
        sessionStorage.setItem('intendedDestination', location.pathname + location.search)
      } catch {
        // Storage might be blocked
      }
      setShowAuthModal(true)
    }
  }, [session, isLoading, location])

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    // Redirect to intended destination after successful login
    try {
      const intendedDestination = sessionStorage.getItem('intendedDestination')
      if (intendedDestination) {
        sessionStorage.removeItem('intendedDestination')
        navigate(intendedDestination)
      } else {
        navigate('/booking/dashboard')
      }
    } catch {
      navigate('/booking/dashboard')
    }
  }

  const handleAuthClose = () => {
    setShowAuthModal(false)
    // Clear stored destination and redirect to home
    try {
      sessionStorage.removeItem('intendedDestination')
    } catch {
      // Storage might be blocked
    }
    navigate('/')
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BA0036] mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <>
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please sign in or create an account to access booking operations.</p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full bg-[#BA0036] text-white py-3 rounded-xl font-semibold hover:bg-[#99002a] transition-colors"
            >
              Sign In or Sign Up
            </button>
          </div>
        </div>
        {showAuthModal && (
          <AuthModal
            onClose={handleAuthClose}
            onSuccess={handleAuthSuccess}
          />
        )}
      </>
    )
  }

  return <>{children}</>
}
