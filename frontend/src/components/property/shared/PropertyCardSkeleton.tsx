/**
 * PropertyCardSkeleton
 *
 * Skeleton loading state for PropertyCard.
 * Improves perceived performance during data loading.
 */

export function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Image Skeleton */}
      <div className="w-full h-48 bg-gray-200 animate-pulse" />

      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Badge Skeleton */}
        <div className="w-20 h-6 bg-gray-200 rounded animate-pulse" />

        {/* Title Skeleton */}
        <div className="w-3/4 h-5 bg-gray-200 rounded animate-pulse" />

        {/* Location Skeleton */}
        <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse" />

        {/* Price Skeleton */}
        <div className="w-1/3 h-6 bg-gray-200 rounded animate-pulse" />

        {/* Features Skeleton */}
        <div className="flex gap-4">
          <div className="w-12 h-4 bg-gray-200 rounded animate-pulse" />
          <div className="w-12 h-4 bg-gray-200 rounded animate-pulse" />
          <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Rating Skeleton */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
          <div className="w-8 h-4 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
