# Property Schema Readiness Report

**Created:** 2026-06-03
**Purpose:** Audit Property database schema readiness before capability implementation
**Migration File:** `supabase/migrations/20240502_gurigate_properties_schema.sql`

---

## Executive Summary

**Status:** PARTIAL - Migration exists but requires verification and one missing table

The Property schema migration exists and is comprehensive, covering 7 of 8 required Property domain entities. The migration includes enums, tables, indexes, RLS policies, triggers, and storage policies. However, one critical table is missing: `property_availability`.

**Key Finding:** The database schema is largely ready, but the `property_availability` table must be added before Property Capability implementation can proceed.

---

## Entity-by-Entity Audit

### 1. Property (Core Entity)

**Domain Entity:** Property

**Database Table:** `properties`

**Migration Status:** ✅ EXISTS

**Migration File:** `20240502_gurigate_properties_schema.sql` (lines 70-86)

**Columns:**
- `id` (UUID, PK) - Property ID
- `title` (VARCHAR(200)) - Property title
- `description` (TEXT) - Property description
- `type` (property_type) - Property type enum
- `badge` (property_badge) - GuriGate badge enum
- `price_unit_label` (VARCHAR(50)) - Price unit label
- `status` (property_status) - Availability status enum
- `is_featured` (BOOLEAN) - Featured flag
- `is_approved` (BOOLEAN) - Approval flag
- `view_count` (INTEGER) - View count
- `rating` (DECIMAL(3,2)) - Average rating
- `review_count` (INTEGER) - Review count
- `owner_id` (UUID, FK → auth.users) - Property owner
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

**Foreign Keys:**
- ✅ `owner_id` → `auth.users(id)`

**Indexes:**
- ✅ Primary key on `id`
- ✅ Index on `type` (idx_properties_type)
- ✅ Index on `badge` (idx_properties_badge)
- ✅ Index on `status` (idx_properties_status)
- ✅ Index on `is_featured` (idx_properties_featured)
- ✅ Index on `is_approved` (idx_properties_approved)
- ✅ Full-text search index on title + description (idx_properties_search)

**RLS Policies:**
- ✅ "Users can view approved active properties" (SELECT)
- ✅ "Property owners can view their own properties" (SELECT)
- ✅ "Authenticated users can create properties" (INSERT)
- ✅ "Property owners can update their properties" (UPDATE)
- ✅ "Property owners can delete their properties" (DELETE)

**Generated Types:** ❌ UNKNOWN (needs verification in frontend)

**Frontend Types:** ⚠️ PARTIAL (exists in `frontend/src/types/property.ts` but may not match schema)

**Status:** READY

---

### 2. PropertyAddress (Value Object)

**Domain Entity:** PropertyAddress

**Database Table:** `property_addresses`

**Migration Status:** ✅ EXISTS

**Migration File:** `20240502_gurigate_properties_schema.sql` (lines 89-101)

**Columns:**
- `id` (UUID, PK) - Address ID
- `property_id` (UUID, FK → properties.id) - Property reference
- `street` (VARCHAR(255)) - Street address
- `city` (VARCHAR(100)) - City
- `state` (VARCHAR(100)) - State/province
- `postal_code` (VARCHAR(20)) - Postal code
- `country` (VARCHAR(100)) - Country (default: 'Somalia')
- `latitude` (DECIMAL(10,8)) - GPS latitude
- `longitude` (DECIMAL(11,8)) - GPS longitude
- `created_at` (TIMESTAMPTZ) - Creation timestamp

**Foreign Keys:**
- ✅ `property_id` → `properties(id)` with CASCADE delete
- ✅ Unique constraint on `property_id`

**Indexes:**
- ✅ Primary key on `id`
- ✅ Unique on `property_id`
- ✅ Index on `(city, country)` (idx_properties_city)
- ✅ Geographic search index using GIST (idx_properties_location)

**RLS Policies:**
- ✅ "Users can view addresses for approved properties" (SELECT)
- ✅ "Property owners can manage their property addresses" (ALL)

**Generated Types:** ❌ UNKNOWN (needs verification in frontend)

**Frontend Types:** ⚠️ PARTIAL (exists in `frontend/src/types/property.ts` but may not match schema)

**Status:** READY

---

### 3. PropertyPricing (Value Object)

**Domain Entity:** PropertyPricing

**Database Table:** `property_pricing`

**Migration Status:** ✅ EXISTS

**Migration File:** `20240502_gurigate_properties_schema.sql` (lines 104-115)

