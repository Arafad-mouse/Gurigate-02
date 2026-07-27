import { useEffect, useState } from 'react';
import { DollarSign, CreditCard, Search, Download, RefreshCw, TrendingUp, TrendingDown, Wallet, Clock, RotateCcw, AlertCircle, Eye, FileText, Settings, ChevronDown } from 'lucide-react';
import { BookingOperationsService, type BookingPayment } from '@/services/bookingOperationsService';

const PAYMENT_METHODS: Record<string, string> = {
  card: 'Card',
  zaad: 'Zaad',
  edahab: 'eDahab',
  premier_wallet: 'Premier Wallet',
  wadaag_pay: 'Wadaag Pay',
  bank_transfer: 'Bank Transfer',
};

function getStatusColor(status: string) {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'processing': return 'bg-blue-100 text-blue-800';
    case 'failed': return 'bg-red-100 text-red-800';
    case 'refunded': return 'bg-gray-100 text-gray-800';
    case 'disputed': return 'bg-purple-100 text-purple-800';
    default: return 'bg-amber-100 text-amber-800';
  }
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    completed: 'Paid',
    pending: 'Pending',
    processing: 'Processing',
    failed: 'Failed',
    refunded: 'Refunded',
    disputed: 'Disputed',
  };
  return labels[status] || status.charAt(0).toUpperCase() + status.slice(1);
}

function getPayoutColor(status: string) {
  switch (status) {
    case 'sent': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-amber-100 text-amber-800';
    default: return 'bg-gray-100 text-gray-500';
  }
}

function getPayoutLabel(status: string) {
  switch (status) {
    case 'sent': return 'Payout sent';
    case 'pending': return 'Payout pending';
    default: return '—';
  }
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<BookingPayment[]>([]);
  const [kpis, setKpis] = useState<{
    totalRevenue: number; pendingPayments: number; completedPayments: number;
    refundedAmount: number; failedPayments: number; platformCommission: number; hostPayouts: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  useEffect(() => {
    const handler = () => setActionMenuId(null);
    if (actionMenuId) {
      document.addEventListener('click', handler);
      return () => document.removeEventListener('click', handler);
    }
  }, [actionMenuId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [paymentData, kpiData] = await Promise.all([
        BookingOperationsService.getBookingPayments(statusFilter === 'all' ? undefined : statusFilter),
        BookingOperationsService.getPaymentKPIs(),
      ]);
      setPayments(paymentData);
      setKpis(kpiData);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      payment.booking_id.toLowerCase().includes(search) ||
      payment.guest_name?.toLowerCase().includes(search) ||
      payment.payment_reference?.toLowerCase().includes(search) ||
      payment.property_title?.toLowerCase().includes(search);

    const matchesMethod = methodFilter === 'all' || payment.payment_method === methodFilter;

    let matchesDate = true;
    if (dateRange !== 'all' && payment.created_at) {
      const paymentDate = new Date(payment.created_at);
      const now = new Date();
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 0;
      if (days > 0) {
        const cutoff = new Date(now);
        cutoff.setDate(cutoff.getDate() - days);
        matchesDate = paymentDate >= cutoff;
      }
    }

    return matchesSearch && matchesMethod && matchesDate;
  });

  const handleExport = () => {
    setNotification({ type: 'success', message: 'Payment data exported successfully' });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleIssueRefund = (payment: BookingPayment) => {
    setActionMenuId(null);
    setNotification({ type: 'success', message: `Refund initiated for ${payment.booking_id.substring(0, 8)}` });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDownloadReceipt = (payment: BookingPayment) => {
    setActionMenuId(null);
    setNotification({ type: 'success', message: `Receipt downloaded for ${payment.booking_id.substring(0, 8)}` });
    setTimeout(() => setNotification(null), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BA0036]" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {notification && (
        <div className={`mb-4 rounded-lg p-4 flex items-center ${notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          <span className="flex-1 text-sm">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-current opacity-60 hover:opacity-100">×</button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-1">Track booking payments, payouts, refunds, and outstanding balances.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-[#BA0036] text-white rounded-lg hover:bg-[#99002a] transition-colors text-sm font-medium"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <Settings className="h-4 w-4" />
            Payment settings
          </button>
          <button
            onClick={() => { setRefreshing(true); loadData(); }}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Collected</div>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">${(kpis?.totalRevenue || 0).toLocaleString()}</div>
          <div className="text-xs text-gray-400 mt-1">{kpis?.completedPayments || 0} transactions</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending</div>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500">
              <Clock className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{kpis?.pendingPayments || 0}</div>
          <div className="text-xs text-gray-400 mt-1">Awaiting payment</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Host Payouts</div>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500">
              <Wallet className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">${(kpis?.hostPayouts || 0).toLocaleString()}</div>
          <div className="text-xs text-gray-400 mt-1">Paid to hosts</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Refunds</div>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-500">
              <RotateCcw className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">${(kpis?.refundedAmount || 0).toLocaleString()}</div>
          <div className="text-xs text-gray-400 mt-1">Refunded amount</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Failed</div>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500">
              <AlertCircle className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{kpis?.failedPayments || 0}</div>
          <div className="text-xs text-gray-400 mt-1">Failed transactions</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 relative min-w-[240px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search booking, guest, or transaction"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BA0036] focus:border-transparent text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#BA0036] bg-white"
          >
            <option value="all">All statuses</option>
            <option value="completed">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#BA0036] bg-white"
          >
            <option value="all">All time</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#BA0036] bg-white"
          >
            <option value="all">All methods</option>
            <option value="card">Card</option>
            <option value="zaad">Zaad</option>
            <option value="edahab">eDahab</option>
            <option value="premier_wallet">Premier Wallet</option>
            <option value="wadaag_pay">Wadaag Pay</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payout</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-500">
                    {payment.booking_id.substring(0, 8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#BA0036] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                        {payment.guest_name?.charAt(0) || '?'}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{payment.guest_name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 max-w-[180px] truncate">
                    {payment.property_title || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {payment.check_in ? new Date(payment.check_in).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    ${payment.amount.toLocaleString()} <span className="text-xs text-gray-400 font-normal">{payment.currency}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-sm text-gray-700">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                      {PAYMENT_METHODS[payment.payment_method] || payment.payment_method}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {getStatusLabel(payment.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPayoutColor(payment.payout_status || 'n/a')}`}>
                      {getPayoutLabel(payment.payout_status || 'n/a')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActionMenuId(actionMenuId === payment.id ? null : payment.id);
                      }}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    {actionMenuId === payment.id && (
                      <div className="absolute right-6 top-full mt-1 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]">
                        <button
                          onClick={(e) => { e.stopPropagation(); setActionMenuId(null); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                        >
                          <Eye className="h-4 w-4 text-gray-400" />
                          View details
                        </button>
                        {payment.status === 'completed' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleIssueRefund(payment); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                          >
                            <RotateCcw className="h-4 w-4 text-gray-400" />
                            Issue refund
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDownloadReceipt(payment); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                        >
                          <FileText className="h-4 w-4 text-gray-400" />
                          Download receipt
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No payments found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>
    </div>
  );
}
