import { format } from 'date-fns'
import type { CalendarView, CalendarMode, CalendarProperty } from '@/types/calendar'

interface CalendarHeaderProps {
  currentDate: Date
  view: CalendarView
  mode: CalendarMode
  selectedPropertyId: string
  properties: CalendarProperty[]
  onPreviousMonth: () => void
  onNextMonth: () => void
  onToday: () => void
  onPropertyChange: (propertyId: string) => void
  onViewChange: (view: CalendarView) => void
  onModeChange: (mode: CalendarMode) => void
  onTogglePanel: () => void
  showPanel: boolean
  onNewReservation: () => void
  onBlockDates: () => void
}

export default function CalendarHeader({
  currentDate, view, mode, selectedPropertyId, properties,
  onPreviousMonth, onNextMonth, onToday, onPropertyChange,
  onViewChange, onModeChange, onTogglePanel, showPanel,
  onNewReservation, onBlockDates
}: CalendarHeaderProps) {
  const views: { value: CalendarView; label: string }[] = [
    { value: 'month', label: 'Month' },
    { value: 'week', label: 'Week' },
    { value: 'day', label: 'Day' }
  ]

  const modes: { value: CalendarMode; label: string }[] = [
    { value: 'booking', label: 'Booking Calendar' },
    { value: 'cleaning', label: 'Cleaning Schedule' },
    { value: 'maintenance', label: 'Maintenance Schedule' }
  ]

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            {modes.map((m) => (
              <button key={m.value} onClick={() => onModeChange(m.value)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === m.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}>
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <button onClick={onTogglePanel}
          className={`p-2 rounded-lg transition-colors ${
            showPanel ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`} title="Toggle Summary Panel">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line>
          </svg>
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button onClick={onPreviousMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Previous">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <button onClick={onToday} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium transition-colors">Today</button>
            <button onClick={onNextMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Next">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
            <span className="text-lg font-semibold text-gray-900 min-w-[150px]">{format(currentDate, 'MMMM yyyy')}</span>
          </div>

          <div className="relative">
            <select value={selectedPropertyId} onChange={(e) => onPropertyChange(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer">
              <option value="all">All Properties</option>
              {properties.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </div>

          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            {views.map((v) => (
              <button key={v.value} onClick={() => onViewChange(v.value)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === v.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}>
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={onNewReservation} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
            New Reservation
          </button>
          <button onClick={onBlockDates} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            Block Dates
          </button>
        </div>
      </div>
    </div>
  )
}
