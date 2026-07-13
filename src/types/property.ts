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
  // RMS-specific fields
  total_units?: number;
  occupied_units?: number;
  vacant_units?: number;
  occupancy_rate?: number;
  published_to_homes?: boolean;
  marketplace_listing_id?: string;
  monthly_revenue?: number;
  outstanding_rent?: number;
  maintenance_count?: number;
  upcoming_lease_expiry?: number;
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
  | 'hotel'
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
  'apartment', 'house', 'villa', 'studio', 'hotel', 'condo', 
  'townhouse', 'cottage', 'penthouse', 'loft', 'other'
];

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  'apartment': 'Apartment',
  'house': 'House',
  'villa': 'Villa',
  'studio': 'Studio',
  'hotel': 'Hotel',
  'condo': 'Condo',
  'townhouse': 'Townhouse',
  'cottage': 'Cottage',
  'penthouse': 'Penthouse',
  'loft': 'Loft',
  'other': 'Other'
};

export type BedroomOption = string;
export type RoomTypeOption = string;

export interface PropertyFieldConfig {
  fieldType: 'bedrooms' | 'roomTypes' | 'none';
  fieldLabel: string;
  options: string[];
  defaultValue: string | null;
  isRequired: boolean;
  isDisabled?: boolean;
}

export const PROPERTY_CONFIGURATION: Record<PropertyType, PropertyFieldConfig> = {
  'house': {
    fieldType: 'bedrooms',
    fieldLabel: 'Bedrooms',
    options: ['1 Bedroom', '2 Bedrooms', '3 Bedrooms', '4 Bedrooms', '5 Bedrooms', '6+ Bedrooms'],
    defaultValue: null,
    isRequired: true
  },
  'villa': {
    fieldType: 'bedrooms',
    fieldLabel: 'Bedrooms',
    options: ['2 Bedrooms', '3 Bedrooms', '4 Bedrooms', '5 Bedrooms', '6 Bedrooms', '7+ Bedrooms'],
    defaultValue: null,
    isRequired: true
  },
  'apartment': {
    fieldType: 'bedrooms',
    fieldLabel: 'Bedrooms',
    options: ['Studio', '1 Bedroom', '2 Bedrooms', '3 Bedrooms', '4+ Bedrooms'],
    defaultValue: null,
    isRequired: true
  },
  'studio': {
    fieldType: 'bedrooms',
    fieldLabel: 'Bedrooms',
    options: ['Studio Only'],
    defaultValue: 'Studio Only',
    isRequired: true,
    isDisabled: true
  },
  'hotel': {
    fieldType: 'roomTypes',
    fieldLabel: 'Room Type',
    options: ['Single Room', 'Double Room', 'Twin Room', 'Deluxe Room', 'Executive Room', 'Family Room', 'Suite', 'Presidential Suite'],
    defaultValue: null,
    isRequired: true
  },
  'condo': {
    fieldType: 'bedrooms',
    fieldLabel: 'Bedrooms',
    options: ['1 Bedroom', '2 Bedrooms', '3 Bedrooms', '4 Bedrooms', '5+ Bedrooms'],
    defaultValue: null,
    isRequired: true
  },
  'townhouse': {
    fieldType: 'bedrooms',
    fieldLabel: 'Bedrooms',
    options: ['2 Bedrooms', '3 Bedrooms', '4 Bedrooms', '5 Bedrooms', '6+ Bedrooms'],
    defaultValue: null,
    isRequired: true
  },
  'cottage': {
    fieldType: 'bedrooms',
    fieldLabel: 'Bedrooms',
    options: ['1 Bedroom', '2 Bedrooms', '3 Bedrooms', '4 Bedrooms', '5+ Bedrooms'],
    defaultValue: null,
    isRequired: true
  },
  'penthouse': {
    fieldType: 'bedrooms',
    fieldLabel: 'Bedrooms',
    options: ['2 Bedrooms', '3 Bedrooms', '4 Bedrooms', '5 Bedrooms', '6+ Bedrooms'],
    defaultValue: null,
    isRequired: true
  },
  'loft': {
    fieldType: 'bedrooms',
    fieldLabel: 'Bedrooms',
    options: ['Studio', '1 Bedroom', '2 Bedrooms', '3 Bedrooms', '4+ Bedrooms'],
    defaultValue: null,
    isRequired: true
  },
  'other': {
    fieldType: 'bedrooms',
    fieldLabel: 'Bedrooms',
    options: ['1 Bedroom', '2 Bedrooms', '3 Bedrooms', '4 Bedrooms', '5+ Bedrooms'],
    defaultValue: null,
    isRequired: true
  }
};

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
