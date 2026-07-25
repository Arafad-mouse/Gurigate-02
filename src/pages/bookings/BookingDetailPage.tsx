import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, DollarSign, MessageSquare, CheckCircle, X, AlertTriangle, Eye } from 'lucide-react';

interface BookingDetail {
  id: string;
  propertyTitle: string;
  guestName: string;
  guestId: string;
  hostName: string;
  hostId: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
  type: 'short_term' | 'long_term';
}

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    // TODO: Fetch booking details from API
    setLoading(false);
  }, [id]);

  const handleConfirm = () => {
    // TODO: Implement booking confirmation
    console.log('Confirming booking:', id);
  };

  const handleCancel = () => {
    // TODO: Implement booking cancellation
    console.log('Cancelling booking:', id, 'Reason:', cancelReason);
    setShowCancelModal(false);
    setCancelReason('');
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
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 mb-4"
          >
            ← Back to Bookings
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Information</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Property</span>
                  <span className="font-medium text-gray-900">{booking.propertyTitle}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Booking ID</span>
                  <span className="font-medium text-gray-900">{booking.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Stay Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Stay Details</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Check-in</p>
                    <p className="font-medium text-gray-900">{new Date(booking.checkIn).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Check-out</p>
                    <p className="font-medium text-gray-900">{new Date(booking.checkOut).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Guests</span>
                  <span className="font-medium text-gray-900">{booking.guestCount}</span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-600">Total Amount</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">${booking.totalAmount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.paymentStatus)}`}>
                    {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Guest Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Guest Information</h2>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#BA0036] flex items-center justify-center text-white font-semibold">
                  {booking.guestName.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{booking.guestName}</p>
                  <p className="text-sm text-gray-600">Guest ID: {booking.guestId}</p>
                </div>
              </div>
              <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Message Guest
              </button>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
              <div className="space-y-3">
                {booking.status === 'pending' && (
                  <button
                    onClick={handleConfirm}
                    className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm Booking
                  </button>
                )}
                {(booking.status === 'pending' || booking.status === 'confirmed') && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full m-4">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancel Booking</h3>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to cancel this booking? This action cannot be undone.
                </p>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please provide a reason for cancellation..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BA0036] focus:border-transparent resize-none"
                  rows={3}
                />
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    onClick={() => {
                      setShowCancelModal(false);
                      setCancelReason('');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Keep Booking
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={!cancelReason.trim()}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
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
