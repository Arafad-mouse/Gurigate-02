import React, { useEffect, useMemo, useState } from 'react';
import type { CustomerDrawerState, Customer, CustomerMetrics } from '@/types/customer';
import { getCustomerOverview, getCustomerBookings, getCustomerPayments, getCustomerContracts, getCustomerProperties, getCustomerTimeline } from '@/services/customerService';
import { CustomerOverviewTab } from './CustomerOverviewTab';
import { CustomerBookingsTab } from './CustomerBookingsTab';
import { CustomerPaymentsTab } from './CustomerPaymentsTab';
import { CustomerContractsTab } from './CustomerContractsTab';
import { CustomerPropertiesTab } from './CustomerPropertiesTab';
import { CustomerTimelineTab } from './CustomerTimelineTab';
import { DrawerSkeleton } from './CustomerSkeleton';

export interface CustomerProfileDrawerProps {
  state: CustomerDrawerState;
  onClose: () => void;
  onTabChange: (tab: CustomerDrawerState['activeTab']) => void;
  // Quick action placeholders
  onMessage?: (id: string) => void;
  onAssignProperty?: (id: string) => void;
  onCreateContract?: (id: string) => void;
  onSuspend?: (id: string) => void;
}

interface TabCache<T> { loading: boolean; error?: string; data?: T; }

export const CustomerProfileDrawer: React.FC<CustomerProfileDrawerProps> = ({ state, onClose, onTabChange, onMessage, onAssignProperty, onCreateContract, onSuspend }) => {
  const { isOpen, customerId, activeTab } = state;

  // Header/overview fetching
  const [headerLoading, setHeaderLoading] = useState(true);
  const [headerError, setHeaderError] = useState<string | undefined>();
  const [customer, setCustomer] = useState<Customer | undefined>();
  const [metrics, setMetrics] = useState<CustomerMetrics | undefined>();

  // Per-tab caches
  const [bookings, setBookings] = useState<TabCache<ReturnType<typeof useMemo>>|any>({ loading: false });
  const [payments, setPayments] = useState<TabCache<ReturnType<typeof useMemo>>|any>({ loading: false });
  const [contracts, setContracts] = useState<TabCache<ReturnType<typeof useMemo>>|any>({ loading: false });
  const [properties, setProperties] = useState<TabCache<ReturnType<typeof useMemo>>|any>({ loading: false });
  const [timeline, setTimeline] = useState<TabCache<any[]>>({ loading: false });

  // Reset and load overview when customer changes or drawer opens
  useEffect(() => {
    if (!isOpen || !customerId) return;
    setHeaderLoading(true); setHeaderError(undefined);
    setBookings({ loading: false }); setPayments({ loading: false }); setContracts({ loading: false }); setProperties({ loading: false }); setTimeline({ loading: false });
    getCustomerOverview(customerId)
      .then((res)=>{ setCustomer(res.customer); setMetrics(res.metrics); })
      .catch(()=> setHeaderError('Failed to load customer overview.'))
      .finally(()=> setHeaderLoading(false));
  }, [isOpen, customerId]);

  // Lazy loaders for tabs
  useEffect(() => {
    if (!isOpen || !customerId) return;
    const tab = activeTab;
    if (tab === 'bookings' && !bookings.data && !bookings.loading) {
      setBookings({ loading: true });
      getCustomerBookings(customerId).then(res=> setBookings({ loading: false, data: res.items })).catch(()=> setBookings({ loading:false, error:'Failed to load bookings.' }));
    }
    if (tab === 'payments' && !payments.data && !payments.loading) {
      setPayments({ loading: true });
      getCustomerPayments(customerId).then(res=> setPayments({ loading: false, data: res.items, lastPayment: res.lastPayment })).catch(()=> setPayments({ loading:false, error:'Failed to load payments.' }));
    }
    if (tab === 'contracts' && !contracts.data && !contracts.loading) {
      setContracts({ loading: true });
      getCustomerContracts(customerId).then(res=> setContracts({ loading: false, data: res.items, active: res.active })).catch(()=> setContracts({ loading:false, error:'Failed to load contracts.' }));
    }
    if (tab === 'properties' && !properties.data && !properties.loading) {
      setProperties({ loading: true });
      getCustomerProperties(customerId).then(res=> setProperties({ loading: false, data: res.items })).catch(()=> setProperties({ loading:false, error:'Failed to load properties.' }));
    }
    if (tab === 'timeline' && !timeline.data && !timeline.loading) {
      setTimeline({ loading: true });
      getCustomerTimeline(customerId).then(res=> setTimeline({ loading: false, data: res })).catch(()=> setTimeline({ loading:false, error:'Failed to load timeline.' }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isOpen, customerId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full sm:w-[460px] bg-white border-l border-gray-200 shadow-xl flex flex-col">
        {/* Fixed Header */}
        <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/95 backdrop-blur px-4 py-3 flex items-start gap-3">
          {/* Avatar placeholder */}
          <div className="w-10 h-10 rounded-xl bg-gray-100" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-gray-900 truncate">{customer?.fullName || 'Customer'}</h3>
              {customer?.customerType && (<span className="badge" style={{background:'#F3F4F6', color:'#374151'}}>{customer.customerType}</span>)}
              {customer?.lifecycleStatus && (<span className="badge" style={{background:'#FEF2F2', color:'#E8344E'}}>{customer.lifecycleStatus}</span>)}
            </div>
            <div className="text-xs text-gray-500 truncate">{customer?.email || ''}</div>
          </div>
          <div className="flex gap-1">
            <button className="px-2 py-1 text-xs border rounded" onClick={()=> customerId && onMessage?.(customerId)}>Message</button>
            <button className="px-2 py-1 text-xs border rounded" onClick={()=> customerId && onAssignProperty?.(customerId)}>Assign</button>
            <button className="px-2 py-1 text-xs border rounded" onClick={()=> customerId && onCreateContract?.(customerId)}>Contract</button>
            <button className="px-2 py-1 text-xs border rounded text-red-600 border-red-200" onClick={()=> customerId && onSuspend?.(customerId)}>Suspend</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 pt-2 border-b border-gray-100 flex gap-2 overflow-x-auto">
          {(['overview','bookings','payments','contracts','properties','timeline'] as const).map(t => (
            <button key={t} onClick={()=> onTabChange(t)} className={`px-3 py-1.5 rounded-lg text-xs border ${activeTab===t? 'bg-rose-50 border-rose-200 text-rose-700':'border-gray-200 text-gray-700'}`}>{t[0].toUpperCase()+t.slice(1)}</button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {headerLoading ? (
            <DrawerSkeleton />
          ) : headerError ? (
            <div className="text-sm text-red-600">{headerError}</div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <CustomerOverviewTab customer={customer!} metrics={metrics!} />
              )}
              {activeTab === 'bookings' && (
                <CustomerBookingsTab loading={!!bookings.loading} error={bookings.error} items={bookings.data || []} />
              )}
              {activeTab === 'payments' && (
                <CustomerPaymentsTab loading={!!payments.loading} error={payments.error} items={payments.data || []} lastPayment={payments.lastPayment} />
              )}
              {activeTab === 'contracts' && (
                <CustomerContractsTab loading={!!contracts.loading} error={contracts.error} items={contracts.data || []} active={contracts.active} />
              )}
              {activeTab === 'properties' && (
                <CustomerPropertiesTab loading={!!properties.loading} error={properties.error} items={properties.data || []} />
              )}
              {activeTab === 'timeline' && (
                <CustomerTimelineTab loading={!!timeline.loading} error={timeline.error} items={timeline.data || []} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
