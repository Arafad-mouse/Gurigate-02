import { useState } from "react";

const Icon = {
  Home: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Grid: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  Compass: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>,
  Building: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18z"/><path d="M6 12H4a2 2 0 00-2 2v6a2 2 0 002 2h2"/><path d="M18 9h2a2 2 0 012 2v9a2 2 0 01-2 2h-2"/></svg>,
  Users: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  User: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  BarChart: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>,
  ShoppingBag: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  CreditCard: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  Inbox: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>,
  Calendar: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Plus: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Search: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Bell: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  Smile: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
  ChevronDown: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  ChevronLeft: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevronRight: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  MoreVert: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>,
  Moon: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
  TrendUp: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  TrendDown: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>,
  Bed: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16M2 8h18a2 2 0 012 2v10M2 12h20M6 8v4"/></svg>,
  Wallet: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 010-4h14v4"/><path d="M3 5v14a2 2 0 002 2h16v-5"/><path d="M18 12a2 2 0 000 4h4v-4z"/></svg>,
  Package: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  Tag: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  Layers: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
};

const NAV_ITEMS = [
  { label:"Dashboard", icon:<Icon.Grid/>, section:"main" },
  { label:"Discover", icon:<Icon.Compass/>, section:"main" },
  { label:"Property", icon:<Icon.Building/>, section:"main", active:true },
  { label:"Agents", icon:<Icon.Users/>, section:"main" },
  { label:"Customer", icon:<Icon.User/>, section:"main" },
  { label:"Analytics", icon:<Icon.BarChart/>, section:"main" },
  { label:"Orders", icon:<Icon.ShoppingBag/>, section:"main" },
  { label:"Transaction", icon:<Icon.CreditCard/>, section:"main" },
  { label:"Inbox", icon:<Icon.Inbox/>, section:"apps" },
  { label:"Calendar", icon:<Icon.Calendar/>, section:"apps" },
];

const ALL_PROPERTIES = [
  { id:1, name:"New York", type:"House", size:"1400ft", status:"Sale", beds:5, location:"France", price:"$250,00 USD", img:"https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=60&q=80" },
  { id:2, name:"Washington Residence", type:"Villa", size:"1600ft", status:"Rent", beds:3, location:"Canada", price:"$87,00 USD", img:"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=60&q=80" },
  { id:3, name:"London Residence", type:"House", size:"1600ft", status:"Rent", beds:4, location:"England", price:"$200,00 USD", img:"https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=60&q=80" },
  { id:4, name:"Grand Resort Villa", type:"Villa", size:"1600ft", status:"Sold", beds:5, location:"Canada", price:"$350,00 USD", img:"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=60&q=80" },
  { id:5, name:"House Residence", type:"House", size:"1400ft", status:"Rent", beds:3, location:"France", price:"$350,00 USD", img:"https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=60&q=80" },
  { id:6, name:"Paris Square", type:"Villa", size:"1200ft", status:"Sold", beds:3, location:"German", price:"$250,00 USD", img:"https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=60&q=80" },
  { id:7, name:"Canada Residence", type:"Villa", size:"2400ft", status:"Rent", beds:6, location:"Portugal", price:"$150,00 USD", img:"https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=60&q=80" },
  { id:8, name:"Luxury Penthouse", type:"House", size:"2200ft", status:"Sale", beds:6, location:"Thailand", price:"$540,00 USD", img:"https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=60&q=80" },
  { id:9, name:"Duplex Bungalow", type:"Bungalow", size:"2200ft", status:"Rent", beds:6, location:"America", price:"$1500 USD", img:"https://images.unsplash.com/photo-1484154218962-a197022b5858?w=60&q=80" },
];

const STATUS_STYLE = {
  Sale: { bg:"#FEF2F2", text:"#E8344E" },
  Rent: { bg:"#ECFDF5", text:"#059669" },
  Sold: { bg:"#FEF9C3", text:"#D97706" },
};

const STAT_CARDS = [
  { label:"Total Income", value:"$12,7812.12", change:"+12%", up:true, icon:<Icon.Wallet/> },
  { label:"Total Properties", value:"15,780 Unit", change:"-8%", up:false, icon:<Icon.Package/> },
  { label:"Unit Sold", value:"893 Unit", change:"-16%", up:false, icon:<Icon.Tag/> },
  { label:"Unit Rent", value:"490 Unit", change:"+12%", up:true, icon:<Icon.Layers/> },
];

const PAGE_SIZE = 9;
const TOTAL_PAGES = 10;

