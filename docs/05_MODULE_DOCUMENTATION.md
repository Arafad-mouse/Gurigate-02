# GuriGate Module Documentation

**Version:** 1.0  
**Date:** June 2, 2026  
**Status:** Production

---

## Executive Summary

GuriGate consists of five main modules: Marketplace, RMS (Rental Management System), Customer Management, Inbox (Messaging), and Admin. Each module has distinct responsibilities, user interfaces, and backend services. The platform is approximately 65% complete with the Marketplace, Admin, and Inbox modules largely functional, while the RMS module requires significant backend implementation.

**Module Completion Status:**
- Marketplace: 85%
- RMS: 25%
- Customer: 40%
- Inbox: 80%
- Admin: 90%

---

## Marketplace Module

### Overview

The Marketplace module enables users to discover, search, book, and review properties. It is the primary revenue-generating module of the platform.

### Components

**Landing Page (`GuriGateLandingPage.tsx`)**
- Featured properties display
- Search functionality
- Popular homes section
- Location-based filtering
- Property cards with ratings and pricing

**Property Page (`PropertyPage.tsx`)**
- Detailed property information
- Image gallery
- Amenities and features
- Pricing information
- Booking form
- Reviews section
- Map integration

**Search Results (`SearchResults.tsx`)**
- Advanced search filters
- Location-based results
- Price range filtering
- Property type filtering
- Pagination

**All Properties Page (`all-property.tsx`)**
- Complete property listing
- Filter options
- Sort functionality
- Grid/list view toggle

### Business Logic

**Property Discovery Flow:**
1. User lands on homepage
2. Browses featured or searches properties
3. Filters by location, price, type
4. Views property details
5. Reviews images and amenities
6. Checks availability
7. Proceeds to booking

**Booking Flow:**
1. User selects check-in/check-out dates
2. Selects number of guests
3. Calculates total price
4. Clicks "Reserve"
5. Redirects to payment page
6. Completes payment
7. Booking confirmed
8. Conversation auto-created

### Services

**Properties Service (`properties.ts`)**
- Property CRUD operations
- Search and filtering
- Image management
- Availability checking

**GuriGate Properties Service (`guriGateProperties.ts`)**
- Landing page data
- Featured properties
- Location-based listings
- View tracking

### Routes

- `/` - Landing page
- `/property/:id` - Property details
- `/all-property` - All properties listing
- `/payment` - Payment processing

### Permissions

**Guest Access:**
- View approved properties
- View property details
- Create bookings
- Leave reviews

**Host Access:**
- All guest permissions
- Manage own properties
- View booking requests

**Admin Access:**
- All host permissions
- Approve/reject properties
- Manage all properties

---

## RMS Module (Rental Management System)

### Overview

The RMS module is designed for long-term rental management including contracts, tenants, units, buildings, and rent collection. Currently, the UI exists but backend implementation is incomplete.

### Components

**Customers Page (`CustomersPage.tsx`)**
- Customer KPIs dashboard
- Customer list with filters
- Add customer modal
- Edit customer modal
- Assign property drawer
- Create contract drawer
- Suspend customer modal
- Customer profile drawer

**Rentals Page**
- Rental listings
- Unit management
- Lease tracking
- Rent collection status

**Contract Drawer (`CreateContractDrawer.tsx`)**
- Contract creation form
- Tenant selection
- Unit assignment
- Lease terms
- Rent amount configuration

**Customer Components**
- Customer overview tab
- Customer bookings tab
- Customer payments tab
- Customer contracts tab
- Customer properties tab
- Customer timeline tab

### Business Logic

**Customer Management Flow:**
1. Admin adds customer
2. Assigns property/unit
3. Creates lease contract
4. Sets up rent collection
5. Tracks payments
6. Manages maintenance requests

**Contract Lifecycle:**
1. Contract creation
2. Tenant onboarding
3. Move-in process
4. Rent collection
5. Lease renewal or termination
6. Move-out process

### Services

**Customer Service (`customerService.ts`)**
- Customer CRUD operations
- Contract management
- Property assignment
- Suspension handling
- **Status:** Partially implemented (mock data)

### Planned Backend Services

**Contract Service** (Not implemented)
- Contract CRUD operations
- Lease lifecycle management
- Renewal processing
- Termination handling

**Tenant Service** (Not implemented)
- Tenant management
- Background checks
- Verification processing

**Unit Service** (Not implemented)
- Unit management
- Availability tracking
- Maintenance status

**Building Service** (Not implemented)
- Building management
- Property manager assignment
- Amenity management

