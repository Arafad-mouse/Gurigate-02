import { STATUS_BADGE_COLORS, STATUS_LABELS } from '@/constants/status'

interface StatusBadgeProps {
  status: string
  category: 'PROPERTY' | 'BOOKING' | 'PAYMENT' | 'VERIFICATION' | 'ROLE'
}

/**
 * Reusable Status Badge Component
 * Displays status with appropriate color coding and labels
 */
export function StatusBadge({ status, category }: StatusBadgeProps) {
  const getBadgeColor = (status: string, category: string): string => {
    const colors = STATUS_BADGE_COLORS[category as keyof typeof STATUS_BADGE_COLORS]
    if (!colors) return 'bg-gray-100 text-gray-800'
    
    const color = colors[status as keyof typeof colors]
    return color || 'bg-gray-100 text-gray-800'
  }

  const getLabel = (status: string, category: string): string => {
    const labels = STATUS_LABELS[category as keyof typeof STATUS_LABELS]
    if (!labels) return status
    
    const label = labels[status as keyof typeof labels]
    return label || status
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeColor(status, category)}`}>
      {getLabel(status, category)}
    </span>
  )
}
