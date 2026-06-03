# GuriGate API Documentation

**Document Version:** 1.0  
**Date:** June 2, 2026  
**Author:** System Architecture Team

---

## 1. Overview

This document provides comprehensive API documentation for the GuriGate platform, covering all Supabase API endpoints, RPC functions, and Edge Functions.

### API Architecture

GuriGate uses Supabase as its backend, providing:
- **REST API:** Direct database access via Supabase REST API
- **RPC Functions:** Custom server-side logic
- **Edge Functions:** Deno-based serverless functions
- **Realtime API:** WebSocket-based real-time updates
- **Storage API:** File upload and management

### Base URLs

- **Supabase URL:** `https://your-project.supabase.co`
- **REST API:** `https://your-project.supabase.co/rest/v1/`
- **Auth API:** `https://your-project.supabase.co/auth/v1/`
- **Storage API:** `https://your-project.supabase.co/storage/v1/`
- **Realtime API:** `wss://your-project.supabase.co/realtime/v1/`

---

## 2. Authentication

### 2.1 Sign Up

Create a new user account.

**Endpoint:** `POST /auth/v1/signup`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "options": {
    "data": {
      "full_name": "John Doe",
      "phone": "+252612345678"
    }
  }
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "your-refresh-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "user_metadata": {
      "full_name": "John Doe"
    }
  }
}
```

### 2.2 Sign In

Authenticate an existing user.

**Endpoint:** `POST /auth/v1/token?grant_type=password`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "your-refresh-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

### 2.3 Sign Out

End the user session.

**Endpoint:** `POST /auth/v1/logout`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{}
```

### 2.4 Get Current User

Get the currently authenticated user.

**Endpoint:** `GET /auth/v1/user`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "user_metadata": {
    "full_name": "John Doe"
  },
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

## 3. Properties API

### 3.1 List Properties

Get a list of properties with optional filters.

**Endpoint:** `GET /rest/v1/properties`

