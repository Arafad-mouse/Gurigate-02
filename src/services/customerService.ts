import type { Customer, CustomerMetrics, CustomerType, LifecycleStatus, VerificationStatus, BookingSummary, PaymentSummary, ContractSummary, PropertySummary, TimelineEvent, CustomerListParams } from '@/types/customer';
import { supabase } from '@/lib/supabase';

// Backward-compatible alias for existing callers
export interface ListParams extends CustomerListParams {}

interface CustomerRow {
  id: string;
  profile_id: string | null;
  customer_type: CustomerType;
  lifecycle_status: LifecycleStatus;
  verification_status?: VerificationStatus;
  current_property_id?: string;
  notes?: string;
  tags?: string[];
  total_bookings?: number;
  total_rent_paid?: number;
  last_activity_at?: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
  // Optional name columns for customers without profiles
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  profiles?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    national_id?: string | null;
    avatar_url?: string | null;
    verification_status?: VerificationStatus | null;
  } | null;
}

interface ContractRow {
  id: string;
  customer_id: string;
  property_id: string;
  start_date: string;
  end_date?: string | null;
  monthly_rent_cents?: number;
  status: 'active' | 'expired' | 'pending';
  properties?: { id: string; title: string } | null;
}

interface PaymentRow {
  id: string;
  customer_id?: string;
  profile_id?: string;
  amount_cents?: number;
  amount?: number;
  payment_date?: string;
  paid_at?: string;
  method?: string;
  type?: 'rent' | 'deposit' | 'other';
  status?: string;
}

// Dev-only failure injection using ?fail=overview|bookings|payments|contracts|properties|timeline
function shouldFail(kind: 'overview'|'bookings'|'payments'|'contracts'|'properties'|'timeline'): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const sp = new URLSearchParams(window.location.search);
    return sp.get('fail') === kind;
  } catch { return false; }
}

function computeOutstandingBalance(customer: Customer, activeContract?: ContractSummary, payments: PaymentSummary[] = []): number {
  if (!activeContract?.rentCents) return customer.outstandingBalance || 0;
  const totalPaid = payments.reduce((sum, p) => sum + (p.amountCents || 0), 0) + (customer.totalRentPaid || 0);
  // Simple outstanding = expected rent to-date minus total paid (mock simplification)
  return Math.max(0, activeContract.rentCents - totalPaid);
}

// Map raw customer row (with joined profile/property data) to domain Customer
function mapCustomer(c: CustomerRow): Customer {
  // Use profile data if available, otherwise use direct customer columns
  const profile = c.profiles;
  const firstName = profile?.first_name || c.first_name || '';
  const lastName = profile?.last_name || c.last_name || '';
  const fullName = profile?.full_name || c.full_name || `${firstName} ${lastName}`.trim() || 'Unknown';
  const email = profile?.email || c.email || null;
  const phone = profile?.phone || c.phone || '';
  const nationalId = profile?.national_id || undefined;
  const avatarUrl = profile?.avatar_url || null;
  const verificationStatus = (profile?.verification_status || c.verification_status || 'unverified') as VerificationStatus;
  // Building name is fetched separately in computeCustomerMetrics
  // Set to undefined initially so computeCustomerMetrics will fetch the name
  const currentPropertyName = undefined;

  return {
    id: c.id,
    profileId: c.profile_id || '',
    firstName,
    lastName,
    fullName,
    email,
    phone,
    nationalId,
    avatarUrl,
    customerType: c.customer_type,
    lifecycleStatus: c.lifecycle_status,
    verificationStatus,
    currentProperty: currentPropertyName,
    propertyId: c.current_property_id,
    currentFloor: (c as any).current_floor || undefined,
    currentUnit: (c as any).current_unit || undefined,
    totalBookings: c.total_bookings || 0,
    totalRentPaid: Math.round((c.total_rent_paid || 0) * 100),
    outstandingBalance: 0, // computed below via joins
    notes: c.notes,
    tags: c.tags || [],
    lastActivityAt: c.last_activity_at || c.updated_at || c.created_at,
    createdAt: c.created_at,
  };
}

async function fetchContractSummary(customerId: string): Promise<ContractSummary | undefined> {
  // Contracts table doesn't exist in RMS - return undefined
  return undefined;
}

async function fetchPaymentsSummary(customerId: string): Promise<{ totalPaid: number; lastPayment?: PaymentSummary }> {
  try {
    // Payments table is for bookings, not RMS customer leases
    // Return empty for now - RMS will need its own payment tracking
    return { totalPaid: 0 };
  } catch (e) {
    console.warn('Payments table not available:', e);
    return { totalPaid: 0 };
  }
}

