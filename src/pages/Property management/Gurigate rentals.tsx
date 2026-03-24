import { useState } from "react";

const Icon = {
  Home: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Grid: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  Compass: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>,
  Building: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18z"/><path d="M6 12H4a2 2 0 00-2 2v6a2 2 0 002 2h2"/><path d="M18 9h2a2 2 0 012 2v9a2 2 0 01-2 2h-2"/></svg>,
  Users: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  User: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  BarChart: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>,
  ShoppingBag: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  CreditCard: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  Inbox: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>,
  Calendar: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Search: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Bell: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  Smile: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
  ChevronDown: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  MoreVert: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>,
  Moon: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
  Plus: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Phone: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 .18h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.11 7.83a16 16 0 006.06 6.06l1.21-1.21a2 2 0 012.11-.45c.9.33 1.85.55 2.81.7a2 2 0 011.71 2z"/></svg>,
  Mail: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Chat: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  Edit: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
  Check: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  X: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Door: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M9 21V5a2 2 0 012-2h2a2 2 0 012 2v16"/><circle cx="14" cy="13" r="1" fill="currentColor"/></svg>,
  MapPin: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Upload: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Filter: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
};

const NAV_ITEMS = [
  { label:"Dashboard",   icon:<Icon.Grid/>,        section:"main" },
  { label:"Discover",    icon:<Icon.Compass/>,      section:"main" },
  { label:"Property",    icon:<Icon.Building/>,     section:"main" },
  { label:"Agents",      icon:<Icon.Users/>,        section:"main" },
  { label:"Customer",    icon:<Icon.User/>,         section:"main" },
  { label:"Analytics",   icon:<Icon.BarChart/>,     section:"main" },
  { label:"Order",       icon:<Icon.ShoppingBag/>,  section:"main" },
  { label:"Transaction", icon:<Icon.CreditCard/>,   section:"main" },
  { label:"Inbox",       icon:<Icon.Inbox/>,        section:"apps" },
  { label:"Calendar",    icon:<Icon.Calendar/>,     section:"apps" },
];

// ── Buildings & Tenants ───────────────────────────────────────────────────────
const BUILDINGS = ["All", "Burjiomar A", "Burjiomar B", "Kulmiye Tower", "Sha'ab Complex"];

const INITIAL_TENANTS = [
  { id:"T-001", name:"Axmed Cabdalle",   phone:"+252 63 4112233", rooms:1, building:"Burjiomar A",    unit:"A-101", rentDate:"2024-01-05", nextDue:"2025-04-05", amount:150,  status:"Paid",    avatar:null },
  { id:"T-002", name:"Faadumo Xasan",    phone:"+252 63 5221144", rooms:2, building:"Burjiomar A",    unit:"A-203", rentDate:"2024-02-10", nextDue:"2025-04-10", amount:280,  status:"Paid",    avatar:null },
  { id:"T-003", name:"Cabdi Warsame",    phone:"+252 63 6330055", rooms:3, building:"Burjiomar B",    unit:"B-301", rentDate:"2023-11-01", nextDue:"2025-04-01", amount:420,  status:"Overdue", avatar:null },
  { id:"T-004", name:"Sahra Maxamed",    phone:"+252 63 7441166", rooms:1, building:"Burjiomar B",    unit:"B-105", rentDate:"2024-03-15", nextDue:"2025-04-15", amount:150,  status:"Paid",    avatar:null },
  { id:"T-005", name:"Mustafe Nuur",     phone:"+252 63 8552277", rooms:2, building:"Kulmiye Tower",  unit:"K-214", rentDate:"2024-01-20", nextDue:"2025-04-20", amount:300,  status:"Pending", avatar:null },
  { id:"T-006", name:"Hodan Jaamac",     phone:"+252 63 9663388", rooms:1, building:"Kulmiye Tower",  unit:"K-108", rentDate:"2024-04-01", nextDue:"2025-05-01", amount:160,  status:"Paid",    avatar:null },
  { id:"T-007", name:"Xuseen Geelle",    phone:"+252 63 1774499", rooms:3, building:"Sha'ab Complex", unit:"S-302", rentDate:"2023-09-12", nextDue:"2025-04-12", amount:450,  status:"Overdue", avatar:null },
  { id:"T-008", name:"Nimco Cabdiraxman",phone:"+252 63 2885500", rooms:2, building:"Sha'ab Complex", unit:"S-207", rentDate:"2024-02-28", nextDue:"2025-04-28", amount:290,  status:"Paid",    avatar:null },
  { id:"T-009", name:"Daud Xirsi",       phone:"+252 63 3996611", rooms:1, building:"Burjiomar A",    unit:"A-112", rentDate:"2024-05-05", nextDue:"2025-05-05", amount:155,  status:"Pending", avatar:null },
  { id:"T-010", name:"Leyla Rashid",     phone:"+252 63 4007722", rooms:2, building:"Burjiomar B",    unit:"B-210", rentDate:"2024-03-01", nextDue:"2025-04-01", amount:275,  status:"Paid",    avatar:null },
  { id:"T-011", name:"Warsan Guure",     phone:"+252 63 5118833", rooms:3, building:"Kulmiye Tower",  unit:"K-315", rentDate:"2023-12-20", nextDue:"2025-04-20", amount:430,  status:"Overdue", avatar:null },
  { id:"T-012", name:"Bashir Ciise",     phone:"+252 63 6229944", rooms:1, building:"Sha'ab Complex", unit:"S-103", rentDate:"2024-06-10", nextDue:"2025-06-10", amount:145,  status:"Paid",    avatar:null },
];

