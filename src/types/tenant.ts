export type PaymentStatus = 'Paid' | 'Pending' | 'Overdue';
export type LeaseStatus = 'active' | 'inactive' | 'terminated';

export interface Building {
  id: string;
  name: string;
}

export interface Floor {
  id: string;
  floor_number: number;
}

export interface Unit {
  id: string;
  room_number: string;
}

export interface Tenant {
  id: string;
  owner_id: string;
  property_id?: string;
  building_id?: string;
  floor_id?: string;
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
  // Joined relationships
  buildings?: Building;
  floors?: Floor;
  units?: Unit;
}

export interface TenantFormData {
  full_name: string;
  phone: string;
  building?: string;
  unit?: string;
  floor_id?: string;
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
  status?: PaymentStatus | 'All';
  search?: string;
}
