"use client";

import { useState } from "react";
import { Search, Globe, Home } from "lucide-react";
import { ProfileMenu } from "./ProfileMenu";

// ─── Types ────────────────────────────────────────────────────────────────────

// Props can be added later if needed for external auth state management

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
        <button className="w-9 h-9 bg-[#E8344E] rounded-full flex items-center justify-center hover:bg-[#d02d44] transition-colors flex-shrink-0" aria-label="Search properties">
          <Search size={14} className="text-white" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────

export function CompactNavbar() {
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
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors" aria-label="Language settings">
            <Globe size={17} className="text-gray-600" />
          </button>

          {/* Profile Menu */}
          <ProfileMenu />
        </div>

      </div>
    </nav>
  );
}