**Columns:**
- `id` (UUID, PK) - Pricing ID
- `property_id` (UUID, FK → properties.id) - Property reference
- `base_price` (DECIMAL(10,2)) - Base price
- `currency` (currency_type) - Currency enum (default: 'USD')
- `pricing_type` (pricing_type) - Pricing type enum (default: 'nightly')
- `security_deposit` (DECIMAL(10,2)) - Security deposit
- `cleaning_fee` (DECIMAL(10,2)) - Cleaning fee
- `service_fee` (DECIMAL(10,2)) - Service fee
- `created_at` (TIMESTAMPTZ) - Creation timestamp

**Foreign Keys:**
- ✅ `property_id` → `properties(id)` with CASCADE delete
- ✅ Unique constraint on `property_id`

**Indexes:**
- ✅ Primary key on `id`
- ✅ Unique on `property_id`
- ✅ Index on `base_price` (idx_pricing_price)
- ✅ Index on `pricing_type` (idx_pricing_type)

**RLS Policies:**
- ✅ "Users can view pricing for approved properties" (SELECT)
- ✅ "Property owners can manage their property pricing" (ALL)

**Generated Types:** ❌ UNKNOWN (needs verification in frontend)

**Frontend Types:** ⚠️ PARTIAL (exists in `frontend/src/types/property.ts` but may not match schema)

**Status:** READY

---

### 4. PropertyFeatures (Value Object)

**Domain Entity:** PropertyFeatures

**Database Table:** `property_features`

**Migration Status:** ✅ EXISTS

**Migration File:** `20240502_gurigate_properties_schema.sql` (lines 118-129)

**Columns:**
- `id` (UUID, PK) - Feature ID
- `property_id` (UUID, FK → properties.id) - Property reference
- `bedrooms` (INTEGER) - Number of bedrooms
- `bathrooms` (DECIMAL(3,1)) - Number of bathrooms
- `max_guests` (INTEGER) - Maximum guests
- `square_feet` (INTEGER) - Property size
- `amenities` (TEXT[]) - Amenity list
- `rules` (TEXT[]) - House rules
- `created_at` (TIMESTAMPTZ) - Creation timestamp

**Foreign Keys:**
- ✅ `property_id` → `properties(id)` with CASCADE delete
- ✅ Unique constraint on `property_id`

**Indexes:**
- ✅ Primary key on `id`
- ✅ Unique on `property_id`

**RLS Policies:**
- ✅ "Users can view features for approved properties" (SELECT)
- ✅ "Property owners can manage their property features" (ALL)

**Generated Types:** ❌ UNKNOWN (needs verification in frontend)

**Frontend Types:** ⚠️ PARTIAL (exists in `frontend/src/types/property.ts` but may not match schema)

**Status:** READY

---

### 5. PropertyImages (Entity)

**Domain Entity:** PropertyImage

**Database Table:** `property_images`

**Migration Status:** ✅ EXISTS

**Migration File:** `20240502_gurigate_properties_schema.sql` (lines 132-140)

**Columns:**
- `id` (UUID, PK) - Image ID
- `property_id` (UUID, FK → properties.id) - Property reference
- `image_url` (TEXT) - Image URL
- `alt_text` (VARCHAR(255)) - Alt text
- `sort_order` (INTEGER) - Display order (default: 0)
- `is_primary` (BOOLEAN) - Primary image flag (default: FALSE)
- `created_at` (TIMESTAMPTZ) - Creation timestamp

**Foreign Keys:**
- ✅ `property_id` → `properties(id)` with CASCADE delete

**Indexes:**
- ✅ Primary key on `id`
- ✅ Index on `property_id` (idx_images_property)
- ✅ Index on `is_primary` (idx_images_primary)
- ✅ Index on `display_order` (not explicitly shown, but sort_order exists)

**RLS Policies:**
- ✅ "Users can view images for approved properties" (SELECT)
- ✅ "Property owners can manage their property images" (ALL)

**Storage Bucket:**
- ✅ `property-images` bucket created
- ✅ Storage policies for upload, view, update, delete

**Generated Types:** ❌ UNKNOWN (needs verification in frontend)

**Frontend Types:** ❌ MISSING (not in `frontend/src/types/property.ts`)

**Status:** READY

---

### 6. PropertyReviews (Entity)

**Domain Entity:** PropertyReview

**Database Table:** `property_reviews`

**Migration Status:** ✅ EXISTS

**Migration File:** `20240502_gurigate_properties_schema.sql` (lines 143-151)

**Columns:**
- `id` (UUID, PK) - Review ID
- `property_id` (UUID, FK → properties.id) - Property reference
- `guest_id` (UUID, FK → auth.users) - Guest who wrote review
- `rating` (INTEGER) - Rating (1-5)
- `comment` (TEXT) - Review text
- `created_at` (TIMESTAMPTZ) - Creation timestamp

