// Commercial Property Management Types
// Unified types for building, floor, unit, and lease management

export type UnitStatus = 'available' | 'reserved' | 'occupied' | 'under_maintenance' | 'cleaning' | 'blocked';
export type UnitType = 'office' | 'retail' | 'warehouse' | 'restaurant' | 'other';

export interface Building {
  id: string;
  name: string;
  address: string;
  city: string;
  floors_count: number;
  total_units: number;
  occupied_units: number;
  vacant_units: number;
  monthly_revenue: number; // in cents
  occupancy_rate: number; // percentage
  created_at: string;
  updated_at: string;
}

export interface Floor {
  id: string;
  building_id: string;
  floor_number: number;
  units_count: number;
  created_at: string;
  updated_at: string;
}

export interface Unit {
  id: string;
  building_id: string;
  floor_id: string;
  unit_number: string;
  unit_type: UnitType;
  size: number; // in square meters
  status: UnitStatus;
  base_rent: number; // in cents
  current_lease_id?: string;
  created_at: string;
  updated_at: string;
}

export interface UnitWithDetails extends Unit {
  building_name?: string;
  floor_number?: number;
  current_tenant?: string;
  lease_end_date?: string;
  lease_status?: string;
}

export interface LeaseUnit {
  id: string;
  lease_id: string;
  unit_id: string;
  created_at: string;
}

export interface Lease {
  id: string;
  customer_id: string;
  start_date: string;
  end_date?: string;
  rent_cents: number;
  deposit_cents?: number;
  status: 'active' | 'expired' | 'terminated' | 'pending';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface LeaseWithDetails extends Lease {
  customer_name?: string;
  units?: UnitWithDetails[];
  building_name?: string;
}

export interface BuildingMetrics {
  total_buildings: number;
  total_units: number;
  occupied_units: number;
  vacant_units: number;
  monthly_revenue: number;
  occupancy_rate: number;
  expiring_leases: number;
  overdue_payments: number;
}

export interface BuildingListParams {
  page?: number;
  pageSize?: number;
  query?: string;
  city?: string;
}

export interface UnitListParams {
  page?: number;
  pageSize?: number;
  query?: string;
  buildingId?: string;
  floorId?: string;
  status?: UnitStatus;
  unitType?: UnitType;
}

export interface FloorListParams {
  buildingId?: string;
}

// Legacy RMS types (kept for backward compatibility)
// TODO: Migrate existing RMS code to use new unified types
export type LegacyUnitStatus = 'vacant' | 'reserved' | 'occupied' | 'maintenance' | 'inactive';

export interface LegacyBuilding {
  id: string;
  owner_id: string;
  organization_id?: string;
  name: string;
  description?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LegacyRoom {
  id: string;
  building_id: string;
  room_type_id?: string;
  room_number: string;
  floor?: number;
  status: LegacyUnitStatus;
  square_feet?: number;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LegacyRoomType {
  id: string;
  name: string;
  description?: string;
  base_capacity: number;
  max_capacity: number;
  base_price: number;
  created_at: string;
  updated_at: string;
}
