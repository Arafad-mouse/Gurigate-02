import type { ResidentialDetails } from '@/types/propertyDetails';

interface Props {
  details: ResidentialDetails;
}

export function ResidentialDetails({ details }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-[26px] font-semibold text-[#222222]">Property Details</h2>
      
      <div className="border-b border-[#DDDDDD] py-4">
        <p className="text-sm text-gray-500 mb-1">Guests</p>
        <p className="text-base text-[#222222]">{details.guests}</p>
      </div>

      <div className="border-b border-[#DDDDDD] py-4">
        <p className="text-sm text-gray-500 mb-1">Bedrooms</p>
        <p className="text-base text-[#222222]">{details.bedrooms}</p>
      </div>

      <div className="border-b border-[#DDDDDD] py-4">
        <p className="text-sm text-gray-500 mb-1">Beds</p>
        <p className="text-base text-[#222222]">{details.beds}</p>
      </div>

      <div className="border-b border-[#DDDDDD] py-4">
        <p className="text-sm text-gray-500 mb-1">Private Bathrooms</p>
        <p className="text-base text-[#222222]">{details.private_bathrooms}</p>
      </div>

      <div className="border-b border-[#DDDDDD] py-4">
        <p className="text-sm text-gray-500 mb-1">Dedicated Bathrooms</p>
        <p className="text-base text-[#222222]">{details.dedicated_bathrooms}</p>
      </div>

      <div className="border-b border-[#DDDDDD] py-4">
        <p className="text-sm text-gray-500 mb-1">Shared Bathrooms</p>
        <p className="text-base text-[#222222]">{details.shared_bathrooms}</p>
      </div>

      {details.occupancy_mode && (
        <div className="border-b border-[#DDDDDD] py-4">
          <p className="text-sm text-gray-500 mb-1">Occupancy Mode</p>
          <p className="text-base text-[#222222]">{details.occupancy_mode}</p>
        </div>
      )}

      {details.amenities && details.amenities.length > 0 && (
        <div className="py-4">
          <p className="text-sm text-gray-500 mb-3">Amenities</p>
          <div className="flex flex-wrap gap-2">
            {details.amenities.map((amenity, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-gray-100 text-sm text-[#222222] rounded-full"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
