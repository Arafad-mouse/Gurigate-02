import React, { useState } from "react";

// ── Icons ──────────────────────────────────────────────────────────────────────
const IC = {
  Home:       (s=15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Grid:       (s=15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  Compass:    (s=15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>,
  Building:   (s=15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18z"/><path d="M6 12H4a2 2 0 00-2 2v6a2 2 0 002 2h2"/><path d="M18 9h2a2 2 0 012 2v9a2 2 0 01-2 2h-2"/></svg>,
  Users:      (s=15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  User:       (s=15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  BarChart:   (s=15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>,
  ShoppingBag:(s=15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  CreditCard: (s=15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  Inbox:      (s=15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>,
  Calendar:   (s=15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Search:     (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Bell:       (s=16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  Moon:       (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
  Plus:       (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  ChevDown:   (s=13) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  MapPin:     (s=12) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Door:       (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M9 21V5a2 2 0 012-2h2a2 2 0 012 2v16"/><circle cx="14" cy="13" r="1" fill="currentColor"/></svg>,
  Check:      (s=12) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Chat:       (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  Phone:      (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01 0 1.18h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L6.11 7.83a16 16 0 006.06 6.06l1.21-1.21a2 2 0 012.11-.45c.9.33 1.85.55 2.81.7a2 2 0 011.71 2z"/></svg>,
  Mail:       (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Trash:      (s=13) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
};

const NAV_ITEMS = [
  { id:"Dashboard",   icon:IC.Grid,        section:"main" },
  { id:"Discover",    icon:IC.Compass,     section:"main" },
  { id:"Property",    icon:IC.Building,    section:"main" },
  { id:"Agents",      icon:IC.Users,       section:"main" },
  { id:"Customer",    icon:IC.User,        section:"main" },
  { id:"Analytics",   icon:IC.BarChart,    section:"main" },
  { id:"Order",       icon:IC.ShoppingBag, section:"main" },
  { id:"Transaction", icon:IC.CreditCard,  section:"main" },
  { id:"Inbox",       icon:IC.Inbox,       section:"apps" },
  { id:"Calendar",    icon:IC.Calendar,    section:"apps" },
];

// ── Data ───────────────────────────────────────────────────────────────────────
const BUILDINGS = ["All", "Burjiomar A", "Burjiomar B", "Kulmiye Tower", "Sha'ab Complex"];

const INIT_TENANTS = [
  { id:"T-001", name:"Axmed Cabdalle",    phone:"+252 63 4112233", rooms:1, building:"Burjiomar A",    unit:"A-101", rentDate:"2024-01-05", nextDue:"2025-04-05", amount:150,  status:"Paid"    },
  { id:"T-002", name:"Faadumo Xasan",     phone:"+252 63 5221144", rooms:2, building:"Burjiomar A",    unit:"A-203", rentDate:"2024-02-10", nextDue:"2025-04-10", amount:280,  status:"Paid"    },
  { id:"T-003", name:"Cabdi Warsame",     phone:"+252 63 6330055", rooms:3, building:"Burjiomar B",    unit:"B-301", rentDate:"2023-11-01", nextDue:"2025-04-01", amount:420,  status:"Overdue" },
  { id:"T-004", name:"Sahra Maxamed",     phone:"+252 63 7441166", rooms:1, building:"Burjiomar B",    unit:"B-105", rentDate:"2024-03-15", nextDue:"2025-04-15", amount:150,  status:"Paid"    },
  { id:"T-005", name:"Mustafe Nuur",      phone:"+252 63 8552277", rooms:2, building:"Kulmiye Tower",  unit:"K-214", rentDate:"2024-01-20", nextDue:"2025-04-20", amount:300,  status:"Pending" },
  { id:"T-006", name:"Hodan Jaamac",      phone:"+252 63 9663388", rooms:1, building:"Kulmiye Tower",  unit:"K-108", rentDate:"2024-04-01", nextDue:"2025-05-01", amount:160,  status:"Paid"    },
  { id:"T-007", name:"Xuseen Geelle",     phone:"+252 63 1774499", rooms:3, building:"Sha'ab Complex", unit:"S-302", rentDate:"2023-09-12", nextDue:"2025-04-12", amount:450,  status:"Overdue" },
  { id:"T-008", name:"Nimco Cabdiraxman", phone:"+252 63 2885500", rooms:2, building:"Sha'ab Complex", unit:"S-207", rentDate:"2024-02-28", nextDue:"2025-04-28", amount:290,  status:"Paid"    },
  { id:"T-009", name:"Daud Xirsi",        phone:"+252 63 3996611", rooms:1, building:"Burjiomar A",    unit:"A-112", rentDate:"2024-05-05", nextDue:"2025-05-05", amount:155,  status:"Pending" },
  { id:"T-010", name:"Leyla Rashid",      phone:"+252 63 4007722", rooms:2, building:"Burjiomar B",    unit:"B-210", rentDate:"2024-03-01", nextDue:"2025-04-01", amount:275,  status:"Paid"    },
  { id:"T-011", name:"Warsan Guure",      phone:"+252 63 5118833", rooms:3, building:"Kulmiye Tower",  unit:"K-315", rentDate:"2023-12-20", nextDue:"2025-04-20", amount:430,  status:"Overdue" },
  { id:"T-012", name:"Bashir Ciise",      phone:"+252 63 6229944", rooms:1, building:"Sha'ab Complex", unit:"S-103", rentDate:"2024-06-10", nextDue:"2025-06-10", amount:145,  status:"Paid"    },
];

const T_STATUS = {
  Paid:    { bg:"#dcfce7", color:"#15803d", dot:"#22c55e" },
  Pending: { bg:"#FFF7ED", color:"#c2410c", dot:"#f97316" },
  Overdue: { bg:"#FEF2F2", color:"#b91c1c", dot:"#E8344E" },
};

const ROOM_LABEL = { 1:"1 Room", 2:"2 Rooms", 3:"3 Rooms" };

// ── Avatar ─────────────────────────────────────────────────────────────────────
function Avatar({ name, size=30 }) {
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:"#FEE2E2", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <svg width={size*0.62} height={size*0.62} viewBox="0 0 24 24" fill="none" stroke="#E8344E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="8" r="3"/>
        <path d="M6.168 18.849A4 4 0 0 1 10 16h4a4 4 0 0 1 3.834 2.855"/>
      </svg>
    </div>
  );
}

// ── Add Tenant Modal ───────────────────────────────────────────────────────────
function AddTenantModal({ onClose, onAdd, dark }) {
  const card = dark ? "#1E293B" : "white";
  const bdr  = dark ? "#334155" : "#e2e8f0";
  const muted = dark ? "#94A3B8" : "#64748b";
  const text  = dark ? "#E2E8F0" : "#111827";

  const [form, setForm] = useState({
    name:"", phone:"", rooms:"1", building:BUILDINGS[1], unit:"", amount:"", nextDue:""
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleAdd = () => {
    if (!form.name || !form.phone) return;
    onAdd({
      id: `T-${String(Math.floor(Math.random() * 900) + 100)}`,
      name: form.name, phone: form.phone, rooms: parseInt(form.rooms),
      building: form.building, unit: form.unit || "N/A",
      rentDate: new Date().toISOString().slice(0, 10),
      nextDue: form.nextDue || "2025-06-01",
      amount: parseFloat(form.amount) || 0,
      status: "Pending",
    });
    onClose();
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.45)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:card, borderRadius:18, padding:26, width:440, boxShadow:"0 28px 60px rgba(0,0,0,.22)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <h2 style={{ fontSize:16, fontWeight:700, color:text }}>Add New Tenant</h2>
          <button onClick={onClose} style={{ width:30, height:30, borderRadius:8, border:"none", background:"#f1f5f9", cursor:"pointer", fontSize:18, color:"#64748b", display:"flex", alignItems:"center", justifyContent:"center", lineHeight:1 }}>×</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {[
            { label:"Full Name",         key:"name",    placeholder:"Axmed Cabdalle",   full:true },
            { label:"Phone",             key:"phone",   placeholder:"+252 63 xxxxxxx" },
            { label:"Unit No.",          key:"unit",    placeholder:"A-101" },
            { label:"Monthly Rent ($)",  key:"amount",  placeholder:"150" },
            { label:"Next Due Date",     key:"nextDue", placeholder:"", type:"date" },
          ].map(f => (
            <div key={f.key} style={{ gridColumn:f.full ? "span 2" : "span 1" }}>
              <label style={{ fontSize:11, fontWeight:600, color:muted, display:"block", marginBottom:4 }}>{f.label}</label>
              <input
                type={f.type || "text"} placeholder={f.placeholder} value={form[f.key]}
                onChange={e => set(f.key, e.target.value)}
                style={{ width:"100%", border:`1.5px solid ${bdr}`, borderRadius:8, padding:"8px 12px", fontSize:12.5, outline:"none", fontFamily:"inherit", background:card, color:text, transition:"border .15s" }}
                onFocus={e => e.target.style.borderColor="#E8344E"}
                onBlur={e => e.target.style.borderColor=bdr}
              />
            </div>
          ))}
          <div>
            <label style={{ fontSize:11, fontWeight:600, color:muted, display:"block", marginBottom:4 }}>Rooms</label>
            <select value={form.rooms} onChange={e => set("rooms", e.target.value)}
              style={{ width:"100%", border:`1.5px solid ${bdr}`, borderRadius:8, padding:"8px 12px", fontSize:12.5, outline:"none", fontFamily:"inherit", appearance:"none", cursor:"pointer", background:card, color:text }}>
              <option value="1">1 Room</option>
              <option value="2">2 Rooms</option>
              <option value="3">3 Rooms</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize:11, fontWeight:600, color:muted, display:"block", marginBottom:4 }}>Building</label>
            <select value={form.building} onChange={e => set("building", e.target.value)}
              style={{ width:"100%", border:`1.5px solid ${bdr}`, borderRadius:8, padding:"8px 12px", fontSize:12.5, outline:"none", fontFamily:"inherit", appearance:"none", cursor:"pointer", background:card, color:text }}>
              {BUILDINGS.slice(1).map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display:"flex", gap:10, marginTop:20 }}>
          <button onClick={onClose} style={{ flex:1, padding:"10px", borderRadius:10, border:`1.5px solid ${bdr}`, background:card, fontSize:13, fontWeight:600, cursor:"pointer", color:muted }}>Cancel</button>
          <button onClick={handleAdd} style={{ flex:2, padding:"10px", borderRadius:10, border:"none", background:"#E8344E", color:"white", fontSize:13, fontWeight:700, cursor:"pointer" }}>Add Tenant</button>
        </div>
      </div>
    </div>
  );
}

// ── Payment Modal ──────────────────────────────────────────────────────────────
function PaymentModal({ tenant, onClose, onSave, dark }) {
  const card  = dark ? "#1E293B" : "white";
  const muted = dark ? "#94A3B8" : "#9CA3AF";
  const [status, setStatus] = useState(tenant.status);
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.45)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:card, borderRadius:18, padding:26, width:340, boxShadow:"0 28px 60px rgba(0,0,0,.22)" }}>
        <h2 style={{ fontSize:15, fontWeight:700, marginBottom:4 }}>Update Payment</h2>
        <p style={{ fontSize:12, color:muted, marginBottom:18 }}>{tenant.name} · {tenant.unit} · ${tenant.amount}/mo</p>
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
          {["Paid","Pending","Overdue"].map(s => {
            const cur = status === s;
            return (
              <button key={s} onClick={() => setStatus(s)}
                style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 14px", borderRadius:11, border:`2px solid ${cur ? "#E8344E" : "#e2e8f0"}`, background:cur ? "#FEF2F2" : card, cursor:"pointer", transition:"all .15s" }}>
                <div style={{ width:11, height:11, borderRadius:"50%", background:T_STATUS[s].dot, flexShrink:0 }}/>
                <span style={{ fontSize:13, fontWeight:600, color:cur ? "#E8344E" : "#374151" }}>{s}</span>
                {cur && <span style={{ marginLeft:"auto", color:"#E8344E" }}>{IC.Check(12)}</span>}
              </button>
            );
          })}
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onClose} style={{ flex:1, padding:"10px", borderRadius:10, border:"1.5px solid #e2e8f0", background:card, fontSize:13, fontWeight:600, cursor:"pointer", color:muted }}>Cancel</button>
          <button onClick={() => { onSave(tenant.id, status); onClose(); }} style={{ flex:2, padding:"10px", borderRadius:10, border:"none", background:"#E8344E", color:"white", fontSize:13, fontWeight:700, cursor:"pointer" }}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────────
export default function GuriGateCustomers() {
  const [activeNav, setActiveNav] = useState("Customer");
  const [dark,      setDark]      = useState(false);
  const [tenants,   setTenants]   = useState(INIT_TENANTS);
  const [sel,       setSel]       = useState(INIT_TENANTS[4]);
  const [bldg,      setBldg]      = useState("All");
  const [statusF,   setStatusF]   = useState("All");
  const [search,    setSearch]    = useState("");
  const [payModal,  setPayModal]  = useState(null);
  const [showAdd,   setShowAdd]   = useState(false);

  const bg   = dark ? "#0F172A" : "#F8F9FC";
  const card = dark ? "#1E293B" : "white";
  const bdr  = dark ? "#334155" : "#F1F5F9";
  const muted= dark ? "#94A3B8" : "#9CA3AF";
  const text = dark ? "#E2E8F0" : "#111827";

  const filtered = tenants.filter(t =>
    (bldg === "All" || t.building === bldg) &&
    (statusF === "All" || t.status === statusF) &&
    (t.name.toLowerCase().includes(search.toLowerCase()) ||
     t.phone.includes(search) ||
     t.unit.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = {
    total:   tenants.length,
    paid:    tenants.filter(t => t.status === "Paid").length,
    pending: tenants.filter(t => t.status === "Pending").length,
    overdue: tenants.filter(t => t.status === "Overdue").length,
    rev:     tenants.filter(t => t.status === "Paid").reduce((s, t) => s + t.amount, 0),
  };

  const addTenant    = (t) => setTenants(p => [...p, t]);
  const deleteTenant = (id) => { setTenants(p => p.filter(t => t.id !== id)); if (sel?.id === id) setSel(null); };
  const updateStatus = (id, status) => {
    setTenants(p => p.map(t => t.id === id ? { ...t, status } : t));
    if (sel?.id === id) setSel(p => ({ ...p, status }));
  };

  return (
    <div style={{ fontFamily:"'DM Sans', system-ui, sans-serif", background:bg, minHeight:"100vh", display:"flex", color:text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        @import url('https://cdn-uicons.flaticon.com/2.6.0/uicons-solid-straight/css/uicons-solid-straight.css');
        @import url('https://cdn-uicons.flaticon.com/2.6.0/uicons-solid-rounded/css/uicons-solid-rounded.css');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:3px; } ::-webkit-scrollbar-thumb { background:#fca5a5; border-radius:4px; }
        input,select,button { font-family:'DM Sans',system-ui,sans-serif; }
        .nav-btn { display:flex; align-items:center; gap:10px; padding:9px 14px; border-radius:10px; cursor:pointer; font-size:13px; font-weight:500; transition:all .15s; width:100%; border:none; background:none; text-align:left; }
        .nav-btn:hover { background:rgba(232,52,78,0.06); color:#E8344E; }
        .nav-btn.active { background:rgba(232,52,78,0.10); color:#E8344E; font-weight:600; }
        .toggle { width:36px; height:20px; border-radius:20px; position:relative; cursor:pointer; border:none; transition:background .2s; flex-shrink:0; }
        .toggle-knob { position:absolute; width:14px; height:14px; background:white; border-radius:50%; top:3px; left:3px; transition:transform .2s; box-shadow:0 1px 3px rgba(0,0,0,.2); }
        .row { transition:background .1s; cursor:pointer; }
        .row:hover td { background:rgba(232,52,78,0.025); }
        .row.sel td { background:rgba(232,52,78,0.06); }
        .ic-btn { width:27px; height:27px; border-radius:7px; border:1.5px solid; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .15s; }
        .filter-btn { padding:5px 12px; border-radius:20px; border:1.5px solid; font-size:10.5px; font-weight:600; cursor:pointer; transition:all .15s; white-space:nowrap; }
        .status-btn { padding:5px 10px; border-radius:8px; border:1.5px solid; font-size:10.5px; font-weight:600; cursor:pointer; transition:all .15s; }
        .action-icon-btn { padding:5px; border:none; background:none; cursor:pointer; transition:opacity .15s; }
        .action-icon-btn:hover { opacity:.7; }
      `}</style>

      {/* ── Sidebar ── */}
      <aside style={{ width:200, flexShrink:0, background:card, borderRight:`1px solid ${bdr}`, display:"flex", flexDirection:"column", padding:"20px 12px", position:"sticky", top:0, height:"100vh", overflowY:"auto" }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:28, paddingLeft:6 }}>
          <div style={{ width:30, height:30, background:"#E8344E", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:"white" }}>
            {IC.Home(14)}
          </div>
          <span style={{ fontWeight:700, fontSize:16, letterSpacing:"-0.3px" }}>GuriGate</span>
        </div>

        {/* Nav */}
        {[["MAIN", NAV_ITEMS.filter(n => n.section === "main")], ["APPS", NAV_ITEMS.filter(n => n.section === "apps")]].map(([label, items]) => (
          <div key={label} style={{ marginBottom:20 }}>
            <p style={{ fontSize:10, fontWeight:700, letterSpacing:"0.08em", color:muted, padding:"0 14px 8px" }}>{label}</p>
            {items.map(item => (
              <button key={item.id} className={`nav-btn${activeNav === item.id ? " active" : ""}`}
                onClick={() => setActiveNav(item.id)}
                style={{ color: activeNav === item.id ? "#E8344E" : muted }}>
                <span style={{ opacity:.85 }}>{item.icon(15)}</span>{item.id}
              </button>
            ))}
          </div>
        ))}

        {/* Dark mode */}
        <div style={{ marginTop:"auto" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", borderRadius:10, background:dark ? "#334155" : "#FEF2F2" }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, fontWeight:500, color:muted }}>
              {IC.Moon(14)} Dark Mode
            </div>
            <button className="toggle" onClick={() => setDark(!dark)} style={{ background: dark ? "#E8344E" : "#e2e8f0" }}>
              <div className="toggle-knob" style={{ transform: dark ? "translateX(16px)" : "none" }}/>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>

        {/* Topbar */}
        <header style={{ background:card, borderBottom:`1px solid ${bdr}`, padding:"0 24px", height:58, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:30, flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, background:dark ? "#334155" : "#F1F5F9", border:`1px solid ${bdr}`, borderRadius:10, padding:"6px 14px", width:280 }}>
            {IC.Search(14)}
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tenant, unit, phone…"
              style={{ border:"none", outline:"none", background:"transparent", fontSize:12, color:text, width:"100%" }}/>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button style={{ background:"none", border:"none", cursor:"pointer", color:muted, position:"relative" }}>
              {IC.Bell(16)}
              <span style={{ position:"absolute", top:-2, right:-2, width:7, height:7, background:"#E8344E", borderRadius:"50%", border:"1.5px solid white" }}/>
            </button>
            <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&q=80" alt=""
              style={{ width:32, height:32, borderRadius:"50%", objectFit:"cover" }}/>
          </div>
        </header>

        {/* Content */}
        <main style={{ padding:"22px 24px", flex:1, overflowY:"auto" }}>

          {/* Page heading */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
            <div>
              <h1 style={{ fontSize:20, fontWeight:700, letterSpacing:"-0.4px" }}>Tenant Management</h1>
              <p style={{ fontSize:11, color:muted, marginTop:3, display:"flex", alignItems:"center", gap:4 }}>
                {IC.MapPin(11)} Hargeisa, Somaliland
              </p>
            </div>
            <button onClick={() => setShowAdd(true)}
              style={{ display:"flex", alignItems:"center", gap:6, background:"#E8344E", color:"white", border:"none", borderRadius:10, padding:"9px 16px", fontSize:12.5, fontWeight:700, cursor:"pointer", boxShadow:"0 3px 12px rgba(232,52,78,.35)" }}>
              {IC.Plus(13)} Add Tenant
            </button>
          </div>

          {/* ── Stat cards ── */}
          <div style={{ display:"flex", gap:11, marginBottom:18 }}>
            {/* Total Tenants — fi-sr-apartment */}
            <div style={{ flex:1, background:card, border:`1px solid ${bdr}`, borderRadius:12, padding:"14px 16px" }}>
              <div style={{ width:34, height:34, borderRadius:9, background:"#FEF2F2", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:9 }}>
                <i className="fi fi-sr-apartment" style={{ fontSize:16, color:"#E8344E", lineHeight:1 }}/>
              </div>
              <p style={{ fontSize:20, fontWeight:800, color:"#E8344E", letterSpacing:"-0.5px" }}>{stats.total}</p>
              <p style={{ fontSize:10.5, color:muted, marginTop:2, fontWeight:500 }}>Total Tenants</p>
            </div>

            {/* Paid This Month — fi-ss-receipt */}
            <div style={{ flex:1, background:card, border:`1px solid ${bdr}`, borderRadius:12, padding:"14px 16px" }}>
              <div style={{ width:34, height:34, borderRadius:9, background:"#dcfce7", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:9 }}>
                <i className="fi fi-ss-receipt" style={{ fontSize:16, color:"#059669", lineHeight:1 }}/>
              </div>
              <p style={{ fontSize:20, fontWeight:800, color:"#059669", letterSpacing:"-0.5px" }}>{stats.paid}</p>
              <p style={{ fontSize:10.5, color:muted, marginTop:2, fontWeight:500 }}>Paid This Month</p>
            </div>

            {/* Pending */}
            <div style={{ flex:1, background:card, border:`1px solid ${bdr}`, borderRadius:12, padding:"14px 16px" }}>
              <div style={{ width:34, height:34, borderRadius:9, background:"#FFF7ED", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:9 }}>
                <span style={{ fontSize:17 }}>⏳</span>
              </div>
              <p style={{ fontSize:20, fontWeight:800, color:"#d97706", letterSpacing:"-0.5px" }}>{stats.pending}</p>
              <p style={{ fontSize:10.5, color:muted, marginTop:2, fontWeight:500 }}>Pending</p>
            </div>

            {/* Overdue */}
            <div style={{ flex:1, background:card, border:`1px solid ${bdr}`, borderRadius:12, padding:"14px 16px" }}>
              <div style={{ width:34, height:34, borderRadius:9, background:"#FEF2F2", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:9 }}>
                <span style={{ fontSize:17 }}>🚨</span>
              </div>
              <p style={{ fontSize:20, fontWeight:800, color:"#dc2626", letterSpacing:"-0.5px" }}>{stats.overdue}</p>
              <p style={{ fontSize:10.5, color:muted, marginTop:2, fontWeight:500 }}>Overdue</p>
            </div>

            {/* Revenue */}
            <div style={{ flex:1, background:card, border:`1px solid ${bdr}`, borderRadius:12, padding:"14px 16px" }}>
              <div style={{ width:34, height:34, borderRadius:9, background:"#FEF2F2", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:9 }}>
                <span style={{ fontSize:17 }}>💰</span>
              </div>
              <p style={{ fontSize:20, fontWeight:800, color:"#E8344E", letterSpacing:"-0.5px" }}>${stats.rev.toLocaleString()}</p>
              <p style={{ fontSize:10.5, color:muted, marginTop:2, fontWeight:500 }}>Monthly Revenue</p>
            </div>
          </div>

          {/* ── Two-column: table + detail ── */}
          <div style={{ display:"flex", gap:14 }}>

            {/* Table column */}
            <div style={{ flex:1, minWidth:0 }}>

              {/* Filter bar */}
              <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:12, flexWrap:"wrap" }}>
                {/* Building pills */}
                <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                  {BUILDINGS.map(b => (
                    <button key={b} className="filter-btn" onClick={() => setBldg(b)}
                      style={{ background: bldg === b ? "#E8344E" : card, color: bldg === b ? "white" : muted, borderColor: bldg === b ? "#E8344E" : bdr }}>
                      {b}
                    </button>
                  ))}
                </div>
                {/* Status pills */}
                <div style={{ display:"flex", gap:5, marginLeft:"auto" }}>
                  {["All","Paid","Pending","Overdue"].map(s => (
                    <button key={s} className="status-btn" onClick={() => setStatusF(s)}
                      style={{ background: statusF === s ? "#FEF2F2" : card, color: statusF === s ? "#E8344E" : muted, borderColor: statusF === s ? "#E8344E" : bdr }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div style={{ background:card, border:`1px solid ${bdr}`, borderRadius:14, overflow:"hidden" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                  <thead>
                    <tr style={{ borderBottom:`1px solid ${bdr}` }}>
                      {["Name","Phone","Rooms","Rented Area","Payment Date","Amount","Payment Status",""].map(h => (
                        <th key={h} style={{ padding:"10px 13px", textAlign:"left", fontSize:10.5, fontWeight:700, color:muted, letterSpacing:"0.03em", whiteSpace:"nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0
                      ? <tr><td colSpan={8} style={{ padding:"32px", textAlign:"center", color:muted, fontSize:13 }}>No tenants found</td></tr>
                      : filtered.map((t, idx) => {
                        const isSel = sel?.id === t.id;
                        return (
                          <tr key={t.id} className={`row${isSel ? " sel" : ""}`} onClick={() => setSel(t)}
                            style={{ borderBottom: idx < filtered.length - 1 ? `1px solid ${bdr}` : "none" }}>
                            {/* Name */}
                            <td style={{ padding:"11px 13px" }}>
                              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                                <Avatar name={t.name} size={28}/>
                                <span style={{ fontWeight:600, color: isSel ? "#E8344E" : text, fontSize:12.5 }}>{t.name}</span>
                              </div>
                            </td>
                            {/* Phone */}
                            <td style={{ padding:"11px 13px", color:muted, fontSize:11.5 }}>{t.phone}</td>
                            {/* Rooms */}
                            <td style={{ padding:"11px 13px" }}>
                              <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                                {IC.Door(13)}
                                <span style={{ fontWeight:600, color:text, fontSize:11.5 }}>{ROOM_LABEL[t.rooms]}</span>
                              </div>
                            </td>
                            {/* Rented Area */}
                            <td style={{ padding:"11px 13px" }}>
                              <p style={{ fontWeight:600, fontSize:11.5, color:text }}>{t.building}</p>
                              <p style={{ color:muted, fontSize:10 }}>Unit {t.unit}</p>
                            </td>
                            {/* Payment Date */}
                            <td style={{ padding:"11px 13px", color:muted, fontSize:11.5 }}>{t.nextDue}</td>
                            {/* Amount */}
                            <td style={{ padding:"11px 13px", fontWeight:700, color:"#E8344E", fontSize:12.5 }}>${t.amount}</td>
                            {/* Status */}
                            <td style={{ padding:"11px 13px" }}>
                              <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"4px 10px", borderRadius:20, fontSize:10.5, fontWeight:700, background:T_STATUS[t.status].bg, color:T_STATUS[t.status].color }}>
                                <span style={{ width:5, height:5, borderRadius:"50%", background:T_STATUS[t.status].dot, flexShrink:0 }}/>
                                {t.status}
                              </span>
                            </td>
                            {/* Actions */}
                            <td style={{ padding:"11px 13px" }}>
                              <div style={{ display:"flex", gap:5 }}>
                                <button className="ic-btn" title="Update payment"
                                  onClick={e => { e.stopPropagation(); setPayModal(t); }}
                                  style={{ borderColor:bdr, background:"transparent", color:muted }}
                                  onMouseEnter={e => { e.currentTarget.style.borderColor="#E8344E"; e.currentTarget.style.color="#E8344E"; }}
                                  onMouseLeave={e => { e.currentTarget.style.borderColor=bdr; e.currentTarget.style.color=muted; }}>
                                  {IC.CreditCard(12)}
                                </button>
                                <button className="ic-btn" title="Delete tenant"
                                  onClick={e => { e.stopPropagation(); deleteTenant(t.id); }}
                                  style={{ borderColor:bdr, background:"transparent", color:"#dc2626" }}
                                  onMouseEnter={e => { e.currentTarget.style.borderColor="#dc2626"; e.currentTarget.style.background="#FEF2F2"; }}
                                  onMouseLeave={e => { e.currentTarget.style.borderColor=bdr; e.currentTarget.style.background="transparent"; }}>
                                  {IC.Trash(12)}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    }
                  </tbody>
                </table>
                <div style={{ padding:"10px 13px", borderTop:`1px solid ${bdr}`, fontSize:11, color:muted, fontWeight:500 }}>
                  Showing {filtered.length} of {tenants.length} tenants
                </div>
              </div>
            </div>

            {/* ── Detail panel ── */}
            {sel && (
              <div style={{ width:242, flexShrink:0, background:card, border:`1px solid ${bdr}`, borderRadius:14, overflow:"hidden", alignSelf:"flex-start" }}>
                {/* Gradient header */}
                <div style={{ background:"linear-gradient(135deg,#E8344E,#ff6b6b)", padding:"20px 16px 16px", display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
                  <Avatar name={sel.name} size={58}/>
                  <p style={{ fontWeight:700, fontSize:14, color:"white", textAlign:"center", lineHeight:1.3 }}>{sel.name}</p>
                  <span style={{ fontSize:10, fontWeight:700, background:"rgba(255,255,255,.22)", color:"white", padding:"2px 12px", borderRadius:20, letterSpacing:"0.05em" }}>{sel.id}</span>
                </div>

                {/* Contact buttons */}
                <div style={{ display:"flex", justifyContent:"center", gap:10, padding:"13px 16px", borderBottom:`1px solid ${bdr}` }}>
                  {[IC.Chat, IC.Phone, IC.Mail].map((ic, i) => (
                    <button key={i}
                      style={{ width:34, height:34, borderRadius:9, border:`1.5px solid ${bdr}`, background:"transparent", display:"flex", alignItems:"center", justifyContent:"center", color:muted, cursor:"pointer", transition:"all .15s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor="#E8344E"; e.currentTarget.style.color="#E8344E"; e.currentTarget.style.background="#FEF2F2"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor=bdr; e.currentTarget.style.color=muted; e.currentTarget.style.background="transparent"; }}>
                      {ic(14)}
                    </button>
                  ))}
                </div>

                {/* Tenant details */}
                <div style={{ padding:"14px 16px", display:"flex", flexDirection:"column", gap:11 }}>
                  {[
                    ["Phone",       sel.phone],
                    ["Building",    sel.building],
                    ["Unit",        sel.unit],
                    ["Rooms",       ROOM_LABEL[sel.rooms]],
                    ["Monthly Rent","$" + sel.amount],
                    ["Rent Since",  sel.rentDate],
                    ["Next Due",    sel.nextDue],
                  ].map(([l, v]) => (
                    <div key={l} style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <span style={{ fontSize:10, fontWeight:700, color:muted, textTransform:"uppercase", letterSpacing:"0.05em", flexShrink:0 }}>{l}</span>
                      <span style={{ fontSize:11.5, fontWeight:600, color:text, textAlign:"right", maxWidth:135 }}>{v}</span>
                    </div>
                  ))}

                  {/* Status */}
                  <div>
                    <p style={{ fontSize:10, fontWeight:700, color:muted, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:7 }}>Payment Status</p>
                    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"5px 14px", borderRadius:20, fontSize:12, fontWeight:700, background:T_STATUS[sel.status].bg, color:T_STATUS[sel.status].color }}>
                      <span style={{ width:7, height:7, borderRadius:"50%", background:T_STATUS[sel.status].dot }}/>
                      {sel.status}
                    </span>
                  </div>

                  {/* CTA */}
                  <button onClick={() => setPayModal(sel)}
                    style={{ width:"100%", padding:"10px", borderRadius:10, border:"none", background:"#E8344E", color:"white", fontSize:12.5, fontWeight:700, cursor:"pointer", marginTop:4, display:"flex", alignItems:"center", justifyContent:"center", gap:6, boxShadow:"0 3px 10px rgba(232,52,78,.3)" }}>
                    {IC.CreditCard(13)} Update Payment
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      {showAdd  && <AddTenantModal onClose={() => setShowAdd(false)}  onAdd={addTenant} dark={dark}/>}
      {payModal && <PaymentModal   tenant={payModal} onClose={() => setPayModal(null)} onSave={updateStatus} dark={dark}/>}
    </div>
  );
}