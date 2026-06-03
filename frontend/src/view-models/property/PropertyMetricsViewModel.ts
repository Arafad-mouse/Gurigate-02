/**
 * PropertyMetricsViewModel
 *
 * Maps PropertyMetrics domain entity to UI-friendly metrics display format.
 * Used by analytics cards.
 * Includes: totalViews, conversionRate, wishlistCount, bookingCount, revenue, occupancyRate
 */

import type { PropertyMetrics } from '../../domain/property/PropertyTypes';

export interface PropertyMetricsViewModel {
  // Engagement
  totalViews: number;
  wishlistCount: number;
  conversionRate: number;
  conversionRateDisplay: string;

  // Bookings
  bookingCount: number;
  occupancyRate: number;
  occupancyRateDisplay: string;
  averageBookingDuration: number;
  averageBookingDurationDisplay: string;

  // Revenue
  monthlyRevenue: number;
  monthlyRevenueDisplay: string;
  totalRevenue: number;
  totalRevenueDisplay: string;

  // Reviews
  averageRating: number;
  reviewCount: number;

  // Availability
  availabilityRate: number;
  availabilityRateDisplay: string;

  // Activity
  lastBookingDate: string | null;
  hasRecentBooking: boolean;
}

export class PropertyMetricsViewModelMapper {
  private static formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  }

  private static formatPercentage(value: number): string {
    return `${(value * 100).toFixed(1)}%`;
  }

  private static formatDuration(days: number): string {
    if (days < 1) return 'Less than 1 day';
    if (days === 1) return '1 day';
    if (days < 7) return `${Math.round(days)} days`;
    if (days < 30) return `${Math.round(days / 7)} weeks`;
    return `${Math.round(days / 30)} months`;
  }

  private static formatDate(date: Date | null): string | null {
    if (!date) return null;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  private static hasRecentBooking(date: Date | null): boolean {
    if (!date) return false;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return date >= thirtyDaysAgo;
  }

  private static calculateConversionRate(views: number, bookings: number): number {
    if (views === 0) return 0;
    return bookings / views;
  }

  static toViewModel(metrics: PropertyMetrics, totalViews: number = 0): PropertyMetricsViewModel {
    const conversionRate = this.calculateConversionRate(totalViews, metrics.bookingCount);

    return {
      // Engagement
      totalViews,
      wishlistCount: metrics.wishlistCount,
      conversionRate,
      conversionRateDisplay: this.formatPercentage(conversionRate),

      // Bookings
      bookingCount: metrics.bookingCount,
      occupancyRate: metrics.occupancyRate,
      occupancyRateDisplay: this.formatPercentage(metrics.occupancyRate),
      averageBookingDuration: metrics.averageBookingDuration,
      averageBookingDurationDisplay: this.formatDuration(metrics.averageBookingDuration),

      // Revenue
      monthlyRevenue: metrics.monthlyRevenue,
      monthlyRevenueDisplay: this.formatCurrency(metrics.monthlyRevenue),
      totalRevenue: metrics.totalRevenue,
      totalRevenueDisplay: this.formatCurrency(metrics.totalRevenue),

      // Reviews
      averageRating: metrics.averageRating,
      reviewCount: metrics.reviewCount,

      // Availability
      availabilityRate: metrics.availabilityRate,
      availabilityRateDisplay: this.formatPercentage(metrics.availabilityRate),

      // Activity
      lastBookingDate: this.formatDate(metrics.lastBookingDate),
      hasRecentBooking: this.hasRecentBooking(metrics.lastBookingDate),
    };
  }
}
