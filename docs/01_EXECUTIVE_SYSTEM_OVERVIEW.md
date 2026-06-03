# GuriGate Executive System Overview

**Document Version:** 1.0  
**Date:** June 2, 2026  
**Author:** System Architecture Team

---

## 1. Executive Summary

GuriGate is a comprehensive property management and rental platform designed for East African markets, with primary focus on Somalia and neighboring countries. The platform enables property owners (hosts) to list properties, guests to discover and book accommodations, and administrators to manage the entire ecosystem through a unified dashboard.

### Key Business Objectives
- **Property Discovery:** Enable guests to search, filter, and book properties across multiple cities
- **Property Management:** Provide hosts with tools to list, manage, and track their properties
- **Booking Management:** Streamline the booking lifecycle from request to completion
- **Payment Processing:** Support multiple payment methods including local East African wallets
- **Admin Oversight:** Provide comprehensive admin dashboard for property approval, user moderation, and payment verification
- **Messaging:** Enable real-time communication between guests, hosts, and support
- **Customer Management:** Track customer lifecycle from lead to tenant with contract management

### Technology Stack
- **Frontend:** React 19, TypeScript, Vite, TailwindCSS, shadcn/ui
- **Backend:** Supabase (PostgreSQL), Deno Edge Functions
- **Authentication:** Supabase Auth with custom profile management
- **Database:** PostgreSQL with Row-Level Security (RLS)
- **Real-time:** Supabase Realtime for messaging and presence
- **Payment Integration:** Dodo Payments, Zaad, eDahab, Premier Wallet, Wadaag Pay

---

## 2. System Architecture Overview

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend Layer                       │
│  React 19 + TypeScript + Vite + TailwindCSS + shadcn/ui     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API & Service Layer                    │
│  Supabase Client | Edge Functions | RPC Functions         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer (Supabase)                   │
│  PostgreSQL + RLS + Realtime + Storage + Auth               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   External Integrations                     │
│  Dodo Payments | Local Wallets | Email/SMS Services        │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Core Modules

1. **Marketplace Module**
   - Property discovery and search
   - Property details and booking flow
   - User reviews and ratings
   - Wishlists and favorites

2. **Property Management Module**
   - Host dashboard
   - Property listing and management
   - Booking management for hosts
   - Revenue tracking

3. **Admin Module**
   - Property approval workflow
   - User moderation and verification
   - Payment verification
   - System-wide reporting and analytics
   - Audit logging

4. **Messaging Module**
   - Real-time inbox system
   - Conversation management
   - Support ticket system
   - Internal admin notes

5. **Customer Module**
   - Customer lifecycle management
   - Contract management
   - Payment history tracking
   - Property assignment

6. **Payment Module**
   - Multi-provider payment processing
   - Wallet payments (Zaad, eDahab, Premier Wallet, Wadaag Pay)
   - Card payments via Dodo
   - Payment verification workflow

---

## 3. User Roles and Permissions

### 3.1 Role Hierarchy

```
Super Admin (Full System Access)
    ↓
Admin (Platform Management)
    ↓
Manager (Property & Customer Management)
    ↓
Host (Property Owner)
    ↓
Guest (Property Seeker)
```

### 3.2 Role Definitions

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **Super Admin** | Highest level access with full system control | All permissions, including user role modification |
| **Admin** | Platform-level management | Property approval, user moderation, payment verification, audit logs |
| **Manager** | Property and customer management | Property approval, host verification, dispute resolution |
| **Host** | Property owners listing and managing properties | Manage own properties, view bookings, receive payments |
| **Guest** | Users searching and booking properties | Search properties, create bookings, send messages |

### 3.3 Permission System

The platform uses a granular permission system with 28+ distinct permissions across:
- Property management (5 permissions)
- User management (5 permissions)
- Payment management (5 permissions)
- Booking management (4 permissions)
- System operations (3 permissions)
- Messaging operations (6 permissions)

---

## 4. Data Model Overview

### 4.1 Core Entities

- **Users/Profiles:** User accounts with roles, verification status, and permissions
- **Properties:** Property listings with addresses, pricing, features, and images
- **Bookings:** Reservation records linking guests to properties
- **Payments:** Payment transactions with multiple provider support
- **Messages:** Real-time messaging system with conversations
- **Notifications:** User notifications for system events
- **Admin Activity Logs:** Audit trail for all admin actions
- **Property Views:** Analytics tracking for property views

### 4.2 Key Relationships

