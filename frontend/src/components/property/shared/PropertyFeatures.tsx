/**
 * PropertyFeatures
 *
 * Displays property features, amenities, and rules.
 * Used in property detail pages.
 */

import { 
  Wifi, 
  Check,
  X
} from 'lucide-react';
import type { Property } from '../../../domain/property/PropertyTypes';

interface PropertyFeaturesProps {
  property: Property;
}

const AMENITY_ICONS: Record<string, React.ElementType> = {
  'wifi': Wifi,
};

export function PropertyFeatures({ property }: PropertyFeaturesProps) {
  const { features } = property;

  const getAmenityIcon = (amenity: string) => {
    const normalized = amenity.toLowerCase();
    return AMENITY_ICONS[normalized] || Check;
  };

  return (
    <div className="space-y-6">
      {/* Amenities */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h2>
        {features.amenities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {features.amenities.map((amenity, index) => {
              const Icon = getAmenityIcon(amenity);
              return (
                <div key={index} className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">{amenity}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500">No amenities listed</p>
        )}
      </div>

      {/* House Rules */}
      {features.rules.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">House Rules</h2>
          <div className="space-y-2">
            {features.rules.map((rule, index) => (
              <div key={index} className="flex items-start gap-3">
                <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{rule}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Property Details */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Bedrooms</div>
            <div className="text-lg font-semibold text-gray-900">{features.bedrooms}</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Bathrooms</div>
            <div className="text-lg font-semibold text-gray-900">{features.bathrooms}</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Max Guests</div>
            <div className="text-lg font-semibold text-gray-900">{features.maxGuests}</div>
          </div>
          {features.squareFeet && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Square Feet</div>
              <div className="text-lg font-semibold text-gray-900">{features.squareFeet}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
