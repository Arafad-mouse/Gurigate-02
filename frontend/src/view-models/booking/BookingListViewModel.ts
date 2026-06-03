/**
 * BookingListViewModel
 *
 * Maps Booking domain entity to UI-friendly list display format.
 * Used by booking list pages and tables.
 */

import type { Booking, BookingListResult } from '../../domain/booking/BookingTypes';
import { BookingStatus } from '../../domain/booking/BookingTypes';

export interface BookingListViewModel {
  items: BookingListItemViewModel[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface BookingListItemViewModel {
  id: string;
  propertyTitle: string;
  guestName: string;
  hostName: string;
  status: string;
  statusLabel: string;
  statusColor: string;
  type: string;
  typeLabel: string;
  checkIn: string;
  checkInDisplay: string;
  checkOut: string;
  checkOutDisplay: string;
  guests: number;
  totalAmount: number;
  totalAmountDisplay: string;
  currency: string;
  paymentStatus: string;
  paymentStatusLabel: string;
  paymentStatusColor: string;
  durationDays: number;
  durationDisplay: string;
  isPending: boolean;
  isConfirmed: boolean;
  isOngoing: boolean;
  isCompleted: boolean;
  isCancelled: boolean;
  isUpcoming: boolean;
  isPast: boolean;
  isCurrent: boolean;
  createdAt: string;
  createdAtDisplay: string;
}

export class BookingListViewModelMapper {
  private static statusLabels: Record<string, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    ongoing: 'Ongoing',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  private static statusColors: Record<string, string> = {
    pending: 'yellow',
    confirmed: 'blue',
    ongoing: 'green',
    completed: 'gray',
    cancelled: 'red',
  };

  private static paymentStatusLabels: Record<string, string> = {
    pending: 'Pending',
    paid: 'Paid',
    refunded: 'Refunded',
    partial: 'Partial',
  };

  private static paymentStatusColors: Record<string, string> = {
    pending: 'yellow',
    paid: 'green',
    refunded: 'blue',
    partial: 'orange',
  };

  private static typeLabels: Record<string, string> = {
    short_stay: 'Short Stay',
    long_stay: 'Long Stay',
    daily: 'Daily',
  };

  private static formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  private static formatCurrency(amount: number, currency: string): string {
    const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency;
    return `${symbol}${amount.toLocaleString()}`;
  }

  private static calculateDuration(checkIn: Date, checkOut: Date): number {
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private static formatDuration(days: number): string {
    if (days === 1) return '1 night';
    return `${days} nights`;
  }

  private static toListItem(booking: Booking): BookingListItemViewModel {
    const durationDays = this.calculateDuration(booking.checkIn, booking.checkOut);
    const now = new Date();
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);

    return {
      id: booking.id,
      propertyTitle: booking.propertyTitle,
      guestName: booking.guestName,
      hostName: booking.hostName,
      status: booking.status,
      statusLabel: this.statusLabels[booking.status] || booking.status,
      statusColor: this.statusColors[booking.status] || 'gray',
      type: booking.type,
      typeLabel: this.typeLabels[booking.type] || booking.type,
      checkIn: booking.checkIn.toISOString(),
      checkInDisplay: this.formatDate(booking.checkIn),
      checkOut: booking.checkOut.toISOString(),
      checkOutDisplay: this.formatDate(booking.checkOut),
      guests: booking.guests,
      totalAmount: booking.totalAmount,
      totalAmountDisplay: this.formatCurrency(booking.totalAmount, booking.currency),
      currency: booking.currency,
      paymentStatus: booking.paymentStatus,
      paymentStatusLabel: this.paymentStatusLabels[booking.paymentStatus] || booking.paymentStatus,
      paymentStatusColor: this.paymentStatusColors[booking.paymentStatus] || 'gray',
      durationDays,
      durationDisplay: this.formatDuration(durationDays),
      isPending: booking.status === BookingStatus.PENDING,
      isConfirmed: booking.status === BookingStatus.CONFIRMED,
      isOngoing: booking.status === BookingStatus.ONGOING,
      isCompleted: booking.status === BookingStatus.COMPLETED,
      isCancelled: booking.status === BookingStatus.CANCELLED,
      isUpcoming: now < checkIn,
      isPast: now > checkOut,
      isCurrent: now >= checkIn && now <= checkOut,
      createdAt: booking.createdAt.toISOString(),
      createdAtDisplay: this.formatDate(booking.createdAt),
    };
  }

  static toViewModel(result: BookingListResult): BookingListViewModel {
    const totalPages = Math.ceil(result.total / result.pageSize);

    return {
      items: result.items.map((booking) => this.toListItem(booking)),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages,
      hasNextPage: result.page < totalPages,
      hasPreviousPage: result.page > 1,
    };
  }

  static toViewModelList(bookings: Booking[]): BookingListItemViewModel[] {
    return bookings.map((booking) => this.toListItem(booking));
  }
}