- **User → Properties:** One-to-many (hosts can have multiple properties)
- **User → Bookings:** One-to-many (guests can have multiple bookings)
- **Property → Bookings:** One-to-many (properties can have multiple bookings)
- **Booking → Payments:** One-to-many (bookings can have multiple payment attempts)
- **User → Conversations:** Many-to-many (users participate in conversations)
- **Conversation → Messages:** One-to-many (conversations contain messages)

---

## 5. Business Process Overview

### 5.1 Property Lifecycle

```
Draft → Pending Approval → Approved → Active → Suspended/Archived
```

### 5.2 Booking Lifecycle

```
Search → View Details → Create Booking → Payment → Confirmed → Check-in → Completed
```

### 5.3 Payment Lifecycle

```
Initiated → Pending → Submitted → Under Review → Verified → Completed
```

### 5.4 User Verification Lifecycle

```
Unverified → Pending → Verified → Active → Suspended (if needed)
```

---

## 6. Security Architecture

### 6.1 Authentication
- Supabase Auth with email/password
- JWT-based session management
- Profile synchronization with auth.users

### 6.2 Authorization
- Row-Level Security (RLS) on all tables
- Role-based access control (RBAC)
- Granular permission system
- Admin activity logging

### 6.3 Data Protection
- Soft deletes for critical data
- Audit logging for admin actions
- Secure file storage with bucket policies
- Input validation at service layer

---

## 7. Integration Points

### 7.1 Payment Providers
- **Dodo Payments:** Card payment processing
- **Zaad:** Mobile wallet (Somalia)
- **eDahab:** Mobile wallet (Somalia)
- **Premier Wallet:** Digital wallet
- **Wadaag Pay:** P2P payment system

### 7.2 External Services
- **Email:** Planned notification system
- **SMS:** Planned SMS notifications
- **Storage:** Supabase Storage for images and documents

---

## 8. Scalability Considerations

### 8.1 Database
- Indexed queries for performance
- Materialized views for common queries
- Connection pooling via Supabase
- Read replicas for high-traffic scenarios (future)

### 8.2 Application
- Client-side routing for SPA performance
- Lazy loading of components
- Optimistic UI updates
- Real-time subscriptions for live data

### 8.3 Storage
- CDN-backed image storage
- Optimized image formats
- Bucket-based organization

---

## 9. Deployment Architecture

### 9.1 Frontend
- Vite build process
- Static asset generation
- Deployment to CDN (Vercel/Netlify compatible)

### 9.2 Backend
- Supabase cloud hosting
- Edge Functions on Deno
- Automatic scaling
- Global CDN distribution

---

## 10. Monitoring and Observability

### 10.1 Application Monitoring
- Supabase dashboard for database metrics
- Edge function logs
- Error tracking via console logging

### 10.2 Business Metrics
- Property view analytics
- Booking conversion rates
- Payment success rates
- User engagement metrics

---

## 11. Known Limitations and Future Enhancements

### 11.1 Current Limitations
- Customer module uses mock data (Sprint 1)
- RMS (Rental Management System) module not fully implemented
- Limited notification system
- No automated testing suite
- No CI/CD pipeline documented

### 11.2 Planned Enhancements
- Full RMS module with buildings, units, tenants, contracts
- Advanced search with filters
- Multi-language support
- Mobile applications
- Advanced analytics dashboard
- Automated testing infrastructure
- CI/CD pipeline

---

## 12. Compliance and Regulatory

### 12.1 Data Privacy
- User data stored in secure PostgreSQL database
- RLS ensures data isolation
- Soft deletes preserve audit trail
- GDPR-compliant data handling (future enhancement)

### 12.2 Financial Compliance
- Payment processing through regulated providers
- Audit logging for all financial transactions
- Admin verification workflow for manual payments
- Currency support for East African markets

---

## 13. Documentation Structure

This executive overview is part of a comprehensive documentation package that includes:

1. Executive System Overview (this document)
2. Frontend Architecture Document
3. Backend Architecture Document
4. Database Documentation
5. Business Logic Documentation
6. RBAC Documentation
7. Security Documentation
8. Module Documentation
9. UI Inventory
10. System Flow Documentation
11. ERD (Entity Relationship Diagram)
12. Architecture Diagram
13. Gap Analysis Report
14. Recommendations Report

---

## 14. Contact and Support

For technical questions or clarifications about this document, refer to:
- Implementation Status Audit: `IMPLEMENTATION_STATUS_AUDIT.md`
- Compatibility Report: `COMPATIBILITY_FIX_REPORT.md`
- Migration Documentation: `supabase/migrations/`

---

**End of Executive System Overview**
