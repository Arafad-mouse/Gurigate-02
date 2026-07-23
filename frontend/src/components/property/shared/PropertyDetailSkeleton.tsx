/**
 * PropertyDetailSkeleton
 *
 * Skeleton loading state for PropertyDetail page.
 * Improves perceived performance during data loading.
 */

export function PropertyDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Gallery Skeleton */}
      <div className="w-full h-96 bg-gray-200 rounded-lg animate-pulse" />

      {/* Overview Skeleton */}
      <div className="space-y-4">
        <div className="w-3/4 h-8 bg-gray-200 rounded animate-pulse" />
        <div className="w-1/2 h-5 bg-gray-200 rounded animate-pulse" />
        <div className="w-1/3 h-6 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Features Skeleton */}
      <div className="space-y-3">
        <div className="w-1/4 h-6 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Description Skeleton */}
      <div className="space-y-3">
        <div className="w-1/4 h-6 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-2">
          <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
          <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
          <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Reviews Skeleton */}
      <div className="space-y-3">
        <div className="w-1/4 h-6 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-4 space-y-2">
              <div className="w-1/3 h-5 bg-gray-200 rounded animate-pulse" />
              <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-2/3 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
