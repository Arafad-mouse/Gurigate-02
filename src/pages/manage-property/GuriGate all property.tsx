import { useState } from "react";

const Icon = {
  Home: (s=15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Grid: (s=15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  Compass: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>,
  Building: (s=15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18z"/><path d="M6 12H4a2 2 0 00-2 2v6a2 2 0 002 2h2"/><path d="M18 9h2a2 2 0 012 2v9a2 2 0 01-2 2h-2"/></svg>,
  Users: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  User: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  BarChart: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>,
  ShoppingBag: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  CreditCard: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  Inbox: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>,
  Calendar: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Search: (s=15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Bell: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  Smile: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
  ChevronDown: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  MoreVert: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>,
  Moon: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
  Plus: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Phone: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 .18h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.11 7.83a16 16 0 006.06 6.06l1.21-1.21a2 2 0 012.11-.45c.9.33 1.85.55 2.81.7a2 2 0 011.71 2z"/></svg>,
  Mail: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Chat: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  Edit: (s=15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
  Check: (s=15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  X: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Door: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M9 21V5a2 2 0 012-2h2a2 2 0 012 2v16"/><circle cx="14" cy="13" r="1" fill="currentColor"/></svg>,
  MapPin: (s=15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Filter: (s=15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  Star: (s=15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Bed: (s=15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16h20V4M2 8h20M7 4v4M17 4v4"/></svg>,
  Bath: (s=15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l.01 0"/><path d="M4 12h16v4a4 4 0 01-4 4H8a4 4 0 01-4-4v-4z"/><path d="M4 12V6a2 2 0 012-2h3.5"/></svg>,
  Maximize: (s=15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>,
  TrendUp: (s=15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  TrendDown: (s=15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>,
  Map: (s=15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
};

const PROPERTIES = [
  { id:1, name:"Willow Brook Valley", address:"1668 Lincoln Drive, USA", rating:4.5, reviews:187, beds:4, baths:2, sqft:"1400ft", priceRange:"$80,675–$86,564", img:"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80", status:"Available", type:"Apartment" },
  { id:2, name:"Serent Residence", address:"1668 Lincoln Drive, USA", rating:4.5, reviews:187, beds:4, baths:2, sqft:"1400ft", priceRange:"$80,675–$86,564", img:"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80", status:"Available", type:"House" },
  { id:3, name:"Riverbend Retreat", address:"1668 Lincoln Drive, USA", rating:4.5, reviews:187, beds:4, baths:2, sqft:"1400ft", priceRange:"$80,675–$86,564", img:"https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=80", status:"Rented", type:"Villa" },
  { id:4, name:"Tranquil Meadows", address:"1668 Lincoln Drive, USA", rating:4.5, reviews:187, beds:4, baths:2, sqft:"1400ft", priceRange:"$80,675–$86,564", img:"https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80", status:"Available", type:"Apartment" },
  { id:5, name:"Hearthstone Mansion", address:"1668 Lincoln Drive, USA", rating:4.5, reviews:187, beds:4, baths:2, sqft:"1400ft", priceRange:"$80,675–$86,564", img:"https://images.unsplash.com/photo-1598928636135-d146006ff4be?w=600&q=80", status:"Available", type:"House" },
  { id:6, name:"Dreamweaver House", address:"1668 Lincoln Drive, USA", rating:4.5, reviews:187, beds:4, baths:2, sqft:"1400ft", priceRange:"$80,675–$86,564", img:"https://images.unsplash.com/photo-1600210492493-0946911123ea?w=600&q=80", status:"Rented", type:"Villa" },
  { id:7, name:"Sunrise Manor", address:"1668 Lincoln Drive, USA", rating:4.5, reviews:187, beds:4, baths:2, sqft:"1400ft", priceRange:"$80,675–$86,564", img:"https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=600&q=80", status:"Available", type:"Apartment" },
  { id:8, name:"Azure Horizon Loft", address:"1668 Lincoln Drive, USA", rating:4.5, reviews:187, beds:4, baths:2, sqft:"1400ft", priceRange:"$80,675–$86,564", img:"https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=600&q=80", status:"Available", type:"House" },
  { id:9, name:"Cedar Ridge Estate", address:"1668 Lincoln Drive, USA", rating:4.5, reviews:187, beds:4, baths:2, sqft:"1400ft", priceRange:"$80,675–$86,564", img:"https://images.unsplash.com/photo-1502005097973-6a7082348e28?w=600&q=80", status:"Rented", type:"Villa" },
  { id:10, name:"Oakwood Commons", address:"1668 Lincoln Drive, USA", rating:4.5, reviews:187, beds:3, baths:2, sqft:"1200ft", priceRange:"$65,000–$72,000", img:"https://images.unsplash.com/photo-1448630360428-65456885c650?w=600&q=80", status:"Available", type:"Apartment" },
  { id:11, name:"Maple Grove Heights", address:"1668 Lincoln Drive, USA", rating:4.5, reviews:187, beds:5, baths:3, sqft:"1800ft", priceRange:"$95,000–$105,000", img:"https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80", status:"Available", type:"House" },
  { id:12, name:"Pine Valley Estates", address:"1668 Lincoln Drive, USA", rating:4.5, reviews:187, beds:3, baths:2, sqft:"1100ft", priceRange:"$60,000–$68,000", img:"https://images.unsplash.com/photo-1493809842364-7889add74094?w=600&q=80", status:"Rented", type:"Apartment" },
];

const PROPERTY_TYPES = ["All", "Office Building", "Commercial Complex", "Shopping Mall", "Retail Shop", "Warehouse", "Hotel", "Restaurant", "Mixed Use Building", "Industrial Building", "Business Center"];
const PROPERTY_STATUS = ["All", "Available", "Rented"];

export default function GuriGateAllProperty() {
  const [darkMode] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("name");

  const bg = darkMode ? "#0F172A" : "#F8F9FC";
  const card = darkMode ? "#1E293B" : "white";
  const border = darkMode ? "#334155" : "#F1F5F9";
  const text = darkMode ? "#E2E8F0" : "#111827";
  const muted = darkMode ? "#94A3B8" : "#6B7280";

  const filteredProperties = PROPERTIES.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(search.toLowerCase()) ||
                         property.address.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "All" || property.type === typeFilter;
    const matchesStatus = statusFilter === "All" || property.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "price") {
      const aPrice = parseInt(a.priceRange.replace(/[^0-9]/g, ''));
      const bPrice = parseInt(b.priceRange.replace(/[^0-9]/g, ''));
      return aPrice - bPrice;
    }
    if (sortBy === "rating") return b.rating - a.rating;
    return 0;
  });

  const stats = {
    total: PROPERTIES.length,
    available: PROPERTIES.filter(p => p.status === "Available").length,
    rented: PROPERTIES.filter(p => p.status === "Rented").length,
    apartments: PROPERTIES.filter(p => p.type === "Apartment").length,
  };

  return (
    <div style={{ padding:"28px", flex:1, overflowY:"auto" }}>
      {/* Page heading */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:"-0.4px", color:text }}>All Properties</h1>
          <p style={{ fontSize:12, color:muted, marginTop:2 }}>Manage and view all properties in your portfolio</p>
        </div>
        <button style={{ display:"flex", alignItems:"center", gap:6, background:"#E8344E", color:"white", border:"none", borderRadius:10, padding:"10px 18px", fontSize:13, fontWeight:600, cursor:"pointer" }}>
          <Icon.Plus/> Add Property
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
        {[
          { label:"Total Properties", value:stats.total, change:"+2", up:true, icon:Icon.Building(16) },
          { label:"Available", value:stats.available, change:"+1", up:true, icon:Icon.Check(16) },
          { label:"Rented", value:stats.rented, change:"-1", up:false, icon:Icon.Home(16) },
          { label:"Apartments", value:stats.apartments, change:"+3", up:true, icon:Icon.Grid(16) },
        ].map((s, i) => (
          <div key={i} style={{ background:card, border:`1px solid ${border}`, borderRadius:16, padding:20, display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                <p style={{ fontSize:11, color:muted, fontWeight:500 }}>{s.label}</p>
                <p style={{ fontSize:18, fontWeight:700, letterSpacing:"-0.5px" }}>{s.value}</p>
              </div>
              <div style={{ width:38, height:38, background:"#FEF2F2", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", color:"#E8344E", flexShrink:0 }}>
                <div style={{ fontSize:16 }}>{s.icon}</div>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ display:"flex", alignItems:"center", gap:3, fontSize:11, fontWeight:700, color:s.up?"#059669":"#E8344E" }}>
                {s.up ? Icon.TrendUp(12) : Icon.TrendDown(12)}{s.change}
              </span>
              <span style={{ fontSize:11, color:muted }}>This month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20, flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, background:card, border:`1px solid ${border}`, borderRadius:10, padding:"8px 12px" }}>
          <div style={{ color:muted }}>{Icon.Filter(16)}</div>
          <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} style={{ border:"none", outline:"none", background:"transparent", color:text, fontSize:13, cursor:"pointer" }} title="Filter by property type">
            {PROPERTY_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6, background:card, border:`1px solid ${border}`, borderRadius:10, padding:"8px 12px" }}>
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{ border:"none", outline:"none", background:"transparent", color:text, fontSize:13, cursor:"pointer" }} title="Filter by property status">
            {PROPERTY_STATUS.map(status => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6, background:card, border:`1px solid ${border}`, borderRadius:10, padding:"8px 12px" }}>
          <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ border:"none", outline:"none", background:"transparent", color:text, fontSize:13, cursor:"pointer" }} title="Sort properties">
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="rating">Sort by Rating</option>
          </select>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6, background:card, border:`1px solid ${border}`, borderRadius:10, padding:"8px 12px", flex:1, maxWidth:300 }}>
          <div style={{ color:muted }}>{Icon.Search(16)}</div>
          <input placeholder="Search properties..." value={search} onChange={e=>setSearch(e.target.value)} style={{ border:"none", outline:"none", background:"transparent", color:text, fontSize:13, width:"100%" }}/>
        </div>
      </div>

      {/* Property Grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(320px, 1fr))", gap:20 }}>
        {filteredProperties.length === 0 ? (
          <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"60px 20px", color:muted }}>
            <div style={{ width:48, height:48, margin:"0 auto 16px", opacity:0.3 }}>{Icon.Building(48)}</div>
            <h3 style={{ fontSize:16, fontWeight:600, marginBottom:8 }}>No properties found</h3>
            <p style={{ fontSize:13 }}>Try adjusting your search or filters</p>
          </div>
        ) : filteredProperties.map(property => (
          <div key={property.id} style={{ background:card, border:`1px solid ${border}`, borderRadius:16, overflow:"hidden", transition:"all .2s", cursor:"pointer" }}
               onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.08)";}}
               onMouseLeave={e=>{e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="";}}>
            
            {/* Image */}
            <div style={{ height:200, position:"relative", overflow:"hidden" }}>
              <img src={property.img} alt={property.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
              <div style={{ position:"absolute", top:10, right:10, background:property.status === "Available" ? "rgba(16,185,129,0.9)" : "rgba(239,68,68,0.9)", color:"white", borderRadius:20, padding:"4px 8px", fontSize:11, fontWeight:600 }}>
                {property.status}
              </div>
              <div style={{ position:"absolute", top:10, left:10, background:"rgba(232,52,78,0.9)", color:"white", borderRadius:8, padding:"4px 8px", fontSize:11, fontWeight:600, display:"flex", alignItems:"center", gap:4 }}>
                <div style={{ color:"white" }}>{Icon.Star(12)}</div>
                {property.rating}
              </div>
            </div>

            {/* Content */}
            <div style={{ padding:20 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                <h3 style={{ fontSize:16, fontWeight:700, color:text, lineHeight:1.3, flex:1 }}>{property.name}</h3>
                <span style={{ fontSize:11, color:muted, background:bg+"20", padding:"4px 8px", borderRadius:6, fontWeight:500 }}>
                  {property.type}
                </span>
              </div>
              
              <p style={{ fontSize:13, color:muted, marginBottom:12, display:"flex", alignItems:"center", gap:4 }}>
                <div style={{ color:text }}>{Icon.MapPin(14)}</div>
                {property.address}
              </p>
              
              {/* Features */}
              <div style={{ display:"flex", gap:12, marginBottom:12 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, color:muted }}>
                    {Icon.Bed(12)}
                    <span>{property.beds} beds</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, color:muted }}>
                    {Icon.Bath(12)}
                    <span>{property.baths} baths</span>
                  </div>
                <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, color:muted }}>
                    {Icon.Maximize(12)}
                    <span>{property.sqft}</span>
                  </div>
              </div>

              {/* Price */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:"auto" }}>
                <div>
                  <p style={{ fontSize:10, fontWeight:600, color:muted, marginBottom:3, textTransform:"uppercase", letterSpacing:"0.06em" }}>Price Range</p>
                  <p style={{ fontSize:15, fontWeight:700, color:text, letterSpacing:"-0.3px" }}>{property.priceRange}</p>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button style={{ background:"none", border:"none", cursor:"pointer", color:muted, padding:6 }} title="Edit Property">
                    {Icon.Edit(16)}
                  </button>
                  <button style={{ background:"none", border:"none", cursor:"pointer", color:muted, padding:6 }} title="View on map">
                    {Icon.Map(16)}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
