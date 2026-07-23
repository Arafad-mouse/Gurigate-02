# Property Domain Model

**Version**: 1.0  
**Date**: 2026-06-03  
**Status**: READY FOR IMPLEMENTATION

This document defines the Property aggregate domain model for GuriGate. Property is the second aggregate capability implemented after Customer, serving as the reference model for all future aggregate roots.

---

## 1. Aggregate Root

### Property

The Property aggregate root composes all child entities. The UI consumes `Property`, not individual database rows.

**Location**: `frontend/src/domain/property/Property.ts`

**Structure**:
```typescript
interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  badge: PropertyBadge;
  priceUnitLabel: string;
  status: PropertyStatus;
  isFeatured: boolean;
  isApproved: boolean;
  viewCount: number;
  rating: number;
  reviewCount: number;
  ownerId: string;
  ownerName: string;
  address: PropertyAddress;
  pricing: PropertyPricing;
  features: PropertyFeatures;
  images: PropertyImage[];
  reviews: PropertyReview[];
  availability: PropertyAvailability[];
  createdAt: Date;
  updatedAt: Date;
}
```

**Key Behaviors**:
- `getPrimaryImage()` - Returns the primary or first image
- `getSortedImages()` - Returns images sorted by sort order
- `isAvailable()` - Checks if property is available and approved
- `isAvailableForDates(startDate, endDate)` - Checks availability for date range
- `canAccommodate(guestCount)` - Checks guest capacity
- `calculatePrice(nights)` - Calculates total price
- `getAverageRating()` - Calculates average from reviews
- `validate()` - Validates all child entities
- `approve()` / `unapprove()` - Manages approval status
- `markAsFeatured()` / `unmarkAsFeatured()` - Manages featured status

**Invariants**:
- Property must have at least one image
- Property must have valid address, pricing, and features
- Property cannot be approved if not available
- Property rating is calculated from reviews, not stored

---

## 2. Child Entities

### 2.1 PropertyAddress

**Location**: `frontend/src/domain/property/PropertyAddress.ts`

**Purpose**: Represents the physical location of a property.

**Key Behaviors**:
- `getFullAddress()` - Returns formatted address string
- `hasCoordinates()` - Checks if coordinates are available
- `getCoordinates()` - Returns coordinates as object
- `validate()` - Validates address data

**Validation Rules**:
- Street, city, and country are required
- Latitude must be between -90 and 90
- Longitude must be between -180 and 180

---

### 2.2 PropertyPricing

**Location**: `frontend/src/domain/property/PropertyPricing.ts`

**Purpose**: Represents the pricing structure of a property.

**Key Behaviors**:
- `calculateTotal(nights)` - Calculates total price for nights
- `calculateTotalWithDeposit(nights)` - Calculates total with security deposit
- `getPriceBreakdown(nights)` - Returns detailed price breakdown
- `formatPrice(amount?)` - Formats price as currency string
- `isShortStay()` / `isLongTerm()` / `isForSale()` - Type checks

**Validation Rules**:
- Base price must be greater than 0
- All fees cannot be negative

**Pricing Types**:
- NIGHTLY: Per night pricing (short stays)
- MONTHLY: Per month pricing (long-term rentals)
- SALE: One-time price (property sales)

---

### 2.3 PropertyFeatures

**Location**: `frontend/src/domain/property/PropertyFeatures.ts`

**Purpose**: Represents the features and amenities of a property.

**Key Behaviors**:
- `hasAmenity(amenity)` - Checks if property has specific amenity
- `hasRule(rule)` - Checks if property has specific rule
- `addAmenity()` / `removeAmenity()` - Amenity management
- `addRule()` / `removeRule()` - Rule management
- `canAccommodate(guestCount)` - Checks guest capacity
- `getAmenityCategories()` - Returns amenities grouped by category

**Validation Rules**:
- Bedrooms and bathrooms cannot be negative
- Max guests must be at least 1
- Square feet must be greater than 0 if provided

**Amenity Categories**:
- essentials: WiFi, Air Conditioning, Laundry
- comfort: Kitchen, Gym, Workspace, Balcony
- kitchen: Kitchen equipment
- entertainment: TV, entertainment systems
- outdoor: Parking, Pool, Garden
- safety: Security System

