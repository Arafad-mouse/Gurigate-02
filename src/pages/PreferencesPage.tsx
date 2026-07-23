import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Settings,
  Bell,
  Share2,
  Briefcase,
  Link,
  ChevronDown,
  Globe,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SidebarItem {
  label: string;
  icon: React.ReactNode;
}

type ThemeOption = "Light" | "Dark" | "System";

interface PreferencesState {
  language: string;
  currency: string;
  timezone: string;
  theme: ThemeOption;
  highContrast: boolean;
  reducedMotion: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const SIDEBAR_SECTIONS: Record<string, SidebarItem[]> = {
  "YOUR ACCOUNT": [
    { label: "Profile",       icon: <User size={15} /> },
    { label: "Preferences",   icon: <Settings size={15} /> },
    { label: "Notifications", icon: <Bell size={15} /> },
    { label: "Referrals",     icon: <Share2 size={15} /> },
    { label: "Last Trip",     icon: <Briefcase size={15} /> },
  ],
  "WORKSPACE": [
    { label: "General",      icon: <Settings size={15} /> },
    { label: "Integrations", icon: <Link size={15} /> },
  ],
};

const SECTION_SUBTITLES: Record<string, string> = {
  Profile:       "Personalize your profile settings and account preferences.",
  Preferences:   "Tailor your digital sanctuary to fit your lifestyle and accessibility needs.",
  Notifications: "Manage how and when GuriGate notifies you.",
  Referrals:     "Share GuriGate and earn rewards for every friend you bring.",
  "Last Trip":   "Review details and memories from your most recent stay.",
  General:       "Workspace-level settings for your account.",
  Integrations:  "Connect third-party tools and services to your account.",
};

const LANGUAGES  = ["English (US)", "English (UK)", "Somali", "Swahili", "French", "German", "Arabic"];
const CURRENCIES = ["USD ($)", "EUR (€)", "GBP (£)", "SOS (Sh)", "KES (KSh)", "ETB (Br)"];
const TIMEZONES  = [
  "(GMT+03:00) Africa/Nairobi",
  "(GMT+03:00) Africa/Mogadishu",
  "(GMT+00:00) UTC",
  "(GMT+01:00) Europe/London",
  "(GMT+02:00) Africa/Cairo",
  "(GMT+03:00) Asia/Riyadh",
  "(GMT-05:00) America/New_York",
  "(GMT-08:00) America/Los_Angeles",
];

const THEME_OPTIONS: {
  id: ThemeOption;
  icon: React.ReactNode;
  preview: React.ReactNode;
}[] = [
  {
    id: "Light",
    icon: <Sun size={13} className="text-amber-400" />,
    preview: (
      <div className="w-full h-24 rounded-xl overflow-hidden bg-white border border-gray-100 relative">
        <div className="h-4 bg-gray-50 border-b border-gray-100 px-2.5 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
          <div className="h-1 w-10 bg-gray-200 rounded" />
        </div>
        <div className="p-2.5 space-y-1.5">
          <div className="h-2 w-16 bg-gray-200 rounded" />
          <div className="h-2 w-24 bg-gray-100 rounded" />
          <div className="h-2 w-12 bg-gray-100 rounded" />
        </div>
        <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-red-400" />
      </div>
    ),
  },
  {
    id: "Dark",
    icon: <Moon size={13} className="text-indigo-400" />,
    preview: (
      <div
        className="w-full h-24 rounded-xl overflow-hidden relative"
        style={{ background: "#0f172a" }}
      >
        <div
          className="h-4 border-b flex items-center gap-1.5 px-2.5"
          style={{ background: "#1e293b", borderColor: "#334155" }}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#475569" }} />
          <div className="h-1 w-10 rounded" style={{ background: "#334155" }} />
        </div>
        <div className="p-2.5 space-y-1.5">
          <div className="h-2 w-16 rounded" style={{ background: "#334155" }} />
          <div className="h-2 w-24 rounded" style={{ background: "#1e293b" }} />
          <div className="h-2 w-12 rounded" style={{ background: "#1e293b" }} />
        </div>
        <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-red-600" />
      </div>
    ),
  },
  {
    id: "System",
    icon: <Monitor size={13} className="text-gray-400" />,
    preview: (
      <div className="w-full h-24 rounded-xl overflow-hidden flex">
        <div className="w-1/2 bg-white border-r border-gray-100 p-2.5 space-y-1.5">
          <div className="h-1.5 w-8 bg-gray-200 rounded" />
          <div className="h-1.5 w-12 bg-gray-100 rounded" />
          <div className="h-1.5 w-6 bg-gray-100 rounded" />
        </div>
        <div className="w-1/2 p-2.5 space-y-1.5" style={{ background: "#0f172a" }}>
          <div className="h-1.5 w-8 rounded" style={{ background: "#334155" }} />
          <div className="h-1.5 w-12 rounded" style={{ background: "#1e293b" }} />
          <div className="h-1.5 w-6 rounded" style={{ background: "#1e293b" }} />
        </div>
      </div>
    ),
  },
];

// ─── Reusable: Select Field ───────────────────────────────────────────────────
function SelectField({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full text-sm bg-white border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-red-600 appearance-none pr-8 text-gray-800 cursor-pointer transition-colors"
      >
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        <ChevronDown size={13} />
      </span>
    </div>
  );
}

// ─── Reusable: Toggle Switch ──────────────────────────────────────────────────
function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-1 ${
        checked ? "bg-red-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

// ─── Reusable: Section Header ─────────────────────────────────────────────────
function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="h-px w-6 bg-red-600 flex-shrink-0" />
      <span className="text-[11px] font-bold text-red-600 tracking-widest uppercase">
        {title}
      </span>
    </div>
  );
}

