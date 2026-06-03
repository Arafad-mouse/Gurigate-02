# GuriGate Database Schema Documentation

**Version:** 1.0  
**Date:** June 2, 2026  
**Status:** Production

---

## Executive Summary

GuriGate uses PostgreSQL via Supabase as its primary database. The schema follows a relational design with proper foreign key relationships, row-level security (RLS) policies, and audit logging capabilities. The database supports the marketplace, payment processing, admin management, messaging, and planned RMS modules.

**Database Type:** PostgreSQL 15+ (Supabase)  
**Schema Pattern:** Relational with foreign keys  
**Security:** Row-Level Security (RLS) on all tables  
**Audit Trail:** Comprehensive logging for admin operations

---

## Core Tables

### profiles

User profile and authentication data table.

**Columns:**
- `id` (UUID, PK) - User ID (references auth.users)
- `email` (TEXT, unique) - User email
- `first_name` (TEXT) - First name
- `last_name` (TEXT) - Last name
- `full_name` (TEXT) - Full name
- `avatar_url` (TEXT) - Profile picture URL
- `role` (TEXT) - User role (guest, host, manager, admin, super_admin)
- `verification_status` (TEXT) - Verification status
- `is_banned` (BOOLEAN) - Ban status flag
- `banned_reason` (TEXT) - Reason for ban
- `permissions` (JSONB) - Granular permissions
- `host_rating` (DECIMAL) - Host rating
- `host_response_rate` (DECIMAL) - Response rate percentage
- `host_response_time` (INTEGER) - Average response time (minutes)
- `host_completed_bookings` (INTEGER) - Total completed bookings
- `risk_flags` (TEXT[]) - Risk assessment flags
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp
- `deleted_at` (TIMESTAMPTZ) - Soft delete timestamp
- `deleted_by` (UUID) - Who deleted the record

**Indexes:**
- Primary key on `id`
- Unique index on `email`
- Index on `role`
- Index on `is_banned`

**RLS Policies:**
- Public: No access
- Authenticated: Read own profile, update own profile
- Admin: Read all, update all

---

### properties

Main property listings table.

**Columns:**
- `id` (UUID, PK) - Property ID
- `owner_id` (UUID, FK) - Property owner (references profiles.id)
- `title` (TEXT) - Property title
- `description` (TEXT) - Property description
- `type` (TEXT) - Property type (apartment, house, villa, studio, etc.)
- `status` (TEXT) - Availability status (available, booked, maintenance)
- `approval_status` (TEXT) - Approval status (draft, pending, approved, rejected, suspended)
- `city` (TEXT) - City location
- `country` (TEXT) - Country location
- `currency` (TEXT) - Currency code
- `base_price` (DECIMAL) - Base price
- `approved_by` (UUID) - Admin who approved
- `approved_at` (TIMESTAMPTZ) - Approval timestamp
- `rejection_reason` (TEXT) - Reason for rejection
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp
- `deleted_at` (TIMESTAMPTZ) - Soft delete timestamp
- `deleted_by` (UUID) - Who deleted the record

**Indexes:**
- Primary key on `id`
- Foreign key on `owner_id` → profiles.id
- Index on `approval_status`
- Index on `status`
- Index on `city`
- Composite index on `(approval_status, status)`

**RLS Policies:**
- Public: Read approved and available properties only
- Authenticated: Read approved properties + own properties
- Property owners: Full access to own properties
- Admin: Full access to all properties

---

### property_addresses

Property location and address details.

**Columns:**
- `id` (UUID, PK) - Address ID
- `property_id` (UUID, FK) - Property reference
- `address_line1` (TEXT) - Street address
- `address_line2` (TEXT) - Apartment/suite
- `city` (TEXT) - City
- `state` (TEXT) - State/province
- `postal_code` (TEXT) - Postal code
- `country` (TEXT) - Country
- `latitude` (DECIMAL) - GPS latitude
- `longitude` (DECIMAL) - GPS longitude
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

**Indexes:**
- Primary key on `id`
- Foreign key on `property_id` → properties.id
- Unique on `property_id`
- Index on `(city, country)`

---

### property_features

Property amenities and features.

**Columns:**
- `id` (UUID, PK) - Feature ID
- `property_id` (UUID, FK) - Property reference
- `feature_name` (TEXT) - Feature name
- `feature_category` (TEXT) - Category (e.g., kitchen, bathroom, outdoor)
- `created_at` (TIMESTAMPTZ) - Creation timestamp

**Indexes:**
- Primary key on `id`
- Foreign key on `property_id` → properties.id
- Index on `feature_category`

