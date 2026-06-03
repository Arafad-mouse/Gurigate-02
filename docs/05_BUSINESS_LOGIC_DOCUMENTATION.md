# GuriGate Business Logic Documentation

**Document Version:** 1.0  
**Date:** June 2, 2026  
**Author:** System Architecture Team

---

## 1. Overview

This document describes the business logic and processes that govern the GuriGate platform. It covers all major business flows including authentication, property management, booking, payments, customer management, and administrative operations.

---

## 2. Authentication Flow

### 2.1 User Registration

**Flow:**

1. **User Input:**
   - Email address
   - Password
   - First name
   - Last name
   - Role (optional, defaults to 'guest')

2. **Validation:**
   - Email format validation
   - Password strength requirements (Supabase Auth)
   - Required field validation

3. **Registration Process:**
   - Call `signUpWithEmail()` from `authService.ts`
   - Supabase Auth creates user in `auth.users`
   - User metadata stores: first_name, last_name, full_name, role
   - Trigger creates profile record in `profiles` table
   - Email verification sent (if enabled)

4. **Response:**
   - Success: User created, session established
   - Error: Invalid input, email already exists

**Database Impact:**
- Insert into `auth.users`
- Insert into `profiles` (via trigger)
- Role defaults to 'guest'

**Security Considerations:**
- Password hashed by Supabase Auth
- Email verification recommended
- Rate limiting on registration attempts

---

### 2.2 User Login

**Flow:**

1. **User Input:**
   - Email address
   - Password

2. **Validation:**
   - Email format validation
   - Password not empty

3. **Login Process:**
   - Call `signInWithEmail()` from `authService.ts`
   - Supabase Auth validates credentials
   - JWT token generated
   - Session stored in browser
   - Profile hydrated from `profiles` table

4. **Response:**
   - Success: Session established, profile loaded
   - Error: Invalid credentials, user not found, account banned

**Database Impact:**
- Read from `auth.users`
- Read from `profiles`
- Update last login timestamp (if implemented)

**Security Considerations:**
- Password verification by Supabase Auth
- JWT token with expiration
- Check `is_banned` flag before allowing access

---

### 2.3 Session Management

**Flow:**

1. **Session Initialization:**
   - `AuthProvider` subscribes to Supabase auth state changes
   - On mount, check for existing session
   - Hydrate profile from database

2. **Session Refresh:**
   - JWT token automatically refreshed by Supabase
   - AuthProvider updates context on refresh
   - UI updates reactively

3. **Session Termination:**
   - User calls `signOutUser()`
   - Supabase invalidates session
   - AuthProvider clears context
   - Redirect to login page

**Security Considerations:**
- JWT tokens have expiration
- Secure token storage
- Session invalidation on logout

---

### 2.4 Profile Management

**Flow:**

1. **Profile Update:**
   - User calls `updateProfile()` from `authService.ts`
   - Validate input data
   - Update `auth.users` metadata
   - Update `profiles` table
   - Upload new avatar if provided
   - Hydrate updated profile

2. **Password Change:**
   - User calls `updatePassword()` from `authService.ts`
   - Validate new password strength
   - Update via Supabase Auth
   - Re-authentication required

**Database Impact:**
- Update `auth.users` metadata
- Update `profiles` table
- Upload to storage bucket (avatars)

---

## 3. Property Lifecycle

### 3.1 Property Creation

**Flow:**

1. **Host Onboarding:**
   - Multi-step wizard (17 steps)
   - Steps: Property type, title, location, basics, occupants, bathrooms, amenities, highlights, safety, photos, booking settings, final details
   - Validation at each step
   - Progress saved in state

2. **Property Submission:**
   - All required fields completed
   - Images uploaded to storage
   - Property created in database
   - Status set to 'draft'

3. **Database Insert:**
   - Insert into `properties` table
   - Insert into `property_addresses`
   - Insert into `property_pricing`
   - Insert into `property_features`
   - Insert into `property_images` (multiple)
   - Generate slug from title

**Validation Rules:**
- Title: Required, min 10 characters
- Description: Required, min 50 characters
- Address: All fields required
- Pricing: Base price required, positive
- Features: Bedrooms, bathrooms, max guests required
- Images: At least 1 image required, max 20
- Phone numbers: Format validation

