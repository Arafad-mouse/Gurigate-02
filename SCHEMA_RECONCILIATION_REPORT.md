# GuriGate Schema Reconciliation Report

Date: 2026-06-04
Agent: Schema Reconciliation Agent
Scope: Investigation and documentation only. No application logic was modified.

## Executive Summary

The current build blocker is application-to-schema drift, not missing dependencies or remaining mock property fixtures.

The repository currently contains at least two competing schema models:

1. A normalized property schema from `supabase/migrations/20240502_gurigate_properties_schema.sql`, with `property_addresses`, `property_pricing`, `property_features`, `property_bookings`, `property_badge`, `pricing_type`, and `currency_type`.
2. The generated Supabase types in `frontend/src/integrations/supabase/database.types.ts` and `frontend/src/integrations/supabase/types_utf8.ts`, where `properties` is flattened and several normalized tables/enums are absent.

The property domain/repository/service stack was built around model 1. TypeScript currently compiles against model 2. That is the primary reason the build reaches TypeScript and then fails.

## Highest Priority Fix Order

1. Regenerate or repair Supabase generated types from the intended production schema.
2. Decide whether `properties` is normalized or flattened, then align repository/domain mappers to that single model.
3. Standardize property lifecycle enums across migrations, generated types, repositories, services, and UI.
4. Standardize booking on either `bookings` or `property_bookings`.
5. Standardize payment shape on either platform payments (`booking_id`, `payment_provider`, `payment_method`) or generated payment ledger (`reference_id`, `method`, `payer_id`, `payee_id`).

## Findings

### 1. Build-Blocking: Generated Types Do Not Include Normalized Property Tables

Severity: Critical

Affected files:

- `frontend/src/integrations/supabase/database.types.ts`
- `frontend/src/integrations/supabase/types_utf8.ts`
- `frontend/src/domain/property/PropertyMapper.ts`
- `frontend/src/repositories/property/propertyRepository.ts`
- `frontend/src/services/propertyService.ts`
- `supabase/migrations/20240502_gurigate_properties_schema.sql`

Root cause:

`PropertyMapper` and `propertyRepository` type and query these normalized tables:

- `property_addresses`
- `property_pricing`
- `property_features`

The generated Supabase types inspected in `frontend/src/integrations/supabase/database.types.ts` expose a flattened `properties` table with fields such as `address`, `city`, `price`, `price_unit`, `bedrooms`, `bathrooms`, `amenities`, and `max_total_guests`. They do not expose `property_addresses`, `property_pricing`, or `property_features` as typed public tables.

Fix recommendation:

Choose the production schema source of truth.

If normalized property architecture is intended, apply/verify the normalized migrations in Supabase and regenerate `database.types.ts` / `types_utf8.ts` so the child tables exist in generated types. If the flattened schema is intended, rewrite `PropertyMapper`, `PropertyRepository`, and property form inputs to map from the flat `properties` row instead of child relations.

### 2. Build-Blocking: Property Domain Enums Drift From Generated Database Enums

Severity: Critical

Affected files:

- `frontend/src/domain/property/PropertyTypes.ts`
- `frontend/src/domain/property/PropertyMapper.ts`
- `frontend/src/repositories/property/propertyRepository.ts`
- `frontend/src/services/propertyService.ts`
- `frontend/src/integrations/supabase/database.types.ts`
- `supabase/migrations/20240502_gurigate_properties_schema.sql`
- `supabase/migrations/20260603_property_availability_blocks.sql`

Root cause:

The property domain expects:

- `PropertyStatus`: `available`, `occupied`, `maintenance`, `pending`, `inactive`
- `PropertyType`: includes `studio`, `condo`, `townhouse`, `cottage`, `penthouse`, `loft`, `other`
- `PropertyBadge`: `FOR_SALE`, `FOR_RENT`, `SHORT_STAY`
- `PricingType`: `nightly`, `monthly`, `sale`

Generated types expose:

- `property_status`: `draft`, `pending_approval`, `active`, `archived`
- `property_type`: `apartment`, `villa`, `room`, `shop`, `office`, `house`
- `property_purpose`: `sale`, `long_rent`, `short_stay`
- `price_unit`: `total`, `per_night`, `per_month`

The availability migration also checks public availability with `properties.status = 'active'`, while the original property RLS and repository use `status = 'available'`.

Fix recommendation:

Create a single lifecycle vocabulary. Recommended split:

- Listing workflow: `draft`, `pending_approval`, `active`, `archived`
- Admin approval: `draft`, `pending`, `approved`, `rejected`, `suspended`, if kept separate
- Booking availability: derive from availability blocks/bookings rather than overloading property status

Then update `PropertyStatus`, `PropertyMapper`, repository filters, RLS policies, and marketplace queries to match generated enums exactly.

