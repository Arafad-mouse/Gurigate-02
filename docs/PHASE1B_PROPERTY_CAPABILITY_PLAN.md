# PHASE1B Property Capability Plan

**Created:** 2026-06-03
**Phase:** 1B - Property Capability Migration
**Status:** READY TO START
**Reference Pattern:** Customer Capability (Phase 1A)

---

## Executive Summary

The Property Capability migration will establish the second production-grade module in GuriGate, following the proven architectural pattern established by the Customer Capability. Properties are the core marketplace entity that enables bookings, wishlists, reviews, and availability management.

**Architecture Pattern:**
```
Database (Supabase)
  ↓
Repository (propertyRepository.ts)
  ↓
Domain Layer (PropertyTypes, PropertyMapper)
  ↓
Service Layer (propertyService.ts implementing IPropertyService)
  ↓
Hooks Layer (useProperties, useProperty, usePropertyReviews, usePropertyAvailability, usePropertyWishlist)
  ↓
View Models (PropertyCardViewModel, PropertyDetailViewModel, PropertySearchViewModel, PropertyReviewViewModel)
  ↓
UI Components (PropertyListPage, PropertyDetailPage)
```

---

## Phase 1B Objectives

1. **Property Domain Validation** ✅ COMPLETE
2. **Property Repository** - Create repository layer
3. **Property Domain Models** - Create domain types and entities
4. **Property Mapper** - Create row to domain transformation
5. **Property Service Contract** - Create service interface
6. **Property Service** - Implement service with business logic
7. **Property Hooks** - Create React hooks for state management
8. **Property View Models** - Create UI transformation layer
9. **Property Pages** - Create Property List and Detail pages
10. **Property Data Flow Verification** - Verify real data usage

---

## Property Domain Entities

### Core Entity: Property

**Purpose:** Represents a physical property listing in the marketplace

**Domain Attributes:**
- `id` - Unique property identifier
- `title` - Property display name
- `description` - Detailed property description
- `type` - Property type (apartment, house, villa, studio, condo, townhouse, cottage, penthouse, loft, other)
- `status` - Availability status (available, occupied, maintenance, pending, inactive)
- `approvalStatus` - Admin approval status (draft, pending, approved, rejected, suspended)
- `ownerId` - Host who owns the property (references Customer)
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### Value Objects

**PropertyAddress:**
- `street` - Street address
- `city` - City name
- `state` - State/region
- `postalCode` - Postal/ZIP code
- `country` - Country name
- `coordinates` - GPS coordinates (lat, lng)

**PropertyPricing:**
- `basePrice` - Base price amount
- `currency` - Currency code (USD, EUR, KES, etc.)
- `pricingType` - Pricing model (nightly, monthly, sale)
- `securityDeposit` - Security deposit amount
- `cleaningFee` - Cleaning fee amount
- `serviceFee` - Service fee amount
- `taxes` - Tax amount

**PropertyFeatures:**
- `bedrooms` - Number of bedrooms
- `bathrooms` - Number of bathrooms
- `maxGuests` - Maximum guest capacity
- `squareFeet` - Property size in square feet
- `amenities` - List of amenities (WiFi, AC, Kitchen, Pool, etc.)
- `rules` - House rules (No smoking, No parties, etc.)

### Related Entities

**PropertyImage:**
- `id` - Image identifier
- `propertyId` - Associated property
- `imageUrl` - Image URL
- `altText` - Alt text for accessibility
- `sortOrder` - Display order
- `isPrimary` - Primary image flag

**PropertyReview:**
- `id` - Review identifier
- `propertyId` - Associated property
- `customerId` - Review author (references Customer)
- `rating` - Rating score (1-5)
- `comment` - Review text
- `createdAt` - Review timestamp

**WishlistProperty:**
- `customerId` - Customer who added to wishlist
- `propertyId` - Property added to wishlist
- `createdAt` - Addition timestamp

**PropertyAvailability:**
- `id` - Availability identifier
- `propertyId` - Associated property
- `date` - Calendar date
- `isAvailable` - Availability status
- `priceOverride` - Price override for specific date
- `createdAt` - Creation timestamp

---

## Migration Phases

### Phase 1: Domain Layer

**Create:** `frontend/src/domain/property/PropertyTypes.ts`

**Content:**
- PropertyType enum
- PropertyStatus enum
- PropertyApprovalStatus enum
- Property interface
- PropertyAddress interface
- PropertyPricing interface
- PropertyFeatures interface
- PropertyImage interface
- PropertyReview interface
- WishlistProperty interface
- PropertyAvailability interface
- PropertyFilters interface
- PropertyListResult interface
- CreatePropertyInput interface
- UpdatePropertyInput interface

