# GuriGate Database Documentation

**Document Version:** 1.0  
**Date:** June 2, 2026  
**Author:** System Architecture Team

---

## 1. Overview

The GuriGate database is built on PostgreSQL and managed through Supabase. The schema is designed to support a comprehensive property management and rental platform with features including property listings, bookings, payments, messaging, admin operations, and customer management.

### Database Characteristics

- **Engine:** PostgreSQL (managed by Supabase)
- **Schema Version:** Current as of June 2, 2026
- **Migration Strategy:** Sequential timestamped migrations
- **Security:** Row-Level Security (RLS) on all tables
- **Audit:** Soft deletes and activity logging

---

## 2. Data Types and Enums

### 2.1 Enum Definitions

**Property Enums:**

```sql
property_badge: 'featured' | 'new' | 'popular' | 'none'
property_type: 'apartment' | 'house' | 'villa' | 'studio' | 'condo' | 
             'townhouse' | 'cottage' | 'penthouse' | 'loft' | 'other'
property_status: 'available' | 'occupied' | 'maintenance' | 'pending' | 'inactive'
pricing_type: 'nightly' | 'monthly' | 'sale'
booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
currency_type: 'USD' | 'EUR' | 'GBP' | 'KES' | 'NGN' | 'ZAR' | 'SOS'
```

**Admin System Enums:**

```sql
user_role: 'guest' | 'host' | 'manager' | 'admin' | 'super_admin'
approval_status: 'draft' | 'pending' | 'approved' | 'rejected' | 'suspended'
dispute_status: 'none' | 'open' | 'resolved' | 'escalated'
payment_status: 'pending' | 'submitted' | 'under_review' | 'verified' | 
              'failed' | 'refunded' | 'completed'
verification_status: 'unverified' | 'pending' | 'verified' | 'rejected' | 'suspended'
notification_status: 'pending' | 'processing' | 'sent' | 'failed' | 'retrying' | 'cancelled'
```

**Messaging Enums:**

```sql
conversation_type: 'direct' | 'booking' | 'property' | 'payment' | 
                  'support' | 'system' | 'rms_contract' | 'rms_tenant' | 'rms_unit'
message_content_type: 'text' | 'image' | 'document' | 'property_reference' | 
                     'booking_reference' | 'payment_reference' | 'system'
conversation_status: 'active' | 'archived' | 'closed'
conversation_priority: 'low' | 'normal' | 'high' | 'urgent'
```

---

## 3. Table Documentation

### 3.1 profiles

**Purpose:** Extended user profile information linked to Supabase Auth

**Schema:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, FK to auth.users | User identifier |
| email | TEXT | NOT NULL, UNIQUE | User email address |
| first_name | TEXT | | First name |
| last_name | TEXT | | Last name |
| full_name | TEXT | | Full display name |
| avatar_url | TEXT | | Avatar image URL |
| role | user_role | NOT NULL, DEFAULT 'guest' | User role |
| is_banned | BOOLEAN | NOT NULL, DEFAULT FALSE | Ban status |
| verification_status | verification_status | NOT NULL, DEFAULT 'unverified' | Verification status |
| permissions | JSONB | | Granular permissions |
| host_properties_count | INTEGER | DEFAULT 0 | Number of properties for hosts |
| host_bookings_count | INTEGER | DEFAULT 0 | Number of bookings for hosts |
| host_revenue | NUMERIC | DEFAULT 0 | Total revenue for hosts |
| risk_flags | JSONB | | Risk assessment flags |
| deleted_at | TIMESTAMPTZ | | Soft delete timestamp |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `profiles_email_key` (email)
- `profiles_role_idx` (role)
- `profiles_verification_status_idx` (verification_status)

**RLS Policies:**
- Public can read basic profile info
- Users can read all profiles
- Users can update own profile
- Admins can update any profile
- Service role bypass

**Relationships:**
- One-to-one with auth.users
- One-to-many with properties (as owner)
- One-to-many with property_bookings (as guest)
- One-to-many with conversations (as participant)

---

### 3.2 properties

**Purpose:** Property listings for rental or sale

