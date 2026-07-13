import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PropertyService } from "@/services/properties";
import { getBuildingStats, getRooms, type BuildingStats, type RoomWithDetails } from "@/services/unitService";
import type { Property } from "@/types/property";

const Icon = {
  ArrowLeft: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  Building: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18z"/><path d="M6 12H4a2 2 0 00-2 2v6a2 2 0 002 2h2"/><path d="M18 9h2a2 2 0 012 2v9a2 2 0 01-2 2h-2"/></svg>,
  Users: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  FileText: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  CreditCard: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  BarChart: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>,
  Settings: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
  Globe: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
  Edit: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  TrendUp: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  TrendDown: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>,
  Calendar: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
};

type TabType = 'overview' | 'units' | 'customers' | 'leases' | 'payments' | 'documents' | 'reports' | 'settings';

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <Icon.Building /> },
  { id: 'units', label: 'Units', icon: <Icon.Building /> },
  { id: 'customers', label: 'Customers', icon: <Icon.Users /> },
  { id: 'leases', label: 'Leases', icon: <Icon.FileText /> },
  { id: 'payments', label: 'Payments', icon: <Icon.CreditCard /> },
  { id: 'documents', label: 'Documents', icon: <Icon.FileText /> },
  { id: 'reports', label: 'Reports', icon: <Icon.BarChart /> },
  { id: 'settings', label: 'Settings', icon: <Icon.Settings /> },
];

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [property, setProperty] = useState<Property | null>(null);
  const [buildingStats, setBuildingStats] = useState<BuildingStats | null>(null);
  const [rooms, setRooms] = useState<RoomWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (id) {
      loadPropertyData();
    }
  }, [id]);

  const loadPropertyData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const propData = await PropertyService.getPropertyById(id);
      setProperty(propData);

      // Load rooms for this property (assuming property has building_id or similar)
      const { rooms: roomsData } = await getRooms({ pageSize: 100 });
      setRooms(roomsData);

      // Load building stats if property has building reference
      // This would need to be adjusted based on actual property-building relationship
    } catch (error) {
      console.error('Error loading property:', error);
      setError(error instanceof Error ? error.message : 'Failed to load property data');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToHomes = async () => {
    if (!id) return;
    setPublishing(true);
    try {
      await PropertyService.publishToHomes(id);
      loadPropertyData();
    } catch (error) {
      console.error('Error publishing to Homes:', error);
      alert('Failed to publish property to Homes');
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublishFromHomes = async () => {
    if (!id) return;
    setPublishing(true);
    try {
      await PropertyService.unpublishFromHomes(id);
      loadPropertyData();
    } catch (error) {
      console.error('Error unpublishing from Homes:', error);
      alert('Failed to unpublish property from Homes');
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "28px", textAlign: "center" }}>
        <div style={{ color: "#6B7280" }}>Loading property details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "28px", textAlign: "center" }}>
        <div style={{ 
          padding: "16px", 
          background: "#FEF2F2", 
          border: "1px solid #FECACA", 
          borderRadius: "8px", 
          color: "#DC2626",
          maxWidth: "500px",
          margin: "0 auto"
        }}>
          {error}
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div style={{ padding: "28px", textAlign: "center" }}>
        <div style={{ color: "#6B7280" }}>Property not found</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "28px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => navigate('/manage-property')}
            style={{
              padding: "8px",
              border: "1px solid #E5E7EB",
              background: "white",
              borderRadius: "8px",
              cursor: "pointer",
              color: "#6B7280"
            }}
            title="Back to Properties"
          >
            <Icon.ArrowLeft />
          </button>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#111827", marginBottom: "4px" }}>
              {property.title}
            </h1>
            <p style={{ fontSize: "14px", color: "#6B7280" }}>
              {property.type} • {property.status}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          {property.published_to_homes ? (
            <button
              onClick={handleUnpublishFromHomes}
              disabled={publishing}
              style={{
                padding: "10px 16px",
                border: "1px solid #E5E7EB",
                background: "white",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: publishing ? "not-allowed" : "pointer",
                color: "#6B7280",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                opacity: publishing ? 0.5 : 1
              }}
            >
              <Icon.Globe />
              Unpublish from Homes
            </button>
          ) : (
            <button
              onClick={handlePublishToHomes}
              disabled={publishing}
              style={{
                padding: "10px 16px",
                border: "none",
                background: "#E8344E",
                color: "white",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: publishing ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                opacity: publishing ? 0.5 : 1
              }}
            >
              <Icon.Globe />
              Publish to Homes
            </button>
          )}
          <button
            style={{
              padding: "10px 16px",
              border: "1px solid #E5E7EB",
              background: "white",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              color: "#6B7280",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <Icon.Edit />
            Edit Property
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: "1px solid #F1F5F9", marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "24px" }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "12px 0",
                border: "none",
                background: "none",
                cursor: "pointer",
                color: activeTab === tab.id ? "#E8344E" : "#6B7280",
                fontSize: "14px",
                fontWeight: activeTab === tab.id ? 600 : 500,
                borderBottom: activeTab === tab.id ? "2px solid #E8344E" : "2px solid transparent",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && <OverviewTab property={property} buildingStats={buildingStats} rooms={rooms} />}
        {activeTab === 'units' && <UnitsTab propertyId={property.id} />}
        {activeTab === 'customers' && <CustomersTab propertyId={property.id} />}
        {activeTab === 'leases' && <LeasesTab propertyId={property.id} />}
        {activeTab === 'payments' && <PaymentsTab propertyId={property.id} />}
        {activeTab === 'documents' && <DocumentsTab propertyId={property.id} />}
        {activeTab === 'reports' && <ReportsTab propertyId={property.id} />}
        {activeTab === 'settings' && <SettingsTab property={property} />}
      </div>
    </div>
  );
}

