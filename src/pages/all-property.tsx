"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Heart,
  Star,
  X,
  Home,
  SlidersHorizontal,
  Hotel,
  Building2,
} from "lucide-react";
import PropertyPage from "@/pages/PropertyPage";
import { applyImageFallback } from "@/lib/utils";

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

interface FilterState {
  bedrooms: string;
  priceRange: string;
  propertyType: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const ALL_PROPERTIES: Property[] = [
  // Nairobi Homes
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
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
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
  // Hargeisa Homes
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
  // Additional properties for variety
  {
    id: 13,
    title: "Luxury Studio in Westlands",
    type: "Studio in Nairobi",
    price: "$85",
    priceUnit: "for 2 nights",
    beds: 1,
    baths: 1,
    sqft: 250,
    badge: "SHORT STAY",
    rating: 4.8,
    address: "Westlands, Nairobi",
    city: "Nairobi",
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80",
  },
  {
    id: 14,
    title: "Cozy Apartment in Lavington",
    type: "Apartment in Nairobi",
    price: "$110",
    priceUnit: "for 2 nights",
    beds: 2,
    baths: 1,
    sqft: 280,
    badge: "SHORT STAY",
    rating: 4.75,
    address: "Lavington, Nairobi",
    city: "Nairobi",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80",
  },
  {
    id: 15,
    title: "Spacious Townhouse in Runda",
    type: "Townhouse in Nairobi",
    price: "$180",
    priceUnit: "for 2 nights",
    beds: 4,
    baths: 3,
    sqft: 450,
    badge: "SHORT STAY",
    rating: 4.9,
    address: "Runda, Nairobi",
    city: "Nairobi",
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80",
  },
];

// ─── Components ────────────────────────────────────────────────────────────────

function PropertyCard({ property, onClick }: { property: Property; onClick: () => void }) {
  const [liked, setLiked] = useState(false);
  
  return (
    <div className="group cursor-pointer" onClick={onClick}>
      <div className="relative rounded-2xl overflow-hidden mb-2.5">
        <img
          src={property.image}
          alt={property.title}
          onError={(event) => applyImageFallback(event)}
          className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <span className="text-xs font-medium bg-white text-gray-700 px-2.5 py-1 rounded-full shadow-sm">
            Guest favourite
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setLiked(!liked);
          }}
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
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-gray-900">{property.title}</h3>
          <p className="truncate text-xs text-gray-500">{property.type}</p>
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

function Filters({
  onFilterChange,
  onClose,
}: {
  onFilterChange: (filters: FilterState) => void;
  onClose?: () => void;
}) {
  const [bedrooms, setBedrooms] = useState<string>("Any");
  const [priceRange, setPriceRange] = useState<string>("Any");
  const [propertyType, setPropertyType] = useState<string>("All");

  const handleFilterChange = () => {
    onFilterChange({
      bedrooms,
      priceRange,
      propertyType
    });
  };

  useEffect(() => {
    handleFilterChange();
  }, [bedrooms, priceRange, propertyType, onFilterChange]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:sticky lg:top-24">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-gray-900">
          Filters
        </h2>
        {onClose ? (
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E8344E]"
            title="Close filters"
          >
            <X size={14} className="text-white" />
          </button>
        ) : null}
      </div>

      {/* Property Type */}
      <div className="mb-5">
        <label className="text-xs font-semibold text-gray-700 block mb-2">
          Property Type
        </label>
        <div className="flex flex-wrap gap-1.5">
          {["All", "Apartment", "Studio", "Villa", "Townhouse"].map((type) => (
            <button
              key={type}
              onClick={() => setPropertyType(type)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                propertyType === type
                  ? "bg-[#E8344E] text-white border-[#E8344E]"
                  : "text-gray-600 border-gray-200 hover:border-[#E8344E]"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
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
        <div className="flex flex-wrap gap-1.5">
          {["Any", "$0-$100", "$100-$150", "$150-$200", "$200+"].map((range) => (
            <button
              key={range}
              onClick={() => setPriceRange(range)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                priceRange === range
                  ? "bg-[#E8344E] text-white border-[#E8344E]"
                  : "text-gray-600 border-gray-200 hover:border-[#E8344E]"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => {
            setPropertyType("All");
            setBedrooms("Any");
            setPriceRange("Any");
          }}
          className="flex-1 text-xs py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Reset filters
        </button>
        <button className="flex-1 text-xs py-2.5 rounded-xl bg-[#BA0036] text-white font-semibold hover:bg-[#a4003a] transition-colors">
          Show {ALL_PROPERTIES.length} results
        </button>
      </div>
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function AllPropertiesPage() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    bedrooms: "Any",
    priceRange: "Any",
    propertyType: "All"
  });
  const [sortBy, setSortBy] = useState("recommended");

  // Filter and sort properties
  const filteredAndSortedProperties = useMemo(() => {
    let filtered = ALL_PROPERTIES.filter(property => {
      // Filter by property type
      if (filters.propertyType !== "All") {
        const propertyTypeLower = filters.propertyType.toLowerCase();
        if (!property.type.toLowerCase().includes(propertyTypeLower)) {
          return false;
        }
      }

      // Filter by bedrooms
      if (filters.bedrooms !== "Any") {
        if (filters.bedrooms === "5+") {
          if (property.beds < 5) return false;
        } else {
          if (property.beds !== parseInt(filters.bedrooms)) return false;
        }
      }

      // Filter by price range
      if (filters.priceRange !== "Any") {
        const price = parseInt(property.price.replace('$', ''));
        switch (filters.priceRange) {
          case "$0-$100":
            if (price > 100) return false;
            break;
          case "$100-$150":
            if (price < 100 || price > 150) return false;
            break;
          case "$150-$200":
            if (price < 150 || price > 200) return false;
            break;
          case "$200+":
            if (price < 200) return false;
            break;
        }
      }

      // Filter by active filter chip
      if (activeFilter !== "All") {
        const filterLower = activeFilter.toLowerCase();
        if (!property.type.toLowerCase().includes(filterLower)) {
          return false;
        }
      }

      return true;
    });

    // Sort properties
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return parseInt(a.price.replace('$', '')) - parseInt(b.price.replace('$', ''));
        case "price-high":
          return parseInt(b.price.replace('$', '')) - parseInt(a.price.replace('$', ''));
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "recommended": {
          // Sort by rating first, then by price (recommended algorithm)
          const ratingDiff = (b.rating || 0) - (a.rating || 0);
          if (ratingDiff !== 0) return ratingDiff;
          return parseInt(a.price.replace('$', '')) - parseInt(b.price.replace('$', ''));
        }
        default: {
          // Default to recommended sorting
          const ratingDiff = (b.rating || 0) - (a.rating || 0);
          if (ratingDiff !== 0) return ratingDiff;
          return parseInt(a.price.replace('$', '')) - parseInt(b.price.replace('$', ''));
        }
      }
    });

    return filtered;
  }, [filters, activeFilter, sortBy]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  // If a property is selected, show the PropertyPage
  if (selectedProperty) {
    return (
      <PropertyPage
        property={selectedProperty as any}
        onBack={() => setSelectedProperty(null)}
      />
    );
  }

  return (
    <div className="overflow-x-hidden">
      {/* ── Header ── */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">All Available Properties</h1>
          <p className="text-gray-600">Discover your perfect stay from our curated selection of properties</p>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setShowMobileFilters((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:border-gray-400 lg:hidden"
          >
            <SlidersHorizontal size={13} /> {showMobileFilters ? "Hide Filters" : "Filters"}
          </button>
          <button className="hidden items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:border-gray-400 lg:flex">
            <SlidersHorizontal size={13} /> Filter
          </button>
          {[
            { label: "All", icon: <Home size={13} /> },
            { label: "Apartment", icon: <Building2 size={13} /> },
            { label: "Studio", icon: <Hotel size={13} /> },
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
      </section>

      {/* ── Main Content ── */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          {showMobileFilters ? (
            <div className="lg:hidden">
              <Filters
                onFilterChange={handleFilterChange}
                onClose={() => setShowMobileFilters(false)}
              />
            </div>
          ) : null}

          {/* Left: Filters sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <Filters onFilterChange={handleFilterChange} />
          </div>

          {/* Right: Properties */}
          <div className="flex-1 min-w-0">
            {/* Results header */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {filteredAndSortedProperties.length} properties available
              </h2>
              <select 
                className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-[#E8344E] sm:w-auto" 
                title="Sort properties"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="recommended">Sort by: Recommended</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Rating: High to Low</option>
              </select>
            </div>

            {/* Properties grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedProperties.map((property) => (
                <PropertyCard 
                  key={property.id} 
                  property={property} 
                  onClick={() => setSelectedProperty(property)} 
                />
              ))}
            </div>

            {/* Load more */}
            <div className="mt-12 text-center">
              <button className="w-full rounded-full bg-[#BA0036] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#a4003a] sm:w-auto">
                Load more properties
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
