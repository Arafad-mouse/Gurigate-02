import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp, CreditCard, Smartphone, WalletCards, Landmark, Banknote, Filter } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { PaymentMethodId, PaymentStatus } from "@/types/payment"

interface PaymentHistoryProps {
  userId?: string
  bookingId?: string
  limit?: number
}

interface Payment {
  id: string
  booking_id: string
  amount: number
  currency: string
  payment_method: PaymentMethodId
  status: PaymentStatus
  created_at: string
  transaction_id?: string
  property_title?: string
}

const methodIcons: Record<PaymentMethodId, any> = {
  card: CreditCard,
  zaad: Smartphone,
  edahab: WalletCards,
  premier_wallet: Landmark,
  wadaag_pay: Banknote,
}

const statusColors: Record<PaymentStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  submitted: "bg-blue-100 text-blue-800",
  verified: "bg-green-100 text-green-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
}

const statusLabels: Record<PaymentStatus, string> = {
  pending: "Pending",
  submitted: "Submitted",
  verified: "Verified",
  completed: "Completed",
  failed: "Failed",
  cancelled: "Cancelled",
}

export function PaymentHistory({ userId, bookingId, limit }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<PaymentStatus | "all">("all")
  const [expandedPayment, setExpandedPayment] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPayments() {
      try {
        let query = supabase
          .from("payments")
          .select(`
            *,
            property_bookings!inner (
              property_id,
              properties!inner (title)
            )
          `)
          .order("created_at", { ascending: false })

        if (userId) {
          query = query.eq("user_id", userId)
        }

        if (bookingId) {
          query = query.eq("booking_id", bookingId)
        }

        if (limit) {
          query = query.limit(limit)
        }

        const { data, error } = await query

        if (error) throw error

        const formattedPayments = (data || []).map((p: any) => ({
          id: p.id,
          booking_id: p.booking_id,
          amount: p.amount,
          currency: p.currency,
          payment_method: p.payment_method,
          status: p.status,
          created_at: p.created_at,
          transaction_id: p.transaction_id,
          property_title: p.property_bookings?.properties?.title,
        }))

        setPayments(formattedPayments)
      } catch (error) {
        console.error("Error fetching payment history:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [userId, bookingId, limit])

  const filteredPayments = filter === "all" 
    ? payments 
    : payments.filter(p => p.status === filter)

  const toggleExpand = (paymentId: string) => {
    setExpandedPayment(expandedPayment === paymentId ? null : paymentId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E8344E]" />
      </div>
    )
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-12">
        <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-4 text-sm text-gray-600">No payment history found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as PaymentStatus | "all")}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#E8344E]/30"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="submitted">Submitted</option>
            <option value="verified">Verified</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Payment List */}
      <div className="space-y-3">
        {filteredPayments.map((payment) => {
          const MethodIcon = methodIcons[payment.payment_method]
          const isExpanded = expandedPayment === payment.id

          return (
            <div
              key={payment.id}
              className="rounded-xl border border-gray-200 bg-white overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleExpand(payment.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-gray-100">
                    <MethodIcon className="size-5 text-gray-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">
                      {payment.currency} {payment.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[payment.status]}`}>
                    {statusLabels[payment.status]}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-100 px-4 py-3 space-y-2">
                  {payment.property_title && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Property</span>
                      <span className="font-medium text-gray-900">{payment.property_title}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {payment.payment_method.replace("_", " ")}
                    </span>
                  </div>
                  {payment.transaction_id && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Transaction ID</span>
                      <span className="font-medium text-gray-900 font-mono text-xs">
                        {payment.transaction_id}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Date</span>
                    <span className="font-medium text-gray-900">
                      {new Date(payment.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filteredPayments.length === 0 && payments.length > 0 && (
        <p className="text-center text-sm text-gray-500 py-8">
          No payments match the selected filter
        </p>
      )}
    </div>
  )
}
