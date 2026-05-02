"use client";

import { useState } from "react";
import { X, Edit, Trash2, MapPin, Bed, Bath, Square, Calendar, Home } from "lucide-react";
import type { Property } from "@/types/property";

interface PropertyDetailsDrawerProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (property: Property) => void;
  onDelete: (propertyId: string) => void;
}

export function PropertyDetailsDrawer({ property, isOpen, onClose, onEdit, onDelete }: PropertyDetailsDrawerProps) {
  const [darkMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen || !property) return null;

  const handleDelete = () => {
    onDelete(property.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return { bg: '#dcfce7', text: '#15803d' };
      case 'occupied': return { bg: '#fef3c7', text: '#d97706' };
      case 'maintenance': return { bg: '#fee2e2', text: '#dc2626' };
      case 'pending': return { bg: '#f3f4f6', text: '#6b7280' };
      case 'inactive': return { bg: '#e5e7eb', text: '#374151' };
      default: return { bg: '#f3f4f6', text: '#6b7280' };
    }
  };

  const statusColors = getStatusColor(property.status);

  return (
    <div 
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: 480,
        height: "100vh",
        background: darkMode ? "#1E293B" : "white",
        borderLeft: `1px solid ${darkMode ? "#334155" : "#F1F5F9"}`,
        boxShadow: "-4px 0 20px rgba(0,0,0,0.1)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
      }}
    >
      {/* Header */}
      <div style={{
        padding: "20px 24px",
        borderBottom: `1px solid ${darkMode ? "#334155" : "#F1F5F9"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <h2 style={{ 
          fontSize: 18, 
          fontWeight: 700, 
          margin: 0, 
          color: darkMode ? "#E2E8F0" : "#111827" 
        }}>
          Property Details
        </h2>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: darkMode ? "#94A3B8" : "#6B7280",
            padding: 8,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div style={{ 
        padding: "24px", 
        flex: 1, 
        overflowY: "auto",
        color: darkMode ? "#E2E8F0" : "#111827"
      }}>
        {/* Property Image */}
        {property.images && property.images.length > 0 ? (
          <div style={{ marginBottom: 24 }}>
            <img
              src={property.images[0]}
              alt={property.title}
              style={{
                width: "100%",
                height: 240,
                objectFit: "cover",
                borderRadius: 12,
                backgroundColor: darkMode ? "#334155" : "#F1F5F9"
              }}
            />
          </div>
        ) : (
          <div style={{
            width: "100%",
            height: 240,
            backgroundColor: darkMode ? "#334155" : "#F1F5F9",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24
          }}>
            <Home size={48} style={{ color: darkMode ? "#94A3B8" : "#6B7280" }} />
          </div>
        )}

        {/* Property Title and Status */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <h3 style={{ 
              fontSize: 20, 
              fontWeight: 600, 
              margin: 0,
              flex: 1
            }}>
              {property.title}
            </h3>
            <span style={{
              ...statusColors,
              padding: "6px 12px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 600,
              textTransform: "capitalize"
            }}>
              {property.status}
            </span>
          </div>
          <p style={{ 
            fontSize: 14, 
            color: darkMode ? "#94A3B8" : "#6B7280",
            margin: 0,
            lineHeight: 1.5
          }}>
            {property.description}
          </p>
        </div>

        {/* Property Information Grid */}
        <div style={{ marginBottom: 24 }}>
          <h4 style={{ 
            fontSize: 16, 
            fontWeight: 600, 
            marginBottom: 16,
            color: darkMode ? "#E2E8F0" : "#111827"
          }}>
            Property Information
          </h4>
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "1fr 1fr", 
            gap: 16 
          }}>
            {/* Property Type */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Home size={16} style={{ color: darkMode ? "#94A3B8" : "#6B7280" }} />
              <div>
                <div style={{ fontSize: 12, color: darkMode ? "#94A3B8" : "#6B7280" }}>Type</div>
                <div style={{ fontSize: 14, fontWeight: 500, textTransform: "capitalize" }}>
                  {property.type}
                </div>
              </div>
            </div>

            {/* Bedrooms */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Bed size={16} style={{ color: darkMode ? "#94A3B8" : "#6B7280" }} />
              <div>
                <div style={{ fontSize: 12, color: darkMode ? "#94A3B8" : "#6B7280" }}>Bedrooms</div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>
                  {property.features.bedrooms} {property.features.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}
                </div>
              </div>
            </div>

            {/* Bathrooms */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Bath size={16} style={{ color: darkMode ? "#94A3B8" : "#6B7280" }} />
              <div>
                <div style={{ fontSize: 12, color: darkMode ? "#94A3B8" : "#6B7280" }}>Bathrooms</div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>
                  {property.features.bathrooms} {property.features.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}
                </div>
              </div>
            </div>

            {/* Square Feet */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Square size={16} style={{ color: darkMode ? "#94A3B8" : "#6B7280" }} />
              <div>
                <div style={{ fontSize: 12, color: darkMode ? "#94A3B8" : "#6B7280" }}>Size</div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>
                  {property.features.square_feet || 'N/A'} sq ft
                </div>
              </div>
            </div>

            {/* Max Guests */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ 
                width: 16, 
                height: 16, 
                borderRadius: "50%",
                backgroundColor: darkMode ? "#334155" : "#F1F5F9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 600,
                color: darkMode ? "#94A3B8" : "#6B7280"
              }}>
                {property.features.max_guests}
              </div>
              <div>
                <div style={{ fontSize: 12, color: darkMode ? "#94A3B8" : "#6B7280" }}>Max Guests</div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>
                  {property.features.max_guests} {property.features.max_guests === 1 ? 'Guest' : 'Guests'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Address */}
        <div style={{ marginBottom: 24 }}>
          <h4 style={{ 
            fontSize: 16, 
            fontWeight: 600, 
            marginBottom: 16,
            color: darkMode ? "#E2E8F0" : "#111827"
          }}>
            Address
          </h4>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <MapPin size={16} style={{ color: darkMode ? "#94A3B8" : "#6B7280", marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 14, lineHeight: 1.5 }}>
                {property.address.street}
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.5 }}>
                {property.address.city}, {property.address.state} {property.address.postal_code}
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.5 }}>
                {property.address.country}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div style={{ marginBottom: 24 }}>
          <h4 style={{ 
            fontSize: 16, 
            fontWeight: 600, 
            marginBottom: 16,
            color: darkMode ? "#E2E8F0" : "#111827"
          }}>
            Pricing
          </h4>
          <div style={{
            background: darkMode ? "#334155" : "#F8FAFC",
            padding: 16,
            borderRadius: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <div style={{ fontSize: 12, color: darkMode ? "#94A3B8" : "#6B7280" }}>
                {property.pricing.pricing_type === 'sale' ? 'Sale Price' : 
                 property.pricing.pricing_type === 'monthly' ? 'Monthly Rate' : 'Nightly Rate'}
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: darkMode ? "#E2E8F0" : "#111827" }}>
                {property.pricing.currency === 'USD' ? '$' : property.pricing.currency}
                {property.pricing.base_price.toLocaleString()}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              {property.pricing.security_deposit && (
                <div style={{ fontSize: 12, color: darkMode ? "#94A3B8" : "#6B7280" }}>
                  Deposit: {property.pricing.currency === 'USD' ? '$' : property.pricing.currency}
                  {property.pricing.security_deposit.toLocaleString()}
                </div>
              )}
              {property.pricing.cleaning_fee && (
                <div style={{ fontSize: 12, color: darkMode ? "#94A3B8" : "#6B7280" }}>
                  Cleaning: {property.pricing.currency === 'USD' ? '$' : property.pricing.currency}
                  {property.pricing.cleaning_fee.toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dates */}
        <div style={{ marginBottom: 24 }}>
          <h4 style={{ 
            fontSize: 16, 
            fontWeight: 600, 
            marginBottom: 16,
            color: darkMode ? "#E2E8F0" : "#111827"
          }}>
            Timeline
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Calendar size={16} style={{ color: darkMode ? "#94A3B8" : "#6B7280" }} />
              <div>
                <div style={{ fontSize: 12, color: darkMode ? "#94A3B8" : "#6B7280" }}>Created</div>
                <div style={{ fontSize: 14 }}>
                  {new Date(property.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Calendar size={16} style={{ color: darkMode ? "#94A3B8" : "#6B7280" }} />
              <div>
                <div style={{ fontSize: 12, color: darkMode ? "#94A3B8" : "#6B7280" }}>Last Updated</div>
                <div style={{ fontSize: 14 }}>
                  {new Date(property.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Amenities */}
        {property.features.amenities && property.features.amenities.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ 
              fontSize: 16, 
              fontWeight: 600, 
              marginBottom: 16,
              color: darkMode ? "#E2E8F0" : "#111827"
            }}>
              Amenities
            </h4>
            <div style={{ 
              display: "flex", 
              flexWrap: "wrap", 
              gap: 8 
            }}>
              {property.features.amenities.slice(0, 6).map((amenity, index) => (
                <span
                  key={index}
                  style={{
                    background: darkMode ? "#334155" : "#F1F5F9",
                    color: darkMode ? "#E2E8F0" : "#111827",
                    padding: "6px 12px",
                    borderRadius: 16,
                    fontSize: 12,
                    fontWeight: 500
                  }}
                >
                  {amenity}
                </span>
              ))}
              {property.features.amenities.length > 6 && (
                <span
                  style={{
                    background: darkMode ? "#334155" : "#F1F5F9",
                    color: darkMode ? "#94A3B8" : "#6B7280",
                    padding: "6px 12px",
                    borderRadius: 16,
                    fontSize: 12,
                    fontWeight: 500
                  }}
                >
                  +{property.features.amenities.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{
        padding: "24px",
        borderTop: `1px solid ${darkMode ? "#334155" : "#F1F5F9"}`,
        display: "flex",
        gap: 12
      }}>
        <button
          onClick={() => onEdit(property)}
          style={{
            flex: 1,
            padding: "12px 16px",
            background: "#E8344E",
            color: "white",
            border: "none",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8
          }}
        >
          <Edit size={16} />
          Edit Property
        </button>
        
        <button
          onClick={() => setShowDeleteConfirm(true)}
          style={{
            flex: 1,
            padding: "12px 16px",
            background: darkMode ? "#334155" : "#F1F5F9",
            color: darkMode ? "#E2E8F0" : "#111827",
            border: "none",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8
          }}
        >
          <Trash2 size={16} />
          Delete Property
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(2px)",
            zIndex: 1001,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div style={{
            background: darkMode ? "#1E293B" : "white",
            borderRadius: 16,
            padding: 24,
            maxWidth: 400,
            width: "90%"
          }}>
            <h3 style={{
              fontSize: 18,
              fontWeight: 600,
              margin: "0 0 16px 0",
              color: darkMode ? "#E2E8F0" : "#111827"
            }}>
              Delete Property
            </h3>
            <p style={{
              fontSize: 14,
              color: darkMode ? "#94A3B8" : "#6B7280",
              margin: "0 0 24px 0",
              lineHeight: 1.5
            }}>
              Are you sure you want to delete "{property.title}"? This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  background: darkMode ? "#334155" : "#F1F5F9",
                  color: darkMode ? "#E2E8F0" : "#111827",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  background: "#E8344E",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
