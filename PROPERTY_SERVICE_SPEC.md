# Property Service Specification

**Date**: 2026-06-03  
**Phase**: 1B.4 - Property Service Layer  
**Status**: SPECIFICATION

This document defines the Property Service architecture, responsibilities, and rules before implementation.

---

## 1. Service Architecture

### Layer Stack

```
UI Layer (Future)
    ↓
View Models (Future)
    ↓
Hooks Layer (Future)
    ↓
PropertyService ← CURRENT SCOPE
    ↓
PropertyMapper
    ↓
Property Domain (Property, PropertyAddress, PropertyPricing, etc.)
    ↓
Repositories (propertyRepository, propertyImageRepository, etc.)
    ↓
Supabase Client
    ↓
Database
```

### Data Flow

**Repository Layer**:
- Returns: Database rows (Tables<'table_name'>)
- Example: `Property`, `PropertyImage`, `AvailabilityBlock`

**Mapper Layer**:
- Transforms: Database rows → Domain entities
- Example: `PropertyRow` → `Property` (domain class)

**Service Layer**:
- Returns: Domain entities
- Example: `Property`, `PropertyMetrics`, `AvailabilityCheckResult`

**UI Layer** (Future):
- Consumes: View models
- Example: `PropertyViewModel`, `PropertyListViewModel`

---

## 2. Service Responsibilities

### 2.1 Property Aggregate Operations

**getProperty(id: string)**
- Fetch property with all relations from repository
- Map to domain using PropertyMapper
- Return Property domain entity
- Throws PropertyServiceError if not found

**getProperties(filters: PropertyFilters, page: number, pageSize: number)**
- Fetch properties with pagination from repository
- Map each to domain using PropertyMapper
- Return PropertyListResult with domain entities
- Apply filters: ownerId, status, type, badge, isFeatured, isApproved

**createProperty(input: CreatePropertyInput, ownerId: string)**
- Validate input using domain entity validation
- Map to database insert using PropertyMapper
- Insert via repository
- Fetch created property with relations
- Map to domain
- Return Property domain entity

**updateProperty(id: string, input: UpdatePropertyInput)**
- Fetch existing property from repository
- Map to domain
- Update domain entity
- Validate updated entity
- Map to database update using PropertyMapper
- Update via repository
- Fetch updated property with relations
- Map to domain
- Return Property domain entity

**archiveProperty(id: string, deletedBy: string)**
- Soft delete via repository
- No domain entity returned

**restoreProperty(id: string)**
- Restore via repository
- Fetch restored property with relations
- Map to domain
- Return Property domain entity

---

### 2.2 Search Operations

**searchProperties(query: string, filters?: PropertyFilters, page?: number, pageSize?: number)**
- Search via repository with text query
- Map results to domain
- Return PropertyListResult with domain entities

**filterProperties(filters: PropertyFilters, page: number, pageSize: number)**
- Filter via repository
- Map results to domain
- Return PropertyListResult with domain entities

**getPropertiesByOwner(ownerId: string, page: number, pageSize: number)**
- Fetch via repository
- Map results to domain
- Return PropertyListResult with domain entities

**getFeaturedProperties(limit?: number)**
- Fetch via repository
- Map results to domain
- Return Property[] domain entities

**getSimilarProperties(propertyId: string, limit?: number)**
- Fetch similar properties via repository (based on type, location, price)
- Map results to domain
- Return Property[] domain entities

---

### 2.3 Availability Operations

**getAvailability(propertyId: string, startDate?: Date, endDate?: Date)**
- Fetch availability blocks via repository
- Map to domain using PropertyMapper
- Return PropertyAvailability[] domain entities

**checkAvailability(propertyId: string, startDate: Date, endDate: Date)**
- Fetch property from repository
- Map to domain
- Check availability using domain method: `property.isAvailableForDates(startDate, endDate)`
- Fetch availability blocks via repository
- Map to domain
- Return AvailabilityCheckResult with domain entities

**createAvailability(input: CreateAvailabilityInput)**
- Validate input using domain entity validation
- Map to database insert using PropertyMapper
- Insert via repository
- Return void

**updateAvailability(propertyId: string, blockId: string, input: UpdateAvailabilityInput)**
- Fetch existing block from repository
- Map to domain
- Update domain entity
- Validate updated entity
- Map to database update using PropertyMapper
- Update via repository
- Return void

