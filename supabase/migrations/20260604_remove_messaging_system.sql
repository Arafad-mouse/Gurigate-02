-- Remove Messaging System / Inbox feature
-- Drops messaging tables, triggers, functions, and enum types
-- Date: 2026-06-04

-- Drop messaging triggers and functions
DROP TRIGGER IF EXISTS messages_search_vector_trigger ON messages;
DROP FUNCTION IF EXISTS messages_search_vector_update();
DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
DROP TRIGGER IF EXISTS update_participants_updated_at ON conversation_participants;
DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
DROP FUNCTION IF EXISTS get_unread_count(UUID, UUID);
DROP FUNCTION IF EXISTS mark_conversation_read(UUID, UUID);
DROP FUNCTION IF EXISTS create_conversation(conversation_type, TEXT, UUID, UUID, UUID, UUID, UUID, UUID, UUID, JSONB);
DROP FUNCTION IF EXISTS add_conversation_participant(UUID, UUID, TEXT, BOOLEAN);

-- Drop tables
DROP TABLE IF EXISTS message_attachments CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

-- Drop enum types
DROP TYPE IF EXISTS message_content_type;
DROP TYPE IF EXISTS conversation_status;
DROP TYPE IF EXISTS conversation_priority;
DROP TYPE IF EXISTS conversation_type;
