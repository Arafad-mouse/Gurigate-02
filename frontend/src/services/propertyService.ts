/**
 * Property Service Implementation
 *
 * Implements IPropertyService contract using property repositories.
 * This service orchestrates business logic and uses repositories for persistence.
 */

import { propertyRepository } from '../repositories/property/propertyRepository';
import { propertyImageRepository } from '../repositories/property/propertyImageRepository';
import { propertyReviewRepository } from '../repositories/property/propertyReviewRepository';
import { availabilityRepository } from '../repositories/property/availabilityRepository';
import { wishlistRepository } from '../repositories/property/wishlistRepository';
import { PropertyMapper } from '../domain/property/PropertyMapper';
import { PropertyMetrics } from '../domain/property/PropertyMetrics';
import { PropertyType, PropertyStatus } from '../domain/property/PropertyTypes';
import type { Database } from '@/integrations/supabase/types_utf8';
import type {
  IPropertyService,
} from '../domain/property/PropertyServiceContract';
import {
  PropertyServiceError,
  PropertyServiceErrorCode,
} from '../domain/property/PropertyServiceContract';
import type {
  PropertyFilters,
  PropertyListResult,
  PropertyMetrics as PropertyMetricsType,
  CreatePropertyInput,
  UpdatePropertyInput,
  CreateAvailabilityInput,
  UpdateAvailabilityInput,
  CreateReviewInput,
  AvailabilityCheckResult,
  PricingCalculation,
} from '../domain/property/PropertyTypes';
import { Property } from '../domain/property/Property';

/**
 * Property Service Implementation
 */
