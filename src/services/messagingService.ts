import { supabase } from '@/lib/supabase'
import { CONVERSATION_TYPE, CONVERSATION_STATUS, MESSAGE_CONTENT_TYPE, CONVERSATION_PRIORITY } from '@/constants/status'

// ========================================
// Type Definitions
// ========================================

export interface Conversation {
  id: string
  type: ConversationType
  status: ConversationStatus
  priority: ConversationPriority
  subject: string | null
  created_by: string | null
  assigned_to: string | null
  assigned_at: string | null
  first_response_at: string | null
  resolved_at: string | null
  related_booking_id: string | null
  related_property_id: string | null
  related_payment_id: string | null
  related_contract_id: string | null
  related_tenant_id: string | null
  related_unit_id: string | null
  metadata: Record<string, any>
  deleted_at: string | null
  deleted_by: string | null
  created_at: string
  updated_at: string
}

export interface ConversationParticipant {
  id: string
  conversation_id: string
  user_id: string
  role: string
  is_admin: boolean
  last_read_at: string | null
  joined_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  type: MessageContentType
  is_internal: boolean
  is_system: boolean
  metadata: Record<string, any>
  deleted_at: string | null
  deleted_by: string | null
  created_at: string
  updated_at: string
}

export interface MessageAttachment {
  id: string
  message_id: string
  file_name: string
  file_url: string
  file_type: string | null
  file_size: number | null
  mime_type: string | null
  storage_path: string | null
  storage_bucket: string | null
  uploaded_by: string | null
  created_at: string
}

export interface ConversationListItem {
  id: string
  type: ConversationType
  status: ConversationStatus
  priority: ConversationPriority
  subject: string | null
  created_at: string
  updated_at: string
  related_booking_id: string | null
  related_property_id: string | null
  related_payment_id: string | null
  related_contract_id: string | null
  related_tenant_id: string | null
  related_unit_id: string | null
  last_message: string | null
  last_message_at: string | null
  participant_count: number
}

export interface UserConversation extends ConversationListItem {
  user_id: string
  user_role: string
  user_is_admin: boolean
  last_read_at: string | null
  unread_count: number
}

export type ConversationType = typeof CONVERSATION_TYPE[keyof typeof CONVERSATION_TYPE]
export type ConversationStatus = typeof CONVERSATION_STATUS[keyof typeof CONVERSATION_STATUS]
export type ConversationPriority = typeof CONVERSATION_PRIORITY[keyof typeof CONVERSATION_PRIORITY]
export type MessageContentType = typeof MESSAGE_CONTENT_TYPE[keyof typeof MESSAGE_CONTENT_TYPE]

// ========================================
// Messaging Service
// ========================================

export class MessagingService {
  // ========================================
  // Conversations
  // ========================================

