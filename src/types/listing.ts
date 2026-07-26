// ============================================================
// GuriGate Homes Marketplace — Listing Domain Types
//
// A "Listing" in the Homes Marketplace is a published, approved
// property. These types mirror the `homes_listings` view and
// related tables in the database.
// ============================================================

// ─── Enums ──────────────────────────────────────────────────

export type ListingType = 'short_stay' | 'long_rent' | 'sale';
export type PropertyCategory = 'residential' | 'commercial' | 'land' | 'hospitality';
export type ApprovalStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'suspended';
export type PropertyStatus = 'available' | 'occupied' | 'maintenance' | 'pending' | 'inactive';
export type PricingType = 'nightly' | 'monthly' | 'sale';
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'KES' | 'NGN' | 'ZAR' | 'SOS';

export type CancellationPolicyType = 'flexible' | 'moderate' | 'strict' | 'super_strict' | 'custom';

export type BookingStatus =
  | 'draft'
  | 'pending'
  | 'awaiting_payment'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'completed'
  | 'cancelled'
  | 'expired'
  | 'rejected'
  | 'refunded';

export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded' | 'failed';

// ─── Listing (search result / card) ─────────────────────────

export interface ListingCard {
  id: string;
  title: string;
  type: string;
  propertyCategory: PropertyCategory;
  listingType: ListingType;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  city: string;
  district?: string;
  country: string;
  basePrice: number;
  currency: CurrencyCode;
  pricingType: PricingType;
  primaryImageUrl: string;
  imageCount: number;
  latitude?: number;
  longitude?: number;
  wishlistCount: number;
  isWishlisted?: boolean;
}

// ─── Listing Detail (full page) ─────────────────────────────

export interface ListingImage {
  id: string;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ListingAddress {
  street: string;
  city: string;
  district?: string;
  state?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  apartment?: string;
  showPreciseLocation: boolean;
}

export interface ListingPricing {
  basePrice: number;
  currency: CurrencyCode;
  pricingType: PricingType;
  securityDeposit: number;
  cleaningFee: number;
  serviceFee: number;
}

export interface ListingFeatures {
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  squareFeet: number | null;
  amenities: string[];
  rules: string[];
}

export interface ListingHost {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  isVerified?: boolean;
  responseRate?: number;
  responseTime?: string;
  joinedDate?: string;
}

export interface ListingReview {
  id: string;
  guestId: string;
  guestName: string;
  guestAvatarUrl?: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface ListingAvailabilityBlock {
  id: string;
  blockType: 'manual' | 'maintenance' | 'seasonal' | 'owner_use' | 'system';
  startDate: string;
  endDate: string;
  reason: string | null;
  minimumStay: number | null;
  maximumStay: number | null;
}

export interface PricingOverride {
  id: string;
  startDate: string;
  endDate: string;
  priceType: 'fixed' | 'multiplier';
  priceValue: number;
  label: string | null;
  isRecurring: boolean;
  recurringDayOfWeek: number | null;
}

export interface CancellationPolicy {
  id: string;
  policyType: CancellationPolicyType;
  customRules: Record<string, unknown>[];
  gracePeriodHours: number;
}

export interface ListingDetail {
  id: string;
  title: string;
  description: string;
  type: string;
  propertyCategory: PropertyCategory;
  listingType: ListingType;
  approvalStatus: ApprovalStatus;
  status: PropertyStatus;
  isFeatured: boolean;
  viewCount: number;
  rating: number;
  reviewCount: number;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  slug?: string;
  ownerId: string;
  address: ListingAddress;
  pricing: ListingPricing;
  features: ListingFeatures;
  images: ListingImage[];
  host: ListingHost;
  reviews: ListingReview[];
  availabilityBlocks: ListingAvailabilityBlock[];
  pricingOverrides: PricingOverride[];
  cancellationPolicy: CancellationPolicy | null;
  isWishlisted: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Search & Filters ───────────────────────────────────────

export interface ListingSearchFilters {
  query?: string;
  city?: string;
  country?: string;
  propertyCategory?: PropertyCategory | 'all';
  listingType?: ListingType | 'all';
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minGuests?: number;
  amenities?: string[];
  checkIn?: string;
  checkOut?: string;
  guestCount?: number;
  sortBy?: 'relevance' | 'price_low' | 'price_high' | 'rating' | 'newest' | 'popular';
  page?: number;
  pageSize?: number;
}

export interface ListingSearchResult {
  listings: ListingCard[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ─── Availability Check ─────────────────────────────────────

export interface AvailabilityCheckResult {
  isAvailable: boolean;
  reason?: string;
  minimumStay: number;
  maximumStay: number;
}

// ─── Pricing Calculation ────────────────────────────────────

export interface PricingCalculation {
  nights: number;
  pricePerNight: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  securityDeposit: number;
  total: number;
  currency: CurrencyCode;
}

// ─── Booking Creation ───────────────────────────────────────

export interface CreateBookingInput {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  specialRequests?: string;
}

export interface BookingResult {
  id: string;
  status: BookingStatus;
  totalPrice: number;
  currency: CurrencyCode;
  checkIn: string;
  checkOut: string;
  nightsCount: number;
  pricePerNight: number;
  cleaningFee: number;
  serviceFee: number;
}

// ─── Wishlist ───────────────────────────────────────────────

export interface WishlistItem {
  id: string;
  propertyId: string;
  listing: ListingCard;
  createdAt: string;
}