---

### property_pricing

Pricing information for properties.

**Columns:**
- `id` (UUID, PK) - Pricing ID
- `property_id` (UUID, FK) - Property reference
- `nightly_rate` (DECIMAL) - Price per night
- `weekly_rate` (DECIMAL) - Price per week
- `monthly_rate` (DECIMAL) - Price per month
- `currency` (TEXT) - Currency code
- `min_nights` (INTEGER) - Minimum stay duration
- `max_nights` (INTEGER) - Maximum stay duration
- `cleaning_fee` (DECIMAL) - Cleaning fee
- `service_fee` (DECIMAL) - Service fee percentage
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

**Indexes:**
- Primary key on `id`
- Foreign key on `property_id` → properties.id
- Unique on `property_id`

---

### property_images

Property photos and images.

**Columns:**
- `id` (UUID, PK) - Image ID
- `property_id` (UUID, FK) - Property reference
- `image_url` (TEXT) - Image URL
- `caption` (TEXT) - Image caption
- `is_primary` (BOOLEAN) - Primary image flag
- `display_order` (INTEGER) - Display sequence
- `created_at` (TIMESTAMPTZ) - Creation timestamp

**Indexes:**
- Primary key on `id`
- Foreign key on `property_id` → properties.id
- Index on `is_primary`
- Index on `display_order`

---

### property_reviews

Guest reviews for properties.

**Columns:**
- `id` (UUID, PK) - Review ID
- `property_id` (UUID, FK) - Property reference
- `guest_id` (UUID, FK) - Guest who wrote review
- `rating` (INTEGER) - Rating (1-5)
- `comment` (TEXT) - Review text
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

**Indexes:**
- Primary key on `id`
- Foreign key on `property_id` → properties.id
- Foreign key on `guest_id` → profiles.id
- Unique constraint on `(property_id, guest_id)`

**Triggers:**
- Rating aggregation trigger updates property average rating

---

### bookings

Booking reservations.

**Columns:**
- `id` (UUID, PK) - Booking ID
- `property_id` (UUID, FK) - Property reference
- `guest_id` (UUID, FK) - Guest making booking
- `host_id` (UUID, FK) - Property owner
- `check_in` (DATE) - Check-in date
- `check_out` (DATE) - Check-out date
- `guest_count` (INTEGER) - Number of guests
- `total_price` (DECIMAL) - Total booking price
- `currency` (TEXT) - Currency code
- `status` (TEXT) - Booking status (pending, confirmed, cancelled, completed)
- `dispute_status` (TEXT) - Dispute status (none, open, resolved, escalated)
- `admin_note` (TEXT) - Admin notes
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp
- `deleted_at` (TIMESTAMPTZ) - Soft delete timestamp
- `deleted_by` (UUID) - Who deleted the record

**Indexes:**
- Primary key on `id`
- Foreign key on `property_id` → properties.id
- Foreign key on `guest_id` → profiles.id
- Foreign key on `host_id` → profiles.id
- Index on `status`
- Index on `check_in`, `check_out` (for availability queries)
- Composite index on `(property_id, status)`

**RLS Policies:**
- Public: No access
- Authenticated: Read own bookings, create bookings
- Property owners: Read bookings for their properties
- Admin: Full access

---

### payments

Payment transactions.

**Columns:**
- `id` (UUID, PK) - Payment ID
- `booking_id` (UUID, FK) - Associated booking
- `payer_id` (UUID, FK) - Payer
- `payee_id` (UUID, FK) - Payee (property owner)
- `amount` (DECIMAL) - Payment amount
- `currency` (TEXT) - Currency code
- `payment_provider` (TEXT) - Payment provider (dodo, zaad, edahab, wallet)
- `payment_method` (TEXT) - Payment method
- `provider_reference` (TEXT) - Provider transaction reference
- `wallet_phone` (TEXT) - Wallet phone number
- `status` (TEXT) - Payment status (pending, submitted, under_review, verified, failed, refunded, completed)
- `proof_image` (TEXT) - Proof of payment image URL
- `metadata` (JSONB) - Additional payment metadata
- `verified_at` (TIMESTAMPTZ) - Verification timestamp
- `verified_by` (UUID) - Admin who verified
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp
- `deleted_at` (TIMESTAMPTZ) - Soft delete timestamp
- `deleted_by` (UUID) - Who deleted the record

**Indexes:**
- Primary key on `id`
- Foreign key on `booking_id` → bookings.id
- Foreign key on `payer_id` → profiles.id
- Foreign key on `payee_id` → profiles.id
- Index on `status`
- Index on `payment_provider`

