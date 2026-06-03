/**
 * Property Aggregate Root
 *
 * The Property aggregate root composes all child entities.
 * This is what the UI consumes - not individual database rows.
 */

import {
  Property as PropertyType,
  PropertyStatus,
  PropertyBadge,
  PropertyType as PropType,
} from './PropertyTypes';
import { PropertyAddress } from './PropertyAddress';
import { PropertyPricing } from './PropertyPricing';
import { PropertyFeatures } from './PropertyFeatures';
import { PropertyImage } from './PropertyImage';
import { PropertyReview } from './PropertyReview';
import { PropertyAvailability } from './PropertyAvailability';

/**
 * Property Aggregate Root
 */
export class Property implements PropertyType {
  id: string;
  title: string;
  description: string;
  type: PropType;
  badge: PropertyBadge;
  priceUnitLabel: string;
  status: PropertyStatus;
  isFeatured: boolean;
  isApproved: boolean;
  viewCount: number;
  rating: number;
  reviewCount: number;
  ownerId: string;
  ownerName: string;
  address: PropertyAddress;
  pricing: PropertyPricing;
  features: PropertyFeatures;
  images: PropertyImage[];
  reviews: PropertyReview[];
  availability: PropertyAvailability[];
  createdAt: Date;
  updatedAt: Date;

  constructor(data: PropertyType) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.type = data.type;
    this.badge = data.badge;
    this.priceUnitLabel = data.priceUnitLabel;
    this.status = data.status;
    this.isFeatured = data.isFeatured;
    this.isApproved = data.isApproved;
    this.viewCount = data.viewCount;
    this.rating = data.rating;
    this.reviewCount = data.reviewCount;
    this.ownerId = data.ownerId;
    this.ownerName = data.ownerName;
    this.address = new PropertyAddress(data.address);
    this.pricing = new PropertyPricing(data.pricing);
    this.features = new PropertyFeatures(data.features);
    this.images = data.images.map(img => new PropertyImage(img));
    this.reviews = data.reviews.map(review => new PropertyReview(review));
    this.availability = data.availability.map(avail => new PropertyAvailability(avail));
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Get primary image
   */
  getPrimaryImage(): PropertyImage | null {
    return this.images.find(img => img.isPrimaryImage()) || this.images[0] || null;
  }

