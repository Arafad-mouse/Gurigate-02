import { useState, useCallback } from 'react'
import { useContext } from 'react'
import { AuthContext } from '@/lib/auth-context'
import { AdminService } from '@/services/adminService'

export function usePropertyModeration() {
  const authContext = useContext(AuthContext)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const adminId = authContext?.profile?.id

  const approveProperty = useCallback(async (propertyId: string, note?: string) => {
    if (!adminId) {
      setError('Admin ID not found')
      return false
    }

    try {
      setLoading(true)
      setError(null)
      await AdminService.approveProperty(propertyId, adminId, note)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve property')
      return false
    } finally {
      setLoading(false)
    }
  }, [adminId])

  const rejectProperty = useCallback(async (propertyId: string, reason: string) => {
    if (!adminId) {
      setError('Admin ID not found')
      return false
    }

    try {
      setLoading(true)
      setError(null)
      await AdminService.rejectProperty(propertyId, adminId, reason)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject property')
      return false
    } finally {
      setLoading(false)
    }
  }, [adminId])

  const suspendProperty = useCallback(async (propertyId: string, reason: string) => {
    if (!adminId) {
      setError('Admin ID not found')
      return false
    }

    try {
      setLoading(true)
      setError(null)
      await AdminService.suspendProperty(propertyId, adminId, reason)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to suspend property')
      return false
    } finally {
      setLoading(false)
    }
  }, [adminId])

  const featureProperty = useCallback(async (propertyId: string, note?: string) => {
    if (!adminId) {
      setError('Admin ID not found')
      return false
    }

    try {
      setLoading(true)
      setError(null)
      await AdminService.featureProperty(propertyId, adminId, note)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to feature property')
      return false
    } finally {
      setLoading(false)
    }
  }, [adminId])

  const unfeatureProperty = useCallback(async (propertyId: string, note?: string) => {
    if (!adminId) {
      setError('Admin ID not found')
      return false
    }

    try {
      setLoading(true)
      setError(null)
      await AdminService.unfeatureProperty(propertyId, adminId, note)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unfeature property')
      return false
    } finally {
      setLoading(false)
    }
  }, [adminId])

  const getPropertiesByStatus = useCallback(async (status: 'draft' | 'pending' | 'approved' | 'rejected' | 'suspended') => {
    try {
      setLoading(true)
      setError(null)
      return await AdminService.getPropertiesByStatus(status)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load properties')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const getModerationHistory = useCallback(async (propertyId: string) => {
    try {
      setLoading(true)
      setError(null)
      return await AdminService.getPropertyModerationHistory(propertyId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load moderation history')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    approveProperty,
    rejectProperty,
    suspendProperty,
    featureProperty,
    unfeatureProperty,
    getPropertiesByStatus,
    getModerationHistory,
    clearError: () => setError(null),
  }
}