**RLS Policies:**
- Public: No access
- Authenticated: Read own payments, create payments
- Property owners: Read payments for their properties
- Admin: Full access

---

### conversations

Messaging conversations.

**Columns:**
- `id` (UUID, PK) - Conversation ID
- `type` (TEXT) - Conversation type (booking, property, payment, support, rms_contract, rms_tenant, rms_unit)
- `status` (TEXT) - Conversation status (open, closed, archived)
- `priority` (TEXT) - Priority level (urgent, high, normal, low)
- `subject` (TEXT) - Conversation subject
- `created_by` (UUID, FK) - User who created conversation
- `assigned_to` (UUID, FK) - Assigned admin
- `assigned_at` (TIMESTAMPTZ) - Assignment timestamp
- `first_response_at` (TIMESTAMPTZ) - First response timestamp
- `resolved_at` (TIMESTAMPTZ) - Resolution timestamp
- `related_booking_id` (UUID, FK) - Related booking
- `related_property_id` (UUID, FK) - Related property
- `related_payment_id` (UUID, FK) - Related payment
- `related_contract_id` (UUID) - Related contract (RMS)
- `related_tenant_id` (UUID) - Related tenant (RMS)
- `related_unit_id` (UUID) - Related unit (RMS)
- `metadata` (JSONB) - Additional metadata
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp
- `deleted_at` (TIMESTAMPTZ) - Soft delete timestamp
- `deleted_by` (UUID) - Who deleted the record

**Indexes:**
- Primary key on `id`
- Foreign key on `created_by` → profiles.id
- Foreign key on `assigned_to` → profiles.id
- Index on `status`
- Index on `priority`
- Index on `type`

**RLS Policies:**
- Public: No access
- Authenticated: Read conversations they participate in
- Property owners: Read conversations for their properties
- Admin: Full access

---

### conversation_participants

Conversation participant mapping.

**Columns:**
- `id` (UUID, PK) - Participant ID
- `conversation_id` (UUID, FK) - Conversation reference
- `user_id` (UUID, FK) - User reference
- `role` (TEXT) - Participant role
- `is_admin` (BOOLEAN) - Admin participant flag
- `last_read_at` (TIMESTAMPTZ) - Last read timestamp
- `joined_at` (TIMESTAMPTZ) - Join timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

**Indexes:**
- Primary key on `id`
- Foreign key on `conversation_id` → conversations.id
- Foreign key on `user_id` → profiles.id
- Unique constraint on `(conversation_id, user_id)`

---

### messages

Individual messages in conversations.

**Columns:**
- `id` (UUID, PK) - Message ID
- `conversation_id` (UUID, FK) - Conversation reference
- `sender_id` (UUID, FK) - Message sender
- `content` (TEXT) - Message content
- `type` (TEXT) - Message type (text, image, file, system)
- `is_internal` (BOOLEAN) - Internal note flag
- `is_system` (BOOLEAN) - System message flag
- `metadata` (JSONB) - Additional metadata
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp
- `deleted_at` (TIMESTAMPTZ) - Soft delete timestamp
- `deleted_by` (UUID) - Who deleted the record

**Indexes:**
- Primary key on `id`
- Foreign key on `conversation_id` → conversations.id
- Foreign key on `sender_id` → profiles.id
- Index on `created_at`

**RLS Policies:**
- Public: No access
- Authenticated: Read messages in conversations they participate in
- Admin: Full access

---

### message_attachments

File attachments for messages.

**Columns:**
- `id` (UUID, PK) - Attachment ID
- `message_id` (UUID, FK) - Message reference
- `file_name` (TEXT) - File name
- `file_url` (TEXT) - File URL
- `file_type` (TEXT) - File type
- `file_size` (INTEGER) - File size in bytes
- `mime_type` (TEXT) - MIME type
- `storage_path` (TEXT) - Storage path
- `storage_bucket` (TEXT) - Storage bucket
- `uploaded_by` (UUID, FK) - Uploader
- `created_at` (TIMESTAMPTZ) - Creation timestamp

**Indexes:**
- Primary key on `id`
- Foreign key on `message_id` → messages.id
- Foreign key on `uploaded_by` → profiles.id

---

### notifications

User notifications.

**Columns:**
- `id` (UUID, PK) - Notification ID
- `user_id` (UUID, FK) - Recipient
- `type` (TEXT) - Notification type
- `title` (TEXT) - Notification title
- `message` (TEXT) - Notification message
- `data` (JSONB) - Additional data
- `read_at` (TIMESTAMPTZ) - Read timestamp
- `created_at` (TIMESTAMPTZ) - Creation timestamp

