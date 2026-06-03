/**
 * Property Review Entity
 *
 * Represents a guest review for a property.
 * This is a child entity of the Property aggregate.
 */

import { PropertyReview as PropertyReviewType } from './PropertyTypes';

/**
 * Property Review Entity
 */
export class PropertyReview implements PropertyReviewType {
  id: string;
  propertyId: string;
  guestId: string;
  guestName: string;
  rating: number;
  comment: string | null;
  createdAt: Date;

  constructor(data: PropertyReviewType) {
    this.id = data.id;
    this.propertyId = data.propertyId;
    this.guestId = data.guestId;
    this.guestName = data.guestName;
    this.rating = data.rating;
    this.comment = data.comment;
    this.createdAt = data.createdAt;
  }

  /**
   * Check if review has comment
   */
  hasComment(): boolean {
    return this.comment !== null && this.comment.trim().length > 0;
  }

  /**
   * Get rating as stars
   */
  getStarRating(): string {
    return '⭐'.repeat(this.rating);
  }

  /**
   * Check if rating is positive (4-5 stars)
   */
  isPositive(): boolean {
    return this.rating >= 4;
  }

  /**
   * Check if rating is neutral (3 stars)
   */
  isNeutral(): boolean {
    return this.rating === 3;
  }

  /**
   * Check if rating is negative (1-2 stars)
   */
  isNegative(): boolean {
    return this.rating <= 2;
  }

  /**
   * Validate review data
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.rating < 1 || this.rating > 5) {
      errors.push('Rating must be between 1 and 5');
    }

    if (!this.guestName || this.guestName.trim().length === 0) {
      errors.push('Guest name is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get review summary
   */
  getSummary(): string {
    if (this.hasComment()) {
      return this.comment!.substring(0, 100) + (this.comment!.length > 100 ? '...' : '');
    }
    return 'No comment provided';
  }

  /**
   * Get formatted date
   */
  getFormattedDate(): string {
    return this.createdAt.toLocaleDateString();
  }

  /**
   * Get time since review
   */
  getTimeSince(): string {
    const now = new Date();
    const diffMs = now.getTime() - this.createdAt.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }
}