---

### 2.4 PropertyImage

**Location**: `frontend/src/domain/property/PropertyImage.ts`

**Purpose**: Represents an image associated with a property.

**Key Behaviors**:
- `isPrimaryImage()` - Checks if this is the primary image
- `setAsPrimary()` - Sets as primary image
- `updateSortOrder(order)` - Updates display order
- `updateAltText(text)` - Updates accessibility text

**Validation Rules**:
- Image URL is required
- Sort order cannot be negative

**Display Rules**:
- Primary image has sort order 0
- Images are displayed in sort order
- At least one image is required per property

---

### 2.5 PropertyReview

**Location**: `frontend/src/domain/property/PropertyReview.ts`

**Purpose**: Represents a guest review for a property.

**Key Behaviors**:
- `hasComment()` - Checks if review has text comment
- `getStarRating()` - Returns rating as star string
- `isPositive()` / `isNeutral()` / `isNegative()` - Rating classification
- `getSummary()` - Returns truncated comment
- `getTimeSince()` - Returns human-readable time since review

**Validation Rules**:
- Rating must be between 1 and 5
- Guest name is required

**Rating Classification**:
- Positive: 4-5 stars
- Neutral: 3 stars
- Negative: 1-2 stars

---

### 2.6 PropertyAvailability

**Location**: `frontend/src/domain/property/PropertyAvailability.ts`

**Purpose**: Represents an availability block for a property.

**Key Behaviors**:
- `overlapsWith(start, end)` - Checks date range overlap
- `isActive()` / `isFuture()` / `isPast()` - Time classification
- `getDurationInNights()` - Calculates block duration
- `meetsStayRequirements(nights)` - Checks stay restrictions
- `meetsAdvanceBookingRequirement(bookingDate)` - Checks booking window
- `getDescription()` - Returns human-readable description

**Validation Rules**:
- End date must be after start date
- Minimum stay must be at least 1 night
- Maximum stay must be at least 1 night
- Minimum stay cannot exceed maximum stay
- Advance booking days cannot be negative

**Block Types**:
- MANUAL: User-initiated blocks
- MAINTENANCE: Property repair blocks
- SEASONAL: Recurring seasonal patterns
- OWNER_USE: Owner personal use
- SYSTEM: Auto-generated blocks

---

## 3. Mapper Rules

### PropertyMapper

**Location**: `frontend/src/domain/property/PropertyMapper.ts`

**Purpose**: Transforms database rows to domain entities. This is the critical abstraction layer that prevents database schema changes from breaking the frontend.

**Key Methods**:
- `toDomain(...)` - Maps database rows to Property aggregate
- `toInsert(input, ownerId)` - Maps domain to database insert
- `toUpdate(input)` - Maps domain to database update
- `toAvailabilityInsert(input)` - Maps availability to database
- `toReviewInsert(input, guestId)` - Maps review to database

**Enum Mappings**:

| Domain | Database |
|--------|----------|
| PropertyType.APARTMENT | 'apartment' |
| PropertyType.HOUSE | 'house' |
| PropertyType.VILLA | 'villa' |
| PropertyBadge.FOR_SALE | 'FOR_SALE' |
| PropertyBadge.FOR_RENT | 'FOR_RENT' |
| PropertyBadge.SHORT_STAY | 'SHORT_STAY' |
| PropertyStatus.AVAILABLE | 'available' |
| PropertyStatus.OCCUPIED | 'occupied' |
| PricingType.NIGHTLY | 'per_night' |
| PricingType.MONTHLY | 'per_month' |
| PricingType.SALE | 'total' |
| AvailabilityBlockType.MANUAL | 'manual' |
| AvailabilityBlockType.MAINTENANCE | 'maintenance' |

**Mapping Strategy**:
- Database rows are mapped to domain entities
- Domain entities are mapped to database insert/update
- Enum values are transformed between domain and database representations
- Child entities are composed into the aggregate root
- UUIDs are generated for new entities

---

## 4. Availability Rules

### Availability Calculation

**Availability is determined by**:
1. Property status must be `AVAILABLE`
2. Property must be approved (`isApproved = true`)
3. No overlapping availability blocks for the requested date range

**Availability Block Priority**:
- Any overlapping block makes the property unavailable
- Blocks are checked regardless of type
- System blocks override all other considerations

