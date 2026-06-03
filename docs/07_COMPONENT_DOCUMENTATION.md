# GuriGate Component Documentation

**Version:** 1.0  
**Date:** June 2, 2026  
**Status:** Production

---

## Executive Summary

This document provides detailed documentation of all major React components in the GuriGate frontend, organized by module and functionality. Each component includes its purpose, props, state management, and dependencies.

---

## Admin Components

### AdminDashboard

**Location:** `src/pages/admin/AdminDashboard.tsx`

**Purpose:** Main admin dashboard displaying KPIs and recent activity

**State:**
- `kpis` - Dashboard metrics data
- `loading` - Loading state
- `error` - Error state

**Dependencies:**
- `AdminService.getDashboardKPIs()`
- Lucide React icons

**KPIs Displayed:**
- Total properties
- Pending approvals
- Active bookings
- Total revenue
- Total users
- Total hosts

### AdminProperties

**Location:** `src/pages/admin/AdminProperties.tsx`

**Purpose:** Property management interface for admins

**State:**
- `properties` - Array of properties
- `loading` - Loading state
- `error` - Error state
- `searchQuery` - Search input
- `statusFilter` - Status filter
- `pagination` - Pagination state

**Dependencies:**
- `AdminService.getAllProperties()`
- `AuthContext`
- `usePermissions` hook

**Actions:**
- Approve property
- Reject property
- Suspend property
- View property details

### Customer Components

#### EntityCard

**Location:** `src/components/admin/entity-card/EntityCard.tsx`

**Purpose:** Reusable card component for displaying customer/user entities

**Props:**
- `entity` - Entity data object
- `type` - Entity type (customer, host, admin)
- `onEdit` - Edit callback
- `onDelete` - Delete callback
- `onView` - View details callback

**Features:**
- Avatar display
- Name and email
- Status badges
- Action buttons
- Quick stats

#### CustomerOverviewTab

**Location:** `src/components/admin/customer/CustomerOverviewTab.tsx`

**Purpose:** Display customer overview information

**Props:**
- `customer` - Customer data object

**Features:**
- Profile information
- Contact details
- Account status
- Quick actions

#### CustomerBookingsTab

**Location:** `src/components/admin/customer/CustomerBookingsTab.tsx`

**Purpose:** Display customer booking history

**Props:**
- `customerId` - Customer ID
- `bookings` - Array of bookings

**Features:**
- Booking list
- Status indicators
- Date ranges
- Property links

#### CustomerPaymentsTab

**Location:** `src/components/admin/customer/CustomerPaymentsTab.tsx`

**Purpose:** Display customer payment history

**Props:**
- `customerId` - Customer ID
- `payments` - Array of payments

**Features:**
- Payment list
- Status indicators
- Amounts and dates
- Provider information

---

## Host Onboarding Components

### BecomeHost

**Location:** `src/components/host-onboarding/Become-host.tsx`

**Purpose:** Multi-step host onboarding form

**State:**
- `currentStep` - Current step number
- `formData` - Form data object
- `loading` - Loading state
- `error` - Error state

**Steps:**
1. Personal Information
2. Property Details
3. Location
4. Amenities
5. Pricing
6. Images
7. Review and Submit

**Dependencies:**
- `HostOnboardingService`
- Form validation

### Step Components

#### Step1_PersonalInfo

**Purpose:** Collect host personal information

**Fields:**
- First name
- Last name
- Email
- Phone number

#### Step2_PropertyDetails

**Purpose:** Collect property basic information

**Fields:**
- Property title
- Property type
- Description
- Number of bedrooms
- Number of bathrooms

#### Step3_Location

**Purpose:** Collect property location

**Fields:**
- Address line 1
- Address line 2
- City
- State
- Postal code
- Country

#### Step4_Amenities

**Purpose:** Select property amenities

**Features:**
- Checkbox list of amenities
- Categories (kitchen, bathroom, outdoor, etc.)
- Custom amenity option

#### Step5_Pricing

**Purpose:** Set property pricing

**Fields:**
- Nightly rate
- Weekly rate
- Monthly rate
- Cleaning fee
- Service fee percentage
- Minimum nights
- Maximum nights

#### Step6_Images

**Purpose:** Upload property images

**Features:**
- Image upload to Supabase Storage
- Image preview
- Set primary image
- Reorder images
- Delete images

#### Step7_Review

**Purpose:** Review all information before submission

**Features:**
- Summary of all steps
- Edit capability
- Submit button

---

## Inbox Components

### InboxPage

**Location:** `src/pages/InboxPage.tsx`

**Purpose:** Main inbox page with conversation list and message thread

**State:**
- `conversations` - Array of conversations
- `selectedConversation` - Currently selected conversation
- `messages` - Messages in selected conversation
- `loading` - Loading state
- `filter` - Current filter

