/**
 * Booking Repository
 *
 * Data access layer for booking operations.
 * Handles all Supabase queries for bookings.
 */

import { supabase } from '../integrations/supabase/client';
import type { Booking, BookingFilters, BookingListResult, CreateBookingInput, UpdateBookingInput } from '../domain/booking/BookingTypes';

export class BookingRepository {
  /**
   * Get booking by ID
   */
  static async getById(id: string): Promise<Booking | null> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        properties!inner(title),
        profiles!guest_id(full_name),
        host:profiles!host_id(full_name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    return this.mapToDomain(data);
  }

  /**
   * Get bookings with filters and pagination
   */
  static async getList(filters: BookingFilters = {}, page = 1, pageSize = 20): Promise<BookingListResult> {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        properties!inner(title),
        profiles!guest_id(full_name),
        host:profiles!host_id(full_name)
      `, { count: 'exact' });

    // Apply filters
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    if (filters.propertyId) {
      query = query.eq('property_id', filters.propertyId);
    }
    if (filters.guestId) {
      query = query.eq('guest_id', filters.guestId);
    }
    if (filters.hostId) {
      query = query.eq('host_id', filters.hostId);
    }
    if (filters.dateFrom) {
      query = query.gte('check_in', filters.dateFrom.toISOString());
    }
    if (filters.dateTo) {
      query = query.lte('check_out', filters.dateTo.toISOString());
    }
    if (filters.search) {
      query = query.or(`properties.title.ilike.%${filters.search}%,profiles.full_name.ilike.%${filters.search}%`);
    }

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to).order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      items: data?.map(this.mapToDomain) || [],
      total: count || 0,
      page,
      pageSize,
    };
  }

  /**
   * Create booking
   */
  static async create(input: CreateBookingInput): Promise<Booking> {
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        property_id: input.propertyId,
        check_in: input.checkIn.toISOString(),
        check_out: input.checkOut.toISOString(),
        guests: input.guests,
        special_requests: input.specialRequests,
        status: 'pending',
        payment_status: 'pending',
      })
      .select(`
        *,
        properties!inner(title),
        profiles!guest_id(full_name),
        host:profiles!host_id(full_name)
      `)
      .single();

    if (error) throw error;

    return this.mapToDomain(data);
  }

  /**
   * Update booking
   */
  static async update(id: string, input: UpdateBookingInput): Promise<Booking> {
    const updateData: any = {};
    if (input.status) updateData.status = input.status;
    if (input.guests !== undefined) updateData.guests = input.guests;
    if (input.specialRequests !== undefined) updateData.special_requests = input.specialRequests;

    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        properties!inner(title),
        profiles!guest_id(full_name),
        host:profiles!host_id(full_name)
      `)
      .single();

    if (error) throw error;

    return this.mapToDomain(data);
  }

  /**
   * Check availability for property
   */
  static async checkAvailability(
    propertyId: string,
    checkIn: Date,
    checkOut: Date
  ): Promise<{ isAvailable: boolean; conflictingBookings: any[] }> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('property_id', propertyId)
      .in('status', ['confirmed', 'ongoing'])
      .or(`and(check_in.lte.${checkOut.toISOString()},check_out.gte.${checkIn.toISOString()})`);

    if (error) throw error;

    return {
      isAvailable: !data || data.length === 0,
      conflictingBookings: data || [],
    };
  }

  /**
   * Map database record to domain entity
   */
  private static mapToDomain(data: any): Booking {
    return {
      id: data.id,
      propertyId: data.property_id,
      propertyTitle: data.properties?.title || '',
      guestId: data.guest_id,
      guestName: data.profiles?.full_name || '',
      hostId: data.host_id,
      hostName: data.host?.full_name || '',
      status: data.status,
      type: data.type || 'short_stay',
      checkIn: new Date(data.check_in),
      checkOut: new Date(data.check_out),
      guests: data.guests,
      totalAmount: data.total_amount,
      currency: data.currency || 'USD',
      paymentStatus: data.payment_status,
      specialRequests: data.special_requests,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
