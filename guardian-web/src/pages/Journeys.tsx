import React from "react";
import { Journey } from "../services/api";
import { MapPin, Clock, CheckCircle, AlertTriangle } from "lucide-react";

interface JourneysProps {
  journeys: Journey[];
}

export const Journeys: React.FC<JourneysProps> = ({ journeys }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h2 style={{ fontSize: "24px", fontWeight: 700 }}>Safe Journeys Tracking</h2>
        <p style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
          Active and completed journey timers with automated check-in grace period monitoring.
        </p>
      </div>

      {journeys.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
          <MapPin style={{ color: "var(--color-primary)", width: "40px", height: "40px", margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: "18px", fontWeight: 700 }}>No Active Journeys</h3>
          <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>Users have not started any active travel timers.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          {journeys.map((j) => {
            const isActive = j.status === "active";
            return (
              <div
                key={j.id}
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderRadius: "var(--radius-md)",
                  border: `1px solid ${isActive ? "var(--color-primary)" : "var(--color-border)"}`,
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "16px", fontWeight: 700 }}>{j.destination_label}</span>
                  <span style={{
                    padding: "2px 8px",
                    borderRadius: "var(--radius-full)",
                    fontSize: "11px",
                    fontWeight: 700,
                    backgroundColor: isActive ? "var(--color-primary-container)" : "var(--color-surface-variant)",
                    color: isActive ? "var(--color-primary)" : "var(--color-text-muted)"
                  }}>
                    {j.status.toUpperCase()}
                  </span>
                </div>

                <div style={{ fontSize: "13px", color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Clock style={{ width: "14px", height: "14px" }} />
                  ETA: {new Date(j.eta_at).toLocaleTimeString()}
                </div>
                <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                  Grace period: {Math.floor(j.grace_seconds / 60)} minutes
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