async function computeCustomerMetrics(customer: Customer): Promise<CustomerMetrics> {
  const activeContract = await fetchContractSummary(customer.id);
  const { totalPaid, lastPayment } = await fetchPaymentsSummary(customer.id);
  const totalRentPaid = customer.totalRentPaid || totalPaid;
  const outstandingBalance = activeContract?.rentCents
    ? Math.max(0, activeContract.rentCents - totalRentPaid)
    : (customer.outstandingBalance || 0);

  // Fetch building name if customer has current_property_id (RMS uses buildings)
  let currentPropertyName = customer.currentProperty;
  if (customer.propertyId) {
    try {
      const { data: building } = await supabase
        .from('buildings')
        .select('name')
        .eq('id', customer.propertyId)
        .single();
      if (building) {
        currentPropertyName = building.name;
      }
    } catch (e) {
      // Ignore error, building might not exist
    }
  }

  return {
    totalBookings: customer.totalBookings || 0,
    totalRentPaid,
    outstandingBalance,
    activeContract,
    lastPayment,
    currentProperty: currentPropertyName ? { id: customer.propertyId || '', name: currentPropertyName } : undefined,
  };
}

// ----- Service API ------------------------------------------------------------
export async function listCustomers(params: ListParams = {}): Promise<{ items: Customer[]; total: number; }>{
  const {
    query='',
    type='all',
    lifecycle='all',
    paymentStatus='all',
    propertyId='',
    sort='newest',
    page=1,
    pageSize=12,
    dateFrom,
    dateTo,
  } = params;
  const start = (page-1)*pageSize;

  try {
    // Select customers joined with profiles
    // Building name is fetched separately in computeCustomerMetrics since foreign key now points to buildings
    let q = supabase
      .from('customers')
      .select('*, first_name, last_name, full_name, email, phone, profiles!customers_profile_id_fkey(first_name, last_name, email, phone)', { count: 'exact' });

    if (query) {
      q = q.or(`full_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`, { foreignTable: 'profiles' });
    }

    if (type !== 'all') q = q.eq('customer_type', type);
    if (lifecycle !== 'all') q = q.eq('lifecycle_status', lifecycle);
    if (propertyId) q = q.eq('current_property_id', propertyId);
    if (dateFrom) q = q.gte('created_at', dateFrom);
    if (dateTo) q = q.lte('created_at', dateTo);

    const { data, count, error } = await q
      .range(start, start + pageSize - 1)
      .order('created_at', { ascending: sort !== 'newest' });

    if (error) {
      console.error('Database query error:', error);
      throw new Error(`Failed to fetch customers: ${error.message}`);
    }

    const rows = (data || []) as CustomerRow[];
    const items: Customer[] = rows.map(mapCustomer);

    // Always compute outstanding balance for KPI display and fetch building name
    await Promise.all(items.map(async (c) => {
      const metrics = await computeCustomerMetrics(c);
      c.outstandingBalance = metrics.outstandingBalance;
      c.totalRentPaid = metrics.totalRentPaid;
      if (metrics.currentProperty) {
        c.currentProperty = metrics.currentProperty.name;
      }
    }));

    // Sort by it if requested (fallback to in-memory sort)
    if (sort === 'outstanding' || sort === 'name_asc' || sort === 'name_desc' || sort === 'last_active' || paymentStatus !== 'all') {
      if (sort === 'outstanding') {
        items.sort((a, b) => b.outstandingBalance - a.outstandingBalance);
      } else if (sort === 'name_asc') {
        items.sort((a, b) => a.fullName.localeCompare(b.fullName));
      } else if (sort === 'name_desc') {
        items.sort((a, b) => b.fullName.localeCompare(a.fullName));
      } else if (sort === 'last_active') {
        items.sort((a, b) => new Date(b.lastActivityAt || b.createdAt).getTime() - new Date(a.lastActivityAt || a.createdAt).getTime());
      }
      if (paymentStatus !== 'all') {
        const filteredItems = paymentStatus === 'overdue'
          ? items.filter(c => c.outstandingBalance > 0)
          : items.filter(c => (paymentStatus === 'paid') === (c.outstandingBalance === 0));
        return { items: filteredItems.slice(start, start + pageSize), total: filteredItems.length };
      }
    }

    return { items, total: count || 0 };
  } catch (error) {
    console.error('Failed to fetch customers:', error);
    throw error;
  }
}

