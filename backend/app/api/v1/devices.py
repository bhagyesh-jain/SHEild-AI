from fastapi import APIRouter, Header, Body
import uuid
from datetime import datetime
from app.db import get_db
from app.core.config import settings

router = APIRouter()

@router.post("/devices")
def register_device(payload: dict = Body(...), authorization: str = Header(None)):
    conn = get_db()
    cursor = conn.cursor()
    
    user_id = settings.DEFAULT_USER_ID
    if authorization and authorization.startswith("Bearer guardian"):
        user_id = settings.DEFAULT_GUARDIAN_ID
        
    device_id = str(uuid.uuid4())
    fcm_token = payload.get("fcm_token", "default_fcm_token")
    platform = payload.get("platform", "android")
    
    cursor.execute(
        "INSERT INTO devices (id, user_id, fcm_token, platform, last_seen_at) VALUES (?, ?, ?, ?, ?)",
        (device_id, user_id, fcm_token, platform, datetime.utcnow().isoformat())
    )
    conn.commit()
    conn.close()
    
    return {"status": "registered", "device_id": device_id}
