/**
 * Property Pricing Entity
 *
 * Represents the pricing structure of a property.
 * This is a child entity of the Property aggregate.
 */

import type { PropertyPricing as PropertyPricingType } from './PropertyTypes';
import { PricingType, CurrencyType } from './PropertyTypes';

/**
 * Property Pricing Entity
 */
export class PropertyPricing implements PropertyPricingType {
  id: string;
  propertyId: string;
  basePrice: number;
  currency: CurrencyType;
  pricingType: PricingType;
  securityDeposit: number | null;
  cleaningFee: number | null;
  serviceFee: number | null;

  constructor(data: PropertyPricingType) {
    this.id = data.id;
    this.propertyId = data.propertyId;
    this.basePrice = data.basePrice;
    this.currency = data.currency;
    this.pricingType = data.pricingType;
    this.securityDeposit = data.securityDeposit;
    this.cleaningFee = data.cleaningFee;
    this.serviceFee = data.serviceFee;
  }

  /**
   * Calculate total price for a given number of nights
   */
  calculateTotal(nights: number): number {
    const subtotal = this.basePrice * nights;
    const fees = (this.cleaningFee || 0) + (this.serviceFee || 0);
    return subtotal + fees;
  }

  /**
   * Calculate total with security deposit
   */
  calculateTotalWithDeposit(nights: number): number {
    const total = this.calculateTotal(nights);
    return total + (this.securityDeposit || 0);
  }

  /**
   * Get price breakdown
   */
  getPriceBreakdown(nights: number): {
    basePrice: number;
    subtotal: number;
    cleaningFee: number;
    serviceFee: number;
    securityDeposit: number;
    total: number;
  } {
    const subtotal = this.basePrice * nights;
    const cleaningFee = this.cleaningFee || 0;
    const serviceFee = this.serviceFee || 0;
    const securityDeposit = this.securityDeposit || 0;

    return {
      basePrice: this.basePrice,
      subtotal,
      cleaningFee,
      serviceFee,
      securityDeposit,
      total: subtotal + cleaningFee + serviceFee,
    };
  }

  /**
   * Format price as currency string
   */
  formatPrice(amount?: number): string {
    const price = amount ?? this.basePrice;
    const symbols: Record<CurrencyType, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      KES: 'KSh',
      NGN: '₦',
      ZAR: 'R',
      SOS: 'S',
    };
    return `${symbols[this.currency]}${price.toFixed(2)}`;
  }

  /**
   * Validate pricing data
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.basePrice <= 0) {
      errors.push('Base price must be greater than 0');
    }

    if (this.securityDeposit !== null && this.securityDeposit < 0) {
      errors.push('Security deposit cannot be negative');
    }

    if (this.cleaningFee !== null && this.cleaningFee < 0) {
      errors.push('Cleaning fee cannot be negative');
    }

    if (this.serviceFee !== null && this.serviceFee < 0) {
      errors.push('Service fee cannot be negative');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if pricing is for short stay
   */
  isShortStay(): boolean {
    return this.pricingType === PricingType.NIGHTLY;
  }

  /**
   * Check if pricing is for long term
   */
  isLongTerm(): boolean {
    return this.pricingType === PricingType.MONTHLY;
  }

  /**
   * Check if pricing is for sale
   */
  isForSale(): boolean {
    return this.pricingType === PricingType.SALE;
  }
}
