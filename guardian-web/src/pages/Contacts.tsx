import React from "react";
import { Guardian } from "../services/api";
import { Shield, Mail, CheckCircle2, UserPlus } from "lucide-react";

interface ContactsProps {
  guardians: Guardian[];
}

export const Contacts: React.FC<ContactsProps> = ({ guardians }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: 700 }}>Trusted Guardians Network</h2>
          <p style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
            Configured escalation priority list for emergency notifications.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {guardians.map((g) => (
          <div
            key={g.id}
            style={{
              backgroundColor: "var(--color-surface)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              padding: "16px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "var(--color-primary-container)",
                color: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700
              }}>
                P{g.priority}
              </div>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 700 }}>{g.guardian_name}</div>
                <div style={{ fontSize: "13px", color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Mail style={{ width: "13px", height: "13px" }} />
                  {g.guardian_email}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--color-success)", fontWeight: 600 }}>
              <CheckCircle2 style={{ width: "16px", height: "16px" }} />
              <span>Consented Guardian</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
