/**
 * Property Service Contract
 *
 * Defines the service interface independent of implementation.
 * This allows the UI to depend on the contract, not the implementation,
 * making it easier to test and replace the service layer later.
 */

import type {
  PropertyFilters,
  PropertyListResult,
  PropertyMetrics,
  CreatePropertyInput,
  UpdatePropertyInput,
  CreateAvailabilityInput,
  UpdateAvailabilityInput,
  CreateReviewInput,
  AvailabilityCheckResult,
  PricingCalculation,
  PropertySearchResult,
} from './PropertyTypes';
import { Property } from './Property';

/**
 * Property Service Contract
 *
 * All property service implementations must satisfy this contract.
 * The UI consumes this interface, not the concrete implementation.
 */
export interface IPropertyService {
  /**
   * List properties with filters and pagination
   */
  getProperties(
    filters: PropertyFilters,
    page: number,
    pageSize: number
  ): Promise<PropertyListResult>;

  /**
   * Get property by ID
   */
  getPropertyById(id: string): Promise<Property>;

  /**
   * Create a new property
   */
  createProperty(input: CreatePropertyInput): Promise<Property>;

  /**
   * Update an existing property
   */
  updateProperty(id: string, input: UpdatePropertyInput): Promise<Property>;

  /**
   * Archive a property (soft delete)
   */
  archiveProperty(id: string): Promise<void>;

  /**
   * Restore an archived property
   */
  restoreProperty(id: string): Promise<void>;

  /**
   * Search properties by query
   */
  searchProperties(
    query: string,
    filters?: PropertyFilters,
    page?: number,
    pageSize?: number
  ): Promise<PropertyListResult>;

  /**
   * Filter properties with advanced criteria
   */
  filterProperties(
    filters: PropertyFilters,
    page: number,
    pageSize: number
  ): Promise<PropertyListResult>;

  /**
   * Get property reviews
   */
  getPropertyReviews(
    propertyId: string,
    page: number,
    pageSize: number
  ): Promise<{
    items: Property['reviews'];
    total: number;
  }>;

  /**
   * Get property images
   */
  getPropertyImages(propertyId: string): Promise<Property['images']>;

  /**
   * Get property availability
   */
  getAvailability(
    propertyId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Property['availability']>;

  /**
   * Check availability for date range
   */
  checkAvailability(
    propertyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AvailabilityCheckResult>;

  /**
   * Update availability block
   */
  updateAvailability(
    propertyId: string,
    blockId: string,
    input: UpdateAvailabilityInput
  ): Promise<void>;

  /**
   * Create availability block
   */
  createAvailability(input: CreateAvailabilityInput): Promise<void>;

  /**
   * Delete availability block
   */
  deleteAvailability(propertyId: string, blockId: string): Promise<void>;

  /**
   * Get property metrics
   */
  getPropertyMetrics(propertyId: string): Promise<PropertyMetrics>;

  /**
   * Get aggregate metrics for all properties
   */
  getAggregateMetrics(): Promise<{
    totalProperties: number;
    averageRating: number;
    totalReviews: number;
    averageOccupancyRate: number;
    totalBookings: number;
    totalWishlists: number;
    averageAvailabilityRate: number;
    totalRevenue: number;
  }>;

  /**
   * Create property review
   */
  createReview(input: CreateReviewInput): Promise<void>;

  /**
   * Delete property review
   */
  deleteReview(propertyId: string, reviewId: string): Promise<void>;

  /**
   * Calculate pricing for date range
   */
  calculatePricing(
    propertyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<PricingCalculation>;

  /**
   * Approve property
   */
  approveProperty(id: string): Promise<Property>;

  /**
   * Unapprove property
   */
  unapproveProperty(id: string): Promise<Property>;

  /**
   * Mark property as featured
   */
  markAsFeatured(id: string): Promise<Property>;

  /**
   * Unmark property as featured
   */
  unmarkAsFeatured(id: string): Promise<Property>;

  /**
   * Update property status
   */
  updatePropertyStatus(id: string, status: string): Promise<Property>;

  /**
   * Get properties by owner
   */
  getPropertiesByOwner(
    ownerId: string,
    page: number,
    pageSize: number
  ): Promise<PropertyListResult>;

  /**
   * Get featured properties
   */
  getFeaturedProperties(limit?: number): Promise<Property[]>;

  /**
   * Get similar properties
   */
  getSimilarProperties(propertyId: string, limit?: number): Promise<Property[]>;

  /**
   * Get dashboard metrics (aggregated across all properties)
   */
  getDashboardMetrics(): Promise<{
    totalProperties: number;
    activeProperties: number;
    pendingApproval: number;
    averageRating: number;
    totalReviews: number;
    monthlyRevenue: number;
    occupancyRate: number;
  }>;

  /**
   * Export properties to CSV
   */
  exportProperties(filters: PropertyFilters): Promise<Blob>;
}

/**
 * Property Service Error Types
 */
export class PropertyServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'PropertyServiceError';
  }
}

/**
 * Error codes
 */
export enum PropertyServiceErrorCode {
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  AVailability_CONFLICT = 'AVAILABILITY_CONFLICT',
  PRICING_ERROR = 'PRICING_ERROR',
}
