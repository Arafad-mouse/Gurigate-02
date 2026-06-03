import { PROPERTY_APPROVAL_STATUS } from '@/constants/status'

interface ApprovalBadgeProps {
  status: string
}

/**
 * Approval Badge Component
 * Displays property approval status with appropriate color coding
 */
export function ApprovalBadge({ status }: ApprovalBadgeProps) {
  const getBadgeColor = (status: string): string => {
    switch (status) {
      case PROPERTY_APPROVAL_STATUS.DRAFT:
        return 'bg-gray-100 text-gray-800'
      case PROPERTY_APPROVAL_STATUS.PENDING:
        return 'bg-yellow-100 text-yellow-800'
      case PROPERTY_APPROVAL_STATUS.APPROVED:
        return 'bg-green-100 text-green-800'
      case PROPERTY_APPROVAL_STATUS.REJECTED:
        return 'bg-red-100 text-red-800'
      case PROPERTY_APPROVAL_STATUS.SUSPENDED:
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getLabel = (status: string): string => {
    switch (status) {
      case PROPERTY_APPROVAL_STATUS.DRAFT:
        return 'Draft'
      case PROPERTY_APPROVAL_STATUS.PENDING:
        return 'Pending Approval'
      case PROPERTY_APPROVAL_STATUS.APPROVED:
        return 'Approved'
      case PROPERTY_APPROVAL_STATUS.REJECTED:
        return 'Rejected'
      case PROPERTY_APPROVAL_STATUS.SUSPENDED:
        return 'Suspended'
      default:
        return status
    }
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeColor(status)}`}>
      {getLabel(status)}
    </span>
  )
}
