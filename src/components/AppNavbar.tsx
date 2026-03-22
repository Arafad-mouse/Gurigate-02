import { useEffect, useRef, useState } from 'react'
import { Bell, LayoutDashboard, LogOut, MessageCircleMore, Settings2 } from 'lucide-react'

import type { AuthProfile } from '@/services/authService'

type NotificationItem = {
  id: number
  text: string
  time: string
  unread: boolean
}

type MessageItem = {
  id: number
  name: string
  msg: string
  time: string
  unread: boolean
  avatar: string
}

type NavItem = {
  label: string
  value: string
}

type NavbarUser = Pick<AuthProfile, 'avatarUrl' | 'email' | 'fullName' | 'initials' | 'roleLabel'>

type AppNavbarProps = {
  activeNavItem?: string
  currentUser?: NavbarUser | null
  navItems?: NavItem[]
  onAccountSettingsSelect?: () => void
  onDashboardSelect?: () => void
  onLoginClick?: () => void
  onLogoClick?: () => void
  onNavItemSelect?: (value: string) => void
  onRegisterClick?: () => void
  onSignOut?: () => void
}

type PanelBaseProps = {
  onClose: () => void
}

type NotificationsPanelProps = PanelBaseProps & {
  items: NotificationItem[]
  onMarkAllRead: () => void
  onMarkRead: (id: number) => void
}

type MessagesPanelProps = PanelBaseProps & {
  items: MessageItem[]
  onMarkRead: (id: number) => void
}

type SettingsPanelProps = PanelBaseProps & {
  onAccountSettingsSelect?: () => void
  onDashboardSelect?: () => void
}

type ProfileDropdownProps = PanelBaseProps & {
  currentUser: NavbarUser
  onAccountSettingsSelect?: () => void
  onDashboardSelect?: () => void
  onSignOut?: () => void
}

type PostPropertyForm = {
  title: string
  type: string
  price: string
  location: string
}

const initialNotifications: NotificationItem[] = [
  { id: 1, text: 'Your property listing was approved.', time: '2m ago', unread: true },
  { id: 2, text: 'New inquiry received for a downtown apartment.', time: '18m ago', unread: true },
  { id: 3, text: 'Three new matches were added to your saved search.', time: '1h ago', unread: false },
]

const initialMessages: MessageItem[] = [
  { id: 1, name: 'James Carter', msg: 'Is the villa still available?', time: '5m ago', unread: true, avatar: 'JC' },
  { id: 2, name: 'Sara Ahmed', msg: 'Can we schedule a viewing for tomorrow?', time: '48m ago', unread: true, avatar: 'SA' },
  { id: 3, name: 'David Lee', msg: 'Thanks for sending the brochure.', time: '2h ago', unread: false, avatar: 'DL' },
]

function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  )
}

function GuriGateLogo({ onClick }: { onClick?: () => void }) {
  return (
    <button type="button" className="flex cursor-pointer flex-col items-center" onClick={onClick}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 4L36 16V36H24V26H16V36H4V16L20 4Z" fill="#E8453C" />
        <path d="M20 14C20 14 15 19 15 23C15 25.76 17.24 28 20 28C22.76 28 25 25.76 25 23C25 19 20 14 20 14Z" fill="white" />
      </svg>
      <span className="mt-0.5 text-sm font-bold tracking-wide" style={{ color: '#E8453C', fontFamily: "'Georgia', serif" }}>
        GuriGate
      </span>
    </button>
  )
}

function useDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return [open, setOpen, ref] as const
}

