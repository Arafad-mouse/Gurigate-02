"use client";

import { useState, useRef, useEffect } from "react";
import { X, Eye, EyeOff, ArrowLeft } from "lucide-react";
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

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

// ─── OAuth Handlers ───────────────────────────────────────────────────────────

const handleGoogleAuth = async () => {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
  if (error) console.error("Google auth error:", error);
};

const handleFacebookAuth = async () => {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "facebook",
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
  if (error) console.error("Facebook auth error:", error);
};

// ─── Shared Components ────────────────────────────────────────────────────────

function SocialBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="flex-1 text-center text-sm text-gray-600">{label}</span>
    </button>
  );
}

function PasswordInput({
  value,
  onChange,
  placeholder,
  onKeyDown,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-2 focus:border-gray-900 transition-all bg-white pr-11"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

// ─── Verify Step (email OTP after signup) ─────────────────────────────────────

function VerifyEmailStep({ email, onSuccess, onBack }: { email: string; onSuccess: () => void; onBack: () => void }) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const supabase = createClient();

  const verifyCode = async (fullCode: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: fullCode, type: "signup" });
      if (error) throw error;
      setTimeout(onSuccess, 300);
    } catch (err: any) {
      setError(err.message ?? "Invalid code. Please try again.");
      setCode(["", "", "", "", "", ""]);
      refs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...code];
    next[i] = val;
    setCode(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
    if (next.every((c) => c !== "")) verifyCode(next.join(""));
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
    if (pasted.length === 6) { setCode(pasted.split("")); verifyCode(pasted); }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
      <p className="text-sm text-gray-600 mb-7 leading-relaxed">
        We sent a verification code to{" "}
        <span className="font-semibold text-gray-900">{email}</span>.
      </p>

      {error && <p className="text-xs text-red-500 mb-4">{error}</p>}

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
            aria-label={`Verification code digit ${i + 1}`}
            title={`Enter digit ${i + 1} of verification code`}
            placeholder="•"
            className={`flex-1 h-14 text-center text-xl font-semibold border rounded-xl outline-none transition-all bg-white text-gray-900 caret-transparent ${
              loading ? "border-gray-200 text-gray-400" : "border-gray-300 focus:border-2 focus:border-gray-900"
            }`}
          />
        ))}
      </div>

      <p className="text-sm text-gray-600">
        Didn't receive it?{" "}
        <button onClick={onBack} className="font-semibold underline underline-offset-2 hover:text-gray-900 transition-colors">
          Go back
        </button>
      </p>
    </div>
  );
}

// ─── Login Tab ────────────────────────────────────────────────────────────────

