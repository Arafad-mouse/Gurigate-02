import { useMemo, useState } from "react"
import { ChevronLeft, ShieldCheck, Star } from "lucide-react"

import { PaymentMethodSelector } from "@/components/payment/PaymentMethodSelector"
import { PaymentError } from "@/lib/errors"
import { PAYMENT_METHODS } from "@/lib/paymentMethods"
import {
  calculatePaymentSummary,
  normalizeWalletPhone,
  validateWalletPhone,
} from "@/lib/paymentValidation"
import { PaymentService } from "@/services/paymentService"
import type { BookingPaymentDetails, PaymentMethodId, PaymentRecord } from "@/types/payment"

import { ChangeDatesModal, ChangeGuestsModal } from "./ChangeDatesModal"

interface PaymentPageProps {
  booking: BookingPaymentDetails
  onBack: () => void
  onConfirm: () => void
}

interface PaymentMethodStepProps {
  selectedMethod: PaymentMethodId
  walletPhone: string
  error: string | null
  onSelectMethod: (method: PaymentMethodId) => void
  onWalletPhoneChange: (phone: string) => void
  onNext: () => void
}

interface ReviewStepProps {
  booking: BookingPaymentDetails
  selectedMethod: PaymentMethodId
  paymentRecord: PaymentRecord | null
  isSubmitting: boolean
  error: string | null
  onConfirm: () => void
  onChangeDates: () => void
  onChangeGuests: () => void
}

interface BookingSummaryProps {
  booking: BookingPaymentDetails
  onChangeDates: () => void
  onChangeGuests: () => void
}

