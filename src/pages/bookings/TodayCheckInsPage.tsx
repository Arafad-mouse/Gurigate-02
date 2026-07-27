import { useEffect, useState } from 'react';
import { Clock, Phone, Mail, CheckCircle, MapPin, RefreshCw, LogIn } from 'lucide-react';
import { BookingOperationsService, type TodayCheckIn } from '@/services/bookingOperationsService';

function getPaymentColor(status: string) {
  switch (status) {
    case 'paid': return 'bg-green-100 text-green-800';
    case 'partial': return 'bg-yellow-100 text-yellow-800';
    case 'refunded': return 'bg-gray-100 text-gray-800';
    case 'failed': return 'bg-red-100 text-red-800';
    default: return 'bg-orange-100 text-orange-800';
  }
}

export default function TodayCheckInsPage() {
  const [checkIns, setCheckIns] = useState<TodayCheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadCheckIns();
  }, []);

  const loadCheckIns = async () => {
    try {
      setLoading(true);
      const data = await BookingOperationsService.getTodayCheckIns();
      setCheckIns(data);
    } catch (error) {
      console.error('Error loading check-ins:', error);
      setNotification({ type: 'error', message: 'Failed to load check-ins' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCheckIn = async (id: string) => {
    try {
      await BookingOperationsService.checkInGuest(id);
      setNotification({ type: 'success', message: 'Guest checked in successfully' });
      loadCheckIns();
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to check in guest' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BA0036]" />
      </div>
    );
  }

  const pending = checkIns.filter(c => c.status === 'confirmed');
  const completed = checkIns.filter(c => c.status === 'checked_in');

  return (
    <div className="p-6">
      {notification && (
        <div className={`mb-4 rounded-lg p-4 flex items-center ${notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          <span className="flex-1">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-current opacity-60 hover:opacity-100">×</button>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Today's Check-ins</h1>
          <p className="text-gray-600 mt-1">{pending.length} pending · {completed.length} checked in</p>
        </div>
        <button
          onClick={() => { setRefreshing(true); loadCheckIns(); }}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {checkIns.map((checkIn) => (
          <div key={checkIn.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">{checkIn.guest_name}</h3>
                <p className="text-sm text-gray-600 flex items-center mt-1">
                  <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                  {checkIn.property_title}, {checkIn.property_city}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                checkIn.status === 'checked_in' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {checkIn.status === 'checked_in' ? 'Checked In' : 'Pending'}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                {new Date(checkIn.arrival_time).toLocaleDateString()}
              </div>
              {checkIn.guest_phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  {checkIn.guest_phone}
                </div>
              )}
              {checkIn.guest_email && (
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  {checkIn.guest_email}
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Payment:</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPaymentColor(checkIn.payment_status)}`}>
                  {checkIn.payment_status}
                </span>
              </div>
            </div>

            {checkIn.status === 'confirmed' && (
              <button
                onClick={() => handleCheckIn(checkIn.id)}
                className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Check In Guest
              </button>
            )}
            {checkIn.status === 'checked_in' && (
              <div className="w-full flex items-center justify-center px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                <CheckCircle className="h-4 w-4 mr-2" />
                Checked In
              </div>
            )}
          </div>
        ))}
      </div>

      {checkIns.length === 0 && !loading && (
        <div className="text-center py-16">
          <LogIn className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No check-ins scheduled for today</p>
        </div>
      )}
    </div>
  );
}
