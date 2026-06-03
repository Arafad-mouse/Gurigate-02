# GuriGate System Architecture Map

**Document Version:** 1.0  
**Date:** June 2, 2026  
**Author:** System Architecture Team

---

## 1. Overview

This document provides a comprehensive system architecture map of the GuriGate platform, illustrating how all components, modules, services, and data flows interact. It serves as a visual and textual reference for understanding the complete system architecture.

### Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│                    (React Frontend)                       │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                      │
│              (Services, Hooks, Context)                   │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    API Layer                              │
│           (Supabase Client, Edge Functions)              │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    Data Layer                             │
│            (PostgreSQL, Storage, Realtime)                │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                External Services Layer                    │
│          (Dodo Payments, Wallet Providers)                │
└─────────────────────────────────────────────────────────┘
```

---

## 2. High-Level Architecture

### 2.1 System Components

```
┌──────────────────────────────────────────────────────────────┐
│                        GuriGate Platform                       │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Marketplace │  │     RMS      │  │   Customer   │      │
│  │    Module    │  │   Module     │  │   Module     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Inbox     │  │    Admin     │  │  Payment     │      │
│  │   Module     │  │   Module     │  │   Module     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│                    Shared Services                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Auth      │  │  Messaging   │  │   Storage    │      │
│  │  Service     │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                      Supabase Backend                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ PostgreSQL   │  │   Storage    │  │   Realtime   │      │
│  │   Database   │  │    Service   │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │     Auth     │  │ Edge Funcs   │                         │
│  │   Service    │  │   (Deno)     │                         │
│  └──────────────┘  └──────────────┘                         │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                   External Integrations                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Dodo Pay    │  │ Wallet APIs  │  │  Map Service │      │
│  │     API      │  │   (Zaad etc) │  │  (Future)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Module Architecture

### 3.1 Marketplace Module Architecture

```
Marketplace Module
│
├── Frontend Components
│   ├── Property Listing Page
│   ├── Property Detail Page
│   ├── Search/Filter Components
│   ├── Booking Form
│   └── Review Components
│
├── Services
│   ├── Property Service
│   ├── Booking Service
│   └── Review Service
│
├── Data Models
│   ├── Property
│   ├── Property Address
│   ├── Property Pricing
│   ├── Property Features
│   ├── Property Images
│   ├── Booking
│   └── Review
│
└── Integrations
    ├── Payment Module
    ├── Inbox Module
    └── Customer Module
```

### 3.2 RMS Module Architecture

```
RMS Module (Partially Implemented)
│
├── Frontend Components
│   ├── Contract Management (To Be Implemented)
│   ├── Tenant Management (To Be Implemented)
│   ├── Unit Management (To Be Implemented)
│   └── Financial Dashboard (To Be Implemented)
│
├── Services
│   ├── Contract Service (To Be Implemented)
│   ├── Tenant Service (To Be Implemented)
│   └── Unit Service (To Be Implemented)
│
├── Data Models (To Be Implemented)
│   ├── RMS Contract
│   ├── RMS Tenant
│   ├── RMS Unit
│   └── RMS Payment
│
└── Integrations
    ├── Customer Module
    ├── Inbox Module
    └── Payment Module
```

### 3.3 Customer Module Architecture

```
Customer Module
│
├── Frontend Components
│   ├── Customer List Page
│   ├── Customer Detail Drawer
│   ├── Overview Tab
│   ├── Bookings Tab
│   ├── Payments Tab
│   ├── Contracts Tab
│   ├── Properties Tab
│   └── Timeline Tab
│
├── Services
│   ├── Customer Service (Mock Data)
│   └── Timeline Service (To Be Implemented)
│
├── Data Models
│   ├── Profile (Customer Data)
│   ├── Booking History
│   ├── Payment History
│   └── Contract (Future RMS)
│
└── Integrations
    ├── Marketplace Module
    ├── RMS Module
    ├── Inbox Module
    └── Payment Module
```

### 3.4 Inbox Module Architecture

