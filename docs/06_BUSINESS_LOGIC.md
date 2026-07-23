# GuriGate Business Logic Documentation

**Version:** 1.0  
**Date:** June 2, 2026  
**Status:** Production

---

## Executive Summary

This document describes the core business logic flows in GuriGate, including authentication, property management, booking, payment, messaging, and administrative operations. Each flow is documented with step-by-step processes, decision points, and system interactions.

---

## Authentication Flow

### User Registration

**Process:**
1. User navigates to sign-up page
2. Enters email, password, and personal information
3. Frontend validates input format
4. Calls `AuthService.signUp()`
5. Supabase Auth creates user account
6. Profile record created in `profiles` table
7. Default role assigned: 'guest'
8. Email verification sent (if enabled)
9. User redirected to onboarding or dashboard

**Error Handling:**
- Duplicate email: Display error message
- Weak password: Display strength requirements
- Network error: Retry mechanism
- Validation error: Show specific field errors

### User Login

**Process:**
1. User enters email and password
2. Frontend validates input
3. Calls `AuthService.signIn()`
4. Supabase Auth validates credentials
5. JWT tokens issued (access + refresh)
6. AuthContext updates with session and profile
7. User permissions calculated
8. Redirect based on user role
9. Session storage configured

**Error Handling:**
- Invalid credentials: Show error
- Account banned: Display ban reason
- Network error: Retry mechanism
- Session expired: Auto-refresh token

### Session Management

**Process:**
1. Access token stored in memory
2. Refresh token stored securely
3. Auth state changes monitored
4. Token refresh before expiration
5. Session timeout handling
6. Logout on explicit action

**Security Measures:**
- Tokens not stored in localStorage for sensitive data
- Automatic token refresh
- Session invalidation on logout
- Concurrent session management (planned)

---

## Property Management Flow

### Property Creation

**Process:**
1. Host navigates to "Add Property"
2. Completes multi-step form:
   - Basic information (title, description, type)
   - Location (address, city, country)
   - Amenities and features
   - Pricing (rates, fees, currency)
   - Images (upload to Supabase Storage)
3. Frontend validates all fields
4. Calls `HostOnboardingService.createProperty()`
5. Property record created in `properties` table
6. Related records created:
   - `property_addresses`
   - `property_features`
   - `property_pricing`
   - `property_images`
7. Property status set to 'draft'
8. Host can submit for approval
9. Status changes to 'pending'
10. Notification sent to admins

**Validation Rules:**
- Required fields must be filled
- Images must be uploaded (minimum 1)
- Pricing must be positive
- Address must be valid
- Phone number format validation

### Property Approval

**Process:**
1. Admin views pending properties
2. Reviews property details and images
3. Checks compliance with guidelines
4. Decision: approve or reject

**Approval Path:**
1. Admin clicks "Approve"
2. Calls RPC function `approve_property(property_id, admin_id)`
3. RLS policy validates admin role
4. Property status updated to 'approved'
5. `approved_by` and `approved_at` set
6. Audit log entry created
7. Notification sent to host
8. Property becomes visible in marketplace

**Rejection Path:**
1. Admin clicks "Reject"
2. Enters rejection reason
3. Calls RPC function `reject_property(property_id, admin_id, reason)`
4. Property status updated to 'rejected'
5. `rejection_reason` stored
6. Audit log entry created
7. Notification sent to host with reason
8. Host can modify and resubmit

### Property Suspension

**Process:**
1. Admin identifies policy violation
2. Navigates to property details
3. Clicks "Suspend"
4. Enters suspension reason
5. Calls RPC function `suspend_property(property_id, admin_id, reason)`
6. Property status updated to 'suspended'
7. Audit log entry created
8. Property hidden from marketplace
9. Active bookings unaffected
10. New bookings prevented
11. Notification sent to host

**Reactivation:**
1. Host resolves violation
2. Requests reactivation
3. Admin reviews
4. Approves reactivation
5. Status changed back to 'approved'

---

## Booking Flow

### Booking Creation

**Process:**
1. User views property details
2. Selects check-in and check-out dates
3. Selects number of guests
4. System calculates total price:
   - Nightly rate × nights
   - + Cleaning fee
   - + Service fee
5. User reviews price breakdown
6. Clicks "Reserve"
7. Booking details stored in sessionStorage
8. Redirected to payment page

**Price Calculation Logic:**
```typescript
const nights = calculateNights(checkIn, checkOut)
const basePrice = nightlyRate * nights
const cleaningFee = propertyPricing.cleaning_fee
const serviceFee = basePrice * (propertyPricing.service_fee / 100)
const totalPrice = basePrice + cleaningFee + serviceFee
```

**Availability Check:**
- Query `bookings` table for overlapping dates
- Check property status is 'available'
- Verify guest count limit not exceeded

### Payment Processing

**Dodo Payment Flow:**
1. User selects card payment
2. Calls `PaymentService.createDodoCheckout()`
3. Edge Function `create-dodo-checkout` invoked
4. Dodo checkout session created
5. User redirected to Dodo payment page
6. User completes payment
7. Dodo webhook fires (planned)
8. Payment status updated to 'completed'
9. Booking confirmed
10. Conversation auto-created

