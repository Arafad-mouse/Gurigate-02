/**
 * Wishlist Page
 *
 * User's saved properties wishlist.
 * Uses PropertyGrid component.
 */

import { useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PropertyGrid } from '../../frontend/src/components/property/layouts/PropertyGrid';
import type { PropertyCardViewModel } from '../../frontend/src/view-models/property/PropertyCardViewModel';
import { PropertyCardViewModelMapper } from '../../frontend/src/view-models/property/PropertyCardViewModel';
import { useWishlist } from '../../frontend/src/hooks/useWishlist';
import { AuthContext } from '@/lib/auth-context';

export function WishlistPage() {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const { wishlist, loading, error, removeFromWishlist } = useWishlist(authContext?.session?.user.id);
  const properties = useMemo(
    () => PropertyCardViewModelMapper.toViewModelList(wishlist, new Set(wishlist.map((property) => property.id))),
    [wishlist]
  );

  const handlePropertyClick = (property: PropertyCardViewModel) => {
    navigate(`/property/${property.id}`);
  };

  const handleWishlistToggle = async (property: PropertyCardViewModel) => {
    await removeFromWishlist(property.id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Wishlist</h1>
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error.message}
          </div>
        )}
        
        <PropertyGrid
          viewModels={properties}
          loading={loading}
          onPropertyClick={handlePropertyClick}
          onWishlistToggle={handleWishlistToggle}
          emptyStateVariant="wishlist"
          emptyStateActionLabel="Browse Properties"
          onEmptyStateAction={() => navigate('/marketplace')}
        />
      </div>
    </div>
  );
}
