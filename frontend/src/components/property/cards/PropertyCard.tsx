/**
 * PropertyCard
 *
 * Displays property information in a card format.
 * Consumes PropertyCardViewModel.
 * Used by: Marketplace, Featured Properties, Wishlist, Search Results, Owner Listings
 */

import { Heart, Star, MapPin, Bed, Bath, Maximize } from 'lucide-react';
import type { PropertyCardViewModel } from '../../../view-models/property/PropertyCardViewModel';

interface PropertyCardProps {
  viewModel: PropertyCardViewModel;
  onClick?: () => void;
  onWishlistToggle?: () => void;
  showWishlistButton?: boolean;
}

export function PropertyCard({
  viewModel,
  onClick,
  onWishlistToggle,
  showWishlistButton = true,
}: PropertyCardProps) {
  const {
    // id,
    title,
    coverImage,
    city,
    district,
    badge,
    priceDisplay,
    bedrooms,
    bathrooms,
    areaDisplay,
    rating,
    reviewCount,
    isFeatured,
    isWishlisted,
  } = viewModel;

  const getBadgeColor = () => {
    switch (badge) {
      case 'FOR SALE':
        return 'bg-blue-100 text-blue-800';
      case 'FOR RENT':
        return 'bg-green-100 text-green-800';
      case 'SHORT STAY':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={coverImage}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 text-xs font-semibold rounded ${getBadgeColor()}`}>
            {badge}
          </span>
        </div>

        {/* Featured Badge */}
        {isFeatured && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-800">
              Featured
            </span>
          </div>
        )}

        {/* Wishlist Button */}
        {showWishlistButton && onWishlistToggle && (
          <button
            className="absolute bottom-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onWishlistToggle();
            }}
          >
            <Heart
              className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
            />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Location */}
        <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
          <MapPin className="w-4 h-4" />
          <span>{city}</span>
          {district && <span>, {district}</span>}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{title}</h3>

        {/* Price */}
        <div className="text-lg font-bold text-gray-900 mb-3">{priceDisplay}</div>

        {/* Features */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4" />
            <span>{bedrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-4 h-4" />
            <span>{bathrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Maximize className="w-4 h-4" />
            <span>{areaDisplay}</span>
          </div>
        </div>

        {/* Rating */}
        {reviewCount > 0 && (
          <div className="flex items-center gap-1 text-sm">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{rating.toFixed(1)}</span>
            <span className="text-gray-500">({reviewCount} reviews)</span>
          </div>
        )}
      </div>
    </div>
  );
}
