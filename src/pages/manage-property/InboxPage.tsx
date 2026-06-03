import { useState, useEffect, useCallback } from 'react'
import { useContext } from 'react'
import { AuthContext } from '@/lib/auth-context'
import { usePermissions } from '@/hooks/usePermissions'
import { MessagingService } from '@/services/messagingService'
import { realtimeMessagingService } from '@/services/realtimeMessagingService'
import type { UserConversation } from '@/services/messagingService'
import { CONVERSATION_TYPE } from '@/constants/status'
import { MessageSquare, Search, Wifi, WifiOff } from 'lucide-react'

// Placeholder components - will be implemented next
import ConversationList from '@/components/inbox/ConversationList'
import MessageThread from '@/components/inbox/MessageThread'
import ContextPanel from '@/components/inbox/ContextPanel'
import MessageComposer from '@/components/inbox/MessageComposer'
import { useConversationPresence } from '@/hooks/useConversationPresence'

export default function InboxPage() {
  const authContext = useContext(AuthContext)
  const { canViewMessages, canSendMessages } = usePermissions()
  const [conversations, setConversations] = useState<UserConversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<UserConversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread' | 'booking' | 'property' | 'payment' | 'support'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const currentUserId = authContext?.profile?.id
  const { isOnline, isSubscribed } = useConversationPresence()

  // Load conversations
  const loadConversations = useCallback(async () => {
    // Development mode: allow UI viewing without authentication
    const bypassAuth = import.meta.env.DEV

    if (!currentUserId && !bypassAuth) {
      setLoading(false)
      setError('Please log in to view messages')
      return
    }

    try {
      setLoading(true)
      let data: UserConversation[]

      if (!currentUserId && bypassAuth) {
        // Show empty state for UI development
        data = []
      } else {
        switch (filter) {
          case 'unread':
            data = await MessagingService.getUnreadConversations()
            break
          case 'booking':
            data = await MessagingService.getConversationsByType(CONVERSATION_TYPE.BOOKING)
            break
          case 'property':
            data = await MessagingService.getConversationsByType(CONVERSATION_TYPE.PROPERTY)
            break
          case 'payment':
            data = await MessagingService.getConversationsByType(CONVERSATION_TYPE.PAYMENT)
            break
          case 'support':
            data = await MessagingService.getConversationsByType(CONVERSATION_TYPE.SUPPORT)
            break
          default:
            data = await MessagingService.getUserConversations()
        }
      }

      setConversations(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }, [currentUserId, filter])

  // Subscribe to conversation updates
  useEffect(() => {
    if (!currentUserId) return

    const unsubscribe = realtimeMessagingService.subscribeToConversations(
      currentUserId,
      (event) => {
        if (event.eventType === 'INSERT') {
          // New conversation - refresh list
          loadConversations()
        } else if (event.eventType === 'UPDATE') {
          // Conversation updated (e.g., last message changed)
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === event.new.id
                ? { ...conv, ...event.new }
                : conv
            )
          )
        } else if (event.eventType === 'DELETE') {
          // Conversation deleted
          setConversations((prev) => prev.filter((conv) => conv.id !== event.new.id))
        }
      }
    )

    return () => unsubscribe()
  }, [currentUserId, loadConversations])

  // Initial load and filter changes
  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  // Reconnect synchronization when connection returns
  useEffect(() => {
    if (isOnline && isSubscribed) {
      loadConversations()
    }
  }, [isOnline, isSubscribed, loadConversations])

  // Filter conversations by search query
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      conv.subject?.toLowerCase().includes(query) ||
      conv.last_message?.toLowerCase().includes(query)
    )
  })

  // Calculate total unread count
  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread_count, 0)

  // Permission check with development bypass for UI testing
  const bypassPermissions = import.meta.env.DEV
  if (!bypassPermissions && !canViewMessages()) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">You don't have permission to view messages</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E8344E]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8344E] flex items-center justify-center text-white">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Inbox</h1>
              <p className="text-sm text-gray-500">
                {totalUnread > 0 && `${totalUnread} unread message${totalUnread > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {isOnline ? (
              <div className="flex items-center gap-1 text-green-600">
                <Wifi className="h-4 w-4" />
                <span className="text-xs font-medium">Connected</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-gray-400">
                <WifiOff className="h-4 w-4" />
                <span className="text-xs font-medium">Offline</span>
              </div>
            )}
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8344E] focus:border-transparent w-64"
              />
            </div>

            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filter === 'unread' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setFilter('booking')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filter === 'booking' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Bookings
              </button>
              <button
                onClick={() => setFilter('property')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filter === 'property' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Properties
              </button>
              <button
                onClick={() => setFilter('payment')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filter === 'payment' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Payments
              </button>
              <button
                onClick={() => setFilter('support')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filter === 'support' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Support
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Three-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Conversation List */}
        <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
          <ConversationList
            conversations={filteredConversations}
            selectedConversation={selectedConversation}
            onSelectConversation={setSelectedConversation}
            currentUserId={currentUserId}
          />
        </div>

        {/* Center Panel - Message Thread */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {selectedConversation ? (
            <>
              <MessageThread
                conversation={selectedConversation}
                currentUserId={currentUserId}
              />
              {canSendMessages() && (
                <MessageComposer
                  conversationId={selectedConversation.id}
                  currentUserId={currentUserId}
                  onMessageSent={loadConversations}
                />
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Context Panel */}
        {selectedConversation && (
          <div className="w-80 border-l border-gray-200 bg-white">
            <ContextPanel
              conversation={selectedConversation}
              onClose={() => setSelectedConversation(null)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
