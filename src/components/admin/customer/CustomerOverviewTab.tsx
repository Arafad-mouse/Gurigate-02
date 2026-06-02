import type { Customer, CustomerMetrics } from '@/types/customer';

interface CustomerOverviewTabProps {
  customer: Customer;
  metrics: CustomerMetrics;
}

export function CustomerOverviewTab({ customer, metrics }: CustomerOverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Email</span>
            <span className="text-gray-900">{customer.email || '—'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Phone</span>
            <span className="text-gray-900">{customer.phone || '—'}</span>
          </div>
        </div>
      </div>

      {/* Account Summary */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Account Summary</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Total Bookings</div>
            <div className="text-lg font-bold text-gray-900">{metrics.totalBookings}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Total Rent Paid</div>
            <div className="text-lg font-bold text-gray-900">${(metrics.totalRentPaid / 100).toFixed(2)}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Outstanding Balance</div>
            <div className="text-lg font-bold text-gray-900">${(metrics.outstandingBalance / 100).toFixed(2)}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Customer Since</div>
            <div className="text-sm font-semibold text-gray-900">{new Date(customer.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      {/* Current Property */}
      {metrics.currentProperty && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Current Property</h4>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm font-medium text-gray-900">{metrics.currentProperty.name}</div>
            {metrics.currentProperty.unit && (
              <div className="text-xs text-gray-500">Unit {metrics.currentProperty.unit}</div>
            )}
          </div>
        </div>
      )}

      {/* Active Contract */}
      {metrics.activeContract && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Active Contract</h4>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm font-medium text-gray-900">{metrics.activeContract.property}</div>
            <div className="text-xs text-gray-500 mt-1">
              Started: {new Date(metrics.activeContract.startDate).toLocaleDateString()}
            </div>
            {metrics.activeContract.rentCents && (
              <div className="text-xs text-gray-500 mt-1">
                Rent: ${(metrics.activeContract.rentCents / 100).toFixed(2)}/month
              </div>
            )}
          </div>
        </div>
      )}

      {/* Last Payment */}
      {metrics.lastPayment && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Last Payment</h4>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm font-medium text-gray-900">${(metrics.lastPayment.amountCents / 100).toFixed(2)}</div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(metrics.lastPayment.date).toLocaleDateString()} • {metrics.lastPayment.method}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