**deleteAvailability(propertyId: string, blockId: string, deletedBy: string)**
- Soft delete via repository
- Return void

---

### 2.4 Review Operations

**getPropertyReviews(propertyId: string, page: number, pageSize: number)**
- Fetch reviews via repository
- Map to domain using PropertyMapper
- Return { items: PropertyReview[], total: number }

**createReview(input: CreateReviewInput, guestId: string)**
- Validate input using domain entity validation
- Map to database insert using PropertyMapper
- Insert via repository
- Update property rating via repository
- Return void

**deleteReview(propertyId: string, reviewId: string)**
- Delete via repository
- Update property rating via repository
- Return void

---

### 2.5 Wishlist Operations

**toggleWishlist(userId: string, propertyId: string)**
- Check if wishlisted via repository
- If wishlisted: remove via repository
- If not: add via repository
- Return { added: boolean, wishlist: Wishlist | null }

**isWishlisted(userId: string, propertyId: string)**
- Check via repository
- Return boolean

**getUserWishlists(userId: string)**
- Fetch via repository
- Map to domain using PropertyMapper
- Return Wishlist[] domain entities

---

### 2.6 Metrics Operations

**getPropertyMetrics(propertyId: string)**
- Fetch property from repository
- Map to domain
- Fetch booking count, wishlist count, revenue from repository
- Calculate metrics using PropertyMetrics.calculateMetrics()
- Return PropertyMetrics domain entity

**getAggregateMetrics()**
- Fetch all properties from repository
- Map to domain
- Calculate aggregate metrics using PropertyMetrics.calculateAggregateMetrics()
- Return aggregate metrics object

**getDashboardMetrics()**
- Fetch dashboard statistics from repository
- Return dashboard metrics object

---

### 2.7 Status Operations

**approveProperty(id: string)**
- Fetch property from repository
- Map to domain
- Call property.approve()
- Map to database update using PropertyMapper
- Update via repository
- Fetch updated property with relations
- Map to domain
- Return Property domain entity

**unapproveProperty(id: string)**
- Fetch property from repository
- Map to domain
- Call property.unapprove()
- Map to database update using PropertyMapper
- Update via repository
- Fetch updated property with relations
- Map to domain
- Return Property domain entity

**markAsFeatured(id: string)**
- Fetch property from repository
- Map to domain
- Call property.markAsFeatured()
- Map to database update using PropertyMapper
- Update via repository
- Fetch updated property with relations
- Map to domain
- Return Property domain entity

**unmarkAsFeatured(id: string)**
- Fetch property from repository
- Map to domain
- Call property.unmarkAsFeatured()
- Map to database update using PropertyMapper
- Update via repository
- Fetch updated property with relations
- Map to domain
- Return Property domain entity

**updatePropertyStatus(id: string, status: PropertyStatus)**
- Fetch property from repository
- Map to domain
- Update status
- Validate entity
- Map to database update using PropertyMapper
- Update via repository
- Fetch updated property with relations
- Map to domain
- Return Property domain entity

---

### 2.8 Pricing Operations

**calculatePricing(propertyId: string, startDate: Date, endDate: Date)**
- Fetch property from repository
- Map to domain
- Calculate nights
- Call property.calculatePrice(nights)
- Return PricingCalculation with domain-calculated values

---

### 2.9 Image Operations

**getPropertyImages(propertyId: string)**
- Fetch images via repository
- Map to domain using PropertyMapper
- Return PropertyImage[] domain entities

**deletePropertyImages(propertyId: string)**
- Delete all images via repository
- Return void

---

### 2.10 Export Operations

**exportProperties(filters: PropertyFilters)**
- Fetch properties via repository
- Map to CSV format
- Return Blob

---

## 3. Repository Dependencies

### 3.1 propertyRepository

**Used for**:
- properties table CRUD
- property_addresses table CRUD
- property_pricing table CRUD
- property_features table CRUD
- Search and filtering
- Dashboard metrics

**Methods called**:
- `listProperties()`
- `getPropertyById()`
- `getPropertyWithRelations()`
- `createProperty()`
- `updateProperty()`
- `updatePropertyAddress()`
- `updatePropertyPricing()`
- `updatePropertyFeatures()`
- `deleteProperty()`
- `restoreProperty()`
- `searchProperties()`
- `getPropertiesByOwner()`
- `getFeaturedProperties()`
- `updatePropertyRating()`
- `incrementViewCount()`
- `getDashboardMetrics()`

