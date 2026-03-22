"use client";

import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

// ─── Icons ────────────────────────────────────────────────────────────────────

const Plus = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const Minus = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

interface GuestCounts {
  adults: number;
  children: number;
  infants: number;
  pets: number;
}

interface GuestType {
  key: keyof GuestCounts;
  label: string;
  sub: string;
  min: number;
}

interface WhoDropdownProps {
  onClose: () => void;
  onSelect: (summary: string, counts: GuestCounts) => void;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const GUEST_TYPES: GuestType[] = [
  { key: "adults",   label: "Adults",   sub: "Ages 13+",     min: 0 },
  { key: "children", label: "Children", sub: "Ages 2–12",    min: 0 },
  { key: "infants",  label: "Infants",  sub: "Under 2",      min: 0 },
  { key: "pets",     label: "Pets",     sub: "Bringing a pet?", min: 0 },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function WhoDropdown({ onClose, onSelect }: WhoDropdownProps) {
  const [counts, setCounts] = useState<GuestCounts>({
    adults: 1,
    children: 0,
    infants: 0,
    pets: 0,
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const update = (key: keyof GuestCounts, delta: number) => {
    setCounts((prev) => {
      const min = GUEST_TYPES.find((g) => g.key === key)!.min;
      return { ...prev, [key]: Math.max(min, prev[key] + delta) };
    });
  };

  const total = counts.adults + counts.children;
  const summary =
    total === 0
      ? "Add guests"
      : [
          total > 0 && `${total} guest${total !== 1 ? "s" : ""}`,
          counts.infants > 0 && `${counts.infants} infant${counts.infants !== 1 ? "s" : ""}`,
          counts.pets > 0 && `${counts.pets} pet${counts.pets !== 1 ? "s" : ""}`,
        ]
          .filter(Boolean)
          .join(", ");

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
      style={{ animation: "ddIn .18s cubic-bezier(.16,1,.3,1) both" }}
    >
      <style>{`@keyframes ddIn{from{opacity:0;transform:translateY(-8px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-800">Guests</p>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400"
        >
          <X size={13} />
        </button>
      </div>

      {/* Counters */}
      <div className="p-4">
        {GUEST_TYPES.map(({ key, label, sub, min }, i) => (
          <div key={key}>
            {i > 0 && <div className="h-px bg-gray-100 my-3" />}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => update(key, -1)}
                  disabled={counts[key] <= min}
                  className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                    counts[key] > min
                      ? "border-gray-300 text-gray-700 hover:border-[#BA0036] hover:text-[#BA0036]"
                      : "border-gray-100 text-gray-300 cursor-not-allowed"
                  }`}
                >
                  <Minus size={13} />
                </button>
                <span className="w-5 text-center text-sm font-semibold text-gray-800">
                  {counts[key]}
                </span>
                <button
                  onClick={() => update(key, 1)}
                  className="w-8 h-8 rounded-full border border-gray-300 text-gray-700 hover:border-[#BA0036] hover:text-[#BA0036] flex items-center justify-center transition-all"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 flex items-center justify-between">
        <button
          onClick={() => setCounts({ adults: 0, children: 0, infants: 0, pets: 0 })}
          className="text-xs font-semibold text-gray-500 underline underline-offset-2 hover:text-gray-700 transition-colors"
        >
          Clear all
        </button>
        <button
          onClick={() => { onSelect(summary, counts); onClose(); }}
          className="text-xs font-semibold bg-[#BA0036] text-white px-5 py-2 rounded-full hover:bg-[#a4003a] transition-colors"
        >
          Apply · {summary}
        </button>
      </div>
    </div>
  );
}
