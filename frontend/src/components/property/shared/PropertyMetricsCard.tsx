/**
 * PropertyMetricsCard
 *
 * Displays property performance metrics.
 * Used in property dashboards and admin panels.
 */

import { Eye, Heart, Calendar, DollarSign, Star, TrendingUp } from 'lucide-react';
import type { PropertyMetricsViewModel } from '../../../view-models/property/PropertyMetricsViewModel';

interface PropertyMetricsCardProps {
  metrics: PropertyMetricsViewModel;
}

export function PropertyMetricsCard({ metrics }: PropertyMetricsCardProps) {
  const metricItems = [
    {
      label: 'Total Views',
      value: metrics.totalViews.toLocaleString(),
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Wishlist Count',
      value: metrics.wishlistCount.toLocaleString(),
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      label: 'Conversion Rate',
      value: metrics.conversionRateDisplay,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Bookings',
      value: metrics.bookingCount.toLocaleString(),
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Occupancy Rate',
      value: metrics.occupancyRateDisplay,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      label: 'Monthly Revenue',
      value: metrics.monthlyRevenueDisplay,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      label: 'Total Revenue',
      value: metrics.totalRevenueDisplay,
      icon: DollarSign,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
    {
      label: 'Average Rating',
      value: `${metrics.averageRating.toFixed(1)} (${metrics.reviewCount})`,
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metricItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${item.bgColor}`}>
                <Icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-600">{item.label}</div>
                <div className="text-lg font-semibold text-gray-900">{item.value}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
