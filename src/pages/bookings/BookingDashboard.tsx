import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, LogOut, Users, Clock, CreditCard, Calendar, TrendingUp, DollarSign, Bell, ArrowRight } from 'lucide-react';
import { BookingOperationsService, type BookingDashboardKPIs } from '@/services/bookingOperationsService';
import { AuthContext } from '@/lib/auth-context';

export default function BookingDashboard() {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const [kpis, setKpis] = useState<BookingDashboardKPIs | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [kpiData, notifData] = await Promise.all([
          BookingOperationsService.getDashboardKPIs(),
          BookingOperationsService.getNotifications(authContext?.session?.user.id),
        ]);
        setKpis(kpiData);
        setNotifications(notifData);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [authContext?.session?.user.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BA0036]" />
      </div>
    );
  }

  const statCards = [
    { title: "Today's Check-ins", value: kpis?.todayCheckIns || 0, icon: LogIn, color: 'bg-blue-500', route: '/booking/check-ins' },
    { title: "Today's Check-outs", value: kpis?.todayCheckOuts || 0, icon: LogOut, color: 'bg-orange-500', route: '/booking/check-outs' },
    { title: 'Guests Staying', value: kpis?.guestsStaying || 0, icon: Users, color: 'bg-green-500', route: '/booking/guests' },
    { title: 'Pending Bookings', value: kpis?.pendingBookings || 0, icon: Clock, color: 'bg-yellow-500', route: '/booking/reservations' },
    { title: 'Pending Payments', value: kpis?.pendingPayments || 0, icon: CreditCard, color: 'bg-red-500', route: '/booking/payments' },
    { title: 'Upcoming Arrivals', value: kpis?.upcomingArrivals || 0, icon: Calendar, color: 'bg-indigo-500', route: '/booking/reservations' },
    { title: 'Occupancy Rate', value: `${kpis?.occupancyRate || 0}%`, icon: TrendingUp, color: 'bg-purple-500', route: '/booking/calendar' },
    { title: 'Revenue Today', value: `$${(kpis?.revenueToday || 0).toLocaleString()}`, icon: DollarSign, color: 'bg-emerald-500', route: '/booking/payments' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">What's happening today</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <button
            key={index}
            onClick={() => navigate(stat.route)}
            className="bg-white rounded-xl border border-gray-200 p-5 text-left hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.title}</div>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
          </button>
        ))}
      </div>

      {/* Occupancy Bar + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Occupancy Rate</h2>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Current occupancy</span>
            <span className="font-semibold text-gray-900">{kpis?.occupancyRate || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-[#BA0036] h-3 rounded-full transition-all"
              style={{ width: `${kpis?.occupancyRate || 0}%` }}
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Guests on property:</span>
              <span className="ml-2 font-medium text-gray-900">{kpis?.guestsStaying || 0}</span>
            </div>
            <div>
              <span className="text-gray-500">Revenue today:</span>
              <span className="ml-2 font-medium text-gray-900">${(kpis?.revenueToday || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            <Bell className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No notifications</p>
            ) : (
              notifications.slice(0, 8).map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => notif.booking_id && navigate(`/booking/${notif.booking_id}`)}
                  className="w-full flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    notif.type === 'check_in_today' ? 'bg-blue-500' :
                    notif.type === 'check_out_today' ? 'bg-orange-500' :
                    notif.type === 'payment_pending' ? 'bg-red-500' :
                    notif.type === 'new_booking' ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                    <p className="text-xs text-gray-500 truncate">{notif.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