**Database Impact:**
- Insert into 5+ tables
- Upload images to storage
- Generate unique slug

---

### 3.2 Property Approval Workflow

**Flow:**

1. **Draft to Pending:**
   - Host submits property for review
   - Status changes from 'draft' to 'pending'
   - Admin notified (future feature)

2. **Admin Review:**
   - Admin views pending properties in dashboard
   - Reviews property details, images, pricing
   - Checks compliance with guidelines

3. **Approval Decision:**

   **Approve:**
   - Call `approve_property()` RPC function
   - Status changes to 'approved'
   - Set `approved_by` and `approved_at`
   - Property becomes visible to public
   - Host notified (future feature)
   - Activity logged

   **Reject:**
   - Call `reject_property()` RPC function
   - Status changes to 'rejected'
   - Set `rejection_reason`
   - Property not visible to public
   - Host notified with reason (future feature)
   - Activity logged

4. **Appeal Process:**
   - Host can update and resubmit rejected properties
   - Status resets to 'pending'
   - New review cycle

**Validation Rules:**
- Only admins can approve/reject
- Must provide rejection reason
- Property must be in 'pending' status
- Admin must have `can_approve_property` permission

**Database Impact:**
- Update `properties` table
- Insert into `admin_activity_logs`
- Trigger notifications (future)

---

### 3.3 Property Status Transitions

**Valid Transitions:**

```
draft → pending → approved → active
                     ↓
                  rejected → pending (resubmit)

approved → suspended → approved (unsuspend)
approved → archived (permanent)

active → occupied (when booked)
occupied → available (when booking completed)
active → maintenance → available
```

**Status Descriptions:**

- **draft:** Property being created, not submitted for review
- **pending:** Submitted for admin review
- **approved:** Admin approved, ready to go live
- **active:** Property visible and bookable
- **occupied:** Property currently occupied by guest
- **maintenance:** Property under maintenance
- **rejected:** Admin rejected, needs changes
- **suspended:** Temporarily suspended by admin
- **archived:** Permanently archived

**Business Rules:**
- Only 'approved' or 'active' properties visible to public
- 'occupied' properties cannot be booked for overlapping dates
- 'maintenance' properties cannot be booked
- Host cannot modify 'active' properties (must suspend first)

---

### 3.4 Property Updates

**Flow:**

1. **Edit Request:**
   - Host opens property for editing
   - System checks current status

2. **Status Check:**
   - If 'draft' or 'rejected': Allow full edit
   - If 'pending': Read-only, awaiting review
   - If 'approved' or 'active': Require suspension first
   - If 'suspended': Allow edit, requires re-approval

3. **Update Process:**
   - Host modifies property details
   - Images can be added/removed
   - Validation on save

4. **Re-approval:**
   - If property was 'approved' or 'active', status resets to 'pending'
   - Must go through approval workflow again

**Validation Rules:**
- Cannot modify property while booked (future enhancement)
- Price changes apply to future bookings only
- Address changes require re-verification

---

## 4. Booking Lifecycle

### 4.1 Booking Creation

**Flow:**

1. **Property Search:**
   - Guest searches properties with filters
   - View property details
   - Check availability for dates

2. **Booking Request:**
   - Guest selects dates (check-in, check-out)
   - Select number of guests
   - View total price calculation
   - Click "Book Now"

3. **Availability Check:**
   - System checks property status (must be 'available')
   - Check for overlapping bookings via `booking_date_locks`
   - Validate dates are in future
   - Validate minimum/maximum stay limits

4. **Booking Creation:**
   - Insert into `property_bookings` table
   - Status set to 'pending'
   - Insert date locks into `booking_date_locks`
   - Calculate total price
   - Create payment record

5. **Payment Initiation:**
   - Redirect to payment page
   - Guest selects payment method
   - Process payment

**Validation Rules:**
- Check-in must be before check-out
- Minimum stay: 1 night
- Maximum stay: 30 nights (configurable)
- Guests must not exceed property max_guests
- Property must be 'available' status
- No overlapping bookings for dates

**Database Impact:**
- Insert into `property_bookings`
- Insert into `booking_date_locks` (one per date)
- Insert into `payments`
- Update property view count

---

### 4.2 Booking Confirmation

**Flow:**

