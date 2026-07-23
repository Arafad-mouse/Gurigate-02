import { supabase } from '@/lib/supabase';
import type { Tenant, TenantFormData, TenantStats, TenantListParams, PaymentStatus } from '@/types/tenant';

// Generate a valid UUID v4 for demo purposes
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export class TenantService {
  static async getTenants(params: TenantListParams = {}): Promise<{ items: Tenant[]; total: number }> {
    try {
      const { page = 1, pageSize = 5, building, status, search } = params;
      const start = (page - 1) * pageSize;

      let query = supabase
        .from('tenants')
        .select('*', { count: 'exact' });

      // Apply filters
      if (building && building !== 'All') {
        query = query.eq('building_id', building);
      }

      if (status && status !== 'All' && status !== undefined) {
        query = query.eq('payment_status', status);
      }

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%,unit_id.ilike.%${search}%`);
      }

      // Apply pagination
      const { data, count, error } = await query
        .range(start, start + pageSize - 1)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tenants:', error);
        throw new Error(error.message);
      }

      return {
        items: data || [],
        total: count || 0,
      };
    } catch (error) {
      console.error('TenantService.getTenants error:', error);
      throw error;
    }
  }

  static async getTenantById(id: string): Promise<Tenant> {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('TenantService.getTenantById error:', error);
      throw error;
    }
  }

  static async createTenant(formData: TenantFormData): Promise<Tenant> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      // For development/demo purposes, use null if not authenticated
      const userId = user?.id || null;

      const tenantData = {
        owner_id: userId,
        full_name: formData.full_name,
        phone: formData.phone,
        building_id: formData.building || null,
        unit_id: formData.unit || null,
        monthly_rent: formData.monthly_rent,
        payment_status: 'Pending' as PaymentStatus,
        lease_status: 'active' as const,
        next_due_date: formData.next_due_date,
        move_in_date: new Date().toISOString().split('T')[0],
      };

      const { data, error } = await supabase
        .from('tenants')
        .insert([tenantData])
        .select()
        .single();

      if (error) {
        console.error('Supabase createTenant error details:', error);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('TenantService.createTenant error:', error);
      throw error;
    }
  }

  static async updateTenantPaymentStatus(id: string, status: PaymentStatus): Promise<Tenant> {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .update({
          payment_status: status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('TenantService.updateTenantPaymentStatus error:', error);
      throw error;
    }
  }

  static async deleteTenant(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tenants')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('TenantService.deleteTenant error:', error);
      throw error;
    }
  }

  static async getTenantStats(): Promise<TenantStats> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      // For development/demo purposes, use null if not authenticated
      const userId = user?.id || null;

      // Get total tenants
      const totalQuery = supabase
        .from('tenants')
        .select('*', { count: 'exact', head: true });
      if (userId) totalQuery.eq('owner_id', userId);
      const { count: totalCount } = await totalQuery;

      // Get active leases
      const activeQuery = supabase
        .from('tenants')
        .select('*', { count: 'exact', head: true })
        .eq('lease_status', 'active');
      if (userId) activeQuery.eq('owner_id', userId);
      const { count: activeCount } = await activeQuery;

      // Get pending payments
      const pendingQuery = supabase
        .from('tenants')
        .select('*', { count: 'exact', head: true })
        .eq('payment_status', 'Pending');
      if (userId) pendingQuery.eq('owner_id', userId);
      const { count: pendingCount } = await pendingQuery;

      // Calculate occupancy rate (assuming total_tenants / max_units)
      // For now, we'll use active leases / total tenants
      const occupancyRate = totalCount ? Math.round((activeCount || 0) / totalCount * 100) : 0;

      return {
        total_tenants: totalCount || 0,
        active_leases: activeCount || 0,
        pending_payments: pendingCount || 0,
        occupancy_rate: occupancyRate,
      };
    } catch (error) {
      console.error('TenantService.getTenantStats error:', error);
      throw error;
    }
  }
}
