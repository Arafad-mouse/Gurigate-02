import { format } from 'date-fns'
import type { CalendarSummary } from '@/types/calendar'

interface CalendarPanelProps {
  summary: CalendarSummary | null
  currentDate: Date
  onClose: () => void
}

export default function CalendarPanel({ summary, currentDate, onClose }: CalendarPanelProps) {
  if (!summary) {
    return (
      <div className="w-80 flex-shrink-0 bg-white border-l border-gray-200 p-6 h-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-gray-900">Summary</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div className="text-center text-gray-500 py-8">Loading summary...</div>
      </div>
    )
  }

  const items = [
    { label: "Today's Check-ins", value: summary.todayCheckIns, color: 'bg-green-50', iconColor: 'text-green-600' },
    { label: "Today's Check-outs", value: summary.todayCheckOuts, color: 'bg-blue-50', iconColor: 'text-blue-600' },
    { label: 'Upcoming Guests', value: summary.upcomingGuests, color: 'bg-orange-50', iconColor: 'text-orange-600' },
    { label: 'Available Units', value: summary.availableUnits, color: 'bg-purple-50', iconColor: 'text-purple-600' },
    { label: 'Occupancy', value: `${summary.occupancy}%`, color: 'bg-indigo-50', iconColor: 'text-indigo-600' },
    { label: 'Revenue This Month', value: `$${summary.revenueThisMonth.toLocaleString()}`, color: 'bg-green-50', iconColor: 'text-green-600' },
    { label: 'Pending Payments', value: `$${summary.pendingPayments.toLocaleString()}`, color: 'bg-yellow-50', iconColor: 'text-yellow-600' }
  ]

  return (
    <div className="w-80 flex-shrink-0 bg-white border-l border-gray-200 p-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900">Summary</h3>
        <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-1">{format(currentDate, 'MMMM yyyy')}</p>
        <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className={`${item.color} rounded-lg p-4`}>
            <p className="text-xs text-gray-600">{item.label}</p>
            <p className="text-lg font-semibold text-gray-900">{item.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
        <div className="space-y-2">
          <button className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">Sync Calendar</button>
          <button className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">Export Report</button>
        </div>
      </div>
    </div>
  )
}
