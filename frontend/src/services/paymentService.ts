import { PaymentError } from "@/lib/errors"
import { PAYMENT_METHODS } from "@/lib/paymentMethods"
import { normalizeWalletPhone, validateWalletPhone } from "@/lib/paymentValidation"
import { isSupabaseConfigured, supabase } from "@/lib/supabase"
import type {
  CreateDodoCheckoutInput,
  CreateWalletPaymentInput,
  DodoCheckoutSession,
  PaymentProvider,
  PaymentRecord,
} from "@/types/payment"

interface WalletPaymentRpcResult {
  id: string
  booking_id: string
  payment_provider: PaymentProvider
  payment_method: string
  provider_reference: string | null
  wallet_phone: string | null
  status: string
  amount: number
  currency: string
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

interface DodoCheckoutResponse {
  payment_id: string
  session_id: string
  checkout_url: string
}

function getProviderForMethod(method: CreateWalletPaymentInput["method"]) {
  const option = PAYMENT_METHODS.find((paymentMethod) => paymentMethod.id === method)

  if (!option || option.id === "card") {
    throw new PaymentError("Select a supported wallet payment method.", "INVALID_PAYMENT_METHOD")
  }

  return option.provider
}

function mapWalletPayment(data: WalletPaymentRpcResult): PaymentRecord {
  return {
    id: data.id,
    booking_id: data.booking_id,
    payment_provider: data.payment_provider,
    payment_method: data.payment_method as PaymentRecord["payment_method"],
    provider_reference: data.provider_reference,
    wallet_phone: data.wallet_phone,
    status: data.status as PaymentRecord["status"],
    amount: data.amount,
    currency: data.currency,
    metadata: data.metadata ?? {},
    created_at: data.created_at,
    updated_at: data.updated_at,
  }
}

function createMockWalletPayment(input: CreateWalletPaymentInput): PaymentRecord {
  const provider = getProviderForMethod(input.method)
  const now = new Date().toISOString()

  return {
    id: `mock_${crypto.randomUUID()}`,
    booking_id: input.bookingId ?? "mock_booking",
    payment_provider: provider,
    payment_method: input.method,
    provider_reference: `manual_${Date.now()}`,
    wallet_phone: normalizeWalletPhone(input.walletPhone),
    status: "submitted",
    amount: input.fallbackAmount,
    currency: input.fallbackCurrency,
    metadata: {
      mode: "mock",
      reason: input.bookingId ? "supabase_not_configured" : "missing_booking_id",
    },
    created_at: now,
    updated_at: now,
  }
}

export class PaymentService {
  static async createWalletPayment(input: CreateWalletPaymentInput): Promise<PaymentRecord> {
    const phoneError = validateWalletPhone(input.walletPhone)

    if (phoneError) {
      throw new PaymentError(phoneError, "INVALID_WALLET_PHONE")
    }

    const provider = getProviderForMethod(input.method)
    const walletPhone = normalizeWalletPhone(input.walletPhone)

    if (!isSupabaseConfigured || !input.bookingId) {
      return createMockWalletPayment({ ...input, walletPhone })
    }

    const { data, error } = await supabase.rpc("create_local_wallet_payment", {
      p_booking_id: input.bookingId,
      p_payment_provider: provider,
      p_payment_method: input.method,
      p_wallet_phone: walletPhone,
    })

    if (error) {
      console.error("Wallet payment creation error:", error)
      throw new PaymentError(error.message || "Unable to submit wallet payment.", "WALLET_PAYMENT_FAILED")
    }

    if (!data) {
      throw new PaymentError("Wallet payment submission returned no payment record.", "WALLET_PAYMENT_EMPTY")
    }

    const [record] = data as WalletPaymentRpcResult[]

    if (!record) {
      throw new PaymentError("Wallet payment submission returned no payment record.", "WALLET_PAYMENT_EMPTY")
    }

    return mapWalletPayment(record)
  }

  static async createDodoCheckout(input: CreateDodoCheckoutInput): Promise<DodoCheckoutSession> {
    if (!input.bookingId) {
      throw new PaymentError(
        "This booking must be saved before starting card checkout.",
        "BOOKING_RECORD_REQUIRED",
      )
    }

    if (!isSupabaseConfigured) {
      throw new PaymentError("Supabase must be configured before card checkout can start.", "SUPABASE_REQUIRED")
    }

    const { data, error } = await supabase.functions.invoke<DodoCheckoutResponse>("create-dodo-checkout", {
      body: {
        booking_id: input.bookingId,
        amount: input.amount,
        currency: input.currency,
        return_url: `${window.location.origin}/payment?provider=dodo`,
        cancel_url: `${window.location.origin}/payment`,
      },
    })

    if (error) {
      console.error("Dodo checkout creation error:", error)
      throw new PaymentError(error.message || "Unable to start secure card checkout.", "DODO_CHECKOUT_FAILED")
    }

    if (!data?.checkout_url || !data.session_id || !data.payment_id) {
      throw new PaymentError("Dodo checkout did not return a valid checkout session.", "DODO_CHECKOUT_INVALID")
    }

    return {
      paymentId: data.payment_id,
      sessionId: data.session_id,
      checkoutUrl: data.checkout_url,
    }
  }
}
