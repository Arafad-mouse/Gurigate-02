import { useRole } from '@/hooks/useRole'
import { AdminService } from '@/services/adminService'
import type { DashboardKPIs } from '@/services/adminService'
import { useEffect, useState } from 'react'
import { Building2, Calendar, DollarSign, Users, CreditCard, Clock } from 'lucide-react'

export function AdminDashboard() {
  const { profile } = useRole()
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true)
        const data = await AdminService.getDashboardKPIs()
        setKpis(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    )
  }

  if (!kpis) return null

  const kpiCards = [
    {
      title: 'Total Properties',
      value: kpis.totalProperties,
      icon: <Building2 className="h-6 w-6" />,
      color: 'bg-blue-500',
      change: '+12% from last month',
    },
    {
      title: 'Pending Approvals',
      value: kpis.pendingApprovals,
      icon: <Clock className="h-6 w-6" />,
      color: 'bg-yellow-500',
      change: '+5 from yesterday',
    },
    {
      title: 'Active Bookings',
      value: kpis.activeBookings,
      icon: <Calendar className="h-6 w-6" />,
      color: 'bg-green-500',
      change: '+18% from last month',
    },
    {
      title: 'Total Revenue',
      value: `$${kpis.totalRevenue.toLocaleString()}`,
      icon: <DollarSign className="h-6 w-6" />,
      color: 'bg-purple-500',
      change: '+24% from last month',
    },
    {
      title: 'Total Users',
      value: kpis.totalUsers,
      icon: <Users className="h-6 w-6" />,
      color: 'bg-indigo-500',
      change: '+8% from last month',
    },
    {
      title: 'Total Hosts',
      value: kpis.totalHosts,
      icon: <CreditCard className="h-6 w-6" />,
      color: 'bg-pink-500',
      change: '+15% from last month',
    },
  ]

  const categoryCards = [
    {
      title: 'Residential',
      value: kpis.residentialCount,
      color: 'bg-emerald-500',
    },
    {
      title: 'Commercial',
      value: kpis.commercialCount,
      color: 'bg-blue-500',
    },
    {
      title: 'Land',
      value: kpis.landCount,
      color: 'bg-amber-500',
    },
    {
      title: 'Hospitality',
      value: kpis.hospitalityCount,
      color: 'bg-purple-500',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {profile?.firstName || 'Admin'}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                <p className="text-sm text-green-600 mt-2">{card.change}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg text-white`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Properties by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categoryCards.map((card, index) => (
            <div key={index} className="text-center">
              <div className={`${card.color} p-4 rounded-lg text-white mb-2`}>
                <p className="text-3xl font-bold">{card.value}</p>
              </div>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="px-6 py-4">
          <p className="text-gray-500 text-sm">Recent admin activity will appear here after migration.</p>
        </div>
      </div>
    </div>
  )
}
