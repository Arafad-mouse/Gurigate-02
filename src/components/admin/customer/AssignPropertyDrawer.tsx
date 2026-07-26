import { useState, useEffect } from 'react';
import { Building, ChevronRight, Building2, MapPin, DollarSign, Calendar, Check } from 'lucide-react';
import { listBuildings, updateBuildingMetrics } from '@/services/buildingService';
import { getRooms, updateRoomStatus } from '@/services/unitService';
import { supabase } from '@/lib/supabase';
import type { Building as BuildingType } from '@/types/building';
import type { RoomWithDetails } from '@/types/unit';
import { getCustomer } from '@/services/customerService';

type AssignmentStep = 'building' | 'unit' | 'summary' | 'success';

interface AssignPropertyDrawerProps {
  customerId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AssignPropertyDrawer({ customerId, isOpen, onClose, onSuccess }: AssignPropertyDrawerProps) {
  const [step, setStep] = useState<AssignmentStep>('building');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingType | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<RoomWithDetails | null>(null);
  const [leaseStart, setLeaseStart] = useState(new Date().toISOString().split('T')[0]);
  const [leaseEnd, setLeaseEnd] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [buildings, setBuildings] = useState<BuildingType[]>([]);
  const [units, setUnits] = useState<RoomWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    if (!isOpen) return;
    // Reset state when drawer opens
    setStep('building');
    setSearchQuery('');
    setSelectedBuilding(null);
    setSelectedUnit(null);
    setLeaseStart(new Date().toISOString().split('T')[0]);
    setLeaseEnd('');
    setError(undefined);
    loadBuildings();
    loadCustomer();
  }, [isOpen, customerId]);

  const loadBuildings = async () => {
    setLoading(true);
    try {
      const { items } = await listBuildings({ page: 1, pageSize: 100 });
      setBuildings(items);
    } catch (err) {
      setError('Failed to load buildings');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomer = async () => {
    try {
      const customerData = await getCustomer(customerId);
      setCustomer(customerData);
    } catch (err) {
      console.error('Failed to load customer:', err);
    }
  };

  const loadUnits = async (buildingId: string) => {
    setLoading(true);
    try {
      const { rooms } = await getRooms({ building_id: buildingId, status: 'available', pageSize: 100 });
      setUnits(rooms);
    } catch (err) {
      setError('Failed to load units');
    } finally {
      setLoading(false);
    }
  };

  const filteredBuildings = buildings.filter((building) => {
    const query = searchQuery.toLowerCase();
    return (
      building.name.toLowerCase().includes(query) ||
      building.city.toLowerCase().includes(query) ||
      building.address.toLowerCase().includes(query)
    );
  });

  const handleBuildingSelect = (building: BuildingType) => {
    setSelectedBuilding(building);
    loadUnits(building.id);
    setStep('unit');
  };

  const handleUnitSelect = (unit: RoomWithDetails) => {
    setSelectedUnit(unit);
    setStep('summary');
  };

  const handleBack = () => {
    if (step === 'unit') {
      setStep('building');
      setSelectedBuilding(null);
      setUnits([]);
    } else if (step === 'summary') {
      setStep('unit');
      setSelectedUnit(null);
    }
  };

  const handleAssign = async () => {
    if (!selectedBuilding || !selectedUnit || !leaseStart) {
      setError('Please complete all required fields');
      return;
    }

    setAssigning(true);
    setError(undefined);

    try {
      // Generate lease number
      const leaseNumber = `LEASE-${Date.now()}`;
      
      // Get current user ID for owner_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create lease record - property_id omitted since RMS uses buildings, not properties
      // The leases table property_id should be NULL for RMS leases
      const { data: lease, error: leaseError } = await supabase
        .from('leases')
        .insert({
          owner_id: user.id,
          customer_id: customerId,
          unit_id: selectedUnit.id,
          lease_number: leaseNumber,
          lease_type: 'Residential',
          status: 'Active',
          start_date: leaseStart,
          end_date: leaseEnd || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
          monthly_rent: (selectedUnit.base_rent || 0) / 100, // Convert cents to decimal
          security_deposit: 0,
          payment_frequency: 'Monthly',
          payment_status: 'Pending',
          outstanding_balance: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (leaseError) throw leaseError;

      // Update unit status to occupied
      await updateRoomStatus(selectedUnit.id, 'occupied');

      // Update building metrics
      await updateBuildingMetrics(selectedBuilding.id);

      // Update customer's current property (using building_id), floor, and unit
      await supabase
        .from('customers')
        .update({
          current_property_id: selectedBuilding.id,
          current_floor: selectedUnit.floor?.toString() || null,
          current_unit: selectedUnit.room_number || selectedUnit.unit_number || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', customerId);

      setStep('success');
      setTimeout(() => {
        onClose();
        onSuccess();
      }, 1500);
    } catch (err) {
      setError('Failed to assign property and create lease');
      console.error('Assignment error:', err);
    } finally {
      setAssigning(false);
    }
  };

  if (!isOpen) return null;

  const renderStep = () => {
    switch (step) {
      case 'building':
        return (
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Building</label>
              <input
                type="text"
                placeholder="Search by name or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Building</label>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-sm text-gray-500 text-center py-4">Loading buildings...</div>
                ) : filteredBuildings.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-4">No buildings found</div>
                ) : (
                  filteredBuildings.map((building) => (
                    <button
                      key={building.id}
                      onClick={() => handleBuildingSelect(building)}
                      className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-rose-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900">{building.name}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {building.city}
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                            <span>{building.total_units} Units</span>
                            <span className="text-green-600">{building.occupied_units} Occupied</span>
                            <span className="text-blue-600">{building.vacant_units} Available</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        );

      case 'unit':
        return (
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-600 pb-2 border-b">
              <Building2 className="w-4 h-4" />
              <span className="font-medium">{selectedBuilding?.name}</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Available Units</label>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-sm text-gray-500 text-center py-4">Loading units...</div>
                ) : units.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-4">No available units in this building</div>
                ) : (
                  units.map((unit) => (
                    <button
                      key={unit.id}
                      onClick={() => handleUnitSelect(unit)}
                      className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Building className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900">{unit.room_number || unit.unit_number}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            {unit.floor ? `Floor ${unit.floor}` : '—'}
                          </div>
                          <div className="flex items-center gap-1 mt-2 text-sm font-medium text-gray-900">
                            <DollarSign className="w-4 h-4" />
                            ${((unit.base_rent || 0) / 100).toLocaleString()}/month
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        );

      case 'summary':
        return (
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <div className="text-xs text-gray-500 mb-1">Customer</div>
                <div className="font-semibold text-gray-900">{customer?.fullName || 'Unknown'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Building</div>
                <div className="font-semibold text-gray-900">{selectedBuilding?.name}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Unit</div>
                <div className="font-semibold text-gray-900">{selectedUnit?.room_number || selectedUnit?.unit_number}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Monthly Rent</div>
                <div className="font-semibold text-gray-900">
                  ${((selectedUnit?.base_rent || 0) / 100).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lease Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={leaseStart}
                  onChange={(e) => setLeaseStart(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lease End Date</label>
                <input
                  type="date"
                  value={leaseEnd}
                  onChange={(e) => setLeaseEnd(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200"
                />
              </div>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Assignment Complete!</h3>
            <p className="text-sm text-gray-600">
              {customer?.fullName} has been assigned to {selectedUnit?.room_number || selectedUnit?.unit_number} at {selectedBuilding?.name}
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full sm:w-[480px] bg-white border-l border-gray-200 shadow-xl flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step !== 'building' && step !== 'success' && (
              <button
                onClick={handleBack}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h2 className="text-lg font-bold text-gray-900">
              {step === 'building' && 'Select Building'}
              {step === 'unit' && 'Select Unit'}
              {step === 'summary' && 'Review Assignment'}
              {step === 'success' && 'Success'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {renderStep()}
        </div>

        {/* Footer */}
        {step === 'summary' && (
          <div className="px-4 py-3 border-t border-gray-100 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={assigning}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
              style={{ background: '#E8344E' }}
            >
              {assigning ? 'Assigning...' : 'Assign & Create Lease'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
