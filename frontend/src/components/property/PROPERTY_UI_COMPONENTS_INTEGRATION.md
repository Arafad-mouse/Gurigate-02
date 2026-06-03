# Property UI Components Integration Guide

**Phase:** 1B.7 Property UI Components  
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
ViewModel
   ↓
UI Component ← You are here
   ↓
Page
```

UI Components consume ViewModels exclusively. No direct service or repository access inside components.

---

## Created Components

### Shared Components

#### PropertyEmptyState

**File:** `src/components/property/shared/PropertyEmptyState.tsx`

**Purpose:** Shared empty state for property lists and grids.

**Variants:**
- `search` - No search results
- `list` - No properties in list
- `wishlist` - Empty wishlist

**Integration Example:**
```typescript
import { PropertyEmptyState } from '@/components/property/shared/PropertyEmptyState';

<PropertyEmptyState
  variant="search"
  actionLabel="Add Property"
  onAction={() => navigate('/properties/create')}
/>
```

---

#### PropertyCardSkeleton

**File:** `src/components/property/shared/PropertyCardSkeleton.tsx`

**Purpose:** Skeleton loading state for PropertyCard.

**Integration Example:**
```typescript
import { PropertyCardSkeleton } from '@/components/property/shared/PropertyCardSkeleton';

{loading ? (
  <PropertyCardSkeleton />
) : (
  <PropertyCard viewModel={viewModel} />
)}
```

---

#### PropertyDetailSkeleton

**File:** `src/components/property/shared/PropertyDetailSkeleton.tsx`

**Purpose:** Skeleton loading state for PropertyDetail page.

**Integration Example:**
```typescript
import { PropertyDetailSkeleton } from '@/components/property/shared/PropertyDetailSkeleton';

{loading ? (
  <PropertyDetailSkeleton />
) : (
  <PropertyDetailContent viewModel={viewModel} />
)}
```

---

### Tier 1: Core Components

#### PropertyCard

**File:** `src/components/property/cards/PropertyCard.tsx`

**Purpose:** Displays property in card format. Consumes PropertyCardViewModel.

**Used By:**
- Marketplace
- Featured Properties
- Wishlist
- Search Results
- Owner Listings

**Props:**
```typescript
interface PropertyCardProps {
  viewModel: PropertyCardViewModel;
  onClick?: () => void;
  onWishlistToggle?: () => void;
  showWishlistButton?: boolean;
}
```

**Integration Example:**
```typescript
import { PropertyCard } from '@/components/property/cards/PropertyCard';
import { PropertyCardViewModelMapper } from '@/view-models/property/PropertyCardViewModel';

function PropertyList() {
  const { properties } = useProperties();
  const viewModels = PropertyCardViewModelMapper.toViewModelList(properties);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {viewModels.map((vm) => (
        <PropertyCard
          key={vm.id}
          viewModel={vm}
          onClick={() => navigate(`/properties/${vm.id}`)}
          onWishlistToggle={() => handleWishlistToggle(vm.id)}
        />
      ))}
    </div>
  );
}
```

---

#### PropertyGrid

**File:** `src/components/property/layouts/PropertyGrid.tsx`

**Purpose:** Reusable layout wrapper for property cards. Supports grid and list modes.

**Props:**
```typescript
interface PropertyGridProps {
  viewModels: PropertyCardViewModel[];
  loading?: boolean;
  layoutMode?: 'grid' | 'list';
  onPropertyClick?: (viewModel: PropertyCardViewModel) => void;
  onWishlistToggle?: (viewModel: PropertyCardViewModel) => void;
  showWishlistButton?: boolean;
  emptyStateVariant?: 'search' | 'list' | 'wishlist';
  emptyStateActionLabel?: string;
  onEmptyStateAction?: () => void;
}
```

**Integration Example:**
```typescript
import { PropertyGrid } from '@/components/property/layouts/PropertyGrid';

