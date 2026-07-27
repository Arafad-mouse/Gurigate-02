import { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star, Heart, Share2, MapPin, Users, BedDouble, Bath, ChevronLeft, ChevronRight,
  Check, Shield, Wifi, Wind, Car, Tv, Coffee, Utensils, Globe, X, Calendar,
} from 'lucide-react';
import { applyImageFallback } from '@/lib/utils';
import { getListingDetail, checkAvailability, calculatePricing, toggleWishlist, createBooking, getSimilarListings } from '@/services/listingService';
import { ListingCard } from '@/components/marketplace/ListingCard';
import { AvailabilityCalendar } from '@/components/marketplace/AvailabilityCalendar';
import type { ListingDetail, PricingCalculation, AvailabilityCheckResult, ListingCard as ListingCardType } from '@/types/listing';
import { AuthContext } from '@/lib/auth-context';
import { AuthModal } from '@/components/AuthModal';

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  'wifi': <Wifi size={20} />,
  'air conditioning': <Wind size={20} />,
  'free parking': <Car size={20} />,
  'parking': <Car size={20} />,
  'tv': <Tv size={20} />,
  'workspace': <Coffee size={20} />,
  'kitchen': <Utensils size={20} />,
  'security': <Shield size={20} />,
  'long-term stays': <Globe size={20} />,
};