**Query Parameters:**
- `select`: Columns to select (default: `*`)
- `status`: Filter by status (`available`, `rented`, `maintenance`)
- `approval_status`: Filter by approval status (`pending`, `approved`, `rejected`)
- `owner_id`: Filter by owner ID
- `limit`: Maximum number of results (default: 50)
- `offset`: Number of results to skip

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <anon_key>
```

**Example Request:**
```http
GET /rest/v1/properties?select=*&status=available&approval_status=approved&limit=10
```

**Response:**
```json
[
  {
    "id": "uuid",
    "owner_id": "uuid",
    "title": "Modern Apartment",
    "description": "Spacious apartment in downtown",
    "status": "available",
    "approval_status": "approved",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### 3.2 Get Property by ID

Get a specific property by ID.

**Endpoint:** `GET /rest/v1/properties?id=eq.{id}`

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <anon_key>
```

**Response:**
```json
{
  "id": "uuid",
  "owner_id": "uuid",
  "title": "Modern Apartment",
  "description": "Spacious apartment in downtown",
  "status": "available",
  "approval_status": "approved",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### 3.3 Create Property

Create a new property.

**Endpoint:** `POST /rest/v1/properties`

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <anon_key>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Modern Apartment",
  "description": "Spacious apartment in downtown",
  "status": "draft",
  "approval_status": "pending"
}
```

**Response:**
```json
{
  "id": "uuid",
  "owner_id": "uuid",
  "title": "Modern Apartment",
  "description": "Spacious apartment in downtown",
  "status": "draft",
  "approval_status": "pending",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### 3.4 Update Property

Update an existing property.

**Endpoint:** `PATCH /rest/v1/properties?id=eq.{id}`

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <anon_key>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description"
}
```

**Response:**
```json
[
  {
    "id": "uuid",
    "owner_id": "uuid",
    "title": "Updated Title",
    "description": "Updated description",
    "status": "draft",
    "approval_status": "pending",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-02T00:00:00Z"
  }
]
```

### 3.5 Delete Property

Delete a property.

**Endpoint:** `DELETE /rest/v1/properties?id=eq.{id}`

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <anon_key>
```

**Response:**
```json
[]
```

---

## 4. Bookings API

### 4.1 List Bookings

Get a list of bookings.

**Endpoint:** `GET /rest/v1/property_bookings`

**Query Parameters:**
- `select`: Columns to select
- `property_id`: Filter by property ID
- `guest_id`: Filter by guest ID
- `status`: Filter by status (`pending`, `confirmed`, `cancelled`, `completed`)
- `limit`: Maximum number of results
- `offset`: Number of results to skip

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <anon_key>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "property_id": "uuid",
    "guest_id": "uuid",
    "check_in": "2024-01-01",
    "check_out": "2024-01-05",
    "guests": 2,
    "status": "confirmed",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### 4.2 Create Booking

Create a new booking.

**Endpoint:** `POST /rest/v1/property_bookings`

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <anon_key>
Content-Type: application/json
```

**Request Body:**
```json
{
  "property_id": "uuid",
  "check_in": "2024-01-01",
  "check_out": "2024-01-05",
  "guests": 2,
  "status": "pending"
}
```

**Response:**
```json
{
  "id": "uuid",
  "property_id": "uuid",
  "guest_id": "uuid",
  "check_in": "2024-01-01",
  "check_out": "2024-01-05",
  "guests": 2,
  "status": "pending",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### 4.3 Update Booking

Update an existing booking.

**Endpoint:** `PATCH /rest/v1/property_bookings?id=eq.{id}`

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <anon_key>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Response:**
```json
[
  {
    "id": "uuid",
    "property_id": "uuid",
    "guest_id": "uuid",
    "check_in": "2024-01-01",
    "check_out": "2024-01-05",
    "guests": 2,
    "status": "confirmed",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

## 5. Payments API

### 5.1 List Payments

Get a list of payments.

**Endpoint:** `GET /rest/v1/payments`

**Query Parameters:**
- `select`: Columns to select
- `booking_id`: Filter by booking ID
- `user_id`: Filter by user ID
- `status`: Filter by status (`pending`, `processing`, `completed`, `failed`, `refunded`)
- `limit`: Maximum number of results

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <anon_key>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "booking_id": "uuid",
    "user_id": "uuid",
    "amount": 100.00,
    "currency": "USD",
    "payment_method": "card",
    "external_provider": "dodo",
    "status": "completed",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### 5.2 Create Payment

Create a new payment record.

**Endpoint:** `POST /rest/v1/payments`

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <anon_key>
Content-Type: application/json
```

**Request Body:**
```json
{
  "booking_id": "uuid",
  "amount": 100.00,
  "currency": "USD",
  "payment_method": "card",
  "external_provider": "dodo",
  "status": "pending"
}
```

**Response:**
```json
{
  "id": "uuid",
  "booking_id": "uuid",
  "user_id": "uuid",
  "amount": 100.00,
  "currency": "USD",
  "payment_method": "card",
  "external_provider": "dodo",
  "status": "pending",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

## 6. Messaging API

### 6.1 List Conversations

Get a list of conversations for the current user.

**Endpoint:** `GET /rest/v1/conversations`

**Query Parameters:**
- `select`: Columns to select
- `limit`: Maximum number of results

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <anon_key>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "initiated_by": "uuid",
    "entity_type": "booking",
    "entity_id": "uuid",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### 6.2 Get Conversation Messages

Get messages for a specific conversation.

**Endpoint:** `GET /rest/v1/messages?conversation_id=eq.{conversation_id}`

**Query Parameters:**
- `select`: Columns to select
- `order`: Sort order (default: `created_at.asc`)

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <anon_key>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "conversation_id": "uuid",
    "sender_id": "uuid",
    "content": "Hello, I have a question",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

## 7. RPC Functions

### 7.1 approve_property

Approve a property for listing.

**Endpoint:** `POST /rest/v1/rpc/approve_property`

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <anon_key>
Content-Type: application/json
```

**Request Body:**
```json
{
  "property_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Property approved successfully"
}
```

### 7.2 reject_property

Reject a property.

**Endpoint:** `POST /rest/v1/rpc/reject_property`

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <anon_key>
Content-Type: application/json
```

**Request Body:**
```json
{
  "property_id": "uuid",
  "reason": "Insufficient information"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Property rejected successfully"
}
```

### 7.3 ban_user

Ban a user from the platform.

**Endpoint:** `POST /rest/v1/rpc/ban_user`

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <anon_key>
Content-Type: application/json
```

**Request Body:**
```json
{
  "user_id": "uuid",
  "reason": "Violation of terms"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User banned successfully"
}
```

### 7.4 verify_host

Verify a host account.

**Endpoint:** `POST /rest/v1/rpc/verify_host`

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <anon_key>
Content-Type: application/json
```

**Request Body:**
```json
{
  "user_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Host verified successfully"
}
```

### 7.5 verify_payment

Verify a wallet payment.

**Endpoint:** `POST /rest/v1/rpc/verify_payment`

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <anon_key>
Content-Type: application/json
```

**Request Body:**
```json
{
  "payment_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "booking_id": "uuid"
}
```

### 7.6 create_conversation

Create a new conversation.

**Endpoint:** `POST /rest/v1/rpc/create_conversation`

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <anon_key>
Content-Type: application/json
```

**Request Body:**
```json
{
  "entity_type": "booking",
  "entity_id": "uuid",
  "participant_ids": ["uuid1", "uuid2"]
}
```

**Response:**
```json
{
  "success": true,
  "conversation_id": "uuid"
}
```

### 7.7 send_message

Send a message in a conversation.

**Endpoint:** `POST /rest/v1/rpc/send_message`

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <anon_key>
Content-Type: application/json
```

**Request Body:**
```json
{
  "conversation_id": "uuid",
  "content": "Hello, how are you?"
}
```

**Response:**
```json
{
  "success": true,
  "message_id": "uuid"
}
```

---

## 8. Edge Functions

### 8.1 create-dodo-checkout

Create a Dodo payment checkout session.

**Endpoint:** `POST /functions/v1/create-dodo-checkout`

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <anon_key>
Content-Type: application/json
```

**Request Body:**
```json
{
  "booking_id": "uuid",
  "amount": 100.00,
  "currency": "USD",
  "return_url": "https://your-app.com/payment/return",
  "cancel_url": "https://your-app.com/payment/cancel"
}
```

**Response:**
```json
{
  "success": true,
  "checkout_url": "https://checkout.dodopayments.com/checkout/xxx",
  "checkout_id": "xxx"
}
```

---

## 9. Storage API

### 9.1 Upload File

Upload a file to storage.

**Endpoint:** `POST /storage/v1/object/{bucket}/{path}`

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <anon_key>
Content-Type: <file-mime-type>
Content-Disposition: attachment; filename="{filename}"
```

**Request Body:**
Binary file data

**Response:**
```json
{
  "Key": "property-images/uuid/filename.jpg"
}
```

### 9.2 Get Public URL

Get a public URL for a file.

**Endpoint:** `POST /storage/v1/object/sign/{bucket}/{path}`

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <anon_key>
Content-Type: application/json
```

**Request Body:**
```json
{
  "expiresIn": 3600
}
```

**Response:**
```json
{
  "signedURL": "https://your-project.supabase.co/storage/v1/object/sign/..."
}
```

### 9.3 Delete File

Delete a file from storage.

**Endpoint:** `DELETE /storage/v1/object/{bucket}/{path}`

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <anon_key>
```

**Response:**
```json
{}
```

---

## 10. Realtime API

### 10.1 Subscribe to Table Changes

Subscribe to real-time updates for a table.

**WebSocket URL:** `wss://your-project.supabase.co/realtime/v1/`

**Subscription Payload:**
```json
{
  "topic": "realtime:public:conversations",
  "event": "phx_join",
  "payload": {
    "config": {
      "broadcast": {
        "self": true
      },
      "presence": {
        "key": ""
      }
    }
  },
  "ref": "1"
}
```

**Response:**
```json
{
  "event": "phx_reply",
  "payload": {
    "response": {},
    "status": "ok"
  },
  "ref": "1"
}
```

---

## 11. Error Responses

### 11.1 Error Format

All errors follow this format:

```json
{
  "error": "Error message",
  "code": "error_code",
  "details": {},
  "hint": "Additional information"
}
```

### 11.2 Common Error Codes

- **400 Bad Request:** Invalid request parameters
- **401 Unauthorized:** Invalid or missing authentication
- **403 Forbidden:** Insufficient permissions
- **404 Not Found:** Resource not found
- **409 Conflict:** Resource already exists
- **422 Unprocessable Entity:** Validation error
- **429 Too Many Requests:** Rate limit exceeded
- **500 Internal Server Error:** Server error

---

## 12. Rate Limiting

Rate limits are enforced to prevent abuse:

- **Anonymous requests:** 100 requests per hour
- **Authenticated requests:** 1000 requests per hour
- **RPC functions:** 500 requests per hour

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1609459200
```

---

## 13. Pagination

Large result sets are paginated using limit and offset:

**Request:**
```http
GET /rest/v1/properties?limit=20&offset=0
```

**Response Headers:**
```
Content-Range: 0-19/100
```

**Response:**
```json
[
  // 20 properties
]
```

---

## 14. Filtering and Sorting

### 14.1 Filtering

Use filter operators to refine queries:

```http
GET /rest/v1/properties?status=eq.available&approval_status=eq.approved
```

**Operators:**
- `eq`: Equals
- `neq`: Not equals
- `gt`: Greater than
- `gte`: Greater than or equal
- `lt`: Less than
- `lte`: Less than or equal
- `like`: Pattern matching
- `ilike`: Case-insensitive pattern matching
- `in`: In array
- `is`: Is null

### 14.2 Sorting

Sort results using the `order` parameter:

```http
GET /rest/v1/properties?order=created_at.desc
```

**Format:** `{column}.{direction}`

**Directions:** `asc`, `desc`

---

## 15. Relationships

Use the `select` parameter to fetch related data:

```http
GET /rest/v1/properties?select=*,property_addresses(*),property_pricing(*)
```

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Modern Apartment",
    "property_addresses": [
      {
        "id": "uuid",
        "city": "Hargeisa",
        "country": "Somaliland"
      }
    ],
    "property_pricing": [
      {
        "id": "uuid",
        "price_per_night": 50.00
      }
    ]
  }
]
```

---

## 16. SDK Usage

### 16.1 JavaScript/TypeScript

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Query properties
const { data, error } = await supabase
  .from('properties')
  .select('*')
  .eq('status', 'available')
  .order('created_at', { ascending: false });

// Call RPC function
const { data, error } = await supabase
  .rpc('approve_property', { property_id: 'uuid' });
```

---

## 17. Security Considerations

### 17.1 Authentication

- Always include valid JWT in Authorization header
- Use service role key only in secure backend
- Rotate tokens regularly
- Implement token refresh logic

### 17.2 Authorization

- RLS policies enforce data access
- Check permissions before operations
- Use RPC functions for complex authorization
- Log all admin actions

### 17.3 Input Validation

- Validate all input parameters
- Sanitize user-generated content
- Use parameterized queries
- Implement rate limiting

---

## 18. Best Practices

### 18.1 Performance

- Use select to fetch only needed columns
- Implement pagination for large datasets
- Use indexes for frequently queried columns
- Cache frequently accessed data
- Use real-time subscriptions efficiently

### 18.2 Error Handling

- Always check for errors
- Implement retry logic for transient failures
- Log errors for debugging
- Provide meaningful error messages to users

### 18.3 Security

- Never expose service role keys
- Validate all inputs
- Use HTTPS in production
- Implement rate limiting
- Monitor API usage

---

## 19. Documentation References

**Related Documents:**
- Backend Architecture Document
- Security Documentation
- RBAC Documentation
- Database Documentation

**External Resources:**
- Supabase API Documentation: https://supabase.com/docs/reference/javascript
- Supabase REST API: https://supabase.com/docs/reference/rest
- Supabase RPC: https://supabase.com/docs/reference/rpc

---

**End of API Documentation**
