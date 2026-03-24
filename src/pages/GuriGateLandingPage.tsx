"use client";

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  ChevronDown,
  Heart,
  Search,
  MapPin,
  Star,
  Calendar,
  Home,
  Building,
  Building2,
  Bed,
  Bath,
  Maximize2,
  Car,
  Armchair,
  Trees,
  Shield,
  ShieldCheck,
  Wifi,
  Wind,
  UserRoundPen,
  Settings,
  HelpCircle,
  UserPlus,
  Users,
  Gift,
  LogOut,
  Plane,
  MessagesSquare,
  LayersPlus,
  BadgeQuestionMark,
  UserRoundSearch,
  Key,
  Compass,
  Globe,
  SlidersHorizontal,
  Hotel,
} from "lucide-react";
import { WhenPicker } from "@/components/WhenPicker";
import { WhereDropdown } from "@/components/WhereDropdown";
import { WhoDropdown } from "@/components/WhoDropdown";
import { PopularHomesSection } from "@/components/PopularHomesSection";
import { ProfileMenu } from "@/components/ProfileMenu";
import PropertyPage from "@/pages/PropertyPage";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Property {
  id: number;
  title: string;
  address: string;
  price: string;
  priceUnit: string;
  beds: number;
  baths: number;
  sqft: number;
  badge: "FOR SALE" | "FOR RENT" | "SHORT STAY";
  featured?: boolean;
  image: string;
  rating?: number;
  location?: string;
  type: string;
  city: string;
  reviews?: number;
  guests?: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const FEATURED_PROPERTIES: Property[] = [
  {
    id: 1,
    title: "Skyper Pool Apartment",
    address: "1020 Bloomingdale Ave",
    price: "$280,000",
    priceUnit: "",
    beds: 4,
    baths: 2,
    sqft: 450,
    badge: "FOR SALE",
    image:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
    type: "Apartment",
    city: "Nairobi",
  },
  {
    id: 2,
    title: "Skyper Pool Apartment",
    address: "1020 Bloomingdale Ave",
    price: "$280,000",
    priceUnit: "",
    beds: 4,
    baths: 2,
    sqft: 450,
    badge: "FOR SALE",
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80",
    type: "Apartment",
    city: "Nairobi",
  },
  {
    id: 3,
    title: "North Dillard Street",
    address: "4330 Bell Shoals Rd",
    price: "$250",
    priceUnit: "/month",
    beds: 4,
    baths: 2,
    sqft: 400,
    badge: "FOR RENT",
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80",
    type: "House",
    city: "Nairobi",
  },
  {
    id: 4,
    title: "North Dillard Street",
    address: "4330 Bell Shoals Rd",
    price: "$250",
    priceUnit: "/month",
    beds: 4,
    baths: 2,
    sqft: 400,
    badge: "FOR RENT",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80",
    type: "House",
    city: "Nairobi",
  },
  {
    id: 5,
    title: "Eaton Garth Penthouse",
    address: "7722 18th Ave, Brooklyn",
    price: "$180,000",
    priceUnit: "",
    beds: 4,
    baths: 2,
    sqft: 450,
    badge: "FOR SALE",
    featured: true,
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80",
    type: "Penthouse",
    city: "Nairobi",
  },
  {
    id: 6,
    title: "Eaton Garth Penthouse",
    address: "7722 18th Ave, Brooklyn",
    price: "$180,000",
    priceUnit: "",
    beds: 4,
    baths: 2,
    sqft: 450,
    badge: "FOR SALE",
    featured: true,
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
    type: "Penthouse",
    city: "Nairobi",
  },
];

const NAIROBI_HOMES: Property[] = [
  {
    id: 7,
    title: "Modern Penthouse in Kileleshwa",
    type: "Apartment in Nairobi",
    price: "$120",
    priceUnit: "for 2 nights",
    beds: 3,
    baths: 2,
    sqft: 320,
    badge: "SHORT STAY",
    rating: 5.0,
    address: "Kileleshwa, Nairobi",
    city: "Nairobi",
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80",
  },
  {
    id: 8,
    title: "Modern Penthouse in Kileleshwa",
    type: "Apartment in Nairobi",
    price: "$120",
    priceUnit: "for 2 nights",
    beds: 3,
    baths: 2,
    sqft: 320,
    badge: "SHORT STAY",
    rating: 5.0,
    address: "2172 18th Ave, Nairobi",
    city: "Nairobi",
    image:
      "https://images.unsplash.com/photo-1560185127-6a12f9a26fe5?w=600&q=80",
  },
  {
    id: 9,
    title: "Garden Oasis, Karen",
    type: "Villa in Nairobi",
    price: "$245",
    priceUnit: "for 2 nights",
    beds: 5,
    baths: 3,
    sqft: 600,
    badge: "SHORT STAY",
    rating: 4.92,
    address: "Karen, Nairobi",
    city: "Nairobi",
    image:
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&q=80",
  },
];

const HARGEISA_HOMES: Property[] = [
  {
    id: 10,
    title: "Modern Penthouse in Kileleshwa",
    type: "Apartment in Hargeisa",
    price: "$120",
    priceUnit: "for 2 nights",
    beds: 3,
    baths: 2,
    sqft: 320,
    badge: "SHORT STAY",
    rating: 5.0,
    address: "Hargeisa",
    city: "Hargeisa",
    image:
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=80",
  },
  {
    id: 11,
    title: "Modern Penthouse in Kileleshwa",
    type: "Apartment in Hargeisa",
    price: "$120",
    priceUnit: "for 2 nights",
    beds: 3,
    baths: 2,
    sqft: 320,
    badge: "SHORT STAY",
    rating: 5.0,
    address: "Hargeisa",
    city: "Hargeisa",
    image:
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80",
  },
  {
    id: 12,
    title: "Garden Oasis, Karen",
    type: "Villa in Hargeisa",
    price: "$245",
    priceUnit: "for 2 nights",
    beds: 5,
    baths: 3,
    sqft: 600,
    badge: "SHORT STAY",
    rating: 4.92,
    address: "Hargeisa",
    city: "Hargeisa",
    image:
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=600&q=80",
  },
];

const AMENITIES = [
  "Air conditioning",
  "Assisted living",
  "Disability Access",
  "Controlled access",
  "Cable Ready",
  "Available now",
  "Cottage",
  "Corporate",
  "Elevator",
  "Extra Storage",
  "High-speed internet",
  "Garage",
  "Pet allowed",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

// ─── Profile Dropdown ─────────────────────────────────────────────────────────
function ProfileDropdown({ onClose, onNavigateProfile }: { onClose: () => void; onNavigateProfile: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const primaryItems = [
    { icon: <Heart size={15} />, label: "Wishlists" },
    { icon: <Plane size={15} />, label: "Trips" },
    { icon: <MessagesSquare size={15} />, label: "Messages" },
    { icon: <UserRoundPen size={15} />, label: "Profile", active: true },
  ];

  const accountItems = [
    { icon: <Settings size={15} />, label: "Account Settings" },
    { icon: <Globe size={15} />, label: "Language & Currency" },
    { icon: <BadgeQuestionMark size={15} />, label: "Help Center" },
  ];

  const hostItems = [
    { icon: <UserRoundSearch size={15} />, label: "Refer a Host" },
    { icon: <LayersPlus size={15} />, label: "Find a Co-host" },
    { icon: <Gift size={15} />, label: "Gift Cards" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.08)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={ref}
        className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
        style={{ animation: "ddIn .18s cubic-bezier(.16,1,.3,1) both" }}
      >
        <style>{`
          @keyframes ddIn {
            from { opacity: 0; transform: translateY(-8px) scale(.97); }
            to   { opacity: 1; transform: translateY(0)   scale(1);    }
          }
        `}</style>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ background: "linear-gradient(135deg,#E8344E,#ff6b6b)" }}
            >
              P
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900 leading-none">Welcome back</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Premium Member</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400"
            title="Close"
          >
            <X size={13} />
          </button>
        </div>

        {/* ── Primary ── */}
        <div className="py-1.5">
          {primaryItems.map(({ icon, label, active }) => (
            <button
              key={label}
              onClick={() => {
                if (label === "Profile") {
                  onNavigateProfile();
                }
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-[#E8344E]/10 text-[#E8344E] font-semibold"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className={active ? "text-[#E8344E]" : "text-gray-400"}>{icon}</span>
              {label}
            </button>
          ))}
        </div>

        <div className="h-px bg-gray-100 mx-4" />

        {/* ── Account ── */}
        <div className="py-1.5">
          {accountItems.map(({ icon, label }) => (
            <button
              key={label}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-400">{icon}</span>
              {label}
            </button>
          ))}
        </div>

        <div className="h-px bg-gray-100 mx-4" />

        {/* ── Hosting ── */}
        <div className="py-1.5">
          <div className="px-4 pt-1 pb-1">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Hosting
            </span>
          </div>
          {hostItems.map(({ icon, label, href }) => (
            href ? (
              <a
                key={label}
                href={href}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-400">{icon}</span>
                {label}
              </a>
            ) : (
              <button
                key={label}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-400">{icon}</span>
                {label}
              </button>
            )
          ))}
        </div>

        <div className="h-px bg-gray-100 mx-4" />

        {/* ── Log Out ── */}
        <div className="py-1.5">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#E8344E] hover:bg-[#E8344E]/10 transition-colors font-medium">
            <Key size={15} /> Log Out
          </button>
        </div>
      </div>
    </>
  );
}

function BadgePill({ badge }: { badge: Property["badge"] }) {
  const colors: Record<Property["badge"], string> = {
    "FOR SALE": "bg-[#E8344E] text-white",
    "FOR RENT": "bg-[#2563EB] text-white",
    "SHORT STAY": "bg-[#059669] text-white",
  };
  return (
    <span
      className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm tracking-wide ${colors[badge]}`}
    >
      {badge}
    </span>
  );
}

function FeaturedPropertyCard({ property }: { property: Property }) {
  const [liked, setLiked] = useState(false);
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="relative">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-44 object-cover"
        />
        <div className="absolute top-3 left-3 flex gap-1.5">
          <BadgePill badge={property.badge} />
          {property.featured && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-sm bg-amber-400 text-amber-900 tracking-wide">
              FEATURED
            </span>
          )}
        </div>
        <button
          onClick={() => setLiked(!liked)}
          className="absolute top-3 right-3 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow"
          title="Toggle like"
        >
          <Heart
            size={14}
            className={liked ? "fill-[#E8344E] text-[#E8344E]" : "text-gray-400"}
          />
        </button>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-sm font-semibold text-gray-900 leading-tight">
            {property.title}
          </h3>
          <span className="text-sm font-bold text-[#E8344E] whitespace-nowrap ml-2">
            {property.price}
            <span className="text-xs font-normal text-gray-500">
              {property.priceUnit}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-1 text-gray-400 mb-3">
          <MapPin size={11} />
          <span className="text-xs text-gray-500">{property.address}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-500 text-xs border-t border-gray-100 pt-3">
          <span className="flex items-center gap-1">
            <Bed size={12} /> {property.beds} Beds
          </span>
          <span className="flex items-center gap-1">
            <Bath size={12} /> {property.baths} Baths
          </span>
          <span className="flex items-center gap-1">
            <Maximize2 size={12} /> {property.sqft} sqft
          </span>
        </div>
      </div>
    </div>
  );
}

function PopularPropertyCard({ property, onClick }: { property: Property; onClick: () => void }) {
  const [liked, setLiked] = useState(false);
  return (
    <div className="group cursor-pointer" onClick={onClick}>
      <div className="relative rounded-2xl overflow-hidden mb-2.5">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <span className="text-xs font-medium bg-white text-gray-700 px-2.5 py-1 rounded-full shadow-sm">
            Guest favourite
          </span>
        </div>
        <button
          onClick={() => setLiked(!liked)}
          className="absolute top-3 right-3"
          title="Toggle favorite"
        >
          <Heart
            size={18}
            className={
              liked
                ? "fill-[#E8344E] text-[#E8344E] drop-shadow"
                : "text-white drop-shadow"
            }
          />
        </button>
      </div>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{property.title}</h3>
          <p className="text-xs text-gray-500">{property.type}</p>
          <p className="text-xs text-gray-900 mt-1">
            <span className="font-semibold">{property.price}</span>{" "}
            <span className="text-gray-500">{property.priceUnit}</span>
          </p>
        </div>
        {property.rating && (
          <div className="flex items-center gap-1 text-xs font-medium text-gray-800 mt-0.5">
            <Star size={12} className="fill-[#E8344E] text-[#E8344E]" />
            {property.rating.toFixed(2)}
          </div>
        )}
      </div>
    </div>
  );
}

function CustomerFilters() {
  const [bedrooms, setBedrooms] = useState<string>("Any");
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(198);
  const [sqftMin, setSqftMin] = useState(0);
  const [sqftMax, setSqftMax] = useState(3200);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    "Air conditioning",
  ]);

  const toggleAmenity = (a: string) =>
    setSelectedAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-24">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-gray-900">
          Customer
          <br />
          Filters
        </h2>
        <button className="w-7 h-7 bg-[#E8344E] rounded-full flex items-center justify-center" title="Close filters">
          <X size={14} className="text-white" />
        </button>
      </div>

      {/* Bedrooms */}
      <div className="mb-5">
        <label className="text-xs font-semibold text-gray-700 block mb-2">
          Bedrooms
        </label>
        <div className="flex flex-wrap gap-1.5">
          {["Any", "1", "2", "3", "4", "5+"].map((b) => (
            <button
              key={b}
              onClick={() => setBedrooms(b)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                bedrooms === b
                  ? "bg-[#E8344E] text-white border-[#E8344E]"
                  : "text-gray-600 border-gray-200 hover:border-[#E8344E]"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-5">
        <label className="text-xs font-semibold text-gray-700 block mb-2">
          Price Range
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="number"
            value={priceMin}
            onChange={(e) => setPriceMin(Number(e.target.value))}
            className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#E8344E]"
            placeholder="Min price"
            title="Minimum price"
          />
          <input
            type="number"
            value={priceMax}
            onChange={(e) => setPriceMax(Number(e.target.value))}
            className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#E8344E]"
            placeholder="Max price"
            title="Maximum price"
          />
        </div>
        <input
          type="range"
          min={0}
          max={500}
          value={priceMax}
          onChange={(e) => setPriceMax(Number(e.target.value))}
          className="w-full accent-[#E8344E]"
          title="Maximum price range"
          placeholder="Price range"
        />
        <p className="text-right text-[10px] text-gray-400">${priceMax}</p>
      </div>

      {/* Square Feet */}
      <div className="mb-5">
        <label className="text-xs font-semibold text-gray-700 block mb-2">
          Square Feet
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="number"
            value={sqftMin}
            onChange={(e) => setSqftMin(Number(e.target.value))}
            className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#E8344E]"
            placeholder="Min sqft"
            title="Minimum square feet"
          />
          <input
            type="number"
            value={sqftMax}
            onChange={(e) => setSqftMax(Number(e.target.value))}
            className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#E8344E]"
            placeholder="Max sqft"
            title="Maximum square feet"
          />
        </div>
        <input
          type="range"
          min={0}
          max={5000}
          value={sqftMax}
          onChange={(e) => setSqftMax(Number(e.target.value))}
          className="w-full accent-[#E8344E]"
        />
      </div>

      {/* Year Built */}
      <div className="mb-5">
        <label className="text-xs font-semibold text-gray-700 block mb-2">
          Year Built
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <select className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none appearance-none focus:border-[#E8344E]" title="Minimum year built">
              <option>Min Year</option>
              {Array.from({ length: 30 }, (_, i) => 1995 + i).map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="absolute right-2 top-2 text-gray-400 pointer-events-none"
            />
          </div>
          <div className="relative flex-1">
            <select className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none appearance-none focus:border-[#E8344E]" title="Maximum year built">
              <option>Max Year</option>
              {Array.from({ length: 30 }, (_, i) => 1995 + i).map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="absolute right-2 top-2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div className="mb-6">
        <label className="text-xs font-semibold text-gray-700 block mb-2">
          Amenities
        </label>
        <div className="flex flex-wrap gap-1.5">
          {AMENITIES.map((a) => (
            <button
              key={a}
              onClick={() => toggleAmenity(a)}
              className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                selectedAmenities.includes(a)
                  ? "bg-red-50 text-[#E8344E] border-[#E8344E]"
                  : "text-gray-500 border-gray-200 hover:border-gray-400"
              }`}
            >
              {selectedAmenities.includes(a) && (
                <span className="mr-1">×</span>
              )}
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setSelectedAmenities([])}
          className="flex-1 text-xs py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Clear all
        </button>
        <button className="flex-1 text-xs py-2.5 rounded-xl bg-[#BA0036] text-white font-semibold hover:bg-[#a4003a] transition-colors">
          Show 142 results
        </button>
      </div>

      {/* Find Sanctuary CTA */}
      <div
        className="mt-4 rounded-2xl p-4 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=60')] bg-cover bg-center" />
        <div className="relative z-10">
          <Compass size={18} className="text-white mb-2 opacity-70" />
          <h3 className="text-white font-bold text-base leading-tight mb-1">
            Find your true Sanctuary
          </h3>
          <p className="text-gray-300 text-[11px] mb-3 leading-relaxed">
            Explore our hand-picked collection of remote and beautiful sanctuaries.
          </p>
          <button className="bg-[#BA0036] text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-[#a4003a] transition-colors">
            Explore Curated
          </button>
        </div>
      </div>

      {/* Verified Comfort */}
      <div className="mt-3 rounded-2xl p-4 bg-[#BA0036]">
        <ShieldCheck size={18} className="text-white mb-2" />
        <h3 className="text-white font-bold text-sm mb-1">Verified Comfort</h3>
        <p className="text-red-100 text-[11px] leading-relaxed">
          Every home on Sanctuary is personally inspected for quality and soul.
        </p>
      </div>
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function GuriGateLanding() {
  const [activeFilter, setActiveFilter] = useState("House");
  const [showMap, setShowMap] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showWhenPicker, setShowWhenPicker] = useState(false);
  const [whenLabel, setWhenLabel] = useState("");
  const [showWhereDropdown, setShowWhereDropdown] = useState(false);
  const [whereValue, setWhereValue] = useState("");
  const [showWhoDropdown, setShowWhoDropdown] = useState(false);
  const [whoSummary, setWhoSummary] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Date formatting utility for search bar
  function formatDate(d: Date): string {
    return `${d.toLocaleDateString("default", { month: "short" })} ${d.getDate()}`;
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowWhenPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // If a property is selected, show the PropertyPage
  if (selectedProperty) {
    return (
      <PropertyPage
        property={selectedProperty}
        onBack={() => setSelectedProperty(null)}
      />
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">

      {/* ── Navbar ── */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 bg-[#BA0036] rounded-full flex items-center justify-center">
              <Home size={14} className="text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">GuriGate</span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            <button className="flex items-center gap-1.5 font-semibold text-gray-900 border-b-2 border-[#BA0036] pb-0.5">
              <Home size={14} /> Homes
            </button>
            <button 
              onClick={() => navigate('/manage-property')}
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors relative"
            >
              <Compass size={14} /> Manage Property
              <span className="absolute -top-2 -right-5 text-[9px] bg-[#BA0036] text-white px-1 rounded-full">
                NEW
              </span>
            </button>
            <button className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors relative">
              <Building2 size={14} /> Services
              <span className="absolute -top-2 -right-5 text-[9px] bg-[#BA0036] text-white px-1 rounded-full">
                NEW
              </span>
            </button>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            <button className="text-sm font-semibold text-gray-700 hover:text-gray-900 hidden md:block">
              Become a host
            </button>
            <Globe size={20} className="text-gray-700 cursor-pointer hover:text-gray-900" />
            <ProfileMenu />
          </div>
        </div>

        {/* Search bar */}
        <div className="flex justify-center px-4">
          <div className="relative max-w-2xl w-full" ref={pickerRef}>
          <div className="flex items-center bg-white border border-gray-200 rounded-full shadow-sm w-full">
            {/* Where */}
            <div className="relative flex-1">
              <button
                onClick={() => setShowWhereDropdown(v => !v)}
                className={`w-full px-5 py-2.5 border-r border-gray-200 text-left ${showWhereDropdown ? "bg-gray-50" : ""}`}
              >
                <p className="text-[10px] font-semibold text-gray-700 uppercase tracking-wide">Where</p>
                <p className={`text-sm truncate ${whereValue ? "text-gray-800 font-medium" : "text-gray-400"}`}>
                  {whereValue || "Search destinations"}
                </p>
              </button>
              {showWhereDropdown && (
                <WhereDropdown
                  onClose={() => setShowWhereDropdown(false)}
                  onSelect={(val) => { setWhereValue(val); setShowWhereDropdown(false); }}
                />
              )}
            </div>

            {/* When */}
            <div className="relative flex-1" ref={pickerRef}>
              <button
                onClick={() => setShowWhenPicker(v => !v)}
                className={`w-full px-5 py-2.5 border-r border-gray-200 text-left ${showWhenPicker ? "bg-gray-50" : ""}`}
              >
                <p className="text-[10px] font-semibold text-gray-700 uppercase tracking-wide">When</p>
                <p className={`text-sm truncate ${whenLabel ? "text-gray-800 font-medium" : "text-gray-400"}`}>
                  {whenLabel || "Any time"}
                </p>
              </button>

              {showWhenPicker && (
                <div
                  className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                  style={{ width: "min(660px, calc(100vw - 2rem))" }}
                >
                  <WhenPicker
                    onSelect={(start, end) => {
                      const label = `${formatDate(start)} – ${formatDate(end)}`;
                      setWhenLabel(label);
                      setShowWhenPicker(false);
                    }}
                    onClose={() => setShowWhenPicker(false)}
                  />
                </div>
              )}
            </div>

            {/* Who */}
            <div className="relative flex-1">
              <button
                onClick={() => setShowWhoDropdown(v => !v)}
                className={`w-full px-5 py-2.5 text-left ${showWhoDropdown ? "bg-gray-50" : ""}`}
              >
                <p className="text-[10px] font-semibold text-gray-700 uppercase tracking-wide">Who</p>
                <p className={`text-sm truncate ${whoSummary ? "text-gray-800 font-medium" : "text-gray-400"}`}>
                  {whoSummary || "Add guests"}
                </p>
              </button>
              {showWhoDropdown && (
                <WhoDropdown
                  onClose={() => setShowWhoDropdown(false)}
                  onSelect={(summary, counts) => { 
                    setWhoSummary(summary); 
                    setShowWhoDropdown(false); 
                  }}
                />
              )}
            </div>

            {/* Search button */}
            <button className="bg-[#BA0036] hover:bg-[#a4003a] text-white rounded-full flex items-center gap-2 px-5 py-2.5 mx-2 text-sm font-semibold transition-colors flex-shrink-0">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
          </div>
        </div>
      </nav>

      {/* ── Hero Banner ── */}
      <section className="max-w-7xl mx-auto px-6 py-6">
        <div className="relative rounded-3xl overflow-hidden h-72 md:h-96">
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&q=85"
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          <div className="absolute bottom-8 left-8 text-white max-w-sm">
            <p className="text-xs font-semibold tracking-widest uppercase text-gray-300 mb-2">
              Editor's Choice
            </p>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-5">
              The Architecture
              <br />
              of Silence.
            </h1>
            <button className="bg-white text-gray-900 text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-gray-100 transition-colors">
              Explore Private Sanctuaries
            </button>
          </div>
        </div>
      </section>

      {/* ── Popular Homes ── */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <PopularHomesSection />
      </section>

      {/* ── Main Content ── */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="flex gap-6">

          {/* Left: Filters sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <CustomerFilters />
          </div>

          {/* Right: Properties */}
          <div className="flex-1 min-w-0">

            {/* Featured Properties header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Featured Properties
              </h2>
              <button className="text-sm font-semibold text-white bg-[#BA0036] px-4 py-2 rounded-full hover:bg-[#a4003a] transition-colors">
                View All Properties
              </button>
            </div>

            {/* Filter chips */}
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              <button className="flex items-center gap-1.5 text-sm border border-gray-200 px-3 py-1.5 rounded-full text-gray-600 hover:border-gray-400 transition-colors">
                <SlidersHorizontal size={13} /> Filter
              </button>
              {[
                { label: "House", icon: <Home size={13} /> },
                { label: "Hotel", icon: <Hotel size={13} /> },
                { label: "Villa", icon: <Building2 size={13} /> },
              ].map(({ label, icon }) => (
                <button
                  key={label}
                  onClick={() => setActiveFilter(label)}
                  className={`flex items-center gap-1.5 text-sm border px-3 py-1.5 rounded-full transition-colors ${
                    activeFilter === label
                      ? "bg-gray-900 text-white border-gray-900"
                      : "border-gray-200 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  {icon} {label}
                </button>
              ))}
            </div>

            {/* Featured grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {FEATURED_PROPERTIES.map((p) => (
                <FeaturedPropertyCard key={p.id} property={p} />
              ))}
            </div>

            {/* Popular homes in Nairobi */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Popular homes in Nairobi
                </h2>
                <button className="text-sm text-gray-600 hover:text-gray-900 font-medium">
                  Show all (142)
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {NAIROBI_HOMES.map((p) => (
                  <PopularPropertyCard key={p.id} property={p} onClick={() => setSelectedProperty(p)} />
                ))}
              </div>
            </div>

            {/* Popular homes in Hargeisa */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Popular homes in Hargeisa
                </h2>
                <button className="text-sm text-gray-600 hover:text-gray-900 font-medium">
                  Show all (142)
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {HARGEISA_HOMES.map((p) => (
                  <PopularPropertyCard key={p.id} property={p} onClick={() => setSelectedProperty(p)} />
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Show Map FAB ── */}
      <button
        onClick={() => setShowMap(!showMap)}
        className="fixed bottom-6 right-6 bg-gray-900 text-white text-sm font-semibold px-5 py-3 rounded-full flex items-center gap-2 shadow-lg hover:bg-gray-800 transition-colors z-50"
      >
        <Map size={16} />
        Show map
      </button>
    </div>
  );
}
