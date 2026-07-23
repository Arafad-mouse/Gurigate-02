/**
 * PropertyEmptyState
 *
 * Shared empty state component for property lists and grids.
 * Used when no properties are found or available.
 */

import { Home, Plus } from 'lucide-react';

interface PropertyEmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'search' | 'list' | 'wishlist';
}

export function PropertyEmptyState({
  title = 'No properties found',
  description = 'Try adjusting your search or filters to find what you are looking for.',
  actionLabel,
  onAction,
  variant = 'search',
}: PropertyEmptyStateProps) {
  const getVariantContent = () => {
    switch (variant) {
      case 'search':
        return {
          icon: Home,
          title: title || 'No properties found',
          description: description || 'Try adjusting your search or filters to find what you are looking for.',
        };
      case 'list':
        return {
          icon: Home,
          title: title || 'No properties yet',
          description: description || 'Get started by adding your first property.',
        };
      case 'wishlist':
        return {
          icon: Home,
          title: title || 'Your wishlist is empty',
          description: description || 'Save properties you love by clicking the heart icon.',
        };
      default:
        return {
          icon: Home,
          title,
          description,
        };
    }
  };

  const { icon: Icon } = getVariantContent();
  const content = getVariantContent();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{content.title}</h3>
      <p className="text-gray-500 max-w-sm mb-6">{content.description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
