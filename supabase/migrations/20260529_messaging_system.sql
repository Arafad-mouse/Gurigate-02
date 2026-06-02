-- Messaging System Migration - Production Grade
-- Implements inbox/conversation system with RLS, audit logging, and RMS integration
-- Date: 2026-05-29

-- ========================================
-- 1. CREATE ENUM TYPES
-- ========================================

-- Conversation type (what the conversation is about)
CREATE TYPE conversation_type AS ENUM (
  'direct',
  'booking',
  'property',
  'payment',
  'support',
  'system',
  'rms_contract',
  'rms_tenant',
  'rms_unit'
);

-- Message type (content format)
CREATE TYPE message_content_type AS ENUM (
  'text',
  'image',
  'document',
  'property_reference',
  'booking_reference',
  'payment_reference',
  'system'
);

-- Conversation status
CREATE TYPE conversation_status AS ENUM (
  'active',
  'archived',
  'closed'
);

-- Conversation priority
CREATE TYPE conversation_priority AS ENUM (
  'low',
  'normal',
  'high',
  'urgent'
);

-- ========================================
-- 2. CREATE CONVERSATIONS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type conversation_type NOT NULL DEFAULT 'direct',
  status conversation_status NOT NULL DEFAULT 'active',
  priority conversation_priority NOT NULL DEFAULT 'normal',
  subject TEXT,
  
  -- Creator for audit trails
  created_by UUID REFERENCES profiles(id),
  
  -- Assignment for support workflows
  assigned_to UUID REFERENCES profiles(id),
  assigned_at TIMESTAMP WITH TIME ZONE,
  
  -- SLA tracking for support metrics
  first_response_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  -- Relationships to existing systems
  related_booking_id UUID REFERENCES bookings(id),
  related_property_id UUID REFERENCES properties(id),
  related_payment_id UUID REFERENCES payments(id),

  -- RMS relationships (future-proof)
  related_contract_id UUID REFERENCES contracts(id),
  related_tenant_id UUID REFERENCES tenants(id),
  related_unit_id UUID REFERENCES units(id),
  
  -- Metadata for flexible data
  metadata JSONB DEFAULT '{}',
  
  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES profiles(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one conversation per booking
  CONSTRAINT unique_booking_conversation UNIQUE (related_booking_id) DEFERRABLE INITIALLY DEFERRED
);

-- Indexes for conversations
CREATE INDEX idx_conversations_type ON conversations(type);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_priority ON conversations(priority);
CREATE INDEX idx_conversations_created_by ON conversations(created_by);
CREATE INDEX idx_conversations_assigned_to ON conversations(assigned_to);
CREATE INDEX idx_conversations_booking ON conversations(related_booking_id);
CREATE INDEX idx_conversations_property ON conversations(related_property_id);
CREATE INDEX idx_conversations_payment ON conversations(related_payment_id);
CREATE INDEX idx_conversations_contract ON conversations(related_contract_id);
CREATE INDEX idx_conversations_tenant ON conversations(related_tenant_id);
CREATE INDEX idx_conversations_unit ON conversations(related_unit_id);
CREATE INDEX idx_conversations_created ON conversations(created_at DESC);
CREATE INDEX idx_conversations_updated ON conversations(updated_at DESC);
CREATE INDEX idx_conversations_deleted ON conversations(deleted_at) WHERE deleted_at IS NOT NULL;

-- ========================================
-- 3. CREATE CONVERSATION PARTICIPANTS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Participant role (admin, host, guest, manager, etc.)
  role TEXT DEFAULT 'participant',
  is_admin BOOLEAN DEFAULT FALSE,
  
  -- Muting support
  is_muted BOOLEAN DEFAULT FALSE,
  
  -- Read tracking (no stored unread_count - calculate dynamically)
  last_read_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one participant per user per conversation
  UNIQUE(conversation_id, user_id)
);

