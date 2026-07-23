/**
 * PropertyOverview
 *
 * Displays property overview information including title, location, price, and key details.
 * Used in property detail pages.
 */

import { MapPin, Star, User } from 'lucide-react';
import type { Property } from '../../../domain/property/PropertyTypes';

interface PropertyOverviewProps {
  property: Property;
}

export function PropertyOverview({ property }: PropertyOverviewProps) {
  const { title, description, address, pricing, features, rating, reviewCount, ownerName } = property;

  return (
    <div className="space-y-6">
      {/* Title and Location */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="w-5 h-5" />
          <span className="text-lg">
            {address.city}, {address.country}
          </span>
        </div>
      </div>

      {/* Rating and Reviews */}
      {reviewCount > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="text-lg font-semibold">{rating.toFixed(1)}</span>
          </div>
          <span className="text-gray-600">
            · {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
          </span>
        </div>
      )}

      {/* Host Info */}
      <div className="flex items-center gap-2 text-gray-600">
        <User className="w-5 h-5" />
        <span>Hosted by {ownerName}</span>
      </div>

      {/* Price */}
      <div className="border-t border-b border-gray-200 py-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900">
            ${pricing.basePrice}
          </span>
          <span className="text-gray-600">
            {pricing.pricingType === 'nightly' && 'per night'}
            {pricing.pricingType === 'monthly' && 'per month'}
            {pricing.pricingType === 'sale' && 'total'}
          </span>
        </div>
        {pricing.serviceFee && (
          <p className="text-sm text-gray-500 mt-1">
            + ${pricing.serviceFee} service fee
          </p>
        )}
        {pricing.cleaningFee && (
          <p className="text-sm text-gray-500">
            + ${pricing.cleaningFee} cleaning fee
          </p>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{features.bedrooms}</div>
          <div className="text-sm text-gray-600">Bedrooms</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{features.bathrooms}</div>
          <div className="text-sm text-gray-600">Bathrooms</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{features.maxGuests}</div>
          <div className="text-sm text-gray-600">Guests</div>
        </div>
        {features.squareFeet && (
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{features.squareFeet}</div>
            <div className="text-sm text-gray-600">Sq Ft</div>
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-3">About this property</h2>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{description}</p>
      </div>
    </div>
  );
}
