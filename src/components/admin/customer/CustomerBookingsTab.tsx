import type { BookingSummary } from '@/types/customer';

interface CustomerBookingsTabProps {
  loading: boolean;
  error?: string;
  items: BookingSummary[];
}

export function CustomerBookingsTab({ loading, error, items }: CustomerBookingsTabProps) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-sm text-red-600">{error}</div>;
  }

  if (items.length === 0) {
    return <div className="text-sm text-gray-500">No bookings found</div>;
  }

  return (
    <div className="space-y-3">
      {items.map((booking) => (
        <div key={booking.id} className="border border-gray-200 rounded-lg p-3">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="text-sm font-medium text-gray-900">{booking.property}</div>
              <div className="text-xs text-gray-500">
                {new Date(booking.from).toLocaleDateString()} – {new Date(booking.to).toLocaleDateString()}
              </div>
            </div>
            <span className={`text-xs px-2 py-1 rounded ${
              booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
              booking.status === 'completed' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {booking.status}
            </span>
          </div>
          <div className="text-sm font-semibold text-gray-900">
            ${(booking.totalCents / 100).toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
}
