/**
 * BookingDetailViewModel
 *
 * Maps Booking domain entity to UI-friendly detail page display format.
 * Aggregates: Booking, Property, Guest, Host, Payment, Timeline
 * Used by: /booking/:id
 * Single source of truth for booking detail page rendering.
 */

import type { Booking } from '../../domain/booking/BookingTypes';
import { BookingStatus, BookingType } from '../../domain/booking/BookingTypes';

export interface BookingDetailViewModel {
  // Basic Info
  id: string;
  status: string;
  statusLabel: string;
  statusColor: string;
  type: string;
  typeLabel: string;
  paymentStatus: string;
  paymentStatusLabel: string;
  paymentStatusColor: string;
  specialRequests: string | null;

  // Property
  propertyId: string;
  propertyTitle: string;
  propertyImage: string | null;

  // Guest
  guestId: string;
  guestName: string;
  guestAvatar: string | null;

  // Host
  hostId: string;
  hostName: string;
  hostAvatar: string | null;

  // Dates
  checkIn: string;
  checkInDisplay: string;
  checkOut: string;
  checkOutDisplay: string;
  durationDays: number;
  durationDisplay: string;
  isUpcoming: boolean;
  isPast: boolean;
  isCurrent: boolean;

  // Guests
  guestCount: number;
  guestCountDisplay: string;

  // Pricing
  totalAmount: number;
  totalAmountDisplay: string;
  currency: string;
  currencySymbol: string;
  nightlyRate: number;
  nightlyRateDisplay: string;

  // Timeline
  timeline: {
    status: string;
    label: string;
    date: string | null;
    isCompleted: boolean;
    isCurrent: boolean;
    isPending: boolean;
  }[];

  // Actions
  canCancel: boolean;
  canConfirm: boolean;
  canModify: boolean;
  canDispute: boolean;

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdAtDisplay: string;
  updatedAtDisplay: string;
}

export class BookingDetailViewModelMapper {
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

  private static formatDateTime(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  private static calculateNightlyRate(totalAmount: number, days: number): number {
    return days > 0 ? Math.round(totalAmount / days) : totalAmount;
  }

  private static generateTimeline(booking: Booking): BookingDetailViewModel['timeline'] {
    const now = new Date();
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);

    const timeline = [
      {
        status: 'pending',
        label: 'Booking Created',
        date: booking.createdAt.toISOString(),
        isCompleted: true,
        isCurrent: booking.status === BookingStatus.PENDING,
        isPending: false,
      },
      {
        status: 'confirmed',
        label: 'Booking Confirmed',
        date: booking.status === BookingStatus.PENDING ? null : booking.createdAt.toISOString(),
        isCompleted: booking.status !== BookingStatus.PENDING,
        isCurrent: booking.status === BookingStatus.CONFIRMED,
        isPending: booking.status === BookingStatus.PENDING,
      },
      {
        status: 'ongoing',
        label: 'Check-in',
        date: checkIn.toISOString(),
        isCompleted: now > checkIn && booking.status !== BookingStatus.CANCELLED,
        isCurrent: booking.status === BookingStatus.ONGOING,
        isPending: now < checkIn && booking.status !== BookingStatus.CANCELLED,
      },
      {
        status: 'ongoing',
        label: 'Check-out',
        date: checkOut.toISOString(),
        isCompleted: now > checkOut && booking.status === BookingStatus.COMPLETED,
        isCurrent: false,
        isPending: now < checkOut && booking.status !== BookingStatus.CANCELLED,
      },
      {
        status: 'completed',
        label: 'Booking Completed',
        date: booking.status === BookingStatus.COMPLETED ? booking.updatedAt.toISOString() : null,
        isCompleted: booking.status === BookingStatus.COMPLETED,
        isCurrent: booking.status === BookingStatus.COMPLETED,
        isPending: booking.status !== BookingStatus.COMPLETED && booking.status !== BookingStatus.CANCELLED,
      },
    ];

    if (booking.status === BookingStatus.CANCELLED) {
      timeline.push({
        status: 'cancelled',
        label: 'Booking Cancelled',
        date: booking.updatedAt.toISOString(),
        isCompleted: true,
        isCurrent: true,
        isPending: false,
      });
    }

    return timeline;
  }

  static toViewModel(booking: Booking, propertyImage: string | null = null): BookingDetailViewModel {
    const durationDays = this.calculateDuration(booking.checkIn, booking.checkOut);
    const now = new Date();
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);

    return {
      // Basic Info
      id: booking.id,
      status: booking.status,
      statusLabel: this.statusLabels[booking.status] || booking.status,
      statusColor: this.statusColors[booking.status] || 'gray',
      type: booking.type,
      typeLabel: this.typeLabels[booking.type] || booking.type,
      paymentStatus: booking.paymentStatus,
      paymentStatusLabel: this.paymentStatusLabels[booking.paymentStatus] || booking.paymentStatus,
      paymentStatusColor: this.paymentStatusColors[booking.paymentStatus] || 'gray',
      specialRequests: booking.specialRequests || null,

      // Property
      propertyId: booking.propertyId,
      propertyTitle: booking.propertyTitle,
      propertyImage,

      // Guest
      guestId: booking.guestId,
      guestName: booking.guestName,
      guestAvatar: null,

      // Host
      hostId: booking.hostId,
      hostName: booking.hostName,
      hostAvatar: null,

      // Dates
      checkIn: booking.checkIn.toISOString(),
      checkInDisplay: this.formatDate(booking.checkIn),
      checkOut: booking.checkOut.toISOString(),
      checkOutDisplay: this.formatDate(booking.checkOut),
      durationDays,
      durationDisplay: this.formatDuration(durationDays),
      isUpcoming: now < checkIn,
      isPast: now > checkOut,
      isCurrent: now >= checkIn && now <= checkOut,

      // Guests
      guestCount: booking.guests,
      guestCountDisplay: `${booking.guests} guest${booking.guests !== 1 ? 's' : ''}`,

      // Pricing
      totalAmount: booking.totalAmount,
      totalAmountDisplay: this.formatCurrency(booking.totalAmount, booking.currency),
      currency: booking.currency,
      currencySymbol: booking.currency === 'USD' ? '$' : booking.currency === 'EUR' ? '€' : booking.currency === 'GBP' ? '£' : booking.currency,
      nightlyRate: this.calculateNightlyRate(booking.totalAmount, durationDays),
      nightlyRateDisplay: this.formatCurrency(this.calculateNightlyRate(booking.totalAmount, durationDays), booking.currency),

      // Timeline
      timeline: this.generateTimeline(booking),

      // Actions
      canCancel: booking.status === BookingStatus.PENDING || booking.status === BookingStatus.CONFIRMED,
      canConfirm: booking.status === BookingStatus.PENDING,
      canModify: booking.status === BookingStatus.PENDING,
      canDispute: booking.status === BookingStatus.COMPLETED,

      // Metadata
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
      createdAtDisplay: this.formatDateTime(booking.createdAt),
      updatedAtDisplay: this.formatDateTime(booking.updatedAt),
    };
  }
}
