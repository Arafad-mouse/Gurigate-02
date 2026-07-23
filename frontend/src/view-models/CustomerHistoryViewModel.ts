/**
 * CustomerHistoryViewModel
 *
 * Maps CustomerHistory domain entity to UI-friendly history display format.
 * Prevents direct UI dependency on domain structure.
 */

import type { CustomerHistory, BookingSummary, PaymentSummary, ContractSummary } from '../domain/customer/CustomerTypes';

export interface BookingViewModel {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyUnit: string;
  startDate: string;
  endDate: string;
  status: string;
  totalAmount: string;
  currency: string;
  isCompleted: boolean;
  isUpcoming: boolean;
  isActive: boolean;
}

export interface PaymentViewModel {
  id: string;
  bookingId: string;
  amount: string;
  currency: string;
  method: string;
  status: string;
  date: string;
  isRecent: boolean;
}

export interface ContractViewModel {
  id: string;
  bookingId: string;
  propertyId: string;
  propertyName: string;
  propertyUnit: string;
  startDate: string;
  endDate: string | null;
  status: string;
  monthlyRent: string;
  currency: string;
  isActive: boolean;
  isExpiringSoon: boolean;
}

export interface CustomerHistoryViewModel {
  bookings: BookingViewModel[];
  payments: PaymentViewModel[];
  contracts: ContractViewModel[];
  totalBookings: number;
  totalPayments: number;
  totalContracts: number;
  hasRecentActivity: boolean;
}

export class CustomerHistoryViewModelMapper {
  private static formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  private static formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  }

  private static isRecent(date: Date): boolean {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return date >= thirtyDaysAgo;
  }

  private static isUpcoming(date: Date): boolean {
    const today = new Date();
    return date > today;
  }

  private static isCompleted(endDate: Date): boolean {
    const today = new Date();
    return endDate < today;
  }

  private static isExpiringSoon(endDate: Date | null): boolean {
    if (!endDate) return false;
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const today = new Date();
    return endDate >= today && endDate <= thirtyDaysFromNow;
  }

  static toBookingViewModel(booking: BookingSummary): BookingViewModel {
    return {
      id: booking.id,
      propertyId: booking.propertyId,
      propertyName: booking.propertyName,
      propertyUnit: booking.propertyUnit,
      startDate: this.formatDate(booking.startDate),
      endDate: this.formatDate(booking.endDate),
      status: booking.status,
      totalAmount: this.formatCurrency(booking.totalAmount, booking.currency),
      currency: booking.currency,
      isCompleted: this.isCompleted(booking.endDate),
      isUpcoming: this.isUpcoming(booking.startDate),
      isActive: !this.isCompleted(booking.endDate) && !this.isUpcoming(booking.startDate),
    };
  }

  static toPaymentViewModel(payment: PaymentSummary): PaymentViewModel {
    return {
      id: payment.id,
      bookingId: payment.bookingId,
      amount: this.formatCurrency(payment.amount, payment.currency),
      currency: payment.currency,
      method: payment.method,
      status: payment.status,
      date: this.formatDate(payment.date),
      isRecent: this.isRecent(payment.date),
    };
  }

  static toContractViewModel(contract: ContractSummary): ContractViewModel {
    return {
      id: contract.id,
      bookingId: contract.bookingId,
      propertyId: contract.propertyId,
      propertyName: contract.propertyName,
      propertyUnit: contract.propertyUnit,
      startDate: this.formatDate(contract.startDate),
      endDate: contract.endDate ? this.formatDate(contract.endDate) : null,
      status: contract.status,
      monthlyRent: this.formatCurrency(contract.monthlyRent, contract.currency),
      currency: contract.currency,
      isActive: contract.status === 'active',
      isExpiringSoon: contract.endDate ? this.isExpiringSoon(contract.endDate) : false,
    };
  }

  static toViewModel(history: CustomerHistory): CustomerHistoryViewModel {
    const bookings = history.bookings.map((b) => this.toBookingViewModel(b));
    const payments = history.payments.map((p) => this.toPaymentViewModel(p));
    const contracts = history.contracts.map((c) => this.toContractViewModel(c));

    const hasRecentActivity =
      bookings.some((b) => b.isUpcoming || b.isActive) ||
      payments.some((p) => p.isRecent) ||
      contracts.some((c) => c.isActive || c.isExpiringSoon);

    return {
      bookings,
      payments,
      contracts,
      totalBookings: bookings.length,
      totalPayments: payments.length,
      totalContracts: contracts.length,
      hasRecentActivity,
    };
  }
}
