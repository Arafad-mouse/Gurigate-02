/**
 * PropertyDetailViewModel
 *
 * Maps Property domain entity to UI-friendly detail page display format.
 * Aggregates: Property, Pricing, Features, Images, Reviews, Availability, Owner
 * Used by: /property/:id
 * Single source of truth for property page rendering.
 */

import type { Property } from '../../domain/property/PropertyTypes';
import { PropertyBadge, PropertyStatus, PricingType } from '../../domain/property/PropertyTypes';
import {
  PROPERTY_BADGE_LABELS,
  PROPERTY_STATUS_LABELS,
  PRICING_TYPE_LABELS,
  CURRENCY_SYMBOLS,
} from '../../constants/property';

export interface PropertyDetailViewModel {
  // Basic Info
  id: string;
  title: string;
  description: string;
  badge: string;
  badgeLabel: string;
  status: string;
  statusLabel: string;
  isFeatured: boolean;
  isApproved: boolean;
  viewCount: number;

  // Location
  street: string;
  city: string;
  state: string | null;
  postalCode: string | null;
  country: string;
  hasCoordinates: boolean;
  latitude: number | null;
  longitude: number | null;

  // Pricing
  basePrice: number;
  priceDisplay: string;
  currency: string;
  currencySymbol: string;
  pricingType: string;
  pricingTypeLabel: string;
  securityDeposit: number | null;
  securityDepositDisplay: string | null;
  cleaningFee: number | null;
  cleaningFeeDisplay: string | null;
  serviceFee: number | null;
  serviceFeeDisplay: string | null;

  // Features
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  squareFeet: number | null;
  areaDisplay: string;
  amenities: string[];
  rules: string[];

  // Images
  images: {
    id: string;
    imageUrl: string;
    altText: string | null;
    isPrimary: boolean;
    sortOrder: number;
  }[];
  primaryImage: string;
  sortedImages: string[];

  // Reviews
  rating: number;
  reviewCount: number;
  recentReviews: {
    id: string;
    guestName: string;
    rating: number;
    comment: string;
    createdAt: string;
  }[];

  // Availability
  availability: {
    id: string;
    blockType: string;
    startDate: string;
    endDate: string;
    reason: string | null;
  }[];

  // Owner
  ownerId: string;
  ownerName: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export class PropertyDetailViewModelMapper {
  private static formatPrice(price: number, currency: string): string {
    const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || '$';
    return `${symbol}${price.toLocaleString()}`;
  }

  private static formatPriceOrNull(price: number | null, currency: string): string | null {
    if (price === null) return null;
    return this.formatPrice(price, currency);
  }

  private static formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  private static sortImages(images: any[]): any[] {
    return [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  private static getPrimaryImage(images: any[]): string {
    const primary = images.find((img) => img.isPrimary);
    return primary?.imageUrl || images[0]?.imageUrl || '/images/property-placeholder.jpg';
  }

  private static getRecentReviews(reviews: any[], limit: number = 3): any[] {
    return reviews
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
      .map((review) => ({
        ...review,
        createdAt: this.formatDate(review.createdAt),
      }));
  }

  static toViewModel(property: Property): PropertyDetailViewModel {
    const {
      id,
      title,
      description,
      badge,
      status,
      isFeatured,
      isApproved,
      viewCount,
      address,
      pricing,
      features,
      images,
      reviews,
      availability,
      ownerId,
      ownerName,
      createdAt,
      updatedAt,
    } = property;

    const sortedImages = this.sortImages(images);

    return {
      // Basic Info
      id,
      title,
      description,
      badge,
      badgeLabel: PROPERTY_BADGE_LABELS[badge],
      status,
      statusLabel: PROPERTY_STATUS_LABELS[status],
      isFeatured,
      isApproved,
      viewCount,

      // Location
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      hasCoordinates: address.latitude !== null && address.longitude !== null,
      latitude: address.latitude,
      longitude: address.longitude,

      // Pricing
      basePrice: pricing.basePrice,
      priceDisplay: this.formatPrice(pricing.basePrice, pricing.currency),
      currency: pricing.currency,
      currencySymbol: CURRENCY_SYMBOLS[pricing.currency as keyof typeof CURRENCY_SYMBOLS] || '$',
      pricingType: pricing.pricingType,
      pricingTypeLabel: PRICING_TYPE_LABELS[pricing.pricingType],
      securityDeposit: pricing.securityDeposit,
      securityDepositDisplay: this.formatPriceOrNull(pricing.securityDeposit, pricing.currency),
      cleaningFee: pricing.cleaningFee,
      cleaningFeeDisplay: this.formatPriceOrNull(pricing.cleaningFee, pricing.currency),
      serviceFee: pricing.serviceFee,
      serviceFeeDisplay: this.formatPriceOrNull(pricing.serviceFee, pricing.currency),

      // Features
      bedrooms: features.bedrooms || 0,
      bathrooms: features.bathrooms || 0,
      maxGuests: features.maxGuests || 0,
      squareFeet: features.squareFeet,
      areaDisplay: features.squareFeet ? `${features.squareFeet.toLocaleString()} sq ft` : 'N/A',
      amenities: features.amenities || [],
      rules: features.rules || [],

      // Images
      images: images.map((img) => ({
        id: img.id,
        imageUrl: img.imageUrl,
        altText: img.altText,
        isPrimary: img.isPrimary,
        sortOrder: img.sortOrder,
      })),
      primaryImage: this.getPrimaryImage(images),
      sortedImages: sortedImages.map((img) => img.imageUrl),

      // Reviews
      rating: property.rating,
      reviewCount: property.reviewCount,
      recentReviews: this.getRecentReviews(reviews),

      // Availability
      availability: availability.map((block) => ({
        id: block.id,
        blockType: block.blockType,
        startDate: this.formatDate(block.startDate),
        endDate: this.formatDate(block.endDate),
        reason: block.reason,
      })),

      // Owner
      ownerId,
      ownerName,

      // Metadata
      createdAt: this.formatDate(createdAt),
      updatedAt: this.formatDate(updatedAt),
    };
  }
}
