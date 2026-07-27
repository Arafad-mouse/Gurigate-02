"use client";

import { useState, useEffect, useCallback } from "react";
import { TenantService } from "@/services/tenantService";
import { listBuildings } from "@/services/buildingService";
import { listFloors } from "@/services/floorService";
import { getRooms, updateRoomStatus } from "@/services/unitService";
import { listCustomers } from "@/services/customerService";
import { createClient } from "@/lib/supabase/client";
import type { Tenant, PaymentStatus } from "@/types/tenant";
import type { Customer, CustomerType } from "@/types/customer";

const supabase = createClient();

// Add skeleton animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;
if (!document.head.querySelector('style[data-skeleton]')) {
  style.setAttribute('data-skeleton', 'true');
  document.head.appendChild(style);
}

const Icon = {
  Home: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Users: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  CreditCard: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  BarChart: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>,
  Plus: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Filter: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 5H3"/><path d="M12 19H3"/><path d="M14 3v4"/><path d="M16 17v4"/><path d="M21 12h-9"/><path d="M21 19h-5"/><path d="M21 5h-7"/><path d="M8 10v4"/><path d="M8 12H3"/></svg>,
  Search: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  TrendUp: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  TrendDown: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>,
  Phone: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 .18h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.11 7.83a16 16 0 006.06 6.06l1.21-1.21a2 2 0 012.11-.45c.9.33 1.85.55 2.81.7a2 2 0 011.71 2z"/></svg>,
  Building: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18z"/><path d="M6 12H4a2 2 0 00-2 2v6a2 2 0 002 2h2"/><path d="M18 9h2a2 2 0 012 2v9a2 2 0 01-2 2h-2"/></svg>,
  Door: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M9 21V5a2 2 0 012-2h2a2 2 0 012 2v16"/><circle cx="14" cy="13" r="1" fill="currentColor"/></svg>,
  Grid: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  Calendar: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Check: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  X: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Trash: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
  ChevronDown: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
};

const STATUS_STYLE = {
  Paid:    { bg:"#dcfce7", color:"#15803d", dot:"#22c55e" },
  Pending: { bg:"#FFF7ED", color:"#c2410c", dot:"#f97316" },
  Overdue: { bg:"#FEF2F2", color:"#b91c1c", dot:"#E8344E" },
};

interface TenantUI extends Tenant {
  name: string;
  phone: string;
  floor?: string;
  roomsCount?: number;
  building?: string;
  unit?: string;
  rentDate?: string;
  status: PaymentStatus;
  avatar: null;
}

interface AddTenantModalProps {
  onClose: () => void;
  onAdd: (tenant: TenantUI) => void;
  loading?: boolean;
}

interface PaymentModalProps {
  tenant: TenantUI;
  onClose: () => void;
  onUpdate: (id: string, status: PaymentStatus) => void;
  loading?: boolean;
}

interface TenantDetailModalProps {
  tenant: TenantUI;
  onClose: () => void;
  onUpdatePayment: () => void;
  onRenew: (id: string) => void;
  onTerminate: (id: string) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

function Avatar({ size = 30, style = {} }: { size?: number; style?: React.CSSProperties }) {
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:"#FEE2E2", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, ...style }}>
      <svg width={size*0.64} height={size*0.64} viewBox="0 0 24 24" fill="none" stroke="#E8344E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="8" r="3"/>
        <path d="M6.168 18.849A4 4 0 0 1 10 16h4a4 4 0 0 1 3.834 2.855"/>
      </svg>
    </div>
  );
}

