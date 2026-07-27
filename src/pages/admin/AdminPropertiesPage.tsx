/**
 * Admin Properties Page
 *
 * Admin property approval workflow.
 * Allows admins to approve, reject, suspend, and feature properties.
 */

import { useMemo, useState, useEffect } from 'react';
import { DataTable } from '../../components/admin/table/DataTable';
import { ApprovalBadge } from '../../components/admin/table/ApprovalBadge';
import { GuriGatePropertyService } from '@/services/guriGateProperties';

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
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setLoading(true);
    try {
      const allProperties = await GuriGatePropertyService.getAllProperties();
      setProperties(allProperties);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const propertyRows = useMemo(
    () => properties.map((property): PropertyRow => ({
      id: property.id,
      title: property.title,
      owner: property.profiles?.full_name || 'Unknown',
      type: property.type || 'N/A',
      price: `$${property.base_price || 0}`,
      status: property.approval_status || 'pending',
      createdAt: property.created_at ? new Date(property.created_at).toLocaleDateString() : 'N/A',
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
