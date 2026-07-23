/**
 * useProperty Hook
 *
 * Provides single property operations: fetch, update, delete, restore.
 * Consumes IPropertyService, not repository directly.
 */

import { useState, useCallback, useEffect } from 'react';
import { propertyService } from '../services/propertyService';
import type {
  Property,
  UpdatePropertyInput,
  CreatePropertyInput,
  PropertyStatus,
} from '../domain/property/PropertyTypes';

interface UsePropertyReturn {
  property: Property | null;
  loading: boolean;
  error: Error | null;
  updateProperty: (id: string, data: UpdatePropertyInput) => Promise<void>;
  createProperty: (data: CreatePropertyInput) => Promise<Property>;
  archiveProperty: (id: string) => Promise<void>;
  restoreProperty: (id: string) => Promise<void>;
  approveProperty: (id: string) => Promise<void>;
  unapproveProperty: (id: string) => Promise<void>;
  markAsFeatured: (id: string) => Promise<void>;
  unmarkAsFeatured: (id: string) => Promise<void>;
  updatePropertyStatus: (id: string, status: PropertyStatus) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useProperty(propertyId?: string): UsePropertyReturn {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(!!propertyId);
  const [error, setError] = useState<Error | null>(null);

  const fetchProperty = useCallback(async () => {
    if (!propertyId) {
      setProperty(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await propertyService.getPropertyById(propertyId);
      setProperty(data);
    } catch (err) {
      setError(err as Error);
      setProperty(null);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

  const handleUpdateProperty = useCallback(
    async (id: string, data: UpdatePropertyInput) => {
      setLoading(true);
      setError(null);

      try {
        const updated = await propertyService.updateProperty(id, data);
        setProperty(updated);
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleCreateProperty = useCallback(
    async (data: CreatePropertyInput) => {
      setLoading(true);
      setError(null);

      try {
        const created = await propertyService.createProperty(data);
        setProperty(created);
        return created;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleArchiveProperty = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await propertyService.archiveProperty(id);
      if (propertyId === id) {
        setProperty(null);
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  const handleRestoreProperty = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await propertyService.restoreProperty(id);
      if (propertyId === id) {
        await fetchProperty();
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [propertyId, fetchProperty]);

  const handleApproveProperty = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const updated = await propertyService.approveProperty(id);
      if (propertyId === id) {
        setProperty(updated);
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  const handleUnapproveProperty = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const updated = await propertyService.unapproveProperty(id);
      if (propertyId === id) {
        setProperty(updated);
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  const handleMarkAsFeatured = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const updated = await propertyService.markAsFeatured(id);
      if (propertyId === id) {
        setProperty(updated);
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  const handleUnmarkAsFeatured = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const updated = await propertyService.unmarkAsFeatured(id);
      if (propertyId === id) {
        setProperty(updated);
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  const handleUpdatePropertyStatus = useCallback(
    async (id: string, status: PropertyStatus) => {
      setLoading(true);
      setError(null);

      try {
        const updated = await propertyService.updatePropertyStatus(id, status);
        if (propertyId === id) {
          setProperty(updated);
        }
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [propertyId]
  );

  return {
    property,
    loading,
    error,
    updateProperty: handleUpdateProperty,
    createProperty: handleCreateProperty,
    archiveProperty: handleArchiveProperty,
    restoreProperty: handleRestoreProperty,
    approveProperty: handleApproveProperty,
    unapproveProperty: handleUnapproveProperty,
    markAsFeatured: handleMarkAsFeatured,
    unmarkAsFeatured: handleUnmarkAsFeatured,
    updatePropertyStatus: handleUpdatePropertyStatus,
    refetch: fetchProperty,
  };
}
