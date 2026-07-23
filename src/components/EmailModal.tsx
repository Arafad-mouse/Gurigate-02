"use client";

import { useState, useRef, useEffect } from "react";
import { X, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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

// ─── OAuth Handlers ─────────────────────────────────────────────────────────────

const handleGoogleAuth = async () => {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) console.error("Google auth error:", error);
};

const handleFacebookAuth = async () => {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "facebook",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) console.error("Facebook auth error:", error);
};

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "email" | "password" | "verify";

interface EmailModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

// ─── Step 1: Email Entry ────────────────────────────────────────────────────────

function EmailStep({
  onContinue,
}: {
  onContinue: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const valid = email.includes("@") && email.includes(".");
  const supabase = createClient();

  const handleEmailContinue = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });
      
      if (error) throw error;
      onContinue(email);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Welcome to GuriGate</h1>

      {/* Floating label email input */}
      <div className={`relative border rounded-xl px-4 pt-5 pb-2.5 mb-4 transition-all ${focused ? "border-2 border-gray-900" : "border border-gray-300"}`}>
        <label className="absolute top-2 left-4 text-[10px] font-medium text-gray-500 pointer-events-none">Email</label>
        <input
          type="email"
          placeholder="Email"
          value={email}
          autoFocus
          onChange={(e) => setEmail(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => { if (e.key === "Enter" && valid) onContinue(email); }}
          className="w-full text-sm text-gray-900 bg-transparent outline-none placeholder:text-gray-400"
        />
      </div>

      {/* Error display */}
      {error && (
        <p className="text-xs text-red-500 mb-4">{error}</p>
      )}

      <button
        onClick={handleEmailContinue}
        disabled={!valid || loading}
        className="w-full py-3.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed mb-5"
        style={{ background: "linear-gradient(135deg,#E8344E,#c9263f)" }}
      >
        {loading ? (
          <svg className="animate-spin w-4 h-4 mx-auto" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" />
          </svg>
        ) : (
          "Continue"
        )}
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium">or</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <div className="flex flex-col gap-3">
        <SocialBtn icon={<GoogleIcon />} label="Continue with Google" onClick={handleGoogleAuth} />
        <SocialBtn icon={<AppleIcon />} label="Continue with Apple" onClick={handleGoogleAuth} />
        <SocialBtn icon={<FacebookIcon />} label="Continue with Facebook" onClick={handleFacebookAuth} />
      </div>
    </div>
  );
}

// ─── Step 2: Password Entry ───────────────────────────────────────────────────

function PasswordStep({
  email,
  onContinue,
}: {
  email: string;
  onContinue: (password: string) => void;
}) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  const valid = password.length >= 8;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Enter your password</h1>
      <p className="text-sm text-gray-600 mb-6">
        Welcome back! Please enter your password for{" "}
        <span className="font-semibold text-gray-900">{email}</span>
      </p>

      {/* Password input with show/hide */}
      <div className={`relative border rounded-xl px-4 py-3 mb-4 transition-all ${focused ? "border-2 border-gray-900" : "border border-gray-300"}`}>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          autoFocus
          onChange={(e) => setPassword(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => { if (e.key === "Enter" && valid) onContinue(password); }}
          className="w-full text-sm text-gray-900 bg-transparent outline-none placeholder:text-gray-400 pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 accent-[#E8344E]" />
          <span>Remember me</span>
        </label>
        <button className="text-sm font-semibold text-[#E8344E] hover:text-[#c9263f] transition-colors">
          Forgot password?
        </button>
      </div>

      <button
        onClick={() => valid && onContinue(password)}
        disabled={!valid}
        className="w-full py-3.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: "linear-gradient(135deg,#E8344E,#c9263f)" }}
      >
        Sign in
      </button>
    </div>
  );
}

// ─── Step 3: Email Verification ───────────────────────────────────────────────

function VerifyStep({
  email,
  onSuccess,
}: {
  email: string;
  onSuccess: () => void;
}) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const supabase = createClient();

  const handleChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...code];
    next[i] = val;
    setCode(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
    if (next.every((c) => c !== "")) {
      // Auto-verify when all digits are entered
      verifyCode(next.join(""));
    }
  };

  const verifyCode = async (fullCode: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: fullCode,
        type: "email",
      });
      
      if (error) throw error;
      setTimeout(onSuccess, 300);
    } catch (err: any) {
      setError(err.message ?? "Invalid code. Please try again.");
      // Clear the code on error
      setCode(["", "", "", "", "", ""]);
      refs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
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
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(""));
      verifyCode(pasted);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Enter your verification code</h1>
      <p className="text-sm text-gray-600 mb-7 leading-relaxed">
        Enter the code we emailed to{" "}
        <span className="font-semibold text-gray-900">{email}</span>.
      </p>

      {/* Error display */}
      {error && (
        <p className="text-xs text-red-500 mb-4">{error}</p>
      )}

      {/* 6-box code input */}
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
            disabled={loading}
            className={`flex-1 h-14 text-center text-xl font-semibold border rounded-xl outline-none transition-all bg-white text-gray-900 caret-transparent ${
              loading ? "border-gray-200 text-gray-400" : "border-gray-300 focus:border-2 focus:border-gray-900"
            }`}
          />
        ))}
      </div>

      <p className="text-sm text-gray-600">
        Didn't get an email?{" "}
        <button
          onClick={() => { 
            setCode(["", "", "", "", "", ""]); 
            setError(null); 
            refs.current[0]?.focus(); 
          }}
          disabled={loading}
          className="font-semibold underline underline-offset-2 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Try again
        </button>
      </p>
    </div>
  );
}

function SocialBtn({ icon, label, bold = false, onClick }: { icon: React.ReactNode; label: string; bold?: boolean; onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-gray-50 ${bold ? "border border-gray-900" : "border border-gray-200"}`}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className={`flex-1 text-center text-sm ${bold ? "font-semibold text-gray-900" : "text-gray-600"}`}>
        {label}
      </span>
    </button>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function EmailModal({ onClose, onSuccess }: EmailModalProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
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
    email:    "Log in or sign up",
    password: "Welcome back",
    verify:   "Confirm account",
  };

  const goBack = () => {
    if (step === "verify") setStep("password");
    else if (step === "password") setStep("email");
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
            onClick={step === "email" ? onClose : goBack}
            className="absolute left-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            {step === "email"
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
        {step === "email" && (
          <EmailStep
            onContinue={(e) => {
              setEmail(e);
              setStep("password");
            }}
          />
        )}
        {step === "password" && (
          <PasswordStep
            email={email}
            onContinue={() => {
              setStep("verify");
            }}
          />
        )}
        {step === "verify" && (
          <VerifyStep
            email={email}
            onSuccess={() => { onSuccess(); onClose(); }}
          />
        )}
      </div>
    </div>
  );
}

// ─── Usage ────────────────────────────────────────────────────────────────────
//
// const [showEmail, setShowEmail] = useState(false);
// const [isLoggedIn, setIsLoggedIn] = useState(false);
//
// {showEmail && (
//   <EmailModal
//     onClose={() => setShowEmail(false)}
//     onSuccess={() => setIsLoggedIn(true)}
//   />
// )}
//
// Trigger from PhoneModal "Continue with email" button:
// onClick={() => { setShowEmail(true); onClose(); }}
