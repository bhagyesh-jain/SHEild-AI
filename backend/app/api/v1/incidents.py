from fastapi import APIRouter, Header, Body, HTTPException
import uuid
from datetime import datetime
from app.db import get_db
from app.core.config import settings

router = APIRouter()

@router.post("/incidents")
def create_incident(payload: dict = Body(...), authorization: str = Header(None)):
    conn = get_db()
    cursor = conn.cursor()
    
    owner_id = settings.DEFAULT_USER_ID
    client_event_id = payload.get("client_event_id")
    if not client_event_id:
        conn.close()
        raise HTTPException(status_code=400, detail="client_event_id is required")
        
    # Check idempotency
    cursor.execute("SELECT * FROM incidents WHERE owner_id = ? AND client_event_id = ?", (owner_id, client_event_id))
    existing = cursor.fetchone()
    if existing:
        incident_id = existing["id"]
        # Fetch latest location
        cursor.execute("SELECT latitude, longitude, accuracy_m FROM incident_locations WHERE incident_id = ? ORDER BY captured_at DESC LIMIT 1", (incident_id,))
        loc_row = cursor.fetchone()
        conn.close()
        
        return {
            "id": incident_id,
            "owner_id": owner_id,
            "client_event_id": client_event_id,
            "trigger": existing["trigger"],
            "status": existing["status"],
            "alert_status": existing["alert_status"],
            "started_at": existing["started_at"],
            "acknowledged_at": existing["acknowledged_at"],
            "resolved_at": existing["resolved_at"],
            "location": {
                "latitude": loc_row["latitude"] if loc_row else existing["latitude"],
                "longitude": loc_row["longitude"] if loc_row else existing["longitude"],
                "accuracy_m": loc_row["accuracy_m"] if loc_row else existing["accuracy_m"],
            } if loc_row or existing["latitude"] else None
        }

    incident_id = str(uuid.uuid4())
    trigger = payload.get("trigger", "manual")
    started_at = payload.get("occurred_at", datetime.utcnow().isoformat())
    location = payload.get("location")
    
    lat = location.get("latitude") if location else None
    lon = location.get("longitude") if location else None
    acc = location.get("accuracy_m") if location else None

    cursor.execute(
        """INSERT INTO incidents (id, owner_id, client_event_id, trigger, status, alert_status, started_at, latitude, longitude, accuracy_m)
           VALUES (?, ?, ?, ?, 'active', 'queued', ?, ?, ?, ?)""",
        (incident_id, owner_id, client_event_id, trigger, started_at, lat, lon, acc)
    )
    
    if location and lat and lon:
        loc_id = str(uuid.uuid4())
        cursor.execute(
            "INSERT INTO incident_locations (id, incident_id, latitude, longitude, accuracy_m, captured_at) VALUES (?, ?, ?, ?, ?, ?)",
            (loc_id, incident_id, lat, lon, acc, started_at)
        )

    # Queue alert jobs for guardians
    cursor.execute("SELECT guardian_id FROM guardian_links WHERE owner_id = ? AND revoked_at IS NULL ORDER BY priority ASC", (owner_id,))
    guardians = cursor.fetchall()
    
    for idx, g in enumerate(guardians):
        job_id = str(uuid.uuid4())
        cursor.execute(
            "INSERT INTO alert_jobs (id, incident_id, guardian_id, channel, stage, state) VALUES (?, ?, ?, 'fcm', ?, 'queued')",
            (job_id, incident_id, g["guardian_id"], idx + 1)
        )
        
    # Mark alert_status as provider_accepted once queued
    cursor.execute("UPDATE incidents SET alert_status = 'provider_accepted' WHERE id = ?", (incident_id,))

    conn.commit()
    conn.close()

    return {
        "id": incident_id,
        "owner_id": owner_id,
        "client_event_id": client_event_id,
        "trigger": trigger,
        "status": "active",
        "alert_status": "provider_accepted",
        "started_at": started_at,
        "acknowledged_at": None,
        "resolved_at": None,
        "location": location
    }