-- Indexes for participants
CREATE INDEX idx_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX idx_participants_user ON conversation_participants(user_id);
CREATE INDEX idx_participants_role ON conversation_participants(role);
CREATE INDEX idx_participants_last_read ON conversation_participants(last_read_at DESC);

-- ========================================
-- 4. CREATE MESSAGES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  
  -- Content
  content TEXT NOT NULL,
  type message_content_type NOT NULL DEFAULT 'text',
  
  -- Internal notes (only visible to admins/managers)
  is_internal BOOLEAN DEFAULT FALSE,
  
  -- System messages (automated, not user-generated)
  is_system BOOLEAN DEFAULT FALSE,
  
  -- Metadata for flexible data (attachments, references, etc.)
  metadata JSONB DEFAULT '{}',
  
  -- Full-text search vector
  search_vector TSVECTOR,
  
  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES profiles(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for messages
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_type ON messages(type);
CREATE INDEX idx_messages_internal ON messages(is_internal) WHERE is_internal = TRUE;
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_messages_deleted ON messages(deleted_at) WHERE deleted_at IS NOT NULL;

-- GIN index for full-text search
CREATE INDEX idx_messages_search ON messages USING GIN(search_vector);

-- ========================================
-- 5. CREATE MESSAGE ATTACHMENTS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  
  -- File information
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  mime_type TEXT,
  
  -- Storage metadata
  storage_path TEXT,
  storage_bucket TEXT DEFAULT 'attachments',
  
  -- Upload tracking
  uploaded_by UUID REFERENCES profiles(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for attachments
CREATE INDEX idx_attachments_message ON message_attachments(message_id);
CREATE INDEX idx_attachments_type ON message_attachments(file_type);

-- ========================================
-- 6. CREATE TRIGGER FOR SEARCH VECTOR UPDATE
-- ========================================

-- Function to update search vector
CREATE OR REPLACE FUNCTION messages_search_vector_update() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'A');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update search vector on insert/update
CREATE TRIGGER messages_search_vector_trigger
  BEFORE INSERT OR UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION messages_search_vector_update();

-- ========================================
-- 7. CREATE TRIGGER FOR UPDATED_AT
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_participants_updated_at
  BEFORE UPDATE ON conversation_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 8. CREATE HELPER FUNCTIONS
-- ========================================

-- Function to calculate unread count for a participant
CREATE OR REPLACE FUNCTION get_unread_count(p_user_id UUID, p_conversation_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_last_read TIMESTAMP WITH TIME ZONE;
  v_unread_count INTEGER;
BEGIN
  SELECT last_read_at INTO v_last_read
  FROM conversation_participants
  WHERE user_id = p_user_id AND conversation_id = p_conversation_id;
  
  IF v_last_read IS NULL THEN
    -- User hasn't read anything, count all messages
    SELECT COUNT(*) INTO v_unread_count
    FROM messages
    WHERE conversation_id = p_conversation_id
      AND sender_id != p_user_id
      AND is_internal = FALSE
      AND deleted_at IS NULL;
  ELSE
    -- Count messages since last read
    SELECT COUNT(*) INTO v_unread_count
    FROM messages
    WHERE conversation_id = p_conversation_id
      AND sender_id != p_user_id
      AND is_internal = FALSE
      AND deleted_at IS NULL
      AND created_at > v_last_read;
  END IF;
  
  RETURN v_unread_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark conversation as read for a user
CREATE OR REPLACE FUNCTION mark_conversation_read(p_user_id UUID, p_conversation_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE conversation_participants
  SET last_read_at = NOW()
  WHERE user_id = p_user_id AND conversation_id = p_conversation_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a new conversation
CREATE OR REPLACE FUNCTION create_conversation(
  p_type conversation_type,
  p_subject TEXT,
  p_created_by UUID,
  p_related_booking_id UUID DEFAULT NULL,
  p_related_property_id UUID DEFAULT NULL,
  p_related_payment_id UUID DEFAULT NULL,
  p_related_contract_id UUID DEFAULT NULL,
  p_related_tenant_id UUID DEFAULT NULL,
  p_related_unit_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
BEGIN
  INSERT INTO conversations (
    type,
    subject,
    created_by,
    related_booking_id,
    related_property_id,
    related_payment_id,
    related_contract_id,
    related_tenant_id,
    related_unit_id,
    metadata
  )
  VALUES (
    p_type,
    p_subject,
    p_created_by,
    p_related_booking_id,
    p_related_property_id,
    p_related_payment_id,
    p_related_contract_id,
    p_related_tenant_id,
    p_related_unit_id,
    p_metadata
  )
  RETURNING id INTO v_conversation_id;
  
  -- Log the action
  PERFORM log_admin_activity(
    p_created_by,
    'conversation_created',
    'conversation',
    v_conversation_id,
    jsonb_build_object(
      'type', p_type,
      'subject', p_subject
    )
  );
  
  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add participant to conversation
CREATE OR REPLACE FUNCTION add_conversation_participant(
  p_conversation_id UUID,
  p_user_id UUID,
  p_role TEXT DEFAULT 'participant',
  p_is_admin BOOLEAN DEFAULT FALSE
)
RETURNS UUID AS $$
DECLARE
  v_participant_id UUID;
BEGIN
  INSERT INTO conversation_participants (
    conversation_id,
    user_id,
    role,
    is_admin
  )
  VALUES (
    p_conversation_id,
    p_user_id,
    p_role,
    p_is_admin
  )
  ON CONFLICT (conversation_id, user_id) DO UPDATE SET
    role = EXCLUDED.role,
    is_admin = EXCLUDED.is_admin,
    updated_at = NOW()
  RETURNING id INTO v_participant_id;
  
  RETURN v_participant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send a message
CREATE OR REPLACE FUNCTION send_message(
  p_conversation_id UUID,
  p_sender_id UUID,
  p_content TEXT,
  p_type message_content_type DEFAULT 'text',
  p_is_internal BOOLEAN DEFAULT FALSE,
  p_is_system BOOLEAN DEFAULT FALSE,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_message_id UUID;
BEGIN
  INSERT INTO messages (
    conversation_id,
    sender_id,
    content,
    type,
    is_internal,
    is_system,
    metadata
  )
  VALUES (
    p_conversation_id,
    p_sender_id,
    p_content,
    p_type,
    p_is_internal,
    p_is_system,
    p_metadata
  )
  RETURNING id INTO v_message_id;
  
  -- Update conversation updated_at
  UPDATE conversations
  SET updated_at = NOW()
  WHERE id = p_conversation_id;
  
  -- Log if it's an admin action (not system message)
  IF NOT p_is_system THEN
    PERFORM log_admin_activity(
      p_sender_id,
      'message_sent',
      'message',
      v_message_id,
      jsonb_build_object(
        'conversation_id', p_conversation_id,
        'type', p_type,
        'is_internal', p_is_internal
      )
    );
  END IF;
  
  RETURN v_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 9. ENABLE ROW LEVEL SECURITY
-- ========================================

-- Conversations RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Admins can view all conversations
CREATE POLICY "Admins can view all conversations"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin')
    )
  );

-- Users can view conversations they participate in
CREATE POLICY "Users can view own conversations"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = conversations.id
      AND user_id = auth.uid()
    )
  );

-- Owners can view conversations related to their properties
CREATE POLICY "Owners can view property conversations"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'owner'
    )
    AND EXISTS (
      SELECT 1 FROM properties
      WHERE id = conversations.related_property_id
      AND owner_id = auth.uid()
    )
  );