**Schema:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Property identifier |
| owner_id | UUID | FK to profiles, NOT NULL | Property owner |
| title | TEXT | NOT NULL | Property title |
| description | TEXT | NOT NULL | Property description |
| type | property_type | NOT NULL | Property type |
| badge | property_badge | DEFAULT 'none' | Property badge |
| status | property_status | NOT NULL, DEFAULT 'available' | Property status |
| approval_status | approval_status | NOT NULL, DEFAULT 'draft' | Approval status |
| approved_by | UUID | FK to profiles | Approving admin |
| approved_at | TIMESTAMPTZ | | Approval timestamp |
| rejection_reason | TEXT | | Rejection reason |
| slug | TEXT | UNIQUE | URL-friendly slug |
| seo_title | TEXT | | SEO title |
| seo_description | TEXT | | SEO description |
| deleted_at | TIMESTAMPTZ | | Soft delete timestamp |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `properties_owner_id_idx` (owner_id)
- `properties_type_idx` (type)
- `properties_status_idx` (status)
- `properties_approval_status_idx` (approval_status)
- `properties_slug_idx` (slug)
- `properties_created_at_idx` (created_at)

**RLS Policies:**
- Public can read approved properties
- Owners can read own properties (all statuses)
- Owners can insert properties
- Owners can update own properties
- Admins can read all properties
- Admins can update any property
- Service role bypass

**Relationships:**
- Many-to-one with profiles (owner)
- One-to-one with property_addresses
- One-to-one with property_pricing
- One-to-many with property_features
- One-to-many with property_images
- One-to-many with property_reviews
- One-to-many with property_bookings
- One-to-many with wishlists

---

### 3.3 property_addresses

**Purpose:** Property address information

**Schema:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Address identifier |
| property_id | UUID | FK to properties, UNIQUE, NOT NULL | Property reference |
| street | TEXT | NOT NULL | Street address |
| city | TEXT | NOT NULL | City |
| state | TEXT | NOT NULL | State/Province |
| postal_code | TEXT | | Postal code |
| country | TEXT | NOT NULL | Country |
| latitude | NUMERIC | | Latitude coordinate |
| longitude | NUMERIC | | Longitude coordinate |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `property_addresses_property_id_idx` (property_id)
- `property_addresses_city_idx` (city)
- `property_addresses_country_idx` (country)

**RLS Policies:**
- Public can read addresses for approved properties
- Owners can read own property addresses
- Owners can insert/update own property addresses
- Admins can read all addresses
- Service role bypass

**Relationships:**
- One-to-one with properties

---

### 3.4 property_pricing

**Purpose:** Property pricing information

**Schema:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Pricing identifier |
| property_id | UUID | FK to properties, UNIQUE, NOT NULL | Property reference |
| base_price | NUMERIC | NOT NULL | Base price |
| currency | currency_type | NOT NULL, DEFAULT 'USD' | Currency |
| pricing_type | pricing_type | NOT NULL | Pricing type |
| security_deposit | NUMERIC | | Security deposit |
| cleaning_fee | NUMERIC | | Cleaning fee |
| service_fee | NUMERIC | | Service fee |
| taxes | NUMERIC | | Taxes |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `property_pricing_property_id_idx` (property_id)
- `property_pricing_pricing_type_idx` (pricing_type)

**RLS Policies:**
- Public can read pricing for approved properties
- Owners can read own property pricing
- Owners can insert/update own property pricing
- Admins can read all pricing
- Service role bypass

**Relationships:**
- One-to-one with properties

---

### 3.5 property_features

**Purpose:** Property features and amenities

**Schema:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Features identifier |
| property_id | UUID | FK to properties, UNIQUE, NOT NULL | Property reference |
| bedrooms | INTEGER | NOT NULL | Number of bedrooms |
| bathrooms | INTEGER | NOT NULL | Number of bathrooms |
| max_guests | INTEGER | NOT NULL | Maximum guests |
| square_feet | INTEGER | | Square footage |
| amenities | TEXT[] | | List of amenities |
| rules | TEXT[] | | List of rules |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `property_features_property_id_idx` (property_id)

**RLS Policies:**
- Public can read features for approved properties
- Owners can read own property features
- Owners can insert/update own property features
- Admins can read all features
- Service role bypass

**Relationships:**
- One-to-one with properties

---

### 3.6 property_images

**Purpose:** Property image URLs and metadata

