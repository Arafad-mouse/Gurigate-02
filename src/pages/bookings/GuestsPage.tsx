import { useState, useEffect } from 'react'
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  LogIn,
  LogOut,
  Clock,
  Star,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  MapPin,
  DollarSign,
  X,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  FileText,
  CreditCard
} from 'lucide-react'
import { BookingOperationsService, type GuestKPIs, type GuestWithBooking, type GuestStatus, type GuestType, type PaymentStatus } from '@/services/bookingOperationsService'
import { supabase } from '@/lib/supabase'

export default function GuestsPage() {
  const [kpis, setKpis] = useState<GuestKPIs>({
    totalGuests: 0,
    guestsStayingToday: 0,
    arrivalsToday: 0,
    departuresToday: 0,
    repeatGuests: 0,
    averageGuestRating: 0,
    pendingCheckIns: 0,
    pendingCheckOuts: 0
  })
  const [guests, setGuests] = useState<GuestWithBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<GuestStatus | 'all'>('all')
  const [guestTypeFilter, setGuestTypeFilter] = useState<GuestType | 'all'>('all')
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'all'>('all')
  const [selectedGuest, setSelectedGuest] = useState<GuestWithBooking | null>(null)
  const [showDrawer, setShowDrawer] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [todayOperations, setTodayOperations] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [statusFilter, guestTypeFilter, paymentFilter])

  const loadData = async () => {
    try {
      setLoading(true)
      const [kpiData, guestsData, operationsData] = await Promise.all([
        BookingOperationsService.getGuestKPIs(),
        BookingOperationsService.getGuestsWithBookings(
          statusFilter === 'all' ? undefined : statusFilter,
          guestTypeFilter === 'all' ? undefined : guestTypeFilter,
          paymentFilter === 'all' ? undefined : paymentFilter,
          undefined,
          undefined,
          undefined,
          100
        ),
        BookingOperationsService.getTodayGuestOperations()
      ])
      setKpis(kpiData)
      setGuests(guestsData)
      setTodayOperations(operationsData)
    } catch (error) {
      console.error('Error loading guest data:', error)
      setNotification({ type: 'error', message: 'Failed to load guest data' })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    loadData()
  }

  const filteredGuests = guests.filter(g => {
    const matchesSearch = searchQuery === '' ||
      g.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.phone?.includes(searchQuery) ||
      g.current_booking?.property_title.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSearch
  })

  const totalPages = Math.ceil(filteredGuests.length / itemsPerPage)
  const paginatedGuests = filteredGuests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleCheckIn = async (bookingId: string) => {
    try {
      await BookingOperationsService.checkInGuest(bookingId)
      setNotification({ type: 'success', message: 'Guest checked in successfully' })
      loadData()
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to check in guest' })
    }
  }

  const handleCheckOut = async (bookingId: string) => {
    try {
      await BookingOperationsService.checkOutGuest(bookingId)
      setNotification({ type: 'success', message: 'Guest checked out successfully' })
      loadData()
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to check out guest' })
    }
  }

  const getGuestStatusColor = (status: string) => {
    switch (status) {
      case 'staying': return 'bg-green-100 text-green-800'
      case 'arriving_today': return 'bg-blue-100 text-blue-800'
      case 'checking_out_today': return 'bg-orange-100 text-orange-800'
      case 'upcoming': return 'bg-indigo-100 text-indigo-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'no_show': return 'bg-red-900 text-red-100'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'partial': return 'bg-yellow-100 text-yellow-800'
      case 'pending': return 'bg-orange-100 text-orange-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'refunded': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const KPICard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    subtitle,
    iconColor
  }: { 
    title: string
    value: number | string
    icon: any
    color: string
    subtitle?: string
    iconColor: string
  }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</div>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: color }}>
          <Icon className="w-4 h-4" style={{ color: iconColor }} />
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {subtitle && (
        <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#BA0036]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 mx-6">
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
          <h1 className="text-2xl font-bold text-gray-900">Guests</h1>
          <p className="text-gray-600 mt-1">Manage guest profiles and booking history</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Total Guests"
          value={kpis.totalGuests}
          icon={Users}
          color="rgba(232, 52, 78, 0.082)"
          iconColor="rgb(232, 52, 78)"
          subtitle="Registered guests"
        />
        <KPICard
          title="Guests Staying Today"
          value={kpis.guestsStayingToday}
          icon={Users}
          color="rgba(16, 185, 129, 0.082)"
          iconColor="rgb(16, 185, 129)"
          subtitle="Currently on property"
        />
        <KPICard
          title="Arrivals Today"
          value={kpis.arrivalsToday}
          icon={LogIn}
          color="rgba(59, 130, 246, 0.082)"
          iconColor="rgb(59, 130, 246)"
          subtitle="Expected check-ins"
        />
        <KPICard
          title="Departures Today"
          value={kpis.departuresToday}
          icon={LogOut}
          color="rgba(249, 115, 22, 0.082)"
          iconColor="rgb(249, 115, 22)"
          subtitle="Expected check-outs"
        />
        <KPICard
          title="Repeat Guests"
          value={kpis.repeatGuests}
          icon={Star}
          color="rgba(168, 85, 247, 0.082)"
          iconColor="rgb(168, 85, 247)"
          subtitle="Returning customers"
        />
        <KPICard
          title="Average Rating"
          value={kpis.averageGuestRating.toFixed(1)}
          icon={Star}
          color="rgba(234, 179, 8, 0.082)"
          iconColor="rgb(234, 179, 8)"
          subtitle="Guest satisfaction"
        />
        <KPICard
          title="Pending Check-ins"
          value={kpis.pendingCheckIns}
          icon={Clock}
          color="rgba(6, 182, 212, 0.082)"
          iconColor="rgb(6, 182, 212)"
          subtitle="Awaiting arrival"
        />
        <KPICard
          title="Pending Check-outs"
          value={kpis.pendingCheckOuts}
          icon={Clock}
          color="rgba(236, 72, 153, 0.082)"
          iconColor="rgb(236, 72, 153)"
          subtitle="Ready to depart"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex items-center space-x-2 bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 flex-1 min-w-[200px]">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search guests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-sm focus:ring-0 w-full"
              aria-label="Search guests"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2 bg-gray-50 border border-gray-300 rounded-lg px-4 py-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as GuestStatus | 'all')}
              className="bg-transparent border-none text-sm focus:ring-0"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="staying">Staying</option>
              <option value="arriving_today">Arriving Today</option>
              <option value="checking_out_today">Checking Out Today</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
          </div>

          {/* Guest Type Filter */}
          <div className="flex items-center space-x-2 bg-gray-50 border border-gray-300 rounded-lg px-4 py-2">
            <Users className="h-4 w-4 text-gray-500" />
            <select
              value={guestTypeFilter}
              onChange={(e) => setGuestTypeFilter(e.target.value as GuestType | 'all')}
              className="bg-transparent border-none text-sm focus:ring-0"
              aria-label="Filter by guest type"
            >
              <option value="all">All Types</option>
              <option value="new">New Guest</option>
              <option value="returning">Returning Guest</option>
              <option value="vip">VIP Guest</option>
            </select>
          </div>

          {/* Payment Filter */}
          <div className="flex items-center space-x-2 bg-gray-50 border border-gray-300 rounded-lg px-4 py-2">
            <CreditCard className="h-4 w-4 text-gray-500" />
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as PaymentStatus | 'all')}
              className="bg-transparent border-none text-sm focus:ring-0"
              aria-label="Filter by payment status"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {/* Export */}
          <button
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Export guests"
          >
            <Download className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Export</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Guests Table */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Property</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedGuests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => { setSelectedGuest(guest); setShowDrawer(true) }}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#BA0036] flex items-center justify-center text-white font-semibold">
                          {guest.first_name.charAt(0)}{guest.last_name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{guest.first_name} {guest.last_name}</div>
                          <div className="text-sm text-gray-500">{guest.country || 'Unknown'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{guest.email}</div>
                      <div className="text-sm text-gray-500">{guest.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {guest.current_booking ? (
                        <div>
                          <div className="text-sm text-gray-900">{guest.current_booking.property_title}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {guest.current_booking.property_city}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No active booking</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {guest.current_booking ? (
                        <div>
                          <div className="text-sm text-gray-900 flex items-center">
                            <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                            {guest.current_booking.check_in}
                          </div>
                          <div className="text-sm text-gray-500">{guest.current_booking.check_out}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{guest.booking_count} bookings</div>
                      <div className="text-sm text-gray-500">{guest.total_nights} nights</div>
                      <div className="text-sm text-gray-500">${guest.total_spending.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {guest.current_booking ? (
                        <div className="space-y-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGuestStatusColor(guest.current_booking.status === 'checked_in' ? 'staying' : 'upcoming')}`}>
                            {guest.current_booking.status === 'checked_in' ? 'Checked In' : 'Upcoming'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(guest.current_booking.payment_status)}`}>
                            {guest.current_booking.payment_status}
                          </span>
                        </div>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          No Booking
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedGuest(guest); setShowDrawer(true) }}
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
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredGuests.length)} of {filteredGuests.length} guests
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

        {/* Today's Operations Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Operations</h2>
            
            {/* Arrivals */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <LogIn className="h-4 w-4 mr-2 text-green-600" />
                Arrivals ({todayOperations?.arrivals?.length || 0})
              </h3>
              {todayOperations?.arrivals?.length === 0 ? (
                <p className="text-sm text-gray-500">No arrivals today</p>
              ) : (
                <div className="space-y-2">
                  {todayOperations?.arrivals?.slice(0, 3).map((arrival: any) => (
                    <div key={arrival.id} className="p-2 bg-green-50 rounded-lg text-sm">
                      <div className="font-medium text-gray-900">{arrival.guest_name}</div>
                      <div className="text-gray-600">{arrival.property_title}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Departures */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <LogOut className="h-4 w-4 mr-2 text-orange-600" />
                Departures ({todayOperations?.departures?.length || 0})
              </h3>
              {todayOperations?.departures?.length === 0 ? (
                <p className="text-sm text-gray-500">No departures today</p>
              ) : (
                <div className="space-y-2">
                  {todayOperations?.departures?.slice(0, 3).map((departure: any) => (
                    <div key={departure.id} className="p-2 bg-orange-50 rounded-lg text-sm">
                      <div className="font-medium text-gray-900">{departure.guest_name}</div>
                      <div className="text-gray-600">{departure.property_title}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Awaiting Payment */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-red-600" />
                Awaiting Payment ({todayOperations?.awaitingPayment?.length || 0})
              </h3>
              {todayOperations?.awaitingPayment?.length === 0 ? (
                <p className="text-sm text-gray-500">No pending payments</p>
              ) : (
                <div className="space-y-2">
                  {todayOperations?.awaitingPayment?.slice(0, 3).map((payment: any) => (
                    <div key={payment.id} className="p-2 bg-red-50 rounded-lg text-sm">
                      <div className="font-medium text-gray-900">{payment.guest_name}</div>
                      <div className="text-gray-600">${payment.amount} - {payment.payment_status}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Guest Profile Drawer */}
      {showDrawer && selectedGuest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
          <div className="bg-white h-full w-full max-w-lg overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Guest Profile</h2>
                <button
                  onClick={() => setShowDrawer(false)}
                  className="text-gray-500 hover:text-gray-700"
                  title="Close drawer"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Guest Information */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Guest Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center">
                    <div className="h-16 w-16 rounded-full bg-[#BA0036] flex items-center justify-center text-white text-2xl font-semibold mr-4">
                      {selectedGuest.first_name.charAt(0)}{selectedGuest.last_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedGuest.first_name} {selectedGuest.last_name}</p>
                      <p className="text-sm text-gray-500">{selectedGuest.email}</p>
                      <p className="text-sm text-gray-500">{selectedGuest.phone || 'No phone'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Nationality:</span>
                      <span className="ml-2 font-medium">{selectedGuest.country || 'Unknown'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Language:</span>
                      <span className="ml-2 font-medium">{selectedGuest.preferred_language}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">ID Verified:</span>
                      <span className={`ml-2 font-medium ${selectedGuest.id_verified ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedGuest.id_verified ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Email Verified:</span>
                      <span className={`ml-2 font-medium ${selectedGuest.email_verified ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedGuest.email_verified ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Reservation */}
              {selectedGuest.current_booking && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Current Reservation
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Property:</span>
                      <span className="text-sm font-medium">{selectedGuest.current_booking.property_title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Location:</span>
                      <span className="text-sm font-medium">{selectedGuest.current_booking.property_city}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Check-in:</span>
                      <span className="text-sm font-medium">{selectedGuest.current_booking.check_in}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Check-out:</span>
                      <span className="text-sm font-medium">{selectedGuest.current_booking.check_out}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`text-sm font-medium ${getGuestStatusColor(selectedGuest.current_booking.status === 'checked_in' ? 'staying' : 'upcoming')}`}>
                        {selectedGuest.current_booking.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Payment:</span>
                      <span className={`text-sm font-medium ${getPaymentStatusColor(selectedGuest.current_booking.payment_status)}`}>
                        {selectedGuest.current_booking.payment_status}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Booking History */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Booking History
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Bookings:</span>
                    <span className="text-sm font-medium">{selectedGuest.booking_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Nights:</span>
                    <span className="text-sm font-medium">{selectedGuest.total_nights}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Spend:</span>
                    <span className="text-sm font-medium">${selectedGuest.total_spending.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Reviews:</span>
                    <span className="text-sm font-medium">{selectedGuest.total_reviews}</span>
                  </div>
                  {selectedGuest.average_rating && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avg Rating:</span>
                      <span className="text-sm font-medium flex items-center">
                        <Star className="h-4 w-4 mr-1 text-yellow-500" />
                        {selectedGuest.average_rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                {selectedGuest.current_booking?.status === 'confirmed' && (
                  <button
                    onClick={() => {
                      // Would need booking ID - placeholder
                      handleCheckIn('placeholder')
                    }}
                    className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Check In Guest
                  </button>
                )}
                
                {selectedGuest.current_booking?.status === 'checked_in' && (
                  <button
                    onClick={() => {
                      handleCheckOut('placeholder')
                    }}
                    className="w-full flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Check Out Guest
                  </button>
                )}

                <div className="grid grid-cols-3 gap-2">
                  <button className="flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Message
                  </button>
                  <button className="flex items-center justify-center px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm">
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </button>
                  <button className="flex items-center justify-center px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm">
                    <Mail className="h-4 w-4 mr-1" />
                    Email
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
