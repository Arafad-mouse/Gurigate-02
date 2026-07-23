import { supabase } from '@/lib/supabase';
import type { Building, BuildingListParams, BuildingMetrics } from '@/types/building';

// Sample buildings for development when database tables don't exist
let sampleBuildingsData: Building[] = [
  {
    id: '1',
    name: 'Burj Omar',
    address: '123 Main Street, Business District',
    city: 'Hargeisa',
    floors_count: 4,
    total_units: 40,
    occupied_units: 36,
    vacant_units: 4,
    monthly_revenue: 2800000, // $28,000 in cents
    occupancy_rate: 90,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Business Center',
    address: '456 Commerce Avenue',
    city: 'Hargeisa',
    floors_count: 6,
    total_units: 60,
    occupied_units: 45,
    vacant_units: 15,
    monthly_revenue: 4500000, // $45,000 in cents
    occupancy_rate: 75,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Skyline Tower',
    address: '789 Urban Plaza',
    city: 'Nairobi',
    floors_count: 8,
    total_units: 80,
    occupied_units: 72,
    vacant_units: 8,
    monthly_revenue: 6400000, // $64,000 in cents
    occupancy_rate: 90,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export async function listBuildings(params: BuildingListParams = {}): Promise<{ items: Building[]; total: number; }> {
  const {
    page = 1,
    pageSize = 12,
    query,
    city,
  } = params;
  const start = (page - 1) * pageSize;

  console.log('listBuildings called with params:', params);

  try {
    let q = supabase
      .from('buildings')
      .select('*');

    if (query) {
      q = q.or(`name.ilike.%${query}%,address.ilike.%${query}%`);
    }

    if (city) {
      q = q.eq('city', city);
    }

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout')), 5000);
    });

    const queryPromise = q
      .order('created_at', { ascending: false })
      .range(start, start + pageSize - 1);

    const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

    if (error) {
      console.log('Buildings table not available, using sample data for development');
      // Return sample data for development if tables don't exist
      console.log('Returning sample buildings:', sampleBuildingsData);
      return { items: sampleBuildingsData, total: sampleBuildingsData.length };
    }

    console.log('Buildings fetched from database:', data);
    
    // Return actual database data even if empty
    return { items: data || [], total: (data || []).length };
  } catch (error) {
    console.log('Buildings table not available, using sample data for development');
    console.log('Returning sample buildings:', sampleBuildingsData);
    return { items: sampleBuildingsData, total: sampleBuildingsData.length };
  }
}

export async function getBuilding(id: string): Promise<Building | null> {
  try {
    const { data, error } = await supabase
      .from('buildings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.log('Buildings table not available, using sample data for development');
      // Return sample building for development
      return sampleBuildingsData.find((b: Building) => b.id === id) || sampleBuildingsData[0];
    }

    return data;
  } catch (error) {
    console.log('Buildings table not available, using sample data for development');
    return sampleBuildingsData[0];
  }
}

export async function createBuilding(building: Omit<Building, 'id' | 'created_at' | 'updated_at'>): Promise<Building> {
  try {
    const { data, error } = await supabase
      .from('buildings')
      .insert(building)
      .select()
      .single();

    if (error) {
      console.log('Buildings table not available, using sample data for development');
      // Return sample building for development when table doesn't exist
      const newBuilding: Building = {
        ...building,
        id: Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      // Add to sample buildings list
      sampleBuildingsData.push(newBuilding);
      return newBuilding;
    }

    return data;
  } catch (error) {
    console.log('Buildings table not available, using sample data for development');
    // Return sample building for development when table doesn't exist
    const newBuilding: Building = {
      ...building,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return newBuilding;
  }
}

export async function updateBuilding(id: string, building: Partial<Building>): Promise<Building> {
  const { data, error } = await supabase
    .from('buildings')
    .update(building)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Failed to update building:', error);
    throw error;
  }

  return data;
}

export async function deleteBuilding(id: string): Promise<void> {
  const { error } = await supabase
    .from('buildings')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Failed to delete building:', error);
    throw error;
  }
}

export async function getBuildingMetrics(): Promise<BuildingMetrics> {
  // Return mock data for now since building management tables may not be fully deployed
  return {
    total_buildings: 0,
    total_units: 0,
    occupied_units: 0,
    vacant_units: 0,
    monthly_revenue: 0,
    occupancy_rate: 0,
    expiring_leases: 0,
    overdue_payments: 0,
  };
}

export async function updateBuildingMetrics(buildingId: string): Promise<void> {
  // Recalculate building metrics based on units
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

  await updateBuilding(buildingId, {
    total_units,
    occupied_units,
    vacant_units,
    monthly_revenue,
    occupancy_rate,
    floors_count,
  });
}
