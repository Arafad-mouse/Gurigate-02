"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Heart } from "lucide-react";
import { applyImageFallback } from "@/lib/utils";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Property {
  id: string;
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
    id: "1",
    title: "Modern Penthouse in Kileleshwa",
    type: "Apartment in Nairobi",
    price: "$120",
    priceUnit: "for 2 nights",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
  },
  {
    id: "2",
    title: "Modern Penthouse in Kileleshwa",
    type: "Apartment in Nairobi",
    price: "$120",
    priceUnit: "for 2 nights",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
  },
  {
    id: "3",
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
  const navigate = useNavigate();

  return (
    <div 
      className="group cursor-pointer flex flex-col gap-3"
      onClick={() => navigate(`/property/${property.id}`)}
    >
      {/* Image */}
      <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
        <img
          src={property.image}
          alt={property.title}
          onError={(event) => applyImageFallback(event.currentTarget, property.title)}
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
          aria-label={liked ? "Remove from favorites" : "Add to favorites"}
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
  total: totalProp,
  properties: propProperties,
}: PopularHomesSectionProps) {
  const navigate = useNavigate();
  const [totalCount, setTotalCount] = useState<number>(totalProp ?? 0);
  const [properties, setProperties] = useState<Property[]>(propProperties ?? DEFAULT_PROPERTIES);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let cancelled = false;
    const fetchData = async () => {
      try {
        // Fetch properties from database
        const { data: propsData, error: propsError } = await supabase
          .from('properties')
          .select(`
            *,
            locations!properties_city_location_id_fkey(name),
            property_images(url, is_primary, sort_order)
          `)
          .eq('status', 'active')
          .eq('is_approved', true)
          .limit(3);

        // Fetch count
        const { count, error: countError } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true });

        if (!cancelled && !propsError && propsData) {
          // Convert database properties to Property format
          const convertedProps = propsData.map((p: any) => {
            const primaryImage = p.property_images?.find((img: any) => img.is_primary)?.url 
              || p.property_images?.[0]?.url
              || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80';
            
            return {
              id: p.id,
              title: p.title,
              type: `${p.type} in ${p.locations?.name || city}`,
              price: `$${p.price}`,
              priceUnit: p.price_unit === 'per_night' ? 'for 2 nights' : '/night',
              rating: p.rating_avg || 5.0,
              image: primaryImage,
            };
          });
          setProperties(convertedProps);
        }

        if (!cancelled && !countError && count !== null && totalProp === undefined) {
          setTotalCount(count);
        }
      } catch {
        // keep initial data on failure
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [totalProp, city]);

  const handleShowAll = () => {
    navigate('/manage-property');
  };

  return (
    <section>
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
          Popular homes in {city}
        </h2>
        <button 
          onClick={handleShowAll}
          className="self-start whitespace-nowrap text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 hover:underline underline-offset-2 sm:self-auto"
        >
          Show all ({totalCount})
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