-- Admins can create conversations
CREATE POLICY "Admins can create conversations"
  ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'building_manager')
    )
  );

-- Users can update conversations they participate in (e.g., close)
CREATE POLICY "Users can update own conversations"
  ON conversations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = conversations.id
      AND user_id = auth.uid()
    )
  );

-- Conversation Participants RLS
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- Users can view participants in conversations they're in
CREATE POLICY "Users can view conversation participants"
  ON conversation_participants
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversation_participants.conversation_id
      AND cp.user_id = auth.uid()
    )
  );

-- Admins can add participants
CREATE POLICY "Admins can add participants"
  ON conversation_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'building_manager')
    )
  );

-- Messages RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages in conversations they participate in
CREATE POLICY "Users can view conversation messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = messages.conversation_id
      AND user_id = auth.uid()
    )
    AND deleted_at IS NULL
  );

-- Admins/Managers can view internal messages
CREATE POLICY "Admins can view internal messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    is_internal = TRUE
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'building_manager')
    )
  );

-- Users can send messages to conversations they're in
CREATE POLICY "Users can send messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = messages.conversation_id
      AND user_id = auth.uid()
    )
  );

-- Users can delete their own messages
CREATE POLICY "Users can delete own messages"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (
    sender_id = auth.uid()
    AND deleted_at IS NULL
  )
  WITH CHECK (
    sender_id = auth.uid()
  );

