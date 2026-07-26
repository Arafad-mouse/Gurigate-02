export type InvoiceStatus = 'draft' | 'sent' | 'pending' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled'

export interface Invoice {
  id: string
  invoiceNumber: string
  leaseId?: string
  tenantId?: string
  tenantName?: string
  propertyId?: string
  propertyName?: string
  unitId?: string
  issueDate: string
  dueDate: string
  subtotal: number
  discount: number
  additionalCharges: number
  tax: number
  totalAmount: number
  paidAmount: number
  balanceDue: number
  status: InvoiceStatus
  notes?: string
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export interface InvoiceDetail extends Invoice {
  tenant?: any
  property?: any
  lease?: any
}

export interface InvoiceDashboardMetrics {
  totalInvoices: number
  outstandingAmount: number
  paidThisMonth: number
  overdueInvoices: number
}

export interface InvoiceListParams {
  page?: number
  pageSize?: number
  status?: InvoiceStatus | 'all'
  query?: string
  propertyId?: string
  tenantId?: string
  dateFrom?: string
  dateTo?: string
  sort?: 'newest' | 'oldest' | 'due_date' | 'amount_asc' | 'amount_desc'
}

export interface CreateInvoiceInput {
  leaseId?: string
  tenantId?: string
  propertyId?: string
  unitId?: string
  issueDate: string
  dueDate: string
  monthlyRent: number
  discount?: number
  additionalCharges?: number
  tax?: number
  notes?: string
}

export interface UpdateInvoiceInput {
  issueDate?: string
  dueDate?: string
  subtotal?: number
  additionalCharges?: number
  discount?: number
  tax?: number
  totalAmount?: number
  paidAmount?: number
  balanceDue?: number
  notes?: string
  status?: InvoiceStatus
}

export interface RecordPaymentInput {
  invoiceId: string
  amount: number
  paymentDate: string
  method: string
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit_price: number
  total: number
}
