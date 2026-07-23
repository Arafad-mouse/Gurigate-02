# GuriGate System Architecture Documentation

**Version:** 1.0  
**Date:** June 2, 2026  
**Status:** Production

---

## Executive Summary

GuriGate is a comprehensive property management platform combining short-term rental marketplace, payment processing, administrative management, messaging system, and a planned Rental Management System (RMS). The system is built on a modern tech stack with React frontend, Supabase backend, and real-time capabilities.

**Architecture Type:** Monolithic Frontend with Backend-as-a-Service (BaaS)  
**Primary Stack:** React + TypeScript + Vite + Supabase  
**Current Completion:** ~65%

---

## Technology Stack

### Frontend
- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite
- **Routing:** React Router v6
- **State Management:** React Context API + useState/useReducer
- **UI Components:** Custom components with TailwindCSS
- **Icons:** Lucide React
- **Maps:** Leaflet.js
- **Forms:** Custom form components with validation

### Backend
- **Database:** PostgreSQL via Supabase
- **Authentication:** Supabase Auth
- **Real-time:** Supabase Realtime
- **Storage:** Supabase Storage
- **Edge Functions:** Supabase Edge Functions (Deno)
- **RPC Functions:** Supabase PostgreSQL RPC

### Infrastructure
- **Hosting:** Supabase (BaaS)
- **Database:** Managed PostgreSQL
- **Storage:** Object Storage (Supabase Storage)
- **CDN:** Supabase CDN for static assets

---

## Architecture Diagrams

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   React UI   │  │   State Mgmt │  │   Routing    │      │
│  │  Components  │  │   Context    │  │  React Router│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Service Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Auth Svc   │  │  Payment Svc │  │  Message Svc │      │
│  │  Admin Svc   │  │  Property Svc│  │  Customer Svc│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ PostgreSQL   │  │   Supabase   │  │   Edge Func  │      │
│  │   Database   │  │     Auth     │  │  (Deno)      │      │
│  │              │  │              │  │              │      │
│  │  RLS Policies │  │  Realtime    │  │  Webhooks    │      │
│  │  RPC Funcs   │  │  Storage     │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Module Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      GuriGate Platform                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Marketplace │  │     RMS     │  │    Admin    │        │
│  │   Module    │  │   Module    │  │   Module    │        │
│  │             │  │   (Planned) │  │             │        │
│  │ • Listings  │  │ • Contracts │  │ • Dashboard  │        │
│  │ • Search    │  │ • Tenants   │  │ • Properties │        │
│  │ • Booking   │  │ • Units     │  │ • Bookings   │        │
│  │ • Reviews   │  │ • Buildings │  │ • Payments   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Payment   │  │   Inbox     │  │   Customer  │        │
│  │   Module    │  │   Module    │  │   Module    │        │
│  │             │  │             │  │             │        │
│  │ • Cards     │  │ • Threads   │  │ • Profiles   │        │
│  │ • Wallets   │  │ • Context   │  │ • History    │        │
│  │ • Verify    │  │ • Real-time │  │ • Support    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Component Structure

```
src/
├── components/
│   ├── admin/              # Admin module components
│   │   ├── customer/       # Customer management
│   │   ├── table/          # Reusable table components
│   │   └── entity-card/    # Entity card components
│   ├── host-onboarding/    # Host onboarding flow
│   │   ├── steps/          # Multi-step form steps
│   │   └── Become-host.tsx # Main onboarding component
│   ├── inbox/              # Messaging components
│   │   ├── ConversationList.tsx
│   │   ├── MessageThread.tsx
│   │   ├── MessageComposer.tsx
│   │   └── ContextPanel.tsx
│   ├── payment/            # Payment components
│   ├── ui/                 # Reusable UI components
│   └── [shared components] # Navbar, Footer, Modals, etc.
├── pages/                  # Page components
│   ├── admin/              # Admin pages
│   ├── manage-property/    # RMS pages
│   └── [public pages]      # Landing, property, etc.
├── services/               # Service layer
│   ├── adminService.ts
│   ├── authService.ts
│   ├── paymentService.ts
│   ├── messagingService.ts
│   └── [other services]
├── hooks/                  # Custom React hooks
│   ├── useAuth.ts
│   ├── useRole.ts
│   ├── usePermissions.ts
│   └── [other hooks]
├── lib/                    # Utilities and configurations
│   ├── supabase.ts         # Supabase client
│   ├── auth-context.tsx    # Auth context
│   └── [utilities]
└── types/                  # TypeScript type definitions
```

