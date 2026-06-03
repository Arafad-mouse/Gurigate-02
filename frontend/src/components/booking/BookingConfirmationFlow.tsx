/**
 * BookingConfirmationFlow
 *
 * Multi-step booking confirmation flow component.
 * Steps: Review Details → Payment → Confirmation
 */

import { useState } from 'react';
import { Check, ArrowRight, ArrowLeft, CreditCard, Calendar, Users, MapPin, AlertCircle } from 'lucide-react';
import type { CreateBookingInput } from '../../domain/booking/BookingTypes';

export interface BookingConfirmationFlowProps {
  property: {
    id: string;
    title: string;
    image: string;
    location: string;
    price: number;
    currency: string;
    maxGuests: number;
  };
  bookingInput: CreateBookingInput;
  onConfirm: (paymentMethod: string) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

type Step = 'review' | 'payment' | 'confirmation';

export function BookingConfirmationFlow({
  property,
  bookingInput,
  onConfirm,
  onCancel,
  loading = false,
}: BookingConfirmationFlowProps) {
  const [currentStep, setCurrentStep] = useState<Step>('review');
  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const [error, setError] = useState<string | null>(null);

  const calculateTotal = () => {
    const days = Math.ceil(
      (bookingInput.checkOut.getTime() - bookingInput.checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );
    return property.price * days;
  };

  const calculateDuration = () => {
    const days = Math.ceil(
      (bookingInput.checkOut.getTime() - bookingInput.checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );
    return days === 1 ? '1 night' : `${days} nights`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleNext = () => {
    setError(null);
    if (currentStep === 'review') {
      setCurrentStep('payment');
    } else if (currentStep === 'payment') {
      setCurrentStep('confirmation');
    }
  };

  const handleBack = () => {
    setError(null);
    if (currentStep === 'payment') {
      setCurrentStep('review');
    } else if (currentStep === 'confirmation') {
      setCurrentStep('payment');
    }
  };

  const handleConfirm = async () => {
    setError(null);
    try {
      await onConfirm(paymentMethod);
      setCurrentStep('confirmation');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm booking');
    }
  };

  const steps = [
    { id: 'review', label: 'Review' },
    { id: 'payment', label: 'Payment' },
    { id: 'confirmation', label: 'Confirmation' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    index <= currentStepIndex
                      ? 'bg-[#BA0036] text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index < currentStepIndex ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <span
                  className={`text-sm mt-2 ${
                    index <= currentStepIndex ? 'text-[#BA0036] font-medium' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${
                    index < currentStepIndex ? 'bg-[#BA0036]' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {currentStep === 'review' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Review Your Booking</h2>

            {/* Property Summary */}
            <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <img
                src={property.image}
                alt={property.title}
                className="w-32 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{property.title}</h3>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {property.location}
                </div>
                <p className="text-lg font-semibold text-[#BA0036] mt-2">
                  {property.currency === 'USD' ? '$' : property.currency}
                  {property.price.toLocaleString()} / night
                </p>
              </div>
            </div>

            {/* Booking Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  Check-in
                </div>
                <p className="font-semibold text-gray-900">{formatDate(bookingInput.checkIn)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  Check-out
                </div>
                <p className="font-semibold text-gray-900">{formatDate(bookingInput.checkOut)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <Users className="h-4 w-4 mr-2" />
                  Guests
                </div>
                <p className="font-semibold text-gray-900">{bookingInput.guests} guests</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  Duration
                </div>
                <p className="font-semibold text-gray-900">{calculateDuration()}</p>
              </div>
            </div>

            {/* Special Requests */}
            {bookingInput.specialRequests && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Special Requests</p>
                <p className="text-gray-900">{bookingInput.specialRequests}</p>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">
                  {property.currency === 'USD' ? '$' : property.currency}
                  {property.price.toLocaleString()} × {calculateDuration()}
                </span>
                <span className="font-semibold">
                  {property.currency === 'USD' ? '$' : property.currency}
                  {calculateTotal().toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Cleaning fee</span>
                <span className="font-semibold">
                  {property.currency === 'USD' ? '$' : property.currency}0
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Service fee</span>
                <span className="font-semibold">
                  {property.currency === 'USD' ? '$' : property.currency}0
                </span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-lg font-bold text-[#BA0036]">
                  {property.currency === 'USD' ? '$' : property.currency}
                  {calculateTotal().toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'payment' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Payment Method</h2>

            {/* Payment Method Selection */}
            <div className="space-y-3">
              <label
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === 'card'
                    ? 'border-[#BA0036] bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <CreditCard className="h-5 w-5 mr-3 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Credit/Debit Card</p>
                  <p className="text-sm text-gray-600">Visa, Mastercard, American Express</p>
                </div>
              </label>

              <label
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === 'mobile'
                    ? 'border-[#BA0036] bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="mobile"
                  checked={paymentMethod === 'mobile'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <div className="h-5 w-5 mr-3 bg-gray-200 rounded" />
                <div>
                  <p className="font-medium text-gray-900">Mobile Money</p>
                  <p className="text-sm text-gray-600">M-Pesa, Airtel Money, T-Kash</p>
                </div>
              </label>
            </div>

            {/* Payment Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Payment Summary</p>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total Amount</span>
                <span className="text-xl font-bold text-[#BA0036]">
                  {property.currency === 'USD' ? '$' : property.currency}
                  {calculateTotal().toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'confirmation' && (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Booking Confirmed!</h2>
            <p className="text-gray-600">
              Your booking has been successfully confirmed. You will receive a confirmation email shortly.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <p className="text-sm text-gray-600 mb-1">Booking Reference</p>
              <p className="font-mono font-semibold text-gray-900">GG-{Date.now().toString(36).toUpperCase()}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {currentStep !== 'confirmation' && (
          <div className="flex justify-between items-center pt-6 border-t mt-6">
            <button
              onClick={currentStep === 'review' ? onCancel : handleBack}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {currentStep === 'review' ? 'Cancel' : (
                <>
                  <ArrowLeft className="h-4 w-4 inline mr-2" />
                  Back
                </>
              )}
            </button>
            <button
              onClick={currentStep === 'payment' ? handleConfirm : handleNext}
              disabled={loading}
              className="px-6 py-2 bg-[#BA0036] text-white rounded-lg hover:bg-[#a4003a] transition-colors disabled:opacity-50 flex items-center"
            >
              {loading ? (
                'Processing...'
              ) : currentStep === 'payment' ? (
                'Confirm Booking'
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </button>
          </div>
        )}

        {currentStep === 'confirmation' && (
          <div className="pt-6 border-t mt-6">
            <button
              onClick={onCancel}
              className="w-full px-6 py-2 bg-[#BA0036] text-white rounded-lg hover:bg-[#a4003a] transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
