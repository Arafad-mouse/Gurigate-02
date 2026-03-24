"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Globe, Menu, User, Home } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CompactNavbarProps {
  onLoginClick?: () => void;
  isLoggedIn?: boolean;
  onLogout?: () => void;
  userName?: string;
}

// ─── Pill Search Bar ──────────────────────────────────────────────────────────

function PillSearch() {
  const [active, setActive] = useState<"where" | "when" | "guests" | null>(null);

  return (
    <div className="flex items-center border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-shadow duration-200 bg-white divide-x divide-gray-200">
      {/* Where */}
      <button
        onClick={() => setActive(active === "where" ? null : "where")}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm transition-colors ${
          active === "where" ? "bg-gray-100" : "hover:bg-gray-50"
        }`}
      >
        {/* Mini building icon */}
        <span className="text-base">🏠</span>
        <span className={`font-semibold ${active === "where" ? "text-gray-900" : "text-gray-700"}`}>
          Anywhere
        </span>
      </button>

      {/* When */}
      <button
        onClick={() => setActive(active === "when" ? null : "when")}
        className={`px-5 py-2.5 rounded-full text-sm transition-colors ${
          active === "when" ? "bg-gray-100" : "hover:bg-gray-50"
        }`}
      >
        <span className={`font-semibold ${active === "when" ? "text-gray-900" : "text-gray-700"}`}>
          Any week
        </span>
      </button>

      {/* Add guests + Search button */}
      <div className="flex items-center gap-2 pl-5 pr-2 py-1.5 rounded-full">
        <button
          onClick={() => setActive(active === "guests" ? null : "guests")}
          className="text-sm text-gray-400 font-medium hover:text-gray-600 transition-colors"
        >
          Add guests
        </button>
        <button className="w-9 h-9 bg-[#E8344E] rounded-full flex items-center justify-center hover:bg-[#d02d44] transition-colors flex-shrink-0">
          <Search size={14} className="text-white" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

// ─── Profile Dropdown ─────────────────────────────────────────────────────────

function ProfileDropdown({
  isLoggedIn,
  onClose,
  onLoginClick,
  onLogout,
}: {
  isLoggedIn: boolean;
  onClose: () => void;
  onLoginClick: () => void;
  onLogout: () => void;
}) {
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
        className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
        style={{ animation: "ddIn .18s cubic-bezier(.16,1,.3,1) both" }}
      >
        <style>{`@keyframes ddIn{from{opacity:0;transform:translateY(-8px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>

        {isLoggedIn ? (
          <>
            <div className="py-1.5">
              {["Wishlists", "Trips", "Messages", "Profile"].map((item) => (
                <button key={item} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  {item}
                </button>
              ))}
            </div>
            <div className="h-px bg-gray-100 mx-4" />
            <div className="py-1.5">
              {["Account Settings", "Language & Currency", "Help Center"].map((item) => (
                <button key={item} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  {item}
                </button>
              ))}
            </div>
            <div className="h-px bg-gray-100 mx-4" />
            <div className="py-1.5">
              <button onClick={() => { onLogout(); onClose(); }}
                className="w-full text-left px-4 py-2.5 text-sm text-[#E8344E] hover:bg-red-50 transition-colors font-medium">
                Log out
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="py-1.5">
              <button onClick={() => { onLoginClick(); onClose(); }}
                className="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors">
                Log in
              </button>
              <button onClick={() => { onLoginClick(); onClose(); }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                Sign up
              </button>
            </div>
            <div className="h-px bg-gray-100 mx-4" />
            <div className="py-1.5">
              {["Become a host", "Help Center"].map((item) => (
                <button key={item} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  {item}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────

export function CompactNavbar({
  onLoginClick = () => {},
  isLoggedIn = false,
  onLogout = () => {},
  userName = "",
}: CompactNavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const avatarLetter = userName?.[0]?.toUpperCase() ?? "G";

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between gap-4">

        {/* ── Logo ── */}
        <a href="/" className="flex items-center gap-2 flex-shrink-0 group">
          <div className="w-8 h-8 bg-[#E8344E] rounded-full flex items-center justify-center shadow-sm group-hover:bg-[#d02d44] transition-colors">
            <Home size={15} className="text-white" />
          </div>
          <span className="text-xl font-extrabold text-[#E8344E] tracking-tight hidden sm:block">
            gurigate
          </span>
        </a>

        {/* ── Pill Search ── */}
        <div className="flex-1 flex justify-center">
          <PillSearch />
        </div>

        {/* ── Right actions ── */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Become a host */}
          <a
            href="#"
            className="hidden lg:block text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-4 py-2.5 rounded-full transition-colors whitespace-nowrap"
          >
            Become a host
          </a>

          {/* Language / Globe */}
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <Globe size={17} className="text-gray-600" />
          </button>

          {/* Profile menu trigger */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className={`flex items-center gap-2.5 border rounded-full pl-3 pr-1.5 py-1.5 transition-all ${
                menuOpen ? "border-gray-400 shadow-md" : "border-gray-200 hover:shadow-sm"
              }`}
            >
              <Menu size={15} className="text-gray-600" />
              {/* Avatar */}
              {isLoggedIn ? (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#E8344E,#ff6b6b)" }}
                >
                  {avatarLetter}
                </div>
              ) : (
                <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={15} className="text-white" />
                </div>
              )}
            </button>

            {menuOpen && (
              <ProfileDropdown
                isLoggedIn={isLoggedIn}
                onClose={() => setMenuOpen(false)}
                onLoginClick={onLoginClick}
                onLogout={onLogout}
              />
            )}
          </div>
        </div>

      </div>
    </nav>
  );
}