export class PropertyService implements IPropertyService {
  /**
   * List properties with filters and pagination
   */
  async getProperties(
    filters: PropertyFilters,
    page: number,
    pageSize: number
  ): Promise<PropertyListResult> {
    try {
      const { data, count } = await propertyRepository.listProperties({
        page,
        pageSize,
        ownerId: filters.ownerId,
        status: filters.status === 'all' ? undefined : this.mapStatusToDb(filters.status),
        type: filters.type === 'all' ? undefined : this.mapTypeToDb(filters.type),
        badge: filters.badge,
        isFeatured: filters.isFeatured,
        isApproved: filters.isApproved,
      });

      const properties = data.map((row) =>
        PropertyMapper.toDomain(row, null, null, null, [], [], [], null)
      );

      return {
        items: properties,
        total: count,
        page,
        pageSize,
      };
    } catch (error) {
      throw new PropertyServiceError(
        'Failed to list properties',
        PropertyServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Get property by ID
   */
  async getPropertyById(id: string): Promise<Property> {
    try {
      const propertyWithRelations = await propertyRepository.getPropertyWithRelations(id);

      if (!propertyWithRelations) {
        throw new PropertyServiceError(
          'Property not found',
          PropertyServiceErrorCode.NOT_FOUND
        );
      }

      // Fetch images, reviews, and availability
      const [images, reviews, availability] = await Promise.all([
        propertyImageRepository.getPropertyImages(id),
        propertyReviewRepository.getPropertyReviews(id, { page: 1, pageSize: 100 }),
        availabilityRepository.getAvailabilityBlocks(id),
      ]);

      return PropertyMapper.toDomain(
        propertyWithRelations,
        propertyWithRelations.address,
        propertyWithRelations.pricing,
        propertyWithRelations.features,
        images,
        reviews.data,
        availability,
        propertyWithRelations.profile
      );
    } catch (error) {
      if (error instanceof PropertyServiceError) {
        throw error;
      }
      throw new PropertyServiceError(
        'Failed to get property',
        PropertyServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Create a new property
   */
  async createProperty(input: CreatePropertyInput): Promise<Property> {
    try {
      const ownerId = 'current-user'; // TODO: Get from auth context

      const insertData = PropertyMapper.toInsert(input, ownerId);
      const created = await propertyRepository.createProperty(insertData as any);

      return this.getPropertyById(created.id);
    } catch (error) {
      if (error instanceof PropertyServiceError) {
        throw error;
      }
      throw new PropertyServiceError(
        'Failed to create property',
        PropertyServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Update an existing property
   */
  async updateProperty(id: string, input: UpdatePropertyInput): Promise<Property> {
    try {
      const updateData = PropertyMapper.toUpdate(input);
      await propertyRepository.updateProperty(id, updateData);

      return this.getPropertyById(id);
    } catch (error) {
      if (error instanceof PropertyServiceError) {
        throw error;
      }
      throw new PropertyServiceError(
        'Failed to update property',
        PropertyServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Archive a property (soft delete)
   */
  async archiveProperty(id: string): Promise<void> {
    try {
      const deletedBy = 'current-user'; // TODO: Get from auth context
      await propertyRepository.deleteProperty(id, deletedBy);
    } catch (error) {
      throw new PropertyServiceError(
        'Failed to archive property',
        PropertyServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Restore an archived property
   */
  async restoreProperty(id: string): Promise<void> {
    try {
      await propertyRepository.restoreProperty(id);
    } catch (error) {
      throw new PropertyServiceError(
        'Failed to restore property',
        PropertyServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Search properties by query
   */
  async searchProperties(
    query: string,
    filters?: PropertyFilters,
    page?: number,
    pageSize?: number
  ): Promise<PropertyListResult> {
    try {
      const { data, count } = await propertyRepository.searchProperties(query, {
        page: page || 1,
        pageSize: pageSize || 20,
      });

      const properties = data.map((row) =>
        PropertyMapper.toDomain(row, null, null, null, [], [], [], null)
      );

      return {
        items: properties,
        total: count,
        page: page || 1,
        pageSize: pageSize || 20,
      };
    } catch (error) {
      throw new PropertyServiceError(
        'Failed to search properties',
        PropertyServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Filter properties with advanced criteria
   */
  async filterProperties(
    filters: PropertyFilters,
    page: number,
    pageSize: number
  ): Promise<PropertyListResult> {
    return this.getProperties(filters, page, pageSize);
  }

  /**
   * Get property reviews
   */
  async getPropertyReviews(
    propertyId: string,
    page: number,
    pageSize: number
  ): Promise<{ items: Property['reviews']; total: number }> {
    try {
      const { data, count } = await propertyReviewRepository.getPropertyReviews(
        propertyId,
        { page, pageSize }
      );

      const reviews = data.map((row) => PropertyMapper.mapReview(row));

      return {
        items: reviews,
        total: count,
      };
    } catch (error) {
      throw new PropertyServiceError(
        'Failed to get property reviews',
        PropertyServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Get property images
   */
  async getPropertyImages(propertyId: string): Promise<Property['images']> {
    try {
      const images = await propertyImageRepository.getPropertyImages(propertyId);
      return images.map((row) => PropertyMapper.mapImage(row));
    } catch (error) {
      throw new PropertyServiceError(
        'Failed to get property images',
        PropertyServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Get property availability
   */
  async getAvailability(
    propertyId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Property['availability']> {
    try {
      const blocks = await availabilityRepository.getAvailabilityBlocks(propertyId, {
        startDate,
        endDate,
      });
      return blocks.map((row) => PropertyMapper.mapAvailability(row));
    } catch (error) {
      throw new PropertyServiceError(
        'Failed to get availability',
        PropertyServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Check availability for date range
   */
  async checkAvailability(
    propertyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AvailabilityCheckResult> {
    try {
      const property = await this.getPropertyById(propertyId);
      const { isAvailable, conflictingBlocks } = await availabilityRepository.checkAvailability(
        propertyId,
        startDate,
        endDate
      );

      const availability = conflictingBlocks.map((row) =>
        PropertyMapper.mapAvailability(row)
      );

      return {
        isAvailable: isAvailable && property.isAvailableForDates(startDate, endDate),
        conflictingBlocks: availability,
      };
    } catch (error) {
      if (error instanceof PropertyServiceError) {
        throw error;
      }
      throw new PropertyServiceError(
        'Failed to check availability',
        PropertyServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Update availability block
   */
  async updateAvailability(
    propertyId: string,
    blockId: string,
    input: UpdateAvailabilityInput
  ): Promise<void> {
    try {
      const updateData = PropertyMapper.toAvailabilityUpdate(input);
      await availabilityRepository.updateAvailabilityBlock(blockId, updateData);
    } catch (error) {
      throw new PropertyServiceError(
        'Failed to update availability',
        PropertyServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Create availability block
   */
  async createAvailability(input: CreateAvailabilityInput): Promise<void> {
    try {
      const insertData = PropertyMapper.toAvailabilityInsert(input);
      await availabilityRepository.createAvailabilityBlock(insertData);
    } catch (error) {
      throw new PropertyServiceError(
        'Failed to create availability',
        PropertyServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Delete availability block
   */
  async deleteAvailability(propertyId: string, blockId: string): Promise<void> {
    try {
      const deletedBy = 'current-user'; // TODO: Get from auth context
      await availabilityRepository.deleteAvailabilityBlock(blockId, deletedBy);
    } catch (error) {
      throw new PropertyServiceError(
        'Failed to delete availability',
        PropertyServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Get property metrics
   */
  async getPropertyMetrics(propertyId: string): Promise<PropertyMetricsType> {
    try {
      const property = await this.getPropertyById(propertyId);

      // TODO: Get actual booking count, wishlist count, revenue from repositories
      const bookingCount = 0;
      const wishlistCount = await wishlistRepository.getPropertyWishlistCount(propertyId);
      const totalRevenue = 0;
      const lastBookingDate = null;

      return PropertyMetrics.calculateMetrics(
        property,
        bookingCount,
        wishlistCount,
        totalRevenue,
        lastBookingDate
      );
    } catch (error) {
      throw new PropertyServiceError(
        'Failed to get property metrics',
        PropertyServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Get aggregate metrics for all properties
   */
  async getAggregateMetrics(): Promise<{
    totalProperties: number;
    averageRating: number;
    totalReviews: number;
    averageOccupancyRate: number;
    totalBookings: number;
    totalWishlists: number;
    averageAvailabilityRate: number;
    totalRevenue: number;
  }> {
    try {
      const { data: allProperties } = await propertyRepository.listProperties({
        page: 1,
        pageSize: 1000,
      });

      const properties = allProperties.map((row) =>
        new Property(
          PropertyMapper.toDomain(row, null, null, null, [], [], [], null)
        )
      );

      return PropertyMetrics.calculateAggregateMetrics(properties);
    } catch (error) {
      throw new PropertyServiceError(
        'Failed to get aggregate metrics',
        PropertyServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Create property review
   */
  async createReview(input: CreateReviewInput): Promise<void> {
    try {
      const guestId = 'current-user'; // TODO: Get from auth context
      const insertData = PropertyMapper.toReviewInsert(input, guestId);
      await propertyReviewRepository.createReview(insertData);

      // Update property rating
      const averageRating = await propertyReviewRepository.getAverageRating(input.propertyId);
      const reviewCount = await propertyReviewRepository.getReviewCount(input.propertyId);
      await propertyRepository.updatePropertyRating(input.propertyId, averageRating, reviewCount);
    } catch (error) {
      throw new PropertyServiceError(
        'Failed to create review',
        PropertyServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Delete property review
   */
  async deleteReview(propertyId: string, reviewId: string): Promise<void> {
    try {
      await propertyReviewRepository.deleteReview(reviewId);

      // Update property rating
      const averageRating = await propertyReviewRepository.getAverageRating(propertyId);
      const reviewCount = await propertyReviewRepository.getReviewCount(propertyId);
      await propertyRepository.updatePropertyRating(propertyId, averageRating, reviewCount);
    } catch (error) {
      throw new PropertyServiceError(
        'Failed to delete review',
        PropertyServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Calculate pricing for date range
   */
  async calculatePricing(
    propertyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<PricingCalculation> {
    try {
      const property = await this.getPropertyById(propertyId);

      const nights = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      const subtotal = property.pricing.basePrice * nights;
      const cleaningFee = property.pricing.cleaningFee || 0;
      const serviceFee = property.pricing.serviceFee || 0;
      const securityDeposit = property.pricing.securityDeposit || 0;
      const fees = cleaningFee + serviceFee;
      const total = subtotal + fees;

      return {
        basePrice: property.pricing.basePrice,
        cleaningFee,
        serviceFee,
        securityDeposit,
        total,
        currency: property.pricing.currency,
        breakdown: {
          nights,
          pricePerNight: property.pricing.basePrice,
          subtotal,
          fees,
        },
      };
    } catch (error) {
      throw new PropertyServiceError(
        'Failed to calculate pricing',
        PropertyServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Approve property
   */
  async approveProperty(id: string): Promise<Property> {
    try {
      await propertyRepository.updateProperty(id, { is_approved: true });
      return this.getPropertyById(id);
    } catch (error) {
      throw new PropertyServiceError(
        'Failed to approve property',
        PropertyServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Unapprove property
   */
  async unapproveProperty(id: string): Promise<Property> {
    try {
      await propertyRepository.updateProperty(id, { is_approved: false });
      return this.getPropertyById(id);
    } catch (error) {
      throw new PropertyServiceError(
        'Failed to unapprove property',
        PropertyServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Mark property as featured
   */
  async markAsFeatured(id: string): Promise<Property> {
    try {
      await propertyRepository.updateProperty(id, { is_featured: true });
      return this.getPropertyById(id);
    } catch (error) {
      throw new PropertyServiceError(
        'Failed to mark as featured',
        PropertyServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Unmark property as featured
   */
  async unmarkAsFeatured(id: string): Promise<Property> {
    try {
      await propertyRepository.updateProperty(id, { is_featured: false });
      return this.getPropertyById(id);
    } catch (error) {
      throw new PropertyServiceError(
        'Failed to unmark as featured',
        PropertyServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Update property status
   */
  async updatePropertyStatus(id: string, status: string): Promise<Property> {
    try {
      await propertyRepository.updateProperty(id, { status: status as any });
      return this.getPropertyById(id);
    } catch (error) {
      throw new PropertyServiceError(
        'Failed to update property status',
        PropertyServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Get properties by owner
   */
  async getPropertiesByOwner(
    ownerId: string,
    page: number,
    pageSize: number
  ): Promise<PropertyListResult> {
    try {
      const { data, count } = await propertyRepository.getPropertiesByOwner(ownerId, {
        page,
        pageSize,
      });

      const properties = data.map((row) =>
        PropertyMapper.toDomain(row, null, null, null, [], [], [], null)
      );

      return {
        items: properties,
        total: count,
        page,
        pageSize,
      };
    } catch (error) {
      throw new PropertyServiceError(
        'Failed to get properties by owner',
        PropertyServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Get featured properties
   */
  async getFeaturedProperties(limit?: number): Promise<Property[]> {
    try {
      const properties = await propertyRepository.getFeaturedProperties(limit || 10);
      return properties.map((row) =>
        new Property(
          PropertyMapper.toDomain(row, null, null, null, [], [], [], null)
        )
      );
    } catch (error) {
      throw new PropertyServiceError(
        'Failed to get featured properties',
        PropertyServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Get similar properties
   */
  async getSimilarProperties(propertyId: string, limit?: number): Promise<Property[]> {
    try {
      const property = await this.getPropertyById(propertyId);

      // TODO: Implement similarity logic based on type, location, price
      const { data } = await propertyRepository.listProperties({
        page: 1,
        pageSize: limit || 5,
        type: this.mapTypeToDb(property.type),
      });

      const similar = data.filter((p: any) => p.id !== propertyId).slice(0, limit || 5);

      return similar.map((row) =>
        new Property(
          PropertyMapper.toDomain(row, null, null, null, [], [], [], null)
        )
      );
    } catch (error) {
      throw new PropertyServiceError(
        'Failed to get similar properties',
        PropertyServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Get dashboard metrics (aggregated across all properties)
   */
  async getDashboardMetrics(): Promise<{
    totalProperties: number;
    activeProperties: number;
    pendingApproval: number;
    averageRating: number;
    totalReviews: number;
    monthlyRevenue: number;
    occupancyRate: number;
  }> {
    try {
      const metrics = await propertyRepository.getDashboardMetrics();

      return {
        totalProperties: metrics.totalProperties,
        activeProperties: metrics.activeProperties,
        pendingApproval: metrics.pendingApproval,
        averageRating: metrics.averageRating,
        totalReviews: metrics.totalReviews,
        monthlyRevenue: 0, // TODO: Calculate from actual revenue
        occupancyRate: 0, // TODO: Calculate from actual bookings
      };
    } catch (error) {
      throw new PropertyServiceError(
        'Failed to get dashboard metrics',
        PropertyServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Map domain status to database status
   */
  private mapStatusToDb(status?: PropertyStatus | 'all'): Database['public']['Enums']['property_status'] | undefined {
    if (!status || status === 'all') return undefined;
    // TODO: Fix schema mismatch between domain and database enums
    // Domain: AVAILABLE | OCCUPIED | MAINTENANCE | PENDING | INACTIVE
    // Database: active | draft | pending_approval | archived
    const mapping: Record<string, Database['public']['Enums']['property_status']> = {
      available: 'active',
      occupied: 'archived',
      maintenance: 'draft',
      pending: 'pending_approval',
      inactive: 'archived',
    };
    return mapping[status] as Database['public']['Enums']['property_status'];
  }

  /**
   * Map domain type to database type
   */
  private mapTypeToDb(type?: PropertyType | 'all'): Database['public']['Enums']['property_type'] | undefined {
    if (!type || type === 'all') return undefined;
    // TODO: Fix schema mismatch between domain and database enums
    // Domain: APARTMENT | HOUSE | VILLA | STUDIO | CONDO | TOWNHOUSE | COTTAGE | PENTHOUSE | LOFT | OTHER
    // Database: apartment | villa | room | shop | office | house
    const mapping: Record<string, Database['public']['Enums']['property_type']> = {
      apartment: 'apartment',
      house: 'house',
      villa: 'villa',
      studio: 'room',
      condo: 'apartment',
      townhouse: 'house',
      cottage: 'house',
      penthouse: 'villa',
      loft: 'apartment',
      other: 'house',
    };
    return mapping[type] as Database['public']['Enums']['property_type'];
  }

  /**
   * Export properties to CSV
   */
  async exportProperties(filters: PropertyFilters): Promise<Blob> {
    try {
      const { items } = await this.getProperties(filters, 1, 1000);

      const headers = [
        'ID',
        'Title',
        'Type',
        'Badge',
        'Status',
        'Owner ID',
        'Rating',
        'Review Count',
        'Is Featured',
        'Is Approved',
        'Created At',
      ];

      const rows = items.map((p) => [
        p.id,
        p.title,
        p.type,
        p.badge,
        p.status,
        p.ownerId,
        p.rating,
        p.reviewCount,
        p.isFeatured,
        p.isApproved,
        p.createdAt.toISOString(),
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n');

      return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    } catch (error) {
      throw new PropertyServiceError(
        'Failed to export properties',
        PropertyServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }
}

// Export singleton instance
export const propertyService = new PropertyService();
