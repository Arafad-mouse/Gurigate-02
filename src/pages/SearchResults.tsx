import { useState, useEffect, useRef } from "react";

const Icon = {
  Home: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Search: ({size=15}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  MapPin: ({size=11}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Bed: ({size=12}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16M2 8h18a2 2 0 012 2v10M2 12h20M6 8v4"/></svg>,
  Bath: ({size=12}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l.01 0"/><path d="M4 12h16v4a4 4 0 01-4 4H8a4 4 0 01-4-4v-4z"/><path d="M4 12V6a2 2 0 012-2h3.5"/></svg>,
  StarFill: ({size=11}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Heart: ({size=16, filled=false}) => <svg width={size} height={size} viewBox="0 0 24 24" fill={filled?"#ef4444":"none"} stroke={filled?"#ef4444":"white"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  ChevLeft: ({size=14}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevRight: ({size=14}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  ChevDown: ({size=11}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  Users: ({size=11}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  Cal: ({size=11}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Sliders: ({size=11}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="4" x2="14" y2="4"/><line x1="10" y1="4" x2="3" y2="4"/><line x1="21" y1="12" x2="12" y2="12"/><line x1="8" y1="12" x2="3" y2="12"/><line x1="21" y1="20" x2="16" y2="20"/><line x1="12" y1="20" x2="3" y2="20"/><line x1="14" y1="2" x2="14" y2="6"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="16" y1="18" x2="16" y2="22"/></svg>,
  Plus: ({size=13}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Minus: ({size=13}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Check: ({size=11}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  MapIco: ({size=13}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
  ListIco: ({size=13}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  Reset: ({size=12}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>,
};

const LOCATIONS = ["Nairobi, Kenya","Hargeisa, Somalia","Mogadishu, Somalia","Mombasa, Kenya","Kampala, Uganda","Dar es Salaam, Tanzania","Addis Ababa, Ethiopia"];
const DATES     = ["Mar 24 – 25","Mar 24 – 31","Apr 1 – 7","Apr 8 – 15","Apr 15 – 22","Flexible"];

const PROPS = [
  { id:1,  title:"Modern Penthouse, Kileleshwa", type:"Apartment", city:"Nairobi, Kenya",          price:120, beds:3, baths:2, rating:5.00, reviews:48,  lat:1.2921, lng:36.8219, img:"https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&q=75", guests:4  },
  { id:2,  title:"Garden Oasis Villa, Karen",    type:"Villa",     city:"Nairobi, Kenya",           price:245, beds:5, baths:3, rating:4.92, reviews:134, lat:1.3521, lng:36.7119, img:"https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=500&q=75", guests:10 },
  { id:3,  title:"Westlands Executive Suite",    type:"Studio",    city:"Nairobi, Kenya",           price:89,  beds:1, baths:1, rating:4.85, reviews:72,  lat:1.2621, lng:36.8019, img:"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&q=75", guests:2  },
  { id:4,  title:"Lavington Garden Home",        type:"House",     city:"Nairobi, Kenya",           price:178, beds:4, baths:2, rating:4.97, reviews:91,  lat:1.2821, lng:36.7819, img:"https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&q=75", guests:8  },
  { id:5,  title:"Skyline Loft, Upper Hill",     type:"Loft",      city:"Nairobi, Kenya",           price:155, beds:2, baths:1, rating:4.78, reviews:56,  lat:1.2741, lng:36.8119, img:"https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=500&q=75", guests:4  },
  { id:6,  title:"Runda Estate Manor",           type:"Villa",     city:"Nairobi, Kenya",           price:310, beds:6, baths:4, rating:4.99, reviews:28,  lat:1.3121, lng:36.8419, img:"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500&q=75", guests:12 },
  { id:7,  title:"Hargeisa City Centre Flat",   type:"Apartment", city:"Hargeisa, Somalia",         price:75,  beds:2, baths:1, rating:4.82, reviews:33,  lat:9.5600, lng:44.0650, img:"https://images.unsplash.com/photo-1484154218962-a197022b5858?w=500&q=75", guests:4  },
  { id:8,  title:"Maansoor District Villa",      type:"Villa",     city:"Hargeisa, Somalia",        price:140, beds:4, baths:2, rating:4.91, reviews:19,  lat:9.5500, lng:44.0750, img:"https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=500&q=75", guests:8  },
  { id:9,  title:"Hargeisa Boutique Studio",     type:"Studio",    city:"Hargeisa, Somalia",        price:60,  beds:1, baths:1, rating:4.75, reviews:41,  lat:9.5650, lng:44.0550, img:"https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&q=75", guests:2  },
  { id:10, title:"Skyper Pool Apartment",        type:"Apartment", city:"Mombasa, Kenya",           price:190, beds:3, baths:2, rating:4.88, reviews:67,  lat:-4.0435,lng:39.6682, img:"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&q=75", guests:6  },
  { id:11, title:"Beachfront Cottage",           type:"House",     city:"Mombasa, Kenya",           price:225, beds:3, baths:2, rating:4.95, reviews:112, lat:-4.0235,lng:39.6882, img:"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&q=75", guests:6  },
  { id:12, title:"Kololo Hill Residence",        type:"House",     city:"Kampala, Uganda",          price:135, beds:4, baths:3, rating:4.89, reviews:44,  lat:0.3476, lng:32.5825, img:"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&q=75", guests:8  },
  { id:13, title:"Makindye Modern Villa",        type:"Villa",     city:"Kampala, Uganda",          price:200, beds:5, baths:3, rating:4.93, reviews:31,  lat:0.2976, lng:32.5625, img:"https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&q=75", guests:10 },
  { id:14, title:"Msasani Penthouse",            type:"Apartment", city:"Dar es Salaam, Tanzania",  price:160, beds:3, baths:2, rating:4.87, reviews:58,  lat:-6.7924,lng:39.2083, img:"https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=500&q=75", guests:6  },
  { id:15, title:"Bole Luxury Apartment",        type:"Apartment", city:"Addis Ababa, Ethiopia",    price:95,  beds:2, baths:1, rating:4.80, reviews:77,  lat:8.9806, lng:38.7578, img:"https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&q=75", guests:4  },
];

const PER_PAGE = 5;

// Define types for the component
interface Property {
  id: number;
  title: string;
  type: string;
  city: string;
  price: number;
  beds: number;
  baths: number;
  rating: number;
  reviews: number;
  lat: number;
  lng: number;
  img: string;
  guests: number;
}

interface MapViewProps {
  properties: Property[];
  hovId: number | null;
  onPin: (id: number) => void;
}

interface CardProps {
  p: Property;
  hot: boolean;
  onEnter: () => void;
  onLeave: () => void;
}

interface DDProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

// ─── MAP ──────────────────────────────────────────────────────────────────────
function MapView({ properties, hovId, onPin }: MapViewProps) {
  const [zoom, setZoom] = useState(1);
  const [pan,  setPan]  = useState({ x:0, y:0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragState, setDragState] = useState(false);
  const originRef = useRef<{x: number; y: number} | null>(null);

  useEffect(() => { 
    const timer = setTimeout(() => {
      setZoom(1); 
      setPan({x:0,y:0}); 
    }, 0);
    return () => clearTimeout(timer);
  }, [properties.length]);

  const toXY = (lat: number, lng: number) => {
    const lats = properties.map((p: Property) => p.lat);
    const lngs = properties.map((p: Property) => p.lng);
    const minLat=Math.min(...lats), maxLat=Math.max(...lats);
    const minLng=Math.min(...lngs), maxLng=Math.max(...lngs);
    const cLat=(minLat+maxLat)/2, cLng=(minLng+maxLng)/2;
    const ls = Math.max(maxLat-minLat,0.06)*1.6;
    const gs = Math.max(maxLng-minLng,0.06)*1.6;
    return { x:((lng-cLng)/gs+0.5)*100, y:((cLat-lat)/ls+0.5)*100 };
  };

  const md = (e: React.MouseEvent) => { setDragState(true); setIsDragging(true); originRef.current={x:e.clientX-pan.x, y:e.clientY-pan.y}; };
  const mm = (e: React.MouseEvent) => { if(dragState && originRef.current) setPan({x:e.clientX-originRef.current.x, y:e.clientY-originRef.current.y}); };
  const mu = () => { setDragState(false); setIsDragging(false); };

  return (
    <div
      onMouseDown={md} onMouseMove={mm} onMouseUp={mu} onMouseLeave={mu}
      style={{
        width:"100%", height:"100%", borderRadius:16, overflow:"hidden",
        position:"absolute", top:0, left:0, right:0, bottom:0, userSelect:"none",
        cursor: isDragging?"grabbing":"grab",
        background:"#c8dff0",
      }}
    >
      {/* Land masses */}
      <div style={{position:"absolute",inset:0,background:` 
        radial-gradient(ellipse 65% 50% at 28% 38%, #ddecc8 0%, transparent 60%),
        radial-gradient(ellipse 50% 55% at 72% 62%, #d0e8c0 0%, transparent 58%),
        radial-gradient(ellipse 80% 70% at 52% 48%, #e0edd0 0%, transparent 70%),
        linear-gradient(160deg,#c4dcee 0%,#b8d4eb 25%,#cce2d5 55%,#b8d4eb 100%)
      `}}/>

      {/* Roads SVG */}
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.5}}>
        <path d="M0,44% Q28%,40% 52%,47% T100%,52%" fill="none" stroke="white" strokeWidth="6"/>
        <path d="M18%,0 Q32%,42% 22%,100%" fill="none" stroke="white" strokeWidth="4.5"/>
        <path d="M67%,0 Q72%,36% 82%,100%" fill="none" stroke="white" strokeWidth="4"/>
        <path d="M0,72% Q42%,62% 100%,74%" fill="none" stroke="white" strokeWidth="3.5"/>
        <path d="M42%,0 L47%,100%" fill="none" stroke="white" strokeWidth="3"/>
        <path d="M0,22% Q52%,17% 100%,27%" fill="none" stroke="white" strokeWidth="2.5"/>
        <path d="M27%,0 Q30%,52% 37%,100%" fill="none" stroke="white" strokeWidth="2" strokeDasharray="9,5"/>
        <path d="M57%,0 Q60%,52% 62%,100%" fill="none" stroke="white" strokeWidth="2" strokeDasharray="9,5"/>
        <path d="M0,57% Q52%,54% 100%,60%" fill="none" stroke="white" strokeWidth="2" strokeDasharray="9,5"/>
        <rect x="23%" y="29%" width="13%" height="9%" rx="1%" fill="white" opacity="0.22"/>
        <rect x="47%" y="39%" width="11%" height="9%" rx="1%" fill="white" opacity="0.22"/>
        <rect x="63%" y="23%" width="12%" height="8%" rx="1%" fill="white" opacity="0.22"/>
        <rect x="31%" y="61%" width="10%" height="10%" rx="1%" fill="white" opacity="0.22"/>
        <rect x="73%" y="56%" width="14%" height="9%" rx="1%" fill="white" opacity="0.22"/>
      </svg>

      {/* Grid */}
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.06}}>
        <defs><pattern id="g" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M 48 0 L 0 0 0 48" fill="none" stroke="#1d4ed8" strokeWidth="0.8"/></pattern></defs>
        <rect width="100%" height="100%" fill="url(#g)"/>
      </svg>

      {/* Markers layer */}
      <div style={{
        position:"absolute",inset:0,
        transform:`translate(${pan.x}px,${pan.y}px) scale(${zoom})`,
        transformOrigin:"50% 50%",
        transition: dragState?"none":"transform 0.22s ease",
      }}>
        {properties.map((p: Property) => {
          const pos = toXY(p.lat,p.lng);
          const hot = p.id === hovId;
          return (
            <div key={p.id} style={{
              position:"absolute",
              left:`${pos.x}%`, top:`${pos.y}%`,
              transform:"translate(-50%,-50%)",
              zIndex: hot ? 60 : 10,
            }}>
              {/* Hover popup */}
              {hot && (
                <div style={{
                  position:"absolute", bottom:"calc(100% + 8px)", left:"50%",
                  transform:"translateX(-50%)",
                  width:190, background:"white", borderRadius:14,
                  boxShadow:"0 8px 32px rgba(0,0,0,0.18)",
                  border:"1.5px solid #f3f4f6", overflow:"hidden",
                  pointerEvents:"none", zIndex:70,
                  animation:"popIn 0.15s ease both",
                }}>
                  <style>{`@keyframes popIn{from{opacity:0;transform:translateX(-50%) translateY(6px) scale(0.95)}to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}}`}</style>
                  <img src={p.img} alt={p.title} style={{width:"100%",height:95,objectFit:"cover",display:"block"}}/>
                  <div style={{padding:"9px 11px"}}>
                    <p style={{fontSize:12,fontWeight:700,color:"#111827",margin:"0 0 4px",lineHeight:1.3}}>{p.title}</p>
                    <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:4}}>
                      <Icon.StarFill size={10}/><span style={{fontSize:10,color:"#374151"}}>{p.rating} · {p.beds} bed{p.beds>1?"s":""}</span>
                    </div>
                    <p style={{fontSize:12,fontWeight:800,color:"#ef4444",margin:0}}>${p.price}<span style={{fontWeight:400,color:"#9ca3af",fontSize:10}}>/night</span></p>
                  </div>
                </div>
              )}
              {/* Bubble */}
              <button
                onClick={(e)=>{e.stopPropagation();onPin(p.id);}}
                style={{
                  background: hot?"#111827":"white",
                  color: hot?"white":"#111827",
                  border: `2px solid ${hot?"#111827":"white"}`,
                  borderRadius:20, padding:"5px 11px",
                  fontSize:12, fontWeight:800,
                  boxShadow: hot?"0 4px 18px rgba(0,0,0,0.28)":"0 2px 8px rgba(0,0,0,0.16)",
                  transform: hot?"scale(1.14)":"scale(1)",
                  transition:"all 0.16s ease",
                  cursor:"pointer", whiteSpace:"nowrap",
                  display:"block",
                }}
              >${p.price}</button>
            </div>
          );
        })}
      </div>

      {/* Top-left count */}
      <div style={{
        position:"absolute",top:12,left:12,zIndex:20,
        background:"rgba(255,255,255,0.92)",backdropFilter:"blur(8px)",
        borderRadius:20,padding:"5px 13px",
        fontSize:11,fontWeight:700,color:"#374151",
        boxShadow:"0 1px 6px rgba(0,0,0,0.1)",border:"1px solid rgba(0,0,0,0.06)",
      }}>{properties.length} homes on map</div>

      {/* Top-right "prices" */}
      <div style={{
        position:"absolute",top:12,right:12,zIndex:20,
        background:"rgba(255,255,255,0.92)",backdropFilter:"blur(8px)",
        borderRadius:20,padding:"5px 13px",
        fontSize:11,fontWeight:600,color:"#374151",
        boxShadow:"0 1px 6px rgba(0,0,0,0.1)",border:"1px solid rgba(0,0,0,0.06)",
        display:"flex",alignItems:"center",gap:6,
      }}>
        <div style={{width:8,height:8,borderRadius:"50%",background:"#ef4444"}}/>
        Prices include all fees
      </div>

      {/* Zoom */}
      <div style={{position:"absolute",bottom:12,right:12,zIndex:20,display:"flex",flexDirection:"column",gap:4}}>
        {[{l:"+",f:()=>setZoom(z=>Math.min(z+0.35,4))},{l:"−",f:()=>setZoom(z=>Math.max(z-0.35,0.4))}].map(({l,f})=>(
          <button key={l} onClick={f} style={{
            width:32,height:32,background:"white",border:"1px solid #e5e7eb",
            borderRadius:8,fontSize:18,fontWeight:300,color:"#374151",
            cursor:"pointer",boxShadow:"0 1px 4px rgba(0,0,0,0.09)",
            display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1,
          }}>{l}</button>
        ))}
        <button onClick={()=>{setZoom(1);setPan({x:0,y:0});}} style={{
          width:32,height:32,background:"white",border:"1px solid #e5e7eb",
          borderRadius:8,cursor:"pointer",boxShadow:"0 1px 4px rgba(0,0,0,0.09)",
          display:"flex",alignItems:"center",justifyContent:"center",marginTop:2,
        }}><Icon.Reset size={13}/></button>
      </div>

      {/* Compass */}
      <div style={{position:"absolute",bottom:12,left:12,zIndex:20,opacity:0.45,pointerEvents:"none"}}>
        <svg viewBox="0 0 40 40" width={34} height={34}>
          <circle cx="20" cy="20" r="18" stroke="#64748b" strokeWidth="1.5" fill="none"/>
          <polygon points="20,4 23,20 20,17 17,20" fill="#1e293b"/>
          <polygon points="20,36 23,20 20,23 17,20" fill="#94a3b8"/>
          <polygon points="4,20 20,17 17,20 20,23" fill="#94a3b8"/>
          <polygon points="36,20 20,17 23,20 20,23" fill="#94a3b8"/>
          <text x="20" y="11" textAnchor="middle" fontSize="5" fill="#1e293b" fontWeight="bold">N</text>
        </svg>
      </div>
    </div>
  );
}

// ─── CARD ─────────────────────────────────────────────────────────────────────
function Card({ p, hot, onEnter, onLeave }: CardProps) {
  const [liked, setLiked] = useState(false);
  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        background:"white", borderRadius:14, overflow:"hidden",
        border: hot?"2px solid #111827":"1.5px solid #f1f5f9",
        boxShadow: hot?"0 6px 24px rgba(0,0,0,0.12)":"0 1px 4px rgba(0,0,0,0.05)",
        transition:"all 0.18s ease",
        cursor:"pointer", display:"flex", gap:0,
      }}
    >
      {/* Image */}
      <div style={{position:"relative",width:170,flexShrink:0}}>
        <img src={p.img} alt={p.title} style={{width:"100%",height:"100%",objectFit:"cover",display:"block",transition:"transform 0.3s",transform:hot?"scale(1.04)":"scale(1)"}}/>
        <button
          onClick={e=>{e.stopPropagation();setLiked(!liked);}}
          style={{position:"absolute",top:8,right:8,background:"none",border:"none",cursor:"pointer",padding:0,lineHeight:0}}
        >
          <Icon.Heart size={17} filled={liked}/>
        </button>
        <div style={{
          position:"absolute",bottom:8,left:8,
          background:"rgba(255,255,255,0.88)",backdropFilter:"blur(4px)",
          borderRadius:20,padding:"2px 8px",
          fontSize:10,fontWeight:700,color:"#374151",
        }}>{p.type}</div>
      </div>

      {/* Text */}
      <div style={{flex:1,padding:"14px 16px",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
            <p style={{fontSize:13,fontWeight:800,color:"#111827",margin:0,lineHeight:1.3,flex:1,paddingRight:8}}>{p.title}</p>
            <div style={{display:"flex",alignItems:"center",gap:3,flexShrink:0}}>
              <Icon.StarFill size={11}/>
              <span style={{fontSize:11,fontWeight:700,color:"#374151"}}>{p.rating}</span>
              <span style={{fontSize:10,color:"#9ca3af"}}>({p.reviews})</span>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:4,color:"#9ca3af",marginBottom:10}}>
            <Icon.MapPin size={11}/>
            <span style={{fontSize:11,color:"#6b7280"}}>{p.city}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:4}}>
            <span style={{background:"#f0fdf4",color:"#16a34a",fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:20}}>Guest favourite</span>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",borderTop:"1px solid #f3f4f6",paddingTop:10}}>
          <div style={{display:"flex",gap:12,color:"#6b7280",fontSize:11}}>
            <span style={{display:"flex",alignItems:"center",gap:4}}><Icon.Bed size={11}/>{p.beds} bed{p.beds>1?"s":""}</span>
            <span style={{display:"flex",alignItems:"center",gap:4}}><Icon.Bath size={11}/>{p.baths} ba</span>
            <span style={{display:"flex",alignItems:"center",gap:4}}><Icon.Users size={11}/>up to {p.guests}</span>
          </div>
          <div style={{textAlign:"right"}}>
            <span style={{fontSize:14,fontWeight:800,color:"#ef4444"}}>${p.price}</span>
            <span style={{fontSize:10,color:"#9ca3af"}}> /night</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DROPDOWN ─────────────────────────────────────────────────────────────────
function DD({ label, icon, value, open, onToggle, children }: DDProps) {
  return (
    <div style={{position:"relative"}}>
      <button
        onClick={onToggle}
        style={{
          display:"flex",flexDirection:"column",alignItems:"flex-start",
          padding:"8px 14px",borderRadius:14,cursor:"pointer",
          border: open?"1.5px solid #111827":"1.5px solid #e5e7eb",
          background:"white",
          boxShadow: open?"0 2px 12px rgba(0,0,0,0.08)":"none",
          transition:"all 0.14s",
        }}
      >
        <span style={{fontSize:9,fontWeight:800,color:"#9ca3af",textTransform:"uppercase",letterSpacing:1}}>{label}</span>
        <span style={{fontSize:12,fontWeight:700,color:value?"#111827":"#9ca3af",display:"flex",alignItems:"center",gap:5,marginTop:1,whiteSpace:"nowrap"}}>
          {icon} {value||"Any"}
        </span>
      </button>
      {open && (
        <div style={{
          position:"absolute",top:"calc(100% + 8px)",left:0,
          background:"white",borderRadius:16,
          boxShadow:"0 8px 40px rgba(0,0,0,0.13)",
          border:"1px solid #f1f5f9",zIndex:999,
          minWidth:210,overflow:"hidden",
          animation:"ddIn 0.14s ease both",
        }}>
          <style>{`@keyframes ddIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [loc,     setLoc]     = useState("Nairobi, Kenya");
  const [date,    setDate]    = useState("Mar 24 – 31");
  const [guests,  setGuests]  = useState(2);
  const [openDD,  setOpenDD]  = useState<string | null>(null);
  const [page,    setPage]    = useState(1);
  const [hov,     setHov]     = useState<number | null>(null);
  const [sort,    setSort]    = useState("Top rated");
  const [view,    setView]    = useState("both");

  const tog = (k: string | null) => setOpenDD(p => p===k?null:k);

  useEffect(()=>{
    const h = (e: MouseEvent) => { if(!(e.target as Element)?.closest("[data-dd]")) setOpenDD(null); };
    document.addEventListener("mousedown",h);
    return ()=>document.removeEventListener("mousedown",h);
  },[]);

  const filtered = PROPS
    .filter(p=>p.city.toLowerCase().includes(loc.split(",")[0].toLowerCase()))
    .filter(p=>p.guests>=guests);

  const sorted = [...filtered].sort((a,b)=>
    sort==="Price: Low"?a.price-b.price:
    sort==="Price: High"?b.price-a.price:
    b.rating-a.rating
  );

  const total = Math.max(1,Math.ceil(sorted.length/PER_PAGE));
  const page_ = Math.min(page,total);
  const paged = sorted.slice((page_-1)*PER_PAGE, page_*PER_PAGE);

  const showList = view==="both"||view==="list";
  const showMap  = view==="both"||view==="map";

  const NAV_H = 68;

  return (
    <div style={{fontFamily:"system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",background:"#f8fafc",height:"100vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>

      {/* ── NAVBAR ── */}
      <nav style={{
        height:NAV_H, flexShrink:0,
        background:"white",borderBottom:"1px solid #e5e7eb",
        display:"flex",alignItems:"center",
        padding:"0 20px",gap:10,zIndex:100,
        boxShadow:"0 1px 0 #e5e7eb",
      }}>
        {/* Logo */}
        <div style={{display:"flex",alignItems:"center",gap:7,marginRight:10,flexShrink:0}}>
          <div style={{width:30,height:30,background:"#ef4444",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:"white"}}>
            <Icon.Home/>
          </div>
          <span style={{fontSize:17,fontWeight:900,color:"#111827",letterSpacing:-0.5}}>GuriGate</span>
        </div>

        {/* Search fields */}
        <div data-dd style={{display:"flex",alignItems:"center",gap:8,flex:1}}>
          {/* Location */}
          <DD label="Where" icon={<Icon.MapPin size={11}/>} value={loc} open={openDD==="loc"} onToggle={()=>tog("loc")}>
            <div style={{padding:8}}>
              <p style={{fontSize:9,fontWeight:800,color:"#9ca3af",textTransform:"uppercase",letterSpacing:1,padding:"4px 12px 6px",margin:0}}>Destinations</p>
              {LOCATIONS.map(l=>(
                <button key={l} onClick={()=>{setLoc(l);setPage(1);setOpenDD(null);}} style={{
                  display:"flex",alignItems:"center",gap:9,width:"100%",padding:"9px 12px",
                  border:"none",background:loc===l?"#fef2f2":"transparent",
                  color:loc===l?"#ef4444":"#374151",fontSize:12,fontWeight:loc===l?700:400,
                  cursor:"pointer",borderRadius:10,textAlign:"left",
                }}>
                  <Icon.MapPin size={11}/>{l}
                  {loc===l&&<span style={{marginLeft:"auto"}}><Icon.Check size={11}/></span>}
                </button>
              ))}
            </div>
          </DD>

          {/* Dates */}
          <DD label="When" icon={<Icon.Cal size={11}/>} value={date} open={openDD==="date"} onToggle={()=>tog("date")}>
            <div style={{padding:8}}>
              <p style={{fontSize:9,fontWeight:800,color:"#9ca3af",textTransform:"uppercase",letterSpacing:1,padding:"4px 12px 6px",margin:0}}>Stay period</p>
              {DATES.map(d=>(
                <button key={d} onClick={()=>{setDate(d);setOpenDD(null);}} style={{
                  display:"flex",alignItems:"center",gap:9,width:"100%",padding:"9px 12px",
                  border:"none",background:date===d?"#fef2f2":"transparent",
                  color:date===d?"#ef4444":"#374151",fontSize:12,fontWeight:date===d?700:400,
                  cursor:"pointer",borderRadius:10,textAlign:"left",
                }}>
                  <Icon.Cal size={11}/>{d}
                  {date===d&&<span style={{marginLeft:"auto"}}><Icon.Check size={11}/></span>}
                </button>
              ))}
            </div>
          </DD>

          {/* Guests */}
          <DD label="Who" icon={<Icon.Users size={11}/>} value={`${guests} guest${guests>1?"s":""}`} open={openDD==="guests"} onToggle={()=>tog("guests")}>
            <div style={{padding:"16px 18px",width:230}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <p style={{fontSize:13,fontWeight:800,color:"#111827",margin:0}}>Guests</p>
                  <p style={{fontSize:11,color:"#9ca3af",margin:"3px 0 0"}}>Ages 13+</p>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <button onClick={()=>setGuests(g=>Math.max(1,g-1))} disabled={guests<=1} style={{
                    width:32,height:32,borderRadius:"50%",border:"1.5px solid #e5e7eb",
                    background:"white",display:"flex",alignItems:"center",justifyContent:"center",
                    cursor:guests<=1?"not-allowed":"pointer",opacity:guests<=1?0.3:1,
                  }}><Icon.Minus size={13}/></button>
                  <span style={{fontSize:15,fontWeight:800,width:18,textAlign:"center"}}>{guests}</span>
                  <button onClick={()=>setGuests(g=>Math.min(16,g+1))} style={{
                    width:32,height:32,borderRadius:"50%",border:"1.5px solid #e5e7eb",
                    background:"white",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",
                  }}><Icon.Plus size={13}/></button>
                </div>
              </div>
            </div>
          </DD>

          {/* Search btn */}
          <button style={{
            background:"#ef4444",color:"white",border:"none",
            padding:"10px 20px",borderRadius:14,fontSize:12,fontWeight:800,
            cursor:"pointer",display:"flex",alignItems:"center",gap:7,
            boxShadow:"0 2px 10px rgba(239,68,68,0.3)",flexShrink:0,
          }}>
            <Icon.Search size={14}/> Search
          </button>
        </div>

        {/* View toggle */}
        <div style={{display:"flex",gap:4,flexShrink:0}}>
          {[
            {k:"list",label:"List",   icon:<Icon.ListIco/>},
            {k:"both",label:"Both",   icon:<span style={{display:"flex",gap:2}}><Icon.ListIco/><Icon.MapIco/></span>},
            {k:"map", label:"Map",    icon:<Icon.MapIco/>},
          ].map(({k,label,icon})=>(
            <button key={k} onClick={()=>setView(k)} style={{
              display:"flex",alignItems:"center",gap:5,padding:"6px 12px",
              borderRadius:10,fontSize:11,fontWeight:700,
              border:view===k?"1.5px solid #111827":"1.5px solid #e5e7eb",
              background:view===k?"#111827":"white",
              color:view===k?"white":"#374151",cursor:"pointer",
            }}>{icon} {label}</button>
          ))}
        </div>
      </nav>

      {/* ── BODY (fills remaining height) ── */}
      <div style={{flex:1,display:"flex",overflow:"hidden",padding:"16px",minHeight:0}}>

        {/* LEFT: listings */}
        {showList && (
          <div style={{
            width: showMap ? 460 : "100%",
            flexShrink:0,
            display:"flex",
            flexDirection:"column",
            overflow:"hidden",
            minHeight:0,
          }}>
            {/* Sub-header */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,flexShrink:0}}>
              <div>
                <h2 style={{fontSize:15,fontWeight:800,color:"#111827",margin:0}}>
                  {filtered.length > 0 ? `Over ${filtered.length} homes` : "No homes found"}
                </h2>
                <p style={{fontSize:11,color:"#6b7280",margin:"2px 0 0"}}>
                  {loc} · {date} · {guests} guest{guests>1?"s":""}
                </p>
              </div>
              <div data-dd style={{display:"flex",gap:6}}>
                {/* Sort */}
                <div style={{position:"relative"}}>
                  <button onClick={()=>tog("sort")} style={{
                    display:"flex",alignItems:"center",gap:5,padding:"6px 11px",
                    borderRadius:10,fontSize:11,fontWeight:700,
                    border:"1.5px solid #e5e7eb",background:"white",color:"#374151",cursor:"pointer",
                  }}>{sort} <Icon.ChevDown size={10}/></button>
                  {openDD==="sort"&&(
                    <div style={{
                      position:"absolute",right:0,top:"calc(100% + 6px)",
                      background:"white",borderRadius:12,
                      boxShadow:"0 6px 24px rgba(0,0,0,0.1)",
                      border:"1px solid #f1f5f9",zIndex:200,overflow:"hidden",minWidth:145,
                    }}>
                      {["Top rated","Price: Low","Price: High"].map(s=>(
                        <button key={s} onClick={()=>{setSort(s);setOpenDD(null);}} style={{
                          display:"flex",alignItems:"center",justifyContent:"space-between",
                          width:"100%",padding:"9px 14px",border:"none",
                          background:sort===s?"#fef2f2":"white",
                          color:sort===s?"#ef4444":"#374151",
                          fontSize:12,fontWeight:sort===s?700:400,cursor:"pointer",
                        }}>{s}{sort===s&&<Icon.Check size={11}/>}</button>
                      ))}
                    </div>
                  )}
                </div>
                <button style={{
                  display:"flex",alignItems:"center",gap:5,padding:"6px 11px",
                  borderRadius:10,fontSize:11,fontWeight:700,
                  border:"1.5px solid #e5e7eb",background:"white",color:"#374151",cursor:"pointer",
                }}><Icon.Sliders size={11}/> Filters</button>
              </div>
            </div>

            {/* Cards */}
            <div style={{flex:1,overflowY:"auto",paddingRight:4}}>
              {paged.length===0 ? (
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:280,gap:10,color:"#9ca3af"}}>
                  <Icon.MapIco size={28}/>
                  <p style={{fontSize:13,fontWeight:700,margin:0}}>No homes match</p>
                  <p style={{fontSize:11,margin:0}}>Adjust guests or location</p>
                </div>
              ):(
                <div style={{display:"flex",flexDirection:"column",gap:12,paddingBottom:4}}>
                  {paged.map(p=>(
                    <Card key={p.id} p={p}
                      hot={hov===p.id}
                      onEnter={()=>setHov(p.id)}
                      onLeave={()=>setHov(null)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {total>1&&(
              <div style={{
                display:"flex",alignItems:"center",justifyContent:"space-between",
                paddingTop:12,borderTop:"1px solid #f1f5f9",flexShrink:0,marginTop:8,
              }}>
                <button
                  onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page_===1}
                  style={{
                    display:"flex",alignItems:"center",gap:5,padding:"7px 14px",
                    borderRadius:10,fontSize:11,fontWeight:700,
                    border:"1.5px solid #e5e7eb",background:"white",color:"#374151",
                    cursor:page_===1?"not-allowed":"pointer",opacity:page_===1?0.35:1,
                  }}
                ><Icon.ChevLeft size={13}/> Previous</button>

                <div style={{display:"flex",gap:4}}>
                  {Array.from({length:total},(_,i)=>i+1).map(n=>(
                    <button key={n} onClick={()=>setPage(n)} style={{
                      width:32,height:32,borderRadius:9,fontSize:12,fontWeight:700,
                      border:"none",cursor:"pointer",
                      background:page_===n?"#111827":"transparent",
                      color:page_===n?"white":"#6b7280",
                    }}>{n}</button>
                  ))}
                </div>

                <button
                  onClick={()=>setPage(p=>Math.min(total,p+1))} disabled={page_===total}
                  style={{
                    display:"flex",alignItems:"center",gap:5,padding:"7px 14px",
                    borderRadius:10,fontSize:11,fontWeight:700,
                    border:"1.5px solid #e5e7eb",background:"white",color:"#374151",
                    cursor:page_===total?"not-allowed":"pointer",opacity:page_===total?0.35:1,
                  }}
                >Next <Icon.ChevRight size={13}/></button>
              </div>
            )}
          </div>
        )}

        {/* RIGHT: map */}
        {showMap && (
          <div style={{flex:1,minWidth:0,overflow:"hidden",borderRadius:16,position:"relative"}}>
            <MapView properties={filtered} hovId={hov} onPin={(id: number) => setHov((v: number | null) => v===id?null:id)}/>
          </div>
        )}

      </div>
    </div>
  );
}