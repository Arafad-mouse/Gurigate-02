import type { Customer, CustomerMetrics, CustomerType, LifecycleStatus, BookingSummary, PaymentSummary, ContractSummary, PropertySummary, TimelineEvent } from '@/types/customer';

export interface ListParams {
  query?: string;
  type?: CustomerType | 'all';
  lifecycle?: LifecycleStatus | 'all';
  page?: number;
  pageSize?: number;
  dateFrom?: string; // ISO
  dateTo?: string;   // ISO
}

// Dev-only failure injection using ?fail=overview|bookings|payments|contracts|properties|timeline
function shouldFail(kind: 'overview'|'bookings'|'payments'|'contracts'|'properties'|'timeline'): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const sp = new URLSearchParams(window.location.search);
    return sp.get('fail') === kind;
  } catch { return false; }
}

// ----- Mock Data (Sprint 1) --------------------------------------------------
const MOCK_CUSTOMERS: Customer[] = Array.from({ length: 24 }).map((_, i) => ({
  id: String(i+1),
  fullName: ['James Brown','Wei Chen','Miya Chen','Roger Parks','Arthur Taylor','Ravi Patel','William Henry','Dianne Russell','Harry Potter','Marvin McKinney','David Smith','John Wick'][i%12],
  email: `user${i+1}@example.com`,
  phone: `+254-700-0${(100+i).toString().slice(-3)}`,
  customerType: (['tenant','guest','buyer','renter'] as CustomerType[])[i%4],
  lifecycleStatus: (['active','lead','inactive','suspended'] as LifecycleStatus[])[i%4],
  currentProperty: i%3===0 ? 'Kilimani Heights • A-304' : undefined,
  totalBookings: 2 + (i%4),
  totalRentPaid: (i%6)*1000,
  lastActivityAt: new Date(Date.now() - i*86400000).toISOString(),
  createdAt: new Date(Date.now() - (30+i)*86400000).toISOString(),
}));

function mockMetricsFor(id: string): CustomerMetrics {
  const c = MOCK_CUSTOMERS.find(x=>x.id===id)!;
  const lastPayment: PaymentSummary | undefined = c.totalRentPaid>0 ? {
    id: 'pay-'+id,
    date: new Date(Date.now() - 3*86400000).toISOString(),
    amountCents: 50000,
    method: 'card',
    type: 'rent',
  } : undefined;
  const activeContract: ContractSummary | undefined = c.currentProperty ? {
    id: 'ctr-'+id,
    property: c.currentProperty,
    startDate: new Date(Date.now() - 90*86400000).toISOString(),
    endDate: undefined,
    status: 'active',
    rentCents: 80000,
  } : undefined;
  const currentProperty: PropertySummary | undefined = c.currentProperty ? {
    id: 'prop-'+id,
    name: c.currentProperty,
    unit: 'A-304',
  } : undefined;
  return {
    totalBookings: c.totalBookings,
    totalRentPaid: Math.round(c.totalRentPaid*100),
    outstandingBalance: activeContract?.rentCents ? Math.max(0, activeContract.rentCents - (lastPayment?.amountCents||0)) : 0,
    activeContract,
    currentProperty,
    lastPayment,
  };
}

// ----- Service API ------------------------------------------------------------
export async function listCustomers(params: ListParams): Promise<{ items: Customer[]; total: number; }>{
  const { query='', type='all', lifecycle='all', page=1, pageSize=12 } = params || {} as ListParams;
  const start = (page-1)*pageSize;
  const filtered = MOCK_CUSTOMERS.filter(c =>
    (!query || c.fullName.toLowerCase().includes(query.toLowerCase()) || (c.email && c.email.toLowerCase().includes(query.toLowerCase())) || c.phone?.includes(query)) &&
    (type==='all' || c.customerType===type) &&
    (lifecycle==='all' || c.lifecycleStatus===lifecycle)
  );
  const items = filtered.slice(start, start+pageSize);
  console.log('listCustomers(mock)', { query, type, lifecycle, page, pageSize, total: filtered.length });
  return Promise.resolve({ items, total: filtered.length });
}

