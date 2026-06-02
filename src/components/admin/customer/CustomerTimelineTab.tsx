import type { TimelineEvent } from '@/types/customer';

interface CustomerTimelineTabProps {
  loading: boolean;
  error?: string;
  items: TimelineEvent[];
}

export function CustomerTimelineTab({ loading, error, items }: CustomerTimelineTabProps) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-sm text-red-600">{error}</div>;
  }

  if (items.length === 0) {
    return <div className="text-sm text-gray-500">No timeline events found</div>;
  }

  return (
    <div className="space-y-3">
      {items.map((event) => (
        <div key={event.id} className="border border-gray-200 rounded-lg p-3">
          <div className="flex justify-between items-start mb-1">
            <div className="text-sm font-medium text-gray-900">{event.title}</div>
            <div className="text-xs text-gray-500">
              {new Date(event.timestamp).toLocaleDateString()}
            </div>
          </div>
          <div className="text-xs text-gray-500 capitalize">
            {event.type.replace(/_/g, ' ')}
          </div>
        </div>
      ))}
    </div>
  );
}
