"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  ChevronDown,
  Heart,
  MapPin,
  ShieldCheck,
  Home,
  Building2,
  Hotel,
  Compass,
  SlidersHorizontal,
  Star,
  Search,
} from "lucide-react";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import PropertyPage from "@/pages/PropertyPage";
import { PopularHomesSection } from "@/components/PopularHomesSection";
import { useProperties } from "@/hooks/useProperties";
import { applyImageFallback } from "@/lib/utils";
import type { LandingProperty } from "@/data/landingProperties";
import { AMENITIES } from "@/data/landingProperties";


function FeaturedPropertyCard({ property, onClick }: { property: LandingProperty; onClick: () => void }) {
  const [liked, setLiked] = useState(false);

  return (

    <div className="group cursor-pointer" onClick={onClick}>

      <div className="relative rounded-2xl overflow-hidden mb-2.5">

        <img

          src={property.image}

          alt={property.title}
          onError={(event) => applyImageFallback(event.currentTarget, property.title)}

          className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"

        />

        <div className="absolute top-3 left-3">

          <span className="text-xs font-medium bg-white text-gray-700 px-2.5 py-1 rounded-full shadow-sm">

            {property.badge}

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

      <div className="min-w-0">

        <h3 className="truncate text-sm font-semibold text-gray-900">{property.title}</h3>

        <p className="truncate text-xs text-gray-500">{property.address}</p>

        <p className="text-xs text-gray-900 mt-1">

          <span className="font-semibold">{property.price}</span>{" "}

          <span className="text-gray-500">{property.priceUnit}</span>

        </p>

      </div>

    </div>

  );

}



