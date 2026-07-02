import { useContext, forwardRef, type ButtonHTMLAttributes } from 'react'
import { AuthContext } from '@/lib/auth-context'
import { AuthModal } from '@/components/AuthModal'

interface ProtectedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Function to execute when authenticated
   */
  onAuthAction?: () => void
  /**
   * Whether to show the login/signup modal
   * @default true
   */
  requireAuth?: boolean
  /**
   * Default tab for auth modal (login or signup)
   * @default 'login'
   */
  authDefaultTab?: 'login' | 'signup'
  /**
   * Custom message to show before opening modal
   */
  authMessage?: string
}

/**
 * Button that requires authentication before executing action
 * Shows login modal when unauthenticated user clicks
 */
export const ProtectedButton = forwardRef<HTMLButtonElement, ProtectedButtonProps>(
  (
    {
      children,
      onClick,
      onAuthAction,
      requireAuth = true,
      authDefaultTab = 'login',
      authMessage,
      disabled,
      ...props
    },
    ref
  ) => {
    const authContext = useContext(AuthContext)
    const { session } = authContext || { session: null }
    const [showAuthModal, setShowAuthModal] = useState(false)

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (requireAuth && !session) {
        e.preventDefault()
        e.stopPropagation()
        setShowAuthModal(true)
        return
      }

      // Execute original onClick if authenticated
      if (onClick) {
        onClick(e)
      }

      // Execute authenticated action
      if (onAuthAction) {
        onAuthAction()
      }
    }

    const handleAuthSuccess = () => {
      setShowAuthModal(false)
      // Execute the action after successful login
      if (onAuthAction) {
        onAuthAction()
      }
    }

    const handleAuthClose = () => {
      setShowAuthModal(false)
    }

    return (
      <>
        <button
          ref={ref}
          onClick={handleClick}
          disabled={disabled}
          {...props}
        >
          {children}
        </button>

        {showAuthModal && (
          <AuthModal
            onClose={handleAuthClose}
            onSuccess={handleAuthSuccess}
            defaultTab={authDefaultTab}
          />
        )}
      </>
    )
  }
)

ProtectedButton.displayName = 'ProtectedButton'

import { useState } from 'react'