  /**
   * Get all images sorted by sort order
   */
  getSortedImages(): PropertyImage[] {
    return [...this.images].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  /**
   * Check if property is available
   */
  isAvailable(): boolean {
    return this.status === PropertyStatus.AVAILABLE && this.isApproved;
  }

  /**
   * Check if property is featured
   */
  isFeaturedProperty(): boolean {
    return this.isFeatured;
  }

  /**
   * Check if property is approved
   */
  isApprovedProperty(): boolean {
    return this.isApproved;
  }

  /**
   * Check if property is for sale
   */
  isForSale(): boolean {
    return this.badge === PropertyBadge.FOR_SALE;
  }

  /**
   * Check if property is for rent
   */
  isForRent(): boolean {
    return this.badge === PropertyBadge.FOR_RENT;
  }

  /**
   * Check if property is for short stay
   */
  isShortStay(): boolean {
    return this.badge === PropertyBadge.SHORT_STAY;
  }

  /**
   * Check if property can accommodate guests
   */
  canAccommodate(guestCount: number): boolean {
    return this.features.canAccommodate(guestCount);
  }

  /**
   * Check if property is available for date range
   */
  isAvailableForDates(startDate: Date, endDate: Date): boolean {
    if (!this.isAvailable()) return false;

    // Check for overlapping availability blocks
    const hasBlockingAvailability = this.availability.some(block =>
      block.overlapsWith(startDate, endDate)
    );

    return !hasBlockingAvailability;
  }

  /**
   * Get availability for date range
   */
  getAvailabilityForDates(startDate: Date, endDate: Date): PropertyAvailability[] {
    return this.availability.filter(block =>
      block.overlapsWith(startDate, endDate)
    );
  }

  /**
   * Get average rating
   */
  getAverageRating(): number {
    if (this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / this.reviews.length;
  }

  /**
   * Get recent reviews
   */
  getRecentReviews(limit: number = 5): PropertyReview[] {
    return [...this.reviews]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  /**
   * Get positive reviews
   */
  getPositiveReviews(): PropertyReview[] {
    return this.reviews.filter(review => review.isPositive());
  }

  /**
   * Get negative reviews
   */
  getNegativeReviews(): PropertyReview[] {
    return this.reviews.filter(review => review.isNegative());
  }

  /**
   * Calculate price for nights
   */
  calculatePrice(nights: number): number {
    return this.pricing.calculateTotal(nights);
  }

  /**
   * Get formatted price
   */
  getFormattedPrice(): string {
    return this.pricing.formatPrice();
  }

  /**
   * Get full address
   */
  getFullAddress(): string {
    return this.address.getFullAddress();
  }

  /**
   * Get coordinates
   */
  getCoordinates(): { lat: number; lng: number } | null {
    return this.address.getCoordinates();
  }

  /**
   * Get amenity categories
   */
  getAmenityCategories(): Record<string, string[]> {
    return this.features.getAmenityCategories();
  }

  /**
   * Check if property has specific amenity
   */
  hasAmenity(amenity: string): boolean {
    return this.features.hasAmenity(amenity);
  }

  /**
   * Get guest capacity
   */
  getGuestCapacity(): number {
    return this.features.getGuestCapacity();
  }

  /**
   * Get bedroom count
   */
  getBedroomCount(): number {
    return this.features.getBedroomCount();
  }

  /**
   * Get bathroom count
   */
  getBathroomCount(): number {
    return this.features.getBathroomCount();
  }

  /**
   * Validate property data
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.title || this.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (!this.description || this.description.trim().length === 0) {
      errors.push('Description is required');
    }

    const addressValidation = this.address.validate();
    if (!addressValidation.valid) {
      errors.push(...addressValidation.errors.map(e => `Address: ${e}`));
    }

    const pricingValidation = this.pricing.validate();
    if (!pricingValidation.valid) {
      errors.push(...pricingValidation.errors.map(e => `Pricing: ${e}`));
    }

    const featuresValidation = this.features.validate();
    if (!featuresValidation.valid) {
      errors.push(...featuresValidation.errors.map(e => `Features: ${e}`));
    }

    if (this.images.length === 0) {
      errors.push('At least one image is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Update status
   */
  updateStatus(status: PropertyStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }

  /**
   * Mark as featured
   */
  markAsFeatured(): void {
    this.isFeatured = true;
    this.updatedAt = new Date();
  }

  /**
   * Unmark as featured
   */
  unmarkAsFeatured(): void {
    this.isFeatured = false;
    this.updatedAt = new Date();
  }

  /**
   * Approve property
   */
  approve(): void {
    this.isApproved = true;
    this.status = PropertyStatus.AVAILABLE;
    this.updatedAt = new Date();
  }

  /**
   * Unapprove property
   */
  unapprove(): void {
    this.isApproved = false;
    this.status = PropertyStatus.PENDING;
    this.updatedAt = new Date();
  }

  /**
   * Increment view count
   */
  incrementViewCount(): void {
    this.viewCount++;
  }

  /**
   * Add image
   */
  addImage(image: PropertyImage): void {
    this.images.push(image);
    this.updatedAt = new Date();
  }

  /**
   * Remove image
   */
  removeImage(imageId: string): void {
    this.images = this.images.filter(img => img.id !== imageId);
    this.updatedAt = new Date();
  }

  /**
   * Set primary image
   */
  setPrimaryImage(imageId: string): void {
    this.images.forEach(img => {
      img.isPrimary = img.id === imageId;
      if (img.isPrimary) img.sortOrder = 0;
    });
    this.updatedAt = new Date();
  }

  /**
   * Add review
   */
  addReview(review: PropertyReview): void {
    this.reviews.push(review);
    this.reviewCount = this.reviews.length;
    this.rating = this.getAverageRating();
    this.updatedAt = new Date();
  }

  /**
   * Add availability block
   */
  addAvailability(block: PropertyAvailability): void {
    this.availability.push(block);
    this.updatedAt = new Date();
  }

  /**
   * Remove availability block
   */
  removeAvailability(blockId: string): void {
    this.availability = this.availability.filter(block => block.id !== blockId);
    this.updatedAt = new Date();
  }
}
