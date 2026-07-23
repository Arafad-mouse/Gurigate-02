"use client";

import { useState } from "react";
import { MoreVertical, Home, Bed, Square } from "lucide-react";
import type { Property } from "@/types/property";

interface PropertyTableProps {
  properties: Property[];
  onRowClick: (property: Property) => void;
  selectedProperties: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  darkMode?: boolean;
}

export function PropertyTable({ 
  properties, 
  onRowClick, 
  selectedProperties, 
  onSelectionChange,
  darkMode = false 
}: PropertyTableProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(properties.map(p => p.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (propertyId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedProperties, propertyId]);
    } else {
      onSelectionChange(selectedProperties.filter(id => id !== propertyId));
    }
  };

  const isAllSelected = properties.length > 0 && selectedProperties.length === properties.length;
  const isIndeterminate = selectedProperties.length > 0 && selectedProperties.length < properties.length;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { bg: '#dcfce7', text: '#15803d', label: 'Available' },
      occupied: { bg: '#fef3c7', text: '#d97706', label: 'Occupied' },
      maintenance: { bg: '#fee2e2', text: '#dc2626', label: 'Maintenance' },
      pending: { bg: '#f3f4f6', text: '#6b7280', label: 'Pending' },
      inactive: { bg: '#e5e7eb', text: '#374151', label: 'Inactive' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span
        style={{
          background: config.bg,
          color: config.text,
          padding: "4px 10px",
          borderRadius: 12,
          fontSize: 11,
          fontWeight: 600,
          textTransform: "capitalize"
        }}
      >
        {config.label}
      </span>
    );
  };

  const formatPrice = (property: Property) => {
    const currency = property.pricing.currency === 'USD' ? '$' : property.pricing.currency;
    const price = property.pricing.base_price.toLocaleString();
    const type = property.pricing.pricing_type === 'sale' ? '' : 
                   property.pricing.pricing_type === 'monthly' ? '/mo' : '/night';
    
    return `${currency}${price}${type}`;
  };

  const formatAddress = (property: Property) => {
    return `${property.address.city}, ${property.address.country}`;
  };

  return (
    <div style={{
      background: darkMode ? "#1E293B" : "white",
      borderRadius: 12,
      border: `1px solid ${darkMode ? "#334155" : "#F1F5F9"}`,
      overflow: "hidden"
    }}>
      {/* Table Header */}
      <div style={{
        padding: "16px 20px",
        borderBottom: `1px solid ${darkMode ? "#334155" : "#F1F5F9"}`,
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap"
      }}>
        {/* Select All Checkbox */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={isAllSelected}
            ref={(input) => {
              if (input) input.indeterminate = isIndeterminate;
            }}
            onChange={(e) => handleSelectAll(e.target.checked)}
            style={{
              width: 16,
              height: 16,
              cursor: "pointer"
            }}
          />
          <span style={{ 
            fontSize: 13, 
            fontWeight: 500,
            color: darkMode ? "#E2E8F0" : "#111827"
          }}>
            Select All
          </span>
        </div>

        <div style={{ flex: 1 }} />

        {/* Results Count */}
        <span style={{ 
          fontSize: 12, 
          color: darkMode ? "#94A3B8" : "#6B7280" 
        }}>
          {properties.length} properties
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ 
          width: "100%", 
          minWidth: 920,
          borderCollapse: "collapse",
          fontSize: 13
        }}>
          <thead>
            <tr style={{ 
              borderBottom: `1.5px solid ${darkMode ? "#334155" : "#F1F5F9"}` 
            }}>
              <th style={{ 
                padding: "14px 16px", 
                textAlign: "left", 
                fontWeight: 600, 
                fontSize: 12,
                color: darkMode ? "#94A3B8" : "#6B7280",
                width: 40
              }}>
                {/* Checkbox column header */}
              </th>
              <th style={{ 
                padding: "14px 16px", 
                textAlign: "left", 
                fontWeight: 600, 
                fontSize: 12,
                color: darkMode ? "#94A3B8" : "#6B7280",
                whiteSpace: "nowrap"
              }}>
                Property
              </th>
              <th style={{ 
                padding: "14px 16px", 
                textAlign: "left", 
                fontWeight: 600, 
                fontSize: 12,
                color: darkMode ? "#94A3B8" : "#6B7280",
                whiteSpace: "nowrap"
              }}>
                Type
              </th>
              <th style={{ 
                padding: "14px 16px", 
                textAlign: "left", 
                fontWeight: 600, 
                fontSize: 12,
                color: darkMode ? "#94A3B8" : "#6B7280",
                whiteSpace: "nowrap"
              }}>
                Size
              </th>
              <th style={{ 
                padding: "14px 16px", 
                textAlign: "left", 
                fontWeight: 600, 
                fontSize: 12,
                color: darkMode ? "#94A3B8" : "#6B7280",
                whiteSpace: "nowrap"
              }}>
                Rent/Sale
              </th>
              <th style={{ 
                padding: "14px 16px", 
                textAlign: "left", 
                fontWeight: 600, 
                fontSize: 12,
                color: darkMode ? "#94A3B8" : "#6B7280",
                whiteSpace: "nowrap"
              }}>
                Bedrooms
              </th>
              <th style={{ 
                padding: "14px 16px", 
                textAlign: "left", 
                fontWeight: 600, 
                fontSize: 12,
                color: darkMode ? "#94A3B8" : "#6B7280",
                whiteSpace: "nowrap"
              }}>
                Location
              </th>
              <th style={{ 
                padding: "14px 16px", 
                textAlign: "left", 
                fontWeight: 600, 
                fontSize: 12,
                color: darkMode ? "#94A3B8" : "#6B7280",
                whiteSpace: "nowrap"
              }}>
                Price
              </th>
              <th style={{ 
                padding: "14px 16px", 
                textAlign: "center", 
                fontWeight: 600, 
                fontSize: 12,
                color: darkMode ? "#94A3B8" : "#6B7280",
                width: 40
              }}>
                {/* Actions column header */}
              </th>
            </tr>
          </thead>
          <tbody>
            {properties.map((property) => (
              <tr
                key={property.id}
                style={{
                  borderBottom: `1px solid ${darkMode ? "#334155" : "#F1F5F9"}`,
                  cursor: "pointer",
                  transition: "background-color 0.15s",
                  backgroundColor: hoveredRow === property.id 
                    ? (darkMode ? "rgba(232,52,78,0.05)" : "rgba(232,52,78,0.025)")
                    : "transparent"
                }}
                onMouseEnter={() => setHoveredRow(property.id)}
                onMouseLeave={() => setHoveredRow(null)}
                onClick={() => onRowClick(property)}
              >
                {/* Checkbox */}
                <td style={{ 
                  padding: "16px",
                  verticalAlign: "middle"
                }}>
                  <input
                    type="checkbox"
                    checked={selectedProperties.includes(property.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSelectRow(property.id, e.target.checked);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      width: 16,
                      height: 16,
                      cursor: "pointer"
                    }}
                  />
                </td>

                {/* Property Image & Name */}
                <td style={{ 
                  padding: "16px",
                  verticalAlign: "middle"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {/* Property Image */}
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          objectFit: "cover",
                          backgroundColor: darkMode ? "#334155" : "#F1F5F9"
                        }}
                      />
                    ) : (
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        background: darkMode ? "#334155" : "#F1F5F9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <Home size={20} style={{ color: darkMode ? "#94A3B8" : "#6B7280" }} />
                      </div>
                    )}
                    
                    {/* Property Name */}
                    <div>
                      <div style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: darkMode ? "#E2E8F0" : "#111827",
                        marginBottom: 2
                      }}>
                        {property.title}
                      </div>
                      <div style={{
                        fontSize: 11,
                        color: darkMode ? "#94A3B8" : "#6B7280"
                      }}>
                        ID: #{property.id.slice(-6)}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Property Type */}
                <td style={{ 
                  padding: "16px",
                  verticalAlign: "middle",
                  whiteSpace: "nowrap"
                }}>
                  <span style={{
                    fontSize: 12,
                    color: darkMode ? "#E2E8F0" : "#111827",
                    textTransform: "capitalize"
                  }}>
                    {property.type}
                  </span>
                </td>

                {/* Size */}
                <td style={{ 
                  padding: "16px",
                  verticalAlign: "middle",
                  whiteSpace: "nowrap"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Square size={14} style={{ color: darkMode ? "#94A3B8" : "#6B7280" }} />
                    <span style={{
                      fontSize: 12,
                      color: darkMode ? "#E2E8F0" : "#111827"
                    }}>
                      {property.features.square_feet || 'N/A'} sq ft
                    </span>
                  </div>
                </td>

                {/* Rent/Sale */}
                <td style={{ 
                  padding: "16px",
                  verticalAlign: "middle",
                  whiteSpace: "nowrap"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {getStatusBadge(property.status)}
                  </div>
                </td>

                {/* Bedrooms */}
                <td style={{ 
                  padding: "16px",
                  verticalAlign: "middle",
                  whiteSpace: "nowrap"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Bed size={14} style={{ color: darkMode ? "#94A3B8" : "#6B7280" }} />
                    <span style={{
                      fontSize: 12,
                      color: darkMode ? "#E2E8F0" : "#111827"
                    }}>
                      {property.features.bedrooms} bed{property.features.bedrooms !== 1 ? 's' : ''}
                    </span>
                  </div>
                </td>

                {/* Location */}
                <td style={{ 
                  padding: "16px",
                  verticalAlign: "middle",
                  whiteSpace: "nowrap"
                }}>
                  <span style={{
                    fontSize: 12,
                    color: darkMode ? "#E2E8F0" : "#111827"
                  }}>
                    {formatAddress(property)}
                  </span>
                </td>

                {/* Price */}
                <td style={{ 
                  padding: "16px",
                  verticalAlign: "middle",
                  whiteSpace: "nowrap"
                }}>
                  <span style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: darkMode ? "#E2E8F0" : "#111827"
                  }}>
                    {formatPrice(property)}
                  </span>
                </td>

                {/* Actions */}
                <td style={{ 
                  padding: "16px",
                  verticalAlign: "middle",
                  textAlign: "center"
                }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Action menu logic can be added here
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 4,
                      borderRadius: 4,
                      color: darkMode ? "#94A3B8" : "#6B7280",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {properties.length === 0 && (
        <div style={{
          padding: "60px 20px",
          textAlign: "center",
          color: darkMode ? "#94A3B8" : "#6B7280"
        }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: darkMode ? "#334155" : "#F1F5F9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px"
          }}>
            <Home size={32} style={{ color: darkMode ? "#94A3B8" : "#6B7280" }} />
          </div>
          <h3 style={{
            fontSize: 18,
            fontWeight: 600,
            margin: "16px 0 8px",
            color: darkMode ? "#E2E8F0" : "#111827"
          }}>
            No Properties Found
          </h3>
          <p style={{
            fontSize: 14,
            margin: 0,
            color: darkMode ? "#94A3B8" : "#6B7280"
          }}>
            Start by adding your first property to see it here.
          </p>
        </div>
      )}
    </div>
  );
}
