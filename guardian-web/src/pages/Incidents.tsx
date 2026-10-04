import React from "react";
import { AnimatedList } from "../components/ui/AnimatedList";
import { Incident } from "../services/api";
import { AlertTriangle, CheckCircle, Clock, MapPin } from "lucide-react";

interface IncidentsProps {
  incidents: Incident[];
  onNavigate: (route: string, id?: string) => void;
  onAcknowledge: (id: string) => void;
}

export const Incidents: React.FC<IncidentsProps> = ({ incidents, onNavigate, onAcknowledge }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h2 style={{ fontSize: "24px", fontWeight: 700 }}>Emergency Incidents Log</h2>
        <p style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
          Real-time record of all triggered SOS alerts and missed journey check-ins.
        </p>
      </div>

      <AnimatedList
        items={incidents}
        keyExtractor={(item) => item.id}
        emptyState={
          <div style={{ padding: "40px", textAlign: "center", backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
            <CheckCircle style={{ color: "var(--color-success)", width: "40px", height: "40px", margin: "0 auto 12px" }} />
            <h3 style={{ fontSize: "18px", fontWeight: 700 }}>No Incidents Recorded</h3>
            <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>All protected users are safe.</p>
          </div>
        }
        renderItem={(item) => {
          const isEmergency = item.status === "active";
          return (
            <div
              style={{
                backgroundColor: "var(--color-surface)",
                borderRadius: "var(--radius-md)",
                border: `1px solid ${isEmergency ? "var(--color-danger)" : "var(--color-border)"}`,
                padding: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{
                  padding: "12px",
                  borderRadius: "12px",
                  backgroundColor: isEmergency ? "var(--color-danger-container)" : "var(--color-surface-variant)"
                }}>
                  <AlertTriangle style={{ color: isEmergency ? "var(--color-danger)" : "var(--color-text-muted)", width: "24px", height: "24px" }} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "16px", fontWeight: 700 }}>
                      {item.user_name || "User"} — {item.trigger.toUpperCase()} SOS
                    </span>
                    <span style={{
                      padding: "2px 8px",
                      borderRadius: "var(--radius-full)",
                      fontSize: "11px",
                      fontWeight: 700,
                      backgroundColor: isEmergency ? "var(--color-danger)" : item.status === "acknowledged" ? "var(--color-warning-container)" : "var(--color-success-container)",
                      color: isEmergency ? "#fff" : item.status === "acknowledged" ? "var(--color-warning)" : "var(--color-success)"
                    }}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "16px", fontSize: "13px", color: "var(--color-text-secondary)", marginTop: "6px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock style={{ width: "14px", height: "14px" }} />
                      {new Date(item.started_at).toLocaleString()}
                    </span>
                    {item.location && (
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <MapPin style={{ width: "14px", height: "14px" }} />
                        {item.location.latitude.toFixed(4)}, {item.location.longitude.toFixed(4)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                {item.status === "active" && (
                  <button
                    onClick={() => onAcknowledge(item.id)}
                    className="focus-ring"
                    style={{
                      padding: "8px 16px",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "var(--color-danger)",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: "13px"
                    }}
                  >
                    Acknowledge
                  </button>
                )}
                <button
                  onClick={() => onNavigate("incident-detail", item.id)}
                  className="focus-ring"
                  style={{
                    padding: "8px 14px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text-primary)",
                    fontSize: "13px",
                    fontWeight: 500
                  }}
                >
                  Details →
                </button>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
};
