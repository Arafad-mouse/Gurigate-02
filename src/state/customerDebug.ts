// Development-only debug state for Customer module
// Not persisted; used by /admin/customers/debug
export type CacheKeys = 'overview' | 'bookings' | 'payments' | 'contracts' | 'properties' | 'timeline'

export const customerDebug = {
  enabled: true,
  currentCustomerId: undefined as string | undefined,
  activeTab: 'overview' as CacheKeys,
  cache: {
    overview: false,
    bookings: false,
    payments: false,
    contracts: false,
    properties: false,
    timeline: false,
  } as Record<CacheKeys, boolean>,
  loadedAt: {
    overview: undefined,
    bookings: undefined,
    payments: undefined,
    contracts: undefined,
    properties: undefined,
    timeline: undefined,
  } as Record<CacheKeys, number | undefined>,
  urlParam: undefined as string | undefined,
  drawerState: 'closed' as 'open' | 'closed',

  setCustomer(id?: string) { this.currentCustomerId = id; },
  setActiveTab(tab: CacheKeys) { this.activeTab = tab; },
  setLoaded(tab: CacheKeys) { this.cache[tab] = true; this.loadedAt[tab] = Date.now(); },
  setUrlParam(val?: string) { this.urlParam = val; },
  setDrawerState(state: 'open' | 'closed') { this.drawerState = state; },
  ageLabel(tab: CacheKeys): string {
    const t = this.loadedAt[tab];
    if (!t) return 'Not Loaded';
    const secs = Math.max(0, Math.floor((Date.now() - t) / 1000));
    if (secs < 60) return `${secs}s ago`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ago`;
  },
};
