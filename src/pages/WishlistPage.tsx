/**
 * Wishlist Page
 *
 * User's saved properties wishlist.
 * Uses PropertyGrid component.
 */

import { useContext } from 'react';
// TODO: Restore these imports when frontend components are available
// import { PropertyGrid } from '../../frontend/src/components/property/layouts/PropertyGrid';
// import type { PropertyCardViewModel } from '../../frontend/src/view-models/property/PropertyCardViewModel';
// import { PropertyCardViewModelMapper } from '../../frontend/src/view-models/property/PropertyCardViewModel';
// import { useWishlist } from '../../frontend/src/hooks/useWishlist';
import { AuthContext } from '@/lib/auth-context';

export function WishlistPage() {
  const authContext = useContext(AuthContext);
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Wishlist</h1>
      <p className="text-gray-600">Wishlist page is under construction</p>
    </div>
  );
}
