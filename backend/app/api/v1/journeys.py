from fastapi import APIRouter, Header, Body, HTTPException
import uuid
from datetime import datetime, timedelta
from app.db import get_db
from app.core.config import settings

router = APIRouter()

@router.post("/journeys")
def create_journey(payload: dict = Body(...), authorization: str = Header(None)):
    conn = get_db()
    cursor = conn.cursor()

    owner_id = settings.DEFAULT_USER_ID
    destination_label = payload.get("destination_label", "Home")
    eta_minutes = int(payload.get("eta_minutes", 30))
    grace_seconds = int(payload.get("grace_seconds", 300))

    eta_at = (datetime.utcnow() + timedelta(minutes=eta_minutes)).isoformat()
    journey_id = str(uuid.uuid4())

    cursor.execute(
        "INSERT INTO journeys (id, owner_id, destination_label, eta_at, grace_seconds, status) VALUES (?, ?, ?, ?, ?, 'active')",
        (journey_id, owner_id, destination_label, eta_at, grace_seconds)
    )

    conn.commit()
    conn.close()

    return {
        "id": journey_id,
        "owner_id": owner_id,
        "destination_label": destination_label,
        "eta_at": eta_at,
        "grace_seconds": grace_seconds,
        "status": "active"
    }

@router.get("/journeys")
def list_journeys(authorization: str = Header(None)):
    conn = get_db()
    cursor = conn.cursor()

    owner_id = settings.DEFAULT_USER_ID
    cursor.execute("SELECT * FROM journeys WHERE owner_id = ? ORDER BY created_at DESC", (owner_id,))
    rows = cursor.fetchall()
    conn.close()

    journeys = []
    for r in rows:
        journeys.append({
            "id": r["id"],
            "owner_id": r["owner_id"],
            "destination_label": r["destination_label"],
            "eta_at": r["eta_at"],
            "grace_seconds": r["grace_seconds"],
            "status": r["status"],
            "created_at": r["created_at"]
        })

    return journeys

@router.post("/journeys/{id}/check-in")
def check_in_journey(id: str, authorization: str = Header(None)):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("UPDATE journeys SET status = 'completed' WHERE id = ?", (id,))
    conn.commit()
    conn.close()

    return {"id": id, "status": "completed"}

@router.post("/journeys/{id}/cancel")
def cancel_journey(id: str, authorization: str = Header(None)):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("UPDATE journeys SET status = 'cancelled' WHERE id = ?", (id,))
    conn.commit()
    conn.close()

    return {"id": id, "status": "cancelled"}
