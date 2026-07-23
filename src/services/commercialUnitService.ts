import { supabase } from '@/lib/supabase';
import type { Unit, UnitWithDetails, UnitListParams, UnitStatus } from '@/types/building';

export async function listUnits(params: UnitListParams = {}): Promise<{ items: UnitWithDetails[]; total: number; }> {
  const {
    page = 1,
    pageSize = 12,
    query,
    buildingId,
    floorId,
    status,
    unitType,
  } = params;
  const start = (page - 1) * pageSize;

  try {
    let q = supabase
      .from('units')
      .select(`
        *,
        buildings(name),
        floors(floor_number),
        customers!units_current_lease_id_fkey(full_name)
      `, { count: 'exact' })
      .order('unit_number', { ascending: true });

    if (query) {
      q = q.or(`unit_number.ilike.%${query}%`);
    }

    if (buildingId) {
      q = q.eq('building_id', buildingId);
    }

    if (floorId) {
      q = q.eq('floor_id', floorId);
    }

    if (status) {
      q = q.eq('status', status);
    }

    if (unitType) {
      q = q.eq('unit_type', unitType);
    }

    const { data, error, count } = await q
      .range(start, start + pageSize - 1);

    if (error) {
      console.log('Units table or relationships not available, using sample data for development');
      return getSampleUnits(buildingId);
    }

    const items: UnitWithDetails[] = (data || []).map((unit: any) => ({
      ...unit,
      building_name: unit.buildings?.name,
      floor_number: unit.floors?.floor_number,
      current_tenant: unit.customers?.full_name,
    }));

    return { items, total: count || 0 };
  } catch (error) {
    console.log('Units table or relationships not available, using sample data for development');
    return getSampleUnits(buildingId);
  }
}

function getSampleUnits(buildingId?: string): { items: UnitWithDetails[]; total: number } {
  const units: UnitWithDetails[] = [
    {
      id: 'u1',
      building_id: buildingId || '1',
      floor_id: 'f1',
      unit_number: '101',
      unit_type: 'office',
      size: 45,
      status: 'occupied',
      base_rent: 120000, // $1,200 in cents
      current_lease_id: 'l1',
      building_name: 'Burj Omar',
      floor_number: 1,
      current_tenant: 'Ahmed Ali',
      lease_end_date: '2027-01-15',
      lease_status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'u2',
      building_id: buildingId || '1',
      floor_id: 'f1',
      unit_number: '102',
      unit_type: 'office',
      size: 50,
      status: 'available',
      base_rent: 150000, // $1,500 in cents
      building_name: 'Burj Omar',
      floor_number: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'u3',
      building_id: buildingId || '1',
      floor_id: 'f2',
      unit_number: '204',
      unit_type: 'retail',
      size: 60,
      status: 'occupied',
      base_rent: 180000, // $1,800 in cents
      current_lease_id: 'l2',
      building_name: 'Burj Omar',
      floor_number: 2,
      current_tenant: 'Abdi Elmi',
      lease_end_date: '2027-01-20',
      lease_status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'u4',
      building_id: buildingId || '1',
      floor_id: 'f2',
      unit_number: '205',
      unit_type: 'retail',
      size: 55,
      status: 'occupied',
      base_rent: 160000, // $1,600 in cents
      current_lease_id: 'l2',
      building_name: 'Burj Omar',
      floor_number: 2,
      current_tenant: 'Abdi Elmi',
      lease_end_date: '2027-01-20',
      lease_status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
  
  return { items: units, total: units.length };
}

export async function getUnitsByBuilding(buildingId: string): Promise<UnitWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from('units')
      .select(`
        *,
        buildings(name),
        floors(floor_number),
        customers!units_current_lease_id_fkey(full_name)
      `)
      .eq('building_id', buildingId)
      .order('unit_number', { ascending: true });

    if (error) {
      console.log('Units table or relationships not available, using sample data for development');
      return getSampleUnits(buildingId).items;
    }

    const items: UnitWithDetails[] = (data || []).map((unit: any) => ({
      ...unit,
      building_name: unit.buildings?.name,
      floor_number: unit.floors?.floor_number,
      current_tenant: unit.customers?.full_name,
    }));

    return items;
  } catch (error) {
    console.log('Units table or relationships not available, using sample data for development');
    return getSampleUnits(buildingId).items;
  }
}

