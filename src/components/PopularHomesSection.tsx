"use client";

import { useState } from "react";
import { Star, Heart } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Property {
  id: number;
  title: string;
  type: string;
  price: string;
  priceUnit: string;
  rating: number;
  image: string;
}

interface PopularHomesSectionProps {
  city?: string;
  total?: number;
  properties?: Property[];
}

// ─── Default Data ─────────────────────────────────────────────────────────────

const DEFAULT_PROPERTIES: Property[] = [
  {
    id: 1,
    title: "Modern Penthouse in Kileleshwa",
    type: "Apartment in Nairobi",
    price: "$120",
    priceUnit: "for 2 nights",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
  },
  {
    id: 2,
    title: "Modern Penthouse in Kileleshwa",
    type: "Apartment in Nairobi",
    price: "$120",
    priceUnit: "for 2 nights",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1560185127-6a12f9a26fe5?w=800&q=80",
  },
  {
    id: 3,
    title: "Garden Oasis, Karen",
    type: "Villa in Nairobi",
    price: "$245",
    priceUnit: "for 2 nights",
    rating: 4.92,
    image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80",
  },
];

// ─── Property Card ────────────────────────────────────────────────────────────

function PropertyCard({ property }: { property: Property }) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="group cursor-pointer flex flex-col gap-3">
      {/* Image */}
      <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Guest favourite badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-white text-gray-800 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm">
            Guest favourite
          </span>
        </div>

        {/* Heart button */}
        <button
          onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center transition-transform hover:scale-110"
        >
          <Heart
            size={20}
            className={
              liked
                ? "fill-[#BA0036] text-[#BA0036] drop-shadow-sm"
                : "fill-black/20 text-white drop-shadow-sm"
            }
          />
        </button>
      </div>

      {/* Info row */}
      <div className="flex items-start justify-between gap-2">
        {/* Left: title + type + price */}
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-gray-800 truncate leading-snug">
            {property.title}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5 leading-snug">{property.type}</p>
          <p className="text-sm text-gray-800 mt-1">
            <span className="font-semibold text-gray-900">{property.price}</span>{" "}
            <span className="font-bold">{property.priceUnit}</span>
          </p>
        </div>

        {/* Right: star + rating */}
        <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
          <Star size={13} className="fill-[#BA0036] text-[#BA0036]" />
          <span className="text-sm font-semibold text-gray-800">
            {property.rating.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Section Component ────────────────────────────────────────────────────────

export function PopularHomesSection({
  city = "Nairobi",
  total = 142,
  properties = DEFAULT_PROPERTIES,
}: PopularHomesSectionProps) {
  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold text-gray-900">
          Popular homes in {city}
        </h2>
        <button className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:underline underline-offset-2 transition-colors whitespace-nowrap">
          Show all ({total})
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {properties.map((p) => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </div>
    </section>
  );
}
