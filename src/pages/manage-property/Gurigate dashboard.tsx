import { useEffect, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, PieChart, Pie, Cell, Legend, Label, RadialBarChart, RadialBar, PolarRadiusAxis, PolarGrid } from 'recharts';
import { UserRoundCog, ShieldUser } from "lucide-react";

// Import page components
import GuriGateRentals from "./Gurigate rentals";
import GuriGateOrders from "./Gurigate orders";
import GuriGateTransaction from "./Gurigate transaction";
import GuriGateProperty from "./Gurigate property";
import CustomersPage from "@/pages/admin/CustomersPage";
import ProfilePage from "./ProfilePage";
import AdminBookings from "@/pages/admin/AdminBookings";
import AdminTransactions from "@/pages/admin/AdminTransactions";
import AdminHosts from "@/pages/admin/AdminHosts";
import AdminGuests from "@/pages/admin/AdminGuests";
import AdminVerifications from "@/pages/admin/AdminVerifications";
import AdminDisputes from "@/pages/admin/AdminDisputes";
import AdminNotifications from "@/pages/admin/AdminNotifications";
import DocumentsPage from "@/pages/admin/DocumentsPage";
import InvoicesPage from "./InvoicesPage";


// Import modal
import { AddPropertyModal } from "@/components/AddPropertyModal";

// ── Icons ──────────────────────────────────────────────────────────────────────
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
  Menu: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Search: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Bell: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  Smile: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
  ChevronDown: ({size=14}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  MoreVert: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>,
  Moon: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
  TrendUp: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  TrendDown: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>,
  Check: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Settings: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
  Eye: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Edit: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
};

// ── Sparkline (mini area chart via SVG) ───────────────────────────────────────
function Sparkline({ data, color, filled = true }: { data: number[]; color: string; filled?: boolean }) {
  const W = 80, H = 32;
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / (max - min || 1)) * H * 0.85 - H * 0.05;
    return `${x},${y}`;
  });
  const linePath = `M ${pts.join(" L ")}`;
  const areaPath = `${linePath} L ${W},${H} L 0,${H} Z`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none">
      {filled && <path d={areaPath} fill={color} fillOpacity="0.15" />}
      <path d={linePath} stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Bar Sparkline ─────────────────────────────────────────────────────────────
function BarSparkline({ data, color }: { data: number[]; color: string }) {
  const W = 80, H = 32;
  const max = Math.max(...data);
  const barW = (W / data.length) * 0.5;
  const gap = W / data.length;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {data.map((v, i) => {
        const h = (v / max) * H * 0.85;
        const x = i * gap + gap * 0.25;
        const y = H - h;
        return <rect key={i} x={x} y={y} width={barW} height={h} rx="2" fill={color} fillOpacity={i === data.length - 2 ? 1 : 0.5} />;
      })}
    </svg>
  );
}

          
// ── Sales Analytics Line Chart (Recharts) ────────────────────────────────────────
function SalesChart() {
  const data = [
    { month: "Jan", income: 2000, expenses: 1200 },
    { month: "Feb", income: 4500, expenses: 2000 },
    { month: "Mar", income: 3200, expenses: 1800 },
    { month: "Apr", income: 6000, expenses: 2500 },
    { month: "May", income: 5500, expenses: 2200 },
    { month: "Jun", income: 14000, expenses: 3000 },
    { month: "Jul", income: 7000, expenses: 2600 },
    { month: "Aug", income: 8500, expenses: 3200 },
    { month: "Sep", income: 6800, expenses: 2800 },
    { month: "Oct", income: 5200, expenses: 2400 },
    { month: "Nov", income: 7800, expenses: 3100 },
    { month: "Dec", income: 9500, expenses: 3600 },
  ];

  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E8344E" stopOpacity={0.2}/>
            <stop offset="100%" stopColor="#E8344E" stopOpacity={0.01}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="0" vertical={false} stroke="#F3F4F6" />
        <XAxis 
          dataKey="month" 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#9CA3AF' }}
          tickFormatter={(value, index) => index === 5 ? value : value}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#9CA3AF' }}
          tickFormatter={(value) => value >= 1000 ? `${value/1000}k` : value}
        />
        <Tooltip 
          contentStyle={{ 
            background: 'white', 
            border: '1px solid #F1F5F9', 
            borderRadius: '8px',
            fontSize: '12px'
          }}
        />
        <Area 
          type="monotone" 
          dataKey="income" 
          stroke="#E8344E" 
          strokeWidth={2}
          fill="url(#incomeGradient)"
        />
        <Line 
          type="monotone" 
          dataKey="expenses" 
          stroke="#93C5FD" 
          strokeWidth={1.5}
          strokeDasharray="4 3"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Goals Radial Stacked Chart (Recharts) ────────────────────────────────────────
function GoalsChart() {
  const chartData = [{ month: "january", mobile: 570, desktop: 1260 }];
  const totalVisitors = chartData[0].desktop + chartData[0].mobile;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <RadialBarChart
        data={chartData}
        endAngle={180}
        innerRadius={60}
        outerRadius={80}
        cx="50%"
        cy="80%"
      >
        <RadialBar
          dataKey="mobile"
          fill="#F59E0B"
          stackId="a"
          cornerRadius={5}
          className="stroke-transparent stroke-2"
        />
        <RadialBar
          dataKey="desktop"
          stackId="a"
          cornerRadius={5}
          fill="#E8344E"
          className="stroke-transparent stroke-2"
        />
        <Tooltip 
          cursor={false}
          contentStyle={{ 
            background: 'white', 
            border: '1px solid #F1F5F9', 
            borderRadius: '8px',
            fontSize: '12px'
          }}
        />
        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) - 16}
                      style={{ fontSize: '20px', fontWeight: 700, fill: '#1F2937' }}
                    >
                      {totalVisitors.toLocaleString()}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 4}
                      style={{ fontSize: '12px', fill: '#9CA3AF' }}
                    >
                      Visitors
                    </tspan>
                  </text>
                )
              }
            }}
          />
        </PolarRadiusAxis>
      </RadialBarChart>
    </ResponsiveContainer>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────
