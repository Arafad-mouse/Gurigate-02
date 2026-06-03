/**
 * CustomerCardViewModel
 *
 * Maps Customer domain entity to UI-friendly card display format.
 * Prevents direct UI dependency on domain structure.
 */

import type { Customer } from '../domain/customer/CustomerTypes';
import { LifecycleStatus } from '../domain/customer/CustomerTypes';

export interface CustomerCardViewModel {
  id: string;
  displayName: string;
  phone: string | null;
  avatar: string | null;
  customerType: string;
  customerTypeLabel: string;
  lifecycleStatus: string;
  lifecycleStatusLabel: string;
  currentProperty: string | null;
  tags: string[];
  createdAt: string;
  lastActivity: string | null;
  totalBookings: number;
  totalRentPaid: number;
  isActive: boolean;
}

export class CustomerCardViewModelMapper {
  private static customerTypeLabels: Record<string, string> = {
    tenant: 'Tenant',
    renter: 'Renter',
    buyer: 'Buyer',
    guest: 'Guest',
  };

  private static lifecycleStatusLabels: Record<string, string> = {
    lead: 'Lead',
    active: 'Active',
    inactive: 'Inactive',
    suspended: 'Suspended',
  };

  private static formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  static toViewModel(customer: Customer): CustomerCardViewModel {
    const {
      id,
      fullName,
      phone,
      avatarUrl,
      customerType,
      lifecycleStatus,
      currentPropertyName,
      tags,
      totalBookings,
      totalRentPaid,
      lastActivityAt,
      createdAt,
    } = customer;

    return {
      id,
      displayName: fullName,
      phone,
      avatar: avatarUrl,
      customerType,
      customerTypeLabel: this.customerTypeLabels[customerType],
      lifecycleStatus,
      lifecycleStatusLabel: this.lifecycleStatusLabels[lifecycleStatus],
      currentProperty: currentPropertyName,
      tags,
      createdAt: this.formatDate(createdAt),
      lastActivity: lastActivityAt ? this.formatDate(lastActivityAt) : null,
      totalBookings,
      totalRentPaid,
      isActive: lifecycleStatus === LifecycleStatus.ACTIVE,
    };
  }

  static toViewModelList(customers: Customer[]): CustomerCardViewModel[] {
    return customers.map((customer) => this.toViewModel(customer));
  }
}
