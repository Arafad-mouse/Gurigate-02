import { supabase } from '@/lib/supabase';
import type { Floor, FloorListParams } from '@/types/building';

export async function listFloors(params: FloorListParams = {}): Promise<Floor[]> {
  const { buildingId } = params;

  try {
    let q = supabase
      .from('floors')
      .select('*')
      .order('floor_number', { ascending: true });

    if (buildingId) {
      q = q.eq('building_id', buildingId);
    }

    const { data, error } = await q;

    if (error) {
      console.log('Floors table not available, using sample data for development');
      return getSampleFloors(buildingId);
    }

    return data || [];
  } catch (error) {
    console.log('Floors table not available, using sample data for development');
    return getSampleFloors(buildingId);
  }
}

function getSampleFloors(buildingId?: string): Floor[] {
  const floors: Floor[] = [
    { id: 'f1', building_id: buildingId || '1', floor_number: 1, units_count: 10, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'f2', building_id: buildingId || '1', floor_number: 2, units_count: 10, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'f3', building_id: buildingId || '1', floor_number: 3, units_count: 10, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'f4', building_id: buildingId || '1', floor_number: 4, units_count: 10, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ];
  return floors;
}

export async function getFloor(id: string): Promise<Floor | null> {
  const { data, error } = await supabase
    .from('floors')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Failed to fetch floor:', error);
    return null;
  }

  return data;
}

export async function createFloor(floor: Omit<Floor, 'id' | 'created_at' | 'updated_at'>): Promise<Floor> {
  const { data, error } = await supabase
    .from('floors')
    .insert(floor)
    .select()
    .single();

  if (error) {
    console.error('Failed to create floor:', error);
    throw error;
  }

  return data;
}

export async function updateFloor(id: string, floor: Partial<Floor>): Promise<Floor> {
  const { data, error } = await supabase
    .from('floors')
    .update(floor)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Failed to update floor:', error);
    throw error;
  }

  return data;
}

export async function deleteFloor(id: string): Promise<void> {
  const { error } = await supabase
    .from('floors')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Failed to delete floor:', error);
    throw error;
  }
}

export async function updateFloorCount(floorId: string): Promise<void> {
  const { data: units, error } = await supabase
    .from('units')
    .select('id')
    .eq('floor_id', floorId);

  if (error) {
    console.error('Failed to fetch units for floor count update:', error);
    return;
  }

  const units_count = units?.length || 0;
  await updateFloor(floorId, { units_count });
}