---

### 3.2 propertyImageRepository

**Used for**:
- property_images table CRUD
- Primary image management
- Sort order management

**Methods called**:
- `getPropertyImages()`
- `createImage()`
- `updateImage()`
- `deleteImage()`
- `setAsPrimary()`
- `updateSortOrder()`
- `reorderImages()`
- `deletePropertyImages()`

---

### 3.3 propertyReviewRepository

**Used for**:
- property_reviews table CRUD
- Rating calculations
- Rating distribution

**Methods called**:
- `getPropertyReviews()`
- `createReview()`
- `deleteReview()`
- `getAverageRating()`
- `getReviewCount()`
- `getRatingDistribution()`
- `getRecentReviews()`

---

### 3.4 availabilityRepository

**Used for**:
- availability_blocks table CRUD
- Availability checking
- Availability statistics

**Methods called**:
- `getAvailabilityBlocks()`
- `getAvailabilityBlockById()`
- `checkAvailability()`
- `createAvailabilityBlock()`
- `updateAvailabilityBlock()`
- `deleteAvailabilityBlock()`
- `getActiveAvailabilityBlocks()`
- `getFutureAvailabilityBlocks()`
- `getAvailabilityBlocksByType()`
- `deletePropertyAvailabilityBlocks()`
- `getAvailabilityStatistics()`

---

### 3.5 wishlistRepository

**Used for**:
- wishlists table CRUD
- Wishlist toggle
- Wishlist statistics

**Methods called**:
- `getUserWishlists()`
- `getPropertyWishlists()`
- `isPropertyWishlisted()`
- `addToWishlist()`
- `removeFromWishlist()`
- `deleteWishlist()`
- `getPropertyWishlistCount()`
- `getUserWishlistCount()`
- `getPopularPropertiesByWishlist()`
- `toggleWishlist()`

---

## 4. Mapper Dependencies

### 4.1 PropertyMapper

**Used for**:
- Database rows → Domain entities
- Domain entities → Database inserts
- Domain entities → Database updates

**Methods called**:
- `toDomain(...)` - Maps database rows to Property aggregate
- `toInsert(input, ownerId)` - Maps domain to database insert
- `toUpdate(input)` - Maps domain to database update
- `toAvailabilityInsert(input)` - Maps availability to database
- `toReviewInsert(input, guestId)` - Maps review to database

**Enum mappings handled**:
- PropertyType ↔ database enum
- PropertyBadge ↔ database enum
- PropertyStatus ↔ database enum
- PricingType ↔ database enum
- CurrencyType ↔ database enum
- AvailabilityBlockType ↔ database enum

---

## 5. Aggregate Rules

### 5.1 Property Aggregate

**Invariants**:
- Property must have at least one image
- Property must have valid address, pricing, and features
- Property cannot be approved if not available
- Property rating is calculated from reviews, not stored

**Validation**:
- Call `property.validate()` before any update
- Validation includes all child entities
- Validation errors thrown as PropertyServiceError

**State Changes**:
- `approve()` / `unapprove()` - Updates is_approved flag
- `markAsFeatured()` / `unmarkAsFeatured()` - Updates is_featured flag
- `updateStatus()` - Updates status enum

**Business Logic**:
- `isAvailable()` - Checks status and approval
- `isAvailableForDates()` - Checks availability blocks
- `canAccommodate()` - Checks guest capacity
- `calculatePrice()` - Delegates to pricing entity
- `getAverageRating()` - Calculates from reviews

---

## 6. Availability Rules

### 6.1 Availability Checking

**Availability is determined by**:
1. Property status must be `AVAILABLE`
2. Property must be approved (`isApproved = true`)
3. No overlapping availability blocks for the requested date range

**Overlap Detection**:
- Use `PropertyAvailability.overlapsWith(start, end)` method
- Any overlapping block makes property unavailable
- System blocks override all other considerations

**Stay Restrictions**:
- `minimumStay`: Minimum number of nights required
- `maximumStay`: Maximum number of nights allowed
- Both must be satisfied for booking to be valid
- Use `PropertyAvailability.meetsStayRequirements(nights)` method

**Booking Window Rules**:
- `advanceBookingDays`: How many days in advance bookings can be made
- 0 = no restriction
- Use `PropertyAvailability.meetsAdvanceBookingRequirement(bookingDate)` method

