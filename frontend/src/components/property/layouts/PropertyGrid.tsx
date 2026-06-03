/**
 * PropertyGrid
 *
 * Reusable layout wrapper for property cards.
 * Supports grid, list, and responsive breakpoints.
 * Includes loading state and empty state.
 */

import { PropertyCard } from '../cards/PropertyCard';
import { PropertyCardSkeleton } from '../shared/PropertyCardSkeleton';
import { PropertyEmptyState } from '../shared/PropertyEmptyState';
import type { PropertyCardViewModel } from '../../../view-models/property/PropertyCardViewModel';

type LayoutMode = 'grid' | 'list';

interface PropertyGridProps {
  viewModels: PropertyCardViewModel[];
  loading?: boolean;
  layoutMode?: LayoutMode;
  onPropertyClick?: (viewModel: PropertyCardViewModel) => void;
  onWishlistToggle?: (viewModel: PropertyCardViewModel) => void;
  showWishlistButton?: boolean;
  emptyStateVariant?: 'search' | 'list' | 'wishlist';
  emptyStateActionLabel?: string;
  onEmptyStateAction?: () => void;
}

export function PropertyGrid({
  viewModels,
  loading = false,
  layoutMode = 'grid',
  onPropertyClick,
  onWishlistToggle,
  showWishlistButton = true,
  emptyStateVariant = 'search',
  emptyStateActionLabel,
  onEmptyStateAction,
}: PropertyGridProps) {
  // Loading state
  if (loading) {
    return (
      <div className={getGridClassName(layoutMode)}>
        {[...Array(6)].map((_, i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Empty state
  if (viewModels.length === 0) {
    return (
      <PropertyEmptyState
        variant={emptyStateVariant}
        actionLabel={emptyStateActionLabel}
        onAction={onEmptyStateAction}
      />
    );
  }

  // Grid/List layout
  return (
    <div className={getGridClassName(layoutMode)}>
      {viewModels.map((viewModel) => (
        <PropertyCard
          key={viewModel.id}
          viewModel={viewModel}
          onClick={() => onPropertyClick?.(viewModel)}
          onWishlistToggle={() => onWishlistToggle?.(viewModel)}
          showWishlistButton={showWishlistButton}
        />
      ))}
    </div>
  );
}

function getGridClassName(layoutMode: LayoutMode): string {
  const baseClasses = 'w-full';
  
  if (layoutMode === 'grid') {
    return `${baseClasses} grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`;
  }
  
  // List mode
  return `${baseClasses} flex flex-col gap-4`;
}
