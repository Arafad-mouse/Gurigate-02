import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CustomerCard } from '@/components/admin/customer/CustomerCard';
import { AddCustomerModal } from '@/components/admin/customer/AddCustomerModal';
import { EditCustomerModal } from '@/components/admin/customer/EditCustomerModal';
import { AssignPropertyDrawer } from '@/components/admin/customer/AssignPropertyDrawer';
import { CreateContractDrawer } from '@/components/admin/customer/CreateContractDrawer';
import { SuspendCustomerModal } from '@/components/admin/customer/SuspendCustomerModal';
import { FilterPanel, type FilterValues } from '@/components/admin/customer/FilterPanel';
import { CustomerProfileDrawer } from '@/components/admin/customer/CustomerProfileDrawer';
import type { CustomerType, LifecycleStatus, CustomerDrawerState, Customer } from '@/types/customer';
import { listCustomers, getCustomerDashboardMetrics, exportCSV } from '@/services/customerService';
import { customerDebug } from '@/state/customerDebug';

function Money({ cents }: { cents?: number }) {
  const n = Math.max(0, cents || 0) / 100;
  return <>{n.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</>;
}

function KPISkeleton() {
  return (
    <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-200 p-6 bg-white">
          <div className="h-4 bg-gray-100 rounded w-32 mb-3" />
          <div className="h-8 bg-gray-100 rounded w-24" />
        </div>
      ))}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-200 p-5 bg-white">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 bg-gray-100 rounded-xl" />
            <div className="flex-1">
              <div className="h-5 bg-gray-100 rounded w-32 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-20" />
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-3/4" />
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="h-4 bg-gray-100 rounded" />
            <div className="h-4 bg-gray-100 rounded" />
          </div>
          <div className="h-10 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  );
}