function LoginForm({ onSuccess, onSwitchToSignup }: { onSuccess: () => void; onSwitchToSignup: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const valid = email.includes("@") && email.includes(".") && password.length >= 6;

  const handleLogin = async () => {
    if (!valid) return;
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      onSuccess();
    } catch (err: any) {
      setError(err.message ?? "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-4">
      <div>
        <label htmlFor="login-email" className="sr-only">Email address</label>
        <input
          id="login-email"
          type="email"
          placeholder="Email address"
          value={email}
          autoFocus
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleLogin(); }}
          className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-2 focus:border-gray-900 transition-all bg-white"
        />
      </div>
      <PasswordInput
        value={password}
        onChange={setPassword}
        placeholder="Password"
        onKeyDown={(e) => { if (e.key === "Enter") handleLogin(); }}
        aria-label="Password"
      />

      {error && <p className="text-xs text-red-500 -mt-2">{error}</p>}

      <button
        onClick={handleLogin}
        disabled={!valid || loading}
        className="w-full py-3.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: "linear-gradient(135deg,#BA0036,#9a0028)" }}
      >
        {loading ? (
          <svg className="animate-spin w-4 h-4 mx-auto" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" />
          </svg>
        ) : "Log in"}
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium">or</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <div className="flex flex-col gap-3">
        <SocialBtn icon={<GoogleIcon />} label="Continue with Google" onClick={handleGoogleAuth} />
        <SocialBtn icon={<FacebookIcon />} label="Continue with Facebook" onClick={handleFacebookAuth} />
      </div>

      <p className="text-center text-sm text-gray-500 mt-1">
        Don't have an account?{" "}
        <button onClick={onSwitchToSignup} className="font-semibold text-[#BA0036] hover:underline transition-colors">
          Sign up
        </button>
      </p>
    </div>
  );
}

// ─── Signup Tab ───────────────────────────────────────────────────────────────

function SignupForm({
  onVerify,
  onSwitchToLogin,
}: {
  onVerify: (email: string) => void;
  onSwitchToLogin: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const valid =
    fullName.trim().length >= 2 &&
    email.includes("@") &&
    email.includes(".") &&
    password.length >= 8 &&
    password === confirm;

  const handleSignup = async () => {
    if (!valid) return;
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      if (error) throw error;
      onVerify(email);
    } catch (err: any) {
      setError(err.message ?? "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-3">
      <label htmlFor="signup-fullname" className="sr-only">Full name</label>
      <input
        id="signup-fullname"
        type="text"
        placeholder="Full name"
        value={fullName}
        autoFocus
        onChange={(e) => setFullName(e.target.value)}
        className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-2 focus:border-gray-900 transition-all bg-white"
      />
      <label htmlFor="signup-email" className="sr-only">Email address</label>
      <input
        id="signup-email"
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-3.5 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-2 focus:border-gray-900 transition-all bg-white"
      />
      <PasswordInput value={password} onChange={setPassword} placeholder="Password (min. 8 characters)" aria-label="Password" />
      <PasswordInput
        value={confirm}
        onChange={setConfirm}
        placeholder="Confirm password"
        onKeyDown={(e) => { if (e.key === "Enter") handleSignup(); }}
        aria-label="Confirm password"
      />

      {confirm && password !== confirm && (
        <p className="text-xs text-red-500 -mt-1">Passwords do not match.</p>
      )}
      {error && <p className="text-xs text-red-500 -mt-1">{error}</p>}

      <button
        onClick={handleSignup}
        disabled={!valid || loading}
        className="w-full py-3.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed mt-1"
        style={{ background: "linear-gradient(135deg,#BA0036,#9a0028)" }}
      >
        {loading ? (
          <svg className="animate-spin w-4 h-4 mx-auto" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" />
          </svg>
        ) : "Create account"}
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium">or</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <div className="flex flex-col gap-3">
        <SocialBtn icon={<GoogleIcon />} label="Sign up with Google" onClick={handleGoogleAuth} />
        <SocialBtn icon={<FacebookIcon />} label="Sign up with Facebook" onClick={handleFacebookAuth} />
      </div>

      <p className="text-center text-sm text-gray-500 mt-1">
        Already have an account?{" "}
        <button onClick={onSwitchToLogin} className="font-semibold text-[#BA0036] hover:underline transition-colors">
          Log in
        </button>
      </p>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
  defaultTab?: "login" | "signup";
}

type Screen = "main" | "verify";

export function AuthModal({ onClose, onSuccess, defaultTab = "login" }: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "signup">(defaultTab);
  const [screen, setScreen] = useState<Screen>("main");
  const [verifyEmail, setVerifyEmail] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleVerify = (email: string) => {
    setVerifyEmail(email);
    setScreen("verify");
  };

  const title = screen === "verify"
    ? "Verify your email"
    : tab === "login" ? "Log in to GuriGate" : "Create your account";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)" }}
    >
      <style>{`@keyframes authModalIn{from{opacity:0;transform:translateY(20px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
      <div
        ref={ref}
        className="bg-white w-full max-w-[480px] rounded-2xl shadow-2xl overflow-hidden"
        style={{ animation: "authModalIn .22s cubic-bezier(.16,1,.3,1) both" }}
      >
        {/* Header */}
        <div className="relative flex items-center justify-center py-4 border-b border-gray-100">
          <button
            onClick={screen === "verify" ? () => setScreen("main") : onClose}
            className="absolute left-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            {screen === "verify"
              ? <ArrowLeft size={16} className="text-gray-600" />
              : <X size={16} className="text-gray-600" />
            }
          </button>
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        </div>

        {/* Tab switcher — only on main screen */}
        {screen === "main" && (
          <div className="flex border-b border-gray-100">
            {(["login", "signup"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                  tab === t
                    ? "text-[#BA0036] border-b-2 border-[#BA0036]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t === "login" ? "Log in" : "Sign up"}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {screen === "verify" ? (
          <VerifyEmailStep
            email={verifyEmail}
            onSuccess={() => { onSuccess(); onClose(); }}
            onBack={() => setScreen("main")}
          />
        ) : tab === "login" ? (
          <LoginForm
            onSuccess={() => { onSuccess(); onClose(); }}
            onSwitchToSignup={() => setTab("signup")}
          />
        ) : (
          <SignupForm
            onVerify={handleVerify}
            onSwitchToLogin={() => setTab("login")}
          />
        )}
      </div>
    </div>
  );
}
