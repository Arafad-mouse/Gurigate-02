/**
 * useProperties Hook
 *
 * Provides property list functionality with search, filters, and pagination.
 * Consumes IPropertyService, not repository directly.
 */

import { useState, useCallback, useEffect } from 'react';
import { propertyService } from '../services/propertyService';
import type {
  Property,
  PropertyFilters,
  PropertyListResult,
} from '../domain/property/PropertyTypes';

interface UsePropertiesReturn {
  properties: Property[];
  loading: boolean;
  error: Error | null;
  total: number;
  page: number;
  pageSize: number;
  filters: PropertyFilters;
  searchQuery: string;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setFilters: (filters: PropertyFilters) => void;
  setSearchQuery: (query: string) => void;
  refetch: () => Promise<void>;
}

export function useProperties(initialPageSize = 20): UsePropertiesReturn {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let result: PropertyListResult;

      if (searchQuery) {
        result = await propertyService.searchProperties(searchQuery, filters, page, pageSize);
      } else {
        result = await propertyService.getProperties(filters, page, pageSize);
      }

      setProperties(result.items);
      setTotal(result.total);
    } catch (err) {
      setError(err as Error);
      setProperties([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters, searchQuery]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleSetPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleSetPageSize = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  }, []);

  const handleSetFilters = useCallback((newFilters: PropertyFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when changing filters
  }, []);

  const handleSetSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1); // Reset to first page when searching
  }, []);

  return {
    properties,
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
    refetch: fetchProperties,
  };
}
