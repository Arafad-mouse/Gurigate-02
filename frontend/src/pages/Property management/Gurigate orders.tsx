import { useState, useMemo, useEffect } from "react";

// ── Icons ──────────────────────────────────────────────────────────────────────
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
  Moon: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
  Plus: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  TrendUp: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  TrendDown: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>,
  Star: ({ fill="#E8344E" }) => <svg width="12" height="12" viewBox="0 0 24 24" fill={fill} stroke={fill} strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Filter: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  Columns: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>,
  Export: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  CalendarRange: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="16" y2="14"/></svg>,
  MoreVert: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>,
  Settings2: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  MapPin: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
};

// Date parsing utilities
const parseDate = (dateStr: string): Date => {
  const months: { [key: string]: number } = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
  };
  const [monthStr, day, year] = dateStr.replace(',', '').split(' ');
  return new Date(parseInt(year), months[monthStr], parseInt(day));
};

const formatDate = (date: Date): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

const ORDERS = [
  { id:"ORD-1001", customer:"Axmed Cabdalle",    email:"axmed@gmail.com",    date:parseDate("Jul 8, 2024"), units:3, property:"Burjiomar A",  type:"Rental",    rating:4.9, status:"Active",      avatar:null, paymentStatus:"Paid",     paymentMethod:"Zaad" },
  { id:"ORD-1002", customer:"Faadumo Xasan",     email:"faadumo@gmail.com",  date:parseDate("Jul 8, 2024"), units:1, property:"Kulmiye Tower", type:"Purchase",  rating:2.1, status:"Unverified",  avatar:null, paymentStatus:"Pending",  paymentMethod:"eDahab" },
  { id:"ORD-1003", customer:"Cabdi Warsame",     email:"cabdi@gmail.com",    date:parseDate("Jul 8, 2024"), units:2, property:"Burjiomar B",  type:"Rental",    rating:4.9, status:"Suspended",   avatar:null, paymentStatus:"Paid",     paymentMethod:"Premier Wallet" },
  { id:"ORD-1004", customer:"Sahra Maxamed",     email:"sahra@gmail.com",    date:parseDate("Jul 8, 2024"), units:1, property:"Short Stay",   type:"Short Stay", rating:3.5, status:"Deactivated", avatar:null, paymentStatus:"Refunded", paymentMethod:"Zaad" },
  { id:"ORD-1005", customer:"Mustafe Nuur",      email:"mustafe@gmail.com",  date:parseDate("Jul 8, 2024"), units:2, property:"Sha'ab Complex",type:"Rental",   rating:4.9, status:"Active",      avatar:null, paymentStatus:"Paid",     paymentMethod:"eDahab" },
  { id:"ORD-1006", customer:"Hodan Jaamac",      email:"hodan@gmail.com",    date:parseDate("Jul 8, 2024"), units:1, property:"Kulmiye Tower", type:"Purchase",  rating:4.9, status:"Active",      avatar:null, paymentStatus:"Paid",     paymentMethod:"Premier Wallet" },
  { id:"ORD-1007", customer:"Xuseen Geelle",     email:"xuseen@gmail.com",   date:parseDate("Jul 7, 2024"), units:3, property:"Burjiomar A",  type:"Short Stay", rating:3.8, status:"Pending",     avatar:null, paymentStatus:"Pending",  paymentMethod:"Zaad" },
  { id:"ORD-1008", customer:"Nimco Cabdiraxman", email:"nimco@gmail.com",    date:parseDate("Jul 7, 2024"), units:2, property:"Burjiomar B",  type:"Rental",    rating:4.7, status:"Active",      avatar:null, paymentStatus:"Paid",     paymentMethod:"eDahab" },
  { id:"ORD-1009", customer:"Daud Xirsi",        email:"daud@gmail.com",     date:parseDate("Jul 6, 2024"), units:1, property:"Sha'ab Complex",type:"Rental",   rating:4.2, status:"Active",      avatar:null, paymentStatus:"Paid",     paymentMethod:"Premier Wallet" },
  { id:"ORD-1010", customer:"Leyla Rashid",      email:"leyla@gmail.com",    date:parseDate("Jul 6, 2024"), units:2, property:"Kulmiye Tower", type:"Purchase",  rating:4.8, status:"Unverified",  avatar:null, paymentStatus:"Pending",  paymentMethod:"Zaad" },
  { id:"ORD-1011", customer:"Ali Mohamed",       email:"ali@gmail.com",       date:parseDate("Jul 5, 2024"), units:1, property:"Burjiomar C",  type:"Rental",    rating:4.6, status:"Active",      avatar:null, paymentStatus:"Paid",     paymentMethod:"eDahab" },
  { id:"ORD-1012", customer:"Fatima Ahmed",     email:"fatima@gmail.com",   date:parseDate("Jul 4, 2024"), units:3, property:"Kulmiye Tower", type:"Purchase",  rating:4.9, status:"Active",      avatar:null, paymentStatus:"Paid",     paymentMethod:"Premier Wallet" },
];

