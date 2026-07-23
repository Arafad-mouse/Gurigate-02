/**
 * usePropertyMetrics Hook
 *
 * Provides property metrics: booking count, wishlist count, revenue, etc.
 * Consumes IPropertyService, not repository directly.
 */

import { useState, useCallback, useEffect } from 'react';
import { propertyService } from '../services/propertyService';
import type { PropertyMetrics } from '../domain/property/PropertyTypes';

interface UsePropertyMetricsReturn {
  metrics: PropertyMetrics | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function usePropertyMetrics(propertyId?: string): UsePropertyMetricsReturn {
  const [metrics, setMetrics] = useState<PropertyMetrics | null>(null);
  const [loading, setLoading] = useState(!!propertyId);
  const [error, setError] = useState<Error | null>(null);

  const fetchMetrics = useCallback(async () => {
    if (!propertyId) {
      setMetrics(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await propertyService.getPropertyMetrics(propertyId);
      setMetrics(data);
    } catch (err) {
      setError(err as Error);
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

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
