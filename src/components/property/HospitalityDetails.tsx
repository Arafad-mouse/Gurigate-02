import type { HospitalityDetails } from '@/types/propertyDetails';

interface Props {
  details: HospitalityDetails;
}

export function HospitalityDetails({ details }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-[26px] font-semibold text-[#222222]">Hospitality Details</h2>
      
      <div className="border-b border-[#DDDDDD] py-4">
        <p className="text-sm text-gray-500 mb-1">Total Rooms</p>
        <p className="text-base text-[#222222]">{details.total_rooms}</p>
      </div>

      <div className="border-b border-[#DDDDDD] py-4">
        <p className="text-sm text-gray-500 mb-1">Total Floors</p>
        <p className="text-base text-[#222222]">{details.total_floors}</p>
      </div>

      <div className="border-b border-[#DDDDDD] py-4">
        <p className="text-sm text-gray-500 mb-1">Max Guests</p>
        <p className="text-base text-[#222222]">{details.max_guests}</p>
      </div>

      {details.check_in_time && (
        <div className="border-b border-[#DDDDDD] py-4">
          <p className="text-sm text-gray-500 mb-1">Check-In Time</p>
          <p className="text-base text-[#222222]">{details.check_in_time}</p>
        </div>
      )}

      {details.check_out_time && (
        <div className="border-b border-[#DDDDDD] py-4">
          <p className="text-sm text-gray-500 mb-1">Check-Out Time</p>
          <p className="text-base text-[#222222]">{details.check_out_time}</p>
        </div>
      )}

      {details.facilities && details.facilities.length > 0 && (
        <div className="border-b border-[#DDDDDD] py-4">
          <p className="text-sm text-gray-500 mb-3">Facilities</p>
          <div className="flex flex-wrap gap-2">
            {details.facilities.map((facility, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-gray-100 text-sm text-[#222222] rounded-full"
              >
                {facility}
              </span>
            ))}
          </div>
        </div>
      )}

      {details.services && details.services.length > 0 && (
        <div className="border-b border-[#DDDDDD] py-4">
          <p className="text-sm text-gray-500 mb-3">Services</p>
          <div className="flex flex-wrap gap-2">
            {details.services.map((service, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-gray-100 text-sm text-[#222222] rounded-full"
              >
                {service}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="border-b border-[#DDDDDD] py-4">
        <p className="text-sm text-gray-500 mb-1">Booking Mode</p>
        <p className="text-base text-[#222222] capitalize">{details.booking_mode}</p>
      </div>

      <div className="border-b border-[#DDDDDD] py-4">
        <p className="text-sm text-gray-500 mb-1">Instant Booking</p>
        <p className="text-base text-[#222222]">{details.instant_booking ? 'Enabled' : 'Disabled'}</p>
      </div>

      <div className="border-b border-[#DDDDDD] py-4">
        <p className="text-sm text-gray-500 mb-1">Minimum Stay</p>
        <p className="text-base text-[#222222]">{details.min_stay_nights} nights</p>
      </div>

      <div className="py-4">
        <p className="text-sm text-gray-500 mb-1">Maximum Stay</p>
        <p className="text-base text-[#222222]">{details.max_stay_nights} nights</p>
      </div>
    </div>
  );
}
