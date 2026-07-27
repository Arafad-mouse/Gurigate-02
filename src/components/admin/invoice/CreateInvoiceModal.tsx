import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { createInvoice } from '@/services/invoiceService';
import type { CreateInvoiceInput } from '@/types/invoice';

interface CreateInvoiceModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface LeaseOption {
  id: string;
  lease_number: string;
  customer_id: string;
  property_id: string;
  unit_id: string;
  monthly_rent: number;
  tenant_name?: string;
  property_title?: string;
}

export function CreateInvoiceModal({ onClose, onSuccess }: CreateInvoiceModalProps) {
  const [leases, setLeases] = useState<LeaseOption[]>([]);
  const [leasesLoading, setLeasesLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [leaseId, setLeaseId] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [rentAmount, setRentAmount] = useState(0);
  const [additionalCharges, setAdditionalCharges] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);

  // Calculate total whenever inputs change
  useEffect(() => {
    const subtotalAfterDiscount = rentAmount + additionalCharges - discount;
    const taxAmount = (subtotalAfterDiscount * tax) / 100;
    setTotalAmount(subtotalAfterDiscount + taxAmount);
  }, [rentAmount, additionalCharges, discount, tax]);

  useEffect(() => {
    const fetchLeases = async () => {
      try {
        const { data, error } = await supabase
          .from('leases')
          .select(`
            id, lease_number, customer_id, property_id, unit_id, monthly_rent,
            customer:customers!customer_id(profile_id),
            property:properties!property_id(title)
          `)
          .eq('status', 'Active')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const mapped = (data || []).map((l: any) => ({
          id: l.id,
          lease_number: l.lease_number,
          customer_id: l.customer_id,
          property_id: l.property_id,
          unit_id: l.unit_id,
          monthly_rent: Number(l.monthly_rent) || 0,
          tenant_name: l.customer?.profile_id || l.customer_id,
          property_title: l.property?.title || 'Unknown',
        }));

        setLeases(mapped);
      } catch (err) {
        console.error('Failed to fetch leases:', err);
      } finally {
        setLeasesLoading(false);
      }
    };
    fetchLeases();
  }, []);

  const handleLeaseChange = (selectedId: string) => {
    setLeaseId(selectedId);
    const lease = leases.find((l) => l.id === selectedId);
    if (lease) {
      setTenantId(lease.customer_id);
      setPropertyId(lease.property_id);
      setUnitId(lease.unit_id);
      setRentAmount(lease.monthly_rent);
    } else {
      setTenantId('');
      setPropertyId('');
      setUnitId('');
      setRentAmount(0);
    }
  };

  const handleSubmit = async () => {
    if (!leaseId) {
      setError('Please select a lease.');
      return;
    }
    if (!issueDate || !dueDate) {
      setError('Issue date and due date are required.');
      return;
    }
    if (rentAmount <= 0) {
      setError('Rent amount must be greater than 0.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const input: CreateInvoiceInput = {
        leaseId,
        tenantId,
        propertyId,
        unitId,
        issueDate,
        dueDate,
        monthlyRent: rentAmount,
        additionalCharges,
        discount,
        tax,
        notes,
      };
      await createInvoice(input);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create invoice.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Create Invoice</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Lease Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Lease <span className="text-red-500">*</span>
            </label>
            {leasesLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading leases...
              </div>
            ) : leases.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No active leases found. Create a lease first.</p>
            ) : (
              <select
                value={leaseId}
                onChange={(e) => handleLeaseChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Select a lease...</option>
                {leases.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.lease_number} — {l.property_title} (${l.monthly_rent}/mo)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Auto-filled fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Customer</label>
              <input
                type="text"
                value={tenantId || 'Auto-filled from lease'}
                disabled
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Property</label>
              <input
                type="text"
                value={propertyId || 'Auto-filled from lease'}
                disabled
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Unit</label>
              <input
                type="text"
                value={unitId || 'Auto-filled from lease'}
                disabled
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-gray-50 text-gray-500"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Issue Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Amounts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Rent Amount</label>
              <input
                type="number"
                value={rentAmount || ''}
                onChange={(e) => setRentAmount(Number(e.target.value) || 0)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Additional Charges</label>
              <input
                type="number"
                value={additionalCharges || ''}
                onChange={(e) => setAdditionalCharges(Number(e.target.value) || 0)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Discount</label>
              <input
                type="number"
                value={discount || ''}
                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tax (%)</label>
              <input
                type="number"
                value={tax || ''}
                onChange={(e) => setTax(Number(e.target.value) || 0)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
            <span className="text-sm font-semibold text-gray-700">Total Amount</span>
            <span key={totalAmount} className="text-lg font-bold text-gray-900" data-testid="total-amount-display">
              ${totalAmount.toFixed(2)}
            </span>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              placeholder="Optional notes..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !leaseId}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: '#E8344E' }}
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Saving...' : 'Create Invoice'}
          </button>
        </div>
      </div>
    </div>
  );
}
