import type { UserConversation } from '@/services/messagingService'
import { CONVERSATION_PRIORITY } from '@/constants/status'
import { MessageSquare, Clock, Building2, CreditCard, Ticket, Users, AlertTriangle, Flag } from 'lucide-react'

interface ConversationListProps {
  conversations: UserConversation[]
  selectedConversation: UserConversation | null
  onSelectConversation: (conversation: UserConversation) => void
  currentUserId: string | undefined
}

export default function ConversationList({
  conversations,
  selectedConversation,
  onSelectConversation,
  currentUserId
}: ConversationListProps) {
  const getIconForType = (type: string) => {
    switch (type) {
      case 'booking':
        return <Clock className="h-4 w-4" />
      case 'property':
        return <Building2 className="h-4 w-4" />
      case 'payment':
        return <CreditCard className="h-4 w-4" />
      case 'support':
        return <Ticket className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'booking':
        return 'bg-blue-50 text-blue-600'
      case 'property':
        return 'bg-green-50 text-green-600'
      case 'payment':
        return 'bg-purple-50 text-purple-600'
      case 'support':
        return 'bg-orange-50 text-orange-600'
      default:
        return 'bg-gray-50 text-gray-600'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="h-3 w-3 text-red-600" />
      case 'high':
        return <Flag className="h-3 w-3 text-orange-600" />
      default:
        return null
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600'
      case 'high':
        return 'text-orange-600'
      case 'low':
        return 'text-gray-400'
      default:
        return 'text-gray-500'
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No conversations found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => onSelectConversation(conversation)}
          className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${
            selectedConversation?.id === conversation.id ? 'bg-red-50 border-l-4 border-l-[#E8344E]' : ''
          }`}
        >
          <div className="flex items-start gap-3">
            {/* Avatar/Icon */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getTypeColor(conversation.type)}`}>
              {getIconForType(conversation.type)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {conversation.subject || 'New Conversation'}
                  </h3>
                  {getPriorityIcon(conversation.priority)}
                </div>
                {conversation.unread_count > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-[#E8344E] text-white text-xs font-medium rounded-full">
                    {conversation.unread_count}
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-500 truncate mb-2">
                {conversation.last_message || 'No messages yet'}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className={getPriorityColor(conversation.priority)}>
                  {conversation.priority.charAt(0).toUpperCase() + conversation.priority.slice(1)}
                </span>
                <div className="flex items-center gap-2">
                  <span>{formatTime(conversation.updated_at)}</span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {conversation.participant_count}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
