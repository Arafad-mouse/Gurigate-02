/**
 * PropertyStatusBadge
 *
 * Displays property status badge.
 * Statuses: Active, Inactive, Booked, Sold, Archived.
 */

import { CheckCircle, XCircle, Calendar, DollarSign, Archive } from 'lucide-react';

interface PropertyStatusBadgeProps {
  status: 'active' | 'inactive' | 'booked' | 'sold' | 'archived';
  size?: 'sm' | 'md' | 'lg';
}

export function PropertyStatusBadge({ status, size = 'md' }: PropertyStatusBadgeProps) {
  const config = {
    active: {
      label: 'Active',
      icon: CheckCircle,
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
    },
    inactive: {
      label: 'Inactive',
      icon: XCircle,
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-700',
    },
    booked: {
      label: 'Booked',
      icon: Calendar,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
    },
    sold: {
      label: 'Sold',
      icon: DollarSign,
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-800',
    },
    archived: {
      label: 'Archived',
      icon: Archive,
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
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
