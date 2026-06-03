/**
 * PropertyActionsMenu
 *
 * Actions menu for property management.
 * Supports: Edit, Delete, Feature, Approve, Reject, Suspend, View.
 * Permission-aware.
 */

import { useState } from 'react';
import { MoreVertical, Edit, Trash2, Star, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';

interface PropertyActionsMenuProps {
  propertyId: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onFeature?: (id: string) => void;
  onUnfeature?: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onSuspend?: (id: string) => void;
  onUnsuspend?: (id: string) => void;
  onView?: (id: string) => void;
  isFeatured?: boolean;
  isApproved?: boolean;
  isSuspended?: boolean;
  permissions?: {
    canEdit?: boolean;
    canDelete?: boolean;
    canFeature?: boolean;
    canApprove?: boolean;
    canSuspend?: boolean;
  };
}

export function PropertyActionsMenu({
  propertyId,
  onEdit,
  onDelete,
  onFeature,
  onUnfeature,
  onApprove,
  onReject,
  onSuspend,
  onUnsuspend,
  onView,
  isFeatured = false,
  isApproved = false,
  isSuspended = false,
  permissions = {},
}: PropertyActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const {
    canEdit = true,
    canDelete = true,
    canFeature = true,
    canApprove = true,
    canSuspend = true,
  } = permissions;

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <MoreVertical className="w-5 h-5 text-gray-500" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="py-1">
              {/* View */}
              {onView && (
                <button
                  onClick={() => handleAction(() => onView(propertyId))}
                  className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-50 text-gray-700"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
              )}

              {/* Edit */}
              {canEdit && onEdit && (
                <button
                  onClick={() => handleAction(() => onEdit(propertyId))}
                  className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-50 text-gray-700"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              )}

              {/* Feature/Unfeature */}
              {canFeature && (
                <>
                  {!isFeatured && onFeature && (
                    <button
                      onClick={() => handleAction(() => onFeature(propertyId))}
                      className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-50 text-gray-700"
                    >
                      <Star className="w-4 h-4" />
                      Feature
                    </button>
                  )}
                  {isFeatured && onUnfeature && (
                    <button
                      onClick={() => handleAction(() => onUnfeature(propertyId))}
                      className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-50 text-gray-700"
                    >
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      Unfeature
                    </button>
                  )}
                </>
              )}

              {/* Approve */}
              {canApprove && !isApproved && onApprove && (
                <button
                  onClick={() => handleAction(() => onApprove(propertyId))}
                  className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-50 text-green-700"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
              )}

              {/* Reject */}
              {canApprove && onReject && (
                <button
                  onClick={() => handleAction(() => onReject(propertyId))}
                  className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-50 text-red-700"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              )}

              {/* Suspend/Unsuspend */}
              {canSuspend && (
                <>
                  {!isSuspended && onSuspend && (
                    <button
                      onClick={() => handleAction(() => onSuspend(propertyId))}
                      className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-50 text-orange-700"
                    >
                      <AlertCircle className="w-4 h-4" />
                      Suspend
                    </button>
                  )}
                  {isSuspended && onUnsuspend && (
                    <button
                      onClick={() => handleAction(() => onUnsuspend(propertyId))}
                      className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-50 text-green-700"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Unsuspend
                    </button>
                  )}
                </>
              )}

              {/* Delete */}
              {canDelete && onDelete && (
                <>
                  <div className="border-t border-gray-200 my-1" />
                  <button
                    onClick={() => handleAction(() => onDelete(propertyId))}
                    className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-50 text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