**Block Types**:
- MANUAL: User-initiated blocks
- MAINTENANCE: Property repair blocks
- SEASONAL: Recurring seasonal patterns
- OWNER_USE: Owner personal use
- SYSTEM: Auto-generated blocks

---

## 7. Pricing Rules

### 7.1 Price Calculation

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
- All calculations use property's currency
- Currency symbols formatted for display

**Pricing Validation**:
- Base price must be > 0
- All fees must be >= 0
- Currency must be supported

**Pricing Types**:
- NIGHTLY: Per night pricing (short stays)
- MONTHLY: Per month pricing (long-term rentals)
- SALE: One-time price (property sales)

**Business Logic**:
- Use `PropertyPricing.calculateTotal(nights)` method
- Use `PropertyPricing.calculateTotalWithDeposit(nights)` method
- Use `PropertyPricing.getPriceBreakdown(nights)` method
- Use `PropertyPricing.formatPrice(amount?)` method

---

## 8. Review Rules

### 8.1 Review Validation

**Required Fields**:
- guest_id: Reference to guest user
- property_id: Reference to property
- rating: 1-5 stars
- guest_name: Guest display name

**Optional Fields**:
- comment: Text review
- created_at: Timestamp (auto-generated)

**Rating Scale**:
- 5 stars: Excellent
- 4 stars: Good
- 3 stars: Average
- 2 stars: Poor
- 1 star: Terrible

**Rating Classification**:
- Positive: 4-5 stars
- Neutral: 3 stars
- Negative: 1-2 stars

**Business Logic**:
- Use `PropertyReview.getStarRating()` method
- Use `PropertyReview.isPositive()` / `isNeutral()` / `isNegative()` methods
- Use `PropertyReview.getSummary()` method for truncated comments

**Rating Updates**:
- When review is created: Recalculate property average rating
- When review is deleted: Recalculate property average rating
- Use `propertyReviewRepository.getAverageRating()` method
- Use `propertyRepository.updatePropertyRating()` method

---

## 9. Wishlist Rules

### 9.1 Wishlist Validation

**Required Fields**:
- user_id: Reference to user
- property_id: Reference to property

**Uniqueness**:
- One wishlist entry per user-property pair
- Use `toggleWishlist()` to handle add/remove logic

**Business Logic**:
- Use `wishlistRepository.isPropertyWishlisted()` to check
- Use `wishlistRepository.toggleWishlist()` to add/remove
- Use `wishlistRepository.getUserWishlists()` to list user's wishlists
- Use `wishlistRepository.getPropertyWishlistCount()` for metrics

**Wishlist Count**:
- Incremented when property is added to wishlist
- Decremented when property is removed from wishlist
- Used in property metrics calculation

---

## 10. Metrics Rules

### 10.1 Metrics Calculation

**Individual Property Metrics**:
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

**Business Logic**:
- Use `PropertyMetrics.calculateMetrics()` method
- Use `PropertyMetrics.calculateAggregateMetrics()` method
- Use `PropertyMetrics.getPerformanceRating()` method
- Use `PropertyMetrics.getRevenueTrend()` method
- Use `PropertyMetrics.compareWithBenchmarks()` method

---

## 11. Error Handling

### 11.1 PropertyServiceError

**Error Codes**:
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Input validation failed
- `PERMISSION_DENIED`: User lacks permission
- `CONFLICT`: Resource conflict (e.g., availability overlap)
- `INTERNAL_ERROR`: Unexpected server error
- `NETWORK_ERROR`: Network request failed
- `AVAILABILITY_CONFLICT`: Availability block conflict
- `PRICING_ERROR`: Pricing calculation error

**Error Structure**:
```typescript
class PropertyServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  )
}
```

**Error Handling Pattern**:
- Catch repository errors
- Wrap in PropertyServiceError with appropriate code
- Include details for debugging
- Propagate to caller

---

## 12. Acceptance Criteria

### 12.1 Service Returns Domain Entities Only

**PASS Criteria**:
- All public methods return domain entities or void
- No database rows returned from service methods
- No UI models returned from service methods
- All return types are from `@/domain/property`

**Evidence**:
- Return types: `Property`, `Property[]`, `PropertyMetrics`, `PropertyAvailability[]`, `PropertyReview[]`, `PropertyImage[]`
- No return types: `PropertyRow`, `PropertyWithProfile`, `Tables<'table_name'>`

---

