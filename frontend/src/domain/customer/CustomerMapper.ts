/**
 * Customer Mapper
 *
 * Transforms database rows to domain entities.
 * This is the critical abstraction layer that prevents
 * database schema changes from breaking the frontend.
 */

import type { Database } from '@/integrations/supabase/types_utf8';
import {
  Customer,
  CustomerType,
  LifecycleStatus,
  BookingSummary,
  PaymentSummary,
  ContractSummary,
  CreateCustomerInput,
  UpdateCustomerInput,
} from './CustomerTypes';

/**
 * Database row types (from Supabase)
 */
type CustomerRow = Database['public']['Tables']['customers']['Row'];
type CustomerInsert = Database['public']['Tables']['customers']['Insert'];
type CustomerUpdate = Database['public']['Tables']['customers']['Update'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type BookingRow = Database['public']['Tables']['bookings']['Row'];
type PaymentRow = Database['public']['Tables']['payments']['Row'];
type ContractRow = Database['public']['Tables']['contracts']['Row'];
type PropertyRow = Database['public']['Tables']['properties']['Row'];

/**
 * Customer Mapper
 */
export class CustomerMapper {
  /**
   * Map database row to domain entity
   */
  static toDomain(row: CustomerRow, profile: ProfileRow | null): Customer {
    return {
      id: row.id,
      profileId: row.profile_id,
      fullName: profile?.full_name || '',
      phone: profile?.phone || null,
      avatarUrl: profile?.avatar_url || null,
      customerType: this.mapCustomerType(row.customer_type),
      lifecycleStatus: this.mapLifecycleStatus(row.lifecycle_status),
      currentPropertyId: row.current_property_id || null,
      currentPropertyName: null, // Will be populated by service if needed
      notes: row.notes || null,
      tags: this.parseTags(row.tags),
      totalBookings: row.total_bookings || 0,
      totalRentPaid: row.total_rent_paid ? Number(row.total_rent_paid) : 0,
      currency: row.currency || 'USD',
      lastActivityAt: row.last_activity_at ? new Date(row.last_activity_at) : null,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  /**
   * Map domain entity to database insert
   */
  static toInsert(input: CreateCustomerInput): CustomerInsert {
    return {
      profile_id: input.profileId,
      customer_type: this.mapCustomerTypeToDb(input.customerType),
      lifecycle_status: this.mapLifecycleStatusToDb(input.lifecycleStatus),
      current_property_id: input.currentPropertyId || null,
      notes: input.notes || null,
      tags: input.tags ? JSON.stringify(input.tags) : null,
      total_bookings: 0,
      total_rent_paid: 0,
      currency: 'USD',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Map domain entity to database update
   */
  static toUpdate(input: UpdateCustomerInput): CustomerUpdate {
    const update: CustomerUpdate = {
      updated_at: new Date().toISOString(),
    };

    if (input.customerType !== undefined) {
      update.customer_type = this.mapCustomerTypeToDb(input.customerType);
    }

    if (input.lifecycleStatus !== undefined) {
      update.lifecycle_status = this.mapLifecycleStatusToDb(input.lifecycleStatus);
    }

    if (input.currentPropertyId !== undefined) {
      update.current_property_id = input.currentPropertyId || null;
    }

    if (input.notes !== undefined) {
      update.notes = input.notes || null;
    }

    if (input.tags !== undefined) {
      update.tags = JSON.stringify(input.tags);
    }

    return update;
  }

  /**
   * Map booking row to domain summary
   */
  static mapBookingSummary(row: BookingRow, property: PropertyRow | null): BookingSummary {
    return {
      id: row.id,
      propertyId: row.property_id,
      propertyName: property?.title || 'Unknown Property',
      propertyUnit: property?.unit_number || '',
      startDate: new Date(row.start_date),
      endDate: new Date(row.end_date),
      status: row.booking_status,
      totalAmount: row.total_amount ? Number(row.total_amount) : 0,
      currency: row.currency || 'USD',
    };
  }

  /**
   * Map payment row to domain summary
   */
  static mapPaymentSummary(row: PaymentRow): PaymentSummary {
    return {
      id: row.id,
      bookingId: row.reference_id,
      amount: row.amount ? Number(row.amount) : 0,
      currency: row.currency || 'USD',
      method: row.payment_method || 'unknown',
      status: row.payment_status,
      date: new Date(row.created_at),
    };
  }

  /**
   * Map contract row to domain summary
   */
  static mapContractSummary(row: ContractRow, property: PropertyRow | null): ContractSummary {
    return {
      id: row.id,
      bookingId: row.booking_id,
      propertyId: property?.id || '',
      propertyName: property?.title || 'Unknown Property',
      propertyUnit: property?.unit_number || '',
      startDate: new Date(row.start_date),
      endDate: row.end_date ? new Date(row.end_date) : null,
      status: row.contract_status,
      monthlyRent: row.monthly_rent ? Number(row.monthly_rent) : 0,
      currency: row.currency || 'USD',
    };
  }

  /**
   * Map database customer type enum to domain enum
   */
  private static mapCustomerType(dbType: string): CustomerType {
    const mapping: Record<string, CustomerType> = {
      tenant: CustomerType.TENANT,
      renter: CustomerType.RENTER,
      buyer: CustomerType.BUYER,
      guest: CustomerType.GUEST,
    };

    return mapping[dbType] || CustomerType.GUEST;
  }

  /**
   * Map domain customer type enum to database enum
   */
  private static mapCustomerTypeToDb(domainType: CustomerType): string {
    const mapping: Record<CustomerType, string> = {
      [CustomerType.TENANT]: 'tenant',
      [CustomerType.RENTER]: 'renter',
      [CustomerType.BUYER]: 'buyer',
      [CustomerType.GUEST]: 'guest',
    };

    return mapping[domainType];
  }

  /**
   * Map database lifecycle status enum to domain enum
   */
  private static mapLifecycleStatus(dbStatus: string): LifecycleStatus {
    const mapping: Record<string, LifecycleStatus> = {
      lead: LifecycleStatus.LEAD,
      active: LifecycleStatus.ACTIVE,
      inactive: LifecycleStatus.INACTIVE,
      suspended: LifecycleStatus.SUSPENDED,
    };

    return mapping[dbStatus] || LifecycleStatus.LEAD;
  }

  /**
   * Map domain lifecycle status enum to database enum
   */
  private static mapLifecycleStatusToDb(domainStatus: LifecycleStatus): string {
    const mapping: Record<LifecycleStatus, string> = {
      [LifecycleStatus.LEAD]: 'lead',
      [LifecycleStatus.ACTIVE]: 'active',
      [LifecycleStatus.INACTIVE]: 'inactive',
      [LifecycleStatus.SUSPENDED]: 'suspended',
    };

    return mapping[domainStatus];
  }

  /**
   * Parse tags from JSON
   */
  private static parseTags(tagsJson: unknown): string[] {
    if (!tagsJson) {
      return [];
    }

    if (Array.isArray(tagsJson)) {
      return tagsJson as string[];
    }

    if (typeof tagsJson === 'string') {
      try {
        const parsed = JSON.parse(tagsJson);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    return [];
  }
}
