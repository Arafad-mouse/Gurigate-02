# GuriGate API Documentation

**Version:** 1.0  
**Date:** June 2, 2026  
**Status:** Production

---

## Executive Summary

GuriGate uses Supabase as its backend-as-a-service, providing RESTful API access to PostgreSQL database, authentication, storage, and real-time subscriptions. The API layer is primarily accessed through the Supabase client SDK, with custom RPC functions for complex operations.

**API Type:** RESTful via Supabase  
**Authentication:** JWT via Supabase Auth  
**Base URL:** https://hjhpdzmsfpkiewzibrtr.supabase.co  
**Rate Limiting:** Supabase default limits  

---

## Authentication API

### Sign Up

**Endpoint:** `POST /auth/v1/signup`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "options": {
    "data": {
      "first_name": "John",
      "last_name": "Doe"
    }
  }
}
```

**Response:**
```json
{
  "access_token": "jwt_token_here",
  "refresh_token": "refresh_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "user_metadata": {}
  }
}
```

### Sign In

**Endpoint:** `POST /auth/v1/token?grant_type=password`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "access_token": "jwt_token_here",
  "refresh_token": "refresh_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

### Sign Out

**Endpoint:** `POST /auth/v1/logout`

**Headers:**
```
Authorization: Bearer {access_token}
```

### Get Session

**Endpoint:** `GET /auth/v1/user`

**Headers:**
```
Authorization: Bearer {access_token}
```

---

## Database API (RESTful)

### Properties

**Get All Properties**
- **Endpoint:** `GET /rest/v1/properties`
- **Query Params:** `approval_status`, `status`, `city`, `limit`, `offset`
- **Auth:** Required for private data

**Get Property by ID**
- **Endpoint:** `GET /rest/v1/properties?id=eq.{id}`
- **Auth:** Required

**Create Property**
- **Endpoint:** `POST /rest/v1/properties`
- **Auth:** Required
- **Body:** Property object

**Update Property**
- **Endpoint:** `PATCH /rest/v1/properties?id=eq.{id}`
- **Auth:** Required (owner or admin)

**Delete Property**
- **Endpoint:** `PATCH /rest/v1/properties?id=eq.{id}`
- **Auth:** Required (soft delete)

### Bookings

**Get Bookings**
- **Endpoint:** `GET /rest/v1/bookings`
- **Query Params:** `guest_id`, `host_id`, `status`, `check_in`, `check_out`
- **Auth:** Required

**Create Booking**
- **Endpoint:** `POST /rest/v1/bookings`
- **Auth:** Required

**Update Booking**
- **Endpoint:** `PATCH /rest/v1/bookings?id=eq.{id}`
- **Auth:** Required (guest, host, or admin)

**Cancel Booking**
- **Endpoint:** `PATCH /rest/v1/bookings?id=eq.{id}`
- **Auth:** Required

### Payments

**Get Payments**
- **Endpoint:** `GET /rest/v1/payments`
- **Query Params:** `booking_id`, `payer_id`, `status`, `payment_provider`
- **Auth:** Required

**Create Payment**
- **Endpoint:** `POST /rest/v1/payments`
- **Auth:** Required

**Verify Payment**
- **RPC Function:** `verify_payment(payment_id, admin_id)`
- **Auth:** Admin required

### Messages

**Get Conversations**
- **Endpoint:** `GET /rest/v1/conversations`
- **Query Params:** `type`, `status`, `priority`
- **Auth:** Required

**Get Messages**
- **Endpoint:** `GET /rest/v1/messages`
- **Query Params:** `conversation_id`
- **Auth:** Required

**Send Message**
- **RPC Function:** `send_message(conversation_id, sender_id, content, is_internal)`
- **Auth:** Required

**Create Conversation**
- **RPC Function:** `create_conversation(type, subject, created_by, related_booking_id, related_property_id, related_payment_id)`
- **Auth:** Required

---

## RPC Functions

### Admin Functions

**approve_property**
- **Purpose:** Approve a property listing
- **Parameters:**
  - `p_property_id` (UUID)
  - `p_admin_id` (UUID)
- **Returns:** Updated property record
- **Auth:** Admin required
- **Audit:** Creates audit log entry

**reject_property**
- **Purpose:** Reject a property listing
- **Parameters:**
  - `p_property_id` (UUID)
  - `p_admin_id` (UUID)
  - `p_reason` (TEXT)
- **Returns:** Updated property record
- **Auth:** Admin required
- **Audit:** Creates audit log entry

**suspend_property**
- **Purpose:** Suspend an approved property
- **Parameters:**
  - `p_property_id` (UUID)
  - `p_admin_id` (UUID)
  - `p_reason` (TEXT)
- **Returns:** Updated property record
- **Auth:** Admin required
- **Audit:** Creates audit log entry

**verify_payment**
- **Purpose:** Verify a payment transaction
- **Parameters:**
  - `p_payment_id` (UUID)
  - `p_admin_id` (UUID)
- **Returns:** Updated payment record
- **Auth:** Admin required
- **Audit:** Creates audit log entry

**ban_user**
- **Purpose:** Ban a user from the platform
- **Parameters:**
  - `p_user_id` (UUID)
  - `p_admin_id` (UUID)
  - `p_reason` (TEXT)
- **Returns:** Updated user profile
- **Auth:** Admin required
- **Audit:** Creates audit log entry

**unban_user**
- **Purpose:** Unban a user
- **Parameters:**
  - `p_user_id` (UUID)
  - `p_admin_id` (UUID)
- **Returns:** Updated user profile
- **Auth:** Admin required
- **Audit:** Creates audit log entry

**verify_host**
- **Purpose:** Verify a host account
- **Parameters:**
  - `p_user_id` (UUID)
  - `p_admin_id` (UUID)
- **Returns:** Updated user profile
- **Auth:** Admin required
- **Audit:** Creates audit log entry

### Payment Functions

**create_local_wallet_payment**
- **Purpose:** Create a wallet payment record
- **Parameters:**
  - `p_booking_id` (UUID)
  - `p_payment_provider` (TEXT) - zaad, edahab, premier, wadaag
  - `p_payment_method` (TEXT)
  - `p_wallet_phone` (TEXT)
  - `p_fallback_amount` (DECIMAL)
  - `p_fallback_currency` (TEXT)
- **Returns:** Payment record
- **Auth:** Required
- **Validation:** Phone number format validation

### Messaging Functions

**create_conversation**
- **Purpose:** Create a new conversation
- **Parameters:**
  - `p_type` (TEXT)
  - `p_subject` (TEXT)
  - `p_created_by` (UUID)
  - `p_related_booking_id` (UUID, optional)
  - `p_related_property_id` (UUID, optional)
  - `p_related_payment_id` (UUID, optional)
- **Returns:** Conversation record
- **Auth:** Required
- **Side Effects:** Creates participant records

**send_message**
- **Purpose:** Send a message in a conversation
- **Parameters:**
  - `p_conversation_id` (UUID)
  - `p_sender_id` (UUID)
  - `p_content` (TEXT)
  - `p_is_internal` (BOOLEAN)
- **Returns:** Message record
- **Auth:** Required
- **Side Effects:** Updates conversation timestamp

**get_conversation_context**
- **Purpose:** Get context data for a conversation
- **Parameters:**
  - `p_conversation_id` (UUID)
- **Returns:** Context object with related data
- **Auth:** Required

---

## Real-time Subscriptions

### Subscribe to Table Changes

**Subscribe to Messages**
```javascript
const subscription = supabase
  .channel('messages')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'messages' },
    (payload) => console.log('New message:', payload)
  )
  .subscribe()