**Dependencies:**
- `MessagingService`
- `useRealtimeMessages` hook

### ConversationList

**Location:** `src/components/inbox/ConversationList.tsx`

**Purpose:** Display list of conversations

**Props:**
- `conversations` - Array of conversations
- `selectedId` - Selected conversation ID
- `onSelect` - Selection callback
- `filter` - Current filter

**Features:**
- Conversation items with last message
- Unread count badges
- Priority indicators
- Status badges
- Type icons

### MessageThread

**Location:** `src/components/inbox/MessageThread.tsx`

**Purpose:** Display messages in a conversation

**Props:**
- `messages` - Array of messages
- `conversationId` - Conversation ID
- `loading` - Loading state

**Features:**
- Message bubbles
- Sender identification
- Timestamps
- Internal note indicators
- System messages
- Auto-scroll to bottom

### MessageComposer

**Location:** `src/components/inbox/MessageComposer.tsx`

**Purpose:** Compose and send messages

**Props:**
- `conversationId` - Conversation ID
- `onSend` - Send callback
- `canSendInternal` - Permission to send internal notes

**State:**
- `content` - Message content
- `isInternal` - Internal note toggle
- `sending` - Sending state

**Features:**
- Text input
- Internal note toggle (admin only)
- Attachment button
- Send button
- Typing indicator

### ContextPanel

**Location:** `src/components/inbox/ContextPanel.tsx`

**Purpose:** Display context information for conversation

**Props:**
- `conversation` - Conversation object

**State:**
- `context` - Context data
- `loading` - Loading state

**Features:**
- Booking information
- Property details
- Payment details
- Related entity links
- Quick actions
- Activity timeline

---

## Marketplace Components

### GuriGateLandingPage

**Location:** `src/pages/GuriGateLandingPage.tsx`

**Purpose:** Main landing page with featured properties

**State:**
- `featured` - Featured properties
- `nairobi` - Nairobi properties
- `hargeisa` - Hargeisa properties
- `loading` - Loading state

**Dependencies:**
- `useProperties` hook
- Leaflet.js for maps

**Sections:**
- Hero section
- Featured properties
- Popular in Nairobi
- Popular in Hargeisa
- Search bar

### PropertyPage

**Location:** `src/pages/PropertyPage.tsx`

**Purpose:** Property details page

**State:**
- `property` - Property data
- `loading` - Loading state
- `checkIn` - Check-in date
- `checkOut` - Check-out date
- `guests` - Number of guests

**Dependencies:**
- `properties` service
- `useAuth` hook

**Features:**
- Image gallery
- Property information
- Amenities list
- Pricing details
- Booking form
- Reviews section
- Map integration

### FeaturedPropertyCard

**Location:** `src/pages/GuriGateLandingPage.tsx` (component)

**Purpose:** Display property card on landing page

**Props:**
- `property` - Property data
- `onLike` - Like callback
- `liked` - Liked state

**Features:**
- Property image
- Title and location
- Price
- Rating
- Like button
- View button

### SearchResults

**Location:** `src/pages/SearchResults.tsx`

**Purpose:** Display search results

**State:**
- `properties` - Search results
- `filters` - Search filters
- `loading` - Loading state

**Features:**
- Filter sidebar
- Property grid
- Sort options
- Pagination

---

## Payment Components

### PaymentPage

**Location:** `src/pages/PaymentPage.tsx`

**Purpose:** Payment processing page

**State:**
- `bookingDetails` - Booking information from sessionStorage
- `selectedMethod` - Selected payment method
- `loading` - Loading state
- `error` - Error state

**Dependencies:**
- `PaymentService`
- sessionStorage for booking details

**Payment Methods:**
- Card (Dodo)
- Zaad Wallet
- eDahab Wallet
- Premier Wallet
- Wadaag Pay

**Features:**
- Payment method selection
- Price breakdown
- Wallet phone input
- Proof image upload
- Payment confirmation

---

## Customer Components

### ProfilePage

**Location:** `src/pages/ProfilePage.tsx`

**Purpose:** User profile page

**State:**
- `profile` - User profile data
- `editing` - Edit mode state
- `loading` - Loading state

**Dependencies:**
- `AuthService`
- `AuthContext`

**Sections:**
- Profile information
- Avatar management
- Contact details
- Booking history
- Payment history
- Account settings

### PreferencesPage

**Location:** `src/pages/PreferencesPage.tsx`

**Purpose:** User preferences page

**State:**
- `preferences` - User preferences object
- `loading` - Loading state

**Preferences:**
- Language
- Currency
- Timezone
- Theme
- Notifications
- Privacy settings

### NotificationsPage

**Location:** `src/pages/NotificationsPage.tsx`

**Purpose:** Notifications page

