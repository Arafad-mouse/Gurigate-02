"use client";

import { useState, useRef, useEffect } from "react";
import { Search, MapPin, X, Clock, TrendingUp } from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const RECENT = ["Nairobi, Kenya", "Hargeisa, Somalia", "Mombasa, Kenya"];
const TRENDING = ["Diani Beach", "Lamu Island", "Watamu"];
const POPULAR = [
  { city: "Nairobi",       country: "Kenya",    emoji: "🇰🇪" },
  { city: "Hargeisa",      country: "Somalia",  emoji: "🇸🇴" },
  { city: "Kampala",       country: "Uganda",   emoji: "🇺🇬" },
  { city: "Dar es Salaam", country: "Tanzania", emoji: "🇹🇿" },
  { city: "Addis Ababa",   country: "Ethiopia", emoji: "🇪🇹" },
  { city: "Kigali",        country: "Rwanda",   emoji: "🇷🇼" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface WhereDropdownProps {
  onClose: () => void;
  onSelect: (value: string) => void;
}

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
    ? POPULAR.filter(
        (p) =>
          p.city.toLowerCase().includes(query.toLowerCase()) ||
          p.country.toLowerCase().includes(query.toLowerCase())
      )
    : null;

  return (
    <div
      ref={ref}
      className="absolute left-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
      style={{ animation: "ddIn .18s cubic-bezier(.16,1,.3,1) both" }}
    >
      <style>{`@keyframes ddIn{from{opacity:0;transform:translateY(-8px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>

      {/* Search input */}
      <div className="p-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-3 py-2.5">
          <span className="text-gray-400"><Search size={14} /></span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search destinations..."
            className="flex-1 text-sm text-gray-700 bg-transparent outline-none placeholder:text-gray-400"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {filtered ? (
          filtered.length > 0 ? (
            /* Search results */
            <div className="p-2">
              {filtered.map(({ city, country, emoji }) => (
                <button
                  key={city}
                  onClick={() => { onSelect(`${city}, ${country}`); onClose(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left group"
                >
                  <span className="text-xl">{emoji}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{city}</p>
                    <p className="text-xs text-gray-400">{country}</p>
                  </div>
                  <span className="ml-auto text-gray-300 group-hover:text-gray-400">
                    <MapPin size={13} />
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-sm text-gray-400">
              No results for "{query}"
            </div>
          )
        ) : (
          <>
            {/* Recent */}
            <div className="p-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
                Recent
              </p>
              {RECENT.map((r) => (
                <button
                  key={r}
                  onClick={() => { onSelect(r); onClose(); }}
                  className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 flex-shrink-0">
                    <Clock size={13} />
                  </span>
                  <span className="text-sm text-gray-700">{r}</span>
                </button>
              ))}
            </div>

            <div className="h-px bg-gray-100 mx-4" />

            {/* Trending */}
            <div className="p-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
                Trending
              </p>
              <div className="flex flex-wrap gap-2 px-2">
                {TRENDING.map((t) => (
                  <button
                    key={t}
                    onClick={() => { onSelect(t); onClose(); }}
                    className="flex items-center gap-1.5 text-xs bg-gray-50 hover:bg-red-50 hover:text-[#BA0036] border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-full transition-colors font-medium text-gray-600"
                  >
                    <TrendingUp size={11} /> {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-gray-100 mx-4" />

            {/* Popular destinations */}
            <div className="p-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
                Popular Destinations
              </p>
              <div className="grid grid-cols-2 gap-1">
                {POPULAR.map(({ city, country, emoji }) => (
                  <button
                    key={city}
                    onClick={() => { onSelect(`${city}, ${country}`); onClose(); }}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left"
                  >
                    <span className="text-lg">{emoji}</span>
                    <div>
                      <p className="text-xs font-semibold text-gray-800 leading-none">{city}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{country}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