**Stay Restrictions**:
- `minimumStay`: Minimum number of nights required
- `maximumStay`: Maximum number of nights allowed
- Both must be satisfied for a booking to be valid

**Booking Window Rules**:
- `advanceBookingDays`: How many days in advance bookings can be made
- 0 = no restriction
- Calculated from booking date to current date

**Availability Rate Calculation**:
```
Availability Rate = ((30 days - blocked days) / 30) * 100
```
- Calculated over a 30-day window
- Blocked days are summed from all overlapping blocks
- Range: 0-100%

---

## 5. Pricing Rules

### Price Calculation

**Base Formula**:
```
Total = (Base Price × Nights) + Cleaning Fee + Service Fee
Total with Deposit = Total + Security Deposit
```

**Price Breakdown**:
- Base Price: Per night or per month
- Cleaning Fee: One-time cleaning charge
- Service Fee: Platform service charge
- Security Deposit: Refundable deposit

**Currency Support**:
- USD, EUR, GBP, KES, NGN, ZAR, SOS
- All calculations use the property's currency
- Currency symbols are formatted for display

**Pricing Validation**:
- Base price must be > 0
- All fees must be >= 0
- Currency must be supported

---

## 6. Metrics Rules

### PropertyMetrics

**Location**: `frontend/src/domain/property/PropertyMetrics.ts`

**Calculated Metrics**:
- `averageRating`: Average of all review ratings
- `reviewCount`: Total number of reviews
- `occupancyRate`: Estimated occupancy (bookings / max possible)
- `bookingCount`: Total number of bookings
- `wishlistCount`: Total number of wishlists
- `availabilityRate`: Percentage of available days
- `monthlyRevenue`: Revenue for current month
- `totalRevenue`: Total revenue across all time
- `lastBookingDate`: Date of most recent booking
- `averageBookingDuration`: Average length of bookings

**Performance Rating**:
```
Score = (Rating × 0.3) + (Occupancy × 0.25) + (Availability × 0.2) + 
        (Reviews × 0.15) + (Bookings × 0.1)

Excellent: Score >= 80
Good: Score >= 60
Average: Score >= 40
Poor: Score < 40
```

**Benchmark Comparison**:
- Compares property metrics against platform averages
- Returns `above`, `at`, or `below` for each metric
- Overall rating based on majority of metrics

**Revenue Trend**:
```
Trend = ((Current - Previous) / Previous) × 100

Up: Trend > 5%
Down: Trend < -5%
Stable: -5% <= Trend <= 5%
```

---

## 7. Service Contracts

### IPropertyService

**Location**: `frontend/src/domain/property/PropertyServiceContract.ts`

**Core Operations**:
- `getProperties(filters, page, pageSize)` - List with pagination
- `getPropertyById(id)` - Get single property
- `createProperty(input)` - Create new property
- `updateProperty(id, input)` - Update existing property
- `archiveProperty(id)` - Soft delete
- `restoreProperty(id)` - Restore from archive

**Search & Filter**:
- `searchProperties(query, filters, page, pageSize)` - Text search
- `filterProperties(filters, page, pageSize)` - Advanced filtering
- `getPropertiesByOwner(ownerId, page, pageSize)` - Owner's properties
- `getFeaturedProperties(limit)` - Featured properties
- `getSimilarProperties(propertyId, limit)` - Similar properties

**Availability Management**:
- `getAvailability(propertyId, startDate, endDate)` - Get availability blocks
- `checkAvailability(propertyId, startDate, endDate)` - Check if available
- `createAvailability(input)` - Create availability block
- `updateAvailability(propertyId, blockId, input)` - Update block
- `deleteAvailability(propertyId, blockId)` - Delete block

**Reviews**:
- `getPropertyReviews(propertyId, page, pageSize)` - Get reviews
- `createReview(input)` - Create review
- `deleteReview(propertyId, reviewId)` - Delete review

**Images**:
- `getPropertyImages(propertyId)` - Get all images

**Metrics**:
- `getPropertyMetrics(propertyId)` - Get property metrics
- `getAggregateMetrics()` - Get platform-wide metrics
- `getDashboardMetrics()` - Get dashboard summary

