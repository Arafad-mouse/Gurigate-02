# GuriGate Frontend Architecture Document

**Document Version:** 1.0  
**Date:** June 2, 2026  
**Author:** System Architecture Team

---

## 1. Overview

The GuriGate frontend is a modern Single Page Application (SPA) built with React 19, TypeScript, and Vite. The application follows a component-based architecture with centralized state management using React Context API, integrated with Supabase for authentication and data persistence.

### Key Technologies

- **Framework:** React 19 with TypeScript 5.x
- **Build Tool:** Vite 5.x
- **Styling:** TailwindCSS 3.x
- **UI Components:** shadcn/ui (built on Radix UI)
- **Routing:** React Router DOM 6.x
- **State Management:** React Context API (AuthProvider, LanguageProvider)
- **Forms:** React Hook Form (implied from components)
- **Maps:** React Leaflet
- **Backend Client:** @supabase/supabase-js

---

## 2. Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── admin/           # Admin-specific components
│   │   ├── customer/    # Customer management components
│   │   ├── entity-card/ # Entity card components
│   │   └── table/       # Table components
│   ├── host-onboarding/ # Host onboarding flow components
│   │   └── steps/       # Individual onboarding steps
│   ├── ui/              # shadcn/ui components
│   └── ...              # Other feature components
├── hooks/               # Custom React hooks
│   ├── usePermissions.ts
│   ├── useRole.ts
│   └── ...
├── lib/                 # Core utilities and configurations
│   ├── auth-context.tsx
│   ├── permissions.ts
│   ├── supabase.ts
│   └── ...
├── pages/               # Page components
│   ├── admin/           # Admin pages
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminProperties.tsx
│   │   ├── AdminBookings.tsx
│   │   ├── AdminPayments.tsx
│   │   ├── AdminUsers.tsx
│   │   └── CustomersPage.tsx
│   └── ...              # Other pages
├── services/            # API service layers
│   ├── authService.ts
│   ├── adminService.ts
│   ├── messagingService.ts
│   ├── paymentService.ts
│   └── customerService.ts
├── types/               # TypeScript type definitions
│   ├── customer.ts
│   ├── payment.ts
│   └── property.ts
├── constants/           # Application constants
│   └── status.ts
├── App.tsx              # Main application component
└── main.tsx             # Application entry point
```

---

## 3. Routing Architecture

### 3.1 Router Configuration

The application uses React Router DOM with a centralized route configuration in `App.tsx`. The routing structure includes:

**Main Route Groups:**

- **Public Routes:** Home, marketplace, property details
- **Protected Routes:** Profile, notifications, integrations
- **Admin Routes:** Admin dashboard and management pages
- **Host Routes:** Host onboarding flow
- **Payment Routes:** Payment processing pages

### 3.2 Route Structure

```typescript
// Key routes identified in App.tsx
/                      # Home page
/marketplace           # Property discovery
/property/:id          # Property details
/profile               # User profile
/notifications         # User notifications
/integrations          # Third-party integrations
/payment               # Payment processing
/host/onboarding       # Host onboarding flow
/admin/dashboard       # Admin dashboard
/admin/properties      # Property management
/admin/bookings        # Booking management
/admin/payments        # Payment management
/admin/users           # User management
/admin/customers       # Customer management
```

### 3.3 Route Guards

- **AuthProvider:** Wraps the entire application to provide authentication state
- **Protected Routes:** Routes that require authentication (profile, notifications, admin pages)
- **Role-Based Access:** Admin routes are protected by role checks using `useRole` hook

---

## 4. State Management

### 4.1 Context Providers

The application uses two primary context providers:

#### AuthProvider (`src/lib/auth-context.tsx`)

**Purpose:** Manages user authentication state and profile data

**State:**
- `session`: Current Supabase session
- `profile`: User profile with role and permissions
- `loading`: Loading state for auth operations
- `error`: Error state for auth operations

**Functions:**
- `signOut()`: User logout
- `updateProfile()`: Update user profile information
- `changePassword()`: Change user password

**Integration:**
- Uses `authService` for authentication operations
- Subscribes to Supabase auth state changes
- Hydrates profile from `profiles` table on auth changes

#### LanguageProvider

**Purpose:** Manages application language/i18n (implementation details to be verified)

**Integration:**
- Wraps application in `main.tsx`
- Provides language context to entire application

### 4.2 Custom Hooks

#### usePermissions (`src/hooks/usePermissions.ts`)

**Purpose:** Provides permission checking for the current user

**Returns:**
- `hasPermission(permission)`: Check if user has specific permission
- `hasAnyPermission(permissions[])`: Check if user has any of the permissions
- `hasAllPermissions(permissions[])`: Check if user has all permissions
- Specific permission checkers: `canApproveProperty()`, `canBanUser()`, etc.
- `getUserPermissions()`: Get all permissions for current user

**Integration:**
- Uses `AuthContext` for current user profile
- Delegates to `permissions.ts` for permission logic

#### useRole (`src/hooks/useRole.ts`)

**Purpose:** Provides role-based access control helpers

**Returns:**
- `role`: Current user role
- `isAdmin`: Boolean for admin access
- `isSuperAdmin`: Boolean for super admin access
- `isManager`: Boolean for manager access
- `isHost`: Boolean for host access
- `isGuest`: Boolean for guest access
- `isBanned`: Boolean for banned status
- `hasRole(roles)`: Check if user has specific role(s)
- `canAccessAdmin`: Boolean for admin dashboard access

**Integration:**
- Uses `AuthContext` for current user profile
- Implements role hierarchy logic

---

## 5. Component Architecture

### 5.1 Component Hierarchy

**Page-Level Components:**
- Located in `src/pages/`
- Route-level components that compose feature components
- Handle page-specific logic and state

**Feature Components:**
- Located in `src/components/`
- Reusable across multiple pages
- Feature-specific (admin, host-onboarding, etc.)

**UI Components:**
- Located in `src/components/ui/`
- shadcn/ui components (Button, Input, Dialog, etc.)
- Low-level, reusable UI primitives

### 5.2 Component Patterns

#### Admin Components (`src/components/admin/`)

**Customer Management:**
- `AddCustomerModal`: Modal for adding new customers
- `EditCustomerModal`: Modal for editing customer details
- `CustomerProfileDrawer`: Side drawer for customer profile
- `CustomerOverviewTab`: Overview tab in customer drawer
- `CustomerBookingsTab`: Bookings tab in customer drawer
- `CustomerPaymentsTab`: Payments tab in customer drawer
- `CustomerContractsTab`: Contracts tab in customer drawer
- `CustomerPropertiesTab`: Properties tab in customer drawer
- `CustomerTimelineTab`: Timeline tab in customer drawer
- `AssignPropertyDrawer`: Property assignment drawer
- `CreateContractDrawer`: Contract creation drawer
- `SuspendCustomerModal`: Customer suspension modal
- `FilterPanel`: Filtering and search panel
- `CustomerSkeleton`: Loading skeleton

**Entity Cards:**
- `entity-card/`: Generic entity card components

**Table Components:**
- `table/`: Reusable table components for data display

#### Host Onboarding Components (`src/components/host-onboarding/steps/`)

**Onboarding Flow Steps:**
- `StepIntro1`, `StepIntro2`, `StepIntro3`: Introduction steps
- `StepWelcome`: Welcome screen
- `StepPropertyType`: Property type selection
- `StepTitle`: Property title input
- `StepLocation`: Location/address input
- `StepBasics`: Basic property details
- `StepOccupants`: Occupant capacity
- `StepBathrooms`: Bathroom count
- `StepAmenities`: Amenity selection
- `StepHighlights`: Property highlights
- `StepSafety`: Safety features
- `StepPhotos`: Photo upload
- `StepBooking`: Booking settings
- `StepFinalDetails`: Final details review
- `StepConfirmAddress`: Address confirmation

### 5.3 Component Communication

**Props Drilling:** Used for passing data down component trees

**Context API:** Used for global state (auth, permissions, language)

**Callback Props:** Used for child-to-parent communication

**Service Layer:** Components interact with services for API calls

---

## 6. Service Layer Architecture

### 6.1 Service Pattern

All API interactions are abstracted through service classes located in `src/services/`. Services provide:

- Type-safe interfaces for API operations
- Error handling and validation
- Data transformation
- Supabase client abstraction

### 6.2 Service Files

#### authService.ts

**Purpose:** Authentication and profile management

**Key Functions:**
- `getCurrentSession()`: Get current Supabase session
- `subscribeToAuthChanges()`: Subscribe to auth state changes
- `hydrateProfile()`: Hydrate user profile from database
- `signInWithEmail()`: Email/password login
- `signUpWithEmail()`: Email/password registration
- `updateProfile()`: Update user profile
- `updatePassword()`: Change user password
- `signOutUser()`: User logout

**Integration:**
- Uses Supabase Auth
- Syncs with `profiles` table
- Handles avatar uploads to storage

#### adminService.ts

**Purpose:** Administrative operations

**Key Functions:**
- Dashboard metrics: `getDashboardKPIs()`
- Property management: `getPendingProperties()`, `getAllProperties()`, `approveProperty()`, `rejectProperty()`, `suspendProperty()`
- Booking management: `getAllBookings()`, `cancelBooking()`, `resolveDispute()`
- Payment management: `getPendingPayments()`, `getAllPayments()`, `verifyPayment()`, `rejectPayment()`
- User management: `getAllUsers()`, `banUser()`, `unbanUser()`, `verifyHost()`

**Integration:**
- Uses Supabase RPC functions for admin operations
- Implements audit logging through RPC functions

#### messagingService.ts

**Purpose:** Messaging and conversation management

**Key Functions:**
- Conversation management: `getUserConversations()`, `getConversationById()`, `createConversation()`
- Message management: `getMessages()`, `sendMessage()`, `markAsRead()`
- Participant management: `addParticipant()`, `muteParticipant()`
- Search: `searchMessages()`, `searchConversations()`
- Context data: `getContextData()`

**Integration:**
- Uses Supabase RPC functions for messaging operations
- Implements soft delete functionality
- Supports conversation types (direct, booking, property, payment, support, RMS)

#### paymentService.ts

**Purpose:** Payment processing

**Key Functions:**
- `createWalletPayment()`: Create wallet payment (Zaad, eDahab, Premier Wallet, Wadaag Pay)
- `createDodoCheckout()`: Create Dodo card payment checkout

**Integration:**
- Uses Supabase RPC `create_local_wallet_payment` for wallet payments
- Uses Edge Function `create-dodo-checkout` for card payments
- Implements validation for wallet phone numbers
- Fallback to mock data when Supabase not configured

#### customerService.ts

**Purpose:** Customer management (currently using mock data)

**Key Functions:**
- `listCustomers()`: List customers with filters
- `getCustomer()`: Get single customer
- `getCustomerOverview()`: Get customer overview with metrics
- `getCustomerBookings()`: Get customer bookings
- `getCustomerPayments()`: Get customer payments
- `getCustomerContracts()`: Get customer contracts
- `getCustomerProperties()`: Get customer properties
- `getCustomerTimeline()`: Get customer timeline
- `createCustomer()`: Create new customer
- `updateCustomer()`: Update customer
- `assignProperty()`: Assign property to customer
- `createContract()`: Create contract
- `suspendCustomer()`: Suspend customer
- `exportCSV()`: Export customers to CSV

**Status:** Currently using mock data (Sprint 1), planned integration with database

---

## 7. Type System

### 7.1 Type Definitions

Type definitions are centralized in `src/types/`:

#### customer.ts

**Types:**
- `CustomerType`: 'tenant' | 'renter' | 'buyer' | 'guest'
- `LifecycleStatus`: 'lead' | 'active' | 'inactive' | 'suspended'
- `Customer`: Customer entity
- `CustomerMetrics`: Customer metrics and KPIs
- `BookingSummary`: Booking summary
- `PaymentSummary`: Payment summary
- `ContractSummary`: Contract summary
- `PropertySummary`: Property summary
- `CustomerDrawerState`: Drawer state management
- `TimelineEvent`: Timeline event

#### payment.ts

**Types:**
- `PaymentMethodId`: 'card' | 'zaad' | 'edahab' | 'premier_wallet' | 'wadaag_pay'
- `PaymentProvider`: 'dodo' | 'zaad' | 'edahab' | 'premier_wallet' | 'wadaag_pay'
- `PaymentStatus`: 'pending' | 'submitted' | 'verified' | 'completed' | 'failed' | 'cancelled'
- `PaymentMethodOption`: Payment method configuration
- `BookingPaymentDetails`: Booking payment details
- `PaymentSummary`: Payment summary
- `PaymentRecord`: Payment record
- `CreateWalletPaymentInput`: Wallet payment input
- `CreateDodoCheckoutInput`: Dodo checkout input
- `DodoCheckoutSession`: Dodo checkout session

#### property.ts

**Types:**
- `PropertyType`: Property type enum
- `PropertyStatus`: Property status enum
- `Property`: Property entity
- `PropertyAddress`: Property address
- `PropertyPricing`: Property pricing
- `PropertyFeatures`: Property features
- `CreatePropertyRequest`: Property creation request

**Constants:**
- `PROPERTY_TYPES`: Available property types
- `CURRENCIES`: Supported currencies
- `COMMON_AMENITIES`: Common amenities list
- `COMMON_RULES`: Common rules list

### 7.2 Constants

Application constants are centralized in `src/constants/status.ts`:

**Status Constants:**
- `PROPERTY_APPROVAL_STATUS`: Draft, pending, approved, rejected, suspended
- `PROPERTY_STATUS`: Available, occupied, maintenance, pending, inactive
- `BOOKING_STATUS`: Pending, confirmed, cancelled, completed
- `DISPUTE_STATUS`: None, open, resolved, escalated
- `PAYMENT_STATUS`: Pending, submitted, under_review, verified, failed, refunded, completed
- `USER_ROLE`: Guest, host, manager, admin, super_admin
- `VERIFICATION_STATUS`: Unverified, pending, verified, rejected, suspended
- `NOTIFICATION_STATUS`: Pending, processing, sent, failed, retrying, cancelled
- `NOTIFICATION_CHANNEL`: Email, SMS, push, whatsapp
- `CONVERSATION_TYPE`: Direct, booking, property, payment, support, system, RMS contract/tenant/unit
- `CONVERSATION_STATUS`: Active, archived, closed
- `CONVERSATION_PRIORITY`: Low, normal, high, urgent
- `MESSAGE_CONTENT_TYPE`: Text, image, document, property/booking/payment reference, system

**UI Constants:**
- `STATUS_BADGE_COLORS`: Tailwind classes for status badges
- `STATUS_LABELS`: Human-readable status labels

---

## 8. Permission System

### 8.1 Permission Architecture

The permission system is implemented in `src/lib/permissions.ts`:

**Permission Keys:** 28+ granular permissions across categories:
- Property management (5 permissions)
- User management (5 permissions)
- Payment management (5 permissions)
- Booking management (4 permissions)
- System operations (3 permissions)
- Messaging operations (6 permissions)

**Role Default Permissions:** Each role has predefined default permissions:
- `GUEST`: View properties, view bookings
- `HOST`: View properties, bookings, payments, send messages
- `MANAGER`: Property approval, host verification, payment verification, dispute resolution
- `ADMIN`: Full property, user, payment, booking management
- `SUPER_ADMIN`: All permissions

**Permission Checking:**
- `hasPermission(profile, permission)`: Check if user has permission
- `hasAnyPermission(profile, permissions[])`: Check if user has any of the permissions
- `hasAllPermissions(profile, permissions[])`: Check if user has all permissions
- `getUserPermissions(profile)`: Get all user permissions

**Permission Logic:**
1. Super admins have all permissions
2. Check user-specific permissions (from `permissions` JSONB in profiles)
3. Check role default permissions
4. Grant permission if any check passes

---

## 9. Authentication Flow

### 9.1 Authentication Lifecycle

```
Visitor
  ↓
