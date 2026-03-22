import { useState, useRef, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = "Dates" | "Months" | "Flexible";
type Duration = "Weekend" | "Week" | "Month";

interface WhenPickerProps {
  /** Called whenever a date range is confirmed */
  onSelect?: (start: Date, end: Date) => void;
  /** Called when picker is closed */
  onClose?: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const SHORT_DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const FLEX_TAGS  = ["Exact dates","+1 day","+2 days","+3 days","+7 days","+14 days"];
const MAX_MONTHS = 12;
const VISIBLE_MONTHS = 6;

// ─── Date Utilities ───────────────────────────────────────────────────────────
function formatDate(d: Date): string {
  return `${MONTH_NAMES[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
}

function formatFull(d: Date): string {
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  return `${days[d.getDay()]}, ${MONTH_NAMES[d.getMonth()].slice(0,3)} ${d.getDate()}`;
}

function addMonths(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setMonth(d.getMonth() + n);
  return d;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function isSameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function isBetween(d: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  const t = d.getTime();
  return t > Math.min(start.getTime(), end.getTime())
      && t < Math.max(start.getTime(), end.getTime());
}

// ─── Reusable: Chevron Icons ──────────────────────────────────────────────────
const ChevLeft  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const ChevRight = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
const SearchIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const CalIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

// ─── Dates Tab ────────────────────────────────────────────────────────────────
function DatesTab({ onSelect }: { onSelect?: (s: Date, e: Date) => void }) {
  const today = new Date();
  const [leftMonth, setLeftMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate,   setEndDate]   = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [exactMode, setExactMode] = useState("Exact dates");

  const rightMonth = addMonths(leftMonth, 1);

  const handleDayClick = (d: Date) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(d);
      setEndDate(null);
    } else {
      if (d < startDate) { setStartDate(d); setEndDate(null); }
      else { setEndDate(d); onSelect?.(startDate, d); }
    }
  };

  const renderMonth = (base: Date) => {
    const year  = base.getFullYear();
    const month = base.getMonth();
    const days  = getDaysInMonth(year, month);
    const first = getFirstDayOfMonth(year, month);
    const cells: (Date | null)[] = [];
    for (let i = 0; i < first; i++) cells.push(null);
    for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d));

    return (
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-center text-gray-800 mb-3">
          {MONTH_NAMES[month]} {year}
        </p>
        <div className="grid grid-cols-7 mb-1">
          {SHORT_DAYS.map(d => (
            <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((d, i) => {
            if (!d) return <div key={`e-${i}`} />;
            const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const isPast   = d < todayMidnight;
            const isStart  = isSameDay(d, startDate);
            const isEnd    = isSameDay(d, endDate);
            const inRange  = endDate
              ? isBetween(d, startDate, endDate)
              : (!endDate && hoverDate && startDate && isBetween(d, startDate, hoverDate)) ?? false;

            return (
              <button
                key={d.toISOString()}
                disabled={isPast}
                onMouseEnter={() => !isPast && setHoverDate(d)}
                onMouseLeave={() => setHoverDate(null)}
                onClick={() => !isPast && handleDayClick(d)}
                className={[
                  "relative text-xs py-1.5 select-none transition-all",
                  isPast  ? "text-gray-300 cursor-not-allowed" : "cursor-pointer",
                  isStart || isEnd ? "bg-gray-900 text-white font-bold rounded-full z-10" : "",
                  inRange && !isStart && !isEnd ? "bg-red-100 text-red-700 rounded-none" : "",
                  !isStart && !isEnd && !inRange && !isPast ? "hover:bg-gray-100 text-gray-700 rounded-full" : "",
                ].join(" ")}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Dual calendar */}
      <div className="flex items-center gap-4 px-2">
        <button
          onClick={() => setLeftMonth(p => addMonths(p, -1))}
          className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 transition-colors flex-shrink-0"
        >
          <ChevLeft />
        </button>
        <div className="flex flex-1 gap-6">
          {renderMonth(leftMonth)}
          {renderMonth(rightMonth)}
        </div>
        <button
          onClick={() => setLeftMonth(p => addMonths(p, 1))}
          className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 transition-colors flex-shrink-0"
        >
          <ChevRight />
        </button>
      </div>

      {/* Flex tags */}
      <div className="flex gap-2 justify-center mt-4 flex-wrap">
        {FLEX_TAGS.map(t => (
          <button
            key={t}
            onClick={() => setExactMode(t)}
            className={`text-xs border rounded-full px-3 py-1 transition-colors ${
              exactMode === t
                ? "border-gray-800 bg-gray-900 text-white"
                : "border-gray-300 text-gray-600 hover:border-gray-500"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Selected summary */}
      {(startDate || endDate) && (
        <div className="mt-3 text-center text-xs text-gray-500">
          {startDate && <span className="font-semibold text-gray-800">{formatDate(startDate)}</span>}
          {endDate   && <> — <span className="font-semibold text-gray-800">{formatDate(endDate)}</span></>}
        </div>
      )}
    </div>
  );
}

// ─── Months Tab ───────────────────────────────────────────────────────────────
function MonthsTab({ onSelect }: { onSelect?: (s: Date, e: Date) => void }) {
  const [months, setMonths] = useState(1);

  const today  = new Date();
  const startD = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const endD   = new Date(startD);
  endD.setMonth(endD.getMonth() + months);
  endD.setDate(endD.getDate() - 1);

  // Dial geometry
  const R     = 80;
  const CX    = 110;
  const CY    = 110;
  const angle = (months / MAX_MONTHS) * 360 - 90;
  const rad   = (angle * Math.PI) / 180;
  const thumbX = CX + R * Math.cos(rad);
  const thumbY = CY + R * Math.sin(rad);

  const startRad = -Math.PI / 2;
  const largeArc = months / MAX_MONTHS > 0.5 ? 1 : 0;
  const arcX1    = CX + R * Math.cos(startRad);
  const arcY1    = CY + R * Math.sin(startRad);

  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = ((i / 12) * 360 - 90) * (Math.PI / 180);
    return {
      x1: CX + 90 * Math.cos(a), y1: CY + 90 * Math.sin(a),
      x2: CX + 100 * Math.cos(a), y2: CY + 100 * Math.sin(a),
    };
  });

  const handleDialClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x    = e.clientX - rect.left - CX;
    const y    = e.clientY - rect.top  - CY;
    let deg    = (Math.atan2(y, x) * 180) / Math.PI + 90;
    if (deg < 0) deg += 360;
    const m = Math.max(1, Math.round((deg / 360) * MAX_MONTHS));
    setMonths(m);
    onSelect?.(startD, endD);
  };

  return (
    <div className="flex flex-col items-center py-2">
      <p className="text-sm font-semibold text-gray-800 mb-5">When's your trip?</p>

      {/* Rotary dial */}
      <svg
        width={220}
        height={220}
        viewBox="0 0 220 220"
        className="cursor-pointer"
        onClick={handleDialClick}
      >
        <defs>
          <linearGradient id="dialGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#BA0036" />
            <stop offset="100%" stopColor="#ff6b6b" />
          </linearGradient>
        </defs>
        {/* Outer shadow ring */}
        <circle cx={CX} cy={CY} r={R + 16} fill="white" style={{ filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.10))" }} />
        {/* Inner circle */}
        <circle cx={CX} cy={CY} r={R - 20} fill="white" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.06))" }} />
        {/* Track */}
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f0f0f0" strokeWidth="14" />
        {/* Active arc */}
        {months > 0 && (
          <path
            d={`M ${arcX1} ${arcY1} A ${R} ${R} 0 ${largeArc} 1 ${thumbX} ${thumbY}`}
            fill="none"
            stroke="url(#dialGrad)"
            strokeWidth="14"
            strokeLinecap="round"
          />
        )}
        {/* Tick marks */}
        {ticks.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke="#e0e0e0" strokeWidth="2" strokeLinecap="round" />
        ))}
        {/* Thumb */}
        <circle cx={thumbX} cy={thumbY} r={11} fill="white"
          style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.18))" }} />
        {/* Center label */}
        <text x={CX} y={CY - 6}  textAnchor="middle" fontSize="26" fontWeight="700" fill="#111">{months}</text>
        <text x={CX} y={CY + 16} textAnchor="middle" fontSize="11" fill="#888">
          month{months !== 1 ? "s" : ""}
        </text>
      </svg>

      {/* Date range */}
      <div className="mt-3 flex items-center gap-2 text-sm">
        <span className="font-semibold text-gray-800 underline underline-offset-2">{formatFull(startD)}</span>
        <span className="text-gray-400">to</span>
        <span className="font-semibold text-gray-800 underline underline-offset-2">{formatFull(endD)}</span>
      </div>
    </div>
  );
}

