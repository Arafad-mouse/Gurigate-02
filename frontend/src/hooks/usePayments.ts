/**
 * usePayments Hook
 *
 * React hook for payment operations.
 * Provides payment CRUD operations with loading states.
 */

import { useState, useCallback } from 'react';
import { PaymentRepository } from '../repositories/paymentRepository';
import type { Payment, PaymentFilters, CreatePaymentInput, RefundPaymentInput } from '../domain/payment/PaymentTypes';

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async (filters?: PaymentFilters, page = 1, pageSize = 20) => {
    setLoading(true);
    setError(null);
    try {
      const result = await PaymentRepository.getList(filters, page, pageSize);
      setPayments(result.items);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payments');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPayment = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const payment = await PaymentRepository.getById(id);
      return payment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createPayment = useCallback(async (input: CreatePaymentInput, userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const payment = await PaymentRepository.create(input, userId);
      setPayments((prev) => [payment, ...prev]);
      return payment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create payment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePaymentStatus = useCallback(async (id: string, status: any, gatewayResponse?: any) => {
    setLoading(true);
    setError(null);
    try {
      const payment = await PaymentRepository.updateStatus(id, status, gatewayResponse);
      setPayments((prev) => prev.map((p) => (p.id === id ? payment : p)));
      return payment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update payment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refundPayment = useCallback(async (id: string, input: RefundPaymentInput) => {
    setLoading(true);
    setError(null);
    try {
      const payment = await PaymentRepository.refund(id, input);
      setPayments((prev) => prev.map((p) => (p.id === id ? payment : p)));
      return payment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refund payment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    payments,
    loading,
    error,
    fetchPayments,
    fetchPayment,
    createPayment,
    updatePaymentStatus,
    refundPayment,
  };
}
