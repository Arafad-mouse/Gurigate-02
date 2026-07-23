/**
 * useCustomerHistory Hook
 *
 * Provides customer history: bookings, payments, contracts, timeline.
 * Consumes ICustomerService, not repository directly.
 */

import { useState, useCallback, useEffect } from 'react';
import { customerService } from '../services/customerService';
import type {
  CustomerHistory,
  BookingSummary,
  PaymentSummary,
  ContractSummary,
} from '../domain/customer/CustomerTypes';

interface UseCustomerHistoryReturn {
  history: CustomerHistory | null;
  bookings: BookingSummary[];
  payments: PaymentSummary[];
  contracts: ContractSummary[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useCustomerHistory(customerId?: string): UseCustomerHistoryReturn {
  const [history, setHistory] = useState<CustomerHistory | null>(null);
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [payments, setPayments] = useState<PaymentSummary[]>([]);
  const [contracts, setContracts] = useState<ContractSummary[]>([]);
  const [loading, setLoading] = useState(!!customerId);
  const [error, setError] = useState<Error | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!customerId) {
      setHistory(null);
      setBookings([]);
      setPayments([]);
      setContracts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await customerService.getCustomerHistory(customerId);
      setHistory(data);
      setBookings(data.bookings);
      setPayments(data.payments);
      setContracts(data.contracts);
    } catch (err) {
      setError(err as Error);
      setHistory(null);
      setBookings([]);
      setPayments([]);
      setContracts([]);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    bookings,
    payments,
    contracts,
    loading,
    error,
    refetch: fetchHistory,
  };
}
