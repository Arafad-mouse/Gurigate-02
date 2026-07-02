import { useState, useEffect } from 'react'
import { Shield, Check, X, Search, ChevronLeft, ChevronRight, FileText, Calendar, User, AlertCircle, Eye } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Verification {
  id: string
  host_id: string
  host_name: string
  host_email: string
  document_type: 'national_id' | 'ownership_certificate' | 'land_title' | 'business_license' | 'hotel_license' | 'other'
  document_url: string
  document_number?: string
  issue_date?: string
  expiry_date?: string
  status: 'pending' | 'verified' | 'rejected' | 'expired'
  reviewed_by?: string
  reviewed_by_name?: string
  reviewed_at?: string
  rejection_reason?: string
  created_at: string
}

export default function AdminVerifications() {
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected' | 'expired'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'national_id' | 'ownership_certificate' | 'land_title' | 'business_license' | 'hotel_license' | 'other'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    loadVerifications()
  }, [filter, typeFilter])

  const loadVerifications = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('host_verifications')
        .select('*')
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      if (typeFilter !== 'all') {
        query = query.eq('document_type', typeFilter)
      }

      const { data, error } = await query

      if (error) {
        // If table doesn't exist, show coming soon
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          setVerifications([])
          setLoading(false)
          return
        }
        throw error
      }

      // Enhance with host information
      const enhancedVerifications = await Promise.all(data.map(async (verification) => {
        const { data: hostData } = await supabase
          .from('profiles')
          .select('first_name, last_name, email')
          .eq('id', verification.host_id)
          .single()
        
        let reviewedByName = ''
        if (verification.reviewed_by) {
          const { data: reviewerData } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', verification.reviewed_by)
            .single()
          if (reviewerData) {
            reviewedByName = `${reviewerData.first_name} ${reviewerData.last_name}`
          }
        }

        return {
          ...verification,
          host_name: hostData ? `${hostData.first_name} ${hostData.last_name}` : 'Unknown',
          host_email: hostData?.email || '',
          reviewed_by_name: reviewedByName
        }
      }))

      setVerifications(enhancedVerifications)
    } catch (error) {
      console.error('Error loading verifications:', error)
      setNotification({ type: 'error', message: 'Failed to load verifications' })
    } finally {
      setLoading(false)
    }
  }

  const filteredVerifications = verifications.filter(v => {
    const matchesStatus = filter === 'all' || v.status === filter
    const matchesType = typeFilter === 'all' || v.document_type === typeFilter
    const matchesSearch = searchQuery === '' || 
      v.host_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.host_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.document_number?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesStatus && matchesType && matchesSearch
  })

  const totalPages = Math.ceil(filteredVerifications.length / itemsPerPage)
  const paginatedVerifications = filteredVerifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleVerify = async (verificationId: string) => {
    setActionLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setNotification({ type: 'error', message: 'Authentication required' })
        return
      }

      const { error } = await supabase.rpc('verify_host_document', {
        p_verification_id: verificationId,
        p_status: 'verified',
        p_reviewed_by: user.id,
        p_rejection_reason: null
      })

      if (error) throw error
      setNotification({ type: 'success', message: 'Document verified successfully' })
      loadVerifications()
      setShowModal(false)
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to verify document' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (verificationId: string, reason: string) => {
    setActionLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setNotification({ type: 'error', message: 'Authentication required' })
        return
      }

      const { error } = await supabase.rpc('verify_host_document', {
        p_verification_id: verificationId,
        p_status: 'rejected',
        p_reviewed_by: user.id,
        p_rejection_reason: reason
      })

      if (error) throw error
      setNotification({ type: 'success', message: 'Document rejected successfully' })
      loadVerifications()
      setShowModal(false)
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to reject document' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleRequestResubmission = async (verificationId: string) => {
    setActionLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setNotification({ type: 'error', message: 'Authentication required' })
        return
      }

      const { error } = await supabase.rpc('verify_host_document', {
        p_verification_id: verificationId,
        p_status: 'pending',
        p_reviewed_by: user.id,
        p_rejection_reason: 'Resubmission requested'
      })

      if (error) throw error
      setNotification({ type: 'success', message: 'Resubmission requested successfully' })
      loadVerifications()
      setShowModal(false)
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to request resubmission' })
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'verified': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'expired': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'national_id': return 'National ID'
      case 'ownership_certificate': return 'Ownership Certificate'
      case 'land_title': return 'Land Title'
      case 'business_license': return 'Business License'
      case 'hotel_license': return 'Hotel License'
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
  if (verifications.length === 0 && !notification) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Verification Center</h2>
          <p className="text-gray-600">This feature is coming soon. Host verification documents will be managed here.</p>
        </div>
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
          <h1 className="text-2xl font-bold text-gray-900">Verification Center</h1>
          <p className="text-gray-600 mt-1">Review and verify host documents</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search verifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-sm focus:ring-0 w-48"
              aria-label="Search verifications"
            />
          </div>
          
          {/* Status Filter */}
          <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2">
            <Shield className="h-4 w-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-transparent border-none text-sm focus:ring-0"
              aria-label="Filter verifications by status"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          
          {/* Type Filter */}
          <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="bg-transparent border-none text-sm focus:ring-0"
              aria-label="Filter verifications by document type"
            >
              <option value="all">All Types</option>
              <option value="national_id">National ID</option>
              <option value="ownership_certificate">Ownership Certificate</option>
              <option value="land_title">Land Title</option>
              <option value="business_license">Business License</option>
              <option value="hotel_license">Hotel License</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Verifications Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Host
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedVerifications.map((verification) => (
                <tr key={verification.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#BA0036] flex items-center justify-center text-white font-semibold">
                        {verification.host_name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{verification.host_name}</div>
                        <div className="text-sm text-gray-500">{verification.host_email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 capitalize">
                      {getDocumentTypeLabel(verification.document_type)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {verification.document_number || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {verification.issue_date ? new Date(verification.issue_date).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {verification.expiry_date ? new Date(verification.expiry_date).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(verification.status)}`}>
                      {verification.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(verification.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => {
                        setSelectedVerification(verification)
                        setShowModal(true)
                      }}
                      className="text-[#BA0036] hover:text-[#a4003a]"
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {verification.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleVerify(verification.id)}
                          className="text-green-600 hover:text-green-800"
                          title="Verify document"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('Enter rejection reason:')
                            if (reason) handleReject(verification.id, reason)
                          }}
                          className="text-red-600 hover:text-red-800"
                          title="Reject document"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    {verification.status === 'rejected' && (
                      <button
                        onClick={() => handleRequestResubmission(verification.id)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Request resubmission"
                      >
                        <FileText className="h-4 w-4" />
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
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredVerifications.length)} of {filteredVerifications.length} verifications
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

      {/* Verification Details Modal */}
      {showModal && selectedVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Verification Details</h2>
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
                    {selectedVerification.host_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedVerification.host_name}</h3>
                    <p className="text-sm text-gray-500">{selectedVerification.host_email}</p>
                  </div>
                </div>

                {/* Document Info */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Document Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Document Type:</span>
                      <span className="text-sm font-medium capitalize">{getDocumentTypeLabel(selectedVerification.document_type)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Document Number:</span>
                      <span className="text-sm font-medium">{selectedVerification.document_number || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Issue Date:</span>
                      <span className="text-sm font-medium">{selectedVerification.issue_date ? new Date(selectedVerification.issue_date).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Expiry Date:</span>
                      <span className="text-sm font-medium">{selectedVerification.expiry_date ? new Date(selectedVerification.expiry_date).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Document Preview */}
                <div>
                  <h3 className="font-semibold mb-3">Document Preview</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <a
                      href={selectedVerification.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#BA0036] hover:text-[#a4003a] flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Document
                    </a>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <h3 className="font-semibold mb-3">Status</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedVerification.status)}`}>
                      {selectedVerification.status}
                    </span>
                  </div>
                </div>

                {/* Rejection Reason */}
                {selectedVerification.rejection_reason && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                      Rejection Reason
                    </h3>
                    <div className="bg-red-50 rounded-lg p-4">
                      <p className="text-sm text-red-800">{selectedVerification.rejection_reason}</p>
                    </div>
                  </div>
                )}

                {/* Review Info */}
                {selectedVerification.reviewed_at && (
                  <div>
                    <h3 className="font-semibold mb-3">Review Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Reviewed By:</span>
                        <span className="text-sm font-medium">{selectedVerification.reviewed_by_name || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Reviewed At:</span>
                        <span className="text-sm font-medium">{new Date(selectedVerification.reviewed_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {selectedVerification.status === 'pending' && (
                  <div className="pt-4 border-t border-gray-200 space-y-3">
                    <button
                      onClick={() => handleVerify(selectedVerification.id)}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {actionLoading ? 'Verifying...' : 'Verify Document'}
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Enter rejection reason:')
                        if (reason) handleReject(selectedVerification.id, reason)
                      }}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="h-4 w-4 mr-2" />
                      {actionLoading ? 'Rejecting...' : 'Reject Document'}
                    </button>
                  </div>
                )}

                {selectedVerification.status === 'rejected' && (
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleRequestResubmission(selectedVerification.id)}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      {actionLoading ? 'Requesting...' : 'Request Resubmission'}
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
