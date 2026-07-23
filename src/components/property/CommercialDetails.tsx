import type { CommercialDetails } from '@/types/propertyDetails';

interface Props {
  details: CommercialDetails;
}

export function CommercialDetails({ details }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-[26px] font-semibold text-[#222222]">Commercial Details</h2>
      
      {details.floor_area && (
        <div className="border-b border-[#DDDDDD] py-4">
          <p className="text-sm text-gray-500 mb-1">Floor Area</p>
          <p className="text-base text-[#222222]">{details.floor_area} sqm</p>
        </div>
      )}

      <div className="border-b border-[#DDDDDD] py-4">
        <p className="text-sm text-gray-500 mb-1">Floors</p>
        <p className="text-base text-[#222222]">{details.floors}</p>
      </div>

      <div className="border-b border-[#DDDDDD] py-4">
        <p className="text-sm text-gray-500 mb-1">Parking Spaces</p>
        <p className="text-base text-[#222222]">{details.parking_spaces}</p>
      </div>

      <div className="border-b border-[#DDDDDD] py-4">
        <p className="text-sm text-gray-500 mb-1">Washrooms</p>
        <p className="text-base text-[#222222]">{details.washrooms}</p>
      </div>

      <div className="border-b border-[#DDDDDD] py-4">
        <p className="text-sm text-gray-500 mb-1">Storage Rooms</p>
        <p className="text-base text-[#222222]">{details.storage_rooms}</p>
      </div>

      {details.commercial_use_type && details.commercial_use_type.length > 0 && (
        <div className="py-4">
          <p className="text-sm text-gray-500 mb-3">Business Suitability</p>
          <div className="flex flex-wrap gap-2">
            {details.commercial_use_type.map((useType, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-gray-100 text-sm text-[#222222] rounded-full"
              >
                {useType}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