**Schema:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Image identifier |
| property_id | UUID | FK to properties, NOT NULL | Property reference |
| image_url | TEXT | NOT NULL | Image URL |
| is_primary | BOOLEAN | NOT NULL, DEFAULT FALSE | Primary image flag |
| alt_text | TEXT | | Alt text for accessibility |
| sort_order | INTEGER | NOT NULL, DEFAULT 0 | Display order |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `property_images_property_id_idx` (property_id)
- `property_images_is_primary_idx` (is_primary)
- `property_images_sort_order_idx` (sort_order)

**RLS Policies:**
- Public can read images for approved properties
- Owners can read own property images
- Owners can insert/delete own property images
- Admins can read all images
- Service role bypass

**Relationships:**
- Many-to-one with properties

---

### 3.7 property_reviews

**Purpose:** Property reviews and ratings

**Schema:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Review identifier |
| property_id | UUID | FK to properties, NOT NULL | Property reference |
| user_id | UUID | FK to profiles, NOT NULL | Review author |
| rating | INTEGER | NOT NULL, CHECK(1-5) | Rating (1-5) |
| comment | TEXT | | Review comment |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `property_reviews_property_id_idx` (property_id)
- `property_reviews_user_id_idx` (user_id)
- `property_reviews_rating_idx` (rating)

**RLS Policies:**
- Public can read reviews
- Users can insert reviews for booked properties
- Users can update own reviews
- Admins can delete reviews
- Service role bypass

**Relationships:**
- Many-to-one with properties
- Many-to-one with profiles (reviewer)

**Triggers:**
- `update_property_rating` - Updates property rating on review changes

---

### 3.8 property_bookings

**Purpose:** Property booking reservations

**Schema:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Booking identifier |
| property_id | UUID | FK to properties, NOT NULL | Property reference |
| guest_id | UUID | FK to profiles, NOT NULL | Guest user |
| check_in | DATE | NOT NULL | Check-in date |
| check_out | DATE | NOT NULL | Check-out date |
| guests | INTEGER | NOT NULL | Number of guests |
| total_price | NUMERIC | NOT NULL | Total price |
| currency | currency_type | NOT NULL, DEFAULT 'USD' | Currency |
| status | booking_status | NOT NULL, DEFAULT 'pending' | Booking status |
| admin_note | TEXT | | Admin notes |
| dispute_status | dispute_status | NOT NULL, DEFAULT 'none' | Dispute status |
| cancelled_at | TIMESTAMPTZ | | Cancellation timestamp |
| cancelled_by | UUID | FK to profiles | Cancellation initiator |
| cancellation_reason | TEXT | | Cancellation reason |
| deleted_at | TIMESTAMPTZ | | Soft delete timestamp |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `property_bookings_property_id_idx` (property_id)
- `property_bookings_guest_id_idx` (guest_id)
- `property_bookings_status_idx` (status)
- `property_bookings_check_in_idx` (check_in)
- `property_bookings_check_out_idx` (check_out)

**RLS Policies:**
- Guests can read own bookings
- Property owners can read bookings for their properties
- Admins can read all bookings
- Guests can insert bookings
- Property owners can update booking status
- Admins can update any booking
- Service role bypass

**Relationships:**
- Many-to-one with properties
- Many-to-one with profiles (guest)
- One-to-many with payments

---

### 3.9 wishlists

**Purpose:** User wishlists/favorites

**Schema:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Wishlist identifier |
| user_id | UUID | FK to profiles, NOT NULL | User reference |
| property_id | UUID | FK to properties, NOT NULL | Property reference |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `wishlists_user_id_idx` (user_id)
- `wishlists_property_id_idx` (property_id)
- `wishlists_user_property_unique` (user_id, property_id) - UNIQUE

**RLS Policies:**
- Users can read own wishlists
- Users can insert own wishlists
- Users can delete own wishlists
- Service role bypass

**Relationships:**
- Many-to-one with profiles (user)
- Many-to-one with properties

---

### 3.10 payments

**Purpose:** Payment transaction records

