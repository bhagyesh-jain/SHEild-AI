const API_BASE_URL = "http://localhost:8000/api/v1";

export interface Incident {
  id: string;
  owner_id: string;
  user_name?: string;
  client_event_id: string;
  trigger: "manual" | "shake" | "voice" | "journey_timeout";
  status: "draft_local" | "pending_upload" | "active" | "acknowledged" | "resolved" | "expired";
  alert_status: "queued" | "provider_accepted" | "provider_failed" | "guardian_acknowledged";
  started_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy_m?: number;
    captured_at?: string;
  };
  acknowledgements?: Array<{
    guardian_id: string;
    guardian_name: string;
    note?: string;
    acknowledged_at: string;
  }>;
}

export interface Journey {
  id: string;
  owner_id: string;
  destination_label: string;
  eta_at: string;
  grace_seconds: number;
  status: "active" | "completed" | "missed_check_in" | "cancelled";
  created_at: string;
}

export interface Guardian {
  id: string;
  guardian_id: string;
  guardian_name: string;
  guardian_email: string;
  priority: number;
  consented_at: string;
}

export async function healthCheck() {
  try {
    const res = await fetch(`${API_BASE_URL}/health/live`);
    return await res.json();
  } catch (e) {
    return { status: "offline" };
  }
}

export async function fetchProfile() {
  const res = await fetch(`${API_BASE_URL}/me`, {
    headers: { Authorization: "Bearer guardian_demo_token" }
  });
  return await res.json();
}

export async function fetchIncidents(): Promise<Incident[]> {
  const res = await fetch(`${API_BASE_URL}/incidents`, {
    headers: { Authorization: "Bearer guardian_demo_token" }
  });
  if (!res.ok) return [];
  return await res.json();
}

export async function fetchIncidentDetail(id: string): Promise<Incident | null> {
  const res = await fetch(`${API_BASE_URL}/incidents/${id}`, {
    headers: { Authorization: "Bearer guardian_demo_token" }
  });
  if (!res.ok) return null;
  return await res.json();
}

export async function acknowledgeIncident(id: string, note?: string) {
  const res = await fetch(`${API_BASE_URL}/incidents/${id}/acknowledge`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer guardian_demo_token"
    },
    body: JSON.stringify({ note })
  });
  return await res.json();
}

export async function resolveIncident(id: string) {
  const res = await fetch(`${API_BASE_URL}/incidents/${id}/resolve`, {
    method: "POST",
    headers: { Authorization: "Bearer guardian_demo_token" }
  });
  return await res.json();
}

export async function fetchJourneys(): Promise<Journey[]> {
  const res = await fetch(`${API_BASE_URL}/journeys`, {
    headers: { Authorization: "Bearer guardian_demo_token" }
  });
  if (!res.ok) return [];
  return await res.json();
}

export async function fetchGuardians(): Promise<Guardian[]> {
  const res = await fetch(`${API_BASE_URL}/guardians`, {
    headers: { Authorization: "Bearer guardian_demo_token" }
  });
  if (!res.ok) return [];
  return await res.json();
}

export async function acceptInvite(token: string) {
  const res = await fetch(`${API_BASE_URL}/guardian-invites/${token}/accept`, {
    method: "POST",
    headers: { Authorization: "Bearer guardian_demo_token" }
  });
  return await res.json();
}
