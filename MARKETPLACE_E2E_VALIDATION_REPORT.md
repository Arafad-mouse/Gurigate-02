# GuriGate Marketplace E2E Validation Report

Date: 2026-06-04
Agent: Agent 2 - Senior QA Engineer and SaaS Validation Lead
Scope: Validation only. No application logic was modified.

## Executive Summary

Agent 1 removed the previously identified property fixture dependencies from several production pages, but end-to-end marketplace readiness is not yet proven. Code inspection shows the repository/service architecture exists for properties, wishlists, reviews, availability, bookings, and payments, and admin moderation has real RPC wiring. However, multiple routed user flows still use static UI state, placeholder handlers, legacy mock data, or table/field names that do not align cleanly with the current Supabase schema.

Runtime validation is blocked. `npx.cmd --yes pnpm run build` timed out after 60 seconds with no usable completion signal, so browser execution and live Supabase E2E testing were not performed.

Final MVP readiness score: **62 / 100**

## Validation Signals

- `package.json` defines `build` but no `typecheck` script.
- Build signal: `npx.cmd --yes pnpm run build` timed out after 60 seconds.
- Root `src/App.tsx` routes `/`, `/property/:id`, `/payment`, `/all-property`, `/manage-property`, and `/admin/*`.
- `src/pages/MarketplacePage.tsx`, `src/pages/WishlistPage.tsx`, `src/pages/host/CreatePropertyPage.tsx`, `src/pages/host/EditPropertyPage.tsx`, and `src/pages/host/HostPropertiesPage.tsx` exist but are not routed by the current root app.
- Property service/repository architecture exists under `frontend/src`, but several routed root pages still bypass it.
- Supabase migrations define `properties`, `property_addresses`, `property_pricing`, `property_features`, `property_images`, `property_reviews`, `property_bookings`, `wishlists`, `payments`, admin moderation RPCs, payment RPCs, and availability blocks.

## Flow Results

| Area | Workflow | Status |
| --- | --- | --- |
| Property | Create Property | FAIL |
| Property | Edit Property | FAIL |
| Property | Delete Property | PARTIAL |
| Property | Upload Images | PARTIAL |
| Property | Status Changes | PARTIAL |
| Admin | Pending Review | PARTIAL |
| Admin | Approve Property | PARTIAL |
| Admin | Reject Property | PARTIAL |
| Admin | Suspend Property | PARTIAL |
| Admin | Feature Property | PARTIAL |
| Marketplace | Property Search | PARTIAL |
| Marketplace | Filters | PARTIAL |
| Marketplace | Pagination | PARTIAL |
| Marketplace | Property Detail | PARTIAL |
| Marketplace | Property Reviews | PARTIAL |
| Marketplace | Availability Display | PARTIAL |
| Wishlist | Add to Wishlist | FAIL |
| Wishlist | Remove from Wishlist | PARTIAL |
| Wishlist | Persistence Across Refresh | PARTIAL |
| Booking | Create Booking | FAIL |
| Booking | Booking Confirmation | FAIL |
| Booking | Booking Status Progression | PARTIAL |
| Booking | Booking Cancellation | PARTIAL |
| Payment | Wallet Payment Creation | PARTIAL |
| Payment | Card Payment Creation | PARTIAL |
| Payment | Payment Verification | PARTIAL |
| Payment | Payment History | PARTIAL |
| Payment | Payment Status Tracking | PARTIAL |

## Property Flow

### Create Property - FAIL

Root cause: The routed app does not expose `/host/properties/create`, and `src/pages/host/CreatePropertyPage.tsx` contains only placeholder submit logic that logs and navigates. The deeper `frontend/src/services/propertyService.ts` has `createProperty`, but it uses `ownerId = 'current-user'` instead of the authenticated user and is not wired to the host form.

Affected files:
- `src/App.tsx`
- `src/pages/host/CreatePropertyPage.tsx`
- `frontend/src/services/propertyService.ts`
- `frontend/src/repositories/property/propertyRepository.ts`

