import { supabase } from '@/lib/supabase';
import type { Building, BuildingListParams, BuildingMetrics } from '@/types/building';

// Sample buildings for development when database tables don't exist
let sampleBuildingsData: Building[] = [
  {
    id: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
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
    id: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q',
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
    id: '3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r',
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
    
    // Recalculate metrics for each building to ensure they're up to date
    if (data && data.length > 0) {
      for (const building of data) {
        try {
          await updateBuildingMetrics(building.id);
        } catch (error) {
          console.error(`Failed to update metrics for building ${building.id}:`, error);
        }
      }
      
      // Fetch updated buildings data
      const { data: updatedData, error: updateError } = await supabase
        .from('buildings')
        .select('*')
        .order('created_at', { ascending: false })
        .range(start, start + pageSize - 1);

      if (!updateError && updatedData) {
        console.log('Buildings metrics updated:', updatedData);
        return { items: updatedData, total: updatedData.length };
      }
    }
    
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

    // Recalculate metrics to ensure they're up to date
    await updateBuildingMetrics(id);
    
    // Fetch updated building data
    const { data: updatedData, error: updateError } = await supabase
      .from('buildings')
      .select('*')
      .eq('id', id)
      .single();

    if (updateError) {
      console.log('Failed to fetch updated building data, returning original');
      return data;
    }

    return updatedData;
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
  try {
    // Get property counts from properties table
    const { data: properties, error: propError } = await supabase
      .from('properties')
      .select('id, status, is_approved')
      .is('deleted_at', null);

    if (propError) throw propError;

    const totalProperties = properties?.length || 0;
    const activeProperties = properties?.filter((p: any) => p.status === 'active' && p.is_approved).length || 0;

    // Get this month's revenue from completed transactions
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const { data: monthlyTxns, error: monthlyTxnError } = await supabase
      .from('transactions')
      .select('amount, transaction_type')
      .eq('status', 'completed')
      .gte('created_at', startOfMonth)
      .is('deleted_at', null);

    if (monthlyTxnError) throw monthlyTxnError;

    const monthlyRevenue = (monthlyTxns || []).reduce((sum: number, t: any) => {
      if (t.transaction_type === 'refund' || t.transaction_type === 'dispute_resolution') {
        return sum - (t.amount || 0);
      }
      return sum + (t.amount || 0);
    }, 0);

    // Get active bookings count (occupied units)
    const { data: activeBookings, error: bookingError } = await supabase
      .from('property_bookings')
      .select('id, status')
      .in('status', ['confirmed', 'checked_in']);

    if (bookingError) throw bookingError;

    const occupiedUnits = activeBookings?.length || 0;
    const vacantUnits = Math.max(0, totalProperties - occupiedUnits);
    const occupancyRate = totalProperties > 0 ? Math.round((occupiedUnits / totalProperties) * 100) : 0;

    // Get expiring leases (within next 30 days)
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    let expiringLeases = 0;
    try {
      const { data: leases, error: leaseError } = await supabase
        .from('leases')
        .select('id')
        .eq('status', 'active')
        .lte('end_date', thirtyDaysFromNow);

      if (!leaseError) {
        expiringLeases = leases?.length || 0;
      }
    } catch {
      // leases table may not exist
    }

    // Get overdue payments (pending transactions older than 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    let overduePayments = 0;
    try {
      const { data: overdueTxns, error: overdueError } = await supabase
        .from('transactions')
        .select('id')
        .eq('status', 'pending')
        .lt('created_at', sevenDaysAgo)
        .is('deleted_at', null);

      if (!overdueError) {
        overduePayments = overdueTxns?.length || 0;
      }
    } catch {
      // transactions table may not exist
    }

    return {
      total_buildings: totalProperties,
      total_units: totalProperties,
      occupied_units: occupiedUnits,
      vacant_units: vacantUnits,
      monthly_revenue: Math.round(monthlyRevenue * 100),
      occupancy_rate: occupancyRate,
      expiring_leases: expiringLeases,
      overdue_payments: overduePayments,
    };
  } catch (error) {
    console.error('Failed to fetch building metrics:', error);
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
}

// ── Dashboard Transaction Type ────────────────────────────────────────────────
export interface DashboardTransaction {
  id: string;
  name: string;
  type: string;
  txn: string;
  customer: string;
  date: string;
  status: string;
  amount: number;
  avatar: string;
  color: string;
}

const TXN_COLORS = ['#E8344E', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899'];

function getAvatarFromName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export async function getDashboardTransactions(limit: number = 10): Promise<DashboardTransaction[]> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        id,
        amount,
        currency,
        transaction_type,
        status,
        created_at,
        property:properties(id, title, type),
        guest:profiles!transactions_guest_id_fkey(id, first_name, last_name, email)
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map((t: any, index: number) => {
      const customerName = t.guest
        ? `${t.guest.first_name || ''} ${t.guest.last_name || ''}`.trim() || t.guest.email || 'Unknown'
        : 'Unknown';
      return {
        id: t.id,
        name: t.property?.title || 'Unknown Property',
        type: t.property?.type || 'N/A',
        txn: (t.transaction_type || 'N/A').replace(/_/g, ' '),
        customer: customerName,
        date: new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: (t.status || 'pending').toUpperCase(),
        amount: t.amount || 0,
        avatar: getAvatarFromName(customerName),
        color: TXN_COLORS[index % TXN_COLORS.length],
      };
    });
  } catch (error) {
    console.error('Failed to fetch dashboard transactions:', error);
    return [];
  }
}

// ── Sales Analytics ───────────────────────────────────────────────────────────
export interface SalesAnalyticsData {
  month: string;
  income: number;
  expenses: number;
}

export async function getSalesAnalytics(): Promise<SalesAnalyticsData[]> {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  try {
    const twelveMonthsAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from('transactions')
      .select('amount, transaction_type, status, created_at')
      .eq('status', 'completed')
      .is('deleted_at', null)
      .gte('created_at', twelveMonthsAgo)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const monthlyData: Record<string, { income: number; expenses: number }> = {};
    monthNames.forEach(m => { monthlyData[m] = { income: 0, expenses: 0 }; });

    (data || []).forEach((t: any) => {
      const date = new Date(t.created_at);
      const monthKey = monthNames[date.getMonth()];
      if (t.transaction_type === 'refund' || t.transaction_type === 'dispute_resolution') {
        monthlyData[monthKey].expenses += t.amount || 0;
      } else {
        monthlyData[monthKey].income += t.amount || 0;
      }
    });

    return monthNames.map(month => ({
      month,
      income: Math.round(monthlyData[month].income),
      expenses: Math.round(monthlyData[month].expenses),
    }));
  } catch (error) {
    console.error('Failed to fetch sales analytics:', error);
    return monthNames.map(month => ({ month, income: 0, expenses: 0 }));
  }
}

// ── Dashboard Expenses (re-exported from centralized expenseService) ──────────
export type { DashboardExpense } from '@/services/expenseService';
export { getDashboardExpenses } from '@/services/expenseService';

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
  const occupied_units = units?.filter((u: any) => u.status === 'occupied').length || 0;
  const vacant_units = units?.filter((u: any) => u.status === 'available').length || 0;
  const monthly_revenue = units?.reduce((sum: number, u: any) => sum + (u.status === 'occupied' ? (u.base_rent || 0) : 0), 0) || 0;
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
