/**
 * usePropertyReviews Hook
 *
 * Provides property review operations: fetch, add.
 * Consumes IPropertyService, not repository directly.
 */

import { useState, useCallback, useEffect } from 'react';
import { propertyService } from '../services/propertyService';
import type {
  PropertyReview,
  CreateReviewInput,
} from '../domain/property/PropertyTypes';

interface UsePropertyReviewsReturn {
  reviews: PropertyReview[];
  loading: boolean;
  error: Error | null;
  total: number;
  page: number;
  pageSize: number;
  createReview: (input: CreateReviewInput) => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  refetch: () => Promise<void>;
}

export function usePropertyReviews(
  propertyId?: string,
  initialPageSize = 10
): UsePropertyReviewsReturn {
  const [reviews, setReviews] = useState<PropertyReview[]>([]);
  const [loading, setLoading] = useState(!!propertyId);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const fetchReviews = useCallback(async () => {
    if (!propertyId) {
      setReviews([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await propertyService.getPropertyReviews(
        propertyId,
        page,
        pageSize
      );
      setReviews(result.items);
      setTotal(result.total);
    } catch (err) {
      setError(err as Error);
      setReviews([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [propertyId, page, pageSize]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleCreateReview = useCallback(
    async (input: CreateReviewInput) => {
      setLoading(true);
      setError(null);

      try {
        await propertyService.createReview(input);
        if (propertyId) {
          await fetchReviews();
        }
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [propertyId, fetchReviews]
  );

  const handleSetPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleSetPageSize = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  }, []);

  return {
    reviews,
    loading,
    error,
    total,
    page,
    pageSize,
    createReview: handleCreateReview,
    setPage: handleSetPage,
    setPageSize: handleSetPageSize,
    refetch: fetchReviews,
  };
}