### 3. Build-Blocking: Property Mapper Uses Fields Missing From Current Generated Rows

Severity: Critical

Affected files:

- `frontend/src/domain/property/PropertyMapper.ts`
- `frontend/src/domain/property/PropertyTypes.ts`
- `frontend/src/integrations/supabase/database.types.ts`

Root cause:

`PropertyMapper.toDomain()` reads `property.badge`, `property.price_unit_label`, `property.is_approved`, `property.is_featured`, `property.rating_avg`, `property.owner_id`, and normalized child rows.

The generated `properties` row has `price_unit_label`, `is_approved`, `is_featured`, `rating_avg`, and `owner_id`, but it does not have `badge`; it uses `purpose`. It also makes `description` nullable, while the domain requires `description: string`. The mapper also requires non-null `address`, `pricing`, and `features`, but service calls frequently pass `null`.

Fix recommendation:

Make the mapper correspond to the actual generated row:

- Map `purpose` to domain sale/rent/short-stay classification, or restore `badge` in schema/types.
- Normalize nullable DB fields before constructing strict domain entities.
- Either require relations only in `getPropertyById`, or provide a flat-row mapper for property lists.
- Do not pass `null` to mapper parameters typed as child table rows.

### 4. Build-Blocking: Repository Filters Reference Missing `property_badge` Enum

Severity: Critical

Affected files:

- `frontend/src/repositories/property/propertyRepository.ts`
- `frontend/src/integrations/supabase/database.types.ts`
- `frontend/src/domain/property/PropertyTypes.ts`

Root cause:

`propertyRepository.listProperties()` accepts `badge?: Database['public']['Enums']['property_badge']`, but generated enums do not include `property_badge`. Current generated schema represents listing purpose with `property_purpose`.

Fix recommendation:

Replace badge filtering with `purpose` filtering, or reintroduce `property_badge` into the live schema and regenerate types. Avoid maintaining both `badge` and `purpose` unless one is explicitly derived from the other.

### 5. Build-Blocking: Soft-Delete/Admin Columns Are Queried But Missing From Generated Types

Severity: High

Affected files:

- `frontend/src/repositories/property/propertyRepository.ts`
- `src/services/adminService.ts`
- `supabase/migrations/20260508_admin_role_system.sql`
- `supabase/migrations/20260603_property_feature_functions.sql`
- `frontend/src/integrations/supabase/database.types.ts`

Root cause:

Repositories query or update:

- `properties.deleted_at`
- `properties.deleted_by`
- `properties.approval_status`
- `properties.approved_by`
- `properties.approved_at`
- `properties.rejection_reason`
- `properties.updated_by_admin`

The generated `properties` row inspected does not include these admin/soft-delete fields. The admin migration adds several of them, and feature RPCs depend on `updated_by_admin`, but generated types appear not to reflect that final migrated schema.

Fix recommendation:

Regenerate Supabase types after confirming all admin migrations have been applied. If the target DB intentionally lacks these columns, remove soft-delete/admin column assumptions from repositories and route admin state through RPCs or dedicated admin tables.

### 6. High: Profile/User Role Enum Drift

Severity: High

Affected files:

- `src/lib/permissions.ts`
- `src/hooks/usePermissions.ts`
- `src/services/adminService.ts`
- `frontend/src/integrations/supabase/database.types.ts`
- `supabase/migrations/20260508_admin_role_system.sql`

Root cause:

The admin migration defines `user_role` as:

- `guest`
- `host`
- `manager`
- `admin`
- `super_admin`

Generated types expose:

- `guest`
- `owner`
- `building_manager`
- `admin`

The user-provided MVP gate also expects `Guest`, `Host`, `Manager`, `Admin`, `Super Admin`. This means permission checks and generated DB role types are not aligned.

Fix recommendation:

Standardize role enum values around the RBAC model already used by admin permissions: `guest`, `host`, `manager`, `admin`, `super_admin`. Apply a safe DB migration and regenerate types. Then update any UI labels through presentation-only mapping.

### 7. High: Booking Table Drift Between `bookings` and `property_bookings`

Severity: High

Affected files:

- `frontend/src/repositories/bookingRepository.ts`
- `frontend/src/services/bookingService.ts`
- `frontend/src/domain/booking/BookingTypes.ts`
- `src/services/adminService.ts`
- `src/pages/admin/AdminBookings.tsx`
- `src/pages/PropertyPage.tsx`
- `src/pages/PaymentPage.tsx`
- `supabase/migrations/20240502_gurigate_properties_schema.sql`
- `supabase/migrations/20260502_payments_flow.sql`

Root cause:

The original property schema creates `property_bookings` with:

- `check_in_date`
- `check_out_date`
- `total_price`
- `guest_count`
- `special_requests`

Generated types also expose a separate `bookings` table with:

