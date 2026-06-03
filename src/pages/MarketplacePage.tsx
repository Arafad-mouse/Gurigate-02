/**
 * Marketplace Page
 *
 * Main property listing page with search and filters.
 * Uses PropertyGrid, PropertySearchBar, and PropertyFilters components.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PropertyGrid } from '../../frontend/src/components/property/layouts/PropertyGrid';
import { PropertySearchBar } from '../../frontend/src/components/property/filters/PropertySearchBar';
import { PropertyFilters } from '../../frontend/src/components/property/filters/PropertyFilters';
import type { PropertyCardViewModel } from '../../frontend/src/view-models/property/PropertyCardViewModel';
import { PropertyCardViewModelMapper } from '../../frontend/src/view-models/property/PropertyCardViewModel';
import { useProperties } from '../../frontend/src/hooks/useProperties';
import type { PropertyFilters as DomainPropertyFilters } from '../../frontend/src/domain/property/PropertyTypes';
import { PropertyBadge, PropertyStatus, PropertyType } from '../../frontend/src/domain/property/PropertyTypes';

export function MarketplacePage() {
  const navigate = useNavigate();
  const {
    properties,
    loading,
    error,
    filters,
    setFilters,
    setSearchQuery,
  } = useProperties(24);

  const viewModels = useMemo(
    () => PropertyCardViewModelMapper.toViewModelList(properties),
    [properties]
  );

  const handleSearch = (
    query: string,
    searchFilters: {
      location?: string;
      propertyType?: string;
      minPrice?: number;
      maxPrice?: number;
      purpose?: 'sale' | 'rent' | 'short-stay';
    }
  ) => {
    setSearchQuery(query);
    setFilters({
      ...filters,
      city: searchFilters.location,
      type: searchFilters.propertyType ? (searchFilters.propertyType as PropertyType) : undefined,
      minPrice: searchFilters.minPrice,
      maxPrice: searchFilters.maxPrice,
      badge: mapPurposeToBadge(searchFilters.purpose),
      isApproved: true,
      status: PropertyStatus.AVAILABLE,
    });
  };

  const handleFiltersChange = (filterValues: {
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    propertyType?: string;
    listingType?: 'sale' | 'rent' | 'short-stay';
    availableOnly?: boolean;
  }) => {
    const nextFilters: DomainPropertyFilters = {
      ...filters,
      minPrice: filterValues.minPrice,
      maxPrice: filterValues.maxPrice,
      minBedrooms: filterValues.bedrooms,
      type: filterValues.propertyType ? (filterValues.propertyType as PropertyType) : undefined,
      badge: mapPurposeToBadge(filterValues.listingType),
      isApproved: true,
      status: filterValues.availableOnly ? PropertyStatus.AVAILABLE : filters.status,
    };

    setFilters(nextFilters);
  };

  const handlePropertyClick = (property: PropertyCardViewModel) => {
    navigate(`/property/${property.id}`);
  };

  const handleWishlistToggle = (property: PropertyCardViewModel) => {
    // Toggle wishlist
    console.log('Toggle wishlist:', property.id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#BA0036] to-[#8B0028] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Find Your Perfect Stay</h1>
          <p className="text-xl opacity-90">Discover properties across Somalia</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <PropertySearchBar onSearch={handleSearch} />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className="w-64 flex-shrink-0">
            <PropertyFilters onFiltersChange={handleFiltersChange} />
          </div>

          {/* Property Grid */}
          <div className="flex-1">
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error.message}
              </div>
            )}
            <PropertyGrid
              viewModels={viewModels}
              loading={loading}
              onPropertyClick={handlePropertyClick}
              onWishlistToggle={handleWishlistToggle}
              emptyStateVariant="search"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function mapPurposeToBadge(purpose?: 'sale' | 'rent' | 'short-stay') {
  switch (purpose) {
    case 'sale':
      return PropertyBadge.FOR_SALE;
    case 'rent':
      return PropertyBadge.FOR_RENT;
    case 'short-stay':
      return PropertyBadge.SHORT_STAY;
    default:
      return undefined;
  }
}
