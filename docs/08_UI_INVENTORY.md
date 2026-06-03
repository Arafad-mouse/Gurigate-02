# GuriGate UI Inventory

**Document Version:** 1.0  
**Date:** June 2, 2026  
**Author:** System Architecture Team

---

## 1. Overview

This document provides a comprehensive inventory of all UI pages and components in the GuriGate platform. It serves as a reference for understanding the frontend structure, identifying reusable components, and planning UI enhancements.

### UI Technology Stack

- **Framework:** React 19
- **Styling:** TailwindCSS
- **UI Components:** shadcn/ui
- **Icons:** Lucide React (implied)
- **Routing:** React Router DOM
- **Forms:** React Hook Form (implied)

---

## 2. Page Inventory

### 2.1 Public Pages

**Home Page**
- Route: `/`
- Purpose: Landing page and property discovery
- Components: Hero section, property listings, search
- Status: Implemented

**Marketplace Page**
- Route: `/marketplace`
- Purpose: Property search and discovery
- Components: Search filters, property grid, map view
- Status: Implemented

**Property Detail Page**
- Route: `/property/:id`
- Purpose: View property details
- Components: Image gallery, property info, booking form, reviews
- Status: Implemented

### 2.2 Protected Pages

**Profile Page**
- Route: `/profile`
- Purpose: User profile management
- Components: Profile form, avatar upload, settings
- Status: Implemented

**Notifications Page**
- Route: `/notifications`
- Purpose: User notifications
- Components: Notification list, notification items
- Status: Implemented

**Integrations Page**
- Route: `/integrations`
- Purpose: Third-party integrations
- Components: Integration cards, settings
- Status: Implemented

### 2.3 Payment Pages

**Payment Page**
- Route: `/payment`
- Purpose: Payment processing
- Components: Payment method selection, payment form
- Status: Implemented

### 2.4 Host Pages

**Host Onboarding**
- Route: `/host/onboarding`
- Purpose: Host onboarding flow
- Components: Multi-step wizard (17 steps)
- Status: Implemented

### 2.5 Admin Pages

**Admin Dashboard**
- Route: `/admin/dashboard`
- Purpose: Admin overview
- Components: KPI cards, charts, recent activity
- Status: Implemented

**Admin Properties**
- Route: `/admin/properties`
- Purpose: Property management
- Components: Property table, filters, actions
- Status: Implemented

**Admin Bookings**
- Route: `/admin/bookings`
- Purpose: Booking management
- Components: Booking table, filters, actions
- Status: Implemented

**Admin Payments**
- Route: `/admin/payments`
- Purpose: Payment management
- Components: Payment table, filters, verification
- Status: Implemented

**Admin Users**
- Route: `/admin/users`
- Purpose: User management
- Components: User table, filters, actions
- Status: Implemented

**Customers Page**
- Route: `/admin/customers`
- Purpose: Customer management
- Components: Customer table, filters, drawer
- Status: Implemented

---

## 3. Component Inventory

### 3.1 Admin Components

**Location:** `src/components/admin/`

#### Customer Management Components

**AddCustomerModal**
- Purpose: Add new customer
- Props: isOpen, onClose, onAdd
- Status: Implemented

**EditCustomerModal**
- Purpose: Edit customer details
- Props: isOpen, onClose, customer, onUpdate
- Status: Implemented

**CustomerProfileDrawer**
- Purpose: Display customer profile in side drawer
- Props: isOpen, onClose, customer
- Status: Implemented

**CustomerOverviewTab**
- Purpose: Customer overview information
- Props: customer
- Status: Implemented

**CustomerBookingsTab**
- Purpose: Customer booking history
- Props: customerId
- Status: Implemented

**CustomerPaymentsTab**
- Purpose: Customer payment history
- Props: customerId
- Status: Implemented

**CustomerContractsTab**
- Purpose: Customer contract information
- Props: customerId
- Status: Implemented

**CustomerPropertiesTab**
- Purpose: Customer property assignments
- Props: customerId
- Status: Implemented

**CustomerTimelineTab**
- Purpose: Customer timeline events
- Props: customerId
- Status: Implemented

**AssignPropertyDrawer**
- Purpose: Assign property to customer
- Props: isOpen, onClose, customer, onAssign
- Status: Implemented

**CreateContractDrawer**
- Purpose: Create contract for customer
- Props: isOpen, onClose, customer, onCreate
- Status: Implemented

**SuspendCustomerModal**
- Purpose: Suspend customer account
- Props: isOpen, onClose, customer, onSuspend
- Status: Implemented