**Pricing**:
- `calculatePricing(propertyId, startDate, endDate)` - Calculate price

**Status Management**:
- `approveProperty(id)` - Approve property
- `unapproveProperty(id)` - Unapprove property
- `markAsFeatured(id)` - Mark as featured
- `unmarkAsFeatured(id)` - Unmark featured
- `updatePropertyStatus(id, status)` - Update status

**Export**:
- `exportProperties(filters)` - Export to CSV

**Error Handling**:
- `PropertyServiceError` - Custom error class
- Error codes: NOT_FOUND, VALIDATION_ERROR, PERMISSION_DENIED, CONFLICT, INTERNAL_ERROR, NETWORK_ERROR, AVAILABILITY_CONFLICT, PRICING_ERROR

---

## 8. UI Contracts

### What the UI Consumes

**The UI should consume**:
```typescript
Property // The aggregate root
```

**The UI should NOT consume**:
```typescript
properties row // Database row
property_pricing row // Database row
property_images row // Database row
```

**UI Data Flow**:
1. UI calls service methods from `IPropertyService`
2. Service returns `Property` aggregate
3. UI accesses properties via aggregate methods
4. UI never accesses database rows directly

**Example Usage**:
```typescript
// ✅ Correct - consume aggregate
const property = await propertyService.getPropertyById(id);
const primaryImage = property.getPrimaryImage();
const canBook = property.isAvailableForDates(start, end);
const price = property.calculatePrice(nights);

// ❌ Incorrect - consume database rows
const propertyRow = await supabase.from('properties').select('*').eq('id', id);
```

**Component Props**:
- Components should accept `Property` as props
- Components should not accept database rows
- Components should use aggregate methods for behavior

**State Management**:
- Store `Property` aggregates in state
- Do not store database rows in state
- Use service methods for all mutations

---

## 9. Architecture Rules

### Domain Layer Rules

1. **No Repository Imports in Domain**
   - Domain entities must not import repositories
   - Domain entities must not import Supabase client
   - Domain entities must be pure

2. **Aggregate Root Pattern**
   - Property is the aggregate root
   - Child entities cannot exist independently
   - All access goes through the aggregate root

3. **Mapper Abstraction**
   - All database transformations go through PropertyMapper
   - UI never sees database rows
   - Schema changes only affect mapper

4. **Service Contract Pattern**
   - UI depends on IPropertyService, not implementation
   - Service can be replaced without UI changes
   - Enables testing with mock implementations

5. **Entity Validation**
   - Each entity has its own validate() method
   - Aggregate root validates all children
   - Validation is domain logic, not UI logic

6. **Business Logic in Domain**
   - Pricing calculations in PropertyPricing
   - Availability checks in PropertyAvailability
   - Metrics calculations in PropertyMetrics
   - UI should not contain business logic

---

## 10. Database Schema Alignment

### Tables to Domain Entities

| Database Table | Domain Entity |
|----------------|---------------|
| properties | Property (aggregate root) |
| property_addresses | PropertyAddress |
| property_pricing | PropertyPricing |
| property_features | PropertyFeatures |
| property_images | PropertyImage |
| property_reviews | PropertyReview |
| availability_blocks | PropertyAvailability |
| wishlists | (handled via service) |

### Foreign Key Relationships

```
properties (root)
├── property_addresses (property_id → properties.id)
├── property_pricing (property_id → properties.id)
├── property_features (property_id → properties.id)
├── property_images (property_id → properties.id)
├── property_reviews (property_id → properties.id, guest_id → auth.users)
├── availability_blocks (property_id → properties.id)
└── wishlists (property_id → properties.id, user_id → auth.users)
```

---

## 11. Implementation Status

### Completed (Phase 1B.2)

- ✅ PropertyTypes.ts - All type definitions
- ✅ Property.ts - Aggregate root
- ✅ PropertyAddress.ts - Address entity
- ✅ PropertyPricing.ts - Pricing entity
- ✅ PropertyFeatures.ts - Features entity
- ✅ PropertyImage.ts - Image entity
- ✅ PropertyReview.ts - Review entity
- ✅ PropertyAvailability.ts - Availability entity
- ✅ PropertyMapper.ts - Database transformations
- ✅ PropertyMetrics.ts - Metrics engine
- ✅ PropertyServiceContract.ts - Service interface
- ✅ PROPERTY_DOMAIN_MODEL.md - This document

