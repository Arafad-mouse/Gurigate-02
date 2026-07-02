import { useState, useEffect } from 'react'
import { Bell, Send, Search, ChevronLeft, ChevronRight, Check, X, Filter, UserRoundPen, Building2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Notification {
  id: string
  title: string
  message: string
  type: 'system_update' | 'promotion' | 'verification_alert' | 'booking_alert' | 'payment_alert' | 'other'
  target_audience: 'all' | 'hosts' | 'guests' | 'commercial_owners' | 'hospitality_owners'
  created_at: string
  created_by?: string
  created_by_name?: string
  sent_count?: number
  read_count?: number
}

type NotificationFilter = 'all' | 'system_update' | 'promotion' | 'verification_alert' | 'booking_alert' | 'payment_alert' | 'other'
type AudienceFilter = 'hosts' | 'guests' | 'commercial_owners' | 'hospitality_owners'
type CombinedFilter = NotificationFilter | AudienceFilter

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<CombinedFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Create form state
  const [createForm, setCreateForm] = useState<{
    title: string
    message: string
    type: Notification['type']
    target_audience: Notification['target_audience']
  }>({
    title: '',
    message: '',
    type: 'system_update',
    target_audience: 'all'
  })

  useEffect(() => {
    loadNotifications()
  }, [filter])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('type', filter)
      }

      const { data, error } = await query

      if (error) {
        // If table doesn't exist, show coming soon
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          setNotifications([])
          setLoading(false)
          return
        }
        throw error
      }

      // Enhance with creator information
      const enhancedNotifications = await Promise.all(data.map(async (notif) => {
        let createdByName = ''
        if (notif.created_by) {
          const { data: creatorData } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', notif.created_by)
            .single()
          if (creatorData) {
            createdByName = `${creatorData.first_name} ${creatorData.last_name}`
          }
        }

        // Get recipient counts
        const { count: sentCount } = await supabase
          .from('notification_recipients')
          .select('*', { count: 'exact', head: true })
          .eq('notification_id', notif.id)

        const { count: readCount } = await supabase
          .from('notification_recipients')
          .select('*', { count: 'exact', head: true })
          .eq('notification_id', notif.id)
          .eq('status', 'read')

        return {
          ...notif,
          created_by_name: createdByName,
          sent_count: sentCount || 0,
          read_count: readCount || 0
        }
      }))

      setNotifications(enhancedNotifications)
    } catch (error) {
      console.error('Error loading notifications:', error)
      setNotification({ type: 'error', message: 'Failed to load notifications' })
    } finally {
      setLoading(false)
    }
  }

  const filteredNotifications = notifications.filter(n => {
    const matchesType = filter === 'all' || n.type === filter
    const matchesSearch = searchQuery === '' || 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesType && matchesSearch
  })

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage)
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSendNotification = async () => {
    setActionLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setNotification({ type: 'error', message: 'Authentication required' })
        return
      }

      // Create notification
      const { data: notificationData, error: notificationError } = await supabase
        .from('notifications')
        .insert({
          title: createForm.title,
          message: createForm.message,
          type: createForm.type,
          target_audience: createForm.target_audience,
          created_by: user.id
        })
        .select()
        .single()

      if (notificationError) throw notificationError

      // Get recipients based on target audience
      let recipientQuery = supabase.from('profiles').select('id')
      
      const audience = createForm.target_audience
      if (audience === 'hosts') {
        recipientQuery = recipientQuery.eq('role', 'host')
      } else if (audience === 'guests') {
        recipientQuery = recipientQuery.eq('role', 'guest')
      } else if (audience === 'commercial_owners') {
        // Get hosts with commercial properties
        const { data: commercialHosts } = await supabase
          .from('properties')
          .select('owner_id')
          .eq('property_category', 'commercial')
        const commercialHostIds = commercialHosts?.map(p => p.owner_id) || []
        recipientQuery = recipientQuery.in('id', commercialHostIds)
      } else if (audience === 'hospitality_owners') {
        // Get hosts with hospitality properties
        const { data: hospitalityHosts } = await supabase
          .from('properties')
          .select('owner_id')
          .eq('property_category', 'hospitality')
        const hospitalityHostIds = hospitalityHosts?.map(p => p.owner_id) || []
        recipientQuery = recipientQuery.in('id', hospitalityHostIds)
      }
      // else: all users (no filter)

      const { data: recipients } = await recipientQuery

      // Create notification recipients
      if (recipients && recipients.length > 0) {
        const recipientData = recipients.map(r => ({
          notification_id: notificationData.id,
          recipient_id: r.id,
          status: 'pending',
          channel: 'in_app'
        }))

        await supabase.from('notification_recipients').insert(recipientData)
      }

      setNotification({ type: 'success', message: `Notification sent to ${recipients?.length || 0} recipients` })
      setCreateForm({ title: '', message: '', type: 'system_update', target_audience: 'all' })
      setShowCreateModal(false)
      loadNotifications()
    } catch (error) {
      console.error('Error sending notification:', error)
      setNotification({ type: 'error', message: 'Failed to send notification' })
    } finally {
      setActionLoading(false)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'system_update': return 'bg-blue-100 text-blue-800'
      case 'promotion': return 'bg-purple-100 text-purple-800'
      case 'verification_alert': return 'bg-yellow-100 text-yellow-800'
      case 'booking_alert': return 'bg-green-100 text-green-800'
      case 'payment_alert': return 'bg-orange-100 text-orange-800'
      case 'other': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAudienceLabel = (audience: string) => {
    switch (audience) {
      case 'all': return 'All Users'
      case 'hosts': return 'Hosts'
      case 'guests': return 'Guests'
      case 'commercial_owners': return 'Commercial Owners'
      case 'hospitality_owners': return 'Hospitality Owners'
      default: return audience
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
  if (notifications.length === 0 && !notification) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Bell className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Notification Center</h2>
          <p className="text-gray-600">This feature is coming soon. Platform notifications will be managed here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`rounded-lg p-4 flex items-center ${notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {notification.type === 'success' ? <Check className="h-5 w-5 mr-2" /> : <X className="h-5 w-5 mr-2" />}
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
          <h1 className="text-2xl font-bold text-gray-900">Notification Center</h1>
          <p className="text-gray-600 mt-1">Send and manage platform notifications</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-sm focus:ring-0 w-48"
              aria-label="Search notifications"
            />
          </div>
          
          {/* Type Filter */}
          <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-transparent border-none text-sm focus:ring-0"
              aria-label="Filter notifications by type"
            >
              <option value="all">All Types</option>
              <option value="system_update">System Update</option>
              <option value="promotion">Promotion</option>
              <option value="verification_alert">Verification Alert</option>
              <option value="booking_alert">Booking Alert</option>
              <option value="payment_alert">Payment Alert</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Create Notification */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-[#BA0036] text-white rounded-lg px-4 py-2 hover:bg-[#a4003a]"
          >
            <Send className="h-4 w-4" />
            <span className="text-sm">Send Notification</span>
          </button>
        </div>
      </div>

      {/* Notifications Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Audience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Read
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedNotifications.map((notif) => (
                <tr key={notif.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{notif.title}</div>
                    <div className="text-xs text-gray-500 truncate max-w-xs">{notif.message}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(notif.type)}`}>
                      {notif.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{getAudienceLabel(notif.target_audience)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{notif.sent_count || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{notif.read_count || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{notif.created_by_name || 'System'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(notif.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => {
                        setSelectedNotification(notif)
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
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredNotifications.length)} of {filteredNotifications.length} notifications
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

      {/* Notification Details Modal */}
      {showModal && selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Notification Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                  title="Close modal"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Notification Info */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedNotification.title}</h3>
                  <p className="text-sm text-gray-600">{selectedNotification.message}</p>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-3">Type</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(selectedNotification.type)}`}>
                        {selectedNotification.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Audience</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm font-medium">{getAudienceLabel(selectedNotification.target_audience)}</div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-3">Delivery Stats</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Sent:</span>
                        <span className="text-sm font-medium">{selectedNotification.sent_count || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Read:</span>
                        <span className="text-sm font-medium">{selectedNotification.read_count || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Read Rate:</span>
                        <span className="text-sm font-medium">
                          {selectedNotification.sent_count ? ((selectedNotification.read_count || 0) / selectedNotification.sent_count * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Created By</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm font-medium">{selectedNotification.created_by_name || 'System'}</div>
                      <div className="text-xs text-gray-500 mt-1">{new Date(selectedNotification.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Notification Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Send Notification</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                  title="Close modal"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    placeholder="Enter notification title"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    value={createForm.message}
                    onChange={(e) => setCreateForm({ ...createForm, message: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    rows={4}
                    placeholder="Enter notification message"
                  />
                </div>

                {/* Type */}
                <div>
                  <label htmlFor="notification-type" className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    id="notification-type"
                    value={createForm.type}
                    onChange={(e) => setCreateForm({ ...createForm, type: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  >
                    <option value="system_update">System Update</option>
                    <option value="promotion">Promotion</option>
                    <option value="verification_alert">Verification Alert</option>
                    <option value="booking_alert">Booking Alert</option>
                    <option value="payment_alert">Payment Alert</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Target Audience */}
                <div>
                  <label htmlFor="target-audience" className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                  <select
                    id="target-audience"
                    value={createForm.target_audience}
                    onChange={(e) => setCreateForm({ ...createForm, target_audience: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  >
                    <option value="all">All Users</option>
                    <option value="hosts">Hosts</option>
                    <option value="guests">Guests</option>
                    <option value="commercial_owners">Commercial Owners</option>
                    <option value="hospitality_owners">Hospitality Owners</option>
                  </select>
                </div>

                {/* Audience Icons */}
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  {(() => {
                    const audience = createForm.target_audience
                    if (audience === 'all') {
                      return (
                        <div className="flex items-center">
                          <UserRoundPen className="h-4 w-4 mr-1" />
                          <span>All users will receive this notification</span>
                        </div>
                      )
                    }
                    if (audience === 'hosts') {
                      return (
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 mr-1" />
                          <span>All hosts will receive this notification</span>
                        </div>
                      )
                    }
                    if (audience === 'guests') {
                      return (
                        <div className="flex items-center">
                          <UserRoundPen className="h-4 w-4 mr-1" />
                          <span>All guests will receive this notification</span>
                        </div>
                      )
                    }
                    return null
                  })()}
                </div>

                {/* Send Button */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleSendNotification}
                    disabled={actionLoading || !createForm.title || !createForm.message}
                    className="w-full flex items-center justify-center px-4 py-2 bg-[#BA0036] text-white rounded-lg hover:bg-[#a4003a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {actionLoading ? 'Sending...' : 'Send Notification'}
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
