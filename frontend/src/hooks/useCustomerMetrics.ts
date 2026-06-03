/**
 * useCustomerMetrics Hook
 *
 * Provides customer metrics: health score, outstanding balance, booking count, etc.
 * Consumes ICustomerService, not repository directly.
 */

import { useState, useCallback, useEffect } from 'react';
import { customerService } from '../services/customerService';
import type { CustomerMetrics } from '../domain/customer/CustomerTypes';

interface UseCustomerMetricsReturn {
  metrics: CustomerMetrics | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useCustomerMetrics(customerId?: string): UseCustomerMetricsReturn {
  const [metrics, setMetrics] = useState<CustomerMetrics | null>(null);
  const [loading, setLoading] = useState(!!customerId);
  const [error, setError] = useState<Error | null>(null);

  const fetchMetrics = useCallback(async () => {
    if (!customerId) {
      setMetrics(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await customerService.getCustomerMetrics(customerId);
      setMetrics(data);
    } catch (err) {
      setError(err as Error);
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics,
  };
}
