/**
 * Customer Repository
 *
 * This repository handles all database operations for the customer module.
 * It follows the layered architecture: Page → Hook → Service → Repository → Supabase → Database
 *
 * Architecture Decision: Customer is a CRM layer that links to Profile via profile_id
 * Relationship model: Customer → Profile → Bookings → Contracts → Payments
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
} from '@/integrations/supabase/types_utf8';

// Type aliases for convenience
type Customer = Tables<'customers'>;
type CustomerInsert = TablesInsert<'customers'>;
type CustomerUpdate = TablesUpdate<'customers'>;
type Profile = Tables<'profiles'>;
type Booking = Tables<'bookings'>;
type Payment = Tables<'payments'>;
type Contract = Tables<'contracts'>;

/**
 * Customer with profile information (joined view)
 */
export interface CustomerWithProfile extends Customer {
  profile: Profile | null;
}

/**
 * Customer metrics for dashboard
 */
export interface CustomerMetrics {
  id: string;
  profile_id: string;
  user_name: string | null;
  customer_type: Database['public']['Enums']['customer_type'];
  lifecycle_status: Database['public']['Enums']['lifecycle_status'];
  total_bookings: number;
  total_rent_paid: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

/**
 * Customer with booking history
 */
export interface CustomerWithBookings extends CustomerWithProfile {
  bookings: Booking[];
}

/**
 * Customer with payment history
 */
export interface CustomerWithPayments extends CustomerWithProfile {
  payments: Payment[];
}

/**
 * Customer with contract history
 */
export interface CustomerWithContracts extends CustomerWithProfile {
  contracts: Contract[];
}

/**
 * Customer repository class
 */
export class CustomerRepository {
  /**
   * Get all customers with pagination
   */
  async listCustomers(options: {
    page?: number;
    pageSize?: number;
    lifecycleStatus?: Database['public']['Enums']['lifecycle_status'];
    customerType?: Database['public']['Enums']['customer_type'];
  } = {}): Promise<{ data: CustomerWithProfile[]; count: number }> {
    const { page = 1, pageSize = 20, lifecycleStatus, customerType } = options;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('customers')
      .select('*, profiles(*)', { count: 'exact' })
      .is('deleted_at', null)
      .range(from, to)
      .order('created_at', { ascending: false });

    if (lifecycleStatus) {
      query = query.eq('lifecycle_status', lifecycleStatus);
    }

    if (customerType) {
      query = query.eq('customer_type', customerType);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to list customers: ${error.message}`);
    }

    return {
      data: (data as CustomerWithProfile[]) || [],
      count: count || 0,
    };
  }

  /**
   * Get customer by ID with profile
   */
  async getCustomerById(id: string): Promise<CustomerWithProfile | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*, profiles(*)')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to get customer: ${error.message}`);
    }

    return data as CustomerWithProfile;
  }

  /**
   * Get customer by profile ID
   */
  async getCustomerByProfileId(profileId: string): Promise<CustomerWithProfile | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*, profiles(*)')
      .eq('profile_id', profileId)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to get customer by profile: ${error.message}`);
    }

    return data as CustomerWithProfile;
  }

  /**
   * Create a new customer
   */
  async createCustomer(customer: CustomerInsert): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create customer: ${error.message}`);
    }

    return data;
  }

  /**
   * Update a customer
   */
  async updateCustomer(id: string, updates: CustomerUpdate): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update customer: ${error.message}`);
    }

    return data;
  }

  /**
   * Soft delete a customer
   */
  async deleteCustomer(id: string, deletedBy: string): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: deletedBy,
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete customer: ${error.message}`);
    }
  }

  /**
   * Get customer bookings
   */
  async getCustomerBookings(customerId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get customer bookings: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get customer payments
   */
  async getCustomerPayments(customerId: string): Promise<Payment[]> {
    // Get bookings for this customer
    const bookings = await this.getCustomerBookings(customerId);
    const bookingIds = bookings.map(b => b.id);

    if (bookingIds.length === 0) {
      return [];
    }

    // Get payments for these bookings
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .in('reference_id', bookingIds)
      .eq('reference_type', 'booking')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get customer payments: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get customer contracts
   */
  async getCustomerContracts(customerId: string): Promise<Contract[]> {
    // Get bookings for this customer
    const bookings = await this.getCustomerBookings(customerId);
    const bookingIds = bookings.map(b => b.id);

    if (bookingIds.length === 0) {
      return [];
    }

    // Get contracts for these bookings
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .in('booking_id', bookingIds)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get customer contracts: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get customer metrics from view
   */
  async getCustomerMetrics(customerId: string): Promise<CustomerMetrics | null> {
    const customer = await this.getCustomerById(customerId);
    
    if (!customer) {
      return null;
    }

    const bookings = await this.getCustomerBookings(customerId);

    return {
      id: customer.id,
      profile_id: customer.profile_id,
      user_name: customer.profile?.full_name || null,
      customer_type: customer.customer_type,
      lifecycle_status: customer.lifecycle_status,
      total_bookings: bookings.length,
      total_rent_paid: customer.total_rent_paid || 0,
      currency: customer.currency || 'USD',
      created_at: customer.created_at,
      updated_at: customer.updated_at,
    };
  }

  /**
   * Search customers by name
   */
  async searchCustomers(query: string, options: {
    page?: number;
    pageSize?: number;
  } = {}): Promise<{ data: CustomerWithProfile[]; count: number }> {
    const { page = 1, pageSize = 20 } = options;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('customers')
      .select('*, profiles(*)', { count: 'exact' })
      .or(`profiles.full_name.ilike.%${query}%`)
      .is('deleted_at', null)
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to search customers: ${error.message}`);
    }

    return {
      data: (data as CustomerWithProfile[]) || [],
      count: count || 0,
    };
  }

  /**
   * Update customer lifecycle status
   */
  async updateLifecycleStatus(
    id: string,
    status: Database['public']['Enums']['lifecycle_status']
  ): Promise<Customer> {
    return this.updateCustomer(id, { lifecycle_status: status });
  }

  /**
   * Update customer type
   */
  async updateCustomerType(
    id: string,
    type: Database['public']['Enums']['customer_type']
  ): Promise<Customer> {
    return this.updateCustomer(id, { customer_type: type });
  }

  /**
   * Update customer metrics (called after booking/payment)
   */
  async updateCustomerMetrics(
    id: string,
    metrics: {
      total_bookings?: number;
      total_rent_paid?: number;
      last_activity_at?: string;
    }
  ): Promise<Customer> {
    return this.updateCustomer(id, metrics);
  }
}

// Export singleton instance
export const customerRepository = new CustomerRepository();
