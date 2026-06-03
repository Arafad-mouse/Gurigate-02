/**
 * Property Mapper
 *
 * Transforms database rows to domain entities.
 * This is the critical abstraction layer that prevents
 * database schema changes from breaking the frontend.
 */

import type { Database } from '@/integrations/supabase/types_utf8';
import {
  PropertyType,
  PropertyBadge,
  PropertyStatus,
  PricingType,
  CurrencyType,
  AvailabilityBlockType,
  CreatePropertyInput,
  UpdatePropertyInput,
  CreateAvailabilityInput,
  UpdateAvailabilityInput,
  CreateReviewInput,
} from './PropertyTypes';
import { Property } from './Property';
import { PropertyAddress } from './PropertyAddress';
import { PropertyPricing } from './PropertyPricing';
import { PropertyFeatures } from './PropertyFeatures';
import { PropertyImage } from './PropertyImage';
import { PropertyReview } from './PropertyReview';
import { PropertyAvailability } from './PropertyAvailability';

/**
 * Database row types (from Supabase)
 */
type PropertyRow = Database['public']['Tables']['properties']['Row'];
type PropertyInsert = Database['public']['Tables']['properties']['Insert'];
type PropertyUpdate = Database['public']['Tables']['properties']['Update'];
type PropertyAddressRow = Database['public']['Tables']['property_addresses']['Row'];
type PropertyPricingRow = Database['public']['Tables']['property_pricing']['Row'];
type PropertyFeaturesRow = Database['public']['Tables']['property_features']['Row'];
type PropertyImageRow = Database['public']['Tables']['property_images']['Row'];
type PropertyReviewRow = Database['public']['Tables']['property_reviews']['Row'];
type AvailabilityBlockRow = Database['public']['Tables']['availability_blocks']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

/**
 * Property Mapper
 */
export class PropertyMapper {
  /**
   * Map database rows to domain aggregate
   */
  static toDomain(
    property: PropertyRow,
    address: PropertyAddressRow,
    pricing: PropertyPricingRow,
    features: PropertyFeaturesRow,
    images: PropertyImageRow[],
    reviews: PropertyReviewRow[],
    availability: AvailabilityBlockRow[],
    owner: ProfileRow | null
  ): Property {
    return new Property({
      id: property.id,
      title: property.title,
      description: property.description,
      type: this.mapPropertyType(property.type),
      badge: this.mapPropertyBadge(property.badge),
      priceUnitLabel: property.price_unit_label,
      status: this.mapPropertyStatus(property.status),
      isFeatured: property.is_featured,
      isApproved: property.is_approved,
      viewCount: property.view_count,
      rating: property.rating_avg || 0,
      reviewCount: property.review_count || 0,
      ownerId: property.owner_id,
      ownerName: owner?.full_name || 'Unknown Owner',
      address: this.mapAddress(address),
      pricing: this.mapPricing(pricing),
      features: this.mapFeatures(features),
      images: images.map(img => this.mapImage(img)),
      reviews: reviews.map(review => this.mapReview(review)),
      availability: availability.map(block => this.mapAvailability(block)),
      createdAt: new Date(property.created_at),
      updatedAt: new Date(property.updated_at),
    });
  }