### State Management Strategy

**Primary Approach:** React Context API  
**Secondary Approach:** Component-level useState/useReducer  
**Global State:** AuthContext for user authentication and profile data

**State Management Patterns:**
- Authentication state: AuthContext (global)
- User permissions: usePermissions hook (derived from AuthContext)
- Component state: useState/useReducer (local)
- Real-time data: Supabase Realtime subscriptions

### Routing Architecture

**Router:** React Router v6  
**Route Structure:**
- `/` - Landing page
- `/property/:id` - Property details
- `/payment` - Payment processing
- `/manage-property` - RMS dashboard
- `/manage-property/inbox` - Messaging
- `/become-a-host` - Host onboarding
- `/profile` - User profile
- `/notifications` - Notifications

**Route Guards:**
- ProtectedAdminRoute - Admin access control
- AuthRouteGuard - Authentication required
- Role-based guards for different user types

---

## Backend Architecture

### Database Architecture

**Database:** PostgreSQL (Supabase)  
**Schema Design:** Relational with foreign key relationships  
**Security:** Row-Level Security (RLS) on all tables

**Key Tables:**
- `profiles` - User profiles and authentication data
- `properties` - Property listings
- `property_addresses` - Property location data
- `property_features` - Property amenities
- `property_pricing` - Pricing information
- `property_images` - Property photos
- `bookings` - Booking records
- `payments` - Payment transactions
- `conversations` - Messaging conversations
- `messages` - Individual messages
- `notifications` - User notifications

### Service Layer Architecture

**Pattern:** Service classes with static methods  
**Authentication:** Supabase client with automatic session management  
**Error Handling:** Custom error classes and try-catch patterns

**Key Services:**
- `AdminService` - Administrative operations
- `AuthService` - Authentication and profile management
- `PaymentService` - Payment processing
- `MessagingService` - Messaging operations
- `HostOnboardingService` - Property creation workflow
- `CustomerService` - Customer management (partial)

### Real-time Architecture

**Provider:** Supabase Realtime  
**Use Cases:**
- Message updates in conversations
- Typing indicators
- Conversation presence
- Notification updates

**Implementation:**
- `realtimeMessagingService.ts` - Real-time messaging logic
- `useRealtimeMessages` hook - React integration
- `useConversationPresence` hook - Presence tracking

---

## Security Architecture

### Authentication Flow

```
User Login
    ↓
Supabase Auth (Email/Password)
    ↓
Session Token Generation
    ↓
AuthContext State Update
    ↓
Profile Data Fetching
    ↓
Permission Calculation
    ↓
Route Guard Validation
    ↓
Access Granted/Denied
```

### Authorization Model

**Role-Based Access Control (RBAC):**
- 5 roles: guest, host, manager, admin, super_admin
- Granular permissions via JSONB field in profiles
- Permission checks via usePermissions hook

**Permission Categories:**
- Property permissions (view, approve, reject, suspend)
- User permissions (view, ban, verify, modify roles)
- Payment permissions (view, verify, reject, refund)
- Booking permissions (view, cancel, resolve disputes)
- System permissions (audit logs, notifications, dashboard)
- Messaging permissions (view, send, manage, delete, internal notes)

### Row-Level Security (RLS)

**Policy Structure:**
- Public users: Read-only access to approved properties
- Authenticated users: Read/write access to own data
- Property owners: Full access to their properties
- Admins: Full access to all data

**RLS Implementation:**
- All tables have RLS enabled
- Policies use `auth.uid()` for user identification
- Role-based checks via `profiles.role`
- Audit logging for all admin operations

---

## Data Flow Architecture

### Property Booking Flow

```
User Views Property
    ↓
Selects Dates & Guests
    ↓
Clicks Reserve
    ↓
Booking Details → sessionStorage
    ↓
Navigate to Payment Page
    ↓
Select Payment Method
    ↓
Process Payment
    ↓
Create Booking Record
    ↓
Create Payment Record
    ↓
Send Confirmation
    ↓
Create Conversation (auto)
```

### Admin Property Approval Flow

```
Host Creates Property
    ↓
Property Status: 'pending'
    ↓
Admin Views Properties
    ↓
Admin Reviews Property
    ↓
Admin Approves/Rejects
    ↓
RPC Function Call (with audit)
    ↓
Update Property Status
    ↓
Send Notification to Host
    ↓
Update Audit Log
```

### Messaging Flow