// ─── Reusable: Account Sidebar ────────────────────────────────────────────────
function AccountSidebar({
  activeSection,
  onSelect,
}: {
  activeSection: string;
  onSelect: (s: string) => void;
}) {
  return (
    <aside className="w-56 flex-shrink-0 bg-white rounded-2xl border border-gray-100 p-5 self-start sticky top-24">
      <div className="mb-5">
        <h2 className="text-base font-bold text-gray-900">Account</h2>
        <p className="text-xs text-gray-400 mt-0.5">Manage your editorial presence</p>
      </div>

      {Object.entries(SIDEBAR_SECTIONS).map(([section, items]) => (
        <div key={section} className="mb-4">
          <p className="text-[10px] font-bold text-red-600 tracking-widest uppercase mb-2">
            {section}
          </p>
          {items.map(({ label, icon }) => (
            <button
              key={label}
              onClick={() => onSelect(label)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm mb-0.5 transition-colors text-left ${
                activeSection === label
                  ? "bg-red-50 text-red-600 font-semibold"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className={activeSection === label ? "text-red-600" : "text-gray-400"}>
                {icon}
              </span>
              {label}
            </button>
          ))}
        </div>
      ))}
    </aside>
  );
}

// ─── Preferences Content ──────────────────────────────────────────────────────
function PreferencesContent() {
  const [prefs, setPrefs] = useState<PreferencesState>({
    language:     "English (US)",
    currency:     "USD ($)",
    timezone:     "(GMT+03:00) Africa/Nairobi",
    theme:        "Light",
    highContrast: false,
    reducedMotion: true,
  });

  const set = <K extends keyof PreferencesState>(key: K, value: PreferencesState[K]) =>
    setPrefs(p => ({ ...p, [key]: value }));

  return (
    <>
      {/* ── Global Preferences ── */}
      <section className="mb-7">
        <SectionHeader title="Global Preferences" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
              <Globe size={13} className="text-gray-400" /> Language
            </p>
            <SelectField
              value={prefs.language}
              onChange={v => set("language", v)}
              options={LANGUAGES}
            />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Currency</p>
            <SelectField
              value={prefs.currency}
              onChange={v => set("currency", v)}
              options={CURRENCIES}
            />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Time Zone</p>
            <SelectField
              value={prefs.timezone}
              onChange={v => set("timezone", v)}
              options={TIMEZONES}
            />
          </div>
        </div>
      </section>

      {/* ── Interface Appearance ── */}
      <section className="mb-7">
        <SectionHeader title="Interface Appearance" />
        <div className="grid grid-cols-3 gap-4">
          {THEME_OPTIONS.map(({ id, icon, preview }) => (
            <button
              key={id}
              onClick={() => set("theme", id)}
              className={`rounded-2xl border-2 p-3 text-left transition-all ${
                prefs.theme === id
                  ? "border-red-600 bg-white shadow-sm"
                  : "border-gray-100 bg-white hover:border-gray-200"
              }`}
            >
              {preview}
              <p
                className={`text-sm font-semibold mt-2.5 flex items-center gap-1.5 ${
                  prefs.theme === id ? "text-gray-900" : "text-gray-500"
                }`}
              >
                {icon} {id}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* ── Accessibility ── */}
      <section className="mb-8">
        <SectionHeader title="Accessibility" />
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between gap-6">
            <div>
              <p className="text-sm font-bold text-gray-900">High Contrast Mode</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Increase the contrast of text and interface elements for better visibility.
              </p>
            </div>
            <Toggle
              checked={prefs.highContrast}
              onChange={v => set("highContrast", v)}
            />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between gap-6">
            <div>
              <p className="text-sm font-bold text-gray-900">Reduced Motion</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Minimize animations and transitions throughout the interface.
              </p>
            </div>
            <Toggle
              checked={prefs.reducedMotion}
              onChange={v => set("reducedMotion", v)}
            />
          </div>
        </div>
      </section>

      {/* ── Footer Actions ── */}
      <div className="flex items-center justify-end gap-3 pb-8">
        <button
          onClick={() =>
            setPrefs({
              language: "English (US)",
              currency: "USD ($)",
              timezone: "(GMT+03:00) Africa/Nairobi",
              theme: "Light",
              highContrast: false,
              reducedMotion: true,
            })
          }
          className="text-sm font-semibold text-gray-500 hover:text-gray-700 px-5 py-2.5 transition-colors"
        >
          Discard Changes
        </button>
        <button className="text-sm font-bold bg-red-600 text-white px-7 py-2.5 rounded-full hover:bg-red-700 transition-colors shadow-sm">
          Save Changes
        </button>
      </div>
    </>
  );
}

// ─── Coming Soon Placeholder ──────────────────────────────────────────────────
function ComingSoon({ section }: { section: string }) {
  const item = Object.values(SIDEBAR_SECTIONS).flat().find(i => i.label === section);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
        {item?.icon}
      </div>
      <p className="text-sm font-semibold text-gray-400">{section} settings coming soon</p>
    </div>
  );
}

// ─── Preferences Page (exported) ─────────────────────────────────────────────
export function PreferencesPage({ onNavigate }: { onNavigate?: (section: string) => void }) {
  const [activeSection, setActiveSection] = useState("Preferences");
  const navigate = useNavigate();

  const handleSelect = (section: string) => {
    if (section === "Notifications") {
      navigate("/notifications");
    } else {
      setActiveSection(section);
      onNavigate?.(section);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="flex max-w-7xl mx-auto w-full px-4 py-8 gap-6">

        {/* Sidebar */}
        <AccountSidebar
          activeSection={activeSection}
          onSelect={handleSelect}
        />

        {/* Main */}
        <main className="flex-1 min-w-0">
          {/* Page header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{activeSection}</h1>
            <p className="text-sm text-gray-400 mt-1">
              {SECTION_SUBTITLES[activeSection]}
            </p>
          </div>

          {/* Section content */}
          <div
            key={activeSection}
            style={{ animation: "prefFadeIn .15s ease both" }}
          >
            <style>{`
              @keyframes prefFadeIn {
                from { opacity: 0; transform: translateY(5px); }
                to   { opacity: 1; transform: translateY(0); }
              }
            `}</style>

            {activeSection === "Preferences"
              ? <PreferencesContent />
              : <ComingSoon section={activeSection} />
            }
          </div>
        </main>

      </div>
    </div>
  );
}

export default PreferencesPage;
