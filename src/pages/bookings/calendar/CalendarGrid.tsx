import { format } from 'date-fns'
import type { CalendarMonth, CalendarView, CalendarMode, CalendarBooking, BlockedDate } from '@/types/calendar'
import BookingCard from './BookingCard'

interface CalendarGridProps {
  calendarMonth: CalendarMonth | null
  view: CalendarView
  mode: CalendarMode
  onBookingClick: (booking: CalendarBooking) => void
}

export default function CalendarGrid({ calendarMonth, view, mode, onBookingClick }: CalendarGridProps) {
  if (!calendarMonth) {
    return <div className="flex items-center justify-center h-64"><div className="text-gray-500">No calendar data available</div></div>
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  if (view === 'month') {
    return (
      <div className="p-6">
        <div className="grid grid-cols-7 gap-px mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
          {calendarMonth.days.map((day) => (
            <CalendarCell key={day.date} day={day} mode={mode} onBookingClick={onBookingClick} />
          ))}
        </div>
      </div>
    )
  }

  if (view === 'week') {
    const todayIdx = calendarMonth.days.findIndex(d => d.isToday)
    const weekStart = todayIdx >= 0 ? Math.floor(todayIdx / 7) * 7 : 0
    const weekDaysData = calendarMonth.days.slice(weekStart, weekStart + 7)

    return (
      <div className="p-6">
        <div className="grid grid-cols-7 gap-px mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
          {weekDaysData.map((day) => (
            <CalendarCell key={day.date} day={day} mode={mode} onBookingClick={onBookingClick} tall />
          ))}
        </div>
      </div>
    )
  }

  // Day view
  const today = calendarMonth.days.find(d => d.isToday) || calendarMonth.days[0]

  return (
    <div className="p-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{format(new Date(today.date), 'EEEE, MMMM d, yyyy')}</h3>
        {today.bookings.length === 0 && today.blockedDates.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No bookings or blocks for this day</p>
        ) : (
          <div className="space-y-2">
            {today.bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} onClick={() => onBookingClick(booking)} />
            ))}
            {today.blockedDates.map((block) => (
              <div key={block.id} className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg">Blocked - {block.reason}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface CalendarCellProps {
  day: any
  mode: CalendarMode
  onBookingClick: (booking: CalendarBooking) => void
  tall?: boolean
}

function CalendarCell({ day, mode, onBookingClick, tall }: CalendarCellProps) {
  const dayNumber = parseInt(format(new Date(day.date), 'd'))

  return (
    <div className={`bg-white p-2 ${!day.isCurrentMonth ? 'bg-gray-50' : ''} ${tall ? 'min-h-[400px]' : 'min-h-[120px]'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-medium ${
          day.isToday ? 'bg-red-600 text-white w-7 h-7 rounded-full flex items-center justify-center'
          : !day.isCurrentMonth ? 'text-gray-400' : 'text-gray-900'
        }`}>{dayNumber}</span>
      </div>
      <div className="space-y-1">
        {day.bookings.slice(0, 3).map((booking: CalendarBooking) => (
          <BookingCard key={booking.id} booking={booking} onClick={() => onBookingClick(booking)} compact />
        ))}
        {day.bookings.length > 3 && <div className="text-xs text-gray-500 px-2 py-1">+{day.bookings.length - 3} more</div>}
      </div>
      {day.blockedDates.map((block: BlockedDate) => (
        <div key={block.id} className="bg-gray-800 text-white text-xs px-2 py-1 rounded mt-1">{block.reason}</div>
      ))}
    </div>
  )
}
