import type { LandDetails } from '@/types/propertyDetails';

interface Props {
  details: LandDetails;
}

export function LandDetails({ details }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-[26px] font-semibold text-[#222222]">Land Details</h2>
      
      {details.size_value && (
        <div className="border-b border-[#DDDDDD] py-4">
          <p className="text-sm text-gray-500 mb-1">Plot Size</p>
          <p className="text-base text-[#222222]">
            {details.size_value} {details.size_unit}
          </p>
        </div>
      )}

      {details.land_features && details.land_features.length > 0 && (
        <div className="border-b border-[#DDDDDD] py-4">
          <p className="text-sm text-gray-500 mb-3">Land Features</p>
          <div className="flex flex-wrap gap-2">
            {details.land_features.map((feature, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-gray-100 text-sm text-[#222222] rounded-full"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      )}

      {details.boundary_geojson && (
        <div className="border-b border-[#DDDDDD] py-4">
          <p className="text-sm text-gray-500 mb-1">Boundary Map</p>
          <div className="mt-2 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
            Boundary data available (GeoJSON)
          </div>
        </div>
      )}
    </div>
  );
}
