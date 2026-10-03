from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

class LocationPayload(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    accuracy_m: Optional[float] = Field(None, ge=0.0)
    captured_at: datetime

class CreateIncidentRequest(BaseModel):
    client_event_id: UUID
    trigger: str = Field(..., pattern="^(manual|shake|missed_check_in|voice_keyword|other)$")
    occurred_at: datetime
    location: Optional[LocationPayload] = None
    share_location: bool = True

class IncidentResponse(BaseModel):
    id: UUID
    owner_id: UUID
    client_event_id: UUID
    trigger: str
    status: str
    alert_status: str
    created_at: datetime
    resolved_at: Optional[datetime] = None

class ErrorEnvelope(BaseModel):
    code: str
    message: str
    request_id: Optional[str] = None
