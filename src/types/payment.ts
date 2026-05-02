export type PaymentMethodId =
  | "card"
  | "zaad"
  | "edahab"
  | "premier_wallet"
  | "wadaag_pay"

export type PaymentProvider = "dodo" | "zaad" | "edahab" | "premier_wallet" | "wadaag_pay"

export type PaymentStatus = "pending" | "submitted" | "verified" | "completed" | "failed" | "cancelled"

export interface PaymentMethodOption {
  id: PaymentMethodId
  provider: PaymentProvider
  name: string
  description: string
}

export interface BookingPaymentDetails {
  bookingId?: string
  propertyTitle: string
  propertyImage: string
  rating: number
  reviews: number
  checkIn: string
  checkOut: string
  guests: number
  nights: number
  pricePerNight: number
  currency?: string
}

export interface PaymentSummary {
  subtotal: number
  cleaningFee: number
  serviceFee: number
  total: number
  currency: string
}

export interface PaymentRecord {
  id: string
  booking_id: string
  payment_provider: PaymentProvider
  payment_method: PaymentMethodId
  provider_reference: string | null
  wallet_phone: string | null
  status: PaymentStatus
  amount: number
  currency: string
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface CreateWalletPaymentInput {
  bookingId?: string
  method: Exclude<PaymentMethodId, "card">
  walletPhone: string
  fallbackAmount: number
  fallbackCurrency: string
}

export interface CreateDodoCheckoutInput {
  bookingId?: string
  amount: number
  currency: string
}

export interface DodoCheckoutSession {
  paymentId: string
  sessionId: string
  checkoutUrl: string
}