Recommended fix: Add protected host routes, wire create form state to `useProperty().createProperty`, pass authenticated owner ID through the service, and validate insert into `properties`, `property_addresses`, `property_pricing`, and `property_features`.

Effort estimate: 1.5-2.5 days.

### Edit Property - FAIL

Root cause: The routed app does not expose an edit route, and `src/pages/host/EditPropertyPage.tsx` does not fetch the property or call update APIs.

Affected files:
- `src/App.tsx`
- `src/pages/host/EditPropertyPage.tsx`
- `frontend/src/hooks/useProperty.ts`
- `frontend/src/services/propertyService.ts`

Recommended fix: Add protected edit route, preload property by ID, bind form fields, call `updateProperty`, and update related address/pricing/features records.

Effort estimate: 1-2 days.

### Delete Property - PARTIAL

Root cause: Repository/service soft-delete support exists, but no routed host UI action calls it. The service also uses `deletedBy = 'current-user'`.

Affected files:
- `src/pages/host/HostPropertiesPage.tsx`
- `frontend/src/services/propertyService.ts`
- `frontend/src/repositories/property/propertyRepository.ts`

Recommended fix: Add host delete/archive action with confirmation, use authenticated profile ID for `deleted_by`, and refresh host property list after archive.

Effort estimate: 0.5-1 day.

### Upload Images - PARTIAL

Root cause: `property_images` table and storage bucket policy exist, and `propertyImageRepository` is present, but host create/edit pages do not upload images or attach image rows.

Affected files:
- `src/pages/host/CreatePropertyPage.tsx`
- `src/pages/host/EditPropertyPage.tsx`
- `frontend/src/repositories/property/propertyImageRepository.ts`
- `supabase/migrations/20240502_gurigate_properties_schema.sql`

Recommended fix: Add image picker/upload flow, upload to `property-images`, insert `property_images`, and support primary image selection.

Effort estimate: 1-2 days.

### Status Changes - PARTIAL

Root cause: Admin RPCs and property service status update exist, but host/admin status concepts are split across `status`, `is_approved`, and `approval_status`. Migrations and code use both `available` and `active`, creating risk that approved properties will not appear in all marketplace queries.

Affected files:
- `src/services/adminService.ts`
- `frontend/src/services/propertyService.ts`
- `supabase/migrations/20240502_gurigate_properties_schema.sql`
- `supabase/migrations/20260508_admin_role_system.sql`
- `supabase/migrations/20260603_property_availability_blocks.sql`

Recommended fix: Normalize status vocabulary and document the single source of truth for listing lifecycle versus availability. Update all queries and RLS policies to the same enum values.

Effort estimate: 1-2 days.

## Admin Flow

Admin property moderation is architecturally present but remains PARTIAL because runtime execution was blocked and some query fields depend on migration compatibility.

### Pending Review - PARTIAL

Root cause: `AdminProperties` calls `AdminService.getAllProperties/getPropertiesByStatus`, but the flow depends on `approval_status`, direct `city`, `price`, and `currency` columns that are not part of the original property schema and must be supplied by later migrations.

Affected files:
- `src/pages/admin/AdminProperties.tsx`
- `src/services/adminService.ts`
- `supabase/migrations/20260508_admin_role_system.sql`

Recommended fix: Verify applied production schema includes all queried columns or rewrite admin queries to join address/pricing tables consistently.

Effort estimate: 0.5-1 day.

### Approve, Reject, Suspend, Feature Property - PARTIAL

Root cause: UI actions call RPCs (`approve_property`, `reject_property`, `suspend_property`, `feature_property`, `unfeature_property`), and migrations define them. Runtime was not testable, and feature RPCs update `updated_by_admin`, which must exist on `properties`.

Affected files:
- `src/components/admin/property/PropertyReviewDrawer.tsx`
- `src/hooks/usePropertyModeration.ts`
- `src/services/adminService.ts`
- `supabase/migrations/20260508_admin_role_system.sql`
- `supabase/migrations/20260603_property_feature_functions.sql`

