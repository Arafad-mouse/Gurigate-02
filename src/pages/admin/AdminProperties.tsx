import { useState, useEffect } from 'react'
import { useContext } from 'react'
import { AuthContext } from '@/lib/auth-context'
import { usePermissions } from '@/hooks/usePermissions'
import { AdminService } from '@/services/adminService'
import type { AdminProperty } from '@/services/adminService'
import { StatusBadge } from '@/components/admin/table/StatusBadge'
import { ApprovalBadge } from '@/components/admin/table/ApprovalBadge'
import { SearchInput } from '@/components/admin/table/SearchInput'
import { DataTableFilters } from '@/components/admin/table/DataTableFilters'
import { DataTablePagination } from '@/components/admin/table/DataTablePagination'
import { EmptyState } from '@/components/admin/table/EmptyState'
import { RowActions } from '@/components/admin/table/RowActions'
import { PropertyReviewDrawer } from '@/components/admin/property/PropertyReviewDrawer'
import { PROPERTY_APPROVAL_STATUS } from '@/constants/status'
import { Building2, Star, Eye } from 'lucide-react'

export function AdminProperties() {
  const authContext = useContext(AuthContext)
  const { canFeatureProperty } = usePermissions()
  
  const [properties, setProperties] = useState<AdminProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedProperty, setSelectedProperty] = useState<AdminProperty | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const itemsPerPage = 10

  const adminId = authContext?.profile?.id

  const loadProperties = async () => {
    try {
      setLoading(true)
      setError(null)
      
      let data: AdminProperty[]
      if (statusFilter && statusFilter !== 'all') {
        data = await AdminService.getPropertiesByStatus(statusFilter as any)
      } else {
        data = await AdminService.getAllProperties()
      }
      
      setProperties(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load properties')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProperties()
  }, [statusFilter])

  const handleViewProperty = (property: AdminProperty) => {
    setSelectedProperty(property)
    setIsDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    setSelectedProperty(null)
  }

  const handleRefresh = () => {
    loadProperties()
  }

  // Filter properties
  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.city.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProperties = filteredProperties.slice(startIndex, endIndex)

  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: PROPERTY_APPROVAL_STATUS.DRAFT, label: 'Draft' },
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
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium text-gray-900">{property.title}</div>
                              {property.is_featured && (
                                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{property.city}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <ApprovalBadge status={property.approval_status} />
                          <StatusBadge status={property.status} category="PROPERTY" />
                        </div>
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
                            {
                              label: 'View',
                              icon: <Eye className="h-4 w-4" />,
                              onClick: () => handleViewProperty(property),
                              variant: 'default' as const,
                            },
                            ...(canFeatureProperty() && property.approval_status === PROPERTY_APPROVAL_STATUS.APPROVED ? [
                              property.is_featured ? {
                                label: 'Unfeature',
                                icon: <Star className="h-4 w-4" />,
                                onClick: async () => {
                                  if (!adminId) return
                                  try {
                                    await AdminService.unfeatureProperty(property.id, adminId)
                                    await loadProperties()
                                  } catch (err) {
                                    setError(err instanceof Error ? err.message : 'Failed to unfeature property')
                                  }
                                },
                                variant: 'default' as const,
                              } : {
                                label: 'Feature',
                                icon: <Star className="h-4 w-4" />,
                                onClick: async () => {
                                  if (!adminId) return
                                  try {
                                    await AdminService.featureProperty(property.id, adminId)
                                    await loadProperties()
                                  } catch (err) {
                                    setError(err instanceof Error ? err.message : 'Failed to feature property')
                                  }
                                },
                                variant: 'default' as const,
                              }
                            ] : []),
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

      {/* Property Review Drawer */}
      <PropertyReviewDrawer
        property={selectedProperty}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onRefresh={handleRefresh}
      />
    </div>
  )
}