```
Inbox Module
│
├── Frontend Components
│   ├── Conversation List
│   ├── Conversation Detail
│   ├── Message Input
│   ├── Attachment Upload
│   └── Search/Filter
│
├── Services
│   ├── Messaging Service
│   ├── Conversation Service
│   └── Attachment Service
│
├── Data Models
│   ├── Conversation
│   ├── Conversation Participant
│   ├── Message
│   └── Message Attachment
│
└── Integrations
    ├── Marketplace Module
    ├── RMS Module
    ├── Customer Module
    ├── Admin Module
    └── Payment Module
```

### 3.5 Admin Module Architecture

```
Admin Module
│
├── Frontend Components
│   ├── Dashboard
│   ├── Property Management
│   ├── Booking Management
│   ├── Payment Management
│   ├── User Management
│   └── Customer Management
│
├── Services
│   ├── Admin Service
│   ├── Property Admin Service
│   ├── Booking Admin Service
│   ├── Payment Admin Service
│   └── User Admin Service
│
├── Data Models
│   ├── Admin Activity Log
│   └── All Module Data (Read/Write)
│
└── Integrations
    ├── All Modules
    └── Audit Logging
```

---

## 4. Data Flow Architecture

### 4.1 Authentication Flow

```
User
  ↓
Login Page
  ↓
authService.signInWithEmail()
  ↓
Supabase Auth
  ↓
JWT Token Generated
  ↓
AuthProvider Context Updated
  ↓
User Profile Hydrated
  ↓
Access Granted to Protected Routes
```

### 4.2 Property Creation Flow

```
Host
  ↓
Host Onboarding Wizard (17 Steps)
  ↓
Property Data Collected
  ↓
Images Uploaded to Storage
  ↓
Property Created in Database
  │
  ├→ properties table
  ├→ property_addresses table
  ├→ property_pricing table
  ├→ property_features table
  └→ property_images table
  ↓
Status: draft
  ↓
Host Submits for Review
  ↓
Status: pending
  ↓
Admin Review
  ↓
Status: approved or rejected
```

### 4.3 Booking Flow

```
Guest
  ↓
Property Search
  ↓
Property Detail View
  ↓
Select Dates & Guests
  ↓
Availability Check
  │
  ├→ Check property status
  ├→ Check booking_date_locks
  └→ Validate date range
  ↓
Price Calculation
  ↓
Booking Created
  │
  ├→ property_bookings table
  └→ booking_date_locks table
  ↓
Payment Initiated
  ↓
Payment Processing
  │
  ├→ Card Payment: Dodo API
  └→ Wallet Payment: Manual verification
  ↓
Payment Verified
  ↓
Booking Confirmed
  ↓
Notifications Sent (Future)
```

### 4.4 Payment Flow

```
User
  ↓
Initiate Payment
  │
  ├→ Card Payment: paymentService.createDodoCheckout()
  │   ↓
  │   Edge Function: create-dodo-checkout
  │   ↓
  │   Dodo Payments API
  │   ↓
  │   Checkout URL Returned
  │   ↓
  │   User Completes Payment
  │   ↓
  │   Webhook Updates Status (Future)
  │
  └→ Wallet Payment: paymentService.createWalletPayment()
      ↓
      create_local_wallet_payment() RPC
      ↓
      Payment Record Created (status: submitted)
      ↓
      Admin Verification
      ↓
      verify_payment() RPC
      ↓
      Booking Confirmed
```

### 4.5 Messaging Flow

```
User
  ↓
Initiate Conversation
  ↓
create_conversation() RPC
  │
  ├→ conversations table
  └→ conversation_participants table
  ↓
Send Message
  ↓
send_message() RPC
  │
  └→ messages table
  ↓
Real-time Push (Supabase Realtime)
  ↓
Participants Receive Message
  ↓
Update Read Status
  ↓
mark_conversation_read() RPC
```

---

## 5. Database Architecture Map