function AddTenantModal({ onClose, onAdd, loading = false }: AddTenantModalProps) {
  const [form, setForm] = useState({
    customerType: 'individual' as 'individual' | 'business',
    customerId: '',
    responsibleContactId: '',
    buildingId: '',
    floorId: '',
    unitId: '',
    amount: '',
    nextDue: '',
  });
  const [error, setError] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [floors, setFloors] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingBuildings, setLoadingBuildings] = useState(false);
  const [loadingFloors, setLoadingFloors] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");

  const set = (k: string, v: string) => setForm(p=>({...p,[k]:v}));

  // Load customers based on type
  useEffect(() => {
    const loadCustomers = async () => {
      setLoadingCustomers(true);
      try {
        const result = await listCustomers({
          query: customerSearch,
          type: form.customerType === 'individual' ? 'tenant' : 'tenant',
          pageSize: 50,
        });
        setCustomers(result.items);
      } catch (err) {
        console.error('Failed to load customers:', err);
      } finally {
        setLoadingCustomers(false);
      }
    };
    loadCustomers();
  }, [form.customerType, customerSearch]);

  // Load buildings
  useEffect(() => {
    const loadBuildings = async () => {
      setLoadingBuildings(true);
      try {
        const result = await listBuildings();
        setBuildings(result.items);
      } catch (err) {
        console.error('Failed to load buildings:', err);
      } finally {
        setLoadingBuildings(false);
      }
    };
    loadBuildings();
  }, []);

  // Load floors when building changes
  useEffect(() => {
    if (form.buildingId) {
      const loadFloors = async () => {
        setLoadingFloors(true);
        try {
          const result = await listFloors({ buildingId: form.buildingId });
          setFloors(result);
        } catch (err) {
          console.error('Failed to load floors:', err);
        } finally {
          setLoadingFloors(false);
        }
      };
      loadFloors();
    } else {
      setFloors([]);
      setUnits([]);
      setForm(p => ({ ...p, floorId: '', unitId: '' }));
    }
  }, [form.buildingId]);

  // Load vacant units when floor changes
  useEffect(() => {
    if (form.floorId) {
      const loadUnits = async () => {
        setLoadingUnits(true);
        try {
          const result = await getRooms({ building_id: form.buildingId, floor_id: form.floorId, status: 'available' });
          setUnits(result.rooms);
        } catch (err) {
          console.error('Failed to load units:', err);
        } finally {
          setLoadingUnits(false);
        }
      };
      loadUnits();
    } else {
      setUnits([]);
      setForm(p => ({ ...p, unitId: '' }));
    }
  }, [form.floorId, form.buildingId]);

  // Clear dependent fields when customer type changes
  const handleCustomerTypeChange = (type: 'individual' | 'business') => {
    setForm(p => ({ ...p, customerType: type, customerId: '', responsibleContactId: '' }));
  };

  // Clear dependent fields when building changes
  const handleBuildingChange = (buildingId: string) => {
    setForm(p => ({ ...p, buildingId, floorId: '', unitId: '' }));
  };

  // Clear dependent fields when floor changes
  const handleFloorChange = (floorId: string) => {
    setForm(p => ({ ...p, floorId, unitId: '' }));
  };

  const handleAdd = async () => {
    // Validation
    if (!form.customerId) {
      setError("Please select a customer");
      return;
    }
    if (!form.buildingId) {
      setError("Please select a building");
      return;
    }
    if (!form.floorId) {
      setError("Please select a floor");
      return;
    }
    if (!form.unitId) {
      setError("Please select a unit");
      return;
    }
    if (form.customerType === 'business' && !form.responsibleContactId) {
      setError("Please select a responsible contact for business customer");
      return;
    }

    try {
      setError("");
      const selectedCustomer = customers.find(c => c.id === form.customerId);
      const selectedUnit = units.find(u => u.id === form.unitId);
      const selectedBuilding = buildings.find(b => b.id === form.buildingId);

      const newTenant = await TenantService.createTenant({
        full_name: selectedCustomer?.fullName || 'Unknown',
        phone: selectedCustomer?.phone || '',
        building: selectedBuilding?.id || null,
        unit: selectedUnit?.id || null,
        floor_id: selectedUnit?.floor_id || null,
        monthly_rent: parseFloat(form.amount) || 0,
        next_due_date: form.nextDue || new Date().toISOString().split('T')[0],
        rooms: 1,
      });

      // Update unit status to occupied
      await updateRoomStatus(form.unitId, 'occupied');

      const tenantUI: TenantUI = {
        ...newTenant,
        name: newTenant.full_name,
        roomsCount: 1,
        building: selectedBuilding?.name || 'Unknown',
        unit: selectedUnit?.room_number || 'Unknown',
        rentDate: newTenant.move_in_date,
        status: newTenant.payment_status,
        avatar: null,
      };

      onAdd(tenantUI);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add lease");
    }
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.35)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"white", borderRadius:18, padding:28, width:500, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 24px 60px rgba(0,0,0,.18)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <h2 style={{ fontSize:16, fontWeight:700 }}>Add New Lease</h2>
          <button onClick={onClose} disabled={loading} style={{ background:"#f1f5f9", border:"none", borderRadius:8, width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#64748b", opacity: loading ? 0.5 : 1 }}><Icon.X/></button>
        </div>
        {error && <div style={{ background:"#FEF2F2", color:"#E8344E", padding:"10px 12px", borderRadius:8, fontSize:12, marginBottom:16 }}>{error}</div>}
        <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:12 }}>
          {/* Customer Type Selection */}
          <div>
            <label style={{ fontSize:11, fontWeight:600, color:"#64748b", display:"block", marginBottom:4 }}>Customer Type</label>
            <div style={{ display:"flex", gap:8 }}>
              <button
                onClick={() => handleCustomerTypeChange('individual')}
                disabled={loading}
                style={{
                  flex:1,
                  padding:"8px 12px",
                  borderRadius:8,
                  border:form.customerType === 'individual' ? "2px solid #E8344E" : "1.5px solid #e2e8f0",
                  background:form.customerType === 'individual' ? "#FEF2F2" : "white",
                  fontSize:12,
                  fontWeight:600,
                  cursor:"pointer",
                  color:form.customerType === 'individual' ? "#E8344E" : "#374151",
                  opacity: loading ? 0.6 : 1
                }}
              >
                Individual
              </button>
              <button
                onClick={() => handleCustomerTypeChange('business')}
                disabled={loading}
                style={{
                  flex:1,
                  padding:"8px 12px",
                  borderRadius:8,
                  border:form.customerType === 'business' ? "2px solid #E8344E" : "1.5px solid #e2e8f0",
                  background:form.customerType === 'business' ? "#FEF2F2" : "white",
                  fontSize:12,
                  fontWeight:600,
                  cursor:"pointer",
                  color:form.customerType === 'business' ? "#E8344E" : "#374151",
                  opacity: loading ? 0.6 : 1
                }}
              >
                Business
              </button>
            </div>
          </div>

          {/* Customer Search */}
          <div>
            <label style={{ fontSize:11, fontWeight:600, color:"#64748b", display:"block", marginBottom:4 }}>
              {form.customerType === 'individual' ? 'Customer' : 'Business Customer'}
            </label>
            <input
              type="text"
              placeholder="Search by name, phone, or email..."
              value={customerSearch}
              onChange={e => setCustomerSearch(e.target.value)}
              disabled={loading}
              style={{ width:"100%", border:"1.5px solid #e2e8f0", borderRadius:8, padding:"8px 12px", fontSize:12, outline:"none", fontFamily:"inherit", color:"#111827", transition:"border .15s", opacity: loading ? 0.6 : 1 }}
              onFocus={e=>e.target.style.borderColor="#E8344E"}
              onBlur={e=>e.target.style.borderColor="#e2e8f0"}
            />
          </div>

          {/* Customer Dropdown */}
          <div>
            <label style={{ fontSize:11, fontWeight:600, color:"#64748b", display:"block", marginBottom:4 }}>
              Select {form.customerType === 'individual' ? 'Customer' : 'Business'}
            </label>
            <select
              value={form.customerId}
              onChange={e => set('customerId', e.target.value)}
              disabled={loading || loadingCustomers}
              style={{ width:"100%", border:"1.5px solid #e2e8f0", borderRadius:8, padding:"8px 12px", fontSize:12, outline:"none", fontFamily:"inherit", appearance:"none", cursor:"pointer", opacity: loading || loadingCustomers ? 0.6 : 1 }}
            >
              <option value="">Select {form.customerType === 'individual' ? 'a customer' : 'a business'}</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.fullName} - {c.phone}</option>
              ))}
            </select>
          </div>

          {/* Responsible Contact (Business Only) */}
          {form.customerType === 'business' && (
            <div>
              <label style={{ fontSize:11, fontWeight:600, color:"#64748b", display:"block", marginBottom:4 }}>Responsible Contact</label>
              <select
                value={form.responsibleContactId}
                onChange={e => set('responsibleContactId', e.target.value)}
                disabled={loading}
                style={{ width:"100%", border:"1.5px solid #e2e8f0", borderRadius:8, padding:"8px 12px", fontSize:12, outline:"none", fontFamily:"inherit", appearance:"none", cursor:"pointer", opacity: loading ? 0.6 : 1 }}
              >
                <option value="">Select responsible contact</option>
                {customers.filter(c => c.customerType === 'tenant').map(c => (
                  <option key={c.id} value={c.id}>{c.fullName} - {c.phone}</option>
                ))}
              </select>
            </div>
          )}

          {/* Building Selection */}
          <div>
            <label style={{ fontSize:11, fontWeight:600, color:"#64748b", display:"block", marginBottom:4 }}>Building</label>
            <select
              value={form.buildingId}
              onChange={e => handleBuildingChange(e.target.value)}
              disabled={loading || loadingBuildings}
              style={{ width:"100%", border:"1.5px solid #e2e8f0", borderRadius:8, padding:"8px 12px", fontSize:12, outline:"none", fontFamily:"inherit", appearance:"none", cursor:"pointer", opacity: loading || loadingBuildings ? 0.6 : 1 }}
            >
              <option value="">Select building</option>
              {buildings.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Floor Selection */}
          <div>
            <label style={{ fontSize:11, fontWeight:600, color:"#64748b", display:"block", marginBottom:4 }}>Floor</label>
            <select
              value={form.floorId}
              onChange={e => handleFloorChange(e.target.value)}
              disabled={loading || !form.buildingId || loadingFloors}
              style={{ width:"100%", border:"1.5px solid #e2e8f0", borderRadius:8, padding:"8px 12px", fontSize:12, outline:"none", fontFamily:"inherit", appearance:"none", cursor:"pointer", opacity: loading || !form.buildingId || loadingFloors ? 0.6 : 1 }}
            >
              <option value="">Select floor</option>
              {floors.map(f => (
                <option key={f.id} value={f.id}>Floor {f.floor_number}</option>
              ))}
            </select>
          </div>

          {/* Unit Selection (Vacant Only) */}
          <div>
            <label style={{ fontSize:11, fontWeight:600, color:"#64748b", display:"block", marginBottom:4 }}>Unit (Vacant Only)</label>
            <select
              value={form.unitId}
              onChange={e => set('unitId', e.target.value)}
              disabled={loading || !form.floorId || loadingUnits}
              style={{ width:"100%", border:"1.5px solid #e2e8f0", borderRadius:8, padding:"8px 12px", fontSize:12, outline:"none", fontFamily:"inherit", appearance:"none", cursor:"pointer", opacity: loading || !form.floorId || loadingUnits ? 0.6 : 1 }}
            >
              <option value="">Select unit</option>
              {units.map(u => (
                <option key={u.id} value={u.id}>{u.building_name || 'Unknown Building'} - {u.unit_number || u.room_number}</option>
              ))}
            </select>
            {units.length === 0 && form.floorId && !loadingUnits && (
              <p style={{ fontSize:10, color:"#E8344E", marginTop:4 }}>No vacant units available on this floor</p>
            )}
          </div>

          {/* Monthly Rent */}
          <div>
            <label style={{ fontSize:11, fontWeight:600, color:"#64748b", display:"block", marginBottom:4 }}>Monthly Rent ($)</label>
            <input
              type="number"
              placeholder="150"
              value={form.amount}
              onChange={e => set('amount', e.target.value)}
              disabled={loading}
              style={{ width:"100%", border:"1.5px solid #e2e8f0", borderRadius:8, padding:"8px 12px", fontSize:12, outline:"none", fontFamily:"inherit", color:"#111827", transition:"border .15s", opacity: loading ? 0.6 : 1 }}
              onFocus={e=>e.target.style.borderColor="#E8344E"}
              onBlur={e=>e.target.style.borderColor="#e2e8f0"}
            />
          </div>

          {/* Next Due Date */}
          <div>
            <label style={{ fontSize:11, fontWeight:600, color:"#64748b", display:"block", marginBottom:4 }}>Next Due Date</label>
            <input
              type="date"
              value={form.nextDue}
              onChange={e => set('nextDue', e.target.value)}
              disabled={loading}
              style={{ width:"100%", border:"1.5px solid #e2e8f0", borderRadius:8, padding:"8px 12px", fontSize:12, outline:"none", fontFamily:"inherit", opacity: loading ? 0.6 : 1 }}
            />
          </div>
        </div>
        <div style={{ display:"flex", gap:10, marginTop:20 }}>
          <button onClick={onClose} disabled={loading} style={{ flex:1, padding:"10px", borderRadius:10, border:"1.5px solid #e2e8f0", background:"white", fontSize:13, fontWeight:600, cursor:"pointer", color:"#64748b", opacity: loading ? 0.5 : 1 }}>Cancel</button>
          <button onClick={handleAdd} disabled={loading} style={{ flex:2, padding:"10px", borderRadius:10, border:"none", background:"#E8344E", color:"white", fontSize:13, fontWeight:700, cursor:"pointer", opacity: loading ? 0.7 : 1 }}>{loading ? "Adding..." : "Add Lease"}</button>
        </div>
      </div>
    </div>
  );
}

