/**
 * useCustomers Hook
 *
 * Provides customer list functionality with search, filters, and pagination.
 * Consumes ICustomerService, not repository directly.
 */

import { useState, useCallback, useEffect } from 'react';
import { customerService } from '../services/customerService';
import type {
  Customer,
  CustomerFilters,
  CustomerListResult,
} from '../domain/customer/CustomerTypes';

interface UseCustomersReturn {
  customers: Customer[];
  loading: boolean;
  error: Error | null;
  total: number;
  page: number;
  pageSize: number;
  filters: CustomerFilters;
  searchQuery: string;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setFilters: (filters: CustomerFilters) => void;
  setSearchQuery: (query: string) => void;
  refetch: () => Promise<void>;
  exportCustomers: () => Promise<Blob>;
}

export function useCustomers(initialPageSize = 12): UseCustomersReturn {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [filters, setFilters] = useState<CustomerFilters>({
    customerType: 'all',
    lifecycleStatus: 'all',
  });
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let result: CustomerListResult;

      if (searchQuery) {
        result = await customerService.searchCustomers(
          searchQuery,
          page,
          pageSize
        );
      } else {
        result = await customerService.getCustomers(filters, page, pageSize);
      }

      setCustomers(result.items);
      setTotal(result.total);
    } catch (err) {
      setError(err as Error);
      setCustomers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters, searchQuery]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSetPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleSetPageSize = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  }, []);

  const handleSetFilters = useCallback((newFilters: CustomerFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when changing filters
  }, []);

  const handleSetSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1); // Reset to first page when searching
  }, []);

  const handleExportCustomers = useCallback(async () => {
    try {
      return await customerService.exportCustomers(filters);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [filters]);

  return {
    customers,
    loading,
    error,
    total,
    page,
    pageSize,
    filters,
    searchQuery,
    setPage: handleSetPage,
    setPageSize: handleSetPageSize,
    setFilters: handleSetFilters,
    setSearchQuery: handleSetSearchQuery,
    refetch: fetchCustomers,
    exportCustomers: handleExportCustomers,
  };
}
