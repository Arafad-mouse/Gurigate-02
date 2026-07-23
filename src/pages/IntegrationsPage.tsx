import { useState } from "react";
import {
  User, Settings, Bell, Share2, Briefcase, Link,
  ExternalLink, CheckCircle2, AlertCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SidebarItem { label: string; icon: React.ReactNode; }

interface Integration {
  id: string;
  name: string;
  description: string;
  logo: React.ReactNode;
  category: "AI" | "Productivity" | "Payments" | "Communication";
  connected: boolean;
  comingSoon?: boolean;
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
  Integrations:  "Connect the apps you use to your GuriGate account.",
};

// ─── SVG Logos ────────────────────────────────────────────────────────────────
const Logos = {
  ChatGPT: () => (
    <svg width="28" height="28" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M37.532 16.87a9.963 9.963 0 00-.856-8.184 10.078 10.078 0 00-10.855-4.835 9.964 9.964 0 00-7.505-3.348 10.079 10.079 0 00-9.614 6.977 9.967 9.967 0 00-6.664 4.834 10.08 10.08 0 001.24 11.817 9.965 9.965 0 00.856 8.185 10.079 10.079 0 0010.855 4.835 9.965 9.965 0 007.504 3.347 10.08 10.08 0 009.617-6.981 9.967 9.967 0 006.663-4.834 10.079 10.079 0 00-1.241-11.813zM22.498 37.886a7.474 7.474 0 01-4.799-1.735c.061-.033.168-.091.237-.134l7.964-4.6a1.294 1.294 0 00.655-1.134V19.054l3.366 1.944a.12.12 0 01.066.092v9.299a7.505 7.505 0 01-7.49 7.496zM6.392 31.006a7.471 7.471 0 01-.894-5.023c.06.036.162.099.237.141l7.964 4.6a1.297 1.297 0 001.308 0l9.724-5.614v3.888a.12.12 0 01-.048.103l-8.051 4.649a7.504 7.504 0 01-10.24-2.744zM4.297 13.62A7.469 7.469 0 018.2 10.333c0 .068-.004.19-.004.274v9.201a1.294 1.294 0 00.654 1.132l9.723 5.614-3.366 1.944a.12.12 0 01-.114.012L7.044 23.86a7.504 7.504 0 01-2.747-10.24zm27.658 6.437l-9.724-5.615 3.367-1.943a.121.121 0 01.114-.012l8.048 4.648a7.498 7.498 0 01-1.158 13.528v-9.476a1.293 1.293 0 00-.647-1.13zm3.35-5.043c-.059-.037-.162-.099-.236-.141l-7.965-4.6a1.298 1.298 0 00-1.308 0l-9.723 5.614v-3.888a.12.12 0 01.048-.103l8.05-4.645a7.497 7.497 0 0111.135 7.763zm-21.063 6.929l-3.367-1.944a.12.12 0 01-.065-.092v-9.299a7.497 7.497 0 0112.293-5.756 6.94 6.94 0 00-.236.134l-7.965 4.6a1.294 1.294 0 00-.654 1.132l-.006 11.225zm1.829-3.943l4.33-2.501 4.332 2.497v4.998l-4.331 2.5-4.331-2.5V18z" fill="currentColor"/>
    </svg>
  ),
  Notion: () => (
    <svg width="26" height="26" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.017 4.313l55.333-4.087c6.797-.583 8.543-.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.723 3.883 5.053v68.243c0 4.277-.777 6.807-6.223 7.193L24.78 99.967c-4.08.193-6.023-.39-8.16-3.113L3.153 80.88C.827 77.77 0 75.53 0 72.806V11.507C0 8.203 1.553 5.48 6.017 4.313z" fill="#fff"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M61.35.227l-55.333 4.086C1.553 5.48 0 8.203 0 11.507v61.3c0 2.723.827 4.963 3.153 8.073l13.46 15.973c2.14 2.723 4.08 3.307 8.16 3.113l64.51-3.89c5.447-.383 6.223-2.917 6.223-7.19V17.64c0-2.193-.78-2.86-3.24-4.623L74.167 3.143C69.893.037 68.147-.357 61.35.227zM25.92 19.523c-5.247.353-6.437.433-9.417-1.99L8.57 11.507c-.78-.78-.39-1.75 1.557-1.943l53.193-3.89c4.467-.39 6.803 1.167 8.553 2.527l9.123 6.61c.39.197 1.363 1.36.193 1.36l-54.81 3.307-.46.045zM19.457 88.707V30.48c0-2.534.777-3.697 3.103-3.893L85.92 22.94c2.14-.193 3.107 1.167 3.107 3.693v57.547c0 2.53-.39 4.67-3.883 4.863l-61.62 3.5c-3.497.193-4.067-1.55-4.067-3.836zm59.6-54.827c.387 1.75 0 3.5-1.75 3.7l-2.91.577v42.773c-2.527 1.36-4.853 2.14-6.797 2.14-3.107 0-3.883-.973-6.21-3.887l-19.03-29.94v28.967l6.02 1.363s0 3.5-4.857 3.5l-13.373.777c-.39-.78 0-2.723 1.357-3.11l3.497-.97v-38.3L30.48 40.667c-.39-1.75.58-4.277 3.3-4.473l14.367-.967 19.8 30.327v-26.83l-5.047-.58c-.39-2.143 1.163-3.7 3.103-3.89l13.053-.353z" fill="#000"/>
    </svg>
  ),
  GoogleCalendar: () => (
    <img src="/Google_Calendar_icon.svg" width="26" height="26" alt="Google Calendar" />
  ),
  Zaad: () => (
    <img src="/Waafi.svg" width="26" height="26" alt="Zaad" />
  ),
  Edahab: () => (
    <img src="/E-dahab.png" width="26" height="26" alt="eDahab" />
  ),
  Gmail: () => (
    <img src="/gmail_icon.svg" width="40" height="40" alt="Gmail" />
  ),
  Outlook: () => (
    <img src="/Outlook.svg" width="26" height="26" alt="Outlook" />
  ),
  PremierWallet: () => (
    <img src="/Premier Wallet.png" width="26" height="26" alt="Premier Wallet" />
  ),
};

// ─── Integration Data ─────────────────────────────────────────────────────────
const INITIAL_INTEGRATIONS: Integration[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    description: "Use AI-powered assistance to get property recommendations, draft messages, and answer questions directly in GuriGate.",
    logo: <Logos.ChatGPT />,
    category: "AI",
    connected: true,
  },
  {
    id: "notion",
    name: "Notion",
    description: "Sync your property notes, wishlists, and trip plans to Notion for seamless team collaboration and documentation.",
    logo: <Logos.Notion />,
    category: "Productivity",
    connected: false,
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Automatically add bookings, check-ins, and viewings to your Google Calendar to stay on top of your schedule.",
    logo: <Logos.GoogleCalendar />,
    category: "Productivity",
    connected: true,
  },
  {
    id: "zaad",
    name: "Zaad",
    description: "Pay for bookings and services directly using your Zaad mobile wallet — Somalia's leading mobile money platform.",
    logo: <Logos.Zaad />,
    category: "Payments",
    connected: false,
  },
  {
    id: "edahab",
    name: "eDahab",
    description: "Complete payments securely via eDahab, the trusted digital payment solution widely used across Somalia.",
    logo: <Logos.Edahab />,
    category: "Payments",
    connected: false,
  },
  {
    id: "gmail",
    name: "Gmail",
    description: "Receive booking confirmations, invoices, and GuriGate notifications directly to your Gmail inbox.",
    logo: <Logos.Gmail />,
    category: "Communication",
    connected: false,
  },
  {
    id: "outlook",
    name: "Outlook",
    description: "Sync GuriGate notifications and booking confirmations with your Outlook email and calendar.",
    logo: <Logos.Outlook />,
    category: "Communication",
    connected: false,
  },
  {
    id: "premier-wallet",
    name: "Premier Wallet",
    description: "Manage payments and transactions with Premier Wallet, a secure digital payment solution for seamless booking experiences.",
    logo: <Logos.PremierWallet />,
    category: "Payments",
    connected: false,
  },
];