- `check_in`
- `check_out`
- `total_price`
- `nights`
- `booking_type`
- `guest_note`

`frontend/src/repositories/bookingRepository.ts` uses `bookings`, but inserts fields that do not match generated `bookings`: `guests`, `special_requests`, `payment_status`, `host_id`, and `total_amount`. Admin services primarily use `property_bookings`.

Fix recommendation:

Pick one booking table for marketplace MVP. Recommended short-term path: standardize marketplace booking on `property_bookings` because payment RLS/RPCs and admin service already reference it. Then update booking repository/domain to use `check_in_date`, `check_out_date`, `guest_count`, and `total_price`, or create a DB view that exposes the domain names consistently.

### 8. High: Booking Status Enum Drift

Severity: High

Affected files:

- `frontend/src/domain/booking/BookingTypes.ts`
- `frontend/src/repositories/bookingRepository.ts`
- `frontend/src/view-models/booking/*.ts`
- `src/pages/admin/AdminBookings.tsx`
- `frontend/src/integrations/supabase/database.types.ts`
- `supabase/migrations/20240502_gurigate_properties_schema.sql`

Root cause:

Generated `booking_status` includes:

- `pending`
- `confirmed`
- `ongoing`
- `completed`
- `cancelled`

The older property migration has no `ongoing`. UI/admin code also uses display-cased status labels in some areas. This is an enum vocabulary drift risk across DB, repository, and presentation layers.

Fix recommendation:

Keep lowercase DB enum values in domain/service state. Convert to display labels only in view-models/components. Add a single status mapper for admin/customer UI labels.

### 9. High: Payment Schema Drift Between Payment Flow Migration and Generated Types

Severity: High

Affected files:

- `src/services/paymentService.ts`
- `frontend/src/services/paymentService.ts`
- `frontend/src/repositories/paymentRepository.ts`
- `frontend/src/domain/payment/PaymentTypes.ts`
- `src/services/adminService.ts`
- `src/pages/admin/AdminPayments.tsx`
- `supabase/migrations/20260502_payments_flow.sql`
- `frontend/src/integrations/supabase/database.types.ts`

Root cause:

The payment flow migration creates platform payments with:

- `booking_id`
- `payment_provider`
- `payment_method`
- `provider_reference`
- `wallet_phone`
- `currency`
- `metadata`

Generated types expose payment ledger fields:

- `reference_id`
- `reference_type`
- `method`
- `payer_id`
- `payee_id`
- `proof_url`
- no `booking_id`
- no `payment_provider`
- no `payment_method`
- no `currency`

`src/services/paymentService.ts` and admin payment flows expect the platform payment shape. `frontend/src/repositories/paymentRepository.ts` expects a third shape with `user_id`, `type`, `transaction_id`, `gateway_response`, refunds, and `booking_id`.

Fix recommendation:

Define one payment contract for MVP:

- If booking payment is the MVP path, keep `booking_id`, `payment_provider`, `payment_method`, `provider_reference`, `wallet_phone`, `amount`, `currency`, and `status`, then regenerate types and update repository/domain.
- If ledger payments are the source of truth, rewrite payment service/admin UI to use `reference_id`, `reference_type`, `method`, `payer_id`, `payee_id`, and `proof_url`.

Do not continue with three independent payment shapes.

### 10. Medium: Payment Method Enum Drift

Severity: Medium

Affected files:

- `src/types/payment.ts`
- `src/services/paymentService.ts`
- `frontend/src/domain/payment/PaymentTypes.ts`
- `frontend/src/repositories/paymentRepository.ts`
- `frontend/src/integrations/supabase/database.types.ts`
- `supabase/migrations/20260502_payments_flow.sql`

Root cause:

Generated `payment_method` enum is:

- `platform`
- `zaad`
- `edahab`
- `cash`

The payment flow migration allows:

- `card`
- `zaad`
- `edahab`
- `premier_wallet`
- `wadaag_pay`

Admin pages also use `wallet` as a method label. This creates invalid inserts and invalid filters depending on which table/type is used.

Fix recommendation:

Separate provider from method:

- `payment_provider`: `dodo`, `zaad`, `edahab`, `premier_wallet`, `wadaag_pay`
- `payment_method`: `card`, `wallet`, `cash`, or provider-specific wallet rails if required

Then update DB checks/enums and generated types to match the service contract.

### 11. Medium: Nullability Drift in Property Domain

Severity: Medium

Affected files:

- `frontend/src/domain/property/PropertyTypes.ts`
- `frontend/src/domain/property/Property.ts`
- `frontend/src/domain/property/PropertyMapper.ts`
- `frontend/src/integrations/supabase/database.types.ts`

Root cause:

Generated rows allow several nullable values:

- `properties.description: string | null`
- `properties.bedrooms: number | null`
- `properties.bathrooms: number | null`
- `properties.address: string | null`
- location fields and fees are nullable

