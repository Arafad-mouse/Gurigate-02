-- Auto-Conversation Triggers
-- Automatically creates conversations when bookings, support tickets, or property inquiries are created
-- Date: 2026-05-29

-- ========================================
-- 1. BOOKING AUTO-CONVERSATION TRIGGER
-- ========================================

-- Function to create conversation when booking is created
CREATE OR REPLACE FUNCTION create_booking_conversation()
RETURNS TRIGGER AS $$
DECLARE
  conversation_id UUID;
BEGIN
  -- Create a conversation linked to the booking
  INSERT INTO conversations (
    type,
    status,
    priority,
    subject,
    created_by,
    related_booking_id,
    related_property_id,
    metadata
  )
  VALUES (
    'booking'::conversation_type,
    'active'::conversation_status,
    'normal'::conversation_priority,
    'Booking Conversation',
    NEW.guest_id,
    NEW.id,
    NEW.property_id,
    jsonb_build_object(
      'booking_id', NEW.id,
      'check_in', NEW.check_in,
      'check_out', NEW.check_out,
      'total_price', NEW.total_price
    )
  )
  RETURNING id INTO conversation_id;

  -- Add guest as participant
  INSERT INTO conversation_participants (conversation_id, user_id, role, is_admin)
  VALUES (conversation_id, NEW.guest_id, 'guest', FALSE);

  -- Add owner as participant (if property has owner)
  INSERT INTO conversation_participants (conversation_id, user_id, role, is_admin)
  SELECT conversation_id, p.id, 'owner', TRUE
  FROM properties prop
  JOIN profiles p ON p.id = prop.owner_id
  WHERE prop.id = NEW.property_id;

  -- Add system message
  INSERT INTO messages (
    conversation_id,
    sender_id,
    type,
    content,
    is_internal
  )
  VALUES (
    conversation_id,
    NEW.guest_id,
    'system'::message_content_type,
    'Booking created automatically',
    FALSE
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for booking creation
DROP TRIGGER IF EXISTS trigger_booking_conversation ON bookings;
CREATE TRIGGER trigger_booking_conversation
  AFTER INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION create_booking_conversation();

-- ========================================
-- 2. PROPERTY INQUIRY AUTO-CONVERSATION TRIGGER
-- ========================================

-- Function to create conversation when property inquiry is created
CREATE OR REPLACE FUNCTION create_property_inquiry_conversation()
RETURNS TRIGGER AS $$
DECLARE
  conversation_id UUID;
BEGIN
  -- Create a conversation linked to the property
  INSERT INTO conversations (
    type,
    status,
    priority,
    subject,
    created_by,
    related_property_id,
    metadata
  )
  VALUES (
    'property'::conversation_type,
    'active'::conversation_status,
    'normal'::conversation_priority,
    'Property Inquiry',
    NEW.user_id,
    NEW.property_id,
    jsonb_build_object(
      'inquiry_id', NEW.id,
      'message', NEW.message
    )
  )
  RETURNING id INTO conversation_id;

  -- Add inquirer as participant
  INSERT INTO conversation_participants (conversation_id, user_id, role, is_admin)
  VALUES (conversation_id, NEW.user_id, 'guest', FALSE);

  -- Add owner as participant (if property has owner)
  INSERT INTO conversation_participants (conversation_id, user_id, role, is_admin)
  SELECT conversation_id, p.id, 'owner', TRUE
  FROM properties prop
  JOIN profiles p ON p.id = prop.owner_id
  WHERE prop.id = NEW.property_id;

  -- Add system message
  INSERT INTO messages (
    conversation_id,
    sender_id,
    type,
    content,
    is_internal
  )
  VALUES (
    conversation_id,
    NEW.user_id,
    'system'::message_content_type,
    'Property inquiry created automatically',
    FALSE
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: This trigger assumes a property_inquiries table exists
-- If the table doesn't exist yet, this will need to be adjusted
-- Uncomment when property_inquiries table is available:
-- DROP TRIGGER IF EXISTS trigger_property_inquiry_conversation ON property_inquiries;
-- CREATE TRIGGER trigger_property_inquiry_conversation
--   AFTER INSERT ON property_inquiries
--   FOR EACH ROW
--   EXECUTE FUNCTION create_property_inquiry_conversation();

-- ========================================
-- 3. SUPPORT TICKET AUTO-CONVERSATION TRIGGER
-- ========================================

-- Function to create conversation when support ticket is created
CREATE OR REPLACE FUNCTION create_support_ticket_conversation()
RETURNS TRIGGER AS $$
DECLARE
  ticket_priority conversation_priority;
  conversation_id UUID;
BEGIN
  -- Determine priority based on ticket type
  CASE NEW.ticket_type
    WHEN 'urgent' THEN ticket_priority := 'urgent'::conversation_priority;
    WHEN 'high' THEN ticket_priority := 'high'::conversation_priority;
    ELSE ticket_priority := 'normal'::conversation_priority;
  END CASE;

  -- Create a conversation linked to the support ticket
  INSERT INTO conversations (
    type,
    status,
    priority,
    subject,
    created_by,
    assigned_to,
    metadata
  )
  VALUES (
    'support'::conversation_type,
    'active'::conversation_status,
    ticket_priority,
    COALESCE(NEW.subject, 'Support Ticket'),
    NEW.user_id,
    NULL, -- Will be assigned by support team
    jsonb_build_object(
      'ticket_id', NEW.id,
      'ticket_type', NEW.ticket_type,
      'description', NEW.description
    )
  )
  RETURNING id INTO conversation_id;

  -- Add user as participant
  INSERT INTO conversation_participants (conversation_id, user_id, role, is_admin)
  VALUES (conversation_id, NEW.user_id, 'user', FALSE);

  -- Add system message
  INSERT INTO messages (
    conversation_id,
    sender_id,
    type,
    content,
    is_internal
  )
  VALUES (
    conversation_id,
    NEW.user_id,
    'system'::message_content_type,
    'Support ticket created automatically',
    FALSE
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for support ticket creation (only if table exists)
-- Note: This trigger assumes a support_tickets table exists
-- If the table doesn't exist yet, this will need to be adjusted
-- Uncomment when support_tickets table is available:
-- DROP TRIGGER IF EXISTS trigger_support_ticket_conversation ON support_tickets;
-- CREATE TRIGGER trigger_support_ticket_conversation
--   AFTER INSERT ON support_tickets
--   FOR EACH ROW
--   EXECUTE FUNCTION create_support_ticket_conversation();

-- ========================================
-- 4. HELPER FUNCTION FOR MANUAL CONVERSATION CREATION
-- ========================================

-- Function to manually create a conversation from any event
CREATE OR REPLACE FUNCTION create_conversation_from_event(
  p_type conversation_type,
  p_subject TEXT,
  p_created_by UUID,
  p_priority conversation_priority DEFAULT 'normal',
  p_related_booking_id UUID DEFAULT NULL,
  p_related_property_id UUID DEFAULT NULL,
  p_related_payment_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  conversation_id UUID;
BEGIN
  -- Create conversation
  INSERT INTO conversations (
    type,
    status,
    priority,
    subject,
    created_by,
    related_booking_id,
    related_property_id,
    related_payment_id,
    metadata
  )
  VALUES (
    p_type,
    'active',
    p_priority,
    p_subject,
    p_created_by,
    p_related_booking_id,
    p_related_property_id,
    p_related_payment_id,
    p_metadata
  )
  RETURNING id INTO conversation_id;

  -- Add creator as participant
  INSERT INTO conversation_participants (conversation_id, user_id, role, is_admin)
  VALUES (conversation_id, p_created_by, 'creator', TRUE);

  -- Add system message
  INSERT INTO messages (
    conversation_id,
    sender_id,
    type,
    content,
    is_internal
  )
  VALUES (
    conversation_id,
    p_created_by,
    'system',
    'Conversation created from event',
    FALSE
  );

  RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_conversation_from_event TO authenticated;
