import { useMemo, useState, useEffect } from 'react';
import { assignProperty } from '@/services/customerService';
import { supabase } from '@/lib/supabase';

interface Property {
  id: string;
  title: string;
  city: string;
  address?: string;
}

interface AssignPropertyDrawerProps {
  customerId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AssignPropertyDrawer({ customerId, isOpen, onClose, onSuccess }: AssignPropertyDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [propertyError, setPropertyError] = useState<string | undefined>();

  useEffect(() => {
    if (!isOpen) return;

    const fetchProperties = async () => {
      setLoading(true);
      setPropertyError(undefined);
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('id, title, city')
          .eq('is_approved', true)
          .order('title');

        if (error) {
          setPropertyError(error.message);
          setProperties([]);
        } else {
          setProperties(data || []);
        }
      } catch (err) {
        setPropertyError('Failed to load properties');
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [isOpen]);

  const filteredProperties = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return properties.filter((property) => {
      return (
        property.title.toLowerCase().includes(query) ||
        (property.address?.toLowerCase() || '').includes(query) ||
        property.city.toLowerCase().includes(query)
      );
    });
  }, [properties, searchQuery]);

  const handleAssign = async () => {
    if (!selectedPropertyId) {
      setError('Please select a property');
      return;
    }

    setAssigning(true);
    setError(undefined);

    try {
      await assignProperty(customerId, selectedPropertyId);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        onSuccess();
      }, 1500);
    } catch (err) {
      setError('Failed to assign property');
    } finally {
      setAssigning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white border-l border-gray-200 shadow-xl flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Assign Property</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {success ? (
            <div className="text-center py-8 text-green-600 font-medium">Property assigned successfully!</div>
          ) : (
            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}
              {propertyError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
                  {propertyError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Property</label>
                <input
                  type="text"
                  placeholder="Search by name or unit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Property</label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {loading ? (
                    <div className="text-sm text-gray-500 text-center py-4">Loading properties...</div>
                  ) : filteredProperties.length === 0 ? (
                    <div className="text-sm text-gray-500 text-center py-4">No properties found</div>
                  ) : (
                    filteredProperties.map((property) => (
                      <button
                        key={property.id}
                        onClick={() => setSelectedPropertyId(property.id)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedPropertyId === property.id
                            ? 'border-rose-500 bg-rose-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-gray-900">{property.title}</div>
                        <div className="text-sm text-gray-500">{property.city || '—'}</div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="px-4 py-3 border-t border-gray-100 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={assigning || !selectedPropertyId}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
              style={{ background: '#E8344E' }}
            >
              {assigning ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
