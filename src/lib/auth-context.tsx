import type { Session } from '@supabase/supabase-js'
import type { ReactNode } from 'react'
import { createContext, startTransition, useEffect, useState } from 'react'

import type { AuthProfile, UpdateProfileInput } from '@/services/authService'
import {
  getCurrentSession,
  getSupabaseConfigurationError,
  hydrateProfile,
  signOutUser,
  subscribeToAuthChanges,
  updatePassword,
  updateProfile,
} from '@/services/authService'

type AuthContextValue = {
  session: Session | null
  profile: AuthProfile | null
  isLoading: boolean
  error: string | null
  refreshProfile: () => Promise<void>
  saveProfile: (input: UpdateProfileInput) => Promise<AuthProfile | null>
  changePassword: (nextPassword: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const configurationError = getSupabaseConfigurationError()
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<AuthProfile | null>(null)
  const [error, setError] = useState<string | null>(configurationError)
  const [isLoading, setIsLoading] = useState(!configurationError)

  useEffect(() => {
    if (configurationError) {
      return
    }

    let isActive = true

    const syncFromSession = async (nextSession: Session | null) => {
      if (!isActive) {
        return
      }

      startTransition(() => {
        setSession(nextSession)
      })

      if (!nextSession?.user) {
        if (isActive) {
          setProfile(null)
          setIsLoading(false)
        }
        return
      }

      try {
        const hydratedProfile = await hydrateProfile(nextSession.user)

        if (isActive) {
          setProfile(hydratedProfile)
          setError(null)
          setIsLoading(false)
        }
      } catch (profileError) {
        if (isActive) {
          setError(profileError instanceof Error ? profileError.message : 'Unable to load your account.')
          setIsLoading(false)
        }
      }
    }

    getCurrentSession()
      .then(syncFromSession)
      .catch((sessionError) => {
        if (isActive) {
          setError(sessionError instanceof Error ? sessionError.message : 'Unable to connect to Supabase.')
          setIsLoading(false)
        }
      })

    const subscription = subscribeToAuthChanges((_event, nextSession) => {
      void syncFromSession(nextSession)
    })

    return () => {
      isActive = false
      subscription.unsubscribe()
    }
  }, [configurationError])

  const refreshProfile = async () => {
    if (!session?.user) {
      setProfile(null)
      return
    }

    const hydratedProfile = await hydrateProfile(session.user)
    setProfile(hydratedProfile)
  }

  const saveProfile = async (input: UpdateProfileInput) => {
    const nextProfile = await updateProfile(input)
    setProfile(nextProfile)
    return nextProfile
  }

  const changePassword = async (nextPassword: string) => {
    await updatePassword(nextPassword)
  }

  const signOut = async () => {
    await signOutUser()
    setSession(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        isLoading,
        error,
        refreshProfile,
        saveProfile,
        changePassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
