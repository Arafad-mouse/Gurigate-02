import { useState, useEffect } from 'react'
import { useContext } from 'react'
import { AuthContext } from '@/lib/auth-context'
import { usePermissions } from '@/hooks/usePermissions'
import { AdminService } from '@/services/adminService'
import type { AdminProperty } from '@/services/adminService'
import { StatusBadge } from '@/components/admin/table/StatusBadge'
import { SearchInput } from '@/components/admin/table/SearchInput'
import { DataTableFilters } from '@/components/admin/table/DataTableFilters'
import { DataTablePagination } from '@/components/admin/table/DataTablePagination'
import { EmptyState } from '@/components/admin/table/EmptyState'
import { RowActions, ActionIcons } from '@/components/admin/table/RowActions'
import { PROPERTY_APPROVAL_STATUS } from '@/constants/status'
import { Building2, AlertTriangle } from 'lucide-react'

export function AdminProperties() {
  const authContext = useContext(AuthContext)
  const { canApproveProperty, canRejectProperty, canSuspendProperty } = usePermissions()
  const [properties, setProperties] = useState<AdminProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const adminId = authContext?.profile?.id

  const loadProperties = async () => {
    try {
      setLoading(true)
      const data = await AdminService.getAllProperties()
      setProperties(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load properties')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProperties()
  }, [])

  const handleApprove = async (propertyId: string) => {
    if (!adminId) return
    try {
      await AdminService.approveProperty(propertyId, adminId)
      await loadProperties()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve property')
    }
  }

  const handleReject = async (propertyId: string, reason: string) => {
    if (!adminId) return
    try {
      await AdminService.rejectProperty(propertyId, adminId, reason)
      await loadProperties()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject property')
    }
  }

  const handleSuspend = async (propertyId: string) => {
    if (!adminId) return
    try {
      await AdminService.suspendProperty(propertyId, adminId, 'Suspended by admin')
      await loadProperties()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to suspend property')
    }
  }

  // Filter properties
  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.city.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || property.approval_status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProperties = filteredProperties.slice(startIndex, endIndex)

  const statusOptions = [
    { value: PROPERTY_APPROVAL_STATUS.PENDING, label: 'Pending' },
    { value: PROPERTY_APPROVAL_STATUS.APPROVED, label: 'Approved' },
    { value: PROPERTY_APPROVAL_STATUS.REJECTED, label: 'Rejected' },
    { value: PROPERTY_APPROVAL_STATUS.SUSPENDED, label: 'Suspended' },
  ]

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-600 mt-1">Manage property listings and approvals</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <SearchInput
            onSearch={setSearchQuery}
            placeholder="Search properties by title or city..."
          />
        </div>
        <DataTableFilters
          filters={[
            {
              key: 'status',
              label: 'Status',
              options: statusOptions,
            },
          ]}
          activeFilters={{ status: statusFilter }}
          onFilterChange={(_key, value) => setStatusFilter(value)}
          onClearFilters={() => {
            setStatusFilter('')
            setSearchQuery('')
          }}
        />
      </div>

      {/* Properties Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {paginatedProperties.length === 0 ? (
          <EmptyState
            title="No properties found"
            description="No properties match your current filters."
            icon={<Building2 />}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedProperties.map((property) => (
                    <tr key={property.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                              <Building2 className="h-6 w-6 text-gray-400" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{property.title}</div>
                            <div className="text-sm text-gray-500">{property.city}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={property.approval_status} category="PROPERTY" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{property.owner_name}</div>
                        <div className="text-sm text-gray-500">{property.owner_email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${property.price} {property.currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(property.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <RowActions
                          actions={[
                            ...(canApproveProperty() && property.approval_status === PROPERTY_APPROVAL_STATUS.PENDING ? [{
                              label: 'Approve',
                              icon: ActionIcons.approve,
                              onClick: () => handleApprove(property.id),
                              variant: 'success' as const,
                            }] : []),
                            ...(canRejectProperty() && property.approval_status === PROPERTY_APPROVAL_STATUS.PENDING ? [{
                              label: 'Reject',
                              icon: ActionIcons.reject,
                              onClick: () => {
                                const reason = prompt('Enter rejection reason:')
                                if (reason) handleReject(property.id, reason)
                              },
                              variant: 'danger' as const,
                            }] : []),
                            ...(canSuspendProperty() && property.approval_status === PROPERTY_APPROVAL_STATUS.APPROVED ? [{
                              label: 'Suspend',
                              icon: <AlertTriangle className="h-4 w-4" />,
                              onClick: () => handleSuspend(property.id),
                              variant: 'danger' as const,
                            }] : []),
                          ]}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <DataTablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredProperties.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  )
}
