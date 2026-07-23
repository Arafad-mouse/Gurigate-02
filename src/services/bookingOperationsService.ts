import { supabase } from '@/lib/supabase'

// ============================================
// BOOKING OPERATIONS TYPES
// ============================================

export type BookingStatus = 'pending' | 'awaiting_payment' | 'confirmed' | 'checked_in' | 'checked_out' | 'completed' | 'cancelled' | 'refunded' | 'all'
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded' | 'failed'
export type DisputeStatus = 'none' | 'open' | 'resolved' | 'escalated'

export interface BookingDashboardKPIs {
  todayCheckIns: number
  todayCheckOuts: number
  guestsStaying: number
  pendingBookings: number
  pendingPayments: number
  upcomingArrivals: number
  occupancyRate: number
  revenueToday: number
}

export interface Reservation {
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
  status: BookingStatus
  payment_status: PaymentStatus
  dispute_status: DisputeStatus
  checked_in_at?: string
  checked_out_at?: string
  created_at: string
  updated_at: string
}

export interface TodayCheckIn {
  id: string
  guest_name: string
  guest_email: string
  guest_phone?: string
  property_title: string
  property_city: string
  arrival_time: string
  payment_status: PaymentStatus
  status: BookingStatus
}

export interface TodayCheckOut {
  id: string
  guest_name: string
  guest_email: string
  property_title: string
  property_city: string
  departure_time: string
  outstanding_balance: number
  damage_report?: string
  cleaning_status: 'pending' | 'in_progress' | 'completed'
  status: BookingStatus
}

export interface GuestProfile {
  id: string
  user_id: string
  phone?: string
  country?: string
  city?: string
  address?: string
  preferred_language: string
  total_bookings: number
  total_spending: number
  total_reviews: number
  average_rating?: number
  id_verified: boolean
  email_verified: boolean
  phone_verified: boolean
  risk_score: number
  risk_flags: string[]
  created_at: string
  updated_at: string
}

export interface GuestKPIs {
  totalGuests: number
  guestsStayingToday: number
  arrivalsToday: number
  departuresToday: number
  repeatGuests: number
  averageGuestRating: number
  pendingCheckIns: number
  pendingCheckOuts: number
}

export interface GuestWithBooking extends GuestProfile {
  first_name: string
  last_name: string
  email: string
  current_booking?: {
    property_title: string
    property_city: string
    check_in: string
    check_out: string
    status: BookingStatus
    payment_status: PaymentStatus
  }
  booking_count: number
  total_nights: number
}

export type GuestStatus = 'staying' | 'arriving_today' | 'checking_out_today' | 'upcoming' | 'completed' | 'cancelled' | 'no_show'
export type GuestType = 'new' | 'returning' | 'vip'

export interface BookingCalendarEvent {
  id: string
  property_id: string
  property_title: string
  start: string
  end: string
  status: 'available' | 'reserved' | 'blocked' | 'maintenance'
  booking_id?: string
  guest_name?: string
  price_override?: number
}

export interface BookingPayment {
  id: string
  booking_id: string
  property_id: string
  guest_id: string
  host_id: string
  amount: number
  currency: string
  platform_commission: number
  host_payout: number
  payment_method: 'card' | 'zaad' | 'edahab' | 'premier_wallet' | 'wadaag_pay' | 'bank_transfer'
  payment_reference?: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'disputed'
  processed_by?: string
  processed_at?: string
  created_at: string
}

export interface BookingMessage {
  id: string
  booking_id: string
  sender_id: string
  sender_name: string
  recipient_id: string
  recipient_name: string
  message: string
  is_read: boolean
  created_at: string
}

export interface BookingReview {
  id: string
  booking_id: string
  property_id: string
  guest_id: string
  guest_name: string
  host_id: string
  rating: number
  comment: string
  host_reply?: string
  created_at: string
}

// ============================================
// BOOKING OPERATIONS SERVICE
// ============================================

export class BookingOperationsService {
  // ============================================
  // DASHBOARD KPIs
  // ============================================

