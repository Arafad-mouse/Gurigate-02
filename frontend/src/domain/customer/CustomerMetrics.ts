/**
 * Customer Metrics Calculator
 *
 * Centralizes all metrics calculation logic to prevent
 * calculation rules from being duplicated across components.
 */

import { CustomerMetrics, BookingSummary, PaymentSummary, ContractSummary } from './CustomerTypes';

/**
 * Customer Metrics Calculator
 */
export class CustomerMetricsCalculator {
  /**
   * Calculate customer metrics from booking, payment, and contract history
   */
  static calculateMetrics(
    bookings: BookingSummary[],
    payments: PaymentSummary[],
    contracts: ContractSummary[]
  ): CustomerMetrics {
    const totalBookings = bookings.length;
    const activeContracts = contracts.filter(c => c.status === 'active').length;
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    
    // Calculate outstanding balance
    const outstandingBalance = this.calculateOutstandingBalance(contracts, payments);
    
    // Get last activity date
    const lastActivityDate = this.calculateLastActivityDate(bookings, payments);
    
    // Get last payment
    const lastPayment = payments.length > 0 ? payments[0] : null;
    const lastPaymentAmount = lastPayment?.amount || null;
    const lastPaymentDate = lastPayment?.date || null;
    
    // Get current property from active contract
    const activeContract = contracts.find(c => c.status === 'active');
    const currentProperty = activeContract?.propertyName || null;
    const currentPropertyUnit = activeContract?.propertyUnit || null;

    return {
      totalBookings,
      activeContracts,
      totalPaid,
      outstandingBalance,
      lastActivityDate,
      lastPaymentAmount,
      lastPaymentDate,
      currentProperty,
      currentPropertyUnit,
    };
  }

  /**
   * Calculate outstanding balance from contracts and payments
   */
  private static calculateOutstandingBalance(
    contracts: ContractSummary[],
    payments: PaymentSummary[]
  ): number {
    let balance = 0;

    // Add rent from active contracts
    contracts
      .filter(c => c.status === 'active')
      .forEach(contract => {
        // Simplified: just add monthly rent
        // In production, this would calculate based on contract duration
        balance += contract.monthlyRent;
      });

    // Subtract payments
    payments.forEach(payment => {
      balance -= payment.amount;
    });

    return Math.max(0, balance);
  }

  /**
   * Calculate last activity date from bookings and payments
   */
  private static calculateLastActivityDate(
    bookings: BookingSummary[],
    payments: PaymentSummary[]
  ): Date | null {
    const dates: Date[] = [];

    bookings.forEach(booking => {
      dates.push(booking.startDate);
      dates.push(booking.endDate);
    });

    payments.forEach(payment => {
      dates.push(payment.date);
    });

    if (dates.length === 0) {
      return null;
    }

    return new Date(Math.max(...dates.map(d => d.getTime())));
  }

  /**
   * Calculate days since last activity
   */
  static calculateDaysSinceLastActivity(lastActivityDate: Date | null): number {
    if (!lastActivityDate) {
      return Infinity;
    }

    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastActivityDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  /**
   * Check if customer is inactive (90+ days without activity)
   */
  static isInactive(lastActivityDate: Date | null): boolean {
    const daysSinceActivity = this.calculateDaysSinceLastActivity(lastActivityDate);
    return daysSinceActivity >= 90;
  }

  /**
   * Get customer health score (0-100)
   */
  static calculateHealthScore(metrics: CustomerMetrics): number {
    let score = 100;

    // Deduct for outstanding balance
    if (metrics.outstandingBalance > 0) {
      score -= Math.min(30, metrics.outstandingBalance / 1000);
    }

    // Deduct for inactivity
    if (metrics.lastActivityDate) {
      const daysSinceActivity = this.calculateDaysSinceLastActivity(metrics.lastActivityDate);
      if (daysSinceActivity > 30) {
        score -= Math.min(20, (daysSinceActivity - 30) / 3);
      }
    }

    // Boost for active contracts
    if (metrics.activeContracts > 0) {
      score += 10;
    }

    // Boost for recent payments
    if (metrics.lastPaymentDate) {
      const daysSincePayment = this.calculateDaysSinceLastActivity(metrics.lastPaymentDate);
      if (daysSincePayment < 30) {
        score += 10;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get customer health status
   */
  static getHealthStatus(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }
}
