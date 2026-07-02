"use client";

import { useState, useRef, useEffect } from "react";
import { X, AlertCircle, Check } from "lucide-react";
import type { Customer } from "@/types/customer";
import { createCustomer } from "@/services/customerService";

interface AddCustomerModalProps {
  onClose: () => void;
  onSuccess: (customer: Customer) => void;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  customerType: "tenant" | "renter" | "buyer" | "guest";
  lifecycleStatus: "lead" | "active" | "inactive" | "suspended";
  propertyId: string;
  notes: string;
  tags: string;
}

export function AddCustomerModal({ onClose, onSuccess }: AddCustomerModalProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    customerType: "tenant",
    lifecycleStatus: "lead",
    propertyId: "",
    notes: "",
    tags: "",
  });

  // Close on backdrop click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const validateForm = (): boolean => {
    const formErrors: string[] = [];

    if (!formData.fullName.trim()) {
      formErrors.push("Full name is required");
    }

    if (!formData.phone.trim()) {
      formErrors.push("Phone number is required");
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      formErrors.push("Invalid email format");
    }

    setErrors(formErrors);
    return formErrors.length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrors([]);

    try {
      const newCustomer = await createCustomer({
        fullName: formData.fullName,
        email: formData.email || null,
        phone: formData.phone,
        customerType: formData.customerType,
        lifecycleStatus: formData.lifecycleStatus,
        propertyId: formData.propertyId || null,
        notes: formData.notes || null,
        tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : [],
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess(newCustomer);
        onClose();
      }, 1500);
    } catch (error: any) {
      setErrors([error.message || "Failed to create customer"]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-2 sm:items-center sm:p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }}
    >
      <div
        ref={ref}
        className="w-full max-w-[calc(100vw-1rem)] overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-w-lg sm:rounded-2xl"
        style={{ animation: "modalIn .2s cubic-bezier(.16,1,.3,1) both" }}
      >
        <style>{`@keyframes modalIn{from{opacity:0;transform:translateY(16px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>

        {/* Header */}
        <div className="relative flex items-center justify-center border-b border-gray-200 px-4 py-4 sm:px-6">
          <button
            onClick={onClose}
            className="absolute left-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={16} className="text-gray-600" />
          </button>
          <h2 className="text-sm font-semibold text-gray-900">Add Customer</h2>
        </div>

        {/* Content */}
        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto p-4 sm:max-h-[60vh] sm:p-6">
          {errors.length > 0 && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-red-500 mt-0.5" size={16} />
                <div>
                  <p className="font-medium text-red-900 text-sm">Please fix the following errors:</p>
                  <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <Check className="text-green-600" size={20} />
              <div>
                <p className="font-medium text-green-900">Customer created successfully!</p>
                <p className="text-sm text-green-700">The customer list will refresh shortly...</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Row 1: Full Name and Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="e.g., John Doe"
                  disabled={loading || success}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="e.g., john@example.com"
                  disabled={loading || success}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none disabled:opacity-50"
                />
              </div>
            </div>

            {/* Row 2: Phone and Customer Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="e.g., +1 234 567 8900"
                  disabled={loading || success}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Type *
                </label>
                <select
                  value={formData.customerType}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerType: e.target.value as FormData["customerType"] }))}
                  disabled={loading || success}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none disabled:opacity-50"
                >
                  <option value="tenant">Tenant</option>
                  <option value="renter">Renter</option>
                  <option value="buyer">Buyer</option>
                  <option value="guest">Guest</option>
                </select>
              </div>
            </div>

            {/* Row 3: Lifecycle Status and Property Assignment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lifecycle Status
                </label>
                <select
                  value={formData.lifecycleStatus}
                  onChange={(e) => setFormData(prev => ({ ...prev, lifecycleStatus: e.target.value as FormData["lifecycleStatus"] }))}
                  disabled={loading || success}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none disabled:opacity-50"
                >
                  <option value="lead">Lead</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Assignment (Optional)
                </label>
                <select
                  value={formData.propertyId}
                  onChange={(e) => setFormData(prev => ({ ...prev, propertyId: e.target.value }))}
                  disabled={loading || success}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none disabled:opacity-50"
                >
                  <option value="">No property assigned</option>
                  {/* TODO: Load properties from service */}
                  <option value="prop-1">Property 1</option>
                  <option value="prop-2">Property 2</option>
                </select>
              </div>
            </div>

            {/* Row 4: Notes (full width) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about this customer..."
                rows={3}
                disabled={loading || success}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none disabled:opacity-50"
              />
            </div>

            {/* Row 5: Tags (full width) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="e.g., VIP, Corporate, Long-term (comma-separated)"
                disabled={loading || success}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <button
            onClick={onClose}
            disabled={loading || success}
            className="w-full rounded-xl px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50 sm:w-auto"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading || success}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-6 py-3 font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" />
                </svg>
                Creating Customer...
              </>
            ) : success ? (
              <>
                <Check size={16} />
                Created!
              </>
            ) : (
              "Create Customer"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