  static async getDashboardKPIs(): Promise<BookingDashboardKPIs> {
    try {
      const today = new Date().toISOString().split('T')[0]

      // Today's check-ins
      const { count: todayCheckIns, error: checkInsError } = await supabase
        .from('property_bookings')
        .select('*', { count: 'exact', head: true })
        .eq('check_in', today)
        .in('status', ['confirmed', 'checked_in'])

      if (checkInsError) throw checkInsError

      // Today's check-outs
      const { count: todayCheckOuts, error: checkOutsError } = await supabase
        .from('property_bookings')
        .select('*', { count: 'exact', head: true })
        .eq('check_out', today)
        .in('status', ['checked_in', 'checked_out'])

      if (checkOutsError) throw checkOutsError

      // Guests currently staying (checked_in)
      const { count: guestsStaying, error: stayingError } = await supabase
        .from('property_bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'checked_in')

      if (stayingError) throw stayingError

      // Pending bookings
      const { count: pendingBookings, error: pendingError } = await supabase
        .from('property_bookings')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'awaiting_payment'])

      if (pendingError) throw pendingError

      // Pending payments
      const { count: pendingPayments, error: paymentsError } = await supabase
        .from('property_bookings')
        .select('*', { count: 'exact', head: true })
        .eq('payment_status', 'pending')
        .in('status', ['confirmed', 'checked_in'])

      if (paymentsError) throw paymentsError

      // Upcoming arrivals (next 7 days)
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)
      const { count: upcomingArrivals, error: arrivalsError } = await supabase
        .from('property_bookings')
        .select('*', { count: 'exact', head: true })
        .gte('check_in', today)
        .lte('check_in', nextWeek.toISOString().split('T')[0])
        .in('status', ['confirmed'])

      if (arrivalsError) throw arrivalsError

      // Revenue today (completed check-outs today)
      const { data: revenueData, error: revenueError } = await supabase
        .from('property_bookings')
        .select('total_price')
        .eq('check_out', today)
        .eq('status', 'completed')

      if (revenueError) throw revenueError

      const revenueToday = revenueData.reduce((sum, booking) => sum + (booking.total_price || 0), 0)

      // Occupancy rate (active bookings / total available properties)
      const { count: totalProperties, error: propsError } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('property_category', 'hospitality')
        .is('deleted_at', null)

      if (propsError) throw propsError

      const occupancyRate = totalProperties && totalProperties > 0 
        ? (guestsStaying || 0) / totalProperties * 100 
        : 0

