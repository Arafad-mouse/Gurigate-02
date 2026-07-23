import type { BookingPaymentDetails, PaymentSummary } from "@/types/payment"

const INTERNATIONAL_PHONE_PATTERN = /^\+[1-9]\d{7,14}$/

export function normalizeWalletPhone(value: string) {
  return value.replace(/[\s()-]/g, "")
}

export function validateWalletPhone(value: string) {
  const normalized = normalizeWalletPhone(value)

  if (!normalized) {
    return "Enter the wallet phone number."
  }

  if (!INTERNATIONAL_PHONE_PATTERN.test(normalized)) {
    return "Use international format, for example +252612345678."
  }

  return null
}

export function calculatePaymentSummary(booking: BookingPaymentDetails): PaymentSummary {
  const subtotal = booking.pricePerNight * booking.nights
  const cleaningFee = 25
  const serviceFee = Math.round(subtotal * 0.14)

  return {
    subtotal,
    cleaningFee,
    serviceFee,
    total: subtotal + cleaningFee + serviceFee,
    currency: booking.currency ?? "USD",
  }
}