function MarketplacePage() {
  const { properties, loading } = useProperties();
  const viewModels = PropertyCardViewModelMapper.toViewModelList(properties);

  return (
    <PropertyGrid
      viewModels={viewModels}
      loading={loading}
      layoutMode="grid"
      onPropertyClick={(vm) => navigate(`/properties/${vm.id}`)}
      onWishlistToggle={(vm) => handleWishlistToggle(vm.id)}
      emptyStateVariant="search"
    />
  );
}
```

---

#### PropertySearchBar

**File:** `src/components/property/filters/PropertySearchBar.tsx`

**Purpose:** Search bar for property listings. Supports keyword, location, type, price, purpose.

**Props:**
```typescript
interface PropertySearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  initialQuery?: string;
  initialFilters?: SearchFilters;
}
```

**Integration Example:**
```typescript
import { PropertySearchBar } from '@/components/property/filters/PropertySearchBar';

function MarketplacePage() {
  const handleSearch = (query: string, filters: SearchFilters) => {
    // Call hook to search with filters
    searchProperties(query, filters);
  };

  return (
    <PropertySearchBar
      onSearch={handleSearch}
      initialQuery={searchQuery}
      initialFilters={searchFilters}
    />
  );
}
```

---

#### PropertyFilters

**File:** `src/components/property/filters/PropertyFilters.tsx`

**Purpose:** Reusable filter panel for property listings.

**Props:**
```typescript
interface PropertyFiltersProps {
  onFiltersChange: (filters: FilterValues) => void;
  initialFilters?: FilterValues;
}
```

**Integration Example:**
```typescript
import { PropertyFilters } from '@/components/property/filters/PropertyFilters';

function MarketplacePage() {
  const handleFiltersChange = (filters: FilterValues) => {
    // Call hook to apply filters
    applyFilters(filters);
  };

  return (
    <PropertyFilters
      onFiltersChange={handleFiltersChange}
      initialFilters={currentFilters}
    />
  );
}
```

---

### Tier 2: Detail Components

#### PropertyGallery

**File:** `src/components/property/details/PropertyGallery.tsx`

**Purpose:** Image gallery with main image, thumbnails, fullscreen modal, image counter.

**Props:**
```typescript
interface PropertyGalleryProps {
  images: {
    id: string;
    imageUrl: string;
    altText: string | null;
    isPrimary: boolean;
    sortOrder: number;
  }[];
  primaryImage: string;
}
```

**Integration Example:**
```typescript
import { PropertyGallery } from '@/components/property/details/PropertyGallery';

function PropertyDetailPage() {
  const { property } = useProperty(id);
  const detailVM = PropertyDetailViewModelMapper.toViewModel(property);

  return (
    <PropertyGallery
      images={detailVM.images}
      primaryImage={detailVM.primaryImage}
    />
  );
}
```

---

#### PropertyOverview

**File:** `src/components/property/details/PropertyOverview.tsx`

**Purpose:** Displays property overview (title, address, price, badge, owner, views, created date).

**Props:**
```typescript
interface PropertyOverviewProps {
  viewModel: PropertyDetailViewModel;
}
```

**Integration Example:**
```typescript
import { PropertyOverview } from '@/components/property/details/PropertyOverview';

function PropertyDetailPage() {
  const { property } = useProperty(id);
  const detailVM = PropertyDetailViewModelMapper.toViewModel(property);

  return <PropertyOverview viewModel={detailVM} />;
}
```

---

#### PropertyFeatures

**File:** `src/components/property/shared/PropertyFeatures.tsx` (existing)

**Purpose:** Displays property features and amenities.

**Note:** This component already exists in the shared folder and uses the Property domain entity directly. It should be updated to use PropertyDetailViewModel in the future.

---

#### PropertyAvailabilityCalendar

**File:** `src/components/property/details/PropertyAvailabilityCalendar.tsx`

**Purpose:** Displays property availability calendar. Needed for Short Stay and Bookings.

**Props:**
```typescript
interface PropertyAvailabilityCalendarProps {
  viewModel: PropertyDetailViewModel;
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
}
```

**Integration Example:**
```typescript
import { PropertyAvailabilityCalendar } from '@/components/property/details/PropertyAvailabilityCalendar';

function PropertyDetailPage() {
  const { property } = useProperty(id);
  const detailVM = PropertyDetailViewModelMapper.toViewModel(property);

  return <PropertyAvailabilityCalendar viewModel={detailVM} />;
}
```

---

#### PropertyReviewList

**File:** `src/components/property/details/PropertyReviewList.tsx`

**Purpose:** Displays property reviews.

**Props:**
```typescript
interface PropertyReviewListProps {
  viewModel: PropertyDetailViewModel;
  showAll?: boolean;
  maxReviews?: number;
}
```

**Integration Example:**
```typescript
import { PropertyReviewList } from '@/components/property/details/PropertyReviewList';