-- Message Attachments RLS
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;

-- Users can view attachments in messages they can view
CREATE POLICY "Users can view message attachments"
  ON message_attachments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM messages m
      WHERE m.id = message_attachments.message_id
      AND EXISTS (
        SELECT 1 FROM conversation_participants
        WHERE conversation_id = m.conversation_id
        AND user_id = auth.uid()
      )
    )
  );

-- ========================================
-- 10. CREATE VIEWS FOR COMMON QUERIES
-- ========================================

-- View for conversation list with participant info
CREATE OR REPLACE VIEW conversation_list_view AS
SELECT
  c.id,
  c.type,
  c.status,
  c.subject,
  c.created_at,
  c.updated_at,
  c.related_booking_id,
  c.related_property_id,
  c.related_payment_id,
  c.related_contract_id,
  c.related_tenant_id,
  c.related_unit_id,
  -- Latest message preview
  (
    SELECT content
    FROM messages m
    WHERE m.conversation_id = c.id
    AND m.deleted_at IS NULL
    ORDER BY m.created_at DESC
    LIMIT 1
  ) as last_message,
  -- Latest message timestamp
  (
    SELECT created_at
    FROM messages m
    WHERE m.conversation_id = c.id
    AND m.deleted_at IS NULL
    ORDER BY m.created_at DESC
    LIMIT 1
  ) as last_message_at,
  -- Participant count
  (
    SELECT COUNT(*)
    FROM conversation_participants cp
    WHERE cp.conversation_id = c.id
  ) as participant_count
FROM conversations c
WHERE c.deleted_at IS NULL;

-- View for user's conversations with unread counts
CREATE OR REPLACE VIEW user_conversations_view AS
SELECT
  clv.*,
  cp.user_id,
  cp.role as user_role,
  cp.is_admin as user_is_admin,
  cp.last_read_at,
  get_unread_count(cp.user_id, clv.id) as unread_count
FROM conversation_list_view clv
JOIN conversation_participants cp ON cp.conversation_id = clv.id
WHERE cp.user_id = auth.uid();

-- ========================================
-- 11. GRANT PERMISSIONS
-- ========================================

-- Grant usage on types
GRANT USAGE ON SCHEMA public TO authenticated;
-- Note: Type permissions are handled automatically by Supabase

-- Grant select on views
GRANT SELECT ON conversation_list_view TO authenticated;
GRANT SELECT ON user_conversations_view TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION get_unread_count TO authenticated;
GRANT EXECUTE ON FUNCTION mark_conversation_read TO authenticated;
GRANT EXECUTE ON FUNCTION create_conversation TO authenticated;
GRANT EXECUTE ON FUNCTION add_conversation_participant TO authenticated;
GRANT EXECUTE ON FUNCTION send_message TO authenticated;
