import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

interface LatticeLoaderProps {
  status: "idle" | "loading" | "success" | "error";
  label?: string;
  onRetry?: () => void;
  timeoutSeconds?: number;
}

export const LatticeLoader: React.FC<LatticeLoaderProps> = ({
  status,
  label = "Synchronizing safety events...",
  onRetry,
  timeoutSeconds = 15
}) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let timer: any;
    if (status === "loading") {
      setElapsed(0);
      timer = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [status]);

  if (status === "idle") return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 16px",
        borderRadius: "var(--radius-md)",
        backgroundColor: "var(--color-surface-variant)",
        border: "1px solid var(--color-border)",
        fontSize: "14px"
      }}
    >
      {status === "loading" && (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            style={{
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              border: "2px solid var(--color-primary-container)",
              borderTopColor: "var(--color-primary)",
              animation: "spin 1s linear infinite"
            }}
          />
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {status === "success" && (
        <CheckCircle2 style={{ color: "var(--color-success)", width: "20px", height: "20px" }} />
      )}

      {status === "error" && (
        <AlertCircle style={{ color: "var(--color-danger)", width: "20px", height: "20px" }} />
      )}

      <div style={{ flex: 1 }}>
        <div style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>
          {status === "error" ? "Connection timeout or fetch error" : label}
        </div>
        {status === "loading" && (
          <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
            Elapsed: {elapsed}s (timeout in {Math.max(0, timeoutSeconds - elapsed)}s)
          </div>
        )}
      </div>

      {status === "error" && onRetry && (
        <button
          onClick={onRetry}
          className="focus-ring"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            padding: "4px 10px",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "var(--color-danger-container)",
            color: "var(--color-danger)",
            fontSize: "12px",
            fontWeight: 600
          }}
        >
          <RefreshCw style={{ width: "12px", height: "12px" }} />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
};
