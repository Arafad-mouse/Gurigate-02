import { useState, useEffect } from 'react'
import { Users, DollarSign, Star, Check, X, Search, ChevronLeft, ChevronRight, AlertCircle, Shield } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AdminService } from '@/services/adminService'

interface Guest {
  id: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  avatar_url: string | null
  role: 'guest' | 'host' | 'manager' | 'admin' | 'super_admin'
  is_banned: boolean
  banned_reason: string | null
  total_bookings: number
  total_spending: number
  total_reviews: number
  average_rating?: number
  id_verified: boolean
  email_verified: boolean
  phone_verified: boolean
  risk_score: number
  risk_flags: string[]
  created_at: string
}

export default function AdminGuests() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [filter, setFilter] = useState<'all' | 'active' | 'suspended'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    loadGuests()
  }, [filter])

  const loadGuests = async () => {
    try {
      setLoading(true)
      const users = await AdminService.getAllUsers('guest')
      
      // Enhance with guest profile data
      const enhancedGuests = await Promise.all(users.map(async (user) => {
        // Get guest profile
        const { data: guestProfile } = await supabase
          .from('guest_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        // Get booking count and spending
        const { data: bookingsData } = await supabase
          .from('property_bookings')
          .select('total_price')
          .eq('guest_id', user.id)
        
        const totalBookings = bookingsData?.length || 0
        const totalSpending = bookingsData?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0
        
        return {
          ...user,
          total_bookings: guestProfile?.total_bookings || totalBookings,
          total_spending: guestProfile?.total_spending || totalSpending,
          total_reviews: guestProfile?.total_reviews || 0,
          average_rating: guestProfile?.average_rating,
          id_verified: guestProfile?.id_verified || false,
          email_verified: guestProfile?.email_verified || false,
          phone_verified: guestProfile?.phone_verified || false,
          risk_score: guestProfile?.risk_score || 0,
          risk_flags: guestProfile?.risk_flags || []
        }
      }))
      
      setGuests(enhancedGuests)
    } catch (error) {
      console.error('Error loading guests:', error)
      setNotification({ type: 'error', message: 'Failed to load guests' })
    } finally {
      setLoading(false)
    }
  }

  const filteredGuests = guests.filter(g => {
    const matchesStatus = filter === 'all' || 
      (filter === 'active' && !g.is_banned) ||
      (filter === 'suspended' && g.is_banned)
    const matchesSearch = searchQuery === '' || 
      g.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesStatus && matchesSearch
  })

  const totalPages = Math.ceil(filteredGuests.length / itemsPerPage)
  const paginatedGuests = filteredGuests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSuspendGuest = async (guestId: string, reason: string) => {
    setActionLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setNotification({ type: 'error', message: 'Authentication required' })
        return
      }

      await AdminService.banUser(guestId, user.id, reason)
      setNotification({ type: 'success', message: 'Guest suspended successfully' })
      loadGuests()
      setShowModal(false)
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to suspend guest' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleActivateGuest = async (guestId: string) => {
    setActionLoading(true)
    try {
      await AdminService.unbanUser(guestId)
      setNotification({ type: 'success', message: 'Guest activated successfully' })
      loadGuests()
      setShowModal(false)
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to activate guest' })
    } finally {
      setActionLoading(false)
    }
  }

  const getRiskLevel = (score: number) => {
    if (score >= 70) return { label: 'High', color: 'bg-red-100 text-red-800' }
    if (score >= 40) return { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' }
    return { label: 'Low', color: 'bg-green-100 text-green-800' }
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
          {notification.type === 'success' ? <Check className="h-5 w-5 mr-2" /> : <AlertCircle className="h-5 w-5 mr-2" />}
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
          <p className="text-gray-600 mt-1">Manage guest accounts and activity</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search guests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-sm focus:ring-0 w-48"
              aria-label="Search guests"
            />
          </div>
          
          {/* Status Filter */}
          <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2">
            <Shield className="h-4 w-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-transparent border-none text-sm focus:ring-0"
              aria-label="Filter guests by status"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Guests Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Bookings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spending
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reviews
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verification
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedGuests.map((guest) => (
                <tr key={guest.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#BA0036] flex items-center justify-center text-white font-semibold">
                        {guest.first_name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{guest.full_name}</div>
                        <div className="text-sm text-gray-500">{guest.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Users className="h-4 w-4 mr-1 text-gray-400" />
                      {guest.total_bookings}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 flex items-center">
                      <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                      ${guest.total_spending.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {guest.total_reviews}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-400" />
                      <span className="text-sm text-gray-900">
                        {guest.average_rating ? guest.average_rating.toFixed(1) : 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      {guest.id_verified && (
                        <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">ID</span>
                      )}
                      {guest.email_verified && (
                        <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">Email</span>
                      )}
                      {guest.phone_verified && (
                        <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">Phone</span>
                      )}
                      {!guest.id_verified && !guest.email_verified && !guest.phone_verified && (
                        <span className="text-xs text-gray-400">None</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskLevel(guest.risk_score).color}`}>
                      {getRiskLevel(guest.risk_score).label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {guest.is_banned ? (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Suspended
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => {
                        setSelectedGuest(guest)
                        setShowModal(true)
                      }}
                      className="text-[#BA0036] hover:text-[#a4003a]"
                      title="View details"
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

      {/* Guest Details Modal */}
      {showModal && selectedGuest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Guest Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                  title="Close modal"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Guest Info */}
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 h-16 w-16 rounded-full bg-[#BA0036] flex items-center justify-center text-white text-2xl font-semibold">
                    {selectedGuest.first_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedGuest.full_name}</h3>
                    <p className="text-sm text-gray-500">{selectedGuest.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {selectedGuest.is_banned && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Suspended
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <Users className="h-6 w-6 mx-auto text-gray-400" />
                    <p className="text-2xl font-bold text-gray-900 mt-2">{selectedGuest.total_bookings}</p>
                    <p className="text-sm text-gray-600">Bookings</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <DollarSign className="h-6 w-6 mx-auto text-gray-400" />
                    <p className="text-2xl font-bold text-gray-900 mt-2">${selectedGuest.total_spending.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Spending</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <Star className="h-6 w-6 mx-auto text-yellow-400" />
                    <p className="text-2xl font-bold text-gray-900 mt-2">{selectedGuest.total_reviews}</p>
                    <p className="text-sm text-gray-600">Reviews</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <Star className="h-6 w-6 mx-auto text-yellow-400" />
                    <p className="text-2xl font-bold text-gray-900 mt-2">{selectedGuest.average_rating ? selectedGuest.average_rating.toFixed(1) : 'N/A'}</p>
                    <p className="text-sm text-gray-600">Rating</p>
                  </div>
                </div>

                {/* Verification Status */}
                <div>
                  <h3 className="font-semibold mb-3">Verification Status</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">ID Verified:</span>
                      <span className={`px-2 py-1 text-xs rounded ${selectedGuest.id_verified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {selectedGuest.id_verified ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Email Verified:</span>
                      <span className={`px-2 py-1 text-xs rounded ${selectedGuest.email_verified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {selectedGuest.email_verified ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Phone Verified:</span>
                      <span className={`px-2 py-1 text-xs rounded ${selectedGuest.phone_verified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {selectedGuest.phone_verified ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Risk Assessment */}
                <div>
                  <h3 className="font-semibold mb-3">Risk Assessment</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Risk Score:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskLevel(selectedGuest.risk_score).color}`}>
                        {selectedGuest.risk_score}/100 ({getRiskLevel(selectedGuest.risk_score).label})
                      </span>
                    </div>
                    {selectedGuest.risk_flags.length > 0 && (
                      <div>
                        <span className="text-sm text-gray-600">Risk Flags:</span>
                        <div className="mt-2 space-y-1">
                          {selectedGuest.risk_flags.map((flag, index) => (
                            <div key={index} className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                              {flag}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Banned Reason */}
                {selectedGuest.is_banned && selectedGuest.banned_reason && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                      Suspension Reason
                    </h3>
                    <div className="bg-red-50 rounded-lg p-4">
                      <p className="text-sm text-red-800">{selectedGuest.banned_reason}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  {!selectedGuest.is_banned && (
                    <button
                      onClick={() => {
                        const reason = prompt('Enter suspension reason:')
                        if (reason) handleSuspendGuest(selectedGuest.id, reason)
                      }}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="h-4 w-4 mr-2" />
                      {actionLoading ? 'Suspending...' : 'Suspend Guest'}
                    </button>
                  )}
                  
                  {selectedGuest.is_banned && (
                    <button
                      onClick={() => handleActivateGuest(selectedGuest.id)}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {actionLoading ? 'Activating...' : 'Activate Guest'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
