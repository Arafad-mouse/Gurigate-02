import { MoreVertical, Edit, Eye, Trash2, Ban, CheckCircle, XCircle } from 'lucide-react'
import { useState } from 'react'

interface Action {
  label: string
  icon: React.ReactNode
  onClick: () => void
  variant?: 'default' | 'danger' | 'success'
  disabled?: boolean
}

interface RowActionsProps {
  actions: Action[]
}

/**
 * Reusable Row Actions Component
 * Provides dropdown menu for row-level actions in admin tables
 */
export function RowActions({ actions }: RowActionsProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
        title="Actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.onClick()
                  setIsOpen(false)
                }}
                disabled={action.disabled}
                className={`flex items-center gap-2 w-full px-4 py-2 text-sm ${
                  action.variant === 'danger'
                    ? 'text-red-600 hover:bg-red-50'
                    : action.variant === 'success'
                    ? 'text-green-600 hover:bg-green-50'
                    : 'text-gray-700 hover:bg-gray-50'
                } ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Common action icons
export const ActionIcons = {
  edit: <Edit className="h-4 w-4" />,
  view: <Eye className="h-4 w-4" />,
  delete: <Trash2 className="h-4 w-4" />,
  ban: <Ban className="h-4 w-4" />,
  approve: <CheckCircle className="h-4 w-4" />,
  reject: <XCircle className="h-4 w-4" />,
}
