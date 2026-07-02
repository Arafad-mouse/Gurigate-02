import { useState, useEffect } from 'react'
import { DollarSign, Calendar, Users, Building2, TrendingUp, BarChart3, Filter, Download } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ReportMetrics {
  totalRevenue: number
  totalBookings: number
  occupancyRate: number
  conversionRate: number
  topCities: { city: string; count: number; revenue: number }[]
  topHosts: { host_name: string; bookings: number; revenue: number }[]
  topProperties: { property_title: string; city: string; bookings: number; revenue: number }[]
}

export default function AdminReports() {
  const [metrics, setMetrics] = useState<ReportMetrics | null>(null)
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'year' | 'custom'>('month')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMetrics()
  }, [dateFilter, customStartDate, customEndDate])

  const loadMetrics = async () => {
    try {
      setLoading(true)
      
      // Calculate date range
      const now = new Date()
      let startDate = new Date()
      
      switch (dateFilter) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0))
          break
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7))
          break
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1))
          break
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1))
          break
        case 'custom':
          if (customStartDate) startDate = new Date(customStartDate)
          break
      }

      const startDateStr = startDate.toISOString().split('T')[0]
      const endDateStr = customEndDate ? new Date(customEndDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]

      // Get total revenue from completed bookings
      const { data: bookingsData } = await supabase
        .from('property_bookings')
        .select('total_price, created_at')
        .gte('created_at', startDateStr)
        .lte('created_at', endDateStr)
        .eq('status', 'completed')

      const totalRevenue = bookingsData?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0
      const totalBookings = bookingsData?.length || 0

      // Get total properties for occupancy calculation
      const { count: totalProperties } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('approval_status', 'approved')

      // Calculate occupancy rate (active bookings / total properties)
      const { count: activeBookings } = await supabase
        .from('property_bookings')
        .select('*', { count: 'exact', head: true })
        .in('status', ['confirmed', 'checked_in'])

      const occupancyRate = totalProperties && activeBookings ? (activeBookings / totalProperties) * 100 : 0

      // Calculate conversion rate (completed bookings / total bookings)
      const { count: allBookings } = await supabase
        .from('property_bookings')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDateStr)
        .lte('created_at', endDateStr)

      const conversionRate = allBookings ? (totalBookings / allBookings) * 100 : 0

      // Get top cities by bookings and revenue
      const { data: cityData } = await supabase
        .from('property_bookings')
        .select(`
          total_price,
          properties!inner (
            property_addresses (
              city
            )
          )
        `)
        .gte('created_at', startDateStr)
        .lte('created_at', endDateStr)
        .eq('status', 'completed')

      const cityMap = new Map<string, { count: number; revenue: number }>()
      cityData?.forEach((booking: any) => {
        const addresses = booking.properties?.property_addresses
        const city = addresses && addresses.length > 0 ? addresses[0].city : 'Unknown'
        const current = cityMap.get(city) || { count: 0, revenue: 0 }
        current.count += 1
        current.revenue += booking.total_price || 0
        cityMap.set(city, current)
      })

      const topCities = Array.from(cityMap.entries())
        .map(([city, data]) => ({ city, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)

      // Get top hosts by bookings and revenue
      const { data: hostData } = await supabase
        .from('property_bookings')
        .select(`
          total_price,
          properties!inner (
            owner_id,
            profiles!inner (
              first_name,
              last_name
            )
          )
        `)
        .gte('created_at', startDateStr)
        .lte('created_at', endDateStr)
        .eq('status', 'completed')

      const hostMap = new Map<string, { host_name: string; bookings: number; revenue: number }>()
      hostData?.forEach((booking: any) => {
        const profiles = booking.properties?.profiles
        const host = profiles && profiles.length > 0 ? profiles[0] : null
        const hostName = host ? `${host.first_name} ${host.last_name}` : 'Unknown'
        const current = hostMap.get(hostName) || { host_name: hostName, bookings: 0, revenue: 0 }
        current.bookings += 1
        current.revenue += booking.total_price || 0
        hostMap.set(hostName, current)
      })

      const topHosts = Array.from(hostMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)

      // Get top properties by bookings and revenue
      const { data: propertyData } = await supabase
        .from('property_bookings')
        .select(`
          total_price,
          properties!inner (
            title,
            property_addresses (
              city
            )
          )
        `)
        .gte('created_at', startDateStr)
        .lte('created_at', endDateStr)
        .eq('status', 'completed')

      const propertyMap = new Map<string, { property_title: string; city: string; bookings: number; revenue: number }>()
      propertyData?.forEach((booking: any) => {
        const property = booking.properties
        const propertyTitle = property?.title || 'Unknown'
        const addresses = property?.property_addresses
        const city = addresses && addresses.length > 0 ? addresses[0].city : 'Unknown'
        const key = `${propertyTitle}-${city}`
        const current = propertyMap.get(key) || { property_title: propertyTitle, city, bookings: 0, revenue: 0 }
        current.bookings += 1
        current.revenue += booking.total_price || 0
        propertyMap.set(key, current)
      })

      const topProperties = Array.from(propertyMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)

      setMetrics({
        totalRevenue,
        totalBookings,
        occupancyRate,
        conversionRate,
        topCities,
        topHosts,
        topProperties
      })
    } catch (error) {
      console.error('Error loading metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    if (!metrics) return

    const headers = ['Metric', 'Value']
    const rows = [
      ['Total Revenue', metrics.totalRevenue.toString()],
      ['Total Bookings', metrics.totalBookings.toString()],
      ['Occupancy Rate', metrics.occupancyRate.toFixed(2) + '%'],
      ['Conversion Rate', metrics.conversionRate.toFixed(2) + '%']
    ]

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#BA0036]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Platform performance metrics and insights</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Date Filter */}
          <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="bg-transparent border-none text-sm focus:ring-0"
              aria-label="Filter by date range"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {dateFilter === 'custom' && (
            <>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm"
                aria-label="Start date"
                title="Start date"
              />
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm"
                aria-label="End date"
                title="End date"
              />
            </>
          )}

          {/* Export */}
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50"
            title="Export to CSV"
          >
            <Download className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Export</span>
          </button>
        </div>
      </div>

      {metrics && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    ${metrics.totalRevenue.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-[#BA0036]" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {metrics.totalBookings}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-[#BA0036]" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Occupancy Rate</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {metrics.occupancyRate.toFixed(1)}%
                  </p>
                </div>
                <Building2 className="h-8 w-8 text-[#BA0036]" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {metrics.conversionRate.toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-[#BA0036]" />
              </div>
            </div>
          </div>

          {/* Top Cities */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Top Cities by Revenue
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {metrics.topCities.length > 0 ? (
                  metrics.topCities.map((city, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">{city.city}</span>
                          <span className="text-sm text-gray-500">${city.revenue.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#BA0036] h-2 rounded-full"
                            style={{ width: `${(city.revenue / metrics.topCities[0].revenue) * 100}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{city.count} bookings</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No data available</p>
                )}
              </div>
            </div>
          </div>

          {/* Top Hosts */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Top Hosts by Revenue
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {metrics.topHosts.length > 0 ? (
                  metrics.topHosts.map((host, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">{host.host_name}</span>
                          <span className="text-sm text-gray-500">${host.revenue.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#BA0036] h-2 rounded-full"
                            style={{ width: `${(host.revenue / metrics.topHosts[0].revenue) * 100}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{host.bookings} bookings</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No data available</p>
                )}
              </div>
            </div>
          </div>

          {/* Top Properties */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Top Properties by Revenue
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {metrics.topProperties.length > 0 ? (
                  metrics.topProperties.map((property, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <span className="text-sm font-medium text-gray-900">{property.property_title}</span>
                            <span className="text-xs text-gray-500 ml-2">{property.city}</span>
                          </div>
                          <span className="text-sm text-gray-500">${property.revenue.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#BA0036] h-2 rounded-full"
                            style={{ width: `${(property.revenue / metrics.topProperties[0].revenue) * 100}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{property.bookings} bookings</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No data available</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
