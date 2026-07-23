"use client";

import { useEffect, useState, useCallback } from 'react';
import { GuriGatePropertyService } from '@/services/guriGateProperties';
import type { LandingProperty } from '@/data/landingProperties';

export interface UseLandingPropertiesReturn {
  featured: LandingProperty[];
  nairobi: LandingProperty[];
  hargeisa: LandingProperty[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for the landing page to fetch featured and city-specific properties.
 * Uses GuriGatePropertyService so the landing page renders with the correct data source.
 */
export function useProperties(): UseLandingPropertiesReturn {
  const [featured, setFeatured] = useState<LandingProperty[]>([]);
  const [nairobi, setNairobi] = useState<LandingProperty[]>([]);
  const [hargeisa, setHargeisa] = useState<LandingProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProperties = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [featuredProperties, nairobiProperties, hargeisaProperties] = await Promise.all([
        GuriGatePropertyService.getFeaturedProperties(),
        GuriGatePropertyService.getPropertiesByCity('Nairobi'),
        GuriGatePropertyService.getPropertiesByCity('Hargeisa'),
      ]);

      setFeatured(featuredProperties);
      setNairobi(nairobiProperties);
      setHargeisa(hargeisaProperties);
    } catch (err) {
      setError(err as Error);
      setFeatured([]);
      setNairobi([]);
      setHargeisa([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return {
    featured,
    nairobi,
    hargeisa,
    isLoading,
    error,
    refetch: fetchProperties,
  };
}