**Schema:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Payment identifier |
| booking_id | UUID | FK to property_bookings, NOT NULL | Booking reference |
| payment_provider | TEXT | NOT NULL | Payment provider |
| payment_method | TEXT | NOT NULL | Payment method |
| provider_reference | TEXT | | Provider reference ID |
| wallet_phone | TEXT | | Wallet phone number |
| status | payment_status | NOT NULL, DEFAULT 'pending' | Payment status |
| amount | NUMERIC | NOT NULL | Payment amount |
| currency | currency_type | NOT NULL, DEFAULT 'USD' | Currency |
| verified_by | UUID | FK to profiles | Verifying admin |
| verified_at | TIMESTAMPTZ | | Verification timestamp |
| proof_image | TEXT | | Proof image URL |
| metadata | JSONB | | Additional metadata |
| deleted_at | TIMESTAMPTZ | | Soft delete timestamp |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `payments_booking_id_idx` (booking_id)
- `payments_status_idx` (status)
- `payments_provider_reference_idx` (provider_reference)
- `payments_created_at_idx` (created_at)

**RLS Policies:**
- Guests can read payments for own bookings
- Property owners can read payments for their properties
- Admins can read all payments
- Property owners can update payment verification
- Admins can update any payment
- Service role bypass

**Relationships:**
- Many-to-one with property_bookings
- Many-to-one with profiles (verifier)

---

### 3.11 admin_activity_logs

**Purpose:** Audit log for admin actions

**Schema:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Log identifier |
| admin_id | UUID | FK to profiles, NOT NULL | Admin user |
| action | TEXT | NOT NULL | Action performed |
| entity_type | TEXT | NOT NULL | Entity type |
| entity_id | UUID | NOT NULL | Entity identifier |
| details | JSONB | | Action details |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `admin_activity_logs_admin_id_idx` (admin_id)
- `admin_activity_logs_entity_type_idx` (entity_type)
- `admin_activity_logs_entity_id_idx` (entity_id)
- `admin_activity_logs_created_at_idx` (created_at)

**RLS Policies:**
- Admins can read all logs
- Only service role can insert logs
- Service role bypass

**Relationships:**
- Many-to-one with profiles (admin)

---

### 3.12 property_views

**Purpose:** Property view analytics

**Schema:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | View identifier |
| property_id | UUID | FK to properties, NOT NULL | Property reference |
| user_id | UUID | FK to profiles | Viewer (optional) |
| viewed_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | View timestamp |

**Indexes:**
- `property_views_property_id_idx` (property_id)
- `property_views_user_id_idx` (user_id)
- `property_views_viewed_at_idx` (viewed_at)

**RLS Policies:**
- Public can insert view records
- Property owners can read views for their properties
- Admins can read all views
- Service role bypass

**Relationships:**
- Many-to-one with properties
- Many-to-one with profiles (viewer)

---

### 3.13 booking_date_locks

**Purpose:** Prevent double bookings on same dates

**Schema:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Lock identifier |
| property_id | UUID | FK to properties, NOT NULL | Property reference |
| date | DATE | NOT NULL | Locked date |
| booking_id | UUID | FK to property_bookings, NOT NULL | Booking reference |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `booking_date_locks_property_id_idx` (property_id)
- `booking_date_locks_date_idx` (date)
- `booking_date_locks_booking_id_idx` (booking_id)
- `booking_date_locks_property_date_unique` (property_id, date) - UNIQUE

**RLS Policies:**
- Service role only (managed by triggers/functions)
- Service role bypass

**Relationships:**
- Many-to-one with properties
- Many-to-one with property_bookings

---

### 3.14 notifications

**Purpose:** User notifications

**Schema:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Notification identifier |
| user_id | UUID | FK to profiles, NOT NULL | Recipient user |
| type | TEXT | NOT NULL | Notification type |
| title | TEXT | NOT NULL | Notification title |
| message | TEXT | NOT NULL | Notification message |
| data | JSONB | | Additional data |
| status | notification_status | NOT NULL, DEFAULT 'pending' | Status |
| channel | TEXT | NOT NULL | Delivery channel |
| read_at | TIMESTAMPTZ | | Read timestamp |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `notifications_user_id_idx` (user_id)
- `notifications_status_idx` (status)
- `notifications_created_at_idx` (created_at)

**RLS Policies:**
- Users can read own notifications
- Users can update own notifications (mark read)
- Service role can insert notifications
- Admins can read all notifications
- Service role bypass

**Relationships:**
- Many-to-one with profiles (recipient)

---

### 3.15 notification_queue

**Purpose:** Queue for processing notifications

