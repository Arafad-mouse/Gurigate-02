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
  Bell: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  Mail: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  ChevronDown: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  ChevronsUpDown: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="7 15 12 20 17 15"/><polyline points="7 9 12 4 17 9"/></svg>,
  Moon: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
  MoreHoriz: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>,
  TrendUp: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
};


function genTxnId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({length:18}, () => chars[Math.floor(Math.random()*chars.length)]).join("");
}

const TRANSACTIONS = [
  { id:1, name:"Axmed Cabdalle",    date:"22 Dec. 2024", time:"11:44", txn:genTxnId(), total:"$2,205.00", status:"Pending" },
  { id:2, name:"Faadumo Xasan",     date:"22 Dec. 2024", time:"11:44", txn:genTxnId(), total:"$1,400.81", status:"Paid" },
  { id:3, name:"Cabdi Warsame",     date:"22 Dec. 2024", time:"03:44", txn:genTxnId(), total:"$1,745.84", status:"Returned" },
  { id:4, name:"Sahra Maxamed",     date:"22 Dec. 2024", time:"00:12", txn:genTxnId(), total:"$1,123.70", status:"Paid" },
  { id:5, name:"Mustafe Nuur",      date:"22 Dec. 2024", time:"05:12", txn:genTxnId(), total:"$1,221.70", status:"Returned" },
  { id:6, name:"Hodan Jaamac",      date:"22 Dec. 2024", time:"07:12", txn:genTxnId(), total:"$2,245.00", status:"Paid" },
  { id:7, name:"Xuseen Geelle",     date:"22 Dec. 2024", time:"12:04", txn:genTxnId(), total:"$800.99",   status:"Pending" },
  { id:8, name:"Nimco Cabdiraxman", date:"22 Dec. 2024", time:"11:44", txn:genTxnId(), total:"$633.48",   status:"Pending" },
  { id:9, name:"Daud Xirsi",        date:"22 Dec. 2024", time:"00:05", txn:genTxnId(), total:"$147.84",   status:"Paid" },
  { id:10,name:"Leyla Rashid",      date:"22 Dec. 2024", time:"01:17", txn:genTxnId(), total:"$502.22",   status:"Pending" },
  { id:11,name:"Warsan Guure",      date:"22 Dec. 2024", time:"08:30", txn:genTxnId(), total:"$1,988.00", status:"Paid" },
  { id:12,name:"Bashir Ciise",      date:"22 Dec. 2024", time:"14:22", txn:genTxnId(), total:"$320.50",   status:"Returned" },
];

const STATUS_STYLE = {
  Paid:     { bg:"#dcfce7", color:"#15803d" },
  Pending:  { bg:"#FFF7ED", color:"#c2410c" },
  Returned: { bg:"#FEF2F2", color:"#E8344E" },
};

function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const hue = (name.charCodeAt(0) * 37 + (name.charCodeAt(1)||0) * 19) % 360;
  const color = `hsl(${hue},52%,42%)`;
  const bg = `hsl(${hue},52%,93%)`;
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <svg width={size*0.62} height={size*0.62} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="8" r="3"/>
        <path d="M6.168 18.849A4 4 0 0 1 10 16h4a4 4 0 0 1 3.834 2.855"/>
      </svg>
    </div>
  );
}

const SortTh = ({ label }: { label: string }) => (
  <th style={{ padding:"14px 16px", textAlign:"left", fontWeight:600, fontSize:12, color:"#9CA3AF", cursor:"pointer", whiteSpace:"nowrap", userSelect:"none" }}>
    <span style={{ display:"inline-flex", alignItems:"center", gap:4 }}>
      {label}
      <span style={{ opacity:0.4, color:"#9CA3AF" }}><Icon.ChevronsUpDown/></span>
    </span>
  </th>
);