Registration (signUpWithEmail)
  ↓
Email Verification (if enabled)
  ↓
Login (signInWithEmail)
  ↓
Session Creation (Supabase Auth)
  ↓
Profile Hydration (from profiles table)
  ↓
AuthProvider Context Update
  ↓
Access Granted
  ↓
Logout (signOutUser)
```

### 9.2 AuthProvider Integration

**Initialization:**
- Subscribes to Supabase auth state changes on mount
- Hydrates profile from database on auth state change
- Provides auth state to entire application

**Session Management:**
- Session stored in Supabase Auth
- Profile stored in `profiles` table
- Auth state synchronized between auth.users and profiles

**Profile Synchronization:**
- On signup: Profile created in profiles table
- On login: Profile loaded from profiles table
- On update: Profile updated in both auth.users metadata and profiles table

---

## 10. Build Configuration

### 10.1 Vite Configuration (`vite.config.ts`)

**Key Configuration:**
- React plugin for React support
- Path alias: `@/` maps to `./src`
- TypeScript support
- Hot Module Replacement (HMR)

### 10.2 Build Process

**Development:**
- Vite dev server with HMR
- Fast refresh for React components
- Source maps for debugging

**Production:**
- Vite build optimization
- Code splitting
- Tree shaking
- Minification
- Asset optimization

---

## 11. Styling Architecture

### 11.1 TailwindCSS Integration

**Configuration:** TailwindCSS configured for utility-first styling

**Usage:**
- Component styling using Tailwind utility classes
- Responsive design with Tailwind breakpoints
- Dark mode support (if configured)

### 11.2 shadcn/ui Components

**Purpose:** Pre-built, accessible UI components

**Components:** Button, Input, Dialog, Table, etc.

**Integration:**
- Located in `src/components/ui/`
- Built on Radix UI primitives
- Styled with TailwindCSS
- Fully accessible

---

## 12. Error Handling

### 12.1 Error Types

**Custom Errors:**
- `PaymentError`: Payment-related errors (defined in `src/lib/errors.ts`)

**Error Handling Pattern:**
- Services throw typed errors
- Components catch and display user-friendly messages
- Auth errors handled in AuthProvider

### 12.2 Validation

**Input Validation:**
- Phone number validation for wallet payments
- Form validation using React Hook Form (implied)
- Type safety through TypeScript

**Server-Side Validation:**
- Supabase RLS policies
- Database constraints
- RPC function validation

---

## 13. Performance Considerations

### 13.1 Code Splitting

**Route-Based Splitting:** Lazy loading of route components (to be verified in implementation)

**Component Splitting:** Dynamic imports for large components

### 13.2 Optimization

**Image Optimization:**
- Lazy loading for images
- Optimized formats (to be verified)

**Data Fetching:**
- Selective column queries
- Pagination for large datasets
- Caching strategies (to be verified)

### 13.3 Bundle Size

**Dependencies:**
- React 19 (latest)
- Supabase client
- React Router DOM
- Leaflet (maps)
- Radix UI (components)

**Optimization:**
- Tree shaking
- Dead code elimination
- Minification

---

## 14. Accessibility

### 14.1 Accessibility Features

**shadcn/ui Components:** Built on Radix UI with full accessibility support

**Keyboard Navigation:** Standard keyboard navigation support

**Screen Reader Support:** ARIA labels and roles (to be verified in implementation)

### 14.2 Accessibility Standards

**Target Standards:**
- WCAG 2.1 AA compliance
- Semantic HTML
- Keyboard accessibility
- Screen reader compatibility

---

## 15. Future Enhancements

### 15.1 Planned Improvements

**State Management:**
- Consider React Query or SWR for server state
- Consider Zustand or Redux Toolkit for complex state

**Testing:**
- Unit tests with Vitest
- Integration tests with React Testing Library
- E2E tests with Playwright or Cypress

**Performance:**
- Virtual scrolling for large lists
- Image optimization with next-gen formats
- Service Worker for offline support

**Developer Experience:**
- Storybook for component documentation
- ESLint and Prettier configuration
- Pre-commit hooks with Husky

---

## 16. Documentation References

**Related Documents:**
- Backend Architecture Document
- Database Documentation
- Business Logic Documentation
- Security Documentation
- UI Inventory

**Code References:**
- `src/App.tsx` - Main routing
- `src/lib/auth-context.tsx` - Authentication
- `src/lib/permissions.ts` - Permission system
- `src/hooks/` - Custom hooks
- `src/services/` - Service layer
- `src/types/` - Type definitions

---

**End of Frontend Architecture Document**