**Schema:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Queue identifier |
| notification_id | UUID | FK to notifications, NOT NULL | Notification reference |
| status | notification_status | NOT NULL, DEFAULT 'pending' | Queue status |
| attempts | INTEGER | NOT NULL, DEFAULT 0 | Delivery attempts |
| error_message | TEXT | | Last error |
| scheduled_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Scheduled time |
| processed_at | TIMESTAMPTZ | | Processed timestamp |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `notification_queue_notification_id_idx` (notification_id)
- `notification_queue_status_idx` (status)
- `notification_queue_scheduled_at_idx` (scheduled_at)

**RLS Policies:**
- Service role only (managed by worker)
- Service role bypass

**Relationships:**
- Many-to-one with notifications

---

### 3.16 conversations

**Purpose:** Messaging conversations

**Schema:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Conversation identifier |
| type | conversation_type | NOT NULL | Conversation type |
| title | TEXT | NOT NULL | Conversation title |
| status | conversation_status | NOT NULL, DEFAULT 'active' | Status |
| priority | conversation_priority | NOT NULL, DEFAULT 'normal' | Priority |
| assigned_to | UUID | FK to profiles | Assigned user |
| booking_id | UUID | FK to property_bookings | Related booking |
| property_id | UUID | FK to properties | Related property |
| payment_id | UUID | FK to payments | Related payment |
| rms_contract_id | UUID | | RMS contract reference |
| rms_tenant_id | UUID | | RMS tenant reference |
| rms_unit_id | UUID | | RMS unit reference |
| metadata | JSONB | | Additional metadata |
| deleted_at | TIMESTAMPTZ | | Soft delete timestamp |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `conversations_type_idx` (type)
- `conversations_status_idx` (status)
- `conversations_assigned_to_idx` (assigned_to)
- `conversations_booking_id_idx` (booking_id)
- `conversations_property_id_idx` (property_id)
- `conversations_payment_id_idx` (payment_id)

**RLS Policies:**
- Participants can read conversations they're part of
- Participants can update conversations they're part of
- Admins can read all conversations
- Admins can update any conversation
- Service role bypass

**Relationships:**
- Many-to-one with profiles (assigned to)
- Many-to-one with property_bookings
- Many-to-one with properties
- Many-to-one with payments
- One-to-many with conversation_participants
- One-to-many with messages

---

### 3.17 conversation_participants

**Purpose:** Conversation participants

**Schema:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Participant identifier |
| conversation_id | UUID | FK to conversations, NOT NULL | Conversation reference |
| user_id | UUID | FK to profiles, NOT NULL | User reference |
| role | TEXT | NOT NULL, DEFAULT 'participant' | Participant role |
| is_muted | BOOLEAN | NOT NULL, DEFAULT FALSE | Mute status |
| last_read_at | TIMESTAMPTZ | | Last read timestamp |
| joined_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Join timestamp |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `conversation_participants_conversation_id_idx` (conversation_id)
- `conversation_participants_user_id_idx` (user_id)
- `conversation_participants_conversation_user_unique` (conversation_id, user_id) - UNIQUE

**RLS Policies:**
- Users can read own participation records
- Users can update own participation records
- Service role can insert participants
- Admins can read all participants
- Service role bypass

**Relationships:**
- Many-to-one with conversations
- Many-to-one with profiles (user)

---

### 3.18 messages

**Purpose:** Messages within conversations

**Schema:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Message identifier |
| conversation_id | UUID | FK to conversations, NOT NULL | Conversation reference |
| sender_id | UUID | FK to profiles, NOT NULL | Sender user |
| content | TEXT | NOT NULL | Message content |
| content_type | message_content_type | NOT NULL, DEFAULT 'text' | Content type |
| metadata | JSONB | | Additional metadata |
| is_internal | BOOLEAN | NOT NULL, DEFAULT FALSE | Internal note flag |
| reply_to_id | UUID | FK to messages | Reply to message |
| deleted_at | TIMESTAMPTZ | | Soft delete timestamp |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `messages_conversation_id_idx` (conversation_id)
- `messages_sender_id_idx` (sender_id)
- `messages_created_at_idx` (created_at)
- `messages_search_vector` (TSVECTOR) - Full-text search

**RLS Policies:**
- Participants can read messages in their conversations
- Participants can insert messages in their conversations
- Participants can update own messages
- Participants can soft delete own messages
- Admins can read all messages
- Admins can update any message
- Service role bypass

**Relationships:**
- Many-to-one with conversations
- Many-to-one with profiles (sender)
- Many-to-one with messages (reply_to)
- One-to-many with message_attachments