const INITIAL_TRANSACTIONS = [
  { id:1, name:"New York", type:"House", txn:"Buy", customer:"Thomas L. Fletcher", avatar:"TF", color:"#E8344E", date:"Jan 31, 2025", status:"CANCEL", img:"https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=60&q=80" },
  { id:2, name:"Washington Residence", type:"Villa", txn:"Rent", customer:"David Lee", avatar:"DL", color:"#10B981", date:"Jan 30, 2025", status:"COMPLETED", img:"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=60&q=80" },
  { id:3, name:"London Residence", type:"House", txn:"Buy", customer:"Eleana Porana", avatar:"EP", color:"#E8344E", date:"Jan 30, 2025", status:"CANCEL", img:"https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=60&q=80" },
  { id:4, name:"Grand Resort Villa", type:"Villa", txn:"Rent", customer:"Mike Hussey", avatar:"MH", color:"#10B981", date:"Jan 29, 2025", status:"COMPLETED", img:"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=60&q=80" },
  { id:5, name:"Tokyo Penthouse", type:"Apartment", txn:"Buy", customer:"Sara Kim", avatar:"SK", color:"#F59E0B", date:"Jan 28, 2025", status:"PENDING", img:"https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=60&q=80" },
];

const NAV_ITEMS = [
  { label:"Dashboard", icon:<Icon.Grid/>, section:"main" },
  { label:"Buildings", icon:<Icon.Building/>, section:"main" },
  { label:"Units", icon:<Icon.Home/>, section:"main" },
  { label:"Customers", icon:<UserRoundCog size={16}/>, section:"main" },
  { label:"Leases", icon:<Icon.Calendar/>, section:"main" },
  { label:"Payments", icon:<Icon.CreditCard/>, section:"main" },
  { label:"Documents", icon:<Icon.Inbox/>, section:"main" },
  { label:"Invoices", icon:<Icon.BarChart/>, section:"main" },
  { label:"Reports", icon:<Icon.TrendUp/>, section:"main" },
  { label:"Settings", icon:<Icon.Settings/>, section:"configuration" },
];

const STATUS_COLORS = {
  CANCEL: { bg:"#FEF2F2", text:"#E8344E" },
  COMPLETED: { bg:"#ECFDF5", text:"#059669" },
  PENDING: { bg:"#FFFBEB", text:"#D97706" },
};

