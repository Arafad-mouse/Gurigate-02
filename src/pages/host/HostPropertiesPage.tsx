/**
 * Host Properties Page
 *
 * Host's property management dashboard.
 * Lists all properties owned by the host with actions to create/edit.
 */

import { useContext, useEffect, useState } from 'react';
import { DataTable } from '../../components/admin/table/DataTable';
import { StatusBadge } from '../../components/admin/table/StatusBadge';
import { Link } from 'react-router-dom';
import { AuthContext } from '@/lib/auth-context';
import { propertyService } from '../../../frontend/src/services/propertyService';
import type { Property } from '../../../frontend/src/domain/property/PropertyTypes';

interface HostPropertyRow {
  id: string;
  title: string;
  type: string;
  price: string;
  status: string;
  approvalStatus: string;
  bookings: number;
  views: number;
  createdAt: string;
}

export function HostPropertiesPage() {
  const authContext = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [properties, setProperties] = useState<HostPropertyRow[]>([]);

  useEffect(() => {
    let active = true;
    const ownerId = authContext?.session?.user.id;

    async function loadProperties() {
      if (!ownerId) {
        setProperties([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await propertyService.getPropertiesByOwner(ownerId, 1, 100);
        if (active) {
          setProperties(result.items.map(mapHostPropertyRow));
        }
      } catch (err) {
        if (active) {
          setError(err as Error);
          setProperties([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadProperties();

    return () => {
      active = false;
    };
  }, [authContext?.session?.user.id]);

  const columns = [
    {
      key: 'title',
      header: 'Property',
      render: (value: string) => <span className="font-medium">{value}</span>,
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
      render: (value: string) => <StatusBadge status={value} category="PROPERTY" />,
    },
    {
      key: 'approvalStatus',
      header: 'Approval',
      render: (value: string) => <StatusBadge status={value} category="PROPERTY" />,
    },
    {
      key: 'bookings',
      header: 'Bookings',
    },
    {
      key: 'views',
      header: 'Views',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
          <Link
            to="/host/properties/create"
            className="px-4 py-2 bg-[#BA0036] text-white rounded-lg hover:bg-[#99002d] transition-colors"
          >
            Add New Property
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error.message}
          </div>
        )}

        <DataTable
          data={properties}
          columns={columns}
          loading={loading}
          emptyMessage="You haven't listed any properties yet"
        />
      </div>
    </div>
  );
}

function mapHostPropertyRow(property: Property): HostPropertyRow {
  return {
    id: property.id,
    title: property.title,
    type: property.type,
    price: `${property.pricing.currency} ${property.pricing.basePrice.toLocaleString()} ${property.priceUnitLabel}`,
    status: property.status,
    approvalStatus: property.isApproved ? 'approved' : 'pending',
    bookings: 0,
    views: property.viewCount,
    createdAt: property.createdAt.toLocaleDateString(),
  };
}