const STATUS_STYLE = {
  Paid:    { bg:"#dcfce7", color:"#15803d", dot:"#22c55e" },
  Pending: { bg:"#FFF7ED", color:"#c2410c", dot:"#f97316" },
  Overdue: { bg:"#FEF2F2", color:"#b91c1c", dot:"#E8344E" },
};

const ROOM_LABEL = { 1:"1 Room", 2:"2 Rooms", 3:"3 Rooms" };

function Avatar({ name, size=30, style={} }) {
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

// ── Add Tenant Modal ──────────────────────────────────────────────────────────
function AddTenantModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name:"", phone:"", rooms:"1", building:BUILDINGS[1], unit:"", amount:"", nextDue:"" });
  const set = (k,v) => setForm(p=>({...p,[k]:v}));
  const handleAdd = () => {
    if (!form.name || !form.phone) return;
    onAdd({
      id:`T-${String(Math.floor(Math.random()*900)+100)}`,
      name:form.name, phone:form.phone, rooms:parseInt(form.rooms),
      building:form.building, unit:form.unit,
      rentDate:new Date().toISOString().slice(0,10),
      nextDue:form.nextDue || "2025-05-01",
      amount:parseFloat(form.amount)||0, status:"Pending", avatar:null,
    });
    onClose();
  };
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.35)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"white", borderRadius:18, padding:28, width:440, boxShadow:"0 24px 60px rgba(0,0,0,.18)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <h2 style={{ fontSize:16, fontWeight:700 }}>Add New Tenant</h2>
          <button onClick={onClose} style={{ background:"#f1f5f9", border:"none", borderRadius:8, width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#64748b" }}><Icon.X/></button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {[
            { label:"Full Name", key:"name", placeholder:"Axmed Cabdalle", full:true },
            { label:"Phone", key:"phone", placeholder:"+252 63 xxxxxxx" },
            { label:"Unit No.", key:"unit", placeholder:"A-101" },
            { label:"Monthly Rent ($)", key:"amount", placeholder:"150" },
            { label:"Next Due Date", key:"nextDue", placeholder:"", type:"date" },
          ].map(f => (
            <div key={f.key} style={{ gridColumn:f.full?"span 2":"span 1" }}>
              <label style={{ fontSize:11, fontWeight:600, color:"#64748b", display:"block", marginBottom:4 }}>{f.label}</label>
              <input type={f.type||"text"} placeholder={f.placeholder} value={form[f.key]} onChange={e=>set(f.key,e.target.value)}
                style={{ width:"100%", border:"1.5px solid #e2e8f0", borderRadius:8, padding:"8px 12px", fontSize:12, outline:"none", fontFamily:"inherit", color:"#111827", transition:"border .15s" }}
                onFocus={e=>e.target.style.borderColor="#E8344E"}
                onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
            </div>
          ))}
          <div>
            <label style={{ fontSize:11, fontWeight:600, color:"#64748b", display:"block", marginBottom:4 }}>Rooms</label>
            <select value={form.rooms} onChange={e=>set("rooms",e.target.value)} style={{ width:"100%", border:"1.5px solid #e2e8f0", borderRadius:8, padding:"8px 12px", fontSize:12, outline:"none", fontFamily:"inherit", appearance:"none", cursor:"pointer" }}>
              <option value="1">1 Room</option>
              <option value="2">2 Rooms</option>
              <option value="3">3 Rooms</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize:11, fontWeight:600, color:"#64748b", display:"block", marginBottom:4 }}>Building</label>
            <select value={form.building} onChange={e=>set("building",e.target.value)} style={{ width:"100%", border:"1.5px solid #e2e8f0", borderRadius:8, padding:"8px 12px", fontSize:12, outline:"none", fontFamily:"inherit", appearance:"none", cursor:"pointer" }}>
              {BUILDINGS.slice(1).map(b=><option key={b}>{b}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display:"flex", gap:10, marginTop:20 }}>
          <button onClick={onClose} style={{ flex:1, padding:"10px", borderRadius:10, border:"1.5px solid #e2e8f0", background:"white", fontSize:13, fontWeight:600, cursor:"pointer", color:"#64748b" }}>Cancel</button>
          <button onClick={handleAdd} style={{ flex:2, padding:"10px", borderRadius:10, border:"none", background:"#E8344E", color:"white", fontSize:13, fontWeight:700, cursor:"pointer" }}>Add Tenant</button>
        </div>
      </div>
    </div>
  );
}

