import { supabase } from '@/lib/supabase'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { Message, Conversation, ConversationParticipant } from './messagingService'

// ========================================
// Type Definitions
// ========================================

export type ConnectionStatus = 'CONNECTING' | 'SUBSCRIBED' | 'TIMED_OUT' | 'CHANNEL_ERROR' | 'CLOSED'

export interface MessageEvent {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: Message
  old: Message | null
}

export interface ConversationEvent {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: Conversation
  old: Conversation | null
}

export interface ParticipantEvent {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: ConversationParticipant
  old: ConversationParticipant | null
}

export interface TypingPayload {
  conversationId: string
  userId: string
  typing: boolean
}

// ========================================
// Realtime Messaging Service
// ========================================

class RealtimeMessagingService {
  private channels: Map<string, RealtimeChannel> = new Map()
  private connectionStatus: ConnectionStatus = 'CONNECTING'
  private connectionStatusListeners: Set<(status: ConnectionStatus) => void> = new Set()

  // ========================================
  // Connection Management
  // ========================================

  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus
  }

  onConnectionStatusChange(callback: (status: ConnectionStatus) => void): () => void {
    this.connectionStatusListeners.add(callback)
    return () => this.connectionStatusListeners.delete(callback)
  }

  private setConnectionStatus(status: ConnectionStatus) {
    this.connectionStatus = status
    this.connectionStatusListeners.forEach(listener => listener(status))
  }

  // ========================================
  // Messages Channel
  // ========================================

  subscribeToMessages(
    conversationId: string,
    onMessage: (event: MessageEvent) => void
  ): () => void {
    const channelName = `messages:${conversationId}`
    
    if (this.channels.has(channelName)) {
      this.channels.get(channelName)!.unsubscribe()
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload: RealtimePostgresChangesPayload<Message>) => {
          onMessage({
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: payload.new as Message,
            old: payload.old as Message | null
          })
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          this.setConnectionStatus('SUBSCRIBED')
        } else if (status === 'TIMED_OUT') {
          this.setConnectionStatus('TIMED_OUT')
        } else if (status === 'CHANNEL_ERROR') {
          this.setConnectionStatus('CHANNEL_ERROR')
        } else if (status === 'CLOSED') {
          this.setConnectionStatus('CLOSED')
        }
      })

    this.channels.set(channelName, channel)

    return () => {
      channel.unsubscribe()
      this.channels.delete(channelName)
    }
  }

  // ========================================
  // Conversations Channel
  // ========================================

  subscribeToConversations(
    userId: string,
    onConversation: (event: ConversationEvent) => void
  ): () => void {
    const channelName = `conversations:${userId}`
    
    if (this.channels.has(channelName)) {
      this.channels.get(channelName)!.unsubscribe()
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        (payload: RealtimePostgresChangesPayload<Conversation>) => {
          onConversation({
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: payload.new as Conversation,
            old: payload.old as Conversation | null
          })
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          this.setConnectionStatus('SUBSCRIBED')
        } else if (status === 'TIMED_OUT') {
          this.setConnectionStatus('TIMED_OUT')
        } else if (status === 'CHANNEL_ERROR') {
          this.setConnectionStatus('CHANNEL_ERROR')
        } else if (status === 'CLOSED') {
          this.setConnectionStatus('CLOSED')
        }
      })

    this.channels.set(channelName, channel)

    return () => {
      channel.unsubscribe()
      this.channels.delete(channelName)
    }
  }

  // ========================================
  // Participants Channel (Read Receipts)
  // ========================================

  subscribeToParticipants(
    conversationId: string,
    onParticipant: (event: ParticipantEvent) => void
  ): () => void {
    const channelName = `participants:${conversationId}`
    
    if (this.channels.has(channelName)) {
      this.channels.get(channelName)!.unsubscribe()
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversation_participants',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload: RealtimePostgresChangesPayload<ConversationParticipant>) => {
          onParticipant({
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: payload.new as ConversationParticipant,
            old: payload.old as ConversationParticipant | null
          })
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          this.setConnectionStatus('SUBSCRIBED')
        } else if (status === 'TIMED_OUT') {
          this.setConnectionStatus('TIMED_OUT')
        } else if (status === 'CHANNEL_ERROR') {
          this.setConnectionStatus('CHANNEL_ERROR')
        } else if (status === 'CLOSED') {
          this.setConnectionStatus('CLOSED')
        }
      })

    this.channels.set(channelName, channel)

    return () => {
      channel.unsubscribe()
      this.channels.delete(channelName)
    }
  }

  // ========================================
  // Typing Indicators (Presence)
  // ========================================

  subscribeToTypingIndicators(
    conversationId: string,
    onTypingChange: (userId: string, isTyping: boolean) => void
  ): () => void {
    const channelName = `typing:${conversationId}`
    
    if (this.channels.has(channelName)) {
      this.channels.get(channelName)!.unsubscribe()
    }

    const channel = supabase
      .channel(channelName)
      .on('presence', { event: 'sync' }, () => {
        // Handle sync - initial presence state
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const state = channel.presenceState()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Object.values(state).forEach((presences: any[]) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          presences.forEach((presence: any) => {
            const payload = presence as TypingPayload
            if (payload.conversationId === conversationId) {
              onTypingChange(payload.userId, payload.typing)
            }
          })
        })
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        newPresences.forEach((presence: any) => {
          const payload = presence as TypingPayload
          if (payload.conversationId === conversationId) {
            onTypingChange(payload.userId, payload.typing)
          }
        })
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        leftPresences.forEach((presence: any) => {
          const payload = presence as TypingPayload
          if (payload.conversationId === conversationId) {
            onTypingChange(payload.userId, false)
          }
        })
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          this.setConnectionStatus('SUBSCRIBED')
        } else if (status === 'TIMED_OUT') {
          this.setConnectionStatus('TIMED_OUT')
        } else if (status === 'CHANNEL_ERROR') {
          this.setConnectionStatus('CHANNEL_ERROR')
        } else if (status === 'CLOSED') {
          this.setConnectionStatus('CLOSED')
        }
      })

    this.channels.set(channelName, channel)

    return () => {
      channel.unsubscribe()
      this.channels.delete(channelName)
    }
  }

  setTypingIndicator(conversationId: string, userId: string, typing: boolean) {
    const channelName = `typing:${conversationId}`
    const channel = this.channels.get(channelName)
    
    if (channel) {
      channel.track({
        conversationId,
        userId,
        typing
      })
    }
  }

  // ========================================
  // Cleanup
  // ========================================

  unsubscribeAll() {
    this.channels.forEach((channel) => {
      channel.unsubscribe()
    })
    this.channels.clear()
    this.setConnectionStatus('CLOSED')
  }
}

// Export singleton instance
export const realtimeMessagingService = new RealtimeMessagingService()
