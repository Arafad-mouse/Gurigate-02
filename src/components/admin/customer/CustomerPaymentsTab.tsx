import type { PaymentSummary } from '@/types/customer';

interface CustomerPaymentsTabProps {
  loading: boolean;
  error?: string;
  items: PaymentSummary[];
  lastPayment?: PaymentSummary;
}

export function CustomerPaymentsTab({ loading, error, items, lastPayment }: CustomerPaymentsTabProps) {
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
    return <div className="text-sm text-gray-500">No payments found</div>;
  }

  return (
    <div className="space-y-3">
      {lastPayment && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="text-xs font-medium text-green-700 mb-1">Last Payment</div>
          <div className="text-sm font-semibold text-green-900">${(lastPayment.amountCents / 100).toFixed(2)}</div>
          <div className="text-xs text-green-700">
            {new Date(lastPayment.date).toLocaleDateString()} • {lastPayment.method}
          </div>
        </div>
      )}
      {items.map((payment) => (
        <div key={payment.id} className="border border-gray-200 rounded-lg p-3">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="text-sm font-medium text-gray-900">${(payment.amountCents / 100).toFixed(2)}</div>
              <div className="text-xs text-gray-500">{new Date(payment.date).toLocaleDateString()}</div>
            </div>
            <div className="flex gap-2">
              {payment.method && (
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                  {payment.method}
                </span>
              )}
              {payment.type && (
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded capitalize">
                  {payment.type}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
