/**
 * Admin Properties Page
 *
 * Admin property approval workflow.
 * Allows admins to approve, reject, suspend, and feature properties.
 */

import { useMemo } from 'react';
import { DataTable } from '../../components/admin/table/DataTable';
import { ApprovalBadge } from '../../components/admin/table/ApprovalBadge';
import { useProperties } from '../../../frontend/src/hooks/useProperties';

interface PropertyRow {
  id: string;
  title: string;
  owner: string;
  type: string;
  price: string;
  status: string;
  createdAt: string;
}

export function AdminPropertiesPage() {
  const { properties, loading, error } = useProperties(100);
  const propertyRows = useMemo(
    () => properties.map((property): PropertyRow => ({
      id: property.id,
      title: property.title,
      owner: property.ownerName,
      type: property.type,
      price: `${property.pricing.currency} ${property.pricing.basePrice.toLocaleString()} ${property.priceUnitLabel}`,
      status: property.isApproved ? 'approved' : 'pending',
      createdAt: property.createdAt.toLocaleDateString(),
    })),
    [properties]
  );

  const columns = [
    {
      key: 'title',
      header: 'Property',
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      key: 'owner',
      header: 'Owner',
    },
    {
      key: 'type',
      header: 'Type',
    },
    {
      key: 'price',
      header: 'Price',
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: string) => <ApprovalBadge status={value} />,
    },
    {
      key: 'createdAt',
      header: 'Submitted',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Property Approvals</h1>
      </div>


      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error.message}
        </div>
      )}

      <DataTable
        data={propertyRows}
        columns={columns}
        loading={loading}
        emptyMessage="No properties found"
      />
    </div>
  );
}
