import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AvailabilityCalendarProps {
  blockedDates: Set<string>;
  bookedDates: Set<string>;
  selectedCheckIn: string | null;
  selectedCheckOut: string | null;
  onDateSelect: (date: string) => void;
  minDate?: Date;
  maxDate?: Date;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function isInRange(date: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  return date > start && date < end;
}

export function AvailabilityCalendar({
  blockedDates,
  bookedDates,
  selectedCheckIn,
  selectedCheckOut,
  onDateSelect,
  minDate = new Date(),
  maxDate,
}: AvailabilityCalendarProps) {
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const maxD = useMemo(() => {
    if (maxDate) return maxDate;
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d;
  }, [maxDate]);

  const checkInDate = selectedCheckIn ? new Date(selectedCheckIn) : null;
  const checkOutDate = selectedCheckOut ? new Date(selectedCheckOut) : null;

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const startOffset = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(viewYear, viewMonth, i));
    }
    return days;
  }, [viewMonth, viewYear]);

  const canGoPrev = useMemo(() => {
    const prevMonth = new Date(viewYear, viewMonth - 1, 1);
    return prevMonth >= new Date(today.getFullYear(), today.getMonth(), 1);
  }, [viewMonth, viewYear, today]);

  const canGoNext = useMemo(() => {
    const nextMonth = new Date(viewYear, viewMonth + 1, 1);
    return nextMonth <= maxD;
  }, [viewMonth, viewYear, maxD]);

  const goPrev = () => {
    if (!canGoPrev) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNext = () => {
    if (!canGoNext) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const isDateDisabled = (date: Date): boolean => {
    if (date < today) return true;
    if (date > maxD) return true;
    const dateStr = formatDate(date);
    if (blockedDates.has(dateStr)) return true;
    if (bookedDates.has(dateStr)) return true;
    // If check-in is selected, disable dates before check-in
    if (checkInDate && !checkOutDate && date <= checkInDate) return true;
    return false;
  };

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;
    onDateSelect(formatDate(date));
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={goPrev}
            disabled={!canGoPrev}
            className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={goNext}
            disabled={!canGoNext}
            className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAY_NAMES.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-400 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, i) => {
          if (!date) return <div key={i} />;

          const dateStr = formatDate(date);
          const disabled = isDateDisabled(date);
          const isCheckIn = checkInDate && isSameDay(date, checkInDate);
          const isCheckOut = checkOutDate && isSameDay(date, checkOutDate);
          const inRange = isInRange(date, checkInDate, checkOutDate);
          const isToday = isSameDay(date, today);

          return (
            <button
              key={i}
              onClick={() => handleDateClick(date)}
              disabled={disabled}
              className={`
                relative aspect-square text-xs rounded-lg transition-all
                ${disabled
                  ? 'text-gray-300 cursor-not-allowed line-through'
                  : 'text-gray-700 hover:bg-gray-100 cursor-pointer'
                }
                ${isCheckIn
                  ? 'bg-[#BA0036] text-white hover:bg-[#BA0036] font-semibold rounded-l-full'
                  : ''
                }
                ${isCheckOut
                  ? 'bg-[#BA0036] text-white hover:bg-[#BA0036] font-semibold rounded-r-full'
                  : ''
                }
                ${inRange
                  ? 'bg-[#BA0036]/10 text-[#BA0036]'
                  : ''
                }
                ${isToday && !isCheckIn && !isCheckOut
                  ? 'ring-1 ring-[#BA0036]/30'
                  : ''
                }
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-[#BA0036] rounded" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-[#BA0036]/10 rounded" />
          <span>In range</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-gray-200 rounded line-through" />
          <span>Unavailable</span>
        </div>
      </div>
    </div>
  );
}
