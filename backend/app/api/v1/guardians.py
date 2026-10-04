from fastapi import APIRouter, Header, Body, HTTPException
import uuid
from datetime import datetime, timedelta
from app.db import get_db
from app.core.config import settings

router = APIRouter()

@router.post("/guardian-invites")
def create_guardian_invite(payload: dict = Body({}), authorization: str = Header(None)):
    conn = get_db()
    cursor = conn.cursor()
    
    owner_id = settings.DEFAULT_USER_ID
    invite_id = str(uuid.uuid4())
    token = str(uuid.uuid4())[:8]
    expires_at = (datetime.utcnow() + timedelta(days=7)).isoformat()
    note = payload.get("note", "Add me as trusted guardian")
    
    cursor.execute(
        "INSERT INTO guardian_invites (id, owner_id, token_hash, note, expires_at) VALUES (?, ?, ?, ?, ?)",
        (invite_id, owner_id, token, note, expires_at)
    )
    conn.commit()
    conn.close()
    
    return {
        "invite_token": token,
        "invite_url": f"http://localhost:5173/accept-invite?token={token}",
        "expires_at": expires_at
    }

@router.post("/guardian-invites/{token}/accept")
def accept_guardian_invite(token: str, authorization: str = Header(None)):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM guardian_invites WHERE token_hash = ?", (token,))
    invite = cursor.fetchone()
    
    if not invite:
        conn.close()
        raise HTTPException(status_code=404, detail="Invite token invalid or expired")
        
    guardian_id = settings.DEFAULT_GUARDIAN_ID
    owner_id = invite["owner_id"]
    link_id = str(uuid.uuid4())
    
    cursor.execute(
        "INSERT OR IGNORE INTO guardian_links (id, owner_id, guardian_id, priority) VALUES (?, ?, ?, 1)",
        (link_id, owner_id, guardian_id)
    )
    cursor.execute(
        "UPDATE guardian_invites SET accepted_by = ?, used_at = ? WHERE id = ?",
        (guardian_id, datetime.utcnow().isoformat(), invite["id"])
    )
    conn.commit()
    conn.close()
    
    return {"status": "accepted", "owner_id": owner_id, "guardian_id": guardian_id}

@router.get("/guardians")
def get_guardians(authorization: str = Header(None)):
    conn = get_db()
    cursor = conn.cursor()
    
    owner_id = settings.DEFAULT_USER_ID
    cursor.execute("""
        SELECT gl.id, gl.guardian_id, p.display_name as guardian_name, p.email as guardian_email, gl.priority, gl.consented_at
        FROM guardian_links gl
        JOIN profiles p ON gl.guardian_id = p.id
        WHERE gl.owner_id = ? AND gl.revoked_at IS NULL
        ORDER BY gl.priority ASC
    """, (owner_id,))
    
    rows = cursor.fetchall()
    conn.close()
    
    guardians = []
    for r in rows:
        guardians.append({
            "id": r["id"],
            "guardian_id": r["guardian_id"],
            "guardian_name": r["guardian_name"],
            "guardian_email": r["guardian_email"],
            "priority": r["priority"],
            "consented_at": r["consented_at"]
        })
        
    return guardians

@router.delete("/guardians/{id}")
def remove_guardian(id: str, authorization: str = Header(None)):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("UPDATE guardian_links SET revoked_at = ? WHERE id = ?", (datetime.utcnow().isoformat(), id))
    conn.commit()
    conn.close()
    
    return {"status": "revoked"}