```
User Sends Message
    ↓
MessageComposer Component
    ↓
MessagingService.sendMessage()
    ↓
RPC Function or Direct Insert
    ↓
Database Update
    ↓
Real-time Subscription Trigger
    ↓
MessageThread Component Updates
    ↓
Mark as Read
    ↓
Update Unread Count
```

---

## Integration Architecture

### Payment Integrations

**Dodo Payments (Card):**
- Edge Function: `create-dodo-checkout`
- Integration: API-based checkout flow
- Webhooks: Status updates (planned)

**Local Wallets:**
- Providers: Zaad, eDahab, Premier Wallet, Wadaag Pay
- Integration: Manual verification flow
- RPC Function: `create_local_wallet_payment`

### Third-Party Integrations

**Current:**
- Supabase (Database, Auth, Storage, Realtime)
- Leaflet.js (Maps)
- Lucide React (Icons)

**Planned:**
- Email Service (SendGrid/Mailgun)
- SMS Service (Twilio)
- Payment Webhooks (Dodo)
- Background Check Services
- CRM Integration

---

## Performance Architecture

### Frontend Optimization

**Current:**
- Vite build optimization
- Code splitting (basic)
- Image lazy loading (partial)

**Planned:**
- Advanced code splitting
- Image optimization with CDN
- Memoization for expensive calculations
- Debouncing for search inputs
- Service worker for offline support

### Backend Optimization

**Current:**
- Supabase connection pooling (default)
- Database indexes on foreign keys
- RLS policy optimization

**Planned:**
- Redis caching layer
- Database read replicas
- Query optimization
- CDN for static assets

---

## Monitoring & Observability

**Current:**
- Supabase dashboard monitoring
- Basic error logging

**Planned:**
- Application Performance Monitoring (APM)
- Error tracking (Sentry)
- Centralized logging (ELK stack)
- Health check endpoints
- Uptime monitoring
- Custom metrics dashboard

---

## Deployment Architecture

**Current:**
- Frontend: Vite build → Static hosting
- Backend: Supabase managed services
- Database: Managed PostgreSQL

**Planned:**
- CI/CD pipeline
- Automated testing
- Staging environment
- Blue-green deployment
- Automated backups

---

## Scalability Considerations

**Current Limitations:**
- Single database instance
- No horizontal scaling
- Limited caching
- No load balancing

**Scalability Plan:**
- Database read replicas
- Connection pooling optimization
- Caching layer (Redis)
- CDN for static assets
- Queue system for background jobs
- Rate limiting middleware

---

## Technical Debt

**Known Issues:**
- Console.log statements in production code
- Mock data in some services
- Incomplete RMS module
- Limited test coverage (0%)
- Missing error boundaries
- No input sanitization beyond React defaults

**Refactoring Priorities:**
1. Remove console.log statements
2. Replace mock data with real implementations
3. Add comprehensive error handling
4. Implement test coverage
5. Add input validation
6. Remove code duplication

---

## Future Architecture Enhancements

**Phase 1 (Critical):**
- Complete RMS module implementation
- Add test framework and coverage
- Implement notification workers
- Add payment webhooks

**Phase 2 (Operational):**
- Advanced analytics and reporting
- Maintenance request system
- Rent collection automation
- Security enhancements (MFA, social login)

**Phase 3 (Scale):**
- Redis caching layer
- CDN configuration
- Performance optimization
- Monitoring and observability

**Phase 4 (Enterprise):**
- Multi-tenancy support
- Enterprise integrations
- Advanced analytics
- Developer platform

---

## Documentation References

- Database Schema: `02_DATABASE_SCHEMA.md`
- API Documentation: `03_API_DOCUMENTATION.md`
- Security Documentation: `04_SECURITY_DOCUMENTATION.md`
- Module Documentation: `05_MODULE_DOCUMENTATION.md`
- Business Logic: `06_BUSINESS_LOGIC.md`
- Component Documentation: `07_COMPONENT_DOCUMENTATION.md`
- Deployment Guide: `08_DEPLOYMENT_GUIDE.md`
- Configuration Guide: `09_CONFIGURATION_GUIDE.md`
- Testing Guide: `10_TESTING_GUIDE.md`
- Performance Documentation: `11_PERFORMANCE_DOCUMENTATION.md`
- Troubleshooting Guide: `12_TROUBLESHOOTING_GUIDE.md`
- Migration Guide: `13_MIGRATION_GUIDE.md`
- Development Guide: `14_DEVELOPMENT_GUIDE.md`

---

**Document Owner:** Development Team  
**Last Updated:** June 2, 2026  
**Next Review:** After Phase 1 completion
