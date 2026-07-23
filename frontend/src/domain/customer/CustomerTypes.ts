/**
 * Customer Domain Types
 *
 * These are the domain types that the UI will consume.
 * They are abstracted from the database schema to prevent
 * schema changes from breaking the frontend.
 */

/**
 * Customer type enum
 */
export enum CustomerType {
  TENANT = 'tenant',
  RENTER = 'renter',
  BUYER = 'buyer',
  GUEST = 'guest',
}

/**
 * Lifecycle status enum
 */
export enum LifecycleStatus {
  LEAD = 'lead',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

/**
 * Customer domain entity
 * This is what the UI consumes - no database-specific fields
 */
export interface Customer {
  id: string;
  profileId: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  customerType: CustomerType;
  lifecycleStatus: LifecycleStatus;
  currentPropertyId: string | null;
  currentPropertyName: string | null;
  notes: string | null;
  tags: string[];
  totalBookings: number;
  totalRentPaid: number;
  currency: string;
  lastActivityAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Customer metrics for dashboard
 */
export interface CustomerMetrics {
  totalBookings: number;
  activeContracts: number;
  totalPaid: number;
  outstandingBalance: number;
  lastActivityDate: Date | null;
  lastPaymentAmount: number | null;
  lastPaymentDate: Date | null;
  currentProperty: string | null;
  currentPropertyUnit: string | null;
}

/**
 * Booking summary for customer history
 */
export interface BookingSummary {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyUnit: string;
  startDate: Date;
  endDate: Date;
  status: string;
  totalAmount: number;
  currency: string;
}

/**
 * Payment summary for customer history
 */
export interface PaymentSummary {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  date: Date;
}

/**
 * Contract summary for customer history
 */
export interface ContractSummary {
  id: string;
  bookingId: string;
  propertyId: string;
  propertyName: string;
  propertyUnit: string;
  startDate: Date;
  endDate: Date | null;
  status: string;
  monthlyRent: number;
  currency: string;
}

/**
 * Customer history for detail view
 */
export interface CustomerHistory {
  bookings: BookingSummary[];
  payments: PaymentSummary[];
  contracts: ContractSummary[];
}

/**
 * Customer list filters
 */
export interface CustomerFilters {
  search?: string;
  customerType?: CustomerType | 'all';
  lifecycleStatus?: LifecycleStatus | 'all';
  dateFrom?: Date;
  dateTo?: Date;
  propertyId?: string;
}

/**
 * Customer list result with pagination
 */
export interface CustomerListResult {
  items: Customer[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Customer create input
 */
export interface CreateCustomerInput {
  profileId: string;
  customerType: CustomerType;
  lifecycleStatus: LifecycleStatus;
  currentPropertyId?: string;
  notes?: string;
  tags?: string[];
}

/**
 * Customer update input
 */
export interface UpdateCustomerInput {
  customerType?: CustomerType;
  lifecycleStatus?: LifecycleStatus;
  currentPropertyId?: string;
  notes?: string;
  tags?: string[];
}

/**
 * Customer lifecycle transition result
 */
export interface LifecycleTransitionResult {
  success: boolean;
  newStatus: LifecycleStatus | null;
  error?: string;
}
