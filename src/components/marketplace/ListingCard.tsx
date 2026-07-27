import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, MapPin, Users, BedDouble, Bath } from 'lucide-react';
import { applyImageFallback } from '@/lib/utils';
import { toggleWishlist } from '@/services/listingService';
import type { ListingCard as ListingCardType } from '@/types/listing';

interface ListingCardProps {
  listing: ListingCardType;
  onWishlistChange?: (id: string, isWishlisted: boolean) => void;
}

export function ListingCard({ listing, onWishlistChange }: ListingCardProps) {
  const navigate = useNavigate();
  const [wishlisted, setWishlisted] = useState(listing.isWishlisted || false);
  const [loading, setLoading] = useState(false);

  const handleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      const newState = await toggleWishlist(listing.id);
      setWishlisted(newState);
      onWishlistChange?.(listing.id, newState);
    } catch {
      // User not authenticated — could show auth modal
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    navigate(`/homes/${listing.id}`);
  };

  const priceLabel =
    listing.pricingType === 'monthly'
      ? `$${listing.basePrice}/mo`
      : listing.pricingType === 'sale'
        ? `$${listing.basePrice.toLocaleString()}`
        : `$${listing.basePrice}`;

  return (
    <div
      className="group cursor-pointer rounded-2xl overflow-hidden bg-white transition-all duration-200 hover:shadow-lg"
      onClick={handleClick}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
        <img
          src={listing.primaryImageUrl}
          alt={listing.title}
          onError={(e) => applyImageFallback(e)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Badge */}
        <div className="absolute top-3 left-3">
          <span className="text-xs font-medium bg-white/95 text-gray-800 px-2.5 py-1 rounded-full shadow-sm backdrop-blur-sm">
            {listing.listingType === 'short_stay'
              ? 'Short Stay'
              : listing.listingType === 'long_rent'
                ? 'For Rent'
                : 'For Sale'}
          </span>
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          disabled={loading}
          className="absolute top-3 right-3 p-2 rounded-full transition-all hover:scale-110"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`h-5 w-5 ${wishlisted ? 'fill-[#BA0036] text-[#BA0036]' : 'fill-black/40 text-white'}`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="pt-3 px-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">{listing.title}</h3>
          {listing.rating > 0 && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="h-3.5 w-3.5 fill-gray-800 text-gray-800" />
              <span className="text-sm font-medium text-gray-900">{listing.rating.toFixed(2)}</span>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
          {listing.type.charAt(0).toUpperCase() + listing.type.slice(1)} · {listing.city}
        </p>

        {/* Capacity */}
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
          {listing.maxGuests > 0 && (
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {listing.maxGuests} guests
            </span>
          )}
          {listing.bedrooms > 0 && (
            <span className="flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5" /> {listing.bedrooms} bed{listing.bedrooms > 1 ? 's' : ''}
            </span>
          )}
          {listing.bathrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" /> {listing.bathrooms} bath{listing.bathrooms > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="mt-2.5">
          <span className="font-bold text-gray-900">{priceLabel}</span>
          {listing.pricingType === 'nightly' && (
            <span className="text-sm text-gray-500"> / night</span>
          )}
        </div>
      </div>
    </div>
  );
}