function NotificationsPanel({ items, onClose, onMarkAllRead, onMarkRead }: NotificationsPanelProps) {
  return (
    <div className="absolute right-0 top-14 z-50 w-80 overflow-hidden rounded-3xl border border-[#eadfcf] bg-white shadow-[0_24px_60px_rgba(47,31,22,0.16)]">
      <div className="flex items-center justify-between border-b border-[#f1e8dc] px-4 py-3">
        <span className="text-sm font-semibold text-slate-900">Notifications</span>
        <div className="flex items-center gap-3">
          <button type="button" onClick={onMarkAllRead} className="text-xs font-medium text-[#d45734] hover:underline">
            Mark all read
          </button>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <XIcon />
          </button>
        </div>
      </div>

      <ul>
        {items.map((item) => (
          <li
            key={item.id}
            onClick={() => onMarkRead(item.id)}
            className={[
              'cursor-pointer px-4 py-3 transition-colors hover:bg-[#faf5ee]',
              item.unread ? 'bg-[#fff3eb]' : 'bg-white',
            ].join(' ')}
          >
            <div className="flex items-start gap-3">
              <span className={['mt-1.5 h-2 w-2 rounded-full', item.unread ? 'bg-[#e8453c]' : 'bg-slate-300'].join(' ')} />
              <div>
                <p className="text-sm text-slate-700">{item.text}</p>
                <p className="mt-1 text-xs text-slate-400">{item.time}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function MessagesPanel({ items, onClose, onMarkRead }: MessagesPanelProps) {
  return (
    <div className="absolute right-0 top-14 z-50 w-80 overflow-hidden rounded-3xl border border-[#eadfcf] bg-white shadow-[0_24px_60px_rgba(47,31,22,0.16)]">
      <div className="flex items-center justify-between border-b border-[#f1e8dc] px-4 py-3">
        <span className="text-sm font-semibold text-slate-900">Messages</span>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <XIcon />
        </button>
      </div>

      <ul>
        {items.map((item) => (
          <li
            key={item.id}
            onClick={() => onMarkRead(item.id)}
            className={[
              'flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-[#faf5ee]',
              item.unread ? 'bg-[#fff3eb]' : 'bg-white',
            ].join(' ')}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8453c] text-xs font-bold text-white">
              {item.avatar}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-900">{item.name}</p>
                <p className="text-xs text-slate-400">{item.time}</p>
              </div>
              <p className="truncate text-xs text-slate-500">{item.msg}</p>
            </div>
            {item.unread ? <span className="h-2.5 w-2.5 rounded-full bg-[#e8453c]" /> : null}
          </li>
        ))}
      </ul>
    </div>
  )
}

function SettingsPanel({ onAccountSettingsSelect, onClose, onDashboardSelect }: SettingsPanelProps) {
  const items = [
    {
      label: 'Dashboard',
      description: 'Open your property workspace',
      onClick: onDashboardSelect,
    },
    {
      label: 'Account Settings',
      description: 'Update your profile and password',
      onClick: onAccountSettingsSelect,
    },
  ]

  return (
    <div className="absolute right-0 top-14 z-50 w-72 overflow-hidden rounded-3xl border border-[#eadfcf] bg-white shadow-[0_24px_60px_rgba(47,31,22,0.16)]">
      <div className="flex items-center justify-between border-b border-[#f1e8dc] px-4 py-3">
        <span className="text-sm font-semibold text-slate-900">Quick links</span>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <XIcon />
        </button>
      </div>

      <ul>
        {items.map((item) => (
          <li key={item.label}>
            <button
              type="button"
              onClick={() => {
                onClose()
                item.onClick?.()
              }}
              className="w-full border-b border-[#f5eee4] px-4 py-3 text-left transition-colors hover:bg-[#faf5ee] last:border-0"
            >
              <p className="text-sm font-medium text-slate-900">{item.label}</p>
              <p className="text-xs text-slate-500">{item.description}</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ProfileDropdown({
  currentUser,
  onAccountSettingsSelect,
  onClose,
  onDashboardSelect,
  onSignOut,
}: ProfileDropdownProps) {
  return (
    <div className="absolute right-0 top-14 z-50 w-56 overflow-hidden rounded-3xl border border-[#eadfcf] bg-white shadow-[0_24px_60px_rgba(47,31,22,0.16)]">
      <div className="border-b border-[#f1e8dc] px-4 py-3">
        <p className="text-sm font-semibold text-slate-900">{currentUser.fullName}</p>
        <p className="text-xs text-slate-500">{currentUser.email}</p>
      </div>

      <button
        type="button"
        onClick={() => {
          onClose()
          onDashboardSelect?.()
        }}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-[#faf5ee]"
      >
        <LayoutDashboard className="h-4 w-4" />
        Dashboard
      </button>

      <button
        type="button"
        onClick={() => {
          onClose()
          onAccountSettingsSelect?.()
        }}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-[#faf5ee]"
      >
        <Settings2 className="h-4 w-4" />
        Account Settings
      </button>

      <div className="border-t border-[#f1e8dc]">
        <button
          type="button"
          onClick={() => {
            onClose()
            onSignOut?.()
          }}
          className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[#d45734] transition-colors hover:bg-[#fff2e8]"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  )
}

function PostPropertyModal({ onClose }: PanelBaseProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [form, setForm] = useState<PostPropertyForm>({ title: '', type: '', price: '', location: '' })

  const update = (key: keyof PostPropertyForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-[30px] bg-white p-6 shadow-[0_24px_70px_rgba(25,18,13,0.25)]" onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Post your property</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <XIcon />
          </button>
        </div>

        <div className="mb-6 flex gap-2">
          {[1, 2, 3].map((value) => (
            <div key={value} className={['h-1.5 flex-1 rounded-full', step >= value ? 'bg-[#e8453c]' : 'bg-[#eadfcf]'].join(' ')} />
          ))}
        </div>

        {step === 1 ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700">Basic details</p>
            <input
              className="w-full rounded-2xl border border-[#e7ddcf] px-3 py-2.5 text-sm outline-none transition focus:border-[#e56b47] focus:ring-2 focus:ring-[#f4c4b2]"
              placeholder="Property title"
              value={form.title}
              onChange={(event) => update('title', event.target.value)}
            />
            <select
              className="w-full rounded-2xl border border-[#e7ddcf] px-3 py-2.5 text-sm text-slate-600 outline-none transition focus:border-[#e56b47] focus:ring-2 focus:ring-[#f4c4b2]"
              value={form.type}
              onChange={(event) => update('type', event.target.value)}
            >
              <option value="">Select property type</option>
              <option>Apartment</option>
              <option>Villa</option>
              <option>House</option>
              <option>Studio</option>
              <option>Commercial</option>
            </select>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700">Pricing and location</p>
            <input
              className="w-full rounded-2xl border border-[#e7ddcf] px-3 py-2.5 text-sm outline-none transition focus:border-[#e56b47] focus:ring-2 focus:ring-[#f4c4b2]"
              placeholder="Price"
              value={form.price}
              onChange={(event) => update('price', event.target.value)}
            />
            <input
              className="w-full rounded-2xl border border-[#e7ddcf] px-3 py-2.5 text-sm outline-none transition focus:border-[#e56b47] focus:ring-2 focus:ring-[#f4c4b2]"
              placeholder="Location or address"
              value={form.location}
              onChange={(event) => update('location', event.target.value)}
            />
          </div>
        ) : null}

        {step === 3 ? (
          <div className="rounded-[24px] bg-[#fff7f2] p-4">
            <p className="text-sm font-medium text-slate-900">Ready to publish</p>
            <p className="mt-1 text-sm text-slate-600">We’ve staged the essentials for your next listing.</p>
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <p>Title: {form.title || '-'}</p>
              <p>Type: {form.type || '-'}</p>
              <p>Price: {form.price || '-'}</p>
              <p>Location: {form.location || '-'}</p>
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex justify-between">
          <button
            type="button"
            onClick={() => (step > 1 ? setStep((prev) => (prev - 1) as 1 | 2 | 3) : onClose())}
            className="rounded-full border border-[#e7ddcf] px-4 py-2 text-sm text-slate-600 transition hover:bg-[#faf5ee]"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          <button
            type="button"
            onClick={() => (step < 3 ? setStep((prev) => (prev + 1) as 1 | 2 | 3) : onClose())}
            className="rounded-full bg-[#e8453c] px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            {step === 3 ? 'Publish listing' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AppNavbar({
  activeNavItem,
  currentUser,
  navItems = [],
  onAccountSettingsSelect,
  onDashboardSelect,
  onLoginClick,
  onLogoClick,
  onNavItemSelect,
  onRegisterClick,
  onSignOut,
}: AppNavbarProps) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [messages, setMessages] = useState(initialMessages)
  const [showPostModal, setShowPostModal] = useState(false)

  const [bellOpen, setBellOpen, bellRef] = useDropdown()
  const [messagesOpen, setMessagesOpen, messagesRef] = useDropdown()
  const [settingsOpen, setSettingsOpen, settingsRef] = useDropdown()
  const [profileOpen, setProfileOpen, profileRef] = useDropdown()

  const closeAll = () => {
    setBellOpen(false)
    setMessagesOpen(false)
    setSettingsOpen(false)
    setProfileOpen(false)
  }

  const unreadNotifications = notifications.filter((item) => item.unread).length
  const unreadMessages = messages.filter((item) => item.unread).length

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-[#eadfcf] bg-[rgba(255,252,247,0.92)] px-6 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
          <GuriGateLogo onClick={onLogoClick} />

          {navItems.length > 0 ? (
            <div className="hidden items-center gap-1 rounded-full border border-[#eadfcf] bg-white/80 p-1 shadow-sm lg:flex">
              {navItems.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => onNavItemSelect?.(item.value)}
                  className={[
                    'rounded-full px-4 py-2 text-sm font-medium transition',
                    activeNavItem === item.value
                      ? 'bg-slate-900 text-white shadow'
                      : 'text-slate-600 hover:bg-[#f5efe6] hover:text-slate-900',
                  ].join(' ')}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ) : (
            <div />
          )}

          {currentUser ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowPostModal(true)}
                className="hidden rounded-full bg-[#e8453c] px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 md:inline-flex"
              >
                Post your Property
              </button>

              <div className="relative" ref={bellRef}>
                <button
                  type="button"
                  onClick={() => {
                    const next = !bellOpen
                    closeAll()
                    setBellOpen(next)
                  }}
                  className={[
                    'relative flex h-10 w-10 items-center justify-center rounded-full border transition',
                    bellOpen
                      ? 'border-[#f4b19a] bg-[#fff1e8] text-[#d45734]'
                      : 'border-[#eadfcf] bg-white text-slate-500 hover:text-slate-900',
                  ].join(' ')}
                >
                  <Bell className="h-4 w-4" />
                  {unreadNotifications > 0 ? (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#e8453c] text-[10px] font-bold text-white">
                      {unreadNotifications}
                    </span>
                  ) : null}
                </button>
                {bellOpen ? (
                  <NotificationsPanel
                    items={notifications}
                    onClose={() => setBellOpen(false)}
                    onMarkAllRead={() => setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })))}
                    onMarkRead={(id) => setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, unread: false } : item)))}
                  />
                ) : null}
              </div>

              <div className="relative" ref={messagesRef}>
                <button
                  type="button"
                  onClick={() => {
                    const next = !messagesOpen
                    closeAll()
                    setMessagesOpen(next)
                  }}
                  className={[
                    'relative flex h-10 w-10 items-center justify-center rounded-full border transition',
                    messagesOpen
                      ? 'border-[#f4b19a] bg-[#fff1e8] text-[#d45734]'
                      : 'border-[#eadfcf] bg-white text-slate-500 hover:text-slate-900',
                  ].join(' ')}
                >
                  <MessageCircleMore className="h-4 w-4" />
                  {unreadMessages > 0 ? (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#e8453c] text-[10px] font-bold text-white">
                      {unreadMessages}
                    </span>
                  ) : null}
                </button>
                {messagesOpen ? (
                  <MessagesPanel
                    items={messages}
                    onClose={() => setMessagesOpen(false)}
                    onMarkRead={(id) => setMessages((prev) => prev.map((item) => (item.id === id ? { ...item, unread: false } : item)))}
                  />
                ) : null}
              </div>

              <div className="relative" ref={settingsRef}>
                <button
                  type="button"
                  onClick={() => {
                    const next = !settingsOpen
                    closeAll()
                    setSettingsOpen(next)
                  }}
                  className={[
                    'flex h-10 w-10 items-center justify-center rounded-full border transition',
                    settingsOpen
                      ? 'border-[#f4b19a] bg-[#fff1e8] text-[#d45734]'
                      : 'border-[#eadfcf] bg-white text-slate-500 hover:text-slate-900',
                  ].join(' ')}
                >
                  <Settings2 className="h-4 w-4" />
                </button>
                {settingsOpen ? (
                  <SettingsPanel
                    onAccountSettingsSelect={onAccountSettingsSelect}
                    onClose={() => setSettingsOpen(false)}
                    onDashboardSelect={onDashboardSelect}
                  />
                ) : null}
              </div>

              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => {
                    const next = !profileOpen
                    closeAll()
                    setProfileOpen(next)
                  }}
                  className="flex items-center gap-3 rounded-full border border-transparent px-1 py-1 transition hover:border-[#eadfcf] hover:bg-white"
                >
                  <div className="text-right">
                    <p className="text-sm font-semibold leading-tight text-slate-900">{currentUser.fullName}</p>
                    <p className="text-xs leading-tight text-slate-500">{currentUser.roleLabel}</p>
                  </div>
                  <div className="relative">
                    {currentUser.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt={currentUser.fullName} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f6ddd1] text-sm font-semibold text-[#d45734]">
                        {currentUser.initials}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
                  </div>
                </button>

                {profileOpen ? (
                  <ProfileDropdown
                    currentUser={currentUser}
                    onAccountSettingsSelect={onAccountSettingsSelect}
                    onClose={() => setProfileOpen(false)}
                    onDashboardSelect={onDashboardSelect}
                    onSignOut={onSignOut}
                  />
                ) : null}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onLoginClick}
                className="rounded-full border border-[#decfbf] px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={onRegisterClick}
                className="rounded-full bg-[#e8453c] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      </nav>

      {showPostModal ? <PostPropertyModal onClose={() => setShowPostModal(false)} /> : null}
    </>
  )
}
