# Booking ViewModels Integration Guide

## Overview

This document describes the booking ViewModels and their integration with the booking system components.

## Architecture

```
Domain Layer (booking/)
├── BookingTypes.ts              # Domain types and enums
├── BookingService.ts            # Business logic
└── BookingRepository.ts         # Data access

ViewModel Layer (view-models/booking/)
├── BookingCardViewModel.ts      # Card display format
├── BookingListViewModel.ts      # List/table display format
└── BookingDetailViewModel.ts    # Detail page display format

Component Layer (components/booking/)
├── BookingStatusTimeline.tsx    # Status timeline visualization
└── BookingConfirmationFlow.tsx  # Multi-step confirmation flow

Page Layer (pages/)
├── BookingListPage.tsx          # Booking list page
└── BookingDetailPage.tsx        # Booking detail page
```

## Booking Lifecycle

The booking lifecycle follows these states:

1. **Pending** - Initial state after booking creation
2. **Confirmed** - Booking confirmed by host or system
3. **Ongoing** - Guest has checked in
4. **Completed** - Guest has checked out
5. **Cancelled** - Booking was cancelled

## ViewModels

### BookingCardViewModel

**Purpose**: Maps Booking entity to card display format for dashboards and lists.

**Usage**:
```typescript
import { BookingCardViewModelMapper } from '../view-models/booking/BookingCardViewModel';

const viewModel = BookingCardViewModelMapper.toViewModel(booking);
```

**Key Properties**:
- `statusDisplay` - Human-readable status label
- `checkInDisplay`/`checkOutDisplay` - Formatted dates
- `totalAmountDisplay` - Formatted currency
- `durationDisplay` - Human-readable duration (e.g., "3 nights")
- `isPending`, `isConfirmed`, etc. - Boolean status flags

### BookingListViewModel

**Purpose**: Maps BookingListResult to list/table display format with pagination.

**Usage**:
```typescript
import { BookingListViewModelMapper } from '../view-models/booking/BookingListViewModel';

const viewModel = BookingListViewModelMapper.toViewModel(result);
// viewModel.items - array of BookingListItemViewModel
// viewModel.total - total count
// viewModel.hasNextPage - pagination flag
```

**Key Properties**:
- `statusColor` - Color mapping for status badges (yellow, blue, green, red, gray)
- `paymentStatusColor` - Color mapping for payment status
- `isUpcoming`, `isPast`, `isCurrent` - Date-based flags
- `createdAtDisplay` - Formatted creation date

### BookingDetailViewModel

**Purpose**: Maps Booking entity to detail page display format with timeline.

**Usage**:
```typescript
import { BookingDetailViewModelMapper } from '../view-models/booking/BookingDetailViewModel';

const viewModel = BookingDetailViewModelMapper.toViewModel(booking, propertyImage);
```

**Key Properties**:
- `timeline` - Array of timeline steps with completion status
- `canCancel`, `canConfirm`, `canModify`, `canDispute` - Action permissions
- `nightlyRate` - Calculated per-night rate
- `isUpcoming`, `isPast`, `isCurrent` - Date-based flags

**Timeline Structure**:
```typescript
{
  status: string;
  label: string;
  date: string | null;
  isCompleted: boolean;
  isCurrent: boolean;
  isPending: boolean;
}
```

## Components

### BookingStatusTimeline

**Purpose**: Visual timeline showing booking lifecycle stages.

**Props**:
```typescript
interface BookingStatusTimelineProps {
  timeline: TimelineStep[];
  compact?: boolean;  // Compact mode for cards
}
```

**Usage**:
```typescript
import { BookingStatusTimeline } from '../components/booking/BookingStatusTimeline';

<BookingStatusTimeline timeline={viewModel.timeline} />
<BookingStatusTimeline timeline={viewModel.timeline} compact />
```

**Features**:
- Automatic step completion detection
- Current step highlighting with pulse animation
- Cancelled state handling
- Responsive layout

### BookingConfirmationFlow

**Purpose**: Multi-step booking confirmation flow (Review → Payment → Confirmation).

