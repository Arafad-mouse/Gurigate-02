/**
 * usePropertyAvailability Hook
 *
 * Provides property availability operations: fetch, check, create, update, delete.
 * Consumes IPropertyService, not repository directly.
 */

import { useState, useCallback, useEffect } from 'react';
import { propertyService } from '../services/propertyService';
import type {
  PropertyAvailability,
  CreateAvailabilityInput,
  UpdateAvailabilityInput,
  AvailabilityCheckResult,
} from '../domain/property/PropertyTypes';

interface UsePropertyAvailabilityReturn {
  availability: PropertyAvailability[];
  loading: boolean;
  error: Error | null;
  checkAvailability: (
    propertyId: string,
    startDate: Date,
    endDate: Date
  ) => Promise<AvailabilityCheckResult>;
  createAvailability: (input: CreateAvailabilityInput) => Promise<void>;
  updateAvailability: (
    propertyId: string,
    blockId: string,
    input: UpdateAvailabilityInput
  ) => Promise<void>;
  deleteAvailability: (propertyId: string, blockId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function usePropertyAvailability(
  propertyId?: string,
  startDate?: Date,
  endDate?: Date
): UsePropertyAvailabilityReturn {
  const [availability, setAvailability] = useState<PropertyAvailability[]>([]);
  const [loading, setLoading] = useState(!!propertyId);
  const [error, setError] = useState<Error | null>(null);

  const fetchAvailability = useCallback(async () => {
    if (!propertyId) {
      setAvailability([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await propertyService.getAvailability(
        propertyId,
        startDate,
        endDate
      );
      setAvailability(data);
    } catch (err) {
      setError(err as Error);
      setAvailability([]);
    } finally {
      setLoading(false);
    }
  }, [propertyId, startDate, endDate]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const handleCheckAvailability = useCallback(
    async (id: string, start: Date, end: Date) => {
      setLoading(true);
      setError(null);

      try {
        const result = await propertyService.checkAvailability(id, start, end);
        return result;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleCreateAvailability = useCallback(
    async (input: CreateAvailabilityInput) => {
      setLoading(true);
      setError(null);

      try {
        await propertyService.createAvailability(input);
        if (propertyId) {
          await fetchAvailability();
        }
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [propertyId, fetchAvailability]
  );

  const handleUpdateAvailability = useCallback(
    async (id: string, blockId: string, input: UpdateAvailabilityInput) => {
      setLoading(true);
      setError(null);

      try {
        await propertyService.updateAvailability(id, blockId, input);
        if (propertyId === id) {
          await fetchAvailability();
        }
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [propertyId, fetchAvailability]
  );

  const handleDeleteAvailability = useCallback(
    async (id: string, blockId: string) => {
      setLoading(true);
      setError(null);

      try {
        await propertyService.deleteAvailability(id, blockId);
        if (propertyId === id) {
          await fetchAvailability();
        }
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [propertyId, fetchAvailability]
  );

  return {
    availability,
    loading,
    error,
    checkAvailability: handleCheckAvailability,
    createAvailability: handleCreateAvailability,
    updateAvailability: handleUpdateAvailability,
    deleteAvailability: handleDeleteAvailability,
    refetch: fetchAvailability,
  };
}