**Foreign Keys:**
- ✅ `property_id` → `properties(id)` with CASCADE delete
- ✅ `guest_id` → `auth.users(id)`
- ✅ Unique constraint on `(property_id, guest_id)`

**Indexes:**
- ✅ Primary key on `id`
- ✅ Index on `property_id` (idx_reviews_property)
- ✅ Index on `rating` (idx_reviews_rating)

**Triggers:**
- ✅ `update_property_rating_trigger` - Updates property rating and review count on review changes

**RLS Policies:**
- ✅ "Users can view reviews for approved properties" (SELECT)
- ✅ "Authenticated users can create reviews" (INSERT)
- ✅ "Users can update their own reviews" (UPDATE)
- ✅ "Users can delete their own reviews" (DELETE)

**Generated Types:** ❌ UNKNOWN (needs verification in frontend)

**Frontend Types:** ❌ MISSING (not in `frontend/src/types/property.ts`)

**Status:** READY

---

### 7. Wishlists (Join Entity)

**Domain Entity:** WishlistProperty

**Database Table:** `wishlists`

**Migration Status:** ✅ EXISTS

**Migration File:** `20240502_gurigate_properties_schema.sql` (lines 170-176)

**Columns:**
- `id` (UUID, PK) - Wishlist ID
- `user_id` (UUID, FK → auth.users) - User who added to wishlist
- `property_id` (UUID, FK → properties.id) - Property added to wishlist
- `created_at` (TIMESTAMPTZ) - Creation timestamp

**Foreign Keys:**
- ✅ `user_id` → `auth.users(id)` with CASCADE delete
- ✅ `property_id` → `properties(id)` with CASCADE delete
- ✅ Unique constraint on `(user_id, property_id)`

**Indexes:**
- ✅ Primary key on `id`

**RLS Policies:**
- ✅ "Users can view their own wishlists" (SELECT)
- ✅ "Authenticated users can add to wishlist" (INSERT)
- ✅ "Users can remove from their wishlist" (DELETE)

**Generated Types:** ❌ UNKNOWN (needs verification in frontend)

**Frontend Types:** ❌ MISSING (not in `frontend/src/types/property.ts`)

**Status:** READY

---

### 8. PropertyAvailability (Entity)

**Domain Entity:** PropertyAvailability

**Database Table:** `property_availability`

**Migration Status:** ❌ MISSING

**Migration File:** NOT FOUND in `20240502_gurigate_properties_schema.sql`

**Required Columns:**
- `id` (UUID, PK) - Availability ID
- `property_id` (UUID, FK → properties.id) - Property reference
- `date` (DATE) - Calendar date
- `is_available` (BOOLEAN) - Availability status
- `price_override` (DECIMAL) - Price override for specific date
- `created_at` (TIMESTAMPTZ) - Creation timestamp

**Foreign Keys:** ❌ MISSING

**Indexes:** ❌ MISSING

**RLS Policies:** ❌ MISSING

**Generated Types:** ❌ MISSING

**Frontend Types:** ❌ MISSING

**Status:** BLOCKED - Table must be created

---

## Enums Audit

### Property Enums

**Migration Status:** ✅ EXISTS

**Migration File:** `20240502_gurigate_properties_schema.sql` (lines 9-63)

**Enums Defined:**
- ✅ `property_badge` (FOR_SALE, FOR_RENT, SHORT_STAY)
- ✅ `property_type` (apartment, house, villa, studio, condo, townhouse, cottage, penthouse, loft, other)
- ✅ `property_status` (available, occupied, maintenance, pending, inactive)
- ✅ `pricing_type` (nightly, monthly, sale)
- ✅ `booking_status` (pending, confirmed, cancelled, completed)
- ✅ `currency_type` (USD, EUR, GBP, KES, NGN, ZAR, SOS)

**Status:** READY

---

## Views Audit

### Featured Properties View

**Migration Status:** ✅ EXISTS

**Migration File:** `20240502_gurigate_properties_schema.sql` (lines 519-560)

**View Name:** `featured_properties`

**Purpose:** Join all property-related tables for featured properties display

**Status:** READY

---

### Properties by City View

**Migration Status:** ✅ EXISTS

**Migration File:** `20240502_gurigate_properties_schema.sql` (lines 563-576)

**View Name:** `properties_by_city`

**Purpose:** Aggregate property data by city

**Status:** READY

---

## Triggers Audit

### Updated At Trigger

**Migration Status:** ✅ EXISTS

**Migration File:** `20240502_gurigate_properties_schema.sql` (lines 428-442)

**Function:** `update_updated_at_column()`

**Triggers:**
- ✅ `update_properties_updated_at`
- ✅ `update_bookings_updated_at`

**Status:** READY

---

### Property Rating Trigger

**Migration Status:** ✅ EXISTS