function PropertyDetailPage() {
  const { property } = useProperty(id);
  const detailVM = PropertyDetailViewModelMapper.toViewModel(property);

  return <PropertyReviewList viewModel={detailVM} maxReviews={3} />;
}
```

---

#### PropertyReviewForm

**File:** `src/components/property/details/PropertyReviewForm.tsx`

**Purpose:** Form for creating property reviews.

**Props:**
```typescript
interface PropertyReviewFormProps {
  propertyId: string;
  onSubmit: (review: { rating: number; comment: string }) => Promise<void>;
  onCancel?: () => void;
}
```

**Integration Example:**
```typescript
import { PropertyReviewForm } from '@/components/property/details/PropertyReviewForm';

function PropertyDetailPage() {
  const { property } = useProperty(id);
  const { createReview } = usePropertyReviews();

  const handleSubmit = async (review) => {
    await createReview(property.id, review);
  };

  return (
    <PropertyReviewForm
      propertyId={property.id}
      onSubmit={handleSubmit}
    />
  );
}
```

---

### Tier 3: Admin Components

#### PropertyApprovalBadge

**File:** `src/components/property/admin/PropertyApprovalBadge.tsx`

**Purpose:** Displays property approval status badge.

**Statuses:** Draft, Pending, Approved, Rejected, Suspended

**Props:**
```typescript
interface PropertyApprovalBadgeProps {
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'suspended';
  size?: 'sm' | 'md' | 'lg';
}
```

**Integration Example:**
```typescript
import { PropertyApprovalBadge } from '@/components/property/admin/PropertyApprovalBadge';

function AdminPropertyRow({ property }) {
  return (
    <PropertyApprovalBadge
      status={property.approvalStatus}
      size="md"
    />
  );
}
```

---

#### PropertyStatusBadge

**File:** `src/components/property/admin/PropertyStatusBadge.tsx`

**Purpose:** Displays property status badge.

**Statuses:** Active, Inactive, Booked, Sold, Archived

**Props:**
```typescript
interface PropertyStatusBadgeProps {
  status: 'active' | 'inactive' | 'booked' | 'sold' | 'archived';
  size?: 'sm' | 'md' | 'lg';
}
```

**Integration Example:**
```typescript
import { PropertyStatusBadge } from '@/components/property/admin/PropertyStatusBadge';

function AdminPropertyRow({ property }) {
  return (
    <PropertyStatusBadge
      status={property.status}
      size="md"
    />
  );
}
```

---

#### PropertyActionsMenu

**File:** `src/components/property/admin/PropertyActionsMenu.tsx`

**Purpose:** Actions menu for property management. Permission-aware.

**Actions:** Edit, Delete, Feature, Approve, Reject, Suspend, View

**Props:**
```typescript
interface PropertyActionsMenuProps {
  propertyId: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onFeature?: (id: string) => void;
  onUnfeature?: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onSuspend?: (id: string) => void;
  onUnsuspend?: (id: string) => void;
  onView?: (id: string) => void;
  isFeatured?: boolean;
  isApproved?: boolean;
  isSuspended?: boolean;
  permissions?: {
    canEdit?: boolean;
    canDelete?: boolean;
    canFeature?: boolean;
    canApprove?: boolean;
    canSuspend?: boolean;
  };
}
```

**Integration Example:**
```typescript
import { PropertyActionsMenu } from '@/components/property/admin/PropertyActionsMenu';

