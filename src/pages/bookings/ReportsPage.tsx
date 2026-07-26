import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, MapPin, Home, CreditCard, RefreshCw, BarChart3 } from 'lucide-react';
import { BookingOperationsService } from '@/services/bookingOperationsService';

export default function ReportsPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof BookingOperationsService.getReportsData>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadReports();
  }, [dateRange]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const daysAgo = new Date(today);
      const days = dateRange === '7d' ? 7 : dateRange === '90d' ? 90 : 30;
      daysAgo.setDate(daysAgo.getDate() - days);
      const result = await BookingOperationsService.getReportsData({
        start: daysAgo.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0],
      });
      setData(result);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BA0036]" />
      </div>
    );
  }

  const maxRevenue = Math.max(...(data?.dailyRevenue.map(d => d.revenue) || [1]), 1);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Business insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | '90d')}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#BA0036]"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button
            onClick={() => { setRefreshing(true); loadReports(); }}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Revenue</div>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">${(data?.totalRevenue || 0).toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Bookings</div>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500">
              <Calendar className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{data?.totalBookings || 0}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg Stay</div>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-500">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{data?.averageStay || 0} <span className="text-sm text-gray-400">nights</span></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cancellation Rate</div>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500">
              <TrendingDown className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{data?.cancellationRate || 0}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Daily Revenue Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Revenue</h2>
          {data && data.dailyRevenue.length > 0 ? (
            <div className="space-y-2">
              {data.dailyRevenue.slice(-15).map((item) => (
                <div key={item.date} className="flex items-center gap-3">
                  <div className="text-xs text-gray-500 w-24">{new Date(item.date).toLocaleDateString()}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                    <div
                      className="bg-[#BA0036] h-6 rounded-full transition-all"
                      style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                  <div className="text-sm font-medium text-gray-900 w-20 text-right">${item.revenue.toLocaleString()}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No revenue data for this period</p>
          )}
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue</h2>
          {data && data.monthlyRevenue.length > 0 ? (
            <div className="space-y-3">
              {data.monthlyRevenue.map((item) => {
                const maxMonthly = Math.max(...data.monthlyRevenue.map(m => m.revenue), 1);
                return (
                  <div key={item.month} className="flex items-center gap-3">
                    <div className="text-xs text-gray-500 w-16">{item.month}</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                      <div
                        className="bg-blue-500 h-6 rounded-full transition-all"
                        style={{ width: `${(item.revenue / maxMonthly) * 100}%` }}
                      />
                    </div>
                    <div className="text-sm font-medium text-gray-900 w-20 text-right">${item.revenue.toLocaleString()}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No monthly revenue data</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Properties */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Home className="h-5 w-5 text-gray-400" />
            Top Performing Properties
          </h2>
          {data && data.topProperties.length > 0 ? (
            <div className="space-y-3">
              {data.topProperties.map((prop, index) => (
                <div key={prop.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-[#BA0036] flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{prop.title}</p>
                    <p className="text-xs text-gray-500">{prop.bookings} bookings</p>
                  </div>
                  <div className="text-sm font-bold text-gray-900">${prop.revenue.toLocaleString()}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No property data</p>
          )}
        </div>

        {/* Revenue by City */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-gray-400" />
            Revenue by City
          </h2>
          {data && data.revenueByCity.length > 0 ? (
            <div className="space-y-3">
              {data.revenueByCity.map((item) => {
                const maxCity = Math.max(...data.revenueByCity.map(c => c.revenue), 1);
                return (
                  <div key={item.city} className="flex items-center gap-3">
                    <div className="text-sm text-gray-700 w-24 truncate">{item.city}</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-5 relative overflow-hidden">
                      <div
                        className="bg-indigo-500 h-5 rounded-full transition-all"
                        style={{ width: `${(item.revenue / maxCity) * 100}%` }}
                      />
                    </div>
                    <div className="text-sm font-medium text-gray-900 w-20 text-right">${item.revenue.toLocaleString()}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No city data</p>
          )}
        </div>
      </div>

      {/* Payment Method Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-gray-400" />
          Payment Method Breakdown
        </h2>
        {data && data.paymentMethodBreakdown.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.paymentMethodBreakdown.map((method) => {
              const maxAmount = Math.max(...data.paymentMethodBreakdown.map(m => m.amount), 1);
              return (
                <div key={method.method} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 capitalize">{method.method.replace(/_/g, ' ')}</span>
                    <span className="text-xs text-gray-500">{method.count} txns</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">${method.amount.toLocaleString()}</div>
                  <div className="mt-2 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#BA0036] h-1.5 rounded-full"
                      style={{ width: `${(method.amount / maxAmount) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-8">No payment method data</p>
        )}
      </div>
    </div>
  );
}
