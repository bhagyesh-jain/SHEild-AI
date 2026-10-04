const API_BASE_URL = "http://localhost:8000/api/v1";

export interface CreateIncidentPayload {
  client_event_id: string;
  trigger: "manual" | "shake" | "voice" | "journey_timeout";
  occurred_at: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy_m?: number;
    captured_at?: string;
  };
  share_location?: boolean;
}

export interface IncidentResponse {
  id: string;
  owner_id: string;
  client_event_id: string;
  trigger: string;
  status: "draft_local" | "pending_upload" | "active" | "acknowledged" | "resolved" | "expired";
  alert_status: "queued" | "provider_accepted" | "provider_failed" | "guardian_acknowledged";
  started_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy_m?: number;
  };
  acknowledgements?: Array<{
    guardian_id: string;
    guardian_name: string;
    note?: string;
    acknowledged_at: string;
  }>;
}

export async function createIncidentAPI(payload: CreateIncidentPayload): Promise<IncidentResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/incidents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": payload.client_event_id,
        Authorization: "Bearer mobile_user_token"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchIncidentAPI(id: string): Promise<IncidentResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/incidents/${id}`, {
      headers: { Authorization: "Bearer mobile_user_token" }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function resolveIncidentAPI(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/incidents/${id}/resolve`, {
      method: "POST",
      headers: { Authorization: "Bearer mobile_user_token" }
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}
