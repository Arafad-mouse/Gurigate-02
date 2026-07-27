import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  FileText,
  Plus,
  Download,
  Search,
  Filter,
  X,
  Eye,
  Edit,
  Trash2,
  Send,
  DollarSign,
  AlertCircle,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import { DataTable } from '@/components/admin/table/DataTable';
import { DataTablePagination } from '@/components/admin/table/DataTablePagination';
import { RowActions } from '@/components/admin/table/RowActions';
import { CreateInvoiceModal } from '@/components/admin/invoice/CreateInvoiceModal';
import { EditInvoiceModal } from '@/components/admin/invoice/EditInvoiceModal';
import { DeleteConfirmationDialog } from '@/components/admin/invoice/DeleteConfirmationDialog';
import { RecordPaymentModal } from '@/components/admin/invoice/RecordPaymentModal';
import { Toast } from '@/components/admin/invoice/Toast';
import { listInvoices, getInvoiceDashboardMetrics, updateInvoiceStatus, exportInvoices } from '@/services/invoiceService';
import type { Invoice, InvoiceStatus } from '@/types/invoice';

function Money({ amount }: { amount?: number }) {
  const n = Math.max(0, amount || 0);
  return <>{n.toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</>;
}

function KPISkeleton() {
  return (
    <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-200 p-5 bg-white">
          <div className="h-3 bg-gray-100 rounded w-24 mb-2" />
          <div className="h-6 bg-gray-100 rounded w-16" />
        </div>
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="h-10 bg-gray-50 border-b border-gray-200" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-14 border-b border-gray-100" />
      ))}
    </div>
  );
}

const PAGE_SIZE_OPTIONS = [12, 24, 50];