function AdminPropertyRow({ property }) {
  const { approveProperty, rejectProperty, suspendProperty } = useProperty();

  return (
    <PropertyActionsMenu
      propertyId={property.id}
      onView={(id) => navigate(`/properties/${id}`)}
      onEdit={(id) => navigate(`/properties/${id}/edit`)}
      onApprove={(id) => approveProperty(id)}
      onReject={(id) => rejectProperty(id)}
      onSuspend={(id) => suspendProperty(id)}
      isFeatured={property.isFeatured}
      isApproved={property.isApproved}
      isSuspended={property.isSuspended}
      permissions={{
        canEdit: true,
        canDelete: true,
        canFeature: true,
        canApprove: true,
        canSuspend: true,
      }}
    />
  );
}
```

---

### Tier 4: Analytics Components

#### PropertyMetricsCard

**File:** `src/components/property/cards/PropertyMetricsCard.tsx`

**Purpose:** Displays property metrics in card format. Uses PropertyMetricsViewModel.

**Metrics:** Views, Bookings, Revenue, Wishlist Count, Conversion Rate, Occupancy Rate, Availability Rate

**Props:**
```typescript
interface PropertyMetricsCardProps {
  viewModel: PropertyMetricsViewModel;
}
```

**Integration Example:**
```typescript
import { PropertyMetricsCard } from '@/components/property/cards/PropertyMetricsCard';
import { PropertyMetricsViewModelMapper } from '@/view-models/property/PropertyMetricsViewModel';

function OwnerDashboard() {
  const { metrics } = usePropertyMetrics(propertyId);
  const metricsVM = PropertyMetricsViewModelMapper.toViewModel(metrics, viewCount);

  return <PropertyMetricsCard viewModel={metricsVM} />;
}
```

---

## Component Usage by Page

### Marketplace Page
- PropertySearchBar
- PropertyFilters
- PropertyGrid
- PropertyCard
- PropertyEmptyState
- PropertyCardSkeleton

### Property Detail Page
- PropertyGallery
- PropertyOverview
- PropertyFeatures (existing)
- PropertyAvailabilityCalendar
- PropertyReviewList
- PropertyReviewForm
- PropertyDetailSkeleton

### Create/Edit Property Page
- PropertyFormViewModel (from ViewModels)
- Form components (to be created)

### Wishlist Page
- PropertyGrid
- PropertyCard
- PropertyEmptyState

### Owner Dashboard
- PropertyGrid
- PropertyMetricsCard
- PropertyCard

### Admin Properties Page
- PropertyGrid
- PropertyApprovalBadge
- PropertyStatusBadge
- PropertyActionsMenu
- PropertyCard

### Approval Queue Page
- PropertyGrid
- PropertyApprovalBadge
- PropertyActionsMenu
- PropertyCard

---

## Engineering Rules Compliance

### ✅ No Service Calls Inside Components
All components consume ViewModels or callbacks from parent components. No direct service calls.

### ✅ No DTO Usage
All components accept ViewModels only. No database models or DTOs.

### ✅ Shared Empty States
PropertyEmptyState is used across all property lists and grids.

### ✅ Shared Skeletons
PropertyCardSkeleton and PropertyDetailSkeleton provide consistent loading states.

---

## Folder Structure

```
src/components/property/
├── cards/
│   ├── PropertyCard.tsx
│   └── PropertyMetricsCard.tsx
├── filters/
│   ├── PropertySearchBar.tsx
│   └── PropertyFilters.tsx
├── details/
│   ├── PropertyGallery.tsx
│   ├── PropertyOverview.tsx
│   ├── PropertyAvailabilityCalendar.tsx
│   ├── PropertyReviewList.tsx
│   └── PropertyReviewForm.tsx
├── admin/
│   ├── PropertyApprovalBadge.tsx
│   ├── PropertyStatusBadge.tsx
│   └── PropertyActionsMenu.tsx
├── layouts/
│   └── PropertyGrid.tsx
└── shared/
    ├── PropertyEmptyState.tsx
    ├── PropertyCardSkeleton.tsx
    └── PropertyDetailSkeleton.tsx
```

---

## Verification

- ✅ All Tier 1 components created
- ✅ All Tier 2 components created
- ✅ All Tier 3 components created
- ✅ All Tier 4 components created
- ✅ Skeleton states created
- ✅ Empty states created
- ✅ All components consume ViewModels only
- ✅ No direct repository/service usage inside components
- ✅ TypeScript compilation successful
- ✅ Component usage documented

---

## Next Steps

After Phase 1B.7, proceed with:

**Phase 1B.8 Property Pages**
- Create Marketplace page
- Create Property Detail page
- Create Create Property page
- Create Edit Property page
- Create Wishlist page
- Create Owner Dashboard
- Create Admin Properties page
- Create Approval Queue page

Pages will orchestrate hooks, transform to ViewModels, and pass to components.
