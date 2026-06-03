/**
 * useBookings Hook
 *
 * React hook for booking operations.
 * Provides booking CRUD operations with loading states.
 */

import { useState, useCallback } from 'react';
import { BookingService } from '../services/bookingService';
import type { Booking, BookingFilters, CreateBookingInput, UpdateBookingInput } from '../domain/booking/BookingTypes';

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async (filters?: BookingFilters, page = 1, pageSize = 20) => {
    setLoading(true);
    setError(null);
    try {
      const result = await BookingService.getBookings(filters, page, pageSize);
      setBookings(result.items);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBooking = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const booking = await BookingService.getBooking(id);
      return booking;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch booking');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createBooking = useCallback(async (input: CreateBookingInput, guestId: string) => {
    setLoading(true);
    setError(null);
    try {
      const booking = await BookingService.createBooking(input, guestId);
      setBookings((prev) => [booking, ...prev]);
      return booking;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBooking = useCallback(async (id: string, input: UpdateBookingInput) => {
    setLoading(true);
    setError(null);
    try {
      const booking = await BookingService.updateBooking(id, input);
      setBookings((prev) => prev.map((b) => (b.id === id ? booking : b)));
      return booking;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update booking');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelBooking = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const booking = await BookingService.cancelBooking(id);
      setBookings((prev) => prev.map((b) => (b.id === id ? booking : b)));
      return booking;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmBooking = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const booking = await BookingService.confirmBooking(id);
      setBookings((prev) => prev.map((b) => (b.id === id ? booking : b)));
      return booking;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm booking');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkAvailability = useCallback(async (
    propertyId: string,
    checkIn: Date,
    checkOut: Date
  ) => {
    setLoading(true);
    setError(null);
    try {
      const result = await BookingService.checkAvailability(propertyId, checkIn, checkOut);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check availability');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    bookings,
    loading,
    error,
    fetchBookings,
    fetchBooking,
    createBooking,
    updateBooking,
    cancelBooking,
    confirmBooking,
    checkAvailability,
  };
}