**Props**:
```typescript
interface BookingConfirmationFlowProps {
  property: {
    id: string;
    title: string;
    image: string;
    location: string;
    price: number;
    currency: string;
    maxGuests: number;
  };
  bookingInput: CreateBookingInput;
  onConfirm: (paymentMethod: string) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}
```

**Usage**:
```typescript
import { BookingConfirmationFlow } from '../components/booking/BookingConfirmationFlow';

<BookingConfirmationFlow
  property={property}
  bookingInput={bookingInput}
  onConfirm={handleConfirm}
  onCancel={handleCancel}
  loading={loading}
/>
```

**Steps**:
1. **Review** - Display booking details, dates, pricing
2. **Payment** - Select payment method (card/mobile)
3. **Confirmation** - Success message with booking reference

## Pages

### BookingListPage

**Purpose**: Display and manage all bookings with filtering.

**Features**:
- Status filter (All, Pending, Confirmed, Ongoing, Completed, Cancelled)
- Search by property or guest name
- Quick actions (View, Confirm, Cancel)
- Modal for booking details
- Responsive table layout

**Usage**:
```typescript
import BookingListPage from '../pages/BookingListPage';

<Route path="/bookings" element={<BookingListPage />} />
```

### BookingDetailPage

**Purpose**: Display detailed booking information with timeline.

**Features**:
- Full booking timeline visualization
- Property, guest, and host information
- Payment details and status
- Action buttons (Confirm, Cancel, Dispute)
- Cancel confirmation modal
- Metadata display

**Usage**:
```typescript
import BookingDetailPage from '../pages/BookingDetailPage';

<Route path="/bookings/:id" element={<BookingDetailPage />} />
```

## Integration Example

```typescript
// In a component
import { useBookings } from '../hooks/useBookings';
import { BookingDetailViewModelMapper } from '../view-models/booking/BookingDetailViewModel';
import { BookingStatusTimeline } from '../components/booking/BookingStatusTimeline';

function BookingDetails({ bookingId }: { bookingId: string }) {
  const { fetchBooking, loading } = useBookings();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [viewModel, setViewModel] = useState<BookingDetailViewModel | null>(null);

  useEffect(() => {
    async function load() {
      const data = await fetchBooking(bookingId);
      if (data) {
        setBooking(data);
        setViewModel(BookingDetailViewModelMapper.toViewModel(data));
      }
    }
    load();
  }, [bookingId]);

  if (loading || !viewModel) return <LoadingSpinner />;

  return (
    <div>
      <h1>{viewModel.propertyTitle}</h1>
      <BookingStatusTimeline timeline={viewModel.timeline} />
      {/* Display other booking details */}
    </div>
  );
}
```

## Status Color Mapping

| Status | Color | Tailwind Classes |
|--------|-------|------------------|
| Pending | yellow | `bg-yellow-100 text-yellow-800` |
| Confirmed | blue | `bg-blue-100 text-blue-800` |
| Ongoing | green | `bg-green-100 text-green-800` |
| Completed | gray | `bg-gray-100 text-gray-800` |
| Cancelled | red | `bg-red-100 text-red-800` |

## Payment Status Color Mapping

| Status | Color | Tailwind Classes |
|--------|-------|------------------|
| Pending | yellow | `bg-yellow-100 text-yellow-800` |
| Paid | green | `bg-green-100 text-green-800` |
| Refunded | blue | `bg-blue-100 text-blue-800` |
| Partial | orange | `bg-orange-100 text-orange-800` |

## Best Practices

1. **Always use ViewModels** - Never pass domain entities directly to components
2. **Use the timeline** - The timeline provides clear booking progress visualization
3. **Handle loading states** - All pages should handle loading and error states
4. **Action permissions** - Use `canCancel`, `canConfirm` flags to control button visibility
5. **Date formatting** - All ViewModels provide formatted date strings for display
6. **Currency formatting** - Use the provided display properties for currency values

## Testing

Test the following scenarios:
- Booking creation and confirmation flow
- Status transitions (Pending → Confirmed → Ongoing → Completed)
- Cancellation with reason
- Timeline display for each status
- Filtering and search in list page
- Responsive layout on mobile devices
