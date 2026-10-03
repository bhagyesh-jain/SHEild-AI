from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, status

from app.core.security import get_current_user
from app.db.supabase import get_supabase_client
from app.schemas.incident import CreateIncidentRequest, IncidentResponse
from app.services.alert_provider import MockAlertProvider

router = APIRouter()


@router.post("", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
def create_incident(
    request: CreateIncidentRequest,
    idempotency_key: Optional[str] = Header(None, alias="Idempotency-Key"),
    current_user: dict = Depends(get_current_user),
):
    """
    Create an emergency incident.

    Idempotency: if Idempotency-Key header is supplied it MUST equal client_event_id,
    otherwise the request is rejected with HTTP 400.
    Re-submitting the same (owner_id, client_event_id) pair returns the existing
    incident instead of creating a duplicate.
    """
    # ── 1. Idempotency-Key validation ──────────────────────────────────────────
    if idempotency_key is not None and idempotency_key != str(request.client_event_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Idempotency-Key header must match client_event_id if provided.",
        )

    user_id: str = current_user["sub"]
    raw_token: str = current_user.get("_token", "")  # forwarded to Supabase client
    db = get_supabase_client(token=raw_token)

    # ── 2. Insert incident ─────────────────────────────────────────────────────
    expires_at = (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat()

    try:
        res = db.table("incidents").insert({
            "owner_id": user_id,
            "client_event_id": str(request.client_event_id),
            "trigger": request.trigger,
            "share_location": request.share_location,
            "started_at": request.occurred_at.isoformat(),
            "expires_at": expires_at,
        }).execute()

        incident = res.data[0]

    except Exception as exc:
        err = str(exc)
        # Postgres unique-constraint violation → idempotent success
        if (
            "uq_incidents_owner_client_event" in err
            or "23505" in err
            or "duplicate key" in err.lower()
            or "conflict" in err.lower()
        ):
            existing = (
                db.table("incidents")
                .select("*")
                .eq("owner_id", user_id)
                .eq("client_event_id", str(request.client_event_id))
                .execute()
            )
            if existing.data:
                return _format_response(existing.data[0])
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=err)

    # ── 3. Dispatch mock alerts to accepted guardians ──────────────────────────
    guardians = (
        db.table("guardian_links")
        .select("guardian_id")
        .eq("owner_id", user_id)
        .eq("status", "accepted")
        .is_("revoked_at", "null")
        .execute()
    )

    provider = MockAlertProvider()
    for row in guardians.data:
        try:
            provider.dispatch_alert(incident_id=incident["id"], guardian_id=row["guardian_id"])
        except Exception:
            # Alert failure must not abort incident creation
            pass

    return _format_response(incident)


def _format_response(row: dict) -> dict:
    return {
        "id": row["id"],
        "owner_id": row["owner_id"],
        "client_event_id": row["client_event_id"],
        "trigger": row["trigger"],
        "status": row["status"],
        "alert_status": "queued",
        "created_at": row["created_at"],
        "resolved_at": row.get("resolved_at"),
    }
