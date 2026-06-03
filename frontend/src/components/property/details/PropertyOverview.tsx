/**
 * PropertyOverview
 *
 * Displays property overview information.
 * Shows title, address, price, badge, owner, views, created date.
 */

import { MapPin, Calendar, Eye, User, Star } from 'lucide-react';
import type { PropertyDetailViewModel } from '../../../view-models/property/PropertyDetailViewModel';

interface PropertyOverviewProps {
  viewModel: PropertyDetailViewModel;
}

export function PropertyOverview({ viewModel }: PropertyOverviewProps) {
  const {
    title,
    badgeLabel,
    statusLabel,
    priceDisplay,
    street,
    city,
    state,
    country,
    ownerName,
    viewCount,
    rating,
    reviewCount,
    createdAt,
    isFeatured,
  } = viewModel;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 text-sm font-semibold rounded bg-blue-100 text-blue-800">
                {badgeLabel}
              </span>
              {isFeatured && (
                <span className="px-3 py-1 text-sm font-semibold rounded bg-yellow-100 text-yellow-800">
                  Featured
                </span>
              )}
              <span className="px-3 py-1 text-sm font-medium rounded bg-gray-100 text-gray-700">
                {statusLabel}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{priceDisplay}</div>
          </div>
        </div>

        {/* Address */}
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="w-5 h-5" />
          <span className="text-lg">
            {street}, {city}
            {state && `, ${state}`}
            {`, ${country}`}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-6 py-4 border-y border-gray-200">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-gray-400" />
          <div>
            <div className="text-sm text-gray-500">Views</div>
            <div className="font-semibold text-gray-900">{viewCount.toLocaleString()}</div>
          </div>
        </div>

        {reviewCount > 0 && (
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <div>
              <div className="text-sm text-gray-500">Rating</div>
              <div className="font-semibold text-gray-900">
                {rating.toFixed(1)} <span className="text-gray-500">({reviewCount} reviews)</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-gray-400" />
          <div>
            <div className="text-sm text-gray-500">Owner</div>
            <div className="font-semibold text-gray-900">{ownerName}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <div>
            <div className="text-sm text-gray-500">Listed</div>
            <div className="font-semibold text-gray-900">{createdAt}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
