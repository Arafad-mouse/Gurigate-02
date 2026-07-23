# GuriGate Module Documentation

**Document Version:** 1.0  
**Date:** June 2, 2026  
**Author:** System Architecture Team

---

## 1. Overview

The GuriGate platform is composed of several distinct modules, each responsible for specific business domains. This document provides detailed documentation for each module, including their purpose, features, components, data flows, and integration points.

### Module List

1. **Marketplace Module** - Property discovery and booking
2. **RMS (Rental Management System) Module** - Long-term rental management
3. **Customer Module** - Customer lifecycle management
4. **Inbox Module** - Messaging and communication
5. **Admin Module** - Platform administration

---

## 2. Marketplace Module

### 2.1 Purpose

The Marketplace module is the core public-facing module of GuriGate, enabling guests to discover, search, view, and book properties for short-term rentals.

### 2.2 Features

**Property Discovery:**
- Search by location, dates, guests, amenities
- Filter by property type, price range, rating
- Sort by relevance, price, rating, newest
- Map-based property search

**Property Viewing:**
- Property detail pages
- Image galleries
- Property features and amenities
- Pricing information
- Reviews and ratings
- Host information

**Booking Flow:**
- Date selection with availability calendar
- Guest count selection
- Price calculation
- Payment processing
- Booking confirmation

**User Features:**
- Wishlist/favorites
- Booking history
- Profile management
- Reviews and ratings

### 2.3 Components

**Frontend Components:**
- Property listing pages
- Property detail pages
- Search/filter components
- Booking wizard
- Payment pages
- User dashboard
- Review components

**Backend Components:**
- Property search API
- Availability checking
- Booking creation
- Payment processing
- Review management

### 2.4 Data Flow

```
Guest Search
  ↓
Property Query (with filters)
  ↓
Property List Display
  ↓
Guest Selects Property
  ↓
Property Detail View
  ↓
Guest Selects Dates & Guests
  ↓
Availability Check
  ↓
Price Calculation
  ↓
Booking Creation
  ↓
Payment Processing
  ↓
Booking Confirmation
```

### 2.5 Integration Points

**Database:**
- `properties` table
- `property_bookings` table
- `payments` table
- `property_reviews` table
- `wishlists` table

**Services:**
- `paymentService.ts` - Payment processing
- `authService.ts` - User authentication
- Property-related services (to be organized)

**External APIs:**
- Dodo Payments API
- Mapping services (future)

### 2.6 Permission Requirements

**Guest Role:**
- View properties
- Create bookings
- View own bookings
- Submit reviews
- Manage wishlist

**Host Role:**
- Create properties
- View own properties
- View bookings for own properties
- Respond to reviews

---

## 3. RMS (Rental Management System) Module

### 3.1 Purpose

The RMS module manages long-term rental operations, including contracts, tenant management, unit management, and lease administration. This module is designed for property managers handling multiple properties and long-term tenants.

### 3.2 Features

**Contract Management:**
- Contract creation and templates
- Lease term management
- Rent collection tracking
- Contract renewals
- Contract termination

**Tenant Management:**
- Tenant onboarding
- Tenant profiles
- Tenant screening (future)
- Tenant communication
- Tenant history

**Unit Management:**
- Unit inventory
- Unit availability
- Unit assignment
- Unit maintenance

**Financial Management:**
- Rent tracking
- Payment history
- Late fee calculation
- Financial reporting

### 3.3 Components

**Frontend Components:**
- Contract management pages
- Tenant management pages
- Unit management pages
- Financial dashboard
- RMS-specific messaging

**Backend Components:**
- Contract CRUD operations
- Tenant lifecycle management
- Unit assignment logic
- Rent calculation
- Payment tracking

### 3.4 Data Flow

```
Property Manager Creates Unit
  ↓
Assign to Property
  ↓
Tenant Application
  ↓
Tenant Screening (future)
  ↓
Contract Creation
  ↓
Contract Signing (future)
  ↓
Unit Assignment
  ↓
Rent Collection Cycle
  ↓
Payment Tracking
  ↓
Contract Renewal/Termination
```

### 3.5 Integration Points

**Database:**
- RMS-specific tables (to be implemented)
- `profiles` table (tenant data)
- `properties` table (property/unit data)
- `payments` table (rent payments)

**Services:**
- `customerService.ts` - Currently uses mock data
- RMS-specific services (to be implemented)

