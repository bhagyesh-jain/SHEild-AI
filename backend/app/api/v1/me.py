from fastapi import APIRouter, Header, HTTPException
from app.db import get_db
from app.core.config import settings

router = APIRouter()

@router.get("/me")
def get_me(authorization: str = Header(None)):
    conn = get_db()
    cursor = conn.cursor()
    
    # Simple bearer check fallback to default user
    user_id = settings.DEFAULT_USER_ID
    if authorization and authorization.startswith("Bearer guardian"):
        user_id = settings.DEFAULT_GUARDIAN_ID
        
    cursor.execute("SELECT id, email, display_name, phone_number FROM profiles WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    return {
        "id": row["id"],
        "email": row["email"],
        "display_name": row["display_name"],
        "phone_number": row["phone_number"]
    }