**Local Wallet Payment Flow:**
1. User selects wallet provider (Zaad, eDahab, Premier, Wadaag)
2. Enters wallet phone number
3. System validates phone format
4. Calls `PaymentService.createWalletPayment()`
5. RPC function `create_local_wallet_payment` invoked
6. Payment record created with status 'submitted'
7. User completes payment offline
8. Uploads proof image
9. Admin verifies payment
10. Payment status updated to 'verified'
11. Booking confirmed
12. Conversation auto-created

### Booking Confirmation

**Process:**
1. Payment status changes to 'completed' or 'verified'
2. Trigger creates conversation
3. Guest and host added as participants
4. Welcome message sent automatically
5. Booking status updated to 'confirmed'
6. Notifications sent to guest and host
7. Property availability updated
8. Email confirmations sent (planned)

### Booking Cancellation

**Guest Cancellation:**
1. Guest views booking
2. Clicks "Cancel Booking"
3. Selects cancellation reason
4. System checks cancellation policy
5. Calculates refund amount
6. Calls booking cancellation function
7. Booking status updated to 'cancelled'
8. Payment refund processed (if applicable)
9. Property availability restored
10. Notifications sent to host and guest
11. Conversation updated

**Host Cancellation:**
1. Host views booking
2. Clicks "Cancel Booking"
3. Enters cancellation reason
4. System validates cancellation allowed
5. Full refund processed automatically
6. Booking status updated to 'cancelled'
7. Property availability restored
8. Notifications sent to guest and host
9. Potential penalty applied to host

**Admin Cancellation:**
1. Admin views booking
2. Cancels booking with reason
3. Full refund processed
4. All parties notified
5. Audit log entry created

---

## Payment Flow

### Payment Verification (Wallet)

**Process:**
1. Admin views pending payments
2. Opens payment details
3. Reviews proof image
4. Cross-checks with bank records (if available)
5. Decision: verify or reject

**Verification Path:**
1. Admin clicks "Verify"
2. Calls RPC function `verify_payment(payment_id, admin_id)`
3. Payment status updated to 'verified'
4. `verified_by` and `verified_at` set
5. Audit log entry created
6. Booking confirmed (if not already)
7. Notifications sent to payer and payee

**Rejection Path:**
1. Admin clicks "Reject"
2. Enters rejection reason
3. Payment status updated to 'rejected'
4. Audit log entry created
5. Notification sent to payer
6. Payer can resubmit with correct proof

### Payment Refund

**Process:**
1. Admin identifies refund situation
2. Navigates to payment details
3. Clicks "Refund"
4. Enters refund reason and amount
5. Calls refund function
6. Payment status updated to 'refunded'
7. Refund processed via payment provider
8. Audit log entry created
9. Notifications sent to all parties

---

## Messaging Flow

### Conversation Creation

**Auto-Creation on Booking:**
1. Booking trigger fires
2. Calls `create_conversation` RPC function
3. Conversation type set to 'booking'
4. Subject set to booking reference
5. Related booking ID linked
6. Related property ID linked
7. Related payment ID linked
8. Guest and host added as participants
9. Welcome message sent automatically

**Manual Creation:**
1. User navigates to inbox
2. Clicks "New Conversation"
3. Selects conversation type
4. Selects recipient(s)
5. Enters subject
6. Links to related entities (optional)
7. Creates conversation
8. Adds participants
9. Sends initial message

### Message Sending

**Process:**
1. User composes message
2. Optionally toggles internal note (admin only)
3. Attaches files (optional)
4. Clicks "Send"
5. Calls `MessagingService.sendMessage()`
6. Message record created in `messages` table
7. Conversation `updated_at` timestamp updated
8. Real-time subscription notifies all participants
9. Message appears in all participants' views
10. Unread count updated for recipients

**Internal Notes:**
- Only visible to admin participants
- Marked with `is_internal = true`
- Not counted in guest unread counts
- Used for admin coordination

### Conversation Management

**Status Changes:**
- **Open:** Active conversation
- **Closed:** Resolved, no further action needed
- **Archived:** Historical reference

**Priority Levels:**
- **Urgent:** Immediate attention required
- **High:** Priority attention
- **Normal:** Standard priority
- **Low:** Can wait

**Assignment:**
- Admin can assign conversation to themselves
- Automatic assignment based on rules (planned)
- Assignment notifications sent

---

## Administrative Flow

### User Ban

**Process:**
1. Admin identifies policy violation
2. Navigates to user profile
3. Clicks "Ban User"
4. Enters ban reason
5. Calls RPC function `ban_user(user_id, admin_id, reason)`
6. User `is_banned` set to true
7. `banned_reason` stored
8. Active sessions invalidated
9. Audit log entry created
10. Notification sent to user
11. User cannot log in or perform actions

