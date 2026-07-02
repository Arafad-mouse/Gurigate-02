// Category-specific property detail interfaces
// These match the database schema in 20260611_become_host_v2.sql

export interface ResidentialDetails {
  id: string;
  property_id: string;
  guests: number;
  bedrooms: number;
  beds: number;
  private_bathrooms: number;
  dedicated_bathrooms: number;
  shared_bathrooms: number;
  occupancy_mode?: string;
  amenities: string[];
  created_at: string;
  updated_at: string;
}

export interface CommercialDetails {
  id: string;
  property_id: string;
  floor_area?: number;
  floors: number;
  parking_spaces: number;
  washrooms: number;
  storage_rooms: number;
  commercial_use_type: string[];
  created_at: string;
  updated_at: string;
}

export interface LandDetails {
  id: string;
  property_id: string;
  size_value?: number;
  size_unit: string;
  boundary_geojson?: Record<string, unknown>;
  land_features: string[];
  created_at: string;
  updated_at: string;
}

export interface HospitalityDetails {
  id: string;
  property_id: string;
  total_rooms: number;
  total_floors: number;
  max_guests: number;
  check_in_time?: string;
  check_out_time?: string;
  services: string[];
  facilities: string[];
  booking_mode: string;
  instant_booking: boolean;
  min_stay_nights: number;
  max_stay_nights: number;
  created_at: string;
  updated_at: string;
}

export interface PropertyDocument {
  id: string;
  property_id: string;
  document_type: string;
  document_url?: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface HospitalityRoomType {
  id: string;
  property_id: string;
  room_type: string;
  room_count: number;
  created_at: string;
  updated_at: string;
}

export type CategoryDetails =
  | ResidentialDetails
  | CommercialDetails
  | LandDetails
  | HospitalityDetails;

export interface PropertyWithDetails {
  id: string;
  title: string;
  location_name?: string;
  city: string;
  district?: string;
  price: number;
  price_unit: string;
  price_unit_label?: string;
  purpose: string;
  type: string;
  status: string;
  is_approved: boolean;
  is_featured: boolean;
  rating_avg?: number;
  review_count?: number;
  max_guests?: number;
  bedrooms?: number;
  bathrooms?: number;
  primary_image_url?: string;
  images?: PropertyImage[];
  property_category?: "residential" | "commercial" | "land" | "hospitality";
  locations?: { name: string };
  property_images?: PropertyImage[];
  deleted_at?: string | null;
}

export interface PropertyImage {
  url: string;
  is_primary: boolean;
  sort_order?: number;
}