**Messaging:**
- RMS-specific conversation types
- Contract/tenant/unit references in conversations

### 3.6 Status

**Current Status:** Partially implemented

**Implemented:**
- Messaging system supports RMS conversation types
- Customer service with mock data

**To Be Implemented:**
- RMS-specific database tables
- Contract management UI
- Tenant management UI
- Unit management UI
- Rent collection logic

---

## 4. Customer Module

### 4.1 Purpose

The Customer module manages the complete lifecycle of customers on the platform, from lead generation to active engagement and account management. It provides tools for customer relationship management (CRM) and customer support.

### 4.2 Features

**Customer Management:**
- Customer profiles
- Customer segmentation (tenant, renter, buyer, guest)
- Customer status tracking (lead, active, inactive, suspended)
- Customer timeline

**Booking & Payment History:**
- View customer bookings
- View payment history
- View contracts (for tenants)
- View property associations

**Customer Actions:**
- Create new customer
- Update customer information
- Assign properties
- Create contracts
- Suspend customer
- Export customer data

**Customer Dashboard:**
- Customer metrics and KPIs
- Activity timeline
- Quick actions

### 4.3 Components

**Frontend Components:**
- Customer list page with filters
- Customer detail drawer
- Customer overview tab
- Customer bookings tab
- Customer payments tab
- Customer contracts tab
- Customer properties tab
- Customer timeline tab
- Add/edit customer modals
- Assign property drawer
- Create contract drawer
- Suspend customer modal

**Backend Components:**
- Customer CRUD operations
- Customer metrics calculation
- Timeline event tracking
- Customer export functionality

### 4.4 Data Flow

```
Lead Generation
  ↓
Customer Creation
  ↓
Customer Profile Setup
  ↓
Customer Engagement
  ↓
Booking/Contract Creation
  ↓
Payment Processing
  ↓
Customer Lifecycle Management
  ↓
Customer Support
```

### 4.5 Integration Points

**Database:**
- `profiles` table (customer data)
- `property_bookings` table (booking history)
- `payments` table (payment history)
- RMS contract tables (future)

**Services:**
- `customerService.ts` - Customer management API
- `adminService.ts` - Admin operations

**Messaging:**
- Customer support conversations
- Direct messaging with customers

### 4.6 Status

**Current Status:** Frontend implemented with mock data

**Implemented:**
- Complete frontend UI for customer management
- Mock data service
- All tabs and modals

**To Be Implemented:**
- Backend API integration
- Real database queries
- Customer metrics calculation
- Timeline event tracking
- Export functionality

---

## 5. Inbox Module

### 5.1 Purpose

The Inbox module provides a comprehensive messaging and communication system for the platform, enabling users to communicate about bookings, properties, payments, and support issues.

### 5.2 Features

**Conversation Management:**
- Multiple conversation types (direct, booking, property, payment, support, RMS)
- Conversation status tracking (active, archived, closed)
- Priority levels (low, normal, high, urgent)
- Assignment to specific users

**Messaging:**
- Real-time messaging
- Multiple content types (text, image, document)
- Message attachments
- Internal notes (admin only)
- Message search

**Participant Management:**
- Add/remove participants
- Participant roles
- Mute participants
- Read status tracking

**Context Integration:**
- Link conversations to bookings
- Link conversations to properties
- Link conversations to payments
- Link conversations to RMS entities

### 5.3 Components

**Frontend Components:**
- Conversation list view
- Conversation detail view
- Message composition
- Attachment upload
- Participant management
- Conversation filters and search
- Unread count indicators

**Backend Components:**
- Conversation CRUD operations
- Message sending and receiving
- Real-time subscriptions
- Full-text search
- Read status management

### 5.4 Data Flow

```
User Initiates Conversation
  ↓
Select Conversation Type
  ↓
Create Conversation
  ↓
Add Participants
  ↓
Send Message
  ↓
Real-time Delivery to Participants
  ↓
Participants Read Message
  ↓
Update Read Status
  ↓
Continue Conversation Thread
```

### 5.5 Integration Points

**Database:**
- `conversations` table
- `conversation_participants` table
- `messages` table
- `message_attachments` table

**Services:**
- `messagingService.ts` - Messaging API

**Real-time:**
- Supabase Realtime subscriptions
- WebSocket connections