### 5.1 Table Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                    Core Tables                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  profiles (auth.users linked)                                │
│    ├→ properties (owner_id)                                 │
│    ├→ property_bookings (guest_id)                           │
│    ├→ payments (user_id)                                    │
│    ├→ conversations (initiated_by)                           │
│    └→ conversation_participants (user_id)                   │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                    Property Tables                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  properties                                                  │
│    ├→ property_addresses (property_id)                      │
│    ├→ property_pricing (property_id)                        │
│    ├→ property_features (property_id)                       │
│    ├→ property_images (property_id)                         │
│    ├→ property_bookings (property_id)                       │
│    └→ wishlists (property_id)                               │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                    Booking Tables                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  property_bookings                                           │
│    ├→ booking_date_locks (booking_id)                       │
│    ├→ payments (booking_id)                                 │
│    └→ conversations (entity_id)                             │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                    Payment Tables                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  payments                                                    │
│    ├→ property_bookings (booking_id)                        │
│    └→ conversations (entity_id)                             │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                    Messaging Tables                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  conversations                                               │
│    ├→ conversation_participants (conversation_id)           │
│    └→ messages (conversation_id)                            │
│                                                               │
│  messages                                                    │
│    └→ message_attachments (message_id)                      │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                    Admin Tables                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  admin_activity_logs                                         │
│    └→ profiles (admin_id)                                   │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                    Notification Tables                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  notifications                                               │
│    └→ profiles (user_id)                                    │
│                                                               │
│  notification_queue                                          │
│    └→ notifications (notification_id)                       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Database Schema Map

**Public Schema Tables:**
- profiles
- properties
- property_addresses
- property_pricing
- property_features
- property_images
- property_bookings
- booking_date_locks
- payments
- conversations
- conversation_participants
- messages
- message_attachments
- wishlists
- property_reviews
- admin_activity_logs
- notifications
- notification_queue

**Auth Schema Tables (Supabase):**
- users
- identities
- sessions
- refresh_tokens
- mfa_factors

**Storage Buckets:**
- property-images
- avatars

---

## 6. Service Architecture

### 6.1 Service Layer Map

```
src/services/
│
├── authService.ts
│   ├── signUpWithEmail()
│   ├── signInWithEmail()
│   ├── signOutUser()
│   ├── updateProfile()
│   ├── updatePassword()
│   └── resetPassword()
│
├── paymentService.ts
│   ├── createDodoCheckout()
│   ├── createWalletPayment()
│   └── getPaymentStatus()
│
├── messagingService.ts
│   ├── getConversations()
│   ├── getConversationById()
│   ├── createConversation()
│   ├── send()
│   ├── markAsRead()
│   └── getUnreadCount()
│
├── adminService.ts
│   ├── approveProperty()
│   ├── rejectProperty()
│   ├── banUser()
│   ├── unbanUser()
│   ├── verifyHost()
│   ├── verifyPayment()
│   ├── rejectPayment()
│   └── getAdminLogs()
│
└── customerService.ts
    ├── getCustomers()
    ├── getCustomerById()
    ├── createCustomer()
    ├── updateCustomer()
    ├── deleteCustomer()
    ├── suspendCustomer()
    └── exportCustomers()
```

### 6.2 RPC Functions Map

**Property Management:**
- approve_property()
- reject_property()
- suspend_property()
- unsuspend_property()

**User Management:**
- ban_user()
- unban_user()
- verify_host()
- update_user_permissions()

**Payment Management:**
- create_local_wallet_payment()
- verify_payment()
- reject_payment()
- refund_payment()

**Messaging:**
- create_conversation()
- send_message()
- mark_conversation_read()
- add_conversation_participant()
- remove_conversation_participant()

**Admin Logging:**
- log_admin_activity()
- get_admin_activity_logs()

---

## 7. Edge Functions Architecture

### 7.1 Edge Functions Map

```
supabase/functions/
│
├── create-dodo-checkout
│   ├── Validates booking
│   ├── Calls Dodo Payments API
│   ├── Creates checkout session
│   └── Returns checkout URL
│
├── process-dodo-webhook (To Be Implemented)
│   ├── Receives webhook from Dodo
│   ├── Verifies signature
│   ├── Updates payment status
│   └── Confirms booking
│
└── send-notification (To Be Implemented)
    ├── Queues notification
    ├── Processes delivery
    ├── Updates status
    └── Retries on failure
```

---

## 8. Frontend Architecture Map

### 8.1 Component Hierarchy