// ── Mark Payment Modal ────────────────────────────────────────────────────────
function PaymentModal({ tenant, onClose, onUpdate }) {
  const [status, setStatus] = useState(tenant.status);
  const save = () => { onUpdate(tenant.id, status); onClose(); };
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.35)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"white", borderRadius:18, padding:28, width:360, boxShadow:"0 24px 60px rgba(0,0,0,.18)" }}>
        <h2 style={{ fontSize:15, fontWeight:700, marginBottom:4 }}>Update Payment</h2>
        <p style={{ fontSize:12, color:"#94a3b8", marginBottom:18 }}>{tenant.name} · {tenant.unit} · ${tenant.amount}/mo</p>
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
          {["Paid","Pending","Overdue"].map(s=>(
            <button key={s} onClick={()=>setStatus(s)} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:10, border:`2px solid ${status===s?"#E8344E":"#e2e8f0"}`, background:status===s?"#FEF2F2":"white", cursor:"pointer", transition:"all .15s" }}>
              <div style={{ width:12, height:12, borderRadius:"50%", background:STATUS_STYLE[s].dot, flexShrink:0 }}/>
              <span style={{ fontSize:13, fontWeight:600, color:status===s?"#E8344E":"#374151" }}>{s}</span>
              {status===s && <span style={{ marginLeft:"auto", color:"#E8344E" }}><Icon.Check/></span>}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onClose} style={{ flex:1, padding:"10px", borderRadius:10, border:"1.5px solid #e2e8f0", background:"white", fontSize:13, fontWeight:600, cursor:"pointer", color:"#64748b" }}>Cancel</button>
          <button onClick={save} style={{ flex:2, padding:"10px", borderRadius:10, border:"none", background:"#E8344E", color:"white", fontSize:13, fontWeight:700, cursor:"pointer" }}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function GuriGateRentals() {
  const [darkMode, setDarkMode] = useState(false);
  const [tenants, setTenants] = useState(INITIAL_TENANTS);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [buildingFilter, setBuildingFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const bg     = darkMode ? "#0F172A" : "#F8F9FC";
  const card   = darkMode ? "#1E293B" : "white";
  const bdr    = darkMode ? "#334155" : "#F1F5F9";
  const muted  = darkMode ? "#94A3B8" : "#9CA3AF";
  const text   = darkMode ? "#E2E8F0" : "#111827";
  const rowHov = darkMode ? "#1e3a5f" : "#FEF2F2";

  const filtered = tenants.filter(t =>
    (buildingFilter === "All" || t.building === buildingFilter) &&
    (statusFilter === "All" || t.status === statusFilter) &&
    (t.name.toLowerCase().includes(search.toLowerCase()) ||
     t.phone.includes(search) ||
     t.unit.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = {
    total: tenants.length,
    paid: tenants.filter(t=>t.status==="Paid").length,
    overdue: tenants.filter(t=>t.status==="Overdue").length,
    pending: tenants.filter(t=>t.status==="Pending").length,
    revenue: tenants.filter(t=>t.status==="Paid").reduce((s,t)=>s+t.amount,0),
  };

  const addTenant = (t) => setTenants(p=>[...p,t]);
  const updateStatus = (id, status) => {
    setTenants(p=>p.map(t=>t.id===id?{...t,status}:t));
    if (selectedTenant?.id===id) setSelectedTenant(p=>({...p,status}));
  };
  const deleteTenant = (id) => {
    setTenants(p=>p.filter(t=>t.id!==id));
    if (selectedTenant?.id===id) setSelectedTenant(tenants.find(t=>t.id!==id)||null);
  };

  return (
    <div style={{ padding:"28px", flex:1, overflowY:"auto" }}>
      {/* Page heading */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:"-0.4px", color:text }}>Rental Management</h1>
          <p style={{ fontSize:12, color:muted, marginTop:2 }}>Manage your rental properties and tenants</p>
        </div>
        <button onClick={()=>setShowAddModal(true)} style={{ display:"flex", alignItems:"center", gap:6, background:"#E8344E", color:"white", border:"none", borderRadius:10, padding:"10px 18px", fontSize:13, fontWeight:600, cursor:"pointer" }}>
          <Icon.Plus/> Add Tenant
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
        {[
          { label:"Total Tenants", value:"24", change:"+2", up:true, icon:<Icon.Users/> },
          { label:"Active Leases", value:"18", change:"+1", up:true, icon:<Icon.Home/> },
          { label:"Pending Payments", value:"3", change:"-1", up:false, icon:<Icon.CreditCard/> },
          { label:"Occupancy Rate", value:"75%", change:"+5%", up:true, icon:<Icon.BarChart/> },
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

      {/* Filters */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20, flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, background:card, border:`1px solid ${bdr}`, borderRadius:10, padding:"8px 12px" }}>
          <Icon.Filter style={{ color:muted }}/>
          <select value={buildingFilter} onChange={e=>setBuildingFilter(e.target.value)} style={{ border:"none", outline:"none", background:"transparent", color:text, fontSize:13, cursor:"pointer" }}>
            {BUILDINGS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6, background:card, border:`1px solid ${bdr}`, borderRadius:10, padding:"8px 12px" }}>
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{ border:"none", outline:"none", background:"transparent", color:text, fontSize:13, cursor:"pointer" }}>
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6, background:card, border:`1px solid ${bdr}`, borderRadius:10, padding:"8px 12px", flex:1, maxWidth:300 }}>
          <Icon.Search style={{ color:muted }}/>
          <input placeholder="Search tenants..." value={search} onChange={e=>setSearch(e.target.value)} style={{ border:"none", outline:"none", background:"transparent", color:text, fontSize:13, width:"100%" }}/>
        </div>
      </div>

      {/* Table */}
      <div style={{ background:card, borderRadius:16, border:`1px solid ${bdr}`, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr style={{ borderBottom:`1px solid ${bdr}` }}>
              {["Tenant","Contact","Building","Unit","Rent","Status","Join Date",""].map((h,i) => (
                <th key={i} style={{ padding:"12px 14px", textAlign:"left", fontWeight:600, fontSize:11, color:muted, whiteSpace:"nowrap", letterSpacing:"0.02em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length===0 ? (
              <tr><td colSpan={7} style={{ padding:"32px", textAlign:"center", color:muted, fontSize:13 }}>No tenants found</td></tr>
            ) : filtered.map((t) => (
              <tr key={t.id} style={{ borderBottom:`1px solid ${bdr}`, transition:"background .12s" }}
                  onMouseEnter={e=>{e.currentTarget.style.background="rgba(232,52,78,0.025)";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="";}}>
                <td style={{ padding:"12px 14px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <Avatar name={t.name} size={32}/>
                    <div>
                      <p style={{ fontWeight:600, color:text, fontSize:13 }}>{t.name}</p>
                      <p style={{ fontSize:11, color:muted }}>{t.phone}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding:"12px 14px", color:muted }}>{t.building}</td>
                <td style={{ padding:"12px 14px", color:muted }}>{t.unit}</td>
                <td style={{ padding:"12px 14px", fontWeight:600, color:text }}>${t.rent}/mo</td>
                <td style={{ padding:"12px 14px" }}>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 10px", borderRadius:12, fontSize:11, fontWeight:600,
                    background:t.status==="Active" ? "#F0FDF4" : t.status==="Pending" ? "#FEF3C7" : "#FEF2F2",
                    color:t.status==="Active" ? "#059669" : t.status==="Pending" ? "#D97706" : "#E8344E" }}>
                    {t.status}
                  </span>
                </td>
                <td style={{ padding:"12px 14px", color:muted, fontSize:12 }}>{t.joinDate}</td>
                <td style={{ padding:"12px 14px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <button onClick={()=>setShowPaymentModal(true)} style={{ background:"none", border:"none", cursor:"pointer", color:muted, padding:4 }}>
                      <Icon.CreditCard/>
                    </button>
                    <button onClick={()=>handleDelete(t.id)} style={{ background:"none", border:"none", cursor:"pointer", color:muted, padding:4 }}>
                      <Icon.Trash/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddTenantModal onClose={()=>setShowAddModal(false)} onAdd={handleAddTenant} buildings={BUILDINGS.slice(1)} />
      )}
      {showPaymentModal && selectedTenant && (
        <PaymentModal tenant={selectedTenant} onClose={()=>setShowPaymentModal(false)} onUpdate={handleUpdateStatus} />
      )}
    </div>
  );
}