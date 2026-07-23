/**
 * Payment Repository
 *
 * Data access layer for payment operations.
 * Handles all Supabase queries for payments.
 */

import { supabase } from '../integrations/supabase/client';
import type { Payment, PaymentFilters, PaymentListResult, CreatePaymentInput, RefundPaymentInput } from '../domain/payment/PaymentTypes';

export class PaymentRepository {
  /**
   * Get payment by ID
   */
  static async getById(id: string): Promise<Payment | null> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    return this.mapToDomain(data);
  }

  /**
   * Get payments with filters and pagination
   */
  static async getList(filters: PaymentFilters = {}, page = 1, pageSize = 20): Promise<PaymentListResult> {
    let query = supabase
      .from('payments')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    if (filters.method && filters.method !== 'all') {
      query = query.eq('method', filters.method);
    }
    if (filters.type && filters.type !== 'all') {
      query = query.eq('type', filters.type);
    }
    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters.bookingId) {
      query = query.eq('booking_id', filters.bookingId);
    }
    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom.toISOString());
    }
    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo.toISOString());
    }
    if (filters.search) {
      query = query.or(`transaction_id.ilike.%${filters.search}%`);
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
   * Create payment
   */
  static async create(input: CreatePaymentInput, userId: string): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        booking_id: input.bookingId,
        user_id: userId,
        amount: input.amount,
        currency: input.currency,
        method: input.method,
        type: input.type,
        status: 'pending',
      })
      .select('*')
      .single();

    if (error) throw error;

    return this.mapToDomain(data);
  }

  /**
   * Update payment status
   */
  static async updateStatus(id: string, status: PaymentStatus, gatewayResponse?: any): Promise<Payment> {
    const updateData: any = { status };
    if (gatewayResponse) {
      updateData.gateway_response = gatewayResponse;
    }

    const { data, error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    return this.mapToDomain(data);
  }

  /**
   * Refund payment
   */
  static async refund(id: string, input: RefundPaymentInput): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .update({
        status: 'refunded',
        refund_reason: input.reason,
        refund_amount: input.amount,
        refunded_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    return this.mapToDomain(data);
  }

  /**
   * Map database record to domain entity
   */
  private static mapToDomain(data: any): Payment {
    return {
      id: data.id,
      bookingId: data.booking_id,
      userId: data.user_id,
      amount: data.amount,
      currency: data.currency,
      method: data.method,
      status: data.status,
      type: data.type,
      transactionId: data.transaction_id,
      gatewayResponse: data.gateway_response,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
