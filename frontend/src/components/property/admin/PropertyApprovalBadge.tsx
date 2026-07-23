/**
 * PropertyApprovalBadge
 *
 * Displays property approval status badge.
 * Statuses: Draft, Pending, Approved, Rejected, Suspended.
 * Matches admin architecture already defined.
 */

import { Clock, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';

interface PropertyApprovalBadgeProps {
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'suspended';
  size?: 'sm' | 'md' | 'lg';
}

export function PropertyApprovalBadge({ status, size = 'md' }: PropertyApprovalBadgeProps) {
  const config = {
    draft: {
      label: 'Draft',
      icon: FileText,
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-700',
    },
    pending: {
      label: 'Pending',
      icon: Clock,
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
    },
    approved: {
      label: 'Approved',
      icon: CheckCircle,
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
    },
    rejected: {
      label: 'Rejected',
      icon: XCircle,
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
    },
    suspended: {
      label: 'Suspended',
      icon: AlertCircle,
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-800',
    },
  };

  const { label, icon: Icon, bgColor, textColor } = config[status];

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${bgColor} ${textColor} ${sizeClasses[size]}`}>
      <Icon className={iconSizes[size]} />
      {label}
    </span>
  );
}
