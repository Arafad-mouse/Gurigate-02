// Unit types for Manage Property (RMS) module

export type UnitStatus = 'vacant' | 'reserved' | 'occupied' | 'maintenance' | 'inactive';

export interface Building {
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

export interface Room {
  id: string;
  building_id: string;
  room_type_id?: string;
  room_number: string;
  floor?: number;
  status: UnitStatus;
  square_feet?: number;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface RoomType {
  id: string;
  name: string;
  description?: string;
  base_capacity: number;
  max_capacity: number;
  base_price: number;
  created_at: string;
  updated_at: string;
}

export interface BuildingFormData {
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
}

export interface RoomFormData {
  building_id: string;
  room_type_id?: string;
  room_number: string;
  floor?: number;
  status: UnitStatus;
  square_feet?: number;
}

export interface BuildingStats {
  total_units: number;
  occupied_units: number;
  vacant_units: number;
  maintenance_units: number;
  occupancy_rate: number;
}

export interface RoomWithDetails extends Room {
  building_name?: string;
  room_type_name?: string;
  current_customer?: string;
  current_lease?: string;
}

export interface BuildingListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  owner_id?: string;
}

export interface RoomListParams {
  page?: number;
  pageSize?: number;
  building_id?: string;
  status?: UnitStatus;
  search?: string;
}
