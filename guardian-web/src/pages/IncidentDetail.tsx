import React, { useEffect, useState } from "react";
import { fetchIncidentDetail, Incident } from "../services/api";
import { ArrowLeft, MapPin, Phone, Shield, Clock, CheckCircle2 } from "lucide-react";

interface IncidentDetailProps {
  id: string;
  onBack: () => void;
  onAcknowledge: (id: string) => void;
}

export const IncidentDetail: React.FC<IncidentDetailProps> = ({ id, onBack, onAcknowledge }) => {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const data = await fetchIncidentDetail(id);
    setIncident(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return <div style={{ padding: "40px", color: "var(--color-text-muted)" }}>Loading incident details...</div>;
  }

  if (!incident) {
    return (
      <div style={{ padding: "40px" }}>
        <button onClick={onBack} style={{ marginBottom: "16px", color: "var(--color-primary)" }}>← Back</button>
        <div>Incident not found.</div>
      </div>
    );
  }

  const isEmergency = incident.status === "active";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <button
        onClick={onBack}
        className="focus-ring"
        style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--color-primary)", fontWeight: 600, width: "fit-content" }}
      >
        <ArrowLeft style={{ width: "16px", height: "16px" }} />
        <span>Back to Incidents</span>
      </button>

      <div style={{
        backgroundColor: "var(--color-surface)",
        borderRadius: "var(--radius-lg)",
        border: `1px solid ${isEmergency ? "var(--color-danger)" : "var(--color-border)"}`,
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "20px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <span style={{
              padding: "4px 10px",
              borderRadius: "var(--radius-full)",
              fontSize: "12px",
              fontWeight: 700,
              backgroundColor: isEmergency ? "var(--color-danger)" : "var(--color-success-container)",
              color: isEmergency ? "#fff" : "var(--color-success)"
            }}>
              {incident.status.toUpperCase()}
            </span>
            <h2 style={{ fontSize: "24px", fontWeight: 800, marginTop: "8px" }}>
              {incident.user_name || "User"} Emergency Alert
            </h2>
            <div style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginTop: "4px" }}>
              Trigger method: <strong>{incident.trigger}</strong> • Client Event ID: {incident.client_event_id}
            </div>
          </div>

          {incident.status === "active" && (
            <button
              onClick={() => onAcknowledge(incident.id)}
              className="focus-ring"
              style={{
                padding: "12px 24px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--color-danger)",
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: 700
              }}
            >
              Acknowledge Emergency
            </button>
          )}
        </div>

        {/* Map / Coordinates Card */}
        <div style={{
          backgroundColor: "var(--color-surface-variant)",
          borderRadius: "var(--radius-md)",
          padding: "20px",
          border: "1px solid var(--color-border)",
          display: "flex",
          flexDirection: "column",
          gap: "12px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, color: "var(--color-primary)" }}>
            <MapPin style={{ width: "20px", height: "20px" }} />
            <span>Authorized Live Location</span>
          </div>

          {incident.location ? (
            <div>
              <div style={{ fontSize: "18px", fontWeight: 700 }}>
                Lat: {incident.location.latitude} | Lon: {incident.location.longitude}
              </div>
              <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "4px" }}>
                Accuracy: ±{incident.location.accuracy_m || 15}m • Captured at: {incident.location.captured_at ? new Date(incident.location.captured_at).toLocaleTimeString() : "Live"}
              </div>
              <a
                href={`https://maps.google.com/?q=${incident.location.latitude},${incident.location.longitude}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-block",
                  marginTop: "12px",
                  padding: "8px 16px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--color-primary-container)",
                  color: "var(--color-primary)",
                  fontWeight: 600,
                  fontSize: "13px"
                }}
              >
                Open Google Maps Location ↗
              </a>
            </div>
          ) : (
            <div style={{ color: "var(--color-text-muted)" }}>GPS Location not available for this alert.</div>
          )}
        </div>

        {/* Direct Contact Handoff */}
        <div style={{ display: "flex", gap: "12px" }}>
          <a
            href="tel:+919876543210"
            style={{
              padding: "10px 18px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--color-surface-variant)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-primary)",
              fontWeight: 600,
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <Phone style={{ width: "16px", height: "16px", color: "var(--color-primary)" }} />
            Call User Phone
          </a>
        </div>

        {/* Guardian Acknowledgement Timeline */}
        <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "16px" }}>
          <h4 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "12px" }}>
            Guardian Acknowledgements Log
          </h4>
          {incident.acknowledgements && incident.acknowledgements.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {incident.acknowledgements.map((ack, idx) => (
                <div key={idx} style={{ padding: "10px", borderRadius: "8px", backgroundColor: "var(--color-success-container)", color: "var(--color-success)", display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" }}>
                  <CheckCircle2 style={{ width: "18px", height: "18px" }} />
                  <div>
                    <strong>{ack.guardian_name}</strong> acknowledged at {new Date(ack.acknowledged_at).toLocaleTimeString()}
                    {ack.note && <div style={{ opacity: 0.8 }}>Note: {ack.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
              No guardian response recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
