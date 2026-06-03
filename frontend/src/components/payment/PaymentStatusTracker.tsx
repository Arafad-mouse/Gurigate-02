import { useEffect, useState } from "react"
import { CheckCircle2, Clock, AlertCircle, XCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { PaymentStatus } from "@/domain/payment/PaymentTypes"

interface PaymentStatusTrackerProps {
  paymentId: string
  onStatusChange?: (status: PaymentStatus) => void
}

interface StatusConfig {
  icon: any
  color: string
  bgColor: string
  borderColor: string
  label: string
  description: string
}

const statusConfig: Record<PaymentStatus, StatusConfig> = {
  pending: {
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    label: "Pending",
    description: "Payment is being processed",
  },
  processing: {
    icon: Loader2,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    label: "Processing",
    description: "Payment is being verified",
  },
  completed: {
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    label: "Completed",
    description: "Payment successful",
  },
  failed: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    label: "Failed",
    description: "Payment could not be processed",
  },
  refunded: {
    icon: AlertCircle,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    label: "Refunded",
    description: "Payment has been refunded",
  },
}

export function PaymentStatusTracker({ paymentId, onStatusChange }: PaymentStatusTrackerProps) {
  const [status, setStatus] = useState<PaymentStatus>("pending")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null

    async function fetchStatus() {
      try {
        const { data, error } = await supabase
          .from("payments")
          .select("status")
          .eq("id", paymentId)
          .single()

        if (error) throw error
        if (data) {
          setStatus(data.status as PaymentStatus)
          onStatusChange?.(data.status as PaymentStatus)
        }
      } catch (error) {
        console.error("Error fetching payment status:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()

    // Subscribe to real-time updates
    subscription = supabase
      .channel(`payment-${paymentId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "payments",
          filter: `id=eq.${paymentId}`,
        },
        (payload: { new: { status: string } }) => {
          const newStatus = payload.new.status as PaymentStatus
          setStatus(newStatus)
          onStatusChange?.(newStatus)
        }
      )
      .subscribe()

    return () => {
      if (subscription) subscription.unsubscribe()
    }
  }, [paymentId, onStatusChange])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Loader2 className="size-4 animate-spin" />
        <span>Loading status...</span>
      </div>
    )
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className={`flex items-center gap-3 rounded-lg border ${config.borderColor} ${config.bgColor} px-4 py-3`}>
      <Icon className={`size-5 ${config.color} ${status === "processing" ? "animate-spin" : ""}`} />
      <div>
        <p className={`text-sm font-semibold ${config.color}`}>{config.label}</p>
        <p className="text-xs text-gray-600">{config.description}</p>
      </div>
    </div>
  )
}