export async function getCustomer(id: string): Promise<Customer>{
  const { data, error } = await supabase
    .from('customers')
    .select('*, profiles!customers_profile_id_fkey(first_name, last_name, email, phone), properties!customers_current_property_id_fkey(id,title)')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Failed to fetch customer:', error);
    throw new Error(`Failed to fetch customer: ${error.message}`);
  }

  if (!data) {
    throw new Error('Customer not found');
  }

  return mapCustomer(data as CustomerRow);
}

export async function getCustomerOverview(id: string): Promise<{ customer: Customer; metrics: CustomerMetrics }>{
  if (shouldFail('overview')) throw new Error('Injected failure (overview)');
  const customer = await getCustomer(id);
  const metrics = await computeCustomerMetrics(customer);
  customer.outstandingBalance = metrics.outstandingBalance;
  customer.totalRentPaid = metrics.totalRentPaid;
  return { customer, metrics };
}

export async function getCustomerBookings(id: string, page=1, pageSize=10): Promise<{ items: BookingSummary[]; total: number; }>{
  if (shouldFail('bookings')) throw new Error('Injected failure (bookings)');
  const total = 8;
  const items: BookingSummary[] = Array.from({ length: Math.min(pageSize, total - (page-1)*pageSize) }).map((_, i)=>({
    id: `b-${id}-${i+1}`,
    property: 'Kilimani Heights • A-304',
    from: new Date(Date.now() - (i+10)*86400000).toISOString(),
    to: new Date(Date.now() - (i+7)*86400000).toISOString(),
    status: ['confirmed','completed','cancelled'][i%3],
    totalCents: 45000 + i*2000,
  }));
  return Promise.resolve({ items, total });
}

export async function getCustomerPayments(id: string, page=1, pageSize=10): Promise<{ items: PaymentSummary[]; total: number; lastPayment?: PaymentSummary; }>{
  if (shouldFail('payments')) throw new Error('Injected failure (payments)');
  const total = 6;
  const items: PaymentSummary[] = Array.from({ length: Math.min(pageSize, total - (page-1)*pageSize) }).map((_, i)=>({
    id: `p-${id}-${i+1}`,
    date: new Date(Date.now() - (i+5)*86400000).toISOString(),
    amountCents: 50000,
    method: 'card',
    type: 'rent',
  }));
  return Promise.resolve({ items, total, lastPayment: items[0] });
}

export async function getCustomerContracts(id: string, page=1, pageSize=10): Promise<{ items: ContractSummary[]; total: number; active?: ContractSummary; }>{
  if (shouldFail('contracts')) throw new Error('Injected failure (contracts)');
  const total = 2;
  const items: ContractSummary[] = Array.from({ length: Math.min(pageSize, total - (page-1)*pageSize) }).map((_, i)=>({
    id: `c-${id}-${i+1}`,
    property: 'Kilimani Heights • A-304',
    startDate: new Date(Date.now() - (180-i*60)*86400000).toISOString(),
    endDate: i===0? undefined : new Date(Date.now() - (120-i*30)*86400000).toISOString(),
    status: i===0? 'active' : 'expired',
    rentCents: 80000,
  }));
  return Promise.resolve({ items, total, active: items.find(x=>x.status==='active') });
}

export async function getCustomerProperties(id: string, _page=1, _pageSize=10): Promise<{ items: PropertySummary[]; total: number; }>{
  if (shouldFail('properties')) throw new Error('Injected failure (properties)');
  const total = 1;
  const items: PropertySummary[] = [{ id:`prop-${id}`, name:'Kilimani Heights', unit:'A-304' }];
  return Promise.resolve({ items, total });
}

// Timeline aggregates mock events from other domains for now
export async function getCustomerTimeline(id: string): Promise<TimelineEvent[]>{
  if (shouldFail('timeline')) throw new Error('Injected failure (timeline)');
  const base: TimelineEvent[] = [
    { id:`ev-${id}-0`, type:'customer_registered', title:'Customer Registered', timestamp: new Date(Date.now()-120*86400000).toISOString() },
  ];
  const bookings = (await getCustomerBookings(id)).items.slice(0,2).map((b,i)=>({
    id:`ev-${id}-b${i}`, type: b.status==='confirmed'?'booking_confirmed':'booking_created', title:`Booking ${b.status}`, timestamp: b.from,
  })) as TimelineEvent[];
  const payments = (await getCustomerPayments(id)).items.slice(0,2).map((p,i)=>({
    id:`ev-${id}-p${i}`, type: 'payment_submitted', title:`Payment ${p.amountCents/100}`, timestamp: p.date,
  })) as TimelineEvent[];
  const contracts = (await getCustomerContracts(id)).items.slice(0,1).map((c,i)=>({
    id:`ev-${id}-c${i}`, type: 'contract_created', title:`Contract for ${c.property}`, timestamp: c.startDate,
  })) as TimelineEvent[];
  return [...base, ...bookings, ...payments, ...contracts].sort((a,b)=> a.timestamp < b.timestamp ? 1 : -1);
}

