import React, { useEffect, useRef } from "react";

export const Radar: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let angle = 0;
    let animationId: number;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(cx, cy) - 10;

      ctx.clearRect(0, 0, w, h);

      // Radar circles
      ctx.strokeStyle = "rgba(66, 214, 189, 0.2)";
      ctx.lineWidth = 1;
      for (let r = radius / 3; r <= radius; r += radius / 3) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Radar sweep line
      angle += 0.03;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, angle, angle + 0.3);
      ctx.closePath();
      ctx.fillStyle = "rgba(66, 214, 189, 0.15)";
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + radius * Math.cos(angle + 0.3), cy + radius * Math.sin(angle + 0.3));
      ctx.strokeStyle = "#42D6BD";
      ctx.stroke();

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
      <canvas ref={canvasRef} width={200} height={200} style={{ borderRadius: "50%" }} />
      <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
        Visual Decoration Radar Sweep
      </span>
    </div>
  );
};
