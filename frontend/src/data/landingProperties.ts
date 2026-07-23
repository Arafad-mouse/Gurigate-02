// GuriGate Properties Data Layer
// Now powered by Supabase with real-time data
// Maintains the same LandingProperty interface for frontend compatibility

import { GuriGatePropertyService } from '@/services/guriGateProperties';

export interface LandingProperty {
  id: string;
  title: string;
  address: string;
  price: string;
  priceUnit: string;
  beds: number;
  baths: number;
  sqft: number;
  badge: "FOR SALE" | "FOR RENT" | "SHORT STAY";
  featured?: boolean;
  image: string;
  rating?: number;
  location?: string;
  type: string;
  city: string;
  reviews?: number;
  guests?: number;
}

// Dynamic data fetching from Supabase
export const featuredLandingProperties: Promise<LandingProperty[]> = 
  GuriGatePropertyService.getFeaturedProperties();

export const nairobiLandingProperties: Promise<LandingProperty[]> = 
  GuriGatePropertyService.getPropertiesByCity('Nairobi');

export const hargeisaLandingProperties: Promise<LandingProperty[]> = 
  GuriGatePropertyService.getPropertiesByCity('Hargeisa');

// Additional East African cities
export const BERBERA_HOMES: Promise<LandingProperty[]> = 
  GuriGatePropertyService.getPropertiesByCity('Berbera');

export const BORAMA_HOMES: Promise<LandingProperty[]> = 
  GuriGatePropertyService.getPropertiesByCity('Borama');

export const MOGADISHU_HOMES: Promise<LandingProperty[]> = 
  GuriGatePropertyService.getPropertiesByCity('Mogadishu');

export const AMENITIES = [
  "Air conditioning",
  "Assisted living",
  "Disability Access",
  "Controlled access",
  "Cable Ready",
  "Available now",
  "Cottage",
  "Corporate",
  "Elevator",
  "Extra Storage",
  "High-speed internet",
  "Garage",
  "Pet allowed",
];

// Async filter helper functions
export async function filterByBadge(badge: LandingProperty["badge"]) {
  const allProperties = await getAllProperties();
  return allProperties.filter((p) => p.badge === badge);
}

export async function filterByCity(city: string) {
  return await GuriGatePropertyService.getPropertiesByCity(city);
}

export async function filterByPriceRange(min: number, max: number) {
  const allProperties = await getAllProperties();
  return allProperties.filter((p) => {
    const numericPrice = parseInt(p.price.replace(/[^0-9]/g, ""));
    return numericPrice >= min && numericPrice <= max;
  });
}

export async function searchProperties(query: string, filters?: {
  city?: string;
  badge?: LandingProperty["badge"];
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  maxGuests?: number;
}) {
  return await GuriGatePropertyService.searchProperties(query, filters);
}

// Combine all properties for global search
export async function getAllProperties(): Promise<LandingProperty[]> {
  return await GuriGatePropertyService.getAllProperties();
}

// Synchronous fallback functions for backward compatibility
export function filterByBadgeSync(properties: LandingProperty[], badge: LandingProperty["badge"]) {
  return properties.filter((p) => p.badge === badge);
}

export function filterByCitySync(properties: LandingProperty[], city: string) {
  return properties.filter((p) => p.city.toLowerCase() === city.toLowerCase());
}

export function filterByPriceRangeSync(properties: LandingProperty[], min: number, max: number) {
  return properties.filter((p) => {
    const numericPrice = parseInt(p.price.replace(/[^0-9]/g, ""));
    return numericPrice >= min && numericPrice <= max;
  });
}

export function searchPropertiesSync(properties: LandingProperty[], query: string) {
  const lowerQuery = query.toLowerCase();
  return properties.filter(
    (p) =>
      p.title.toLowerCase().includes(lowerQuery) ||
      p.address.toLowerCase().includes(lowerQuery) ||
      p.city.toLowerCase().includes(lowerQuery) ||
      p.type.toLowerCase().includes(lowerQuery)
  );
}
