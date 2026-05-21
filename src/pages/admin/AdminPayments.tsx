import { useState } from 'react'
import { CreditCard, DollarSign, Calendar, Check, X, Filter, Eye, Image as ImageIcon } from 'lucide-react'

interface Payment {
  id: string
  booking_id: string
  amount: number
  currency: string
  payment_provider: 'dodo' | 'zaad' | 'edahab' | 'wallet'
  payment_method: string
  status: 'pending' | 'submitted' | 'verified' | 'completed' | 'failed' | 'cancelled'
  proof_image?: string
  wallet_phone?: string
  guest_name: string
  guest_email: string
  property_title: string
  created_at: string
  verified_at?: string
  verified_by?: string
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'verified' | 'failed'>('pending')
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useState(() => {
    setPayments([
      {
        id: '1',
        booking_id: '4523',
        amount: 120,
        currency: 'USD',
        payment_provider: 'zaad',
        payment_method: 'wallet',
        status: 'submitted',
        proof_image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400',
        wallet_phone: '+254712345678',
        guest_name: 'John Doe',
        guest_email: 'john@example.com',
        property_title: 'Luxury 3-Bedroom Villa',
        created_at: '2026-05-08'
      },
      {
        id: '2',
        booking_id: '4524',
        amount: 85,
        currency: 'USD',
        payment_provider: 'edahab',
        payment_method: 'wallet',
        status: 'pending',
        wallet_phone: '+254712345679',
        guest_name: 'Sarah Johnson',
        guest_email: 'sarah@example.com',
        property_title: 'Modern Studio Apartment',
        created_at: '2026-05-07'
      },
      {
        id: '3',
        booking_id: '4525',
        amount: 250,
        currency: 'USD',
        payment_provider: 'dodo',
        payment_method: 'card',
        status: 'verified',
        verified_at: '2026-05-06',
        verified_by: 'Admin User',
        guest_name: 'Emily Chen',
        guest_email: 'emily@example.com',
        property_title: 'Cozy 2-Bedroom Home',
        created_at: '2026-05-06'
      }
    ])
    setLoading(false)
  })

  const filteredPayments = payments.filter(p => 
    filter === 'all' || p.status === filter
  )

  const handleVerifyPayment = (paymentId: string) => {
    console.log('Verify payment:', paymentId)
  }

  const handleRejectPayment = (paymentId: string, reason: string) => {
    console.log('Reject payment:', paymentId, reason)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'submitted': return 'bg-blue-100 text-blue-800'
      case 'verified': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
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
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-1">Verify and monitor all payments</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-transparent border-none text-sm focus:ring-0"
              aria-label="Filter payments by status"
            >
              <option value="pending">Pending</option>
              <option value="submitted">Submitted</option>
              <option value="verified">Verified</option>
              <option value="failed">Failed</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider
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
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">#{payment.booking_id}</div>
                    <div className="text-sm text-gray-500">{payment.property_title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{payment.guest_name}</div>
                    <div className="text-sm text-gray-500">{payment.guest_email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 flex items-center">
                      <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                      {payment.amount} {payment.currency}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 capitalize">{payment.payment_provider}</div>
                    <div className="text-sm text-gray-500">{payment.payment_method}</div>
                    {payment.wallet_phone && (
                      <div className="text-xs text-gray-400">{payment.wallet_phone}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {payment.created_at}
                    </div>
                    {payment.verified_at && (
                      <div className="text-xs text-gray-400 mt-1">
                        Verified: {payment.verified_at}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => {
                        setSelectedPayment(payment)
                        setShowModal(true)
                      }}
                      className="text-[#BA0036] hover:text-[#a4003a]"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {(payment.status === 'submitted' || payment.status === 'pending') && (
                      <>
                        <button
                          onClick={() => handleVerifyPayment(payment.id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('Enter rejection reason:')
                            if (reason) handleRejectPayment(payment.id, reason)
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Details Modal */}
      {showModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Payment Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close modal"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Payment Info */}
              <div className="space-y-6">
                {/* Amount */}
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <p className="text-sm text-gray-600">Payment Amount</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {selectedPayment.amount} {selectedPayment.currency}
                  </p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedPayment.status)}`}>
                    {selectedPayment.status}
                  </span>
                </div>

                {/* Booking Info */}
                <div>
                  <h3 className="font-semibold mb-3">Booking Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Booking ID:</span>
                      <span className="text-sm font-medium">#{selectedPayment.booking_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Property:</span>
                      <span className="text-sm font-medium">{selectedPayment.property_title}</span>
                    </div>
                  </div>
                </div>

                {/* Guest Info */}
                <div>
                  <h3 className="font-semibold mb-3">Guest Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Name:</span>
                      <span className="text-sm font-medium">{selectedPayment.guest_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Email:</span>
                      <span className="text-sm font-medium">{selectedPayment.guest_email}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <h3 className="font-semibold mb-3">Payment Method</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Provider:</span>
                      <span className="text-sm font-medium capitalize">{selectedPayment.payment_provider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Method:</span>
                      <span className="text-sm font-medium capitalize">{selectedPayment.payment_method}</span>
                    </div>
                    {selectedPayment.wallet_phone && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Wallet Phone:</span>
                        <span className="text-sm font-medium">{selectedPayment.wallet_phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Proof Image */}
                {selectedPayment.proof_image && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center">
                      <ImageIcon className="h-5 w-5 mr-2" />
                      Payment Proof
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <img
                        src={selectedPayment.proof_image}
                        alt="Payment proof"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {/* Verification Info */}
                {selectedPayment.verified_at && (
                  <div>
                    <h3 className="font-semibold mb-3">Verification Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Verified At:</span>
                        <span className="text-sm font-medium">{selectedPayment.verified_at}</span>
                      </div>
                      {selectedPayment.verified_by && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Verified By:</span>
                          <span className="text-sm font-medium">{selectedPayment.verified_by}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {(selectedPayment.status === 'submitted' || selectedPayment.status === 'pending') && (
                  <div className="pt-4 border-t border-gray-200 flex space-x-3">
                    <button
                      onClick={() => {
                        handleVerifyPayment(selectedPayment.id)
                        setShowModal(false)
                      }}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Verify Payment
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Enter rejection reason:')
                        if (reason) {
                          handleRejectPayment(selectedPayment.id, reason)
                          setShowModal(false)
                        }
                      }}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject Payment
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
