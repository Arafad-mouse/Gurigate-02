import { supabase } from '@/lib/supabase'
import type {
  CalendarBooking,
  BlockedDate,
  PropertyPricing,
  CalendarProperty,
  CalendarMonth,
  CalendarDay,
  BlockReason
} from '@/types/calendar'
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  getDay,
  startOfWeek,
  endOfWeek,
  isToday
} from 'date-fns'

export class CalendarService {
  static async fetchProperties(userId: string): Promise<CalendarProperty[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, city, property_category, type, base_price, currency')
        .eq('owner_id', userId)
        .is('deleted_at', null)
        .order('title')

      if (error) throw error

      return (data || []).map((prop: any) => ({
        id: prop.id,
        title: prop.title,
        city: prop.city,
        property_category: prop.property_category,
        type: prop.type,
        base_price: prop.base_price || 0,
        currency: prop.currency || 'USD'
      }))
    } catch (error) {
      console.error('Error fetching properties:', error)
      throw error
    }
  }

  static async fetchBookingsForDateRange(
    startDate: string,
    endDate: string,
    propertyId?: string
  ): Promise<CalendarBooking[]> {
    try {
      let query = supabase
        .from('property_bookings')
        .select(`
          id,
          guest_id,
          check_in,
          check_out,
          total_price,
          currency,
          status,
          payment_status,
          dispute_status,
          checked_in_at,
          checked_out_at,
          created_at,
          updated_at,
          profiles!guest_id (
            first_name,
            last_name,
            email,
            phone
          ),
          properties (
            id,
            title,
            city,
            property_category,
            owner_id
          )
        `)
        .gte('check_in', startDate)
        .lte('check_out', endDate)
        .order('check_in', { ascending: true })

      if (propertyId && propertyId !== 'all') {
        query = query.eq('property_id', propertyId)
      }

      const { data, error } = await query

      if (error) throw error

      const enhancedBookings = await Promise.all(
        (data || []).map(async (booking: any) => {
          let hostName = ''
          let hostEmail = ''

          if (booking.properties?.owner_id) {
            const { data: hostData } = await supabase
              .from('profiles')
              .select('first_name, last_name, email')
              .eq('id', booking.properties.owner_id)
              .single()

            if (hostData) {
              hostName = `${hostData.first_name} ${hostData.last_name}`
              hostEmail = hostData.email
            }
          }

          return {
            id: booking.id,
            guest_id: booking.guest_id,
            guest_name: booking.profiles ? `${booking.profiles.first_name} ${booking.profiles.last_name}` : 'Unknown',
            guest_email: booking.profiles?.email || '',
            guest_phone: booking.profiles?.phone,
            property_id: booking.properties?.id || '',
            property_title: booking.properties?.title || 'Unknown',
            property_city: booking.properties?.city || 'Unknown',
            property_category: booking.properties?.property_category,
            host_id: booking.properties?.owner_id || '',
            host_name: hostName,
            host_email: hostEmail,
            check_in: booking.check_in,
            check_out: booking.check_out,
            total_price: booking.total_price,
            currency: booking.currency,
            status: booking.status,
            payment_status: booking.payment_status,
            dispute_status: booking.dispute_status || 'none',
            checked_in_at: booking.checked_in_at,
            checked_out_at: booking.checked_out_at,
            created_at: booking.created_at,
            updated_at: booking.updated_at
          }
        })
      )

      return enhancedBookings
    } catch (error) {
      console.error('Error fetching bookings:', error)
      throw error
    }
  }

  static async fetchBlockedDates(
    startDate: string,
    endDate: string,
    propertyId?: string
  ): Promise<BlockedDate[]> {
    try {
      let query = supabase
        .from('blocked_dates')
        .select('*')
        .gte('start_date', startDate)
        .lte('end_date', endDate)
        .order('start_date', { ascending: true })

      if (propertyId && propertyId !== 'all') {
        query = query.eq('property_id', propertyId)
      }

      const { data, error } = await query

      if (error) throw error

      return (data || []).map((block: any) => ({
        id: block.id,
        property_id: block.property_id,
        start_date: block.start_date,
        end_date: block.end_date,
        reason: block.reason,
        notes: block.notes,
        created_at: block.created_at,
        created_by: block.created_by
      }))
    } catch (error) {
      console.error('Error fetching blocked dates:', error)
      return []
    }
  }

  static async fetchPricing(
    startDate: string,
    endDate: string,
    propertyId?: string
  ): Promise<PropertyPricing[]> {
    try {
      let query = supabase
        .from('property_pricing')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true })

      if (propertyId && propertyId !== 'all') {
        query = query.eq('property_id', propertyId)
      }

      const { data, error } = await query

      if (error) throw error

      return (data || []).map((price: any) => ({
        property_id: price.property_id,
        date: price.date,
        base_price: price.base_price,
        weekend_price: price.weekend_price,
        minimum_stay: price.minimum_stay,
        maximum_stay: price.maximum_stay,
        currency: price.currency
      }))
    } catch (error) {
      console.error('Error fetching pricing:', error)
      return []
    }
  }

  static buildCalendarMonth(
    year: number,
    month: number,
    bookings: CalendarBooking[],
    blockedDates: BlockedDate[],
    pricing: PropertyPricing[]
  ): CalendarMonth {
    const monthStart = startOfMonth(new Date(year, month))
    const monthEnd = endOfMonth(monthStart)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

    const calendarDays: CalendarDay[] = days.map((day: Date) => {
      const dateStr = format(day, 'yyyy-MM-dd')
      const dayBookings = bookings.filter((booking) => {
        const checkIn = new Date(booking.check_in)
        const checkOut = new Date(booking.check_out)
        return day >= checkIn && day <= checkOut
      })

      const dayBlockedDates = blockedDates.filter((block) => {
        const blockStart = new Date(block.start_date)
        const blockEnd = new Date(block.end_date)
        return day >= blockStart && day <= blockEnd
      })

      const dayPricing = pricing.find((p) => p.date === dateStr)

      return {
        date: dateStr,
        dayOfWeek: getDay(day),
        isToday: isToday(day),
        isCurrentMonth: day.getMonth() === month,
        bookings: dayBookings,
        blockedDates: dayBlockedDates,
        pricing: dayPricing
      }
    })

    const weeks: CalendarDay[][] = []
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7))
    }

    return { year, month, days: calendarDays, weeks }
  }

  static async blockDates(
    propertyId: string,
    startDate: string,
    endDate: string,
    reason: BlockReason,
    userId: string,
    notes?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('blocked_dates')
        .insert({
          property_id: propertyId,
          start_date: startDate,
          end_date: endDate,
          reason,
          notes,
          created_by: userId
        })

      if (error) throw error
    } catch (error) {
      console.error('Error blocking dates:', error)
      throw error
    }
  }

  static async unblockDates(blockId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('blocked_dates')
        .delete()
        .eq('id', blockId)

      if (error) throw error
    } catch (error) {
      console.error('Error unblocking dates:', error)
      throw error
    }
  }

  static async updatePricing(
    propertyId: string,
    date: string,
    basePrice: number,
    currency: string = 'USD',
    weekendPrice?: number,
    minimumStay?: number,
    maximumStay?: number
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('property_pricing')
        .upsert({
          property_id: propertyId,
          date,
          base_price: basePrice,
          weekend_price: weekendPrice,
          minimum_stay: minimumStay,
          maximum_stay: maximumStay,
          currency
        })

      if (error) throw error
    } catch (error) {
      console.error('Error updating pricing:', error)
      throw error
    }
  }

  static async updateBookingDates(
    bookingId: string,
    newCheckIn: string,
    newCheckOut: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('property_bookings')
        .update({ check_in: newCheckIn, check_out: newCheckOut })
        .eq('id', bookingId)

      if (error) throw error
    } catch (error) {
      console.error('Error updating booking dates:', error)
      throw error
    }
  }

  static async createReservation(data: {
    propertyId: string
    guestName: string
    guestEmail: string
    guestPhone?: string
    checkIn: string
    checkOut: string
    totalPrice: number
    currency: string
    status: string
    paymentStatus: string
  }): Promise<void> {
    try {
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', data.guestEmail)
        .single()

      let guestId: string

      if (profileError || !existingProfile) {
        const nameParts = data.guestName.split(' ')
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            first_name: nameParts[0] || '',
            last_name: nameParts.slice(1).join(' ') || '',
            email: data.guestEmail,
            phone: data.guestPhone || null
          })
          .select('id')
          .single()

        if (createError) throw createError
        guestId = newProfile.id
      } else {
        guestId = existingProfile.id
      }

      const { error: bookingError } = await supabase
        .from('property_bookings')
        .insert({
          property_id: data.propertyId,
          guest_id: guestId,
          check_in: data.checkIn,
          check_out: data.checkOut,
          total_price: data.totalPrice,
          currency: data.currency,
          status: data.status,
          payment_status: data.paymentStatus
        })

      if (bookingError) throw bookingError
    } catch (error) {
      console.error('Error creating reservation:', error)
      throw error
    }
  }

  static subscribeToBookings(callback: (payload: any) => void) {
    return supabase
      .channel('bookings_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'property_bookings' },
        callback
      )
      .subscribe()
  }

  static async getCalendarSummary(
    userId: string,
    year: number,
    month: number
  ): Promise<{
    todayCheckIns: number
    todayCheckOuts: number
    upcomingGuests: number
    availableUnits: number
    occupancy: number
    revenueThisMonth: number
    pendingPayments: number
  }> {
    try {
      const today = format(new Date(), 'yyyy-MM-dd')
      const monthStart = format(startOfMonth(new Date(year, month)), 'yyyy-MM-dd')
      const monthEnd = format(endOfMonth(new Date(year, month)), 'yyyy-MM-dd')

      const { count: checkIns } = await supabase
        .from('property_bookings')
        .select('*', { count: 'exact', head: true })
        .eq('check_in', today)
        .in('status', ['confirmed', 'checked_in'])

      const { count: checkOuts } = await supabase
        .from('property_bookings')
        .select('*', { count: 'exact', head: true })
        .eq('check_out', today)
        .in('status', ['checked_in', 'completed'])

      const { count: upcoming } = await supabase
        .from('property_bookings')
        .select('*', { count: 'exact', head: true })
        .gt('check_in', today)
        .in('status', ['confirmed', 'pending'])

      const { count: totalProperties } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', userId)
        .is('deleted_at', null)

      const { count: checkedIn } = await supabase
        .from('property_bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'checked_in')

      const { data: revenueData } = await supabase
        .from('property_bookings')
        .select('total_price')
        .gte('check_out', monthStart)
        .lte('check_out', monthEnd)
        .in('status', ['completed', 'checked_out'])

      const revenue = (revenueData || []).reduce((sum, b) => sum + (b.total_price || 0), 0)

      const { data: pendingData } = await supabase
        .from('property_bookings')
        .select('total_price')
        .in('payment_status', ['pending', 'partial'])
        .in('status', ['confirmed', 'checked_in'])

      const pending = (pendingData || []).reduce((sum, b) => sum + (b.total_price || 0), 0)

      const occupancy = totalProperties && totalProperties > 0
        ? ((checkedIn || 0) / totalProperties) * 100
        : 0

      return {
        todayCheckIns: checkIns || 0,
        todayCheckOuts: checkOuts || 0,
        upcomingGuests: upcoming || 0,
        availableUnits: (totalProperties || 0) - (checkedIn || 0),
        occupancy: Math.round(occupancy),
        revenueThisMonth: revenue,
        pendingPayments: pending
      }
    } catch (error) {
      console.error('Error fetching calendar summary:', error)
      throw error
    }
  }
}
