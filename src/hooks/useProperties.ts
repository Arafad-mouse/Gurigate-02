"use client";

import { useState, useCallback, useEffect } from "react";
import { propertyService } from "../../frontend/src/services/propertyService";
import type { Property } from "../../frontend/src/domain/property/PropertyTypes";
import type { PropertyCardViewModel } from "../../frontend/src/view-models/property/PropertyCardViewModel";
import { PropertyCardViewModelMapper } from "../../frontend/src/view-models/property/PropertyCardViewModel";
import type { PropertyFilters } from "../../frontend/src/domain/property/PropertyTypes";

export interface UsePropertiesOptions {
  ownerId?: string;
  status?: string;
  type?: string;
  badge?: string;
  isFeatured?: boolean;
  isApproved?: boolean;
  page?: number;
  pageSize?: number;
}

export interface UsePropertiesReturn {
  // Data
  properties: PropertyCardViewModel[];
  total: number;
  
  // Loading states
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching and filtering properties
 * 
 * Uses propertyService to fetch from Supabase
 * 
 * @example
 * ```tsx
 * const { properties, isLoading, refetch } = useProperties({
 *   isApproved: true,
 *   page: 1,
 *   pageSize: 20
 * });
 * ```
 */
export function useProperties(options: UsePropertiesOptions = {}): UsePropertiesReturn {
  const { ownerId, status, type, badge, isFeatured, isApproved, page = 1, pageSize = 20 } = options;
  
  const [properties, setProperties] = useState<PropertyCardViewModel[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProperties = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const filters: PropertyFilters = {
        ownerId,
        status,
        type,
        badge,
        isFeatured,
        isApproved,
      };

      const result = await propertyService.getProperties(filters, page, pageSize);
      
      // Convert Property entities to PropertyCardViewModels
      const viewModels = PropertyCardViewModelMapper.toViewModelList(result.items);
      
      setProperties(viewModels);
      setTotal(result.total);
    } catch (err) {
      setError(err as Error);
      setProperties([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [ownerId, status, type, badge, isFeatured, isApproved, page, pageSize]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return {
    properties,
    total,
    isLoading,
    error,
    refetch: fetchProperties,
  };
}

/**
 * Hook for fetching a single property by ID
 * 
 * @example
 * ```tsx
 * const { property, isLoading } = useProperty("123");
 * ```
 */
export function useProperty(id: string | number) {
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(!!id);
  const [error, setError] = useState<Error | null>(null);

  const fetchProperty = useCallback(async () => {
    if (!id) {
      setProperty(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await propertyService.getPropertyById(String(id));
      setProperty(data);
    } catch (err) {
      setError(err as Error);
      setProperty(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

  return {
    property,
    isLoading,
    error,
    refetch: fetchProperty,
  };
}