// ── Coming Soon Page Component ───────────────────────────────────────────────────
function ComingSoonPage({ title, icon, description }: { title: string; icon: React.ReactNode; description: string }) {
  return (
    <div style={{ padding:"40px 20px", textAlign:"center", minHeight:"60vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:80, height:80, background:"#E8344E20", borderRadius:20, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:24, fontSize:32, color:"#E8344E" }}>
        {icon}
      </div>
      <h1 style={{ fontSize:28, fontWeight:700, color:"#111827", marginBottom:12 }}>{title}</h1>
      <p style={{ fontSize:16, color:"#9CA3AF", marginBottom:32, maxWidth:400, lineHeight:1.5 }}>{description}</p>
      <div style={{ background:"#F8F9FC", border:"1px solid #F1F5F9", borderRadius:12, padding:24, maxWidth:500 }}>
        <h2 style={{ fontSize:18, fontWeight:600, color:"#111827", marginBottom:16 }}>Coming Soon</h2>
        <p style={{ fontSize:14, color:"#6B7280", lineHeight:1.6, marginBottom:20 }}>
          We're working hard to bring you the {title.toLowerCase()} feature. This will include powerful tools to {description.toLowerCase()}.
        </p>
        <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 16px", background:"#E8344E10", borderRadius:8, color:"#E8344E", fontSize:13, fontWeight:500 }}>
            <Icon.Check/> Advanced Features
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 16px", background:"#10B98110", borderRadius:8, color:"#10B981", fontSize:13, fontWeight:500 }}>
            <Icon.Check/> User-Friendly Interface
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 16px", background:"#F59E0B10", borderRadius:8, color:"#F59E0B", fontSize:13, fontWeight:500 }}>
            <Icon.Check/> Real-time Updates
          </div>
        </div>
      </div>
      <div style={{ marginTop:32 }}>
        <button style={{ background:"#E8344E", color:"white", border:"none", borderRadius:10, padding:"12px 24px", fontSize:14, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:8, margin:"0 auto" }}>
          <Icon.Bell/> Notify Me When Available
        </button>
      </div>
    </div>
  );
}

// ── View Transaction Panel ───────────────────────────────────────────────────────
function ViewTransactionPanel({ transaction, onClose }: { transaction: any; onClose: () => void }) {
  if (!transaction) return null;
  
  return (
    <div 
      onClick={onClose}
      style={{ 
        position:"fixed", 
        inset:0, 
        background:"rgba(0,0,0,0.5)", 
        zIndex:1000, 
        display:"flex", 
        justifyContent:"flex-end" 
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          width:450, 
          background:"white", 
          height:"100%", 
          padding:24, 
          overflowY:"auto",
          boxShadow:"-4px 0 24px rgba(0,0,0,0.15)" 
        }}
      >
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <h2 style={{ fontSize:20, fontWeight:700 }}>Transaction Details</h2>
          <button 
            onClick={onClose}
            style={{ background:"none", border:"none", cursor:"pointer", color:"#9CA3AF", padding:4 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div style={{ marginBottom:20 }}>
          <img src={transaction.img} alt={transaction.name} style={{ width:"100%", height:200, objectFit:"cover", borderRadius:12, marginBottom:16 }} />
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
            <div style={{ width:48, height:48, borderRadius:"50%", background:transaction.color, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:16, fontWeight:700 }}>
              {transaction.avatar}
            </div>
            <div>
              <h3 style={{ fontSize:18, fontWeight:700, marginBottom:2 }}>{transaction.name}</h3>
              <p style={{ fontSize:14, color:"#6B7280" }}>{transaction.customer}</p>
            </div>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
          <div style={{ background:"#F8F9FC", padding:16, borderRadius:12 }}>
            <p style={{ fontSize:12, color:"#9CA3AF", marginBottom:4 }}>Property Type</p>
            <p style={{ fontSize:15, fontWeight:600 }}>{transaction.type}</p>
          </div>
          <div style={{ background:"#F8F9FC", padding:16, borderRadius:12 }}>
            <p style={{ fontSize:12, color:"#9CA3AF", marginBottom:4 }}>Transaction Type</p>
            <p style={{ fontSize:15, fontWeight:600 }}>{transaction.txn}</p>
          </div>
          <div style={{ background:"#F8F9FC", padding:16, borderRadius:12 }}>
            <p style={{ fontSize:12, color:"#9CA3AF", marginBottom:4 }}>Date</p>
            <p style={{ fontSize:15, fontWeight:600 }}>{transaction.date}</p>
          </div>
          <div style={{ background:"#F8F9FC", padding:16, borderRadius:12 }}>
            <p style={{ fontSize:12, color:"#9CA3AF", marginBottom:4 }}>Status</p>
            <span style={{ ...STATUS_COLORS[transaction.status as keyof typeof STATUS_COLORS], display:"inline-block", padding:"4px 12px", borderRadius:20, fontSize:12, fontWeight:700 }}>
              {transaction.status}
            </span>
          </div>
        </div>

        <div style={{ background:"#F8F9FC", padding:16, borderRadius:12, marginBottom:20 }}>
          <p style={{ fontSize:12, color:"#9CA3AF", marginBottom:8 }}>Transaction ID</p>
          <p style={{ fontSize:14, fontWeight:600, fontFamily:"monospace" }}>#{transaction.id.toString().padStart(6, '0')}</p>
        </div>

        <div style={{ display:"flex", gap:12 }}>
          <button 
            onClick={onClose}
            style={{ 
              flex:1, 
              padding:"12px 24px", 
              border:"1px solid #E5E7EB", 
              background:"white", 
              borderRadius:10, 
              fontSize:14, 
              fontWeight:600, 
              cursor:"pointer",
              color:"#6B7280"
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Edit Transaction Panel ───────────────────────────────────────────────────────
function EditTransactionPanel({ transaction, onClose, onSave }: { transaction: any; onClose: () => void; onSave: (updated: any) => void }) {
  const [formData, setFormData] = useState({
    name: transaction?.name || '',
    type: transaction?.type || '',
    txn: transaction?.txn || '',
    customer: transaction?.customer || '',
    date: transaction?.date || '',
    status: transaction?.status || 'PENDING'
  });

  if (!transaction) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...transaction, ...formData });
    onClose();
  };

  return (
    <div 
      onClick={onClose}
      style={{ 
        position:"fixed", 
        inset:0, 
        background:"rgba(0,0,0,0.5)", 
        zIndex:1000, 
        display:"flex", 
        justifyContent:"flex-end" 
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          width:450, 
          background:"white", 
          height:"100%", 
          padding:24, 
          overflowY:"auto",
          boxShadow:"-4px 0 24px rgba(0,0,0,0.15)" 
        }}
      >
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <h2 style={{ fontSize:20, fontWeight:700 }}>Edit Transaction</h2>
          <button 
            onClick={onClose}
            aria-label="Close edit transaction modal"
            title="Close"
            style={{ background:"none", border:"none", cursor:"pointer", color:"#9CA3AF", padding:4 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:16 }}>
            <label htmlFor="property-name" style={{ display:"block", fontSize:13, fontWeight:600, color:"#374151", marginBottom:6 }}>Property Name</label>
            <input
              id="property-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter property name"
              style={{ 
                width:"100%", 
                padding:"10px 12px", 
                border:"1px solid #E5E7EB", 
                borderRadius:8, 
                fontSize:14,
                outline:"none"
              }}
              required
            />
          </div>

          <div style={{ marginBottom:16 }}>
            <label htmlFor="property-type" style={{ display:"block", fontSize:13, fontWeight:600, color:"#374151", marginBottom:6 }}>Property Type</label>
            <select
              id="property-type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              title="Select property type"
              style={{ 
                width:"100%", 
                padding:"10px 12px", 
                border:"1px solid #E5E7EB", 
                borderRadius:8, 
                fontSize:14,
                outline:"none",
                background:"white"
              }}
              required
            >
              <option value="House">House</option>
              <option value="Villa">Villa</option>
              <option value="Apartment">Apartment</option>
              <option value="Condo">Condo</option>
            </select>
          </div>

          <div style={{ marginBottom:16 }}>
            <label htmlFor="transaction-type" style={{ display:"block", fontSize:13, fontWeight:600, color:"#374151", marginBottom:6 }}>Transaction Type</label>
            <select
              id="transaction-type"
              value={formData.txn}
              onChange={(e) => setFormData({ ...formData, txn: e.target.value })}
              title="Select transaction type"
              style={{ 
                width:"100%", 
                padding:"10px 12px", 
                border:"1px solid #E5E7EB", 
                borderRadius:8, 
                fontSize:14,
                outline:"none",
                background:"white"
              }}
              required
            >
              <option value="Buy">Buy</option>
              <option value="Rent">Rent</option>
            </select>
          </div>

          <div style={{ marginBottom:16 }}>
            <label htmlFor="customer-name" style={{ display:"block", fontSize:13, fontWeight:600, color:"#374151", marginBottom:6 }}>Customer Name</label>
            <input
              id="customer-name"
              type="text"
              value={formData.customer}
              onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
              placeholder="Enter customer name"
              style={{ 
                width:"100%", 
                padding:"10px 12px", 
                border:"1px solid #E5E7EB", 
                borderRadius:8, 
                fontSize:14,
                outline:"none"
              }}
              required
            />
          </div>

          <div style={{ marginBottom:16 }}>
            <label htmlFor="transaction-date" style={{ display:"block", fontSize:13, fontWeight:600, color:"#374151", marginBottom:6 }}>Date</label>
            <input
              id="transaction-date"
              type="text"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              placeholder="Enter date"
              style={{ 
                width:"100%", 
                padding:"10px 12px", 
                border:"1px solid #E5E7EB", 
                borderRadius:8, 
                fontSize:14,
                outline:"none"
              }}
              required
            />
          </div>

          <div style={{ marginBottom:24 }}>
            <label htmlFor="status" style={{ display:"block", fontSize:13, fontWeight:600, color:"#374151", marginBottom:6 }}>Status</label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              title="Select status"
              style={{ 
                width:"100%", 
                padding:"10px 12px", 
                border:"1px solid #E5E7EB", 
                borderRadius:8, 
                fontSize:14,
                outline:"none",
                background:"white"
              }}
              required
            >
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="CANCEL">Cancelled</option>
            </select>
          </div>

          <div style={{ display:"flex", gap:12 }}>
            <button 
              type="button"
              onClick={onClose}
              style={{ 
                flex:1, 
                padding:"12px 24px", 
                border:"1px solid #E5E7EB", 
                background:"white", 
                borderRadius:10, 
                fontSize:14, 
                fontWeight:600, 
                cursor:"pointer",
                color:"#6B7280"
              }}
            >
              Cancel
            </button>
            <button 
              type="submit"
              style={{ 
                flex:1, 
                padding:"12px 24px", 
                border:"none", 
                background:"#E8344E", 
                color:"white",
                borderRadius:10, 
                fontSize:14, 
                fontWeight:600, 
                cursor:"pointer"
              }}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function GuriGateDashboard() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [checked, setChecked] = useState<number[]>([]);
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1440,
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelType, setPanelType] = useState<'view' | 'edit'>('view');
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sync URL -> active tab (deep link support)
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/settings')) {
      setActiveNav('Settings');
    } else if (path.endsWith('/manage-property/customers')) {
      setActiveNav('Customer');
    } else if (path.endsWith('/manage-property/bookings')) {
      setActiveNav('Bookings');
    } else if (path.endsWith('/manage-property/transactions')) {
      setActiveNav('Transactions');
    } else if (path.endsWith('/manage-property/hosts')) {
      setActiveNav('Hosts');
    } else if (path.endsWith('/manage-property/guests')) {
      setActiveNav('Guests');
    } else if (path.endsWith('/manage-property/verifications')) {
      setActiveNav('Verifications');
    } else if (path.endsWith('/manage-property/disputes')) {
      setActiveNav('Disputes');
    } else if (path.endsWith('/manage-property/invoices')) {
      setActiveNav('Invoices');
    } else if (path.endsWith('/manage-property/notifications')) {
      setActiveNav('Notifications');
    } else if (path.endsWith('/manage-property/settings')) {
      setActiveNav('Settings');
    }
  }, [location.pathname]);

  const isMobile = viewportWidth < 1024;
  const isTablet = viewportWidth < 1280;

  const toggle = (id: number) => setChecked((p: number[]) => p.includes(id) ? p.filter((x: number)=>x!==id) : [...p, id]);

  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  const handleAddPropertySuccess = (property: any) => {
    console.log('Property created successfully:', property);
    // You can add additional logic here like refreshing the property list
  };

  const handleViewTransaction = (transaction: any) => {
    setSelectedTransaction(transaction);
    setPanelType('view');
    setPanelOpen(true);
    setMenuOpenId(null);
  };

  const handleEditTransaction = (transaction: any) => {
    setSelectedTransaction(transaction);
    setPanelType('edit');
    setPanelOpen(true);
    setMenuOpenId(null);
  };

  const handleSaveTransaction = (updated: any) => {
    console.log('Transaction updated:', updated);
    setTransactions((prev: any[]) => 
      prev.map((t: any) => t.id === updated.id ? updated : t)
    );
  };

  // Routing function to render different pages
  const renderPage = () => {
    switch (activeNav) {
      case "Properties":
        return <GuriGateProperty />;
      case "Customers":
        return <CustomersPage />;
      case "Leases":
        return <GuriGateRentals />;
      case "Payments":
        return <GuriGateTransaction />;
      case "Transactions":
        return <ComingSoonPage title="Transactions" icon={<Icon.CreditCard/>} description="Activity history for lease payments and lease actions" />;
      case "Documents":
        return <DocumentsPage />;
      case "Invoices":
        return <InvoicesPage />;
      case "Settings":
        return <ProfilePage />;
      default:
        // Default Dashboard content
        return (
          <>
            {/* Page heading */}
            <div style={{ display:"flex", alignItems:isMobile ? "stretch" : "flex-start", justifyContent:"space-between", flexDirection:isMobile ? "column" : "row", gap:isMobile ? 12 : 0, marginBottom:24 }}>
              <div>
                <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:"-0.4px" }}>Dashboard</h1>
                <p style={{ fontSize:12, color:"#9CA3AF", marginTop:2 }}>Welcome, Let's dive into your personalized setup guide.</p>
              </div>
              <button 
                onClick={() => setShowAddPropertyModal(true)}
                style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, background:"#E8344E", color:"white", border:"none", borderRadius:10, padding:"10px 18px", fontSize:13, fontWeight:600, cursor:"pointer", width:isMobile ? "100%" : "auto" }}
                title="Add a new property to your portfolio"
              >
                <Icon.Plus/> Add Property
              </button>
            </div>

            {/* Stat cards */}
            <div style={{ display:"grid", gridTemplateColumns:isMobile ? "1fr" : isTablet ? "repeat(2,1fr)" : "repeat(4,1fr)", gap:14, marginBottom:20 }}>
              {[
                { label:"Total Revenue", value:"$12,450", change:"+12.5%", data:[40,35,45,30,50,40,55,45,60,50,65,55], type:"line", color:"#E8344E" },
                { label:"Occupied Units", value:"8", change:"+5.0%", data:[20,35,25,45,30,60,40,55,42,65,50,70], type:"bar", color:"#10B981" },
                { label:"Vacant Units", value:"4", change:"-20.0%", data:[30,25,40,35,50,30,45,55,40,60,50,65], type:"bar", color:"#F59E0B" },
                { label:"Active Leases", value:"8", change:"+5.0%", data:[25,40,30,50,35,55,40,60,45,65,50,70], type:"line", color:"#3B82F6" },
              ].map((card: any) => (
                <div key={card.label} className="stat-card" style={{ background:"white", border:"1px solid #F1F5F9" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                    <div style={{ width:32, height:32, background:"#FEF2F2", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {card.label.includes("Revenue") ? <Icon.CreditCard/> : card.label.includes("Units") ? <Icon.Building/> : card.label.includes("Leases") ? <Icon.Home/> : <Icon.User/>}
                    </div>
                    {card.type === "bar"
                      ? <BarSparkline data={card.data} color={card.color}/>
                      : <Sparkline data={card.data} color={card.color}/>
                    }
                  </div>
                  <p style={{ fontSize:11, color:"#9CA3AF", marginBottom:4 }}>{card.label}</p>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:20, fontWeight:700, letterSpacing:"-0.5px" }}>{card.value}</span>
                    <span className="badge" style={{ background:card.change.includes("-") ? "#FEF2F2" : "#ECFDF5", color:card.change.includes("-") ? "#E8344E" : "#059669" }}>
                      {card.change.includes("-") ? <Icon.TrendDown/> : <Icon.TrendUp/>}{card.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div style={{ display:"grid", gridTemplateColumns:isMobile ? "1fr" : "minmax(0,1fr) 280px", gap:14, marginBottom:20 }}>
              {/* Sales Analytics */}
              <div className="chart-card" style={{ background:"white", border:"1px solid #F1F5F9" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                  <h2 style={{ fontSize:15, fontWeight:700 }}>Sales Analytics</h2>
                  <button style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:"#6B7280", background:"#F8F9FC", border:"none", borderRadius:8, padding:"6px 12px", cursor:"pointer" }}>
                    Last Month <Icon.ChevronDown/>
                  </button>
                </div>
                <div style={{ display:"flex", gap:16, marginBottom:14 }}>
                  {[
                    { label:"Income", value:"$5,720.00", color:"#E8344E" },
                    { label:"Expenses", value:"$5,720.00", color:"#93C5FD" },
                  ].map((l: any) => (
                    <div key={l.label} style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <div style={{ width:8, height:8, borderRadius:2, background:l.color }}/>
                      <span style={{ fontSize:11, color:"#9CA3AF" }}>{l.label}</span>
                      <span style={{ fontSize:12, fontWeight:600 }}>{l.value}</span>
                    </div>
                  ))}
                </div>
                <SalesChart/>
              </div>

              {/* Goals donut */}
              <div className="chart-card" style={{ background:"white", border:"1px solid #F1F5F9" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                  <h2 style={{ fontSize:15, fontWeight:700 }}>Goals</h2>
                  <button style={{ background:"none", border:"none", cursor:"pointer", color:"#9CA3AF" }} title="More options"><Icon.MoreVert/></button>
                </div>
                <GoalsChart/>
                <div style={{ marginTop:16, paddingTop:16, borderTop:"1px solid #F1F5F9" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12, fontSize:13, fontWeight:500, color:"#111827", marginBottom:4 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <div style={{ width:8, height:8, borderRadius:2, background:"#E8344E" }}/>
                      <span>desktop: 1,260</span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <div style={{ width:8, height:8, borderRadius:2, background:"#F59E0B" }}/>
                      <span>mobile: 570</span>
                    </div>
                  </div>
                  <p style={{ fontSize:12, color:"#9CA3AF", margin:0 }}>
                    Showing total visitors for the last 6 months
                  </p>
                </div>
              </div>
            </div>

            {/* Transaction Table */}
            <div style={{ background:"white", borderRadius:16, border:"1px solid #F1F5F9", overflow:"hidden" }}>
              <div style={{ display:"flex", alignItems:isMobile ? "stretch" : "center", justifyContent:"space-between", flexDirection:isMobile ? "column" : "row", gap:isMobile ? 10 : 0, padding:"18px 20px 14px" }}>
                <h2 style={{ fontSize:15, fontWeight:700 }}>Recent Transaction History</h2>
                <button style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:"#6B7280", background:"#F8F9FC", border:"none", borderRadius:8, padding:"6px 12px", cursor:"pointer" }}>
                  Last Month <Icon.ChevronDown/>
                </button>
              </div>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                  <thead>
                    <tr style={{ borderBottom:"1px solid #F1F5F9" }}>
                      <th style={{ padding:"10px 20px", textAlign:"left", fontWeight:600, fontSize:12, color:"#9CA3AF" }}>
                        <input type="checkbox" title="Select all transactions"/>
                      </th>
                      {["Properties Name","Properties Type","Transaction","Customer","Date","Status",""].map((h: any) => (
                        <th key={h} style={{ padding:"10px 12px", textAlign:"left", fontWeight:600, fontSize:12, color:"#9CA3AF", whiteSpace:"nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((row: any) => (
                      <tr key={row.id} className="txn-row" style={{ borderBottom:"1px solid #F9FAFB", transition:"background .1s" }}>
                        <td style={{ padding:"12px 20px" }}>
                          <input type="checkbox" checked={checked.includes(row.id)} onChange={()=>toggle(row.id)}/>
                        </td>
                        <td style={{ padding:"12px 12px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <img src={row.img} alt="" style={{ width:36, height:36, borderRadius:8, objectFit:"cover" }}/>
                            <span style={{ fontWeight:500, fontSize:13 }}>{row.name}</span>
                          </div>
                        </td>
                        <td style={{ padding:"12px 12px", color:"#6B7280" }}>{row.type}</td>
                        <td style={{ padding:"12px 12px", color:"#6B7280" }}>{row.txn}</td>
                        <td style={{ padding:"12px 12px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <div style={{ width:28, height:28, borderRadius:"50%", background:row.color, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:10, fontWeight:700, flexShrink:0 }}>
                              {row.avatar}
                            </div>
                            <span style={{ fontWeight:500, fontSize:12 }}>{row.customer}</span>
                          </div>
                        </td>
                        <td style={{ padding:"12px 12px", color:"#9CA3AF", fontSize:12, whiteSpace:"nowrap" }}>{row.date}</td>
                        <td style={{ padding:"12px 12px" }}>
                          <span style={{ ...STATUS_COLORS[row.status as keyof typeof STATUS_COLORS], display:"inline-block", padding:"4px 10px", borderRadius:20, fontSize:11, fontWeight:700 }}>
                            {row.status}
                          </span>
                        </td>
                        <td style={{ padding:"12px 12px", position:"relative" }}>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpenId(menuOpenId === row.id ? null : row.id);
                            }}
                            style={{ background:"none", border:"none", cursor:"pointer", color:"#9CA3AF", padding:4 }} 
                            title="More options"
                          >
                            <Icon.MoreVert/>
                          </button>
                          {menuOpenId === row.id && (
                            <div 
                              onClick={(e) => e.stopPropagation()}
                              style={{ 
                                position:"absolute", 
                                right:0, 
                                top:"100%", 
                                background:"white", 
                                border:"1px solid #F1F5F9", 
                                borderRadius:8, 
                                boxShadow:"0 4px 12px rgba(0,0,0,0.1)", 
                                zIndex:100, 
                                minWidth:"120px",
                                padding:"4px 0"
                              }}
                            >
                              <button 
                                onClick={() => handleViewTransaction(row)}
                                style={{ 
                                  display:"flex", 
                                  alignItems:"center", 
                                  gap:8, 
                                  width:"100%", 
                                  padding:"8px 12px", 
                                  border:"none", 
                                  background:"none", 
                                  cursor:"pointer", 
                                  fontSize:13, 
                                  color:"#6B7280",
                                  textAlign:"left"
                                }}
                              >
                                <Icon.Eye/> View
                              </button>
                              <button 
                                onClick={() => handleEditTransaction(row)}
                                style={{ 
                                  display:"flex", 
                                  alignItems:"center", 
                                  gap:8, 
                                  width:"100%", 
                                  padding:"8px 12px", 
                                  border:"none", 
                                  background:"none", 
                                  cursor:"pointer", 
                                  fontSize:13, 
                                  color:"#6B7280",
                                  textAlign:"left"
                                }}
                              >
                                <Icon.Edit/> Edit
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </>
        );
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#F8F9FC", minHeight: "100vh", display: "flex", flexDirection: isMobile ? "column" : "row", color: "#111827", overflowX: "hidden" }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=verified" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 4px; }
        .nav-item { display:flex; align-items:center; gap:10px; padding:9px 14px; border-radius:10px; cursor:pointer; font-size:13px; font-weight:500; transition:all .15s; width:100%; border:none; background:none; text-align:left; }
        .nav-item:hover { background:rgba(232,52,78,0.06); color:#E8344E; }
        .nav-item.active { background:rgba(232,52,78,0.08); color:#E8344E; font-weight:600; }
        .stat-card { border-radius:14px; padding:20px; transition:all .2s; cursor:default; }
        .stat-card:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,0.08); }
        .badge { display:inline-flex; align-items:center; gap:4px; font-size:11px; font-weight:600; padding:3px 8px; border-radius:20px; }
        .txn-row:hover { background:rgba(232,52,78,0.03); }
        .toggle-switch { width:38px; height:22px; background:#E5E7EB; border-radius:20px; position:relative; cursor:pointer; transition:background .2s; border:none; }
        .toggle-switch.on { background:#E8344E; }
        .toggle-knob { position:absolute; width:16px; height:16px; background:white; border-radius:50%; top:3px; left:3px; transition:transform .2s; box-shadow:0 1px 3px rgba(0,0,0,.2); }
        .toggle-switch.on .toggle-knob { transform:translateX(16px); }
        .chart-card { border-radius:16px; padding:20px; }
        input[type=checkbox] { accent-color:#E8344E; width:14px; height:14px; cursor:pointer; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
      `}</style>

      {isMobile && sidebarOpen ? (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)", zIndex: 59 }}
        />
      ) : null}

      {isMobile ? (
        <div style={{ position:"sticky", top:0, zIndex:60, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, padding:"14px 16px", background: "white", borderBottom:"1px solid #F1F5F9" }}>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ display:"flex", alignItems:"center", gap:8, border:"none", background:"none", cursor:"pointer", color: "#111827", fontSize:13, fontWeight:600 }}
          >
            <Icon.Menu /> Menu
          </button>
          <span style={{ fontSize:13, fontWeight:700 }}>{activeNav}</span>
          <button
            onClick={() => setShowAddPropertyModal(true)}
            style={{ display:"flex", alignItems:"center", gap:6, border:"none", borderRadius:999, background:"#E8344E", color:"white", cursor:"pointer", fontSize:12, fontWeight:700, padding:"8px 12px" }}
          >
            <Icon.Plus /> Add
          </button>
        </div>
      ) : null}

      {/* ── Sidebar ── */}
      <aside style={{ width:250, flexShrink:0, background: "white", borderRight:"1px solid #F1F5F9", display:"flex", flexDirection:"column", padding:"20px 12px", position:isMobile ? "fixed" : "sticky", left:isMobile ? (sidebarOpen ? 0 : -266) : "auto", top:0, zIndex:isMobile ? 60 : "auto", alignSelf:"stretch", overflowY:"auto", transition:isMobile ? "left .2s ease" : "none", paddingBottom:0 }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:28, paddingLeft:6 }}>
        </div>

        {/* Nav sections */}
        {[["RENT MANAGEMENT", NAV_ITEMS.filter((n: any) => n.section==="main")], ["CONFIGURATION", NAV_ITEMS.filter((n: any) => n.section==="configuration")]].map(([label, items]: any) => (
          <div key={label} style={{ marginBottom:20 }}>
            <p style={{ fontSize:14, fontWeight:700, letterSpacing:"0.08em", color:"#111827", padding:"0 14px 8px" }}>{label}</p>
            {items.map((item: any) => (
              <button key={item.label} className={`nav-item${activeNav===item.label?" active":""}`} onClick={()=>{
                  setActiveNav(item.label);
                  const routeMap: Record<string, string> = {
                    'Customer': '/manage-property/customers',
                    'Bookings': '/manage-property/bookings',
                    'Hosts': '/manage-property/hosts',
                    'Guests': '/manage-property/guests',
                    'Verifications': '/manage-property/verifications',
                    'Disputes': '/manage-property/disputes',
                    'Invoices': '/manage-property/invoices',
                    'Notifications': '/manage-property/notifications',
                    'Settings': '/settings/profile'
                  };
                  navigate(routeMap[item.label] || '/manage-property');
                }}
                style={{ color: activeNav===item.label?"#E8344E":"#6B7280" }}>
                <span style={{ opacity:0.8 }}>{item.icon}</span>{item.label}
              </button>
            ))}
          </div>
        ))}
      </aside>

      {/* ── Main Area ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, overflowX:"hidden" }}>
        {/* Content */}
        <main style={{ padding:isMobile ? "16px" : "28px", flex:1, overflowY:"auto" }}>
          {renderPage()}
        </main>
      </div>

      {/* Add Property Modal */}
      {showAddPropertyModal && (
        <AddPropertyModal
          onClose={() => setShowAddPropertyModal(false)}
          onSuccess={handleAddPropertySuccess}
        />
      )}

      {/* View/Edit Transaction Panels */}
      {panelOpen && selectedTransaction && (
        <>
          {panelType === 'view' && (
            <ViewTransactionPanel
              transaction={selectedTransaction}
              onClose={() => setPanelOpen(false)}
            />
          )}
          {panelType === 'edit' && (
            <EditTransactionPanel
              transaction={selectedTransaction}
              onClose={() => setPanelOpen(false)}
              onSave={handleSaveTransaction}
            />
          )}
        </>
      )}
    </div>
  );
}
