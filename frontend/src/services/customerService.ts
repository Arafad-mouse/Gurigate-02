/**
 * Customer Service Implementation
 *
 * Implements ICustomerService contract using customerRepository.
 * This service orchestrates business logic and uses the repository for persistence.
 */

import { customerRepository } from '../repositories/customerRepository';
import { CustomerMapper } from '../domain/customer/CustomerMapper';
import { CustomerLifecycle } from '../domain/customer/CustomerLifecycle';
import { CustomerMetricsCalculator } from '../domain/customer/CustomerMetrics';
import {
  ICustomerService,
  CustomerServiceError,
  CustomerServiceErrorCode,
} from '../domain/customer/CustomerServiceContract';
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
  CustomerType,
  LifecycleStatus,
} from '../domain/customer/CustomerTypes';

/**
 * Customer Service Implementation
 */
export class CustomerService implements ICustomerService {
  /**
   * List customers with filters and pagination
   */
  async getCustomers(
    filters: CustomerFilters,
    page: number,
    pageSize: number
  ): Promise<CustomerListResult> {
    try {
      const { data, count } = await customerRepository.listCustomers({
        page,
        pageSize,
        lifecycleStatus:
          filters.lifecycleStatus === 'all'
            ? undefined
            : filters.lifecycleStatus,
        customerType:
          filters.customerType === 'all'
            ? undefined
            : filters.customerType,
      });

      const customers = data.map((row) =>
        CustomerMapper.toDomain(row, row.profile)
      );

      return {
        items: customers,
        total: count,
        page,
        pageSize,
      };
    } catch (error) {
      throw new CustomerServiceError(
        'Failed to list customers',
        CustomerServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Get customer by ID
   */
  async getCustomerById(id: string): Promise<Customer> {
    try {
      const customerWithProfile = await customerRepository.getCustomerById(id);

      if (!customerWithProfile) {
        throw new CustomerServiceError(
          'Customer not found',
          CustomerServiceErrorCode.NOT_FOUND
        );
      }

      return CustomerMapper.toDomain(
        customerWithProfile,
        customerWithProfile.profile
      );
    } catch (error) {
      if (error instanceof CustomerServiceError) {
        throw error;
      }
      throw new CustomerServiceError(
        'Failed to get customer',
        CustomerServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Create a new customer
   */
  async createCustomer(input: CreateCustomerInput): Promise<Customer> {
    try {
      const insertData = CustomerMapper.toInsert(input);
      const created = await customerRepository.createCustomer(insertData);

      // Fetch with profile to return domain entity
      const customerWithProfile = await customerRepository.getCustomerById(
        created.id
      );

      if (!customerWithProfile) {
        throw new CustomerServiceError(
          'Failed to fetch created customer',
          CustomerServiceErrorCode.INTERNAL_ERROR
        );
      }

      return CustomerMapper.toDomain(
        customerWithProfile,
        customerWithProfile.profile
      );
    } catch (error) {
      if (error instanceof CustomerServiceError) {
        throw error;
      }
      throw new CustomerServiceError(
        'Failed to create customer',
        CustomerServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Update an existing customer
   */
  async updateCustomer(id: string, input: UpdateCustomerInput): Promise<Customer> {
    try {
      const updateData = CustomerMapper.toUpdate(input);
      await customerRepository.updateCustomer(id, updateData);

      // Fetch with profile to return domain entity
      const customerWithProfile = await customerRepository.getCustomerById(id);

      if (!customerWithProfile) {
        throw new CustomerServiceError(
          'Failed to fetch updated customer',
          CustomerServiceErrorCode.INTERNAL_ERROR
        );
      }

      return CustomerMapper.toDomain(
        customerWithProfile,
        customerWithProfile.profile
      );
    } catch (error) {
      if (error instanceof CustomerServiceError) {
        throw error;
      }
      throw new CustomerServiceError(
        'Failed to update customer',
        CustomerServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Soft delete a customer
   */
  async deleteCustomer(id: string): Promise<void> {
    try {
      const deletedBy = 'current-user'; // TODO: Get from auth context
      await customerRepository.deleteCustomer(id, deletedBy);
    } catch (error) {
      throw new CustomerServiceError(
        'Failed to delete customer',
        CustomerServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Suspend a customer
   */
  async suspendCustomer(id: string): Promise<void> {
    try {
      const customer = await this.getCustomerById(id);

      // Check if can suspend
      if (!CustomerLifecycle.canSuspend(customer.lifecycleStatus)) {
        throw new CustomerServiceError(
          'Cannot suspend customer in current state',
          CustomerServiceErrorCode.VALIDATION_ERROR
        );
      }

      // Update lifecycle status
      await this.updateLifecycleStatus(id, LifecycleStatus.SUSPENDED);
    } catch (error) {
      if (error instanceof CustomerServiceError) {
        throw error;
      }
      throw new CustomerServiceError(
        'Failed to suspend customer',
        CustomerServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Restore a suspended customer
   */
  async restoreCustomer(id: string): Promise<void> {
    try {
      const customer = await this.getCustomerById(id);

      // Check if can restore
      if (!CustomerLifecycle.canRestore(customer.lifecycleStatus)) {
        throw new CustomerServiceError(
          'Cannot restore customer in current state',
          CustomerServiceErrorCode.VALIDATION_ERROR
        );
      }

      // Update lifecycle status
      await this.updateLifecycleStatus(id, LifecycleStatus.ACTIVE);
    } catch (error) {
      if (error instanceof CustomerServiceError) {
        throw error;
      }
      throw new CustomerServiceError(
        'Failed to restore customer',
        CustomerServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Get customer metrics
   */
  async getCustomerMetrics(id: string): Promise<CustomerMetrics> {
    try {
      const bookings = await customerRepository.getCustomerBookings(id);
      const payments = await customerRepository.getCustomerPayments(id);
      const contracts = await customerRepository.getCustomerContracts(id);

      // Map to domain summaries
      const bookingSummaries = bookings.map((b) =>
        CustomerMapper.mapBookingSummary(b, null)
      );
      const paymentSummaries = payments.map((p) =>
        CustomerMapper.mapPaymentSummary(p)
      );
      const contractSummaries = contracts.map((c) =>
        CustomerMapper.mapContractSummary(c, null)
      );

      // Calculate metrics
      return CustomerMetricsCalculator.calculateMetrics(
        bookingSummaries,
        paymentSummaries,
        contractSummaries
      );
    } catch (error) {
      throw new CustomerServiceError(
        'Failed to get customer metrics',
        CustomerServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Get customer booking history
   */
  async getBookingHistory(
    id: string,
    page: number,
    pageSize: number
  ): Promise<{ items: BookingSummary[]; total: number }> {
    try {
      const bookings = await customerRepository.getCustomerBookings(id);

      // TODO: Implement pagination in repository
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedBookings = bookings.slice(start, end);

      const items = paginatedBookings.map((b) =>
        CustomerMapper.mapBookingSummary(b, null)
      );

      return {
        items,
        total: bookings.length,
      };
    } catch (error) {
      throw new CustomerServiceError(
        'Failed to get booking history',
        CustomerServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Get customer payment history
   */
  async getPaymentHistory(
    id: string,
    page: number,
    pageSize: number
  ): Promise<{ items: PaymentSummary[]; total: number }> {
    try {
      const payments = await customerRepository.getCustomerPayments(id);

      // TODO: Implement pagination in repository
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedPayments = payments.slice(start, end);

      const items = paginatedPayments.map((p) =>
        CustomerMapper.mapPaymentSummary(p)
      );

      return {
        items,
        total: payments.length,
      };
    } catch (error) {
      throw new CustomerServiceError(
        'Failed to get payment history',
        CustomerServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Get customer contract history
   */
  async getContractHistory(
    id: string,
    page: number,
    pageSize: number
  ): Promise<{ items: ContractSummary[]; total: number }> {
    try {
      const contracts = await customerRepository.getCustomerContracts(id);

      // TODO: Implement pagination in repository
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedContracts = contracts.slice(start, end);

      const items = paginatedContracts.map((c) =>
        CustomerMapper.mapContractSummary(c, null)
      );

      return {
        items,
        total: contracts.length,
      };
    } catch (error) {
      throw new CustomerServiceError(
        'Failed to get contract history',
        CustomerServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Get complete customer history
   */
  async getCustomerHistory(id: string): Promise<CustomerHistory> {
    try {
      const [bookings, payments, contracts] = await Promise.all([
        this.getBookingHistory(id, 1, 100),
        this.getPaymentHistory(id, 1, 100),
        this.getContractHistory(id, 1, 100),
      ]);

      return {
        bookings: bookings.items,
        payments: payments.items,
        contracts: contracts.items,
      };
    } catch (error) {
      throw new CustomerServiceError(
        'Failed to get customer history',
        CustomerServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Search customers by query
   */
  async searchCustomers(
    query: string,
    page: number,
    pageSize: number
  ): Promise<CustomerListResult> {
    try {
      const { data, count } = await customerRepository.searchCustomers(
        query,
        { page, pageSize }
      );

      const customers = data.map((row) =>
        CustomerMapper.toDomain(row, row.profile)
      );

      return {
        items: customers,
        total: count,
        page,
        pageSize,
      };
    } catch (error) {
      throw new CustomerServiceError(
        'Failed to search customers',
        CustomerServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Update customer lifecycle status
   */
  async updateLifecycleStatus(
    id: string,
    status: string
  ): Promise<LifecycleTransitionResult> {
    try {
      const customer = await this.getCustomerById(id);
      const targetStatus = status as LifecycleStatus;

      // Check if transition is valid
      const result = CustomerLifecycle.transition(
        customer.lifecycleStatus,
        targetStatus
      );

      if (!result.success) {
        return result;
      }

      // Update in database
      await customerRepository.updateLifecycleStatus(id, targetStatus);

      return result;
    } catch (error) {
      throw new CustomerServiceError(
        'Failed to update lifecycle status',
        CustomerServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Update customer type
   */
  async updateCustomerType(id: string, type: string): Promise<Customer> {
    try {
      const customerType = type as CustomerType;
      await customerRepository.updateCustomerType(id, customerType);
      return this.getCustomerById(id);
    } catch (error) {
      throw new CustomerServiceError(
        'Failed to update customer type',
        CustomerServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Add tag to customer
   */
  async addTag(id: string, tag: string): Promise<Customer> {
    try {
      const customer = await this.getCustomerById(id);
      const updatedTags = [...customer.tags, tag];
      await this.updateCustomer(id, { tags: updatedTags });
      return this.getCustomerById(id);
    } catch (error) {
      throw new CustomerServiceError(
        'Failed to add tag',
        CustomerServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Remove tag from customer
   */
  async removeTag(id: string, tag: string): Promise<Customer> {
    try {
      const customer = await this.getCustomerById(id);
      const updatedTags = customer.tags.filter((t) => t !== tag);
      await this.updateCustomer(id, { tags: updatedTags });
      return this.getCustomerById(id);
    } catch (error) {
      throw new CustomerServiceError(
        'Failed to remove tag',
        CustomerServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Update customer notes
   */
  async updateNotes(id: string, notes: string): Promise<Customer> {
    try {
      await this.updateCustomer(id, { notes });
      return this.getCustomerById(id);
    } catch (error) {
      throw new CustomerServiceError(
        'Failed to update notes',
        CustomerServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Assign property to customer
   */
  async assignProperty(id: string, propertyId: string): Promise<Customer> {
    try {
      await this.updateCustomer(id, { currentPropertyId: propertyId });
      return this.getCustomerById(id);
    } catch (error) {
      throw new CustomerServiceError(
        'Failed to assign property',
        CustomerServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Remove property assignment from customer
   */
  async removePropertyAssignment(id: string): Promise<Customer> {
    try {
      await this.updateCustomer(id, { currentPropertyId: undefined });
      return this.getCustomerById(id);
    } catch (error) {
      throw new CustomerServiceError(
        'Failed to remove property assignment',
        CustomerServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Get dashboard metrics (aggregated across all customers)
   */
  async getDashboardMetrics(): Promise<{
    totalCustomers: number;
    activeTenants: number;
    activeGuests: number;
    activeBuyers: number;
    monthlyRevenue: number;
    overdueAccounts: number;
  }> {
    try {
      const { data: allCustomers } = await customerRepository.listCustomers({
        page: 1,
        pageSize: 1000,
      });

      // Map to domain entities first
      const domainCustomers = allCustomers.map((row) =>
        CustomerMapper.toDomain(row, row.profile)
      );

      const totalCustomers = domainCustomers.length;
      const activeTenants = domainCustomers.filter(
        (c) =>
          c.customerType === CustomerType.TENANT && c.lifecycleStatus === LifecycleStatus.ACTIVE
      ).length;
      const activeGuests = domainCustomers.filter(
        (c) =>
          c.customerType === CustomerType.GUEST && c.lifecycleStatus === LifecycleStatus.ACTIVE
      ).length;
      const activeBuyers = domainCustomers.filter(
        (c) =>
          c.customerType === CustomerType.BUYER && c.lifecycleStatus === LifecycleStatus.ACTIVE
      ).length;

      // TODO: Calculate monthly revenue from actual payments
      const monthlyRevenue = 0;

      // TODO: Calculate overdue accounts from actual metrics
      const overdueAccounts = 0;

      return {
        totalCustomers,
        activeTenants,
        activeGuests,
        activeBuyers,
        monthlyRevenue,
        overdueAccounts,
      };
    } catch (error) {
      throw new CustomerServiceError(
        'Failed to get dashboard metrics',
        CustomerServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }

  /**
   * Export customers to CSV
   */
  async exportCustomers(filters: CustomerFilters): Promise<Blob> {
    try {
      const { items } = await this.getCustomers(filters, 1, 1000);

      // Generate CSV content
      const headers = [
        'ID',
        'Full Name',
        'Phone',
        'Customer Type',
        'Lifecycle Status',
        'Current Property ID',
        'Notes',
        'Tags',
        'Total Bookings',
        'Total Rent Paid',
        'Last Activity',
        'Created At',
      ];

      const rows = items.map((c) => [
        c.id,
        c.fullName,
        c.phone || '',
        c.customerType,
        c.lifecycleStatus,
        c.currentPropertyId || '',
        c.notes || '',
        c.tags.join(';'),
        c.totalBookings,
        c.totalRentPaid,
        c.lastActivityAt?.toISOString() || '',
        c.createdAt.toISOString(),
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n');

      return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    } catch (error) {
      throw new CustomerServiceError(
        'Failed to export customers',
        CustomerServiceErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }
}

// Export singleton instance
export const customerService = new CustomerService();
