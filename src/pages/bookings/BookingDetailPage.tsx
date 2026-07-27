import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, DollarSign, MessageSquare, CheckCircle, X, LogIn, LogOut, ArrowLeft, Clock, MapPin, User, Home, TrendingUp } from 'lucide-react';
import { BookingOperationsService, type Reservation } from '@/services/bookingOperationsService';
import { AuthContext } from '@/lib/auth-context';

interface TimelineEntry {
  id: string;
  status: string;
  changed_by: string;
  changed_by_name: string;
  reason?: string;
  created_at: string;
}

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const [booking, setBooking] = useState<Reservation | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (id) loadBookingData(id);
  }, [id]);

  const loadBookingData = async (bookingId: string) => {
    try {
      setLoading(true);
      const [reservations, timelineData] = await Promise.all([
        BookingOperationsService.getReservations(undefined, undefined, undefined, 100, 0),
        BookingOperationsService.getBookingTimeline(bookingId),
      ]);
      const found = reservations.find(r => r.id === bookingId);
      setBooking(found || null);
      setTimeline(timelineData);
    } catch (error) {
      console.error('Error loading booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!id) return;
    try {
      await BookingOperationsService.updateReservationStatus(id, 'confirmed', authContext?.session?.user.id || '');
      setNotification({ type: 'success', message: 'Booking confirmed' });
      loadBookingData(id);
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to confirm booking' });
    }
  };

  const handleCheckIn = async () => {
    if (!id) return;
    try {
      await BookingOperationsService.checkInGuest(id);
      setNotification({ type: 'success', message: 'Guest checked in' });
      loadBookingData(id);
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to check in' });
    }
  };

  const handleCheckOut = async () => {
    if (!id) return;
    try {
      await BookingOperationsService.checkOutGuest(id);
      setNotification({ type: 'success', message: 'Guest checked out' });
      loadBookingData(id);
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to check out' });
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    try {
      await BookingOperationsService.cancelBooking(id, cancelReason, authContext?.session?.user.id || '');
      setNotification({ type: 'success', message: 'Booking cancelled' });
      setShowCancelModal(false);
      setCancelReason('');
      loadBookingData(id);
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to cancel booking' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BA0036]" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Booking not found</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'checked_in': return 'bg-blue-100 text-blue-800';
      case 'checked_out': return 'bg-indigo-100 text-indigo-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-orange-100 text-orange-800';
      case 'awaiting_payment': return 'bg-purple-100 text-purple-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const nights = Math.ceil((new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {notification && (
          <div className={`mb-4 rounded-lg p-4 flex items-center ${notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <span className="flex-1">{notification.message}</span>
            <button onClick={() => setNotification(null)} className="text-current opacity-60 hover:opacity-100">×</button>
          </div>
        )}

        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Bookings
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
              <p className="text-sm text-gray-500 mt-1 font-mono">{booking.id}</p>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
              {booking.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property & Stay Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Stay Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Home className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Property</p>
                    <p className="font-medium text-gray-900">{booking.property_title}</p>
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {booking.property_city}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Check-in</p>
                    <p className="font-medium text-gray-900">{new Date(booking.check_in).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Check-out</p>
                    <p className="font-medium text-gray-900">{new Date(booking.check_out).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="font-medium text-gray-900">{nights} nights</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-600">Total Amount</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">${booking.total_price.toLocaleString()} <span className="text-xs text-gray-400">{booking.currency}</span></span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.payment_status)}`}>
                    {booking.payment_status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Price per night</span>
                  <span className="font-medium text-gray-900">${(booking.total_price / Math.max(nights, 1)).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Booking Timeline */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Timeline</h2>
              {timeline.length > 0 ? (
                <div className="space-y-4">
                  {timeline.map((entry, index) => (
                    <div key={entry.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${index === timeline.length - 1 ? 'bg-[#BA0036]' : 'bg-gray-300'}`} />
                        {index < timeline.length - 1 && <div className="w-0.5 h-8 bg-gray-200" />}
                      </div>
                      <div className="flex-1 pb-2">
                        <p className="text-sm font-medium text-gray-900">
                          {entry.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </p>
                        <p className="text-xs text-gray-500">
                          {entry.changed_by_name} · {new Date(entry.created_at).toLocaleString()}
                        </p>
                        {entry.reason && (
                          <p className="text-xs text-gray-400 mt-1 italic">{entry.reason}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No timeline events recorded</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Guest Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Guest Information</h2>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#BA0036] flex items-center justify-center text-white font-semibold">
                  {booking.guest_name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{booking.guest_name}</p>
                  {booking.guest_email && <p className="text-sm text-gray-500">{booking.guest_email}</p>}
                </div>
              </div>
              <button
                onClick={() => navigate('/booking/messages')}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Message Guest
              </button>
            </div>

            {/* Host Information */}
            {booking.host_name && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Host</h2>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                    {booking.host_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{booking.host_name}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
              <div className="space-y-3">
                {booking.status === 'pending' && (
                  <button
                    onClick={handleConfirm}
                    className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm Booking
                  </button>
                )}
                {booking.status === 'confirmed' && (
                  <button
                    onClick={handleCheckIn}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Check In Guest
                  </button>
                )}
                {booking.status === 'checked_in' && (
                  <button
                    onClick={handleCheckOut}
                    className="w-full flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Check Out Guest
                  </button>
                )}
                {!['cancelled', 'completed', 'refunded'].includes(booking.status) && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full m-4">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancel Booking</h3>
                <p className="text-gray-600 mb-4 text-sm">
                  Are you sure you want to cancel this booking? This action cannot be undone.
                </p>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please provide a reason for cancellation..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BA0036] focus:border-transparent resize-none text-sm"
                  rows={3}
                />
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    onClick={() => { setShowCancelModal(false); setCancelReason(''); }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    Keep Booking
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={!cancelReason.trim()}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm font-medium"
                  >
                    Cancel Booking
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
