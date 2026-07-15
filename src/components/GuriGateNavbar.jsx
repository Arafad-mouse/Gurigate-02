import React, { useState, useRef, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ProfileMenu } from "./ProfileMenu";
import { LANGUAGES, useLanguage } from "../lib/language";
import BecomeHost from "./host-onboarding/Become-host";
import { PhoneModal } from "./LoginModal";
import { AuthModal } from "./AuthModal";
import { AuthContext } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

const BRAND = "#BA0036";

// ═══════════════════════════════════════════════════════════════════
// SHARED ICONS
// ═══════════════════════════════════════════════════════════════════
const SearchIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const XIcon       = (s=13) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const ChevLeft    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const ChevRight   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
const NavIcon     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>;
const GlobeIcon   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>;
const MenuIcon    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const HomeIcon    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const CompassIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>;
const BldgIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18z"/><path d="M6 12H4a2 2 0 00-2 2v6a2 2 0 002 2h2"/><path d="M18 9h2a2 2 0 012 2v9a2 2 0 01-2 2h-2"/></svg>;
const PlusIcon    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const MinusIcon   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const CalIcon     = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const HeartIcon   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>;
const PlaneIcon   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 19 2c-2-2-4-1-5.5.5L10 6 1.8 4.2l-1.1 1.1 3.8 5.2L3 12l1 1 1.7-.6.9.9-.6 1.7 1 1 1.6-1.5 5.2 3.8 1.1-1.1z"/></svg>;
const MsgIcon     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
const UserIcon    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const SettingsIcon= () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
const HelpIcon    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const UserPlusIcon= () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>;
const GiftIcon    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>;
const LogOutIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

// ═══════════════════════════════════════════════════════════════════
// WHERE DROPDOWN — exact logic from WhereDropdown.tsx
// ═══════════════════════════════════════════════════════════════════
const IconNairobi = () => (
  <svg viewBox="0 0 56 56" fill="none" width="40" height="40">
    <rect x="11" y="28" width="7" height="16" rx="1" stroke="#BA0036" strokeWidth="1.4" fill="#FFE5E5"/>
    <rect x="21" y="20" width="7" height="24" rx="1" stroke="#BA0036" strokeWidth="1.4" fill="#FFE5E5"/>
    <rect x="31" y="24" width="7" height="20" rx="1" stroke="#BA0036" strokeWidth="1.4" fill="#FFE5E5"/>
    <rect x="13" y="31" width="2" height="2" rx="0.3" fill="#BA0036"/><rect x="13" y="36" width="2" height="2" rx="0.3" fill="#BA0036"/>
    <rect x="23" y="23" width="2" height="2" rx="0.3" fill="#BA0036"/><rect x="23" y="28" width="2" height="2" rx="0.3" fill="#BA0036"/>
    <rect x="23" y="33" width="2" height="2" rx="0.3" fill="#BA0036"/><rect x="33" y="27" width="2" height="2" rx="0.3" fill="#BA0036"/>
    <rect x="33" y="32" width="2" height="2" rx="0.3" fill="#BA0036"/>
    <line x1="43" y1="44" x2="43" y2="32" stroke="#BA0036" strokeWidth="1.4"/>
    <path d="M43 32 Q46 28 49 30" stroke="#BA0036" strokeWidth="1.2" fill="none"/>
    <path d="M43 32 Q40 27 37 29" stroke="#BA0036" strokeWidth="1.2" fill="none"/>
    <line x1="10" y1="44" x2="46" y2="44" stroke="#BA0036" strokeWidth="1.4"/>
  </svg>
);
const IconDarEsSalaam = () => (
  <svg viewBox="0 0 56 56" fill="none" width="40" height="40">
    <path d="M20 30 Q20 22 28 22 Q36 22 36 30" stroke="#3B82F6" strokeWidth="1.4" fill="#DBEAFE"/>
    <rect x="20" y="30" width="16" height="12" rx="1" stroke="#3B82F6" strokeWidth="1.4" fill="#DBEAFE"/>
    <rect x="13" y="24" width="5" height="18" rx="1" stroke="#3B82F6" strokeWidth="1.4" fill="#DBEAFE"/>
    <path d="M13 24 Q15.5 20 18 24" stroke="#3B82F6" strokeWidth="1.2" fill="#DBEAFE"/>
    <rect x="38" y="24" width="5" height="18" rx="1" stroke="#3B82F6" strokeWidth="1.4" fill="#DBEAFE"/>
    <path d="M38 24 Q40.5 20 43 24" stroke="#3B82F6" strokeWidth="1.2" fill="#DBEAFE"/>
    <path d="M25 42 L25 35 Q28 32 31 35 L31 42" stroke="#3B82F6" strokeWidth="1.2" fill="#93C5FD"/>
    <line x1="10" y1="42" x2="46" y2="42" stroke="#3B82F6" strokeWidth="1.4"/>
  </svg>
);
const IconMombasa = () => (
  <svg viewBox="0 0 56 56" fill="none" width="40" height="40">
    <path d="M16 28 L28 18 L40 28" stroke="#059669" strokeWidth="1.4" fill="#D1FAE5"/>
    <rect x="20" y="28" width="16" height="12" rx="1" stroke="#059669" strokeWidth="1.4" fill="#D1FAE5"/>
    <rect x="25" y="33" width="6" height="7" rx="0.5" stroke="#059669" strokeWidth="1.2" fill="#6EE7B7"/>
    <line x1="44" y1="40" x2="44" y2="30" stroke="#059669" strokeWidth="1.4"/>
    <path d="M44 30 Q47 26 50 27" stroke="#059669" strokeWidth="1.2" fill="none"/>
    <path d="M44 30 Q41 25 38 27" stroke="#059669" strokeWidth="1.2" fill="none"/>
    <circle cx="44" cy="18" r="4" stroke="#059669" strokeWidth="1.2" fill="#D1FAE5"/>
    <line x1="10" y1="40" x2="50" y2="40" stroke="#059669" strokeWidth="1.4"/>
  </svg>
);
const IconHargeisa = () => (
  <svg viewBox="0 0 56 56" fill="none" width="40" height="40">
    <rect x="11" y="26" width="10" height="16" rx="1" stroke="#D97706" strokeWidth="1.4" fill="#FEF3C7"/>
    <rect x="24" y="20" width="10" height="22" rx="1" stroke="#D97706" strokeWidth="1.4" fill="#FEF3C7"/>
    <rect x="37" y="28" width="8" height="14" rx="1" stroke="#D97706" strokeWidth="1.4" fill="#FEF3C7"/>
    <path d="M14 32 Q16 29 18 32" stroke="#D97706" strokeWidth="1.2" fill="#FDE68A"/>
    <path d="M27 26 Q29 23 31 26" stroke="#D97706" strokeWidth="1.2" fill="#FDE68A"/>
    <path d="M40 34 Q42 31 44 34" stroke="#D97706" strokeWidth="1.2" fill="#FDE68A"/>
    <line x1="10" y1="42" x2="46" y2="42" stroke="#D97706" strokeWidth="1.4"/>
  </svg>
);
const IconAddisAbaba = () => (
  <svg viewBox="0 0 56 56" fill="none" width="40" height="40">
    <path d="M10 40 L22 22 L34 40" stroke="#7C3AED" strokeWidth="1.4" fill="#EDE9FE"/>
    <path d="M24 40 L34 26 L44 40" stroke="#7C3AED" strokeWidth="1.4" fill="#DDD6FE"/>
    <rect x="25" y="32" width="6" height="8" rx="0.5" stroke="#7C3AED" strokeWidth="1.2" fill="#EDE9FE"/>
    <path d="M25 32 L28 28 L31 32" stroke="#7C3AED" strokeWidth="1.2" fill="#DDD6FE"/>
    <line x1="10" y1="40" x2="46" y2="40" stroke="#7C3AED" strokeWidth="1.4"/>
  </svg>
);
const IconKualaLumpur = () => (
  <svg viewBox="0 0 56 56" fill="none" width="40" height="40">
    <rect x="15" y="18" width="9" height="26" rx="1" stroke="#0891B2" strokeWidth="1.4" fill="#CFFAFE"/>
    <rect x="32" y="18" width="9" height="26" rx="1" stroke="#0891B2" strokeWidth="1.4" fill="#CFFAFE"/>
    <line x1="19.5" y1="18" x2="19.5" y2="12" stroke="#0891B2" strokeWidth="1.4"/>
    <line x1="36.5" y1="18" x2="36.5" y2="12" stroke="#0891B2" strokeWidth="1.4"/>
    <rect x="24" y="28" width="8" height="2.5" rx="0.5" stroke="#0891B2" strokeWidth="1.2" fill="#A5F3FC"/>
    <rect x="17" y="22" width="2" height="2" rx="0.3" fill="#0891B2"/><rect x="17" y="27" width="2" height="2" rx="0.3" fill="#0891B2"/>
    <rect x="34" y="22" width="2" height="2" rx="0.3" fill="#0891B2"/><rect x="34" y="27" width="2" height="2" rx="0.3" fill="#0891B2"/>
    <line x1="10" y1="44" x2="46" y2="44" stroke="#0891B2" strokeWidth="1.4"/>
  </svg>
);

