from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.api.v1.incidents import router as incidents_router
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Emergency alert and guardian coordination MVP",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HealthResponse(BaseModel):
    status: str
    message: str

@app.get(f"{settings.API_V1_STR}/health/live", response_model=HealthResponse, tags=["Health"])
def health_live():
    """
    Process health, no secrets.
    """
    return {"status": "ok", "message": "SHEild AI backend is alive"}

app.include_router(incidents_router, prefix=f"{settings.API_V1_STR}/incidents", tags=["Incidents"])
