/**
 * PaymentCardViewModel
 *
 * Maps Payment domain entity to UI-friendly card display format.
 * Used by payment cards in admin and user dashboards.
 */

import type { Payment } from '../../domain/payment/PaymentTypes';

export interface PaymentCardViewModel {
  id: string;
  amountDisplay: string;
  currency: string;
  method: string;
  methodDisplay: string;
  status: string;
  statusDisplay: string;
  type: string;
  typeDisplay: string;
  transactionId: string | undefined;
  createdAtDisplay: string;
  isPending: boolean;
  isProcessing: boolean;
  isCompleted: boolean;
  isFailed: boolean;
  isRefunded: boolean;
}

export class PaymentCardViewModelMapper {
  private static formatCurrency(amount: number, currency: string): string {
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
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private static getMethodDisplay(method: string): string {
    const methodMap: Record<string, string> = {
      zaad: 'Zaad',
      edahab: 'eDahab',
      premier_wallet: 'Premier Wallet',
      wadaag_pay: 'Wadaag Pay',
      card: 'Card',
    };
    return methodMap[method] || method;
  }

  private static getStatusDisplay(status: string): string {
    const statusMap: Record<string, string> = {
      pending: 'Pending',
      processing: 'Processing',
      completed: 'Completed',
      failed: 'Failed',
      refunded: 'Refunded',
    };
    return statusMap[status] || status;
  }

  private static getTypeDisplay(type: string): string {
    const typeMap: Record<string, string> = {
      booking: 'Booking',
      deposit: 'Deposit',
      refund: 'Refund',
      service_fee: 'Service Fee',
    };
    return typeMap[type] || type;
  }

  static toViewModel(payment: Payment): PaymentCardViewModel {
    return {
      id: payment.id,
      amountDisplay: this.formatCurrency(payment.amount, payment.currency),
      currency: payment.currency,
      method: payment.method,
      methodDisplay: this.getMethodDisplay(payment.method),
      status: payment.status,
      statusDisplay: this.getStatusDisplay(payment.status),
      type: payment.type,
      typeDisplay: this.getTypeDisplay(payment.type),
      transactionId: payment.transactionId,
      createdAtDisplay: this.formatDate(payment.createdAt),
      isPending: payment.status === 'pending',
      isProcessing: payment.status === 'processing',
      isCompleted: payment.status === 'completed',
      isFailed: payment.status === 'failed',
      isRefunded: payment.status === 'refunded',
    };
  }
}