function PaymentModal({ tenant, onClose, onUpdate, loading = false }: PaymentModalProps) {
  const [status, setStatus] = useState<PaymentStatus>(tenant.status);
  const save = async () => {
    try {
      await onUpdate(tenant.id, status);
      onClose();
    } catch (err) {
      console.error("Error updating payment:", err);
    }
  };
  
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.35)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"white", borderRadius:18, padding:28, width:360, boxShadow:"0 24px 60px rgba(0,0,0,.18)" }}>
        <h2 style={{ fontSize:15, fontWeight:700, marginBottom:4 }}>Update Payment</h2>
        <p style={{ fontSize:12, color:"#94a3b8", marginBottom:18 }}>{tenant.name} · {tenant.unit} · ${tenant.monthly_rent}/mo</p>
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
          {(["Paid","Pending","Overdue"] as PaymentStatus[]).map(s=>(
            <button key={s} onClick={()=>setStatus(s)} disabled={loading} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:10, border:`2px solid ${status===s?"#E8344E":"#e2e8f0"}`, background:status===s?"#FEF2F2":"white", cursor:"pointer", transition:"all .15s", opacity: loading ? 0.6 : 1 }}>
              <div style={{ width:12, height:12, borderRadius:"50%", background:STATUS_STYLE[s].dot, flexShrink:0 }}/>
              <span style={{ fontSize:13, fontWeight:600, color:status===s?"#E8344E":"#374151" }}>{s}</span>
              {status===s && <span style={{ marginLeft:"auto", color:"#E8344E" }}><Icon.Check/></span>}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onClose} disabled={loading} style={{ flex:1, padding:"10px", borderRadius:10, border:"1.5px solid #e2e8f0", background:"white", fontSize:13, fontWeight:600, cursor:"pointer", color:"#64748b", opacity: loading ? 0.5 : 1 }}>Cancel</button>
          <button onClick={save} disabled={loading} style={{ flex:2, padding:"10px", borderRadius:10, border:"none", background:"#E8344E", color:"white", fontSize:13, fontWeight:700, cursor:"pointer", opacity: loading ? 0.7 : 1 }}>{loading ? "Saving..." : "Save"}</button>
        </div>
      </div>
    </div>
  );
}

