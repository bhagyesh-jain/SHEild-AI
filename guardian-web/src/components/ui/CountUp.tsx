import React, { useEffect, useState } from "react";

interface CountUpProps {
  to: number;
  from?: number;
  durationMs?: number;
  prefix?: string;
  suffix?: string;
  loading?: boolean;
}

export const CountUp: React.FC<CountUpProps> = ({
  to,
  from = 0,
  durationMs = 1000,
  prefix = "",
  suffix = "",
  loading = false
}) => {
  const [value, setValue] = useState(from);

  useEffect(() => {
    if (loading) return;

    // Check reduced motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setValue(to);
      return;
    }

    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / durationMs, 1);
      const current = Math.floor(progress * (to - from) + from);
      setValue(current);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [to, from, durationMs, loading]);

  if (loading) {
    return (
      <span
        style={{
          display: "inline-block",
          width: "48px",
          height: "28px",
          backgroundColor: "var(--color-surface-variant)",
          borderRadius: "4px",
          animation: "pulse 1.5s infinite ease-in-out"
        }}
      />
    );
  }

  return (
    <span>
      {prefix}
      {value.toLocaleString()}
      {suffix}
    </span>
  );
};