// ----- KPI Dashboard Metrics --------------------------------------------------
export async function getCustomerDashboardMetrics(): Promise<{ totalCustomers:number; activeTenants:number; activeGuests:number; activeBuyers:number; monthlyRevenue:number; overdueAccounts:number; }>{
  const { data, error } = await supabase
    .from('customers')
    .select('customer_type, lifecycle_status, total_rent_paid, total_bookings, current_property_id');

  if (error) {
    console.error('Database metrics error:', error);
    throw new Error(`Failed to fetch customer metrics: ${error.message}`);
  }

  const rows = data as any[];
  const totalCustomers = rows.length;
  const activeTenants = rows.filter((c: any) => c.customer_type === 'tenant' && c.lifecycle_status === 'active').length;
  const activeGuests = rows.filter((c: any) => c.customer_type === 'guest' && c.lifecycle_status === 'active').length;
  const activeBuyers = rows.filter((c: any) => c.customer_type === 'buyer' && c.lifecycle_status === 'active').length;
  const monthlyRevenue = rows.reduce((sum: number, c: any) => sum + (c.total_rent_paid || 0), 0);
  const overdueAccounts = rows.filter((c: any) => c.lifecycle_status === 'suspended').length;
  return { totalCustomers, activeTenants, activeGuests, activeBuyers, monthlyRevenue, overdueAccounts };
}

// ----- Realtime Placeholders --------------------------------------------------
export function subscribeToCustomer(_customerId: string, _cb: (evt: unknown)=>void): ()=>void {
  // placeholder for Supabase Realtime; return unsubscribe fn
  return () => {};
}
export function subscribeToPayments(_customerId: string, _cb: (evt: unknown)=>void): ()=>void {
  return () => {};
}
export function subscribeToBookings(_customerId: string, _cb: (evt: unknown)=>void): ()=>void {
  return () => {};
}

// ----- Action placeholders (mutations) ---------------------------------------
export interface CreateCustomerInput {
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  nationalId?: string | null;
  customerType: CustomerType;
  lifecycleStatus: LifecycleStatus;
  verificationStatus?: VerificationStatus;
  propertyId?: string | null;
  notes?: string | null;
  tags?: string[];
}

export interface UpdateCustomerInput {
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  nationalId?: string | null;
  customerType: CustomerType;
  lifecycleStatus: LifecycleStatus;
  verificationStatus?: VerificationStatus;
  propertyId?: string | null;
  notes?: string | null;
  tags?: string[];
}

