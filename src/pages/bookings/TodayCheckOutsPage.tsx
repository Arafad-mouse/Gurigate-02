import { useEffect, useState } from 'react';
import { Clock, MapPin, CheckCircle, RefreshCw, LogOut, DollarSign, AlertTriangle, Sparkles } from 'lucide-react';
import { BookingOperationsService, type TodayCheckOut } from '@/services/bookingOperationsService';

function getCleaningColor(status: string) {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'in_progress': return 'bg-blue-100 text-blue-800';
    default: return 'bg-yellow-100 text-yellow-800';
  }
}

export default function TodayCheckOutsPage() {
  const [checkOuts, setCheckOuts] = useState<TodayCheckOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadCheckOuts();
  }, []);

  const loadCheckOuts = async () => {
    try {
      setLoading(true);
      const data = await BookingOperationsService.getTodayCheckOuts();
      setCheckOuts(data);
    } catch (error) {
      console.error('Error loading check-outs:', error);
      setNotification({ type: 'error', message: 'Failed to load check-outs' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCheckOut = async (id: string) => {
    try {
      await BookingOperationsService.checkOutGuest(id);
      setNotification({ type: 'success', message: 'Guest checked out successfully' });
      loadCheckOuts();
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to check out guest' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BA0036]" />
      </div>
    );
  }

  const pending = checkOuts.filter(c => c.status === 'checked_in');
  const completed = checkOuts.filter(c => c.status === 'checked_out' || c.status === 'completed');

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
          <h1 className="text-2xl font-bold text-gray-900">Today's Check-outs</h1>
          <p className="text-gray-600 mt-1">{pending.length} pending · {completed.length} completed</p>
        </div>
        <button
          onClick={() => { setRefreshing(true); loadCheckOuts(); }}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {checkOuts.map((checkOut) => (
          <div key={checkOut.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">{checkOut.guest_name}</h3>
                <p className="text-sm text-gray-600 flex items-center mt-1">
                  <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                  {checkOut.property_title}, {checkOut.property_city}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                checkOut.status === 'checked_out' || checkOut.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
              }`}>
                {checkOut.status === 'checked_out' || checkOut.status === 'completed' ? 'Completed' : 'Pending'}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                {new Date(checkOut.departure_time).toLocaleDateString()}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                Outstanding: ${checkOut.outstanding_balance.toLocaleString()}
                {checkOut.outstanding_balance > 0 && (
                  <AlertTriangle className="h-3 w-3 ml-1 text-red-500" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Cleaning:</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCleaningColor(checkOut.cleaning_status)}`}>
                  {checkOut.cleaning_status.replace(/_/g, ' ')}
                </span>
              </div>
              {checkOut.damage_report && (
                <div className="flex items-center text-sm text-red-600">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Damage reported
                </div>
              )}
            </div>

            {checkOut.status === 'checked_in' && (
              <button
                onClick={() => handleCheckOut(checkOut.id)}
                className="w-full flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Check Out Guest
              </button>
            )}
            {(checkOut.status === 'checked_out' || checkOut.status === 'completed') && (
              <div className="w-full flex items-center justify-center px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                <CheckCircle className="h-4 w-4 mr-2" />
                Completed
              </div>
            )}
          </div>
        ))}
      </div>

      {checkOuts.length === 0 && !loading && (
        <div className="text-center py-16">
          <LogOut className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No check-outs scheduled for today</p>
        </div>
      )}
    </div>
  );
}