**FilterPanel**
- Purpose: Filtering and search panel
- Props: filters, onFilterChange
- Status: Implemented

**CustomerSkeleton**
- Purpose: Loading skeleton for customer data
- Props: None
- Status: Implemented

#### Entity Card Components

**Location:** `src/components/admin/entity-card/`

- Status: Directory exists, components to be documented

#### Table Components

**Location:** `src/components/admin/table/`

- Status: Directory exists, components to be documented

### 3.2 Host Onboarding Components

**Location:** `src/components/host-onboarding/steps/`

**StepIntro1**
- Purpose: Introduction step 1
- Props: onNext
- Status: Implemented

**StepIntro2**
- Purpose: Introduction step 2
- Props: onNext, onBack
- Status: Implemented

**StepIntro3**
- Purpose: Introduction step 3
- Props: onNext, onBack
- Status: Implemented

**StepWelcome**
- Purpose: Welcome screen
- Props: onNext
- Status: Implemented

**StepPropertyType**
- Purpose: Property type selection
- Props: onNext, onBack, data, onChange
- Status: Implemented

**StepTitle**
- Purpose: Property title input
- Props: onNext, onBack, data, onChange
- Status: Implemented

**StepLocation**
- Purpose: Location/address input
- Props: onNext, onBack, data, onChange
- Status: Implemented

**StepBasics**
- Purpose: Basic property details
- Props: onNext, onBack, data, onChange
- Status: Implemented

**StepOccupants**
- Purpose: Occupant capacity
- Props: onNext, onBack, data, onChange
- Status: Implemented

**StepBathrooms**
- Purpose: Bathroom count
- Props: onNext, onBack, data, onChange
- Status: Implemented

**StepAmenities**
- Purpose: Amenity selection
- Props: onNext, onBack, data, onChange
- Status: Implemented

**StepHighlights**
- Purpose: Property highlights
- Props: onNext, onBack, data, onChange
- Status: Implemented

**StepSafety**
- Purpose: Safety features
- Props: onNext, onBack, data, onChange
- Status: Implemented

**StepPhotos**
- Purpose: Photo upload
- Props: onNext, onBack, data, onChange
- Status: Implemented

**StepBooking**
- Purpose: Booking settings
- Props: onNext, onBack, data, onChange
- Status: Implemented

**StepFinalDetails**
- Purpose: Final details review
- Props: onNext, onBack, data, onChange
- Status: Implemented

**StepConfirmAddress**
- Purpose: Address confirmation
- Props: onNext, onBack, data, onChange
- Status: Implemented

### 3.3 UI Components

**Location:** `src/components/ui/`

**Note:** These are shadcn/ui components. Standard Radix UI components with Tailwind styling.

**Common shadcn/ui Components:**
- Button
- Input
- Dialog
- Dropdown Menu
- Select
- Checkbox
- Radio Group
- Switch
- Slider
- Tabs
- Table
- Card
- Avatar
- Badge
- Alert
- Toast
- Form
- Label
- Scroll Area
- Separator
- Skeleton
- Tooltip
- Popover
- Command
- Calendar
- Date Picker

---

## 4. Component Hierarchy

### 4.1 Page Level

```
App.tsx
├── AuthProvider
│   ├── Public Pages
│   │   ├── Home
│   │   ├── Marketplace
│   │   └── Property Detail
│   ├── Protected Pages
│   │   ├── Profile
│   │   ├── Notifications
│   │   ├── Integrations
│   │   └── Payment
│   ├── Host Pages
│   │   └── Host Onboarding
│   └── Admin Pages
│       ├── Admin Dashboard
│       ├── Admin Properties
│       ├── Admin Bookings
│       ├── Admin Payments
│       ├── Admin Users
│       └── Customers Page
```

### 4.2 Admin Customer Management Hierarchy

```
CustomersPage
├── FilterPanel
├── CustomerTable
│   └── CustomerSkeleton (loading)
├── AddCustomerModal
├── EditCustomerModal
└── CustomerProfileDrawer
    ├── CustomerOverviewTab
    ├── CustomerBookingsTab
    ├── CustomerPaymentsTab
    ├── CustomerContractsTab
    ├── CustomerPropertiesTab
    └── CustomerTimelineTab
```

### 4.3 Host Onboarding Hierarchy

```
HostOnboarding
├── StepIntro1
├── StepIntro2
├── StepIntro3
├── StepWelcome
├── StepPropertyType
├── StepTitle
├── StepLocation
├── StepBasics
├── StepOccupants
├── StepBathrooms
├── StepAmenities
├── StepHighlights
├── StepSafety
├── StepPhotos
├── StepBooking
├── StepFinalDetails
└── StepConfirmAddress
```

