import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin } from 'lucide-react';
import { ListingCard } from '@/components/marketplace/ListingCard';
import { getWishlist } from '@/services/listingService';
import type { WishlistItem } from '@/types/listing';

export default function WishlistPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWishlist()
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#BA0036]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">My Wishlist</h1>
        <p className="text-sm text-gray-500 mb-6">{items.length} saved {items.length === 1 ? 'home' : 'homes'}</p>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">No saved homes yet</h3>
            <p className="text-sm text-gray-500 mt-1">Tap the heart icon on any listing to save it for later</p>
            <button
              onClick={() => navigate('/explore')}
              className="mt-4 px-6 py-2.5 text-sm font-semibold text-white bg-[#BA0036] rounded-full hover:bg-[#9a0028] transition-colors"
            >
              Explore homes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <ListingCard key={item.id} listing={item.listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
