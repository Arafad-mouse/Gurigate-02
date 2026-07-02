import { useState, useEffect } from 'react'
import { DollarSign, Calendar, Check, X, Filter, Eye, Search, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Transaction {
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
  transaction_type: 'booking_payment' | 'host_payout' | 'platform_commission' | 'refund' | 'dispute_resolution' | 'adjustment'
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'disputed'
  amount: number
  currency: string
  platform_commission: number
  host_payout: number
  payment_method?: 'zaad' | 'edahab' | 'premier_wallet' | 'wadaag_pay' | 'bank_transfer' | 'card'
  payment_reference?: string
  notes?: string
  processed_by?: string
  processed_at?: string
  created_at: string
}

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'disputed'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'booking_payment' | 'host_payout' | 'platform_commission' | 'refund' | 'dispute_resolution' | 'adjustment'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    loadTransactions()
  }, [filter, typeFilter])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('transactions')
        .select(`
          id,
          booking_id,
          property_id,
          guest_id,
          host_id,
          transaction_type,
          status,
          amount,
          currency,
          platform_commission,
          host_payout,
          payment_method,
          payment_reference,
          notes,
          processed_by,
          processed_at,
          created_at
        `)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      if (typeFilter !== 'all') {
        query = query.eq('transaction_type', typeFilter)
      }

      const { data, error } = await query

      if (error) throw error

      // Enhance with related data
      const enhancedTransactions = await Promise.all(data.map(async (transaction) => {
        let propertyTitle = ''
        let guestName = ''
        let guestEmail = ''
        let hostName = ''
        let hostEmail = ''

        // Get property title
        if (transaction.property_id) {
          const { data: propertyData } = await supabase
            .from('properties')
            .select('title')
            .eq('id', transaction.property_id)
            .single()
          propertyTitle = propertyData?.title || ''
        }

        // Get guest info
        if (transaction.guest_id) {
          const { data: guestData } = await supabase
            .from('profiles')
            .select('first_name, last_name, email')
            .eq('id', transaction.guest_id)
            .single()
          if (guestData) {
            guestName = `${guestData.first_name} ${guestData.last_name}`
            guestEmail = guestData.email
          }
        }

        // Get host info
        if (transaction.host_id) {
          const { data: hostData } = await supabase
            .from('profiles')
            .select('first_name, last_name, email')
            .eq('id', transaction.host_id)
            .single()
          if (hostData) {
            hostName = `${hostData.first_name} ${hostData.last_name}`
            hostEmail = hostData.email
          }
        }

        return {
          ...transaction,
          property_title: propertyTitle,
          guest_name: guestName,
          guest_email: guestEmail,
          host_name: hostName,
          host_email: hostEmail
        }
      }))

      setTransactions(enhancedTransactions)
    } catch (error) {
      console.error('Error loading transactions:', error)
      setNotification({ type: 'error', message: 'Failed to load transactions' })
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = transactions.filter(t => {
    const matchesStatus = filter === 'all' || t.status === filter
    const matchesType = typeFilter === 'all' || t.transaction_type === typeFilter
    const matchesSearch = searchQuery === '' || 
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.guest_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.host_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.property_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.payment_reference?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesStatus && matchesType && matchesSearch
  })

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleProcessTransaction = async (transactionId: string) => {
    setActionLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setNotification({ type: 'error', message: 'Authentication required' })
        return
      }

      const { error } = await supabase.rpc('process_transaction', {
        p_transaction_id: transactionId,
        p_processed_by: user.id
      })

      if (error) throw error
      setNotification({ type: 'success', message: 'Transaction processed successfully' })
      loadTransactions()
      setShowModal(false)
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to process transaction' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Booking ID', 'Property', 'Guest', 'Host', 'Type', 'Amount', 'Currency', 'Commission', 'Host Payout', 'Payment Method', 'Status', 'Date']
    const rows = filteredTransactions.map(t => [
      t.id,
      t.booking_id || '',
      t.property_title || '',
      t.guest_name || '',
      t.host_name || '',
      t.transaction_type,
      t.amount,
      t.currency,
      t.platform_commission,
      t.host_payout,
      t.payment_method || '',
      t.status,
      t.created_at
    ])

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'refunded': return 'bg-orange-100 text-orange-800'
      case 'disputed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'booking_payment': return 'bg-blue-100 text-blue-800'
      case 'host_payout': return 'bg-green-100 text-green-800'
      case 'platform_commission': return 'bg-purple-100 text-purple-800'
      case 'refund': return 'bg-orange-100 text-orange-800'
      case 'dispute_resolution': return 'bg-red-100 text-red-800'
      case 'adjustment': return 'bg-gray-100 text-gray-800'
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
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">Manage all platform transactions and payouts</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-sm focus:ring-0 w-48"
              aria-label="Search transactions"
            />
          </div>
          
          {/* Status Filter */}
          <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-transparent border-none text-sm focus:ring-0"
              aria-label="Filter transactions by status"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
              <option value="disputed">Disputed</option>
            </select>
          </div>
          
          {/* Type Filter */}
          <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="bg-transparent border-none text-sm focus:ring-0"
              aria-label="Filter transactions by type"
            >
              <option value="all">All Types</option>
              <option value="booking_payment">Booking Payment</option>
              <option value="host_payout">Host Payout</option>
              <option value="platform_commission">Platform Commission</option>
              <option value="refund">Refund</option>
              <option value="dispute_resolution">Dispute Resolution</option>
              <option value="adjustment">Adjustment</option>
            </select>
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50"
            title="Export to CSV"
          >
            <Download className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Export</span>
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
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
                  Commission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Host Payout
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
              {paginatedTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">#{transaction.id.slice(0, 8)}</div>
                    {transaction.booking_id && (
                      <div className="text-xs text-gray-500">Booking: #{transaction.booking_id.slice(0, 8)}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getTypeColor(transaction.transaction_type)}`}>
                      {transaction.transaction_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{transaction.property_title || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{transaction.guest_name || 'N/A'}</div>
                    {transaction.guest_email && (
                      <div className="text-xs text-gray-500">{transaction.guest_email}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{transaction.host_name || 'N/A'}</div>
                    {transaction.host_email && (
                      <div className="text-xs text-gray-500">{transaction.host_email}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 flex items-center">
                      <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                      {transaction.amount} {transaction.currency}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {transaction.platform_commission} {transaction.currency}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {transaction.host_payout} {transaction.currency}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 capitalize">
                      {transaction.payment_method?.replace('_', ' ') || 'N/A'}
                    </div>
                    {transaction.payment_reference && (
                      <div className="text-xs text-gray-500">{transaction.payment_reference}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => {
                        setSelectedTransaction(transaction)
                        setShowModal(true)
                      }}
                      className="text-[#BA0036] hover:text-[#a4003a]"
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {transaction.status === 'pending' && (
                      <button
                        onClick={() => handleProcessTransaction(transaction.id)}
                        className="text-green-600 hover:text-green-800"
                        title="Process transaction"
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
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
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

      {/* Transaction Details Modal */}
      {showModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Transaction Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                  title="Close modal"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Transaction Info */}
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <p className="text-sm text-gray-600">Transaction Amount</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {selectedTransaction.amount} {selectedTransaction.currency}
                  </p>
                  <div className="flex items-center justify-center space-x-2 mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedTransaction.status)}`}>
                      {selectedTransaction.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(selectedTransaction.transaction_type)}`}>
                      {selectedTransaction.transaction_type.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Booking Info */}
                {selectedTransaction.booking_id && (
                  <div>
                    <h3 className="font-semibold mb-3">Booking Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Booking ID:</span>
                        <span className="text-sm font-medium">#{selectedTransaction.booking_id.slice(0, 8)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Property:</span>
                        <span className="text-sm font-medium">{selectedTransaction.property_title || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Guest Info */}
                {selectedTransaction.guest_name && (
                  <div>
                    <h3 className="font-semibold mb-3">Guest Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Name:</span>
                        <span className="text-sm font-medium">{selectedTransaction.guest_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="text-sm font-medium">{selectedTransaction.guest_email}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Host Info */}
                {selectedTransaction.host_name && (
                  <div>
                    <h3 className="font-semibold mb-3">Host Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Name:</span>
                        <span className="text-sm font-medium">{selectedTransaction.host_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="text-sm font-medium">{selectedTransaction.host_email}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Financial Breakdown */}
                <div>
                  <h3 className="font-semibold mb-3">Financial Breakdown</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Amount:</span>
                      <span className="text-sm font-medium">{selectedTransaction.amount} {selectedTransaction.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Platform Commission:</span>
                      <span className="text-sm font-medium">{selectedTransaction.platform_commission} {selectedTransaction.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Host Payout:</span>
                      <span className="text-sm font-medium">{selectedTransaction.host_payout} {selectedTransaction.currency}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                {selectedTransaction.payment_method && (
                  <div>
                    <h3 className="font-semibold mb-3">Payment Method</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Method:</span>
                        <span className="text-sm font-medium capitalize">{selectedTransaction.payment_method.replace('_', ' ')}</span>
                      </div>
                      {selectedTransaction.payment_reference && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Reference:</span>
                          <span className="text-sm font-medium">{selectedTransaction.payment_reference}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedTransaction.notes && (
                  <div>
                    <h3 className="font-semibold mb-3">Notes</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">{selectedTransaction.notes}</p>
                    </div>
                  </div>
                )}

                {/* Processing Info */}
                {selectedTransaction.processed_at && (
                  <div>
                    <h3 className="font-semibold mb-3">Processing Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Processed At:</span>
                        <span className="text-sm font-medium">{new Date(selectedTransaction.processed_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {selectedTransaction.status === 'pending' && (
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleProcessTransaction(selectedTransaction.id)}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {actionLoading ? 'Processing...' : 'Process Transaction'}
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