**Create:** `frontend/src/domain/property/PropertyMapper.ts`

**Content:**
- PropertyMapper class
- `toDomain()` method - Transform database row to Property domain entity
- `toRow()` method - Transform Property domain entity to database row
- Handle nested structures (address, pricing, features, images)

**Create:** `frontend/src/domain/property/PropertyServiceContract.ts`

**Content:**
- IPropertyService interface
- PropertyServiceError class
- PropertyServiceErrorCode enum
- Method signatures for all service operations

---

### Phase 2: Repository Layer

**Create:** `frontend/src/repositories/propertyRepository.ts`

**Methods:**
- `listProperties(filters, page, pageSize)` - List with filters and pagination
- `getPropertyById(id)` - Get single property
- `getPropertyWithImages(id)` - Get property with images
- `getPropertyWithReviews(id)` - Get property with reviews
- `getPropertyWithAvailability(id)` - Get property with availability
- `getPropertyWithOwner(id)` - Get property with owner profile
- `createProperty(property)` - Insert property
- `updateProperty(id, updates)` - Update property
- `deleteProperty(id)` - Delete property
- `searchProperties(query, filters)` - Search functionality

**Data Source:** Supabase database (properties table and related tables)

---

### Phase 3: Service Layer

**Create:** `frontend/src/services/propertyService.ts`

**Implement:** IPropertyService contract

**Methods:**
- `getProperties(filters, page, pageSize)` - List with filters
- `getPropertyById(id)` - Single property
- `createProperty(input)` - Create with validation
- `updateProperty(id, updates)` - Update with validation
- `deleteProperty(id)` - Delete with checks
- `searchProperties(query, filters)` - Search functionality
- `getPropertyReviews(id)` - Get reviews
- `getPropertyAvailability(id, startDate, endDate)` - Get availability
- `addToWishlist(customerId, propertyId)` - Add to wishlist
- `removeFromWishlist(customerId, propertyId)` - Remove from wishlist
- `getFeaturedProperties()` - Get featured properties
- `exportProperties(filters)` - CSV export

**Business Logic:**
- Property validation
- Approval workflow
- Availability conflict detection
- Review aggregation
- Wishlist management

---

### Phase 4: Hooks Layer

**Create:** `frontend/src/hooks/useProperties.ts`

**Capabilities:**
- Property list with search, filters, pagination
- Property type filter
- Property status filter
- City filter
- Price range filter
- Export functionality

**Create:** `frontend/src/hooks/useProperty.ts`

**Capabilities:**
- Single property fetch
- Property update
- Property delete
- Image upload
- Primary image selection

**Create:** `frontend/src/hooks/usePropertyReviews.ts`

**Capabilities:**
- Review list fetch
- Review submission
- Review aggregation

**Create:** `frontend/src/hooks/usePropertyAvailability.ts`

**Capabilities:**
- Availability calendar fetch
- Date range availability check
- Price variation by date

**Create:** `frontend/src/hooks/usePropertyWishlist.ts`

**Capabilities:**
- Wishlist fetch
- Add to wishlist
- Remove from wishlist
- Wishlist status check

---

### Phase 5: View Models Layer

**Create:** `frontend/src/view-models/PropertyCardViewModel.ts`

**Purpose:** Transform Property domain entity for list display

**Fields:**
- `id` - Property ID
- `title` - Property title
- `typeLabel` - Formatted property type
- `statusLabel` - Formatted status
- `city` - City location
- `country` - Country location
- `basePrice` - Formatted price
- `currency` - Currency symbol
- `primaryImage` - Primary image URL
- `rating` - Average rating
- `reviewCount` - Number of reviews
- `isFeatured` - Featured flag
- `isAvailable` - Available flag

**Create:** `frontend/src/view-models/PropertyDetailViewModel.ts`

**Purpose:** Transform Property domain entity for detail display

**Fields:**
- All PropertyCardViewModel fields
- `description` - Full description
- `address` - Formatted address
- `pricing` - Formatted pricing breakdown
- `features` - Formatted features
- `images` - All images with metadata
- `amenities` - Amenity list
- `rules` - House rules
- `ownerName` - Owner name
- `ownerAvatar` - Owner avatar
- `createdAt` - Formatted creation date

**Create:** `frontend/src/view-models/PropertySearchViewModel.ts`

**Purpose:** Transform search results for search display

**Fields:**
- Search result specific fields
- Match highlighting
- Distance calculation

