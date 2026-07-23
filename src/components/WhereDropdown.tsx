"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Navigation } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Destination {
  city: string;
  country: string;
  description: string;
  icon: React.ReactNode;
  bg: string;
}

interface WhereDropdownProps {
  onClose: () => void;
  onSelect: (value: string) => void;
}

// ─── Illustrated SVG Icons ────────────────────────────────────────────────────

const IconNairobi = () => (
  <svg viewBox="0 0 56 56" fill="none" width="40" height="40">
    <rect x="11" y="28" width="7" height="16" rx="1" stroke="#BA0036" strokeWidth="1.4" fill="#FFE5E5"/>
    <rect x="21" y="20" width="7" height="24" rx="1" stroke="#BA0036" strokeWidth="1.4" fill="#FFE5E5"/>
    <rect x="31" y="24" width="7" height="20" rx="1" stroke="#BA0036" strokeWidth="1.4" fill="#FFE5E5"/>
    <rect x="13" y="31" width="2" height="2" rx="0.3" fill="#BA0036"/>
    <rect x="13" y="36" width="2" height="2" rx="0.3" fill="#BA0036"/>
    <rect x="23" y="23" width="2" height="2" rx="0.3" fill="#BA0036"/>
    <rect x="23" y="28" width="2" height="2" rx="0.3" fill="#BA0036"/>
    <rect x="23" y="33" width="2" height="2" rx="0.3" fill="#BA0036"/>
    <rect x="33" y="27" width="2" height="2" rx="0.3" fill="#BA0036"/>
    <rect x="33" y="32" width="2" height="2" rx="0.3" fill="#BA0036"/>
    <line x1="43" y1="44" x2="43" y2="32" stroke="#BA0036" strokeWidth="1.4"/>
    <path d="M43 32 Q46 28 49 30" stroke="#BA0036" strokeWidth="1.2" fill="none"/>
    <path d="M43 32 Q40 27 37 29" stroke="#BA0036" strokeWidth="1.2" fill="none"/>
    <line x1="10" y1="44" x2="46" y2="44" stroke="#BA0036" strokeWidth="1.4"/>
    <path d="M10 47 Q14 45 18 47 Q22 49 26 47" stroke="#BA0036" strokeWidth="1.2" fill="none"/>
  </svg>
);

const IconDarEsSalaam = () => (
  <svg viewBox="0 0 56 56" fill="none" width="40" height="40">
    <path d="M20 30 Q20 22 28 22 Q36 22 36 30" stroke="#3B82F6" strokeWidth="1.4" fill="#DBEAFE"/>
    <rect x="20" y="30" width="16" height="12" rx="1" stroke="#3B82F6" strokeWidth="1.4" fill="#DBEAFE"/>
    <rect x="13" y="24" width="5" height="18" rx="1" stroke="#3B82F6" strokeWidth="1.4" fill="#DBEAFE"/>
    <path d="M13 24 Q15.5 20 18 24" stroke="#3B82F6" strokeWidth="1.2" fill="#DBEAFE"/>
    <rect x="38" y="24" width="5" height="18" rx="1" stroke="#3B82F6" strokeWidth="1.4" fill="#DBEAFE"/>
    <path d="M38 24 Q40.5 20 43 24" stroke="#3B82F6" strokeWidth="1.2" fill="#DBEAFE"/>
    <path d="M25 42 L25 35 Q28 32 31 35 L31 42" stroke="#3B82F6" strokeWidth="1.2" fill="#93C5FD"/>
    <circle cx="15.5" cy="22" r="1" fill="#3B82F6"/>
    <circle cx="40.5" cy="22" r="1" fill="#3B82F6"/>
    <line x1="10" y1="42" x2="46" y2="42" stroke="#3B82F6" strokeWidth="1.4"/>
    <path d="M10 45 Q16 43 22 45 Q28 47 34 45 Q40 43 46 45" stroke="#3B82F6" strokeWidth="1.2" fill="none"/>
  </svg>
);