1. **Payment Success:**
   - Payment status changes to 'verified' or 'completed'
   - Booking status changes to 'confirmed'
   - Date locks remain in place

2. **Notifications:**
   - Guest receives confirmation (future)
   - Host receives booking notification (future)
   - Calendar updated

3. **Confirmation Details:**
   - Booking ID
   - Property details
   - Dates
   - Total price
   - Check-in/check-out instructions (future)

**Business Rules:**
- Booking confirmed only after successful payment
- Host cannot cancel confirmed booking without penalty (future)
- Guest can cancel with refund based on policy (future)

---

### 4.3 Booking Cancellation

**Flow:**

1. **Cancellation Request:**
   - Guest or host initiates cancellation
   - System checks cancellation policy

2. **Policy Check:**
   - Time until check-in
   - Cancellation reason
   - Refund eligibility

3. **Cancellation Process:**
   - Update booking status to 'cancelled'
   - Set `cancelled_at` and `cancelled_by`
   - Set `cancellation_reason`
   - Remove date locks from `booking_date_locks`
   - Process refund if applicable

4. **Refund Process:**
   - If eligible, refund payment
   - Update payment status to 'refunded'
   - Refund processed via payment provider

**Business Rules:**
- Full refund if cancelled 48+ hours before check-in
- Partial refund if cancelled 24-48 hours before check-in
- No refund if cancelled < 24 hours before check-in
- Host cancellations always eligible for full refund

**Database Impact:**
- Update `property_bookings`
- Delete from `booking_date_locks`
- Update `payments`
- Insert into `admin_activity_logs` (if admin involved)

---

### 4.4 Booking Check-in/Check-out

**Flow:**

1. **Check-in:**
   - Guest arrives at property
   - Host or system confirms check-in (future)
   - Property status changes to 'occupied'

2. **Check-out:**
   - Guest departs property
   - Host confirms check-out (future)
   - Property status changes to 'available'
   - Date locks released for those dates

**Business Rules:**
- Property status automatically updated based on dates (future)
- Late check-out fees may apply (future)
- Early check-in requires host approval (future)

---

### 4.5 Booking Dispute Resolution

**Flow:**

1. **Dispute Initiation:**
   - Guest or host raises dispute
   - Booking `dispute_status` changes to 'open'

2. **Admin Review:**
   - Admin reviews dispute details
   - Communicates with both parties via messaging
   - Gathers evidence

3. **Resolution:**
   - Admin makes decision
   - Update `dispute_status` to 'resolved'
   - Apply resolution (refund, penalty, etc.)
   - Log activity

4. **Escalation:**
   - If unresolved, can escalate to 'escalated'
   - Super admin review (future)

**Business Rules:**
- Admin must have `can_resolve_dispute` permission
- Dispute resolution logged for audit
- Refunds processed through payment system

---

## 5. Payment Lifecycle

### 5.1 Payment Methods

**Supported Methods:**

1. **Card Payments (Dodo):**
   - Credit/Debit cards
   - Processed via Dodo Payments
   - Secure checkout flow

2. **Wallet Payments:**
   - Zaad (Somalia)
   - eDahab (Somalia)
   - Premier Wallet
   - Wadaag Pay
   - Manual verification required

3. **Platform Payments:**
   - Direct platform payment (future)

---

### 5.2 Card Payment Flow (Dodo)

**Flow:**

1. **Initiation:**
   - Guest selects card payment
   - Call `createDodoCheckout()` from `paymentService.ts`
   - Edge Function `create-dodo-checkout` invoked

2. **Dodo Checkout:**
   - Edge Function validates booking
   - Calls Dodo Payments API
   - Creates checkout session
   - Returns checkout URL

3. **Payment Processing:**
   - Guest redirected to Dodo checkout
   - Guest completes payment on Dodo
   - Dodo redirects back to GuriGate
   - Webhook updates payment status (future)

4. **Payment Completion:**
   - Payment status changes to 'completed'
   - Booking confirmed
   - Receipt generated

**Validation Rules:**
- Amount must match booking total
- Currency must match booking currency
- Booking must exist and belong to user
- Property must be available

**Database Impact:**
- Insert into `payments` (pending)
- Update `payments` (completed)
- Update `property_bookings` (confirmed)

---

### 5.3 Wallet Payment Flow

**Flow:**