function PaymentMethodStep({
  selectedMethod,
  walletPhone,
  error,
  onSelectMethod,
  onWalletPhoneChange,
  onNext,
}: PaymentMethodStepProps) {
  const isWalletMethod = selectedMethod !== "card"

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="px-5 pt-5 pb-4 sm:px-6 sm:pt-6">
        <h2 className="mb-4 text-base font-semibold text-gray-900">1. Add a payment method</h2>

        <PaymentMethodSelector
          methods={PAYMENT_METHODS}
          selectedMethod={selectedMethod}
          onSelect={onSelectMethod}
        />

        {selectedMethod === "card" && (
          <div className="mt-4 space-y-4">
            {/* Card Number */}
            <div>
              <label htmlFor="card-number" className="block text-sm font-semibold text-gray-900">
                Card number
              </label>
              <div className="relative mt-2">
                <input
                  id="card-number"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-gray-500"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-2">
                  <svg width="32" height="20" viewBox="0 0 32 20">
                    <rect width="32" height="20" rx="3" fill="#1A1F71"/>
                    <text x="4" y="14" fill="white" fontSize="9" fontWeight="bold" fontFamily="sans-serif">VISA</text>
                  </svg>
                  <svg width="28" height="20" viewBox="0 0 28 20">
                    <circle cx="10" cy="10" r="9" fill="#EB001B"/>
                    <circle cx="18" cy="10" r="9" fill="#F79E1B"/>
                    <path d="M14 3.8a9 9 0 010 12.4A9 9 0 0114 3.8z" fill="#FF5F00"/>
                  </svg>
                  <svg width="32" height="20" viewBox="0 0 32 20">
                    <rect width="32" height="20" rx="3" fill="#2E77BC"/>
                    <text x="3" y="14" fill="white" fontSize="8" fontWeight="bold" fontFamily="sans-serif">AMEX</text>
                  </svg>
                </div>
              </div>
            </div>

            {/* Expiry and CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expiry" className="block text-sm font-semibold text-gray-900">
                  Expiry date
                </label>
                <input
                  id="expiry"
                  type="text"
                  placeholder="MM/YY"
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-gray-500"
                />
              </div>
              <div>
                <label htmlFor="cvv" className="block text-sm font-semibold text-gray-900">
                  CVV
                </label>
                <input
                  id="cvv"
                  type="text"
                  placeholder="123"
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-gray-500"
                />
              </div>
            </div>

            {/* Cardholder Name */}
            <div>
              <label htmlFor="cardholder-name" className="block text-sm font-semibold text-gray-900">
                Cardholder name
              </label>
              <input
                id="cardholder-name"
                type="text"
                placeholder="John Doe"
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-gray-500"
              />
            </div>

            {/* Security Message */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#E8344E]" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Secure Dodo Payments checkout</p>
                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Card details are collected only by Dodo Payments. GuriGate stores the checkout
                    session, provider reference, status, amount, and currency.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {isWalletMethod && (
          <div className="mt-4">
            <label htmlFor="wallet-phone" className="text-sm font-semibold text-gray-900">
              {selectedMethod === "zaad" ? "Zaad" : selectedMethod === "edahab" ? "eDahab" : selectedMethod === "premier_wallet" ? "Premier Wallet" : selectedMethod === "wadaag_pay" ? "Wadaag Pay" : "Wallet"} phone number
            </label>
            <input
              id="wallet-phone"
              type="tel"
              value={walletPhone}
              onChange={(event) => onWalletPhoneChange(event.target.value)}
              placeholder={selectedMethod === "zaad" ? "Enter Zaad phone number" : selectedMethod === "edahab" ? "Enter eDahab phone number" : selectedMethod === "premier_wallet" ? "Enter Premier Wallet phone number" : selectedMethod === "wadaag_pay" ? "Enter Wadaag Pay phone number" : "+252612345678"}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-gray-500"
            />
            <p className="mt-2 text-xs leading-5 text-gray-500">
              Use the phone number registered with the selected wallet.
            </p>
          </div>
        )}

        {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      </div>

      <div className="flex justify-end px-5 pb-5 sm:px-6 sm:pb-6">
        <button
          type="button"
          onClick={onNext}
          className="rounded-xl bg-gray-900 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 active:scale-[0.99]"
        >
          Next
        </button>
      </div>
    </div>
  )
}

function ReviewStep({
  booking,
  selectedMethod,
  paymentRecord,
  isSubmitting,
  error,
  onConfirm,
  onChangeDates,
  onChangeGuests,
}: ReviewStepProps) {
  const summary = calculatePaymentSummary(booking)
  const method = PAYMENT_METHODS.find((option) => option.id === selectedMethod)
  const actionLabel = selectedMethod === "card" ? "Continue to Dodo checkout" : "Submit wallet payment"

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="px-5 py-5 sm:px-6">
        <h2 className="mb-5 text-base font-semibold text-gray-900">2. Review your reservation</h2>

        <div className="mb-5 space-y-4 text-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-gray-900">Dates</p>
              <p className="text-gray-500">
                {booking.checkIn} - {booking.checkOut}
              </p>
            </div>
            <button
              type="button"
              onClick={onChangeDates}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-900 transition-colors hover:bg-gray-50"
            >
              Change
            </button>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-gray-900">Guests</p>
              <p className="text-gray-500">
                {booking.guests} adult{booking.guests !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={onChangeGuests}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-900 transition-colors hover:bg-gray-50"
            >
              Change
            </button>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Payment method</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{method?.name ?? "Payment method"}</p>
            <p className="mt-1 text-xs leading-5 text-gray-500">{method?.description}</p>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 text-sm">
          <p className="mb-3 font-semibold text-gray-900">Price details</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 underline">
                {booking.currency ?? "USD"} {booking.pricePerNight.toFixed(2)} x {booking.nights} nights
              </span>
              <span className="text-gray-900">{summary.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 underline">Cleaning fee</span>
              <span className="text-gray-900">{summary.cleaningFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 underline">GuriGate service fee</span>
              <span className="text-gray-900">{summary.serviceFee.toFixed(2)}</span>
            </div>
            <div className="my-2 h-px bg-gray-100" />
            <div className="flex justify-between font-semibold text-gray-900">
              <span>Total ({summary.currency})</span>
              <span>{summary.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {paymentRecord && (
          <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Payment submitted. Status: {paymentRecord.status}.
          </p>
        )}

        {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <p className="mt-5 mb-4 text-xs leading-relaxed text-gray-500">
          By selecting the button below, I agree to the{" "}
          <button type="button" className="font-medium text-gray-700 underline">
            Host's House Rules
          </button>
          ,{" "}
          <button type="button" className="font-medium text-gray-700 underline">
            GuriGate's Rebooking and Refund Policy
          </button>
          , and that GuriGate can charge the selected payment method if I am responsible for damage.
        </p>

        <button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          className="w-full rounded-xl bg-[#E8344E] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#c9263f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Processing..." : actionLabel}
        </button>
      </div>
    </div>
  )
}

function BookingSummary({ booking, onChangeDates, onChangeGuests }: BookingSummaryProps) {
  const summary = calculatePaymentSummary(booking)

  return (
    <aside className="sticky top-24 space-y-4 rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex gap-3">
        <img
          src={booking.propertyImage}
          alt={booking.propertyTitle}
          className="h-20 w-24 shrink-0 rounded-xl object-cover"
        />
        <div className="min-w-0">
          <p className="line-clamp-3 text-sm font-semibold leading-snug text-gray-900">{booking.propertyTitle}</p>
          <div className="mt-1.5 flex items-center gap-1">
            <Star className="size-3 fill-[#E8344E] text-[#E8344E]" />
            <span className="text-xs font-semibold text-gray-800">
              {booking.rating.toFixed(1)} ({booking.reviews})
            </span>
            <span className="text-xs text-gray-400">.</span>
            <span className="text-xs text-gray-500">Guest favourite</span>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      <div>
        <p className="text-sm font-bold text-gray-900">Free cancellation</p>
        <p className="mt-0.5 text-xs text-gray-500">
          Cancel before {booking.checkIn} for a full refund.{" "}
          <button type="button" className="font-medium text-gray-700 underline">
            Full policy
          </button>
        </p>
      </div>

      <div className="h-px bg-gray-100" />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">Dates</p>
          <p className="mt-0.5 text-xs text-gray-500">
            {booking.checkIn} - {booking.checkOut}
          </p>
        </div>
        <button
          type="button"
          onClick={onChangeDates}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-900 transition-colors hover:bg-gray-50"
        >
          Change
        </button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">Guests</p>
          <p className="mt-0.5 text-xs text-gray-500">
            {booking.guests} adult{booking.guests !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={onChangeGuests}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-900 transition-colors hover:bg-gray-50"
        >
          Change
        </button>
      </div>

      <div className="h-px bg-gray-100" />

      <div>
        <p className="mb-3 text-sm font-bold text-gray-900">Price details</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 underline">
              {booking.nights} nights x {summary.currency} {booking.pricePerNight.toFixed(2)}
            </span>
            <span className="text-gray-900">{summary.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between pt-1 font-bold text-gray-900">
            <span>
              Total <span className="font-normal text-gray-500">{summary.currency}</span>
            </span>
            <span>{summary.total.toFixed(2)}</span>
          </div>
        </div>
        <button type="button" className="mt-1 text-xs text-[#E8344E] underline">
          Price breakdown
        </button>
      </div>

      <div className="rounded-xl bg-pink-50 px-4 py-3">
        <p className="text-xs font-medium text-gray-700">Rare find. This place is usually booked.</p>
      </div>
    </aside>
  )
}

export function PaymentPage({ booking, onBack, onConfirm }: PaymentPageProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId>("card")
  const [walletPhone, setWalletPhone] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentRecord, setPaymentRecord] = useState<PaymentRecord | null>(null)
  const [showDates, setShowDates] = useState(false)
  const [showGuests, setShowGuests] = useState(false)
  const [dates, setDates] = useState({
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
  })
  const [guestCounts, setGuestCounts] = useState({
    adults: booking.guests,
    children: 0,
    infants: 0,
    pets: 0,
  })

  const liveBooking: BookingPaymentDetails = useMemo(
    () => ({
      ...booking,
      checkIn: dates.checkIn,
      checkOut: dates.checkOut,
      guests: guestCounts.adults + guestCounts.children,
    }),
    [booking, dates.checkIn, dates.checkOut, guestCounts.adults, guestCounts.children],
  )

  const summary = calculatePaymentSummary(liveBooking)

  const handleNext = () => {
    setError(null)

    if (selectedMethod !== "card") {
      const phoneError = validateWalletPhone(walletPhone)

      if (phoneError) {
        setError(phoneError)
        return
      }
    }

    setStep(2)
  }

  const handleConfirm = async () => {
    setError(null)
    setIsSubmitting(true)

    try {
      if (selectedMethod === "card") {
        const checkout = await PaymentService.createDodoCheckout({
          bookingId: liveBooking.bookingId,
          amount: summary.total,
          currency: summary.currency,
        })

        window.location.assign(checkout.checkoutUrl)
        return
      }

      const record = await PaymentService.createWalletPayment({
        bookingId: liveBooking.bookingId,
        method: selectedMethod,
        walletPhone: normalizeWalletPhone(walletPhone),
        fallbackAmount: summary.total,
        fallbackCurrency: summary.currency,
      })

      setPaymentRecord(record)
      onConfirm()
    } catch (caughtError) {
      if (caughtError instanceof PaymentError) {
        setError(caughtError.message)
      } else {
        console.error("Payment confirmation error:", caughtError)
        setError("Unable to process this payment. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      {showDates && (
        <ChangeDatesModal
          checkIn={dates.checkIn}
          checkOut={dates.checkOut}
          onSave={(checkIn, checkOut) => setDates({ checkIn, checkOut })}
          onClose={() => setShowDates(false)}
        />
      )}

      {showGuests && (
        <ChangeGuestsModal
          adults={guestCounts.adults}
          children={guestCounts.children}
          infants={guestCounts.infants}
          pets={guestCounts.pets}
          maxGuests={booking.guests + 4}
          onSave={(counts) => setGuestCounts(counts)}
          onClose={() => setShowGuests(false)}
        />
      )}

      <div className="flex items-center gap-4 border-b border-gray-100 px-5 py-4 sm:px-6 md:px-16">
        <button
          type="button"
          onClick={onBack}
          className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
          aria-label="Go back"
        >
          <ChevronLeft className="size-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Confirm and pay</h1>
      </div>

      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6 md:px-10 md:py-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-16">
          <div className="min-w-0 flex-1 space-y-4">
            {step === 1 ? (
              <PaymentMethodStep
                selectedMethod={selectedMethod}
                walletPhone={walletPhone}
                error={error}
                onSelectMethod={(method) => {
                  setSelectedMethod(method)
                  setError(null)
                }}
                onWalletPhoneChange={(phone) => {
                  setWalletPhone(phone)
                  setError(null)
                }}
                onNext={handleNext}
              />
            ) : (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 text-left transition-colors hover:bg-gray-50 sm:px-6"
              >
                <span className="text-base font-semibold text-gray-900">1. Add a payment method</span>
                <span className="text-xs font-semibold text-gray-700 underline">Edit</span>
              </button>
            )}

            {step === 2 ? (
              <ReviewStep
                booking={liveBooking}
                selectedMethod={selectedMethod}
                paymentRecord={paymentRecord}
                isSubmitting={isSubmitting}
                error={error}
                onConfirm={handleConfirm}
                onChangeDates={() => setShowDates(true)}
                onChangeGuests={() => setShowGuests(true)}
              />
            ) : (
              <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 sm:px-6">
                <h2 className="text-base font-semibold text-gray-400">2. Review your reservation</h2>
              </div>
            )}
          </div>

          <div className="w-full lg:w-[380px] lg:shrink-0">
            <BookingSummary
              booking={liveBooking}
              onChangeDates={() => setShowDates(true)}
              onChangeGuests={() => setShowGuests(true)}
            />
          </div>
        </div>
      </div>

      
          </div>
  )
}

export default PaymentPage