export async function createCustomer(data: CreateCustomerInput): Promise<Customer> {
  try {
    const fullName = `${data.firstName} ${data.lastName}`.trim();

    // Create the customer record directly without profile
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .insert([
        {
          profile_id: null, // No profile for manually created customers
          first_name: data.firstName,
          last_name: data.lastName,
          full_name: fullName,
          email: data.email,
          phone: data.phone,
          customer_type: data.customerType,
          lifecycle_status: data.lifecycleStatus,
          current_property_id: data.propertyId || null,
          notes: data.notes || null,
          tags: data.tags || [],
          total_bookings: 0,
          total_rent_paid: 0,
          last_activity_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select(`
        *,
        properties (
          id,
          title
        )
      `)
      .single();

    if (customerError) {
      console.error('Failed to create customer:', customerError);
      throw new Error(`Failed to create customer: ${customerError.message}`);
    }

    if (!customerData) {
      throw new Error('No data returned from customer creation');
    }

    return {
      id: customerData.id,
      profileId: customerData.profile_id || '',
      firstName: data.firstName,
      lastName: data.lastName,
      fullName: fullName,
      email: data.email,
      phone: data.phone,
      nationalId: data.nationalId || undefined,
      avatarUrl: null,
      customerType: customerData.customer_type,
      lifecycleStatus: customerData.lifecycle_status,
      verificationStatus: customerData.verification_status || 'unverified',
      currentProperty: customerData.properties?.title || undefined,
      propertyId: customerData.current_property_id || undefined,
      notes: customerData.notes || undefined,
      tags: customerData.tags || [],
      totalBookings: customerData.total_bookings || 0,
      totalRentPaid: customerData.total_rent_paid || 0,
      outstandingBalance: customerData.outstanding_balance || 0,
      lastActivityAt: customerData.last_activity_at || '',
      createdAt: customerData.created_at,
    };
  } catch (error) {
    console.error('Failed to create customer:', error);
    throw error;
  }
}

export async function updateCustomer(customerId: string, data: UpdateCustomerInput): Promise<Customer> {
  try {
    const fullName = `${data.firstName} ${data.lastName}`.trim();

    // Update customer record
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .update({
        first_name: data.firstName,
        last_name: data.lastName,
        full_name: fullName,
        email: data.email,
        phone: data.phone,
        customer_type: data.customerType,
        lifecycle_status: data.lifecycleStatus,
        current_property_id: data.propertyId || null,
        notes: data.notes || null,
        tags: data.tags,
        last_activity_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', customerId)
      .select(`
        *,
        properties (
          id,
          title
        )
      `)
      .single();

    if (customerError) {
      console.error('Failed to update customer:', customerError);
      throw new Error(`Failed to update customer: ${customerError.message}`);
    }

    if (!customerData) {
      throw new Error('No data returned from customer update');
    }

    return {
      id: customerData.id,
      profileId: customerData.profile_id || '',
      firstName: data.firstName,
      lastName: data.lastName,
      fullName: fullName,
      email: data.email,
      phone: data.phone,
      nationalId: data.nationalId || undefined,
      avatarUrl: null,
      customerType: customerData.customer_type,
      lifecycleStatus: customerData.lifecycle_status,
      verificationStatus: customerData.verification_status || 'unverified',
      currentProperty: customerData.properties?.title || undefined,
      propertyId: customerData.current_property_id || undefined,
      notes: customerData.notes || undefined,
      tags: customerData.tags || [],
      totalBookings: customerData.total_bookings || 0,
      totalRentPaid: customerData.total_rent_paid || 0,
      outstandingBalance: 0,
      lastActivityAt: customerData.last_activity_at || '',
      createdAt: customerData.created_at,
    };
  } catch (error) {
    console.error('Failed to update customer:', error);
    throw error;
  }
}

export async function sendMessage(customerId: string, payload: { text: string }): Promise<{ ok: true }>{
  console.log('sendMessage(mock)', { customerId, payload });
  return { ok: true };
}

export async function assignProperty(customerId: string, propertyId: string): Promise<{ ok: true }>{
  console.log('assignProperty(mock)', { customerId, propertyId });
  return { ok: true };
}

export async function createContract(customerId: string, data: { propertyId: string; startDate: string; endDate?: string; rentCents?: number }): Promise<{ ok: true; contractId: string }>{
  console.log('createContract(mock)', { customerId, data });
  return { ok: true, contractId: 'ctr-mock' };
}

export async function suspendCustomer(customerId: string, reason?: string): Promise<Customer>{
  const { data, error } = await supabase
    .from('customers')
    .update({
      lifecycle_status: 'suspended',
      notes: reason || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', customerId)
    .select('*')
    .single();

  if (error) {
    console.error('Failed to suspend customer:', error);
    throw new Error(`Failed to suspend customer: ${error.message}`);
  }

  if (!data) {
    throw new Error('Customer not found');
  }

  return mapCustomer(data as CustomerRow);
}

export async function importCSV(_file: File): Promise<{ imported: number; errors: string[] }> {
  // Placeholder implementation
  return { imported: 0, errors: ['CSV import is not implemented yet'] };
}

export async function exportCSV(scope: 'current' | 'filtered' | 'all', filters?: ListParams): Promise<Blob> {
  const result = await listCustomers(filters || {});
  const customers = result.items;

  // Generate CSV content
  const headers = ['ID', 'Full Name', 'Email', 'Phone', 'National ID', 'Customer Type', 'Lifecycle Status', 'Verification Status', 'Current Property', 'Outstanding Balance', 'Total Bookings', 'Total Rent Paid', 'Last Activity', 'Created At'];
  const rows = customers.map(c => [
    c.id,
    c.fullName,
    c.email || '',
    c.phone || '',
    c.nationalId || '',
    c.customerType,
    c.lifecycleStatus,
    c.verificationStatus,
    c.currentProperty || '',
    c.outstandingBalance,
    c.totalBookings,
    c.totalRentPaid,
    c.lastActivityAt,
    c.createdAt,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
}
