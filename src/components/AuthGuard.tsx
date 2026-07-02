import { useContext, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AuthContext } from '@/lib/auth-context'
import { AuthModal } from '@/components/AuthModal'

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
}

/**
 * Route-level authentication guard
 * Shows login modal when user tries to access protected route
 */
export function AuthGuard({ children, redirectTo }: AuthGuardProps) {
  const authContext = useContext(AuthContext)
  const { session, isLoading } = authContext || { session: null, isLoading: false }
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [hasRedirected, setHasRedirected] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !session && !hasRedirected) {
      setShowAuthModal(true)
      setHasRedirected(true)
    }
  }, [session, isLoading, hasRedirected])

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    // Stay on the current page after successful login
  }

  const handleAuthClose = () => {
    setShowAuthModal(false)
    // Redirect to home or specified redirect path
    if (redirectTo) {
      navigate(redirectTo)
    } else {
      navigate('/')
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E8344E] mx-auto mb-4" />
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
            <p className="text-gray-600 mb-6">Please sign in or create an account to continue.</p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full bg-[#E8344E] text-white py-3 rounded-xl font-semibold hover:bg-[#c9263f] transition-colors"
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
