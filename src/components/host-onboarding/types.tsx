export interface HostFormData {
  // Step 2: Property category
  propertyCategory: string;
  // Step 3: Property type
  propertyTypes: string[];
  // Listing type: short_stay | long_rent | sale
  listingType: string;
  // Step 4-5: Location
  address: string;
  streetAddress: string;
  apt: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  showPreciseLocation: boolean;
  // Step 6: Basics
  guests: number;
  bedrooms: number;
  beds: number;
  bedroomLock: string;
  // Step 7: Bathrooms
  privateBathrooms: number;
  dedicatedBathrooms: number;
  sharedBathrooms: number;
  // Step 8: Other occupants
  otherOccupants: string[];
  // Step 10: Amenities
  amenities: string[];
  // Step 11-12: Photos
  photos: string[];
  // Step 13: Title
  title: string;
  // Step 14: Description highlights
  highlights: string[];
  // Step 16: Booking settings
  bookingSetting: string;
  // Step 17: Safety
  safetyItems: string[];
  // Step 18: Final details
  residentialStreet: string;
  residentialApt: string;
  residentialCity: string;
  residentialProvince: string;
  residentialPostalCode: string;
  residentialCountry: string;
  hostingAsBusiness: string;
  // Commercial details
  commercialFloorArea: number;
  commercialFloors: number;
  commercialParkingSpaces: number;
  commercialWashrooms: number;
  commercialStorageRooms: number;
  commercialUseTypes: string[];
  commercialMonthlyRent: number;
  commercialSecurityDeposit: number;
  commercialMinimumLeaseMonths: number;
  commercialServiceCharge: number;
  // Land details
  landSizeValue: number;
  landSizeUnit: "sqm" | "acres" | "hectares";
  landFeatures: string[];
  boundaryGeojson: string;
  ownershipDocuments: string[];
  // Hospitality details
  hospitalityTotalRooms: number;
  hospitalityTotalFloors: number;
  hospitalityMaxGuests: number;
  hospitalityCheckInTime: string;
  hospitalityCheckOutTime: string;
  hospitalityRoomTypes: string[];
  hospitalityServices: string[];
  hospitalityFacilities: string[];
  hospitalityInstantBooking: boolean;
  hospitalityBookingMode: "instant" | "manual";
  hospitalityMinStayNights: number;
  hospitalityMaxStayNights: number;
}

export const defaultFormData: HostFormData = {
  propertyCategory: "",
  propertyTypes: [],
  listingType: "short_stay",
  address: "",
  streetAddress: "",
  apt: "",
  city: "",
  province: "",
  postalCode: "",
  country: "Somalia - SO",
  showPreciseLocation: true,
  guests: 2,
  bedrooms: 1,
  beds: 1,
  bedroomLock: "",
  privateBathrooms: 0,
  dedicatedBathrooms: 0,
  sharedBathrooms: 0,
  otherOccupants: [],
  amenities: [],
  photos: [],
  title: "",
  highlights: [],
  bookingSetting: "",
  safetyItems: [],
  residentialStreet: "",
  residentialApt: "",
  residentialCity: "",
  residentialProvince: "",
  residentialPostalCode: "",
  residentialCountry: "Somalia",
  hostingAsBusiness: "",
  commercialFloorArea: 0,
  commercialFloors: 1,
  commercialParkingSpaces: 0,
  commercialWashrooms: 0,
  commercialStorageRooms: 0,
  commercialUseTypes: [],
  commercialMonthlyRent: 0,
  commercialSecurityDeposit: 0,
  commercialMinimumLeaseMonths: 1,
  commercialServiceCharge: 0,
  landSizeValue: 0,
  landSizeUnit: "sqm",
  landFeatures: [],
  boundaryGeojson: "",
  ownershipDocuments: [],
  hospitalityTotalRooms: 0,
  hospitalityTotalFloors: 1,
  hospitalityMaxGuests: 1,
  hospitalityCheckInTime: "14:00",
  hospitalityCheckOutTime: "11:00",
  hospitalityRoomTypes: [],
  hospitalityServices: [],
  hospitalityFacilities: [],
  hospitalityInstantBooking: false,
  hospitalityBookingMode: "manual",
  hospitalityMinStayNights: 1,
  hospitalityMaxStayNights: 30,
};
