/**
 * useCustomer Hook
 *
 * Provides single customer operations: fetch, update, suspend, restore, delete.
 * Consumes ICustomerService, not repository directly.
 */

import { useState, useCallback, useEffect } from 'react';
import { customerService } from '../services/customerService';
import type {
  Customer,
  UpdateCustomerInput,
  CreateCustomerInput,
  CustomerType,
  LifecycleStatus,
} from '../domain/customer/CustomerTypes';

interface UseCustomerReturn {
  customer: Customer | null;
  loading: boolean;
  error: Error | null;
  updateCustomer: (id: string, data: UpdateCustomerInput) => Promise<void>;
  createCustomer: (data: CreateCustomerInput) => Promise<Customer>;
  suspendCustomer: (id: string) => Promise<void>;
  restoreCustomer: (id: string) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  updateLifecycleStatus: (id: string, status: LifecycleStatus) => Promise<void>;
  updateCustomerType: (id: string, type: CustomerType) => Promise<void>;
  addTag: (id: string, tag: string) => Promise<void>;
  removeTag: (id: string, tag: string) => Promise<void>;
  updateNotes: (id: string, notes: string) => Promise<void>;
  assignProperty: (id: string, propertyId: string) => Promise<void>;
  removePropertyAssignment: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useCustomer(customerId?: string): UseCustomerReturn {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(!!customerId);
  const [error, setError] = useState<Error | null>(null);

  const fetchCustomer = useCallback(async () => {
    if (!customerId) {
      setCustomer(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await customerService.getCustomerById(customerId);
      setCustomer(data);
    } catch (err) {
      setError(err as Error);
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  const handleUpdateCustomer = useCallback(
    async (id: string, data: UpdateCustomerInput) => {
      setLoading(true);
      setError(null);

      try {
        const updated = await customerService.updateCustomer(id, data);
        setCustomer(updated);
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleCreateCustomer = useCallback(
    async (data: CreateCustomerInput) => {
      setLoading(true);
      setError(null);

      try {
        const created = await customerService.createCustomer(data);
        setCustomer(created);
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

  const handleSuspendCustomer = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await customerService.suspendCustomer(id);
      if (customerId === id) {
        await fetchCustomer();
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [customerId, fetchCustomer]);

  const handleRestoreCustomer = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await customerService.restoreCustomer(id);
      if (customerId === id) {
        await fetchCustomer();
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [customerId, fetchCustomer]);

  const handleDeleteCustomer = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await customerService.deleteCustomer(id);
      if (customerId === id) {
        setCustomer(null);
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  const handleUpdateLifecycleStatus = useCallback(
    async (id: string, status: LifecycleStatus) => {
      setLoading(true);
      setError(null);

      try {
        await customerService.updateLifecycleStatus(id, status);
        if (customerId === id) {
          await fetchCustomer();
        }
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [customerId, fetchCustomer]
  );

  const handleUpdateCustomerType = useCallback(
    async (id: string, type: CustomerType) => {
      setLoading(true);
      setError(null);

      try {
        const updated = await customerService.updateCustomerType(id, type);
        if (customerId === id) {
          setCustomer(updated);
        }
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [customerId]
  );

  const handleAddTag = useCallback(async (id: string, tag: string) => {
    setLoading(true);
    setError(null);

    try {
      const updated = await customerService.addTag(id, tag);
      if (customerId === id) {
        setCustomer(updated);
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  const handleRemoveTag = useCallback(async (id: string, tag: string) => {
    setLoading(true);
    setError(null);

    try {
      const updated = await customerService.removeTag(id, tag);
      if (customerId === id) {
        setCustomer(updated);
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  const handleUpdateNotes = useCallback(async (id: string, notes: string) => {
    setLoading(true);
    setError(null);

    try {
      const updated = await customerService.updateNotes(id, notes);
      if (customerId === id) {
        setCustomer(updated);
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  const handleAssignProperty = useCallback(
    async (id: string, propertyId: string) => {
      setLoading(true);
      setError(null);

      try {
        const updated = await customerService.assignProperty(id, propertyId);
        if (customerId === id) {
          setCustomer(updated);
        }
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [customerId]
  );

  const handleRemovePropertyAssignment = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const updated = await customerService.removePropertyAssignment(id);
      if (customerId === id) {
        setCustomer(updated);
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  return {
    customer,
    loading,
    error,
    updateCustomer: handleUpdateCustomer,
    createCustomer: handleCreateCustomer,
    suspendCustomer: handleSuspendCustomer,
    restoreCustomer: handleRestoreCustomer,
    deleteCustomer: handleDeleteCustomer,
    updateLifecycleStatus: handleUpdateLifecycleStatus,
    updateCustomerType: handleUpdateCustomerType,
    addTag: handleAddTag,
    removeTag: handleRemoveTag,
    updateNotes: handleUpdateNotes,
    assignProperty: handleAssignProperty,
    removePropertyAssignment: handleRemovePropertyAssignment,
    refetch: fetchCustomer,
  };
}
