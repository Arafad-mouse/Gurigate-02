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
  Search: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Bell: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  Smile: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
  ChevronDown: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  Moon: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
  MapPin: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Bed: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16M2 8h18a2 2 0 012 2v10M2 12h20M6 8v4"/></svg>,
  Bath: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l.01 0"/><path d="M4 12h16v4a4 4 0 01-4 4H8a4 4 0 01-4-4v-4z"/><path d="M4 12V6a2 2 0 012-2h3.5"/></svg>,
  Maximize: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>,
  Star: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="#F97316" stroke="#F97316" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Upload: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Map: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
};

const PROPERTIES = [
  { id:1, name:"Willow Brook Valley", address:"1668 Lincoln Drive, USA", rating:4.5, reviews:187, beds:4, baths:2, sqft:"1400ft", priceRange:"$80,675–$86,564", img:"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80" },
  { id:2, name:"Serent Residence", address:"1668 Lincoln Drive, USA", rating:4.5, reviews:187, beds:4, baths:2, sqft:"1400ft", priceRange:"$80,675–$86,564", img:"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80" },
  { id:3, name:"Riverbend Retreat", address:"1668 Lincoln Drive, USA", rating:4.5, reviews:187, beds:4, baths:2, sqft:"1400ft", priceRange:"$80,675–$86,564", img:"https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=80" },
  { id:4, name:"Tranquil Meadows", address:"1668 Lincoln Drive, USA", rating:4.5, reviews:187, beds:4, baths:2, sqft:"1400ft", priceRange:"$80,675–$86,564", img:"https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80" },
  { id:5, name:"Hearthstone Mansion", address:"1668 Lincoln Drive, USA", rating:4.5, reviews:187, beds:4, baths:2, sqft:"1400ft", priceRange:"$80,675–$86,564", img:"https://images.unsplash.com/photo-1598928636135-d146006ff4be?w=600&q=80" },
  { id:6, name:"Dreamweaver House", address:"1668 Lincoln Drive, USA", rating:4.5, reviews:187, beds:4, baths:2, sqft:"1400ft", priceRange:"$80,675–$86,564", img:"https://images.unsplash.com/photo-1600210492493-0946911123ea?w=600&q=80" },
  { id:7, name:"Sunrise Manor", address:"1668 Lincoln Drive, USA", rating:4.5, reviews:187, beds:4, baths:2, sqft:"1400ft", priceRange:"$80,675–$86,564", img:"https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=600&q=80" },
  { id:8, name:"Azure Horizon Loft", address:"1668 Lincoln Drive, USA", rating:4.5, reviews:187, beds:4, baths:2, sqft:"1400ft", priceRange:"$80,675–$86,564", img:"https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=600&q=80" },
  { id:9, name:"Cedar Ridge Estate", address:"1668 Lincoln Drive, USA", rating:4.5, reviews:187, beds:4, baths:2, sqft:"1400ft", priceRange:"$80,675–$86,564", img:"https://images.unsplash.com/photo-1502005097973-6a7082348e28?w=600&q=80" }
];