### Database Tables (Planned)

**contracts** - Lease contracts
**tenants** - Tenant information
**units** - Property units
**buildings** - Building information
**maintenance_requests** - Maintenance tracking
**rent_payments** - Rent collection

### Routes

- `/manage-property/customers` - Customer management
- `/manage-property/rentals` - Rental management

### Permissions

**Manager Access:**
- Manage customers
- Create contracts
- Assign properties
- View rent collection

**Admin Access:**
- All manager permissions
- Suspend customers
- Modify contracts
- Access all properties

---

## Customer Module

### Overview

The Customer module provides customer relationship management functionality, including profile management, booking history, payment history, and support interactions.

### Components

**Profile Page (`ProfilePage.tsx`)**
- User profile information
- Avatar management
- Contact information
- Booking history
- Payment history
- Review history
- Account settings

**Preferences Page (`PreferencesPage.tsx`)**
- Language selection
- Currency selection
- Timezone selection
- Theme preferences
- Notification preferences
- Privacy settings

**Notifications Page (`NotificationsPage.tsx`)**
- Notification list
- Read/unread status
- Notification filtering
- Notification actions

**Integrations Page (`IntegrationsPage.tsx`)**
- Connected accounts
- Calendar integration
- Payment methods
- Third-party services

### Business Logic

**Profile Management Flow:**
1. User views profile
2. Updates personal information
3. Changes avatar
4. Saves changes
5. Profile updated in database

**Notification Flow:**
1. System generates notification
2. Notification stored in database
3. User views notifications
4. Marks as read
5. Notification status updated

### Services

**Auth Service (`authService.ts`)**
- Session management
- Profile updates
- Password changes
- Profile hydration

### Routes

- `/profile` - User profile
- `/account/preferences` - Preferences
- `/notifications` - Notifications
- `/account/integrations` - Integrations

### Permissions

**All Authenticated Users:**
- View and edit own profile
- View own bookings
- View own payments
- Manage notifications
- Configure preferences

---

## Inbox Module (Messaging)

### Overview

The Inbox module provides a comprehensive messaging system for communication between guests, hosts, and support staff. It supports real-time messaging, internal notes, and conversation context.

### Components

**Inbox Page (`InboxPage.tsx`)**
- Conversation list
- Message thread view
- Conversation filtering
- Priority indicators
- Unread count badges

**Conversation List (`ConversationList.tsx`)**
- List of user conversations
- Type indicators
- Status badges
- Last message preview
- Unread count
- Priority sorting

**Message Thread (`MessageThread.tsx`)**
- Message display
- Timestamps
- Sender identification
- Internal note indicators
- System messages
- Message actions

**Message Composer (`MessageComposer.tsx`)**
- Message input
- Attachment upload
- Internal note toggle
- Typing indicators
- Send functionality

**Context Panel (`ContextPanel.tsx`)**
- Booking information
- Property details
- Payment details
- Related entity links
- Quick actions

### Business Logic

**Messaging Flow:**
1. User opens inbox
2. Selects conversation
3. Views message thread
4. Composes message
5. Sends message
6. Real-time update to all participants
7. Conversation timestamp updated

**Internal Notes Flow:**
1. Admin opens conversation
2. Toggles internal note mode
3. Composes internal note
4. Note marked as internal
5. Only admins can view internal notes

**Auto-Conversation Creation:**
1. Booking created
2. Trigger fires
3. Conversation auto-created
4. Guest and host added as participants
5. Welcome message sent

### Services

**Messaging Service (`messagingService.ts`)**
- Conversation CRUD operations
- Message sending
- Context data retrieval
- Participant management
- Conversation filtering

**Realtime Messaging Service (`realtimeMessagingService.ts`)**
- Real-time message updates
- Typing indicators
- Presence tracking
- Subscription management

### Hooks

**useRealtimeMessages**
- Real-time message subscriptions
- Auto-updates when new messages arrive

**useConversationPresence**
- Online status tracking
- Typing indicators
- Presence updates

### Database Tables

**conversations** - Conversation records
**conversation_participants** - Participant mapping
**messages** - Individual messages
**message_attachments** - File attachments

### Routes

- `/manage-property/inbox` - Messaging inbox

### Permissions

**Guest Access:**
- View own conversations
- Send messages
- View messages in own conversations

**Host Access:**
- All guest permissions
- View conversations for their properties
- Send messages to guests

**Admin Access:**
- All host permissions
- View all conversations
- Send internal notes
- Manage conversations
- Delete messages

---

## Admin Module

