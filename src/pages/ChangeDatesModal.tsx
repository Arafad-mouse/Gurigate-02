"use client";

import { useState, useRef, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────

export interface ChangeDatesModalProps {
  checkIn: string;
  checkOut: string;
  onSave: (checkIn: string, checkOut: string) => void;
  onClose: () => void;
}

export interface ChangeGuestsModalProps {
  adults: number;
  children: number;
  infants: number;
  pets: number;
  maxGuests?: number;
  onSave: (counts: { adults: number; children: number; infants: number; pets: number }) => void;
  onClose: () => void;
}

// ═══════════════════════════════════════════════════════
// ─── CHANGE DATES MODAL ─────────────────────────────────
// ═════════════════════════════════════════════════════════

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function toDateString(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function CalendarMonth({
  year,
  month,
  selectedStart,
  selectedEnd,
  hoveredDate,
  onHover,
  onSelect,
  today,
}: {
  year: number;
  month: number;
  selectedStart: string | null;
  selectedEnd: string | null;
  hoveredDate: string | null;
  onHover: (d: string | null) => void;
  onSelect: (d: string) => void;
  today: string;
}) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  // pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  const rangeEnd = selectedStart && !selectedEnd && hoveredDate ? hoveredDate : selectedEnd;

  return (
    <div className="flex-1">
      <p className="text-sm font-semibold text-center text-gray-900 mb-4">
        {MONTHS[month]} {year}
      </p>
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map((d, i) => (
          <div key={i} className="text-center text-xs font-medium text-gray-500 pb-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const dateStr = toDateString(year, month, day);
          const isPast = dateStr < today;
          const isStart = dateStr === selectedStart;
          const isEnd = dateStr === selectedEnd;
          const inRange = selectedStart && rangeEnd &&
            dateStr > (selectedStart < rangeEnd ? selectedStart : rangeEnd) &&
            dateStr < (selectedStart < rangeEnd ? rangeEnd : selectedStart);

          return (
            <div key={i} className="relative flex items-center justify-center h-9">
              {/* Range highlight */}
              {inRange && (
                <div className="absolute inset-y-0 left-0 right-0 bg-gray-100" />
              )}
              {/* Start cap */}
              {isStart && selectedEnd && (
                <div className="absolute inset-y-0 right-0 left-1/2 bg-gray-100" />
              )}
              {/* End cap */}
              {isEnd && selectedStart && (
                <div className="absolute inset-y-0 left-0 right-1/2 bg-gray-100" />
              )}
              <button
                disabled={isPast}
                onMouseEnter={() => onHover(dateStr)}
                onMouseLeave={() => onHover(null)}
                onClick={() => !isPast && onSelect(dateStr)}
                className={`relative z-10 w-9 h-9 rounded-full text-sm font-medium transition-all
                  ${isPast ? "text-gray-300 cursor-not-allowed line-through" : "cursor-pointer hover:border hover:border-gray-900"}
                  ${isStart || isEnd ? "bg-gray-900 text-white hover:bg-gray-800 border-0" : ""}
                  ${!isStart && !isEnd && !isPast ? "text-gray-800" : ""}
                `}
              >
                {day}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ChangeDatesModal({ checkIn, checkOut, onSave, onClose }: ChangeDatesModalProps) {
  const today = new Date().toISOString().split("T")[0];
  const now = new Date();

  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedStart, setSelectedStart] = useState<string | null>(checkIn || null);
  const [selectedEnd, setSelectedEnd] = useState<string | null>(checkOut || null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const nextMonth = viewMonth === 11 ? { month: 0, year: viewYear + 1 } : { month: viewMonth + 1, year: viewYear };

  const handleSelect = (date: string) => {
    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(date);
      setSelectedEnd(null);
    } else {
      if (date < selectedStart) {
        setSelectedEnd(selectedStart);
        setSelectedStart(date);
      } else if (date === selectedStart) {
        setSelectedStart(null);
      } else {
        setSelectedEnd(date);
      }
    }
  };

  const handlePrev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const handleNext = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const formatDisplay = (d: string | null) => {
    if (!d) return "";
    const parts = d.split("-");
    if (parts.length !== 3) return d;
    const [, m, day] = parts;
    return `${MONTHS[parseInt(m) - 1].slice(0, 3)} ${parseInt(day)}`;
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div ref={ref} className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
        style={{ animation: "modalIn .2s cubic-bezier(.16,1,.3,1) both" }}>
        <style>{`@keyframes modalIn{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h2 className="text-xl font-bold text-gray-900">Change dates</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <X size={16} className="text-gray-600" />
          </button>
        </div>

        {/* Selected range display */}
        {(selectedStart || selectedEnd) && (
          <div className="px-6 pb-2 flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium text-gray-900">{formatDisplay(selectedStart)}</span>
            {selectedEnd && <><span>→</span><span className="font-medium text-gray-900">{formatDisplay(selectedEnd)}</span></>}
          </div>
        )}

        {/* Calendars */}
        <div className="px-6 pb-4">
          <div className="flex items-start gap-8 relative">
            {/* Prev arrow */}
            <button onClick={handlePrev} className="absolute left-0 top-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors z-10">
              <ChevronLeft size={16} className="text-gray-600" />
            </button>

            <div className="flex-1 pl-6">
              <CalendarMonth
                year={viewYear} month={viewMonth}
                selectedStart={selectedStart} selectedEnd={selectedEnd}
                hoveredDate={hoveredDate} onHover={setHoveredDate}
                onSelect={handleSelect} today={today}
              />
            </div>

            <div className="flex-1 pr-6">
              <CalendarMonth
                year={nextMonth.year} month={nextMonth.month}
                selectedStart={selectedStart} selectedEnd={selectedEnd}
                hoveredDate={hoveredDate} onHover={setHoveredDate}
                onSelect={handleSelect} today={today}
              />
            </div>

            {/* Next arrow */}
            <button onClick={handleNext} className="absolute right-0 top-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors z-10">
              <ChevronRight size={16} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <button
            onClick={() => { setSelectedStart(null); setSelectedEnd(null); }}
            className="text-sm font-semibold text-gray-700 underline underline-offset-2 hover:text-gray-900 transition-colors"
          >
            Clear dates
          </button>
          <button
            onClick={() => { onSave(selectedStart ?? "", selectedEnd ?? ""); onClose(); }}
            disabled={!selectedStart || !selectedEnd}
            className="bg-gray-900 text-white text-sm font-semibold px-7 py-3 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ─── CHANGE GUESTS MODAL ────────────────────────────────
// ═══════════════════════════════════════════════════════════

export function ChangeGuestsModal({
  adults: initAdults,
  children: initChildren,
  infants: initInfants,
  pets: initPets,
  maxGuests = 2,
  onSave,
  onClose,
}: ChangeGuestsModalProps) {
  const [counts, setCounts] = useState({
    adults:   initAdults,
    children: initChildren,
    infants: initInfants,
    pets:     initPets,
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const guestTotal = counts.adults + counts.children;

  const update = (key: keyof typeof counts, delta: number) => {
    setCounts(prev => {
      const newVal = prev[key] + delta;
      if (newVal < 0) return prev;
      // enforce max guests for adults + children combined
      if ((key === "adults" || key === "children") && delta > 0 && guestTotal >= maxGuests) return prev;
      return { ...prev, [key]: newVal };
    });
  };

  const GUEST_ROWS = [
    { key: "adults"   as const, label: "Adults",   sub: "Age 13+",           min: 1,  canAdd: guestTotal < maxGuests },
    { key: "children" as const, label: "Children",  sub: "Ages 2 – 12",       min: 0,  canAdd: guestTotal < maxGuests },
    { key: "infants"  as const, label: "Infants",   sub: "Under 2",           min: 0,  canAdd: true },
    { key: "pets"     as const, label: "Pets",      sub: "Bringing a service animal?", min: 0,  canAdd: false, petNote: true },
  ];

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div ref={ref} className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
        style={{ animation: "modalIn .2s cubic-bezier(.16,1,.3,1) both" }}>
        <style>{`@keyframes modalIn{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-xl font-bold text-gray-900">Change guests</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <X size={16} className="text-gray-600" />
          </button>
        </div>

        {/* Subtitle */}
        <p className="px-5 pb-4 text-sm text-gray-500 leading-snug">
          This place has a maximum of {maxGuests} guests, not including infants. Pets aren't allowed.
        </p>

        {/* Rows */}
        <div className="px-5 divide-y divide-gray-100">
          {GUEST_ROWS.map(({ key, label, sub, min, canAdd, petNote }) => {
            const val = counts[key];
            const canSubtract = val > min;
            const canIncrement = key === "pets" ? false : canAdd;

            return (
              <div key={key} className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{label}</p>
                  {petNote ? (
                    <button className="text-xs text-gray-500 underline underline-offset-1 hover:text-gray-700 mt-0.5">{sub}</button>
                  ) : (
                    <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => update(key, -1)}
                    disabled={!canSubtract}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center text-lg transition-all ${
                      canSubtract
                        ? "border-gray-300 text-gray-700 hover:border-gray-500"
                        : "border-gray-200 text-gray-300 cursor-not-allowed"
                    }`}
                  >
                    −
                  </button>
                  <span className="w-4 text-center text-sm font-semibold text-gray-900">{val}</span>
                  <button
                    onClick={() => canIncrement && update(key, 1)}
                    disabled={!canIncrement}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center text-lg transition-all ${
                      canIncrement
                        ? "border-gray-300 text-gray-700 hover:border-gray-500"
                        : "border-gray-200 text-gray-300 cursor-not-allowed"
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 mt-1">
          <button onClick={onClose} className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => { onSave(counts); onClose(); }}
            className="bg-gray-900 text-white text-sm font-semibold px-7 py-3 rounded-xl hover:bg-gray-800 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
