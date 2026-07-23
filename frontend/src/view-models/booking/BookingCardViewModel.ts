/**
 * BookingCardViewModel
 *
 * Maps Booking domain entity to UI-friendly card display format.
 * Used by booking cards in admin and host dashboards.
 */

import type { Booking } from '../../domain/booking/BookingTypes';

export interface BookingCardViewModel {
  id: string;
  propertyTitle: string;
  guestName: string;
  hostName: string;
  status: string;
  statusDisplay: string;
  checkInDisplay: string;
  checkOutDisplay: string;
  guests: number;
  totalAmountDisplay: string;
  currency: string;
  paymentStatus: string;
  paymentStatusDisplay: string;
  durationDays: number;
  durationDisplay: string;
  isPending: boolean;
  isConfirmed: boolean;
  isOngoing: boolean;
  isCompleted: boolean;
  isCancelled: boolean;
}

export class BookingCardViewModelMapper {
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

  private static calculateDuration(checkIn: Date, checkOut: Date): number {
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private static formatDuration(days: number): string {
    if (days === 1) return '1 night';
    return `${days} nights`;
  }

  private static getStatusDisplay(status: string): string {
    const statusMap: Record<string, string> = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      ongoing: 'Ongoing',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return statusMap[status] || status;
  }

  private static getPaymentStatusDisplay(status: string): string {
    const statusMap: Record<string, string> = {
      pending: 'Pending',
      paid: 'Paid',
      refunded: 'Refunded',
      partial: 'Partial',
    };
    return statusMap[status] || status;
  }

  static toViewModel(booking: Booking): BookingCardViewModel {
    const durationDays = this.calculateDuration(booking.checkIn, booking.checkOut);

    return {
      id: booking.id,
      propertyTitle: booking.propertyTitle,
      guestName: booking.guestName,
      hostName: booking.hostName,
      status: booking.status,
      statusDisplay: this.getStatusDisplay(booking.status),
      checkInDisplay: this.formatDate(booking.checkIn),
      checkOutDisplay: this.formatDate(booking.checkOut),
      guests: booking.guests,
      totalAmountDisplay: this.formatCurrency(booking.totalAmount, booking.currency),
      currency: booking.currency,
      paymentStatus: booking.paymentStatus,
      paymentStatusDisplay: this.getPaymentStatusDisplay(booking.paymentStatus),
      durationDays,
      durationDisplay: this.formatDuration(durationDays),
      isPending: booking.status === 'pending',
      isConfirmed: booking.status === 'confirmed',
      isOngoing: booking.status === 'ongoing',
      isCompleted: booking.status === 'completed',
      isCancelled: booking.status === 'cancelled',
    };
  }
}
