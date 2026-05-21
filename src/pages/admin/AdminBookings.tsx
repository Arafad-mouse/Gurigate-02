import { useState } from 'react'
import { Calendar, MapPin, DollarSign, User, X, CheckCircle, Filter, MessageSquare } from 'lucide-react'

interface Booking {
  id: string
  guest_name: string
  guest_email: string
  property_title: string
  property_city: string
  check_in: string
  check_out: string
  total_price: number
  currency: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  dispute_status: 'none' | 'open' | 'resolved' | 'escalated'
  guest_count: number
  admin_note?: string
  created_at: string
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useState(() => {
    setBookings([
      {
        id: '1',
        guest_name: 'John Doe',
        guest_email: 'john@example.com',
        property_title: 'Luxury 3-Bedroom Villa',
        property_city: 'Kilimani',
        check_in: '2026-05-15',
        check_out: '2026-05-18',
        total_price: 750,
        currency: 'USD',
        status: 'pending',
        dispute_status: 'none',
        guest_count: 3,
        created_at: '2026-05-08'
      },
      {
        id: '2',
        guest_name: 'Sarah Johnson',
        guest_email: 'sarah@example.com',
        property_title: 'Modern Studio Apartment',
        property_city: 'Westlands',
        check_in: '2026-05-20',
        check_out: '2026-05-22',
        total_price: 170,
        currency: 'USD',
        status: 'confirmed',
        dispute_status: 'none',
        guest_count: 2,
        created_at: '2026-05-07'
      },
      {
        id: '3',
        guest_name: 'Emily Chen',
        guest_email: 'emily@example.com',
        property_title: 'Cozy 2-Bedroom Home',
        property_city: 'Parklands',
        check_in: '2026-05-10',
        check_out: '2026-05-12',
        total_price: 240,
        currency: 'USD',
        status: 'cancelled',
        dispute_status: 'open',
        guest_count: 2,
        created_at: '2026-05-06'
      }
    ])
    setLoading(false)
  })

  const filteredBookings = bookings.filter(b => 
    filter === 'all' || b.status === filter
  )

  const handleCancelBooking = (bookingId: string, reason: string) => {
    console.log('Cancel booking:', bookingId, reason)
  }

  const handleResolveDispute = (bookingId: string, resolution: string) => {
    console.log('Resolve dispute:', bookingId, resolution)
  }

  const handleAddAdminNote = (bookingId: string, note: string) => {
    console.log('Add admin note:', bookingId, note)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDisputeColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'escalated': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#BA0036]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600 mt-1">Manage all bookings and resolve disputes</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-transparent border-none text-sm focus:ring-0"
              aria-label="Filter bookings by status"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dispute
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#BA0036] flex items-center justify-center text-white font-semibold">
                        {booking.guest_name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{booking.guest_name}</div>
                        <div className="text-sm text-gray-500">{booking.guest_email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.property_title}</div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {booking.property_city}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {booking.check_in}
                    </div>
                    <div className="text-sm text-gray-500">to {booking.check_out}</div>
                    <div className="text-xs text-gray-400 mt-1">{booking.guest_count} guests</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 flex items-center">
                      <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                      {booking.total_price} {booking.currency}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {booking.dispute_status !== 'none' && (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDisputeColor(booking.dispute_status)}`}>
                        {booking.dispute_status}
                      </span>
                    )}
                    {booking.dispute_status === 'none' && (
                      <span className="text-gray-400 text-xs">No dispute</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => {
                        setSelectedBooking(booking)
                        setShowModal(true)
                      }}
                      className="text-[#BA0036] hover:text-[#a4003a]"
                    >
                      View
                    </button>
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => {
                          const reason = prompt('Enter cancellation reason:')
                          if (reason) handleCancelBooking(booking.id, reason)
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        Cancel
                      </button>
                    )}
                    {booking.dispute_status === 'open' && (
                      <button
                        onClick={() => {
                          const resolution = prompt('Enter dispute resolution:')
                          if (resolution) handleResolveDispute(booking.id, resolution)
                        }}
                        className="text-green-600 hover:text-green-800"
                      >
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Details Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Booking Info */}
              <div className="space-y-6">
                {/* Guest Info */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Guest Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">{selectedBooking.guest_name}</p>
                    <p className="text-sm text-gray-500">{selectedBooking.guest_email}</p>
                    <p className="text-sm text-gray-500 mt-2">Guests: {selectedBooking.guest_count}</p>
                  </div>
                </div>

                {/* Property Info */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Property Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-900 font-medium">{selectedBooking.property_title}</p>
                    <p className="text-sm text-gray-500">{selectedBooking.property_city}</p>
                  </div>
                </div>

                {/* Dates */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Booking Dates
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Check-in: {selectedBooking.check_in}</p>
                    <p className="text-sm text-gray-600">Check-out: {selectedBooking.check_out}</p>
                  </div>
                </div>

                {/* Price */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Payment Details
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-900">
                      {selectedBooking.total_price} {selectedBooking.currency}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedBooking.status)}`}>
                      {selectedBooking.status}
                    </span>
                  </div>
                  {selectedBooking.dispute_status !== 'none' && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDisputeColor(selectedBooking.dispute_status)}`}>
                      Dispute: {selectedBooking.dispute_status}
                    </span>
                  )}
                </div>

                {/* Admin Note */}
                {selectedBooking.admin_note && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Admin Note
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">{selectedBooking.admin_note}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  {selectedBooking.status === 'confirmed' && (
                    <button
                      onClick={() => {
                        const reason = prompt('Enter cancellation reason:')
                        if (reason) {
                          handleCancelBooking(selectedBooking.id, reason)
                          setShowModal(false)
                        }
                      }}
                      className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel Booking
                    </button>
                  )}

                  {selectedBooking.dispute_status === 'open' && (
                    <button
                      onClick={() => {
                        const resolution = prompt('Enter dispute resolution:')
                        if (resolution) {
                          handleResolveDispute(selectedBooking.id, resolution)
                          setShowModal(false)
                        }
                      }}
                      className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Resolve Dispute
                    </button>
                  )}

                  <button
                    onClick={() => {
                      const note = prompt('Enter admin note:')
                      if (note) {
                        handleAddAdminNote(selectedBooking.id, note)
                        setShowModal(false)
                      }
                    }}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Add Admin Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
