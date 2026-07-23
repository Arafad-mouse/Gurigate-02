import { useEffect, useRef, useState, useCallback } from 'react'
import { realtimeMessagingService } from '@/services/realtimeMessagingService'
import type { Message } from '@/services/messagingService'

interface UseRealtimeMessagesOptions {
  conversationId: string
  onNewMessage?: (message: Message) => void
  onMessageUpdated?: (message: Message) => void
  onMessageDeleted?: (messageId: string) => void
  enabled?: boolean
}

export function useRealtimeMessages({
  conversationId,
  onNewMessage,
  onMessageUpdated,
  onMessageDeleted,
  enabled = true
}: UseRealtimeMessagesOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!enabled || !conversationId) return

    const unsubscribe = realtimeMessagingService.subscribeToMessages(
      conversationId,
      (event) => {
        if (event.eventType === 'INSERT') {
          onNewMessage?.(event.new)
        } else if (event.eventType === 'UPDATE') {
          onMessageUpdated?.(event.new)
        } else if (event.eventType === 'DELETE') {
          onMessageDeleted?.(event.new.id)
        }
      }
    )

    unsubscribeRef.current = unsubscribe

    // Update connection status from service
    const statusUnsubscribe = realtimeMessagingService.onConnectionStatusChange((status) => {
      setIsConnected(status === 'SUBSCRIBED')
    })

    return () => {
      unsubscribe()
      statusUnsubscribe()
      unsubscribeRef.current = null
    }
  }, [conversationId, enabled, onNewMessage, onMessageUpdated, onMessageDeleted])

  return { isConnected }
}

// Typing indicators using presence (ephemeral, not stored in DB)
interface UseTypingIndicatorOptions {
  conversationId: string
  currentUserId: string | undefined
  enabled?: boolean
}

export function useTypingIndicator({
  conversationId,
  currentUserId,
  enabled = true
}: UseTypingIndicatorOptions) {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const unsubscribeRef = useRef<(() => void) | null>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!enabled || !conversationId || !currentUserId) return

    const unsubscribe = realtimeMessagingService.subscribeToTypingIndicators(
      conversationId,
      (userId, isTyping) => {
        if (userId === currentUserId) return // Don't track own typing

        setTypingUsers((prev) => {
          const next = new Set(prev)
          if (isTyping) {
            next.add(userId)
          } else {
            next.delete(userId)
          }
          return next
        })
      }
    )

    unsubscribeRef.current = unsubscribe

    return () => {
      unsubscribe()
      unsubscribeRef.current = null
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [conversationId, currentUserId, enabled])

  const sendTypingStatus = useCallback((isTyping: boolean) => {
    if (!enabled || !conversationId || !currentUserId) return

    realtimeMessagingService.setTypingIndicator(conversationId, currentUserId, isTyping)

    // Auto-clear typing status after 3 seconds of inactivity
    if (isTyping) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      typingTimeoutRef.current = setTimeout(() => {
        realtimeMessagingService.setTypingIndicator(conversationId, currentUserId, false)
      }, 3000)
    }
  }, [enabled, conversationId, currentUserId])

  return {
    typingUsers,
    sendTypingStatus,
    isSomeoneTyping: typingUsers.size > 0
  }
}
