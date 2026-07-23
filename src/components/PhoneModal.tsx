"use client";

import { useState, useRef, useEffect } from "react";
import { X, ArrowLeft, ChevronDown, Mail } from "lucide-react";

// ─── Icons ────────────────────────────────────────────────────────────────────

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

// ─── Country Data ─────────────────────────────────────────────────────────────

const COUNTRIES = [
  { name: "Somalia",        code: "+252", flag: "🇸🇴" },
  { name: "Kenya",          code: "+254", flag: "🇰🇪" },
  { name: "Ethiopia",       code: "+251", flag: "🇪🇹" },
  { name: "Tanzania",       code: "+255", flag: "🇹🇿" },
  { name: "Uganda",         code: "+256", flag: "🇺🇬" },
  { name: "Rwanda",         code: "+250", flag: "🇷🇼" },
  { name: "Djibouti",       code: "+253", flag: "🇩🇯" },
  { name: "United States",  code: "+1",   flag: "🇺🇸" },
  { name: "United Kingdom", code: "+44",  flag: "🇬🇧" },
  { name: "UAE",            code: "+971", flag: "🇦🇪" },
  { name: "Malaysia",       code: "+60",  flag: "🇲🇾" },
  { name: "Canada",         code: "+1",   flag: "🇨🇦" },
  { name: "Australia",      code: "+61",  flag: "🇦🇺" },
  { name: "Germany",        code: "+49",  flag: "🇩🇪" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "phone" | "verify";

interface PhoneModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

// ─── Step 1: Phone Entry ──────────────────────────────────────────────────────

function PhoneStep({
  onContinue,
}: {
  onContinue: (phone: string, country: typeof COUNTRIES[0]) => void;
}) {
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [phone, setPhone] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const pickerRef = useRef<HTMLDivElement>(null);

  const filtered = search
    ? COUNTRIES.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.includes(search)
      )
    : COUNTRIES;

  // Close picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const valid = phone.replace(/\D/g, "").length >= 6;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Welcome to GuriGate</h1>

      {/* Country + Phone fused input */}
      <div className="mb-3">
        {/* Country selector */}
        <div className="relative" ref={pickerRef}>
          <button
            onClick={() => { setPickerOpen(!pickerOpen); setSearch(""); }}
            className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-t-xl hover:border-gray-400 transition-colors bg-white text-left"
          >
            <div>
              <p className="text-[10px] text-gray-500 leading-none mb-0.5 font-medium">Country code</p>
              <p className="text-sm font-medium text-gray-900">
                {country.flag} {country.name} ({country.code})
              </p>
            </div>
            <ChevronDown
              size={18}
              className={`text-gray-500 transition-transform duration-200 flex-shrink-0 ${pickerOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Country picker dropdown */}
          {pickerOpen && (
            <div className="absolute left-0 right-0 top-full bg-white border border-gray-200 border-t-0 rounded-b-xl shadow-xl z-20 overflow-hidden">
              {/* Search */}
              <div className="p-2 border-b border-gray-100">
                <input
                  type="text"
                  placeholder="Search country or code…"
                  value={search}
                  autoFocus
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-gray-400 placeholder:text-gray-400"
                />
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filtered.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => { setCountry(c); setPickerOpen(false); setSearch(""); }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors text-left ${
                      country.name === c.name ? "bg-gray-50 font-semibold" : ""
                    }`}
                  >
                    <span className="text-gray-800">{c.flag} {c.name}</span>
                    <span className="text-gray-400 text-xs">{c.code}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Phone number input */}
        <input
          type="tel"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && valid) onContinue(phone, country); }}
          className="w-full px-4 py-3.5 border border-t-0 border-gray-300 rounded-b-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-500 transition-colors bg-white"
        />
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-500 leading-relaxed mb-4">
        We'll call or text you to confirm your number. Standard message and data rates apply.{" "}
        <button className="font-semibold underline underline-offset-1 hover:text-gray-700 transition-colors">
          Privacy Policy
        </button>
      </p>

      {/* Continue */}
      <button
        onClick={() => valid && onContinue(phone, country)}
        disabled={!valid}
        className="w-full py-3.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed mb-5"
        style={{ background: "linear-gradient(135deg,#E8344E,#c9263f)" }}
      >
        Continue
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium">or</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Social buttons */}
      <div className="flex flex-col gap-3">
        <SocialBtn icon={<GoogleIcon />} label="Continue with Google" />
        <SocialBtn icon={<AppleIcon />} label="Continue with Apple" />
        <SocialBtn icon={<Mail size={18} className="text-gray-700" />} label="Continue with email" />
        <SocialBtn icon={<FacebookIcon />} label="Continue with Facebook" />
      </div>
    </div>
  );
}