export async function getCustomer(id: string): Promise<Customer>{
  const c = MOCK_CUSTOMERS.find(x=>x.id===id);
  if (!c) throw new Error('Customer not found');
  return Promise.resolve(c);
}

export async function getCustomerOverview(id: string): Promise<{ customer: Customer; metrics: CustomerMetrics }>{
  if (shouldFail('overview')) throw new Error('Injected failure (overview)');
  const customer = await getCustomer(id);
  const metrics = mockMetricsFor(id);
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

export async function getCustomerProperties(id: string, page=1, pageSize=10): Promise<{ items: PropertySummary[]; total: number; }>{
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
  const totalCustomers = MOCK_CUSTOMERS.length;
  const activeTenants = MOCK_CUSTOMERS.filter(c=>c.customerType==='tenant' && c.lifecycleStatus==='active').length;
  const activeGuests = MOCK_CUSTOMERS.filter(c=>c.customerType==='guest' && c.lifecycleStatus==='active').length;
  const activeBuyers = MOCK_CUSTOMERS.filter(c=>c.customerType==='buyer' && c.lifecycleStatus==='active').length;
  const monthlyRevenue = 0; // mock
  const overdueAccounts = MOCK_CUSTOMERS.filter(c=> mockMetricsFor(c.id).outstandingBalance>0 ).length;
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
export async function createCustomer(data: {
  fullName: string;
  email: string | null;
  phone: string;
  customerType: CustomerType;
  lifecycleStatus: LifecycleStatus;
  propertyId: string | null;
  notes: string | null;
  tags: string[];
}): Promise<Customer> {
  const newCustomer: Customer = {
    id: `cust-${Date.now()}`,
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    customerType: data.customerType,
    lifecycleStatus: data.lifecycleStatus,
    currentProperty: data.propertyId ? 'Assigned Property' : undefined,
    propertyId: data.propertyId || undefined,
    notes: data.notes || undefined,
    tags: data.tags,
    totalBookings: 0,
    totalRentPaid: 0,
    lastActivityAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  MOCK_CUSTOMERS.unshift(newCustomer);
  return newCustomer;
}

export async function updateCustomer(customerId: string, data: {
  fullName: string;
  email: string | null;
  phone: string;
  customerType: CustomerType;
  lifecycleStatus: LifecycleStatus;
  propertyId?: string | null;
  notes?: string;
  tags?: string[];
}): Promise<Customer> {
  const index = MOCK_CUSTOMERS.findIndex(c => c.id === customerId);
  if (index === -1) throw new Error('Customer not found');
  
  const updated: Customer = {
    ...MOCK_CUSTOMERS[index],
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    customerType: data.customerType,
    lifecycleStatus: data.lifecycleStatus,
    currentProperty: data.propertyId ? 'Assigned Property' : undefined,
    propertyId: data.propertyId || undefined,
    notes: data.notes,
    tags: data.tags,
    lastActivityAt: new Date().toISOString(),
  };
  MOCK_CUSTOMERS[index] = updated;
  console.log('updateCustomer(mock)', { customerId, updated });
  return updated;
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

export async function suspendCustomer(customerId: string, reason?: string): Promise<{ ok: true }>{
  console.log('suspendCustomer(mock)', { customerId, reason });
  return { ok: true };
}

export async function exportCSV(scope: 'current' | 'filtered' | 'all', filters?: ListParams): Promise<Blob> {
  let customers: Customer[];
  if (scope === 'all') {
    customers = MOCK_CUSTOMERS;
  } else {
    const result = await listCustomers(filters || {});
    customers = result.items;
  }

  // Generate CSV content
  const headers = ['ID', 'Full Name', 'Email', 'Phone', 'Customer Type', 'Lifecycle Status', 'Current Property', 'Total Bookings', 'Total Rent Paid', 'Last Activity', 'Created At'];
  const rows = customers.map(c => [
    c.id,
    c.fullName,
    c.email || '',
    c.phone || '',
    c.customerType,
    c.lifecycleStatus,
    c.currentProperty || '',
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