### Next Steps (Phase 1B.3)

- Property Repository Layer
- Property Service Implementation
- Property Hooks
- Property View Models
- Property UI

---

## 12. Strategic Importance

### Why Property Matters

Property is the **second aggregate capability** after Customer. Unlike Customer (entity capability), Property is an **aggregate capability** with multiple child entities.

**Dependencies on Property**:
- Booking Capability - Depends on Property for availability
- Payment Capability - Depends on Property for pricing
- RMS Capability - Depends on Property for unit management

**Pattern Reference**:
Property serves as the reference implementation for all future aggregate capabilities:
- Booking (aggregate)
- Payment (aggregate)
- RMS (aggregate)

**Platform Impact**:
- Property enables the core listing functionality
- Property enables booking and payment flows
- Property enables revenue management
- Property is foundational to the GuriGate platform

---

## 13. Testing Strategy

### Unit Tests

Each entity should have unit tests for:
- Constructor behavior
- Validation logic
- Business logic methods
- Edge cases

Example:
```typescript
describe('PropertyAvailability', () => {
  it('should detect overlapping date ranges', () => {
    const block = new PropertyAvailability({
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-06-10'),
      // ...
    });
    expect(block.overlapsWith(
      new Date('2026-06-05'),
      new Date('2026-06-15')
    )).toBe(true);
  });
});
```

### Integration Tests

Mapper should have integration tests for:
- Database row to domain mapping
- Domain to database insert mapping
- Domain to database update mapping
- Enum transformations

### Service Tests

Service implementation should have tests for:
- All contract methods
- Error handling
- Edge cases
- Permission checks

---

## 14. Migration Strategy

### Schema Changes

If database schema changes:
1. Update migration files
2. Regenerate TypeScript types
3. Update PropertyMapper enum mappings
4. Update entity interfaces if needed
5. No UI changes required (mapper abstraction)

### Breaking Changes

If breaking changes are required:
1. Create new migration
2. Update mapper to handle both old and new schemas
3. Deploy service with backward compatibility
4. Migrate data
5. Remove old schema support

---

## 15. Glossary

**Aggregate Root**: The main entity that composes child entities. The UI consumes the aggregate root, not individual database rows.

**Child Entity**: An entity that cannot exist independently of its aggregate root.

**Mapper**: The transformation layer between database rows and domain entities.

**Service Contract**: The interface that defines service operations, independent of implementation.

**Availability Block**: A date range where a property is unavailable for booking.

**Stay Restriction**: Minimum or maximum stay requirements enforced by availability blocks.

**Booking Window**: How many days in advance bookings can be made.

**Performance Rating**: A calculated score (excellent/good/average/poor) based on property metrics.

**Benchmark**: Platform-wide averages used to compare individual property performance.

---

## Appendix A: File Structure

```
frontend/src/domain/property/
├── PropertyTypes.ts
├── Property.ts
├── PropertyAddress.ts
├── PropertyPricing.ts
├── PropertyFeatures.ts
├── PropertyImage.ts
├── PropertyReview.ts
├── PropertyAvailability.ts
├── PropertyMapper.ts
├── PropertyMetrics.ts
└── PropertyServiceContract.ts
```

---

## Appendix B: Quick Reference

### Common Operations

**Check if property is bookable**:
```typescript
const property = await propertyService.getPropertyById(id);
const available = property.isAvailableForDates(start, end);
const canAccommodate = property.canAccommodate(guestCount);
const price = property.calculatePrice(nights);
```

**Get property metrics**:
```typescript
const metrics = await propertyService.getPropertyMetrics(id);
const performance = PropertyMetrics.getPerformanceRating(metrics);
```

**Create availability block**:
```typescript
await propertyService.createAvailability({
  propertyId: id,
  blockType: AvailabilityBlockType.MANUAL,
  startDate: new Date('2026-06-01'),
  endDate: new Date('2026-06-10'),
  reason: 'Maintenance',
});
```

**Calculate pricing**:
```typescript
const pricing = await propertyService.calculatePricing(id, start, end);
const total = pricing.total;
const breakdown = pricing.breakdown;
```

---

**Document End**
