/**
 * Property Metrics Engine
 *
 * Calculates property performance metrics.
 * Keeps calculations outside pages for reusability.
 */

import type { PropertyMetrics as PropertyMetricsType } from './PropertyTypes';
import { Property } from './Property';

/**
 * Property Metrics Engine
 */
export class PropertyMetrics {
  /**
   * Calculate metrics for a single property
   */
  static calculateMetrics(
    property: Property,
    bookingCount: number = 0,
    wishlistCount: number = 0,
    totalRevenue: number = 0,
    lastBookingDate: Date | null = null
  ): PropertyMetricsType {
    const averageRating = property.getAverageRating();
    const reviewCount = property.reviews.length;
    
    // Calculate availability rate (percentage of days not blocked)
    const availabilityRate = this.calculateAvailabilityRate(property);
    
    // Calculate occupancy rate (estimated from bookings)
    const occupancyRate = this.calculateOccupancyRate(bookingCount, property);
    
    // Calculate average booking duration (if bookings exist)
    const averageBookingDuration = this.calculateAverageBookingDuration(bookingCount, property);

    return {
      propertyId: property.id,
      averageRating,
      reviewCount,
      occupancyRate,
      bookingCount,
      wishlistCount,
      availabilityRate,
      monthlyRevenue: this.calculateMonthlyRevenue(totalRevenue),
      totalRevenue,
      lastBookingDate,
      averageBookingDuration,
    };
  }

  /**
   * Calculate availability rate for a property
   */
  private static calculateAvailabilityRate(property: Property): number {
    if (property.availability.length === 0) {
      return 100; // No blocks = fully available
    }

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    // Count blocked days in next 30 days
    let blockedDays = 0;
    
    property.availability.forEach(block => {
      if (block.overlapsWith(now, thirtyDaysFromNow)) {
        const blockStart = block.startDate < now ? now : block.startDate;
        const blockEnd = block.endDate > thirtyDaysFromNow ? thirtyDaysFromNow : block.endDate;
        const days = Math.ceil((blockEnd.getTime() - blockStart.getTime()) / (1000 * 60 * 60 * 24));
        blockedDays += days;
      }
    });

    const availabilityRate = ((30 - blockedDays) / 30) * 100;
    return Math.max(0, Math.min(100, availabilityRate));
  }

  /**
   * Calculate occupancy rate (estimated)
   */
  private static calculateOccupancyRate(bookingCount: number, property: Property): number {
    // Simple estimation: assume 30-day window
    const maxPossibleBookings = 30; // One booking per day max
    const occupancyRate = (bookingCount / maxPossibleBookings) * 100;
    return Math.max(0, Math.min(100, occupancyRate));
  }

  /**
   * Calculate monthly revenue from total revenue
   */
  private static calculateMonthlyRevenue(totalRevenue: number): number {
    // Assume total revenue is for current month
    return totalRevenue;
  }

  /**
   * Calculate average booking duration
   */
  private static calculateAverageBookingDuration(bookingCount: number, property: Property): number {
    if (bookingCount === 0) return 0;
    
    // Estimate based on property type and pricing
    // This is a simplified calculation - real implementation would use actual booking data
    const typicalDurations: Record<string, number> = {
      apartment: 7,
      house: 14,
      villa: 21,
      studio: 5,
      condo: 10,
      townhouse: 12,
      cottage: 7,
      penthouse: 14,
      loft: 5,
      other: 7,
    };

    return typicalDurations[property.type] || 7;
  }

