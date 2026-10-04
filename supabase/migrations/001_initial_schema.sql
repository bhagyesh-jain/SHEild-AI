-- SHEild AI 2.0 Initial Schema Migration

CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    phone_number TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS devices (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    fcm_token TEXT NOT NULL,
    platform TEXT DEFAULT 'android',
    last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS guardian_invites (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    token_hash TEXT UNIQUE NOT NULL,
    note TEXT,
    expires_at TIMESTAMP NOT NULL,
    accepted_by TEXT REFERENCES profiles(id),
    used_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS guardian_links (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    guardian_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    priority INTEGER DEFAULT 1,
    consented_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP,
    UNIQUE(owner_id, guardian_id)
);

CREATE TABLE IF NOT EXISTS incidents (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    client_event_id TEXT NOT NULL,
    trigger TEXT NOT NULL, -- 'manual', 'shake', 'voice', 'journey_timeout'
    status TEXT NOT NULL DEFAULT 'active', -- 'draft_local', 'pending_upload', 'active', 'acknowledged', 'resolved', 'expired'
    alert_status TEXT NOT NULL DEFAULT 'queued', -- 'queued', 'provider_accepted', 'provider_failed', 'guardian_acknowledged'
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMP,
    resolved_at TIMESTAMP,
    UNIQUE(owner_id, client_event_id)
);

CREATE TABLE IF NOT EXISTS incident_locations (
    id TEXT PRIMARY KEY,
    incident_id TEXT NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    accuracy_m REAL,
    captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alert_jobs (
    id TEXT PRIMARY KEY,
    incident_id TEXT NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    guardian_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    channel TEXT DEFAULT 'fcm',
    stage INTEGER DEFAULT 1,
    state TEXT DEFAULT 'queued', -- 'queued', 'sent', 'acknowledged', 'failed'
    provider_ref TEXT,
    attempt_count INTEGER DEFAULT 0,
    next_attempt_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(incident_id, guardian_id, channel, stage)
);

CREATE TABLE IF NOT EXISTS acknowledgements (
    id TEXT PRIMARY KEY,
    incident_id TEXT NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    guardian_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    note TEXT,
    acknowledged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(incident_id, guardian_id)
);

CREATE TABLE IF NOT EXISTS journeys (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    destination_label TEXT NOT NULL,
    eta_at TIMESTAMP NOT NULL,
    grace_seconds INTEGER DEFAULT 300,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'missed_check_in', 'cancelled'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_events (
    id TEXT PRIMARY KEY,
    actor_id TEXT NOT NULL,
    incident_id TEXT,
    event_type TEXT NOT NULL,
    minimal_metadata TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
