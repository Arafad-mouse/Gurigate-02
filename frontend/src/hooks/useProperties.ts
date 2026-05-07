"use client";

import { useState, useCallback, useMemo } from "react";
import type { LandingProperty } from "@/data/landingProperties";

// Mock data for immediate loading
const MOCK_FEATURED: LandingProperty[] = [
  {
    id: 1,
    title: "Modern Apartment in Hargeisa",
    address: "Burj Omar, Hargeisa",
    price: "$450,000",
    priceUnit: "total",
    beds: 3,
    baths: 2,
    sqft: 1200,
    badge: "FOR SALE",
    featured: true,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    rating: 4.8,
    location: "Hargeisa",
    type: "Apartment",
    city: "Hargeisa",
    reviews: 124,
  },
  {
    id: 2,
    title: "Luxury Villa in Nairobi",
    address: "Karen, Nairobi",
    price: "$1,200,000",
    priceUnit: "total",
    beds: 5,
    baths: 4,
    sqft: 3500,
    badge: "FOR SALE",
    featured: true,
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800",
    rating: 4.9,
    location: "Nairobi",
    type: "Villa",
    city: "Nairobi",
    reviews: 89,
  },
];

const MOCK_NAIROBI: LandingProperty[] = [
  {
    id: 3,
    title: "City Center Apartment",
    address: "Westlands, Nairobi",
    price: "$280,000",
    priceUnit: "total",
    beds: 2,
    baths: 2,
    sqft: 900,
    badge: "FOR SALE",
    image: "https://images.unsplash.com/photo-1564013799919-ab626c796d57?w=800",
    rating: 4.6,
    location: "Nairobi",
    type: "Apartment",
    city: "Nairobi",
    reviews: 67,
  },
];

const MOCK_HARGEISA: LandingProperty[] = [
  {
    id: 4,
    title: "Family Home",
    address: "Burao District, Hargeisa",
    price: "$180,000",
    priceUnit: "total",
    beds: 4,
    baths: 3,
    sqft: 2000,
    badge: "FOR SALE",
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800",
    rating: 4.7,
    location: "Hargeisa",
    type: "House",
    city: "Hargeisa",
    reviews: 45,
  },
];

const MOCK_ALL: LandingProperty[] = [...MOCK_FEATURED, ...MOCK_NAIROBI, ...MOCK_HARGEISA];

export interface UsePropertiesOptions {
  city?: string;
  badge?: LandingProperty["badge"];
  minPrice?: number;
  maxPrice?: number;
  searchQuery?: string;
  featured?: boolean;
}

export interface UsePropertiesReturn {
  // Data
  featured: LandingProperty[];
  nairobi: LandingProperty[];
  hargeisa: LandingProperty[];
  all: LandingProperty[];
  filtered: LandingProperty[];
  
  // Loading states (for future Supabase integration)
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  refetch: () => void;
  search: (query: string) => void;
  filterByType: (badge: LandingProperty["badge"] | null) => void;
  filterByLocation: (city: string | null) => void;
}

/**
 * Hook for fetching and filtering properties
 * 
 * Currently uses mock data from landingProperties.ts
 * When migrating to Supabase, only the internal fetch logic changes -
 * the hook interface remains identical.
 * 
 * @example
 * ```tsx
 * const { featured, nairobi, filtered, isLoading } = useProperties({
 *   city: "Nairobi",
 *   badge: "FOR SALE"
 * });
 * ```
 */
export function useProperties(options: UsePropertiesOptions = {}): UsePropertiesReturn {
  const { city, badge, minPrice, maxPrice, searchQuery, featured: featuredOnly } = options;
  
  // Loading states - currently instant since we use mock data
  // These will be used when we switch to Supabase
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState<Error | null>(null);
  
  // Local filter states for interactive filtering
  const [activeSearch, setActiveSearch] = useState(searchQuery || "");
  const [activeBadge, setActiveBadge] = useState<LandingProperty["badge"] | null>(badge || null);
  const [activeCity, setActiveCity] = useState<string | null>(city || null);
  
  // Simulate loading for future Supabase integration
  // Remove unused loading state logic
  // useEffect(() => {
  //   setIsLoading(false);
  //   setError(null);
  // }, [city, badge, minPrice, maxPrice, searchQuery]);
  
  // Base property collections - using mock data for immediate loading
  const featured = useMemo(() => MOCK_FEATURED, []);
  const nairobi = useMemo(() => MOCK_NAIROBI, []);
  const hargeisa = useMemo(() => MOCK_HARGEISA, []);
  const all = useMemo(() => MOCK_ALL, []);
  
  // Computed filtered results
  const filtered = useMemo(() => {
    let results = [...all];
    
    // Filter by featured flag
    if (featuredOnly) {
      results = results.filter((p) => p.featured);
    }
    
    // Filter by badge/type
    if (activeBadge) {
      results = results.filter((p) => p.badge === activeBadge);
    }
    
    // Filter by city
    if (activeCity) {
      results = results.filter((p) => p.city === activeCity);
    }
    
    // Filter by price range
    if (minPrice !== undefined && maxPrice !== undefined) {
      results = results.filter((p) => {
        const price = parseInt(p.price.replace(/[^0-9]/g, ''));
        return price >= minPrice && price <= maxPrice;
      });
    }
    
    // Search query
    if (activeSearch.trim()) {
      results = results.filter((p) => 
        p.title.toLowerCase().includes(activeSearch.toLowerCase()) ||
        p.address.toLowerCase().includes(activeSearch.toLowerCase())
      );
    }
    
    return results;
  }, [all, activeBadge, activeCity, minPrice, maxPrice, activeSearch, featuredOnly]);
  
  // Actions
  // Remove unused refetch logic
  // const refetch = useCallback(() => {
  //   setIsLoading(true);
  //   setTimeout(() => setIsLoading(false), 300);
  // }, []);
  
  const search = useCallback((query: string) => {
    setActiveSearch(query);
  }, []);
  
  const filterByType = useCallback((type: LandingProperty["badge"] | null) => {
    setActiveBadge(type);
  }, []);
  
  const filterByLocation = useCallback((location: string | null) => {
    setActiveCity(location);
  }, []);
  
  return {
    featured,
    nairobi,
    hargeisa,
    all,
    filtered,
    isLoading: false,
    error: null,
    refetch: () => {},
    search,
    filterByType,
    filterByLocation,
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
  const property = useMemo(() => {
    return MOCK_ALL.find((p: any) => p.id === Number(id)) || null;
  }, [id]);
  
  return {
    property,
    isLoading: false,
    error: null,
  };
}