**Create:** `frontend/src/view-models/PropertyReviewViewModel.ts`

**Purpose:** Transform PropertyReview domain entity for display

**Fields:**
- `id` - Review ID
- `customerName` - Customer name
- `customerAvatar` - Customer avatar
- `rating` - Rating score
- `comment` - Review text
- `createdAt` - Formatted date

---

### Phase 6: UI Components

**Create:** `frontend/src/pages/PropertyListPage.tsx`

**Features:**
- Property list display with cards
- Search by title, city, country
- Filter by property type
- Filter by status
- Filter by price range
- Filter by city
- Pagination
- Export to CSV
- Property detail drawer
- Add property modal (for hosts)
- Wishlist toggle

**Hooks Used:**
- `useProperties()` for list, search, filters, pagination
- `usePropertyWishlist()` for wishlist management

**View Models Used:**
- `PropertyCardViewModel` for list display

**Create:** `frontend/src/pages/PropertyDetailPage.tsx`

**Features:**
- Property detail display
- Image gallery
- Address and location
- Pricing breakdown
- Features and amenities
- House rules
- Reviews section
- Availability calendar
- Wishlist toggle
- Booking button (future Booking capability)
- Edit property (for owners)

**Hooks Used:**
- `useProperty()` for property operations
- `usePropertyReviews()` for reviews
- `usePropertyAvailability()` for availability
- `usePropertyWishlist()` for wishlist

**View Models Used:**
- `PropertyDetailViewModel` for detail display
- `PropertyReviewViewModel` for review display

---

## Database Schema Requirements

### Existing Tables

**properties** - Main property listings table
- ✅ Exists (needs review)
- ⚠️ Missing related tables

### Required New Tables

**property_addresses** - Property address information
- `id` (UUID, PK)
- `property_id` (UUID, FK → properties.id)
- `street` (TEXT)
- `city` (TEXT)
- `state` (TEXT)
- `postal_code` (TEXT)
- `country` (TEXT)
- `coordinates_lat` (DECIMAL)
- `coordinates_lng` (DECIMAL)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**property_pricing** - Property pricing information
- `id` (UUID, PK)
- `property_id` (UUID, FK → properties.id)
- `base_price` (DECIMAL)
- `currency` (TEXT)
- `pricing_type` (TEXT)
- `security_deposit` (DECIMAL)
- `cleaning_fee` (DECIMAL)
- `service_fee` (DECIMAL)
- `taxes` (DECIMAL)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**property_features** - Property features and amenities
- `id` (UUID, PK)
- `property_id` (UUID, FK → properties.id)
- `bedrooms` (INTEGER)
- `bathrooms` (INTEGER)
- `max_guests` (INTEGER)
- `square_feet` (INTEGER)
- `amenities` (TEXT[])
- `rules` (TEXT[])
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**property_images** - Property images
- `id` (UUID, PK)
- `property_id` (UUID, FK → properties.id)
- `image_url` (TEXT)
- `alt_text` (TEXT)
- `sort_order` (INTEGER)
- `is_primary` (BOOLEAN)
- `created_at` (TIMESTAMPTZ)

**property_reviews** - Property reviews
- `id` (UUID, PK)
- `property_id` (UUID, FK → properties.id)
- `customer_id` (UUID, FK → profiles.id)
- `rating` (INTEGER)
- `comment` (TEXT)
- `created_at` (TIMESTAMPTZ)

**wishlists** - Customer wishlists
- `id` (UUID, PK)
- `customer_id` (UUID, FK → profiles.id)
- `name` (TEXT)
- `created_at` (TIMESTAMPTZ)

**wishlist_properties** - Wishlist property associations
- `wishlist_id` (UUID, FK → wishlists.id)
- `property_id` (UUID, FK → properties.id)
- `created_at` (TIMESTAMPTZ)

**property_availability** - Property availability calendar
- `id` (UUID, PK)
- `property_id` (UUID, FK → properties.id)
- `date` (DATE)
- `is_available` (BOOLEAN)
- `price_override` (DECIMAL)
- `created_at` (TIMESTAMPTZ)

---

## Mock Data Removal

### Current Mock Data

**File:** `frontend/src/data/mockProperties.ts`

**Status:** ⚠️ EXISTS (8 mock properties)

**Action:** Remove after migration

### Search Pattern

Search for:
- `MOCK_PROPERTIES`
- `mockProperties`
- `landingProperties`
- Property mock arrays in components

**Action:** Remove all dependencies and replace with real data via hooks

---

## Acceptance Criteria