  /**
   * Map domain aggregate to database insert
   */
  static toInsert(input: CreatePropertyInput, ownerId: string): {
    property: PropertyInsert;
    address: Database['public']['Tables']['property_addresses']['Insert'];
    pricing: Database['public']['Tables']['property_pricing']['Insert'];
    features: Database['public']['Tables']['property_features']['Insert'];
  } {
    return {
      property: {
        id: crypto.randomUUID(),
        title: input.title,
        description: input.description,
        type: this.mapPropertyTypeToDb(input.type),
        badge: this.mapPropertyBadgeToDb(input.badge),
        price_unit_label: input.priceUnitLabel,
        status: 'pending_approval',
        is_featured: false,
        is_approved: false,
        view_count: 0,
        rating_avg: 0,
        review_count: 0,
        owner_id: ownerId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      address: {
        id: crypto.randomUUID(),
        property_id: '', // Will be set after property insert
        street: input.address.street,
        city: input.address.city,
        state: input.address.state,
        postal_code: input.address.postalCode,
        country: input.address.country,
        latitude: input.address.latitude,
        longitude: input.address.longitude,
      },
      pricing: {
        id: crypto.randomUUID(),
        property_id: '', // Will be set after property insert
        base_price: input.pricing.basePrice,
        currency: this.mapCurrencyTypeToDb(input.pricing.currency),
        pricing_type: this.mapPricingTypeToDb(input.pricing.pricingType),
        security_deposit: input.pricing.securityDeposit,
        cleaning_fee: input.pricing.cleaningFee,
        service_fee: input.pricing.serviceFee,
      },
      features: {
        id: crypto.randomUUID(),
        property_id: '', // Will be set after property insert
        bedrooms: input.features.bedrooms,
        bathrooms: input.features.bathrooms,
        max_guests: input.features.maxGuests,
        square_feet: input.features.squareFeet,
        amenities: input.features.amenities,
        rules: input.features.rules,
      },
    };
  }

  /**
   * Map domain aggregate to database update
   */
  static toUpdate(input: UpdatePropertyInput): PropertyUpdate {
    const update: PropertyUpdate = {
      updated_at: new Date().toISOString(),
    };

    if (input.title !== undefined) update.title = input.title;
    if (input.description !== undefined) update.description = input.description;
    if (input.type !== undefined) update.type = this.mapPropertyTypeToDb(input.type);
    if (input.badge !== undefined) update.badge = this.mapPropertyBadgeToDb(input.badge);
    if (input.priceUnitLabel !== undefined) update.price_unit_label = input.priceUnitLabel;
    if (input.status !== undefined) update.status = this.mapPropertyStatusToDb(input.status);
    if (input.isFeatured !== undefined) update.is_featured = input.isFeatured;
    if (input.isApproved !== undefined) update.is_approved = input.isApproved;

    return update;
  }

  /**
   * Map availability input to database insert
   */
  static toAvailabilityInsert(input: CreateAvailabilityInput): Database['public']['Tables']['availability_blocks']['Insert'] {
    return {
      id: crypto.randomUUID(),
      property_id: input.propertyId,
      block_type: this.mapAvailabilityBlockTypeToDb(input.blockType),
      start_date: input.startDate.toISOString().split('T')[0],
      end_date: input.endDate.toISOString().split('T')[0],
      reason: input.reason,
      minimum_stay: input.minimumStay,
      maximum_stay: input.maximumStay,
      advance_booking_days: input.advanceBookingDays,
      notes: input.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Map availability input to database update
   */
  static toAvailabilityUpdate(input: UpdateAvailabilityInput): Database['public']['Tables']['availability_blocks']['Update'] {
    const update: Database['public']['Tables']['availability_blocks']['Update'] = {
      updated_at: new Date().toISOString(),
    };

    if (input.blockType !== undefined) update.block_type = this.mapAvailabilityBlockTypeToDb(input.blockType);
    if (input.startDate !== undefined) update.start_date = input.startDate.toISOString().split('T')[0];
    if (input.endDate !== undefined) update.end_date = input.endDate.toISOString().split('T')[0];
    if (input.reason !== undefined) update.reason = input.reason;
    if (input.minimumStay !== undefined) update.minimum_stay = input.minimumStay;
    if (input.maximumStay !== undefined) update.maximum_stay = input.maximumStay;
    if (input.advanceBookingDays !== undefined) update.advance_booking_days = input.advanceBookingDays;
    if (input.notes !== undefined) update.notes = input.notes;

    return update;
  }

  /**
   * Map review input to database insert
   */
  static toReviewInsert(input: CreateReviewInput, guestId: string): Database['public']['Tables']['property_reviews']['Insert'] {
    return {
      id: crypto.randomUUID(),
      property_id: input.propertyId,
      guest_id: guestId,
      rating: input.rating,
      comment: input.comment,
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Map address row to domain entity
   */
  public static mapAddress(row: PropertyAddressRow): PropertyAddress {
    return new PropertyAddress({
      id: row.id,
      propertyId: row.property_id,
      street: row.street,
      city: row.city,
      state: row.state,
      postalCode: row.postal_code,
      country: row.country,
      latitude: row.latitude,
      longitude: row.longitude,
    });
  }

  /**
   * Map pricing row to domain entity
   */
  public static mapPricing(row: PropertyPricingRow): PropertyPricing {
    return new PropertyPricing({
      id: row.id,
      propertyId: row.property_id,
      basePrice: Number(row.base_price),
      currency: this.mapCurrencyType(row.currency),
      pricingType: this.mapPricingType(row.pricing_type),
      securityDeposit: row.security_deposit ? Number(row.security_deposit) : null,
      cleaningFee: row.cleaning_fee ? Number(row.cleaning_fee) : null,
      serviceFee: row.service_fee ? Number(row.service_fee) : null,
    });
  }

  /**
   * Map features row to domain entity
   */
  public static mapFeatures(row: PropertyFeaturesRow): PropertyFeatures {
    return new PropertyFeatures({
      id: row.id,
      propertyId: row.property_id,
      bedrooms: row.bedrooms,
      bathrooms: row.bathrooms,
      maxGuests: row.max_guests,
      squareFeet: row.square_feet,
      amenities: row.amenities || [],
      rules: row.rules || [],
    });
  }

  /**
   * Map image row to domain entity
   */
  public static mapImage(row: PropertyImageRow): PropertyImage {
    return new PropertyImage({
      id: row.id,
      propertyId: row.property_id,
      imageUrl: row.image_url,
      altText: row.alt_text,
      sortOrder: row.sort_order,
      isPrimary: row.is_primary,
    });
  }

  /**
   * Map review row to domain entity
   */
  public static mapReview(row: PropertyReviewRow): PropertyReview {
    return new PropertyReview({
      id: row.id,
      propertyId: row.property_id,
      guestId: row.guest_id,
      guestName: '', // Will be populated by service if needed
      rating: row.rating,
      comment: row.comment,
      createdAt: new Date(row.created_at),
    });
  }

  /**
   * Map availability block row to domain entity
   */
  public static mapAvailability(row: AvailabilityBlockRow): PropertyAvailability {
    return new PropertyAvailability({
      id: row.id,
      propertyId: row.property_id,
      blockType: this.mapAvailabilityBlockType(row.block_type),
      startDate: new Date(row.start_date),
      endDate: new Date(row.end_date),
      reason: row.reason,
      minimumStay: row.minimum_stay,
      maximumStay: row.maximum_stay,
      advanceBookingDays: row.advance_booking_days,
      notes: row.notes,
      createdAt: new Date(row.created_at || new Date()),
      updatedAt: new Date(row.updated_at || new Date()),
    });
  }

  /**
   * Map database property type enum to domain enum
   */
  private static mapPropertyType(dbType: string): PropertyType {
    const mapping: Record<string, PropertyType> = {
      apartment: PropertyType.APARTMENT,
      house: PropertyType.HOUSE,
      villa: PropertyType.VILLA,
      studio: PropertyType.STUDIO,
      condo: PropertyType.CONDO,
      townhouse: PropertyType.TOWNHOUSE,
      cottage: PropertyType.COTTAGE,
      penthouse: PropertyType.PENTHOUSE,
      loft: PropertyType.LOFT,
    };

    return mapping[dbType] || PropertyType.OTHER;
  }

  /**
   * Map domain property type enum to database enum
   */
  private static mapPropertyTypeToDb(domainType: PropertyType): string {
    const mapping: Record<PropertyType, string> = {
      [PropertyType.APARTMENT]: 'apartment',
      [PropertyType.HOUSE]: 'house',
      [PropertyType.VILLA]: 'villa',
      [PropertyType.STUDIO]: 'studio',
      [PropertyType.CONDO]: 'condo',
      [PropertyType.TOWNHOUSE]: 'townhouse',
      [PropertyType.COTTAGE]: 'cottage',
      [PropertyType.PENTHOUSE]: 'penthouse',
      [PropertyType.LOFT]: 'loft',
      [PropertyType.OTHER]: 'other',
    };

    return mapping[domainType];
  }

  /**
   * Map database property badge enum to domain enum
   */
  private static mapPropertyBadge(dbBadge: string): PropertyBadge {
    const mapping: Record<string, PropertyBadge> = {
      FOR_SALE: PropertyBadge.FOR_SALE,
      FOR_RENT: PropertyBadge.FOR_RENT,
      SHORT_STAY: PropertyBadge.SHORT_STAY,
    };

    return mapping[dbBadge] || PropertyBadge.FOR_RENT;
  }

  /**
   * Map domain property badge enum to database enum
   */
  private static mapPropertyBadgeToDb(domainBadge: PropertyBadge): string {
    const mapping: Record<PropertyBadge, string> = {
      [PropertyBadge.FOR_SALE]: 'FOR_SALE',
      [PropertyBadge.FOR_RENT]: 'FOR_RENT',
      [PropertyBadge.SHORT_STAY]: 'SHORT_STAY',
    };

    return mapping[domainBadge];
  }

  /**
   * Map database property status enum to domain enum
   */
  private static mapPropertyStatus(dbStatus: string): PropertyStatus {
    const mapping: Record<string, PropertyStatus> = {
      available: PropertyStatus.AVAILABLE,
      occupied: PropertyStatus.OCCUPIED,
      maintenance: PropertyStatus.MAINTENANCE,
      pending: PropertyStatus.PENDING,
      inactive: PropertyStatus.INACTIVE,
    };

    return mapping[dbStatus] || PropertyStatus.PENDING;
  }

  /**
   * Map domain property status enum to database enum
   */
  private static mapPropertyStatusToDb(domainStatus: PropertyStatus): string {
    const mapping: Record<PropertyStatus, string> = {
      [PropertyStatus.AVAILABLE]: 'available',
      [PropertyStatus.OCCUPIED]: 'occupied',
      [PropertyStatus.MAINTENANCE]: 'maintenance',
      [PropertyStatus.PENDING]: 'pending',
      [PropertyStatus.INACTIVE]: 'inactive',
    };

    return mapping[domainStatus];
  }

  /**
   * Map database pricing type enum to domain enum
   */
  private static mapPricingType(dbType: string): PricingType {
    const mapping: Record<string, PricingType> = {
      per_night: PricingType.NIGHTLY,
      per_month: PricingType.MONTHLY,
      total: PricingType.SALE,
    };

    return mapping[dbType] || PricingType.NIGHTLY;
  }

  /**
   * Map domain pricing type enum to database enum
   */
  private static mapPricingTypeToDb(domainType: PricingType): string {
    const mapping: Record<PricingType, string> = {
      [PricingType.NIGHTLY]: 'per_night',
      [PricingType.MONTHLY]: 'per_month',
      [PricingType.SALE]: 'total',
    };

    return mapping[domainType];
  }

  /**
   * Map database currency type enum to domain enum
   */
  private static mapCurrencyType(dbCurrency: string): CurrencyType {
    const mapping: Record<string, CurrencyType> = {
      USD: CurrencyType.USD,
      EUR: CurrencyType.EUR,
      GBP: CurrencyType.GBP,
      KES: CurrencyType.KES,
      NGN: CurrencyType.NGN,
      ZAR: CurrencyType.ZAR,
      SOS: CurrencyType.SOS,
    };

    return mapping[dbCurrency] || CurrencyType.USD;
  }

  /**
   * Map domain currency type enum to database enum
   */
  private static mapCurrencyTypeToDb(domainCurrency: CurrencyType): string {
    const mapping: Record<CurrencyType, string> = {
      [CurrencyType.USD]: 'USD',
      [CurrencyType.EUR]: 'EUR',
      [CurrencyType.GBP]: 'GBP',
      [CurrencyType.KES]: 'KES',
      [CurrencyType.NGN]: 'NGN',
      [CurrencyType.ZAR]: 'ZAR',
      [CurrencyType.SOS]: 'SOS',
    };

    return mapping[domainCurrency];
  }

  /**
   * Map database availability block type enum to domain enum
   */
  private static mapAvailabilityBlockType(dbType: string): AvailabilityBlockType {
    const mapping: Record<string, AvailabilityBlockType> = {
      manual: AvailabilityBlockType.MANUAL,
      maintenance: AvailabilityBlockType.MAINTENANCE,
      seasonal: AvailabilityBlockType.SEASONAL,
      owner_use: AvailabilityBlockType.OWNER_USE,
      system: AvailabilityBlockType.SYSTEM,
    };

    return mapping[dbType] || AvailabilityBlockType.MANUAL;
  }

  /**
   * Map domain availability block type enum to database enum
   */
  private static mapAvailabilityBlockTypeToDb(domainType: AvailabilityBlockType): string {
    const mapping: Record<AvailabilityBlockType, string> = {
      [AvailabilityBlockType.MANUAL]: 'manual',
      [AvailabilityBlockType.MAINTENANCE]: 'maintenance',
      [AvailabilityBlockType.SEASONAL]: 'seasonal',
      [AvailabilityBlockType.OWNER_USE]: 'owner_use',
      [AvailabilityBlockType.SYSTEM]: 'system',
    };

    return mapping[domainType];
  }
}
