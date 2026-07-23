/**
 * useWishlist Hook
 *
 * Provides wishlist operations: fetch, add, remove.
 * Consumes IPropertyService, not repository directly.
 *
 */

import { useState, useCallback, useEffect } from 'react';
import { propertyService } from '../services/propertyService';
import { wishlistRepository } from '../repositories/property/wishlistRepository';
import type { Property } from '../domain/property/PropertyTypes';

interface UseWishlistReturn {
  wishlist: Property[];
  loading: boolean;
  error: Error | null;
  addToWishlist: (propertyId: string) => Promise<void>;
  removeFromWishlist: (propertyId: string) => Promise<void>;
  isInWishlist: (propertyId: string) => boolean;
  refetch: () => Promise<void>;
}

export function useWishlist(userId?: string): UseWishlistReturn {
  const [wishlist, setWishlist] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchWishlist = useCallback(async () => {
    if (!userId) {
      setWishlist([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const rows = await wishlistRepository.getUserWishlists(userId);
      const properties = await Promise.all(
        rows.map((row) => propertyService.getPropertyById(row.property_id))
      );
      setWishlist(properties);
    } catch (err) {
      setError(err as Error);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleAddToWishlist = useCallback(
    async (propertyId: string) => {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      await wishlistRepository.addToWishlist({
        user_id: userId,
        property_id: propertyId,
      });
      await fetchWishlist();
    },
    [fetchWishlist, userId]
  );

  const handleRemoveFromWishlist = useCallback(
    async (propertyId: string) => {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      await wishlistRepository.removeFromWishlist(userId, propertyId);
      setWishlist((current) => current.filter((property) => property.id !== propertyId));
    },
    [userId]
  );

  const handleIsInWishlist = useCallback(
    (propertyId: string) => {
      return wishlist.some((property) => property.id === propertyId);
    },
    [wishlist]
  );

  return {
    wishlist,
    loading,
    error,
    addToWishlist: handleAddToWishlist,
    removeFromWishlist: handleRemoveFromWishlist,
    isInWishlist: handleIsInWishlist,
    refetch: fetchWishlist,
  };
}
