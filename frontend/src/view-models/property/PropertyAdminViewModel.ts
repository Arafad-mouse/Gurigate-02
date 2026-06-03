/**
 * PropertyAdminViewModel
 *
 * Maps Property domain entity to UI-friendly admin display format.
 * Used by: Admin Dashboard, Admin Properties, Approval Queue
 * Includes: approvalStatus, submittedAt, ownerName, ownerEmail, viewCount, bookingCount, revenue
 * Supports the approval workflow.
 */

import type { Property } from '../../domain/property/PropertyTypes';
import { PropertyBadge, PropertyStatus } from '../../domain/property/PropertyTypes';
import {
  PROPERTY_BADGE_LABELS,
  PROPERTY_STATUS_LABELS,
  PROPERTY_APPROVAL_STATUS_LABELS,
} from '../../constants/property';

export interface PropertyAdminViewModel {
  // Basic Info
  id: string;
  title: string;
  city: string;
  country: string;

  // Status
  badge: string;
  badgeLabel: string;
  status: string;
  statusLabel: string;
  approvalStatus: string;
  approvalStatusLabel: string;
  isFeatured: boolean;
  isApproved: boolean;

  // Owner
  ownerId: string;
  ownerName: string;
  ownerEmail: string | null;

  // Metrics
  viewCount: number;
  bookingCount: number;
  revenue: number;
  revenueDisplay: string;
  rating: number;
  reviewCount: number;

  // Pricing
  basePrice: number;
  priceDisplay: string;
  currency: string;

  // Metadata
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export class PropertyAdminViewModelMapper {
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

  private static getApprovalStatus(property: Property): string {
    if (!property.isApproved) {
      return 'pending';
    }
    return 'approved';
  }

  static toViewModel(property: Property, ownerEmail: string | null = null): PropertyAdminViewModel {
    const {
      id,
      title,
      address,
      badge,
      status,
      isFeatured,
      isApproved,
      ownerId,
      ownerName,
      viewCount,
      rating,
      reviewCount,
      pricing,
      createdAt,
      updatedAt,
    } = property;

    const approvalStatus = this.getApprovalStatus(property);

    return {
      // Basic Info
      id,
      title,
      city: address.city,
      country: address.country,

      // Status
      badge,
      badgeLabel: PROPERTY_BADGE_LABELS[badge],
      status,
      statusLabel: PROPERTY_STATUS_LABELS[status],
      approvalStatus,
      approvalStatusLabel: PROPERTY_APPROVAL_STATUS_LABELS[approvalStatus],
      isFeatured,
      isApproved,

      // Owner
      ownerId,
      ownerName,
      ownerEmail,

      // Metrics
      viewCount,
      bookingCount: 0, // TODO: Get from service when available
      revenue: 0, // TODO: Get from service when available
      revenueDisplay: this.formatCurrency(0),
      rating,
      reviewCount,

      // Pricing
      basePrice: pricing.basePrice,
      priceDisplay: this.formatCurrency(pricing.basePrice, pricing.currency),
      currency: pricing.currency,

      // Metadata
      submittedAt: this.formatDate(createdAt),
      createdAt: this.formatDate(createdAt),
      updatedAt: this.formatDate(updatedAt),
    };
  }

  static toViewModelList(properties: Property[], ownerEmails: Map<string, string> = new Map()): PropertyAdminViewModel[] {
    return properties.map((property) =>
      this.toViewModel(property, ownerEmails.get(property.ownerId) || null)
    );
  }
}