const STATUS_STYLE = {
  Active:      { bg:"#dcfce7", color:"#15803d" },
  Unverified:  { bg:"#FFF7ED", color:"#c2410c" },
  Suspended:   { bg:"#FEF2F2", color:"#E8344E" },
  Deactivated: { bg:"#f1f5f9", color:"#475569" },
  Pending:     { bg:"#eff6ff", color:"#1d4ed8" },
};

const TYPE_STYLE = {
  Rental:     { bg:"#dbeafe", color:"#1d4ed8" },
  Purchase:   { bg:"#f3e8ff", color:"#7c3aed" },
  "Short Stay":{ bg:"#dcfce7", color:"#15803d" },
};

const STAT_CARDS = [
  { label:"Total Orders",   value:"23",   change:"+24.5%", up:true,  from:"From Jan 01 - Jul 30, 2024", icon:"📦", color:"#22c55e",  iconBg:"#dcfce7" },
  { label:"Rentals",        value:"231",  change:"-4.5%",  up:false, from:"From Jan 01 - Jul 30, 2024", icon:"🏠", color:"#3b82f6",  iconBg:"#dbeafe" },
  { label:"Purchases",      value:"1200", change:"-4.5%",  up:false, from:"From Jan 01 - Jul 30, 2024", icon:"🏢", color:"#E8344E",  iconBg:"#FEF2F2" },
  { label:"Pending",        value:"1200", change:"+24.5%", up:true,  from:"From Jan 01 - Jul 30, 2024", icon:"⏳", color:"#f97316",  iconBg:"#FFF7ED" },
];

function Avatar({ name, size=28 }: { name: string; size?: number }) {
  const hue = (name.charCodeAt(0) * 37 + (name.charCodeAt(1)||0) * 19) % 360;
  const color = `hsl(${hue},55%,42%)`;
  const bg = `hsl(${hue},55%,93%)`;
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <svg width={size*0.64} height={size*0.64} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="8" r="3"/>
        <path d="M6.168 18.849A4 4 0 0 1 10 16h4a4 4 0 0 1 3.834 2.855"/>
      </svg>
    </div>
  );
}

