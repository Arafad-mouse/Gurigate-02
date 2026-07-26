import { format } from 'date-fns'
import type { CalendarBooking } from '@/types/calendar'

interface BookingCardProps {
  booking: CalendarBooking
  onClick: () => void
  compact?: boolean
}

export default function BookingCard({ booking, onClick, compact = false }: BookingCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
      case 'checked_in': return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200'
      case 'pending': case 'awaiting_payment': return 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200'
      case 'completed': case 'checked_out': return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
    }
  }

  const checkInDate = new Date(booking.check_in)
  const checkOutDate = new Date(booking.check_out)
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const isCheckIn = todayStr === format(checkInDate, 'yyyy-MM-dd')
  const isCheckOut = todayStr === format(checkOutDate, 'yyyy-MM-dd')

  if (compact) {
    return (
      <button onClick={onClick}
        className={`w-full text-left px-2 py-1 rounded text-xs border transition-colors ${getStatusColor(booking.status)}`}
        title={`${booking.guest_name} - ${booking.property_title}`}>
        <div className="font-medium truncate">{booking.guest_name}</div>
        {isCheckIn && <div className="text-[10px] opacity-75">Check-in</div>}
        {isCheckOut && <div className="text-[10px] opacity-75">Check-out</div>}
      </button>
    )
  }

  return (
    <button onClick={onClick}
      className={`w-full text-left p-3 rounded-lg border transition-colors hover:shadow-md ${getStatusColor(booking.status)}`}>
      <div className="font-semibold text-sm mb-1">{booking.guest_name}</div>
      <div className="text-xs opacity-75 mb-1">{booking.property_title}</div>
      <div className="flex items-center justify-between text-xs">
        <span>{format(checkInDate, 'MMM d')} - {format(checkOutDate, 'MMM d')}</span>
        {isCheckIn && <span className="font-medium">Check-in</span>}
        {isCheckOut && <span className="font-medium">Check-out</span>}
      </div>
    </button>
  )
}
