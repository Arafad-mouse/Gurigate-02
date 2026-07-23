"use client";

import { useState, useRef, useEffect } from "react";
import { Search, MapPin, Navigation, Building2, Globe, Star, Home } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ActiveDrop = "where" | "when" | "who" | null;

interface Destination {
  name: string;
  sub: string;
  icon: React.ReactNode;
  iconBg: string;
}

interface GuestCounts {
  adults: number;
  children: number;
  infants: number;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const DESTINATIONS: Destination[] = [
  { name: "Nearby",                   sub: "Find what's around you",         iconBg: "#fff3e6", icon: <Navigation size={20} color="#f97316" /> },
  { name: "Nairobi, Kenya",           sub: "For sights like Uhuru Park",     iconBg: "#e8f0fe", icon: <MapPin size={20} color="#1a73e8" /> },
  { name: "Dar es Salaam, Tanzania",  sub: "For a trip abroad",              iconBg: "#e6f4ea", icon: <Globe size={20} color="#1e8e3e" /> },
  { name: "Mombasa, Kenya",           sub: "For its seaside allure",         iconBg: "#e0f7f4", icon: <Globe size={20} color="#00897b" /> },
  { name: "Kuala Lumpur, Malaysia",   sub: "For its stunning architecture",  iconBg: "#f3e8ff", icon: <Building2 size={20} color="#7c3aed" /> },
  { name: "Dubai, UAE",               sub: "For world-class luxury",         iconBg: "#fdf2e0", icon: <Star size={20} color="#d97706" /> },
  { name: "Hargeisa, Somalia",        sub: "For its warm hospitality",       iconBg: "#e8f5e9", icon: <Home size={20} color="#2e7d32" /> },
];

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES = ["Su","Mo","Tu","We","Th","Fr","Sa"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toISO(d: Date) {
  return d.toISOString().split("T")[0];
}
function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y.slice(2)}`;
}
function firstOfMonth(y: number, m: number) {
  return new Date(y, m, 1);
}

// ─── Calendar ─────────────────────────────────────────────────────────────────

function CalendarMonth({
  first,
  showPrev,
  showNext,
  onPrev,
  onNext,
  selStart,
  selEnd,
  onPickDay,
}: {
  first: Date;
  showPrev: boolean;
  showNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  selStart: string | null;
  selEnd: string | null;
  onPickDay: (iso: string) => void;
}) {
  const today = new Date(); today.setHours(0,0,0,0);
  const y = first.getFullYear(), m = first.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const startDay = first.getDay();
  const cells: React.ReactNode[] = [];

  for (let i = 0; i < startDay; i++) cells.push(<div key={`e${i}`} />);
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(y, m, d); dt.setHours(0,0,0,0);
    const iso = toISO(dt);
    const isPast = dt < today;
    const isToday = dt.getTime() === today.getTime();
    const isSel = iso === selStart || iso === selEnd;
    const isRange = !!(selStart && selEnd && iso > selStart && iso < selEnd);

    let cls = "flex items-center justify-center text-sm rounded-lg cursor-pointer select-none h-9 w-full transition-colors ";
    if (isPast)        cls += "text-gray-300 cursor-default";
    else if (isSel)    cls += "bg-[#BA0036] text-white font-semibold";
    else if (isRange)  cls += "bg-red-50 text-[#BA0036]";
    else if (isToday)  cls += "font-bold border border-[#BA0036] text-gray-900 hover:bg-gray-100";
    else               cls += "text-gray-800 hover:bg-gray-100";

    cells.push(
      <div key={iso} className={cls} onClick={() => !isPast && onPickDay(iso)}>
        {d}
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between mb-3">
        {showPrev ? (
          <button onClick={onPrev} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors" title="Previous month">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
          </button>
        ) : <div className="w-7" />}
        <span className="text-sm font-semibold text-gray-900">{MONTHS[m]} {y}</span>
        {showNext ? (
          <button onClick={onNext} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors" title="Next month">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9,18 15,12 9,6"/></svg>
          </button>
        ) : <div className="w-7" />}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {DAY_NAMES.map(d => (
          <div key={d} className="text-center text-[11px] font-semibold text-gray-400 py-1">{d}</div>
        ))}
        {cells}
      </div>
    </div>
  );
}

// ─── Main SearchBar ───────────────────────────────────────────────────────────

export default function SearchBar() {
  const [activeDrop, setActiveDrop] = useState<ActiveDrop>(null);
  const [where, setWhere] = useState("");
  const [whenLabel, setWhenLabel] = useState("");
  const [whoLabel, setWhoLabel] = useState("");
  const [selStart, setSelStart] = useState<string | null>(null);
  const [selEnd, setSelEnd] = useState<string | null>(null);
  const [guests, setGuests] = useState<GuestCounts>({ adults: 1, children: 0, infants: 0 });
  const [calBase, setCalBase] = useState(() => {
    const n = new Date(); return { y: n.getFullYear(), m: n.getMonth() };
  });
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setActiveDrop(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggleDrop(id: ActiveDrop) {
    setActiveDrop(prev => prev === id ? null : id);
  }

  function pickDest(name: string) {
    setWhere(name);
    setActiveDrop("when");
  }

  function pickDay(iso: string) {
    if (!selStart || (selStart && selEnd)) {
      setSelStart(iso); setSelEnd(null);
    } else if (iso < selStart) {
      setSelEnd(selStart); setSelStart(iso);
    } else {
      setSelEnd(iso);
    }
  }

  function applyDates() {
    if (selStart) {
      setWhenLabel(selEnd ? `${fmtDate(selStart)} – ${fmtDate(selEnd)}` : fmtDate(selStart));
    }
    setActiveDrop(null);
  }

  function clearDates() {
    setSelStart(null); setSelEnd(null); setWhenLabel("");
  }

  function adj(type: keyof GuestCounts, delta: number) {
    const min = type === 'adults' ? 1 : 0;
    setGuests(prev => {
      const updated = { ...prev, [type]: Math.max(min, prev[type] + delta) };
      setWhoLabel(formatGuestLabel(updated));
      return updated;
    });
  }

  const formatGuestLabel = (counts: GuestCounts) => {
    const total = counts.adults + counts.children;
    const parts: string[] = [];
    if (total > 0) parts.push(`${total} guest${total > 1 ? "s" : ""}`);
    if (counts.infants > 0) parts.push(`${counts.infants} infant${counts.infants > 1 ? "s" : ""}`);
    return parts.join(", ");
  };

  function applyGuests() {
    setWhoLabel(formatGuestLabel(guests));
    setActiveDrop(null);
  }

  function clearGuests() {
    setGuests({ adults: 1, children: 0, infants: 0 });
    setWhoLabel("");
  }

  const m0 = firstOfMonth(calBase.y, calBase.m);
  const m1 = firstOfMonth(calBase.y, calBase.m + 1);

  const segCls = (id: ActiveDrop) =>
    `flex-1 px-4 py-2.5 cursor-pointer relative border-r border-gray-100 last:border-r-0 rounded-full transition-colors min-w-0 ${
      activeDrop === id ? "bg-gray-50" : "hover:bg-gray-50"
    }`;

  const dropCls = "absolute top-[calc(100%+10px)] bg-white rounded-2xl border border-gray-100 shadow-xl z-50 animate-fade-in";

  return (
    <div className="w-full flex justify-center px-4 pb-3" ref={barRef}>
      <div
        className="flex items-center border border-gray-200 rounded-full bg-white shadow-sm w-full max-w-2xl focus-within:shadow-md focus-within:border-gray-300 transition-all"
        style={{ minWidth: 0 }}
      >
        {/* WHERE */}
        <div className={segCls("where")} onClick={() => toggleDrop("where")} style={{ position: "relative" }}>
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">Where</div>
          <div className="text-sm text-gray-500 truncate">{where || <span className="text-gray-400">Search destinations</span>}</div>

          {activeDrop === "where" && (
            <div className={`${dropCls} left-0 w-80`} onClick={e => e.stopPropagation()}>
              <div className="text-sm font-semibold text-gray-900 px-5 pt-5 pb-3">Suggested destinations</div>
              {DESTINATIONS.map(dest => (
                <div
                  key={dest.name}
                  className="flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => pickDest(dest.name)}
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: dest.iconBg }}>
                    {dest.icon}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{dest.name}</div>
                    <div className="text-xs text-gray-500">{dest.sub}</div>
                  </div>
                </div>
              ))}
              <div className="pb-3" />
            </div>
          )}
        </div>

        {/* WHEN */}
        <div className={segCls("when")} onClick={() => toggleDrop("when")} style={{ position: "relative" }}>
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">When</div>
          <div className="text-sm text-gray-500 truncate">{whenLabel || <span className="text-gray-400">Any time</span>}</div>

          {activeDrop === "when" && (
            <div className={`${dropCls} left-1/2 -translate-x-1/2 w-[600px]`} onClick={e => e.stopPropagation()}>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-6">
                  <CalendarMonth
                    first={m0} showPrev showNext={false}
                    onPrev={() => setCalBase(b => ({ y: b.m === 0 ? b.y-1 : b.y, m: b.m === 0 ? 11 : b.m-1 }))}
                    onNext={() => {}}
                    selStart={selStart} selEnd={selEnd} onPickDay={pickDay}
                  />
                  <CalendarMonth
                    first={m1} showPrev={false} showNext
                    onPrev={() => {}}
                    onNext={() => setCalBase(b => ({ y: b.m === 11 ? b.y+1 : b.y, m: b.m === 11 ? 0 : b.m+1 }))}
                    selStart={selStart} selEnd={selEnd} onPickDay={pickDay}
                  />
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <button onClick={clearDates} className="text-sm text-gray-500 underline hover:text-gray-800 transition-colors">
                    Clear dates
                  </button>
                  <button onClick={applyDates} className="bg-[#BA0036] hover:bg-[#a4003a] text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* WHO */}
        <div className={segCls("who")} onClick={() => toggleDrop("who")} style={{ position: "relative", borderRight: "none" }}>
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">Who</div>
          <div className="text-sm text-gray-500 truncate">{whoLabel || formatGuestLabel(guests) || <span className="text-gray-400">Add guests</span>}</div>

          {activeDrop === "who" && (
            <div className={`${dropCls} right-0 w-72`} onClick={e => e.stopPropagation()}>
              <div className="p-5">
                {(["adults","children","infants"] as const).map((type, i, arr) => (
                  <div key={type} className={`flex items-center justify-between py-3.5 ${i < arr.length-1 ? "border-b border-gray-100" : ""}`}>
                    <div>
                      <div className="text-sm font-semibold text-gray-900 capitalize">{type}</div>
                      <div className="text-xs text-gray-500">
                        {type === "adults" ? "Ages 13 or above" : type === "children" ? "Ages 2–12" : "Under 2"}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => adj(type, -1)}
                        disabled={guests[type] === (type === 'adults' ? 1 : 0)}
                        className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-30 hover:enabled:border-[#BA0036] hover:enabled:text-[#BA0036] transition-colors"
                      >−</button>
                      <span className="text-sm font-semibold w-6 min-w-[1.5rem] text-center text-gray-900">{guests[type]}</span>
                      <button
                        onClick={() => adj(type, 1)}
                        className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#BA0036] hover:text-[#BA0036] transition-colors"
                      >+</button>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <button onClick={clearGuests} className="text-sm text-gray-500 underline hover:text-gray-800 transition-colors">
                    Clear
                  </button>
                  <button onClick={applyGuests} className="bg-[#BA0036] hover:bg-[#a4003a] text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SEARCH BUTTON */}
        <button className="bg-[#BA0036] hover:bg-[#a4003a] text-white rounded-full flex items-center gap-2 px-5 py-2.5 m-1 text-sm font-semibold transition-colors flex-shrink-0">
          <Search size={14} />
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>
    </div>
  );
}
