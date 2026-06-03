/**
 * PropertyMetricsCard
 *
 * Displays property metrics in a card format.
 * Uses PropertyMetricsViewModel.
 * Shows: Views, Bookings, Revenue, Wishlist Count, Conversion Rate.
 */

import { Eye, Calendar, DollarSign, Heart, TrendingUp } from 'lucide-react';
import type { PropertyMetricsViewModel } from '../../../view-models/property/PropertyMetricsViewModel';

interface PropertyMetricsCardProps {
  viewModel: PropertyMetricsViewModel;
}

export function PropertyMetricsCard({ viewModel }: PropertyMetricsCardProps) {
  const {
    totalViews,
    wishlistCount,
    conversionRateDisplay,
    bookingCount,
    occupancyRateDisplay,
    monthlyRevenueDisplay,
    totalRevenueDisplay,
    averageRating,
    reviewCount,
    availabilityRateDisplay,
    hasRecentBooking,
  } = viewModel;

  const metrics = [
    {
      label: 'Total Views',
      value: totalViews.toLocaleString(),
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Wishlist Count',
      value: wishlistCount.toLocaleString(),
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      label: 'Conversion Rate',
      value: conversionRateDisplay,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Bookings',
      value: bookingCount.toLocaleString(),
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Occupancy Rate',
      value: occupancyRateDisplay,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      label: 'Monthly Revenue',
      value: monthlyRevenueDisplay,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      label: 'Total Revenue',
      value: totalRevenueDisplay,
      icon: DollarSign,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
    {
      label: 'Availability Rate',
      value: availabilityRateDisplay,
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Property Metrics</h3>
        {hasRecentBooking && (
          <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
            Recent Activity
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className={`${metric.bgColor} rounded-lg p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-5 h-5 ${metric.color}`} />
                <span className="text-sm text-gray-600">{metric.label}</span>
              </div>
              <div className={`text-xl font-bold ${metric.color}`}>{metric.value}</div>
            </div>
          );
        })}
      </div>

      {/* Rating Summary */}
      {reviewCount > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Average Rating</div>
              <div className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">Total Reviews</div>
              <div className="text-2xl font-bold text-gray-900">{reviewCount}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
