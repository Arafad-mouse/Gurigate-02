"use client";

import { useState } from "react";
import { ChevronLeft, ChevronDown, Star } from "lucide-react";
import { ChangeDatesModal, ChangeGuestsModal } from "./ChangeDatesModal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BookingDetails {
  propertyTitle: string;
  propertyImage: string;
  rating: number;
  reviews: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  pricePerNight: number;
}

interface PaymentPageProps {
  booking: BookingDetails;
  onBack: () => void;
  onConfirm: () => void;
}

// ─── Payment Icons (all fixed — no broken SVG paths) ─────────────────────────

const VisaIcon = () => (
  <svg width="32" height="20" viewBox="0 0 32 20">
    <rect width="32" height="20" rx="3" fill="#1A1F71"/>
    <text x="4" y="14" fill="white" fontSize="9" fontWeight="bold" fontFamily="sans-serif">VISA</text>
  </svg>
);

const MastercardIcon = () => (
  <svg width="28" height="20" viewBox="0 0 28 20">
    <circle cx="10" cy="10" r="9" fill="#EB001B"/>
    <circle cx="18" cy="10" r="9" fill="#F79E1B"/>
    <path d="M14 3.8a9 9 0 010 12.4A9 9 0 0114 3.8z" fill="#FF5F00"/>
  </svg>
);

const AmexIcon = () => (
  <svg width="32" height="20" viewBox="0 0 32 20">
    <rect width="32" height="20" rx="3" fill="#2E77BC"/>
    <text x="3" y="14" fill="white" fontSize="8" fontWeight="bold" fontFamily="sans-serif">AMEX</text>
  </svg>
);

const DiscoverIcon = () => (
  <svg width="42" height="20" viewBox="0 0 42 20">
    <rect width="42" height="20" rx="3" fill="#231F20"/>
    <circle cx="34" cy="10" r="7" fill="#F76F20"/>
    <text x="2" y="13" fill="white" fontSize="6" fontWeight="bold" fontFamily="sans-serif">DISCOVER</text>
  </svg>
);

// ✅ Fixed PayPal icon — clean simple paths, no arithmetic operators in d=""
const PayPalIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M19.5 6.5C19.5 9.5 17.5 11.5 14.5 11.5H12.5L11.5 17H8.5L10.5 6H15.5C17.7 6 19.5 6.5 19.5 6.5Z" fill="#003087"/>
    <path d="M17.5 4.5C17.5 7.5 15.5 9.5 12.5 9.5H10.5L9.5 15H6.5L8.5 4H13.5C15.7 4 17.5 4.5 17.5 4.5Z" fill="#009CDE"/>
    <path d="M6.5 15L5 22H8L9.5 15H6.5Z" fill="#012169"/>
  </svg>
);

const GooglePayIcon = () => (
  <svg width="44" height="18" viewBox="0 0 44 18">
    <text y="13" fontSize="11" fontFamily="sans-serif" fontWeight="500">
      <tspan fill="#4285F4">G</tspan>
      <tspan fill="#EA4335">o</tspan>
      <tspan fill="#FBBC05">o</tspan>
      <tspan fill="#4285F4">g</tspan>
      <tspan fill="#34A853">l</tspan>
      <tspan fill="#EA4335">e</tspan>
      <tspan fill="#5F6368" dx="2">Pay</tspan>
    </text>
  </svg>
);

// ─── Countries ────────────────────────────────────────────────────────────────

const COUNTRIES = [
  "Somalia","Kenya","Ethiopia","Tanzania","Uganda","Rwanda",
  "United States","United Kingdom","UAE","Malaysia","Germany","France",
];

// ─── Step 1: Payment Method ───────────────────────────────────────────────────