export default function GuriGateProperty() {
  const [darkMode, setDarkMode] = useState(false);
  const [checked, setChecked] = useState([]);

  const bg = darkMode ? "#0F172A" : "#F8F9FC";
  const card = darkMode ? "#1E293B" : "white";
  const border = darkMode ? "#334155" : "#F1F5F9";
  const text = darkMode ? "#E2E8F0" : "#111827";
  const muted = darkMode ? "#94A3B8" : "#6B7280";

  const toggle = (id: any) => setChecked((p: any[]) => p.includes(id) ? p.filter((x: any)=>x!==id) : [...p, id]);
  const allChecked = checked.length === ALL_PROPERTIES.length;
  const toggleAll = () => setChecked(allChecked ? [] : ALL_PROPERTIES.map((p: any) => p.id));

  return (
    <div style={{ padding:"28px", flex:1, overflowY:"auto" }}>
      {/* Page heading */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:"-0.4px", color:text }}>Property Management</h1>
          <p style={{ fontSize:12, color:muted, marginTop:2 }}>Manage your property listings and track performance</p>
        </div>
        <button style={{ display:"flex", alignItems:"center", gap:6, background:"#E8344E", color:"white", border:"none", borderRadius:10, padding:"10px 18px", fontSize:13, fontWeight:600, cursor:"pointer" }}>
          <Icon.Plus/> Add Property
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
        {[
          { label:"Total Properties", value:"24", change:"+2", up:true, icon:<Icon.Building/> },
          { label:"For Sale", value:"8", change:"+1", up:true, icon:<Icon.Tag/> },
          { label:"For Rent", value:"12", change:"-1", up:false, icon:<Icon.Wallet/> },
          { label:"Revenue", value:"$125K", change:"+18%", up:true, icon:<Icon.Package/> },
        ].map((s, i) => (
          <div key={i} style={{ background:card, border:`1px solid ${border}`, borderRadius:16, padding:20, display:"flex", flexDirection:"column", gap:12 }}>
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
              <span style={{ fontSize:11, color:muted }}>Last week</span>
              <button style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:4, fontSize:11, color:muted, background:"none", border:"none", cursor:"pointer" }}>
                Show more <Icon.ChevronRight/>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Properties table */}
      <div style={{ background:card, borderRadius:16, border:`1px solid ${border}`, overflow:"hidden" }}>
        {/* Table header row */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 22px 14px" }}>
          <h2 style={{ fontSize:15, fontWeight:700 }}>All Properties List</h2>
          <button style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:muted, background:darkMode?"#334155":"#F8F9FC", border:"none", borderRadius:8, padding:"7px 12px", cursor:"pointer", fontWeight:500 }}>
            Last Month <Icon.ChevronDown/>
          </button>
        </div>

        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${border}` }}>
                <th style={{ padding:"10px 22px", width:44 }}>
                  <input type="checkbox" checked={allChecked} onChange={toggleAll}/>
                </th>
                {["Properties Name","Properties Type","Size","Rent/Sale","Bedrooms","Location","Price",""].map((h,i) => (
                  <th key={i} style={{ padding:"10px 14px", textAlign:"left", fontWeight:600, fontSize:11, color:muted, whiteSpace:"nowrap", letterSpacing:"0.02em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_PROPERTIES.map((row, idx) => (
                <tr key={row.id} style={{ borderBottom:idx < ALL_PROPERTIES.length-1 ? `1px solid ${border}` : "none", transition:"background .12s" }}
                    onMouseEnter={e=>{e.currentTarget.style.background="rgba(232,52,78,0.025)";}}
                    onMouseLeave={e=>{e.currentTarget.style.background="";}}>
                  <td style={{ padding:"13px 22px" }}>
                    <input type="checkbox" checked={checked.includes(row.id)} onChange={()=>toggle(row.id)}/>
                  </td>
                  <td style={{ padding:"13px 14px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <img src={row.img} alt="" style={{ width:38, height:38, borderRadius:10, objectFit:"cover", flexShrink:0 }}/>
                      <span style={{ fontWeight:500, color:text }}>{row.name}</span>
                    </div>
                  </td>
                  <td style={{ padding:"13px 14px", color:muted }}>{row.type}</td>
                  <td style={{ padding:"13px 14px", color:muted }}>{row.size}</td>
                  <td style={{ padding:"13px 14px" }}>
                    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 10px", borderRadius:12, fontSize:11, fontWeight:600,
                      background:row.status==="Sale" ? "#FEF2F2" : row.status==="Rent" ? "#F0FDF4" : "#FEF3C7",
                      color:row.status==="Sale" ? "#E8344E" : row.status==="Rent" ? "#059669" : "#D97706" }}>
                      {row.status}
                    </span>
                  </td>
                  <td style={{ padding:"13px 14px", color:muted }}>{row.beds}</td>
                  <td style={{ padding:"13px 14px", color:muted }}>{row.location}</td>
                  <td style={{ padding:"13px 14px", fontWeight:600, color:text }}>{row.price}</td>
                  <td style={{ padding:"13px 14px" }}>
                    <button style={{ background:"none", border:"none", cursor:"pointer", color:muted, padding:4 }}>
                      <Icon.MoreVert/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}