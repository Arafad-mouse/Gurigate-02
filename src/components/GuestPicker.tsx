"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────

interface GuestCounts {
  adults: number;
  children: number;
  infants: number;
  pets: number;
}

interface GuestPickerProps {
  maxGuests?: number;
  allowPets?: boolean;
  onChange?: (counts: GuestCounts) => void;
  onClose?: () => void;
}

// ─── Counter Row ──────────────────────────────────────────────────────

function CounterRow({
  label,
  sub,
  subLink,
  count,
  onInc,
  onDec,
  disabled,
}: {
  label: string;
  sub: string;
  subLink?: string;
  count: number;
  onInc: () => void;
  onDec: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-4">
      <div>
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        {subLink ? (
          <button className="text-sm text-gray-900 underline underline-offset-2 text-left leading-snug">
            {sub}
          </button>
        ) : (
          <p className="text-sm text-gray-500">{sub}</p>
        )}
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Decrement */}
        <button
          onClick={onDec}
          disabled={count === 0}
          className={`w-8 h-8 rounded-full border flex items-center justify-center text-lg leading-none transition-all select-none ${
            count === 0
              ? "border-gray-200 text-gray-200 cursor-not-allowed"
              : "border-gray-400 text-gray-600 hover:border-gray-900 hover:text-gray-900"
          }`}
        >
          −
        </button>

        <span className="w-4 text-center text-sm font-medium text-gray-900 select-none">
          {count}
        </span>

        {/* Increment */}
        <button
          onClick={onInc}
          disabled={disabled}
          className={`w-8 h-8 rounded-full border flex items-center justify-center text-lg leading-none transition-all select-none ${
            disabled
              ? "border-gray-200 text-gray-200 cursor-not-allowed"
              : "border-gray-400 text-gray-600 hover:border-gray-900 hover:text-gray-900"
          }`}
        >
          +
        </button>
      </div>
    </div>
  );
}

// ─── GuestPicker ──────────────────────────────────────────────────────

export function GuestPicker({
  maxGuests = 2,
  allowPets = false,
  onChange,
  onClose,
}: GuestPickerProps) {
  const [counts, setCounts] = useState<GuestCounts>({
    adults: 1,
    children: 0,
    infants: 0,
    pets: 0,
  });

  const totalGuests = counts.adults + counts.children;
  const atMax = totalGuests >= maxGuests;

  const update = (key: keyof GuestCounts, delta: number) => {
    setCounts((prev) => {
      const min = key === 'adults' ? 1 : 0;
      const next = { ...prev, [key]: Math.max(min, prev[key] + delta) };
      onChange?.(next);
      return next;
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-5 w-72">
      {/* Adults */}
      <CounterRow
        label="Adults"
        sub="Age 13+"
        count={counts.adults}
        onInc={() => update("adults", 1)}
        onDec={() => update("adults", -1)}
        disabled={atMax || counts.adults <= 1}
      />

      <div className="h-px bg-gray-100" />

      {/* Children */}
      <CounterRow
        label="Children"
        sub="Ages 2–12"
        count={counts.children}
        onInc={() => update("children", 1)}
        onDec={() => update("children", -1)}
        disabled={atMax}
      />

      <div className="h-px bg-gray-100" />

      {/* Infants */}
      <CounterRow
        label="Infants"
        sub="Under 2"
        count={counts.infants}
        onInc={() => update("infants", 1)}
        onDec={() => update("infants", -1)}
        disabled={atMax}
      />

      <div className="h-px bg-gray-100" />

      {/* Pets */}
      <CounterRow
        label="Pets"
        sub="Bringing a service animal?"
        subLink="Learn more"
        count={counts.pets}
        onInc={() => update("pets", 1)}
        onDec={() => update("pets", -1)}
        disabled={!allowPets}
      />

      {/* Notice */}
      <p className="text-xs text-gray-500 leading-relaxed mt-1">
        This place has a maximum of {maxGuests} guests, not including infants.{" "}
        {!allowPets && "Pets aren't allowed."}
      </p>

      {/* Close */}
      <div className="flex justify-end mt-3">
        <button
          onClick={onClose}
          className="text-sm font-semibold text-gray-900 underline underline-offset-2 hover:text-gray-600 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
