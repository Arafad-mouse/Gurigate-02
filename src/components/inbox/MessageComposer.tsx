import { useState, useEffect } from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import { MessagingService } from '@/services/messagingService'
import { useTypingIndicator } from '@/hooks/useRealtimeMessages'
import { Send, Paperclip, Shield, X } from 'lucide-react'

interface MessageComposerProps {
  conversationId: string
  currentUserId: string | undefined
  onMessageSent: () => void
}

export default function MessageComposer({ conversationId, currentUserId, onMessageSent }: MessageComposerProps) {
  const [message, setMessage] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [sending, setSending] = useState(false)
  const { canSendInternalNotes } = usePermissions()
  const { sendTypingStatus } = useTypingIndicator({
    conversationId,
    currentUserId,
    enabled: !!currentUserId
  })

  // Send typing status when message content changes
  useEffect(() => {
    if (message.trim()) {
      sendTypingStatus(true)
    } else {
      sendTypingStatus(false)
    }
  }, [message, sendTypingStatus])

  const handleSend = async () => {
    if (!message.trim() || !currentUserId) return

    try {
      setSending(true)
      await MessagingService.sendMessage({
        conversation_id: conversationId,
        sender_id: currentUserId,
        content: message.trim(),
        is_internal: isInternal
      })
      setMessage('')
      setIsInternal(false)
      sendTypingStatus(false)
      onMessageSent()
    } catch (err) {
      console.error('Failed to send message:', err)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {/* Internal Note Toggle */}
      {canSendInternalNotes() && (
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setIsInternal(!isInternal)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isInternal
                ? 'bg-orange-50 text-orange-700 border border-orange-200'
                : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Internal Note</span>
            {isInternal && <X className="h-3 w-3 ml-1" />}
          </button>
          {isInternal && (
            <span className="text-xs text-gray-500">
              Only visible to admins and managers
            </span>
          )}
        </div>
      )}

      {/* Message Input */}
      <div className="flex items-end gap-3">
        {/* Attachment Button */}
        <button
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
          title="Attach file (coming soon)"
          disabled
        >
          <Paperclip className="h-5 w-5" />
        </button>

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isInternal ? 'Write an internal note...' : 'Type a message...'}
            rows={1}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#E8344E] focus:border-transparent text-sm"
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!message.trim() || sending}
          className={`p-3 rounded-xl transition-colors ${
            message.trim() && !sending
              ? 'bg-[#E8344E] text-white hover:bg-[#d12d3e]'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {sending ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Helper Text */}
      <p className="text-xs text-gray-400 mt-2">
        Press Enter to send, Shift + Enter for new line
      </p>
    </div>
  )
}
