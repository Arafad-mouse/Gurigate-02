import { useState, useEffect, useContext } from 'react'
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns'
import { AuthContext } from '@/lib/auth-context'
import { CalendarService } from '@/services/calendarService'
import type { CalendarView, CalendarMode, CalendarMonth, CalendarBooking, CalendarProperty, CalendarSummary, BlockReason } from '@/types/calendar'
import CalendarHeader from './calendar/CalendarHeader'
import CalendarGrid from './calendar/CalendarGrid'
import BookingDrawer from './calendar/BookingDrawer'
import CalendarPanel from './calendar/CalendarPanel'
import BlockDatesModal from './calendar/BlockDatesModal'
import NewReservationModal from './calendar/NewReservationModal'

export default function BookingCalendar() {
  const authContext = useContext(AuthContext)
  const profile = authContext?.profile
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<CalendarView>('month')
  const [mode, setMode] = useState<CalendarMode>('booking')
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all')
  const [properties, setProperties] = useState<CalendarProperty[]>([])
  const [calendarMonth, setCalendarMonth] = useState<CalendarMonth | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<CalendarBooking | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<CalendarSummary | null>(null)
  const [showPanel, setShowPanel] = useState(true)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [showReservationModal, setShowReservationModal] = useState(false)

  useEffect(() => { loadProperties() }, [profile])

  useEffect(() => {
    if (profile) { loadCalendarData(); loadSummary() }
  }, [currentDate, selectedPropertyId, profile])

  useEffect(() => {
    if (!profile) return
    const subscription = CalendarService.subscribeToBookings(() => { loadCalendarData(); loadSummary() })
    return () => { subscription.unsubscribe() }
  }, [profile, currentDate, selectedPropertyId])

  const loadProperties = async () => {
    if (!profile?.id) return
    try { setProperties(await CalendarService.fetchProperties(profile.id)) }
    catch (error) { console.error('Error loading properties:', error) }
  }

  const loadCalendarData = async () => {
    if (!profile?.id) return
    setLoading(true)
    try {
      let rangeStart: Date, rangeEnd: Date
      if (view === 'month') { rangeStart = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 }); rangeEnd = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 }) }
      else if (view === 'week') { rangeStart = startOfWeek(currentDate, { weekStartsOn: 0 }); rangeEnd = endOfWeek(currentDate, { weekStartsOn: 0 }) }
      else { rangeStart = currentDate; rangeEnd = addDays(currentDate, 1) }

      const [bookings, blockedDates, pricing] = await Promise.all([
        CalendarService.fetchBookingsForDateRange(format(rangeStart, 'yyyy-MM-dd'), format(rangeEnd, 'yyyy-MM-dd'), selectedPropertyId),
        CalendarService.fetchBlockedDates(format(rangeStart, 'yyyy-MM-dd'), format(rangeEnd, 'yyyy-MM-dd'), selectedPropertyId),
        CalendarService.fetchPricing(format(rangeStart, 'yyyy-MM-dd'), format(rangeEnd, 'yyyy-MM-dd'), selectedPropertyId)
      ])
      setCalendarMonth(CalendarService.buildCalendarMonth(currentDate.getFullYear(), currentDate.getMonth(), bookings, blockedDates, pricing))
    } catch (error) { console.error('Error loading calendar data:', error) }
    finally { setLoading(false) }
  }

  const loadSummary = async () => {
    if (!profile?.id) return
    try { setSummary(await CalendarService.getCalendarSummary(profile.id, currentDate.getFullYear(), currentDate.getMonth())) }
    catch (error) { console.error('Error loading summary:', error) }
  }

  const handlePrevious = () => {
    if (view === 'month') setCurrentDate(subMonths(currentDate, 1))
    else if (view === 'week') setCurrentDate(subWeeks(currentDate, 1))
    else setCurrentDate(subDays(currentDate, 1))
  }
  const handleNext = () => {
    if (view === 'month') setCurrentDate(addMonths(currentDate, 1))
    else if (view === 'week') setCurrentDate(addWeeks(currentDate, 1))
    else setCurrentDate(addDays(currentDate, 1))
  }
  const handleToday = () => setCurrentDate(new Date())

  const handleBookingClick = (booking: CalendarBooking) => { setSelectedBooking(booking); setIsDrawerOpen(true) }
  const handleDrawerClose = () => { setIsDrawerOpen(false); setSelectedBooking(null) }

  const handleBlockDates = async (propertyId: string, startDate: string, endDate: string, reason: BlockReason, notes?: string) => {
    if (!profile?.id) throw new Error('User not authenticated')
    await CalendarService.blockDates(propertyId, startDate, endDate, reason, profile.id, notes)
    await loadCalendarData(); await loadSummary()
  }

  const handleCreateReservation = async (data: any) => {
    await CalendarService.createReservation(data)
    await loadCalendarData(); await loadSummary()
  }

  if (loading && !calendarMonth) {
    return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading calendar...</div></div>
  }

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <CalendarHeader
          currentDate={currentDate} view={view} mode={mode}
          selectedPropertyId={selectedPropertyId} properties={properties}
          onPreviousMonth={handlePrevious} onNextMonth={handleNext} onToday={handleToday}
          onPropertyChange={setSelectedPropertyId} onViewChange={setView} onModeChange={setMode}
          onTogglePanel={() => setShowPanel(!showPanel)} showPanel={showPanel}
          onNewReservation={() => setShowReservationModal(true)} onBlockDates={() => setShowBlockModal(true)}
        />
        <div className="flex-1 overflow-auto">
          <CalendarGrid calendarMonth={calendarMonth} view={view} mode={mode} onBookingClick={handleBookingClick} />
        </div>
      </div>

      {showPanel && <CalendarPanel summary={summary} currentDate={currentDate} onClose={() => setShowPanel(false)} />}

      <BookingDrawer booking={selectedBooking} isOpen={isDrawerOpen} onClose={handleDrawerClose} onBookingUpdated={loadCalendarData} />
      <BlockDatesModal isOpen={showBlockModal} onClose={() => setShowBlockModal(false)} properties={properties} selectedPropertyId={selectedPropertyId} onBlockDates={handleBlockDates} />
      <NewReservationModal isOpen={showReservationModal} onClose={() => setShowReservationModal(false)} properties={properties} selectedPropertyId={selectedPropertyId} onCreateReservation={handleCreateReservation} />
    </div>
  )
}
