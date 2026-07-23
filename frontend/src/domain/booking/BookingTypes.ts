/**
 * Booking Domain Types
 *
 * Domain types for booking functionality.
 * Abstracted from database schema to prevent schema changes from breaking the frontend.
 */

/**
 * Booking status enum
 */
export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/**
 * Booking type enum
 */
export enum BookingType {
  SHORT_STAY = 'short_stay',
  LONG_STAY = 'long_stay',
  DAILY = 'daily',
}

/**
 * Booking entity
 */
export interface Booking {
  id: string;
  propertyId: string;
  propertyTitle: string;
  guestId: string;
  guestName: string;
  hostId: string;
  hostName: string;
  status: BookingStatus;
  type: BookingType;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalAmount: number;
  currency: string;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'partial';
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Booking list filters
 */
export interface BookingFilters {
  status?: BookingStatus | 'all';
  propertyId?: string;
  guestId?: string;
  hostId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

/**
 * Booking list result with pagination
 */
export interface BookingListResult {
  items: Booking[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Booking create input
 */
export interface CreateBookingInput {
  propertyId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  specialRequests?: string;
}

/**
 * Booking update input
 */
export interface UpdateBookingInput {
  status?: BookingStatus;
  guests?: number;
  specialRequests?: string;
}

/**
 * Booking availability check result
 */
export interface AvailabilityCheckResult {
  isAvailable: boolean;
  reason?: string;
  conflictingBookings?: Booking[];
}
