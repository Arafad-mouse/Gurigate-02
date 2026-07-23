# Property View Models Integration Guide

**Phase:** 1B.6 Property View Models  
**Date:** 2026-06-03  
**Status:** ✅ COMPLETE

---

## Architecture Overview

```
Repository
   ↓
Service
   ↓
Hook
   ↓
ViewModel (Mapper)
   ↓
Component
```

View Models act as the transformation layer between domain entities and UI components, preventing direct UI coupling to domain structure.

---

## Created View Models

### 1. PropertyCardViewModel

**File:** `src/view-models/property/PropertyCardViewModel.ts`

**Purpose:** Maps Property domain entity to UI-friendly card display format.

**Used By:**
- Marketplace property listings
- Featured Properties section
- Search Results
- Wishlist
- Owner Listings

**Integration Example:**
```typescript
import { PropertyCardViewModelMapper } from '@/view-models/property/PropertyCardViewModel';
import { useProperties } from '@/hooks/useProperties';

function PropertyList() {
  const { properties, loading } = useProperties();
  const cardVMs = PropertyCardViewModelMapper.toViewModelList(properties);

  return (
    <div>
      {cardVMs.map((vm) => (
        <PropertyCard
          key={vm.id}
          title={vm.title}
          coverImage={vm.coverImage}
          city={vm.city}
          badge={vm.badge}
          priceDisplay={vm.priceDisplay}
          bedrooms={vm.bedrooms}
          bathrooms={vm.bathrooms}
          areaDisplay={vm.areaDisplay}
          rating={vm.rating}
          reviewCount={vm.reviewCount}
          isFeatured={vm.isFeatured}
          isWishlisted={vm.isWishlisted}
        />
      ))}
    </div>
  );
}
```

**Key Transformations:**
- Formats price with currency symbol
- Extracts cover image (primary or first)
- Formats area as "X sq ft"
- Maps badge enum to display label
- Includes wishlist status

---

### 2. PropertyDetailViewModel

**File:** `src/view-models/property/PropertyDetailViewModel.ts`

**Purpose:** Maps Property domain entity to UI-friendly detail page display format. Aggregates all child entities.

**Used By:**
- `/property/:id` page
- Property detail modal
- Property preview

**Integration Example:**
```typescript
import { PropertyDetailViewModelMapper } from '@/view-models/property/PropertyDetailViewModel';
import { useProperty } from '@/hooks/useProperty';

function PropertyDetailPage({ id }: { id: string }) {
  const { property, loading } = useProperty(id);
  const detailVM = property ? PropertyDetailViewModelMapper.toViewModel(property) : null;

  if (!detailVM) return <Loading />;

  return (
    <PropertyDetail
      title={detailVM.title}
      description={detailVM.description}
      badgeLabel={detailVM.badgeLabel}
      statusLabel={detailVM.statusLabel}
      pricing={detailVM.pricing}
      features={detailVM.features}
      images={detailVM.images}
      reviews={detailVM.recentReviews}
      availability={detailVM.availability}
      owner={detailVM.ownerName}
    />
  );
}
```

**Key Transformations:**
- Formats all prices with currency symbols
- Sorts images by sort order
- Extracts primary image
- Formats dates for display
- Gets recent reviews (limit 3)
- Formats availability blocks
- Computes derived fields (hasCoordinates, areaDisplay)

---

### 3. PropertyFormViewModel

**File:** `src/view-models/property/PropertyFormViewModel.ts`

**Purpose:** Maps Property domain entity to UI-friendly form display format. Transforms database shape to form shape.

**Used By:**
- Create Property form
- Edit Property form
- Admin Review form

