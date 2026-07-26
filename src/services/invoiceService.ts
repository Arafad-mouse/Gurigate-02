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

function mapInvoiceRow(row: any): Invoice {
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    leaseId: row.lease_id,
    tenantId: row.tenant_id,
    tenantName: row.tenant_name || undefined,
    propertyId: row.property_id,
    propertyName: row.property_name || undefined,
    unitId: row.unit_id,
    issueDate: row.issue_date,
    dueDate: row.due_date,
    subtotal: Number(row.subtotal) || 0,
    discount: Number(row.discount) || 0,
    additionalCharges: Number(row.additional_charges) || 0,
    tax: Number(row.tax) || 0,
    totalAmount: Number(row.total_amount) || 0,
    paidAmount: Number(row.paid_amount) || 0,
    balanceDue: Number(row.balance_due) || 0,
    status: row.status,
    notes: row.notes,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function calculateMetrics(invoices: Invoice[]): InvoiceDashboardMetrics {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const todayStr = now.toISOString().split('T')[0];

  return {
    totalInvoices: invoices.length,
    outstandingAmount: invoices
      .filter((inv) => inv.status !== 'cancelled' && inv.status !== 'paid')
      .reduce((sum, inv) => sum + inv.balanceDue, 0),
    paidThisMonth: invoices
      .filter((inv) => new Date(inv.updatedAt) >= monthStart && inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.paidAmount, 0),
    overdueInvoices: invoices.filter(
      (inv) => inv.status === 'overdue' || (inv.dueDate < todayStr && inv.balanceDue > 0 && inv.status !== 'cancelled' && inv.status !== 'paid')
    ).length,
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
      .select(`
        *,
        tenant:leases!lease_id(customer_id),
        property:properties!property_id(title)
      `, { count: 'exact' });

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

    if (error) throw error;

    const items = (data || []).map((row: any) => mapInvoiceRow(row));
    return { items, total: count || 0 };
  } catch (error) {
    console.error('Database query failed:', error);
    throw error;
  }
}

export async function getInvoiceDashboardMetrics(): Promise<InvoiceDashboardMetrics> {
  try {
    const { data, error } = await supabase.from('invoices').select('*');

    if (error) throw error;

    const invoices = (data || []).map((row: any) => mapInvoiceRow(row));
    return calculateMetrics(invoices);
  } catch (error) {
    console.error('Failed to fetch metrics:', error);
    return { totalInvoices: 0, outstandingAmount: 0, paidThisMonth: 0, overdueInvoices: 0 };
  }
}

export async function getInvoiceById(id: string): Promise<InvoiceDetail | null> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        tenant:leases!lease_id(customer_id),
        property:properties!property_id(title),
        lease:leases!lease_id(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      ...mapInvoiceRow(data),
      tenant: data.tenant,
      property: data.property,
      lease: data.lease,
    };
  } catch (error) {
    console.error('Failed to fetch invoice:', error);
    throw error;
  }
}

export async function createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
  const subtotalAfterDiscount = input.monthlyRent + (input.additionalCharges || 0) - (input.discount || 0);
  const taxAmount = (subtotalAfterDiscount * (input.tax || 0)) / 100;
  const totalAmount = subtotalAfterDiscount + taxAmount;

  try {
    // Fetch lease data to auto-populate tenant/property/unit
    let leaseData: any = null;
    if (input.leaseId) {
      const { data: lease, error: leaseError } = await supabase
        .from('leases')
        .select('id, customer_id, property_id, unit_id, monthly_rent')
        .eq('id', input.leaseId)
        .single();
      if (!leaseError && lease) {
        leaseData = lease;
      }
    }

    const insertData: any = {
      invoice_number: `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`,
      lease_id: input.leaseId || null,
      tenant_id: input.tenantId || leaseData?.customer_id || null,
      property_id: input.propertyId || leaseData?.property_id || null,
      unit_id: input.unitId || leaseData?.unit_id || null,
      issue_date: input.issueDate,
      due_date: input.dueDate,
      subtotal: input.monthlyRent,
      discount: input.discount || 0,
      additional_charges: input.additionalCharges || 0,
      tax: input.tax || 0,
      total_amount: totalAmount,
      paid_amount: 0,
      balance_due: totalAmount,
      status: 'draft',
      notes: input.notes,
    };

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

    return mapInvoiceRow(data);
  } catch (error) {
    console.error('Failed to create invoice:', error);
    throw error;
  }
}