**Indexes:**
- Primary key on `id`
- Foreign key on `user_id` → profiles.id
- Index on `read_at`
- Index on `created_at`

---

### wishlists

User saved properties.

**Columns:**
- `id` (UUID, PK) - Wishlist ID
- `user_id` (UUID, FK) - User
- `property_id` (UUID, FK) - Property
- `created_at` (TIMESTAMPTZ) - Creation timestamp

**Indexes:**
- Primary key on `id`
- Foreign key on `user_id` → profiles.id
- Foreign key on `property_id` → properties.id
- Unique constraint on `(user_id, property_id)`

---

### admin_audit_logs

Audit log for admin operations.

**Columns:**
- `id` (UUID, PK) - Log ID
- `admin_id` (UUID, FK) - Admin who performed action
- `action` (TEXT) - Action performed
- `entity_type` (TEXT) - Entity type (property, booking, payment, user)
- `entity_id` (UUID) - Entity ID
- `old_values` (JSONB) - Previous values
- `new_values` (JSONB) - New values
- `reason` (TEXT) - Reason for action
- `ip_address` (TEXT) - IP address
- `created_at` (TIMESTAMPTZ) - Creation timestamp

**Indexes:**
- Primary key on `id`
- Foreign key on `admin_id` → profiles.id
- Index on `action`
- Index on `entity_type`
- Index on `created_at`

---

### property_views

Property view tracking for analytics.

**Columns:**
- `id` (UUID, PK) - View ID
- `property_id` (UUID, FK) - Property
- `viewer_id` (UUID, FK) - Viewer (optional)
- `viewed_at` (TIMESTAMPTZ) - View timestamp

**Indexes:**
- Primary key on `id`
- Foreign key on `property_id` → properties.id
- Foreign key on `viewer_id` → profiles.id
- Index on `viewed_at`

---

## Planned RMS Tables (Not Yet Implemented)

### contracts

Rental lease contracts.

**Planned Columns:**
- `id` (UUID, PK)
- `tenant_id` (UUID, FK)
- `unit_id` (UUID, FK)
- `start_date` (DATE)
- `end_date` (DATE)
- `rent_amount` (DECIMAL)
- `status` (TEXT)
- `terms` (TEXT)

### tenants

Tenant information for RMS.

**Planned Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `emergency_contact` (TEXT)
- `employment_info` (JSONB)
- `income_verification` (TEXT)
- `background_check_status` (TEXT)

### units

Property units for RMS.

**Planned Columns:**
- `id` (UUID, PK)
- `property_id` (UUID, FK)
- `unit_number` (TEXT)
- `floor` (INTEGER)
- `square_feet` (INTEGER)
- `bedrooms` (INTEGER)
- `bathrooms` (INTEGER)
- `status` (TEXT)
- `rent_amount` (DECIMAL)

### buildings

Building information for RMS.

**Planned Columns:**
- `id` (UUID, PK)
- `name` (TEXT)
- `address` (TEXT)
- `city` (TEXT)
- `total_units` (INTEGER)
- `property_manager_id` (UUID, FK)

---

## Database Functions (RPC)

### Admin Functions

**approve_property(property_id, admin_id)**
- Approves a property listing
- Updates approval_status to 'approved'
- Creates audit log entry
- Returns updated property

**reject_property(property_id, admin_id, reason)**
- Rejects a property listing
- Updates approval_status to 'rejected'
- Stores rejection reason
- Creates audit log entry
- Returns updated property

**suspend_property(property_id, admin_id, reason)**
- Suspends an approved property
- Updates approval_status to 'suspended'
- Creates audit log entry
- Returns updated property

**verify_payment(payment_id, admin_id)**
- Verifies a payment
- Updates status to 'verified'
- Sets verification timestamp
- Creates audit log entry
- Returns updated payment

**ban_user(user_id, admin_id, reason)**
- Bans a user
- Sets is_banned to true
- Stores ban reason
- Creates audit log entry
- Returns updated user

**unban_user(user_id, admin_id)**
- Unbans a user
- Sets is_banned to false
- Clears ban reason
- Creates audit log entry
- Returns updated user

**verify_host(user_id, admin_id)**
- Verifies a host
- Updates verification_status to 'verified'
- Creates audit log entry
- Returns updated user

### Payment Functions

**create_local_wallet_payment(booking_id, payment_provider, payment_method, wallet_phone, fallback_amount, fallback_currency)**
- Creates a wallet payment record
- Supports Zaad, eDahab, Premier Wallet, Wadaag Pay
- Validates phone number format
- Returns payment record

