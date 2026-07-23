/**
 * PropertyCardViewModel
 *
 * Maps Property domain entity to UI-friendly card display format.
 * Used by: Marketplace, Featured Properties, Search Results, Wishlist, Owner Listings
 * Prevents direct UI dependency on domain structure.
 */

import type { Property } from '../../domain/property/PropertyTypes';
// import { PropertyBadge } from '../../domain/property/PropertyTypes';
import { PROPERTY_BADGE_LABELS, CURRENCY_SYMBOLS } from '../../constants/property';

export interface PropertyCardViewModel {
  id: string;
  title: string;
  coverImage: string;
  city: string;
  district: string;
  badge: 'FOR SALE' | 'FOR RENT' | 'SHORT STAY';
  priceDisplay: string;
  bedrooms: number;
  bathrooms: number;
  areaDisplay: string;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isWishlisted: boolean;
}

export class PropertyCardViewModelMapper {
  private static formatPrice(price: number, currency: string): string {
    const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || '$';
    return `${symbol}${price.toLocaleString()}`;
  }

  private static formatArea(squareFeet: number | null): string {
    if (!squareFeet) return 'N/A';
    return `${squareFeet.toLocaleString()} sq ft`;
  }

  private static getCoverImage(images: any[]): string {
    if (!images || images.length === 0) {
      return '/images/property-placeholder.jpg';
    }
    const primaryImage = images.find((img) => img.isPrimary);
    return primaryImage?.imageUrl || images[0].imageUrl || '/images/property-placeholder.jpg';
  }

  static toViewModel(property: Property, isWishlisted: boolean = false): PropertyCardViewModel {
    const {
      id,
      title,
      address,
      pricing,
      features,
      images,
      rating,
      reviewCount,
      isFeatured,
      badge,
    } = property;

    return {
      id,
      title,
      coverImage: this.getCoverImage(images),
      city: address.city,
      district: address.state || '',
      badge: PROPERTY_BADGE_LABELS[badge] as 'FOR SALE' | 'FOR RENT' | 'SHORT STAY',
      priceDisplay: this.formatPrice(pricing.basePrice, pricing.currency),
      bedrooms: features.bedrooms || 0,
      bathrooms: features.bathrooms || 0,
      areaDisplay: this.formatArea(features.squareFeet),
      rating,
      reviewCount,
      isFeatured,
      isWishlisted,
    };
  }

  static toViewModelList(properties: Property[], wishlistIds: Set<string> = new Set()): PropertyCardViewModel[] {
    return properties.map((property) =>
      this.toViewModel(property, wishlistIds.has(property.id))
    );
  }
}
