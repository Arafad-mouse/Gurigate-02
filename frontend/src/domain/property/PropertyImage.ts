/**
 * Property Image Entity
 *
 * Represents an image associated with a property.
 * This is a child entity of the Property aggregate.
 */

import type { PropertyImage as PropertyImageType } from './PropertyTypes';

/**
 * Property Image Entity
 */
export class PropertyImage implements PropertyImageType {
  id: string;
  propertyId: string;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;

  constructor(data: PropertyImageType) {
    this.id = data.id;
    this.propertyId = data.propertyId;
    this.imageUrl = data.imageUrl;
    this.altText = data.altText;
    this.sortOrder = data.sortOrder;
    this.isPrimary = data.isPrimary;
  }

  /**
   * Check if this is the primary image
   */
  isPrimaryImage(): boolean {
    return this.isPrimary;
  }

  /**
   * Set as primary image
   */
  setAsPrimary(): void {
    this.isPrimary = true;
    this.sortOrder = 0;
  }

  /**
   * Update sort order
   */
  updateSortOrder(order: number): void {
    this.sortOrder = order;
  }

  /**
   * Update alt text
   */
  updateAltText(text: string): void {
    this.altText = text;
  }

  /**
   * Validate image data
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.imageUrl || this.imageUrl.trim().length === 0) {
      errors.push('Image URL is required');
    }

    if (this.sortOrder < 0) {
      errors.push('Sort order cannot be negative');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get image URL
   */
  getUrl(): string {
    return this.imageUrl;
  }

  /**
   * Get alt text for accessibility
   */
  getAltText(): string {
    return this.altText || 'Property image';
  }
}
