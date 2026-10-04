import React, { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";

interface SwipeToastProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

export const SwipeToast: React.FC<SwipeToastProps> = ({
  message,
  isOpen,
  onClose,
  duration = 4000
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "14px 20px",
        borderRadius: "var(--radius-md)",
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-primary)",
        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.4)",
        color: "var(--color-text-primary)",
        fontSize: "14px",
        fontWeight: 500,
        animation: "slideUp 0.3s ease-out"
      }}
    >
      <CheckCircle2 style={{ color: "var(--color-primary)", width: "20px", height: "20px" }} />
      <span>{message}</span>
      <button
        onClick={onClose}
        aria-label="Close notification"
        className="focus-ring"
        style={{ padding: "4px", marginLeft: "8px", color: "var(--color-text-muted)" }}
      >
        <X style={{ width: "16px", height: "16px" }} />
      </button>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
