/**
 * Customer List Page
 *
 * Displays customer list with search, filters, pagination, and export.
 * Uses Customer Capability hooks and view models.
 */

import { useState, useMemo, useEffect } from 'react';
import { useCustomers } from '../hooks/useCustomers';
import { customerService } from '../services/customerService';
import { CustomerCardViewModelMapper } from '../view-models/CustomerCardViewModel';
import type { CustomerType, LifecycleStatus } from '../domain/customer/CustomerTypes';

interface DashboardMetrics {
  totalCustomers: number;
  activeTenants: number;
  activeGuests: number;
  activeBuyers: number;
  monthlyRevenue: number;
  overdueAccounts: number;
}

export default function CustomerListPage() {
  const [search, setSearch] = useState('');
  const [customerTypeFilter, setCustomerTypeFilter] = useState<CustomerType | 'all'>('all');
  const [lifecycleStatusFilter, setLifecycleStatusFilter] = useState<LifecycleStatus | 'all'>('all');
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
  const pageSize = 10;

  const {
    customers,
    loading,
    error,
    total,
    page,
    setSearchQuery,
    setFilters,
    setPage,
    exportCustomers,
  } = useCustomers();

  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      try {
        const metrics = await customerService.getDashboardMetrics();
        setDashboardMetrics(metrics);
      } catch (err) {
        console.error('Failed to fetch dashboard metrics:', err);
      }
    };

    fetchDashboardMetrics();
  }, []);

  // Update search query when search input changes
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setSearchQuery(value);
  };

  // Update filters when filter selection changes
  const handleFilterChange = (customerType: CustomerType | 'all', lifecycleStatus: LifecycleStatus | 'all') => {
    setCustomerTypeFilter(customerType);
    setLifecycleStatusFilter(lifecycleStatus);
    setFilters({
      customerType: customerType === 'all' ? undefined : customerType,
      lifecycleStatus: lifecycleStatus === 'all' ? undefined : lifecycleStatus,
    });
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle export
  const handleExport = async () => {
    try {
      await exportCustomers();
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  // Map customers to view models
  const customerViewModels = useMemo(() => {
    return CustomerCardViewModelMapper.toViewModelList(customers);
  }, [customers]);

  // Calculate total pages
  const totalPages = Math.ceil(total / pageSize);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading customers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-500">Manage your customer relationships</p>
      </div>

      {/* Dashboard Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500">Total Customers</div>
          <div className="text-2xl font-bold text-gray-900">{dashboardMetrics?.totalCustomers || 0}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500">Active Tenants</div>
          <div className="text-2xl font-bold text-green-600">{dashboardMetrics?.activeTenants || 0}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500">Active Guests</div>
          <div className="text-2xl font-bold text-blue-600">{dashboardMetrics?.activeGuests || 0}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500">Overdue Accounts</div>
          <div className="text-2xl font-bold text-red-600">{dashboardMetrics?.overdueAccounts || 0}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <select
            value={customerTypeFilter}
            onChange={(e) => handleFilterChange(e.target.value as CustomerType | 'all', lifecycleStatusFilter)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Types</option>
            <option value="tenant">Tenant</option>
            <option value="renter">Renter</option>
            <option value="buyer">Buyer</option>
            <option value="guest">Guest</option>
          </select>
          <select
            value={lifecycleStatusFilter}
            onChange={(e) => handleFilterChange(customerTypeFilter, e.target.value as LifecycleStatus | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Statuses</option>
            <option value="lead">Lead</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Property
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bookings
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Paid
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {customerViewModels.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {customer.avatar ? (
                      <img
                        src={customer.avatar}
                        alt={customer.displayName}
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 font-medium">
                          {customer.displayName.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{customer.displayName}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {customer.phone || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {customer.customerTypeLabel}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      customer.isActive
                        ? 'bg-green-100 text-green-800'
                        : customer.lifecycleStatus === 'suspended'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {customer.lifecycleStatusLabel}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {customer.currentProperty || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {customer.totalBookings}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${customer.totalRentPaid.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {customer.createdAt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} customers
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
