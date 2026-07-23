import { Filter } from 'lucide-react'

interface FilterOption {
  value: string
  label: string
}

interface DataTableFiltersProps {
  filters: {
    key: string
    label: string
    options: FilterOption[]
  }[]
  activeFilters: Record<string, string>
  onFilterChange: (key: string, value: string) => void
  onClearFilters: () => void
}

/**
 * Reusable Data Table Filters Component
 * Provides filter dropdowns for admin tables
 */
export function DataTableFilters({ filters, activeFilters, onFilterChange, onClearFilters }: DataTableFiltersProps) {
  const hasActiveFilters = Object.keys(activeFilters).length > 0

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-600">Filters:</span>
      </div>
      
      {filters.map((filter) => (
        <select
          key={filter.key}
          value={activeFilters[filter.key] || ''}
          onChange={(e) => onFilterChange(filter.key, e.target.value)}
          className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
        >
          <option value="">{filter.label}</option>
          {filter.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ))}

      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Clear all
        </button>
      )}
    </div>
  )
}
