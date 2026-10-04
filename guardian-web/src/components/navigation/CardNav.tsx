import React, { useState, useEffect, useRef } from "react";
import { Shield, Menu, X, AlertTriangle, MapPin, Users, Settings as SettingsIcon, Home } from "lucide-react";

interface CardNavProps {
  activeRoute: string;
  onNavigate: (route: string) => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export const CardNav: React.FC<CardNavProps> = ({ activeRoute, onNavigate, theme, onToggleTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { id: "overview", label: "Overview", icon: Home, desc: "Dashboard summary & stats" },
    { id: "incidents", label: "Active Incidents", icon: AlertTriangle, desc: "Live emergency alerts" },
    { id: "journeys", label: "Journeys", icon: MapPin, desc: "Tracked safe journeys" },
    { id: "contacts", label: "Contacts", icon: Users, desc: "Trusted guardians list" },
    { id: "settings", label: "Settings", icon: SettingsIcon, desc: "System & safety options" }
  ];

  // Escape key handler & Outside click handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <nav ref={navRef} style={{ width: "100%", backgroundColor: "var(--color-surface)", borderBottom: "1px solid var(--color-border)", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", height: "70px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        
        {/* Brand Header */}
        <div 
          onClick={() => onNavigate("overview")}
          tabIndex={0}
          role="button"
          onKeyDown={(e) => e.key === "Enter" && onNavigate("overview")}
          aria-label="SHEild AI Guardian Dashboard Home"
          style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}
        >
          <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "var(--color-primary-container)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Shield style={{ color: "var(--color-primary)", width: "24px", height: "24px" }} />
          </div>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--color-text-primary)", lineHeight: 1.2 }}>
              SHEild AI
            </h1>
            <span style={{ fontSize: "11px", color: "var(--color-text-muted)", letterSpacing: "0.5px", textTransform: "uppercase" }}>
              Guardian Portal
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="desktop-links" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="focus-ring"
                aria-current={isActive ? "page" : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: isActive ? "var(--color-primary-container)" : "transparent",
                  color: isActive ? "var(--color-primary)" : "var(--color-text-secondary)",
                  fontWeight: isActive ? 600 : 500,
                  fontSize: "14px",
                  transition: "all 0.2s ease"
                }}
              >
                <Icon style={{ width: "18px", height: "18px" }} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action Controls (Theme toggle & Mobile Menu Trigger) */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={onToggleTheme}
            className="focus-ring"
            aria-label={`Switch to ${theme === 'dark' ? 'Calm Guardian Light' : 'Midnight Shield Dark'} theme`}
            style={{
              padding: "8px 14px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-secondary)",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="mobile-toggle focus-ring"
            aria-expanded={isOpen}
            aria-label="Toggle navigation menu"
            style={{
              display: "none",
              padding: "8px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-primary)"
            }}
          >
            {isOpen ? <X style={{ width: "24px", height: "24px" }} /> : <Menu style={{ width: "24px", height: "24px" }} />}
          </button>
        </div>
      </div>

      {/* Mobile Collapsed Cards Menu */}
      {isOpen && (
        <div style={{
          padding: "16px 24px 24px",
          borderTop: "1px solid var(--color-border)",
          backgroundColor: "var(--color-surface)",
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.id;
            return (
              <div
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setIsOpen(false);
                }}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => e.key === "Enter" && (onNavigate(item.id), setIsOpen(false))}
                className="focus-ring"
                style={{
                  padding: "12px 16px",
                  borderRadius: "var(--radius-md)",
                  border: `1px solid ${isActive ? "var(--color-primary)" : "var(--color-border)"}`,
                  backgroundColor: isActive ? "var(--color-primary-container)" : "var(--color-surface-variant)",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  cursor: "pointer"
                }}
              >
                <div style={{
                  padding: "8px",
                  borderRadius: "8px",
                  backgroundColor: isActive ? "var(--color-primary)" : "var(--color-border)",
                  color: isActive ? "#fff" : "var(--color-text-primary)"
                }}>
                  <Icon style={{ width: "20px", height: "20px" }} />
                </div>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 600, color: isActive ? "var(--color-primary)" : "var(--color-text-primary)" }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @media (max-width: 850px) {
          .desktop-links { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </nav>
  );
};