The domain model treats key values as non-null strings/numbers and validates them after construction. When mapper inputs are typed directly from generated rows, TypeScript correctly reports nullability mismatch.

Fix recommendation:

Handle nullability at the mapper boundary. Either:

- Make domain values nullable where the product can actually tolerate incomplete records, or
- Provide defaults/reject incomplete rows before constructing `Property`.

For MVP marketplace, avoid rendering records missing `title`, `price`, location, or minimum display fields.

### 12. Medium: Relationship Drift in Property Owner Joins

Severity: Medium

Affected files:

- `frontend/src/repositories/property/propertyRepository.ts`
- `frontend/src/domain/property/PropertyMapper.ts`
- `frontend/src/integrations/supabase/database.types.ts`

Root cause:

Repository queries use `profiles(*)` joins and return `profile: Profile | null`, while Supabase generated relationships reference `profiles` through `owner_id` but the selected relationship name may not materialize as `profile`. PostgREST commonly returns relation keys based on table names or aliases, so `profiles` vs `profile` is a type and runtime risk.

Fix recommendation:

Alias joins explicitly, for example `profile:profiles(*)`, and type the selected payload accordingly. Keep mapper input names aligned with the select string.

### 13. Medium: `GuriGateLandingPage` Uses Async Property Hook Values as Arrays

Severity: Medium

Affected files:

- `src/pages/GuriGateLandingPage.tsx`
- `src/hooks/useProperties.ts`
- `src/services/guriGateProperties.ts`

Root cause:

Existing TypeScript errors show `featured`, `nairobi`, and `hargeisa` are inferred as `Promise<LandingProperty[]>` in parts of the root app, but `GuriGateLandingPage` uses them as arrays with `.filter()`, spread, and marker rendering.

Fix recommendation:

Normalize root `useProperties()` so it awaits service calls internally and exposes `LandingProperty[]` plus loading/error state. Do not expose promises to page components.

### 14. Medium: Supabase Type Bridges Differ Across Root and Frontend Trees

Severity: Medium

Affected files:

- `src/integrations/supabase/types_utf8.ts`
- `frontend/src/integrations/supabase/types_utf8.ts`
- `frontend/src/integrations/supabase/database.types.ts`
- `src/integrations/supabase/client.ts`
- `frontend/src/integrations/supabase/client.ts`

Root cause:

The root `src/integrations/supabase/types_utf8.ts` re-exports from `frontend/src/integrations/supabase/types_utf8.ts`. This reduces immediate duplication, but it also means root application code silently depends on frontend generated types. If one tree is regenerated or patched independently, drift returns.

Fix recommendation:

Move generated Supabase types to one canonical location such as `src/integrations/supabase/database.types.ts`, then make both root and frontend imports resolve to that single file. Avoid maintaining generated types in multiple directories.

## Build-Blocking Issue Matrix

| Priority | Issue | Main Files |
| --- | --- | --- |
| P0 | Missing normalized property child tables in generated types | `PropertyMapper.ts`, `propertyRepository.ts`, generated Supabase types |
| P0 | Property enum mismatch: `available/pending` vs `active/pending_approval` | `PropertyTypes.ts`, `PropertyMapper.ts`, migrations, generated types |
| P0 | Missing `property_badge` enum / `badge` field | `propertyRepository.ts`, `PropertyMapper.ts`, generated types |
| P1 | Missing soft-delete/admin columns in generated property row | `propertyRepository.ts`, `adminService.ts`, generated types |
| P1 | Booking table mismatch: `bookings` vs `property_bookings` | `bookingRepository.ts`, `bookingService.ts`, `adminService.ts` |
| P1 | Payment shape mismatch: ledger vs platform payment schema | `paymentRepository.ts`, `paymentService.ts`, `adminService.ts` |
| P2 | Nullability mismatch in property mapper | `PropertyMapper.ts`, `PropertyTypes.ts` |
| P2 | Async hook return mismatch on landing page | `GuriGateLandingPage.tsx`, `src/hooks/useProperties.ts` |

## Recommended Reconciliation Plan

1. Freeze schema source of truth before coding fixes.
2. Regenerate Supabase types from that schema.
3. Fix property domain/repository first because it blocks marketplace, host properties, admin properties, wishlist, and property detail.
4. Fix booking table selection next because payments depend on persisted booking IDs.
5. Fix payment schema next because wallet/card/admin verification all depend on a single row shape.
6. Rerun `pnpm exec tsc -b`.
7. Rerun marketplace E2E validation after a green typecheck/build.

## Final Assessment

The architecture is coherent, but it is compiled against the wrong or incomplete schema contract. The highest-value next implementation task is not feature work; it is choosing a single schema model and making generated types, repositories, services, hooks, view-models, and pages all consume that model consistently.