**Migration File:** `20240502_gurigate_properties_schema.sql` (lines 445-467)

**Function:** `update_property_rating()`

**Trigger:** `update_property_rating_trigger`

**Purpose:** Updates property rating and review count on review changes

**Status:** READY

---

## Storage Audit

### Property Images Bucket

**Migration Status:** ✅ EXISTS

**Migration File:** `20240502_gurigate_properties_schema.sql` (lines 485-512)

**Bucket Name:** `property-images`

**Policies:**
- ✅ Upload policy
- ✅ View policy
- ✅ Update policy
- ✅ Delete policy

**Status:** READY

---

## Frontend Types Audit

### Existing Types

**File:** `frontend/src/types/property.ts`

**Status:** ⚠️ PARTIAL

**Existing Types:**
- ✅ `Property` interface
- ✅ `PropertyAddress` interface
- ✅ `PropertyPricing` interface
- ✅ `PropertyFeatures` interface
- ✅ `PropertyType` type
- ✅ `PropertyStatus` type
- ✅ `CreatePropertyRequest` interface
- ✅ Validation constants

**Missing Types:**
- ❌ `PropertyImage` interface
- ❌ `PropertyReview` interface
- ❌ `WishlistProperty` interface
- ❌ `PropertyAvailability` interface
- ❌ `PropertyBadge` type
- ❌ `PricingType` type
- ❌ `CurrencyType` type

**Schema Mismatch:**
- ⚠️ Existing types may not match database schema exactly
- ⚠️ Database uses `property_id` FK, types may use different naming
- ⚠️ Database uses arrays for amenities/rules, types may use arrays

**Status:** PARTIAL - Needs update to match schema

---

## Generated Types Audit

### Supabase Generated Types

**Status:** ❌ UNKNOWN

**Action Required:** Verify if Supabase types have been generated for the Property schema

**Expected Location:** `frontend/src/integrations/supabase/types.ts` or similar

**Status:** UNKNOWN - Needs verification

---

## Summary

### Tables Status

| Entity | Table | Migration | Foreign Keys | Indexes | RLS | Status |
|--------|-------|-----------|-------------|---------|-----|--------|
| Property | properties | ✅ | ✅ | ✅ | ✅ | READY |
| PropertyAddress | property_addresses | ✅ | ✅ | ✅ | ✅ | READY |
| PropertyPricing | property_pricing | ✅ | ✅ | ✅ | ✅ | READY |
| PropertyFeatures | property_features | ✅ | ✅ | ✅ | ✅ | READY |
| PropertyImages | property_images | ✅ | ✅ | ✅ | ✅ | READY |
| PropertyReviews | property_reviews | ✅ | ✅ | ✅ | ✅ | READY |
| WishlistProperty | wishlists | ✅ | ✅ | ✅ | ✅ | READY |
| PropertyAvailability | property_availability | ❌ | ❌ | ❌ | ❌ | BLOCKED |

### Overall Status

**Database Schema:** PARTIAL (7/8 tables ready)

**Missing:** `property_availability` table

**Frontend Types:** PARTIAL (needs update to match schema)

**Generated Types:** UNKNOWN (needs verification)

**Migration Applied:** UNKNOWN (needs verification if migration has been applied to database)

---

## Decision Tree Result

### Scenario: PARTIAL

**Finding:** Most tables exist, but one critical table is missing

**Action Required:**

1. **Create missing table migration** for `property_availability`
2. **Apply migration** to database
3. **Generate Supabase types** for frontend
4. **Update frontend types** to match schema
5. **Verify migration applied** to database
6. **Then start Property Domain Layer**

---

## Next Steps

### Immediate (Before Property Capability)

1. **Create migration** for `property_availability` table
2. **Apply migration** to Supabase database
3. **Generate Supabase types** using Supabase CLI
4. **Update frontend types** in `frontend/src/types/property.ts` to match schema
5. **Verify migration** applied successfully

### After Schema Complete

1. **Start Property Domain Layer** (PropertyTypes.ts, PropertyMapper.ts, PropertyServiceContract.ts)
2. **Proceed with Property Capability** following Customer Capability pattern

---

## Conclusion

**Property Schema Readiness:** PARTIAL

The Property schema migration is comprehensive and well-designed, covering 7 of 8 required Property domain entities with proper enums, indexes, RLS policies, triggers, and storage policies. However, the `property_availability` table is missing and must be created before Property Capability implementation can proceed.

**Critical Path:** Create `property_availability` table migration → Apply migration → Generate types → Update frontend types → Start Property Capability

**Estimated Time to Schema Complete:** 1-2 hours

**Estimated Time to Property Capability Complete:** 8-12 hours (after schema complete)

**Total Estimated Time:** 9-14 hours
