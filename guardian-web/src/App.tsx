import React, { useState, useEffect } from "react";
import { CardNav } from "./components/navigation/CardNav";
import { LineSidebar } from "./components/navigation/LineSidebar";
import { SwipeToast } from "./components/feedback/SwipeToast";
import { Overview } from "./pages/Overview";
import { Incidents } from "./pages/Incidents";
import { IncidentDetail } from "./pages/IncidentDetail";
import { Journeys } from "./pages/Journeys";
import { Contacts } from "./pages/Contacts";
import { Settings } from "./pages/Settings";
import { fetchIncidents, fetchJourneys, fetchGuardians, healthCheck, acknowledgeIncident, Incident, Journey, Guardian } from "./services/api";

export function App() {
  const [activeRoute, setActiveRoute] = useState("overview");
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [backendHealthy, setBackendHealthy] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  const loadData = async () => {
    const health = await healthCheck();
    setBackendHealthy(health.status === "ok");

    const incs = await fetchIncidents();
    setIncidents(incs);

    const jnys = await fetchJourneys();
    setJourneys(jnys);

    const gds = await fetchGuardians();
    setGuardians(gds);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleNavigate = (route: string, id?: string) => {
    setActiveRoute(route);
    if (id) setSelectedIncidentId(id);
  };

  const handleAcknowledge = async (id: string) => {
    await acknowledgeIncident(id, "Acknowledged by Guardian on Web Portal");
    setToastMessage("🟢 Incident Acknowledged! Updated user's mobile status.");
    loadData();
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-background)", color: "var(--color-text-primary)" }}>
      {/* Top Navbar */}
      <CardNav
        activeRoute={activeRoute}
        onNavigate={handleNavigate}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div style={{ display: "flex", maxWidth: "1440px", margin: "0 auto" }}>
        {/* Sidebar for Desktop */}
        <div className="desktop-sidebar">
          <LineSidebar activeRoute={activeRoute} onNavigate={handleNavigate} />
        </div>

        {/* Main Content View */}
        <main style={{ flex: 1, padding: "32px 24px", minWidth: 0 }}>
          {activeRoute === "overview" && (
            <Overview
              incidents={incidents}
              journeys={journeys}
              guardians={guardians}
              backendHealthy={backendHealthy}
              onNavigate={handleNavigate}
              onAcknowledge={handleAcknowledge}
            />
          )}

          {activeRoute === "incidents" && (
            <Incidents
              incidents={incidents}
              onNavigate={handleNavigate}
              onAcknowledge={handleAcknowledge}
            />
          )}

          {activeRoute === "incident-detail" && selectedIncidentId && (
            <IncidentDetail
              id={selectedIncidentId}
              onBack={() => handleNavigate("incidents")}
              onAcknowledge={handleAcknowledge}
            />
          )}

          {activeRoute === "journeys" && (
            <Journeys journeys={journeys} />
          )}

          {activeRoute === "contacts" && (
            <Contacts guardians={guardians} />
          )}

          {activeRoute === "settings" && (
            <Settings theme={theme} onToggleTheme={toggleTheme} />
          )}
        </main>
      </div>

      {/* Routine Confirmation Toast */}
      <SwipeToast
        message={toastMessage || ""}
        isOpen={!!toastMessage}
        onClose={() => setToastMessage(null)}
      />

      <style>{`
        @media (max-width: 850px) {
          .desktop-sidebar { display: none !important; }
        }
      `}</style>
    </div>
  );
}

export default App;
