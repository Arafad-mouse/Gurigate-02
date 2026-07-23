import React, { useState, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";

export type EntityCardAction = {
  key: string;
  label: string;
  onClick: () => void;
  title?: string;
  danger?: boolean;
};

export interface EntityCardProps {
  avatar?: string | React.ReactNode;
  title: string;
  subtitle?: string;
  meta?: Array<{ label: string; value: React.ReactNode }>;
  badges?: Array<{ label: string; color?: string; bg?: string }>;
  actions?: EntityCardAction[];
  onClick?: () => void;
}

/**
 * Lightweight reusable Admin Entity Card for grid views.
 * Styling matches admin dashboard tokens: white bg, subtle border, rounded, hover elevation.
 */
export const EntityCard: React.FC<EntityCardProps> = ({
  avatar,
  title,
  subtitle,
  meta = [],
  badges = [],
  actions = [],
  onClick,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      onClick={onClick}
      style={{
        background: "white",
        border: "1px solid #F1F5F9",
        borderRadius: 14,
        padding: 14,
        cursor: onClick ? "pointer" : "default",
        transition: "box-shadow .15s, transform .15s",
      }}
      className="hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-[2px]"
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        {typeof avatar === "string" ? (
          <img src={avatar} alt="" style={{ width: 36, height: 36, borderRadius: 10, objectFit: "cover" }} />
        ) : (
          avatar || <div style={{ width: 36, height: 36, borderRadius: 10, background: "#F3F4F6" }} />
        )}
        <div style={{ minWidth: 0 }}> 
          <div style={{ fontWeight: 700, fontSize: 14, color: "#111827", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
          {subtitle ? (
            <div style={{ fontSize: 12, color: "#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{subtitle}</div>
          ) : null}
        </div>
        {badges.length > 0 && (
          <div style={{ marginLeft: "auto", display: "flex", gap: 6, flexWrap: "wrap" }}>
            {badges.map((b, i) => (
              <span
                key={i}
                className="badge"
                style={{
                  background: b.bg ?? "#F3F4F6",
                  color: b.color ?? "#374151",
                  borderRadius: 20,
                  padding: "3px 8px",
                  fontSize: 11,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                {b.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {meta.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
          {meta.map((m, i) => (
            <div key={i} style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 2 }}>{m.label}</div>
              <div style={{ fontSize: 12, color: "#111827", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.value}</div>
            </div>
          ))}
        </div>
      )}

      {actions.length > 0 && (
        <div style={{ marginTop: 12 }} ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            onMouseEnter={() => setShowMenu(true)}
            style={{
              border: "1px solid #E5E7EB",
              background: "#F8F9FC",
              color: "#111827",
              borderRadius: 8,
              padding: "6px 10px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            Actions
            <MoreVertical size={14} />
          </button>

          {showMenu && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "100%",
                marginTop: 4,
                background: "white",
                border: "1px solid #E5E7EB",
                borderRadius: 8,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                zIndex: 50,
                minWidth: 180,
                animation: "fadeIn 0.15s ease-out",
              }}
              onMouseLeave={() => setShowMenu(false)}
            >
              <style>{`
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(-4px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              `}</style>
              {actions.map((a) => (
                <button
                  key={a.key}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    a.onClick();
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    border: "none",
                    background: "none",
                    padding: "8px 12px",
                    fontSize: 13,
                    color: a.danger ? "#E8344E" : "#111827",
                    cursor: "pointer",
                    borderRadius: 4,
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = a.danger ? "#FEF2F2" : "#F3F4F6";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "none";
                  }}
                >
                  {a.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EntityCard;
