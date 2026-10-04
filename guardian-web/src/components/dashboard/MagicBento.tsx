import React from "react";
import { SpotlightCard } from "../ui/SpotlightCard";
import { CountUp } from "../ui/CountUp";
import { AlertTriangle, MapPin, CheckCircle, Activity, Users, ShieldCheck } from "lucide-react";

interface MagicBentoProps {
  activeIncidentsCount: number;
  activeJourneysCount: number;
  acknowledgementsCount: number;
  guardiansCount: number;
  backendHealthy: boolean;
  onNavigate: (route: string) => void;
}

export const MagicBento: React.FC<MagicBentoProps> = ({
  activeIncidentsCount,
  activeJourneysCount,
  acknowledgementsCount,
  guardiansCount,
  backendHealthy,
  onNavigate
}) => {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
      gap: "20px",
      width: "100%"
    }}>
      {/* Card 1: Active Emergency Alerts */}
      <SpotlightCard style={{ borderLeft: activeIncidentsCount > 0 ? "4px solid var(--color-danger)" : "1px solid var(--color-border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: activeIncidentsCount > 0 ? "var(--color-danger)" : "var(--color-text-muted)", textTransform: "uppercase" }}>
              Emergency Status
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--color-text-primary)", marginTop: "4px" }}>
              Active Incidents
            </h3>
          </div>
          <div style={{ padding: "10px", borderRadius: "12px", backgroundColor: activeIncidentsCount > 0 ? "var(--color-danger-container)" : "var(--color-primary-container)" }}>
            <AlertTriangle style={{ color: activeIncidentsCount > 0 ? "var(--color-danger)" : "var(--color-primary)", width: "24px", height: "24px" }} />
          </div>
        </div>
        <div style={{ fontSize: "36px", fontWeight: 800, color: activeIncidentsCount > 0 ? "var(--color-danger)" : "var(--color-text-primary)", marginBottom: "8px" }}>
          <CountUp to={activeIncidentsCount} />
        </div>
        <div style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "16px" }}>
          {activeIncidentsCount > 0 ? "Requires immediate guardian review" : "All protected users are currently safe"}
        </div>
        <button
          onClick={() => onNavigate("incidents")}
          className="focus-ring"
          style={{
            padding: "8px 14px",
            borderRadius: "var(--radius-sm)",
            backgroundColor: activeIncidentsCount > 0 ? "var(--color-danger)" : "var(--color-primary-container)",
            color: activeIncidentsCount > 0 ? "#ffffff" : "var(--color-primary)",
            fontSize: "13px",
            fontWeight: 600
          }}
        >
          View Incident Queue →
        </button>
      </SpotlightCard>

      {/* Card 2: Tracked Journeys */}
      <SpotlightCard>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
              Safe Journeys
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--color-text-primary)", marginTop: "4px" }}>
              Ongoing Journeys
            </h3>
          </div>
          <div style={{ padding: "10px", borderRadius: "12px", backgroundColor: "var(--color-primary-container)" }}>
            <MapPin style={{ color: "var(--color-primary)", width: "24px", height: "24px" }} />
          </div>
        </div>
        <div style={{ fontSize: "36px", fontWeight: 800, color: "var(--color-text-primary)", marginBottom: "8px" }}>
          <CountUp to={activeJourneysCount} />
        </div>
        <div style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "16px" }}>
          Active journey check-in timers in progress
        </div>
        <button
          onClick={() => onNavigate("journeys")}
          className="focus-ring"
          style={{
            padding: "8px 14px",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "var(--color-primary-container)",
            color: "var(--color-primary)",
            fontSize: "13px",
            fontWeight: 600
          }}
        >
          Inspect Journeys →
        </button>
      </SpotlightCard>

      {/* Card 3: Guardian Acknowledgements */}
      <SpotlightCard>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
              Alert Response
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--color-text-primary)", marginTop: "4px" }}>
              Acknowledgements
            </h3>
          </div>
          <div style={{ padding: "10px", borderRadius: "12px", backgroundColor: "var(--color-success-container)" }}>
            <CheckCircle style={{ color: "var(--color-success)", width: "24px", height: "24px" }} />
          </div>
        </div>
        <div style={{ fontSize: "36px", fontWeight: 800, color: "var(--color-text-primary)", marginBottom: "8px" }}>
          <CountUp to={acknowledgementsCount} />
        </div>
        <div style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "16px" }}>
          Confirmed responses delivered to user app
        </div>
        <span style={{ fontSize: "12px", color: "var(--color-success)", fontWeight: 600 }}>
          ✓ Verified API sync active
        </span>
      </SpotlightCard>

      {/* Card 4: Contact Management */}
      <SpotlightCard>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
              Guardian Network
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--color-text-primary)", marginTop: "4px" }}>
              Trusted Contacts
            </h3>
          </div>
          <div style={{ padding: "10px", borderRadius: "12px", backgroundColor: "var(--color-primary-container)" }}>
            <Users style={{ color: "var(--color-primary)", width: "24px", height: "24px" }} />
          </div>
        </div>
        <div style={{ fontSize: "36px", fontWeight: 800, color: "var(--color-text-primary)", marginBottom: "8px" }}>
          <CountUp to={guardiansCount} />
        </div>
        <div style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "16px" }}>
          Active priority escalations configured
        </div>
        <button
          onClick={() => onNavigate("contacts")}
          className="focus-ring"
          style={{
            padding: "8px 14px",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "var(--color-primary-container)",
            color: "var(--color-primary)",
            fontSize: "13px",
            fontWeight: 600
          }}
        >
          Manage Contacts →
        </button>
      </SpotlightCard>

      {/* Card 5: System Connectivity */}
      <SpotlightCard>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
              System Health
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--color-text-primary)", marginTop: "4px" }}>
              FastAPI & FCM Status
            </h3>
          </div>
          <div style={{ padding: "10px", borderRadius: "12px", backgroundColor: backendHealthy ? "var(--color-success-container)" : "var(--color-danger-container)" }}>
            <ShieldCheck style={{ color: backendHealthy ? "var(--color-success)" : "var(--color-danger)", width: "24px", height: "24px" }} />
          </div>
        </div>
        <div style={{ fontSize: "20px", fontWeight: 700, color: backendHealthy ? "var(--color-success)" : "var(--color-danger)", marginBottom: "8px" }}>
          {backendHealthy ? "🟢 Operational" : "🔴 Disconnected"}
        </div>
        <div style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
          Backend API endpoint: http://localhost:8000/api/v1
        </div>
      </SpotlightCard>

      {/* Card 6: Operational Activity */}
      <SpotlightCard>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
              Telemetry
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--color-text-primary)", marginTop: "4px" }}>
              Realtime Sync
            </h3>
          </div>
          <div style={{ padding: "10px", borderRadius: "12px", backgroundColor: "var(--color-primary-container)" }}>
            <Activity style={{ color: "var(--color-primary)", width: "24px", height: "24px" }} />
          </div>
        </div>
        <div style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginBottom: "12px" }}>
          Listening for user SOS alerts, location updates & check-in expirations.
        </div>
        <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
          Polling interval: 3 seconds
        </div>
      </SpotlightCard>
    </div>
  );
};