function TenantDetailModal({ tenant, onClose, onUpdatePayment, onRenew, onTerminate, onDelete, loading = false }: TenantDetailModalProps) {
  const statusStyle = STATUS_STYLE[tenant.status];
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.35)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center" }} onClick={onClose}>
      <div style={{ background:"white", borderRadius:18, padding:0, width:460, maxHeight:"85vh", overflowY:"auto", boxShadow:"0 24px 60px rgba(0,0,0,.18)" }} onClick={e=>e.stopPropagation()}>
        <div style={{ padding:"24px 28px 0", display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <Avatar size={48}/>
            <div>
              <h2 style={{ fontSize:17, fontWeight:700, color:"#111827", margin:0 }}>{tenant.name}</h2>
              <p style={{ fontSize:12, color:"#9CA3AF", marginTop:2 }}>{tenant.id} · {tenant.unit}</p>
            </div>
          </div>
          <button onClick={onClose} disabled={loading} style={{ background:"#f1f5f9", border:"none", borderRadius:8, width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#64748b", flexShrink:0, opacity: loading ? 0.5 : 1 }}><Icon.X/></button>
        </div>

        <div style={{ padding:"16px 28px 0" }}>
          <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 12px", borderRadius:12, fontSize:12, fontWeight:600, background:statusStyle.bg, color:statusStyle.color }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:statusStyle.dot }}/>
            {tenant.status}
          </span>
        </div>

        <div style={{ padding:"20px 28px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          {[
            { label:"Phone", value:tenant.phone, icon:<Icon.Phone/> },
            { label:"Building", value:tenant.building, icon:<Icon.Building/> },
            { label:"Unit", value:tenant.unit, icon:<Icon.Door/> },
            { label:"Rooms", value:`${tenant.roomsCount || 1} room${(tenant.roomsCount || 1) > 1 ? "s" : ""}`, icon:<Icon.Grid/> },
            { label:"Monthly Rent", value:`$${tenant.monthly_rent}/mo`, icon:<Icon.CreditCard/> },
            { label:"Join Date", value:tenant.move_in_date, icon:<Icon.Calendar/> },
            { label:"Next Payment Due", value:tenant.next_due_date, icon:<Icon.Calendar/> },
          ].map((item, i) => (
            <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"10px 12px", background:"#F9FAFB", borderRadius:10 }}>
              <div style={{ color:"#E8344E", marginTop:1, flexShrink:0 }}>{item.icon}</div>
              <div>
                <p style={{ fontSize:10, fontWeight:600, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:"0.04em" }}>{item.label}</p>
                <p style={{ fontSize:13, fontWeight:600, color:"#111827", marginTop:2 }}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding:"0 28px 24px", display:"flex", flexDirection:"column", gap:10 }}>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={onUpdatePayment} disabled={loading} style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"10px", borderRadius:10, border:"none", background:"#E8344E", color:"white", fontSize:13, fontWeight:700, cursor:"pointer", opacity: loading ? 0.7 : 1 }}>
              <Icon.CreditCard/> Update Payment
            </button>
            <button onClick={()=>onRenew(tenant.id)} disabled={loading} style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"10px", borderRadius:10, border:"none", background:"#059669", color:"white", fontSize:13, fontWeight:700, cursor:"pointer", opacity: loading ? 0.7 : 1 }}>
              <Icon.Calendar/> Renew
            </button>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={()=>onTerminate(tenant.id)} disabled={loading} style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"10px", borderRadius:10, border:"1.5px solid #FEE2E2", background:"#FEF2F2", fontSize:13, fontWeight:600, cursor:"pointer", color:"#E8344E", opacity: loading ? 0.5 : 1 }}>
              <Icon.X/> Terminate
            </button>
            <button onClick={()=>onDelete(tenant.id)} disabled={loading} style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"10px", borderRadius:10, border:"1.5px solid #FEE2E2", background:"#FEF2F2", fontSize:13, fontWeight:600, cursor:"pointer", color:"#E8344E", opacity: loading ? 0.5 : 1 }}>
              <Icon.Trash/> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GuriGateRentals() {
  const [tenants, setTenants] = useState<TenantUI[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<TenantUI | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [buildingFilter, setBuildingFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total_tenants: 0, active_leases: 0, pending_payments: 0, occupancy_rate: 0 });
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [totalTenants, setTotalTenants] = useState(0);
  const [buildings, setBuildings] = useState<any[]>([]);

  const card = "white";
  const bdr = "#F1F5F9";
  const muted = "#9CA3AF";
  const text = "#111827";

  useEffect(() => {
    loadTenants();
    loadStats();
    loadBuildings();
  }, [buildingFilter, statusFilter, search, currentPage]);

  const loadBuildings = async () => {
    try {
      const result = await listBuildings();
      setBuildings(result.items);
    } catch (error) {
      console.error("Error loading buildings:", error);
    }
  };

  const loadTenants = async () => {
    try {
      setLoading(true);
      const result = await TenantService.getTenants({
        page: currentPage,
        pageSize: itemsPerPage,
        building: buildingFilter !== "All" ? buildingFilter : undefined,
        status: statusFilter !== "All" ? statusFilter as PaymentStatus : undefined,
        search: search || undefined,
      });

      // Fetch related data for building names, unit numbers, and floor numbers
      const buildingIds = [...new Set(result.items.map(t => t.building_id).filter(Boolean))];
      const unitIds = [...new Set(result.items.map(t => t.unit_id).filter(Boolean))];
      
      let buildingMap: Record<string, string> = {};
      let unitMap: Record<string, { unit_number: string; floor_id: string }> = {};
      let floorMap: Record<string, number> = {};
      
      if (buildingIds.length > 0) {
        const { data: buildings } = await supabase
          .from('buildings')
          .select('id, name')
          .in('id', buildingIds);
        (buildings || []).forEach((b: any) => { buildingMap[b.id] = b.name; });
      }
      
      if (unitIds.length > 0) {
        const { data: units } = await supabase
          .from('units')
          .select('id, unit_number, floor_id')
          .in('id', unitIds);
        (units || []).forEach((u: any) => { unitMap[u.id] = { unit_number: u.unit_number, floor_id: u.floor_id }; });
        
        // Collect floor IDs from units
        const floorIdsFromUnits = [...new Set((units || []).map((u: any) => u.floor_id).filter(Boolean))];
        
        if (floorIdsFromUnits.length > 0) {
          const { data: floors } = await supabase
            .from('floors')
            .select('id, floor_number')
            .in('id', floorIdsFromUnits);
          (floors || []).forEach((f: any) => { floorMap[f.id] = f.floor_number; });
        }
      }

      const tenantsUI: TenantUI[] = result.items.map(t => {
        const unitData = unitMap[t.unit_id || ''];
        const floorId = unitData?.floor_id || t.floor_id;
        
        return {
          ...t,
          name: t.full_name,
          phone: t.phone,
          building: t.building_id ? (buildingMap[t.building_id] || "Unknown") : "Unknown",
          floor: floorId ? `Floor ${floorMap[floorId] || 'Unknown'}` : "Unknown",
          unit: t.unit_id ? (unitData?.unit_number || "N/A") : "N/A",
          roomsCount: 1,
          rentDate: t.move_in_date,
          status: t.payment_status,
          avatar: null,
        };
      });

      setTenants(tenantsUI);
      setTotalTenants(result.total);
    } catch (error) {
      console.error("Error loading tenants:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const stats = await TenantService.getTenantStats();
      setStats(stats);
      setStatsLoaded(true);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleAddTenant = async (tenant: TenantUI) => {
    setTenants(p => [tenant, ...p]);
    await loadStats();
  };

  const handleUpdateStatus = async (id: string, status: PaymentStatus) => {
    try {
      setLoading(true);
      await TenantService.updateTenantPaymentStatus(id, status);
      setTenants(p => p.map(t => t.id === id ? { ...t, status } : t));
      if (selectedTenant?.id === id) setSelectedTenant(p => p ? { ...p, status } : null);
      await loadStats();
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this lease?')) {
      try {
        setLoading(true);
        await TenantService.deleteTenant(id);
        setTenants(p => p.filter(t => t.id !== id));
        if (selectedTenant?.id === id) setSelectedTenant(null);
        await loadStats();
      } catch (error) {
        console.error("Error deleting lease:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRenew = async (id: string) => {
    if (window.confirm('Are you sure you want to renew this lease?')) {
      try {
        setLoading(true);
        await TenantService.updateTenantPaymentStatus(id, "Paid");
        setTenants(p => p.map(t => t.id === id ? { ...t, status: "Paid" as PaymentStatus } : t));
        if (selectedTenant?.id === id) setSelectedTenant(p => p ? { ...p, status: "Paid" as PaymentStatus } : null);
        await loadStats();
      } catch (error) {
        console.error("Error renewing lease:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleTerminate = async (id: string) => {
    if (window.confirm('Are you sure you want to terminate this lease?')) {
      try {
        setLoading(true);
        
        // Get the tenant's unit ID before deletion
        const tenant = tenants.find(t => t.id === id);
        if (tenant?.unit_id) {
          // Mark unit as available
          await updateRoomStatus(tenant.unit_id, 'available');
        }
        
        await TenantService.deleteTenant(id);
        setTenants(p => p.filter(t => t.id !== id));
        if (selectedTenant?.id === id) setSelectedTenant(null);
        await loadStats();
      } catch (error) {
        console.error("Error terminating lease:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const totalPages = Math.ceil(totalTenants / itemsPerPage);

  return (
    <div style={{ padding:"28px", flex:1, overflowY:"auto" }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:"-0.4px", color:text }}>Lease Management</h1>
          <p style={{ fontSize:12, color:muted, marginTop:2 }}>Manage customer leases and property assignments</p>
        </div>
        <button onClick={()=>setShowAddModal(true)} disabled={loading} style={{ display:"flex", alignItems:"center", gap:6, background:"#E8344E", color:"white", border:"none", borderRadius:10, padding:"10px 18px", fontSize:13, fontWeight:600, cursor:"pointer", opacity: loading ? 0.7 : 1 }}>
          <Icon.Plus/> Add Lease
        </button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
        {statsLoaded ? [
          { label:"Total Leases", value:stats.total_tenants.toString(), change:"+2", up:true, icon:<Icon.Users/> },
          { label:"Active Leases", value:stats.active_leases.toString(), change:"+1", up:true, icon:<Icon.Home/> },
          { label:"Pending Payments", value:stats.pending_payments.toString(), change:"-1", up:false, icon:<Icon.CreditCard/> },
          { label:"Occupancy Rate", value:`${stats.occupancy_rate}%`, change:"+5%", up:true, icon:<Icon.BarChart/> },
        ].map((s, i) => (
          <div key={i} style={{ background:card, border:`1px solid ${bdr}`, borderRadius:16, padding:20, display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                <p style={{ fontSize:11, color:muted, fontWeight:500 }}>{s.label}</p>
                <p style={{ fontSize:18, fontWeight:700, letterSpacing:"-0.5px" }}>{s.value}</p>
              </div>
              <div style={{ width:38, height:38, background:"#FEF2F2", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", color:"#E8344E", flexShrink:0 }}>
                {s.icon}
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ display:"flex", alignItems:"center", gap:3, fontSize:11, fontWeight:700, color:s.up?"#059669":"#E8344E" }}>
                {s.up ? <Icon.TrendUp/> : <Icon.TrendDown/>}{s.change}
              </span>
              <span style={{ fontSize:11, color:muted }}>Last month</span>
            </div>
          </div>
        )) : (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "20px", color: muted }}>Loading stats...</div>
        )}
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20, flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, background:card, border:`1px solid ${bdr}`, borderRadius:10, padding:"8px 12px" }}>
          <Icon.Filter />
          <select value={buildingFilter} onChange={e=>setBuildingFilter(e.target.value)} disabled={loading} style={{ border:"none", outline:"none", background:"transparent", color:text, fontSize:13, cursor:"pointer", opacity: loading ? 0.6 : 1 }}>
            <option value="All">All Buildings</option>
            {buildings.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6, background:card, border:`1px solid ${bdr}`, borderRadius:10, padding:"8px 12px" }}>
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} disabled={loading} style={{ border:"none", outline:"none", background:"transparent", color:text, fontSize:13, cursor:"pointer", opacity: loading ? 0.6 : 1 }}>
            <option value="All">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6, background:card, border:`1px solid ${bdr}`, borderRadius:10, padding:"8px 12px", flex:1, maxWidth:300 }}>
          <Icon.Search />
          <input placeholder="Search leases..." value={search} onChange={e=>setSearch(e.target.value)} disabled={loading} style={{ border:"none", outline:"none", background:"transparent", color:text, fontSize:13, width:"100%", opacity: loading ? 0.6 : 1 }}/>
        </div>
      </div>

      <div style={{ background:card, borderRadius:16, border:`1px solid ${bdr}`, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr style={{ borderBottom:`1px solid ${bdr}` }}>
              {["Customer","Contact","Building","Floor","Unit","Rent","Status","Start Date",""].map((h,i) => (
                <th key={i} style={{ padding:"12px 14px", textAlign:"left", fontWeight:600, fontSize:11, color:muted, whiteSpace:"nowrap", letterSpacing:"0.02em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} style={{ borderBottom:`1px solid ${bdr}` }}>
                  {Array.from({ length: 9 }).map((_, j) => (
                    <td key={j} style={{ padding:"12px 14px" }}>
                      <div style={{ width:"100%", height:16, background:"#F1F5F9", borderRadius:4, animation:"pulse 1.5s ease-in-out infinite" }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : tenants.length===0 ? (
              <tr><td colSpan={9} style={{ padding:"32px", textAlign:"center", color:muted, fontSize:13 }}>No leases found</td></tr>
            ) : tenants.map((t) => (
              <tr key={t.id} style={{ borderBottom:`1px solid ${bdr}`, transition:"background .12s", cursor:"pointer" }}
                  onClick={()=>{setSelectedTenant(t);setShowDetailModal(true);}}
                  onMouseEnter={e=>{e.currentTarget.style.background="rgba(232,52,78,0.025)";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="";}}>
                <td style={{ padding:"12px 14px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <Avatar size={32}/>
                    <div>
                      <p style={{ fontWeight:600, color:text, fontSize:13 }}>{t.name}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding:"12px 14px", color:muted }}>{t.phone}</td>
                <td style={{ padding:"12px 14px", color:muted }}>{t.building}</td>
                <td style={{ padding:"12px 14px", color:muted }}>{t.floor ? `Floor ${t.floor}` : 'N/A'}</td>
                <td style={{ padding:"12px 14px", color:muted }}>{t.unit}</td>
                <td style={{ padding:"12px 14px", fontWeight:600, color:text }}>${t.monthly_rent}/mo</td>
                <td style={{ padding:"12px 14px" }}>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 10px", borderRadius:12, fontSize:11, fontWeight:600,
                    background:STATUS_STYLE[t.status].bg,
                    color:STATUS_STYLE[t.status].color }}>
                    {t.status}
                  </span>
                </td>
                <td style={{ padding:"12px 14px", color:muted, fontSize:12 }}>{t.move_in_date}</td>
                <td style={{ padding:"12px 14px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <button onClick={(e)=>{e.stopPropagation();setSelectedTenant(t);setShowPaymentModal(true);}} disabled={loading} style={{ background:"none", border:"none", cursor:"pointer", color:muted, padding:4, opacity: loading ? 0.5 : 1 }}>
                      <Icon.CreditCard/>
                    </button>
                    <button onClick={(e)=>{e.stopPropagation();handleDelete(t.id);}} disabled={loading} style={{ background:"none", border:"none", cursor:"pointer", color:muted, padding:4, opacity: loading ? 0.5 : 1 }}>
                      <Icon.Trash/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 0", marginTop:20 }}>
          <span style={{ fontSize:12, color:muted }}>
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalTenants)} of {totalTenants} leases
          </span>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
              style={{
                display:"flex", alignItems:"center", gap:4,
                padding:"6px 12px", borderRadius:8, border:`1px solid ${bdr}`,
                background:currentPage === 1 ? "transparent" : card,
                color:text, fontSize:12, fontWeight:500, cursor:currentPage === 1 ? "not-allowed" : "pointer",
                opacity:currentPage === 1 || loading ? 0.5 : 1
              }}
            >
              <span style={{transform:"rotate(90deg)", display:"inline-flex"}}><Icon.ChevronDown/></span> Previous
            </button>
            <div style={{ display:"flex", gap:4 }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  disabled={loading}
                  style={{
                    width:32, height:32, borderRadius:8, border:"none",
                    background:currentPage === page ? "#E8344E" : "transparent",
                    color:currentPage === page ? "white" : text,
                    fontSize:12, fontWeight:600, cursor:"pointer", opacity: loading ? 0.6 : 1
                  }}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || loading}
              style={{
                display:"flex", alignItems:"center", gap:4,
                padding:"6px 12px", borderRadius:8, border:`1px solid ${bdr}`,
                background:currentPage === totalPages ? "transparent" : card,
                color:text, fontSize:12, fontWeight:500, cursor:currentPage === totalPages ? "not-allowed" : "pointer",
                opacity:currentPage === totalPages || loading ? 0.5 : 1
              }}
            >
              Next <span style={{transform:"rotate(-90deg)", display:"inline-flex"}}><Icon.ChevronDown/></span>
            </button>
          </div>
        </div>
      )}

      {showAddModal && (
        <AddTenantModal onClose={()=>setShowAddModal(false)} onAdd={handleAddTenant} loading={loading} />
      )}
      {showPaymentModal && selectedTenant && (
        <PaymentModal tenant={selectedTenant} onClose={()=>setShowPaymentModal(false)} onUpdate={handleUpdateStatus} loading={loading} />
      )}
      {showDetailModal && selectedTenant && (
        <TenantDetailModal
          tenant={selectedTenant}
          onClose={()=>setShowDetailModal(false)}
          onUpdatePayment={()=>{setShowDetailModal(false);setShowPaymentModal(true);}}
          onRenew={(id)=>{setShowDetailModal(false);handleRenew(id);}}
          onTerminate={(id)=>{setShowDetailModal(false);handleTerminate(id);}}
          onDelete={(id)=>{setShowDetailModal(false);handleDelete(id);}}
          loading={loading}
        />
      )}
    </div>
  );
}
