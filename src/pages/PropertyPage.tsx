"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Star, Heart, Share2, ChevronLeft, MapPin,
  Wifi, Wind, Car, Tv, Coffee, Utensils, Shield, X, ChevronRight,
  Award, Globe
} from "lucide-react";
import { AboutSpaceModal } from "../components/AboutSpaceModal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Property {
  id: number;
  title: string;
  type: string;
  location?: string;
  city: string;
  price: string;
  priceUnit: string;
  rating?: number;
  reviews?: number;
  beds: number;
  baths: number;
  guests?: number;
  image: string;
  images?: string[];
}

interface PropertyPageProps {
  property: Property;
  onBack: () => void;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const AMENITIES = [
  { icon: <Wifi size={20} />,     label: "Fast wifi",           sub: "Upload: 250 Mbps" },
  { icon: <Wind size={20} />,     label: "Air conditioning",    sub: "Available" },
  { icon: <Car size={20} />,      label: "Free parking",        sub: "On premises" },
  { icon: <Tv size={20} />,       label: "55\" HDTV",           sub: "Netflix, Prime" },
  { icon: <Coffee size={20} />,   label: "Workspace",           sub: "Dedicated desk" },
  { icon: <Utensils size={20} />, label: "Full kitchen",        sub: "All amenities" },
  { icon: <Shield size={20} />,   label: "Security cameras",    sub: "On property" },
  { icon: <Globe size={20} />,    label: "Long-term stays ok",  sub: "Monthly discount" },
];

const REVIEWS = [
  { name: "Amina K.",  avatar: "A", flag: "🇰🇪", date: "March 2025",    rating: 5, text: "Absolutely stunning place. Cynthia was incredibly responsive and the apartment was spotless. The views from the balcony are unreal — highly recommend!" },
  { name: "Omar S.",   avatar: "O", flag: "🇸🇴", date: "February 2025", rating: 5, text: "Perfect location near Yaya Centre. Everything was as described and the check-in was seamless. Will definitely stay again when I'm in Nairobi." },
  { name: "Fatuma H.", avatar: "F", flag: "🇹🇿", date: "January 2025",  rating: 5, text: "One of the best Airbnb experiences I've had in East Africa. The apartment is modern, clean, and has everything you need for a comfortable stay." },
  { name: "David M.",  avatar: "D", flag: "🇺🇬", date: "December 2024", rating: 5, text: "Loved the pool access and the studio setup. Great for both work and relaxation. The host went above and beyond to make us feel welcome." },
];

const RATING_BREAKDOWN = [
  { label: "Cleanliness",   score: 5.0 },
  { label: "Accuracy",      score: 4.9 },
  { label: "Check-in",      score: 5.0 },
  { label: "Communication", score: 5.0 },
  { label: "Location",      score: 4.8 },
  { label: "Value",         score: 4.9 },
];

const NEARBY = [
  { title: "Garden Studio, Kilimani",     type: "Studio · Nairobi",    price: "$85",  rating: 4.87, image: "https://images.unsplash.com/photo-1560185127-6a12f9a26fe5?w=400&q=80" },
  { title: "Luxury Apt, Westlands",       type: "Apartment · Nairobi", price: "$140", rating: 4.95, image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80" },
  { title: "Modern Villa, Karen",         type: "Villa · Nairobi",     price: "$280", rating: 4.92, image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&q=80" },
  { title: "Penthouse Suite, Upper Hill", type: "Penthouse · Nairobi", price: "$195", rating: 4.98, image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80" },
];

// ─── Image Grid ───────────────────────────────────────────────────────────────

function ImageGrid({ images, title, onShowAll }: { images: string[]; title: string; onShowAll: () => void }) {
  const [main, ...rest] = images;
  return (
    <div className="relative">
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[480px] rounded-3xl overflow-hidden">
        <div className="col-span-2 row-span-2 cursor-pointer group" onClick={onShowAll}>
          <img src={main} alt={title} className="w-full h-full object-cover group-hover:brightness-95 transition-all duration-300" />
        </div>
        {rest.slice(0, 4).map((img, i) => (
          <div key={i} className="cursor-pointer group" onClick={onShowAll}>
            <img src={img} alt={`${title} ${i + 2}`} className="w-full h-full object-cover group-hover:brightness-95 transition-all duration-300" />
          </div>
        ))}
      </div>
      <button onClick={onShowAll}
        className="absolute bottom-4 right-4 bg-white border border-gray-300 text-gray-900 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2">
        <div className="grid grid-cols-2 gap-0.5">
          {[0,1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 bg-gray-700 rounded-sm" />)}
        </div>
        Show all photos
      </button>
    </div>
  );
}

// ─── Full Screen Gallery ──────────────────────────────────────────────────────

function FullGallery({ images, title, onClose }: { images: string[]; title: string; onClose: () => void }) {
  const [current, setCurrent] = useState(0);
  return (
    <div className="fixed inset-0 bg-white z-[200] flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
          <X size={18} />
        </button>
        <span className="text-sm font-semibold text-gray-700">{current + 1} / {images.length}</span>
        <div />
      </div>
      <div className="flex-1 relative flex items-center justify-center bg-gray-50 px-16">
        <img src={images[current]} alt={title} className="max-h-full max-w-full object-contain rounded-2xl shadow-xl" />
        {current > 0 && (
          <button onClick={() => setCurrent(c => c - 1)} className="absolute left-4 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors">
            <ChevronLeft size={18} />
          </button>
        )}
        {current < images.length - 1 && (
          <button onClick={() => setCurrent(c => c + 1)} className="absolute right-4 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors">
            <ChevronRight size={18} />
          </button>
        )}
      </div>
      <div className="flex gap-2 px-6 py-4 overflow-x-auto border-t border-gray-100">
        {images.map((img, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${current === i ? "border-gray-900" : "border-transparent"}`}>
            <img src={img} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Booking Widget ───────────────────────────────────────────────────────────
// ✅ FIX: Added onReserve prop — no longer references parent state directly

function BookingWidget({
  price,
  rating,
  reviews,
  onReserve,
}: {
  price: string;
  rating: number;
  reviews: number;
  onReserve: (details: { checkIn: string; checkOut: string; guests: number; nights: number; priceNum: number }) => void;
}) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  const nights = checkIn && checkOut
    ? Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)))
    : 2;

  const priceNum = parseInt(price.replace(/\D/g, "")) || 0;
  const subtotal = priceNum * nights;
  const cleaningFee = 25;
  const serviceFee = Math.round(subtotal * 0.14);
  const total = subtotal + cleaningFee + serviceFee;

  const handleReserve = () => {
    onReserve({
      checkIn:  checkIn  || "Apr 3",
      checkOut: checkOut || "Apr 5",
      guests,
      nights,
      priceNum,
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg sticky top-24">
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-2xl font-bold text-gray-900">{price}</span>
        <span className="text-gray-500 text-sm">/ night</span>
      </div>
      <div className="flex items-center gap-1 mb-5">
        <Star size={13} className="fill-[#E8344E] text-[#E8344E]" />
        <span className="text-sm font-semibold">{rating.toFixed(2)}</span>
        <span className="text-sm text-gray-400">·</span>
        <span className="text-sm text-gray-500 underline cursor-pointer">{reviews} reviews</span>
      </div>

      <div className="border border-gray-300 rounded-xl overflow-hidden mb-3">
        <div className="grid grid-cols-2 divide-x divide-gray-300">
          <div className="p-3">
            <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wide block mb-1">Check-in</label>
            <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
              className="text-sm text-gray-900 outline-none w-full bg-transparent" />
          </div>
          <div className="p-3">
            <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wide block mb-1">Checkout</label>
            <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)}
              className="text-sm text-gray-900 outline-none w-full bg-transparent" />
          </div>
        </div>
        <div className="border-t border-gray-300 p-3">
          <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wide block mb-1">Guests</label>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-900">{guests} guest{guests !== 1 ? "s" : ""}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setGuests(g => Math.max(1, g - 1))}
                className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-500 transition-colors text-lg leading-none">−</button>
              <span className="text-sm font-semibold w-4 text-center">{guests}</span>
              <button onClick={() => setGuests(g => Math.min(10, g + 1))}
                className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-500 transition-colors text-lg leading-none">+</button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Reserve button now calls onReserve prop */}
      <button
        onClick={handleReserve}
        className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.99] mb-4"
        style={{ background: "linear-gradient(135deg,#E8344E,#c9263f)" }}
      >
        Reserve
      </button>
      <p className="text-center text-xs text-gray-500 mb-4">You won't be charged yet</p>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-700 underline cursor-pointer">{price} × {nights} nights</span>
          <span className="text-gray-900">${subtotal}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700 underline cursor-pointer">Cleaning fee</span>
          <span className="text-gray-900">${cleaningFee}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700 underline cursor-pointer">GuriGate service fee</span>
          <span className="text-gray-900">${serviceFee}</span>
        </div>
        <div className="h-px bg-gray-200" />
        <div className="flex justify-between font-bold text-gray-900">
          <span>Total before taxes</span>
          <span>${total}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Property Page ───────────────────────────────────────────────────────

export default function PropertyPage({ property, onBack }: PropertyPageProps) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const images = property.images ?? [
    property.image,
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
  ];

  // ✅ When Reserve is clicked, navigate to payment page with booking details
  const handleReserve = (details: { checkIn: string; checkOut: string; guests: number; nights: number; priceNum: number }) => {
    // Store booking details in sessionStorage to pass to payment page
    sessionStorage.setItem('bookingDetails', JSON.stringify({
      propertyTitle: property.title,
      propertyImage: property.image,
      rating: property.rating,
      reviews: property.reviews ?? 39,
      checkIn: details.checkIn,
      checkOut: details.checkOut,
      guests: details.guests,
      nights: details.nights,
      pricePerNight: details.priceNum,
    }));
    
    // Navigate to payment page
    navigate('/payment');
  };

  // ✅ Removed conditional PaymentPage rendering - now navigates to route
  return (
    <div className="bg-white min-h-screen font-sans">
      {showGallery && (
        <FullGallery images={images} title={property.title} onClose={() => setShowGallery(false)} />
      )}

      {/* Sticky top bar */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
            <ChevronLeft size={18} /> Back
          </button>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 underline transition-colors">
              <Share2 size={15} /> Share
            </button>
            <button onClick={() => setLiked(!liked)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 underline transition-colors">
              <Heart size={15} className={liked ? "fill-[#E8344E] text-[#E8344E]" : ""} />
              {liked ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{property.title}</h1>
        <div className="flex items-center gap-2 mb-5 text-sm">
          <Star size={13} className="fill-[#E8344E] text-[#E8344E]" />
          <span className="font-semibold">{property.rating.toFixed(2)}</span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-700 underline cursor-pointer font-medium">{property.reviews ?? 39} reviews</span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-700 flex items-center gap-1"><MapPin size={13} /> {property.city}</span>
        </div>

        {/* Image Grid */}
        <div className="mb-8">
          <ImageGrid images={images} title={property.title} onShowAll={() => setShowGallery(true)} />
        </div>

        {/* Main content + booking widget */}
        <div className="flex gap-12">
          <div className="flex-1 min-w-0">

            {/* Property meta */}
            <div className="flex items-start justify-between pb-6 border-b border-gray-200 mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Entire {property.type.toLowerCase()} in {property.city}</h2>
                <p className="text-gray-600 text-sm">
                  {property.guests ?? 4} guests · {property.beds} bedroom{property.beds !== 1 ? "s" : ""} · {property.beds} beds · {property.baths} bath{property.baths !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E8344E] to-[#ff6b6b] flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ml-4">C</div>
            </div>

            {/* Highlights */}
            <div className="space-y-5 pb-6 border-b border-gray-200 mb-6">
              {[
                { icon: <Award size={22} />,  title: "Guest favourite",  sub: "This home is in the top 5% of eligible listings based on ratings, reviews, and reliability." },
                { icon: <MapPin size={22} />, title: "Great location",   sub: "95% of recent guests gave the location a 5-star rating." },
                { icon: <Shield size={22} />, title: "Self check-in",    sub: "Check yourself in with the lockbox." },
              ].map(({ icon, title, sub }) => (
                <div key={title} className="flex gap-4">
                  <span className="text-gray-700 flex-shrink-0 mt-0.5">{icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{title}</p>
                    <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="pb-6 border-b border-gray-200 mb-6">
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                Welcome to this stunning modern studio nestled in the heart of {property.city}. This thoughtfully designed space combines contemporary aesthetics with all the comforts of home, making it perfect for both short visits and extended stays.
              </p>
              <button 
                onClick={() => setShowAbout(true)}
                className="text-sm font-semibold text-gray-900 underline underline-offset-2 hover:text-gray-700 transition-colors"
              >
                Show more →
              </button>
            </div>

            {/* Amenities */}
            <div className="pb-6 border-b border-gray-200 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">What this place offers</h3>
              <div className="grid grid-cols-2 gap-3">
                {AMENITIES.map(({ icon, label, sub }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-gray-600 flex-shrink-0">{icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{label}</p>
                      <p className="text-xs text-gray-500">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="pb-6 border-b border-gray-200 mb-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="text-center">
                  <p className="text-5xl font-bold text-gray-900 leading-none">{property.rating.toFixed(1)}</p>
                  <p className="text-xs font-semibold text-gray-700 mt-1">Guest favourite</p>
                </div>
                <div className="flex-1 ml-6">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                    {RATING_BREAKDOWN.map(({ label, score }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-xs text-gray-700">{label}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gray-900 rounded-full" style={{ width: `${(score / 5) * 100}%` }} />
                          </div>
                          <span className="text-xs font-medium text-gray-900 w-6 text-right">{score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                {REVIEWS.map(({ name, avatar, flag, date, rating: r, text }) => (
                  <div key={name}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{avatar}</div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{name} {flag}</p>
                        <p className="text-xs text-gray-500">{date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 mb-1.5">
                      {[...Array(r)].map((_, i) => <Star key={i} size={11} className="fill-gray-900 text-gray-900" />)}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="pb-6 border-b border-gray-200 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Where you'll be</h3>
              <p className="text-sm text-gray-600 mb-4">{property.location ?? property.city}, Kenya</p>
              <div className="w-full h-64 bg-gray-100 rounded-2xl overflow-hidden relative">
                <div className="absolute inset-0 bg-[#e8e0d8] flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-10 h-10 bg-[#E8344E] rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                      <MapPin size={20} className="text-white" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700">{property.city}</p>
                    <p className="text-xs text-gray-500">Exact location provided after booking</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Host */}
            <div className="pb-6 border-b border-gray-200 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Meet your host</h3>
              <div className="flex gap-6">
                <div className="text-center flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E8344E] to-[#ff6b6b] flex items-center justify-center text-white font-bold text-2xl mb-2 mx-auto shadow-md">C</div>
                  <p className="text-sm font-bold text-gray-900">Cynthia</p>
                  <p className="text-xs text-gray-500">Superhost</p>
                </div>
                <div>
                  <div className="flex gap-4 mb-3">
                    {[{ v: "96", l: "Reviews" }, { v: "5.0", l: "Rating" }, { v: "5yr", l: "Hosting" }].map(({ v, l }) => (
                      <div key={l}><p className="text-xl font-bold text-gray-900">{v}</p><p className="text-xs text-gray-500">{l}</p></div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">
                    Hi! I'm Cynthia, a Nairobi local passionate about making your stay unforgettable.
                  </p>
                  <button className="border border-gray-900 text-gray-900 text-sm font-semibold px-5 py-2 rounded-xl hover:bg-gray-50 transition-colors">Message Host</button>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ Right: BookingWidget now receives onReserve prop */}
          <div className="w-[380px] flex-shrink-0">
            <BookingWidget
              price={property.price}
              rating={property.rating}
              reviews={property.reviews ?? 39}
              propertyTitle={property.title}
              propertyImage={property.image}
              onReserve={handleReserve}
            />
          </div>
        </div>

        {/* More stays nearby */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-5">More stays nearby</h3>
          <div className="grid grid-cols-4 gap-4">
            {NEARBY.map(({ title, type, price, rating: r, image }) => (
              <div key={title} className="group cursor-pointer">
                <div className="rounded-2xl overflow-hidden aspect-[4/3] mb-2.5">
                  <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <p className="text-sm font-semibold text-gray-900 truncate">{title}</p>
                <p className="text-xs text-gray-500">{type}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm font-semibold text-gray-900">{price} <span className="font-normal text-gray-500">night</span></p>
                  <div className="flex items-center gap-1">
                    <Star size={11} className="fill-[#E8344E] text-[#E8344E]" />
                    <span className="text-xs font-medium">{r}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* About Space Modal */}
      {showAbout && (
        <AboutSpaceModal
          onClose={() => setShowAbout(false)}
          title="About this space"
          description={`Welcome to this stunning modern studio nestled in the heart of ${property.city}. This thoughtfully designed space combines contemporary aesthetics with all the comforts of home, making it perfect for both short visits and extended stays.

Guests will have full private access to studio and all building amenities, including:

Infinity swimming pool

Fully equipped gym

Pool table lounge

Kids' play area & rock climbing wall

On-site minimart

24/7 security and concierge

During your stay

I'm available around the clock via app for any questions or assistance. I typically respond within minutes.

Other things to note

Please note that building has strict no-party and no-smoking policies in all units and common areas. Quiet hours are from 10pm to 7am.`}
        />
      )}
    </div>
  );
}