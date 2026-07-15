import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listBuildings, createBuilding } from '@/services/buildingService';
import { createFloor } from '@/services/floorService';
import { createUnit } from '@/services/commercialUnitService';
import type { Building } from '@/types/building';
import { Building as BuildingIcon, Layers, Home, MapPin, DollarSign, TrendingUp, ArrowRight, X, Plus, Trash2 } from 'lucide-react';

export default function BuildingsPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    floors_count: 0,
  });

  const [unitsConfig, setUnitsConfig] = useState<{ floorNumber: number; unitsCount: number }[]>([]);

  useEffect(() => {
    const loadBuildings = async () => {
      setLoading(true);
      setError(null);
      const timeoutId = setTimeout(() => {
        console.log('Timeout reached, forcing loading to false');
        setLoading(false);
        setError('Request timeout');
      }, 5000);
      
      try {
        console.log('Loading buildings with filters:', { query, cityFilter });
        
        const res = await listBuildings({ query, city: cityFilter === 'all' ? undefined : cityFilter });
        console.log('Buildings loaded:', res);
        console.log('Setting buildings state to:', res.items);
        
        // Clear timeout if request completes
        clearTimeout(timeoutId);
        
        // Always set loading to false when request completes, regardless of data
        setBuildings(res.items);
        setLoading(false);
        setError(null);
        console.log('Buildings state updated, loading set to false');
      } catch (error) {
        console.error('Failed to load buildings:', error);
        clearTimeout(timeoutId);
        setBuildings([]);
        setLoading(false);
        setError(error instanceof Error ? error.message : 'Failed to load buildings');
      }
    };
    
    loadBuildings();
  }, []); // Only load on mount, not on filter changes

  const handleCreateBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const newBuilding = await createBuilding({
        name: formData.name,
        address: formData.address,
        city: formData.city,
        floors_count: formData.floors_count,
        total_units: 0,
        occupied_units: 0,
        vacant_units: 0,
        monthly_revenue: 0,
        occupancy_rate: 0,
      });
      
      console.log('Building created successfully:', newBuilding);
      
      // Create floors and units
      const floors = [];
      for (const config of unitsConfig) {
        const floor = await createFloor({
          building_id: newBuilding.id,
          floor_number: config.floorNumber,
          units_count: 0,
        });
        floors.push(floor);
        
        // Create units for this floor
        for (let i = 1; i <= config.unitsCount; i++) {
          const unitNumber = `${config.floorNumber}${String(i).padStart(2, '0')}`;
          await createUnit({
            building_id: newBuilding.id,
            floor_id: floor.id,
            unit_number: unitNumber,
            unit_type: 'office',
            size: 50,
            status: 'available',
            base_rent: 100000, // $1,000 in cents
          });
        }
      }
      
      // Close modal and reset form
      setShowAddModal(false);
      setFormData({ name: '', address: '', city: '', floors_count: 0 });
      setUnitsConfig([]);
      
      // Add new building to the list directly if it doesn't already exist
      setBuildings(prev => {
        if (prev.some(b => b.id === newBuilding.id)) {
          return prev;
        }
        return [...prev, newBuilding];
      });
    } catch (error) {
      console.error('Failed to create building:', error);
      alert('Failed to create building. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commercial Buildings</h1>
          <p className="text-sm text-gray-500">Building directory</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors hover:bg-red-600" 
          style={{ background: 'rgb(232, 52, 78)' }}
        >
          <BuildingIcon className="w-4 h-4" />
          Add Building
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search buildings..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-rose-200"
            />
          </div>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-rose-200 bg-white"
          >
            <option value="all">All Cities</option>
            <option value="Nairobi">Nairobi</option>
            <option value="Hargeisa">Hargeisa</option>
            <option value="Mogadishu">Mogadishu</option>
          </select>
        </div>
      </div>

      {/* Building Cards */}
      {loading ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading buildings...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : buildings.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <BuildingIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Buildings Yet</h3>
          <p className="text-gray-500 mb-6">You haven't added any commercial buildings. Start by creating your first building to manage floors, units, tenants, and leases.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors hover:bg-red-600"
            style={{ background: 'rgb(232, 52, 78)' }}
          >
            <BuildingIcon className="w-4 h-4" />
            Add Your First Building
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buildings.map((building) => (
            <div
              key={building.id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/manage-property/buildings/${building.id}`)}
            >
              {/* Building Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                    <BuildingIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{building.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span>{building.city}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="text-sm text-gray-600 mb-4 line-clamp-2">
                {building.address}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <Layers className="w-3 h-3" />
                    <span>Floors</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">{building.floors_count}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <Home className="w-3 h-3" />
                    <span>Units</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">{building.total_units}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>Occupied</span>
                  </div>
                  <div className="text-lg font-semibold text-green-600">{building.occupied_units}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <Home className="w-3 h-3" />
                    <span>Vacant</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-600">{building.vacant_units}</div>
                </div>
              </div>

              {/* Occupancy Rate */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-500">Occupancy Rate</span>
                  <span className="font-medium text-gray-900">{building.occupancy_rate.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${building.occupancy_rate}%` }}
                  />
                </div>
              </div>

              {/* Revenue */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <DollarSign className="w-4 h-4" />
                  <span>Monthly Revenue</span>
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  ${(building.monthly_revenue / 100).toLocaleString()}
                </div>
              </div>

              {/* Open Button */}
              <button className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors hover:bg-red-600" style={{ background: 'rgb(232, 52, 78)' }}>
                Open Building
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Building Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add New Building</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleCreateBuilding} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Building Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-rose-200"
                  placeholder="e.g., Burj Omar"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-rose-200"
                  placeholder="e.g., 123 Main Street"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-rose-200"
                  placeholder="e.g., Hargeisa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Floors *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.floors_count}
                  onChange={(e) => {
                    const count = parseInt(e.target.value) || 0;
                    setFormData({ ...formData, floors_count: count });
                    // Auto-generate unit config for each floor
                    const newConfig = Array.from({ length: count }, (_, i) => ({
                      floorNumber: i + 1,
                      unitsCount: 10, // Default 10 units per floor
                    }));
                    setUnitsConfig(newConfig);
                  }}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-rose-200"
                  placeholder="e.g., 4"
                />
              </div>

              {/* Units Configuration */}
              {formData.floors_count > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Units per Floor</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {unitsConfig.map((config, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 w-20">Floor {config.floorNumber}</span>
                        <input
                          type="number"
                          min="1"
                          value={config.unitsCount}
                          onChange={(e) => {
                            const newConfig = [...unitsConfig];
                            newConfig[index].unitsCount = parseInt(e.target.value) || 1;
                            setUnitsConfig(newConfig);
                          }}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-rose-200"
                          placeholder="Units count"
                        />
                        <span className="text-sm text-gray-500">units</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-colors hover:bg-red-600"
                  style={{ background: 'rgb(232, 52, 78)' }}
                >
                  {creating ? 'Creating...' : 'Create Building'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
