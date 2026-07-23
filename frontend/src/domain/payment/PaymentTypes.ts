/**
 * Payment Domain Types
 *
 * Domain types for payment functionality.
 * Abstracted from database schema to prevent schema changes from breaking the frontend.
 */

/**
 * Payment method enum
 */
export enum PaymentMethod {
  ZAAD = 'zaad',
  EDAHAB = 'edahab',
  PREMIER_WALLET = 'premier_wallet',
  WADAAG_PAY = 'wadaag_pay',
  CARD = 'card',
}

/**
 * Payment status enum
 */
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

/**
 * Payment type enum
 */
export enum PaymentType {
  BOOKING = 'booking',
  DEPOSIT = 'deposit',
  REFUND = 'refund',
  SERVICE_FEE = 'service_fee',
}

/**
 * Payment entity
 */
export interface Payment {
  id: string;
  bookingId?: string;
  userId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  type: PaymentType;
  transactionId?: string;
  gatewayResponse?: any;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Payment list filters
 */
export interface PaymentFilters {
  status?: PaymentStatus | 'all';
  method?: PaymentMethod | 'all';
  type?: PaymentType | 'all';
  userId?: string;
  bookingId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

/**
 * Payment list result with pagination
 */
export interface PaymentListResult {
  items: Payment[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Payment create input
 */
export interface CreatePaymentInput {
  bookingId?: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  type: PaymentType;
}

/**
 * Payment refund input
 */
export interface RefundPaymentInput {
  reason: string;
  amount?: number; // If not provided, full refund
}
