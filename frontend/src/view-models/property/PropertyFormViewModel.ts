/**
 * PropertyFormViewModel
 *
 * Maps Property domain entity to UI-friendly form display format.
 * Used by: Create Property, Edit Property, Admin Review
 * Transforms: Database Shape → Form Shape → Validation Shape
 * Prevents leaking database models into forms.
 */

import type { Property } from '../../domain/property/PropertyTypes';
import { PropertyType, PropertyBadge, PropertyStatus, PricingType, CurrencyType } from '../../domain/property/PropertyTypes';
import {
  PROPERTY_TYPE_LABELS,
  PROPERTY_BADGE_LABELS,
  PROPERTY_STATUS_LABELS,
  PRICING_TYPE_LABELS,
} from '../../constants/property';

export interface PropertyFormViewModel {
  // Basic Info
  id?: string;
  title: string;
  description: string;
  type: PropertyType;
  typeLabel: string;
  badge: PropertyBadge;
  badgeLabel: string;
  status: PropertyStatus;
  statusLabel: string;
  isFeatured: boolean;

  // Address
  street: string;
  city: string;
  state: string | null;
  postalCode: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;

  // Pricing
  basePrice: number;
  currency: CurrencyType;
  pricingType: PricingType;
  pricingTypeLabel: string;
  securityDeposit: number | null;
  cleaningFee: number | null;
  serviceFee: number | null;

  // Features
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  squareFeet: number | null;
  amenities: string[];
  rules: string[];

  // Images (for form preview)
  imageUrls: string[];
  primaryImageIndex: number;
}

export class PropertyFormViewModelMapper {
  private static emptyForm(): PropertyFormViewModel {
    return {
      title: '',
      description: '',
      type: PropertyType.APARTMENT,
      typeLabel: PROPERTY_TYPE_LABELS[PropertyType.APARTMENT],
      badge: PropertyBadge.FOR_SALE,
      badgeLabel: PROPERTY_BADGE_LABELS[PropertyBadge.FOR_SALE],
      status: PropertyStatus.AVAILABLE,
      statusLabel: PROPERTY_STATUS_LABELS[PropertyStatus.AVAILABLE],
      isFeatured: false,

      street: '',
      city: '',
      state: null,
      postalCode: null,
      country: '',
      latitude: null,
      longitude: null,

      basePrice: 0,
      currency: CurrencyType.USD,
      pricingType: PricingType.SALE,
      pricingTypeLabel: PRICING_TYPE_LABELS[PricingType.SALE],
      securityDeposit: null,
      cleaningFee: null,
      serviceFee: null,

      bedrooms: 0,
      bathrooms: 0,
      maxGuests: 0,
      squareFeet: null,
      amenities: [],
      rules: [],

      imageUrls: [],
      primaryImageIndex: 0,
    };
  }

  static toCreateForm(): PropertyFormViewModel {
    return this.emptyForm();
  }

  static toEditForm(property: Property): PropertyFormViewModel {
    const {
      id,
      title,
      description,
      type,
      badge,
      status,
      isFeatured,
      address,
      pricing,
      features,
      images,
    } = property;

    return {
      id,
      title,
      description,
      type,
      typeLabel: PROPERTY_TYPE_LABELS[type],
      badge,
      badgeLabel: PROPERTY_BADGE_LABELS[badge],
      status,
      statusLabel: PROPERTY_STATUS_LABELS[status],
      isFeatured,

      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      latitude: address.latitude,
      longitude: address.longitude,

      basePrice: pricing.basePrice,
      currency: pricing.currency,
      pricingType: pricing.pricingType,
      pricingTypeLabel: PRICING_TYPE_LABELS[pricing.pricingType],
      securityDeposit: pricing.securityDeposit,
      cleaningFee: pricing.cleaningFee,
      serviceFee: pricing.serviceFee,

      bedrooms: features.bedrooms || 0,
      bathrooms: features.bathrooms || 0,
      maxGuests: features.maxGuests || 0,
      squareFeet: features.squareFeet,
      amenities: features.amenities || [],
      rules: features.rules || [],

      imageUrls: images.map((img) => img.imageUrl),
      primaryImageIndex: images.findIndex((img) => img.isPrimary) || 0,
    };
  }

  static toCreateInput(form: PropertyFormViewModel): any {
    // This would map to CreatePropertyInput
    // Implementation depends on the actual CreatePropertyInput structure
    return {
      title: form.title,
      description: form.description,
      type: form.type,
      badge: form.badge,
      status: form.status,
      isFeatured: form.isFeatured,

      address: {
        street: form.street,
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
        country: form.country,
        latitude: form.latitude,
        longitude: form.longitude,
      },

      pricing: {
        basePrice: form.basePrice,
        currency: form.currency,
        pricingType: form.pricingType,
        securityDeposit: form.securityDeposit,
        cleaningFee: form.cleaningFee,
        serviceFee: form.serviceFee,
      },

      features: {
        bedrooms: form.bedrooms,
        bathrooms: form.bathrooms,
        maxGuests: form.maxGuests,
        squareFeet: form.squareFeet,
        amenities: form.amenities,
        rules: form.rules,
      },
    };
  }

  static toUpdateInput(form: PropertyFormViewModel): any {
    // This would map to UpdatePropertyInput
    // Implementation depends on the actual UpdatePropertyInput structure
    return {
      id: form.id,
      ...this.toCreateInput(form),
    };
  }
}