export async function updateInvoice(id: string, input: UpdateInvoiceInput): Promise<Invoice | null> {
  try {
    const updateData: any = {
      ...(input.issueDate && { issue_date: input.issueDate }),
      ...(input.dueDate && { due_date: input.dueDate }),
      ...(input.additionalCharges !== undefined && { additional_charges: input.additionalCharges }),
      ...(input.discount !== undefined && { discount: input.discount }),
      ...(input.notes !== undefined && { notes: input.notes }),
      ...(input.status && { status: input.status }),
    };

    // Recalculate total if amount fields changed
    if (input.additionalCharges !== undefined || input.discount !== undefined) {
      const { data: current } = await supabase
        .from('invoices')
        .select('subtotal, discount, additional_charges, tax, paid_amount')
        .eq('id', id)
        .single();
      if (current) {
        const newTotal = Number(current.subtotal) + Number(input.additionalCharges ?? current.additional_charges) + Number(current.tax) - Number(input.discount ?? current.discount);
        updateData.total_amount = newTotal;
        updateData.balance_due = Math.max(0, newTotal - Number(current.paid_amount));
      }
    }

    const { data, error } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return null;

    return mapInvoiceRow(data);
  } catch (error) {
    console.error('Failed to update invoice:', error);
    throw error;
  }
}

export async function recordPayment(input: RecordPaymentInput): Promise<Invoice | null> {
  try {
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', input.invoiceId)
      .single();

    if (fetchError || !invoice) throw new Error('Invoice not found');

    const newPaidAmount = Number(invoice.paid_amount || 0) + input.amount;
    const newBalanceDue = Math.max(0, Number(invoice.total_amount) - newPaidAmount);
    let newStatus: InvoiceStatus = invoice.status;

    if (newBalanceDue === 0) {
      newStatus = 'paid';
    } else if (newPaidAmount > 0) {
      newStatus = 'partially_paid';
    }

    // Check overdue: due_date passed and balance > 0
    const todayStr = new Date().toISOString().split('T')[0];
    if (newBalanceDue > 0 && invoice.due_date < todayStr) {
      newStatus = 'overdue';
    }

    const { data, error } = await supabase
      .from('invoices')
      .update({
        paid_amount: newPaidAmount,
        balance_due: newBalanceDue,
        status: newStatus,
      })
      .eq('id', input.invoiceId)
      .select()
      .single();

    if (error) throw error;
    if (!data) return null;

    // Insert into invoice_payments table
    await supabase.from('invoice_payments').insert([
      {
        invoice_id: input.invoiceId,
        amount: input.amount,
        payment_date: input.paymentDate,
        method: input.method,
        status: 'verified',
      },
    ]);

    return mapInvoiceRow(data);
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
    
    const headers = [
      'Invoice Number',
      'Tenant',
      'Property',
      'Issue Date',
      'Due Date',
      'Subtotal',
      'Discount',
      'Additional Charges',
      'Tax',
      'Total Amount',
      'Paid Amount',
      'Balance Due',
      'Status',
      'Notes',
    ];
    
    const rows = items.map((inv) => [
      inv.invoiceNumber,
      inv.tenantName || inv.tenantId || '',
      inv.propertyName || inv.propertyId || '',
      inv.issueDate,
      inv.dueDate,
      inv.subtotal.toFixed(2),
      inv.discount.toFixed(2),
      inv.additionalCharges.toFixed(2),
      inv.tax.toFixed(2),
      inv.totalAmount.toFixed(2),
      inv.paidAmount.toFixed(2),
      inv.balanceDue.toFixed(2),
      inv.status,
      inv.notes || '',
    ]);
    
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    
    return csvContent;
  } catch (error) {
    console.error('Failed to export invoices:', error);
    throw error;
  }
}
