/**
 * Property Constants
 *
 * Centralized property-related constants to prevent frontend/backend drift.
 * These constants should be used throughout the UI layer for consistency.
 */

import { PropertyType, PropertyBadge, PropertyStatus, PricingType, CurrencyType } from '../domain/property/PropertyTypes';

/**
 * Property Status Constants
 */
export const PROPERTY_STATUS = {
  AVAILABLE: PropertyStatus.AVAILABLE,
  OCCUPIED: PropertyStatus.OCCUPIED,
  MAINTENANCE: PropertyStatus.MAINTENANCE,
  PENDING: PropertyStatus.PENDING,
  INACTIVE: PropertyStatus.INACTIVE,
} as const;

/**
 * Property Status Labels
 */
export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  [PropertyStatus.AVAILABLE]: 'Available',
  [PropertyStatus.OCCUPIED]: 'Occupied',
  [PropertyStatus.MAINTENANCE]: 'Maintenance',
  [PropertyStatus.PENDING]: 'Pending',
  [PropertyStatus.INACTIVE]: 'Inactive',
};

/**
 * Property Badge Constants
 */
export const PROPERTY_BADGE = {
  FOR_SALE: PropertyBadge.FOR_SALE,
  FOR_RENT: PropertyBadge.FOR_RENT,
  SHORT_STAY: PropertyBadge.SHORT_STAY,
} as const;

/**
 * Property Badge Labels
 */
export const PROPERTY_BADGE_LABELS: Record<PropertyBadge, string> = {
  [PropertyBadge.FOR_SALE]: 'For Sale',
  [PropertyBadge.FOR_RENT]: 'For Rent',
  [PropertyBadge.SHORT_STAY]: 'Short Stay',
};

/**
 * Property Type Constants
 */
export const PROPERTY_TYPE = {
  APARTMENT: PropertyType.APARTMENT,
  HOUSE: PropertyType.HOUSE,
  VILLA: PropertyType.VILLA,
  STUDIO: PropertyType.STUDIO,
  CONDO: PropertyType.CONDO,
  TOWNHOUSE: PropertyType.TOWNHOUSE,
  COTTAGE: PropertyType.COTTAGE,
  PENTHOUSE: PropertyType.PENTHOUSE,
  LOFT: PropertyType.LOFT,
  OTHER: PropertyType.OTHER,
} as const;

/**
 * Property Type Labels
 */
export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  [PropertyType.APARTMENT]: 'Apartment',
  [PropertyType.HOUSE]: 'House',
  [PropertyType.VILLA]: 'Villa',
  [PropertyType.STUDIO]: 'Studio',
  [PropertyType.CONDO]: 'Condo',
  [PropertyType.TOWNHOUSE]: 'Townhouse',
  [PropertyType.COTTAGE]: 'Cottage',
  [PropertyType.PENTHOUSE]: 'Penthouse',
  [PropertyType.LOFT]: 'Loft',
  [PropertyType.OTHER]: 'Other',
};

/**
 * Pricing Type Constants
 */
export const PRICING_TYPE = {
  NIGHTLY: PricingType.NIGHTLY,
  MONTHLY: PricingType.MONTHLY,
  SALE: PricingType.SALE,
} as const;

/**
 * Pricing Type Labels
 */
export const PRICING_TYPE_LABELS: Record<PricingType, string> = {
  [PricingType.NIGHTLY]: 'Per Night',
  [PricingType.MONTHLY]: 'Per Month',
  [PricingType.SALE]: 'Total Price',
};

/**
 * Currency Type Constants
 */
export const CURRENCY_TYPE = {
  USD: CurrencyType.USD,
  EUR: CurrencyType.EUR,
  GBP: CurrencyType.GBP,
  KES: CurrencyType.KES,
  NGN: CurrencyType.NGN,
  ZAR: CurrencyType.ZAR,
  SOS: CurrencyType.SOS,
} as const;

/**
 * Currency Symbols
 */
export const CURRENCY_SYMBOLS: Record<CurrencyType, string> = {
  [CurrencyType.USD]: '$',
  [CurrencyType.EUR]: '€',
  [CurrencyType.GBP]: '£',
  [CurrencyType.KES]: 'KSh',
  [CurrencyType.NGN]: '₦',
  [CurrencyType.ZAR]: 'R',
  [CurrencyType.SOS]: 'S',
};

/**
 * Property Approval Status
 * (Not in domain types yet, but needed for admin workflow)
 */
export const PROPERTY_APPROVAL_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
} as const;

/**
 * Property Approval Status Labels
 */
export const PROPERTY_APPROVAL_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  pending: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  suspended: 'Suspended',
};

/**
 * Property Booking Status
 * (Not in domain types yet, but needed for booking workflow)
 */
export const PROPERTY_BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const;

/**
 * Property Booking Status Labels
 */
export const PROPERTY_BOOKING_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  completed: 'Completed',
};

/**
 * Default pagination settings
 */
export const PROPERTY_PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * Image upload limits
 */
export const PROPERTY_IMAGE_LIMITS = {
  MAX_IMAGES: 20,
  MAX_FILE_SIZE_MB: 10,
  ALLOWED_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
} as const;