function PopularPropertyCard({ property, onClick }: { property: LandingProperty; onClick: () => void }) {

  const [liked, setLiked] = useState(false);

  return (

    <div className="group cursor-pointer" onClick={onClick}>

      <div className="relative rounded-2xl overflow-hidden mb-2.5">

        <img

          src={property.image}

          alt={property.title}
          onError={(event) => applyImageFallback(event.currentTarget, property.title)}

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





function CustomerFilters({ resultCount }: { resultCount?: number }) {

  const [bedrooms, setBedrooms] = useState<string>("Any");

  const [priceMin, setPriceMin] = useState(0);

  const [priceMax, setPriceMax] = useState(0);

  const [sqftMin, setSqftMin] = useState(0);

  const [sqftMax, setSqftMax] = useState(0);

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);



  const toggleAmenity = (a: string) =>

    setSelectedAmenities((prev) =>

      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]

    );



  return (

    <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:sticky lg:top-24">

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

            aria-label="Maximum price range"

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

          aria-label="Maximum square feet"

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

          Show all results

        </button>

      </div>



      {/* Find Sanctuary CTA */}

      <div

        className="mt-4 rounded-2xl p-4 relative overflow-hidden"

        style={{

          background:

            "linear-gradient(135deg, #1a1c1c 0%, #2d2d2d 50%, #3a3a3a 100%)",

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

            Explore GuriGate

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

  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const [showMap, setShowMap] = useState(false);

  const [selectedProperty, setSelectedProperty] = useState<LandingProperty | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  
  // Use the properties hook for data fetching
  const { featured, nairobi, hargeisa } = useProperties();

  const navigate = useNavigate();

  const filteredFeatured = useMemo(() => {
    if (!activeFilter) return featured;
    return featured.filter(p => p.type === activeFilter);
  }, [featured, activeFilter]);

  const filteredNairobi = useMemo(() => {
    if (!activeFilter) return nairobi;
    return nairobi.filter(p => p.type === activeFilter);
  }, [nairobi, activeFilter]);

  const filteredHargeisa = useMemo(() => {
    if (!activeFilter) return hargeisa;
    return hargeisa.filter(p => p.type === activeFilter);
  }, [hargeisa, activeFilter]);

  // Initialize map when modal opens
  useEffect(() => {
    if (showMap && mapRef.current && !mapInstanceRef.current) {
      // Initialize map centered on East Africa
      const map = L.map(mapRef.current).setView([1.2921, 36.8219], 6); // Nairobi coordinates

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Add property markers
      const allProperties = [...filteredFeatured, ...filteredNairobi, ...filteredHargeisa];
      
      allProperties.forEach((property) => {
        // Use approximate coordinates based on city (in production, use actual property coordinates)
        const coords: [number, number] = property.address.toLowerCase().includes('nairobi') 
          ? [-1.2921, 36.8219] 
          : property.address.toLowerCase().includes('hargeisa')
          ? [9.56, 44.06]
          : [2.0, 45.0]; // Somalia

        const marker = L.marker(coords).addTo(map);
        marker.bindPopup(`
          <div style="min-width: 200px;">
            <img src="${property.image}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;">
            <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold;">${property.title}</h3>
            <p style="margin: 0; font-size: 12px; color: #666;">${property.address}</p>
            <p style="margin: 4px 0 0 0; font-size: 13px; font-weight: bold;">${property.price} ${property.priceUnit}</p>
          </div>
        `);
      });

      mapInstanceRef.current = map;
    }

    // Cleanup map when modal closes
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [showMap, filteredFeatured, filteredNairobi, filteredHargeisa]);



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

    <div className="min-h-screen overflow-x-hidden bg-gray-50 font-sans">



      {/* ── Hero Banner ── */}

      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">

        <div className="relative h-[26rem] overflow-hidden rounded-3xl sm:h-72 md:h-96">

          <img

            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&q=85"

            alt="Hero"
            onError={(event) => applyImageFallback(event.currentTarget, "GuriGate hero")}

            className="w-full h-full object-cover"

          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 max-w-xs text-white sm:bottom-8 sm:left-8 sm:right-auto sm:max-w-sm">

            <p className="text-xs font-semibold tracking-widest uppercase text-gray-300 mb-2">

              Editor's Choice

            </p>

            <h1 className="mb-5 text-3xl font-bold leading-tight md:text-4xl">

              The Architecture

              <br />

              of Silence.

            </h1>

            <button 
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100"
              onClick={() => window.location.href = '/all-property'}
            >

              Explore Private Sanctuaries

            </button>

          </div>

        </div>

      </section>



      {/* ── Popular Homes ── */}

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">

        <PopularHomesSection />

      </section>



      {/* ── Main Content ── */}

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">

        <div className="flex flex-col gap-6 lg:flex-row">

          <div className="lg:hidden">
            <CustomerFilters resultCount={filteredFeatured.length + filteredNairobi.length + filteredHargeisa.length} />
          </div>

          {/* Left: Filters sidebar */}

          <div className="hidden lg:block w-64 flex-shrink-0">

            <CustomerFilters resultCount={filteredFeatured.length + filteredNairobi.length + filteredHargeisa.length} />

          </div>



          {/* Right: Properties */}

          <div className="flex-1 min-w-0">

            {/* Featured Properties header */}

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <h2 className="text-xl font-bold text-gray-900">

                Featured Properties

              </h2>

              <button 
                onClick={() => navigate('/all-property')}
                className="w-full rounded-full bg-[#BA0036] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#a4003a] sm:w-auto"
              >

                View All Properties

              </button>

            </div>

            {/* Featured Properties Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {filteredFeatured.map((p) => (
                <FeaturedPropertyCard key={p.id} property={p} onClick={() => setSelectedProperty(p)} />
              ))}
            </div>

            {/* Filter chips */}

            <div className="flex items-center gap-2 mb-5 flex-wrap">

              <button
                onClick={() => setActiveFilter(null)}
                className={`flex items-center gap-1.5 text-sm border px-3 py-1.5 rounded-full transition-colors ${
                  activeFilter === null
                    ? "bg-gray-900 text-white border-gray-900"
                    : "border-gray-200 text-gray-600 hover:border-gray-400"
                }`}
              >
                <SlidersHorizontal size={13} /> All
              </button>

              {[

                { label: "House", icon: <Home size={13} /> },

                { label: "Hotel", icon: <Hotel size={13} /> },

                { label: "Villa", icon: <Building2 size={13} /> },

                { label: "Apartment", icon: <Home size={13} /> },

                { label: "Studio", icon: <Home size={13} /> },

              ].map(({ label, icon }) => (

                <button

                  key={label}

                  onClick={() => setActiveFilter(activeFilter === label ? null : label)}

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



            {/* Popular homes in Nairobi */}

            <div className="mb-10">

              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <h2 className="text-xl font-bold text-gray-900">

                  Popular homes in Nairobi

                </h2>

                <button 
                  onClick={() => navigate('/all-property')}
                  className="self-start text-sm font-medium text-gray-600 hover:text-gray-900 sm:self-auto"
                >

                  Show all ({filteredNairobi.length})

                </button>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

                {filteredNairobi.map((p) => (

                  <PopularPropertyCard key={p.id} property={p} onClick={() => setSelectedProperty(p)} />

                ))}

              </div>

            </div>



            {/* Popular homes in Hargeisa */}

            <div className="mb-10">

              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <h2 className="text-xl font-bold text-gray-900">

                  Popular homes in Hargeisa

                </h2>

                <button className="self-start text-sm font-medium text-gray-600 hover:text-gray-900 sm:self-auto">

                  Show all ({filteredHargeisa.length})

                </button>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

                {filteredHargeisa.map((p) => (

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

        className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-gray-800 sm:left-auto sm:right-6 sm:translate-x-0"

      >

        <MapPin size={16} />

        {showMap ? "Hide map" : "Show map"}

      </button>

      {/* ── Map Modal ── */}

      {showMap && (

        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl w-full max-w-6xl h-[80vh] flex flex-col overflow-hidden">

            <div className="flex items-center justify-between p-4 border-b">

              <h2 className="text-lg font-semibold text-gray-900">Property Map</h2>

              <button

                onClick={() => setShowMap(false)}

                className="p-2 hover:bg-gray-100 rounded-full transition-colors"

                title="Close map"

              >

                <X size={20} className="text-gray-600" />

              </button>

            </div>

            <div className="flex-1 relative">

              {/* Search bar overlay */}

              <div className="absolute top-4 left-4 right-4 z-10">

                <div className="bg-white rounded-lg shadow-lg flex items-center gap-2 px-4 py-3">

                  <Search size={18} className="text-gray-400" />

                  <input

                    type="text"

                    placeholder="Search properties..."

                    className="flex-1 outline-none text-sm"

                  />

                </div>

              </div>

              {/* Leaflet map container */}

              <div 

                ref={mapRef}

                className="w-full h-full"

                style={{ minHeight: '400px' }}

              />

            </div>

          </div>

        </div>

      )}

    </div>

  );

}

