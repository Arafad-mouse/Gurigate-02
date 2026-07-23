import { useState, useEffect } from 'react'
import { AlertTriangle, Check, X, Search, ChevronLeft, ChevronRight, User, MapPin, Calendar, DollarSign, MessageSquare, UserCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Dispute {
  id: string
  booking_id?: string
  property_id?: string
  property_title?: string
  guest_id?: string
  guest_name?: string
  guest_email?: string
  host_id?: string
  host_name?: string
  host_email?: string
  dispute_type: 'property_misrepresentation' | 'guest_damage' | 'refund_request' | 'payment_issue' | 'host_complaint' | 'other'
  status: 'open' | 'investigating' | 'resolved' | 'closed' | 'escalated'
  title: string
  description: string
  amount_disputed?: number
  resolution?: string
  resolution_amount?: number
  resolved_by?: string
  resolved_by_name?: string
  resolved_at?: string
  assigned_to?: string
  assigned_to_name?: string
  assigned_at?: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  created_at: string
}

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [filter, setFilter] = useState<'all' | 'open' | 'investigating' | 'resolved' | 'closed' | 'escalated'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'property_misrepresentation' | 'guest_damage' | 'refund_request' | 'payment_issue' | 'host_complaint' | 'other'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    loadDisputes()
  }, [filter, typeFilter])

  const loadDisputes = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('disputes')
        .select('*')
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      if (typeFilter !== 'all') {
        query = query.eq('dispute_type', typeFilter)
      }

      const { data, error } = await query

      if (error) {
        // If table doesn't exist, show coming soon
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          setDisputes([])
          setLoading(false)
          return
        }
        throw error
      }

      // Enhance with related information
      const enhancedDisputes = await Promise.all(data.map(async (dispute) => {
        let propertyTitle = ''
        let guestName = ''
        let guestEmail = ''
        let hostName = ''
        let hostEmail = ''
        let assignedToName = ''
        let resolvedByName = ''

        // Get property title
        if (dispute.property_id) {
          const { data: propertyData } = await supabase
            .from('properties')
            .select('title')
            .eq('id', dispute.property_id)
            .single()
          propertyTitle = propertyData?.title || ''
        }

        // Get guest info
        if (dispute.guest_id) {
          const { data: guestData } = await supabase
            .from('profiles')
            .select('first_name, last_name, email')
            .eq('id', dispute.guest_id)
            .single()
          if (guestData) {
            guestName = `${guestData.first_name} ${guestData.last_name}`
            guestEmail = guestData.email
          }
        }

        // Get host info
        if (dispute.host_id) {
          const { data: hostData } = await supabase
            .from('profiles')
            .select('first_name, last_name, email')
            .eq('id', dispute.host_id)
            .single()
          if (hostData) {
            hostName = `${hostData.first_name} ${hostData.last_name}`
            hostEmail = hostData.email
          }
        }

        // Get assigned admin info
        if (dispute.assigned_to) {
          const { data: assignedData } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', dispute.assigned_to)
            .single()
          if (assignedData) {
            assignedToName = `${assignedData.first_name} ${assignedData.last_name}`
          }
        }

        // Get resolver info
        if (dispute.resolved_by) {
          const { data: resolverData } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', dispute.resolved_by)
            .single()
          if (resolverData) {
            resolvedByName = `${resolverData.first_name} ${resolverData.last_name}`
          }
        }

        return {
          ...dispute,
          property_title: propertyTitle,
          guest_name: guestName,
          guest_email: guestEmail,
          host_name: hostName,
          host_email: hostEmail,
          assigned_to_name: assignedToName,
          resolved_by_name: resolvedByName
        }
      }))

      setDisputes(enhancedDisputes)
    } catch (error) {
      console.error('Error loading disputes:', error)
      setNotification({ type: 'error', message: 'Failed to load disputes' })
    } finally {
      setLoading(false)
    }
  }

  const filteredDisputes = disputes.filter(d => {
    const matchesStatus = filter === 'all' || d.status === filter
    const matchesType = typeFilter === 'all' || d.dispute_type === typeFilter
    const matchesSearch = searchQuery === '' || 
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.guest_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.host_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.property_title?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesStatus && matchesType && matchesSearch
  })

  const totalPages = Math.ceil(filteredDisputes.length / itemsPerPage)
  const paginatedDisputes = filteredDisputes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleAssign = async (disputeId: string) => {
    setActionLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setNotification({ type: 'error', message: 'Authentication required' })
        return
      }

      const { error } = await supabase.rpc('assign_dispute', {
        p_dispute_id: disputeId,
        p_assigned_to: user.id
      })

      if (error) throw error
      setNotification({ type: 'success', message: 'Dispute assigned successfully' })
      loadDisputes()
      setShowModal(false)
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to assign dispute' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleResolve = async (disputeId: string, resolution: string, refundAmount?: number) => {
    setActionLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setNotification({ type: 'error', message: 'Authentication required' })
        return
      }

      const { error } = await supabase.rpc('resolve_dispute', {
        p_dispute_id: disputeId,
        p_resolution: resolution,
        p_resolution_amount: refundAmount,
        p_resolved_by: user.id
      })

      if (error) throw error
      setNotification({ type: 'success', message: 'Dispute resolved successfully' })
      loadDisputes()
      setShowModal(false)
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to resolve dispute' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleClose = async (disputeId: string) => {
    setActionLoading(true)
    try {
      const { error } = await supabase
        .from('disputes')
        .update({ status: 'closed' })
        .eq('id', disputeId)

      if (error) throw error
      setNotification({ type: 'success', message: 'Dispute closed successfully' })
      loadDisputes()
      setShowModal(false)
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to close dispute' })
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800'
      case 'investigating': return 'bg-blue-100 text-blue-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      case 'escalated': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800'
      case 'normal': return 'bg-blue-100 text-blue-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'urgent': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDisputeTypeLabel = (type: string) => {
    switch (type) {
      case 'property_misrepresentation': return 'Property Misrepresentation'
      case 'guest_damage': return 'Guest Damage'
      case 'refund_request': return 'Refund Request'
      case 'payment_issue': return 'Payment Issue'
      case 'host_complaint': return 'Host Complaint'
      case 'other': return 'Other'
      default: return type
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#BA0036]"></div>
      </div>
    )
  }

  // Show coming soon if table doesn't exist
  if (disputes.length === 0 && !notification) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Dispute Resolution Center</h2>
          <p className="text-gray-600">This feature is coming soon. Booking disputes will be managed here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`rounded-lg p-4 flex items-center ${notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {notification.type === 'success' ? <Check className="h-5 w-5 mr-2" /> : <AlertTriangle className="h-5 w-5 mr-2" />}
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
          <h1 className="text-2xl font-bold text-gray-900">Disputes</h1>
          <p className="text-gray-600 mt-1">Manage and resolve booking disputes</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search disputes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-sm focus:ring-0 w-48"
              aria-label="Search disputes"
            />
          </div>
          
          {/* Status Filter */}
          <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2">
            <AlertTriangle className="h-4 w-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-transparent border-none text-sm focus:ring-0"
              aria-label="Filter disputes by status"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
              <option value="escalated">Escalated</option>
            </select>
          </div>
          
          {/* Type Filter */}
          <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="bg-transparent border-none text-sm focus:ring-0"
              aria-label="Filter disputes by type"
            >
              <option value="all">All Types</option>
              <option value="property_misrepresentation">Property Misrepresentation</option>
              <option value="guest_damage">Guest Damage</option>
              <option value="refund_request">Refund Request</option>
              <option value="payment_issue">Payment Issue</option>
              <option value="host_complaint">Host Complaint</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Disputes Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dispute ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Host
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedDisputes.map((dispute) => (
                <tr key={dispute.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">#{dispute.id.slice(0, 8)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getDisputeTypeLabel(dispute.dispute_type)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{dispute.property_title || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{dispute.guest_name || 'N/A'}</div>
                    {dispute.guest_email && (
                      <div className="text-xs text-gray-500">{dispute.guest_email}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{dispute.host_name || 'N/A'}</div>
                    {dispute.host_email && (
                      <div className="text-xs text-gray-500">{dispute.host_email}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {dispute.amount_disputed ? (
                      <div className="text-sm font-medium text-gray-900 flex items-center">
                        <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                        ${dispute.amount_disputed.toLocaleString()}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(dispute.priority)}`}>
                      {dispute.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(dispute.status)}`}>
                      {dispute.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {dispute.assigned_to_name || 'Unassigned'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(dispute.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => {
                        setSelectedDispute(dispute)
                        setShowModal(true)
                      }}
                      className="text-[#BA0036] hover:text-[#a4003a]"
                      title="View details"
                    >
                      View
                    </button>
                    {dispute.status === 'open' && !dispute.assigned_to && (
                      <button
                        onClick={() => handleAssign(dispute.id)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Assign to me"
                      >
                        <UserCheck className="h-4 w-4" />
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
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredDisputes.length)} of {filteredDisputes.length} disputes
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

      {/* Dispute Details Modal */}
      {showModal && selectedDispute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Dispute Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                  title="Close modal"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Dispute Info */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{selectedDispute.title}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedDispute.status)}`}>
                        {selectedDispute.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedDispute.priority)}`}>
                        {selectedDispute.priority}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{selectedDispute.description}</p>
                  {selectedDispute.amount_disputed && (
                    <div className="mt-4 flex items-center">
                      <DollarSign className="h-5 w-5 mr-2 text-gray-400" />
                      <span className="text-2xl font-bold text-gray-900">${selectedDispute.amount_disputed.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Parties Involved */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Guest
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="text-sm font-medium">{selectedDispute.guest_name || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{selectedDispute.guest_email || ''}</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Host
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="text-sm font-medium">{selectedDispute.host_name || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{selectedDispute.host_email || ''}</div>
                    </div>
                  </div>
                </div>

                {/* Property Info */}
                {selectedDispute.property_title && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      Property
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm font-medium">{selectedDispute.property_title}</div>
                    </div>
                  </div>
                )}

                {/* Assignment Info */}
                <div>
                  <h3 className="font-semibold mb-3">Assignment</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Assigned To:</span>
                      <span className="text-sm font-medium">{selectedDispute.assigned_to_name || 'Unassigned'}</span>
                    </div>
                    {selectedDispute.assigned_at && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Assigned At:</span>
                        <span className="text-sm font-medium">{new Date(selectedDispute.assigned_at).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Resolution Info */}
                {selectedDispute.resolution && (
                  <div>
                    <h3 className="font-semibold mb-3">Resolution</h3>
                    <div className="bg-green-50 rounded-lg p-4 space-y-2">
                      <div className="text-sm text-gray-900">{selectedDispute.resolution}</div>
                      {selectedDispute.resolution_amount && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Refund Amount:</span>
                          <span className="text-sm font-medium">${selectedDispute.resolution_amount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Resolved By:</span>
                        <span className="text-sm font-medium">{selectedDispute.resolved_by_name || 'Unknown'}</span>
                      </div>
                      {selectedDispute.resolved_at && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Resolved At:</span>
                          <span className="text-sm font-medium">{new Date(selectedDispute.resolved_at).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {selectedDispute.status === 'open' && (
                  <div className="pt-4 border-t border-gray-200 space-y-3">
                    {!selectedDispute.assigned_to && (
                      <button
                        onClick={() => handleAssign(selectedDispute.id)}
                        disabled={actionLoading}
                        className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        {actionLoading ? 'Assigning...' : 'Assign to Me'}
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        const resolution = prompt('Enter resolution details:')
                        if (resolution) {
                          const refundAmount = selectedDispute.amount_disputed ? parseFloat(prompt('Enter refund amount (optional):', selectedDispute.amount_disputed.toString()) || '0') : undefined
                          handleResolve(selectedDispute.id, resolution, refundAmount)
                        }
                      }}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {actionLoading ? 'Resolving...' : 'Resolve Dispute'}
                    </button>
                  </div>
                )}

                {selectedDispute.status === 'investigating' && (
                  <div className="pt-4 border-t border-gray-200 space-y-3">
                    <button
                      onClick={() => {
                        const resolution = prompt('Enter resolution details:')
                        if (resolution) {
                          const refundAmount = selectedDispute.amount_disputed ? parseFloat(prompt('Enter refund amount (optional):', selectedDispute.amount_disputed.toString()) || '0') : undefined
                          handleResolve(selectedDispute.id, resolution, refundAmount)
                        }
                      }}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {actionLoading ? 'Resolving...' : 'Resolve Dispute'}
                    </button>
                    
                    <button
                      onClick={() => handleClose(selectedDispute.id)}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="h-4 w-4 mr-2" />
                      {actionLoading ? 'Closing...' : 'Close Dispute'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
