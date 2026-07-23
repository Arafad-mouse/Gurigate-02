"use client";

import { useState, useRef, useEffect } from "react";
import { X, Filter } from "lucide-react";
import type { CustomerType, LifecycleStatus } from "@/types/customer";

interface FilterPanelProps {
  onClose: () => void;
  onApply: (filters: FilterValues) => void;
  onClear: () => void;
  initialFilters?: FilterValues;
}

export interface FilterValues {
  customerType: CustomerType | 'all';
  lifecycleStatus: LifecycleStatus | 'all';
  propertyId: string;
  activity: 'all' | 'active_week' | 'active_month' | 'inactive';
  dateFrom: string;
  dateTo: string;
}

const DEFAULT_FILTERS: FilterValues = {
  customerType: 'all',
  lifecycleStatus: 'all',
  propertyId: '',
  activity: 'all',
  dateFrom: '',
  dateTo: '',
};

export function FilterPanel({ onClose, onApply, onClear, initialFilters }: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterValues>(initialFilters || DEFAULT_FILTERS);
  const ref = useRef<HTMLDivElement>(null);

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

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleClear = () => {
    setFilters(DEFAULT_FILTERS);
    onClear();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-2 sm:items-center sm:p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }}
    >
      <div
        ref={ref}
        className="w-full max-w-[calc(100vw-1rem)] overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-w-md sm:rounded-2xl"
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
          <h2 className="text-sm font-semibold text-gray-900">Filter Customers</h2>
        </div>

        {/* Content */}
        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto p-4 sm:max-h-[60vh] sm:p-6">
          <div className="space-y-6">
            {/* Customer Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Type
              </label>
              <select
                value={filters.customerType}
                onChange={(e) => setFilters(prev => ({ ...prev, customerType: e.target.value as FilterValues["customerType"] }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              >
                <option value="all">All Types</option>
                <option value="tenant">Tenant</option>
                <option value="renter">Renter</option>
                <option value="buyer">Buyer</option>
                <option value="guest">Guest</option>
              </select>
            </div>

            {/* Lifecycle Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lifecycle Status
              </label>
              <select
                value={filters.lifecycleStatus}
                onChange={(e) => setFilters(prev => ({ ...prev, lifecycleStatus: e.target.value as FilterValues["lifecycleStatus"] }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="lead">Lead</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            {/* Property Assignment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property
              </label>
              <select
                value={filters.propertyId}
                onChange={(e) => setFilters(prev => ({ ...prev, propertyId: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              >
                <option value="">All Properties</option>
                {/* TODO: Load properties from service */}
                <option value="prop-1">Property 1</option>
                <option value="prop-2">Property 2</option>
              </select>
            </div>

            {/* Activity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activity
              </label>
              <select
                value={filters.activity}
                onChange={(e) => setFilters(prev => ({ ...prev, activity: e.target.value as FilterValues["activity"] }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              >
                <option value="all">All Activity</option>
                <option value="active_week">Active This Week</option>
                <option value="active_month">Active This Month</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registration Date Range
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">From</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">To</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <button
            onClick={handleClear}
            className="w-full rounded-xl px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-100 sm:w-auto"
          >
            Clear Filters
          </button>

          <button
            onClick={handleApply}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-6 py-3 font-medium text-white transition-colors hover:bg-red-600 sm:w-auto"
          >
            <Filter size={16} />
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
