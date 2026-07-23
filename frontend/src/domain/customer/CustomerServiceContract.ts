/**
 * Customer Service Contract
 *
 * Defines the service interface independent of implementation.
 * This allows the UI to depend on the contract, not the implementation,
 * making it easier to test and replace the service layer later.
 */

import {
  Customer,
  CustomerFilters,
  CustomerListResult,
  CustomerMetrics,
  CustomerHistory,
  BookingSummary,
  PaymentSummary,
  ContractSummary,
  CreateCustomerInput,
  UpdateCustomerInput,
  LifecycleTransitionResult,
} from './CustomerTypes';

/**
 * Customer Service Contract
 *
 * All customer service implementations must satisfy this contract.
 * The UI consumes this interface, not the concrete implementation.
 */
export interface ICustomerService {
  /**
   * List customers with filters and pagination
   */
  getCustomers(
    filters: CustomerFilters,
    page: number,
    pageSize: number
  ): Promise<CustomerListResult>;

  /**
   * Get customer by ID
   */
  getCustomerById(id: string): Promise<Customer>;

  /**
   * Create a new customer
   */
  createCustomer(input: CreateCustomerInput): Promise<Customer>;

  /**
   * Update an existing customer
   */
  updateCustomer(id: string, input: UpdateCustomerInput): Promise<Customer>;

  /**
   * Soft delete a customer
   */
  deleteCustomer(id: string): Promise<void>;

  /**
   * Suspend a customer
   */
  suspendCustomer(id: string, reason?: string): Promise<void>;

  /**
   * Restore a suspended customer
   */
  restoreCustomer(id: string): Promise<void>;

  /**
   * Get customer metrics
   */
  getCustomerMetrics(id: string): Promise<CustomerMetrics>;

  /**
   * Get customer booking history
   */
  getBookingHistory(id: string, page: number, pageSize: number): Promise<{
    items: BookingSummary[];
    total: number;
  }>;

  /**
   * Get customer payment history
   */
  getPaymentHistory(id: string, page: number, pageSize: number): Promise<{
    items: PaymentSummary[];
    total: number;
  }>;

  /**
   * Get customer contract history
   */
  getContractHistory(id: string, page: number, pageSize: number): Promise<{
    items: ContractSummary[];
    total: number;
  }>;

  /**
   * Get complete customer history
   */
  getCustomerHistory(id: string): Promise<CustomerHistory>;

  /**
   * Search customers by query
   */
  searchCustomers(
    query: string,
    page: number,
    pageSize: number
  ): Promise<CustomerListResult>;

  /**
   * Update customer lifecycle status
   */
  updateLifecycleStatus(
    id: string,
    status: string
  ): Promise<LifecycleTransitionResult>;

  /**
   * Update customer type
   */
  updateCustomerType(id: string, type: string): Promise<Customer>;

  /**
   * Add tag to customer
   */
  addTag(id: string, tag: string): Promise<Customer>;

  /**
   * Remove tag from customer
   */
  removeTag(id: string, tag: string): Promise<Customer>;

  /**
   * Update customer notes
   */
  updateNotes(id: string, notes: string): Promise<Customer>;

  /**
   * Assign property to customer
   */
  assignProperty(id: string, propertyId: string): Promise<Customer>;

  /**
   * Remove property assignment from customer
   */
  removePropertyAssignment(id: string): Promise<Customer>;

  /**
   * Get dashboard metrics (aggregated across all customers)
   */
  getDashboardMetrics(): Promise<{
    totalCustomers: number;
    activeTenants: number;
    activeGuests: number;
    activeBuyers: number;
    monthlyRevenue: number;
    overdueAccounts: number;
  }>;

  /**
   * Export customers to CSV
   */
  exportCustomers(filters: CustomerFilters): Promise<Blob>;
}

/**
 * Customer Service Error Types
 */
export class CustomerServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'CustomerServiceError';
  }
}

/**
 * Error codes
 */
export enum CustomerServiceErrorCode {
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
}
