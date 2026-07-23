# GuriGate Backend Architecture Document

**Document Version:** 1.0  
**Date:** June 2, 2026  
**Author:** System Architecture Team

---

## 1. Overview

The GuriGate backend is built entirely on Supabase, which provides a comprehensive backend-as-a-service platform including PostgreSQL database, authentication, real-time subscriptions, storage, and edge functions. The architecture leverages Supabase's capabilities to provide a scalable, secure, and maintainable backend without the need for custom server infrastructure.

### Key Technologies

- **Database:** PostgreSQL (managed by Supabase)
- **Authentication:** Supabase Auth (JWT-based)
- **Real-time:** Supabase Realtime (WebSocket-based)
- **Storage:** Supabase Storage (S3-compatible)
- **Edge Functions:** Deno runtime on Supabase Edge
- **API:** RESTful API via Supabase client
- **RPC Functions:** PostgreSQL stored procedures for complex operations

---

## 2. Supabase Configuration

### 2.1 Project Structure

```
supabase/
├── migrations/           # Database migration files
│   ├── 20240502_gurigate_properties_schema.sql
│   ├── 20240502_payments_flow.sql
│   ├── 20260508_admin_role_system.sql
│   ├── 20260529_messaging_system.sql
│   └── ... (additional migrations)
├── functions/           # Edge Functions
│   └── create-dodo-checkout/
│       └── index.ts
└── config.toml          # Supabase configuration
```

### 2.2 Environment Variables

**Required Environment Variables:**
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Anonymous/public API key
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for admin operations
- `DODO_PAYMENTS_API_KEY`: Dodo Payments API key
- `DODO_PRODUCT_ID`: Dodo product ID
- `DODO_PAYMENTS_API_BASE_URL`: Dodo API base URL (optional, defaults to test)

---

## 3. Database Architecture

### 3.1 Migration Strategy

**Migration Files:**
1. `20240502_gurigate_properties_schema.sql` - Core property schema
2. `20240502_payments_flow.sql` - Payment system
3. `20260508_admin_role_system.sql` - Admin and RBAC system
4. `20260529_messaging_system.sql` - Messaging system
5. Additional migrations for features and fixes

**Migration Pattern:**
- Each migration is timestamped
- Migrations are applied sequentially
- Schema changes are version-controlled
- Rollback capability through migration reversal

### 3.2 Database Schema Overview

**Core Tables:**
- `profiles` - User profiles with roles and permissions
- `properties` - Property listings
- `property_addresses` - Property addresses
- `property_pricing` - Property pricing information
- `property_features` - Property features and amenities
- `property_images` - Property images
- `property_reviews` - Property reviews and ratings
- `property_bookings` - Property bookings
- `wishlists` - User wishlists
- `payments` - Payment transactions
- `admin_activity_logs` - Admin audit logs
- `property_views` - Property view analytics
- `booking_date_locks` - Booking date locking
- `notifications` - User notifications
- `notification_queue` - Notification queue for processing
- `conversations` - Messaging conversations
- `conversation_participants` - Conversation participants
- `messages` - Messages within conversations
- `message_attachments` - Message attachments

**Enums:**
- `property_badge`, `property_type`, `property_status`
- `pricing_type`, `booking_status`, `currency_type`
- `user_role`, `approval_status`, `dispute_status`
- `payment_status`, `verification_status`, `notification_status`
- `conversation_type`, `message_content_type`
- `conversation_status`, `conversation_priority`

---

## 4. Authentication System

### 4.1 Supabase Auth Integration

**Authentication Provider:** Supabase Auth

**Authentication Methods:**
- Email/Password authentication
- JWT-based session management
- Profile synchronization with `profiles` table

### 4.2 User Profile Structure

**profiles Table:**
```sql
id (UUID, FK to auth.users)
email (TEXT)
first_name (TEXT)
last_name (TEXT)
full_name (TEXT)
avatar_url (TEXT)
role (user_role ENUM)
is_banned (BOOLEAN)
verification_status (verification_status ENUM)
permissions (JSONB) - Granular permissions
host_properties_count (INTEGER)
host_bookings_count (INTEGER)
host_revenue (NUMERIC)
risk_flags (JSONB)
deleted_at (TIMESTAMPTZ) - Soft delete
created_at (TIMESTAMPTZ)
updated_at (TIMESTAMPTZ)
```