export default function InvoicesPage() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [propertyFilter, setPropertyFilter] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'due_date' | 'amount_asc' | 'amount_desc'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalItems, setTotalItems] = useState(0);

  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [kpiLoading, setKpiLoading] = useState(true);
  const [kpi, setKpi] = useState<any>(null);
  const [listLoading, setListLoading] = useState(true);
  const [items, setItems] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    issueDate: '',
    dueDate: '',
    subtotal: 0,
    additionalCharges: 0,
    discount: 0,
    tax: 0,
    paidAmount: 0,
    notes: '',
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const hasActiveFilters = query || statusFilter !== 'all' || propertyFilter;

  // Calculate edit form totals with correct formula
  const subtotalWithCharges = editForm.subtotal + editForm.additionalCharges;
  const subtotalAfterDiscount = subtotalWithCharges - editForm.discount;
  const taxAmount = (subtotalAfterDiscount * editForm.tax) / 100;
  const totalAmount = subtotalAfterDiscount + taxAmount;
  const balanceDue = Math.max(0, totalAmount - editForm.paidAmount);

  // Auto-determine status based on balance and due date
  const autoStatus = () => {
    if (!selectedInvoice || selectedInvoice.status === 'draft' || selectedInvoice.status === 'cancelled') {
      return selectedInvoice?.status || 'pending';
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(editForm.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    if (balanceDue === 0) {
      return 'paid';
    } else if (editForm.paidAmount > 0 && balanceDue > 0) {
      return 'partially_paid';
    } else if (dueDate < today && balanceDue > 0) {
      return 'overdue';
    } else {
      return 'pending';
    }
  };

  // Enter edit mode
  const handleEnterEditMode = () => {
    if (!selectedInvoice) return;
    setEditForm({
      issueDate: selectedInvoice.issueDate,
      dueDate: selectedInvoice.dueDate,
      subtotal: selectedInvoice.subtotal,
      additionalCharges: selectedInvoice.additionalCharges,
      discount: selectedInvoice.discount,
      tax: selectedInvoice.tax,
      paidAmount: selectedInvoice.paidAmount,
      notes: selectedInvoice.notes || '',
    });
    setIsEditMode(true);
  };

  // Save changes
  const handleSaveChanges = async () => {
    if (!selectedInvoice) return;

    // Validation
    if (new Date(editForm.dueDate) < new Date(editForm.issueDate)) {
      setToast({ type: 'error', message: 'Due date cannot be before issue date.' });
      return;
    }
    if (editForm.tax < 0) {
      setToast({ type: 'error', message: 'Tax cannot be negative.' });
      return;
    }
    if (editForm.discount > editForm.subtotal + editForm.additionalCharges) {
      setToast({ type: 'error', message: 'Discount cannot exceed subtotal.' });
      return;
    }
    if (editForm.paidAmount > totalAmount) {
      setToast({ type: 'error', message: 'Paid amount cannot exceed total amount.' });
      return;
    }

    try {
      const { updateInvoice } = await import('@/services/invoiceService');
      await updateInvoice(selectedInvoice.id, {
        issueDate: editForm.issueDate,
        dueDate: editForm.dueDate,
        subtotal: editForm.subtotal,
        additionalCharges: editForm.additionalCharges,
        discount: editForm.discount,
        tax: editForm.tax,
        totalAmount: totalAmount,
        paidAmount: editForm.paidAmount,
        balanceDue: balanceDue,
        status: autoStatus(),
        notes: editForm.notes,
      });

      setToast({ type: 'success', message: 'Invoice updated successfully.' });
      setIsEditMode(false);
      await Promise.all([refreshList(), refreshKpis()]);
      
      // Refresh the selected invoice from the updated list
      const updated = items.find(i => i.id === selectedInvoice.id);
      if (updated) setSelectedInvoice(updated);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to update invoice.' });
    }
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setIsEditMode(false);
  };

  // Refresh KPIs
  const refreshKpis = useCallback(async () => {
    try {
      const res = await getInvoiceDashboardMetrics();
      setKpi(res);
    } catch {
      // ignore
    } finally {
      setKpiLoading(false);
    }
  }, []);

  // Load KPIs on mount and when list changes
  useEffect(() => {
    refreshKpis();
  }, [refreshKpis]);

  const handleFilterClear = () => {
    setQuery('');
    setStatusFilter('all');
    setPropertyFilter('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const handleExport = async () => {
    if (selectedInvoice) {
      // Generate PDF for single invoice
      const { generateInvoicePDF } = await import('@/utils/generateInvoicePDF');
      generateInvoicePDF(selectedInvoice);
    } else {
      // Export all invoices to CSV
      try {
        const csvContent = await exportInvoices({
          query,
          status: statusFilter,
          propertyId: propertyFilter,
          sort: sortBy,
        });
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `invoices-export-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setToast({ type: 'success', message: 'Invoices exported successfully.' });
      } catch (error) {
        console.error('Export failed:', error);
        setToast({ type: 'error', message: 'Failed to export invoices.' });
      }
    }
  };

  const refreshList = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await listInvoices({
        query,
        status: statusFilter,
        propertyId: propertyFilter,
        sort: sortBy,
        page: currentPage,
        pageSize,
      });
      setItems(res.items);
      setTotalItems(res.total);
    } catch {
      // ignore
    } finally {
      setListLoading(false);
    }
  }, [query, statusFilter, propertyFilter, sortBy, currentPage, pageSize]);

  // Load list when filters/pagination change
  useEffect(() => {
    refreshList();
  }, [refreshList]);

  const handleStatusChange = useCallback(
    async (invoiceId: string, newStatus: InvoiceStatus) => {
      try {
        await updateInvoiceStatus(invoiceId, newStatus);
        await Promise.all([refreshList(), refreshKpis()]);
      } catch (error) {
        console.error('Failed to update status:', error);
      }
    },
    [refreshList, refreshKpis]
  );

  const getStatusStyle = (status: InvoiceStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      case 'sent':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'partially_paid':
        return 'bg-orange-100 text-orange-700';
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'overdue':
        return 'bg-red-100 text-red-700';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const columns = useMemo(
    () => [
      {
        key: 'invoiceNumber' as const,
        header: 'Invoice Number',
        render: (value: string) => <span className="text-sm font-medium text-gray-900">{value}</span>,
      },
      {
        key: 'tenantName' as const,
        header: 'Tenant',
        render: (_value: string, row: Invoice) => (
          <span className="text-sm text-gray-600">{row.tenantName || row.tenantId || '—'}</span>
        ),
      },
      {
        key: 'propertyName' as const,
        header: 'Property',
        render: (_value: string, row: Invoice) => (
          <span className="text-sm text-gray-600">{row.propertyName || row.propertyId || '—'}</span>
        ),
      },
      {
        key: 'issueDate' as const,
        header: 'Issue Date',
        render: (value: string) => <span className="text-sm text-gray-600">{new Date(value).toLocaleDateString()}</span>,
      },
      {
        key: 'dueDate' as const,
        header: 'Due Date',
        render: (value: string) => <span className="text-sm text-gray-600">{new Date(value).toLocaleDateString()}</span>,
      },
      {
        key: 'totalAmount' as const,
        header: 'Amount',
        render: (value: number) => <span className="text-sm font-medium text-gray-900"><Money amount={value} /></span>,
      },
      {
        key: 'paidAmount' as const,
        header: 'Paid',
        render: (value: number) => <span className="text-sm text-gray-600"><Money amount={value} /></span>,
      },
      {
        key: 'balanceDue' as const,
        header: 'Balance',
        render: (value: number) => (
          <span className={`text-sm font-medium ${value > 0 ? 'text-red-600' : 'text-gray-900'}`}>
            <Money amount={value} />
          </span>
        ),
      },
      {
        key: 'status' as const,
        header: 'Status',
        render: (value: InvoiceStatus, row: Invoice) => (
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <select
              value={value}
              onChange={(e) => handleStatusChange(row.id, e.target.value as InvoiceStatus)}
              className={`text-xs font-medium px-2.5 py-0.5 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-red-500 ${getStatusStyle(value)}`}
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="pending">Pending</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        ),
      },
      {
        key: 'actions' as string,
        header: '',
        render: (_value: unknown, row: Invoice) => (
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <RowActions
              actions={[
                { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: () => { setSelectedInvoice(row); setShowDetailDrawer(true); }, variant: 'default' },
                { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: () => { setSelectedInvoice(row); setShowEditModal(true); }, variant: 'default' },
                { label: 'Record Payment', icon: <DollarSign className="h-4 w-4" />, onClick: () => { setSelectedInvoice(row); setShowRecordPaymentModal(true); }, variant: 'default' },
                { label: 'Send', icon: <Send className="h-4 w-4" />, onClick: async () => {
                  try {
                    await handleStatusChange(row.id, 'sent');
                    setToast({ type: 'success', message: 'Invoice marked as sent successfully.' });
                  } catch (error) {
                    setToast({ type: 'error', message: 'Failed to send invoice.' });
                  }
                }, variant: 'default' },
                { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: () => { setSelectedInvoice(row); setShowDeleteDialog(true); }, variant: 'danger' },
              ]}
            />
          </div>
        ),
      },
    ],
    [handleStatusChange]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500">Create, manage and track rental invoices across all properties.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors hover:bg-red-600"
            style={{ background: '#E8344E' }}
          >
            <Plus className="w-4 h-4" />
            Create Invoice
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {kpiLoading ? (
        <KPISkeleton />
      ) : kpi ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="rounded-xl border border-gray-200 p-5 bg-white">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Invoices</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{kpi.totalInvoices}</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-5 bg-white">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Outstanding Amount</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              <Money amount={kpi.outstandingAmount} />
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 p-5 bg-white">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Paid This Month</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              <Money amount={kpi.paidThisMonth} />
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 p-5 bg-white">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Overdue Invoices</p>
            <p className="text-2xl font-bold text-red-600 mt-2">{kpi.overdueInvoices}</p>
          </div>
        </div>
      ) : null}

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          {hasActiveFilters && (
            <button
              onClick={handleFilterClear}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilterPanel && (
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as InvoiceStatus | 'all');
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="pending">Pending</option>
                  <option value="partially_paid">Partially Paid</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="due_date">Due Date</option>
                  <option value="amount_asc">Amount (Low to High)</option>
                  <option value="amount_desc">Amount (High to Low)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      {listLoading ? (
        <TableSkeleton />
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Invoices Yet</h3>
          <p className="text-sm text-gray-500 mb-6">Invoices generated from active leases will appear here.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors hover:bg-red-600"
            style={{ background: '#E8344E' }}
          >
            <Plus className="w-4 h-4" />
            Create First Invoice
          </button>
        </div>
      ) : (
        <>
          <DataTable 
            columns={columns} 
            data={items}
            onRowClick={(invoice) => {
              setSelectedInvoice(invoice);
              setShowDetailDrawer(true);
            }}
          />
          <div className="mt-6">
            <DataTablePagination
              currentPage={currentPage}
              totalPages={Math.ceil(totalItems / pageSize)}
              totalItems={totalItems}
              itemsPerPage={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      )}

      {/* Invoice Detail Drawer */}
      {showDetailDrawer && selectedInvoice && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity"
          onClick={() => setShowDetailDrawer(false)}
        />
      )}
      {showDetailDrawer && selectedInvoice && (
        <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-xl overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{selectedInvoice.invoiceNumber}</h2>
                <p className="text-sm text-gray-500 mt-1">Invoice Details</p>
              </div>
              <button
                onClick={() => {
                  setShowDetailDrawer(false);
                  setIsEditMode(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Invoice Summary */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Invoice Summary</h3>
              <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Issue Date</span>
                  {isEditMode ? (
                    <input
                      type="date"
                      value={editForm.issueDate}
                      onChange={(e) => setEditForm({ ...editForm, issueDate: e.target.value })}
                      className="text-sm font-medium text-gray-900 px-2 py-1 rounded border border-gray-200"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-900">{new Date(selectedInvoice.issueDate).toLocaleDateString()}</span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Due Date</span>
                  {isEditMode ? (
                    <input
                      type="date"
                      value={editForm.dueDate}
                      onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                      className="text-sm font-medium text-gray-900 px-2 py-1 rounded border border-gray-200"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-900">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</span>
                  )}
                </div>
                <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                  <span className="text-sm text-gray-600">Subtotal</span>
                  {isEditMode ? (
                    <input
                      type="number"
                      value={editForm.subtotal}
                      onChange={(e) => setEditForm({ ...editForm, subtotal: Math.max(0, Number(e.target.value) || 0) })}
                      className="text-sm font-medium text-gray-900 px-2 py-1 rounded border border-gray-200 w-24"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-900"><Money amount={selectedInvoice.subtotal} /></span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Additional Charges</span>
                  {isEditMode ? (
                    <input
                      type="number"
                      value={editForm.additionalCharges}
                      onChange={(e) => setEditForm({ ...editForm, additionalCharges: Math.max(0, Number(e.target.value) || 0) })}
                      className="text-sm font-medium text-gray-900 px-2 py-1 rounded border border-gray-200 w-24"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-900"><Money amount={selectedInvoice.additionalCharges} /></span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Discount</span>
                  {isEditMode ? (
                    <input
                      type="number"
                      value={editForm.discount}
                      onChange={(e) => setEditForm({ ...editForm, discount: Math.max(0, Number(e.target.value) || 0) })}
                      className="text-sm font-medium text-red-600 px-2 py-1 rounded border border-gray-200 w-24"
                    />
                  ) : (
                    <span className="text-sm font-medium text-red-600">-<Money amount={selectedInvoice.discount} /></span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tax (%)</span>
                  {isEditMode ? (
                    <input
                      type="number"
                      value={editForm.tax}
                      onChange={(e) => setEditForm({ ...editForm, tax: Math.max(0, Number(e.target.value) || 0) })}
                      className="text-sm font-medium text-gray-900 px-2 py-1 rounded border border-gray-200 w-24"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-900">{selectedInvoice.tax}%</span>
                  )}
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-3">
                  <span className="text-sm font-semibold text-gray-900">Total Amount</span>
                  <span className="text-sm font-semibold text-gray-900">
                    <Money amount={isEditMode ? totalAmount : selectedInvoice.totalAmount} />
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Payment Information</h3>
              <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Paid Amount</span>
                  {isEditMode ? (
                    <input
                      type="number"
                      value={editForm.paidAmount}
                      onChange={(e) => setEditForm({ ...editForm, paidAmount: Math.max(0, Number(e.target.value) || 0) })}
                      className="text-sm font-medium text-green-600 px-2 py-1 rounded border border-gray-200 w-24"
                    />
                  ) : (
                    <span className="text-sm font-medium text-green-600"><Money amount={selectedInvoice.paidAmount} /></span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Balance Due</span>
                  <span className={`text-sm font-medium ${isEditMode ? (balanceDue > 0 ? 'text-red-600' : 'text-green-600') : (selectedInvoice.balanceDue > 0 ? 'text-red-600' : 'text-green-600')}`}>
                    <Money amount={isEditMode ? balanceDue : selectedInvoice.balanceDue} />
                  </span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Status</h3>
              <div className="relative">
                <select
                  value={isEditMode ? autoStatus() : selectedInvoice.status}
                  onChange={(e) => {
                    handleStatusChange(selectedInvoice.id, e.target.value as InvoiceStatus);
                    setSelectedInvoice({ ...selectedInvoice, status: e.target.value as InvoiceStatus });
                  }}
                  disabled={!isEditMode}
                  className={`w-full text-sm font-medium px-3 py-2 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 ${getStatusStyle(isEditMode ? autoStatus() : selectedInvoice.status)} ${!isEditMode ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="pending">Pending</option>
                  <option value="partially_paid">Partially Paid</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Notes</h3>
              {isEditMode ? (
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  placeholder="Add notes..."
                />
              ) : selectedInvoice.notes ? (
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4">{selectedInvoice.notes}</p>
              ) : (
                <p className="text-sm text-gray-400 bg-gray-50 rounded-lg p-4">No notes</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 space-y-3">
            {isEditMode ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={handleEnterEditMode}
                  className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={handleExport}
                  className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleExport}
                  className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Download
                </button>
                <button
                  onClick={() => setShowDetailDrawer(false)}
                  className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <CreateInvoiceModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            setToast({ type: 'success', message: 'Invoice created successfully.' });
            refreshList();
            refreshKpis();
          }}
        />
      )}

      {/* Edit Invoice Modal */}
      {showEditModal && selectedInvoice && (
        <EditInvoiceModal
          invoice={selectedInvoice}
          onClose={() => {
            setShowEditModal(false);
            setSelectedInvoice(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedInvoice(null);
            setToast({ type: 'success', message: 'Invoice updated successfully.' });
            refreshList();
            refreshKpis();
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && selectedInvoice && (
        <DeleteConfirmationDialog
          invoice={selectedInvoice}
          onClose={() => {
            setShowDeleteDialog(false);
            setSelectedInvoice(null);
          }}
          onSuccess={() => {
            setShowDeleteDialog(false);
            setSelectedInvoice(null);
            setToast({ type: 'success', message: 'Invoice deleted successfully.' });
            refreshList();
            refreshKpis();
          }}
        />
      )}

      {/* Record Payment Modal */}
      {showRecordPaymentModal && selectedInvoice && (
        <RecordPaymentModal
          invoice={selectedInvoice}
          onClose={() => {
            setShowRecordPaymentModal(false);
            setSelectedInvoice(null);
          }}
          onSuccess={() => {
            setShowRecordPaymentModal(false);
            setSelectedInvoice(null);
            setToast({ type: 'success', message: 'Payment recorded successfully.' });
            refreshList();
            refreshKpis();
          }}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
