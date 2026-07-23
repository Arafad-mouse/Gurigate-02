import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { 
  getBuildings, 
  getRooms, 
  createBuilding, 
  updateBuilding, 
  deleteBuilding,
  createRoom,
  updateRoom,
  deleteRoom,
  updateRoomStatus,
  getBuildingStats,
  type Building,
  type RoomWithDetails,
  type BuildingFormData,
  type RoomFormData,
  type BuildingStats
} from "@/services/unitService";

const Icon = {
  Building: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18z"/><path d="M6 12H4a2 2 0 00-2 2v6a2 2 0 002 2h2"/><path d="M18 9h2a2 2 0 012 2v9a2 2 0 01-2 2h-2"/></svg>,
  Plus: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Search: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  MoreVert: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>,
  Edit: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>,
  ChevronDown: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  Layers: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  AlertCircle: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
};

const STATUS_COLORS = {
  vacant: { bg: "#ECFDF5", text: "#059669" },
  reserved: { bg: "#FFFBEB", text: "#D97706" },
  occupied: { bg: "#DBEAFE", text: "#2563EB" },
  maintenance: { bg: "#FEF2F2", text: "#E8344E" },
  inactive: { bg: "#F3F4F6", text: "#6B7280" },
};

export default function UnitsPage() {
  const { user } = useAuth();
  const [view, setView] = useState<'buildings' | 'rooms'>('buildings');
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [rooms, setRooms] = useState<RoomWithDetails[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [buildingStats, setBuildingStats] = useState<Record<string, BuildingStats>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Building | RoomWithDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadData();
  }, [view, page, searchTerm, statusFilter, selectedBuilding]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (view === 'buildings') {
        const { buildings: data, total: totalCount } = await getBuildings({
          page,
          pageSize: 20,
          search: searchTerm || undefined,
          owner_id: user?.id,
        });
        setBuildings(data);
        setTotal(totalCount);
        
        // Load stats for each building
        const statsPromises = data.map(b => getBuildingStats(b.id));
        const statsArray = await Promise.all(statsPromises);
        const statsMap: Record<string, BuildingStats> = {};
        data.forEach((b, i) => {
          statsMap[b.id] = statsArray[i];
        });
        setBuildingStats(statsMap);
      } else {
        const { rooms: data, total: totalCount } = await getRooms({
          page,
          pageSize: 20,
          building_id: selectedBuilding || undefined,
          status: statusFilter !== 'all' ? statusFilter as any : undefined,
          search: searchTerm || undefined,
        });
        setRooms(data);
        setTotal(totalCount);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBuilding = async (formData: BuildingFormData) => {
    if (!user?.id) return;
    try {
      await createBuilding(formData, user.id);
      setShowAddModal(false);
      loadData();
    } catch (error) {
      console.error('Error creating building:', error);
    }
  };

  const handleAddRoom = async (formData: RoomFormData) => {
    try {
      await createRoom(formData);
      setShowAddModal(false);
      loadData();
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  const handleEdit = async (formData: Partial<BuildingFormData | RoomFormData>) => {
    if (!editingItem) return;
    try {
      if (view === 'buildings') {
        await updateBuilding(editingItem.id, formData as BuildingFormData);
      } else {
        await updateRoom(editingItem.id, formData as RoomFormData);
      }
      setShowEditModal(false);
      setEditingItem(null);
      loadData();
    } catch (error) {
      console.error('Error updating:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      if (view === 'buildings') {
        await deleteBuilding(id);
      } else {
        await deleteRoom(id);
      }
      loadData();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateRoomStatus(id, newStatus as any);
      loadData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div style={{ padding: "28px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#111827", marginBottom: "4px" }}>
            {view === 'buildings' ? 'Buildings' : 'Rooms'}
          </h1>
          <p style={{ fontSize: "14px", color: "#6B7280" }}>
            {view === 'buildings' ? 'Manage your property buildings' : 'Manage individual units'}
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => setView(view === 'buildings' ? 'rooms' : 'buildings')}
            style={{
              padding: "10px 16px",
              border: "1px solid #E5E7EB",
              background: "white",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 500,
              color: "#6B7280",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <Icon.Layers />
            {view === 'buildings' ? 'View Rooms' : 'View Buildings'}
          </button>
          <button
            onClick={() => {
              setEditingItem(null);
              setShowAddModal(true);
            }}
            style={{
              padding: "10px 16px",
              border: "none",
              background: "#E8344E",
              color: "white",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <Icon.Plus />
            Add {view === 'buildings' ? 'Building' : 'Room'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{ 
          padding: "12px 16px", 
          background: "#FEF2F2", 
          border: "1px solid #FECACA", 
          borderRadius: "8px", 
          color: "#DC2626", 
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <Icon.AlertCircle />
          {error}
          <button 
            onClick={() => setError(null)}
            style={{ 
              marginLeft: "auto", 
              background: "none", 
              border: "none", 
              cursor: "pointer", 
              color: "#DC2626",
              fontSize: "16px"
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }}>
            <Icon.Search />
          </div>
          <input
            type="text"
            placeholder={`Search ${view === 'buildings' ? 'buildings' : 'rooms'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px 10px 40px",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none"
            }}
          />
        </div>
        {view === 'rooms' && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "10px 12px",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              fontSize: "14px",
              background: "white",
              outline: "none"
            }}
          >
            <option value="all">All Status</option>
            <option value="vacant">Vacant</option>
            <option value="reserved">Reserved</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
            <option value="inactive">Inactive</option>
          </select>
        )}
        {view === 'rooms' && (
          <select
            value={selectedBuilding || ''}
            onChange={(e) => setSelectedBuilding(e.target.value || null)}
            style={{
              padding: "10px 12px",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              fontSize: "14px",
              background: "white",
              outline: "none"
            }}
          >
            <option value="">All Buildings</option>
            {buildings.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#6B7280" }}>Loading...</div>
      ) : view === 'buildings' && buildings.length === 0 ? (
        <div style={{ 
          textAlign: "center", 
          padding: "60px 20px", 
          background: "white", 
          borderRadius: "12px", 
          border: "1px solid #F1F5F9" 
        }}>
          <div style={{ width: "48px", height: "48px", color: "#9CA3AF", marginBottom: "16px", margin: "0 auto 16px" }}>
            <Icon.Building />
          </div>
          <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#111827", marginBottom: "8px" }}>No Buildings Found</h3>
          <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "24px" }}>
            Get started by adding your first building to manage units.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: "10px 20px",
              border: "none",
              background: "#E8344E",
              color: "white",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <Icon.Plus />
            Add Building
          </button>
        </div>
      ) : view === 'rooms' && rooms.length === 0 ? (
        <div style={{ 
          textAlign: "center", 
          padding: "60px 20px", 
          background: "white", 
          borderRadius: "12px", 
          border: "1px solid #F1F5F9" 
        }}>
          <div style={{ width: "48px", height: "48px", color: "#9CA3AF", marginBottom: "16px", margin: "0 auto 16px" }}>
            <Icon.Layers />
          </div>
          <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#111827", marginBottom: "8px" }}>No Rooms Found</h3>
          <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "24px" }}>
            {buildings.length === 0 
              ? "Add a building first before creating rooms."
              : "Get started by adding your first room."}
          </p>
          {buildings.length > 0 && (
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                padding: "10px 20px",
                border: "none",
                background: "#E8344E",
                color: "white",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <Icon.Plus />
              Add Room
            </button>
          )}
        </div>
      ) : (
        <div style={{ background: "white", borderRadius: "12px", border: "1px solid #F1F5F9", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #F1F5F9", background: "#F8F9FC" }}>
                {view === 'buildings' ? (
                  <>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>Name</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>Address</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>City</th>
                    <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>Units</th>
                    <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>Occupancy</th>
                    <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>Actions</th>
                  </>
                ) : (
                  <>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>Room Number</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>Building</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>Floor</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>Type</th>
                    <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>Status</th>
                    <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>Actions</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {view === 'buildings' ? (
                buildings.map((building) => (
                  <tr key={building.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: "16px", fontSize: "14px", fontWeight: 500, color: "#111827" }}>
                      {building.name}
                    </td>
                    <td style={{ padding: "16px", fontSize: "14px", color: "#6B7280" }}>
                      {building.address_line1}
                    </td>
                    <td style={{ padding: "16px", fontSize: "14px", color: "#6B7280" }}>
                      {building.city}
                    </td>
                    <td style={{ padding: "16px", textAlign: "center", fontSize: "14px", color: "#6B7280" }}>
                      {buildingStats[building.id]?.total_units || 0}
                    </td>
                    <td style={{ padding: "16px", textAlign: "center", fontSize: "14px", color: "#6B7280" }}>
                      {buildingStats[building.id]?.occupancy_rate.toFixed(1) || 0}%
                    </td>
                    <td style={{ padding: "16px", textAlign: "right" }}>
                      <button
                        onClick={() => {
                          setEditingItem(building);
                          setShowEditModal(true);
                        }}
                        style={{ padding: "6px", border: "none", background: "none", cursor: "pointer", color: "#6B7280", marginRight: "8px" }}
                        title="Edit"
                      >
                        <Icon.Edit />
                      </button>
                      <button
                        onClick={() => handleDelete(building.id)}
                        style={{ padding: "6px", border: "none", background: "none", cursor: "pointer", color: "#E8344E" }}
                        title="Delete"
                      >
                        <Icon.Trash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                rooms.map((room) => (
                  <tr key={room.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: "16px", fontSize: "14px", fontWeight: 500, color: "#111827" }}>
                      {room.room_number}
                    </td>
                    <td style={{ padding: "16px", fontSize: "14px", color: "#6B7280" }}>
                      {room.building_name || '-'}
                    </td>
                    <td style={{ padding: "16px", fontSize: "14px", color: "#6B7280" }}>
                      {room.floor || '-'}
                    </td>
                    <td style={{ padding: "16px", fontSize: "14px", color: "#6B7280" }}>
                      {room.room_type_name || '-'}
                    </td>
                    <td style={{ padding: "16px", textAlign: "center" }}>
                      <select
                        value={room.status}
                        onChange={(e) => handleStatusChange(room.id, e.target.value)}
                        style={{
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: 600,
                          border: "none",
                          background: STATUS_COLORS[room.status as keyof typeof STATUS_COLORS]?.bg || "#F3F4F6",
                          color: STATUS_COLORS[room.status as keyof typeof STATUS_COLORS]?.text || "#6B7280",
                          cursor: "pointer"
                        }}
                      >
                        <option value="vacant">Vacant</option>
                        <option value="reserved">Reserved</option>
                        <option value="occupied">Occupied</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </td>
                    <td style={{ padding: "16px", textAlign: "right" }}>
                      <button
                        onClick={() => {
                          setEditingItem(room);
                          setShowEditModal(true);
                        }}
                        style={{ padding: "6px", border: "none", background: "none", cursor: "pointer", color: "#6B7280", marginRight: "8px" }}
                        title="Edit"
                      >
                        <Icon.Edit />
                      </button>
                      <button
                        onClick={() => handleDelete(room.id)}
                        style={{ padding: "6px", border: "none", background: "none", cursor: "pointer", color: "#E8344E" }}
                        title="Delete"
                      >
                        <Icon.Trash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          {total === 0 && (
            <div style={{ textAlign: "center", padding: "40px", color: "#6B7280" }}>
              No {view === 'buildings' ? 'buildings' : 'rooms'} found
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "20px" }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              padding: "8px 16px",
              border: "1px solid #E5E7EB",
              background: "white",
              borderRadius: "6px",
              fontSize: "14px",
              cursor: page === 1 ? "not-allowed" : "pointer",
              opacity: page === 1 ? 0.5 : 1
            }}
          >
            Previous
          </button>
          <span style={{ padding: "8px 16px", fontSize: "14px", color: "#6B7280" }}>
            Page {page} of {Math.ceil(total / 20)}
          </span>
          <button
            onClick={() => setPage(p => Math.min(Math.ceil(total / 20), p + 1))}
            disabled={page >= Math.ceil(total / 20)}
            style={{
              padding: "8px 16px",
              border: "1px solid #E5E7EB",
              background: "white",
              borderRadius: "6px",
              fontSize: "14px",
              cursor: page >= Math.ceil(total / 20) ? "not-allowed" : "pointer",
              opacity: page >= Math.ceil(total / 20) ? 0.5 : 1
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div
          onClick={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            setEditingItem(null);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "24px",
              width: "500px",
              maxHeight: "90vh",
              overflowY: "auto"
            }}
          >
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "20px" }}>
              {showEditModal ? `Edit ${view === 'buildings' ? 'Building' : 'Room'}` : `Add ${view === 'buildings' ? 'Building' : 'Room'}`}
            </h2>
            
            <UnitForm
              view={view}
              initialData={editingItem}
              buildings={buildings}
              onSubmit={showEditModal ? handleEdit : (view === 'buildings' ? handleAddBuilding : handleAddRoom)}
              onCancel={() => {
                setShowAddModal(false);
                setShowEditModal(false);
                setEditingItem(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function UnitForm({ 
  view, 
  initialData, 
  buildings, 
  onSubmit, 
  onCancel 
}: { 
  view: 'buildings' | 'rooms';
  initialData: Building | RoomWithDetails | null;
  buildings: Building[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<BuildingFormData | RoomFormData>(() => {
    if (view === 'buildings') {
      return initialData ? {
        name: (initialData as Building).name,
        description: (initialData as Building).description,
        address_line1: (initialData as Building).address_line1,
        address_line2: (initialData as Building).address_line2,
        city: (initialData as Building).city,
        state: (initialData as Building).state,
        postal_code: (initialData as Building).postal_code,
        country: (initialData as Building).country,
        latitude: (initialData as Building).latitude,
        longitude: (initialData as Building).longitude,
      } : {
        name: '',
        description: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        latitude: undefined,
        longitude: undefined,
      };
    } else {
      return initialData ? {
        building_id: (initialData as RoomWithDetails).building_id,
        room_type_id: (initialData as RoomWithDetails).room_type_id,
        room_number: (initialData as RoomWithDetails).room_number,
        floor: (initialData as RoomWithDetails).floor,
        status: (initialData as RoomWithDetails).status,
        square_feet: (initialData as RoomWithDetails).square_feet,
      } : {
        building_id: '',
        room_type_id: undefined,
        room_number: '',
        floor: undefined,
        status: 'vacant',
        square_feet: undefined,
      };
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {view === 'buildings' ? (
        <>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              Building Name *
            </label>
            <input
              type="text"
              value={(formData as BuildingFormData).name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "14px", outline: "none" }}
            />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              Description
            </label>
            <textarea
              value={(formData as BuildingFormData).description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "14px", outline: "none", resize: "vertical" }}
            />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              Address Line 1 *
            </label>
            <input
              type="text"
              value={(formData as BuildingFormData).address_line1}
              onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
              required
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "14px", outline: "none" }}
            />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              Address Line 2
            </label>
            <input
              type="text"
              value={(formData as BuildingFormData).address_line2 || ''}
              onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "14px", outline: "none" }}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                City *
              </label>
              <input
                type="text"
                value={(formData as BuildingFormData).city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "14px", outline: "none" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                State
              </label>
              <input
                type="text"
                value={(formData as BuildingFormData).state || ''}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "14px", outline: "none" }}
              />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                Postal Code
              </label>
              <input
                type="text"
                value={(formData as BuildingFormData).postal_code || ''}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "14px", outline: "none" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                Country *
              </label>
              <input
                type="text"
                value={(formData as BuildingFormData).country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                required
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "14px", outline: "none" }}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              Building *
            </label>
            <select
              value={(formData as RoomFormData).building_id}
              onChange={(e) => setFormData({ ...formData, building_id: e.target.value })}
              required
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "14px", outline: "none", background: "white" }}
            >
              <option value="">Select Building</option>
              {buildings.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              Room Number *
            </label>
            <input
              type="text"
              value={(formData as RoomFormData).room_number}
              onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
              required
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "14px", outline: "none" }}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                Floor
              </label>
              <input
                type="number"
                value={(formData as RoomFormData).floor || ''}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value ? parseInt(e.target.value) : undefined })}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "14px", outline: "none" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                Square Feet
              </label>
              <input
                type="number"
                value={(formData as RoomFormData).square_feet || ''}
                onChange={(e) => setFormData({ ...formData, square_feet: e.target.value ? parseInt(e.target.value) : undefined })}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "14px", outline: "none" }}
              />
            </div>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              Status *
            </label>
            <select
              value={(formData as RoomFormData).status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              required
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "14px", outline: "none", background: "white" }}
            >
              <option value="vacant">Vacant</option>
              <option value="reserved">Reserved</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </>
      )}
      
      <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            flex: 1,
            padding: "12px 24px",
            border: "1px solid #E5E7EB",
            background: "white",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            color: "#6B7280"
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          style={{
            flex: 1,
            padding: "12px 24px",
            border: "none",
            background: "#E8344E",
            color: "white",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          {initialData ? 'Save Changes' : 'Create'}
        </button>
      </div>
    </form>
  );
}
