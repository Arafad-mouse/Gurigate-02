import { Search, X } from 'lucide-react'

interface FilterOption {
  label: string
  value: string
}

interface FilterBarProps {
  searchValue?: string
  onSearchChange?: (value: string) => void
  filters?: Array<{
    key: string
    label: string
    options: FilterOption[]
    value?: string
    onChange: (value: string) => void
  }>
  onClearFilters?: () => void
}

/**
 * Filter Bar Component
 * Provides search and filter controls for data tables
 */
export function FilterBar({
  searchValue = '',
  onSearchChange,
  filters = [],
  onClearFilters,
}: FilterBarProps) {
  const hasActiveFilters = filters.some((f) => f.value) || searchValue

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        {onSearchChange && (
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Filters */}
        {filters.map((filter) => (
          <div key={filter.key} className="lg:w-48">
            <select
              value={filter.value || ''}
              onChange={(e) => filter.onChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{filter.label}</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {/* Clear Button */}
        {hasActiveFilters && onClearFilters && (
          <button
            onClick={onClearFilters}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