function SocialBtn({ icon, label, bold = false }: { icon: React.ReactNode; label: string; bold?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-gray-50 ${bold ? "border border-gray-900" : "border border-gray-200"}`}>
      <span className="flex-shrink-0">{icon}</span>
      <span className={`flex-1 text-center text-sm ${bold ? "font-semibold text-gray-900" : "text-gray-600"}`}>
        {label}
      </span>
    </button>
  );
}

// ─── Step 2: OTP Verification ─────────────────────────────────────────────────

function VerifyStep({
  phone,
  country,
  onSuccess,
}: {
  phone: string;
  country: typeof COUNTRIES[0];
  onSuccess: () => void;
}) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...code];
    next[i] = val;
    setCode(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
    if (next.every((c) => c !== "")) setTimeout(onSuccess, 300);
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      const next = [...code];
      next[i - 1] = "";
      setCode(next);
      refs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(""));
      setTimeout(onSuccess, 400);
    }
  };

  const maskedPhone = `${country.code} ${"•".repeat(Math.max(0, phone.length - 3))}${phone.slice(-3)}`;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Enter your verification code</h1>
      <p className="text-sm text-gray-600 mb-7 leading-relaxed">
        Enter the code we sent to{" "}
        <span className="font-semibold text-gray-900">{maskedPhone}</span>.
      </p>

      {/* 6-box OTP */}
      <div className="flex gap-2 mb-6" onPaste={handlePaste}>
        {code.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            autoFocus={i === 0}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="flex-1 h-14 text-center text-xl font-semibold border border-gray-300 rounded-xl outline-none focus:border-2 focus:border-gray-900 transition-all bg-white text-gray-900 caret-transparent"
          />
        ))}
      </div>

      <p className="text-sm text-gray-600">
        Didn't get a code?{" "}
        <button
          onClick={() => { setCode(["", "", "", "", "", ""]); refs.current[0]?.focus(); }}
          className="font-semibold underline underline-offset-2 hover:text-gray-900 transition-colors"
        >
          Try again
        </button>
      </p>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function PhoneModal({ onClose, onSuccess }: PhoneModalProps) {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState(COUNTRIES[0]);
  const ref = useRef<HTMLDivElement>(null);

  // Close on backdrop click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const titles: Record<Step, string> = {
    phone:  "Log in or sign up",
    verify: "Confirm account",
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }}
    >
      <div
        ref={ref}
        className="bg-white w-full max-w-[540px] rounded-2xl shadow-2xl overflow-hidden"
        style={{ animation: "modalIn .2s cubic-bezier(.16,1,.3,1) both" }}
      >
        <style>{`@keyframes modalIn{from{opacity:0;transform:translateY(16px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>

        {/* Header */}
        <div className="relative flex items-center justify-center py-4 border-b border-gray-200">
          <button
            onClick={step === "phone" ? onClose : () => setStep("phone")}
            className="absolute left-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            {step === "phone"
              ? <X size={16} className="text-gray-600" />
              : <ArrowLeft size={16} className="text-gray-600" />
            }
          </button>

          <h2 className="text-sm font-semibold text-gray-900">{titles[step]}</h2>

          {step === "verify" && (
            <button
              onClick={onClose}
              className="absolute right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={16} className="text-gray-600" />
            </button>
          )}
        </div>

        {/* Steps */}
        {step === "phone" && (
          <PhoneStep
            onContinue={(p, c) => {
              setPhone(p);
              setCountry(c);
              setStep("verify");
            }}
          />
        )}
        {step === "verify" && (
          <VerifyStep
            phone={phone}
            country={country}
            onSuccess={() => { onSuccess(); onClose(); }}
          />
        )}
      </div>
    </div>
  );
}

// ─── Usage ────────────────────────────────────────────────────────────────────
//
// const [showPhone, setShowPhone] = useState(false);
// const [isLoggedIn, setIsLoggedIn] = useState(false);
//
// {showPhone && (
//   <PhoneModal
//     onClose={() => setShowPhone(false)}
//     onSuccess={() => setIsLoggedIn(true)}
//   />
// )}
//
// Trigger from ProfileMenu guest dropdown "Continue with Phone" button:
// onClick={() => { setShowPhone(true); onClose(); }}
