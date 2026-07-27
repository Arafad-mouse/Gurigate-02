import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Calendar, MapPin, Users, Home, ArrowRight } from 'lucide-react';

export default function BookingConfirmationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [booking, setBooking] = useState<{
    bookingId: string;
    propertyId: string;
    propertyTitle?: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    pricePerNight: number;
    cleaningFee: number;
    serviceFee: number;
    total: number;
    currency: string;
    guestCount: number;
  } | null>(null);

  useEffect(() => {
    // Try to get booking details from sessionStorage or URL params
    const stored = sessionStorage.getItem('confirmedBooking');
    if (stored) {
      try {
        setBooking(JSON.parse(stored));
        sessionStorage.removeItem('confirmedBooking');
        return;
      } catch {
        // Fall through
      }
    }

    // Fallback: check URL params
    const bookingId = searchParams.get('bookingId');
    if (bookingId) {
      setBooking({
        bookingId,
        propertyId: searchParams.get('propertyId') || '',
        propertyTitle: searchParams.get('title') || undefined,
        checkIn: searchParams.get('checkIn') || '',
        checkOut: searchParams.get('checkOut') || '',
        nights: Number(searchParams.get('nights')) || 0,
        pricePerNight: Number(searchParams.get('pricePerNight')) || 0,
        cleaningFee: Number(searchParams.get('cleaningFee')) || 0,
        serviceFee: Number(searchParams.get('serviceFee')) || 0,
        total: Number(searchParams.get('total')) || 0,
        currency: searchParams.get('currency') || 'USD',
        guestCount: Number(searchParams.get('guests')) || 1,
      });
    }
  }, [searchParams]);

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600">No booking information found</p>
        <button onClick={() => navigate('/explore')} className="text-[#BA0036] font-medium hover:underline">
          Explore homes
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        {/* Success icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Confirmed!</h1>
          <p className="text-gray-600 mt-2">Your reservation has been created successfully</p>
        </div>

        {/* Booking details card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-12 h-12 bg-[#BA0036]/10 rounded-xl flex items-center justify-center">
              <Home className="h-6 w-6 text-[#BA0036]" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{booking.propertyTitle || 'Property'}</p>
              <p className="text-xs text-gray-500">Booking #{booking.bookingId.slice(0, 8)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <Calendar className="h-3.5 w-3.5" /> Check-in
              </div>
              <p className="text-sm font-medium text-gray-900">
                {new Date(booking.checkIn).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <Calendar className="h-3.5 w-3.5" /> Check-out
              </div>
              <p className="text-sm font-medium text-gray-900">
                {new Date(booking.checkOut).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" /> {booking.guestCount} {booking.guestCount === 1 ? 'guest' : 'guests'}
            <span className="text-gray-300">·</span>
            <span>{booking.nights} {booking.nights === 1 ? 'night' : 'nights'}</span>
          </div>

          {/* Price breakdown */}
          <div className="pt-4 border-t border-gray-100 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                ${booking.pricePerNight.toFixed(0)} x {booking.nights} {booking.nights === 1 ? 'night' : 'nights'}
              </span>
              <span className="text-gray-900">${(booking.pricePerNight * booking.nights).toFixed(0)}</span>
            </div>
            {booking.cleaningFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Cleaning fee</span>
                <span className="text-gray-900">${booking.cleaningFee.toFixed(0)}</span>
              </div>
            )}
            {booking.serviceFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Service fee</span>
                <span className="text-gray-900">${booking.serviceFee.toFixed(0)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold pt-2 border-t border-gray-100">
              <span className="text-gray-900">Total paid</span>
              <span className="text-gray-900">${booking.total.toFixed(0)} {booking.currency}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={() => navigate('/booking/dashboard')}
            className="w-full py-3 bg-[#BA0036] text-white font-semibold rounded-xl hover:bg-[#9a0028] transition-colors flex items-center justify-center gap-2"
          >
            View my trips <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => navigate('/explore')}
            className="w-full py-3 text-gray-700 font-medium rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Continue exploring
          </button>
        </div>
      </div>
    </div>
  );
}
