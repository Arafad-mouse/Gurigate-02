import { useState, useEffect } from 'react'
import { Building2, Users, DollarSign, Star, Check, X, Search, ChevronLeft, ChevronRight, Shield, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AdminService } from '@/services/adminService'

interface Host {
  id: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  avatar_url: string | null
  role: 'guest' | 'host' | 'manager' | 'admin' | 'super_admin'
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected' | 'suspended'
  is_banned: boolean
  banned_reason: string | null
  host_rating?: number
  host_response_rate?: number
  host_response_time?: number
  host_completed_bookings: number
  properties_count: number
  total_revenue: number
  created_at: string
}

export default function AdminHosts() {
  const [hosts, setHosts] = useState<Host[]>([])
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending' | 'unverified' | 'suspended'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedHost, setSelectedHost] = useState<Host | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    loadHosts()
  }, [filter])

  const loadHosts = async () => {
    try {
      setLoading(true)
      const users = await AdminService.getAllUsers('host')
      
      // Enhance with revenue data
      const enhancedHosts = await Promise.all(users.map(async (user) => {
        // Calculate total revenue from bookings
        const { data: bookingsData } = await supabase
          .from('property_bookings')
          .select('total_price')
          .eq('status', 'completed')
        
        // Get properties owned by this host
        const { data: propertiesData } = await supabase
          .from('properties')
          .select('id')
          .eq('owner_id', user.id)
        
        // Get bookings for this host's properties
        let totalRevenue = 0
        if (propertiesData && propertiesData.length > 0) {
          const propertyIds = propertiesData.map(p => p.id)
          const { data: hostBookings } = await supabase
            .from('property_bookings')
            .select('total_price')
            .in('property_id', propertyIds)
            .eq('status', 'completed')
          
          if (hostBookings) {
            totalRevenue = hostBookings.reduce((sum, b) => sum + (b.total_price || 0), 0)
          }
        }
        
        return {
          ...user,
          total_revenue: totalRevenue,
          properties_count: user.properties_count || 0
        }
      }))
      
      setHosts(enhancedHosts)
    } catch (error) {
      console.error('Error loading hosts:', error)
      setNotification({ type: 'error', message: 'Failed to load hosts' })
    } finally {
      setLoading(false)
    }
  }

  const filteredHosts = hosts.filter(h => {
    const matchesStatus = filter === 'all' || h.verification_status === filter
    const matchesSearch = searchQuery === '' || 
      h.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesStatus && matchesSearch
  })

  const totalPages = Math.ceil(filteredHosts.length / itemsPerPage)
  const paginatedHosts = filteredHosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleVerifyHost = async (hostId: string) => {
    setActionLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setNotification({ type: 'error', message: 'Authentication required' })
        return
      }

      await AdminService.verifyHost(hostId, user.id)
      setNotification({ type: 'success', message: 'Host verified successfully' })
      loadHosts()
      setShowModal(false)
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to verify host' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleSuspendHost = async (hostId: string, reason: string) => {
    setActionLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setNotification({ type: 'error', message: 'Authentication required' })
        return
      }

      await AdminService.banUser(hostId, user.id, reason)
      setNotification({ type: 'success', message: 'Host suspended successfully' })
      loadHosts()
      setShowModal(false)
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to suspend host' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleActivateHost = async (hostId: string) => {
    setActionLoading(true)
    try {
      await AdminService.unbanUser(hostId)
      setNotification({ type: 'success', message: 'Host activated successfully' })
      loadHosts()
      setShowModal(false)
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to activate host' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleFeatureHost = async (hostId: string) => {
    setActionLoading(true)
    try {
      // Feature all properties of this host
      const { data: propertiesData } = await supabase
        .from('properties')
        .select('id')
        .eq('owner_id', hostId)
      
      if (propertiesData) {
        await Promise.all(propertiesData.map(property => 
          supabase
            .from('properties')
            .update({ is_featured: true })
            .eq('id', property.id)
        ))
      }
      
      setNotification({ type: 'success', message: 'Host featured successfully' })
      loadHosts()
      setShowModal(false)
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to feature host' })
    } finally {
      setActionLoading(false)
    }
  }

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'unverified': return 'bg-gray-100 text-gray-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'suspended': return 'bg-red-100 text-red-800'
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
          <h1 className="text-2xl font-bold text-gray-900">Hosts</h1>
          <p className="text-gray-600 mt-1">Manage host accounts and verifications</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search hosts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-sm focus:ring-0 w-48"
              aria-label="Search hosts"
            />
          </div>
          
          {/* Status Filter */}
          <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2">
            <Shield className="h-4 w-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-transparent border-none text-sm focus:ring-0"
              aria-label="Filter hosts by verification status"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="unverified">Unverified</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Hosts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Host
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Listings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Bookings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Response Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verification
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
              {paginatedHosts.map((host) => (
                <tr key={host.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#BA0036] flex items-center justify-center text-white font-semibold">
                        {host.first_name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{host.full_name}</div>
                        <div className="text-sm text-gray-500">{host.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Building2 className="h-4 w-4 mr-1 text-gray-400" />
                      {host.properties_count}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Users className="h-4 w-4 mr-1 text-gray-400" />
                      {host.host_completed_bookings}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 flex items-center">
                      <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                      ${host.total_revenue.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-400" />
                      <span className="text-sm text-gray-900">
                        {host.host_rating ? host.host_rating.toFixed(1) : 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {host.host_response_rate ? `${host.host_response_rate}%` : 'N/A'}
                    </div>
                    {host.host_response_time && (
                      <div className="text-xs text-gray-500">{host.host_response_time}h avg</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getVerificationStatusColor(host.verification_status)}`}>
                      {host.verification_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {host.is_banned ? (
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
                        setSelectedHost(host)
                        setShowModal(true)
                      }}
                      className="text-[#BA0036] hover:text-[#a4003a]"
                      title="View details"
                    >
                      View
                    </button>
                    {host.verification_status === 'pending' && (
                      <button
                        onClick={() => handleVerifyHost(host.id)}
                        className="text-green-600 hover:text-green-800"
                        title="Verify host"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredHosts.length)} of {filteredHosts.length} hosts
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

      {/* Host Details Modal */}
      {showModal && selectedHost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Host Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                  title="Close modal"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Host Info */}
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 h-16 w-16 rounded-full bg-[#BA0036] flex items-center justify-center text-white text-2xl font-semibold">
                    {selectedHost.first_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedHost.full_name}</h3>
                    <p className="text-sm text-gray-500">{selectedHost.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVerificationStatusColor(selectedHost.verification_status)}`}>
                        {selectedHost.verification_status}
                      </span>
                      {selectedHost.is_banned && (
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
                    <Building2 className="h-6 w-6 mx-auto text-gray-400" />
                    <p className="text-2xl font-bold text-gray-900 mt-2">{selectedHost.properties_count}</p>
                    <p className="text-sm text-gray-600">Listings</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <Users className="h-6 w-6 mx-auto text-gray-400" />
                    <p className="text-2xl font-bold text-gray-900 mt-2">{selectedHost.host_completed_bookings}</p>
                    <p className="text-sm text-gray-600">Bookings</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <DollarSign className="h-6 w-6 mx-auto text-gray-400" />
                    <p className="text-2xl font-bold text-gray-900 mt-2">${selectedHost.total_revenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Revenue</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <Star className="h-6 w-6 mx-auto text-yellow-400" />
                    <p className="text-2xl font-bold text-gray-900 mt-2">{selectedHost.host_rating ? selectedHost.host_rating.toFixed(1) : 'N/A'}</p>
                    <p className="text-sm text-gray-600">Rating</p>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div>
                  <h3 className="font-semibold mb-3">Performance Metrics</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Response Rate:</span>
                      <span className="text-sm font-medium">{selectedHost.host_response_rate ? `${selectedHost.host_response_rate}%` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Response Time:</span>
                      <span className="text-sm font-medium">{selectedHost.host_response_time ? `${selectedHost.host_response_time} hours` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Completed Bookings:</span>
                      <span className="text-sm font-medium">{selectedHost.host_completed_bookings}</span>
                    </div>
                  </div>
                </div>

                {/* Banned Reason */}
                {selectedHost.is_banned && selectedHost.banned_reason && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                      Suspension Reason
                    </h3>
                    <div className="bg-red-50 rounded-lg p-4">
                      <p className="text-sm text-red-800">{selectedHost.banned_reason}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  {selectedHost.verification_status === 'pending' && (
                    <button
                      onClick={() => handleVerifyHost(selectedHost.id)}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {actionLoading ? 'Verifying...' : 'Verify Host'}
                    </button>
                  )}
                  
                  {!selectedHost.is_banned && (
                    <button
                      onClick={() => {
                        const reason = prompt('Enter suspension reason:')
                        if (reason) handleSuspendHost(selectedHost.id, reason)
                      }}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="h-4 w-4 mr-2" />
                      {actionLoading ? 'Suspending...' : 'Suspend Host'}
                    </button>
                  )}
                  
                  {selectedHost.is_banned && (
                    <button
                      onClick={() => handleActivateHost(selectedHost.id)}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {actionLoading ? 'Activating...' : 'Activate Host'}
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleFeatureHost(selectedHost.id)}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    {actionLoading ? 'Featuring...' : 'Feature All Properties'}
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