function PaymentMethodStep({ onNext }: { onNext: () => void }) {
  const [method, setMethod] = useState<"card" | "paypal" | "googlepay">("card");
  const [street, setStreet]   = useState("");
  const [apt, setApt]         = useState("");
  const [city, setCity]       = useState("");
  const [state, setState]     = useState("");
  const [zip, setZip]         = useState("");
  const [country, setCountry] = useState("Somalia");
  const [cardNum, setCardNum] = useState("");
  const [expiry, setExpiry]   = useState("");
  const [cvv, setCvv]         = useState("");
  const [cardName, setCardName] = useState("");

  const formatCard = (v: string) =>
    v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");

  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="px-6 pt-6 pb-4">
        <h2 className="text-base font-semibold text-gray-900 mb-4">1. Add a payment method</h2>

        {/* Card option */}
        <label className="flex items-center justify-between py-3.5 border-b border-gray-100 cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-9 h-7 bg-gray-800 rounded flex items-center justify-center">
              <div className="w-5 h-3 bg-yellow-400 rounded-sm opacity-80" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Credit or debit card</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <VisaIcon /><MastercardIcon /><AmexIcon /><DiscoverIcon />
              </div>
            </div>
          </div>
          <input type="radio" name="method" checked={method === "card"} onChange={() => setMethod("card")} className="w-4 h-4 accent-gray-900" />
        </label>

        {/* Card fields */}
        {method === "card" && (
          <div className="py-4 border-b border-gray-100 space-y-3">
            <input placeholder="Card number" value={cardNum} onChange={e => setCardNum(formatCard(e.target.value))}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-500 transition-colors placeholder:text-gray-400" />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="MM/YY" value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))}
                className="border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-500 transition-colors placeholder:text-gray-400" />
              <input placeholder="CVV" value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className="border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-500 transition-colors placeholder:text-gray-400" />
            </div>
            <input placeholder="Name on card" value={cardName} onChange={e => setCardName(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-500 transition-colors placeholder:text-gray-400" />
          </div>
        )}

        {/* Billing address */}
        {method === "card" && (
          <div className="py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Billing address</h3>
            <div className="border border-gray-300 rounded-xl overflow-hidden divide-y divide-gray-200">
              <input placeholder="Street address" value={street} onChange={e => setStreet(e.target.value)}
                className="w-full px-4 py-3 text-sm placeholder:text-gray-400 outline-none focus:bg-gray-50 transition-colors" />
              <input placeholder="Apt or suite number" value={apt} onChange={e => setApt(e.target.value)}
                className="w-full px-4 py-3 text-sm placeholder:text-gray-400 outline-none focus:bg-gray-50 transition-colors" />
              <input placeholder="City" value={city} onChange={e => setCity(e.target.value)}
                className="w-full px-4 py-3 text-sm placeholder:text-gray-400 outline-none focus:bg-gray-50 transition-colors" />
              <div className="grid grid-cols-2 divide-x divide-gray-200">
                <input placeholder="State" value={state} onChange={e => setState(e.target.value)}
                  className="w-full px-4 py-3 text-sm placeholder:text-gray-400 outline-none focus:bg-gray-50 transition-colors" />
                <input placeholder="ZIP code" value={zip} onChange={e => setZip(e.target.value)}
                  className="w-full px-4 py-3 text-sm placeholder:text-gray-400 outline-none focus:bg-gray-50 transition-colors" />
              </div>
              <div className="relative">
                <label className="absolute top-2 left-4 text-[10px] font-medium text-gray-500 pointer-events-none">Country/region</label>
                <select value={country} onChange={e => setCountry(e.target.value)}
                  className="w-full pt-6 pb-3 px-4 text-sm text-gray-900 outline-none appearance-none bg-transparent focus:bg-gray-50 transition-colors">
                  {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        )}

        {/* PayPal */}
        <label className="flex items-center justify-between py-3.5 border-b border-gray-100 cursor-pointer">
          <div className="flex items-center gap-3">
            <PayPalIcon />
            <span className="text-sm font-medium text-gray-900">PayPal</span>
          </div>
          <input type="radio" name="method" checked={method === "paypal"} onChange={() => setMethod("paypal")} className="w-4 h-4 accent-gray-900" />
        </label>

        {/* Google Pay */}
        <label className="flex items-center justify-between py-3.5 cursor-pointer">
          <div className="flex items-center gap-3">
            <GooglePayIcon />
          </div>
          <input type="radio" name="method" checked={method === "googlepay"} onChange={() => setMethod("googlepay")} className="w-4 h-4 accent-gray-900" />
        </label>
      </div>

      <div className="px-6 pb-6 flex justify-end">
        <button onClick={onNext}
          className="bg-gray-900 text-white text-sm font-semibold px-8 py-3 rounded-xl hover:bg-gray-800 transition-colors active:scale-[0.99]">
          Next
        </button>
      </div>
    </div>
  );
}

// ─── Step 2: Review Reservation ───────────────────────────────────────────────

function ReviewStep({
  booking,
  onConfirm,
  onChangeDates,
  onChangeGuests,
}: {
  booking: BookingDetails;
  onConfirm: () => void;
  onChangeDates: () => void;
  onChangeGuests: () => void;
}) {
  const subtotal    = booking.pricePerNight * booking.nights;
  const cleaningFee = 25;
  const serviceFee  = Math.round(subtotal * 0.14);
  const total       = subtotal + cleaningFee + serviceFee;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="px-6 py-5">
        <h2 className="text-base font-semibold text-gray-900 mb-5">2. Review your reservation</h2>

        <div className="space-y-4 text-sm mb-5">
          {/* Dates row */}
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-gray-900">Dates</p>
              <p className="text-gray-500">{booking.checkIn} – {booking.checkOut}</p>
            </div>
            {/* ✅ Opens ChangeDatesModal */}
            <button onClick={onChangeDates}
              className="text-xs font-semibold text-gray-900 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
              Change
            </button>
          </div>
          {/* Guests row */}
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-gray-900">Guests</p>
              <p className="text-gray-500">{booking.guests} adult{booking.guests !== 1 ? "s" : ""}</p>
            </div>
            {/* ✅ Opens ChangeGuestsModal */}
            <button onClick={onChangeGuests}
              className="text-xs font-semibold text-gray-900 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
              Change
            </button>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
          <p className="font-semibold text-gray-900 mb-3">Price details</p>
          <div className="flex justify-between">
            <span className="text-gray-600 underline cursor-pointer">${booking.pricePerNight.toFixed(2)} × {booking.nights} nights</span>
            <span className="text-gray-900">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 underline cursor-pointer">Cleaning fee</span>
            <span className="text-gray-900">${cleaningFee}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 underline cursor-pointer">GuriGate service fee</span>
            <span className="text-gray-900">${serviceFee}</span>
          </div>
          <div className="h-px bg-gray-100 my-2" />
          <div className="flex justify-between font-semibold text-gray-900">
            <span>Total (USD)</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <p className="text-xs text-[#E8344E] underline cursor-pointer mt-1">Price breakdown</p>

        <p className="text-xs text-gray-500 leading-relaxed mt-5 mb-4">
          By selecting the button below, I agree to the{" "}
          <button className="underline font-medium text-gray-700">Host's House Rules</button>,{" "}
          <button className="underline font-medium text-gray-700">GuriGate's Rebooking and Refund Policy</button>, and that GuriGate can{" "}
          <button className="underline font-medium text-gray-700">charge my payment method</button> if I'm responsible for damage.
        </p>

        <button onClick={onConfirm}
          className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.99]"
          style={{ background: "linear-gradient(135deg,#E8344E,#c9263f)" }}>
          Confirm and pay
        </button>
      </div>
    </div>
  );
}