**Profile Synchronization:**
- Trigger on `auth.users` insert creates profile record
- Profile updates synchronized with auth metadata
- Soft delete capability preserves audit trail

### 4.3 Session Management

**Session Storage:** Supabase Auth (JWT tokens)

**Session Lifecycle:**
1. User logs in via email/password
2. Supabase Auth generates JWT token
3. Token stored in browser (localStorage/cookie)
4. Token sent with each request via Authorization header
5. Token validated by Supabase for each request
6. Session expires based on JWT expiry

**Security:**
- JWT tokens signed with Supabase secret
- Token refresh mechanism
- Secure token storage (to be verified in implementation)

---

## 5. Authorization System

### 5.1 Row-Level Security (RLS)

**RLS Enabled On:** All tables

**RLS Policy Pattern:**
- Public read access for certain tables (properties, public data)
- User-specific access based on ownership
- Role-based access for admin operations
- Service role bypass for system operations

### 5.2 Role-Based Access Control (RBAC)

**Role Hierarchy:**
```
super_admin (Full system access)
  ↓
admin (Platform management)
  ↓
manager (Property & customer management)
  ↓
host (Property owner)
  ↓
guest (Property seeker)
```

**Permission System:**
- 28+ granular permissions
- Stored in `permissions` JSONB column in profiles
- Role-based default permissions
- User-specific permission overrides

### 5.3 Permission Checking

**Database-Level:** RLS policies check user role and permissions

**Application-Level:** Frontend permission checks via `usePermissions` hook

**RPC Functions:** Permission checks within stored procedures

---

## 6. API Architecture

### 6.1 Supabase Client Integration

**Client Library:** `@supabase/supabase-js`

**Client Configuration:**
```typescript
const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
)
```

**Service Role Client:**
```typescript
const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
)
```

### 6.2 API Patterns

**Direct Table Access:**
- Simple CRUD operations via Supabase client
- RLS policies enforce access control
- Type-safe queries via TypeScript

**RPC Functions:**
- Complex business logic in database
- Transaction support
- Audit logging
- Permission enforcement

**Edge Functions:**
- External API integrations
- Complex server-side logic
- Secure secret handling
- CORS handling

### 6.3 Query Optimization

**Indexes:**
- Foreign key indexes
- Frequently queried columns
- Composite indexes for common query patterns

**Views:**
- `featured_properties` - Pre-computed featured properties
- `properties_by_city` - Properties grouped by city
- `conversation_list_view` - Simplified conversation queries
- `user_conversations_view` - User-specific conversations

**Materialized Views:** (to be verified in implementation)

---

## 7. Edge Functions

### 7.1 create-dodo-checkout

**Purpose:** Create Dodo Payments checkout session for card payments

**Location:** `supabase/functions/create-dodo-checkout/index.ts`

**Runtime:** Deno

**Input:**
```typescript
{
  booking_id: string
  amount?: number
  currency?: string
  return_url?: string
  cancel_url?: string
}
```

**Output:**
```typescript
{
  payment_id: string
  session_id: string
  checkout_url: string
}
```

**Process Flow:**
1. Validate authentication (JWT token)
2. Retrieve booking details from database
3. Validate amount matches booking
4. Call Dodo Payments API to create checkout
5. Create payment record in database
6. Return checkout URL to frontend

**Security:**
- Authentication required
- Service role for database operations
- Amount validation to prevent fraud
- CORS headers configured

**Error Handling:**
- Authentication errors (401)
- Booking not found (404)
- Amount mismatch (400)
- Dodo API errors (502)
- Generic errors (500)

---

## 8. RPC Functions

### 8.1 Admin Functions

**Property Management:**
- `approve_property(property_id, admin_id, notes)` - Approve property listing
- `reject_property(property_id, admin_id, reason)` - Reject property listing
- `suspend_property(property_id, admin_id, reason)` - Suspend property listing
- `soft_delete_property(property_id, admin_id)` - Soft delete property