1. **Initiation:**
   - Guest selects wallet payment method
   - Enters wallet phone number
   - Call `createWalletPayment()` from `paymentService.ts`

2. **Validation:**
   - Phone number format validation
   - Provider-specific validation
   - Booking existence check

3. **Payment Record Creation:**
   - Call `create_local_wallet_payment()` RPC function
   - Insert payment record with 'submitted' status
   - Store wallet phone number
   - Generate provider reference

4. **Manual Payment:**
   - Guest makes payment via wallet app
   - Uploads proof image (future)
   - Payment status remains 'submitted'

5. **Admin Verification:**
   - Admin views pending payments
   - Verifies proof image
   - Calls `verify_payment()` RPC function
   - Status changes to 'verified'
   - Booking confirmed

**Validation Rules:**
- Phone number must match provider format
- Booking must exist and belong to user
- Amount must match booking total

**Database Impact:**
- Insert into `payments`
- Update `payments` (verification)
- Update `admin_activity_logs`

---

### 5.4 Payment Status Transitions

**Valid Transitions:**

```
pending → submitted → under_review → verified → completed
                                    ↓
                                  failed
                                    ↓
                                  refunded
```

**Status Descriptions:**

- **pending:** Payment initiated, awaiting processing
- **submitted:** Payment submitted for manual verification
- **under_review:** Admin reviewing payment
- **verified:** Payment verified by admin
- **completed:** Payment successfully processed
- **failed:** Payment failed (card declined, etc.)
- **refunded:** Payment refunded

**Business Rules:**
- Only verified payments trigger booking confirmation
- Failed payments allow retry
- Refunded payments may be retried
- Admin can verify or reject submitted payments

---

### 5.5 Payment Verification

**Flow:**

1. **Admin Review:**
   - Admin views pending payments
   - Reviews payment details and proof
   - Checks provider reference

2. **Verification Decision:**

   **Verify:**
   - Call `verify_payment()` RPC function
   - Status changes to 'verified'
   - Booking confirmed
   - Host notified (future)
   - Activity logged

   **Reject:**
   - Call `reject_payment()` RPC function
   - Status changes to 'failed'
   - Booking remains pending
   - Guest notified (future)
   - Activity logged

**Validation Rules:**
- Only admins can verify payments
- Must have `can_verify_payment` permission
- Payment must be in 'submitted' or 'under_review' status

---

## 6. Customer Lifecycle

### 6.1 Customer Creation

**Flow:**

1. **Lead Generation:**
   - User expresses interest
   - Contact information collected
   - Created as customer with 'lead' status

2. **Customer Registration:**
   - User completes registration
   - Status changes to 'active'
   - Profile fully set up

**Customer Types:**
- **tenant:** Long-term rental
- **renter:** Short-term rental
- **buyer:** Property purchase
- **guest:** General property seeker

**Lifecycle Statuses:**
- **lead:** Initial contact, not yet active
- **active:** Engaged customer
- **inactive:** No recent activity
- **suspended:** Account suspended

**Database Impact:**
- Insert into `profiles` (if new user)
- Update `profiles` customer-related fields
- (Note: Customer module currently uses mock data)

---

### 6.2 Customer to Tenant Conversion

**Flow:**

1. **Booking Completion:**
   - Guest completes successful booking
   - Relationship established with property

2. **Contract Creation:**
   - Long-term rental agreement created
   - Customer status changes to 'tenant'
   - Contract details recorded

3. **Ongoing Management:**
   - Payment history tracked
   - Contract renewals
   - Property assignments

**Business Rules:**
- Conversion requires completed booking
- Contract must be signed (future)
- Tenant has specific permissions

---

### 6.3 Customer Management

**Flow:**

1. **Customer Overview:**
   - View customer details
   - View booking history
   - View payment history
   - View contracts
   - View timeline

2. **Property Assignment:**
   - Assign property to customer
   - Update customer current property
   - Link to specific unit

3. **Contract Management:**
   - Create new contract
   - Update existing contract
   - Track contract status (active, expired, pending)

4. **Suspension:**
   - Suspend customer account
   - Reason recorded
   - Access restricted

**Database Impact:**
- Update `profiles` customer fields
- Insert/update contract records (future RMS module)
- Update property assignments

---

## 7. Admin Workflow

### 7.1 Property Approval

