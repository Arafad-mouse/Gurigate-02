/**
 * Property Address Entity
 *
 * Represents the physical location of a property.
 * This is a child entity of the Property aggregate.
 */

import type { PropertyAddress as PropertyAddressType } from './PropertyTypes';

/**
 * Property Address Entity
 */
export class PropertyAddress implements PropertyAddressType {
  id: string;
  propertyId: string;
  street: string;
  city: string;
  state: string | null;
  postalCode: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;

  constructor(data: PropertyAddressType) {
    this.id = data.id;
    this.propertyId = data.propertyId;
    this.street = data.street;
    this.city = data.city;
    this.state = data.state;
    this.postalCode = data.postalCode;
    this.country = data.country;
    this.latitude = data.latitude;
    this.longitude = data.longitude;
  }

  /**
   * Get full address as formatted string
   */
  getFullAddress(): string {
    const parts = [this.street, this.city];
    if (this.state) parts.push(this.state);
    if (this.postalCode) parts.push(this.postalCode);
    parts.push(this.country);
    return parts.filter(Boolean).join(', ');
  }

  /**
   * Check if coordinates are available
   */
  hasCoordinates(): boolean {
    return this.latitude !== null && this.longitude !== null;
  }

  /**
   * Get coordinates as object
   */
  getCoordinates(): { lat: number; lng: number } | null {
    if (!this.hasCoordinates()) return null;
    return { lat: this.latitude!, lng: this.longitude! };
  }

  /**
   * Validate address data
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.street || this.street.trim().length === 0) {
      errors.push('Street address is required');
    }

    if (!this.city || this.city.trim().length === 0) {
      errors.push('City is required');
    }

    if (!this.country || this.country.trim().length === 0) {
      errors.push('Country is required');
    }

    if (this.latitude !== null && (this.latitude < -90 || this.latitude > 90)) {
      errors.push('Latitude must be between -90 and 90');
    }

    if (this.longitude !== null && (this.longitude < -180 || this.longitude > 180)) {
      errors.push('Longitude must be between -180 and 180');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