export default function GuriGateOrders() {
  const [activeTab,    setActiveTab]    = useState("Orders");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search,       setSearch]       = useState("");
  const [checked,      setChecked]      = useState<string[]>([]);
  const [allChecked,   setAllChecked]   = useState(false);
  const [currentPage, setCurrentPage]   = useState(1);
  const [dateRange, setDateRange]     = useState({ start: null as Date | null, end: null as Date | null });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<typeof ORDERS[0] | null>(null);
  
  const [showDrawer, setShowDrawer] = useState(false);
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const pageSize = 10;

  // Fixed light theme values
  const card = "white";
  const bdr  = "#E9ECF0";
  const muted= "#9CA3AF";
  const text = "#111827";
  const sub  = "#4B5563";

  // Memoized filtering logic
  const filtered = useMemo(() => {
    return ORDERS.filter(o => {
      // Status filter
      if (statusFilter !== "All" && o.status !== statusFilter) return false;
      
      // Tab filter
      if (activeTab === "Orders" && o.type !== "Rental" && o.type !== "Purchase") return false;
      if (activeTab === "Buyers" && o.type !== "Purchase") return false;
      if (activeTab === "Short Stay" && o.type !== "Short Stay") return false;
      
      // Search filter
      if (search && !o.customer.toLowerCase().includes(search.toLowerCase()) && 
          !o.email.toLowerCase().includes(search.toLowerCase()) &&
          !o.id.toLowerCase().includes(search.toLowerCase())) return false;
      
      // Date range filter
      if (dateRange.start && o.date < dateRange.start) return false;
      if (dateRange.end && o.date > dateRange.end) return false;
      
      return true;
    });
  }, [statusFilter, activeTab, search, dateRange]);

  // Pagination
  const totalPages = useMemo(() => Math.ceil(filtered.length / pageSize), [filtered]);
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filtered.slice(startIndex, startIndex + pageSize);
  }, [filtered, currentPage, pageSize]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, activeTab, search, dateRange]);

  // ESC key handler for drawer
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showDrawer) {
        setShowDrawer(false);
      }
    };
    
    if (showDrawer) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [showDrawer]);

  // Date range label
  const getDateRangeLabel = () => {
    if (dateRange.start && dateRange.end) {
      return `${formatDate(dateRange.start)} – ${formatDate(dateRange.end)}`;
    }
    return "Jan 2023 – Jul 2024";
  };

  const toggleAll = () => {
    if (allChecked) { setChecked([]); setAllChecked(false); }
    else { setChecked(filtered.map(o=>o.id)); setAllChecked(true); }
  };
  const toggle = (id: string) => setChecked(p => p.includes(id) ? p.filter(x=>x!==id) : [...p, id]);

  // Export data function
  const exportData = () => {
    const dataToExport = filtered.map(order => ({
      'Order ID': order.id,
      'Customer': order.customer,
      'Email': order.email,
      'Date': formatDate(order.date),
      'Units': order.units,
      'Property': order.property,
      'Type': order.type,
      'Rating': order.rating,
      'Status': order.status,
      'Payment Status': order.paymentStatus
    }));

    // Create CSV content
    const headers = Object.keys(dataToExport[0]) as (keyof typeof dataToExport[0])[];
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        .tab-btn { padding:10px 4px; border:none; background:none; font-size:13px; font-weight:500; cursor:pointer; color:#94A3B8; border-bottom:2px solid transparent; transition:all .15s; font-family:inherit; }
        .tab-btn:hover { color:#E8344E; }
        .tab-btn.active { color:#111827; font-weight:700; border-bottom-color:#E8344E; }
        .tool-btn { display:flex; align-items:center; gap:6px; padding:7px 13px; border-radius:8px; border:1.5px solid #E9ECF0; background:white; font-size:12px; font-weight:600; color:#374151; cursor:pointer; transition:all .15s; font-family:inherit; }
        .tool-btn:hover { border-color:#E8344E; color:#E8344E; }
        .row-tr { cursor:pointer; transition:background .1s; }
        .row-tr:hover td { background:rgba(232,52,78,0.025); }
        .row-tr.sel td { background:rgba(232,52,78,0.05); }
        input[type=checkbox] { accent-color:#E8344E; width:14px; height:14px; cursor:pointer; }
        .stat-card { background:white; border-radius:14px; padding:18px 20px; border:1px solid #E9ECF0; flex:1; transition:transform .2s, box-shadow .2s; }
        .stat-card:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,.07); }
        .status-dot { width:7px; height:7px; border-radius:50%; display:inline-block; margin-right:5px; }
      `}</style>

      <main style={{ padding:"28px", flex:1, overflowY:"auto" }}>

          {/* Breadcrumb + title */}
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:22 }}>
            <div>
              <p style={{ fontSize:11, color:muted, fontWeight:500, marginBottom:3 }}>Order management</p>
              <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:"-0.4px" }}>Orders</h1>
            </div>
            {/* Date range picker */}
            <div style={{ position:"relative" }}>
              <button 
                onClick={() => setShowDatePicker(!showDatePicker)}
                style={{ display:"flex", alignItems:"center", gap:7, border:`1.5px solid ${bdr}`, background:card, borderRadius:10, padding:"8px 14px", fontSize:12, fontWeight:600, color:sub, cursor:"pointer" }}
              >
                <Icon.CalendarRange/>
                {getDateRangeLabel()}
                <Icon.ChevronDown/>
              </button>
              
              {showDatePicker && (
                <div style={{ position:"absolute", top:"100%", right:0, marginTop:8, background:card, border:`1px solid ${bdr}`, borderRadius:12, padding:16, boxShadow:"0 10px 40px rgba(0,0,0,0.15)", zIndex:50, minWidth:280 }}>
                  <div style={{ marginBottom:16 }}>
                    <h3 style={{ fontSize:14, fontWeight:700, marginBottom:12 }}>Select Date Range</h3>
                    
                    <div style={{ marginBottom:12 }}>
                      <label style={{ fontSize:11, fontWeight:600, color:muted, display:"block", marginBottom:4 }}>Start Date</label>
                      <input 
                        type="date" 
                        value={dateRange.start ? dateRange.start.toISOString().split('T')[0] : ''}
                        onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value ? new Date(e.target.value) : null }))}
                        style={{ width:"100%", padding:"8px 12px", border:`1px solid ${bdr}`, borderRadius:8, fontSize:12 }}
                      />
                    </div>
                    
                    <div style={{ marginBottom:16 }}>
                      <label style={{ fontSize:11, fontWeight:600, color:muted, display:"block", marginBottom:4 }}>End Date</label>
                      <input 
                        type="date" 
                        value={dateRange.end ? dateRange.end.toISOString().split('T')[0] : ''}
                        onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value ? new Date(e.target.value) : null }))}
                        style={{ width:"100%", padding:"8px 12px", border:`1px solid ${bdr}`, borderRadius:8, fontSize:12 }}
                      />
                    </div>
                    
                    <div style={{ display:"flex", gap:8 }}>
                      <button 
                        onClick={() => {
                          setDateRange({ start: null, end: null });
                          setShowDatePicker(false);
                        }}
                        style={{ flex:1, padding:"8px 12px", border:`1px solid ${bdr}`, background:"transparent", borderRadius:8, fontSize:12, fontWeight:600, color:sub, cursor:"pointer" }}
                      >
                        Clear
                      </button>
                      <button 
                        onClick={() => setShowDatePicker(false)}
                        style={{ flex:1, padding:"8px 12px", border:"none", background:"#E8344E", color:"white", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer" }}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stat cards */}
          <div style={{ display:"flex", gap:14, marginBottom:28 }}>
            {STAT_CARDS.map((s,i) => (
              <div key={i} className="stat-card" style={{ background:card, borderColor:bdr }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                    <span style={{ fontSize:18 }}>{s.icon}</span>
                    <span style={{ fontSize:12, fontWeight:600, color:sub }}>{s.label}</span>
                  </div>
                  <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, fontWeight:700, padding:"3px 8px", borderRadius:20, background:s.up?"#dcfce7":"#FEF2F2", color:s.up?"#15803d":"#dc2626" }}>
                    {s.up ? <Icon.TrendUp/> : <Icon.TrendDown/>}{s.change}
                  </span>
                </div>
                <p style={{ fontSize:28, fontWeight:800, letterSpacing:"-1px", marginBottom:10 }}>{s.value}</p>
                <p style={{ fontSize:11, color:muted }}>{s.from}</p>
              </div>
            ))}
          </div>

          {/* Table card */}
          <div style={{ background:card, borderRadius:16, border:`1px solid ${bdr}`, overflow:"hidden" }}>

            {/* Tab row */}
            <div style={{ display:"flex", gap:20, padding:"0 22px", borderBottom:`1px solid ${bdr}` }}>
              {["Buyers","Orders","Short Stay"].map(t => (
                <button key={t} className={`tab-btn${activeTab===t?" active":""}`} onClick={()=>setActiveTab(t)}
                  style={{ color:activeTab===t?text:muted }}>{t}</button>
              ))}
            </div>

            {/* Toolbar */}
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"14px 22px", borderBottom:`1px solid ${bdr}` }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, background:"#F8FAFC", border:`1.5px solid ${bdr}`, borderRadius:8, padding:"6px 12px", width:180 }}>
                <Icon.Search/>
                <input 
                  value={search}
                  onChange={e=>setSearch(e.target.value)}
                  placeholder="Search orders..." 
                  style={{ border:"none", outline:"none", background:"transparent", fontSize:12, color:"inherit", width:"100%", fontFamily:"inherit" }}
                />
              </div>

              <button className="tool-btn" style={{ background:card, borderColor:bdr, color:sub }}>
                <Icon.Filter/> Filter
              </button>
              <button className="tool-btn" style={{ background:card, borderColor:bdr, color:sub }}>
                <Icon.Columns/> Columns
              </button>

              {/* Status dropdown */}
              <div style={{ position:"relative" }}>
                <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}
                  style={{ appearance:"none", border:`1.5px solid ${bdr}`, background:card, borderRadius:8, padding:"7px 30px 7px 12px", fontSize:12, fontWeight:600, color:sub, cursor:"pointer", fontFamily:"inherit", outline:"none" }}>
                  {["All","Active","Pending","Unverified","Suspended","Deactivated"].map(s=>(
                    <option key={s}>{s === "All" ? "Status: All" : s}</option>
                  ))}
                </select>
                <span style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", color:muted }}><Icon.ChevronDown/></span>
              </div>

              <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
                <button 
                  className="tool-btn" 
                  style={{ background:card, borderColor:bdr, color:sub }}
                  onClick={() => exportData()}
                >
                  <Icon.Export/> Export data
                </button>
                <button 
                  style={{ display:"flex", alignItems:"center", gap:6, background:"#E8344E", color:"white", border:"none", borderRadius:8, padding:"7px 16px", fontSize:12, fontWeight:700, cursor:"pointer", boxShadow:"0 3px 10px rgba(232,52,78,.3)", fontFamily:"inherit" }}
                  onClick={() => setShowAddOrderModal(true)}
                >
                  <Icon.Plus/> Add order
                </button>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12.5 }}>
                <thead>
                  <tr style={{ borderBottom:`1px solid ${bdr}` }}>
                    <th style={{ padding:"11px 22px", width:44 }}>
                      <input type="checkbox" checked={allChecked} onChange={toggleAll}/>
                    </th>
                    {["Order ID","Full name","Email address","Date placed","Total units","Property type","Payment method","Status",""].map(h => (
                      <th key={h} style={{ padding:"11px 14px", textAlign:"left", fontWeight:600, fontSize:11, color:muted, letterSpacing:"0.04em", whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((o, idx) => {
                    const isSel = checked.includes(o.id);
                    return (
                      <tr key={o.id} className={`row-tr${isSel?" sel":""}`} style={{ borderBottom:idx<paginatedOrders.length-1?`1px solid ${bdr}`:"none" }}
                          onClick={() => {
                            setSelectedOrder(o);
                            setShowDrawer(true);
                          }}>
                        <td style={{ padding:"11px 22px" }}>
                          <input 
                            type="checkbox" 
                            checked={isSel} 
                            onChange={(e)=>{ e.stopPropagation(); toggle(o.id); }}
                          />
                        </td>
                        <td style={{ padding:"11px 14px", color:muted, fontWeight:500, fontSize:12 }}>{o.id}</td>
                        <td style={{ padding:"11px 14px", fontWeight:600, color:text }}>{o.customer}</td>
                        <td style={{ padding:"11px 14px", color:muted }}>{o.email}</td>
                        <td style={{ padding:"11px 14px", color:sub, fontWeight:500 }}>{formatDate(o.date)}</td>
                        <td style={{ padding:"11px 14px", fontWeight:700, color:text }}>{o.units}</td>
                        <td style={{ padding:"11px 14px" }}>
                          <span style={{ ...TYPE_STYLE[o.type as keyof typeof TYPE_STYLE], padding:"4px 12px", borderRadius:20, fontSize:11, fontWeight:700, display:"inline-block" }}>
                            {o.type}
                          </span>
                        </td>
                        <td style={{ padding:"11px 14px", fontSize:12, fontWeight:600, color:text }}>{o.paymentMethod}</td>
                        <td style={{ padding:"11px 14px" }}>
                          <span style={{ ...STATUS_STYLE[o.status as keyof typeof STATUS_STYLE], padding:"4px 12px", borderRadius:20, fontSize:11, fontWeight:700, display:"inline-block" }}>
                            {o.status}
                          </span>
                        </td>
                        <td style={{ padding:"11px 14px" }}>
                          <button 
                            onClick={(e)=>e.stopPropagation()}
                            style={{ background:"none", border:"none", cursor:"pointer", color:muted, padding:4 }}
                          >
                            <Icon.MoreVert/>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div style={{ padding:"12px 22px", borderTop:`1px solid ${bdr}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontSize:11, color:muted, fontWeight:500 }}>
                {checked.length > 0 ? `${checked.length} selected · ` : ""}{filtered.length} orders
              </span>
              <div style={{ display:"flex", gap:6 }}>
                {totalPages > 0 && (() => {
                  const pages = [];
                  const maxVisible = 5;
                  
                  if (totalPages <= maxVisible) {
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    pages.push(1);
                    if (currentPage > 3) pages.push("...");
                    
                    const start = Math.max(2, Math.min(currentPage - 1, totalPages - maxVisible + 2));
                    const end = Math.min(totalPages - 1, start + maxVisible - 3);
                    
                    for (let i = start; i <= end; i++) {
                      pages.push(i);
                    }
                    
                    if (currentPage < totalPages - 2) pages.push("...");
                    pages.push(totalPages);
                  }
                  
                  return pages.map((p, i) => (
                    <button 
                      key={i} 
                      onClick={() => p !== "..." && setCurrentPage(p as number)}
                      disabled={p === "..."}
                      style={{ 
                        width:28, 
                        height:28, 
                        borderRadius:7, 
                        border:`1.5px solid ${p===currentPage?"#E8344E":bdr}`, 
                        background:p===currentPage?"#E8344E":card, 
                        color:p===currentPage?"white":muted, 
                        fontSize:11, 
                        fontWeight:600, 
                        cursor:p==="..."?"default":"pointer",
                        opacity:p==="..."?0.5:1
                      }}
                    >
                      {p}
                    </button>
                  ));
                })()}
              </div>
            </div>
          </div>
        </main>

        {/* Add Order Modal */}
        {showDrawer && selectedOrder && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.35)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center" }} onClick={()=>setShowDrawer(false)}>
            <div style={{ background:"white", borderRadius:18, padding:0, width:480, maxHeight:"85vh", overflowY:"auto", boxShadow:"0 24px 60px rgba(0,0,0,.18)" }} onClick={e=>e.stopPropagation()}>
              {/* Header */}
              <div style={{ padding:"24px 28px 0", display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                  <Avatar name={selectedOrder.customer} size={48}/>
                  <div>
                    <h2 style={{ fontSize:17, fontWeight:700, color:"#111827", margin:0 }}>{selectedOrder.customer}</h2>
                    <p style={{ fontSize:12, color:"#9CA3AF", marginTop:2 }}>{selectedOrder.id} · {selectedOrder.email}</p>
                  </div>
                </div>
                <button onClick={()=>setShowDrawer(false)} style={{ background:"#f1f5f9", border:"none", borderRadius:8, width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#64748b", flexShrink:0 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              {/* Status + Type badges */}
              <div style={{ padding:"16px 28px 0", display:"flex", gap:8 }}>
                <span style={{ ...STATUS_STYLE[selectedOrder.status as keyof typeof STATUS_STYLE], padding:"4px 12px", borderRadius:12, fontSize:12, fontWeight:600, display:"inline-block" }}>
                  {selectedOrder.status}
                </span>
                <span style={{ ...TYPE_STYLE[selectedOrder.type as keyof typeof TYPE_STYLE], padding:"4px 12px", borderRadius:12, fontSize:12, fontWeight:600, display:"inline-block" }}>
                  {selectedOrder.type}
                </span>
                <span style={{ padding:"4px 12px", borderRadius:12, fontSize:12, fontWeight:600, display:"inline-block", background: selectedOrder.paymentStatus==="Paid"?"#dcfce7":selectedOrder.paymentStatus==="Pending"?"#FFF7ED":"#eff6ff", color: selectedOrder.paymentStatus==="Paid"?"#15803d":selectedOrder.paymentStatus==="Pending"?"#c2410c":"#1d4ed8" }}>
                  {selectedOrder.paymentStatus}
                </span>
              </div>

              {/* Detail grid */}
              <div style={{ padding:"20px 28px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                {[
                  { label:"Order ID", value:selectedOrder.id, icon:<Icon.ShoppingBag/> },
                  { label:"Date Placed", value:formatDate(selectedOrder.date), icon:<Icon.Calendar/> },
                  { label:"Property", value:selectedOrder.property, icon:<Icon.Building/> },
                  { label:"Total Units", value:`${selectedOrder.units} unit${selectedOrder.units>1?"s":""}`, icon:<Icon.Grid/> },
                  { label:"Email", value:selectedOrder.email, icon:<Icon.Inbox/> },
                  { label:"Payment Method", value:selectedOrder.paymentMethod, icon:<Icon.CreditCard/> },
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

              {/* Actions */}
              <div style={{ padding:"0 28px 24px", display:"flex", gap:10 }}>
                <button onClick={()=>setShowDrawer(false)} style={{ flex:1, padding:"10px", borderRadius:10, border:"1.5px solid #e2e8f0", background:"white", fontSize:13, fontWeight:600, cursor:"pointer", color:"#64748b" }}>Close</button>
                <button onClick={()=>{ exportData(); setShowDrawer(false); }} style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"10px", borderRadius:10, border:"none", background:"#E8344E", color:"white", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                  <Icon.Export/> Export
                </button>
              </div>
            </div>
          </div>
        )}

        {showAddOrderModal && (
          <>
            {/* Backdrop */}
            <div 
              onClick={() => setShowAddOrderModal(false)}
              style={{ 
                position: "fixed", 
                inset: 0, 
                background: "rgba(0, 0, 0, 0.5)", 
                zIndex: 999 
              }}
            />
            
            {/* Modal */}
            <div style={{ 
              position: "fixed", 
              top: "50%", 
              left: "50%", 
              transform: "translate(-50%, -50%)", 
              width: 500, 
              background: card, 
              borderRadius: 16, 
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)", 
              zIndex: 1000
            }}>
              {/* Header */}
              <div style={{ 
                padding: "24px 24px 20px", 
                borderBottom: `1px solid ${bdr}`, 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between" 
              }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: text }}>Add New Order</h2>
                <button 
                  onClick={() => setShowAddOrderModal(false)}
                  style={{ 
                    background: "none", 
                    border: "none", 
                    cursor: "pointer", 
                    color: muted, 
                    padding: 4,
                    borderRadius: 4
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              {/* Form */}
              <div style={{ padding: "24px" }}>
                <div style={{ display: "grid", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: muted, display: "block", marginBottom: 6 }}>Customer Name</label>
                    <input 
                      type="text" 
                      placeholder="Enter customer name"
                      style={{ 
                        width: "100%", 
                        padding: "10px 12px", 
                        border: `1px solid ${bdr}`, 
                        borderRadius: 8, 
                        fontSize: 14,
                        fontFamily: "inherit",
                        outline: "none"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: muted, display: "block", marginBottom: 6 }}>Email Address</label>
                    <input 
                      type="email" 
                      placeholder="customer@example.com"
                      style={{ 
                        width: "100%", 
                        padding: "10px 12px", 
                        border: `1px solid ${bdr}`, 
                        borderRadius: 8, 
                        fontSize: 14,
                        fontFamily: "inherit",
                        outline: "none"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: muted, display: "block", marginBottom: 6 }}>Property</label>
                    <select 
                      style={{ 
                        width: "100%", 
                        padding: "10px 12px", 
                        border: `1px solid ${bdr}`, 
                        borderRadius: 8, 
                        fontSize: 14,
                        fontFamily: "inherit",
                        outline: "none"
                      }}
                    >
                      <option value="">Select property</option>
                      <option value="Burjiomar A">Burjiomar A</option>
                      <option value="Burjiomar B">Burjiomar B</option>
                      <option value="Kulmiye Tower">Kulmiye Tower</option>
                      <option value="Sha'ab Complex">Sha'ab Complex</option>
                    </select>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: muted, display: "block", marginBottom: 6 }}>Type</label>
                      <select 
                        style={{ 
                          width: "100%", 
                          padding: "10px 12px", 
                          border: `1px solid ${bdr}`, 
                          borderRadius: 8, 
                          fontSize: 14,
                          fontFamily: "inherit",
                          outline: "none"
                        }}
                      >
                        <option value="">Select type</option>
                        <option value="Rental">Rental</option>
                        <option value="Purchase">Purchase</option>
                        <option value="Short Stay">Short Stay</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: muted, display: "block", marginBottom: 6 }}>Units</label>
                      <input 
                        type="number" 
                        min="1"
                        placeholder="1"
                        style={{ 
                          width: "100%", 
                          padding: "10px 12px", 
                          border: `1px solid ${bdr}`, 
                          borderRadius: 8, 
                          fontSize: 14,
                          fontFamily: "inherit",
                          outline: "none"
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${bdr}`, display: "flex", gap: 12 }}>
                  <button 
                    onClick={() => setShowAddOrderModal(false)}
                    style={{ 
                      flex: 1, 
                      padding: "12px 16px", 
                      border: `1px solid ${bdr}`, 
                      background: "transparent", 
                      borderRadius: 8, 
                      fontSize: 14, 
                      fontWeight: 600, 
                      color: sub, 
                      cursor: "pointer" 
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      // Handle form submission here
                      setShowAddOrderModal(false);
                    }}
                    style={{ 
                      flex: 1, 
                      padding: "12px 16px", 
                      border: "none", 
                      background: "#E8344E", 
                      color: "white", 
                      borderRadius: 8, 
                      fontSize: 14, 
                      fontWeight: 600, 
                      cursor: "pointer" 
                    }}
                  >
                    Create Order
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </>
    );
  } 