**User Management:**
- `ban_user(user_id, admin_id, reason)` - Ban user
- `unban_user(user_id, admin_id)` - Unban user
- `verify_host(user_id, admin_id, notes)` - Verify host

**Payment Management:**
- `verify_payment(payment_id, admin_id, notes)` - Verify payment
- `reject_payment(payment_id, admin_id, reason)` - Reject payment

**Audit Logging:**
- `log_admin_activity(admin_id, action, entity_type, entity_id, details)` - Log admin action

### 8.2 Payment Functions

**Local Wallet Payments:**
- `create_local_wallet_payment(booking_id, payment_provider, payment_method, wallet_phone)` - Create wallet payment record

**Validation:**
- Phone number format validation
- Booking existence check
- Amount validation

### 8.3 Messaging Functions

**Conversation Management:**
- `create_conversation(type, title, metadata)` - Create new conversation
- `add_conversation_participant(conversation_id, user_id, role)` - Add participant
- `mark_conversation_read(conversation_id, user_id)` - Mark as read
- `get_unread_count(user_id)` - Get unread message count

**Message Management:**
- `send_message(conversation_id, sender_id, content, content_type, metadata)` - Send message

**Search:**
- Full-text search on messages via search vector

---

## 9. Real-time Architecture

### 9.1 Supabase Realtime

**Purpose:** Real-time data synchronization

**Use Cases:**
- Live messaging updates
- Booking status changes
- Payment status updates
- Notification delivery
- Presence indicators

### 9.2 Subscription Pattern

**Frontend Subscription:**
```typescript
supabase
  .channel('messages')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'messages'
  }, (payload) => {
    // Handle message update
  })
  .subscribe()
```

**Backend Triggers:**
- Database triggers notify Realtime on changes
- Realtime pushes updates to subscribed clients

### 9.3 Real-time Tables

**Enabled for Real-time:**
- `messages` - Live messaging
- `conversations` - Conversation updates
- `notifications` - Notification delivery
- `property_bookings` - Booking status updates
- `payments` - Payment status updates

---

## 10. Storage Architecture

### 10.1 Storage Buckets

**property-images:**
- Purpose: Store property listing images
- Access: Public read, authenticated write
- RLS Policies: Owners can upload, public can read

**avatars:**
- Purpose: Store user avatar images
- Access: Public read, authenticated write
- RLS Policies: Users can upload own avatars

### 10.2 File Upload Pattern

**Upload Process:**
1. User selects file
2. Frontend generates unique file path
3. Upload to Supabase Storage
4. Get public URL
5. Store URL in database

**Security:**
- Bucket-level RLS policies
- File type validation
- Size limits (to be configured)
- Virus scanning (to be implemented)

---

## 11. Database Functions and Triggers

### 11.1 Automated Functions

**Timestamp Management:**
- `update_updated_at_column()` - Auto-update `updated_at` on row modification
- Applied to all major tables

**Property Rating:**
- `update_property_rating()` - Calculate and update property rating from reviews
- Triggered on review insert/update/delete

**Search Vectors:**
- `messages_search_vector_update()` - Update full-text search vector for messages
- Triggered on message insert/update

### 11.2 Data Integrity

**Foreign Key Constraints:**
- All relationships enforced via foreign keys
- Cascade deletes where appropriate
- Restrict deletes for critical relationships

**Check Constraints:**
- Enum value validation
- Numeric range validation
- Data format validation

**Unique Constraints:**
- Email uniqueness
- Slug uniqueness for properties
- Reference uniqueness for payments

---

## 12. Security Architecture

### 12.1 Authentication Security

**Password Security:**
- Hashed and salted by Supabase Auth
- No plain-text password storage
- Password strength requirements (to be configured)

**Session Security:**
- JWT tokens with expiration
- Secure token transmission
- Refresh token mechanism

### 12.2 Authorization Security

**Row-Level Security:**
- All tables have RLS enabled
- Policies enforce data isolation
- Service role bypass only for system operations

**Permission Security:**
- Granular permission system
- Role-based default permissions
- User-specific overrides
- Permission checks at multiple layers

### 12.3 Data Security

**Encryption:**
- Data at rest encrypted by Supabase
- Data in transit via TLS/SSL
- Sensitive data handling (to be enhanced)