  /**
   * Calculate aggregate metrics for multiple properties
   */
  static calculateAggregateMetrics(properties: Property[]): {
    totalProperties: number;
    averageRating: number;
    totalReviews: number;
    averageOccupancyRate: number;
    totalBookings: number;
    totalWishlists: number;
    averageAvailabilityRate: number;
    totalRevenue: number;
  } {
    if (properties.length === 0) {
      return {
        totalProperties: 0,
        averageRating: 0,
        totalReviews: 0,
        averageOccupancyRate: 0,
        totalBookings: 0,
        totalWishlists: 0,
        averageAvailabilityRate: 0,
        totalRevenue: 0,
      };
    }

    const totalReviews = properties.reduce((sum, p) => sum + p.reviews.length, 0);
    const averageRating = properties.reduce((sum, p) => sum + p.rating, 0) / properties.length;
    
    // These would be calculated from actual data in a real implementation
    const averageOccupancyRate = 0;
    const totalBookings = 0;
    const totalWishlists = 0;
    const averageAvailabilityRate = properties.reduce((sum, p) => sum + this.calculateAvailabilityRate(p), 0) / properties.length;
    const totalRevenue = 0;

    return {
      totalProperties: properties.length,
      averageRating,
      totalReviews,
      averageOccupancyRate,
      totalBookings,
      totalWishlists,
      averageAvailabilityRate,
      totalRevenue,
    };
  }

  /**
   * Get performance rating for a property
   */
  static getPerformanceRating(metrics: PropertyMetricsType): {
    rating: 'excellent' | 'good' | 'average' | 'poor';
    score: number;
  } {
    let score = 0;

    // Rating score (0-30)
    score += (metrics.averageRating / 5) * 30;

    // Occupancy rate score (0-25)
    score += (metrics.occupancyRate / 100) * 25;

    // Availability rate score (0-20)
    score += (metrics.availabilityRate / 100) * 20;

    // Review count score (0-15)
    score += Math.min(metrics.reviewCount / 10, 1) * 15;

    // Booking count score (0-10)
    score += Math.min(metrics.bookingCount / 5, 1) * 10;

    let rating: 'excellent' | 'good' | 'average' | 'poor';
    if (score >= 80) rating = 'excellent';
    else if (score >= 60) rating = 'good';
    else if (score >= 40) rating = 'average';
    else rating = 'poor';

    return { rating, score };
  }

  /**
   * Get revenue trend (would need historical data in real implementation)
   */
  static getRevenueTrend(
    currentRevenue: number,
    previousRevenue: number
  ): {
    trend: 'up' | 'down' | 'stable';
    percentage: number;
  } {
    if (previousRevenue === 0) {
      return { trend: 'stable', percentage: 0 };
    }

    const percentage = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
    
    let trend: 'up' | 'down' | 'stable';
    if (percentage > 5) trend = 'up';
    else if (percentage < -5) trend = 'down';
    else trend = 'stable';

    return { trend, percentage };
  }

  /**
   * Compare property metrics against benchmarks
   */
  static compareWithBenchmarks(
    metrics: PropertyMetricsType,
    benchmarks: {
      averageRating: number;
      occupancyRate: number;
      availabilityRate: number;
      monthlyRevenue: number;
    }
  ): {
    rating: 'above' | 'at' | 'below';
    averageRating: string;
    occupancyRate: string;
    availabilityRate: string;
    monthlyRevenue: string;
  } {
    const compare = (value: number, benchmark: number): string => {
      const diff = ((value - benchmark) / benchmark) * 100;
      if (diff > 10) return 'above';
      if (diff < -10) return 'below';
      return 'at';
    };

    const averageRating = compare(metrics.averageRating, benchmarks.averageRating);
    const occupancyRate = compare(metrics.occupancyRate, benchmarks.occupancyRate);
    const availabilityRate = compare(metrics.availabilityRate, benchmarks.availabilityRate);
    const monthlyRevenue = compare(metrics.monthlyRevenue, benchmarks.monthlyRevenue);

    const aboveCount = [averageRating, occupancyRate, availabilityRate, monthlyRevenue].filter(
      r => r === 'above'
    ).length;

    let rating: 'above' | 'at' | 'below';
    if (aboveCount >= 3) rating = 'above';
    else if (aboveCount === 0) rating = 'below';
    else rating = 'at';

    return {
      rating,
      averageRating,
      occupancyRate,
      availabilityRate,
      monthlyRevenue,
    };
  }
}