**Other Modules:**
- Marketplace (booking conversations)
- RMS (contract/tenant/unit conversations)
- Customer (support conversations)

### 5.6 Permission Requirements

**Guest Role:**
- Send messages
- Read own conversations
- Participate in conversations they're part of

**Host Role:**
- Send messages
- Read conversations for their properties
- Participate in booking conversations

**Admin Role:**
- All guest/host permissions
- View internal notes
- Send internal notes
- Manage all conversations
- Assign conversations

---

## 6. Admin Module

### 6.1 Purpose

The Admin module provides administrative tools for managing the platform, including property approval, user moderation, payment verification, and system monitoring.

### 6.2 Features

**Dashboard:**
- KPIs and metrics
- Overview statistics
- Recent activity
- Quick actions

**Property Management:**
- View pending properties
- Approve properties
- Reject properties
- Suspend properties
- View all properties

**Booking Management:**
- View all bookings
- Cancel bookings
- Resolve disputes
- Add admin notes

**Payment Management:**
- View pending payments
- Verify payments
- Reject payments
- View payment history

**User Management:**
- View all users
- Ban users
- Unban users
- Verify hosts
- View user profiles

**Audit Logging:**
- View admin activity logs
- Filter by action, admin, date
- Export logs (future)

**Customer Management:**
- Customer list with filters
- Customer details
- Customer timeline
- Customer actions

### 6.3 Components

**Frontend Components:**
- Admin dashboard
- Property management pages
- Booking management pages
- Payment management pages
- User management pages
- Customer management pages
- Audit log viewer (future)

**Backend Components:**
- Admin RPC functions
- Dashboard KPI calculation
- Audit logging
- Permission checking

### 6.4 Data Flow

```
Admin Logs In
  ↓
Access Dashboard
  ↓
View KPIs and Metrics
  ↓
Navigate to Management Area
  ↓
Perform Action (approve, ban, verify, etc.)
  ↓
Action Validated
  ↓
RPC Function Executed
  ↓
Database Updated
  ↓
Activity Logged
  ↓
UI Updated
```

### 6.5 Integration Points

**Database:**
- All tables (admin access)
- `admin_activity_logs` table

**Services:**
- `adminService.ts` - Admin operations API

**RPC Functions:**
- Property approval/rejection
- User ban/unban
- Payment verification
- Audit logging

**Other Modules:**
- Marketplace (property management)
- Customer (customer management)
- Inbox (support conversations)

### 6.6 Permission Requirements

**Manager Role:**
- View dashboard KPIs
- Approve/reject properties
- Verify hosts
- Verify payments
- Resolve disputes

**Admin Role:**
- All manager permissions
- Ban/unban users
- View all data
- Manage all entities

**Super Admin Role:**
- All admin permissions
- Full system access
- Manage other admins

---

## 7. Module Interactions

### 7.1 Marketplace ↔ RMS

**Interaction Points:**
- Properties can be listed for both short-term (Marketplace) and long-term (RMS)
- Tenant conversion from guest to tenant
- Property data shared between modules

**Data Flow:**
- Guest completes booking → Becomes tenant → Contract created in RMS
- Property listed in Marketplace → Available for RMS assignment

### 7.2 Marketplace ↔ Customer

**Interaction Points:**
- Customer profiles used for both booking and CRM
- Booking history feeds customer timeline
- Customer segmentation based on activity

**Data Flow:**
- User registers → Customer profile created
- Guest makes booking → Added to customer timeline
- Customer support via Inbox

### 7.3 Marketplace ↔ Inbox

**Interaction Points:**
- Booking conversations linked to bookings
- Property inquiries linked to properties
- Payment discussions linked to payments

**Data Flow:**
- Guest books property → Conversation auto-created
- Host responds via conversation
- Payment discussion linked to booking

### 7.4 RMS ↔ Customer

**Interaction Points:**
- Tenant profiles as customer type
- Contract history in customer timeline
- Property assignments

**Data Flow:**
- Tenant onboarded → Customer profile updated
- Contract created → Added to customer timeline
- Property assigned → Customer property list updated

### 7.5 RMS ↔ Inbox

**Interaction Points:**
- RMS-specific conversation types
- Contract discussions
- Tenant communications
- Unit management discussions

**Data Flow:**
- Contract created → Conversation created
- Tenant issue → Support conversation
- Unit maintenance → Discussion with contractor

