from fastapi import APIRouter, Header, Body, HTTPException
import uuid
from datetime import datetime
from app.db import get_db

router = APIRouter()

@router.post("/incidents/{id}/locations")
def record_location(id: str, payload: dict = Body(...), authorization: str = Header(None)):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM incidents WHERE id = ?", (id,))
    incident = cursor.fetchone()

    if not incident:
        conn.close()
        raise HTTPException(status_code=404, detail="Incident not found")

    lat = payload.get("latitude")
    lon = payload.get("longitude")
    acc = payload.get("accuracy_m", 10.0)
    captured_at = payload.get("captured_at", datetime.utcnow().isoformat())

    if lat is None or lon is None:
        conn.close()
        raise HTTPException(status_code=400, detail="Latitude and longitude required")

    loc_id = str(uuid.uuid4())
    cursor.execute(
        "INSERT INTO incident_locations (id, incident_id, latitude, longitude, accuracy_m, captured_at) VALUES (?, ?, ?, ?, ?, ?)",
        (loc_id, id, lat, lon, acc, captured_at)
    )
    cursor.execute(
        "UPDATE incidents SET latitude = ?, longitude = ?, accuracy_m = ? WHERE id = ?",
        (lat, lon, acc, id)
    )

    conn.commit()
    conn.close()

    return {"status": "recorded", "location_id": loc_id, "captured_at": captured_at}

@router.get("/incidents/{id}/locations/latest")
def get_latest_location(id: str, authorization: str = Header(None)):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT latitude, longitude, accuracy_m, captured_at FROM incident_locations WHERE incident_id = ? ORDER BY captured_at DESC LIMIT 1",
        (id,)
    )
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="No location recorded for this incident")

    return {
        "incident_id": id,
        "latitude": row["latitude"],
        "longitude": row["longitude"],
        "accuracy_m": row["accuracy_m"],
        "captured_at": row["captured_at"]
    }