**Flow:**

1. **View Pending Properties:**
   - Admin accesses dashboard
   - Filter by 'pending' status
   - View property details

2. **Review Property:**
   - Check property information
   - Review images
   - Verify pricing
   - Check compliance

3. **Decision:**
   - Approve or reject
   - Provide reason if rejecting
   - Activity logged

**Permissions Required:**
- `can_approve_property`
- `can_reject_property`

---

### 7.2 User Moderation

**Flow:**

1. **View Users:**
   - Admin accesses user management
   - Filter by status, role, verification
   - View user details

2. **Actions:**

   **Ban User:**
   - Call `ban_user()` RPC function
   - Set `is_banned = true`
   - Reason recorded
   - Activity logged

   **Unban User:**
   - Call `unban_user()` RPC function
   - Set `is_banned = false`
   - Activity logged

   **Verify Host:**
   - Call `verify_host()` RPC function
   - Update `verification_status` to 'verified'
   - Activity logged

**Permissions Required:**
- `can_ban_user`
- `can_unban_user`
- `can_verify_host`

---

### 7.3 Payment Verification

**Flow:**

1. **View Pending Payments:**
   - Admin accesses payment management
   - Filter by 'submitted' or 'under_review' status
   - View payment details and proof

2. **Verification:**
   - Verify payment details
   - Check proof image
   - Confirm with provider if needed

3. **Decision:**
   - Verify or reject
   - Provide reason if rejecting
   - Activity logged

**Permissions Required:**
- `can_verify_payment`
- `can_reject_payment`

---

### 7.4 Audit Logging

**Flow:**

1. **Automatic Logging:**
   - All admin RPC functions call `log_admin_activity()`
   - Record: admin_id, action, entity_type, entity_id, details
   - Timestamp recorded

2. **Audit Review:**
   - Admins can view activity logs
   - Filter by admin, action, entity, date range
   - Export logs (future)

**Logged Actions:**
- Property approval/rejection/suspension
- User ban/unban/verification
- Payment verification/rejection
- Booking cancellation
- Dispute resolution

**Permissions Required:**
- `can_view_audit_logs`

---

### 7.5 Reporting

**Dashboard KPIs:**

- Total properties
- Pending approvals
- Total bookings
- Active bookings
- Pending payments
- Total users
- Banned users
- Monthly revenue (future)

**Report Generation:**
- Property reports
- Booking reports
- Payment reports
- User reports
- Export to CSV (future)

---

## 8. Messaging System

### 8.1 Conversation Creation

**Flow:**

1. **Initiation:**
   - User starts new conversation
   - Select conversation type (direct, booking, property, payment, support)
   - Provide initial message

2. **Conversation Creation:**
   - Call `create_conversation()` RPC function
   - Set type, title, status, priority
   - Link to related entity (booking, property, payment)
   - Set metadata

3. **Participant Management:**
   - Call `add_conversation_participant()` RPC function
   - Add creator as participant
   - Add other participants as needed
   - Set participant roles

**Conversation Types:**
- **direct:** Direct message between users
- **booking:** Related to a booking
- **property:** Related to a property
- **payment:** Related to a payment
- **support:** Support request
- **system:** System notifications
- **rms_contract:** RMS contract discussion
- **rms_tenant:** RMS tenant discussion
- **rms_unit:** RMS unit discussion

---

### 8.2 Message Sending

**Flow:**

1. **Message Composition:**
   - User types message
   - Select content type (text, image, document)
   - Add attachments if needed

2. **Message Sending:**
   - Call `send_message()` RPC function
   - Insert into `messages` table
   - Set sender, content, content_type
   - Update conversation `updated_at`

3. **Real-time Delivery:**
   - Supabase Realtime pushes to participants
   - Participants see message instantly
   - Unread count updated

**Message Content Types:**
- **text:** Plain text message
- **image:** Image attachment
- **document:** Document attachment
- **property_reference:** Reference to property
- **booking_reference:** Reference to booking
- **payment_reference:** Reference to payment
- **system:** System-generated message

---

### 8.3 Conversation Management

**Flow:**

1. **Status Management:**
   - Update conversation status (active, archived, closed)
   - Update priority (low, normal, high, urgent)
   - Assign to specific user

2. **Participant Management:**
   - Add participants
   - Remove participants
   - Mute participants
   - Update participant roles

