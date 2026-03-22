import { useState } from "react";
import {
  User, Settings, Bell, Share2, Briefcase, Link,
  Mail, MessageSquare, Smartphone,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SidebarItem { label: string; icon: React.ReactNode; }

interface NotificationState {
  // Email
  emailActivity:    boolean;
  emailNews:        boolean;
  emailTips:        boolean;
  // Push
  pushInstant:      boolean;
  pushReminders:    boolean;
  pushProduct:      boolean;
  // SMS
  smsSecurityAlerts:   boolean;
  smsPromotional:      boolean;
  // Marketing
  marketingPersonalized: boolean;
  marketingPartner:      boolean;
}

// ─── Sidebar Config ───────────────────────────────────────────────────────────
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
  Notifications: "Choose how you want to be contacted and what updates you want to receive.",
  Referrals:     "Share GuriGate and earn rewards for every friend you bring.",
  "Last Trip":   "Review details and memories from your most recent stay.",
  General:       "Workspace-level settings for your account.",
  Integrations:  "Connect third-party tools and services to your account.",
};

// ─── Reusable: Toggle ─────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-1 ${
        checked ? "bg-red-500" : "bg-gray-200"
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
      <span className="text-[11px] font-bold text-gray-400 tracking-widest uppercase">
        {title}
      </span>
    </div>
  );
}

// ─── Reusable: Toggle Row ─────────────────────────────────────────────────────
function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-1">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-800 leading-snug">{label}</p>
        {description && (
          <p className="text-xs text-gray-400 mt-0.5 leading-snug">{description}</p>
        )}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

// ─── Notifications Content ────────────────────────────────────────────────────
export function NotificationsContent() {
  const [state, setState] = useState<NotificationState>({
    emailActivity:         true,
    emailNews:             false,
    emailTips:             true,
    pushInstant:           true,
    pushReminders:         true,
    pushProduct:           false,
    smsSecurityAlerts:     true,
    smsPromotional:        false,
    marketingPersonalized: true,
    marketingPartner:      false,
  });

  const set = <K extends keyof NotificationState>(key: K, value: boolean) =>
    setState(p => ({ ...p, [key]: value }));

  const defaultState: NotificationState = {
    emailActivity: true, emailNews: false, emailTips: true,
    pushInstant: true, pushReminders: true, pushProduct: false,
    smsSecurityAlerts: true, smsPromotional: false,
    marketingPersonalized: true, marketingPartner: false,
  };

  return (
    <>
      {/* ── Notification Channels ── */}
      <div className="mb-8">
        <SectionHeader title="Notification Channels" />

        {/* Top row: Email + Push side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

          {/* Email Notifications */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                <Mail size={15} />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Email Notifications</h3>
            </div>
            <div className="space-y-3.5">
              <ToggleRow label="Activity related to you"  checked={state.emailActivity} onChange={v => set("emailActivity", v)} />
              <ToggleRow label="News and updates"         checked={state.emailNews}     onChange={v => set("emailNews", v)} />
              <ToggleRow label="Tips and tutorials"       checked={state.emailTips}     onChange={v => set("emailTips", v)} />
            </div>
          </div>

          {/* Push Notifications */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                <Bell size={15} />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Push Notifications</h3>
            </div>
            <div className="space-y-3.5">
              <ToggleRow label="Instant alerts"   checked={state.pushInstant}    onChange={v => set("pushInstant", v)} />
              <ToggleRow label="Reminders"         checked={state.pushReminders}  onChange={v => set("pushReminders", v)} />
              <ToggleRow label="Product updates"   checked={state.pushProduct}    onChange={v => set("pushProduct", v)} />
            </div>
          </div>
        </div>

        {/* SMS Notifications — full width */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
              <MessageSquare size={15} />
            </div>
            <h3 className="text-sm font-bold text-gray-900">SMS Notifications</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4">
            <ToggleRow
              label="Security alerts"
              description="Critical account security updates via phone"
              checked={state.smsSecurityAlerts}
              onChange={v => set("smsSecurityAlerts", v)}
            />
            <ToggleRow
              label="Promotional offers"
              description="Occasional discounts and special deals"
              checked={state.smsPromotional}
              onChange={v => set("smsPromotional", v)}
            />
          </div>
        </div>
      </div>

      {/* ── Marketing Preferences ── */}
      <div className="mb-8">
        <SectionHeader title="Marketing Preferences" />

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <ToggleRow
              label="Personalized recommendations"
              description="Allow us to analyze your activity to provide suggestions tailored to your preferences."
              checked={state.marketingPersonalized}
              onChange={v => set("marketingPersonalized", v)}
            />
          </div>
          <div className="p-5">
            <ToggleRow
              label="Partner offers"
              description="Receive exclusive deals and curated content from our trusted sanctuary partners."
              checked={state.marketingPartner}
              onChange={v => set("marketingPartner", v)}
            />
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-end gap-3 pb-8">
        <button
          onClick={() => setState(defaultState)}
          className="text-sm font-semibold text-gray-500 hover:text-gray-700 px-5 py-2.5 transition-colors"
        >
          Discard Changes
        </button>
        <button className="text-sm font-bold bg-red-500 text-white px-7 py-2.5 rounded-full hover:bg-red-600 transition-colors shadow-sm">
          Save Changes
        </button>
      </div>
    </>
  );
}

// ─── Coming Soon ──────────────────────────────────────────────────────────────
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

// ─── Account Sidebar ──────────────────────────────────────────────────────────
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
          <p className="text-[10px] font-bold text-red-500 tracking-widest uppercase mb-2">
            {section}
          </p>
          {items.map(({ label, icon }) => (
            <button
              key={label}
              onClick={() => onSelect(label)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm mb-0.5 transition-colors text-left ${
                activeSection === label
                  ? "bg-red-50 text-red-500 font-semibold"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className={activeSection === label ? "text-red-500" : "text-gray-400"}>
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

// ─── Notifications Page (exported) ───────────────────────────────────────────
export function NotificationsPage({ onNavigate }: { onNavigate?: (section: string) => void }) {
  const [activeSection, setActiveSection] = useState("Notifications");

  const handleSelect = (section: string) => {
    setActiveSection(section);
    onNavigate?.(section);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="flex max-w-7xl mx-auto w-full px-4 py-8 gap-6">

        {/* Sidebar */}
        <AccountSidebar activeSection={activeSection} onSelect={handleSelect} />

        {/* Main */}
        <main className="flex-1 min-w-0">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{activeSection}</h1>
            <p className="text-sm text-gray-400 mt-1">
              {SECTION_SUBTITLES[activeSection]}
            </p>
          </div>

          <div
            key={activeSection}
            style={{ animation: "notifFadeIn .15s ease both" }}
          >
            <style>{`
              @keyframes notifFadeIn {
                from { opacity: 0; transform: translateY(5px); }
                to   { opacity: 1; transform: translateY(0); }
              }
            `}</style>

            {activeSection === "Notifications"
              ? <NotificationsContent />
              : <ComingSoon section={activeSection} />
            }
          </div>
        </main>

      </div>
    </div>
  );
}

export default NotificationsPage;