---

## 5. UI Patterns

### 5.1 Modal Pattern

**Usage:** For forms and confirmations that require user focus

**Components:** Dialog from shadcn/ui

**Examples:**
- AddCustomerModal
- EditCustomerModal
- SuspendCustomerModal
- AssignPropertyDrawer
- CreateContractDrawer

### 5.2 Drawer Pattern

**Usage:** For detailed views that slide in from the side

**Components:** Custom drawer implementation

**Examples:**
- CustomerProfileDrawer

### 5.3 Tab Pattern

**Usage:** For organizing related content

**Components:** Tabs from shadcn/ui

**Examples:**
- CustomerProfileDrawer tabs (Overview, Bookings, Payments, Contracts, Properties, Timeline)

### 5.4 Skeleton Pattern

**Usage:** For loading states

**Components:** Skeleton from shadcn/ui

**Examples:**
- CustomerSkeleton

### 5.5 Table Pattern

**Usage:** For displaying data in tabular format

**Components:** Table from shadcn/ui

**Examples:**
- Customer table
- Property table
- Booking table
- Payment table
- User table

### 5.6 Filter Pattern

**Usage:** For filtering and searching data

**Components:** FilterPanel (custom)

**Examples:**
- Customer filters
- Property filters
- Booking filters

### 5.7 Wizard Pattern

**Usage:** For multi-step processes

**Components:** Custom wizard implementation

**Examples:**
- Host onboarding (17 steps)

---

## 6. Design System

### 6.1 Color Palette

**Status Colors (from status.ts):**
- Pending: Yellow
- Approved/Active: Green
- Rejected/Suspended: Red
- Completed: Blue
- Draft: Gray

**Badge Colors:**
- Mapped to Tailwind classes
- Consistent across application

### 6.2 Typography

**Font:** Default system font (to be confirmed)

**Heading Levels:**
- H1: Page titles
- H2: Section titles
- H3: Subsection titles
- H4: Component titles

### 6.3 Spacing

**Spacing Scale:** TailwindCSS spacing scale

**Common Spacing:**
- Padding: 4px, 8px, 16px, 24px, 32px
- Margin: 4px, 8px, 16px, 24px, 32px
- Gap: 8px, 16px, 24px

### 6.4 Border Radius

**Border Radius:**
- Small: 4px
- Medium: 8px
- Large: 12px
- Full: 9999px

### 6.5 Shadows

**Shadows:** TailwindCSS shadow utilities

---

## 7. Responsive Design

### 7.1 Breakpoints

**TailwindCSS Breakpoints:**
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

### 7.2 Responsive Patterns

**Mobile First:** Design for mobile, enhance for larger screens

**Common Patterns:**
- Stacked layouts on mobile
- Grid layouts on desktop
- Collapsible navigation
- Touch-friendly targets

---

## 8. Accessibility

### 8.1 Accessibility Features

**Keyboard Navigation:**
- Tab through interactive elements
- Enter/Space to activate
- Escape to close modals

**Screen Reader Support:**
- Semantic HTML
- ARIA labels (to be verified)
- Alt text for images

**Focus Management:**
- Focus trap in modals
- Visible focus indicators
- Skip to content links (to be implemented)

### 8.2 Accessibility Status

**Current Status:** Partially compliant

**Implemented:**
- Semantic HTML
- Keyboard navigation
- Focus management in modals

**To Be Improved:**
- ARIA labels
- Alt text for all images
- Skip to content links
- Color contrast ratios
- Screen reader testing

---

## 9. Missing Components

### 9.1 Marketplace Components

**Property Card:** For property listings
**Property Search:** Advanced search component
**Property Filter:** Filter sidebar
**Availability Calendar:** Date selection calendar
**Booking Form:** Booking request form
**Review Form:** Submit review form

### 9.2 Messaging Components

**Conversation List:** List of conversations
**Conversation Detail:** Conversation view
**Message Input:** Message composition
**Message Thread:** Message display
**Attachment Upload:** File upload component

### 9.3 Dashboard Components

**KPI Cards:** Dashboard metric cards
**Charts:** Data visualization
**Activity Feed:** Recent activity list
**Quick Actions:** Quick action buttons

### 9.4 Profile Components

**Avatar Upload:** Profile picture upload
**Settings Form:** Account settings
**Security Settings:** Password change, 2FA
**Notification Preferences:** Notification settings

