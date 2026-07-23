/**
 * Property Availability Entity
 *
 * Represents an availability block for a property.
 * This is a child entity of the Property aggregate.
 */

import { PropertyAvailability as PropertyAvailabilityType, AvailabilityBlockType } from './PropertyTypes';

/**
 * Property Availability Entity
 */
export class PropertyAvailability implements PropertyAvailabilityType {
  id: string;
  propertyId: string;
  blockType: AvailabilityBlockType;
  startDate: Date;
  endDate: Date;
  reason: string | null;
  minimumStay: number | null;
  maximumStay: number | null;
  advanceBookingDays: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: PropertyAvailabilityType) {
    this.id = data.id;
    this.propertyId = data.propertyId;
    this.blockType = data.blockType;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.reason = data.reason;
    this.minimumStay = data.minimumStay;
    this.maximumStay = data.maximumStay;
    this.advanceBookingDays = data.advanceBookingDays;
    this.notes = data.notes;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Check if date range overlaps with this block
   */
  overlapsWith(start: Date, end: Date): boolean {
    return this.startDate <= end && this.endDate >= start;
  }

  /**
   * Check if this block is currently active
   */
  isActive(): boolean {
    const now = new Date();
    return this.startDate <= now && this.endDate >= now;
  }

  /**
   * Check if this block is in the future
   */
  isFuture(): boolean {
    const now = new Date();
    return this.startDate > now;
  }

  /**
   * Check if this block is in the past
   */
  isPast(): boolean {
    const now = new Date();
    return this.endDate < now;
  }

  /**
   * Get duration in nights
   */
  getDurationInNights(): number {
    const diffTime = Math.abs(this.endDate.getTime() - this.startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if this is a manual block
   */
  isManual(): boolean {
    return this.blockType === AvailabilityBlockType.MANUAL;
  }

  /**
   * Check if this is a maintenance block
   */
  isMaintenance(): boolean {
    return this.blockType === AvailabilityBlockType.MAINTENANCE;
  }

  /**
   * Check if this is a seasonal block
   */
  isSeasonal(): boolean {
    return this.blockType === AvailabilityBlockType.SEASONAL;
  }

  /**
   * Check if this is an owner use block
   */
  isOwnerUse(): boolean {
    return this.blockType === AvailabilityBlockType.OWNER_USE;
  }

  /**
   * Check if this is a system block
   */
  isSystem(): boolean {
    return this.blockType === AvailabilityBlockType.SYSTEM;
  }

  /**
   * Validate availability data
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.startDate >= this.endDate) {
      errors.push('End date must be after start date');
    }

    if (this.minimumStay !== null && this.minimumStay < 1) {
      errors.push('Minimum stay must be at least 1 night');
    }

    if (this.maximumStay !== null && this.maximumStay < 1) {
      errors.push('Maximum stay must be at least 1 night');
    }

    if (this.minimumStay !== null && this.maximumStay !== null && this.minimumStay > this.maximumStay) {
      errors.push('Minimum stay cannot be greater than maximum stay');
    }

    if (this.advanceBookingDays !== null && this.advanceBookingDays < 0) {
      errors.push('Advance booking days cannot be negative');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if booking request meets stay requirements
   */
  meetsStayRequirements(nights: number): boolean {
    if (this.minimumStay !== null && nights < this.minimumStay) {
      return false;
    }
    if (this.maximumStay !== null && nights > this.maximumStay) {
      return false;
    }
    return true;
  }

  /**
   * Check if booking request meets advance booking requirement
   */
  meetsAdvanceBookingRequirement(bookingDate: Date): boolean {
    if (this.advanceBookingDays === null) return true;
    
    const now = new Date();
    const daysUntilBooking = Math.floor((bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilBooking <= this.advanceBookingDays;
  }

  /**
   * Get block description
   */
  getDescription(): string {
    const typeDescriptions: Record<AvailabilityBlockType, string> = {
      [AvailabilityBlockType.MANUAL]: 'Manually blocked',
      [AvailabilityBlockType.MAINTENANCE]: 'Under maintenance',
      [AvailabilityBlockType.SEASONAL]: 'Seasonal restriction',
      [AvailabilityBlockType.OWNER_USE]: 'Owner use',
      [AvailabilityBlockType.SYSTEM]: 'System block',
    };

    return this.reason || typeDescriptions[this.blockType];
  }
}
