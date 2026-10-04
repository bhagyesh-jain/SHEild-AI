from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db import init_db
from app.api.v1 import health, me, devices, guardians, incidents, locations, journeys

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Database Schema on startup
@app.on_event("startup")
def on_startup():
    init_db()

# Register Routers
app.include_router(health.router, prefix=settings.API_V1_STR, tags=["Health"])
app.include_router(me.router, prefix=settings.API_V1_STR, tags=["Profile"])
app.include_router(devices.router, prefix=settings.API_V1_STR, tags=["Devices"])
app.include_router(guardians.router, prefix=settings.API_V1_STR, tags=["Guardians"])
app.include_router(incidents.router, prefix=settings.API_V1_STR, tags=["Incidents"])
app.include_router(locations.router, prefix=settings.API_V1_STR, tags=["Locations"])
app.include_router(journeys.router, prefix=settings.API_V1_STR, tags=["Journeys"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