const CATEGORY_COLORS: Record<Integration["category"], string> = {
  AI:            "bg-purple-50 text-purple-600 border-purple-100",
  Productivity:  "bg-blue-50 text-blue-600 border-blue-100",
  Payments:      "bg-green-50 text-green-600 border-green-100",
  Communication: "bg-orange-50 text-orange-600 border-orange-100",
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

// ─── Integration Card ─────────────────────────────────────────────────────────
function IntegrationCard({
  integration,
  onToggle,
}: {
  integration: Integration;
  onToggle: (id: string, value: boolean) => void;
}) {
  return (
    <div
      className={`bg-white rounded-2xl border-2 p-5 flex flex-col gap-4 transition-all duration-200 ${
        integration.connected
          ? "border-red-200 shadow-sm shadow-red-50"
          : "border-gray-100 hover:border-gray-200"
      }`}
    >
      {/* Top row: logo + toggle */}
      <div className="flex items-start justify-between gap-3">
        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
          {integration.logo}
        </div>
        <Toggle
          checked={integration.connected}
          onChange={v => onToggle(integration.id, v)}
        />
      </div>

      {/* Name + category badge */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <h3 className="text-sm font-bold text-gray-900">{integration.name}</h3>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[integration.category]}`}>
            {integration.category}
          </span>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">{integration.description}</p>
      </div>

      {/* Status + link */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
        <div className="flex items-center gap-1.5">
          {integration.connected ? (
            <>
              <CheckCircle2 size={13} className="text-green-500" />
              <span className="text-xs font-medium text-green-600">Connected</span>
            </>
          ) : (
            <>
              <AlertCircle size={13} className="text-gray-300" />
              <span className="text-xs font-medium text-gray-400">Not connected</span>
            </>
          )}
        </div>
        <button className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors">
          Learn more <ExternalLink size={11} />
        </button>
      </div>
    </div>
  );
}

// ─── Integrations Content ─────────────────────────────────────────────────────
export function IntegrationsContent() {
  const [integrations, setIntegrations] = useState<Integration[]>(INITIAL_INTEGRATIONS);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const handleToggle = (id: string, value: boolean) => {
    setIntegrations(prev =>
      prev.map(i => i.id === id ? { ...i, connected: value } : i)
    );
  };

  const categories = ["All", "AI", "Productivity", "Payments", "Communication"];

  const filtered = activeCategory === "All"
    ? integrations
    : integrations.filter(i => i.category === activeCategory);

  const connectedCount = integrations.filter(i => i.connected).length;

  return (
    <>
      {/* Stats bar */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-white rounded-2xl border border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-sm text-gray-600">
            <span className="font-bold text-gray-900">{connectedCount}</span> connected
          </span>
        </div>
        <div className="w-px h-4 bg-gray-200" />
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gray-300" />
          <span className="text-sm text-gray-600">
            <span className="font-bold text-gray-900">{integrations.length - connectedCount}</span> available
          </span>
        </div>
        <div className="ml-auto text-xs text-gray-400">
          {integrations.length} integrations total
        </div>
      </div>

      {/* Category filter pills */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all ${
              activeCategory === cat
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
            }`}
          >
            {cat}
            {cat !== "All" && (
              <span className="ml-1.5 opacity-60">
                {integrations.filter(i => i.category === cat).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {filtered.map(integration => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            onToggle={handleToggle}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 pb-8">
        <button
          onClick={() => setIntegrations(INITIAL_INTEGRATIONS)}
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
function AccountSidebar({ activeSection, onSelect }: { activeSection: string; onSelect: (s: string) => void }) {
  return (
    <aside className="w-56 flex-shrink-0 bg-white rounded-2xl border border-gray-100 p-5 self-start sticky top-24">
      <div className="mb-5">
        <h2 className="text-base font-bold text-gray-900">Account</h2>
        <p className="text-xs text-gray-400 mt-0.5">Manage your editorial presence</p>
      </div>
      {Object.entries(SIDEBAR_SECTIONS).map(([section, items]) => (
        <div key={section} className="mb-4">
          <p className="text-[10px] font-bold text-red-500 tracking-widest uppercase mb-2">{section}</p>
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
              <span className={activeSection === label ? "text-red-500" : "text-gray-400"}>{icon}</span>
              {label}
            </button>
          ))}
        </div>
      ))}
    </aside>
  );
}

// ─── Integrations Page (exported) ────────────────────────────────────────────
export function IntegrationsPage({ onNavigate }: { onNavigate?: (section: string) => void }) {
  const [activeSection, setActiveSection] = useState("Integrations");

  const handleSelect = (section: string) => {
    setActiveSection(section);
    onNavigate?.(section);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="flex max-w-7xl mx-auto w-full px-4 py-8 gap-6">
        <AccountSidebar activeSection={activeSection} onSelect={handleSelect} />
        <main className="flex-1 min-w-0">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{activeSection}</h1>
            <p className="text-sm text-gray-400 mt-1">{SECTION_SUBTITLES[activeSection]}</p>
          </div>

          <div key={activeSection} style={{ animation: "intFadeIn .15s ease both" }}>
            <style>{`@keyframes intFadeIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}`}</style>
            {activeSection === "Integrations"
              ? <IntegrationsContent />
              : <ComingSoon section={activeSection} />
            }
          </div>
        </main>
      </div>
    </div>
  );
}

export default IntegrationsPage;
