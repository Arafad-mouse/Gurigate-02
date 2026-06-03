# PHASE1_BASELINE

## Current State

- Total Routes: (to fill)
- Total Pages: (to fill)
- Total Services: (to fill)
- Total Mock Services: customerService, propertyService, bookingService, paymentService, notificationService, messagingService
- Total Database Tables: (to fill)
- Total RLS Policies: (to fill)
- Total TypeScript Errors: (to fill)
- Current Build Status: (to fill)

## Mock Service Inventory

### customerService

- File Path: src/services/customerService.ts
- Tables Required: customers, property_bookings, payments, contracts, properties
- Current Mock Data Source: in-memory constants within service
- Dependencies: bookingService (history), paymentService, contractService (future), propertyService
- Risk Level: High (CRM core)

### propertyService

- File Path: (to fill)
- Tables Required: properties, property_images, availability, reviews, wishlists
- Current Mock Data Source: (to fill)
- Dependencies: bookingService (availability), reviewService, wishlistService
- Risk Level: High (marketplace core)

### bookingService

- File Path: (to fill)
- Tables Required: property_bookings/bookings, booking_guests, properties, payments, commissions, notifications
- Current Mock Data Source: (to fill)
- Dependencies: propertyService, paymentService, commissionService, notificationService, messagingService
- Risk Level: High (booking workflows)

### paymentService

- File Path: (to fill)
- Tables Required: payments, commissions, subscriptions
- Current Mock Data Source: (to fill)
- Dependencies: bookingService, subscriptionService, commissionService
- Risk Level: High (payments)

### notificationService

- File Path: (to fill)
- Tables Required: notifications, notification_queue
- Current Mock Data Source: (to fill)
- Dependencies: messagingService (inbox), bookingService, paymentService
- Risk Level: Medium (user comms)

### messagingService

- File Path: (to fill)
- Tables Required: conversations, conversation_participants, messages, message_attachments
- Current Mock Data Source: (to fill)
- Dependencies: notificationService
- Risk Level: Medium (inbox/unread)

## Service Migration Order

1. customerService
2. propertyService
3. bookingService
4. paymentService
5. notificationService
6. messagingService

## Success Metrics

- No mock business data remains
- No sessionStorage business logic remains
- No fake bookings remain
- No fake payments remain
- All services use Supabase
- Build passes
- Type check passes
- RLS verification passes
