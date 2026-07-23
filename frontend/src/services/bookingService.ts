/**
 * Booking Service
 *
 * Business logic layer for booking operations.
 * Orchestrates repository calls and applies business rules.
 */

import { BookingRepository } from '../repositories/bookingRepository';
import type { Booking, BookingFilters, BookingListResult, CreateBookingInput, UpdateBookingInput, AvailabilityCheckResult } from '../domain/booking/BookingTypes';
import { BookingStatus } from '../domain/booking/BookingTypes';

export class BookingService {
  /**
   * Get booking by ID
   */
  static async getBooking(id: string): Promise<Booking | null> {
    return BookingRepository.getById(id);
  }

  /**
   * Get bookings with filters
   */
  static async getBookings(filters: BookingFilters = {}, page = 1, pageSize = 20): Promise<BookingListResult> {
    return BookingRepository.getList(filters, page, pageSize);
  }

  /**
   * Create booking with validation
   */
  static async createBooking(input: CreateBookingInput, guestId: string): Promise<Booking> {
    // Validate dates
    if (input.checkIn >= input.checkOut) {
      throw new Error('Check-out date must be after check-in date');
    }

    // Check availability
    const availability = await BookingRepository.checkAvailability(
      input.propertyId,
      input.checkIn,
      input.checkOut
    );

    if (!availability.isAvailable) {
      throw new Error('Property is not available for the selected dates');
    }

    // Create booking (guest_id would be added by RLS or in the repository)
    return BookingRepository.create(input);
  }

  /**
   * Update booking
   */
  static async updateBooking(id: string, input: UpdateBookingInput): Promise<Booking> {
    return BookingRepository.update(id, input);
  }

  /**
   * Cancel booking
   */
  static async cancelBooking(id: string): Promise<Booking> {
    return BookingRepository.update(id, { status: BookingStatus.CANCELLED });
  }

  /**
   * Confirm booking
   */
  static async confirmBooking(id: string): Promise<Booking> {
    return BookingRepository.update(id, { status: BookingStatus.CONFIRMED });
  }

  /**
   * Check availability
   */
  static async checkAvailability(
    propertyId: string,
    checkIn: Date,
    checkOut: Date
  ): Promise<AvailabilityCheckResult> {
    const result = await BookingRepository.checkAvailability(propertyId, checkIn, checkOut);
    
    return {
      isAvailable: result.isAvailable,
      reason: result.isAvailable ? undefined : 'Property is already booked for these dates',
      conflictingBookings: result.conflictingBookings,
    };
  }
}