Recommended fix: Run RPC smoke tests after toolchain recovery and confirm each transition updates `approval_status`, `is_approved`, `status`, audit logs, and marketplace visibility.

Effort estimate: 0.5-1 day.

## Marketplace Flow

### Property Search - PARTIAL

Root cause: `MarketplacePage` has service-backed search, but it is not routed. The routed `/all-property` page still uses local `ALL_PROPERTIES` static data. Landing search/filter UI also filters loaded city buckets in memory rather than performing full repository search.

Affected files:
- `src/App.tsx`
- `src/pages/MarketplacePage.tsx`
- `src/pages/all-property.tsx`
- `src/pages/GuriGateLandingPage.tsx`
- `frontend/src/services/propertyService.ts`

Recommended fix: Route the service-backed marketplace page or migrate `/all-property` to `useProperties`; remove `ALL_PROPERTIES` static data from the routed flow.

Effort estimate: 1-1.5 days.

### Filters - PARTIAL

Root cause: Service-backed filters exist, but advanced filters such as city, price, bedrooms, and amenities are not consistently pushed to Supabase. `/all-property` filters local static data only.

Affected files:
- `src/pages/all-property.tsx`
- `src/pages/MarketplacePage.tsx`
- `frontend/src/repositories/property/propertyRepository.ts`
- `frontend/src/services/propertyService.ts`

Recommended fix: Extend repository filters to join address/pricing/features or use a stable marketplace view that exposes searchable fields.

Effort estimate: 1-2 days.

### Pagination - PARTIAL

Root cause: `useProperties` supports page/pageSize, but routed `/all-property` renders all static records and a non-functional "Load more properties" button.

Affected files:
- `src/pages/all-property.tsx`
- `frontend/src/hooks/useProperties.ts`

Recommended fix: Replace local list with service pagination and connect the load-more control to `setPage` or cursor-based pagination.

Effort estimate: 0.5-1 day.

### Property Detail - PARTIAL

Root cause: `/property/:id` loads through `GuriGatePropertyService.getPropertyById`, but it converts UUIDs to numeric IDs and fetches from `featured_properties` with an approximate match. This can open the wrong property or fail for valid UUIDs.

Affected files:
- `src/App.tsx`
- `src/services/guriGateProperties.ts`
- `src/pages/PropertyPage.tsx`
- `src/pages/PropertyDetailPage.tsx`

Recommended fix: Keep UUIDs in marketplace cards/routes and load detail from `propertyService.getPropertyById(id)` with full relations.

Effort estimate: 1 day.

### Property Reviews - PARTIAL

Root cause: Repository support exists, but routed `PropertyPage` uses static review arrays. `PropertyDetailPage` has review components but is not routed, and review submission is a placeholder.

Affected files:
- `src/pages/PropertyPage.tsx`
- `src/pages/PropertyDetailPage.tsx`
- `frontend/src/repositories/property/propertyReviewRepository.ts`
- `frontend/src/services/propertyService.ts`

Recommended fix: Route the service-backed detail page, fetch reviews via `getPropertyReviews`, and wire review submission to authenticated guest IDs.

Effort estimate: 1-1.5 days.

### Availability Display - PARTIAL

Root cause: Availability blocks and check APIs exist, but routed property detail does not display availability from the repository. Booking widget only accepts dates locally.

Affected files:
- `src/pages/PropertyPage.tsx`
- `frontend/src/repositories/property/availabilityRepository.ts`
- `frontend/src/services/propertyService.ts`
- `supabase/migrations/20260603_property_availability_blocks.sql`

Recommended fix: Add availability calendar/check to property detail and block unavailable dates before reservation.

Effort estimate: 1-2 days.

## Wishlist Flow

### Add to Wishlist - FAIL

Root cause: Routed property cards and property detail only toggle local `liked` state. `MarketplacePage` has a wishlist handler that logs to console, and that page is not routed.

