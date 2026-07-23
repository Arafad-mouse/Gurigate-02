import React, { useEffect, useState } from 'react';
import type { CustomerDrawerState, Customer } from '@/types/customer';
import { getCustomer } from '@/services/customerService';

export interface CustomerProfileDrawerProps {
  state: CustomerDrawerState;
  onClose: () => void;
  // Quick action placeholders
  onAssignProperty?: (id: string) => void;
  onCreateContract?: (id: string) => void;
  onSuspend?: (id: string) => void;
}

export const CustomerProfileDrawer: React.FC<CustomerProfileDrawerProps> = ({ state, onClose, onAssignProperty, onCreateContract, onSuspend }) => {
  const { isOpen, customerId } = state;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [customer, setCustomer] = useState<Customer | undefined>();

  // Load customer data when drawer opens
  useEffect(() => {
    if (!isOpen || !customerId) return;
    setLoading(true);
    setError(undefined);
    getCustomer(customerId)
      .then(setCustomer)
      .catch(() => setError('Failed to load customer details.'))
      .finally(() => setLoading(false));
  }, [isOpen, customerId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full sm:w-[460px] bg-white border-l border-gray-200 shadow-xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/95 backdrop-blur px-4 py-3 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 text-sm font-semibold">
            {customer?.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'C'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-gray-900 truncate">{customer?.fullName || 'Customer'}</h3>
              {customer?.customerType && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  {customer.customerType.charAt(0).toUpperCase() + customer.customerType.slice(1)}
                </span>
              )}
              {customer?.lifecycleStatus && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                  {customer.lifecycleStatus.charAt(0).toUpperCase() + customer.lifecycleStatus.slice(1)}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 truncate">{customer?.email || 'No email'}</div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
            </div>
          ) : error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : customer ? (
            <div className="space-y-4">
              {/* Customer Information */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Customer Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phone</span>
                    <span className="text-gray-900">{customer.phone || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">National ID</span>
                    <span className="text-gray-900">{customer.nationalId || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Customer Type</span>
                    <span className="text-gray-900">{customer.customerType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className="text-gray-900">{customer.lifecycleStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Current Property</span>
                    <span className="text-gray-900">{customer.currentProperty || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Activity</span>
                    <span className="text-gray-900">{new Date(customer.lastActivityAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created</span>
                    <span className="text-gray-900">{new Date(customer.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {customer.notes && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Notes</h4>
                  <p className="text-sm text-gray-600">{customer.notes}</p>
                </div>
              )}

              {/* Quick Actions */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => customerId && onAssignProperty?.(customerId)}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Assign Property
                  </button>
                  <button
                    onClick={() => customerId && onCreateContract?.(customerId)}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Create Contract
                  </button>
                  <button
                    onClick={() => customerId && onSuspend?.(customerId)}
                    className="px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Suspend Customer
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