**State:**
- `notifications` - Array of notifications
- `filter` - Filter state
- `loading` - Loading state

**Features:**
- Notification list
- Read/unread status
- Filter options
- Mark all as read
- Delete notifications

---

## RMS Components

### CustomersPage

**Location:** `src/pages/admin/CustomersPage.tsx`

**Purpose:** Customer management page (admin view)

**State:**
- `customers` - Array of customers
- `kpis` - Customer KPIs
- `searchQuery` - Search input
- `filter` - Current filter
- `modalOpen` - Modal state
- `drawerOpen` - Drawer state
- `loading` - Loading state

**Dependencies:**
- `CustomerService`
- `AdminService`

**Features:**
- Customer KPIs dashboard
- Customer list with filters
- Add customer modal
- Edit customer modal
- Assign property drawer
- Create contract drawer
- Suspend customer modal
- Customer profile drawer

### CreateContractDrawer

**Location:** `src/components/admin/customer/CreateContractDrawer.tsx`

**Purpose:** Create rental contract

**State:**
- `open` - Drawer open state
- `formData` - Contract form data
- `loading` - Loading state

**Fields:**
- Tenant selection
- Unit selection
- Start date
- End date
- Rent amount
- Terms and conditions

---

## UI Components

### GuriGateNavbar

**Location:** `src/components/GuriGateNavbar.jsx`

**Purpose:** Main navigation bar

**State:**
- `mobileMenuOpen` - Mobile menu state
- `user` - User data from AuthContext

**Features:**
- Logo
- Navigation links
- User menu
- Mobile menu toggle
- Notification badge

### GuriGateFooter

**Location:** `src/components/GuriGateFooter.jsx`

**Purpose:** Main footer

**Features:**
- Company links
- Legal links
- Social media links
- Copyright

### Modal Components

#### AddPropertyModal

**Purpose:** Add new property modal

**State:**
- `open` - Modal open state
- `formData` - Form data

#### ChangeDatesModal

**Purpose:** Change booking dates modal

**State:**
- `open` - Modal open state
- `checkIn` - Check-in date
- `checkOut` - Check-out date

#### ChangeGuestsModal

**Purpose:** Change number of guests modal

**State:**
- `open` - Modal open state
- `guests` - Number of guests

---

## Shared Components

### ProtectedAdminRoute

**Location:** `src/components/ProtectedAdminRoute.tsx`

**Purpose:** Route guard for admin pages

**Props:**
- `children` - Child components

**Logic:**
- Check user role from AuthContext
- Redirect if not admin
- Render children if authorized

### AuthRouteGuard

**Location:** `src/components/AuthRouteGuard.tsx`

**Purpose:** Route guard for authenticated pages

**Props:**
- `children` - Child components

**Logic:**
- Check authentication status
- Redirect to login if not authenticated
- Render children if authenticated

---

## Custom Hooks

### useAuth

**Location:** `src/hooks/useAuth.ts`

**Purpose:** Authentication hook

**Returns:**
- `user` - User object
- `loading` - Loading state
- `signOut` - Sign out function

### useRole

**Location:** `src/hooks/useRole.ts`

**Purpose:** Role-based access hook

**Returns:**
- `profile` - User profile
- `role` - User role
- `isAdmin` - Admin flag
- `isSuperAdmin` - Super admin flag
- `isManager` - Manager flag
- `isHost` - Host flag
- `isGuest` - Guest flag
- `isBanned` - Banned flag
- `hasRole` - Role check function
- `canAccessAdmin` - Admin access flag

### usePermissions

**Location:** `src/hooks/usePermissions.ts`

**Purpose:** Permission checking hook

**Returns:**
- Permission check functions for each permission category

**Functions:**
- `canApproveProperty`
- `canRejectProperty`
- `canSuspendProperty`
- `canViewUsers`
- `canBanUser`
- `canVerifyPayment`
- `canViewMessages`
- `canSendInternalNotes`

### useProperties

**Location:** `src/hooks/useProperties.ts`

**Purpose:** Properties data hook

**Returns:**
- `featured` - Featured properties
- `nairobi` - Nairobi properties
- `hargeisa` - Hargeisa properties
- `all` - All properties
- Loading states

### useRealtimeMessages

**Location:** `src/hooks/useRealtimeMessages.ts`

**Purpose:** Real-time message updates

**Parameters:**
- `conversationId` - Conversation ID

**Returns:**
- `messages` - Messages array
- `loading` - Loading state

### useConversationPresence

**Location:** `src/hooks/useConversationPresence.ts`

**Purpose:** Conversation presence tracking

**Parameters:**
- `conversationId` - Conversation ID

**Returns:**
- `presence` - Presence data
- `isTyping` - Typing state

---

**Document Owner:** Development Team  
**Last Updated:** June 2, 2026  
**Next Review:** After component changes
