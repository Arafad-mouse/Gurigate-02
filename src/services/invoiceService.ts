import { supabase } from '@/lib/supabase';
import type {
  Invoice,
  InvoiceListParams,
  InvoiceDashboardMetrics,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  RecordPaymentInput,
  InvoiceDetail,
  InvoiceStatus,
} from '@/types/invoice';

// Supabase is the only source of truth - no mock data fallback

function calculateMetrics(invoices: Invoice[]): InvoiceDashboardMetrics {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  return {
    totalInvoices: invoices.length,
    outstandingAmount: invoices.reduce((sum, inv) => sum + inv.balanceDue, 0),
    paidThisMonth: invoices
      .filter((inv) => new Date(inv.updatedAt) >= monthStart && inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.totalAmount, 0),
    overdueInvoices: invoices.filter((inv) => inv.status === 'overdue').length,
  };
}

export async function listInvoices(params: InvoiceListParams = {}): Promise<{ items: Invoice[]; total: number }> {
  const {
    query = '',
    status = 'all',
    propertyId = '',
    tenantId = '',
    dateFrom,
    dateTo,
    sort = 'newest',
    page = 1,
    pageSize = 12,
  } = params;

  const start = (page - 1) * pageSize;

  try {
    let q = supabase
      .from('invoices')
      .select('*', { count: 'exact' });

    if (query) {
      q = q.or(`invoice_number.ilike.%${query}%`);
    }

    if (status !== 'all') {
      q = q.eq('status', status);
    }

    if (propertyId) {
      q = q.eq('property_id', propertyId);
    }

    if (tenantId) {
      q = q.eq('tenant_id', tenantId);
    }

    if (dateFrom) {
      q = q.gte('issue_date', dateFrom);
    }

    if (dateTo) {
      q = q.lte('issue_date', dateTo);
    }

    const orderBy = sort === 'oldest' ? 'asc' : 'desc';
    const orderColumn = sort === 'due_date' ? 'due_date' : sort === 'amount_asc' || sort === 'amount_desc' ? 'total_amount' : 'created_at';

    const { data, count, error } = await q
      .range(start, start + pageSize - 1)
      .order(orderColumn, { ascending: sort === 'oldest' || sort === 'amount_asc' });

    if (!error && data) {
      const items: Invoice[] = (data || []).map((row: any) => ({
        id: row.id,
        invoiceNumber: row.invoice_number,
        leaseId: row.lease_id,
        tenantId: row.tenant_id,
        propertyId: row.property_id,
        unitId: row.unit_id,
        issueDate: row.issue_date,
        dueDate: row.due_date,
        subtotal: row.subtotal,
        discount: row.discount || 0,
        additionalCharges: row.additional_charges || 0,
        totalAmount: row.total_amount,
        paidAmount: row.paid_amount || 0,
        balanceDue: row.balance_due,
        status: row.status,
        notes: row.notes,
        createdBy: row.created_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      return { items, total: count || 0 };
    }

    throw new Error('Failed to fetch invoices');
  } catch (error) {
    console.error('Database query failed:', error);
    throw error;
  }
}

export async function getInvoiceDashboardMetrics(): Promise<InvoiceDashboardMetrics> {
  try {
    const { data, error } = await supabase.from('invoices').select('*');

    if (!error && data) {
      const invoices: Invoice[] = (data || []).map((row: any) => ({
        id: row.id,
        invoiceNumber: row.invoice_number,
        leaseId: row.lease_id,
        tenantId: row.tenant_id,
        propertyId: row.property_id,
        unitId: row.unit_id,
        issueDate: row.issue_date,
        dueDate: row.due_date,
        subtotal: row.subtotal,
        discount: row.discount || 0,
        additionalCharges: row.additional_charges || 0,
        totalAmount: row.total_amount,
        paidAmount: row.paid_amount || 0,
        balanceDue: row.balance_due,
        status: row.status,
        notes: row.notes,
        createdBy: row.created_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      return calculateMetrics(invoices);
    }

    throw new Error('Failed to fetch metrics');
  } catch (error) {
    console.error('Failed to fetch metrics:', error);
    throw error;
  }
}

export async function getInvoiceById(id: string): Promise<InvoiceDetail | null> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && data) {
      return {
        id: data.id,
        invoiceNumber: data.invoice_number,
        leaseId: data.lease_id,
        tenantId: data.tenant_id,
        propertyId: data.property_id,
        unitId: data.unit_id,
        issueDate: data.issue_date,
        dueDate: data.due_date,
        subtotal: data.subtotal,
        discount: data.discount || 0,
        additionalCharges: data.additional_charges || 0,
        totalAmount: data.total_amount,
        paidAmount: data.paid_amount || 0,
        balanceDue: data.balance_due,
        status: data.status,
        notes: data.notes,
        createdBy: data.created_by,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        tenant: undefined,
        property: undefined,
        lease: undefined,
      };
    }

    throw new Error('Invoice not found');
  } catch (error) {
    console.error('Failed to fetch invoice:', error);
    throw error;
  }
}

export async function createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
  const totalAmount = input.monthlyRent + (input.additionalCharges || 0) - (input.discount || 0);
  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

  try {
    const insertData: any = {
      invoice_number: invoiceNumber,
      issue_date: input.issueDate,
      due_date: input.dueDate,
      subtotal: input.monthlyRent,
      discount: input.discount || 0,
      additional_charges: input.additionalCharges || 0,
      total_amount: totalAmount,
      paid_amount: 0,
      balance_due: totalAmount,
      status: 'draft',
      notes: input.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Only include lease_id if it's a valid UUID
    if (input.leaseId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.leaseId)) {
      insertData.lease_id = input.leaseId;
    }

    const { data, error } = await supabase
      .from('invoices')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating invoice:', error);
      throw new Error(`Failed to create invoice: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from invoice creation');
    }

    return {
      id: data.id,
      invoiceNumber: data.invoice_number,
      leaseId: data.lease_id,
      tenantId: data.tenant_id,
      propertyId: data.property_id,
      unitId: data.unit_id,
      issueDate: data.issue_date,
      dueDate: data.due_date,
      subtotal: data.subtotal,
      discount: data.discount || 0,
      additionalCharges: data.additional_charges || 0,
      totalAmount: data.total_amount,
      paidAmount: data.paid_amount || 0,
      balanceDue: data.balance_due,
      status: data.status,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error('Failed to create invoice:', error);
    throw error;
  }
}

export async function updateInvoice(id: string, input: UpdateInvoiceInput): Promise<Invoice | null> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .update({
        ...(input.issueDate && { issue_date: input.issueDate }),
        ...(input.dueDate && { due_date: input.dueDate }),
        ...(input.additionalCharges !== undefined && { additional_charges: input.additionalCharges }),
        ...(input.discount !== undefined && { discount: input.discount }),
        ...(input.notes !== undefined && { notes: input.notes }),
        ...(input.status && { status: input.status }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      return {
        id: data.id,
        invoiceNumber: data.invoice_number,
        leaseId: data.lease_id,
        tenantId: data.tenant_id,
        propertyId: data.property_id,
        unitId: data.unit_id,
        issueDate: data.issue_date,
        dueDate: data.due_date,
        subtotal: data.subtotal,
        discount: data.discount || 0,
        additionalCharges: data.additional_charges || 0,
        totalAmount: data.total_amount,
        paidAmount: data.paid_amount || 0,
        balanceDue: data.balance_due,
        status: data.status,
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    }

    throw new Error('Failed to update invoice');
  } catch (error) {
    console.error('Failed to update invoice:', error);
    throw error;
  }
}

export async function recordPayment(input: RecordPaymentInput): Promise<Invoice | null> {
  try {
    // Get current invoice
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', input.invoiceId)
      .single();

    if (fetchError || !invoice) throw new Error('Invoice not found');

    const newPaidAmount = (invoice.paid_amount || 0) + input.amount;
    const newBalanceDue = Math.max(0, invoice.total_amount - newPaidAmount);
    let newStatus: InvoiceStatus = invoice.status;

    if (newBalanceDue === 0) {
      newStatus = 'paid';
    } else if (newPaidAmount > 0) {
      newStatus = 'partially_paid';
    }

    // Update invoice
    const { data, error } = await supabase
      .from('invoices')
      .update({
        paid_amount: newPaidAmount,
        balance_due: newBalanceDue,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.invoiceId)
      .select()
      .single();

    if (!error && data) {
      // Create payment record (linked to invoice, not booking)
      await supabase.from('payments').insert([
        {
          invoice_id: input.invoiceId,
          amount: input.amount,
          payment_date: input.paymentDate,
          method: input.method,
          status: 'verified',
          created_at: new Date().toISOString(),
        },
      ]);

      return {
        id: data.id,
        invoiceNumber: data.invoice_number,
        leaseId: data.lease_id,
        tenantId: data.tenant_id,
        propertyId: data.property_id,
        unitId: data.unit_id,
        issueDate: data.issue_date,
        dueDate: data.due_date,
        subtotal: data.subtotal,
        discount: data.discount || 0,
        additionalCharges: data.additional_charges || 0,
        totalAmount: data.total_amount,
        paidAmount: data.paid_amount || 0,
        balanceDue: data.balance_due,
        status: data.status,
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    }

    throw new Error('Failed to record payment');
  } catch (error) {
    console.error('Failed to record payment:', error);
    throw error;
  }
}

export async function updateInvoiceStatus(id: string, status: InvoiceStatus): Promise<Invoice | null> {
  return updateInvoice(id, { status });
}

export async function deleteInvoice(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('invoices').delete().eq('id', id);

    if (!error) {
      return true;
    }

    throw new Error('Failed to delete invoice');
  } catch (error) {
    console.error('Failed to delete invoice:', error);
    throw error;
  }
}

export async function exportInvoices(params: InvoiceListParams = {}): Promise<string> {
  try {
    const { items } = await listInvoices({ ...params, page: 1, pageSize: 1000 });
    
    // CSV header
    const headers = [
      'Invoice Number',
      'Tenant ID',
      'Property ID',
      'Issue Date',
      'Due Date',
      'Subtotal',
      'Discount',
      'Additional Charges',
      'Total Amount',
      'Paid Amount',
      'Balance Due',
      'Status',
      'Notes',
      'Created At',
    ];
    
    // CSV rows
    const rows = items.map((invoice) => [
      invoice.invoiceNumber,
      invoice.tenantId || '',
      invoice.propertyId || '',
      invoice.issueDate,
      invoice.dueDate,
      (invoice.subtotal / 100).toFixed(2),
      (invoice.discount / 100).toFixed(2),
      (invoice.additionalCharges / 100).toFixed(2),
      (invoice.totalAmount / 100).toFixed(2),
      (invoice.paidAmount / 100).toFixed(2),
      (invoice.balanceDue / 100).toFixed(2),
      invoice.status,
      invoice.notes || '',
      invoice.createdAt,
    ]);
    
    // Combine header and rows
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    
    return csvContent;
  } catch (error) {
    console.error('Failed to export invoices:', error);
    throw error;
  }
}