export default function GuriGateDiscover() {
  const [darkMode] = useState(false);

  const bg = darkMode ? "#0F172A" : "#F8F9FC";
  const card = darkMode ? "#1E293B" : "white";
  const border = darkMode ? "#334155" : "#F1F5F9";
  const text = darkMode ? "#E2E8F0" : "#111827";
  const muted = darkMode ? "#94A3B8" : "#6B7280";

  return (
    <div style={{ padding:"28px", flex:1, overflowY:"auto" }}>
      {/* Page heading */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:"-0.4px", color:text }}>Discover Properties</h1>
          <p style={{ fontSize:12, color:muted, marginTop:2 }}>Explore our curated collection of premium properties</p>
        </div>
        <button style={{ display:"flex", alignItems:"center", gap:6, background:"#E8344E", color:"white", border:"none", borderRadius:10, padding:"10px 18px", fontSize:13, fontWeight:600, cursor:"pointer" }}>
          <Icon.Search/> Search
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
        {[
          { label:"Total Properties", value:"24", change:"+12%", color:"#E8344E" },
          { label:"New This Week", value:"8", change:"+25%", color:"#10B981" },
          { label:"Avg Price", value:"$85K", change:"+5%", color:"#F59E0B" },
          { label:"Avg Rating", value:"4.5", change:"0%", color:"#3B82F6" },
        ].map((stat, i) => (
          <div key={i} style={{ background:card, border:`1px solid ${border}`, borderRadius:14, padding:20, transition:"all .2s", cursor:"default" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
              <div style={{ width:32, height:32, background:stat.color+"20", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ color:stat.color, fontSize:16, fontWeight:700 }}>{stat.value[0]}</span>
              </div>
              <span style={{ fontSize:11, color:muted }}>{stat.change}</span>
            </div>
            <p style={{ fontSize:11, color:muted, marginBottom:4 }}>{stat.label}</p>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:20, fontWeight:700, letterSpacing:"-0.5px", color:text }}>{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Property Grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:20 }}>
        {PROPERTIES.map(property => (
          <div key={property.id} style={{ background:card, border:`1px solid ${border}`, borderRadius:16, overflow:"hidden", transition:"all .2s", cursor:"pointer" }}
               onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.08)";}}
               onMouseLeave={e=>{e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="";}}>
            {/* Image */}
            <div style={{ height:200, position:"relative", overflow:"hidden" }}>
              <img src={property.img} alt={property.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
              <div style={{ position:"absolute", top:10, right:10, background:"rgba(232,52,78,0.9)", color:"white", borderRadius:20, padding:"4px 8px", fontSize:11, fontWeight:600, display:"flex", alignItems:"center", gap:4 }}>
                <Icon.Star/>
                {property.rating}
              </div>
            </div>

            {/* Content */}
            <div style={{ padding:20 }}>
              <h3 style={{ fontSize:16, fontWeight:700, color:text, marginBottom:8, lineHeight:1.3 }}>{property.name}</h3>
              <p style={{ fontSize:13, color:muted, marginBottom:12, display:"flex", alignItems:"center", gap:4 }}>
                <Icon.MapPin />
                {property.address}
              </p>
              
              {/* Features */}
              <div style={{ display:"flex", gap:12, marginBottom:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, color:muted }}>
                  <Icon.Bed/>
                  <span>{property.beds} beds</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, color:muted }}>
                  <Icon.Bath/>
                  <span>{property.baths} baths</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, color:muted }}>
                  <Icon.Maximize/>
                  <span>{property.sqft}</span>
                </div>
              </div>

              {/* Reviews */}
              <div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:2 }}>
                  <Icon.Star/>
                  <span style={{ fontSize:14, fontWeight:600, color:text }}>{property.rating}</span>
                </div>
                <span style={{ fontSize:13, color:muted }}>({property.reviews} reviews)</span>
              </div>

              {/* Facilities */}
              <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:12 }}>
                {["WiFi", "Parking", "Pool", "Gym", "AC", "Kitchen"].slice(0, 3).map((facility, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:5, background:bg+"20", border:`1px solid ${border}`, borderRadius:8, padding:"5px 10px", fontSize:11, color:text, fontWeight:500 }}>
                    {facility}
                  </div>
                ))}
              </div>

              {/* Price + Map button */}
              <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginTop:"auto" }}>
                <div>
                  <p style={{ fontSize:10, fontWeight:600, color:muted, marginBottom:3, textTransform:"uppercase", letterSpacing:"0.06em" }}>Price Range</p>
                  <p style={{ fontSize:15, fontWeight:700, color:text, letterSpacing:"-0.3px" }}>{property.priceRange}</p>
                </div>
                <button style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, fontWeight:600, color:"#E8344E", background:"transparent", border:"1.5px solid #E8344E", borderRadius:8, padding:"7px 14px", cursor:"pointer", transition:"all .15s" }}
                  onMouseEnter={e=>{e.currentTarget.style.background="#E8344E";e.currentTarget.style.color="white";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#E8344E";}}>
                  <Icon.Map/> Open Map
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}