@router.get("/incidents")
def list_incidents(authorization: str = Header(None)):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT i.*, p.display_name as user_name
        FROM incidents i
        JOIN profiles p ON i.owner_id = p.id
        ORDER BY i.started_at DESC
    """)
    rows = cursor.fetchall()
    
    incidents = []
    for r in rows:
        cursor.execute("SELECT latitude, longitude, accuracy_m, captured_at FROM incident_locations WHERE incident_id = ? ORDER BY captured_at DESC LIMIT 1", (r["id"],))
        loc = cursor.fetchone()
        
        incidents.append({
            "id": r["id"],
            "owner_id": r["owner_id"],
            "user_name": r["user_name"],
            "client_event_id": r["client_event_id"],
            "trigger": r["trigger"],
            "status": r["status"],
            "alert_status": r["alert_status"],
            "started_at": r["started_at"],
            "acknowledged_at": r["acknowledged_at"],
            "resolved_at": r["resolved_at"],
            "location": {
                "latitude": loc["latitude"] if loc else r["latitude"],
                "longitude": loc["longitude"] if loc else r["longitude"],
                "accuracy_m": loc["accuracy_m"] if loc else r["accuracy_m"],
                "captured_at": loc["captured_at"] if loc else r["started_at"]
            } if (loc and loc["latitude"]) or r["latitude"] else None
        })
        
    conn.close()
    return incidents

@router.get("/incidents/{id}")
def get_incident(id: str, authorization: str = Header(None)):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT i.*, p.display_name as user_name
        FROM incidents i
        JOIN profiles p ON i.owner_id = p.id
        WHERE i.id = ?
    """, (id,))
    row = cursor.fetchone()

    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Incident not found")

    cursor.execute("SELECT latitude, longitude, accuracy_m, captured_at FROM incident_locations WHERE incident_id = ? ORDER BY captured_at DESC LIMIT 1", (id,))
    loc = cursor.fetchone()

    cursor.execute("""
        SELECT a.guardian_id, a.note, a.acknowledged_at, p.display_name as guardian_name
        FROM acknowledgements a
        JOIN profiles p ON a.guardian_id = p.id
        WHERE a.incident_id = ?
    """, (id,))
    acks = cursor.fetchall()

    acknowledgements = []
    for a in acks:
        acknowledgements.append({
            "guardian_id": a["guardian_id"],
            "guardian_name": a["guardian_name"],
            "note": a["note"],
            "acknowledged_at": a["acknowledged_at"]
        })

    conn.close()

    return {
        "id": row["id"],
        "owner_id": row["owner_id"],
        "user_name": row["user_name"],
        "client_event_id": row["client_event_id"],
        "trigger": row["trigger"],
        "status": row["status"],
        "alert_status": row["alert_status"],
        "started_at": row["started_at"],
        "acknowledged_at": row["acknowledged_at"],
        "resolved_at": row["resolved_at"],
        "location": {
            "latitude": loc["latitude"] if loc else row["latitude"],
            "longitude": loc["longitude"] if loc else row["longitude"],
            "accuracy_m": loc["accuracy_m"] if loc else row["accuracy_m"],
            "captured_at": loc["captured_at"] if loc else row["started_at"]
        } if (loc and loc["latitude"]) or row["latitude"] else None,
        "acknowledgements": acknowledgements
    }

@router.post("/incidents/{id}/acknowledge")
def acknowledge_incident(id: str, payload: dict = Body({}), authorization: str = Header(None)):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM incidents WHERE id = ?", (id,))
    incident = cursor.fetchone()

    if not incident:
        conn.close()
        raise HTTPException(status_code=404, detail="Incident not found")

    guardian_id = settings.DEFAULT_GUARDIAN_ID
    now_str = datetime.utcnow().isoformat()
    note = payload.get("note", "Guardian acknowledged alert on Guardian Web Dashboard")

    ack_id = str(uuid.uuid4())
    cursor.execute(
        "INSERT OR IGNORE INTO acknowledgements (id, incident_id, guardian_id, note, acknowledged_at) VALUES (?, ?, ?, ?, ?)",
        (ack_id, id, guardian_id, note, now_str)
    )

    cursor.execute(
        "UPDATE incidents SET status = 'acknowledged', alert_status = 'guardian_acknowledged', acknowledged_at = ? WHERE id = ?",
        (now_str, id)
    )

    conn.commit()
    conn.close()

    return {
        "id": id,
        "status": "acknowledged",
        "alert_status": "guardian_acknowledged",
        "acknowledged_at": now_str,
        "acknowledged_by": guardian_id
    }

@router.post("/incidents/{id}/resolve")
def resolve_incident(id: str, authorization: str = Header(None)):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM incidents WHERE id = ?", (id,))
    incident = cursor.fetchone()

    if not incident:
        conn.close()
        raise HTTPException(status_code=404, detail="Incident not found")

    now_str = datetime.utcnow().isoformat()
    cursor.execute(
        "UPDATE incidents SET status = 'resolved', resolved_at = ? WHERE id = ?",
        (now_str, id)
    )

    conn.commit()
    conn.close()

    return {"id": id, "status": "resolved", "resolved_at": now_str}
