import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBuilding, updateBuildingMetrics } from '@/services/buildingService';
import { listFloors } from '@/services/floorService';
import { getUnitsByBuilding } from '@/services/commercialUnitService';
import type { Building, Floor, UnitWithDetails } from '@/types/building';
import { Building as BuildingIcon, Layers, Home, ArrowLeft, DollarSign, TrendingUp, MapPin, Users, FileText, Calendar, BarChart3 } from 'lucide-react';

type Tab = 'overview' | 'floors' | 'units' | 'customers' | 'leases' | 'payments' | 'documents' | 'reports';

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'floors', label: 'Floors', icon: Layers },
  { id: 'units', label: 'Units', icon: Home },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'leases', label: 'Leases', icon: FileText },
  { id: 'payments', label: 'Payments', icon: DollarSign },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
];

export default function BuildingWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [building, setBuilding] = useState<Building | null>(null);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [units, setUnits] = useState<UnitWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!id) return;
    
    const loadData = async () => {
      setLoading(true);
      setError(undefined);
      try {
        const [buildingData, floorsData, unitsData] = await Promise.all([
          getBuilding(id),
          listFloors({ buildingId: id }),
          getUnitsByBuilding(id),
        ]);
        
        setBuilding(buildingData);
        setFloors(floorsData);
        setUnits(unitsData);
      } catch (err) {
        setError('Failed to load building details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const getUnitStatusColor = (status: string) => {
    switch (status) {
      case 'occupied': return 'bg-green-50 border-green-200 text-green-700';
      case 'available': return 'bg-gray-50 border-gray-200 text-gray-700';
      case 'reserved': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'under_maintenance': return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'cleaning': return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'blocked': return 'bg-red-50 border-red-200 text-red-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getUnitStatusLabel = (status: string) => {
    switch (status) {
      case 'occupied': return 'Occupied';
      case 'available': return 'Available';
      case 'reserved': return 'Reserved';
      case 'under_maintenance': return 'Maintenance';
      case 'cleaning': return 'Cleaning';
      case 'blocked': return 'Blocked';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500">
          Loading building details...
        </div>
      </div>
    );
  }

  if (error || !building) {
    return (
      <div className="p-8">
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-red-600">
          {error || 'Building not found'}
        </div>
      </div>
    );
  }

  // Group units by floor
  const unitsByFloor = new Map<number, UnitWithDetails[]>();
  floors.forEach(floor => {
    unitsByFloor.set(floor.floor_number, []);
  });
  units.forEach(unit => {
    const floorNum = unit.floor_number || 0;
    if (!unitsByFloor.has(floorNum)) {
      unitsByFloor.set(floorNum, []);
    }
    unitsByFloor.get(floorNum)?.push(unit);
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => {
            console.log('Back button clicked, navigating to buildings');
            navigate('/manage-property/buildings');
          }}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{building.name}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <MapPin className="w-4 h-4" />
            <span>{building.address}, {building.city}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-rose-500 text-rose-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div>
          {/* Building Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <Layers className="w-5 h-5 text-rose-500" />
                <span className="text-xs text-gray-500">Total</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{building.floors_count}</div>
              <div className="text-xs text-gray-500 mt-1">Floors</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <Home className="w-5 h-5 text-blue-500" />
                <span className="text-xs text-gray-500">Total</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{building.total_units}</div>
              <div className="text-xs text-gray-500 mt-1">Units</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-xs text-gray-500">Occupancy</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{building.occupancy_rate.toFixed(1)}%</div>
              <div className="text-xs text-gray-500 mt-1">{building.occupied_units} / {building.total_units} occupied</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <DollarSign className="w-5 h-5 text-purple-500" />
                <span className="text-xs text-gray-500">Revenue</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">${(building.monthly_revenue / 100).toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">Monthly</div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Building Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{building.total_units}</div>
                <div className="text-sm text-gray-500">Total Units</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{building.occupied_units}</div>
                <div className="text-sm text-gray-500">Occupied</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{building.vacant_units}</div>
                <div className="text-sm text-gray-500">Vacant</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{building.floors_count}</div>
                <div className="text-sm text-gray-500">Floors</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'floors' && (
        <div className="space-y-6">
          {floors.map((floor) => {
            const floorUnits = unitsByFloor.get(floor.floor_number) || [];
            return (
              <div key={floor.id} className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Floor {floor.floor_number}</h2>
                  <span className="text-sm text-gray-500">{floorUnits.length} units</span>
                </div>
                
                {floorUnits.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No units on this floor
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {floorUnits.map((unit) => (
                      <div
                        key={unit.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors hover:shadow-md ${getUnitStatusColor(unit.status)}`}
                        onClick={() => navigate(`/manage-property/units/${unit.id}`)}
                      >
                        <div className="font-semibold text-sm mb-2">{unit.unit_number}</div>
                        <div className="text-xs mb-2">{unit.unit_type}</div>
                        <div className="text-xs mb-2">{unit.size} sqm</div>
                        {unit.status === 'occupied' && unit.current_tenant && (
                          <div className="text-xs font-medium truncate" title={unit.current_tenant}>
                            {unit.current_tenant}
                          </div>
                        )}
                        {unit.status === 'occupied' && unit.base_rent > 0 && (
                          <div className="text-xs font-medium">
                            ${(unit.base_rent / 100).toLocaleString()}/mo
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'units' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">All Units in {building.name}</h2>
          <div className="space-y-2">
            {units.map((unit) => (
              <div
                key={unit.id}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/manage-property/units/${unit.id}`)}
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{unit.unit_number}</div>
                  <div className="text-sm text-gray-500">
                    Floor {unit.floor_number} • {unit.unit_type} • {unit.size} sqm
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getUnitStatusColor(unit.status)}`}>
                  {getUnitStatusLabel(unit.status)}
                </span>
                {unit.status === 'occupied' && (
                  <div className="text-sm font-medium text-gray-900">
                    ${(unit.base_rent / 100).toLocaleString()}/mo
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab !== 'overview' && activeTab !== 'floors' && activeTab !== 'units' && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BarChart3 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {TABS.find(t => t.id === activeTab)?.label}
          </h3>
          <p className="text-sm">This feature is coming soon.</p>
        </div>
      )}
    </div>
  );
}
