/**
 * PropertyFilters
 *
 * Reusable filter panel for property listings.
 * Supports price, bedrooms, bathrooms, amenities, property type, listing type, availability.
 */

import { Bed, Home, DollarSign, ChevronDown, X } from 'lucide-react';
import { useState } from 'react';

interface PropertyFiltersProps {
  onFiltersChange: (filters: FilterValues) => void;
  initialFilters?: FilterValues;
}

interface FilterValues {
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
  listingType?: 'sale' | 'rent' | 'short-stay';
  amenities?: string[];
  availableOnly?: boolean;
}

export function PropertyFilters({
  onFiltersChange,
  initialFilters = {},
}: PropertyFiltersProps) {
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['price', 'features']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const updateFilter = (key: keyof FilterValues, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const cleared: FilterValues = {};
    setFilters(cleared);
    onFiltersChange(cleared);
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined && v !== null && v !== '' && (Array.isArray(v) ? v.length > 0 : true));

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Price Range */}
      <FilterSection
        title="Price Range"
        icon={DollarSign}
        isExpanded={expandedSections.has('price')}
        onToggle={() => toggleSection('price')}
      >
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Min Price</label>
            <input
              type="number"
              placeholder="No minimum"
              value={filters.minPrice || ''}
              onChange={(e) => updateFilter('minPrice', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Max Price</label>
            <input
              type="number"
              placeholder="No maximum"
              value={filters.maxPrice || ''}
              onChange={(e) => updateFilter('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </FilterSection>

      {/* Features */}
      <FilterSection
        title="Features"
        icon={Bed}
        isExpanded={expandedSections.has('features')}
        onToggle={() => toggleSection('features')}
      >
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Bedrooms</label>
            <select
              value={filters.bedrooms || ''}
              onChange={(e) => updateFilter('bedrooms', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Bathrooms</label>
            <select
              value={filters.bathrooms || ''}
              onChange={(e) => updateFilter('bathrooms', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>
        </div>
      </FilterSection>

      {/* Property Type */}
      <FilterSection
        title="Property Type"
        icon={Home}
        isExpanded={expandedSections.has('type')}
        onToggle={() => toggleSection('type')}
      >
        <div className="space-y-2">
          {['apartment', 'house', 'villa', 'studio', 'condo', 'townhouse'].map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="propertyType"
                value={type}
                checked={filters.propertyType === type}
                onChange={(e) => updateFilter('propertyType', e.target.value)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 capitalize">{type}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Listing Type */}
      <FilterSection
        title="Listing Type"
        icon={Home}
        isExpanded={expandedSections.has('listing')}
        onToggle={() => toggleSection('listing')}
      >
        <div className="space-y-2">
          {[
            { value: 'sale', label: 'For Sale' },
            { value: 'rent', label: 'For Rent' },
            { value: 'short-stay', label: 'Short Stay' },
          ].map((type) => (
            <label key={type.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="listingType"
                value={type.value}
                checked={filters.listingType === type.value}
                onChange={(e) => updateFilter('listingType', e.target.value as any)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{type.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Availability */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.availableOnly || false}
            onChange={(e) => updateFilter('availableOnly', e.target.checked)}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Available Only</span>
        </label>
      </div>
    </div>
  );
}

interface FilterSectionProps {
  title: string;
  icon: any;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function FilterSection({ title, icon: Icon, isExpanded, onToggle, children }: FilterSectionProps) {
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>
      {isExpanded && <div className="pb-4">{children}</div>}
    </div>
  );
}
