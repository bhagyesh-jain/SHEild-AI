import React from "react";
import { Home, AlertTriangle, MapPin, Users, Settings } from "lucide-react";

interface LineSidebarProps {
  activeRoute: string;
  onNavigate: (route: string) => void;
}

export const LineSidebar: React.FC<LineSidebarProps> = ({ activeRoute, onNavigate }) => {
  const items = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "incidents", label: "Incidents", icon: AlertTriangle },
    { id: "journeys", label: "Journeys", icon: MapPin },
    { id: "contacts", label: "Contacts", icon: Users },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  return (
    <aside aria-label="Sidebar navigation" style={{
      width: "240px",
      minHeight: "calc(100vh - 70px)",
      backgroundColor: "var(--color-surface)",
      borderRight: "1px solid var(--color-border)",
      padding: "24px 16px",
      display: "flex",
      flexDirection: "column",
      gap: "8px"
    }}>
      <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", padding: "0 12px 8px" }}>
        Navigation
      </div>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeRoute === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="focus-ring"
            aria-current={isActive ? "page" : undefined}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 14px",
              borderRadius: "var(--radius-sm)",
              color: isActive ? "var(--color-primary)" : "var(--color-text-secondary)",
              fontWeight: isActive ? 600 : 400,
              fontSize: "14px",
              textAlign: "left",
              backgroundColor: isActive ? "var(--color-primary-container)" : "transparent",
              transition: "all 0.15s ease"
            }}
          >
            {/* Active Teal Line Indicator */}
            {isActive && (
              <div style={{
                position: "absolute",
                left: 0,
                top: "20%",
                bottom: "20%",
                width: "4px",
                borderRadius: "2px",
                backgroundColor: "var(--color-primary)"
              }} />
            )}
            <Icon style={{ width: "18px", height: "18px", flexShrink: 0 }} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </aside>
  );
};
