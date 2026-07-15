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
import type { Invoice, InvoiceListParams, InvoiceStatus } from '@/types/invoice';

function Money({ cents }: { cents?: number }) {
  const n = Math.max(0, cents || 0) / 100;
  return <>{n.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</>;
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const hasActiveFilters = query || statusFilter !== 'all' || propertyFilter;

  // Load KPIs
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await getInvoiceDashboardMetrics();
        if (mounted) setKpi(res);
      } catch {
        // ignore
      } finally {
        if (mounted) setKpiLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Load list
  useEffect(() => {
    let mounted = true;
    const load = async () => {
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
        if (mounted) {
          setItems(res.items);
          setTotalItems(res.total);
        }
      } catch {
        // ignore
      } finally {
        if (mounted) setListLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [query, statusFilter, propertyFilter, sortBy, currentPage, pageSize]);

  const handleFilterClear = () => {
    setQuery('');
    setStatusFilter('all');
    setPropertyFilter('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const handleExport = async () => {
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
  };

  const handleStatusChange = useCallback(
    async (invoiceId: string, newStatus: InvoiceStatus) => {
      try {
        await updateInvoiceStatus(invoiceId, newStatus);
        // Refresh list
        const res = await listInvoices({
          query,
          status: statusFilter,
          propertyId: propertyFilter,
          sort: sortBy,
          page: currentPage,
          pageSize,
        });
        setItems(res.items);
      } catch (error) {
        console.error('Failed to update status:', error);
      }
    },
    [query, statusFilter, propertyFilter, sortBy, currentPage, pageSize]
  );

  const getStatusStyle = (status: InvoiceStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      case 'sent':
        return 'bg-blue-100 text-blue-700';
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
        key: 'tenantId' as const,
        header: 'Tenant',
        render: (value: string) => <span className="text-sm text-gray-600">{value}</span>,
      },
      {
        key: 'propertyId' as const,
        header: 'Property',
        render: (value: string) => <span className="text-sm text-gray-600">{value}</span>,
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
        render: (value: number) => <span className="text-sm font-medium text-gray-900"><Money cents={value} /></span>,
      },
      {
        key: 'paidAmount' as const,
        header: 'Paid',
        render: (value: number) => <span className="text-sm text-gray-600"><Money cents={value} /></span>,
      },
      {
        key: 'balanceDue' as const,
        header: 'Balance',
        render: (value: number) => (
          <span className={`text-sm font-medium ${value > 0 ? 'text-red-600' : 'text-gray-900'}`}>
            <Money cents={value} />
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
              <Money cents={kpi.outstandingAmount} />
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 p-5 bg-white">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Paid This Month</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              <Money cents={kpi.paidThisMonth} />
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
            onClick={() => {}}
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
                onClick={() => setShowDetailDrawer(false)}
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
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Issue Date</span>
                  <span className="text-sm font-medium text-gray-900">{new Date(selectedInvoice.issueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Due Date</span>
                  <span className="text-sm font-medium text-gray-900">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-3">
                  <span className="text-sm text-gray-600">Subtotal</span>
                  <span className="text-sm font-medium text-gray-900"><Money cents={selectedInvoice.subtotal} /></span>
                </div>
                {selectedInvoice.additionalCharges > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Additional Charges</span>
                    <span className="text-sm font-medium text-gray-900"><Money cents={selectedInvoice.additionalCharges} /></span>
                  </div>
                )}
                {selectedInvoice.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Discount</span>
                    <span className="text-sm font-medium text-red-600">-<Money cents={selectedInvoice.discount} /></span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-200 pt-3">
                  <span className="text-sm font-semibold text-gray-900">Total Amount</span>
                  <span className="text-sm font-semibold text-gray-900"><Money cents={selectedInvoice.totalAmount} /></span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Payment Information</h3>
              <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Paid Amount</span>
                  <span className="text-sm font-medium text-green-600"><Money cents={selectedInvoice.paidAmount} /></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Balance Due</span>
                  <span className={`text-sm font-medium ${selectedInvoice.balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    <Money cents={selectedInvoice.balanceDue} />
                  </span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Status</h3>
              <div className="relative">
                <select
                  value={selectedInvoice.status}
                  onChange={(e) => {
                    handleStatusChange(selectedInvoice.id, e.target.value as InvoiceStatus);
                    setSelectedInvoice({ ...selectedInvoice, status: e.target.value as InvoiceStatus });
                  }}
                  className={`w-full text-sm font-medium px-3 py-2 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 ${getStatusStyle(selectedInvoice.status)}`}
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="partially_paid">Partially Paid</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            {selectedInvoice.notes && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Notes</h3>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4">{selectedInvoice.notes}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 space-y-3">
            <button
              onClick={() => setShowDetailDrawer(false)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
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
            // Refresh the list
            const load = async () => {
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
            };
            load();
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
            // Refresh the list
            const load = async () => {
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
            };
            load();
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
            // Refresh the list
            const load = async () => {
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
            };
            load();
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
            // Refresh the list and KPIs
            const load = async () => {
              const [listRes, kpiRes] = await Promise.all([
                listInvoices({
                  query,
                  status: statusFilter,
                  propertyId: propertyFilter,
                  sort: sortBy,
                  page: currentPage,
                  pageSize,
                }),
                getInvoiceDashboardMetrics(),
              ]);
              setItems(listRes.items);
              setTotalItems(listRes.total);
              setKpi(kpiRes);
            };
            load();
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