**Triggers:**
- `messages_search_vector_update` - Updates search vector on content changes

---

### 3.19 message_attachments

**Purpose:** Message attachments

**Schema:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Attachment identifier |
| message_id | UUID | FK to messages, NOT NULL | Message reference |
| file_url | TEXT | NOT NULL | File URL |
| file_name | TEXT | NOT NULL | File name |
| file_type | TEXT | NOT NULL | File type |
| file_size | INTEGER | | File size in bytes |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `message_attachments_message_id_idx` (message_id)

**RLS Policies:**
- Participants can read attachments in their conversations
- Participants can insert attachments in their conversations
- Admins can read all attachments
- Service role bypass

**Relationships:**
- Many-to-one with messages

---

## 4. Relationships and Cardinalities

### 4.1 Entity Relationship Summary

**User (profiles):**
- One-to-many with Properties (as owner)
- One-to-many with Property Bookings (as guest)
- Many-to-many with Conversations (as participant)
- One-to-many with Messages (as sender)
- One-to-many with Admin Activity Logs (as admin)
- One-to-many with Payments (as verifier)
- One-to-many with Notifications (as recipient)
- One-to-many with Property Views (as viewer)

**Properties:**
- Many-to-one with Profiles (owner)
- One-to-one with Property Address
- One-to-one with Property Pricing
- One-to-one with Property Features
- One-to-many with Property Images
- One-to-many with Property Reviews
- One-to-many with Property Bookings
- One-to-many with Wishlists
- One-to-many with Property Views
- One-to-many with Booking Date Locks
- Many-to-many with Conversations (via booking_id, property_id)

**Property Bookings:**
- Many-to-one with Properties
- Many-to-one with Profiles (guest)
- Many-to-one with Profiles (cancelled_by)
- One-to-many with Payments
- One-to-many with Booking Date Locks
- Many-to-one with Conversations (via booking_id)

**Payments:**
- Many-to-one with Property Bookings
- Many-to-one with Profiles (verified_by)

**Conversations:**
- Many-to-one with Profiles (assigned_to)
- Many-to-one with Property Bookings
- Many-to-one with Properties
- Many-to-one with Payments
- One-to-many with Conversation Participants
- One-to-many with Messages

**Messages:**
- Many-to-one with Conversations
- Many-to-one with Profiles (sender)
- Many-to-one with Messages (reply_to)
- One-to-many with Message Attachments

### 4.2 Relationship Diagram

```
profiles (1) ──────────────< (N) properties
profiles (1) ──────────────< (N) property_bookings
profiles (1) ──────────────< (N) property_reviews
profiles (1) ──────────────< (N) wishlists
profiles (1) ──────────────< (N) admin_activity_logs
profiles (1) ──────────────< (N) notifications
profiles (1) ──────────────< (N) conversation_participants
profiles (1) ──────────────< (N) messages

properties (1) ──────────────< (1) property_addresses
properties (1) ──────────────< (1) property_pricing
properties (1) ──────────────< (1) property_features
properties (1) ──────────────< (N) property_images
properties (1) ──────────────< (N) property_reviews
properties (1) ──────────────< (N) property_bookings
properties (1) ──────────────< (N) wishlists
properties (1) ──────────────< (N) property_views
properties (1) ──────────────< (N) booking_date_locks

property_bookings (1) ───────< (N) payments
property_bookings (1) ───────< (N) booking_date_locks

conversations (1) ───────────< (N) conversation_participants
conversations (1) ───────────< (N) messages

messages (1) ────────────────< (N) message_attachments
```

---

## 5. Database Views

### 5.1 featured_properties

**Purpose:** Pre-computed view of featured properties

**Definition:**
```sql
SELECT * FROM properties 
WHERE badge = 'featured' 
  AND approval_status = 'approved' 
  AND status = 'available'
  AND deleted_at IS NULL
```

### 5.2 properties_by_city

**Purpose:** Properties grouped by city

**Definition:**
```sql
SELECT 
  pa.city,
  COUNT(*) as property_count
FROM properties p
JOIN property_addresses pa ON p.id = pa.property_id
WHERE p.approval_status = 'approved'
  AND p.deleted_at IS NULL
GROUP BY pa.city
```

### 5.3 conversation_list_view

**Purpose:** Simplified conversation list for queries

