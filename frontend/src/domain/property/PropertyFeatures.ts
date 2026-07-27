/**
 * Property Features Entity
 *
 * Represents the features and amenities of a property.
 * This is a child entity of the Property aggregate.
 */

import type { PropertyFeatures as PropertyFeaturesType } from './PropertyTypes';

/**
 * Property Features Entity
 */
export class PropertyFeatures implements PropertyFeaturesType {
  id: string;
  propertyId: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  squareFeet: number | null;
  amenities: string[];
  rules: string[];

  constructor(data: PropertyFeaturesType) {
    this.id = data.id;
    this.propertyId = data.propertyId;
    this.bedrooms = data.bedrooms;
    this.bathrooms = data.bathrooms;
    this.maxGuests = data.maxGuests;
    this.squareFeet = data.squareFeet;
    this.amenities = data.amenities;
    this.rules = data.rules;
  }

  /**
   * Check if property has specific amenity
   */
  hasAmenity(amenity: string): boolean {
    return this.amenities.includes(amenity);
  }

  /**
   * Check if property has specific rule
   */
  hasRule(rule: string): boolean {
    return this.rules.includes(rule);
  }

  /**
   * Add amenity
   */
  addAmenity(amenity: string): void {
    if (!this.hasAmenity(amenity)) {
      this.amenities.push(amenity);
    }
  }

  /**
   * Remove amenity
   */
  removeAmenity(amenity: string): void {
    this.amenities = this.amenities.filter(a => a !== amenity);
  }

  /**
   * Add rule
   */
  addRule(rule: string): void {
    if (!this.hasRule(rule)) {
      this.rules.push(rule);
    }
  }

  /**
   * Remove rule
   */
  removeRule(rule: string): void {
    this.rules = this.rules.filter(r => r !== rule);
  }

  /**
   * Get guest capacity
   */
  getGuestCapacity(): number {
    return this.maxGuests;
  }

  /**
   * Check if property can accommodate guests
   */
  canAccommodate(guestCount: number): boolean {
    return guestCount <= this.maxGuests;
  }

  /**
   * Get bedroom count
   */
  getBedroomCount(): number {
    return this.bedrooms;
  }

  /**
   * Get bathroom count
   */
  getBathroomCount(): number {
    return this.bathrooms;
  }

  /**
   * Calculate square meters from square feet
   */
  getSquareMeters(): number | null {
    if (!this.squareFeet) return null;
    return Math.round(this.squareFeet * 0.092903);
  }

  /**
   * Validate features data
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.bedrooms < 0) {
      errors.push('Bedrooms cannot be negative');
    }

    if (this.bathrooms < 0) {
      errors.push('Bathrooms cannot be negative');
    }

    if (this.maxGuests < 1) {
      errors.push('Max guests must be at least 1');
    }

    if (this.squareFeet !== null && this.squareFeet <= 0) {
      errors.push('Square feet must be greater than 0');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get amenity categories
   */
  getAmenityCategories(): Record<string, string[]> {
    const categories: Record<string, string[]> = {
      essentials: [],
      comfort: [],
      kitchen: [],
      entertainment: [],
      outdoor: [],
      safety: [],
    };

    const categoryMap: Record<string, string> = {
      'WiFi': 'essentials',
      'Air Conditioning': 'comfort',
      'Kitchen': 'kitchen',
      'TV': 'entertainment',
      'Parking': 'outdoor',
      'Pool': 'outdoor',
      'Gym': 'comfort',
      'Laundry': 'essentials',
      'Workspace': 'comfort',
      'Balcony': 'outdoor',
      'Garden': 'outdoor',
      'Security System': 'safety',
    };

    this.amenities.forEach(amenity => {
      const category = categoryMap[amenity] || 'essentials';
      categories[category].push(amenity);
    });

    return categories;
  }
}