### 7.6 Customer ↔ Inbox

**Interaction Points:**
- Customer support conversations
- Direct messaging with customers
- Communication history in timeline

**Data Flow:**
- Customer issue raised → Support conversation created
- Messages added to customer timeline
- Resolution tracked

### 7.7 Admin ↔ All Modules

**Interaction Points:**
- Admin oversight of all modules
- Audit logging across all actions
- Permission enforcement

**Data Flow:**
- Admin performs action → Logged to audit trail
- Admin manages data across modules
- Admin monitors system health

---

## 8. Module Architecture Patterns

### 8.1 Service Layer Pattern

Each module has a dedicated service layer:

- `paymentService.ts` - Payment module
- `messagingService.ts` - Inbox module
- `adminService.ts` - Admin module
- `customerService.ts` - Customer module
- Property services (to be organized)

**Benefits:**
- Separation of concerns
- Reusable business logic
- Type-safe API interfaces
- Easy testing

### 8.2 Component Organization

Modules are organized by feature:

```
src/
├── components/
│   ├── admin/           # Admin module components
│   ├── host-onboarding/ # Marketplace module
│   └── ui/              # Shared UI components
├── pages/
│   ├── admin/           # Admin module pages
│   └── ...              # Other module pages
└── services/            # Service layer
```

### 8.3 Database Schema Organization

Tables are organized by module:

**Marketplace:**
- properties
- property_addresses
- property_pricing
- property_features
- property_images
- property_reviews
- property_bookings
- wishlists

**RMS:**
- (To be implemented)
- rms_contracts
- rms_tenants
- rms_units

**Customer:**
- profiles (shared)
- Customer-specific fields in profiles

**Inbox:**
- conversations
- conversation_participants
- messages
- message_attachments

**Admin:**
- admin_activity_logs
- Shared tables with admin access

**Payment:**
- payments (shared across modules)

---

## 9. Module Status Summary

### 9.1 Marketplace Module

**Status:** Fully Implemented

**Features:**
- Property discovery and search
- Property viewing
- Booking flow
- Payment processing
- Reviews and ratings
- Wishlist

**Completion:** 95%

### 9.2 RMS Module

**Status:** Partially Implemented

**Features:**
- Messaging support for RMS types
- Customer service foundation

**Missing:**
- RMS-specific database tables
- Contract management UI
- Tenant management UI
- Unit management UI
- Rent collection logic

**Completion:** 20%

### 9.3 Customer Module

**Status:** Frontend Implemented

**Features:**
- Complete frontend UI
- All tabs and modals
- Mock data service

**Missing:**
- Backend API integration
- Real database queries
- Metrics calculation
- Timeline tracking

**Completion:** 60%

### 9.4 Inbox Module

**Status:** Fully Implemented

**Features:**
- Complete messaging system
- Real-time updates
- Multiple conversation types
- Attachment support
- Search functionality
- Read status tracking

**Completion:** 95%

### 9.5 Admin Module

**Status:** Fully Implemented

**Features:**
- Admin dashboard
- Property management
- Booking management
- Payment management
- User management
- Customer management
- Audit logging

**Completion:** 90%

---

## 10. Future Module Enhancements

### 10.1 Marketplace Enhancements

- Advanced search with AI recommendations
- Dynamic pricing
- Loyalty program
- Group bookings
- Experience bookings (tours, activities)

### 10.2 RMS Enhancements

- Complete RMS implementation
- Automated rent collection
- Tenant screening integration
- Maintenance request system
- Financial reporting
- Lease document generation

### 10.3 Customer Enhancements

- CRM integration
- Marketing automation
- Customer segmentation
- Lead scoring
- Customer journey mapping

### 10.4 Inbox Enhancements

- Video messaging
- Voice messages
- Automated responses
- Chatbot integration
- Multi-language support

### 10.5 Admin Enhancements

- Advanced analytics
- Custom reports
- Workflow automation
- Integration marketplace
- API management

---

## 11. Documentation References

**Related Documents:**
- Frontend Architecture Document
- Backend Architecture Document
- Database Documentation
- Business Logic Documentation

**Code References:**
- `src/services/` - Service layer
- `src/components/admin/` - Admin module
- `src/pages/admin/` - Admin pages
- `src/services/messagingService.ts` - Inbox module
- `src/services/customerService.ts` - Customer module

---

**End of Module Documentation**
