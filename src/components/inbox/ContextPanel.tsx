import { useState, useEffect } from 'react'
import type { UserConversation } from '@/services/messagingService'
import { MessagingService } from '@/services/messagingService'
import { Calendar, MapPin, CreditCard, User as UserIcon, Activity, X, MessageSquare, Link, Archive, Eye, Ban, CheckCircle, AlertCircle, FileText } from 'lucide-react'

interface ContextPanelProps {
  conversation: UserConversation
  onClose: () => void
}

export default function ContextPanel({ conversation, onClose }: ContextPanelProps) {
  const [bookingContext, setBookingContext] = useState<any>(null)
  const [propertyContext, setPropertyContext] = useState<any>(null)
  const [paymentContext, setPaymentContext] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadContext = async () => {
      setLoading(true)
      try {
        if (conversation.related_booking_id) {
          const booking = await MessagingService.getBookingContext(conversation.related_booking_id)
          setBookingContext(booking)
        }
        if (conversation.related_property_id) {
          const property = await MessagingService.getPropertyContext(conversation.related_property_id)
          setPropertyContext(property)
        }
        if (conversation.related_payment_id) {
          const payment = await MessagingService.getPaymentContext(conversation.related_payment_id)
          setPaymentContext(payment)
        }
      } catch (err) {
        console.error('Failed to load context:', err)
      } finally {
        setLoading(false)
      }
    }

    loadContext()
  }, [conversation])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Context</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      {/* Activity Card */}
      <div className="p-4 border-b border-gray-200">
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4 text-[#E8344E]" />
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Activity</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Created</span>
              <span className="text-gray-900">{formatDate(conversation.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Last Activity</span>
              <span className="text-gray-900">{formatDate(conversation.updated_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Participants</span>
              <span className="text-gray-900">{conversation.participant_count}</span>
            </div>
            {conversation.related_booking_id && (
              <div className="flex justify-between">
                <span className="text-gray-500">Related Booking</span>
                <span className="text-[#E8344E] font-medium">Yes</span>
              </div>
            )}
            {conversation.related_property_id && (
              <div className="flex justify-between">
                <span className="text-gray-500">Related Property</span>
                <span className="text-[#E8344E] font-medium">Yes</span>
              </div>
            )}
            {conversation.related_payment_id && (
              <div className="flex justify-between">
                <span className="text-gray-500">Related Payment</span>
                <span className="text-[#E8344E] font-medium">Yes</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="h-4 w-4 text-gray-600" />
          <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Timeline</h3>
        </div>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-[#E8344E] flex items-center justify-center flex-shrink-0">
              <MessageSquare className="h-3 w-3 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-900">Conversation Created</p>
              <p className="text-xs text-gray-500">{formatDate(conversation.created_at)}</p>
            </div>
          </div>
          {conversation.related_booking_id && (
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                <Link className="h-3 w-3 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-900">Booking Linked</p>
                <p className="text-xs text-gray-500">{formatDate(conversation.created_at)}</p>
              </div>
            </div>
          )}
          {conversation.related_property_id && (
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-3 w-3 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-900">Property Linked</p>
                <p className="text-xs text-gray-500">{formatDate(conversation.created_at)}</p>
              </div>
            </div>
          )}
          {conversation.related_payment_id && (
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                <CreditCard className="h-3 w-3 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-900">Payment Linked</p>
                <p className="text-xs text-gray-500">{formatDate(conversation.created_at)}</p>
              </div>
            </div>
          )}
          {conversation.status === 'closed' && (
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center flex-shrink-0">
                <Archive className="h-3 w-3 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-900">Conversation Closed</p>
                <p className="text-xs text-gray-500">{formatDate(conversation.updated_at)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Context Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#E8344E]"></div>
          </div>
        )}

        {/* Booking Context */}
        {bookingContext && (
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-900">Booking Details</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Check-in</span>
                <span className="text-gray-900">{formatDate(bookingContext.check_in)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Check-out</span>
                <span className="text-gray-900">{formatDate(bookingContext.check_out)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total</span>
                <span className="text-gray-900 font-medium">
                  ${bookingContext.total_price} {bookingContext.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="text-blue-600 font-medium capitalize">{bookingContext.status}</span>
              </div>
              {bookingContext.profiles && (
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-900">
                      {bookingContext.profiles.first_name} {bookingContext.profiles.last_name}
                    </span>
                  </div>
                </div>
              )}
            </div>
            {/* Quick Actions */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-700 mb-2">Quick Actions</p>
              <div className="grid grid-cols-3 gap-2">
                <button className="flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs text-gray-700 transition-colors">
                  <Eye className="h-3 w-3" />
                  View
                </button>
                <button className="flex items-center justify-center gap-1 px-2 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg text-xs text-red-700 transition-colors">
                  <Ban className="h-3 w-3" />
                  Cancel
                </button>
                <button className="flex items-center justify-center gap-1 px-2 py-1.5 bg-orange-50 hover:bg-orange-100 rounded-lg text-xs text-orange-700 transition-colors">
                  <AlertCircle className="h-3 w-3" />
                  Dispute
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Property Context */}
        {propertyContext && (
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4 text-green-600" />
              <h3 className="text-sm font-semibold text-gray-900">Property Details</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-gray-500 block mb-1">Title</span>
                <span className="text-gray-900 font-medium">{propertyContext.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Type</span>
                <span className="text-gray-900 capitalize">{propertyContext.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">City</span>
                <span className="text-gray-900">{propertyContext.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Price</span>
                <span className="text-gray-900 font-medium">
                  ${propertyContext.price} {propertyContext.currency}/night
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="text-green-600 font-medium capitalize">{propertyContext.approval_status}</span>
              </div>
            </div>
            {/* Quick Actions */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-700 mb-2">Quick Actions</p>
              <div className="grid grid-cols-3 gap-2">
                <button className="flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs text-gray-700 transition-colors">
                  <Eye className="h-3 w-3" />
                  View
                </button>
                <button className="flex items-center justify-center gap-1 px-2 py-1.5 bg-green-50 hover:bg-green-100 rounded-lg text-xs text-green-700 transition-colors">
                  <CheckCircle className="h-3 w-3" />
                  Approve
                </button>
                <button className="flex items-center justify-center gap-1 px-2 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg text-xs text-red-700 transition-colors">
                  <Ban className="h-3 w-3" />
                  Suspend
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Context */}
        {paymentContext && (
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-4 w-4 text-purple-600" />
              <h3 className="text-sm font-semibold text-gray-900">Payment Details</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Amount</span>
                <span className="text-gray-900 font-medium">
                  ${paymentContext.amount} {paymentContext.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="text-gray-900 capitalize">{paymentContext.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Provider</span>
                <span className="text-gray-900 capitalize">{paymentContext.payment_provider}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="text-purple-600 font-medium capitalize">{paymentContext.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="text-gray-900">{formatDate(paymentContext.created_at)}</span>
              </div>
            </div>
            {/* Quick Actions */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-700 mb-2">Quick Actions</p>
              <div className="grid grid-cols-3 gap-2">
                <button className="flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs text-gray-700 transition-colors">
                  <Eye className="h-3 w-3" />
                  View
                </button>
                <button className="flex items-center justify-center gap-1 px-2 py-1.5 bg-green-50 hover:bg-green-100 rounded-lg text-xs text-green-700 transition-colors">
                  <CheckCircle className="h-3 w-3" />
                  Verify
                </button>
                <button className="flex items-center justify-center gap-1 px-2 py-1.5 bg-purple-50 hover:bg-purple-100 rounded-lg text-xs text-purple-700 transition-colors">
                  <FileText className="h-3 w-3" />
                  Proof
                </button>
              </div>
            </div>
          </div>
        )}

        {!loading && !bookingContext && !propertyContext && !paymentContext && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">No additional context available</p>
          </div>
        )}
      </div>
    </div>
  )
}
