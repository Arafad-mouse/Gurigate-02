import React from 'react';
import { Eye, Edit, FileText, MoreVertical, MapPin, Phone, Mail, DollarSign, Calendar } from 'lucide-react';
import { STATUS_BADGE_COLORS, STATUS_LABELS, CUSTOMER_LIFECYCLE_STATUS, CUSTOMER_TYPE } from '@/constants/status';
import type { Customer } from '@/types/customer';

interface CustomerCardProps {
  customer: Customer;
  onView: () => void;
  onEdit: () => void;
  onAssign: () => void;
  onMore: () => void;
}

function getAvatarInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getAvatarColor(name: string): string {
  const colors = [
    'bg-rose-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-teal-500',
    'bg-indigo-500',
    'bg-pink-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function CustomerCard({ customer, onView, onEdit, onAssign, onMore }: CustomerCardProps) {
  const initials = getAvatarInitials(customer.fullName);
  const avatarColor = getAvatarColor(customer.fullName);
  
  const lifecycleBadgeColor = STATUS_BADGE_COLORS.CUSTOMER_LIFECYCLE[customer.lifecycleStatus as keyof typeof STATUS_BADGE_COLORS.CUSTOMER_LIFECYCLE] || 'bg-gray-100 text-gray-800';
  const typeBadgeColor = STATUS_BADGE_COLORS.CUSTOMER_TYPE[customer.customerType as keyof typeof STATUS_BADGE_COLORS.CUSTOMER_TYPE] || 'bg-gray-100 text-gray-800';
  
  const lifecycleLabel = STATUS_LABELS.CUSTOMER_LIFECYCLE[customer.lifecycleStatus as keyof typeof STATUS_LABELS.CUSTOMER_LIFECYCLE] || customer.lifecycleStatus;
  const typeLabel = STATUS_LABELS.CUSTOMER_TYPE[customer.customerType as keyof typeof STATUS_LABELS.CUSTOMER_TYPE] || customer.customerType;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group">
      {/* Header: Avatar + Name + Badges */}
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar */}
        {customer.avatarUrl ? (
          <img
            src={customer.avatarUrl}
            alt={customer.fullName}
            className="w-14 h-14 rounded-xl object-cover"
          />
        ) : (
          <div className={`w-14 h-14 rounded-xl ${avatarColor} flex items-center justify-center text-white text-xl font-bold`}>
            {initials}
          </div>
        )}
        
        {/* Name and Badges */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 truncate mb-1">{customer.fullName}</h3>
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${typeBadgeColor}`}>
              {typeLabel}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${lifecycleBadgeColor}`}>
              {lifecycleLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Property Information */}
      <div className="flex items-center gap-2 mb-3 text-sm">
        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
        {customer.currentProperty ? (
          <span className="text-gray-700 font-medium truncate">{customer.currentProperty}</span>
        ) : (
          <span className="text-gray-400 italic">No Assigned Property</span>
        )}
      </div>

      {/* Contact Information */}
      <div className="space-y-2 mb-4">
        {customer.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-600">{customer.phone}</span>
          </div>
        )}
        {customer.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-600 truncate">{customer.email}</span>
          </div>
        )}
      </div>

      {/* Financial Information */}
      <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
            <DollarSign className="w-3.5 h-3.5" />
            Outstanding
          </div>
          <div className={`text-sm font-bold ${customer.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(customer.outstandingBalance)}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
            <Calendar className="w-3.5 h-3.5" />
            Lease Ends
          </div>
          <div className="text-sm font-bold text-gray-900">
            {formatDate(customer.lastActivityAt)}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          title="View Customer"
        >
          <Eye className="w-4 h-4" />
          <span>View</span>
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          title="Edit Customer"
        >
          <Edit className="w-4 h-4" />
          <span>Edit</span>
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAssign();
          }}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          title="Assign Property / Lease"
        >
          <FileText className="w-4 h-4" />
          <span>Assign</span>
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMore();
          }}
          className="flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          title="More Options"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