// ─── Flexible Tab ─────────────────────────────────────────────────────────────
function FlexibleTab({ onSelect }: { onSelect?: (s: Date, e: Date) => void }) {
  const [duration,       setDuration]       = useState<Duration>("Weekend");
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [offset,         setOffset]         = useState(0);

  const today     = new Date();
  const allMonths = Array.from({ length: 18 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() + 1 + i, 1);
    return {
      label: MONTH_NAMES[d.getMonth()],
      year:  d.getFullYear(),
      key:   `${d.getFullYear()}-${d.getMonth()}`,
    };
  });
  const visible = allMonths.slice(offset, offset + VISIBLE_MONTHS);

  const toggleMonth = (key: string) => {
    setSelectedMonths(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  return (
    <div className="py-2">
      {/* Duration */}
      <p className="text-sm font-semibold text-gray-800 text-center mb-4">
        How long would you like to stay?
      </p>
      <div className="flex justify-center gap-3 mb-6">
        {(["Weekend","Week","Month"] as Duration[]).map(d => (
          <button
            key={d}
            onClick={() => setDuration(d)}
            className={`text-sm border rounded-full px-5 py-1.5 transition-all ${
              duration === d
                ? "border-gray-800 bg-gray-900 text-white font-semibold"
                : "border-gray-300 text-gray-700 hover:border-gray-500"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Month grid */}
      <p className="text-sm font-semibold text-gray-800 text-center mb-3">Go anytime</p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOffset(o => Math.max(0, o - 1))}
          disabled={offset === 0}
          className="p-1.5 rounded-full border border-gray-200 text-gray-400 hover:border-gray-400 disabled:opacity-30 transition-colors flex-shrink-0"
        >
          <ChevLeft />
        </button>

        <div className="flex gap-2 overflow-hidden flex-1">
          {visible.map(({ label, year, key }) => (
            <button
              key={key}
              onClick={() => toggleMonth(key)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl border-2 transition-all ${
                selectedMonths.includes(key)
                  ? "border-gray-800 bg-gray-50"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <span className="text-gray-400"><CalIcon /></span>
              <span className="text-xs font-semibold text-gray-800">{label}</span>
              <span className="text-[10px] text-gray-400">{year}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setOffset(o => Math.min(allMonths.length - VISIBLE_MONTHS, o + 1))}
          disabled={offset >= allMonths.length - VISIBLE_MONTHS}
          className="p-1.5 rounded-full border border-gray-200 text-gray-400 hover:border-gray-400 disabled:opacity-30 transition-colors flex-shrink-0"
        >
          <ChevRight />
        </button>
      </div>

      {selectedMonths.length > 0 && (
        <p className="text-center text-xs text-gray-500 mt-3">
          {selectedMonths.length} month{selectedMonths.length !== 1 ? "s" : ""} selected
        </p>
      )}
    </div>
  );
}

// ─── When Picker Panel ────────────────────────────────────────────────────────
export function WhenPicker({ onSelect, onClose }: WhenPickerProps) {
  const [activeTab, setActiveTab] = useState<Tab>("Dates");
  const TABS: Tab[] = ["Dates","Months","Flexible"];

  const handleSelect = (start: Date, end: Date) => {
    onSelect?.(start, end);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden w-full">
      {/* Tab switcher */}
      <div className="flex justify-center gap-1 pt-4 pb-3 px-4 bg-gray-50 border-b border-gray-100">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-sm px-5 py-1.5 rounded-full transition-all ${
              activeTab === tab
                ? "bg-white shadow-sm border border-gray-200 font-semibold text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div
        key={activeTab}
        className="px-5 py-5"
        style={{ animation: "tabFade .15s ease both" }}
      >
        <style>{`@keyframes tabFade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}`}</style>
        {activeTab === "Dates"    && <DatesTab    onSelect={handleSelect} />}
        {activeTab === "Months"   && <MonthsTab   onSelect={handleSelect} />}
        {activeTab === "Flexible" && <FlexibleTab onSelect={handleSelect} />}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
        <button
          onClick={onClose}
          className="text-sm font-semibold text-gray-500 hover:text-gray-700 underline underline-offset-2 transition-colors"
        >
          Clear
        </button>
        <button
          onClick={onClose}
          className="bg-red-600 text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <SearchIcon /> Search
        </button>
      </div>
    </div>
  );
}
