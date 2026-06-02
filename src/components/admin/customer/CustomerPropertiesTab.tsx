import type { PropertySummary } from '@/types/customer';

interface CustomerPropertiesTabProps {
  loading: boolean;
  error?: string;
  items: PropertySummary[];
}

export function CustomerPropertiesTab({ loading, error, items }: CustomerPropertiesTabProps) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-sm text-red-600">{error}</div>;
  }

  if (items.length === 0) {
    return <div className="text-sm text-gray-500">No properties found</div>;
  }

  return (
    <div className="space-y-3">
      {items.map((property) => (
        <div key={property.id} className="border border-gray-200 rounded-lg p-3">
          <div className="text-sm font-medium text-gray-900">{property.name}</div>
          {property.unit && (
            <div className="text-xs text-gray-500">Unit {property.unit}</div>
          )}
          {property.address && (
            <div className="text-xs text-gray-500">{property.address}</div>
          )}
        </div>
      ))}
    </div>
  );
}
