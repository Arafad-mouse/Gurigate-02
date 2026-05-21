import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Building2, 
  Calendar, 
  CreditCard, 
  Users, 
  BarChart3, 
  Settings,
  Menu,
  X,
  LogOut
} from 'lucide-react'
import type { AuthProfile } from '@/services/authService'

interface AdminLayoutProps {
  profile: AuthProfile | null
  children?: React.ReactNode
}

export function AdminLayout({ profile, children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Properties', href: '/admin/properties', icon: Building2 },
    { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
    { name: 'Payments', href: '/admin/payments', icon: CreditCard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ]

  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + '/')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-[#BA0036]" />
            <span className="ml-2 text-xl font-bold text-gray-900">GuriGate Admin</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
            aria-label="Close sidebar"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
                  ${isActive(item.href)
                    ? 'bg-[#BA0036] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className={`h-5 w-5 ${isActive(item.href) ? 'text-white' : 'text-gray-500'}`} />
                <span className="ml-3">{item.name}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* User info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-[#BA0036] flex items-center justify-center text-white font-semibold">
                {profile?.initials || 'A'}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{profile?.fullName || 'Admin'}</p>
              <p className="text-xs text-gray-500">{profile?.roleLabel || 'Admin'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
              aria-label="Open sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Welcome, {profile?.firstName || 'Admin'}
              </span>
              <Link
                to="/"
                className="flex items-center text-sm text-gray-700 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Exit Admin
              </Link>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  )
}