```

**Subscribe to Conversations**
```javascript
const subscription = supabase
  .channel('conversations')
  .on('postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'conversations' },
    (payload) => console.log('Conversation updated:', payload)
  )
  .subscribe()
```

### Presence Channels

**Join Conversation Presence**
```javascript
const channel = supabase.channel('conversation_123')
channel.on('presence', { event: 'sync' }, () => {
  const state = channel.presenceState()
  console.log('Online users:', state)
})
channel.subscribe(async (status) => {
  if (status === 'SUBSCRIBED') {
    await channel.track({
      user_id: 'user-123',
      online_at: new Date().toISOString()
    })
  }
})
```

---

## Storage API

### Upload File

**Endpoint:** `POST /storage/v1/object/{bucket}/{path}`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: {mime_type}
```

**Request:** Binary file data

**Response:**
```json
{
  "Key": "path/to/file.jpg",
  "ETag": "etag_value"
}
```

### Get Public URL

**Endpoint:** `GET /storage/v1/object/public/{bucket}/{path}`

### Delete File

**Endpoint:** `DELETE /storage/v1/object/{bucket}/{path}`

**Headers:**
```
Authorization: Bearer {access_token}
```

---

## Error Handling

### Error Response Format

```json
{
  "message": "Error description",
  "details": "Additional error details",
  "hint": "Suggestion for fixing the error",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

- **PGRST116:** Not found
- **PGRST301:** JWT expired
- **PGRST302:** Invalid API key
- **23505:** Unique constraint violation
- **23503:** Foreign key constraint violation
- **42501:** Insufficient privilege (RLS violation)

---

## Rate Limiting

**Default Limits (Supabase):**
- Free tier: 500 requests/hour
- Pro tier: 100,000 requests/hour
- Enterprise: Custom limits

**Best Practices:**
- Implement client-side caching
- Use pagination for large datasets
- Batch requests when possible
- Implement exponential backoff for retries

---

## SDK Usage Examples

### JavaScript/TypeScript

**Initialize Client**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://hjhpdzmsfpkiewzibrtr.supabase.co',
  'your-anon-key'
)
```