const DESTINATIONS = [
  { city:"Nairobi",       country:"Kenya",    description:"For sights like Uhuru Park",    icon:<IconNairobi/>,      bg:"#FFF0F0" },
  { city:"Dar es Salaam", country:"Tanzania", description:"For a trip abroad",             icon:<IconDarEsSalaam/>,  bg:"#F0F8FF" },
  { city:"Mombasa",       country:"Kenya",    description:"For its seaside allure",        icon:<IconMombasa/>,      bg:"#F0FFF4" },
  { city:"Kuala Lumpur",  country:"Malaysia", description:"For its stunning architecture", icon:<IconKualaLumpur/>,  bg:"#ECFEFF" },
  { city:"Addis Ababa",   country:"Ethiopia", description:"For a trip abroad",             icon:<IconAddisAbaba/>,   bg:"#F5F3FF" },
  { city:"Hargeisa",      country:"Somalia",  description:"For its vibrant culture",       icon:<IconHargeisa/>,     bg:"#FFFBEB" },
];

function WhereDropdown({ onClose, onSelect }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const ref = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  const filtered = query
    ? DESTINATIONS.filter(d => d.city.toLowerCase().includes(query.toLowerCase()) || d.country.toLowerCase().includes(query.toLowerCase()))
    : DESTINATIONS;

  return (
    <div className="where-panel" ref={ref} style={{ position:"absolute", left:0, top:"calc(100% + 10px)", width:360, background:"white", borderRadius:24, boxShadow:"0 24px 60px rgba(0,0,0,.15)", border:"1px solid #f3f4f6", overflow:"hidden", zIndex:200, animation:"ddIn .18s cubic-bezier(.16,1,.3,1) both" }}>
      {/* Search input */}
      <div style={{ padding:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, border:"1px solid #e5e7eb", borderRadius:50, padding:"10px 16px", boxShadow:"0 1px 4px rgba(0,0,0,.06)" }}>
          <span style={{ color:"#9ca3af", flexShrink:0 }}><SearchIcon/></span>
          <input ref={inputRef} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search destinations"
            style={{ flex:1, fontSize:13.5, color:"#374151", background:"transparent", border:"none", outline:"none", fontFamily:"inherit" }}/>
          {query && (
            <button onClick={()=>setQuery("")} style={{ width:20, height:20, borderRadius:"50%", background:"#e5e7eb", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#6b7280", flexShrink:0 }}>
              {XIcon(11)}
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div style={{ maxHeight:420, overflowY:"auto", paddingBottom:12 }}>
        <p style={{ fontSize:11, fontWeight:600, color:"#9ca3af", padding:"4px 20px 8px", margin:0 }}>Suggested destinations</p>

        {/* Nearby */}
        {!query && (
          <button onClick={()=>{onSelect("Nearby");onClose();}} style={{ width:"100%", display:"flex", alignItems:"center", gap:16, padding:"11px 16px", border:"none", background:"transparent", cursor:"pointer", textAlign:"left", transition:"background .12s", fontFamily:"inherit" }}
            onMouseEnter={e=>e.currentTarget.style.background="#f9fafb"}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <div style={{ width:48, height:48, borderRadius:12, background:"#F0F4FF", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4F6EF7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
            </div>
            <div><p style={{ fontSize:13.5, fontWeight:600, color:"#111827", margin:0 }}>Nearby</p><p style={{ fontSize:12, color:"#9ca3af", margin:"2px 0 0" }}>Find what's around you</p></div>
          </button>
        )}

        {filtered.length > 0
          ? filtered.map(({ city, country, description, icon, bg }) => (
            <button key={city} onClick={()=>{onSelect(`${city}, ${country}`);onClose();}} style={{ width:"100%", display:"flex", alignItems:"center", gap:16, padding:"11px 16px", border:"none", background:"transparent", cursor:"pointer", textAlign:"left", transition:"background .12s", fontFamily:"inherit" }}
              onMouseEnter={e=>e.currentTarget.style.background="#f9fafb"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div style={{ width:48, height:48, borderRadius:12, background:bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{icon}</div>
              <div><p style={{ fontSize:13.5, fontWeight:600, color:"#111827", margin:0 }}>{city}, {country}</p><p style={{ fontSize:12, color:"#9ca3af", margin:"2px 0 0" }}>{description}</p></div>
            </button>
          ))
          : <div style={{ padding:"28px 20px", textAlign:"center", fontSize:13, color:"#9ca3af" }}>No destinations found for "{query}"</div>
        }
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// WHEN PICKER — exact logic from WhenPicker.tsx
// ═══════════════════════════════════════════════════════════════════
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const SHORT_DAYS  = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const FLEX_TAGS   = ["Exact dates","+1 day","+2 days","+3 days","+7 days","+14 days"];
const MAX_MONTHS  = 12;
const VISIBLE_MONTHS = 6;

function formatDate(d) { return `${MONTH_NAMES[d.getMonth()].slice(0,3)} ${d.getDate()}`; }
function formatFull(d) { const days=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]; return `${days[d.getDay()]}, ${MONTH_NAMES[d.getMonth()].slice(0,3)} ${d.getDate()}`; }
function addMonths(date, n) { const d=new Date(date); d.setDate(1); d.setMonth(d.getMonth()+n); return d; }
function getDaysInMonth(y,m) { return new Date(y,m+1,0).getDate(); }
function getFirstDayOfMonth(y,m) { return new Date(y,m,1).getDay(); }
function isSameDay(a,b) { if(!a||!b) return false; return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate(); }
function isBetween(d,s,e) { if(!s||!e) return false; const t=d.getTime(); return t>Math.min(s.getTime(),e.getTime())&&t<Math.max(s.getTime(),e.getTime()); }

function DatesTab({ onSelect }) {
  const today = new Date();
  const [leftMonth,  setLeftMonth]  = useState(new Date(today.getFullYear(),today.getMonth(),1));
  const [startDate,  setStartDate]  = useState(null);
  const [endDate,    setEndDate]    = useState(null);
  const [hoverDate,  setHoverDate]  = useState(null);
  const [exactMode,  setExactMode]  = useState("Exact dates");
  const rightMonth = addMonths(leftMonth,1);

  const handleDayClick = d => {
    if(!startDate||(startDate&&endDate)){setStartDate(d);setEndDate(null);}
    else {
      if(d<startDate){setStartDate(d);setEndDate(null);}
      else{setEndDate(d);onSelect&&onSelect(startDate,d);}
    }
  };

  const renderMonth = base => {
    const y=base.getFullYear(), m=base.getMonth();
    const days=getDaysInMonth(y,m), first=getFirstDayOfMonth(y,m);
    const cells=[];
    for(let i=0;i<first;i++) cells.push(null);
    for(let d=1;d<=days;d++) cells.push(new Date(y,m,d));

    return (
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:13, fontWeight:600, textAlign:"center", color:"#1f2937", marginBottom:12 }}>{MONTH_NAMES[m]} {y}</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", marginBottom:4 }}>
          {SHORT_DAYS.map(d=><div key={d} style={{ textAlign:"center", fontSize:10, fontWeight:600, color:"#9ca3af", padding:"4px 0" }}>{d}</div>)}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)" }}>
          {cells.map((d,i)=>{
            if(!d) return <div key={`e${i}`}/>;
            const todayMid = new Date(today.getFullYear(),today.getMonth(),today.getDate());
            const isPast  = d<todayMid;
            const isStart = isSameDay(d,startDate);
            const isEnd   = isSameDay(d,endDate);
            const inRange = endDate ? isBetween(d,startDate,endDate) : (!endDate&&hoverDate&&startDate&&isBetween(d,startDate,hoverDate));
            const isTod   = isSameDay(d,todayMid);
            return (
              <button key={d.toISOString()} disabled={isPast}
                onMouseEnter={()=>!isPast&&setHoverDate(d)}
                onMouseLeave={()=>setHoverDate(null)}
                onClick={()=>!isPast&&handleDayClick(d)}
                style={{ position:"relative", fontSize:12, padding:"6px 0", border:"none", cursor:isPast?"not-allowed":"pointer", userSelect:"none", transition:"all .1s", fontFamily:"inherit", borderRadius: isStart||isEnd ? "50%" : inRange ? 0 : "50%",
                  background: isStart||isEnd?"#1f2937" : inRange?"#fee2e2" : (!isStart&&!isEnd&&!inRange&&!isPast&&isSameDay(d,hoverDate))?"#f3f4f6":"transparent",
                  color: isPast?"#d1d5db" : isStart||isEnd?"white" : inRange?"#b91c1c" : "#374151",
                  fontWeight: isStart||isEnd?700:400,
                  outline: isTod&&!isStart&&!isEnd ? `1.5px solid ${BRAND}` : "none",
                }}>
                {d.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:16, padding:"0 4px" }}>
        <button onClick={()=>setLeftMonth(p=>addMonths(p,-1))} style={{ padding:6, borderRadius:"50%", border:"none", background:"none", cursor:"pointer", color:"#6b7280", transition:"background .1s" }} onMouseEnter={e=>e.currentTarget.style.background="#f3f4f6"} onMouseLeave={e=>e.currentTarget.style.background="none"}><ChevLeft/></button>
        <div className="dates-months" style={{ display:"flex", flex:1, gap:24 }}>{renderMonth(leftMonth)}{renderMonth(rightMonth)}</div>
        <button onClick={()=>setLeftMonth(p=>addMonths(p,1))} style={{ padding:6, borderRadius:"50%", border:"none", background:"none", cursor:"pointer", color:"#6b7280", transition:"background .1s" }} onMouseEnter={e=>e.currentTarget.style.background="#f3f4f6"} onMouseLeave={e=>e.currentTarget.style.background="none"}><ChevRight/></button>
      </div>
      <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:16, flexWrap:"wrap" }}>
        {FLEX_TAGS.map(t=>(
          <button key={t} onClick={()=>setExactMode(t)} style={{ fontSize:11.5, border:`1px solid ${exactMode===t?"#1f2937":"#d1d5db"}`, borderRadius:50, padding:"5px 12px", background:exactMode===t?"#1f2937":"white", color:exactMode===t?"white":"#4b5563", cursor:"pointer", transition:"all .15s", fontFamily:"inherit" }}>{t}</button>
        ))}
      </div>
      {(startDate||endDate)&&(
        <div style={{ marginTop:10, textAlign:"center", fontSize:12, color:"#6b7280" }}>
          {startDate&&<span style={{ fontWeight:700, color:"#111827" }}>{formatDate(startDate)}</span>}
          {endDate&&<> — <span style={{ fontWeight:700, color:"#111827" }}>{formatDate(endDate)}</span></>}
        </div>
      )}
    </div>
  );
}

function MonthsTab({ onSelect }) {
  const [months, setMonths] = useState(1);
  const today=new Date();
  const startD=new Date(today.getFullYear(),today.getMonth()+1,1);
  const endD=new Date(startD); endD.setMonth(endD.getMonth()+months); endD.setDate(endD.getDate()-1);
  const R=80,CX=110,CY=110;
  const angle=(months/MAX_MONTHS)*360-90, rad=(angle*Math.PI)/180;
  const thumbX=CX+R*Math.cos(rad), thumbY=CY+R*Math.sin(rad);
  const startRad=-Math.PI/2, largeArc=months/MAX_MONTHS>0.5?1:0;
  const arcX1=CX+R*Math.cos(startRad), arcY1=CY+R*Math.sin(startRad);
  const ticks=Array.from({length:12},(_,i)=>{const a=((i/12)*360-90)*(Math.PI/180);return{x1:CX+90*Math.cos(a),y1:CY+90*Math.sin(a),x2:CX+100*Math.cos(a),y2:CY+100*Math.sin(a)};});

  const handleDialClick = e => {
    const rect=e.currentTarget.getBoundingClientRect();
    const x=e.clientX-rect.left-CX, y=e.clientY-rect.top-CY;
    let deg=(Math.atan2(y,x)*180)/Math.PI+90;
    if(deg<0)deg+=360;
    const m=Math.max(1,Math.round((deg/360)*MAX_MONTHS));
    setMonths(m); onSelect&&onSelect(startD,endD);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"8px 0" }}>
      <p style={{ fontSize:13, fontWeight:600, color:"#1f2937", marginBottom:20 }}>When's your trip?</p>
      <svg width={220} height={220} viewBox="0 0 220 220" style={{ cursor:"pointer" }} onClick={handleDialClick}>
        <defs><linearGradient id="dialGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={BRAND}/><stop offset="100%" stopColor="#ff6b6b"/></linearGradient></defs>
        <circle cx={CX} cy={CY} r={R+16} fill="white" style={{ filter:"drop-shadow(0 4px 16px rgba(0,0,0,0.10))" }}/>
        <circle cx={CX} cy={CY} r={R-20} fill="white" style={{ filter:"drop-shadow(0 2px 8px rgba(0,0,0,0.06))" }}/>
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f0f0f0" strokeWidth="14"/>
        {months>0&&<path d={`M ${arcX1} ${arcY1} A ${R} ${R} 0 ${largeArc} 1 ${thumbX} ${thumbY}`} fill="none" stroke="url(#dialGrad)" strokeWidth="14" strokeLinecap="round"/>}
        {ticks.map((t,i)=><line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="#e0e0e0" strokeWidth="2" strokeLinecap="round"/>)}
        <circle cx={thumbX} cy={thumbY} r={11} fill="white" style={{ filter:"drop-shadow(0 2px 6px rgba(0,0,0,0.18))" }}/>
        <text x={CX} y={CY-6} textAnchor="middle" fontSize="26" fontWeight="700" fill="#111">{months}</text>
        <text x={CX} y={CY+16} textAnchor="middle" fontSize="11" fill="#888">month{months!==1?"s":""}</text>
      </svg>
      <div style={{ marginTop:12, display:"flex", alignItems:"center", gap:8, fontSize:13 }}>
        <span style={{ fontWeight:600, color:"#111827", textDecoration:"underline", textUnderlineOffset:2 }}>{formatFull(startD)}</span>
        <span style={{ color:"#9ca3af" }}>to</span>
        <span style={{ fontWeight:600, color:"#111827", textDecoration:"underline", textUnderlineOffset:2 }}>{formatFull(endD)}</span>
      </div>
    </div>
  );
}

function FlexibleTab({ onSelect }) {
  const [duration, setDuration]     = useState("Weekend");
  const [selectedMonths, setSelMon] = useState([]);
  const [offset, setOffset]         = useState(0);
  const today = new Date();
  const allMonths = Array.from({length:18},(_,i)=>{
    const d=new Date(today.getFullYear(),today.getMonth()+1+i,1);
    return{label:MONTH_NAMES[d.getMonth()],year:d.getFullYear(),key:`${d.getFullYear()}-${d.getMonth()}`};
  });
  const visible = allMonths.slice(offset, offset+VISIBLE_MONTHS);
  const toggleMonth = k => setSelMon(p=>p.includes(k)?p.filter(x=>x!==k):[...p,k]);

  return (
    <div style={{ padding:"8px 0" }}>
      <p style={{ fontSize:13, fontWeight:600, color:"#1f2937", textAlign:"center", marginBottom:16 }}>How long would you like to stay?</p>
      <div style={{ display:"flex", justifyContent:"center", gap:10, marginBottom:24 }}>
        {["Weekend","Week","Month"].map(d=>(
          <button key={d} onClick={()=>setDuration(d)} style={{ fontSize:13, border:`1px solid ${duration===d?"#1f2937":"#d1d5db"}`, borderRadius:50, padding:"6px 18px", background:duration===d?"#1f2937":"white", color:duration===d?"white":"#374151", cursor:"pointer", transition:"all .15s", fontWeight:duration===d?600:400, fontFamily:"inherit" }}>{d}</button>
        ))}
      </div>
      <p style={{ fontSize:13, fontWeight:600, color:"#1f2937", textAlign:"center", marginBottom:12 }}>Go anytime</p>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <button onClick={()=>setOffset(o=>Math.max(0,o-1))} disabled={offset===0} style={{ padding:6, borderRadius:"50%", border:"1px solid #e5e7eb", color:"#9ca3af", background:"white", cursor:offset===0?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", opacity:offset===0?.3:1, flexShrink:0 }}><ChevLeft/></button>
        <div className="flex-month-strip" style={{ display:"flex", gap:8, flex:1 }}>
          {visible.map(({label,year,key})=>(
            <button key={key} onClick={()=>toggleMonth(key)} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:5, padding:"12px 4px", borderRadius:12, border:`2px solid ${selectedMonths.includes(key)?"#1f2937":"#e5e7eb"}`, background:selectedMonths.includes(key)?"#f9fafb":"white", cursor:"pointer", transition:"all .15s", fontFamily:"inherit" }}>
              <span style={{ color:"#9ca3af" }}><CalIcon/></span>
              <span style={{ fontSize:11, fontWeight:600, color:"#1f2937" }}>{label}</span>
              <span style={{ fontSize:10, color:"#9ca3af" }}>{year}</span>
            </button>
          ))}
        </div>
        <button onClick={()=>setOffset(o=>Math.min(allMonths.length-VISIBLE_MONTHS,o+1))} disabled={offset>=allMonths.length-VISIBLE_MONTHS} style={{ padding:6, borderRadius:"50%", border:"1px solid #e5e7eb", color:"#9ca3af", background:"white", cursor:offset>=allMonths.length-VISIBLE_MONTHS?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", opacity:offset>=allMonths.length-VISIBLE_MONTHS?.3:1, flexShrink:0 }}><ChevRight/></button>
      </div>
      {selectedMonths.length>0&&<p style={{ textAlign:"center", fontSize:12, color:"#6b7280", marginTop:12 }}>{selectedMonths.length} month{selectedMonths.length!==1?"s":""} selected</p>}
    </div>
  );
}

function WhenPicker({ onSelect, onClose }) {
  const [activeTab, setActiveTab] = useState("Dates");
  const TABS = ["Dates","Months","Flexible"];
  return (
    <div className="when-panel" style={{ position:"absolute", top:"calc(100% + 10px)", left:"-100%", width:620, background:"white", borderRadius:24, boxShadow:"0 24px 60px rgba(0,0,0,.15)", border:"1px solid #f3f4f6", overflow:"hidden", zIndex:200, animation:"ddIn .18s cubic-bezier(.16,1,.3,1) both" }}>
      {/* Tab switcher */}
      <div style={{ display:"flex", justifyContent:"center", gap:4, padding:"16px 16px 12px", background:"#fafafa", borderBottom:"1px solid #f3f4f6" }}>
        {TABS.map(tab=>(
          <button key={tab} onClick={()=>setActiveTab(tab)} style={{ fontSize:13, padding:"6px 18px", borderRadius:50, border:activeTab===tab?"1px solid #e5e7eb":"1px solid transparent", background:activeTab===tab?"white":"none", boxShadow:activeTab===tab?"0 1px 4px rgba(0,0,0,.08)":"none", fontWeight:activeTab===tab?700:400, color:activeTab===tab?"#111827":"#6b7280", cursor:"pointer", transition:"all .15s", fontFamily:"inherit" }}>{tab}</button>
        ))}
      </div>
      {/* Tab content */}
      <div className="when-panel-content" key={activeTab} style={{ padding:"20px 20px 16px", animation:"tabFade .15s ease both" }}>
        {activeTab==="Dates"    && <DatesTab    onSelect={onSelect}/>}
        {activeTab==="Months"   && <MonthsTab   onSelect={onSelect}/>}
        {activeTab==="Flexible" && <FlexibleTab onSelect={onSelect}/>}
      </div>
      {/* Footer */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 20px 16px", borderTop:"1px solid #f3f4f6" }}>
        <button onClick={onClose} style={{ fontSize:13, fontWeight:600, color:"#6b7280", background:"none", border:"none", cursor:"pointer", textDecoration:"underline", textUnderlineOffset:2, fontFamily:"inherit" }}>Clear</button>
        <button onClick={onClose} style={{ background:BRAND, color:"white", fontSize:13, fontWeight:700, padding:"9px 22px", borderRadius:50, border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:7, fontFamily:"inherit" }}><SearchIcon/> Search</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// WHO DROPDOWN
// ═══════════════════════════════════════════════════════════════════
const GUEST_TYPES = [
  { key:"adults",   label:"Adults",   sub:"Ages 13+",                    min:1 },
  { key:"children", label:"Children", sub:"Ages 2–12",                   min:0 },
  { key:"infants",  label:"Infants",  sub:"Under 2",                     min:0 },
  { key:"pets",     label:"Pets",     sub:"Bringing a service animal?",  min:0 },
];

const INITIAL_COUNTS = { adults:1, children:0, infants:0, pets:0 };

function WhoDropdown({ onClose, onSelect, maxGuests=16 }) {
  const [counts, setCounts] = useState(INITIAL_COUNTS);
  const ref = useRef(null);

  useEffect(()=>{
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  const guestTotal = counts.adults + counts.children;

  const update = (key, delta) => {
    setCounts(prev => {
      const row = GUEST_TYPES.find(g => g.key === key);
      const nextVal = prev[key] + delta;
      if (nextVal < row.min) return prev;
      // enforce maxGuests for adults + children combined
      if (delta > 0 && (key === "adults" || key === "children")) {
        const nextTotal = (key === "adults" ? nextVal : prev.adults) + (key === "children" ? nextVal : prev.children);
        if (nextTotal > maxGuests) return prev;
      }
      return { ...prev, [key]: nextVal };
    });
  };

  const total = counts.adults + counts.children;
  const applyLabel = total === 0 ? "Add guests" : [
    total > 0          && `${total} guest${total !== 1 ? "s" : ""}`,
    counts.infants > 0 && `${counts.infants} infant${counts.infants !== 1 ? "s" : ""}`,
    counts.pets > 0    && `${counts.pets} pet${counts.pets !== 1 ? "s" : ""}`,
  ].filter(Boolean).join(", ");

  return (
    <div className="who-panel" ref={ref} style={{ position:"absolute", right:0, top:"calc(100% + 10px)", width:320, background:"white", borderRadius:20, boxShadow:"0 24px 60px rgba(0,0,0,.15)", border:"1px solid #f3f4f6", zIndex:200, animation:"ddIn .18s cubic-bezier(.16,1,.3,1) both" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 16px", borderBottom:"1px solid #f3f4f6" }}>
        <p style={{ fontSize:13.5, fontWeight:600, color:"#1f2937", margin:0 }}>Guests</p>
        <button type="button" onClick={onClose} style={{ width:26, height:26, borderRadius:"50%", border:"none", background:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#9ca3af", transition:"background .12s" }} onMouseEnter={e=>e.currentTarget.style.background="#f3f4f6"} onMouseLeave={e=>e.currentTarget.style.background="none"}>{XIcon(13)}</button>
      </div>

      {/* Counters */}
      <div style={{ padding:"8px 16px 4px" }}>
        {GUEST_TYPES.map(({ key, label, sub, min }, i) => {
          const val = counts[key];
          const canDec = val > min;
          const atGuestMax = (key === "adults" || key === "children") && guestTotal >= maxGuests;
          const canInc = !atGuestMax;
          return (
            <div key={key}>
              {i > 0 && <div style={{ height:1, background:"#f3f4f6", margin:"4px 0" }}/>}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0" }}>
                <div>
                  <p style={{ fontSize:13.5, fontWeight:600, color:"#1f2937", margin:0 }}>{label}</p>
                  <p style={{ fontSize:11.5, color:"#9ca3af", margin:"2px 0 0" }}>{sub}</p>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                  {/* Decrement */}
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); update(key, -1); }}
                    disabled={!canDec}
                    style={{ width:32, height:32, borderRadius:"50%", border:`1px solid ${canDec?"#d1d5db":"#f3f4f6"}`, background:"white", cursor:canDec?"pointer":"not-allowed", display:"flex", alignItems:"center", justifyContent:"center", color:canDec?"#374151":"#d1d5db", transition:"all .15s", fontFamily:"inherit" }}
                    onMouseEnter={e=>{ if(canDec){e.currentTarget.style.borderColor=BRAND;e.currentTarget.style.color=BRAND;} }}
                    onMouseLeave={e=>{ if(canDec){e.currentTarget.style.borderColor="#d1d5db";e.currentTarget.style.color="#374151";} }}
                  >
                    <MinusIcon/>
                  </button>

                  <span style={{ width:20, textAlign:"center", fontSize:13.5, fontWeight:600, color:"#1f2937", userSelect:"none" }}>{val}</span>

                  {/* Increment */}
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); update(key, 1); }}
                    disabled={!canInc}
                    style={{ width:32, height:32, borderRadius:"50%", border:`1px solid ${canInc?"#d1d5db":"#f3f4f6"}`, background:"white", cursor:canInc?"pointer":"not-allowed", display:"flex", alignItems:"center", justifyContent:"center", color:canInc?"#374151":"#d1d5db", transition:"all .15s", fontFamily:"inherit" }}
                    onMouseEnter={e=>{ if(canInc){e.currentTarget.style.borderColor=BRAND;e.currentTarget.style.color=BRAND;} }}
                    onMouseLeave={e=>{ if(canInc){e.currentTarget.style.borderColor="#d1d5db";e.currentTarget.style.color="#374151";} }}
                  >
                    <PlusIcon/>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Max guests notice */}
      {guestTotal >= maxGuests && (
        <p style={{ fontSize:11.5, color:BRAND, padding:"0 16px 8px", margin:0 }}>
          This property allows a maximum of {maxGuests} guests.
        </p>
      )}

      {/* Footer */}
      <div style={{ padding:"8px 16px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", borderTop:"1px solid #f3f4f6" }}>
        <button type="button" onClick={() => setCounts(INITIAL_COUNTS)} style={{ fontSize:12, fontWeight:600, color:"#6b7280", background:"none", border:"none", cursor:"pointer", textDecoration:"underline", textUnderlineOffset:2, fontFamily:"inherit" }}>Clear all</button>
        <button type="button" onClick={() => { onSelect(applyLabel, counts); onClose(); }} style={{ fontSize:12, fontWeight:700, background:BRAND, color:"white", border:"none", borderRadius:50, padding:"8px 18px", cursor:"pointer", fontFamily:"inherit" }}>
          Apply · {applyLabel}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN NAVBAR
// ═══════════════════════════════════════════════════════════════════
function LanguageDropdown({ selectedLanguage, onSelect, onClose }) {
  const ref = useRef(null);

  useEffect(()=>{
    const h=e=>{ if(ref.current&&!ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown",h);
    return ()=>document.removeEventListener("mousedown",h);
  },[onClose]);

  return (
    <div ref={ref} style={{ position:"absolute", right:0, top:"calc(100% + 10px)", width:190, background:"white", borderRadius:16, boxShadow:"0 18px 45px rgba(0,0,0,.14)", border:"1px solid #f3f4f6", overflow:"hidden", zIndex:220, animation:"ddIn .18s cubic-bezier(.16,1,.3,1) both" }}>
      <div style={{ padding:"8px" }}>
        {LANGUAGES.map(({ code, label, short }) => {
          const active = selectedLanguage === code;
          return (
            <button key={code} onClick={()=>{onSelect(code);onClose();}} style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, padding:"10px 12px", border:"none", borderRadius:10, background:active?"rgba(186,0,54,0.08)":"transparent", color:active?BRAND:"#374151", cursor:"pointer", fontFamily:"inherit", transition:"background .12s" }}
              onMouseEnter={e=>{ if(!active)e.currentTarget.style.background="#f9fafb"; }}
              onMouseLeave={e=>{ if(!active)e.currentTarget.style.background="transparent"; }}>
              <span style={{ fontSize:13, fontWeight:active?700:600 }}>{label}</span>
              <span style={{ minWidth:28, textAlign:"center", fontSize:11, fontWeight:800, color:active?BRAND:"#9ca3af" }}>{short}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function GuriGateNavbar() {
  const [activeNav, setActiveNav] = useState("Homes");
  const [drop,      setDrop]      = useState(null);
  const [where,     setWhere]     = useState("");
  const [whenLbl,   setWhenLbl]   = useState("");
  const [whoLbl,    setWhoLbl]    = useState("");
  const [showHostModal, setShowHostModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const { language, setLanguage } = useLanguage();
  const navRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useContext(AuthContext);

  // Update active navigation based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path === "/") {
      setActiveNav("Homes");
    } else if (path.startsWith("/manage-property")) {
      setActiveNav("Commercial Management");
    } else if (path.startsWith("/bookings")) {
      setActiveNav("Bookings");
    } else {
      setActiveNav("Homes"); // Default fallback
    }
  }, [location.pathname]);

  // Close search dropdowns on outside click
  useEffect(()=>{
    const h=e=>{
      if(navRef.current&&!navRef.current.contains(e.target))
        setDrop(null);
    };
    document.addEventListener("mousedown",h);
    return ()=>document.removeEventListener("mousedown",h);
  },[]);

  const toggle = id => setDrop(p=>p===id?null:id);

  const handleDateSelect = (start, end) => {
    const label = `${formatDate(start)} – ${formatDate(end)}`;
    setWhenLbl(label);
  };

  const handleGuestSelect = (summary) => setWhoLbl(summary === "Add guests" ? "" : summary);

  const handleNavClick = (label) => {
    setActiveNav(label);
    switch(label) {
      case "Homes":
        navigate("/");
        break;
      case "Commercial Management":
        navigate("/manage-property");
        break;
      case "Bookings":
        navigate("/manage-property/bookings");
        break;
      default:
        break;
    }
  };

  const seg = (id, isFirst, isLast) => ({
    flex: id==="where" ? "0 0 36%" : id==="when" ? "0 0 30%" : "1",
    padding:"10px 20px", cursor:"pointer", border:"none", outline:"none",
    borderRight: !isLast ? "1px solid #ececec" : "none",
    background: drop===id ? "#f9fafb" : "transparent",
    textAlign: id==="where" ? "left" : "center",
    display:"flex", flexDirection:"column", alignItems: id==="where" ? "flex-start" : "center", justifyContent:"center",
    transition:"background .12s", fontFamily:"inherit",
    borderRadius: isFirst ? "40px 0 0 40px" : isLast ? "0 40px 40px 0" : 0,
  });

  const searchFocused = ["where","when","who"].includes(drop);

  return (
    <div className="nav-shell" ref={navRef} style={{ fontFamily:"'DM Sans',system-ui,sans-serif", background:"white", position:"sticky", top:0, zIndex:50 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;}
        @keyframes ddIn{from{opacity:0;transform:translateY(-8px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes tabFade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
        ::-webkit-scrollbar{width:4px;height:4px;}::-webkit-scrollbar-thumb{background:#e5e7eb;border-radius:4px;}
        button{font-family:'DM Sans',system-ui,sans-serif;}
        @media (max-width: 1023px) {
          .nav-row-inner { height:auto !important; flex-wrap:wrap !important; gap:14px !important; padding:14px 20px !important; }
          .nav-center { display:none !important; }
          .mobile-tabs-row { display:flex !important; }
          .host-button { display:none !important; }
          .search-row { padding:14px 20px 18px !important; }
          .search-container { max-width:100% !important; }
          .when-panel, .where-panel, .who-panel { left:50% !important; right:auto !important; transform:translateX(-50%) !important; width:min(calc(100vw - 32px), 620px) !important; }
          .dates-months { gap:16px !important; }
          .flex-month-strip { gap:6px !important; }
        }
        @media (max-width: 767px) {
          .nav-row-inner { padding:12px 16px !important; }
          .nav-actions { width:100% !important; justify-content:flex-end !important; }
          .search-row { padding:12px 16px 16px !important; }
          .search-card { flex-direction:column !important; border-radius:24px !important; }
          .search-field { flex:1 1 auto !important; width:100% !important; }
          .search-segment-button { width:100% !important; padding:14px 18px !important; border-right:none !important; border-radius:0 !important; text-align:left !important; align-items:flex-start !important; }
          .search-where .search-segment-button { border-radius:24px 24px 0 0 !important; }
          .search-who .search-segment-button { border-bottom:none !important; }
          .search-cta-wrap { padding:0 6px 6px !important; }
          .search-submit { width:100% !important; justify-content:center !important; padding:12px 18px !important; }
          .dates-months { flex-direction:column !important; gap:18px !important; }
          .flex-month-strip { display:grid !important; grid-template-columns:repeat(3, minmax(0, 1fr)) !important; }
          .when-panel-content { padding:16px 14px 12px !important; }
        }
      `}</style>

      {/* Red accent line */}
      <div style={{ height:3, background:`linear-gradient(90deg,${BRAND},#e8344e,${BRAND})` }}/>

      {/* ── Nav row ── */}
      <div style={{ borderBottom:"1px solid #f3f4f6" }}>
        <div className="nav-row-inner" style={{ maxWidth:1200, margin:"0 auto", padding:"0 28px", height:62, display:"flex", alignItems:"center", justifyContent:"space-between" }}>

          {/* Logo */}
          <div onClick={() => navigate("/")} style={{ display:"flex", alignItems:"center", gap:9, flexShrink:0, cursor:"pointer" }}>
            <div style={{ width:34, height:34, background:BRAND, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", color:"white", boxShadow:`0 3px 10px rgba(186,0,54,.35)` }}>
              <HomeIcon/>
            </div>
            <span style={{ fontSize:19, fontWeight:800, color:"#111827", letterSpacing:"-0.5px" }}>GuriGate</span>
          </div>

          {/* Center nav */}
          <nav className="nav-center" style={{ display:"flex", alignItems:"center", gap:2, height:"100%" }}>
            {[{l:"Homes",i:<img src="/home2.svg" alt="" width="15" height="15" />},{l:"Commercial Management",i:<CompassIcon/>,badge:"NEW"},{l:"Bookings",i:<BldgIcon/>,badge:"NEW"}].map(({l,i,badge})=>{
              const a=activeNav===l;
              return (
                <button key={l} onClick={()=>handleNavClick(l)} style={{ display:"flex", alignItems:"center", gap:6, padding:"0 15px", height:"100%", border:"none", background:"none", cursor:"pointer", fontSize:13.5, fontWeight:a?700:500, color:a?"#111827":"#6b7280", borderBottom:a?`2.5px solid ${BRAND}`:"2.5px solid transparent", position:"relative", transition:"color .15s", fontFamily:"inherit" }}
                  onMouseEnter={e=>{if(!a)e.currentTarget.style.color="#111827";}}
                  onMouseLeave={e=>{if(!a)e.currentTarget.style.color="#6b7280";}}>
                  <span style={{ opacity:.8, flexShrink:0 }}>{i}</span>
                  {l}
                  {badge&&<span style={{ fontSize:8, fontWeight:800, background:BRAND, color:"white", padding:"1.5px 5px", borderRadius:10, letterSpacing:"0.05em", position:"absolute", top:10, right:-2 }}>{badge}</span>}
                </button>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="nav-actions" style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
            <button className="host-button" onClick={() => {
              if (auth?.session) {
                navigate('/become-a-host');
              } else {
                setShowEmailModal(true);
              }
            }} style={{ fontSize:13, fontWeight:600, color:"#374151", background:"none", border:"none", cursor:"pointer", padding:"7px 12px", borderRadius:10, transition:"background .15s", fontFamily:"inherit" }}
              onMouseEnter={e=>e.currentTarget.style.background="#f9fafb"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              Become a host
            </button>
            <div style={{ position:"relative" }}>
              <button onClick={()=>toggle("language")} aria-label="Choose language" style={{ height:38, borderRadius:999, border:"1px solid #e5e7eb", background:drop==="language"?"rgba(186,0,54,0.08)":"white", display:"flex", alignItems:"center", justifyContent:"center", gap:6, cursor:"pointer", color:drop==="language"?BRAND:"#374151", transition:"all .15s", padding:"0 11px", fontFamily:"inherit" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=BRAND;e.currentTarget.style.color=BRAND;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=drop==="language"?BRAND:"#e5e7eb";e.currentTarget.style.color=drop==="language"?BRAND:"#374151";}}>
                <GlobeIcon/>
                <span style={{ fontSize:11, fontWeight:800 }}>{LANGUAGES.find(item=>item.code===language)?.short}</span>
              </button>
              {drop==="language" && (
                <LanguageDropdown selectedLanguage={language} onSelect={setLanguage} onClose={()=>setDrop(null)} />
              )}
            </div>
            <div style={{ position:"relative" }}>
              <ProfileMenu onNavigate={navigate} />
            </div>
          </div>
        </div>
        <div className="mobile-tabs-row" style={{ display:"none", gap:10, overflowX:"auto", padding:"0 16px 14px", maxWidth:1200, margin:"0 auto" }}>
          {[{l:"Homes",i:<img src="/home2.svg" alt="" width="15" height="15" />},{l:"Commercial Management",i:<CompassIcon/>,badge:"NEW"},{l:"Bookings",i:<BldgIcon/>,badge:"NEW"}].map(({l,i,badge})=>{
            const a=activeNav===l;
            return (
              <button key={`mobile-${l}`} onClick={()=>handleNavClick(l)} style={{ display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap", padding:"8px 14px", borderRadius:999, border:a?`1.5px solid ${BRAND}`:"1.5px solid #e5e7eb", background:a?"rgba(186,0,54,0.08)":"white", color:a?BRAND:"#6b7280", fontSize:13, fontWeight:a?700:500, position:"relative", cursor:"pointer", flexShrink:0 }}>
                <span style={{ opacity:.8, flexShrink:0 }}>{i}</span>
                {l}
                {badge&&<span style={{ fontSize:8, fontWeight:800, background:BRAND, color:"white", padding:"1.5px 5px", borderRadius:10, letterSpacing:"0.05em", position:"absolute", top:-4, right:-4 }}>{badge}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Search bar row ── */}
      <div className="search-row" style={{ padding:"16px 28px 22px", display:"flex", justifyContent:"center", background:"white" }}>
        <div className="search-container" style={{ position:"relative", width:"100%", maxWidth:700 }}>
          <div className="search-card" style={{ display:"flex", alignItems:"stretch", border:`1.5px solid ${searchFocused?BRAND:"#e5e7eb"}`, borderRadius:50, background:"white", overflow:"visible", boxShadow:searchFocused?`0 0 0 3px rgba(186,0,54,.09),0 6px 24px rgba(0,0,0,.1)`:"0 2px 12px rgba(0,0,0,.08)", transition:"all .22s" }}>

            {/* WHERE */}
            <div className="search-field search-where" style={{ position:"relative", flex:"0 0 36%" }}>
              <button className="search-segment-button" onClick={()=>toggle("where")} style={seg("where",true,false)}
                onMouseEnter={e=>{if(drop!=="where")e.currentTarget.style.background="#f9fafb";}}
                onMouseLeave={e=>{if(drop!=="where")e.currentTarget.style.background=drop==="where"?"#f9fafb":"transparent";}}>
                <div style={{ fontSize:9.5, fontWeight:800, letterSpacing:"0.08em", textTransform:"uppercase", color:drop==="where"?BRAND:"#374151", marginBottom:3 }}>Where</div>
                <div style={{ fontSize:13.5, color:where?"#111827":"#9ca3af", fontWeight:where?600:400, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {where||"Search destinations"}
                </div>
              </button>
              {drop==="where" && <WhereDropdown onClose={()=>setDrop(null)} onSelect={v=>{setWhere(v);setDrop("when");}}/>}
            </div>

            {/* WHEN */}
            <div className="search-field search-when" style={{ position:"relative", flex:"0 0 30%" }}>
              <button className="search-segment-button" onClick={()=>toggle("when")} style={seg("when",false,false)}
                onMouseEnter={e=>{if(drop!=="when")e.currentTarget.style.background="#f9fafb";}}
                onMouseLeave={e=>{if(drop!=="when")e.currentTarget.style.background=drop==="when"?"#f9fafb":"transparent";}}>
                <div style={{ fontSize:9.5, fontWeight:800, letterSpacing:"0.08em", textTransform:"uppercase", color:drop==="when"?BRAND:"#374151", marginBottom:3 }}>When</div>
                <div style={{ fontSize:13.5, color:whenLbl?"#111827":"#9ca3af", fontWeight:whenLbl?600:400 }}>
                  {whenLbl||"Any time"}
                </div>
              </button>
              {drop==="when" && <WhenPicker onSelect={handleDateSelect} onClose={()=>setDrop(null)}/>}
            </div>

            {/* WHO */}
            <div className="search-field search-who" style={{ position:"relative", flex:1 }}>
              <button className="search-segment-button" onClick={()=>toggle("who")} style={seg("who",false,true)}
                onMouseEnter={e=>{if(drop!=="who")e.currentTarget.style.background="#f9fafb";}}
                onMouseLeave={e=>{if(drop!=="who")e.currentTarget.style.background=drop==="who"?"#f9fafb":"transparent";}}>
                <div style={{ fontSize:9.5, fontWeight:800, letterSpacing:"0.08em", textTransform:"uppercase", color:drop==="who"?BRAND:"#374151", marginBottom:3 }}>Who</div>
                <div style={{ fontSize:13.5, color:whoLbl?"#111827":"#9ca3af", fontWeight:whoLbl?600:400, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {whoLbl||"Add guests"}
                </div>
              </button>
              {drop==="who" && <WhoDropdown onClose={()=>setDrop(null)} onSelect={handleGuestSelect}/>}
            </div>

            {/* Search button */}
            <div className="search-cta-wrap" style={{ display:"flex", alignItems:"center", padding:"5px 6px 5px 0", flexShrink:0 }}>
              <button className="search-submit" style={{ background:BRAND, color:"white", border:"none", borderRadius:50, padding:"11px 22px", display:"flex", alignItems:"center", gap:7, fontSize:14, fontWeight:700, cursor:"pointer", transition:"all .15s", boxShadow:`0 3px 10px rgba(186,0,54,.4)`, fontFamily:"inherit" }}
                onMouseEnter={e=>{e.currentTarget.style.background="#9a0028";e.currentTarget.style.boxShadow=`0 5px 16px rgba(186,0,54,.5)`;}}
                onMouseLeave={e=>{e.currentTarget.style.background=BRAND;e.currentTarget.style.boxShadow=`0 3px 10px rgba(186,0,54,.4)`;}}>
                <SearchIcon/> Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Become a Host Modal */}
      {showHostModal && (
        <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.5)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
          <div style={{ position:"relative", width:"100%", maxWidth:"900px", maxHeight:"90vh", overflow:"auto", pointerEvents:"auto", zIndex:10000 }}>
            <button onClick={() => setShowHostModal(false)} style={{ position:"absolute", top:"10px", right:"10px", width:"32px", height:"32px", borderRadius:"50%", background:"white", border:"1px solid #e5e7eb", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", zIndex:10001 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <BecomeHost />
          </div>
        </div>
      )}

      {/* Auth modal — shown when unauthenticated user clicks Become a host */}
      {showEmailModal && (
        <AuthModal
          onClose={() => setShowEmailModal(false)}
          onSuccess={async () => {
            setShowEmailModal(false);
            try { await auth?.refreshProfile(); } catch (e) {}
            navigate('/become-a-host');
          }}
          defaultTab="signup"
        />
      )}

    </div>
  );
}
