import { useState, useEffect } from 'react'
import { Calendar, MapPin, DollarSign, User, X, CheckCircle, Filter, MessageSquare, Search, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AdminService, type AdminBooking } from '@/services/adminService'

interface Booking {
  id: string
  guest_name: string
  guest_email: string
  property_title: string
  property_city: string
  property_category?: string
  check_in: string
  check_out: string
  total_price: number
  currency: string
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'completed' | 'cancelled' | 'refunded' | 'disputed'
  dispute_status: 'none' | 'open' | 'resolved' | 'escalated'
  payment_status: 'pending' | 'partial' | 'paid' | 'refunded' | 'failed'
  guest_count: number
  admin_note?: string
  host_name?: string
  host_email?: string
  created_at: string
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'completed' | 'cancelled' | 'refunded' | 'disputed'>('all')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'residential' | 'commercial' | 'land' | 'hospitality'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    loadBookings()
  }, [filter, categoryFilter])

  const loadBookings = async () => {
    try {
      setLoading(true)
      const data = await AdminService.getAllBookings(filter === 'all' ? undefined : filter)
      
      // Enhance with additional data
      const enhancedBookings = await Promise.all(data.map(async (booking) => {
        // Get property category
        const { data: propertyData } = await supabase
          .from('properties')
          .select('property_category, owner_id')
          .eq('id', booking.id)
          .single()
        
        // Get host info
        let hostName = ''
        let hostEmail = ''
        if (propertyData?.owner_id) {
          const { data: hostData } = await supabase
            .from('profiles')
            .select('first_name, last_name, email')
          .eq('id', propertyData.owner_id)
          .single()
          
          if (hostData) {
            hostName = `${hostData.first_name} ${hostData.last_name}`
            hostEmail = hostData.email
          }
        }
        
        return {
          ...booking,
          property_category: propertyData?.property_category,
          host_name: hostName,
          host_email: hostEmail,
          payment_status: 'paid' as const // Default, should come from actual data
        }
      }))
      
      setBookings(enhancedBookings)
    } catch (error) {
      console.error('Error loading bookings:', error)
      setNotification({ type: 'error', message: 'Failed to load bookings' })
    } finally {
      setLoading(false)
    }
  }

  const filteredBookings = bookings.filter(b => {
    const matchesStatus = filter === 'all' || b.status === filter
    const matchesCategory = categoryFilter === 'all' || b.property_category === categoryFilter
    const matchesSearch = searchQuery === '' || 
      b.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.guest_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.property_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.property_city.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesStatus && matchesCategory && matchesSearch
  })
  
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage)
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleCancelBooking = async (bookingId: string, reason: string) => {
    setActionLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setNotification({ type: 'error', message: 'Authentication required' })
        return
      }

      await AdminService.cancelBooking(bookingId, reason)
      setNotification({ type: 'success', message: 'Booking cancelled successfully' })
      loadBookings()
      setShowModal(false)
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to cancel booking' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleConfirmBooking = async (bookingId: string) => {
    setActionLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setNotification({ type: 'error', message: 'Authentication required' })
        return
      }

      const { error } = await supabase.rpc('update_booking_status', {
        p_booking_id: bookingId,
        p_new_status: 'confirmed',
        p_changed_by: user.id,
        p_change_reason: 'Confirmed by admin'
      })

      if (error) throw error
      setNotification({ type: 'success', message: 'Booking confirmed successfully' })
      loadBookings()
      setShowModal(false)
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to confirm booking' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleCheckIn = async (bookingId: string) => {
    setActionLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setNotification({ type: 'error', message: 'Authentication required' })
        return
      }

      const { error } = await supabase
        .from('property_bookings')
        .update({ 
          status: 'checked_in',
          checked_in_at: new Date().toISOString()
        })
        .eq('id', bookingId)

      if (error) throw error
      setNotification({ type: 'success', message: 'Guest checked in successfully' })
      loadBookings()
      setShowModal(false)
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to check in guest' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleCheckOut = async (bookingId: string) => {
    setActionLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setNotification({ type: 'error', message: 'Authentication required' })
        return
      }

      const { error } = await supabase
        .from('property_bookings')
        .update({ 
          status: 'checked_out',
          checked_out_at: new Date().toISOString()
        })
        .eq('id', bookingId)

      if (error) throw error
      setNotification({ type: 'success', message: 'Guest checked out successfully' })
      loadBookings()
      setShowModal(false)
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to check out guest' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleRefundBooking = async (bookingId: string, reason: string) => {
    setActionLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setNotification({ type: 'error', message: 'Authentication required' })
        return
      }

      const { error } = await supabase.rpc('update_booking_status', {
        p_booking_id: bookingId,
        p_new_status: 'refunded',
        p_changed_by: user.id,
        p_change_reason: reason
      })

      if (error) throw error
      setNotification({ type: 'success', message: 'Booking refunded successfully' })
      loadBookings()
      setShowModal(false)
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to refund booking' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleResolveDispute = async (bookingId: string, resolution: string) => {
    setActionLoading(true)
    try {
      await AdminService.resolveDispute(bookingId, resolution)
      setNotification({ type: 'success', message: 'Dispute resolved successfully' })
      loadBookings()
      setShowModal(false)
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to resolve dispute' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleAddAdminNote = async (bookingId: string, note: string) => {
    setActionLoading(true)
    try {
      await AdminService.addAdminNote(bookingId, note)
      setNotification({ type: 'success', message: 'Admin note added successfully' })
      loadBookings()
      setShowModal(false)
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to add admin note' })
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'checked_in': return 'bg-indigo-100 text-indigo-800'
      case 'checked_out': return 'bg-purple-100 text-purple-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'refunded': return 'bg-orange-100 text-orange-800'
      case 'disputed': return 'bg-red-100 text-red-800'
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
      {/* Notification */}
      {notification && (
        <div className={`rounded-lg p-4 flex items-center ${notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {notification.type === 'success' ? <CheckCircle className="h-5 w-5 mr-2" /> : <X className="h-5 w-5 mr-2" />}
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-auto"
            aria-label="Close notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600 mt-1">Manage all bookings and resolve disputes</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-sm focus:ring-0 w-48"
              aria-label="Search bookings"
            />
          </div>
          
          {/* Status Filter */}
          <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-transparent border-none text-sm focus:ring-0"
              aria-label="Filter bookings by status"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked_in">Checked In</option>
              <option value="checked_out">Checked Out</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
              <option value="disputed">Disputed</option>
            </select>
          </div>
          
          {/* Category Filter */}
          <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="bg-transparent border-none text-sm focus:ring-0"
              aria-label="Filter bookings by category"
            >
              <option value="all">All Categories</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="land">Land</option>
              <option value="hospitality">Hospitality</option>
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
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">#{booking.id.slice(0, 8)}</div>
                    <div className="text-xs text-gray-500">{new Date(booking.created_at).toLocaleDateString()}</div>
                  </td>
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
                    <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800 capitalize">
                      {booking.property_category || 'N/A'}
                    </span>
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
                      {booking.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      booking.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                      booking.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.payment_status}
                    </span>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredBookings.length)} of {filteredBookings.length} bookings
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              title="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              title="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
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
                  title="Close modal"
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
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Name:</span>
                      <span className="text-sm font-medium">{selectedBooking.guest_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Email:</span>
                      <span className="text-sm font-medium">{selectedBooking.guest_email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Guests:</span>
                      <span className="text-sm font-medium">{selectedBooking.guest_count}</span>
                    </div>
                  </div>
                </div>
                
                {/* Host Info */}
                {selectedBooking.host_name && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Host Information
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Name:</span>
                        <span className="text-sm font-medium">{selectedBooking.host_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="text-sm font-medium">{selectedBooking.host_email}</span>
                      </div>
                    </div>
                  </div>
                )}

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
                  {selectedBooking.status === 'pending' && (
                    <button
                      onClick={() => handleConfirmBooking(selectedBooking.id)}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {actionLoading ? 'Confirming...' : 'Confirm Booking'}
                    </button>
                  )}
                  
                  {selectedBooking.status === 'confirmed' && (
                    <button
                      onClick={() => handleCheckIn(selectedBooking.id)}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {actionLoading ? 'Checking in...' : 'Mark Checked-In'}
                    </button>
                  )}
                  
                  {selectedBooking.status === 'checked_in' && (
                    <button
                      onClick={() => handleCheckOut(selectedBooking.id)}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {actionLoading ? 'Checking out...' : 'Mark Checked-Out'}
                    </button>
                  )}
                  
                  {(selectedBooking.status === 'confirmed' || selectedBooking.status === 'checked_in') && (
                    <button
                      onClick={() => {
                        const reason = prompt('Enter cancellation reason:')
                        if (reason) handleCancelBooking(selectedBooking.id, reason)
                      }}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="h-4 w-4 mr-2" />
                      {actionLoading ? 'Cancelling...' : 'Cancel Booking'}
                    </button>
                  )}
                  
                  {(selectedBooking.status === 'confirmed' || selectedBooking.status === 'completed') && (
                    <button
                      onClick={() => {
                        const reason = prompt('Enter refund reason:')
                        if (reason) handleRefundBooking(selectedBooking.id, reason)
                      }}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      {actionLoading ? 'Refunding...' : 'Refund Booking'}
                    </button>
                  )}

                  {selectedBooking.dispute_status === 'open' && (
                    <button
                      onClick={() => {
                        const resolution = prompt('Enter dispute resolution:')
                        if (resolution) handleResolveDispute(selectedBooking.id, resolution)
                      }}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {actionLoading ? 'Resolving...' : 'Resolve Dispute'}
                    </button>
                  )}

                  <button
                    onClick={() => {
                      const note = prompt('Enter admin note:')
                      if (note) handleAddAdminNote(selectedBooking.id, note)
                    }}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {actionLoading ? 'Adding...' : 'Add Admin Note'}
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