**Audit Logging:**
- All admin actions logged
- Log includes: admin_id, action, entity, timestamp
- Logs stored in `admin_activity_logs` table

**Soft Deletes:**
- Critical data soft-deleted
- Preserves audit trail
- Recovery capability

---

## 13. Performance Optimization

### 13.1 Database Optimization

**Indexing Strategy:**
- Foreign key indexes
- Frequently queried columns
- Composite indexes for common patterns
- Partial indexes for filtered queries

**Query Optimization:**
- Selective column queries
- Pagination for large datasets
- Query result caching (via Supabase)

**Connection Pooling:**
- Supabase managed connection pooling
- Automatic scaling based on load

### 13.2 Caching Strategy

**Application-Level:**
- Frontend state management
- Optimistic UI updates
- Data caching in service layer (to be implemented)

**Database-Level:**
- Query result caching (Supabase)
- Materialized views for expensive queries
- Pre-computed aggregations

---

## 14. Monitoring and Observability

### 14.1 Supabase Dashboard

**Metrics Available:**
- Database performance
- Query performance
- Connection pool status
- Storage usage
- Edge function logs
- Real-time connection status

### 14.2 Logging

**Application Logs:**
- Edge function logs
- RPC function logs (via PostgreSQL logs)
- Error logging

**Audit Logs:**
- Admin activity logging
- Payment verification logging
- User action logging (to be expanded)

---

## 15. Backup and Recovery

### 15.1 Database Backups

**Backup Strategy:**
- Daily automated backups by Supabase
- Point-in-time recovery (PITR) available
- 7-day retention (default, configurable)

### 15.2 Disaster Recovery

**Recovery Process:**
- Restore from backup via Supabase dashboard
- Point-in-time recovery for specific time
- Data export capability

---

## 16. Scalability Considerations

### 16.1 Database Scaling

**Vertical Scaling:**
- Automatic resource allocation by Supabase
- Based on plan tier

**Horizontal Scaling:**
- Read replicas (available on higher tiers)
- Connection pooling
- Load balancing (Supabase managed)

### 16.2 Application Scaling

**Edge Functions:**
- Auto-scaling based on demand
- Global edge network
- Cold start optimization

**Real-time:**
- WebSocket connection scaling
- Presence channel limits
- Subscription limits

---

## 17. API Documentation

### 17.1 OpenAPI Specification

**Status:** To be generated from Supabase schema

**Tools:**
- Supabase auto-generates API documentation
- TypeScript types from schema
- Postman collection (to be created)

### 17.2 RPC Function Documentation

**Documentation Location:** Inline in migration files

**Documentation Format:**
- Function signature
- Parameters
- Return values
- Usage examples
- Permission requirements

---

## 18. Integration Points

### 18.1 External APIs

**Payment Providers:**
- Dodo Payments (card payments)
- Zaad (mobile wallet)
- eDahab (mobile wallet)
- Premier Wallet (digital wallet)
- Wadaag Pay (P2P payments)

**Integration Pattern:**
- Edge functions for external API calls
- Secure secret management via environment variables
- Error handling and retry logic
- Transaction logging

### 18.2 Webhooks

**Planned Webhooks:**
- Payment status updates
- Booking confirmations
- Notification delivery
- (To be implemented)

---

## 19. Future Enhancements

### 19.1 Planned Improvements

**Database:**
- Additional indexes for performance
- Materialized views for analytics
- Partitioning for large tables
- Query optimization

**Edge Functions:**
- Additional payment provider integrations
- Email notification service
- SMS notification service
- Webhook handlers

**Security:**
- Enhanced audit logging
- Advanced threat detection
- Rate limiting
- IP whitelisting

**Performance:**
- Query optimization
- Caching layer
- CDN integration
- Image optimization

---

## 20. Documentation References

**Related Documents:**
- Database Documentation
- Security Documentation
- Business Logic Documentation
- Frontend Architecture Document

**Code References:**
- `supabase/migrations/` - Database schema and functions
- `supabase/functions/` - Edge functions
- `src/lib/supabase.ts` - Supabase client configuration
- `src/services/` - Service layer calling backend APIs

---

**End of Backend Architecture Document**