function OverviewTab({ property, buildingStats, rooms }: { property: Property; buildingStats: BuildingStats | null; rooms: RoomWithDetails[] }) {
  const stats = [
    { label: 'Total Units', value: property.total_units || 0, icon: <Icon.Building />, color: '#E8344E' },
    { label: 'Occupied Units', value: property.occupied_units || 0, icon: <Icon.Users />, color: '#10B981' },
    { label: 'Vacant Units', value: property.vacant_units || 0, icon: <Icon.Building />, color: '#F59E0B' },
    { label: 'Occupancy Rate', value: `${property.occupancy_rate?.toFixed(1) || 0}%`, icon: <Icon.TrendUp />, color: '#3B82F6' },
    { label: 'Monthly Revenue', value: `$${(property.monthly_revenue || 0).toLocaleString()}`, icon: <Icon.CreditCard />, color: '#10B981' },
    { label: 'Outstanding Rent', value: `$${(property.outstanding_rent || 0).toLocaleString()}`, icon: <Icon.TrendDown />, color: '#E8344E' },
  ];

  return (
    <div>
      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "28px" }}>
        {stats.map((stat) => (
          <div key={stat.label} style={{ background: "white", borderRadius: "12px", padding: "20px", border: "1px solid #F1F5F9" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: `${stat.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: stat.color }}>
                {stat.icon}
              </div>
              <span style={{ fontSize: "12px", color: "#6B7280", fontWeight: 500 }}>{stat.label}</span>
            </div>
            <div style={{ fontSize: "24px", fontWeight: 700, color: "#111827" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Property Information */}
      <div style={{ background: "white", borderRadius: "12px", padding: "24px", border: "1px solid #F1F5F9", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", marginBottom: "16px" }}>Property Information</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
          <div>
            <p style={{ fontSize: "12px", color: "#6B7280", marginBottom: "4px" }}>Property Type</p>
            <p style={{ fontSize: "14px", fontWeight: 500, color: "#111827" }}>{property.type}</p>
          </div>
          <div>
            <p style={{ fontSize: "12px", color: "#6B7280", marginBottom: "4px" }}>Status</p>
            <p style={{ fontSize: "14px", fontWeight: 500, color: "#111827" }}>{property.status}</p>
          </div>
          <div>
            <p style={{ fontSize: "12px", color: "#6B7280", marginBottom: "4px" }}>Created</p>
            <p style={{ fontSize: "14px", fontWeight: 500, color: "#111827" }}>{new Date(property.created_at).toLocaleDateString()}</p>
          </div>
          <div>
            <p style={{ fontSize: "12px", color: "#6B7280", marginBottom: "4px" }}>Published to Homes</p>
            <p style={{ fontSize: "14px", fontWeight: 500, color: property.published_to_homes ? "#10B981" : "#6B7280" }}>
              {property.published_to_homes ? 'Yes' : 'No'}
            </p>
          </div>
        </div>
        <div style={{ marginTop: "16px" }}>
          <p style={{ fontSize: "12px", color: "#6B7280", marginBottom: "4px" }}>Description</p>
          <p style={{ fontSize: "14px", color: "#374151", lineHeight: "1.6" }}>{property.description}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ background: "white", borderRadius: "12px", padding: "24px", border: "1px solid #F1F5F9" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", marginBottom: "16px" }}>Recent Activity</h2>
        <div style={{ color: "#6B7280", fontSize: "14px" }}>
          No recent activity to display
        </div>
      </div>
    </div>
  );
}

function UnitsTab({ propertyId }: { propertyId: string }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ width: "48px", height: "48px", color: "#9CA3AF", marginBottom: "16px", margin: "0 auto 16px" }}>
        <Icon.Building />
      </div>
      <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#111827", marginBottom: "8px" }}>Units Management</h3>
      <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "24px" }}>
        Manage units for this property. View, add, and update unit information.
      </p>
      <button
        style={{
          padding: "10px 20px",
          border: "1px solid #E5E7EB",
          background: "white",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: 600,
          cursor: "pointer",
          color: "#6B7280"
        }}
      >
        Go to Units Page
      </button>
    </div>
  );
}

function CustomersTab({ propertyId }: { propertyId: string }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ width: "48px", height: "48px", color: "#9CA3AF", marginBottom: "16px", margin: "0 auto 16px" }}>
        <Icon.Users />
      </div>
      <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#111827", marginBottom: "8px" }}>Customers</h3>
      <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "24px" }}>
        View and manage customers assigned to this property.
      </p>
    </div>
  );
}

function LeasesTab({ propertyId }: { propertyId: string }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ width: "48px", height: "48px", color: "#9CA3AF", marginBottom: "16px", margin: "0 auto 16px" }}>
        <Icon.FileText />
      </div>
      <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#111827", marginBottom: "8px" }}>Leases</h3>
      <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "24px" }}>
        Manage lease agreements for this property.
      </p>
    </div>
  );
}

function PaymentsTab({ propertyId }: { propertyId: string }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ width: "48px", height: "48px", color: "#9CA3AF", marginBottom: "16px", margin: "0 auto 16px" }}>
        <Icon.CreditCard />
      </div>
      <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#111827", marginBottom: "8px" }}>Payments</h3>
      <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "24px" }}>
        Track payments and revenue for this property.
      </p>
    </div>
  );
}

function DocumentsTab({ propertyId }: { propertyId: string }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ width: "48px", height: "48px", color: "#9CA3AF", marginBottom: "16px", margin: "0 auto 16px" }}>
        <Icon.FileText />
      </div>
      <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#111827", marginBottom: "8px" }}>Documents</h3>
      <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "24px" }}>
        Upload and manage property documents.
      </p>
    </div>
  );
}

function ReportsTab({ propertyId }: { propertyId: string }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ width: "48px", height: "48px", color: "#9CA3AF", marginBottom: "16px", margin: "0 auto 16px" }}>
        <Icon.BarChart />
      </div>
      <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#111827", marginBottom: "8px" }}>Reports</h3>
      <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "24px" }}>
        Generate reports for this property.
      </p>
    </div>
  );
}

function SettingsTab({ property }: { property: Property }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ width: "48px", height: "48px", color: "#9CA3AF", marginBottom: "16px", margin: "0 auto 16px" }}>
        <Icon.Settings />
      </div>
      <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#111827", marginBottom: "8px" }}>Property Settings</h3>
      <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "24px" }}>
        Configure property settings and preferences.
      </p>
    </div>
  );
}
