import { supabase } from '@/lib/supabase'

// Dashboard KPIs
export interface DashboardKPIs {
  totalProperties: number
  pendingApprovals: number
  activeBookings: number
  totalRevenue: number
  totalUsers: number
  totalHosts: number
  pendingPayments: number
  residentialCount: number
  commercialCount: number
  landCount: number
  hospitalityCount: number
}

// Property interfaces
export interface AdminProperty {
  id: string
  title: string
  type: string
  city: string
  price: number
  currency: string
  approval_status: 'draft' | 'pending' | 'approved' | 'rejected' | 'suspended'
  status: string
  owner_name: string
  owner_email: string
  images: string[]
  is_featured: boolean
  approved_by?: string
  approved_at?: string
  rejection_reason?: string
  deleted_at?: string
  deleted_by?: string
  created_at: string
  property_category?: 'residential' | 'commercial' | 'land' | 'hospitality'
}

// Booking interfaces
export interface AdminBooking {
  id: string
  guest_name: string
  guest_email: string
  property_title: string
  property_city: string
  check_in: string
  check_out: string
  total_price: number
  currency: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  dispute_status: 'none' | 'open' | 'resolved' | 'escalated'
  guest_count: number
  admin_note?: string
  created_at: string
}

// Payment interfaces
export interface AdminPayment {
  id: string
  booking_id: string
  amount: number
  currency: string
  payment_provider: 'dodo' | 'zaad' | 'edahab' | 'wallet'
  payment_method: string
  status: 'pending' | 'submitted' | 'under_review' | 'verified' | 'failed' | 'refunded' | 'completed'
  proof_image?: string
  wallet_phone?: string
  guest_name: string
  guest_email: string
  property_title: string
  created_at: string
  verified_at?: string
  verified_by?: string
  deleted_at?: string
  deleted_by?: string
}

// User interfaces
export interface AdminUser {
  id: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  avatar_url: string | null
  role: 'guest' | 'host' | 'manager' | 'admin' | 'super_admin'
  is_banned: boolean
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected' | 'suspended'
  banned_reason: string | null
  permissions: Record<string, boolean>
  host_rating?: number
  host_response_rate?: number
  host_response_time?: number
  host_completed_bookings: number
  risk_flags: string[]
  created_by_admin?: string
  updated_by_admin?: string
  deleted_at?: string
  deleted_by?: string
  created_at: string
  properties_count?: number
  bookings_count?: number
}

export class AdminService {
  // Dashboard
  static async getDashboardKPIs(): Promise<DashboardKPIs> {
    try {
      // Get total properties and category breakdown
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('property_category')
        .is('deleted_at', null)

      if (propertiesError) throw propertiesError

      const totalProperties = propertiesData.length
      const residentialCount = propertiesData.filter(p => p.property_category === 'residential').length
      const commercialCount = propertiesData.filter(p => p.property_category === 'commercial').length
      const landCount = propertiesData.filter(p => p.property_category === 'land').length
      const hospitalityCount = propertiesData.filter(p => p.property_category === 'hospitality').length

      // Get pending approvals
      const { count: pendingApprovals, error: pendingError } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('approval_status', 'pending')
        .is('deleted_at', null)

      if (pendingError) throw pendingError

      // Get total users
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)

      if (usersError) throw usersError

      // Get total hosts
      const { count: totalHosts, error: hostsError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'host')
        .is('deleted_at', null)

      if (hostsError) throw hostsError

      // Get active bookings
      const { count: activeBookings, error: bookingsError } = await supabase
        .from('property_bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'confirmed')

      if (bookingsError) throw bookingsError

      // Get pending payments
      const { count: pendingPayments, error: paymentsError } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'submitted'])

      if (paymentsError) throw paymentsError

      // Get total revenue (sum of confirmed bookings)
      const { data: revenueData, error: revenueError } = await supabase
        .from('property_bookings')
        .select('total_price')
        .eq('status', 'confirmed')

      if (revenueError) throw revenueError

      const totalRevenue = revenueData.reduce((sum, booking) => sum + (booking.total_price || 0), 0)

