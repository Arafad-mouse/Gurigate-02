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
  | 'office_building'
  | 'commercial_complex'
  | 'shopping_mall'
  | 'retail_shop'
  | 'warehouse'
  | 'hotel'
  | 'restaurant'
  | 'mixed_use_building'
  | 'industrial_building'
  | 'business_center';

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
  'office_building', 'commercial_complex', 'shopping_mall', 'retail_shop', 
  'warehouse', 'hotel', 'restaurant', 'mixed_use_building', 
  'industrial_building', 'business_center'
];

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  'office_building': 'Office Building',
  'commercial_complex': 'Commercial Complex',
  'shopping_mall': 'Shopping Mall',
  'retail_shop': 'Retail Shop',
  'warehouse': 'Warehouse',
  'hotel': 'Hotel',
  'restaurant': 'Restaurant',
  'mixed_use_building': 'Mixed Use Building',
  'industrial_building': 'Industrial Building',
  'business_center': 'Business Center'
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
  'office_building': {
    fieldType: 'none',
    fieldLabel: 'Units',
    options: [],
    defaultValue: null,
    isRequired: false
  },
  'commercial_complex': {
    fieldType: 'none',
    fieldLabel: 'Units',
    options: [],
    defaultValue: null,
    isRequired: false
  },
  'shopping_mall': {
    fieldType: 'none',
    fieldLabel: 'Units',
    options: [],
    defaultValue: null,
    isRequired: false
  },
  'retail_shop': {
    fieldType: 'none',
    fieldLabel: 'Units',
    options: [],
    defaultValue: null,
    isRequired: false
  },
  'warehouse': {
    fieldType: 'none',
    fieldLabel: 'Units',
    options: [],
    defaultValue: null,
    isRequired: false
  },
  'hotel': {
    fieldType: 'roomTypes',
    fieldLabel: 'Room Type',
    options: ['Single Room', 'Double Room', 'Twin Room', 'Deluxe Room', 'Executive Room', 'Family Room', 'Suite', 'Presidential Suite'],
    defaultValue: null,
    isRequired: true
  },
  'restaurant': {
    fieldType: 'none',
    fieldLabel: 'Units',
    options: [],
    defaultValue: null,
    isRequired: false
  },
  'mixed_use_building': {
    fieldType: 'none',
    fieldLabel: 'Units',
    options: [],
    defaultValue: null,
    isRequired: false
  },
  'industrial_building': {
    fieldType: 'none',
    fieldLabel: 'Units',
    options: [],
    defaultValue: null,
    isRequired: false
  },
  'business_center': {
    fieldType: 'none',
    fieldLabel: 'Units',
    options: [],
    defaultValue: null,
    isRequired: false
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