const IconMombasa = () => (
  <svg viewBox="0 0 56 56" fill="none" width="40" height="40">
    <path d="M16 28 L28 18 L40 28" stroke="#059669" strokeWidth="1.4" fill="#D1FAE5"/>
    <rect x="20" y="28" width="16" height="12" rx="1" stroke="#059669" strokeWidth="1.4" fill="#D1FAE5"/>
    <rect x="25" y="33" width="6" height="7" rx="0.5" stroke="#059669" strokeWidth="1.2" fill="#6EE7B7"/>
    <line x1="44" y1="40" x2="44" y2="30" stroke="#059669" strokeWidth="1.4"/>
    <path d="M44 30 Q47 26 50 27" stroke="#059669" strokeWidth="1.2" fill="none"/>
    <path d="M44 30 Q41 25 38 27" stroke="#059669" strokeWidth="1.2" fill="none"/>
    <circle cx="44" cy="18" r="4" stroke="#059669" strokeWidth="1.2" fill="#D1FAE5"/>
    <line x1="10" y1="40" x2="50" y2="40" stroke="#059669" strokeWidth="1.4"/>
    <path d="M10 43 Q16 41 22 43 Q28 45 34 43 Q40 41 46 43" stroke="#059669" strokeWidth="1.2" fill="none"/>
  </svg>
);

const IconHargeisa = () => (
  <svg viewBox="0 0 56 56" fill="none" width="40" height="40">
    <rect x="11" y="26" width="10" height="16" rx="1" stroke="#D97706" strokeWidth="1.4" fill="#FEF3C7"/>
    <rect x="24" y="20" width="10" height="22" rx="1" stroke="#D97706" strokeWidth="1.4" fill="#FEF3C7"/>
    <rect x="37" y="28" width="8" height="14" rx="1" stroke="#D97706" strokeWidth="1.4" fill="#FEF3C7"/>
    <path d="M14 32 Q16 29 18 32" stroke="#D97706" strokeWidth="1.2" fill="#FDE68A"/>
    <path d="M27 26 Q29 23 31 26" stroke="#D97706" strokeWidth="1.2" fill="#FDE68A"/>
    <path d="M40 34 Q42 31 44 34" stroke="#D97706" strokeWidth="1.2" fill="#FDE68A"/>
    <line x1="10" y1="42" x2="46" y2="42" stroke="#D97706" strokeWidth="1.4"/>
    <path d="M28 42 Q34 39 40 42" stroke="#D97706" strokeWidth="1.2" fill="#FDE68A"/>
  </svg>
);

const IconAddisAbaba = () => (
  <svg viewBox="0 0 56 56" fill="none" width="40" height="40">
    <path d="M10 40 L22 22 L34 40" stroke="#7C3AED" strokeWidth="1.4" fill="#EDE9FE"/>
    <path d="M24 40 L34 26 L44 40" stroke="#7C3AED" strokeWidth="1.4" fill="#DDD6FE"/>
    <path d="M18 28 L22 22 L26 28" stroke="#7C3AED" strokeWidth="1" fill="white"/>
    <path d="M30 31 L34 26 L38 31" stroke="#7C3AED" strokeWidth="1" fill="white"/>
    <rect x="25" y="32" width="6" height="8" rx="0.5" stroke="#7C3AED" strokeWidth="1.2" fill="#EDE9FE"/>
    <path d="M25 32 L28 28 L31 32" stroke="#7C3AED" strokeWidth="1.2" fill="#DDD6FE"/>
    <line x1="28" y1="27" x2="28" y2="24" stroke="#7C3AED" strokeWidth="1.2"/>
    <line x1="26.5" y1="25.5" x2="29.5" y2="25.5" stroke="#7C3AED" strokeWidth="1.2"/>
    <line x1="10" y1="40" x2="46" y2="40" stroke="#7C3AED" strokeWidth="1.4"/>
  </svg>
);