### Overview

The Admin module provides comprehensive administrative functionality for managing properties, bookings, payments, users, and platform operations.

### Components

**Admin Dashboard (`AdminDashboard.tsx`)**
- KPIs display
- Recent activity
- Quick actions
- Performance metrics
- Navigation to admin sections

**Admin Properties (`AdminProperties.tsx`)**
- Property listing table
- Search and filters
- Approval actions
- Rejection actions
- Suspension actions
- Property details view

**Admin Bookings**
- Booking listing
- Status filtering
- Cancellation actions
- Dispute resolution
- Date modification

**Admin Payments**
- Payment listing
- Verification actions
- Proof image viewing
- Status updates
- Refund processing

**Admin Users (`CustomersPage.tsx` - admin view)**
- User management
- Ban/unban actions
- Host verification
- Role modification
- User details view

### Business Logic

**Property Approval Flow:**
1. Host submits property
2. Property status: pending
3. Admin reviews property
4. Admin approves or rejects
5. Notification sent to host
6. Audit log created
7. Property status updated

**Payment Verification Flow:**
1. Guest makes payment
2. Payment status: submitted
3. Admin reviews proof
4. Admin verifies or rejects
5. Notification sent to guest/host
6. Audit log created
7. Payment status updated

**User Ban Flow:**
1. Admin identifies violation
2. Admin bans user
3. Ban reason recorded
4. User sessions invalidated
5. Audit log created
6. Notification sent to user

### Services

**Admin Service (`adminService.ts`)**
- Dashboard KPIs
- Property management
- Booking management
- Payment management
- User management
- Audit logging

### RPC Functions

**approve_property** - Approve property listing
**reject_property** - Reject property listing
**suspend_property** - Suspend property
**verify_payment** - Verify payment
**ban_user** - Ban user
**unban_user** - Unban user
**verify_host** - Verify host account

### Routes

- `/admin/dashboard` - Admin dashboard
- `/admin/properties` - Property management
- `/admin/bookings` - Booking management
- `/admin/payments` - Payment management
- `/admin/users` - User management

### Permissions

**Admin Access:**
- View all admin sections
- Approve/reject properties
- Verify payments
- Ban/unban users
- Verify hosts
- View audit logs
- Access all data

**Super Admin Access:**
- All admin permissions
- Modify admin roles
- Platform configuration
- System settings

---

## Module Dependencies

### Dependency Graph

```
Marketplace
    ├── Properties Service
    ├── Payment Service
    └── Auth Service

RMS
    ├── Customer Service (partial)
    ├── Properties Service
    └── [Contract Service - planned]
    └── [Tenant Service - planned]

Customer
    ├── Auth Service
    └── Booking Service

Inbox
    ├── Messaging Service
    ├── Realtime Messaging Service
    └── Auth Service

Admin
    ├── Admin Service
    ├── Properties Service
    ├── Payment Service
    ├── Auth Service
    └── Messaging Service
```

---

## Module Integration Points

### Marketplace ↔ Admin
- Property approval workflow
- Booking management
- Payment verification

### Marketplace ↔ Inbox
- Auto-conversation creation on booking
- Property-related messaging
- Booking dispute resolution

### RMS ↔ Admin
- Customer management
- Contract approval
- Rent collection oversight

### Customer ↔ Marketplace
- Booking history
- Payment history
- Review management

### Customer ↔ Inbox
- Support conversations
- Notification delivery

---

## Module Status Summary

| Module | Frontend | Backend | Database | Overall |
|--------|----------|---------|----------|---------|
| Marketplace | 90% | 85% | 100% | 85% |
| RMS | 40% | 10% | 0% | 25% |
| Customer | 95% | 90% | 100% | 95% |
| Inbox | 90% | 80% | 100% | 80% |
| Admin | 95% | 90% | 100% | 90% |

---

## Future Module Enhancements

### Marketplace
- Advanced search filters
- Saved searches
- Property comparison
- Wishlist management
- Review moderation

### RMS
- Complete backend implementation
- Building management
- Unit management
- Maintenance requests
- Rent collection automation
- Lease renewal workflows

### Customer
- Advanced profile features
- Document management
- Communication preferences
- Support ticket system

### Inbox
- Message templates
- Automated responses
- Chatbot integration
- Video messaging
- File sharing enhancements

### Admin
- Advanced analytics
- Custom reports
- Bulk operations
- Workflow automation
- Integration marketplace

---

**Document Owner:** Development Team  
**Last Updated:** June 2, 2026  
**Next Review:** After RMS module completion
