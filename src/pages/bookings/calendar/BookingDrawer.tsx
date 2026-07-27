import { format } from 'date-fns'
import type { CalendarBooking } from '@/types/calendar'

interface BookingDrawerProps {
  booking: CalendarBooking | null
  isOpen: boolean
  onClose: () => void
  onBookingUpdated: () => void
}

export default function BookingDrawer({ booking, isOpen, onClose }: BookingDrawerProps) {
  if (!isOpen || !booking) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'checked_in': return 'bg-blue-100 text-blue-800'
      case 'pending': case 'awaiting_payment': return 'bg-orange-100 text-orange-800'
      case 'completed': case 'checked_out': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'partial': return 'bg-yellow-100 text-yellow-800'
      case 'pending': return 'bg-orange-100 text-orange-800'
      case 'refunded': return 'bg-gray-100 text-gray-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      <div className="relative ml-auto h-full w-full max-w-md bg-white shadow-xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>{booking.status.replace('_', ' ')}</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(booking.payment_status)}`}>Payment: {booking.payment_status}</span>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-gray-900">Guest Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between"><span className="text-sm text-gray-600">Name:</span><span className="text-sm font-medium">{booking.guest_name}</span></div>
              <div className="flex justify-between"><span className="text-sm text-gray-600">Email:</span><span className="text-sm font-medium">{booking.guest_email}</span></div>
              {booking.guest_phone && <div className="flex justify-between"><span className="text-sm text-gray-600">Phone:</span><span className="text-sm font-medium">{booking.guest_phone}</span></div>}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-gray-900">Property Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between"><span className="text-sm text-gray-600">Property:</span><span className="text-sm font-medium">{booking.property_title}</span></div>
              <div className="flex justify-between"><span className="text-sm text-gray-600">City:</span><span className="text-sm font-medium">{booking.property_city}</span></div>
              {booking.property_category && <div className="flex justify-between"><span className="text-sm text-gray-600">Category:</span><span className="text-sm font-medium">{booking.property_category}</span></div>}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-gray-900">Reservation Timeline</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between"><span className="text-sm text-gray-600">Check-in:</span><span className="text-sm font-medium">{format(new Date(booking.check_in), 'MMM d, yyyy')}</span></div>
              <div className="flex justify-between"><span className="text-sm text-gray-600">Check-out:</span><span className="text-sm font-medium">{format(new Date(booking.check_out), 'MMM d, yyyy')}</span></div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-gray-900">Payment Details</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-900">{booking.total_price} {booking.currency}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 space-y-3">
            {booking.status === 'confirmed' && (
              <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">Check In</button>
            )}
            {booking.status === 'checked_in' && (
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">Check Out</button>
            )}
            <button className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">Message Guest</button>
            {booking.status === 'confirmed' && (
              <button className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium">Cancel Reservation</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