const IconKualaLumpur = () => (
  <svg viewBox="0 0 56 56" fill="none" width="40" height="40">
    {/* Twin towers */}
    <rect x="15" y="18" width="9" height="26" rx="1" stroke="#0891B2" strokeWidth="1.4" fill="#CFFAFE"/>
    <rect x="32" y="18" width="9" height="26" rx="1" stroke="#0891B2" strokeWidth="1.4" fill="#CFFAFE"/>
    {/* Spires */}
    <line x1="19.5" y1="18" x2="19.5" y2="12" stroke="#0891B2" strokeWidth="1.4"/>
    <line x1="36.5" y1="18" x2="36.5" y2="12" stroke="#0891B2" strokeWidth="1.4"/>
    {/* Bridge */}
    <rect x="24" y="28" width="8" height="2.5" rx="0.5" stroke="#0891B2" strokeWidth="1.2" fill="#A5F3FC"/>
    {/* Windows */}
    <rect x="17" y="22" width="2" height="2" rx="0.3" fill="#0891B2"/>
    <rect x="17" y="27" width="2" height="2" rx="0.3" fill="#0891B2"/>
    <rect x="17" y="32" width="2" height="2" rx="0.3" fill="#0891B2"/>
    <rect x="34" y="22" width="2" height="2" rx="0.3" fill="#0891B2"/>
    <rect x="34" y="27" width="2" height="2" rx="0.3" fill="#0891B2"/>
    <rect x="34" y="32" width="2" height="2" rx="0.3" fill="#0891B2"/>
    <line x1="10" y1="44" x2="46" y2="44" stroke="#0891B2" strokeWidth="1.4"/>
  </svg>
);

// ─── Destinations Data ────────────────────────────────────────────────────────

const DESTINATIONS: Destination[] = [
  { city: "Nairobi",       country: "Kenya",    description: "For sights like Uhuru Park",      icon: <IconNairobi />,      bg: "#FFF0F0" },
  { city: "Dar es Salaam", country: "Tanzania", description: "For a trip abroad",               icon: <IconDarEsSalaam />,  bg: "#F0F8FF" },
  { city: "Mombasa",       country: "Kenya",    description: "For its seaside allure",           icon: <IconMombasa />,      bg: "#F0FFF4" },
  { city: "Kuala Lumpur",  country: "Malaysia", description: "For its stunning architecture",   icon: <IconKualaLumpur />,  bg: "#ECFEFF" },
  { city: "Addis Ababa",   country: "Ethiopia", description: "For a trip abroad",               icon: <IconAddisAbaba />,   bg: "#F5F3FF" },
  { city: "Hargeisa",      country: "Somalia",  description: "For its vibrant culture",         icon: <IconHargeisa />,     bg: "#FFFBEB" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function WhereDropdown({ onClose, onSelect }: WhereDropdownProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const filtered = query
    ? DESTINATIONS.filter(
        (d) =>
          d.city.toLowerCase().includes(query.toLowerCase()) ||
          d.country.toLowerCase().includes(query.toLowerCase())
      )
    : DESTINATIONS;

  return (
    <div
      ref={ref}
      className="absolute left-0 top-full mt-2 w-[360px] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-50"
      style={{ animation: "ddIn .18s cubic-bezier(.16,1,.3,1) both" }}
    >
      <style>{`@keyframes ddIn{from{opacity:0;transform:translateY(-8px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>

      {/* Search input */}
      <div className="p-3">
        <div className="flex items-center gap-2.5 border border-gray-200 rounded-full px-4 py-2.5 shadow-sm">
          <Search size={14} className="text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search destinations"
            className="flex-1 text-sm text-gray-700 bg-transparent outline-none placeholder:text-gray-400"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors flex-shrink-0"
            >
              <X size={11} className="text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Destination list */}
      <div className="max-h-[420px] overflow-y-auto pb-3">
        <p className="text-xs font-semibold text-gray-500 px-5 pt-1 pb-2">
          Suggested destinations
        </p>

        {/* Nearby — only shown when not searching */}
        {!query && (
          <button
            onClick={() => { onSelect("Nearby"); onClose(); }}
            className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-[#F0F4FF] flex items-center justify-center flex-shrink-0">
              <Navigation size={20} className="text-[#4F6EF7]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Nearby</p>
              <p className="text-xs text-gray-500 mt-0.5">Find what's around you</p>
            </div>
          </button>
        )}

        {/* Destination rows */}
        {filtered.length > 0 ? (
          filtered.map(({ city, country, description, icon, bg }) => (
            <button
              key={city}
              onClick={() => { onSelect(`${city}, ${country}`); onClose(); }}
              className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: bg }}
              >
                {icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {city}, {country}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{description}</p>
              </div>
            </button>
          ))
        ) : (
          <div className="px-5 py-8 text-center text-sm text-gray-400">
            No destinations found for "{query}"
          </div>
        )}
      </div>
    </div>
  );
}