  /**
   * Get all conversations for the current user
   */
  static async getUserConversations(): Promise<UserConversation[]> {
    const { data, error } = await supabase
      .from('user_conversations_view')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Get conversations by type filter
   */
  static async getConversationsByType(type: ConversationType): Promise<UserConversation[]> {
    const { data, error } = await supabase
      .from('user_conversations_view')
      .select('*')
      .eq('type', type)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Get unread conversations
   */
  static async getUnreadConversations(): Promise<UserConversation[]> {
    const { data, error } = await supabase
      .from('user_conversations_view')
      .select('*')
      .gt('unread_count', 0)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Get conversation by ID with participants
   */
  static async getConversationById(conversationId: string): Promise<{
    conversation: Conversation
    participants: ConversationParticipant[]
  }> {
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single()

    if (convError) throw convError

    const { data: participants, error: partError } = await supabase
      .from('conversation_participants')
      .select('*')
      .eq('conversation_id', conversationId)

    if (partError) throw partError

    return {
      conversation,
      participants: participants || []
    }
  }

  /**
   * Create a new conversation
   */
  static async createConversation(params: {
    type: ConversationType
    subject?: string
    created_by: string
    priority?: ConversationPriority
    assigned_to?: string
    related_booking_id?: string
    related_property_id?: string
    related_payment_id?: string
    related_contract_id?: string
    related_tenant_id?: string
    related_unit_id?: string
    metadata?: Record<string, any>
  }): Promise<string> {
    const { data, error } = await supabase.rpc('create_conversation', {
      p_type: params.type,
      p_subject: params.subject || null,
      p_created_by: params.created_by,
      p_priority: params.priority || 'normal',
      p_assigned_to: params.assigned_to || null,
      p_related_booking_id: params.related_booking_id || null,
      p_related_property_id: params.related_property_id || null,
      p_related_payment_id: params.related_payment_id || null,
      p_related_contract_id: params.related_contract_id || null,
      p_related_tenant_id: params.related_tenant_id || null,
      p_related_unit_id: params.related_unit_id || null,
      p_metadata: params.metadata || {}
    })

    if (error) throw error
    return data
  }

  /**
   * Add participant to conversation
   */
  static async addParticipant(
    conversationId: string,
    userId: string,
    role: string = 'participant',
    isAdmin: boolean = false
  ): Promise<string> {
    const { data, error } = await supabase.rpc('add_conversation_participant', {
      p_conversation_id: conversationId,
      p_user_id: userId,
      p_role: role,
      p_is_admin: isAdmin
    })

    if (error) throw error
    return data
  }

  /**
   * Update conversation status
   */
  static async updateConversationStatus(
    conversationId: string,
    status: ConversationStatus
  ): Promise<boolean> {
    const { error } = await supabase
      .from('conversations')
      .update({ status })
      .eq('id', conversationId)

    if (error) throw error
    return true
  }

  /**
   * Update conversation priority
   */
  static async updateConversationPriority(
    conversationId: string,
    priority: ConversationPriority
  ): Promise<boolean> {
    const { error } = await supabase
      .from('conversations')
      .update({ priority })
      .eq('id', conversationId)

    if (error) throw error
    return true
  }

  /**
   * Assign conversation to a user
   */
  static async assignConversation(
    conversationId: string,
    assignedTo: string
  ): Promise<boolean> {
    const { error } = await supabase
      .from('conversations')
      .update({
        assigned_to: assignedTo,
        assigned_at: new Date().toISOString()
      })
      .eq('id', conversationId)

    if (error) throw error
    return true
  }

  /**
   * Mute/unmute conversation for user
   */
  static async setParticipantMuted(
    conversationId: string,
    userId: string,
    isMuted: boolean
  ): Promise<boolean> {
    const { error } = await supabase
      .from('conversation_participants')
      .update({ is_muted: isMuted })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)

    if (error) throw error
    return true
  }

  /**
   * Soft delete conversation
   */
  static async deleteConversation(conversationId: string, deletedBy: string): Promise<boolean> {
    const { error } = await supabase
      .from('conversations')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: deletedBy
      })
      .eq('id', conversationId)

    if (error) throw error
    return true
  }

  // ========================================
  // Messages
  // ========================================