```
App.tsx
├── BrowserRouter
├── AuthProvider
│   ├── AuthContext
│   └── useAuth() hook
├── LanguageProvider
│   ├── LanguageContext
│   └── useLanguage() hook
└── Routes
    ├── Public Routes
    │   ├── Home
    │   ├── Marketplace
    │   └── Property Detail
    ├── Protected Routes
    │   ├── Profile
    │   ├── Notifications
    │   ├── Integrations
    │   └── Payment
    ├── Host Routes
    │   └── Host Onboarding
    └── Admin Routes
        ├── Admin Dashboard
        ├── Admin Properties
        ├── Admin Bookings
        ├── Admin Payments
        ├── Admin Users
        └── Customers
```

### 8.2 Context Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Context Providers                     │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  AuthProvider                                             │
│  ├── user: User | null                                   │
│  ├── profile: Profile | null                             │
│  ├── loading: boolean                                    │
│  └── Methods: signIn, signUp, signOut, updateProfile     │
│                                                           │
│  LanguageProvider                                         │
│  ├── language: string                                    │
│  ├── setLanguage: (lang: string) => void                 │
│  └── translations: object                                 │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### 8.3 Hook Architecture

```
src/hooks/
│
├── useAuth.ts
│   └── Returns auth state and methods
│
├── useProfile.ts
│   └── Returns profile data and update functions
│
├── useRole.ts
│   └── Returns role and role-based access
│
├── usePermissions.ts
│   └── Returns permissions and permission checks
│
├── useProperties.ts
│   └── Returns property data and operations
│
├── useBookings.ts
│   └── Returns booking data and operations
│
└── useMessages.ts
    └── Returns messaging data and operations
```

---

## 9. Integration Architecture

### 9.1 External Integrations Map

```
┌─────────────────────────────────────────────────────────┐
│              External Integrations                        │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Dodo Payments                                           │
│  ├── API: Card payment processing                        │
│  ├── Webhook: Payment status updates (future)            │
│  └── Integration: Edge Functions                         │
│                                                           │
│  Wallet Providers (Zaad, eDahab, Premier, Wadaag)        │
│  ├── API: Not integrated                                 │
│  ├── Manual: Phone verification                          │
│  └── Integration: Manual admin verification              │
│                                                           │
│  Mapping Services (Future)                               │
│  ├── API: Property location mapping                      │
│  └── Integration: Frontend components                    │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### 9.2 Module Integration Map

```
┌─────────────────────────────────────────────────────────┐
│              Module Interdependencies                     │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Marketplace ↔ RMS                                       │
│  └── Property sharing, tenant conversion                 │
│                                                           │
│  Marketplace ↔ Customer                                  │
│  └── Profile sharing, booking history                    │
│                                                           │
│  Marketplace ↔ Inbox                                     │
│  └── Booking conversations, property inquiries           │
│                                                           │
│  RMS ↔ Customer                                          │
│  └── Tenant profiles, contract history                   │
│                                                           │
│  RMS ↔ Inbox                                             │
│  └── RMS-specific conversations                          │
│                                                           │
│  Customer ↔ Inbox                                        │
│  └── Support conversations, communication history        │
│                                                           │
│  Admin ↔ All Modules                                     │
│  └── Oversight, audit logging, management                │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 10. Security Architecture

### 10.1 Security Layer Map

```
┌─────────────────────────────────────────────────────────┐
│                  Security Layers                          │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Authentication Layer                                    │
│  ├── Supabase Auth (JWT)                                 │
│  ├── Password hashing (bcrypt)                           │
│  └── Session management                                  │
│                                                           │
│  Authorization Layer                                     │
│  ├── RBAC (Roles: guest, host, manager, admin, super)    │
│  ├── Granular permissions (28+ permissions)              │
│  └── Permission checking (hooks, RLS, RPC)               │
│                                                           │
│  Data Access Layer                                       │
│  ├── Row-Level Security (RLS)                            │
│  ├── Column-level security                               │
│  └── Service role bypass                                 │
│                                                           │
│  Network Security Layer                                  │
│  ├── TLS/SSL encryption                                  │
│  ├── CORS configuration                                  │
│  └── Secure headers (to be implemented)                  │
│                                                           │
│  Audit Layer                                             │
│  ├── Admin activity logging                              │
│  └── Audit trail                                         │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 11. Deployment Architecture

### 11.1 Deployment Map

```
┌─────────────────────────────────────────────────────────┐
│                  Deployment Architecture                  │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Frontend                                                 │
│  ├── Build: Vite                                         │
│  ├── Hosting: Vercel (to be configured)                  │
│  └── CDN: Vercel CDN                                     │
│                                                           │
│  Backend                                                  │
│  ├── Database: Supabase PostgreSQL                       │
│  ├── Storage: Supabase Storage                           │
│  ├── Auth: Supabase Auth                                 │
│  ├── Realtime: Supabase Realtime                         │
│  └── Edge Functions: Supabase Deno                       │
│                                                           │
│  External Services                                       │
│  ├── Dodo Payments: Cloud API                            │
│  └── Wallet Providers: Manual integration                │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 12. Technology Stack Map

