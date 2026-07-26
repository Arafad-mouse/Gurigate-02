import { supabase } from '@/lib/supabase';
import type { 
  Building, 
  Room, 
  BuildingFormData, 
  RoomFormData, 
  BuildingStats,
  BuildingListParams,
  RoomListParams,
  RoomWithDetails
} from '@/types/unit';

// Re-export types for convenience
export type { 
  Building, 
  Room, 
  BuildingFormData, 
  RoomFormData, 
  BuildingStats,
  BuildingListParams,
  RoomListParams,
  RoomWithDetails
};

// Building CRUD Operations
export async function getBuildings(params?: BuildingListParams) {
  const { page = 1, pageSize = 20, search, owner_id } = params || {};
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('buildings')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (owner_id) {
    query = query.eq('owner_id', owner_id);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%,address_line1.ilike.%${search}%`);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) throw error;
  return { buildings: data || [], total: count || 0 };
}

export async function getBuildingById(id: string) {
  const { data, error } = await supabase
    .from('buildings')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createBuilding(formData: BuildingFormData, ownerId: string) {
  const { data, error } = await supabase
    .from('buildings')
    .insert({
      ...formData,
      owner_id: ownerId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBuilding(id: string, formData: Partial<BuildingFormData>) {
  const { data, error } = await supabase
    .from('buildings')
    .update({
      ...formData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBuilding(id: string) {
  const { error } = await supabase
    .from('buildings')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getBuildingStats(buildingId: string): Promise<BuildingStats> {
  const { data: rooms, error } = await supabase
    .from('units')
    .select('status')
    .eq('building_id', buildingId);

  if (error) throw error;

  const total_units = rooms?.length || 0;
  const occupied_units = rooms?.filter((r: any) => r.status === 'occupied').length || 0;
  const vacant_units = rooms?.filter((r: any) => r.status === 'available').length || 0;
  const maintenance_units = rooms?.filter((r: any) => r.status === 'under_maintenance').length || 0;
  const occupancy_rate = total_units > 0 ? (occupied_units / total_units) * 100 : 0;

  return {
    total_units,
    occupied_units,
    vacant_units,
    maintenance_units,
    occupancy_rate,
  };
}

// Room CRUD Operations
export async function getRooms(params?: RoomListParams) {
  const { page = 1, pageSize = 20, building_id, floor_id, status, search } = params || {};
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('units')
    .select('*', { count: 'exact' })
    .order('unit_number', { ascending: true });

  if (building_id) {
    query = query.eq('building_id', building_id);
  }

  if (floor_id) {
    query = query.eq('floor_id', floor_id);
  }

  if (status) {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.ilike('unit_number', `%${search}%`);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) throw error;

  // Fetch building names separately since no FK relationship exists
  const buildingIds = [...new Set((data || []).map((r: any) => r.building_id).filter(Boolean))];
  let buildingMap: Record<string, any> = {};
  if (buildingIds.length > 0) {
    const { data: buildings } = await supabase
      .from('buildings')
      .select('id, name')
      .in('id', buildingIds);
    (buildings || []).forEach((b: any) => { buildingMap[b.id] = b; });
  }

  const roomsWithDetails: RoomWithDetails[] = (data || []).map((room: any) => ({
    ...room,
    building_name: buildingMap[room.building_id]?.name,
    room_type_name: undefined,
  }));

  return { rooms: roomsWithDetails, total: count || 0 };
}

export async function getRoomById(id: string) {
  const { data, error } = await supabase
    .from('units')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createRoom(formData: RoomFormData) {
  const { data, error } = await supabase
    .from('units')
    .insert(formData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateRoom(id: string, formData: Partial<RoomFormData>) {
  const { data, error } = await supabase
    .from('units')
    .update({
      ...formData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteRoom(id: string) {
  const { error } = await supabase
    .from('units')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function updateRoomStatus(id: string, status: 'available' | 'reserved' | 'occupied' | 'under_maintenance' | 'cleaning' | 'blocked') {
  const { data, error } = await supabase
    .from('units')
    .update({ 
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Room Type Operations
export async function getRoomTypes() {
  const { data, error } = await supabase
    .from('room_types')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getRoomTypeById(id: string) {
  const { data, error } = await supabase
    .from('room_types')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}