**Query with Filters**
```typescript
const { data, error } = await supabase
  .from('properties')
  .select('*')
  .eq('approval_status', 'approved')
  .eq('status', 'available')
  .order('created_at', { ascending: false })
  .limit(10)
```

**Insert Record**
```typescript
const { data, error } = await supabase
  .from('bookings')
  .insert({
    property_id: 'property-uuid',
    guest_id: 'guest-uuid',
    check_in: '2026-06-01',
    check_out: '2026-06-05',
    total_price: 500,
    currency: 'USD'
  })
```

**Call RPC Function**
```typescript
const { data, error } = await supabase
  .rpc('approve_property', {
    p_property_id: 'property-uuid',
    p_admin_id: 'admin-uuid'
  })
```

---

## Service Layer API

### AdminService

**getDashboardKPIs()**
- Returns dashboard statistics
- No parameters required
- Returns: DashboardKPIs object

**getAllProperties(filters)**
- Get all properties with optional filters
- Parameters: search query, status filter, pagination
- Returns: Array of AdminProperty objects

**approveProperty(propertyId)**
- Approve a property
- Parameters: propertyId (UUID)
- Returns: Updated property

**rejectProperty(propertyId, reason)**
- Reject a property
- Parameters: propertyId (UUID), reason (string)
- Returns: Updated property

### PaymentService

**createWalletPayment(input)**
- Create a wallet payment
- Parameters: bookingId, method, walletPhone, fallbackAmount
- Returns: PaymentRecord

**createDodoCheckout(input)**
- Create Dodo checkout session
- Parameters: bookingId, amount, currency, returnUrl
- Returns: DodoCheckoutSession

### MessagingService

**getConversations(filters)**
- Get user conversations
- Parameters: type, status, priority filters
- Returns: Array of ConversationListItem objects

**getMessages(conversationId)**
- Get messages in a conversation
- Parameters: conversationId (UUID)
- Returns: Array of Message objects

**sendMessage(conversationId, content, isInternal)**
- Send a message
- Parameters: conversationId, content, isInternal flag
- Returns: Message object

---

## Webhooks (Planned)

### Dodo Payment Webhook

**Endpoint:** `/api/webhooks/dodo/payment`

**Events:**
- payment.completed
- payment.failed
- payment.refunded

**Security:** HMAC signature verification required

---

## API Versioning

**Current Version:** v1  
**Version Strategy:** URL-based versioning  
**Backward Compatibility:** Maintained for major versions  
**Deprecation Policy:** 6-month notice for breaking changes

---

## Testing API Endpoints

### Using Supabase Dashboard

1. Navigate to API section in Supabase dashboard
2. Use built-in API explorer
3. Test endpoints with SQL editor

### Using cURL

```bash
curl -X POST 'https://hjhpdzmsfpkiewzibrtr.supabase.co/auth/v1/token?grant_type=password' \
  -H 'apikey: your-anon-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "user@example.com",
    "password": "password"
  }'
```

---

**Document Owner:** Development Team  
**Last Updated:** June 2, 2026  
**Next Review:** After API changes