  /**
   * Get messages for a conversation
   */
  static async getMessages(conversationId: string, includeInternal: boolean = false): Promise<Message[]> {
    let query = supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })

    if (!includeInternal) {
      query = query.eq('is_internal', false)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  /**
   * Send a message
   */
  static async sendMessage(params: {
    conversation_id: string
    sender_id: string
    content: string
    type?: MessageContentType
    is_internal?: boolean
    is_system?: boolean
    metadata?: Record<string, any>
  }): Promise<string> {
    const { data, error } = await supabase.rpc('send_message', {
      p_conversation_id: params.conversation_id,
      p_sender_id: params.sender_id,
      p_content: params.content,
      p_type: params.type || 'text',
      p_is_internal: params.is_internal || false,
      p_is_system: params.is_system || false,
      p_metadata: params.metadata || {}
    })

    if (error) throw error
    return data
  }

  /**
   * Soft delete a message
   */
  static async deleteMessage(messageId: string, deletedBy: string): Promise<boolean> {
    const { error } = await supabase
      .from('messages')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: deletedBy
      })
      .eq('id', messageId)

    if (error) throw error
    return true
  }

  /**
   * Mark conversation as read for current user
   */
  static async markAsRead(conversationId: string, userId: string): Promise<boolean> {
    const { error } = await supabase.rpc('mark_conversation_read', {
      p_user_id: userId,
      p_conversation_id: conversationId
    })

    if (error) throw error
    return true
  }

  /**
   * Get unread count for a conversation
   */
  static async getUnreadCount(conversationId: string, userId: string): Promise<number> {
    const { data, error } = await supabase.rpc('get_unread_count', {
      p_user_id: userId,
      p_conversation_id: conversationId
    })

    if (error) throw error
    return data || 0
  }

  // ========================================
  // Search
  // ========================================

  /**
   * Search conversations by full-text search
   */
  static async searchConversations(query: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .textSearch('search_vector', query)
      .is('deleted_at', null)
      .limit(50)

    if (error) throw error
    return data || []
  }

  /**
   * Search conversations by user, property, or booking
   */
  static async searchConversationsByMetadata(filters: {
    user_id?: string
    property_id?: string
    booking_id?: string
    payment_id?: string
  }): Promise<ConversationListItem[]> {
    let query = supabase
      .from('conversation_list_view')
      .select('*')

    if (filters.user_id) {
      query = query.filter('user_id', 'eq', filters.user_id)
    }
    if (filters.property_id) {
      query = query.eq('related_property_id', filters.property_id)
    }
    if (filters.booking_id) {
      query = query.eq('related_booking_id', filters.booking_id)
    }
    if (filters.payment_id) {
      query = query.eq('related_payment_id', filters.payment_id)
    }

    const { data, error } = await query.order('updated_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // ========================================
  // Attachments
  // ========================================

  /**
   * Get attachments for a message
   */
  static async getMessageAttachments(messageId: string): Promise<MessageAttachment[]> {
    const { data, error } = await supabase
      .from('message_attachments')
      .select('*')
      .eq('message_id', messageId)

    if (error) throw error
    return data || []
  }

  /**
   * Add attachment to message
   */
  static async addAttachment(params: {
    message_id: string
    file_name: string
    file_url: string
    file_type?: string
    file_size?: number
    mime_type?: string
    storage_path?: string
  }): Promise<string> {
    const { data, error } = await supabase
      .from('message_attachments')
      .insert(params)
      .select('id')
      .single()

    if (error) throw error
    return data.id
  }

  // ========================================
  // Context Data
  // ========================================

  /**
   * Get booking context for a conversation
   */
  static async getBookingContext(bookingId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        check_in,
        check_out,
        total_price,
        currency,
        status,
        dispute_status,
        guest_count,
        admin_note,
        profiles!guest_id (
          first_name,
          last_name,
          email,
          avatar_url
        ),
        properties (
          id,
          title,
          city,
          type
        )
      `)
      .eq('id', bookingId)
      .single()

    if (error) throw error
    return data
  }

  /**
   * Get property context for a conversation
   */
  static async getPropertyContext(propertyId: string) {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        id,
        title,
        type,
        city,
        price,
        currency,
        approval_status,
        status,
        profiles!owner_id (
          first_name,
          last_name,
          email,
          avatar_url
        ),
        property_images (image_url)
      `)
      .eq('id', propertyId)
      .single()

    if (error) throw error
    return data
  }

  /**
   * Get payment context for a conversation
   */
  static async getPaymentContext(paymentId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        id,
        amount,
        currency,
        payment_provider,
        payment_method,
        status,
        proof_image,
        wallet_phone,
        created_at,
        verified_at,
        bookings (
          id,
          profiles!guest_id (
            first_name,
            last_name,
            email
          ),
          properties (
            title
          )
        )
      `)
      .eq('id', paymentId)
      .single()

    if (error) throw error
    return data
  }

  /**
   * Get user context for a conversation
   */
  static async getUserContext(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  }
}