      return {
        totalProperties,
        pendingApprovals: pendingApprovals || 0,
        activeBookings: activeBookings || 0,
        totalRevenue,
        totalUsers: totalUsers || 0,
        totalHosts: totalHosts || 0,
        pendingPayments: pendingPayments || 0,
        residentialCount,
        commercialCount,
        landCount,
        hospitalityCount,
      }
    } catch (error) {
      console.error('Error fetching dashboard KPIs:', error)
      // Return zeros on error
      return {
        totalProperties: 0,
        pendingApprovals: 0,
        activeBookings: 0,
        totalRevenue: 0,
        totalUsers: 0,
        totalHosts: 0,
        pendingPayments: 0,
        residentialCount: 0,
        commercialCount: 0,
        landCount: 0,
        hospitalityCount: 0,
      }
    }
  }

  // Properties
  static async getPendingProperties(): Promise<AdminProperty[]> {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        id,
        title,
        type,
        city,
        price,
        currency,
        approval_status,
        status,
        is_featured,
        approved_by,
        approved_at,
        rejection_reason,
        deleted_at,
        deleted_by,
        created_at,
        property_category,
        property_images (image_url),
        profiles!owner_id (
          first_name,
          last_name,
          email
        )
      `)
      .eq('approval_status', 'pending')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data.map((property: any) => ({
      id: property.id,
      title: property.title,
      type: property.type,
      city: property.city,
      price: property.price,
      currency: property.currency,
      approval_status: property.approval_status,
      status: property.status || 'available',
      owner_name: property.profiles?.first_name + ' ' + property.profiles?.last_name || 'Unknown',
      owner_email: property.profiles?.email || '',
      images: property.property_images?.map((img: any) => img.image_url) || [],
      is_featured: property.is_featured || false,
      approved_by: property.approved_by,
      approved_at: property.approved_at,
      rejection_reason: property.rejection_reason,
      deleted_at: property.deleted_at,
      deleted_by: property.deleted_by,
      created_at: property.created_at,
      property_category: property.property_category,
    }))
  }

  static async getAllProperties(status?: string): Promise<AdminProperty[]> {
    let query = supabase
      .from('properties')
      .select(`
        id,
        title,
        type,
        city,
        price,
        currency,
        approval_status,
        status,
        is_featured,
        approved_by,
        approved_at,
        rejection_reason,
        deleted_at,
        deleted_by,
        created_at,
        property_category,
        property_images (image_url),
        profiles!owner_id (
          first_name,
          last_name,
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('approval_status', status)
    }

    const { data, error } = await query

    if (error) throw error

    return data.map((property: any) => ({
      id: property.id,
      title: property.title,
      type: property.type,
      city: property.city,
      price: property.price,
      currency: property.currency,
      approval_status: property.approval_status,
      status: property.status || 'available',
      owner_name: property.profiles?.first_name + ' ' + property.profiles?.last_name || 'Unknown',
      owner_email: property.profiles?.email || '',
      images: property.property_images?.map((img: any) => img.image_url) || [],
      is_featured: property.is_featured || false,
      approved_by: property.approved_by,
      approved_at: property.approved_at,
      rejection_reason: property.rejection_reason,
      deleted_at: property.deleted_at,
      deleted_by: property.deleted_by,
      created_at: property.created_at,
      property_category: property.property_category,
    }))
  }

  static async approveProperty(propertyId: string, adminId: string, note?: string): Promise<boolean> {
    const { error } = await supabase.rpc('approve_property', {
      p_property_id: propertyId,
      p_admin_id: adminId,
      p_note: note || null
    })

    if (error) throw error
    return true
  }

  static async rejectProperty(propertyId: string, adminId: string, reason: string): Promise<boolean> {
    const { error } = await supabase.rpc('reject_property', {
      p_property_id: propertyId,
      p_admin_id: adminId,
      p_reason: reason
    })

    if (error) throw error
    return true
  }

  static async suspendProperty(propertyId: string, adminId: string, reason: string): Promise<boolean> {
    const { error } = await supabase.rpc('suspend_property', {
      p_property_id: propertyId,
      p_admin_id: adminId,
      p_reason: reason
    })

    if (error) throw error
    return true
  }

  static async featureProperty(propertyId: string, adminId: string, note?: string): Promise<boolean> {
    const { error } = await supabase.rpc('feature_property', {
      p_property_id: propertyId,
      p_admin_id: adminId,
      p_note: note || null
    })

    if (error) throw error
    return true
  }

  static async unfeatureProperty(propertyId: string, adminId: string, note?: string): Promise<boolean> {
    const { error } = await supabase.rpc('unfeature_property', {
      p_property_id: propertyId,
      p_admin_id: adminId,
      p_note: note || null
    })

    if (error) throw error
    return true
  }

  static async getPropertiesByStatus(status: 'draft' | 'pending' | 'approved' | 'rejected' | 'suspended'): Promise<AdminProperty[]> {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        id,
        title,
        type,
        city,
        price,
        currency,
        approval_status,
        status,
        is_featured,
        approved_by,
        approved_at,
        rejection_reason,
        deleted_at,
        deleted_by,
        created_at,
        property_category,
        property_images (image_url),
        profiles!owner_id (
          first_name,
          last_name,
          email
        )
      `)
      .eq('approval_status', status)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data.map((property: any) => ({
      id: property.id,
      title: property.title,
      type: property.type,
      city: property.city,
      price: property.price,
      currency: property.currency,
      approval_status: property.approval_status,
      status: property.status || 'available',
      owner_name: property.profiles?.first_name + ' ' + property.profiles?.last_name || 'Unknown',
      owner_email: property.profiles?.email || '',
      images: property.property_images?.map((img: any) => img.image_url) || [],
      is_featured: property.is_featured || false,
      approved_by: property.approved_by,
      approved_at: property.approved_at,
      rejection_reason: property.rejection_reason,
      deleted_at: property.deleted_at,
      deleted_by: property.deleted_by,
      created_at: property.created_at,
      property_category: property.property_category,
    }))
  }

  static async getPropertyModerationHistory(propertyId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('admin_activity_logs')
      .select(`
        id,
        action_type,
        metadata,
        created_at,
        profiles!admin_id (
          first_name,
          last_name,
          email
        )
      `)
      .eq('target_type', 'property')
      .eq('target_id', propertyId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data.map((log: any) => ({
      id: log.id,
      action_type: log.action_type,
      metadata: log.metadata,
      created_at: log.created_at,
      admin_name: log.profiles?.first_name + ' ' + log.profiles?.last_name || 'Unknown',
      admin_email: log.profiles?.email || ''
    }))
  }

  // Bookings
  static async getAllBookings(status?: string): Promise<AdminBooking[]> {
    let query = supabase
      .from('property_bookings')
      .select(`
        id,
        check_in,
        check_out,
        total_price,
        currency,
        status,
        dispute_status,
        guest_count,
        admin_note,
        created_at,
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
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error

    return data.map((booking: any) => ({
      id: booking.id,
      guest_name: booking.profiles?.first_name + ' ' + booking.profiles?.last_name || 'Unknown',
      guest_email: booking.profiles?.email || '',
      property_title: booking.properties?.title || 'Unknown',
      property_city: booking.properties?.city || 'Unknown',
      check_in: booking.check_in,
      check_out: booking.check_out,
      total_price: booking.total_price,
      currency: booking.currency,
      status: booking.status,
      dispute_status: booking.dispute_status || 'none',
      guest_count: booking.guest_count,
      admin_note: booking.admin_note,
      created_at: booking.created_at
    }))
  }

  static async cancelBooking(bookingId: string, reason: string): Promise<boolean> {
    const { error } = await supabase
      .from('property_bookings')
      .update({
        status: 'cancelled',
        admin_note: reason
      })
      .eq('id', bookingId)

    if (error) throw error
    return true
  }

  static async resolveDispute(bookingId: string, resolution: string): Promise<boolean> {
    const { error } = await supabase
      .from('property_bookings')
      .update({
        dispute_status: 'resolved',
        admin_note: resolution
      })
      .eq('id', bookingId)

    if (error) throw error
    return true
  }

  static async addAdminNote(bookingId: string, note: string): Promise<boolean> {
    const { error } = await supabase
      .from('property_bookings')
      .update({
        admin_note: note
      })
      .eq('id', bookingId)

    if (error) throw error
    return true
  }

  // Payments
  static async getPendingPayments(): Promise<AdminPayment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        id,
        booking_id,
        amount,
        currency,
        payment_provider,
        payment_method,
        status,
        proof_image,
        wallet_phone,
        created_at,
        verified_at,
        property_bookings (
          profiles!guest_id (
            first_name,
            last_name,
            email
          ),
          properties (
            title
          )
        )
      `)
      .in('status', ['pending', 'submitted'])
      .order('created_at', { ascending: false })

    if (error) throw error

    return data.map((payment: any) => ({
      id: payment.id,
      booking_id: payment.booking_id,
      amount: payment.amount,
      currency: payment.currency,
      payment_provider: payment.payment_provider,
      payment_method: payment.payment_method,
      status: payment.status,
      proof_image: payment.proof_image,
      wallet_phone: payment.wallet_phone,
      guest_name: payment.property_bookings?.profiles?.first_name + ' ' + payment.property_bookings?.profiles?.last_name || 'Unknown',
      guest_email: payment.property_bookings?.profiles?.email || '',
      property_title: payment.property_bookings?.properties?.title || 'Unknown',
      created_at: payment.created_at,
      verified_at: payment.verified_at
    }))
  }

  static async getAllPayments(status?: string): Promise<AdminPayment[]> {
    let query = supabase
      .from('payments')
      .select(`
        id,
        booking_id,
        amount,
        currency,
        payment_provider,
        payment_method,
        status,
        proof_image,
        wallet_phone,
        created_at,
        verified_at,
        property_bookings (
          profiles!guest_id (
            first_name,
            last_name,
            email
          ),
          properties (
            title
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error

    return data.map((payment: any) => ({
      id: payment.id,
      booking_id: payment.booking_id,
      amount: payment.amount,
      currency: payment.currency,
      payment_provider: payment.payment_provider,
      payment_method: payment.payment_method,
      status: payment.status,
      proof_image: payment.proof_image,
      wallet_phone: payment.wallet_phone,
      guest_name: payment.property_bookings?.profiles?.first_name + ' ' + payment.property_bookings?.profiles?.last_name || 'Unknown',
      guest_email: payment.property_bookings?.profiles?.email || '',
      property_title: payment.property_bookings?.properties?.title || 'Unknown',
      created_at: payment.created_at,
      verified_at: payment.verified_at
    }))
  }

  static async verifyPayment(paymentId: string, adminId: string): Promise<boolean> {
    const { error } = await supabase.rpc('verify_payment', {
      p_payment_id: paymentId,
      p_admin_id: adminId
    })

    if (error) throw error
    return true
  }

  static async rejectPayment(paymentId: string, reason: string): Promise<boolean> {
    const { error } = await supabase
      .from('payments')
      .update({
        status: 'failed',
        admin_note: reason
      })
      .eq('id', paymentId)

    if (error) throw error
    return true
  }

  // Users
  static async getAllUsers(role?: string): Promise<AdminUser[]> {
    let query = supabase
      .from('profiles')
      .select(`
        id,
        email,
        first_name,
        last_name,
        full_name,
        avatar_url,
        role,
        is_banned,
        verification_status,
        banned_reason,
        permissions,
        host_rating,
        host_response_rate,
        host_response_time,
        host_completed_bookings,
        risk_flags,
        created_by_admin,
        updated_by_admin,
        deleted_at,
        deleted_by,
        created_at,
        properties!owner_id (count)
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (role && role !== 'all') {
      query = query.eq('role', role)
    }

    const { data, error } = await query

    if (error) throw error

    return data.map((user: any) => ({
      id: user.id,
      email: user.email || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      full_name: user.full_name || '',
      avatar_url: user.avatar_url,
      role: user.role,
      is_banned: user.is_banned || false,
      verification_status: user.verification_status || 'unverified',
      banned_reason: user.banned_reason,
      permissions: user.permissions || {},
      host_rating: user.host_rating,
      host_response_rate: user.host_response_rate,
      host_response_time: user.host_response_time,
      host_completed_bookings: user.host_completed_bookings || 0,
      risk_flags: user.risk_flags || [],
      created_by_admin: user.created_by_admin,
      updated_by_admin: user.updated_by_admin,
      deleted_at: user.deleted_at,
      deleted_by: user.deleted_by,
      properties_count: user.properties?.[0]?.count || 0,
      bookings_count: 0, // Will be calculated separately
      created_at: user.created_at
    }))
  }

  static async banUser(userId: string, adminId: string, reason: string): Promise<boolean> {
    const { error } = await supabase.rpc('ban_user', {
      p_user_id: userId,
      p_admin_id: adminId,
      p_reason: reason
    })

    if (error) throw error
    return true
  }

  static async unbanUser(userId: string): Promise<boolean> {
    const { error } = await supabase.rpc('unban_user', {
      p_user_id: userId
    })

    if (error) throw error
    return true
  }

  static async verifyHost(userId: string, adminId: string): Promise<boolean> {
    const { error } = await supabase.rpc('verify_host', {
      p_user_id: userId,
      p_admin_id: adminId
    })

    if (error) throw error
    return true
  }
}
