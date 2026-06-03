/**
 * Property Domain Types
 *
 * These are the domain types that the UI will consume.
 * They are abstracted from the database schema to prevent
 * schema changes from breaking the frontend.
 */

/**
 * Property type enum
 */
export enum PropertyType {
  APARTMENT = 'apartment',
  HOUSE = 'house',
  VILLA = 'villa',
  STUDIO = 'studio',
  CONDO = 'condo',
  TOWNHOUSE = 'townhouse',
  COTTAGE = 'cottage',
  PENTHOUSE = 'penthouse',
  LOFT = 'loft',
  OTHER = 'other',
}

/**
 * Property badge enum
 */
export enum PropertyBadge {
  FOR_SALE = 'FOR_SALE',
  FOR_RENT = 'FOR_RENT',
  SHORT_STAY = 'SHORT_STAY',
}

/**
 * Property status enum
 */
export enum PropertyStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance',
  PENDING = 'pending',
  INACTIVE = 'inactive',
}

/**
 * Pricing type enum
 */
export enum PricingType {
  NIGHTLY = 'nightly',
  MONTHLY = 'monthly',
  SALE = 'sale',
}

/**
 * Currency type enum
 */
export enum CurrencyType {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  KES = 'KES',
  NGN = 'NGN',
  ZAR = 'ZAR',
  SOS = 'SOS',
}

/**
 * Availability block type enum
 */
export enum AvailabilityBlockType {
  MANUAL = 'manual',
  MAINTENANCE = 'maintenance',
  SEASONAL = 'seasonal',
  OWNER_USE = 'owner_use',
  SYSTEM = 'system',
}

/**
 * Property address entity
 */
export interface PropertyAddress {
  id: string;
  propertyId: string;
  street: string;
  city: string;
  state: string | null;
  postalCode: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
}

/**
 * Property pricing entity
 */
export interface PropertyPricing {
  id: string;
  propertyId: string;
  basePrice: number;
  currency: CurrencyType;
  pricingType: PricingType;
  securityDeposit: number | null;
  cleaningFee: number | null;
  serviceFee: number | null;
}

/**
 * Property features entity
 */
export interface PropertyFeatures {
  id: string;
  propertyId: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  squareFeet: number | null;
  amenities: string[];
  rules: string[];
}

/**
 * Property image entity
 */
export interface PropertyImage {
  id: string;
  propertyId: string;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

/**
 * Property review entity
 */
export interface PropertyReview {
  id: string;
  propertyId: string;
  guestId: string;
  guestName: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
}

/**
 * Property availability block entity
 */
export interface PropertyAvailability {
  id: string;
  propertyId: string;
  blockType: AvailabilityBlockType;
  startDate: Date;
  endDate: Date;
  reason: string | null;
  minimumStay: number | null;
  maximumStay: number | null;
  advanceBookingDays: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Property aggregate root
 * This is what the UI consumes - composed of child entities
 */
export interface Property {
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

/**
 * Property metrics for dashboard
 */
export interface PropertyMetrics {
  propertyId: string;
  averageRating: number;
  reviewCount: number;
  occupancyRate: number;
  bookingCount: number;
  wishlistCount: number;
  availabilityRate: number;
  monthlyRevenue: number;
  totalRevenue: number;
  lastBookingDate: Date | null;
  averageBookingDuration: number;
}

/**
 * Property list filters
 */
export interface PropertyFilters {
  search?: string;
  type?: PropertyType | 'all';
  badge?: PropertyBadge | 'all';
  status?: PropertyStatus | 'all';
  city?: string;
  country?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minGuests?: number;
  maxGuests?: number;
  isFeatured?: boolean;
  isApproved?: boolean;
  ownerId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * Property list result with pagination
 */
export interface PropertyListResult {
  items: Property[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Property create input
 */
export interface CreatePropertyInput {
  title: string;
  description: string;
  type: PropertyType;
  badge: PropertyBadge;
  priceUnitLabel: string;
  address: Omit<PropertyAddress, 'id' | 'propertyId'>;
  pricing: Omit<PropertyPricing, 'id' | 'propertyId'>;
  features: Omit<PropertyFeatures, 'id' | 'propertyId'>;
}

/**
 * Property update input
 */
export interface UpdatePropertyInput {
  title?: string;
  description?: string;
  type?: PropertyType;
  badge?: PropertyBadge;
  priceUnitLabel?: string;
  status?: PropertyStatus;
  isFeatured?: boolean;
  isApproved?: boolean;
  address?: Partial<Omit<PropertyAddress, 'id' | 'propertyId'>>;
  pricing?: Partial<Omit<PropertyPricing, 'id' | 'propertyId'>>;
  features?: Partial<Omit<PropertyFeatures, 'id' | 'propertyId'>>;
}

/**
 * Property availability create input
 */
export interface CreateAvailabilityInput {
  propertyId: string;
  blockType: AvailabilityBlockType;
  startDate: Date;
  endDate: Date;
  reason?: string;
  minimumStay?: number;
  maximumStay?: number;
  advanceBookingDays?: number;
  notes?: string;
}

/**
 * Property availability update input
 */
export interface UpdateAvailabilityInput {
  blockType?: AvailabilityBlockType;
  startDate?: Date;
  endDate?: Date;
  reason?: string;
  minimumStay?: number;
  maximumStay?: number;
  advanceBookingDays?: number;
  notes?: string;
}

/**
 * Property review create input
 */
export interface CreateReviewInput {
  propertyId: string;
  rating: number;
  comment?: string;
}

/**
 * Property image upload input
 */
export interface UploadImageInput {
  propertyId: string;
  imageUrl: string;
  altText?: string;
  sortOrder?: number;
  isPrimary?: boolean;
}

/**
 * Property search result with relevance score
 */
export interface PropertySearchResult {
  property: Property;
  relevanceScore: number;
  matchReasons: string[];
}

/**
 * Property availability check result
 */
export interface AvailabilityCheckResult {
  isAvailable: boolean;
  reason?: string;
  minimumStay?: number;
  maximumStay?: number;
  advanceBookingDays?: number;
  conflictingBlocks?: PropertyAvailability[];
}

/**
 * Property pricing calculation result
 */
export interface PricingCalculation {
  basePrice: number;
  cleaningFee: number;
  serviceFee: number;
  securityDeposit: number;
  total: number;
  currency: CurrencyType;
  breakdown: {
    nights: number;
    pricePerNight: number;
    subtotal: number;
    fees: number;
  };
}