**Definition:**
```sql
SELECT 
  c.id,
  c.type,
  c.title,
  c.status,
  c.priority,
  c.assigned_to,
  COUNT(cp.user_id) as participant_count,
  MAX(m.created_at) as last_message_at
FROM conversations c
LEFT JOIN conversation_participants cp ON c.id = cp.conversation_id
LEFT JOIN messages m ON c.id = m.conversation_id
WHERE c.deleted_at IS NULL
GROUP BY c.id
```

### 5.4 user_conversations_view

**Purpose:** User-specific conversations with unread counts

**Definition:**
```sql
SELECT 
  c.id,
  c.type,
  c.title,
  c.status,
  c.priority,
  cp.last_read_at,
  COUNT(m.id) FILTER (WHERE m.created_at > cp.last_read_at) as unread_count
FROM conversation_participants cp
JOIN conversations c ON cp.conversation_id = c.id
LEFT JOIN messages m ON c.id = m.conversation_id
WHERE cp.user_id = [user_id]
  AND c.deleted_at IS NULL
GROUP BY c.id, cp.last_read_at
```

---

## 6. Database Functions

### 6.1 Utility Functions

**update_updated_at_column()**
- Purpose: Automatically update `updated_at` timestamp
- Trigger: BEFORE UPDATE on all major tables

**update_property_rating()**
- Purpose: Calculate and update property rating from reviews
- Trigger: AFTER INSERT/UPDATE/DELETE on property_reviews

**messages_search_vector_update()**
- Purpose: Update full-text search vector for messages
- Trigger: BEFORE INSERT/UPDATE on messages

### 6.2 Admin Functions

**log_admin_activity(admin_id, action, entity_type, entity_id, details)**
- Purpose: Log admin actions for audit trail
- Returns: UUID (log ID)
- Audit logging included

**approve_property(property_id, admin_id, notes)**
- Purpose: Approve property listing
- Returns: BOOLEAN
- Updates property status and logs activity

**reject_property(property_id, admin_id, reason)**
- Purpose: Reject property listing
- Returns: BOOLEAN
- Updates property status and logs activity

**suspend_property(property_id, admin_id, reason)**
- Purpose: Suspend property listing
- Returns: BOOLEAN
- Updates property status and logs activity

**soft_delete_property(property_id, admin_id)**
- Purpose: Soft delete property
- Returns: BOOLEAN
- Sets deleted_at timestamp and logs activity

**ban_user(user_id, admin_id, reason)**
- Purpose: Ban user
- Returns: BOOLEAN
- Updates user status and logs activity

**unban_user(user_id, admin_id)**
- Purpose: Unban user
- Returns: BOOLEAN
- Updates user status and logs activity

**verify_host(user_id, admin_id, notes)**
- Purpose: Verify host
- Returns: BOOLEAN
- Updates verification status and logs activity

**verify_payment(payment_id, admin_id, notes)**
- Purpose: Verify payment
- Returns: BOOLEAN
- Updates payment status and logs activity

**reject_payment(payment_id, admin_id, reason)**
- Purpose: Reject payment
- Returns: BOOLEAN
- Updates payment status and logs activity

### 6.3 Payment Functions

**create_local_wallet_payment(booking_id, payment_provider, payment_method, wallet_phone)**
- Purpose: Create wallet payment record
- Returns: payment record
- Validates booking and phone number

### 6.4 Messaging Functions

**create_conversation(type, title, metadata)**
- Purpose: Create new conversation
- Returns: conversation ID

**add_conversation_participant(conversation_id, user_id, role)**
- Purpose: Add participant to conversation
- Returns: participant ID

**send_message(conversation_id, sender_id, content, content_type, metadata)**
- Purpose: Send message in conversation
- Returns: message ID

**mark_conversation_read(conversation_id, user_id)**
- Purpose: Mark conversation as read for user
- Returns: BOOLEAN

**get_unread_count(user_id)**
- Purpose: Get unread message count for user
- Returns: INTEGER

---

## 7. Database Triggers

### 7.1 Timestamp Triggers

**update_updated_at_column**
- Tables: All major tables
- Timing: BEFORE UPDATE
- Action: Set updated_at = NOW()

### 7.2 Business Logic Triggers

**update_property_rating**
- Table: property_reviews
- Timing: AFTER INSERT, UPDATE, DELETE
- Action: Recalculate property average rating