3. **Read Status:**
   - Call `mark_conversation_read()` RPC function
   - Update participant's `last_read_at`
   - Update unread count

**Permissions Required:**
- `can_send_messages` - Send messages
- `can_manage_conversations` - Manage conversations
- `can_delete_messages` - Delete messages
- `can_view_internal_notes` - View internal notes
- `can_send_internal_notes` - Send internal notes

---

## 9. Notification System

### 9.1 Notification Creation

**Flow:**

1. **Event Trigger:**
   - System event occurs (booking created, payment verified, etc.)
   - Notification record created
   - Status set to 'pending'

2. **Queue Processing:**
   - Notification added to `notification_queue`
   - Worker processes queue (future)
   - Attempts delivery

3. **Delivery:**
   - Send via configured channel (email, SMS, push, whatsapp)
   - Update status to 'sent' or 'failed'
   - Retry failed notifications

**Notification Types:**
- Booking confirmations
- Payment notifications
- Property approval
- Messages
- System alerts

---

## 10. Business Rules Summary

### 10.1 Property Rules

- Properties must be approved before being visible
- Hosts can only manage their own properties
- Property status determines visibility and bookability
- Images required for property listing
- Pricing must be positive and in supported currency

### 10.2 Booking Rules

- Bookings require payment confirmation
- Date locks prevent double bookings
- Cancellation policy applies based on timing
- Disputes require admin resolution
- Check-in/check-out rules apply

### 10.3 Payment Rules

- Multiple payment methods supported
- Wallet payments require manual verification
- Card payments processed via Dodo
- Refunds follow cancellation policy
- Payment verification requires admin permission

### 10.4 User Rules

- Users have roles with specific permissions
- Banned users cannot access system
- Host verification required for certain actions
- Profile information required for bookings

### 10.5 Admin Rules

- All admin actions logged
- Permissions required for specific actions
- Audit trail maintained
- Super admins have full access

---

## 11. Data Validation Rules

### 11.1 Input Validation

**Email:**
- Valid email format
- Unique across system

**Phone Numbers:**
- Provider-specific format validation
- Required for wallet payments

**Dates:**
- Check-in must be before check-out
- Bookings must be in future
- Minimum/maximum stay limits

**Pricing:**
- Must be positive
- Must be in supported currency
- Must match booking total

---

### 11.2 Business Validation

**Property Availability:**
- Status must be 'available'
- No overlapping bookings
- Not under maintenance

**User Access:**
- Must be authenticated
- Must not be banned
- Must have required permissions

**Payment Processing:**
- Amount must match booking
- Currency must match
- Booking must belong to user

---

## 12. Error Handling

### 12.1 Error Types

**Validation Errors:**
- Invalid input format
- Missing required fields
- Business rule violations

**Authentication Errors:**
- Invalid credentials
- Session expired
- Account banned
- Insufficient permissions

**Database Errors:**
- Constraint violations
- Connection errors
- Transaction failures

**External API Errors:**
- Payment provider errors
- Network failures
- Timeout errors

### 12.2 Error Handling Strategy

**Frontend:**
- Display user-friendly messages
- Provide actionable guidance
- Log technical errors

**Backend:**
- Validate inputs
- Use transactions for multi-step operations
- Log all errors
- Rollback on failure

---

## 13. Future Enhancements

### 13.1 Planned Features

**Automated Notifications:**
- Email notifications
- SMS notifications
- Push notifications
- WhatsApp integration

**Advanced Booking Rules:**
- Dynamic pricing
- Seasonal rates
- Loyalty discounts
- Group bookings

**Enhanced Payment Features:**
- Recurring payments
- Payment plans
- Automated refunds
- Payment analytics

**Customer Management:**
- CRM integration
- Automated lead scoring
- Customer segmentation
- Marketing automation

---

## 14. Documentation References

**Related Documents:**
- Database Documentation
- RBAC Documentation
- Security Documentation
- Module Documentation

**Code References:**
- `src/services/authService.ts` - Authentication logic
- `src/services/paymentService.ts` - Payment logic
- `src/services/adminService.ts` - Admin operations
- `src/services/messagingService.ts` - Messaging logic
- `supabase/migrations/` - Database schema and functions

---

**End of Business Logic Documentation**
