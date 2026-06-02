export interface HostFormData {
  // Step 3: Property type
  propertyTypes: string[];
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
}

export const defaultFormData: HostFormData = {
  propertyTypes: [],
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
};
