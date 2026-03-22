"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  Heart,
  Briefcase,
  MessageCircle,
  User,
  Settings,
  Globe,
  HelpCircle,
  UserPlus,
  Users,
  Gift,
  LogOut,
  Menu,
  Home,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileDropdownProps {
  isLoggedIn: boolean;
  onClose: () => void;
  onLogin: () => void;
  onLogout: () => void;
}

// ─── Guest Dropdown (logged out) ─────────────────────────────────────────────

function GuestDropdown({
  onClose,
  onLogin,
}: {
  onClose: () => void;
  onLogin: () => void;
}) {
  return (
    <div className="py-1">
      {/* Help Center */}
      <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left">
        <HelpCircle size={16} className="text-gray-400" />
        Help Center
      </button>

      <div className="h-px bg-gray-100 mx-4" />

      {/* Become a host — featured row */}
      <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left">
        <div>
          <p className="text-sm font-bold text-gray-900">Become a host</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-snug max-w-[160px]">
            It's easy to start hosting and earn extra income.
          </p>
        </div>
        {/* Host illustration */}
        <div className="flex-shrink-0 ml-2">
          <svg width="48" height="56" viewBox="0 0 48 56" fill="none">
            {/* Body */}
            <ellipse cx="24" cy="48" rx="10" ry="4" fill="#f0e6d3" opacity="0.4"/>
            {/* Legs */}
            <line x1="20" y1="40" x2="18" y2="50" stroke="#c8a882" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="26" y1="40" x2="28" y2="50" stroke="#c8a882" strokeWidth="2.5" strokeLinecap="round"/>
            {/* Torso / jacket */}
            <path d="M16 28 Q24 24 32 28 L30 42 Q24 44 18 42 Z" fill="#BA0036"/>
            {/* Left arm raised */}
            <path d="M16 30 Q10 24 8 18" stroke="#c8a882" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            {/* Right arm down */}
            <path d="M32 30 Q36 34 35 38" stroke="#c8a882" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            {/* Head */}
            <circle cx="24" cy="18" r="7" fill="#f5c5a3"/>
            {/* Hair */}
            <path d="M17 16 Q18 10 24 11 Q30 10 31 16" fill="#3d2b1f"/>
            {/* Face */}
            <circle cx="21.5" cy="18" r="1" fill="#3d2b1f"/>
            <circle cx="26.5" cy="18" r="1" fill="#3d2b1f"/>
            <path d="M21 22 Q24 24 27 22" stroke="#3d2b1f" strokeWidth="1" fill="none" strokeLinecap="round"/>
            {/* Hand wave */}
            <circle cx="8" cy="17" r="2.5" fill="#f5c5a3"/>
          </svg>
        </div>
      </button>

      <div className="h-px bg-gray-100 mx-4" />

      {/* Refer a Host */}
      <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left">
        <UserPlus size={16} className="text-gray-400" />
        Refer a Host
      </button>

      {/* Find a co-host */}
      <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left">
        <Users size={16} className="text-gray-400" />
        Find a co-host
      </button>

      {/* Gift cards */}
      <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left">
        <Gift size={16} className="text-gray-400" />
        Gift cards
      </button>

      <div className="h-px bg-gray-100 mx-4" />

      {/* Log in or sign up */}
      <button
        onClick={() => { onLogin(); onClose(); }}
        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors text-left"
      >
        Log in or sign up
      </button>
    </div>
  );
}

// ─── Logged-in Dropdown ───────────────────────────────────────────────────────

function LoggedInDropdown({
  onClose,
  onLogout,
}: {
  onClose: () => void;
  onLogout: () => void;
}) {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#BA0036,#ff6b6b)" }}
          >
            P
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900 leading-none">Welcome back</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Premium Member</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400"
        >
          <X size={13} />
        </button>
      </div>

      {/* Primary nav */}
      <div className="py-1.5">
        {[
          { icon: <Heart size={15} />, label: "Wishlists" },
          { icon: <Briefcase size={15} />, label: "Trips" },
          { icon: <MessageCircle size={15} />, label: "Messages" },
          { icon: <User size={14} />, label: "Profile", active: true },
        ].map(({ icon, label, active }) => (
          <button
            key={label}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
              active
                ? "bg-red-50 text-[#BA0036] font-semibold"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span className={active ? "text-[#BA0036]" : "text-gray-400"}>
              {icon}
            </span>
            {label}
          </button>
        ))}
      </div>

      <div className="h-px bg-gray-100 mx-4" />

      {/* Account */}
      <div className="py-1.5">
        {[
          { icon: <Settings size={15} />, label: "Account Settings" },
          { icon: <Globe size={15} />, label: "Language & Currency" },
          { icon: <HelpCircle size={15} />, label: "Help Center" },
        ].map(({ icon, label }) => (
          <button
            key={label}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
          >
            <span className="text-gray-400">{icon}</span>
            {label}
          </button>
        ))}
      </div>

      <div className="h-px bg-gray-100 mx-4" />

      {/* Hosting */}
      <div className="py-1.5">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-4 pt-1 pb-1">
          Hosting
        </p>
        {[
          { icon: <UserPlus size={15} />, label: "Refer a Host" },
          { icon: <Users size={15} />, label: "Find a Co-host" },
          { icon: <Gift size={15} />, label: "Gift Cards" },
        ].map(({ icon, label }) => (
          <button
            key={label}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
          >
            <span className="text-gray-400">{icon}</span>
            {label}
          </button>
        ))}
      </div>

      <div className="h-px bg-gray-100 mx-4" />

      {/* Log out */}
      <div className="py-1.5">
        <button
          onClick={() => { onLogout(); onClose(); }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#BA0036] hover:bg-red-50 transition-colors font-medium"
        >
          <LogOut size={15} className="text-[#BA0036]" />
          Log Out
        </button>
      </div>
    </div>
  );
}

// ─── Main Dropdown Shell ──────────────────────────────────────────────────────

function ProfileDropdown({
  isLoggedIn,
  onClose,
  onLogin,
  onLogout,
}: ProfileDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        ref={ref}
        className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
        style={{ animation: "ddIn .18s cubic-bezier(.16,1,.3,1) both" }}
      >
        <style>{`@keyframes ddIn{from{opacity:0;transform:translateY(-8px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
        {isLoggedIn ? (
          <LoggedInDropdown onClose={onClose} onLogout={onLogout} />
        ) : (
          <GuestDropdown onClose={onClose} onLogin={onLogin} />
        )}
      </div>
    </>
  );
}

// ─── Trigger Button (drop into your Navbar) ───────────────────────────────────

export function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 border rounded-full px-3 py-1.5 transition-all ${
          open ? "border-gray-400 shadow-md" : "border-gray-200 hover:shadow-sm"
        }`}
      >
        <Menu size={15} className="text-gray-600" />
        <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 overflow-hidden">
          {isLoggedIn ? (
            <span
              className="w-full h-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "linear-gradient(135deg,#BA0036,#ff6b6b)" }}
            >
              P
            </span>
          ) : (
            <User size={14} />
          )}
        </div>
      </button>

      {open && (
        <ProfileDropdown
          isLoggedIn={isLoggedIn}
          onClose={() => setOpen(false)}
          onLogin={() => setIsLoggedIn(true)}
          onLogout={() => setIsLoggedIn(false)}
        />
      )}
    </div>
  );
}