**Unban Process:**
1. Admin reviews ban
2. Clicks "Unban User"
3. Calls RPC function `unban_user(user_id, admin_id)`
4. User `is_banned` set to false
5. `banned_reason` cleared
6. Audit log entry created
7. Notification sent to user
8. User can log in again

### Host Verification

**Process:**
1. Host requests verification
2. Submits verification documents
3. Admin reviews documents
4. Verifies information
5. Calls RPC function `verify_host(user_id, admin_id)`
6. User `verification_status` updated to 'verified'
7. Audit log entry created
8. Verification badge displayed
9. Enhanced privileges granted (if applicable)

### Role Modification

**Process:**
1. Admin navigates to user profile
2. Clicks "Modify Role"
3. Selects new role
4. Enters reason for change
5. Calls role modification function
6. User role updated in `profiles` table
7. Permissions recalculated
8. Audit log entry created
9. Notification sent to user
10. Access rights updated immediately

---

## Notification Flow

### Notification Generation

**Triggers:**
- Property approved/rejected
- Booking confirmed/cancelled
- Payment verified/rejected
- New message received
- User banned/unbanned
- Host verified
- Role changed

**Process:**
1. Event occurs in system
2. Notification logic triggered
3. Notification record created in `notifications` table
4. `user_id` set to recipient
5. `type` set to notification category
6. `title` and `message` composed
7. `data` field contains related entity IDs
8. `created_at` timestamp set
9. Real-time subscription notifies user
10. Notification badge updated

### Notification Delivery

**In-App:**
- Real-time updates via Supabase Realtime
- Notification center displays all notifications
- Unread count badge
- Click to view details

**Email (Planned):**
- Email sent for critical notifications
- Digest emails for non-critical
- Unsubscribe options
- HTML email templates

**SMS (Planned):**
- SMS for urgent notifications
- Booking confirmations
- Payment verifications
- Security alerts

---

## Review Flow

### Property Review Submission

**Process:**
1. Guest completes stay
2. Navigates to booking details
3. Clicks "Leave Review"
4. Rates property (1-5 stars)
5. Writes review text
6. Optionally uploads photos
7. Submits review
8. Review record created in `property_reviews` table
9. Trigger recalculates property average rating
10. Property rating updated
11. Host notified

### Review Moderation (Planned)

**Process:**
1. System flags suspicious reviews
2. Admin reviews flagged content
3. Approves or removes review
4. If removed, property rating recalculated
5. Audit log entry created

---

## Search and Discovery Flow

### Property Search

**Process:**
1. User enters search criteria
2. Optional filters applied:
   - Location
   - Price range
   - Property type
   - Amenities
   - Availability dates
3. Frontend calls search service
4. Database query with filters
5. Results ordered by relevance
6. Pagination applied
7. Results displayed
8. View tracking updated

### Property View Tracking

**Process:**
1. User views property details
2. System creates `property_views` record
3. `property_id` and `viewer_id` stored
4. `viewed_at` timestamp set
5. Analytics dashboard updated
6. Popular properties calculated

---

## Wishlist Flow

### Add to Wishlist

**Process:**
1. User views property
2. Clicks "Like" or "Save"
3. Frontend checks authentication
4. Calls wishlist service
5. Record created in `wishlists` table
6. `user_id` and `property_id` stored
7. UI updated to show saved state
8. Property added to user's saved properties

### Remove from Wishlist

**Process:**
1. User views saved property
2. Clicks "Unlike" or "Remove"
3. Frontend calls wishlist service
4. Record deleted from `wishlists` table
5. UI updated to show unsaved state
6. Property removed from saved properties

---

## Data Consistency Rules

### Property Status Rules

- Draft → Pending (on submission)
- Pending → Approved (on admin approval)
- Pending → Rejected (on admin rejection)
- Approved → Suspended (on violation)
- Suspended → Approved (on reactivation)
- Rejected → Pending (on resubmission)

### Booking Status Rules

- Pending → Confirmed (on payment verification)
- Confirmed → Cancelled (on cancellation)
- Confirmed → Completed (on checkout)

### Payment Status Rules

- Submitted → Verified (on admin verification)
- Submitted → Failed (on rejection)
- Verified → Refunded (on refund)
- Completed → Refunded (on refund)

---

## Error Handling Patterns

### Database Errors

**Constraint Violations:**
- Unique constraint: Display user-friendly message
- Foreign key constraint: Check related entity exists
- Not null constraint: Validate required fields

**RLS Violations:**
- Insufficient permissions: Show access denied
- Permission denied: Check user role and permissions

### API Errors

**Network Errors:**
- Retry mechanism with exponential backoff
- Show connection error message
- Offer retry option

**Validation Errors:**
- Display specific field errors
- Highlight invalid fields
- Show correction suggestions

### Business Logic Errors

**Availability Conflicts:**
- Show available dates
- Suggest alternative dates
- Allow waitlist (planned)

**Payment Failures:**
- Show error reason
- Offer retry with different method
- Contact support option

---

**Document Owner:** Development Team  
**Last Updated:** June 2, 2026  
**Next Review:** After feature changes