**Integration Example:**
```typescript
import { PropertyFormViewModelMapper } from '@/view-models/property/PropertyFormViewModel';
import { useProperty } from '@/hooks/useProperty';

function PropertyEditForm({ id }: { id: string }) {
  const { property } = useProperty(id);
  const formVM = property ? PropertyFormViewModelMapper.toEditForm(property) : null;

  const handleSubmit = (values: PropertyFormViewModel) => {
    const input = PropertyFormViewModelMapper.toUpdateInput(values);
    // Call service to update
  };

  return (
    <PropertyForm
      initialValues={formVM}
      onSubmit={handleSubmit}
    />
  );
}
```

**Key Transformations:**
- Provides empty form for create
- Maps existing property to edit form
- Maps form values to CreatePropertyInput
- Maps form values to UpdatePropertyInput
- Includes image URLs and primary index for preview

---

### 4. PropertyAdminViewModel

**File:** `src/view-models/property/PropertyAdminViewModel.ts`

**Purpose:** Maps Property domain entity to UI-friendly admin display format. Includes approval workflow data.

**Used By:**
- Admin Dashboard
- Admin Properties list
- Approval Queue
- Property moderation

**Integration Example:**
```typescript
import { PropertyAdminViewModelMapper } from '@/view-models/property/PropertyAdminViewModel';
import { useProperties } from '@/hooks/useProperties';

function AdminPropertyList() {
  const { properties } = useProperties();
  const adminVMs = PropertyAdminViewModelMapper.toViewModelList(properties);

  return (
    <AdminTable>
      {adminVMs.map((vm) => (
        <AdminPropertyRow
          key={vm.id}
          title={vm.title}
          city={vm.city}
          approvalStatusLabel={vm.approvalStatusLabel}
          ownerName={vm.ownerName}
          viewCount={vm.viewCount}
          bookingCount={vm.bookingCount}
          revenueDisplay={vm.revenueDisplay}
          onApprove={() => handleApprove(vm.id)}
          onReject={() => handleReject(vm.id)}
        />
      ))}
    </AdminTable>
  );
}
```

**Key Transformations:**
- Computes approval status from isApproved flag
- Formats revenue as currency
- Includes owner email for contact
- Formats dates for submission tracking
- Includes metrics for admin decision-making

---

### 5. PropertyMetricsViewModel

**File:** `src/view-models/property/PropertyMetricsViewModel.ts`

**Purpose:** Maps PropertyMetrics domain entity to UI-friendly metrics display format.

**Used By:**
- Analytics cards
- Dashboard widgets
- Property performance overview
- Owner dashboard

**Integration Example:**
```typescript
import { PropertyMetricsViewModelMapper } from '@/view-models/property/PropertyMetricsViewModel';
import { usePropertyMetrics } from '@/hooks/usePropertyMetrics';

function PropertyMetricsCard({ id }: { id: string }) {
  const { metrics } = usePropertyMetrics(id);
  const metricsVM = metrics ? PropertyMetricsViewModelMapper.toViewModel(metrics, viewCount) : null;

  if (!metricsVM) return <Loading />;

  return (
    <MetricsCard>
      <Metric label="Total Views" value={metricsVM.totalViews} />
      <Metric label="Conversion Rate" value={metricsVM.conversionRateDisplay} />
      <Metric label="Wishlist Count" value={metricsVM.wishlistCount} />
      <Metric label="Booking Count" value={metricsVM.bookingCount} />
      <Metric label="Occupancy Rate" value={metricsVM.occupancyRateDisplay} />
      <Metric label="Monthly Revenue" value={metricsVM.monthlyRevenueDisplay} />
    </MetricsCard>
  );
}
```

**Key Transformations:**
- Calculates conversion rate from views and bookings
- Formats percentages for display
- Formats currency for revenue
- Formats duration for average booking length
- Determines if booking is recent (30 days)
- Formats dates for last booking

---

## Constants Integration

**File:** `src/constants/property.ts`

**Purpose:** Centralized property-related constants to prevent frontend/backend drift.

**Used By:**
- All View Models for label mapping
- Form components for dropdown options
- Status badges for display
- Currency formatting