### Messaging Functions

**create_conversation(type, subject, created_by, related_booking_id, related_property_id, related_payment_id)**
- Creates a new conversation
- Links to related entities
- Creates participant records
- Returns conversation

**send_message(conversation_id, sender_id, content, is_internal)**
- Sends a message in a conversation
- Marks conversation as updated
- Returns message

**get_conversation_context(conversation_id)**
- Retrieves context data for a conversation
- Fetches related booking, property, payment data
- Returns context object

---

## Triggers

### Property Rating Aggregation

**Trigger:** `update_property_rating_after_review`
- Fires after insert/update on property_reviews
- Recalculates average rating for property
- Updates property rating fields

### Auto-Conversation Creation

**Trigger:** `create_conversation_on_booking`
- Fires after insert on bookings
- Automatically creates conversation for new booking
- Links guest and host as participants
- Sets conversation type to 'booking'

---

## Row-Level Security (RLS) Policies

### Property Tables

**properties:**
- Public: SELECT WHERE approval_status = 'approved' AND status = 'available'
- Authenticated: SELECT WHERE approval_status = 'approved' OR owner_id = auth.uid()
- Property Owners: Full access to own properties
- Admins: Full access to all properties

**bookings:**
- Public: No access
- Authenticated: SELECT WHERE guest_id = auth.uid() OR host_id = auth.uid()
- Admins: Full access

**payments:**
- Public: No access
- Authenticated: SELECT WHERE payer_id = auth.uid() OR payee_id = auth.uid()
- Admins: Full access

### Messaging Tables

**conversations:**
- Public: No access
- Authenticated: SELECT WHERE EXISTS (SELECT 1 FROM conversation_participants WHERE conversation_id = conversations.id AND user_id = auth.uid())
- Property Owners: SELECT WHERE related_property_id IN (SELECT id FROM properties WHERE owner_id = auth.uid())
- Admins: Full access

**messages:**
- Public: No access
- Authenticated: SELECT WHERE conversation_id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid())
- Admins: Full access

---

## Database Migrations

### Migration Files

1. `20240502_gurigate_properties_schema.sql` - Core property schema
2. `20240502_gurigate_enhancements.sql` - Initial enhancements
3. `20240502_gurigate_enhancements_14A.sql` - Feature additions
4. `20240502_gurigate_enhancements_14B.sql` - Additional features
5. `20240502_fix_rls_recursion.sql` - RLS policy fixes
6. `20260502_payments_flow.sql` - Payment system
7. `20260506_security_fixes_final.sql` - Security enhancements
8. `20260508_admin_role_system.sql` - Admin RBAC system
9. `20260529_messaging_system.sql` - Messaging system
10. `20260529_auto_conversation_triggers.sql` - Auto-conversation triggers
11. `20260529_sprint1_validation.sql` - Validation functions

---

## Performance Optimizations

### Indexes

**Foreign Key Indexes:**
- All foreign keys have indexes
- Composite indexes for common query patterns

**Query Optimization:**
- Indexes on status fields for filtering
- Composite indexes for multi-column queries
- Partial indexes for specific query patterns

### Soft Deletes

**Implementation:**
- `deleted_at` timestamp on major tables
- `deleted_by` reference to admin
- RLS policies filter out deleted records
- Audit logs track deletion operations

---

## Data Relationships

### Core Relationships

```
profiles (1) ──────< (N) properties
profiles (1) ──────< (N) bookings (as guest)
profiles (1) ──────< (N) bookings (as host)
profiles (1) ──────< (N) payments (as payer)
profiles (1) ──────< (N) payments (as payee)
properties (1) ────< (N) bookings
bookings (1) ───────< (N) payments
conversations (1) ──< (N) messages
conversations (1) ──< (N) conversation_participants
profiles (1) ──────< (N) conversation_participants
```

---

## Backup and Recovery

**Backup Strategy:**
- Daily automated backups (Supabase default)
- Point-in-time recovery (7-day retention)
- Manual backup before major migrations

**Recovery Procedures:**
- Restore from backup via Supabase dashboard
- Point-in-time recovery for specific time
- Migration rollback procedures documented

---

## Security Considerations

**Data Protection:**
- PII stored in profiles table
- Sensitive financial data in payments table
- RLS policies prevent unauthorized access
- Audit logs track all admin operations

**Access Control:**
- Role-based access control
- Granular permissions via JSONB
- Row-level security on all tables
- Admin operations require authentication

---

**Document Owner:** Development Team  
**Last Updated:** June 2, 2026  
**Next Review:** After RMS module implementation