// ─── Booking Summary Card ─────────────────────────────────────────────────────

function BookingSummary({
  booking,
  onChangeDates,
  onChangeGuests,
}: {
  booking: BookingDetails;
  onChangeDates: () => void;
  onChangeGuests: () => void;
}) {
  const subtotal    = booking.pricePerNight * booking.nights;
  const cleaningFee = 25;
  const serviceFee  = Math.round(subtotal * 0.14);
  const total       = subtotal + cleaningFee + serviceFee;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 sticky top-24 space-y-4">
      <div className="flex gap-3">
        <img src={booking.propertyImage} alt={booking.propertyTitle}
          className="w-24 h-20 rounded-xl object-cover flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-3">{booking.propertyTitle}</p>
          <div className="flex items-center gap-1 mt-1.5">
            <Star size={11} className="fill-[#E8344E] text-[#E8344E]" />
            <span className="text-xs font-semibold text-gray-800">{booking.rating.toFixed(1)} ({booking.reviews})</span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-500">Guest favourite</span>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      <div>
        <p className="text-sm font-bold text-gray-900">Free cancellation</p>
        <p className="text-xs text-gray-500 mt-0.5">
          Cancel before {booking.checkIn} for a full refund.{" "}
          <button className="underline font-medium text-gray-700">Full policy</button>
        </p>
      </div>

      <div className="h-px bg-gray-100" />

      {/* Dates — Change opens modal */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold text-gray-900">Dates</p>
          <p className="text-xs text-gray-500 mt-0.5">{booking.checkIn} – {booking.checkOut}</p>
        </div>
        <button onClick={onChangeDates}
          className="text-xs font-semibold text-gray-900 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
          Change
        </button>
      </div>

      {/* Guests — Change opens modal */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold text-gray-900">Guests</p>
          <p className="text-xs text-gray-500 mt-0.5">{booking.guests} adult{booking.guests !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={onChangeGuests}
          className="text-xs font-semibold text-gray-900 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
          Change
        </button>
      </div>

      <div className="h-px bg-gray-100" />

      <div>
        <p className="text-sm font-bold text-gray-900 mb-3">Price details</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 underline cursor-pointer">{booking.nights} nights × ${booking.pricePerNight.toFixed(2)}</span>
            <span className="text-gray-900">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 pt-1">
            <span>Total <span className="font-normal text-gray-500">USD</span></span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
        <button className="text-xs text-[#E8344E] underline mt-1">Price breakdown</button>
      </div>

      <div className="bg-pink-50 rounded-xl px-4 py-3 flex items-center gap-2">
        <span className="text-base">💎</span>
        <p className="text-xs font-medium text-gray-700">Rare find! This place is usually booked.</p>
      </div>
    </div>
  );
}

// ─── Main PaymentPage ─────────────────────────────────────────────────────────

export default function PaymentPage({ booking, onBack, onConfirm }: PaymentPageProps) {
  const [step, setStep] = useState<1 | 2>(1);

  // ✅ Change modals state
  const [showDates,  setShowDates]  = useState(false);
  const [showGuests, setShowGuests] = useState(false);

  // ✅ Mutable booking state so changes reflect immediately
  const [dates, setDates] = useState({
    checkIn:  booking.checkIn,
    checkOut: booking.checkOut,
  });
  const [guestCounts, setGuestCounts] = useState({
    adults:   booking.guests,
    children: 0,
    infants:  0,
    pets:     0,
  });

  // Merge live edits into the booking object passed to children
  const liveBooking: BookingDetails = {
    ...booking,
    checkIn:  dates.checkIn,
    checkOut: dates.checkOut,
    guests:   guestCounts.adults + guestCounts.children,
  };

  return (
    <div className="bg-white min-h-screen font-sans">

      {/* ✅ Change Dates Modal */}
      {showDates && (
        <ChangeDatesModal
          checkIn={dates.checkIn}
          checkOut={dates.checkOut}
          onSave={(ci, co) => setDates({ checkIn: ci, checkOut: co })}
          onClose={() => setShowDates(false)}
        />
      )}

      {/* ✅ Change Guests Modal */}
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

      {/* Header */}
      <div className="border-b border-gray-100 px-6 md:px-16 py-4 flex items-center gap-4">
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Confirm and pay</h1>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-6 md:px-10 py-10">
        <div className="flex gap-16 items-start">

          {/* Left: Steps */}
          <div className="flex-1 min-w-0 space-y-4">
            {step === 1 ? (
              <PaymentMethodStep onNext={() => setStep(2)} />
            ) : (
              <div onClick={() => setStep(1)}
                className="bg-white border border-gray-200 rounded-2xl px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
                <h2 className="text-base font-semibold text-gray-900">1. Add a payment method</h2>
                <button className="text-xs font-semibold text-gray-700 underline">Edit</button>
              </div>
            )}

            {step === 2 ? (
              <ReviewStep
                booking={liveBooking}
                onConfirm={onConfirm}
                onChangeDates={() => setShowDates(true)}
                onChangeGuests={() => setShowGuests(true)}
              />
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4">
                <h2 className="text-base font-semibold text-gray-400">2. Review your reservation</h2>
              </div>
            )}
          </div>

          {/* Right: Summary */}
          <div className="w-[380px] flex-shrink-0">
            <BookingSummary
              booking={liveBooking}
              onChangeDates={() => setShowDates(true)}
              onChangeGuests={() => setShowGuests(true)}
            />
          </div>
        </div>
      </div>

      <footer className="border-t border-gray-100 mt-16 px-16 py-5">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <button className="hover:text-gray-700 transition-colors">Privacy</button>
          <span>·</span>
          <button className="hover:text-gray-700 transition-colors">Terms</button>
          <span>·</span>
          <button className="hover:text-gray-700 transition-colors">Your Privacy Choices</button>
        </div>
      </footer>
    </div>
  );
}