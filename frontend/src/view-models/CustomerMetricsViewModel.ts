/**
 * CustomerMetricsViewModel
 *
 * Maps CustomerMetrics domain entity to UI-friendly metrics display format.
 * Prevents direct UI dependency on domain structure.
 */

import type { CustomerMetrics } from '../domain/customer/CustomerTypes';

export interface CustomerMetricsViewModel {
  totalBookings: number;
  activeContracts: number;
  totalPaid: string;
  outstandingBalance: string;
  lastActivityDate: string | null;
  lastPaymentAmount: string | null;
  lastPaymentDate: string | null;
  currentProperty: string | null;
  currentPropertyUnit: string | null;
  hasOutstandingBalance: boolean;
  hasRecentActivity: boolean;
}

export class CustomerMetricsViewModelMapper {
  private static formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  }

  private static formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  private static isRecentActivity(date: Date | null): boolean {
    if (!date) return false;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return date >= thirtyDaysAgo;
  }

  static toViewModel(metrics: CustomerMetrics): CustomerMetricsViewModel {
    return {
      totalBookings: metrics.totalBookings,
      activeContracts: metrics.activeContracts,
      totalPaid: this.formatCurrency(metrics.totalPaid),
      outstandingBalance: this.formatCurrency(metrics.outstandingBalance),
      lastActivityDate: metrics.lastActivityDate ? this.formatDate(metrics.lastActivityDate) : null,
      lastPaymentAmount: metrics.lastPaymentAmount ? this.formatCurrency(metrics.lastPaymentAmount) : null,
      lastPaymentDate: metrics.lastPaymentDate ? this.formatDate(metrics.lastPaymentDate) : null,
      currentProperty: metrics.currentProperty,
      currentPropertyUnit: metrics.currentPropertyUnit,
      hasOutstandingBalance: metrics.outstandingBalance > 0,
      hasRecentActivity: this.isRecentActivity(metrics.lastActivityDate),
    };
  }
}
