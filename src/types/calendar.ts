export type CalendarView = 'month' | 'week' | 'day'
export type CalendarMode = 'booking' | 'cleaning' | 'maintenance'
export type BlockReason = 'maintenance' | 'owner_stay' | 'cleaning' | 'unavailable' | 'custom'

export interface CalendarBooking {
  id: string
  guest_id: string
  guest_name: string
  guest_email: string
  guest_phone?: string
  property_id: string
  property_title: string
  property_city: string
  property_category?: string
  host_id: string
  host_name: string
  host_email: string
  check_in: string
  check_out: string
  total_price: number
  currency: string
  status: string
  payment_status: string
  dispute_status: string
  checked_in_at?: string
  checked_out_at?: string
  created_at: string
  updated_at: string
}

export interface BlockedDate {
  id: string
  property_id: string
  start_date: string
  end_date: string
  reason: BlockReason
  notes?: string
  created_at: string
  created_by: string
}

export interface PropertyPricing {
  property_id: string
  date: string
  base_price: number
  weekend_price?: number
  minimum_stay?: number
  maximum_stay?: number
  currency: string
}

export interface CalendarProperty {
  id: string
  title: string
  city: string
  property_category: string
  type: string
  base_price: number
  currency: string
}

export interface CalendarDay {
  date: string
  dayOfWeek: number
  isToday: boolean
  isCurrentMonth: boolean
  bookings: CalendarBooking[]
  blockedDates: BlockedDate[]
  pricing?: PropertyPricing
}

export interface CalendarMonth {
  year: number
  month: number
  days: CalendarDay[]
  weeks: CalendarDay[][]
}

export interface CalendarSummary {
  todayCheckIns: number
  todayCheckOuts: number
  upcomingGuests: number
  availableUnits: number
  occupancy: number
  revenueThisMonth: number
  pendingPayments: number
}
