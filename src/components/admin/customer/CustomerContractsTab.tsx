import type { ContractSummary } from '@/types/customer';

interface CustomerContractsTabProps {
  loading: boolean;
  error?: string;
  items: ContractSummary[];
  active?: ContractSummary;
}

export function CustomerContractsTab({ loading, error, items }: CustomerContractsTabProps) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-sm text-red-600">{error}</div>;
  }

  if (items.length === 0) {
    return <div className="text-sm text-gray-500">No contracts found</div>;
  }

  return (
    <div className="space-y-3">
      {items.map((contract) => (
        <div key={contract.id} className={`border rounded-lg p-3 ${
          contract.status === 'active' ? 'border-green-200 bg-green-50' : 'border-gray-200'
        }`}>
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="text-sm font-medium text-gray-900">{contract.property}</div>
              <div className="text-xs text-gray-500">
                {new Date(contract.startDate).toLocaleDateString()} – {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : 'Ongoing'}
              </div>
            </div>
            <span className={`text-xs px-2 py-1 rounded ${
              contract.status === 'active' ? 'bg-green-100 text-green-700' :
              contract.status === 'expired' ? 'bg-gray-100 text-gray-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {contract.status}
            </span>
          </div>
          {contract.rentCents && (
            <div className="text-sm font-semibold text-gray-900">
              Rent: ${(contract.rentCents / 100).toFixed(2)}/month
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