export default function CustomersPage() {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | CustomerType>('all');
  const [lifeFilter, setLifeFilter] = useState<'all' | LifecycleStatus>('all');
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Drawer state with URL support
  const [drawer, setDrawer] = useState<CustomerDrawerState>(() => {
    const cid = new URLSearchParams(window.location.search).get('customer') || undefined;
    return { isOpen: !!cid, customerId: cid, activeTab: 'overview' };
  });

  // Add Customer modal state
  const [showAddModal, setShowAddModal] = useState(false);

  // Edit Customer modal state
  const [editCustomerId, setEditCustomerId] = useState<string | null>(null);

  // Assign Property drawer state
  const [assignPropertyCustomerId, setAssignPropertyCustomerId] = useState<string | null>(null);

  // Create Contract drawer state
  const [createContractCustomerId, setCreateContractCustomerId] = useState<string | null>(null);

  // Suspend Customer modal state
  const [suspendCustomerId, setSuspendCustomerId] = useState<string | null>(null);

  // Filter panel state
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Export loading state
  const [exporting, setExporting] = useState(false);

  // Data state
  const [kpiLoading, setKpiLoading] = useState(true);
  const [kpi, setKpi] = useState<{ totalCustomers:number; activeTenants:number; outstandingBalance:number; occupancyRate:number }|null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [items, setItems] = useState<Customer[]>([]);

  // Load KPIs
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await getCustomerDashboardMetrics();
        if (mounted) {
          // Transform service response to new KPI format
          const totalOutstanding = items.reduce((sum, c) => sum + (c.outstandingBalance || 0), 0);
          const occupancyRate = res.totalCustomers > 0 
            ? Math.round((res.activeTenants / res.totalCustomers) * 100) 
            : 0;
          
          setKpi({
            totalCustomers: res.totalCustomers,
            activeTenants: res.activeTenants,
            outstandingBalance: totalOutstanding,
            occupancyRate,
          });
          setKpiLoading(false);
        }
      } catch {
        if (mounted) setKpiLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [items]);

  // Load list whenever filters change
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setListLoading(true);
      try {
        const res = await listCustomers({ query, type: typeFilter, lifecycle: lifeFilter, page:1, pageSize: 24 });
        if (mounted) {
          setItems(res.items);
          setListLoading(false);
        }
      } catch {
        if (mounted) setListLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [query, typeFilter, lifeFilter]);

  // Keep URL in sync on external changes (e.g., back button)
  useEffect(() => {
    const cid = searchParams.get('customer') || undefined;
    const isOpen = !!cid;
    setDrawer(prev => {
      if (prev.customerId === cid && prev.isOpen === isOpen) return prev;
      return { isOpen, customerId: cid, activeTab: 'overview' };
    });
  }, [searchParams]);

  const onCardClick = (id: string) => {
    setDrawer({ isOpen: true, customerId: id, activeTab: 'overview' });
    const sp = new URLSearchParams(searchParams);
    sp.set('customer', id);
    setSearchParams(sp, { replace: true });
    customerDebug.setCustomer(id); customerDebug.setDrawerState('open'); customerDebug.setUrlParam(id);
  };

  const closeDrawer = () => {
    setDrawer((d)=> ({ ...d, isOpen: false }));
    const sp = new URLSearchParams(searchParams);
    sp.delete('customer');
    setSearchParams(sp, { replace: true });
    customerDebug.setDrawerState('closed'); customerDebug.setUrlParam(undefined);
  };

  const handleAddCustomerSuccess = (_newCustomer: Customer) => {
    // Refresh the customer list
    setListLoading(true);
    listCustomers({ query, type: typeFilter, lifecycle: lifeFilter, page:1, pageSize: 24 })
      .then((res)=>{ setItems(res.items); setListLoading(false); })
      .catch(()=> setListLoading(false));
  };

  const handleFilterApply = (filters: FilterValues) => {
    // Map filter panel values to our existing filter state
    if (filters.customerType !== 'all') {
      setTypeFilter(filters.customerType);
    } else {
      setTypeFilter('all');
    }
    if (filters.lifecycleStatus !== 'all') {
      setLifeFilter(filters.lifecycleStatus);
    } else {
      setLifeFilter('all');
    }
    // TODO: Handle propertyId, activity, dateFrom, dateTo when service supports them
  };

  const handleFilterClear = () => {
    setTypeFilter('all');
    setLifeFilter('all');
    setQuery('');
  };

  const handleExport = async (scope: 'current' | 'filtered' | 'all') => {
    setExporting(true);
    try {
      const blob = await exportCSV(scope, { query, type: typeFilter, lifecycle: lifeFilter, page: 1, pageSize: 1000 });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `customers-${scope}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  // Drawer action handlers
  const handleDrawerAssignProperty = (customerId: string) => {
    console.log('Assign property to customer:', customerId);
    // TODO: Implement property assignment
  };

  const handleDrawerCreateContract = (customerId: string) => {
    console.log('Create contract for customer:', customerId);
    // TODO: Implement contract creation
  };

  const handleDrawerSuspend = (customerId: string) => {
    console.log('Suspend customer:', customerId);
    // TODO: Implement suspension
  };

  // Card action handlers
  const handleCardEdit = (customerId: string) => {
    setEditCustomerId(customerId);
  };

  const handleCardAssignProperty = (customerId: string) => {
    setAssignPropertyCustomerId(customerId);
  };

  const handleCardCreateContract = (customerId: string) => {
    setCreateContractCustomerId(customerId);
  };

  const handleCardSuspend = (customerId: string) => {
    setSuspendCustomerId(customerId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500">Manage guests, tenants, renters, and buyers across the GuriGate platform.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAddModal(true)} className="px-3 py-2 rounded-lg text-sm font-semibold text-white" style={{ background:'#E8344E' }}>Add Customer</button>
          <button onClick={() => handleExport('current')} disabled={exporting} className="px-3 py-2 rounded-lg text-sm font-semibold border border-gray-200 disabled:opacity-50">
            {exporting ? 'Exporting...' : 'Export'}
          </button>
          <button onClick={() => setShowFilterPanel(true)} className="px-3 py-2 rounded-lg text-sm font-semibold border border-gray-200">Filter</button>
        </div>
      </div>

      {/* KPI Row - 4 Larger Cards */}
      {kpiLoading && <KPISkeleton/>}
      {!kpiLoading && kpi && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="rounded-xl border border-gray-200 p-6 bg-white hover:shadow-md transition-shadow">
            <div className="text-sm text-gray-500 mb-2">Total Customers</div>
            <div className="text-3xl font-bold text-gray-900">{kpi.totalCustomers}</div>
          </div>
          <div className="rounded-xl border border-gray-200 p-6 bg-white hover:shadow-md transition-shadow">
            <div className="text-sm text-gray-500 mb-2">Active Tenants</div>
            <div className="text-3xl font-bold text-gray-900">{kpi.activeTenants}</div>
          </div>
          <div className="rounded-xl border border-gray-200 p-6 bg-white hover:shadow-md transition-shadow">
            <div className="text-sm text-gray-500 mb-2">Outstanding Balance</div>
            <div className="text-3xl font-bold text-gray-900">${(kpi.outstandingBalance / 100).toLocaleString()}</div>
          </div>
          <div className="rounded-xl border border-gray-200 p-6 bg-white hover:shadow-md transition-shadow">
            <div className="text-sm text-gray-500 mb-2">Occupancy Rate</div>
            <div className="text-3xl font-bold text-gray-900">{kpi.occupancyRate}%</div>
          </div>
        </div>
      )}

      {/* Search + Filters - Reorganized Toolbar */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Search Input */}
        <input
          value={query}
          onChange={e=>setQuery(e.target.value)}
          placeholder="Search by name, email, phone, ID"
          className="w-full md:max-w-md border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
        />

        {/* Filter Bar - Single Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Customer Type Filter */}
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as any)}
            className="px-3 py-2 rounded-lg text-sm border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-rose-200"
          >
            <option value="all">All Types</option>
            <option value="tenant">Tenant</option>
            <option value="renter">Renter</option>
            <option value="buyer">Buyer</option>
            <option value="guest">Guest</option>
          </select>

          {/* Status Filter */}
          <select
            value={lifeFilter}
            onChange={e => setLifeFilter(e.target.value as any)}
            className="px-3 py-2 rounded-lg text-sm border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-rose-200"
          >
            <option value="all">All Statuses</option>
            <option value="lead">Lead</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>

          {/* Clear Filters Button */}
          <button
            onClick={() => {
              setQuery('');
              setTypeFilter('all');
              setLifeFilter('all');
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Grid - 3 Column Responsive */}
      {listLoading && <CardSkeleton/>}
      {!listLoading && items.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center text-sm text-gray-500 bg-white">
          <div className="text-gray-400 mb-2">No customers found</div>
          <div className="text-xs">Try adjusting your filters or search terms</div>
        </div>
      )}
      {!listLoading && items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((c) => (
            <CustomerCard
              key={c.id}
              customer={c}
              onView={() => onCardClick(c.id)}
              onEdit={() => handleCardEdit(c.id)}
              onAssign={() => handleCardAssignProperty(c.id)}
              onMore={() => handleCardSuspend(c.id)}
            />
          ))}
        </div>
      )}

      {/* Dev-only debug panel with ?debug=1 */}
      {searchParams.get('debug') === '1' && (
        <div className="mt-6 rounded-xl border border-gray-200 p-4 bg-white text-xs">
          <div className="font-semibold mb-2">Customer Debug Panel</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div>Current Customer ID: <span className="font-mono">{customerDebug.currentCustomerId || '—'}</span></div>
              <div>Active Tab: <span className="font-mono">{customerDebug.activeTab}</span></div>
              <div>URL Param: <span className="font-mono">{customerDebug.urlParam || '—'}</span></div>
              <div>Drawer State: <span className="font-mono">{customerDebug.drawerState}</span></div>
            </div>
            <div>
              <div className="mb-1 font-medium">Cache Status</div>
              {(['overview','bookings','payments','contracts','properties','timeline'] as const).map(k => (
                <div key={k} className="flex items-center gap-2">
                  <span className="w-24 capitalize">{k}</span>
                  <span className={`inline-flex items-center justify-center w-4 h-4 rounded ${customerDebug.cache[k] ? 'bg-green-500' : 'bg-red-400'}`}></span>
                  <span>{customerDebug.cache[k] ? 'Loaded' : 'Not Loaded'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Drawer placeholder: will be implemented next (Overview first, lazy tabs) */}
      {drawer.isOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={closeDrawer} />
          <div className="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white border-l border-gray-200 shadow-xl p-4 overflow-y-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-100 rounded mb-4" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-4 bg-gray-100 rounded" />
                <div className="h-4 bg-gray-100 rounded" />
                <div className="h-4 bg-gray-100 rounded" />
                <div className="h-4 bg-gray-100 rounded" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <AddCustomerModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddCustomerSuccess}
        />
      )}

      {/* Edit Customer Modal */}
      {editCustomerId && (
        <EditCustomerModal
          customerId={editCustomerId}
          isOpen={!!editCustomerId}
          onClose={() => setEditCustomerId(null)}
          onSuccess={() => {
            setEditCustomerId(null);
            setListLoading(true);
            listCustomers({ query, type: typeFilter, lifecycle: lifeFilter, page:1, pageSize: 24 })
              .then((res)=>{ setItems(res.items); setListLoading(false); })
              .catch(()=> setListLoading(false));
          }}
        />
      )}

      {/* Assign Property Drawer */}
      {assignPropertyCustomerId && (
        <AssignPropertyDrawer
          customerId={assignPropertyCustomerId}
          isOpen={!!assignPropertyCustomerId}
          onClose={() => setAssignPropertyCustomerId(null)}
          onSuccess={() => {
            setAssignPropertyCustomerId(null);
            setListLoading(true);
            listCustomers({ query, type: typeFilter, lifecycle: lifeFilter, page:1, pageSize: 24 })
              .then((res)=>{ setItems(res.items); setListLoading(false); })
              .catch(()=> setListLoading(false));
          }}
        />
      )}

      {/* Create Contract Drawer */}
      {createContractCustomerId && (
        <CreateContractDrawer
          customerId={createContractCustomerId}
          customerName={items.find(c => c.id === createContractCustomerId)?.fullName || 'Customer'}
          isOpen={!!createContractCustomerId}
          onClose={() => setCreateContractCustomerId(null)}
          onSuccess={() => {
            setCreateContractCustomerId(null);
            setListLoading(true);
            listCustomers({ query, type: typeFilter, lifecycle: lifeFilter, page:1, pageSize: 24 })
              .then((res)=>{ setItems(res.items); setListLoading(false); })
              .catch(()=> setListLoading(false));
          }}
        />
      )}

      {/* Suspend Customer Modal */}
      {suspendCustomerId && (
        <SuspendCustomerModal
          customerId={suspendCustomerId}
          customerName={items.find(c => c.id === suspendCustomerId)?.fullName || 'Customer'}
          isOpen={!!suspendCustomerId}
          onClose={() => setSuspendCustomerId(null)}
          onSuccess={() => {
            setSuspendCustomerId(null);
            setListLoading(true);
            listCustomers({ query, type: typeFilter, lifecycle: lifeFilter, page:1, pageSize: 24 })
              .then((res)=>{ setItems(res.items); setListLoading(false); })
              .catch(()=> setListLoading(false));
          }}
        />
      )}

      {/* Filter Panel */}
      {showFilterPanel && (
        <FilterPanel
          onClose={() => setShowFilterPanel(false)}
          onApply={handleFilterApply}
          onClear={handleFilterClear}
        />
      )}

      {/* Customer Profile Drawer */}
      <CustomerProfileDrawer
        state={drawer}
        onClose={closeDrawer}
        onAssignProperty={handleDrawerAssignProperty}
        onCreateContract={handleDrawerCreateContract}
        onSuspend={handleDrawerSuspend}
      />
    </div>
  );
}
