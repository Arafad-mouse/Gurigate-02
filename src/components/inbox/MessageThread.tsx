import { useState, useEffect, useCallback } from 'react'
import type { UserConversation } from '@/services/messagingService'
import { MessagingService } from '@/services/messagingService'
import type { Message } from '@/services/messagingService'
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages'
import { User, Clock, Shield } from 'lucide-react'

interface MessageThreadProps {
  conversation: UserConversation
  currentUserId: string | undefined
}

export default function MessageThread({ conversation, currentUserId }: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true)
      const data = await MessagingService.getMessages(conversation.id, false)
      setMessages(data)
      
      // Mark as read
      if (currentUserId) {
        await MessagingService.markAsRead(conversation.id, currentUserId)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages')
    } finally {
      setLoading(false)
    }
  }, [conversation.id, currentUserId])

  // Realtime message subscriptions
  const { isConnected } = useRealtimeMessages({
    conversationId: conversation.id,
    onNewMessage: (newMessage) => {
      setMessages((prev) => [...prev, newMessage])
    },
    onMessageUpdated: (updatedMessage) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
      )
    },
    onMessageDeleted: (deletedId) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== deletedId))
    },
    enabled: !!conversation.id
  })

  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  // Reconnect synchronization
  useEffect(() => {
    if (isConnected) {
      loadMessages()
    }
  }, [isConnected, loadMessages])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E8344E]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">No messages yet. Start the conversation!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto space-y-4">
        {messages.map((message) => {
          const isOwn = message.sender_id === currentUserId
          
          return (
            <div
              key={message.id}
              className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-gray-500" />
              </div>

              {/* Message Bubble */}
              <div className={`flex-1 ${isOwn ? 'text-right' : ''}`}>
                <div
                  className={`inline-block max-w-md rounded-2xl px-4 py-3 ${
                    isOwn
                      ? 'bg-[#E8344E] text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  {message.is_internal && (
                    <div className="flex items-center gap-1 text-xs mb-1 opacity-75">
                      <Shield className="h-3 w-3" />
                      <span>Internal Note</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>

                {/* Timestamp */}
                <div className={`flex items-center gap-1 mt-1 text-xs text-gray-400 ${isOwn ? 'justify-end' : ''}`}>
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(message.created_at)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
