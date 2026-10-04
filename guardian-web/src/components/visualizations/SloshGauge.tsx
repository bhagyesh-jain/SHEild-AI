import React from "react";

interface SloshGaugeProps {
  value: number; // 0 to 100
  label?: string;
}

export const SloshGauge: React.FC<SloshGaugeProps> = ({ value, label = "Device Battery Level" }) => {
  const percentage = Math.min(100, Math.max(0, value));

  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        width: "100%",
        padding: "16px",
        borderRadius: "var(--radius-md)",
        backgroundColor: "var(--color-surface-variant)",
        border: "1px solid var(--color-border)"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 600 }}>
        <span style={{ color: "var(--color-text-secondary)" }}>{label}</span>
        <span style={{ color: "var(--color-primary)" }}>{percentage}%</span>
      </div>

      <div style={{
        height: "12px",
        width: "100%",
        borderRadius: "6px",
        backgroundColor: "var(--color-border)",
        overflow: "hidden",
        position: "relative"
      }}>
        <div style={{
          height: "100%",
          width: `${percentage}%`,
          backgroundColor: percentage < 20 ? "var(--color-danger)" : "var(--color-primary)",
          borderRadius: "6px",
          transition: "width 0.5s ease"
        }} />
      </div>
    </div>
  );
};