**messages_search_vector_update**
- Table: messages
- Timing: BEFORE INSERT, UPDATE
- Action: Update full-text search vector

---

## 8. Storage Buckets

### 8.1 property-images

**Purpose:** Store property listing images

**RLS Policies:**
- Public: SELECT (read all images)
- Authenticated: INSERT (upload images)
- Authenticated: DELETE (delete own images)

**File Organization:**
- Path pattern: `{property_id}/{timestamp}.{extension}`

### 8.2 avatars

**Purpose:** Store user avatar images

**RLS Policies:**
- Public: SELECT (read all avatars)
- Authenticated: INSERT (upload own avatar)
- Authenticated: DELETE (delete own avatar)

**File Organization:**
- Path pattern: `{user_id}/avatar-{timestamp}.{extension}`

---

## 9. Indexing Strategy

### 9.1 Foreign Key Indexes

All foreign key columns are indexed for join performance:
- owner_id, guest_id, user_id, property_id, booking_id, etc.

### 9.2 Query Pattern Indexes

**Property Queries:**
- type, status, approval_status, created_at
- city, country (via property_addresses)

**Booking Queries:**
- property_id, guest_id, status, check_in, check_out

**Payment Queries:**
- booking_id, status, created_at

**Messaging Queries:**
- conversation_id, sender_id, created_at

**Admin Queries:**
- admin_id, entity_type, entity_id, created_at

### 9.3 Unique Constraints

- profiles.email
- properties.slug
- payments.provider_reference
- wishlists (user_id, property_id)
- booking_date_locks (property_id, date)
- conversation_participants (conversation_id, user_id)

---

## 10. Data Integrity

### 10.1 Constraints

**Foreign Keys:** All relationships enforced via foreign keys

**Check Constraints:**
- property_reviews.rating: CHECK(rating >= 1 AND rating <= 5)

**Not Null Constraints:** Critical fields have NOT NULL constraints

**Unique Constraints:** Prevent duplicate records

### 10.2 Soft Deletes

Soft delete pattern applied to:
- profiles
- properties
- property_bookings
- payments
- conversations
- messages

Pattern: `deleted_at TIMESTAMPTZ` - NULL means active, timestamp means deleted

### 10.3 Cascade Behavior

**Cascade Delete:** Not used (soft delete pattern instead)

**Restrict Delete:** Used for critical relationships to prevent orphaned records

---

## 11. Performance Considerations

### 11.1 Query Optimization

**Selective Queries:** Always select specific columns, avoid SELECT *

**Pagination:** Use LIMIT/OFFSET for large result sets

**Joins:** Use indexed columns for join conditions

**Views:** Materialized views for expensive aggregations (to be implemented)

### 11.2 Connection Pooling

Managed by Supabase automatically based on plan tier

### 11.3 Read Replicas

Available on higher Supabase tiers for read scaling

---

## 12. Security

### 12.1 Row-Level Security

**Enabled On:** All tables

**Policy Pattern:**
- Public read for approved/active data
- User-specific read for own data
- Role-based access for admin operations
- Service role bypass for system operations

### 12.2 Data Encryption

- Data at rest encrypted by Supabase
- Data in transit via TLS/SSL

### 12.3 Audit Logging

All admin actions logged to `admin_activity_logs` table

---

## 13. Backup and Recovery

### 13.1 Backup Strategy

- Daily automated backups by Supabase
- Point-in-time recovery available
- 7-day retention (configurable)

### 13.2 Recovery Process

- Restore from Supabase dashboard
- Point-in-time recovery for specific timestamp
- Data export capability

---

## 14. Migration History

### 14.1 Migration Files

1. `20240502_gurigate_properties_schema.sql` - Core property schema
2. `20240502_payments_flow.sql` - Payment system
3. `20260508_admin_role_system.sql` - Admin and RBAC
4. `20260529_messaging_system.sql` - Messaging system

### 14.2 Migration Best Practices

- Each migration is timestamped
- Migrations are sequential and irreversible
- Schema changes are version-controlled
- Rollback capability through reversal migrations

---

## 15. Documentation References

**Related Documents:**
- Backend Architecture Document
- Business Logic Documentation
- Security Documentation
- ERD (Entity Relationship Diagram)

**Code References:**
- `supabase/migrations/` - Migration files
- Database schema in Supabase dashboard

---

**End of Database Documentation**