Affected files:
- `src/pages/GuriGateLandingPage.tsx`
- `src/pages/all-property.tsx`
- `src/pages/PropertyPage.tsx`
- `src/pages/MarketplacePage.tsx`
- `frontend/src/hooks/useWishlist.ts`

Recommended fix: Wire heart buttons to `useWishlist.addToWishlist`, enforce authentication, and persist property IDs as UUIDs.

Effort estimate: 0.5-1 day.

### Remove from Wishlist - PARTIAL

Root cause: `useWishlist.removeFromWishlist` and `WishlistPage` exist, but `WishlistPage` is not routed in `App.tsx`.

Affected files:
- `src/App.tsx`
- `src/pages/WishlistPage.tsx`
- `frontend/src/hooks/useWishlist.ts`
- `frontend/src/repositories/property/wishlistRepository.ts`

Recommended fix: Add protected `/wishlist` route and navigation entry; ensure remove action refreshes persisted wishlist state.

Effort estimate: 0.5 day.

### Persistence Across Refresh - PARTIAL

Root cause: Database persistence exists through `wishlists`, but active routed add actions do not write to it.

Affected files:
- `src/pages/GuriGateLandingPage.tsx`
- `src/pages/all-property.tsx`
- `frontend/src/repositories/property/wishlistRepository.ts`
- `supabase/migrations/20240502_gurigate_properties_schema.sql`

Recommended fix: Persist add/remove to Supabase and hydrate card liked state from `useWishlist`.

Effort estimate: 0.5-1 day.

## Booking Flow

### Create Booking - FAIL

Root cause: The routed reserve flow stores booking details in `sessionStorage` and navigates to `/payment`; it does not create a `property_bookings` record. `PaymentPage` expects `bookingId`, but `PropertyPage` does not set one.

Affected files:
- `src/pages/PropertyPage.tsx`
- `src/App.tsx`
- `src/pages/PaymentPage.tsx`
- `frontend/src/services/bookingService.ts`
- `frontend/src/repositories/bookingRepository.ts`

Recommended fix: Create a booking before payment, store the returned booking UUID, and pass it to payment. Use the actual `property_bookings` table or align repository table names.

Effort estimate: 1.5-2 days.

### Booking Confirmation - FAIL

Root cause: `PaymentPageWrapper.onConfirm` only shows an alert and navigates home. There is no booking confirmation persistence in the routed customer flow.

Affected files:
- `src/App.tsx`
- `src/pages/PaymentPage.tsx`
- `frontend/src/services/bookingService.ts`

Recommended fix: Update booking status after successful payment/verification and route to a booking confirmation page.

Effort estimate: 1 day.

### Booking Status Progression - PARTIAL

Root cause: Booking service supports confirm/cancel against `bookings`, while migrations and admin services primarily use `property_bookings`. Admin bookings page uses static local records.

Affected files:
- `frontend/src/services/bookingService.ts`
- `frontend/src/repositories/bookingRepository.ts`
- `src/pages/admin/AdminBookings.tsx`
- `src/services/adminService.ts`
- `supabase/migrations/20240502_gurigate_properties_schema.sql`

Recommended fix: Standardize on `property_bookings`, update repository and hooks, and replace admin static data with `AdminService.getAllBookings`.

Effort estimate: 1-2 days.

### Booking Cancellation - PARTIAL

Root cause: Admin cancellation service exists, and booking service has cancellation, but the routed admin bookings page only logs cancellation actions and uses local mock state.

Affected files:
- `src/pages/admin/AdminBookings.tsx`
- `src/services/adminService.ts`
- `frontend/src/services/bookingService.ts`

Recommended fix: Wire admin booking actions to `AdminService.cancelBooking` and guest cancellation to booking service with ownership checks.

Effort estimate: 0.5-1 day.

## Payment Flow

### Wallet Payment Creation - PARTIAL