### 12.1 Technology Map

```
┌─────────────────────────────────────────────────────────┐
│                  Technology Stack                         │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Frontend                                                 │
│  ├── Framework: React 19                                 │
│  ├── Language: TypeScript 5.x                            │
│  ├── Build: Vite 5.x                                     │
│  ├── Routing: React Router DOM 6.x                       │
│  ├── Styling: TailwindCSS 3.x                            │
│  ├── Components: shadcn/ui                               │
│  └── State: React Context API                            │
│                                                           │
│  Backend                                                  │
│  ├── Platform: Supabase                                  │
│  ├── Database: PostgreSQL                                │
│  ├── Auth: Supabase Auth                                 │
│  ├── Storage: Supabase Storage                           │
│  ├── Realtime: Supabase Realtime                         │
│  └── Edge Functions: Deno                                │
│                                                           │
│  External                                                 │
│  ├── Payments: Dodo Payments API                         │
│  └── Wallets: Manual integration                         │
│                                                           │
│  Development                                              │
│  ├── Package Manager: npm                                │
│  ├── Version Control: Git                                │
│  └── Linting: ESLint                                     │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 13. Data Architecture

### 13.1 Data Flow Map

```
┌─────────────────────────────────────────────────────────┐
│                    Data Flows                             │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  User Data Flow                                           │
│  Auth.users → profiles → All modules                     │
│                                                           │
│  Property Data Flow                                       │
│  Host → properties → Related tables → Marketplace        │
│                                                           │
│  Booking Data Flow                                        │
│  Guest → booking → date_locks → payment → confirmation  │
│                                                           │
│  Payment Data Flow                                        │
│  User → payment → external_provider → status_update     │
│                                                           │
│  Messaging Data Flow                                      │
│  User → conversation → messages → realtime_push          │
│                                                           │
│  Admin Data Flow                                          │
│  Admin → action → database → audit_log                   │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 14. Architecture Patterns

### 14.1 Design Patterns Used

**Service Layer Pattern:**
- Business logic in service layer
- Reusable across components
- Type-safe interfaces

**Repository Pattern:**
- Database access abstraction
- Supabase client as repository

**Context Pattern:**
- Global state management
- Auth and language contexts

**Component Composition:**
- Reusable UI components
- shadcn/ui component library

**Hook Pattern:**
- Custom hooks for state logic
- Reusable across components

**RLS Pattern:**
- Database-level authorization
- Row-level security policies

**RPC Pattern:**
- Server-side business logic
- Database functions

---

## 15. Scalability Architecture

### 15.1 Scalability Considerations

**Database Scalability:**
- Supabase manages PostgreSQL scaling
- Connection pooling
- Read replicas (to be configured)

**Application Scalability:**
- Stateless frontend
- CDN for static assets
- Edge functions for server logic

**Storage Scalability:**
- Supabase Storage auto-scales
- CDN for image delivery
- Image optimization (to be implemented)

**Real-time Scalability:**
- Supabase Realtime handles connections
- WebSocket connection management

---

## 16. Documentation References

**Related Documents:**
- Frontend Architecture Document
- Backend Architecture Document
- Database Documentation
- Business Logic Documentation
- Module Documentation
- Security Documentation
- UI Inventory

**Code References:**
- `src/` - Source code structure
- `supabase/migrations/` - Database schema
- `supabase/functions/` - Edge functions

---

**End of System Architecture Map**