### 12.2 Mapper Used for All Transformations

**PASS Criteria**:
- All database-to-domain transformations use PropertyMapper
- All domain-to-database transformations use PropertyMapper
- No manual mapping in service layer
- Enum mappings handled by mapper

**Evidence**:
- Service calls `PropertyMapper.toDomain(...)` for all fetches
- Service calls `PropertyMapper.toInsert(...)` for all creates
- Service calls `PropertyMapper.toUpdate(...)` for all updates

---

### 12.3 Validation in Domain

**PASS Criteria**:
- All validation uses domain entity `validate()` methods
- No validation logic in service layer
- Validation errors thrown as PropertyServiceError

**Evidence**:
- Service calls `property.validate()` before updates
- Service calls `propertyAddress.validate()` before address updates
- Service calls `propertyPricing.validate()` before pricing updates
- Service calls `propertyFeatures.validate()` before features updates

---

### 12.4 Business Logic in Domain

**PASS Criteria**:
- All business logic uses domain entity methods
- No business logic in service layer
- Service orchestrates, does not calculate

**Evidence**:
- Availability checks use `property.isAvailableForDates()`
- Price calculations use `property.calculatePrice()`
- Guest capacity uses `property.canAccommodate()`
- Rating calculations use `property.getAverageRating()`
- Metrics calculations use `PropertyMetrics.calculateMetrics()`

---

### 12.5 Service Implements Contract

**PASS Criteria**:
- Service implements IPropertyService interface
- All contract methods implemented
- Method signatures match contract
- Error types match contract

**Evidence**:
- Service class implements `IPropertyService`
- All 25+ contract methods implemented
- PropertyServiceError matches contract
- Error codes match contract

---

## 13. Implementation Checklist

### 13.1 Core Infrastructure

- [ ] Create PropertyService class
- [ ] Implement IPropertyService interface
- [ ] Import all repositories
- [ ] Import PropertyMapper
- [ ] Import domain entities
- [ ] Define error handling

### 13.2 Property Operations

- [ ] Implement getProperty()
- [ ] Implement getProperties()
- [ ] Implement createProperty()
- [ ] Implement updateProperty()
- [ ] Implement archiveProperty()
- [ ] Implement restoreProperty()

### 13.3 Search Operations

- [ ] Implement searchProperties()
- [ ] Implement filterProperties()
- [ ] Implement getPropertiesByOwner()
- [ ] Implement getFeaturedProperties()
- [ ] Implement getSimilarProperties()

### 13.4 Availability Operations

- [ ] Implement getAvailability()
- [ ] Implement checkAvailability()
- [ ] Implement createAvailability()
- [ ] Implement updateAvailability()
- [ ] Implement deleteAvailability()

### 13.5 Review Operations

- [ ] Implement getPropertyReviews()
- [ ] Implement createReview()
- [ ] Implement deleteReview()

### 13.6 Wishlist Operations

- [ ] Implement toggleWishlist()
- [ ] Implement isWishlisted()
- [ ] Implement getUserWishlists()

### 13.7 Metrics Operations

- [ ] Implement getPropertyMetrics()
- [ ] Implement getAggregateMetrics()
- [ ] Implement getDashboardMetrics()

### 13.8 Status Operations

- [ ] Implement approveProperty()
- [ ] Implement unapproveProperty()
- [ ] Implement markAsFeatured()
- [ ] Implement unmarkAsFeatured()
- [ ] Implement updatePropertyStatus()

### 13.9 Pricing Operations

- [ ] Implement calculatePricing()

### 13.10 Image Operations

- [ ] Implement getPropertyImages()
- [ ] Implement deletePropertyImages()

### 13.11 Export Operations

- [ ] Implement exportProperties()

---

## 14. Testing Strategy

### 14.1 Unit Tests

Each service method should have unit tests for:
- Happy path (successful operation)
- Not found errors
- Validation errors
- Permission errors
- Network errors

### 14.2 Integration Tests

Service should have integration tests for:
- Repository integration
- Mapper integration
- Domain validation
- Error propagation

### 14.3 Contract Tests

Service should have tests verifying:
- IPropertyService contract compliance
- Return types match contract
- Error types match contract

---

## 15. Next Steps

After specification approval:
1. Implement PropertyService class
2. Implement all contract methods
3. Add error handling
4. Add validation
5. Add unit tests
6. Add integration tests
7. Verify contract compliance

---

**Document End**
