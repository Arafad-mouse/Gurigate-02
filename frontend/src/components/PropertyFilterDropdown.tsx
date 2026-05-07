"use client";

import { useState } from "react";
import { ChevronDown, Calendar } from "lucide-react";

interface PropertyFilterDropdownProps {
  value: string;
  onChange: (value: string) => void;
  darkMode?: boolean;
}

export function PropertyFilterDropdown({ value, onChange, darkMode = false }: PropertyFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const filterOptions = [
    { value: 'today', label: 'Today', description: 'Properties added today' },
    { value: '7days', label: 'Last 7 Days', description: 'Properties added in the last week' },
    { value: '30days', label: 'Last 30 Days', description: 'Properties added in the last month' },
    { value: 'lastmonth', label: 'Last Month', description: 'Properties added last calendar month' },
    { value: '3months', label: 'Last 3 Months', description: 'Properties added in the last quarter' },
    { value: 'all', label: 'All Time', description: 'All properties regardless of date' },
  ];

  const selectedOption = filterOptions.find(option => option.value === value) || filterOptions[0];

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 16px",
          background: darkMode ? "#334155" : "white",
          border: `1.5px solid ${darkMode ? "#475569" : "#E9ECF0"}`,
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 600,
          color: darkMode ? "#E2E8F0" : "#4B5563",
          cursor: "pointer",
          fontFamily: "inherit",
          outline: "none",
          minWidth: 160,
          justifyContent: "space-between"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Calendar size={14} />
          <span>{selectedOption.label}</span>
        </div>
        <ChevronDown 
          size={14} 
          style={{ 
            transition: "transform 0.2s",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)"
          }} 
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 999
            }}
          />
          
          {/* Dropdown */}
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              background: darkMode ? "#1E293B" : "white",
              border: `1px solid ${darkMode ? "#334155" : "#E9ECF0"}`,
              borderRadius: 12,
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
              zIndex: 1000,
              minWidth: 240,
              maxHeight: 300,
              overflowY: "auto"
            }}
          >
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: option.value === value 
                    ? (darkMode ? "#334155" : "#F8FAFC")
                    : "transparent",
                  border: "none",
                  textAlign: "left",
                  fontSize: 13,
                  color: option.value === value
                    ? "#E8344E"
                    : (darkMode ? "#E2E8F0" : "#111827"),
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 2,
                  transition: "background-color 0.15s",
                  borderBottom: `1px solid ${darkMode ? "#334155" : "#F1F5F9"}`
                }}
                onMouseEnter={(e) => {
                  if (option.value !== value) {
                    e.currentTarget.style.background = darkMode ? "#334155" : "#F8FAFC";
                  }
                }}
                onMouseLeave={(e) => {
                  if (option.value !== value) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <div style={{ fontWeight: 500 }}>{option.label}</div>
                <div style={{ 
                  fontSize: 11, 
                  color: darkMode ? "#94A3B8" : "#6B7280",
                  marginTop: 2
                }}>
                  {option.description}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