### Domain Layer
- ✅ PropertyTypes.ts created with all domain entities
- ✅ PropertyMapper.ts created with transformation methods
- ✅ PropertyServiceContract.ts created with service interface

### Repository Layer
- ✅ propertyRepository.ts created
- ✅ All CRUD methods implemented
- ✅ Join operations for related data
- ✅ Pagination support
- ✅ Search functionality

### Service Layer
- ✅ propertyService.ts implements IPropertyService
- ✅ All service methods implemented
- ✅ Business logic in domain layer
- ✅ Error handling with PropertyServiceError
- ✅ Validation logic

### Hooks Layer
- ✅ useProperties hook created
- ✅ useProperty hook created
- ✅ usePropertyReviews hook created
- ✅ usePropertyAvailability hook created
- ✅ usePropertyWishlist hook created

### View Models Layer
- ✅ PropertyCardViewModel created
- ✅ PropertyDetailViewModel created
- ✅ PropertySearchViewModel created
- ✅ PropertyReviewViewModel created

### UI Components
- ✅ PropertyListPage created
- ✅ PropertyDetailPage created
- ✅ Search, filters, pagination implemented
- ✅ Reviews display implemented
- ✅ Availability calendar implemented
- ✅ Wishlist management implemented

### Data Flow
- ✅ All property data uses real database
- ✅ No mock property data
- ✅ Build passes
- ✅ Type check passes
- ✅ RLS verified

---

## Architecture Compliance

### Layered Architecture

**Database → Repository → Domain → Service → Hooks → View Models → UI**

**Compliance:**
- ✅ No direct UI dependency on database
- ✅ Service contract pattern (IPropertyService)
- ✅ Domain entity abstraction
- ✅ View model pattern for UI decoupling
- ✅ Hooks consume service, not repository
- ✅ Single responsibility per layer

### Domain Boundaries

**Property is NOT:**
- Booking (Property is the subject of Bookings)
- Customer (Property is owned by Customers)
- Payment (Property has pricing, Payments are transactions)
- Contract (Property is the subject of Contracts)

**Property IS:**
- Physical real estate listing
- Core marketplace entity
- Independent domain with clear boundaries

---

## Timeline Estimate

**Total Estimated Time:** 8-12 hours

**Breakdown:**
- Domain Layer: 1-2 hours
- Repository Layer: 1-2 hours
- Service Layer: 2-3 hours
- Hooks Layer: 1-2 hours
- View Models Layer: 1 hour
- UI Components: 2-3 hours
- Verification: 1 hour

---

## Next Steps

1. **Database Schema** - Create missing tables (property_addresses, property_pricing, property_features, property_images, property_reviews, wishlists, wishlist_properties, property_availability)

2. **Domain Layer** - Create PropertyTypes.ts, PropertyMapper.ts, PropertyServiceContract.ts

3. **Repository Layer** - Create propertyRepository.ts

4. **Service Layer** - Create propertyService.ts

5. **Hooks Layer** - Create all property hooks

6. **View Models Layer** - Create all property view models

7. **UI Components** - Create PropertyListPage and PropertyDetailPage

8. **Verification** - Remove mock data, verify data flow, run build/type check, verify RLS

9. **Completion** - Generate PHASE1B_PROPERTY_CAPABILITY_COMPLETE.md

---

## Reference Pattern

**Customer Capability (Phase 1A)** serves as the reference implementation for Property Capability (Phase 1B).

**Pattern to Follow:**
```
1. Define domain types (Types.ts)
2. Create domain logic (Mapper.ts)
3. Implement repository (repository.ts)
4. Define service contract (ServiceContract.ts)
5. Implement service (service.ts)
6. Create hooks (use*.ts)
7. Create view models (ViewModel.ts)
8. Build UI components (Page.tsx)
9. Document (VALIDATION, PLAN, VERIFICATION)
```

---

## Conclusion

**Property Capability Migration Status:** READY TO START

The Property Domain has been validated with clear boundaries and entity definitions. The migration will follow the proven Customer Capability pattern to establish the second production-grade module in GuriGate.

**Success Criteria:**
- Property Capability follows Customer Capability pattern exactly
- All property data flows use real database
- No mock property data remains
- Build and type check pass
- RLS policies verified
- Property Capability becomes reference for Booking, Payment, Contract capabilities

**Platform Maturity Target:**
```
Architecture ............. 90%
Customer Capability ...... 100%
Property Capability ...... 100% (target)
Booking Capability ....... 0%
Payment Capability ....... 0%

Overall Platform ......... ~55-60% (target)
```
