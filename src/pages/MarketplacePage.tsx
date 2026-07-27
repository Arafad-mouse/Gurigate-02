/**
 * Marketplace Page
 *
 * Main property listing page with search and filters.
 * Uses PropertyGrid, PropertySearchBar, and PropertyFilters components.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// TODO: Restore these imports when frontend components are available
// import { PropertyGrid } from '../../frontend/src/components/property/layouts/PropertyGrid';
// import { PropertySearchBar } from '../../frontend/src/components/property/filters/PropertySearchBar';
// import { PropertyFilters } from '../../frontend/src/components/property/filters/PropertyFilters';
// import type { PropertyCardViewModel } from '../../frontend/src/view-models/property/PropertyCardViewModel';
// import { PropertyCardViewModelMapper } from '../../frontend/src/view-models/property/PropertyCardViewModel';
// import { useProperties } from '../../frontend/src/hooks/useProperties';
// import type { PropertyFilters as DomainPropertyFilters } from '../../frontend/src/domain/property/PropertyTypes';
// import { PropertyBadge, PropertyStatus, PropertyType } from '../../frontend/src/domain/property/PropertyTypes';

export function MarketplacePage() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Marketplace</h1>
      <p className="text-gray-600">Marketplace page is under construction</p>
    </div>
  );
}
