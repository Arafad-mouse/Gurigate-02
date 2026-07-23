/**
 * BookingDetailPage
 *
 * Page for displaying detailed booking information with status timeline.
 * Shows: Booking details, timeline, actions, and related information.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBookings } from '../hooks/useBookings';
import { BookingDetailViewModelMapper } from '../view-models/booking/BookingDetailViewModel';
import { BookingStatusTimeline } from '../components/booking/BookingStatusTimeline';
import { Calendar, MapPin, Users, DollarSign, ArrowLeft, X, CheckCircle, AlertTriangle, MessageSquare, Download } from 'lucide-react';

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchBooking, cancelBooking, confirmBooking, loading, error } = useBookings();
  const [booking, setBooking] = useState<any>(null);
  const [viewModel, setViewModel] = useState<any>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (id) {
      loadBooking(id);
    }
  }, [id]);

  const loadBooking = async (bookingId: string) => {
    try {
      const bookingData = await fetchBooking(bookingId);
      if (bookingData) {
        setBooking(bookingData);
        const vm = BookingDetailViewModelMapper.toViewModel(bookingData);
        setViewModel(vm);
      }
    } catch (err) {
      console.error('Failed to load booking:', err);
    }
  };

  const handleCancel = async () => {
    if (!id || !cancelReason.trim()) return;
    try {
      await cancelBooking(id);
      setShowCancelModal(false);
      setCancelReason('');
      loadBooking(id);
    } catch (err) {
      console.error('Failed to cancel booking:', err);
    }
  };

  const handleConfirm = async () => {
    if (!id) return;
    try {
      await confirmBooking(id);
      loadBooking(id);
    } catch (err) {
      console.error('Failed to confirm booking:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#BA0036]"></div>
      </div>
    );
  }

  if (error || !viewModel) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
        {error || 'Booking not found'}
      </div>
    );
  }

  const getStatusColor = (color: string) => {
    switch (color) {
      case 'yellow': return 'bg-yellow-100 text-yellow-800';
      case 'blue': return 'bg-blue-100 text-blue-800';
      case 'green': return 'bg-green-100 text-green-800';
      case 'red': return 'bg-red-100 text-red-800';
      case 'gray': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
            <p className="text-gray-600 mt-1">ID: {viewModel.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(viewModel.statusColor)}`}>
            {viewModel.statusLabel}
          </span>
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Download receipt"
          >
            <Download className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Timeline</h2>
        <BookingStatusTimeline timeline={viewModel.timeline} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Information</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">{viewModel.propertyTitle}</p>
                  <p className="text-sm text-gray-600">Property ID: {viewModel.propertyId}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Check-in</p>
                  <p className="font-medium text-gray-900">{viewModel.checkInDisplay}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Check-out</p>
                  <p className="font-medium text-gray-900">{viewModel.checkOutDisplay}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Users className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Guests</p>
                  <p className="font-medium text-gray-900">{viewModel.guestCountDisplay}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium text-gray-900">{viewModel.durationDisplay}</p>
                </div>
              </div>
            </div>

            {viewModel.specialRequests && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Special Requests</p>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{viewModel.specialRequests}</p>
              </div>
            )}
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
                <span className="text-xl font-bold text-gray-900">{viewModel.totalAmountDisplay}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Nightly Rate</span>
                <span className="font-medium text-gray-900">{viewModel.nightlyRateDisplay}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Payment Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(viewModel.paymentStatusColor)}`}>
                  {viewModel.paymentStatusLabel}
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
                {viewModel.guestName.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-gray-900">{viewModel.guestName}</p>
                <p className="text-sm text-gray-600">Guest ID: {viewModel.guestId}</p>
              </div>
            </div>
            <button
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Message Guest
            </button>
          </div>

          {/* Host Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Host Information</h2>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                {viewModel.hostName.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-gray-900">{viewModel.hostName}</p>
                <p className="text-sm text-gray-600">Host ID: {viewModel.hostId}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-3">
              {viewModel.canConfirm && (
                <button
                  onClick={handleConfirm}
                  className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Booking
                </button>
              )}
              {viewModel.canCancel && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel Booking
                </button>
              )}
              {viewModel.canDispute && (
                <button
                  className="w-full flex items-center justify-center px-4 py-2 border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Open Dispute
                </button>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Metadata</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Created</span>
                <span className="text-gray-900">{viewModel.createdAtDisplay}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated</span>
                <span className="text-gray-900">{viewModel.updatedAtDisplay}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Booking Type</span>
                <span className="text-gray-900">{viewModel.typeLabel}</span>
              </div>
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
  );
}