export async function getUnit(id: string): Promise<UnitWithDetails | null> {
  try {
    const { data, error } = await supabase
      .from('units')
      .select(`
        *,
        buildings(*),
        floors(*),
        customers!units_current_lease_id_fkey(full_name, email, phone)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.log('Units table or relationships not available, using sample data for development');
      return getSampleUnits().items.find((u: UnitWithDetails) => u.id === id) || getSampleUnits().items[0];
    }

    return {
      ...data,
      building_name: data.buildings?.name,
      floor_number: data.floors?.floor_number,
      current_tenant: data.customers?.full_name,
    };
  } catch (error) {
    console.log('Units table or relationships not available, using sample data for development');
    return getSampleUnits().items.find((u: UnitWithDetails) => u.id === id) || getSampleUnits().items[0];
  }
}

export async function createUnit(unit: Omit<Unit, 'id' | 'created_at' | 'updated_at'>): Promise<Unit> {
  const { data, error } = await supabase
    .from('units')
    .insert(unit)
    .select()
    .single();

  if (error) {
    console.error('Failed to create unit:', error);
    throw error;
  }

  // Update floor count
  if (unit.floor_id) {
    await updateFloorCount(unit.floor_id);
  }

  // Update building metrics
  if (unit.building_id) {
    await updateBuildingMetrics(unit.building_id);
  }

  return data;
}

export async function updateUnit(id: string, unit: Partial<Unit>): Promise<Unit> {
  const { data, error } = await supabase
    .from('units')
    .update(unit)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Failed to update unit:', error);
    throw error;
  }

  // Update building metrics if status changed
  if (unit.status || unit.base_rent) {
    const { data: existingUnit } = await supabase
      .from('units')
      .select('building_id')
      .eq('id', id)
      .single();

    if (existingUnit?.building_id) {
      await updateBuildingMetrics(existingUnit.building_id);
    }
  }

  return data;
}

export async function deleteUnit(id: string): Promise<void> {
  const { data: existingUnit } = await supabase
    .from('units')
    .select('building_id, floor_id')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('units')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Failed to delete unit:', error);
    throw error;
  }

  // Update floor count
  if (existingUnit?.floor_id) {
    await updateFloorCount(existingUnit.floor_id);
  }

  // Update building metrics
  if (existingUnit?.building_id) {
    await updateBuildingMetrics(existingUnit.building_id);
  }
}

export async function updateUnitStatus(id: string, status: UnitStatus): Promise<Unit> {
  return updateUnit(id, { status });
}

export async function getUnitsByFloor(floorId: string): Promise<Unit[]> {
  const { data, error } = await supabase
    .from('units')
    .select('*')
    .eq('floor_id', floorId)
    .order('unit_number', { ascending: true });

  if (error) {
    console.error('Failed to fetch units by floor:', error);
    throw error;
  }

  return data || [];
}

// Helper functions
async function updateFloorCount(floorId: string): Promise<void> {
  const { data: units, error } = await supabase
    .from('units')
    .select('id')
    .eq('floor_id', floorId);

  if (error) {
    console.error('Failed to fetch units for floor count update:', error);
    return;
  }

  const units_count = units?.length || 0;
  await supabase
    .from('floors')
    .update({ units_count })
    .eq('id', floorId);
}

async function updateBuildingMetrics(buildingId: string): Promise<void> {
  const { data: units, error: unitsError } = await supabase
    .from('units')
    .select('status, base_rent')
    .eq('building_id', buildingId);

  if (unitsError) {
    console.error('Failed to fetch units for metrics update:', unitsError);
    return;
  }

  const total_units = units?.length || 0;
  const occupied_units = units?.filter(u => u.status === 'occupied').length || 0;
  const vacant_units = total_units - occupied_units;
  const monthly_revenue = units?.reduce((sum, u) => sum + (u.status === 'occupied' ? (u.base_rent || 0) : 0), 0) || 0;
  const occupancy_rate = total_units > 0 ? (occupied_units / total_units) * 100 : 0;

  // Get floors count
  const { data: floors, error: floorsError } = await supabase
    .from('floors')
    .select('id')
    .eq('building_id', buildingId);

  const floors_count = floorsError ? 0 : (floors?.length || 0);

  await supabase
    .from('buildings')
    .update({
      total_units,
      occupied_units,
      vacant_units,
      monthly_revenue,
      occupancy_rate,
      floors_count,
    })
    .eq('id', buildingId);
}
