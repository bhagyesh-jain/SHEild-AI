import React from "react";

interface SpringCheckProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

export const SpringCheck: React.FC<SpringCheckProps> = ({ checked, onChange, label, disabled = false }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (!disabled) onChange(!checked);
    }
  };

  return (
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "12px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        userSelect: "none"
      }}
    >
      <div
        tabIndex={disabled ? -1 : 0}
        role="checkbox"
        aria-checked={checked}
        aria-disabled={disabled}
        onKeyDown={handleKeyDown}
        onClick={() => !disabled && onChange(!checked)}
        className="focus-ring"
        style={{
          width: "44px",
          height: "24px",
          borderRadius: "12px",
          backgroundColor: checked ? "var(--color-primary)" : "var(--color-surface-variant)",
          border: "1px solid var(--color-border)",
          position: "relative",
          transition: "background-color 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)"
        }}
      >
        <div
          style={{
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            backgroundColor: "#ffffff",
            position: "absolute",
            top: "2px",
            left: checked ? "22px" : "2px",
            transition: "left 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
          }}
        />
      </div>
      <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-text-primary)" }}>
        {label}
      </span>
    </label>
  );
};
