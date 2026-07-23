/**
 * Customer Detail Page
 *
 * Displays detailed customer information including profile, metrics, and history.
 * Uses Customer Capability hooks and view models.
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomer } from '../hooks/useCustomer';
import { useCustomerMetrics } from '../hooks/useCustomerMetrics';
import { useCustomerHistory } from '../hooks/useCustomerHistory';
import { CustomerCardViewModelMapper } from '../view-models/CustomerCardViewModel';
import { CustomerMetricsViewModelMapper } from '../view-models/CustomerMetricsViewModel';
import { CustomerHistoryViewModelMapper } from '../view-models/CustomerHistoryViewModel';
import { LifecycleStatus } from '../domain/customer/CustomerTypes';

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');

  const { customer, loading, error, suspendCustomer, restoreCustomer, deleteCustomer } = useCustomer(id);
  const { metrics } = useCustomerMetrics(id);
  const { history } = useCustomerHistory(id);

  const customerViewModel = customer ? CustomerCardViewModelMapper.toViewModel(customer) : null;
  const metricsViewModel = metrics ? CustomerMetricsViewModelMapper.toViewModel(metrics) : null;
  const historyViewModel = history ? CustomerHistoryViewModelMapper.toViewModel(history) : null;

  const handleSuspend = async () => {
    if (!id) return;
    try {
      await suspendCustomer(id);
    } catch (err) {
      console.error('Failed to suspend customer:', err);
    }
  };

  const handleRestore = async () => {
    if (!id) return;
    try {
      await restoreCustomer(id);
    } catch (err) {
      console.error('Failed to restore customer:', err);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteCustomer(id);
      navigate('/customers');
    } catch (err) {
      console.error('Failed to delete customer:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading customer details...</div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error?.message || 'Customer not found'}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate('/customers')} className="text-gray-500 hover:text-gray-700 mb-4">
          ← Back to Customers
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {customerViewModel?.avatar ? (
              <img src={customerViewModel.avatar} alt={customerViewModel.displayName} className="h-16 w-16 rounded-full" />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 font-medium text-2xl">
                  {customerViewModel?.displayName.charAt(0)}
                </span>
              </div>
            )}
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">{customerViewModel?.displayName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {customerViewModel?.customerTypeLabel}
                </span>
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    customerViewModel?.isActive
                      ? 'bg-green-100 text-green-800'
                      : customerViewModel?.lifecycleStatus === 'suspended'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {customerViewModel?.lifecycleStatusLabel}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {customerViewModel?.lifecycleStatus === LifecycleStatus.ACTIVE && (
              <button
                onClick={handleSuspend}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Suspend
              </button>
            )}
            {customerViewModel?.lifecycleStatus === LifecycleStatus.SUSPENDED && (
              <button
                onClick={handleRestore}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Restore
              </button>
            )}
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`${
              activeTab === 'overview'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`${
              activeTab === 'history'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            History
          </button>
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Phone</div>
                <div className="text-sm font-medium text-gray-900">{customerViewModel?.phone || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Current Property</div>
                <div className="text-sm font-medium text-gray-900">{customerViewModel?.currentProperty || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Total Bookings</div>
                <div className="text-sm font-medium text-gray-900">{customerViewModel?.totalBookings}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Total Rent Paid</div>
                <div className="text-sm font-medium text-gray-900">${customerViewModel?.totalRentPaid.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Created</div>
                <div className="text-sm font-medium text-gray-900">{customerViewModel?.createdAt}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Last Activity</div>
                <div className="text-sm font-medium text-gray-900">{customerViewModel?.lastActivity || '-'}</div>
              </div>
            </div>
          </div>

          {/* Metrics */}
          {metricsViewModel && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Total Bookings</div>
                  <div className="text-2xl font-bold text-gray-900">{metricsViewModel.totalBookings}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Active Contracts</div>
                  <div className="text-2xl font-bold text-gray-900">{metricsViewModel.activeContracts}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Total Paid</div>
                  <div className="text-2xl font-bold text-green-600">{metricsViewModel.totalPaid}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Outstanding Balance</div>
                  <div className={`text-2xl font-bold ${metricsViewModel.hasOutstandingBalance ? 'text-red-600' : 'text-gray-900'}`}>
                    {metricsViewModel.outstandingBalance}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Last Payment</div>
                  <div className="text-2xl font-bold text-gray-900">{metricsViewModel.lastPaymentAmount || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Last Payment Date</div>
                  <div className="text-2xl font-bold text-gray-900">{metricsViewModel.lastPaymentDate || '-'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          {customerViewModel?.tags && customerViewModel.tags.length > 0 && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {customerViewModel.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {customer.notes && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
              <p className="text-gray-700">{customer.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && historyViewModel && (
        <div className="space-y-6">
          {/* Bookings */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bookings ({historyViewModel.totalBookings})</h2>
            {historyViewModel.bookings.length > 0 ? (
              <div className="space-y-3">
                {historyViewModel.bookings.map((booking) => (
                  <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{booking.propertyName}</div>
                        <div className="text-sm text-gray-500">{booking.propertyUnit}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{booking.totalAmount}</div>
                        <div className="text-sm text-gray-500">{booking.startDate} - {booking.endDate}</div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          booking.isActive
                            ? 'bg-green-100 text-green-800'
                            : booking.isUpcoming
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-sm">No bookings found</div>
            )}
          </div>

          {/* Payments */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payments ({historyViewModel.totalPayments})</h2>
            {historyViewModel.payments.length > 0 ? (
              <div className="space-y-3">
                {historyViewModel.payments.map((payment) => (
                  <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{payment.method}</div>
                        <div className="text-sm text-gray-500">{payment.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{payment.amount}</div>
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            payment.isRecent ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-sm">No payments found</div>
            )}
          </div>

          {/* Contracts */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contracts ({historyViewModel.totalContracts})</h2>
            {historyViewModel.contracts.length > 0 ? (
              <div className="space-y-3">
                {historyViewModel.contracts.map((contract) => (
                  <div key={contract.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{contract.propertyName}</div>
                        <div className="text-sm text-gray-500">{contract.propertyUnit}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{contract.monthlyRent}/month</div>
                        <div className="text-sm text-gray-500">{contract.startDate} - {contract.endDate || 'Ongoing'}</div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          contract.isActive
                            ? 'bg-green-100 text-green-800'
                            : contract.isExpiringSoon
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {contract.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-sm">No contracts found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