**Integration Example:**
```typescript
import {
  PROPERTY_STATUS_LABELS,
  PROPERTY_BADGE_LABELS,
  CURRENCY_SYMBOLS,
} from '@/constants/property';

function PropertyStatusBadge({ status }: { status: PropertyStatus }) {
  return (
    <Badge>
      {PROPERTY_STATUS_LABELS[status]}
    </Badge>
  );
}
```

---

## Hook Integration Points

### useProperties Hook
**Returns:** `Property[]` (domain entities)
**Transform:** `PropertyCardViewModelMapper.toViewModelList(properties)`

### useProperty Hook
**Returns:** `Property | null` (domain entity)
**Transform:** `PropertyDetailViewModelMapper.toViewModel(property)`

### usePropertyAvailability Hook
**Returns:** `PropertyAvailability[]` (domain entities)
**Transform:** Direct use (availability already simple)

### usePropertyReviews Hook
**Returns:** `PropertyReview[]` (domain entities)
**Transform:** Direct use (reviews already simple)

### usePropertyMetrics Hook
**Returns:** `PropertyMetrics` (domain entity)
**Transform:** `PropertyMetricsViewModelMapper.toViewModel(metrics, viewCount)`

---

## Component Integration Points

### Future Property Pages

1. **Marketplace Page**
   - Uses: `PropertyCardViewModel`
   - Source: `useProperties` hook
   - Mapper: `PropertyCardViewModelMapper.toViewModelList`

2. **Property Detail Page**
   - Uses: `PropertyDetailViewModel`
   - Source: `useProperty` hook
   - Mapper: `PropertyDetailViewModelMapper.toViewModel`

3. **Create Property Page**
   - Uses: `PropertyFormViewModel`
   - Source: Empty form
   - Mapper: `PropertyFormViewModelMapper.toCreateForm`

4. **Edit Property Page**
   - Uses: `PropertyFormViewModel`
   - Source: `useProperty` hook
   - Mapper: `PropertyFormViewModelMapper.toEditForm`

5. **Admin Properties Page**
   - Uses: `PropertyAdminViewModel`
   - Source: `useProperties` hook
   - Mapper: `PropertyAdminViewModelMapper.toViewModelList`

6. **Approval Queue Page**
   - Uses: `PropertyAdminViewModel`
   - Source: Filtered `useProperties` hook
   - Mapper: `PropertyAdminViewModelMapper.toViewModelList`

7. **Owner Dashboard**
   - Uses: `PropertyMetricsViewModel`
   - Source: `usePropertyMetrics` hook
   - Mapper: `PropertyMetricsViewModelMapper.toViewModel`

---

## Benefits of This Architecture

1. **Separation of Concerns:** UI components don't know about domain structure
2. **Testability:** View Models can be unit tested independently
3. **Reusability:** Same View Model can be used by multiple components
4. **Maintainability:** Changes to domain structure only affect mappers
5. **Type Safety:** Strong typing prevents runtime errors
6. **Consistency:** Centralized formatting ensures consistent display
7. **Performance:** Mappers can memoize results if needed

---

## Next Steps

After Phase 1B.6, proceed with:

**Phase 1B.7 Property UI Components**
- Create reusable UI components (PropertyCard, PropertyDetail, PropertyForm, etc.)
- Components consume View Models, not domain entities directly

**Phase 1B.8 Property Pages**
- Create pages that use hooks and components
- Pages orchestrate hooks, transform to View Models, pass to components

**Phase 1B.9 Admin Property Approval Workflow**
- Implement approval queue using PropertyAdminViewModel
- Add approval actions (approve, reject, request changes)

---

## Verification

- ✅ All View Models created
- ✅ All mappers embedded in View Models (following Customer pattern)
- ✅ TypeScript compilation successful
- ✅ Constants centralized
- ✅ Integration points documented
- ✅ Architecture aligned with Customer module
- ✅ No direct domain-to-component coupling
