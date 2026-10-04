import React, { useState } from "react";
import { SpringCheck } from "../components/ui/SpringCheck";

interface SettingsProps {
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ theme, onToggleTheme }) => {
  const [audioAlerts, setAudioAlerts] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h2 style={{ fontSize: "24px", fontWeight: 700 }}>Guardian Portal Settings</h2>
        <p style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
          Preferences, emergency audio alerts, and accessibility configuration.
        </p>
      </div>

      <div style={{
        backgroundColor: "var(--color-surface)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--color-border)",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "20px"
      }}>
        <div style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "16px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "12px" }}>Appearance & Theme</h3>
          <SpringCheck
            checked={theme === "dark"}
            onChange={onToggleTheme}
            label="Enable Midnight Shield Dark Theme"
          />
        </div>

        <div style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "16px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "12px" }}>Emergency Alerts</h3>
          <SpringCheck
            checked={audioAlerts}
            onChange={setAudioAlerts}
            label="Play audible alarm sound when active SOS is received"
          />
        </div>

        <div style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "16px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "12px" }}>Data Refresh</h3>
          <SpringCheck
            checked={autoRefresh}
            onChange={setAutoRefresh}
            label="Auto-refresh incidents & location points every 3 seconds"
          />
        </div>

        <div>
          <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "12px" }}>Accessibility</h3>
          <SpringCheck
            checked={reducedMotion}
            onChange={setReducedMotion}
            label="Reduce motion (disable dashboard radar animation & visual glows)"
          />
        </div>
      </div>
    </div>
  );
};
