# IMPLEMENTATION_BACKLOG

## Critical

- Generate Supabase types (source-of-truth types for all services)
- Remove mock data: customerService → Supabase
- Remove mock data: propertyService → Supabase
- Remove mock data: bookingService → Supabase
- Remove mock data: paymentService → Supabase
- Remove mock data: notificationService → Supabase
- Remove mock data: messagingService → Supabase
- Establish typed services layer (no direct Supabase in pages):
  - organizationService
  - subscriptionService (plans + subscriptions)
  - commissionService
  - analyticsService (typed queries/views)
- Build verification + RLS verification for above

## High

- Organizations & Organization Users UI/CRUD (filters, search, pagination, activity history, RBAC, nav)
- Customers: full Supabase CRM (profile_id-based), activity history, notes/tags, dashboards
- Subscription Plans & Subscriptions: full CRUD, activate/archive, upgrade/downgrade/renew/cancel, billing history, dashboard cards
- RMS modules: buildings, units, tenants, contracts, maintenance_requests (list/create/edit/delete/detail; relationships wired)
- Booking guests integration in booking flows
- Notifications center (Supabase-backed) with read/unread/archive/filters
- Properties: availability, reviews, wishlists (Supabase) + remove remaining mocks

## Medium

- Commissions dashboard: total/monthly/booking/rental/subscription revenue metrics
- Analytics dashboards (owner/admin) using Supabase views (occupancy, revenue, bookings, contracts, orgs, properties, commissions)
- Reporting/exports (CSV/PDF) for key modules
- Admin activity logs surfacing in UI

## Low

- Future mobile-specific features
- Additional localization/internationalization
- Nice-to-have marketing/landing refinements after core ops are production-ready
