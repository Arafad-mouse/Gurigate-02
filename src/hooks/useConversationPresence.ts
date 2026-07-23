import { useEffect, useState } from 'react'
import { realtimeMessagingService, type ConnectionStatus } from '@/services/realtimeMessagingService'

interface UseConversationPresenceOptions {
  enabled?: boolean
}

export function useConversationPresence({ enabled = true }: UseConversationPresenceOptions = {}) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('CONNECTING')
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    if (!enabled) return

    // Listen to connection status changes from the realtime service
    const unsubscribe = realtimeMessagingService.onConnectionStatusChange((status) => {
      setConnectionStatus(status)
      setIsOnline(status === 'SUBSCRIBED')
    })

    // Listen to browser online/offline events
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      unsubscribe()
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [enabled])

  return {
    connectionStatus,
    isOnline,
    isSubscribed: connectionStatus === 'SUBSCRIBED',
    isConnecting: connectionStatus === 'CONNECTING',
    hasError: connectionStatus === 'CHANNEL_ERROR' || connectionStatus === 'TIMED_OUT'
  }
}