---

## 10. Component Reusability

### 10.1 Highly Reusable Components

**shadcn/ui Components:**
- Button, Input, Dialog, Table, Card, Badge, etc.
- Used throughout application
- Consistent styling and behavior

### 10.2 Custom Reusable Components

**FilterPanel:**
- Can be reused for different entity types
- Configurable filters

**CustomerSkeleton:**
- Can be adapted for other entity types
- Consistent loading experience

**Tab Pattern:**
- Can be reused for different detail views
- Consistent tab behavior

### 10.3 Component Duplication

**Potential Duplications:**
- Similar modals may have duplicate code
- Similar tables may have duplicate code
- Similar forms may have duplicate code

**Recommendations:**
- Extract common modal logic
- Create generic table component
- Create generic form components

---

## 11. UI State Management

### 11.1 Local Component State

**useState Hook:**
- Form state
- Modal open/close state
- Loading states
- Error states

### 11.2 Global State

**Context API:**
- AuthContext: Authentication state
- LanguageProvider: Language state

### 11.3 Server State

**Supabase Queries:**
- Data fetching
- Real-time subscriptions
- Caching (to be implemented)

**Recommendation:** Consider React Query or SWR for server state management

---

## 12. Form Handling

### 12.1 Form Libraries

**React Hook Form:** (Implied from component structure)
- Form validation
- Form submission
- Error handling

### 12.2 Validation Patterns

**Client-side Validation:**
- Required fields
- Email format
- Phone number format
- Date ranges

**Server-side Validation:**
- Business rule validation
- Constraint validation
- RPC function validation

---

## 13. Error Handling UI

### 13.1 Error Display

**Error Messages:**
- Form validation errors
- API errors
- Network errors

**Error Components:**
- Error alerts (shadcn/ui Alert)
- Error boundaries (to be implemented)
- Error pages (404, 500) (to be implemented)

### 13.2 Loading States

**Loading Indicators:**
- Skeleton screens
- Spinners
- Progress bars

---

## 14. UI Testing

### 14.1 Testing Status

**Current Status:** No automated UI tests

**Recommendations:**
- Implement unit tests for components
- Implement integration tests for pages
- Implement E2E tests with Playwright
- Implement visual regression testing

### 14.2 Testing Tools

**Recommended Tools:**
- Vitest for unit tests
- React Testing Library for component tests
- Playwright for E2E tests
- Storybook for component documentation

---

## 15. UI Performance

### 15.1 Performance Considerations

**Code Splitting:**
- Route-based code splitting (to be verified)
- Lazy loading for large components

**Image Optimization:**
- Lazy loading for images
- Optimized formats (to be implemented)
- CDN delivery (to be implemented)

**Rendering Optimization:**
- React.memo for expensive components
- useCallback for event handlers
- useMemo for expensive calculations

### 15.2 Performance Gaps

**Current Gaps:**
- No image optimization
- No code splitting verification
- No performance monitoring
- No bundle size optimization

**Recommendations:**
- Implement image optimization
- Verify code splitting
- Implement performance monitoring
- Optimize bundle size
- Implement caching strategies

---

## 16. UI Documentation

### 16.1 Component Documentation

**Current Status:** Limited documentation

**Recommendations:**
- Implement Storybook for component documentation
- Document component props
- Document component usage examples
- Document component patterns

### 16.2 Design Documentation

**Current Status:** No formal design documentation

**Recommendations:**
- Create design system documentation
- Document color palette
- Document typography
- Document spacing system
- Document component patterns

---

## 17. UI Inventory Summary

### 17.1 Page Count

**Total Pages:** 12
- Public: 3
- Protected: 3
- Payment: 1
- Host: 1
- Admin: 5

### 17.2 Component Count

**Admin Components:** 15+
**Host Onboarding Components:** 17
**UI Components:** 20+ (shadcn/ui)
**Total:** 52+

### 17.3 Implementation Status

**Fully Implemented:**
- All admin pages
- Host onboarding
- Basic page structure

**Partially Implemented:**
- Marketplace pages
- Profile pages
- Payment pages

**To Be Implemented:**
- Messaging UI
- Dashboard widgets
- Advanced filters
- Some marketplace components

---

## 18. Documentation References

**Related Documents:**
- Frontend Architecture Document
- Module Documentation

**Code References:**
- `src/pages/` - Page components
- `src/components/admin/` - Admin components
- `src/components/host-onboarding/` - Host onboarding components
- `src/components/ui/` - UI components

---

**End of UI Inventory**
