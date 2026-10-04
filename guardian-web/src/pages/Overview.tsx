import React from "react";
import { MagicBento } from "../components/dashboard/MagicBento";
import { LatticeLoader } from "../components/ui/LatticeLoader";
import { SloshGauge } from "../components/visualizations/SloshGauge";
import { Radar } from "../components/visualizations/Radar";
import { Incident, Journey, Guardian } from "../services/api";

interface OverviewProps {
  incidents: Incident[];
  journeys: Journey[];
  guardians: Guardian[];
  backendHealthy: boolean;
  onNavigate: (route: string, id?: string) => void;
  onAcknowledge: (id: string) => void;
}

export const Overview: React.FC<OverviewProps> = ({
  incidents,
  journeys,
  guardians,
  backendHealthy,
  onNavigate,
  onAcknowledge
}) => {
  const activeIncidents = incidents.filter(i => i.status === "active" || i.status === "acknowledged");
  const activeJourneys = journeys.filter(j => j.status === "active");
  const acksCount = incidents.reduce((acc, curr) => acc + (curr.acknowledgements?.length || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Active Incident Warning Alert Banner */}
      {activeIncidents.length > 0 && (
        <div style={{
          backgroundColor: "var(--color-danger-container)",
          border: "2px solid var(--color-danger)",
          borderRadius: "var(--radius-lg)",
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          animation: "pulseGlow 2s infinite ease-in-out"
        }}>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-danger)", textTransform: "uppercase" }}>
              🚨 EMERGENCY SOS ACTIVE
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--color-text-primary)", marginTop: "4px" }}>
              {activeIncidents[0].user_name || "User"} triggered SOS via {activeIncidents[0].trigger}
            </h2>
            <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginTop: "4px" }}>
              Started at {new Date(activeIncidents[0].started_at).toLocaleTimeString()} • {activeIncidents[0].location ? `Lat: ${activeIncidents[0].location.latitude}, Lon: ${activeIncidents[0].location.longitude}` : "Location pending"}
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            {activeIncidents[0].status === "active" && (
              <button
                onClick={() => onAcknowledge(activeIncidents[0].id)}
                className="focus-ring"
                style={{
                  padding: "12px 24px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--color-danger)",
                  color: "#ffffff",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                Acknowledge Alert
              </button>
            )}
            <button
              onClick={() => onNavigate("incident-detail", activeIncidents[0].id)}
              className="focus-ring"
              style={{
                padding: "12px 20px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-danger)",
                color: "var(--color-text-primary)",
                fontSize: "14px",
                fontWeight: 600
              }}
            >
              View Full Map & Info
            </button>
          </div>
        </div>
      )}

      {/* Sync Status Bar */}
      <LatticeLoader
        status={backendHealthy ? "success" : "error"}
        label="Connected to SHEild AI FastAPI Gateway & FCM Realtime Sync"
      />

      {/* Bento Grid */}
      <MagicBento
        activeIncidentsCount={activeIncidents.length}
        activeJourneysCount={activeJourneys.length}
        acknowledgementsCount={acksCount}
        guardiansCount={guardians.length}
        backendHealthy={backendHealthy}
        onNavigate={onNavigate}
      />

      {/* Secondary Dashboard Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "20px" }}>
        <div style={{ backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", padding: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>
            Protected User Status Overview
          </h3>
          <SloshGauge value={88} label="User Phone Battery & Connectivity Health" />
        </div>

        <div style={{ backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", padding: "24px", display: "flex", justifyContent: "center" }}>
          <Radar />
        </div>
      </div>
    </div>
  );
};
