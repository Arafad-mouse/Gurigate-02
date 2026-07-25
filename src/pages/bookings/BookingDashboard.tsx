import { useEffect, useState } from 'react';
import { Calendar, Users, DollarSign, TrendingUp, CheckCircle, Clock, XCircle } from 'lucide-react';

interface DashboardMetrics {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  occupancyRate: number;
}

export default function BookingDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch dashboard metrics from API
    setMetrics({
      totalBookings: 156,
      confirmedBookings: 120,
      pendingBookings: 24,
      cancelledBookings: 12,
      totalRevenue: 45600,
      averageBookingValue: 292,
      occupancyRate: 78
    });
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BA0036]" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Bookings',
      value: metrics?.totalBookings || 0,
      icon: Calendar,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Confirmed',
      value: metrics?.confirmedBookings || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Pending',
      value: metrics?.pendingBookings || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      change: '-3%'
    },
    {
      title: 'Revenue',
      value: `$${metrics?.totalRevenue || 0}`,
      icon: DollarSign,
      color: 'bg-purple-500',
      change: '+15%'
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your booking operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-sm text-green-600 mt-1">{stat.change}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Occupancy Rate</span>
              <span className="font-semibold text-gray-900">{metrics?.occupancyRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#BA0036] h-2 rounded-full" 
                style={{ width: `${metrics?.occupancyRate}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Booking Value</span>
              <span className="font-semibold text-gray-900">${metrics?.averageBookingValue}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cancellation Rate</span>
              <span className="font-semibold text-gray-900">
                {((metrics?.cancelledBookings || 0) / (metrics?.totalBookings || 1) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New booking confirmed</p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Pending booking request</p>
                <p className="text-xs text-gray-500">15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <XCircle className="h-5 w-5 text-red-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Booking cancelled</p>
                <p className="text-xs text-gray-500">1 hour ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