function getAmenityIcon(label: string): React.ReactNode {
  const lower = label.toLowerCase();
  for (const key of Object.keys(AMENITY_ICONS)) {
    if (lower.includes(key)) return AMENITY_ICONS[key];
  }
  return <Check size={20} />;
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [similar, setSimilar] = useState<ListingCardType[]>([]);

  // Image gallery
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  // Booking widget state
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [guestCount, setGuestCount] = useState(1);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showGuests, setShowGuests] = useState(false);
  const [availability, setAvailability] = useState<AvailabilityCheckResult | null>(null);
  const [pricing, setPricing] = useState<PricingCalculation | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [wishlisted, setWishlisted] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const auth = useContext(AuthContext);

  // Build blocked/booked date sets for calendar
  const blockedDates = useMemo(() => {
    const set = new Set<string>();
    if (!listing) return set;
    for (const block of listing.availabilityBlocks) {
      const start = new Date(block.startDate);
      const end = new Date(block.endDate);
      const current = new Date(start);
      while (current <= end) {
        set.add(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
    }
    return set;
  }, [listing]);

  const bookedDates = useMemo(() => new Set<string>(), []);

  // Fetch listing
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getListingDetail(id)
      .then((data) => {
        if (!data) {
          setError('Listing not found');
        } else {
          setListing(data);
          setWishlisted(data.isWishlisted);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load listing');
        setLoading(false);
      });
  }, [id]);

  // Fetch similar listings
  useEffect(() => {
    if (!id) return;
    getSimilarListings(id, 4).then(setSimilar);
  }, [id]);

  // Check availability and calculate pricing when dates change
  const checkDates = useCallback(async () => {
    if (!id || !checkIn || !checkOut) return;
    const avail = await checkAvailability(id, checkIn, checkOut);
    setAvailability(avail);
    if (avail.isAvailable) {
      const price = await calculatePricing(id, checkIn, checkOut, guestCount);
      setPricing(price);
    } else {
      setPricing(null);
    }
  }, [id, checkIn, checkOut, guestCount]);

  useEffect(() => {
    checkDates();
  }, [checkDates]);

  const handleDateSelect = (date: string) => {
    if (!checkIn || (checkIn && checkOut)) {
      // Start new selection
      setCheckIn(date);
      setCheckOut(null);
    } else {
      // Selecting checkout
      if (new Date(date) > new Date(checkIn)) {
        setCheckOut(date);
        setShowCalendar(false);
      } else {
        // Reset — clicked a date before check-in
        setCheckIn(date);
        setCheckOut(null);
      }
    }
  };

  const handleWishlist = async () => {
    try {
      const newState = await toggleWishlist(id!);
      setWishlisted(newState);
    } catch {
      // Not authenticated
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: listing?.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 2000);
      }
    } catch {
      // User cancelled share
    }
  };

  const handleReserve = async () => {
    if (!checkIn || !checkOut) {
      setShowCalendar(true);
      return;
    }
    if (!availability?.isAvailable) {
      setBookingError(availability?.reason || 'Dates not available');
      return;
    }

    // Check authentication before creating booking
    if (!auth?.session) {
      try {
        sessionStorage.setItem('intendedDestination', `/homes/${id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guestCount}`);
      } catch {}
      setShowAuthModal(true);
      return;
    }

    setBookingLoading(true);
    setBookingError(null);
    try {
      const booking = await createBooking({
        propertyId: id!,
        checkIn,
        checkOut,
        guestCount,
      });

      if (!booking) {
        throw new Error('Failed to create booking');
      }

      // Store booking details and navigate to payment
      sessionStorage.setItem('bookingDetails', JSON.stringify({
        bookingId: booking.id,
        propertyId: id,
        propertyTitle: listing?.title,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        nights: booking.nightsCount,
        pricePerNight: booking.pricePerNight,
        cleaningFee: booking.cleaningFee,
        serviceFee: booking.serviceFee,
        total: booking.totalPrice,
        currency: booking.currency,
        guestCount,
      }));
      navigate('/payment');
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#BA0036]" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600">{error || 'Listing not found'}</p>
        <button onClick={() => navigate('/explore')} className="text-[#BA0036] font-medium hover:underline">
          Back to explore
        </button>
      </div>
    );
  }

  const images = listing.images.length > 0
    ? listing.images
    : [{ id: 'fallback', imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', altText: listing.title, sortOrder: 0, isPrimary: true }];

  const hostName = `${listing.host.firstName} ${listing.host.lastName}`.trim();

  return (
    <div className="min-h-screen bg-white">
      {/* Share toast */}
      {showShareToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm px-4 py-2 rounded-full shadow-lg">
          Link copied to clipboard
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate('/explore')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <ChevronLeft className="h-4 w-4" /> Back to explore
        </button>

        {/* Title & actions */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
              {listing.rating > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-gray-800 text-gray-800" />
                  {listing.rating.toFixed(2)} · {listing.reviewCount} reviews
                </span>
              )}
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {listing.address.city}, {listing.address.country}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Share2 className="h-4 w-4" /> Share
            </button>
            <button
              onClick={handleWishlist}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Heart className={`h-4 w-4 ${wishlisted ? 'fill-[#BA0036] text-[#BA0036]' : ''}`} />
              {wishlisted ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        {/* Image gallery */}
        <div className="grid h-[280px] grid-cols-1 gap-2 overflow-hidden rounded-2xl sm:h-[440px] sm:grid-cols-4 sm:grid-rows-2 mb-8">
          <div
            className="cursor-pointer group sm:col-span-2 sm:row-span-2"
            onClick={() => { setCurrentImageIdx(0); setShowAllPhotos(true); }}
          >
            <img
              src={images[0].imageUrl}
              alt={listing.title}
              onError={(e) => applyImageFallback(e)}
              className="w-full h-full object-cover group-hover:brightness-95 transition-all duration-300"
            />
          </div>
          {images.slice(1, 5).map((img, i) => (
            <div
              key={img.id}
              className="hidden cursor-pointer group sm:block"
              onClick={() => { setCurrentImageIdx(i + 1); setShowAllPhotos(true); }}
            >
              <img
                src={img.imageUrl}
                alt={`${listing.title} ${i + 2}`}
                onError={(e) => applyImageFallback(e)}
                className="w-full h-full object-cover group-hover:brightness-95 transition-all duration-300"
              />
            </div>
          ))}
          <button
            onClick={() => setShowAllPhotos(true)}
            className="absolute bottom-4 right-4 flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-900 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <div className="grid grid-cols-2 gap-0.5">
              {[0,1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 bg-gray-700 rounded-sm" />)}
            </div>
            Show all photos
          </button>
        </div>

        {/* Main content + booking widget */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <div>
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-lg font-semibold">{listing.type.charAt(0).toUpperCase() + listing.type.slice(1)}</span>
                <span className="flex items-center gap-1 text-sm text-gray-600">
                  <Users className="h-4 w-4" /> {listing.maxGuests} guests
                </span>
                <span className="flex items-center gap-1 text-sm text-gray-600">
                  <BedDouble className="h-4 w-4" /> {listing.bedrooms} bedrooms
                </span>
                <span className="flex items-center gap-1 text-sm text-gray-600">
                  <Bath className="h-4 w-4" /> {listing.features.bathrooms} baths
                </span>
              </div>
            </div>

            {/* Host info */}
            <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-[#BA0036]/10 flex items-center justify-center text-[#BA0036] font-semibold text-lg">
                {listing.host.firstName?.[0] || 'H'}
              </div>
              <div>
                <p className="font-semibold text-gray-900">Hosted by {hostName}</p>
                <p className="text-sm text-gray-500">{listing.reviewCount} reviews · Joined {new Date(listing.createdAt).getFullYear()}</p>
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">About this place</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{listing.description}</p>
              </div>
            )}

            {/* Amenities */}
            {listing.features.amenities.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">What this place offers</h2>
                <div className="grid grid-cols-2 gap-3">
                  {listing.features.amenities.map((amenity, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-gray-700">
                      <span className="text-gray-400">{getAmenityIcon(amenity)}</span>
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Availability Calendar */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Availability</h2>
              <p className="text-sm text-gray-500 mb-3">Select your check-in and check-out dates</p>
              <AvailabilityCalendar
                blockedDates={blockedDates}
                bookedDates={bookedDates}
                selectedCheckIn={checkIn}
                selectedCheckOut={checkOut}
                onDateSelect={handleDateSelect}
              />
            </div>

            {/* Reviews */}
            {listing.reviews.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  <Star className="h-5 w-5 inline fill-gray-800 text-gray-800 mr-1" />
                  {listing.rating.toFixed(2)} · {listing.reviewCount} reviews
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {listing.reviews.slice(0, 6).map((review) => (
                    <div key={review.id} className="p-4 border border-gray-200 rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium text-sm">
                          {review.guestName?.[0] || 'G'}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900">{review.guestName}</p>
                          <div className="flex items-center gap-1">
                            {[1,2,3,4,5].map((s) => (
                              <Star
                                key={s}
                                className={`h-3 w-3 ${s <= review.rating ? 'fill-gray-800 text-gray-800' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rules */}
            {listing.features.rules.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Things to know</h2>
                <div className="space-y-2">
                  {listing.features.rules.map((rule, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="h-4 w-4 text-gray-400" /> {rule}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cancellation Policy */}
            {listing.cancellationPolicy && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Cancellation policy</h2>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {listing.cancellationPolicy.policyType.replace('_', ' ')} cancellation
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {listing.cancellationPolicy.policyType === 'flexible' && 'Full refund 1 day before check-in. No refund after that.'}
                    {listing.cancellationPolicy.policyType === 'moderate' && 'Full refund 5 days before check-in. 50% refund after that.'}
                    {listing.cancellationPolicy.policyType === 'strict' && '50% refund up to 1 week before check-in. No refund after that.'}
                    {listing.cancellationPolicy.policyType === 'super_strict' && '25% refund up to 30 days before check-in. No refund after that.'}
                    {listing.cancellationPolicy.policyType === 'custom' && 'Custom cancellation rules apply.'}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Grace period: {listing.cancellationPolicy.gracePeriodHours} hours after booking for full refund.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right: Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              {/* Price */}
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-2xl font-bold text-gray-900">
                  ${listing.pricing.basePrice}
                </span>
                <span className="text-sm text-gray-500">
                  {listing.pricing.pricingType === 'monthly' ? '/month' : listing.pricing.pricingType === 'sale' ? '' : '/night'}
                </span>
                {listing.rating > 0 && (
                  <span className="ml-auto flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-gray-800 text-gray-800" />
                    {listing.rating.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Date & Guest selectors */}
              <div className="border border-gray-300 rounded-xl overflow-hidden mb-3">
                <div className="grid grid-cols-2">
                  <button
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="p-3 text-left border-r border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-xs font-bold uppercase text-gray-700">Check-in</div>
                    <div className="text-sm text-gray-900 mt-0.5">
                      {checkIn ? new Date(checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Add date'}
                    </div>
                  </button>
                  <button
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="p-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-xs font-bold uppercase text-gray-700">Check-out</div>
                    <div className="text-sm text-gray-900 mt-0.5">
                      {checkOut ? new Date(checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Add date'}
                    </div>
                  </button>
                </div>
                <div className="border-t border-gray-300 relative">
                  <button
                    onClick={() => setShowGuests(!showGuests)}
                    className="w-full p-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-xs font-bold uppercase text-gray-700">Guests</div>
                    <div className="text-sm text-gray-900 mt-0.5">
                      {guestCount} {guestCount === 1 ? 'guest' : 'guests'}
                    </div>
                  </button>
                  {showGuests && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm text-gray-900">Guests</p>
                          <p className="text-xs text-gray-500">Max {listing.maxGuests}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                            disabled={guestCount <= 1}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-30 hover:border-gray-900 transition-colors"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-medium">{guestCount}</span>
                          <button
                            onClick={() => setGuestCount(Math.min(listing.maxGuests, guestCount + 1))}
                            disabled={guestCount >= listing.maxGuests}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-30 hover:border-gray-900 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Inline calendar */}
              {showCalendar && (
                <div className="mb-3">
                  <AvailabilityCalendar
                    blockedDates={blockedDates}
                    bookedDates={bookedDates}
                    selectedCheckIn={checkIn}
                    selectedCheckOut={checkOut}
                    onDateSelect={handleDateSelect}
                  />
                </div>
              )}

              {/* Availability warning */}
              {availability && !availability.isAvailable && (
                <div className="mb-3 p-3 bg-red-50 rounded-lg text-sm text-red-700">
                  {availability.reason}
                </div>
              )}

              {/* Pricing breakdown */}
              {pricing && availability?.isAvailable && (
                <div className="space-y-2 mb-4 py-3 border-y border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      ${pricing.pricePerNight.toFixed(0)} x {pricing.nights} {pricing.nights === 1 ? 'night' : 'nights'}
                    </span>
                    <span className="text-gray-900 font-medium">${pricing.subtotal.toFixed(0)}</span>
                  </div>
                  {pricing.cleaningFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Cleaning fee</span>
                      <span className="text-gray-900 font-medium">${pricing.cleaningFee.toFixed(0)}</span>
                    </div>
                  )}
                  {pricing.serviceFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Service fee</span>
                      <span className="text-gray-900 font-medium">${pricing.serviceFee.toFixed(0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold pt-2 border-t border-gray-100">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">${pricing.total.toFixed(0)}</span>
                  </div>
                </div>
              )}

              {/* Reserve button */}
              <button
                onClick={handleReserve}
                disabled={bookingLoading || (!checkIn || !checkOut)}
                className="w-full py-3 bg-[#BA0036] text-white font-semibold rounded-xl hover:bg-[#9a0028] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bookingLoading ? 'Creating booking...' : !checkIn || !checkOut ? 'Select dates' : 'Reserve'}
              </button>

              {bookingError && (
                <p className="mt-2 text-sm text-red-600 text-center">{bookingError}</p>
              )}

              <p className="text-center text-xs text-gray-500 mt-2">You won't be charged yet</p>
            </div>
          </div>
        </div>

        {/* Similar listings */}
        {similar.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Similar homes nearby</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similar.map((s) => (
                <ListingCard key={s.id} listing={s} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Full-screen photo gallery */}
      {showAllPhotos && (
        <div className="fixed inset-0 bg-black z-50 overflow-auto">
          <div className="sticky top-0 bg-black p-4 flex items-center justify-between z-10">
            <span className="text-white text-sm">{currentImageIdx + 1} / {images.length}</span>
            <button
              onClick={() => setShowAllPhotos(false)}
              className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex flex-col items-center gap-4 p-4">
            {images.map((img, i) => (
              <img
                key={img.id}
                src={img.imageUrl}
                alt={`${listing.title} ${i + 1}`}
                onError={(e) => applyImageFallback(e)}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
            ))}
          </div>
        </div>
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={async () => {
            setShowAuthModal(false);
            try { await auth?.refreshProfile(); } catch {}
            handleReserve();
          }}
        />
      )}
    </div>
  );
}
