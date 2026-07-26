import { useState, useMemo } from 'react';
import { X, Loader2 } from 'lucide-react';
import { recordPayment } from '@/services/invoiceService';
import type { Invoice, RecordPaymentInput } from '@/types/invoice';

interface RecordPaymentModalProps {
  invoice: Invoice;
  onClose: () => void;
  onSuccess: () => void;
}

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'zaad', label: 'Zaad' },
  { value: 'edahab', label: 'E-Dahab' },
  { value: 'premier_wallet', label: 'Premier Wallet' },
  { value: 'wadaag_pay', label: 'Wadaag Pay' },
  { value: 'card', label: 'Card' },
  { value: 'other', label: 'Other' },
];

export function RecordPaymentModal({ invoice, onClose, onSuccess }: RecordPaymentModalProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [amount, setAmount] = useState(invoice.balanceDue || 0);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState('cash');
  const [reference, setReference] = useState('');

  const newBalance = useMemo(() => {
    return Math.max(0, invoice.balanceDue - amount);
  }, [invoice.balanceDue, amount]);

  const newStatus = useMemo(() => {
    if (newBalance === 0) return 'Paid';
    if (amount > 0) return 'Partially Paid';
    return invoice.status;
  }, [newBalance, amount, invoice.status]);

  const handleSubmit = async () => {
    if (amount <= 0) {
      setError('Payment amount must be greater than 0.');
      return;
    }
    if (amount > invoice.balanceDue) {
      setError(`Amount cannot exceed balance due ($${invoice.balanceDue.toFixed(2)}).`);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const input: RecordPaymentInput = {
        invoiceId: invoice.id,
        amount,
        paymentDate,
        method,
      };
      await recordPayment(input);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to record payment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Record Payment</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Invoice summary */}
          <div className="px-4 py-3 bg-gray-50 rounded-lg space-y-1">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Invoice</span>
              <span className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Total Amount</span>
              <span className="text-sm font-medium text-gray-900">${invoice.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Paid Amount</span>
              <span className="text-sm font-medium text-green-600">${invoice.paidAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-1">
              <span className="text-sm text-gray-500">Balance Due</span>
              <span className="text-sm font-bold text-red-600">${invoice.balanceDue.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Payment Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              max={invoice.balanceDue}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Payment Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Reference (optional)</label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Transaction reference..."
            />
          </div>

          {/* Preview */}
          <div className="px-4 py-3 bg-gray-50 rounded-lg space-y-1">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">New Balance</span>
              <span className="text-sm font-medium text-gray-900">${newBalance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">New Status</span>
              <span className="text-sm font-medium text-gray-900">{newStatus}</span>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: '#E8344E' }}
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Recording...' : 'Record Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}
