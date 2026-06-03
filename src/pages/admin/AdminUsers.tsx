import { useState, useEffect } from 'react'
import { useContext } from 'react'
import { AuthContext } from '@/lib/auth-context'
import { usePermissions } from '@/hooks/usePermissions'
import { AdminService } from '@/services/adminService'
import type { AdminUser } from '@/services/adminService'
import { StatusBadge } from '@/components/admin/table/StatusBadge'
import { SearchInput } from '@/components/admin/table/SearchInput'
import { DataTableFilters } from '@/components/admin/table/DataTableFilters'
import { DataTablePagination } from '@/components/admin/table/DataTablePagination'
import { EmptyState } from '@/components/admin/table/EmptyState'
import { RowActions, ActionIcons } from '@/components/admin/table/RowActions'
import { USER_ROLE, VERIFICATION_STATUS } from '@/constants/status'
import { Users, Ban, CheckCircle, Shield } from 'lucide-react'

export function AdminUsers() {
  const authContext = useContext(AuthContext)
  const { canBanUser, canUnbanUser, canVerifyHost } = usePermissions()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const adminId = authContext?.profile?.id

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await AdminService.getAllUsers()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleBanUser = async (userId: string, reason: string) => {
    if (!adminId) return
    try {
      await AdminService.banUser(userId, adminId, reason)
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to ban user')
    }
  }

  const handleUnbanUser = async (userId: string) => {
    if (!adminId) return
    try {
      await AdminService.unbanUser(userId)
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unban user')
    }
  }

  const handleVerifyHost = async (userId: string) => {
    if (!adminId) return
    try {
      await AdminService.verifyHost(userId, adminId)
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify host')
    }
  }

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = !roleFilter || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

  const roleOptions = [
    { value: USER_ROLE.GUEST, label: 'Guest' },
    { value: USER_ROLE.HOST, label: 'Host' },
    { value: USER_ROLE.MANAGER, label: 'Manager' },
    { value: USER_ROLE.ADMIN, label: 'Admin' },
    { value: USER_ROLE.SUPER_ADMIN, label: 'Super Admin' },
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
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-1">Manage users, roles, and verification</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <SearchInput
            onSearch={setSearchQuery}
            placeholder="Search users by name or email..."
          />
        </div>
        <DataTableFilters
          filters={[
            {
              key: 'role',
              label: 'Role',
              options: roleOptions,
            },
          ]}
          activeFilters={{ role: roleFilter }}
          onFilterChange={(_key, value) => setRoleFilter(value)}
          onClearFilters={() => {
            setRoleFilter('')
            setSearchQuery('')
          }}
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {paginatedUsers.length === 0 ? (
          <EmptyState
            title="No users found"
            description="No users match your current filters."
            icon={<Users />}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Properties
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bookings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {user.avatar_url ? (
                              <img
                                className="h-10 w-10 rounded-full"
                                src={user.avatar_url}
                                alt=""
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                                {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={user.role} category="ROLE" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <StatusBadge status={user.verification_status} category="VERIFICATION" />
                          {user.is_banned && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                              <Ban className="h-3 w-3 mr-1" />
                              Banned
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        0
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        0
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <RowActions
                          actions={[
                            ...(canVerifyHost() && user.role === USER_ROLE.HOST && user.verification_status !== VERIFICATION_STATUS.VERIFIED && !user.is_banned ? [{
                              label: 'Verify',
                              icon: <Shield className="h-4 w-4" />,
                              onClick: () => handleVerifyHost(user.id),
                              variant: 'success' as const,
                            }] : []),
                            ...(canBanUser() && !user.is_banned && user.role !== USER_ROLE.SUPER_ADMIN ? [{
                              label: 'Ban',
                              icon: ActionIcons.ban,
                              onClick: () => {
                                const reason = prompt('Enter ban reason:')
                                if (reason) handleBanUser(user.id, reason)
                              },
                              variant: 'danger' as const,
                            }] : []),
                            ...(canUnbanUser() && user.is_banned ? [{
                              label: 'Unban',
                              icon: <CheckCircle className="h-4 w-4" />,
                              onClick: () => handleUnbanUser(user.id),
                              variant: 'default' as const,
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
              totalItems={filteredUsers.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  )
}
