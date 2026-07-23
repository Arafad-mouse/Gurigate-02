import React, { useState, useEffect } from 'react';
import type { CustomerType, LifecycleStatus } from '@/types/customer';
import { getCustomer, updateCustomer } from '@/services/customerService';

interface EditCustomerModalProps {
  customerId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditCustomerModal({ customerId, isOpen, onClose, onSuccess }: EditCustomerModalProps) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    customerType: 'guest' as CustomerType,
    lifecycleStatus: 'lead' as LifecycleStatus,
    propertyId: '',
    notes: '',
    tags: '',
  });

  // Load customer data when modal opens
  useEffect(() => {
    if (!isOpen || !customerId) return;
    setLoading(true);
    setError(undefined);
    getCustomer(customerId)
      .then((customer) => {
        setFormData({
          fullName: customer.fullName,
          email: customer.email || '',
          phone: customer.phone || '',
          customerType: customer.customerType,
          lifecycleStatus: customer.lifecycleStatus,
          propertyId: customer.propertyId || '',
          notes: customer.notes || '',
          tags: customer.tags?.join(', ') || '',
        });
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load customer data');
        setLoading(false);
      });
  }, [isOpen, customerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(undefined);

    try {
      await updateCustomer(customerId, {
        fullName: formData.fullName,
        email: formData.email || null,
        phone: formData.phone,
        customerType: formData.customerType,
        lifecycleStatus: formData.lifecycleStatus,
        propertyId: formData.propertyId || null,
        notes: formData.notes,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        onSuccess();
      }, 1500);
    } catch (err) {
      setError('Failed to update customer');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Customer</h2>

            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : success ? (
              <div className="text-center py-8 text-green-600 font-medium">Customer updated successfully!</div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Type *</label>
                  <select
                    required
                    value={formData.customerType}
                    onChange={(e) => setFormData({ ...formData, customerType: e.target.value as CustomerType })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200"
                  >
                    <option value="tenant">Tenant</option>
                    <option value="renter">Renter</option>
                    <option value="buyer">Buyer</option>
                    <option value="guest">Guest</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lifecycle Status *</label>
                  <select
                    required
                    value={formData.lifecycleStatus}
                    onChange={(e) => setFormData({ ...formData, lifecycleStatus: e.target.value as LifecycleStatus })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200"
                  >
                    <option value="lead">Lead</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property ID</label>
                  <input
                    type="text"
                    value={formData.propertyId}
                    onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
                    style={{ background: '#E8344E' }}
                  >
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