      return {
        todayCheckIns: todayCheckIns || 0,
        todayCheckOuts: todayCheckOuts || 0,
        guestsStaying: guestsStaying || 0,
        pendingBookings: pendingBookings || 0,
        pendingPayments: pendingPayments || 0,
        upcomingArrivals: upcomingArrivals || 0,
        occupancyRate: Math.round(occupancyRate),
        revenueToday
      }
    } catch (error) {
      console.error('Error fetching dashboard KPIs:', error)
      return {
        todayCheckIns: 0,
        todayCheckOuts: 0,
        guestsStaying: 0,
        pendingBookings: 0,
        pendingPayments: 0,
        upcomingArrivals: 0,
        occupancyRate: 0,
        revenueToday: 0
      }
    }
  }

  // ============================================
  // RESERVATIONS
  // ============================================

  static async getReservations(
    status?: BookingStatus,
    propertyId?: string,
    hostId?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Reservation[]> {
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
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (propertyId) {
      query = query.eq('property_id', propertyId)
    }

    if (hostId) {
      query = query.eq('host_id', hostId)
    }

    const { data, error } = await query

    if (error) throw error

    // Enhance with host information
    const enhancedReservations = await Promise.all(
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

    return enhancedReservations
  }

  static async getReservationById(id: string): Promise<Reservation | null> {
    const reservations = await this.getReservations('all', undefined, undefined, 1, 0)
    return reservations.find(r => r.id === id) || null
  }

  static async updateReservationStatus(
    id: string,
    status: BookingStatus,
    changedBy: string,
    reason?: string
  ): Promise<boolean> {
    const { error } = await supabase.rpc('update_booking_status', {
      p_booking_id: id,
      p_new_status: status,
      p_changed_by: changedBy,
      p_change_reason: reason || null
    })

    if (error) throw error
    return true
  }

  static async checkInGuest(bookingId: string): Promise<boolean> {
    const { error } = await supabase
      .from('property_bookings')
      .update({
        status: 'checked_in',
        checked_in_at: new Date().toISOString()
      })
      .eq('id', bookingId)

    if (error) throw error
    return true
  }

  static async checkOutGuest(bookingId: string): Promise<boolean> {
    const { error } = await supabase
      .from('property_bookings')
      .update({
        status: 'checked_out',
        checked_out_at: new Date().toISOString()
      })
      .eq('id', bookingId)

    if (error) throw error
    return true
  }

  static async completeBooking(bookingId: string): Promise<boolean> {
    const { error } = await supabase
      .from('property_bookings')
      .update({
        status: 'completed'
      })
      .eq('id', bookingId)

    if (error) throw error
    return true
  }

  // ============================================
  // TODAY'S CHECK-INS
  // ============================================

  static async getTodayCheckIns(): Promise<TodayCheckIn[]> {
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('property_bookings')
      .select(`
        id,
        check_in,
        payment_status,
        status,
        profiles!guest_id (
          first_name,
          last_name,
          email,
          phone
        ),
        properties (
          title,
          city
        )
      `)
      .eq('check_in', today)
      .in('status', ['confirmed', 'checked_in'])
      .order('check_in', { ascending: true })

    if (error) throw error

    return (data || []).map((booking: any) => ({
      id: booking.id,
      guest_name: booking.profiles ? `${booking.profiles.first_name} ${booking.profiles.last_name}` : 'Unknown',
      guest_email: booking.profiles?.email || '',
      guest_phone: booking.profiles?.phone,
      property_title: booking.properties?.title || 'Unknown',
      property_city: booking.properties?.city || 'Unknown',
      arrival_time: booking.check_in,
      payment_status: booking.payment_status,
      status: booking.status
    }))
  }

  // ============================================
  // TODAY'S CHECK-OUTS
  // ============================================

  static async getTodayCheckOuts(): Promise<TodayCheckOut[]> {
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('property_bookings')
      .select(`
        id,
        check_out,
        total_price,
        payment_status,
        status,
        profiles!guest_id (
          first_name,
          last_name,
          email
        ),
        properties (
          title,
          city
        )
      `)
      .eq('check_out', today)
      .in('status', ['checked_in', 'checked_out'])
      .order('check_out', { ascending: true })

    if (error) throw error

    return (data || []).map((booking: any) => ({
      id: booking.id,
      guest_name: booking.profiles ? `${booking.profiles.first_name} ${booking.profiles.last_name}` : 'Unknown',
      guest_email: booking.profiles?.email || '',
      property_title: booking.properties?.title || 'Unknown',
      property_city: booking.properties?.city || 'Unknown',
      departure_time: booking.check_out,
      outstanding_balance: booking.payment_status === 'paid' ? 0 : booking.total_price,
      damage_report: undefined,
      cleaning_status: 'pending',
      status: booking.status
    }))
  }

  // ============================================
  // GUEST PROFILES
  // ============================================

  static async getGuestProfiles(limit: number = 50): Promise<GuestProfile[]> {
    const { data, error } = await supabase
      .from('guest_profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return (data || []).map((guest: any) => ({
      id: guest.id,
      user_id: guest.user_id,
      phone: guest.phone,
      country: guest.country,
      city: guest.city,
      address: guest.address,
      preferred_language: guest.preferred_language || 'en',
      total_bookings: guest.total_bookings || 0,
      total_spending: guest.total_spending || 0,
      total_reviews: guest.total_reviews || 0,
      average_rating: guest.average_rating,
      id_verified: guest.id_verified || false,
      email_verified: guest.email_verified || false,
      phone_verified: guest.phone_verified || false,
      risk_score: guest.risk_score || 0,
      risk_flags: guest.risk_flags || [],
      created_at: guest.created_at,
      updated_at: guest.updated_at
    }))
  }

  static async getGuestProfileById(userId: string): Promise<GuestProfile | null> {
    const { data, error } = await supabase
      .from('guest_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) throw error

    if (!data) return null

    return {
      id: data.id,
      user_id: data.user_id,
      phone: data.phone,
      country: data.country,
      city: data.city,
      address: data.address,
      preferred_language: data.preferred_language || 'en',
      total_bookings: data.total_bookings || 0,
      total_spending: data.total_spending || 0,
      total_reviews: data.total_reviews || 0,
      average_rating: data.average_rating,
      id_verified: data.id_verified || false,
      email_verified: data.email_verified || false,
      phone_verified: data.phone_verified || false,
      risk_score: data.risk_score || 0,
      risk_flags: data.risk_flags || [],
      created_at: data.created_at,
      updated_at: data.updated_at
    }
  }

  static async getGuestKPIs(): Promise<GuestKPIs> {
    try {
      const today = new Date().toISOString().split('T')[0]

      // Total guests
      const { count: totalGuests, error: totalError } = await supabase
        .from('guest_profiles')
        .select('*', { count: 'exact', head: true })

      if (totalError) throw totalError

      // Guests staying today (checked_in)
      const { count: guestsStayingToday, error: stayingError } = await supabase
        .from('property_bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'checked_in')

      if (stayingError) throw stayingError

      // Arrivals today
      const { count: arrivalsToday, error: arrivalsError } = await supabase
        .from('property_bookings')
        .select('*', { count: 'exact', head: true })
        .eq('check_in', today)
        .in('status', ['confirmed', 'checked_in'])

      if (arrivalsError) throw arrivalsError

      // Departures today
      const { count: departuresToday, error: departuresError } = await supabase
        .from('property_bookings')
        .select('*', { count: 'exact', head: true })
        .eq('check_out', today)
        .in('status', ['checked_in', 'checked_out'])

      if (departuresError) throw departuresError

      // Repeat guests (total_bookings > 1)
      const { count: repeatGuests, error: repeatError } = await supabase
        .from('guest_profiles')
        .select('*', { count: 'exact', head: true })
        .gt('total_bookings', 1)

      if (repeatError) throw repeatError

      // Average guest rating
      const { data: ratingsData, error: ratingsError } = await supabase
        .from('guest_profiles')
        .select('average_rating')
        .not('average_rating', 'is', null)

      if (ratingsError) throw ratingsError

      const averageGuestRating = ratingsData && ratingsData.length > 0
        ? ratingsData.reduce((sum, g) => sum + (g.average_rating || 0), 0) / ratingsData.length
        : 0

      // Pending check-ins (confirmed with check_in today)
      const { count: pendingCheckIns, error: pendingCheckInsError } = await supabase
        .from('property_bookings')
        .select('*', { count: 'exact', head: true })
        .eq('check_in', today)
        .eq('status', 'confirmed')

      if (pendingCheckInsError) throw pendingCheckInsError

      // Pending check-outs (checked_in with check_out today)
      const { count: pendingCheckOuts, error: pendingCheckOutsError } = await supabase
        .from('property_bookings')
        .select('*', { count: 'exact', head: true })
        .eq('check_out', today)
        .eq('status', 'checked_in')

      if (pendingCheckOutsError) throw pendingCheckOutsError

      return {
        totalGuests: totalGuests || 0,
        guestsStayingToday: guestsStayingToday || 0,
        arrivalsToday: arrivalsToday || 0,
        departuresToday: departuresToday || 0,
        repeatGuests: repeatGuests || 0,
        averageGuestRating: Math.round(averageGuestRating * 10) / 10,
        pendingCheckIns: pendingCheckIns || 0,
        pendingCheckOuts: pendingCheckOuts || 0
      }
    } catch (error) {
      console.error('Error fetching guest KPIs:', error)
      return {
        totalGuests: 0,
        guestsStayingToday: 0,
        arrivalsToday: 0,
        departuresToday: 0,
        repeatGuests: 0,
        averageGuestRating: 0,
        pendingCheckIns: 0,
        pendingCheckOuts: 0
      }
    }
  }

  static async getGuestsWithBookings(
    status?: GuestStatus,
    guestType?: GuestType,
    paymentStatus?: PaymentStatus,
    nationality?: string,
    propertyId?: string,
    dateRange?: { start: string; end: string },
    limit: number = 50,
    offset: number = 0
  ): Promise<GuestWithBooking[]> {
    const today = new Date().toISOString().split('T')[0]

    let query = supabase
      .from('guest_profiles')
      .select(`
        *,
        profiles!user_id (
          first_name,
          last_name,
          email,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (guestType === 'new') {
      query = query.eq('total_bookings', 1)
    } else if (guestType === 'returning') {
      query = query.gt('total_bookings', 1)
    } else if (guestType === 'vip') {
      query = query.gte('total_spending', 5000)
    }

    const { data: guests, error: guestsError } = await query

    if (guestsError) throw guestsError

    const enhancedGuests = await Promise.all(
      (guests || []).map(async (guest: any) => {
        // Get current booking
        let currentBooking = null
        let bookingCount = guest.total_bookings || 0
        let totalNights = 0

        const { data: bookings } = await supabase
          .from('property_bookings')
          .select(`
            check_in,
            check_out,
            status,
            payment_status,
            properties (
              title,
              city
            )
          `)
          .eq('guest_id', guest.user_id)
          .in('status', ['confirmed', 'checked_in', 'checked_out'])
          .order('check_in', { ascending: false })
          .limit(1)

        if (bookings && bookings.length > 0) {
          const booking = bookings[0] as any
          const checkIn = new Date(booking.check_in)
          const checkOut = new Date(booking.check_out)
          const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
          totalNights = nights

          // Determine if this is current booking
          if (booking.status === 'checked_in' ||
              (booking.status === 'confirmed' && booking.check_in <= today && booking.check_out >= today)) {
            const properties = booking.properties as any
            currentBooking = {
              property_title: properties?.title || 'Unknown',
              property_city: properties?.city || 'Unknown',
              check_in: booking.check_in,
              check_out: booking.check_out,
              status: booking.status,
              payment_status: booking.payment_status
            }
          }
        }

        // Apply status filter
        if (status) {
          const guestStatus = this.determineGuestStatus(currentBooking, today)
          if (guestStatus !== status) return null
        }

        // Apply payment status filter
        if (paymentStatus && currentBooking) {
          if (currentBooking.payment_status !== paymentStatus) return null
        }

        // Apply nationality filter
        if (nationality && guest.country !== nationality) return null

        // Apply property filter
        if (propertyId && currentBooking) {
          // Would need to check property_id - skipping for now
        }

        return {
          id: guest.id,
          user_id: guest.user_id,
          phone: guest.phone || undefined,
          country: guest.country,
          city: guest.city,
          address: guest.address,
          preferred_language: guest.preferred_language || 'en',
          total_bookings: guest.total_bookings || 0,
          total_spending: guest.total_spending || 0,
          total_reviews: guest.total_reviews || 0,
          average_rating: guest.average_rating,
          id_verified: guest.id_verified || false,
          email_verified: guest.email_verified || false,
          phone_verified: guest.phone_verified || false,
          risk_score: guest.risk_score || 0,
          risk_flags: guest.risk_flags || [],
          created_at: guest.created_at,
          updated_at: guest.updated_at,
          first_name: guest.profiles?.first_name || '',
          last_name: guest.profiles?.last_name || '',
          email: guest.profiles?.email || '',
          current_booking: currentBooking,
          booking_count: bookingCount,
          total_nights: totalNights
        }
      })
    )

    return enhancedGuests.filter((g): g is NonNullable<typeof g> => g !== null) as GuestWithBooking[]
  }

  private static determineGuestStatus(currentBooking: any, today: string): GuestStatus {
    if (!currentBooking) return 'completed'

    if (currentBooking.status === 'checked_in') return 'staying'
    if (currentBooking.status === 'cancelled') return 'cancelled'
    if (currentBooking.check_in === today && currentBooking.status === 'confirmed') return 'arriving_today'
    if (currentBooking.check_out === today && currentBooking.status === 'checked_in') return 'checking_out_today'
    if (currentBooking.check_in > today) return 'upcoming'
    if (currentBooking.check_out < today) return 'completed'

    return 'completed'
  }

  static async getTodayGuestOperations() {
    const today = new Date().toISOString().split('T')[0]

    // Today's arrivals
    const { data: arrivals, error: arrivalsError } = await supabase
      .from('property_bookings')
      .select(`
        id,
        check_in,
        status,
        payment_status,
        profiles!guest_id (
          first_name,
          last_name,
          phone
        ),
        properties (
          title,
          city
        )
      `)
      .eq('check_in', today)
      .in('status', ['confirmed', 'checked_in'])
      .order('check_in', { ascending: true })

    if (arrivalsError) throw arrivalsError

    // Today's departures
    const { data: departures, error: departuresError } = await supabase
      .from('property_bookings')
      .select(`
        id,
        check_out,
        status,
        payment_status,
        total_price,
        profiles!guest_id (
          first_name,
          last_name
        ),
        properties (
          title,
          city
        )
      `)
      .eq('check_out', today)
      .in('status', ['checked_in', 'checked_out'])
      .order('check_out', { ascending: true })

    if (departuresError) throw departuresError

    // Late check-ins (past check_in time, still confirmed)
    const { data: lateCheckIns, error: lateCheckInsError } = await supabase
      .from('property_bookings')
      .select(`
        id,
        check_in,
        profiles!guest_id (
          first_name,
          last_name
        ),
        properties (
          title
        )
      `)
      .eq('check_in', today)
      .eq('status', 'confirmed')

    if (lateCheckInsError) throw lateCheckInsError

    // Late check-outs (past check_out time, still checked_in)
    const { data: lateCheckOuts, error: lateCheckOutsError } = await supabase
      .from('property_bookings')
      .select(`
        id,
        check_out,
        profiles!guest_id (
          first_name,
          last_name
        ),
        properties (
          title
        )
      `)
      .eq('check_out', today)
      .eq('status', 'checked_in')

    if (lateCheckOutsError) throw lateCheckOutsError

    // Guests awaiting payment
    const { data: awaitingPayment, error: paymentError } = await supabase
      .from('property_bookings')
      .select(`
        id,
        total_price,
        payment_status,
        profiles!guest_id (
          first_name,
          last_name
        ),
        properties (
          title
        )
      `)
      .in('payment_status', ['pending', 'partial'])
      .in('status', ['confirmed', 'checked_in'])

    if (paymentError) throw paymentError

    return {
      arrivals: (arrivals || []).map((b: any) => ({
        id: b.id,
        guest_name: `${b.profiles.first_name} ${b.profiles.last_name}`,
        guest_phone: b.profiles.phone,
        property_title: b.properties.title,
        property_city: b.properties.city,
        arrival_time: b.check_in,
        status: b.status,
        payment_status: b.payment_status
      })),
      departures: (departures || []).map((b: any) => ({
        id: b.id,
        guest_name: `${b.profiles.first_name} ${b.profiles.last_name}`,
        property_title: b.properties.title,
        property_city: b.properties.city,
        departure_time: b.check_out,
        outstanding_balance: b.payment_status === 'paid' ? 0 : b.total_price,
        status: b.status
      })),
      lateCheckIns: (lateCheckIns || []).map((b: any) => ({
        id: b.id,
        guest_name: `${b.profiles.first_name} ${b.profiles.last_name}`,
        property_title: b.properties.title,
        check_in: b.check_in
      })),
      lateCheckOuts: (lateCheckOuts || []).map((b: any) => ({
        id: b.id,
        guest_name: `${b.profiles.first_name} ${b.profiles.last_name}`,
        property_title: b.properties.title,
        check_out: b.check_out
      })),
      awaitingPayment: (awaitingPayment || []).map((b: any) => ({
        id: b.id,
        guest_name: `${b.profiles.first_name} ${b.profiles.last_name}`,
        property_title: b.properties.title,
        amount: b.total_price,
        payment_status: b.payment_status
      }))
    }
  }

  // ============================================
  // BOOKING CALENDAR
  // ============================================

  static async getBookingCalendarEvents(
    startDate: string,
    endDate: string,
    propertyId?: string
  ): Promise<BookingCalendarEvent[]> {
    let query = supabase
      .from('property_bookings')
      .select(`
        id,
        property_id,
        check_in,
        check_out,
        status,
        total_price,
        properties (
          title
        ),
        profiles!guest_id (
          first_name,
          last_name
        )
      `)
      .or(`check_in.gte.${startDate},check_out.lte.${endDate}`)
      .in('status', ['confirmed', 'checked_in', 'checked_out'])

    if (propertyId) {
      query = query.eq('property_id', propertyId)
    }

    const { data, error } = await query

    if (error) throw error

    return (data || []).map((booking: any) => ({
      id: booking.id,
      property_id: booking.property_id,
      property_title: booking.properties?.title || 'Unknown',
      start: booking.check_in,
      end: booking.check_out,
      status: booking.status === 'cancelled' ? 'available' : 'reserved',
      booking_id: booking.id,
      guest_name: booking.profiles ? `${booking.profiles.first_name} ${booking.profiles.last_name}` : undefined,
      price_override: booking.total_price
    }))
  }

  // ============================================
  // BOOKING PAYMENTS
  // ============================================

  static async getBookingPayments(
    status?: string,
    bookingId?: string
  ): Promise<BookingPayment[]> {
    let query = supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (bookingId) {
      query = query.eq('booking_id', bookingId)
    }

    const { data, error } = await query

    if (error) throw error

    return (data || []).map((payment: any) => ({
      id: payment.id,
      booking_id: payment.booking_id,
      property_id: payment.property_id,
      guest_id: payment.guest_id,
      host_id: payment.host_id,
      amount: payment.amount,
      currency: payment.currency,
      platform_commission: payment.platform_commission,
      host_payout: payment.host_payout,
      payment_method: payment.payment_method,
      payment_reference: payment.payment_reference,
      status: payment.status,
      processed_by: payment.processed_by,
      processed_at: payment.processed_at,
      created_at: payment.created_at
    }))
  }

  // ============================================
  // BOOKING MESSAGES
  // ============================================

  static async getBookingMessages(bookingId: string): Promise<BookingMessage[]> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        booking_id,
        sender_id,
        recipient_id,
        content,
        is_read,
        created_at,
        sender:profiles!sender_id (
          first_name,
          last_name
        ),
        recipient:profiles!recipient_id (
          first_name,
          last_name
        )
      `)
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true })

    if (error) throw error

    return (data || []).map((msg: any) => ({
      id: msg.id,
      booking_id: msg.booking_id,
      sender_id: msg.sender_id,
      sender_name: msg.sender ? `${msg.sender.first_name} ${msg.sender.last_name}` : 'Unknown',
      recipient_id: msg.recipient_id,
      recipient_name: msg.recipient ? `${msg.recipient.first_name} ${msg.recipient.last_name}` : 'Unknown',
      message: msg.content,
      is_read: msg.is_read,
      created_at: msg.created_at
    }))
  }

  // ============================================
  // BOOKING REVIEWS
  // ============================================

  static async getBookingReviews(propertyId?: string): Promise<BookingReview[]> {
    let query = supabase
      .from('property_reviews')
      .select(`
        id,
        booking_id,
        property_id,
        guest_id,
        rating,
        comment,
        host_reply,
        created_at,
        profiles!guest_id (
          first_name,
          last_name
        ),
        properties (
          owner_id
        )
      `)
      .order('created_at', { ascending: false })

    if (propertyId) {
      query = query.eq('property_id', propertyId)
    }

    const { data, error } = await query

    if (error) throw error

    return (data || []).map((review: any) => ({
      id: review.id,
      booking_id: review.booking_id,
      property_id: review.property_id,
      guest_id: review.guest_id,
      guest_name: review.profiles ? `${review.profiles.first_name} ${review.profiles.last_name}` : 'Unknown',
      host_id: review.properties?.owner_id || '',
      rating: review.rating,
      comment: review.comment,
      host_reply: review.host_reply,
      created_at: review.created_at
    }))
  }

  static async replyToReview(reviewId: string, reply: string): Promise<boolean> {
    const { error } = await supabase
      .from('property_reviews')
      .update({ host_reply: reply })
      .eq('id', reviewId)

    if (error) throw error
    return true
  }
}