Root cause: `PaymentService.createWalletPayment` calls `create_local_wallet_payment` when Supabase and booking ID are present, but it returns a mock payment if Supabase is not configured or `bookingId` is missing. The routed booking flow currently does not create or pass a booking ID.

Affected files:
- `src/pages/PaymentPage.tsx`
- `src/services/paymentService.ts`
- `supabase/migrations/20260502_payments_flow.sql`

Recommended fix: Require a persisted booking before entering payment and remove/mock-gate fallback from production builds.

Effort estimate: 0.5-1 day.

### Card Payment Creation - PARTIAL

Root cause: Dodo edge function exists and validates booking ownership, but the routed flow lacks a booking ID and runtime deployment/configuration could not be tested.

Affected files:
- `src/pages/PaymentPage.tsx`
- `src/services/paymentService.ts`
- `supabase/functions/create-dodo-checkout/index.ts`

Recommended fix: Persist booking before card checkout and smoke test edge function environment variables plus Dodo API response.

Effort estimate: 0.5-1 day after runtime is available.

### Payment Verification - PARTIAL

Root cause: `verify_payment` RPC and admin verification UI exist, but admin payments page starts from static local records and only updates local state after RPC. Payment list loading is not wired to `AdminService.getAllPayments`.

Affected files:
- `src/pages/admin/AdminPayments.tsx`
- `src/services/adminService.ts`
- `supabase/migrations/20260508_admin_role_system.sql`

Recommended fix: Replace static payment state with `AdminService.getAllPayments`, enforce `canVerifyPayment`, and refresh after verify/reject.

Effort estimate: 0.5-1 day.

### Payment History - PARTIAL

Root cause: Payment repository and admin list APIs exist, but customer-facing payment history is not routed or integrated. Admin history page uses static records.

Affected files:
- `frontend/src/hooks/usePayments.ts`
- `frontend/src/repositories/paymentRepository.ts`
- `src/pages/admin/AdminPayments.tsx`
- `src/components/payment/PaymentHistory.tsx`

Recommended fix: Route customer payment history and wire admin payment table to persisted payment queries.

Effort estimate: 1 day.

### Payment Status Tracking - PARTIAL

Root cause: Payment status fields exist, and UI components exist, but the active flow does not poll/subscribe to payment status after checkout and does not handle Dodo return verification.

Affected files:
- `src/pages/PaymentPage.tsx`
- `src/services/paymentService.ts`
- `frontend/src/components/payment/PaymentStatusTracker.tsx`
- `supabase/functions/create-dodo-checkout/index.ts`

Recommended fix: Add payment status route/state, fetch status by payment ID/provider reference, and process Dodo webhook/return completion.

Effort estimate: 1-2 days.

## Cross-Cutting Risks

1. Active routed mock/static data remains in `/all-property`, `/admin/bookings`, and `/admin/payments`.
2. There is route drift between existing pages and the current app router.
3. There is schema drift between `properties` direct fields and normalized property relation tables.
4. There is booking table drift between `bookings` and `property_bookings`.
5. There is payment field drift between `payment_provider/payment_method` and `method/type`.
6. Authenticated user IDs are still hardcoded as `current-user` in property service operations.
7. Runtime E2E execution is blocked by the current build/toolchain state.

## MVP Readiness Score

Score: **62 / 100**

Rationale:
- Property repository architecture: strong.
- Admin moderation architecture: mostly present.
- Payment architecture: partially present with real wallet/card paths.
- Customer-facing marketplace/booking/wishlist routing and persistence: incomplete.
- Runtime confidence: blocked.
- Remaining risk is integration wiring, not lack of domain architecture.

## Recommended Next QA Gate

After Agent 3 restores the toolchain, rerun:

```txt
pnpm install
pnpm run build
pnpm run lint
```

Then perform browser E2E with real seeded data:

```txt
Create property -> admin approve -> appears in marketplace -> wishlist -> booking -> wallet payment -> admin verify
```

MVP should not be marked complete until the routed application uses persisted data for marketplace, wishlist, booking, and admin payment/booking screens.
