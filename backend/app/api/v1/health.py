from fastapi import APIRouter
from datetime import datetime

router = APIRouter()

@router.get("/health/live")
def health_live():
    return {
        "status": "ok",
        "service": "SHEild AI 2.0 Backend",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
