// Property types following GuriGate system rules

export interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  status: PropertyStatus;
  address: PropertyAddress;
  pricing: PropertyPricing;
  features: PropertyFeatures;
  images: string[];
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface PropertyAddress {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface PropertyPricing {
  base_price: number;
  currency: string;
  pricing_type: 'nightly' | 'monthly' | 'sale';
  security_deposit?: number;
  cleaning_fee?: number;
  service_fee?: number;
  taxes?: number;
}

export interface PropertyFeatures {
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  square_feet?: number;
  amenities: string[];
  rules: string[];
}

export type PropertyType = 
  | 'apartment'
  | 'house'
  | 'villa'
  | 'studio'
  | 'condo'
  | 'townhouse'
  | 'cottage'
  | 'penthouse'
  | 'loft'
  | 'other';

export type PropertyStatus = 
  | 'available'
  | 'occupied'
  | 'maintenance'
  | 'pending'
  | 'inactive';

// Form submission interface
export interface CreatePropertyRequest {
  title: string;
  description: string;
  type: PropertyType;
  address: Omit<PropertyAddress, 'coordinates'>;
  pricing: Omit<PropertyPricing, 'taxes'>;
  features: Omit<PropertyFeatures, 'amenities' | 'rules'> & {
    amenities: string[];
    rules: string[];
  };
}

// Validation schema
export const PROPERTY_TYPES: PropertyType[] = [
  'apartment', 'house', 'villa', 'studio', 'condo', 
  'townhouse', 'cottage', 'penthouse', 'loft', 'other'
];

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: 'â\x82¬', name: 'Euro' },
  { code: 'GBP', symbol: 'Â£', name: 'British Pound' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'NGN', symbol: 'â\x82¦', name: 'Nigerian Naira' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
];

export const COMMON_AMENITIES = [
  'WiFi', 'Air Conditioning', 'Kitchen', 'Parking', 'Pool',
  'Gym', 'Laundry', 'TV', 'Workspace', 'Breakfast',
  'Pet Friendly', 'Smoking Allowed', 'Wheelchair Accessible',
  'Elevator', 'Balcony', 'Garden', 'Security System'
];

export const COMMON_RULES = [
  'No smoking', 'No parties', 'No pets', 'Quiet hours',
  'Check-in after 3 PM', 'Check-out before 11 AM',
  'No unregistered guests', 'No commercial photography',
  'Respect neighbors', 'Additional fees for extra guests'
];
