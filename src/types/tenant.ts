export type PaymentStatus = 'Paid' | 'Pending' | 'Overdue';
export type LeaseStatus = 'active' | 'inactive' | 'terminated';

export interface Tenant {
  id: string;
  owner_id: string;
  property_id?: string;
  building_id?: string;
  unit_id?: string;
  full_name: string;
  phone: string;
  monthly_rent: number;
  payment_status: PaymentStatus;
  lease_status: LeaseStatus;
  next_due_date: string;
  move_in_date: string;
  created_at: string;
  updated_at: string;
}

export interface TenantFormData {
  full_name: string;
  phone: string;
  building?: string;
  unit?: string;
  monthly_rent: number;
  next_due_date: string;
  rooms?: number;
}

export interface TenantStats {
  total_tenants: number;
  active_leases: number;
  pending_payments: number;
  occupancy_rate: number;
}

export interface TenantListParams {
  page?: number;
  pageSize?: number;
  building?: string;
  status?: PaymentStatus;
  search?: string;
}
