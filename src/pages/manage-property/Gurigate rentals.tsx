"use client";

import { useState, useEffect } from "react";
import { TenantService } from "@/services/tenantService";
import type { Tenant, PaymentStatus } from "@/types/tenant";

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

const BUILDINGS = ["All", "Burjiomar A", "Burjiomar B", "Kulmiye Tower", "Sha'ab Complex"];

const STATUS_STYLE = {
  Paid:    { bg:"#dcfce7", color:"#15803d", dot:"#22c55e" },
  Pending: { bg:"#FFF7ED", color:"#c2410c", dot:"#f97316" },
  Overdue: { bg:"#FEF2F2", color:"#b91c1c", dot:"#E8344E" },
};

interface TenantUI extends Tenant {
  name: string;
  rooms?: number;
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
  const [form, setForm] = useState({ name:"", phone:"", rooms:"1", building:BUILDINGS[1], unit:"", amount:"", nextDue:"" });
  const [error, setError] = useState("");
  
  const set = (k: string, v: string) => setForm(p=>({...p,[k]:v}));
  
  const handleAdd = async () => {
    if (!form.name || !form.phone) {
      setError("Name and phone are required");
      return;
    }
    
    try {
      setError("");
      const newTenant = await TenantService.createTenant({
        full_name: form.name,
        phone: form.phone,
        building: form.building,
        unit: form.unit,
        monthly_rent: parseFloat(form.amount) || 0,
        next_due_date: form.nextDue || new Date().toISOString().split('T')[0],
        rooms: parseInt(form.rooms),
      });
      
      const tenantUI: TenantUI = {
        ...newTenant,
        name: newTenant.full_name,
        rooms: parseInt(form.rooms),
        building: form.building,
        unit: form.unit,
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
      <div style={{ background:"white", borderRadius:18, padding:28, width:440, boxShadow:"0 24px 60px rgba(0,0,0,.18)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <h2 style={{ fontSize:16, fontWeight:700 }}>Add New Lease</h2>
          <button onClick={onClose} disabled={loading} style={{ background:"#f1f5f9", border:"none", borderRadius:8, width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#64748b", opacity: loading ? 0.5 : 1 }}><Icon.X/></button>
        </div>
        {error && <div style={{ background:"#FEF2F2", color:"#E8344E", padding:"10px 12px", borderRadius:8, fontSize:12, marginBottom:16 }}>{error}</div>}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {[
            { label:"Customer Name", key:"name", placeholder:"Axmed Cabdalle", full:true },
            { label:"Phone", key:"phone", placeholder:"+252 63 xxxxxxx" },
            { label:"Unit No.", key:"unit", placeholder:"A-101" },
            { label:"Monthly Rent ($)", key:"amount", placeholder:"150" },
            { label:"Next Due Date", key:"nextDue", placeholder:"", type:"date" },
          ].map(f => (
            <div key={f.key} style={{ gridColumn:f.full?"span 2":"span 1" }}>
              <label style={{ fontSize:11, fontWeight:600, color:"#64748b", display:"block", marginBottom:4 }}>{f.label}</label>
              <input type={f.type||"text"} placeholder={f.placeholder} value={form[f.key as keyof typeof form]} onChange={e=>set(f.key,e.target.value)} disabled={loading}
                style={{ width:"100%", border:"1.5px solid #e2e8f0", borderRadius:8, padding:"8px 12px", fontSize:12, outline:"none", fontFamily:"inherit", color:"#111827", transition:"border .15s", opacity: loading ? 0.6 : 1 }}
                onFocus={e=>e.target.style.borderColor="#E8344E"}
                onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
            </div>
          ))}
          <div>
            <label style={{ fontSize:11, fontWeight:600, color:"#64748b", display:"block", marginBottom:4 }}>Rooms</label>
            <select value={form.rooms} onChange={e=>set("rooms",e.target.value)} disabled={loading} style={{ width:"100%", border:"1.5px solid #e2e8f0", borderRadius:8, padding:"8px 12px", fontSize:12, outline:"none", fontFamily:"inherit", appearance:"none", cursor:"pointer", opacity: loading ? 0.6 : 1 }}>
              <option value="1">1 Room</option>
              <option value="2">2 Rooms</option>
              <option value="3">3 Rooms</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize:11, fontWeight:600, color:"#64748b", display:"block", marginBottom:4 }}>Building</label>
            <select value={form.building} onChange={e=>set("building",e.target.value)} disabled={loading} style={{ width:"100%", border:"1.5px solid #e2e8f0", borderRadius:8, padding:"8px 12px", fontSize:12, outline:"none", fontFamily:"inherit", appearance:"none", cursor:"pointer", opacity: loading ? 0.6 : 1 }}>
              {BUILDINGS.slice(1).map(b=><option key={b}>{b}</option>)}
            </select>
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
            { label:"Rooms", value:`${tenant.rooms} room${tenant.rooms && tenant.rooms>1?"s":""}`, icon:<Icon.Grid/> },
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
  const [totalTenants, setTotalTenants] = useState(0);

  const card = "white";
  const bdr = "#F1F5F9";
  const muted = "#9CA3AF";
  const text = "#111827";

  useEffect(() => {
    loadTenants();
    loadStats();
  }, [buildingFilter, statusFilter, search, currentPage]);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const result = await TenantService.getTenants({
        page: currentPage,
        pageSize: itemsPerPage,
        building: buildingFilter !== "All" ? buildingFilter : undefined,
        status: statusFilter !== "All" ? (statusFilter as PaymentStatus) : undefined,
        search: search || undefined,
      });

      const tenantsUI: TenantUI[] = result.items.map(t => ({
        ...t,
        name: t.full_name,
        rooms: 1,
        building: t.building_id || "Unknown",
        unit: t.unit_id || "N/A",
        rentDate: t.move_in_date,
        status: t.payment_status,
        avatar: null,
      }));

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
        {[
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
        ))}
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20, flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, background:card, border:`1px solid ${bdr}`, borderRadius:10, padding:"8px 12px" }}>
          <Icon.Filter />
          <select value={buildingFilter} onChange={e=>setBuildingFilter(e.target.value)} disabled={loading} style={{ border:"none", outline:"none", background:"transparent", color:text, fontSize:13, cursor:"pointer", opacity: loading ? 0.6 : 1 }}>
            {BUILDINGS.map(b => <option key={b} value={b}>{b}</option>)}
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
              {["Customer","Contact","Building","Unit","Rent","Status","Start Date",""].map((h,i) => (
                <th key={i} style={{ padding:"12px 14px", textAlign:"left", fontWeight:600, fontSize:11, color:muted, whiteSpace:"nowrap", letterSpacing:"0.02em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tenants.length===0 ? (
              <tr><td colSpan={8} style={{ padding:"32px", textAlign:"center", color:muted, fontSize:13 }}>No leases found</td></tr>
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
                      <p style={{ fontSize:11, color:muted }}>{t.phone}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding:"12px 14px", color:muted }}>{t.building}</td>
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
