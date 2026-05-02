"use client";

import { Building, TrendingUp, TrendingDown, Package, Home, DollarSign } from "lucide-react";

interface StatCard {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
}

interface PropertySummaryCardsProps {
  properties: any[];
  darkMode?: boolean;
}

export function PropertySummaryCards({ properties, darkMode = false }: PropertySummaryCardsProps) {
  // Calculate statistics from properties data
  const calculateStats = (): StatCard[] => {
    const totalProperties = properties.length;
    const forSale = properties.filter(p => p.pricing?.pricing_type === 'sale').length;
    const forRent = properties.filter(p => p.pricing?.pricing_type === 'monthly' || p.pricing?.pricing_type === 'nightly').length;
    
    // Calculate total revenue (sum of all property values)
    const totalRevenue = properties.reduce((sum, p) => {
      const price = p.pricing?.base_price || 0;
      return sum + price;
    }, 0);

    return [
      {
        label: "Total Properties",
        value: totalProperties.toLocaleString(),
        change: "+12%",
        isPositive: true,
        icon: <Building size={20} />
      },
      {
        label: "For Sale",
        value: forSale.toLocaleString(),
        change: "+8%",
        isPositive: true,
        icon: <Home size={20} />
      },
      {
        label: "For Rent",
        value: forRent.toLocaleString(),
        change: "-3%",
        isPositive: false,
        icon: <Package size={20} />
      },
      {
        label: "Total Value",
        value: `$${totalRevenue.toLocaleString()}`,
        change: "+15%",
        isPositive: true,
        icon: <DollarSign size={20} />
      }
    ];
  };

  const stats = calculateStats();

  return (
    <div style={{ 
      display: "grid", 
      gridTemplateColumns: "repeat(4, 1fr)", 
      gap: 16,
      marginBottom: 32
    }}>
      {stats.map((stat, index) => (
        <div
          key={index}
          style={{
            background: darkMode ? "#1E293B" : "white",
            border: `1px solid ${darkMode ? "#334155" : "#F1F5F9"}`,
            borderRadius: 12,
            padding: "20px",
            transition: "all 0.2s ease",
            cursor: "pointer"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = darkMode 
              ? "0 8px 25px rgba(0,0,0,0.3)" 
              : "0 8px 25px rgba(0,0,0,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {/* Header */}
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between", 
            marginBottom: 12 
          }}>
            <div style={{
              width: 40,
              height: 40,
              background: stat.isPositive ? "#FEF2F2" : "#F0F9FF",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: stat.isPositive ? "#E8344E" : "#3B82F6"
            }}>
              {stat.icon}
            </div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "4px 8px",
              borderRadius: 6,
              background: stat.isPositive ? "#FEF2F2" : "#F0F9FF"
            }}>
              {stat.isPositive ? (
                <TrendingUp size={14} style={{ color: "#E8344E" }} />
              ) : (
                <TrendingDown size={14} style={{ color: "#3B82F6" }} />
              )}
              <span style={{
                fontSize: 12,
                fontWeight: 600,
                color: stat.isPositive ? "#E8344E" : "#3B82F6"
              }}>
                {stat.change}
              </span>
            </div>
          </div>

          {/* Content */}
          <div>
            <div style={{
              fontSize: 12,
              color: darkMode ? "#94A3B8" : "#6B7280",
              marginBottom: 4,
              fontWeight: 500
            }}>
              {stat.label}
            </div>
            <div style={{
              fontSize: 24,
              fontWeight: 700,
              color: darkMode ? "#E2E8F0" : "#111827",
              lineHeight: 1.2
            }}>
              {stat.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