export default function GuriGateTransaction() {
  const [statusFilter, setStatus]   = useState("All");

  // Fixed light theme values to match global layout
  const card = "white";
  const bdr  = "#E9ECF0";
  const muted= "#9CA3AF";
  const text = "#111827";
  const sub  = "#4B5563";

  const filtered = TRANSACTIONS;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:3px; } ::-webkit-scrollbar-thumb { background:#fca5a5; border-radius:4px; }
        .txn-row { transition:background .1s; }
        .txn-row:hover td { background:rgba(232,52,78,0.025); }
        .status-sel { appearance:none; border:1.5px solid #E9ECF0; border-radius:8px; padding:7px 28px 7px 10px; font-size:12px; font-weight:600; color:#4B5563; cursor:pointer; font-family:inherit; outline:none; background:white; }
        .stat-card { background:white; border-radius:12px; padding:18px 20px; border:1px solid #E9ECF0; flex:1; min-width:0; }
      `}</style>

      <main style={{ padding:"28px", flex:1, overflowY:"auto" }}>

          {/* ── Stat cards ── */}
          <div style={{ display:"flex", gap:14, marginBottom:24 }}>
            {/* Total Revenue — simple big card */}
            <div className="stat-card" style={{ background:card, borderColor:bdr }}>
              <p style={{ fontSize:12, fontWeight:600, color:muted, marginBottom:10 }}>Total Revenue</p>
              <p style={{ fontSize:26, fontWeight:800, letterSpacing:"-1px", color:text }}>$522,000</p>
            </div>

            {/* Invoices */}
            <div className="stat-card" style={{ background:card, borderColor:bdr }}>
              <p style={{ fontSize:12, fontWeight:600, color:muted, marginBottom:6 }}>Invoices</p>
              <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:8 }}>
                <p style={{ fontSize:26, fontWeight:800, letterSpacing:"-1px", color:text }}>$239,000</p>
                <div style={{ textAlign:"right", flexShrink:0, paddingBottom:2 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", gap:12, marginBottom:3 }}>
                    <span style={{ fontSize:11, color:muted }}>Left to plan</span>
                    <span style={{ fontSize:11, fontWeight:700, color:"#E8344E" }}>$261,000</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", gap:12 }}>
                    <span style={{ fontSize:11, color:muted }}>%Planned</span>
                    <span style={{ fontSize:11, fontWeight:600, color:sub }}>51%</span>
                  </div>
                </div>
              </div>
              <div style={{ marginTop:10, height:4, borderRadius:4, background:"#f1f5f9" }}>
                <div style={{ width:"51%", height:"100%", borderRadius:4, background:"#E8344E" }}/>
              </div>
            </div>

            {/* Total saves */}
            <div className="stat-card" style={{ background:card, borderColor:bdr }}>
              <p style={{ fontSize:12, fontWeight:600, color:muted, marginBottom:6 }}>Total saves</p>
              <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:8 }}>
                <p style={{ fontSize:26, fontWeight:800, letterSpacing:"-1px", color:text }}>$110,000</p>
                <div style={{ textAlign:"right", flexShrink:0, paddingBottom:2 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", gap:12, marginBottom:3 }}>
                    <span style={{ fontSize:11, color:muted }}>Left to plan</span>
                    <span style={{ fontSize:11, fontWeight:700, color:"#E8344E" }}>$139,000</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", gap:12 }}>
                    <span style={{ fontSize:11, color:muted }}>%Spent</span>
                    <span style={{ fontSize:11, fontWeight:600, color:sub }}>49%</span>
                  </div>
                </div>
              </div>
              <div style={{ marginTop:10, height:4, borderRadius:4, background:"#f1f5f9" }}>
                <div style={{ width:"49%", height:"100%", borderRadius:4, background:"#E8344E" }}/>
              </div>
            </div>

            {/* Daily */}
            <div className="stat-card" style={{ background:card, borderColor:bdr }}>
              <p style={{ fontSize:12, fontWeight:600, color:muted, marginBottom:6 }}>Daily</p>
              <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:8 }}>
                <p style={{ fontSize:26, fontWeight:800, letterSpacing:"-1px", color:text }}>$12,320</p>
                <div style={{ textAlign:"right", flexShrink:0, paddingBottom:2 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", gap:12, marginBottom:3 }}>
                    <span style={{ fontSize:11, color:muted }}>Planned</span>
                    <span style={{ fontSize:11, fontWeight:700, color:"#E8344E" }}>$11,000</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", gap:12 }}>
                    <span style={{ fontSize:11, color:muted }}>%Spent</span>
                    <span style={{ fontSize:11, fontWeight:600, color:sub }}>49%</span>
                  </div>
                </div>
              </div>
              <div style={{ marginTop:10, height:4, borderRadius:4, background:"#f1f5f9" }}>
                <div style={{ width:"49%", height:"100%", borderRadius:4, background:"#E8344E" }}/>
              </div>
            </div>
          </div>

          {/* ── Table card ── */}
          <div style={{ background:card, borderRadius:16, border:`1px solid ${bdr}`, overflow:"hidden" }}>

            {/* Table toolbar */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", borderBottom:`1px solid ${bdr}` }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, background:"#F8FAFC", border:`1.5px solid ${bdr}`, borderRadius:8, padding:"6px 12px", width:180 }}>
                  <Icon.Search/>
                  <input placeholder="Search transactions…" style={{ border:"none", outline:"none", background:"transparent", fontSize:12, color:"inherit", width:"100%", fontFamily:"inherit" }}/>
                </div>
                <div style={{ position:"relative" }}>
                  <select className="status-sel" value={statusFilter} onChange={e=>setStatus(e.target.value)}
                    style={{ background:card, color:sub, borderColor:bdr }}>
                    {["All","Paid","Pending","Returned"].map(s=>(
                      <option key={s} value={s}>{s==="All"?"Status: All":s}</option>
                    ))}
                  </select>
                  <span style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", color:muted }}><Icon.ChevronDown/></span>
                </div>
              </div>
              <div style={{ display:"flex", gap:6 }}>
                {["Paid","Pending","Returned"].map(s => {
                  const cnt = TRANSACTIONS.filter(t=>t.status===s).length;
                  const st = STATUS_STYLE[s as keyof typeof STATUS_STYLE];
                  return (
                    <span key={s} style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:20, fontSize:11, fontWeight:700, background:st.bg, color:st.color }}>
                      {cnt} {s}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead>
                  <tr style={{ borderBottom:`1.5px solid ${bdr}` }}>
                    <SortTh label="Name of user"/>
                    <SortTh label="Date"/>
                    <SortTh label="Time"/>
                    <SortTh label="Transaction"/>
                    <SortTh label="Total"/>
                    <SortTh label="Status"/>
                    <th style={{ padding:"14px 16px", width:40 }}/>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row, idx) => (
                    <tr key={row.id} className="txn-row" style={{ borderBottom:idx<filtered.length-1?`1px solid ${bdr}`:"none" }}>
                      {/* Name */}
                      <td style={{ padding:"13px 16px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <Avatar name={row.name} size={34}/>
                          <span style={{ fontWeight:600, fontSize:13, color:text }}>{row.name}</span>
                        </div>
                      </td>
                      {/* Date */}
                      <td style={{ padding:"13px 16px", color:sub, fontSize:13 }}>{row.date}</td>
                      {/* Time */}
                      <td style={{ padding:"13px 16px", color:sub, fontSize:13 }}>{row.time}</td>
                      {/* Transaction ID */}
                      <td style={{ padding:"13px 16px" }}>
                        <span style={{ fontFamily:"'Courier New', monospace", fontSize:11.5, color:muted, letterSpacing:"0.03em" }}>{row.txn}</span>
                      </td>
                      {/* Total */}
                      <td style={{ padding:"13px 16px", fontWeight:700, color:text, fontSize:13 }}>{row.total}</td>
                      {/* Status */}
                      <td style={{ padding:"13px 16px" }}>
                        <span style={{ ...STATUS_STYLE[row.status as keyof typeof STATUS_STYLE], display:"inline-block", padding:"4px 14px", borderRadius:20, fontSize:11.5, fontWeight:700 }}>
                          {row.status}
                        </span>
                      </td>
                      {/* Actions */}
                      <td style={{ padding:"13px 16px" }}>
                        <button style={{ background:"none", border:"none", cursor:"pointer", color:muted, padding:4 }}>
                          <Icon.MoreHoriz/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 20px", borderTop:`1px solid ${bdr}` }}>
              <span style={{ fontSize:11.5, color:muted, fontWeight:500 }}>
                Showing {filtered.length} of {TRANSACTIONS.length} transactions
              </span>
              <div style={{ display:"flex", gap:5 }}>
                {[1,2,3,"…",8,9].map((p,i) => (
                  <button key={i} style={{ width:30, height:30, borderRadius:8, border:`1.5px solid ${p===1?"#E8344E":bdr}`, background:p===1?"#E8344E":card, color:p===1?"white":muted, fontSize:12, fontWeight:600, cursor:"pointer" }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </main>
    </>
  );
}