# SHEild AI 2.0 — Architecture, Two-Developer Workflow & Antigravity Build Guide

> **v1.2 — EXISTING-PROJECT MIGRATION (authoritative):** SHEild AI 2.0 is an incremental migration of the supplied `SHEild-AI-main.zip`, not a greenfield application. Preserve the original code in Git history before restructuring. The migration and developer instructions below supersede any earlier wording that suggests creating a fresh mobile app or leaving the old project out of Git.


**Status:** FINAL v1.0 specification (24 September 2026); implementation and safety validation pending. This is not a claim of emergency reliability.  
**Platform:** Android-first; React Native + Expo custom development build (NOT Expo Go), FastAPI, Supabase PostgreSQL/Auth, Firebase Cloud Messaging (FCM).  
**Team:** Dev 1 — Mobile & Android; Dev 2 — Backend, database & guardian web.  
**Repository:** Existing SHEild AI GitHub repository (owner inserts actual URL); use feature branches and pull requests.

## 0. Source-code audit and migration decision

The supplied ZIP `SHEild-AI-main.zip` contains **two app roots**: root `src/app/` (largely Expo starter) and `woman-safety-clean/` (the relevant safety prototype). The latter uses Expo SDK ~54, React Native 0.81.5, Expo Router, `expo-location`, `expo-sensors`, `react-native-maps`, and an audio siren. Its `app/(tabs)/index.tsx` uses an accelerometer magnitude threshold >2.4, requests foreground location, creates a WhatsApp message and opens the phone dialer. Opening another app is **not** verified alert delivery. There is no demonstrated backend, multi-contact incident lifecycle, authenticated guardian workflow, or trained AI model in this ZIP.

**Migration:** Preserve the ZIP on `archive/original-prototype` (or a release/tag), then make the actual `woman-safety-clean` code the **single** app under `mobile/`. Do not blindly merge the root starter app. Preserve original attribution/assets and remove hard-coded phone numbers and secrets. Check dependency compatibility with the installed Expo SDK before upgrading; do not force mismatched versions. Replace deprecated or incompatible packages only after a local Android build proves necessary.

## 1. Product statement and boundaries

**Problem:** A user may be unable to navigate a phone in distress; a sent message may not be delivered; a delivered message may not be acknowledged. SHEild AI 2.0 aims to reduce the gap between activation and trusted-contact acknowledgement, with optional journey check-ins and clear failure states.

**Users:** (1) App user who opts in and owns their safety session; (2) invited trusted guardian who explicitly accepts; (3) optional project admin who sees aggregate operational health, **not** private location by default.

**MVP:** deliberate hold-to-activate SOS with an accessible tap-and-confirm alternative; deliberate-shake activation with countdown; multiple verified/invited contacts; server-side incident creation; FCM alerts with honest statuses; guardian acknowledgement; consent-based, expiring live-location session; safe-journey missed check-in; in-app link to official emergency dialer; on-device incident queue with clear unsent status. Android first.

**Not MVP:** autonomous crime prediction, continuous microphone recording, automatic police dispatch, stealth tracking, guarantee of rescue, guaranteed offline delivery, unrestricted SMS sending, public crime maps. ML motion detection is a later, measured experiment; the manual SOS must work without AI.

**Critical safety rule:** Never claim push sent == delivered == seen == acknowledged. FCM acceptance means provider accepted the request, not that a human received or read it. In no-network conditions store locally, visibly indicate **not sent**, offer device-supported SMS/dialer when available, and retry with bounded backoff when online. Calls and SMS require user confirmation unless platform permissions and policies explicitly allow a different flow. No unauthorized 112 integration.

## 2. Logical architecture

```text
Android mobile (Expo custom dev build)
  Expo Router UI / session state / local encrypted auth tokens
  Manual SOS / motion gesture / foreground location / journey check-in
  Offline outbox + connectivity monitor + push registration
          | HTTPS + Supabase JWT; client-generated idempotency key
          v
FastAPI (versioned /api/v1)
  JWT verification + object-level authorization + rate limits
  Contacts / consent / incidents / location sessions / journeys
  Alert orchestrator + audit events + retryable background worker
       |                  |                   |
       v                  v                   v
Supabase Postgres       FCM                 Optional paid SMS gateway
(RLS + PostGIS         push accepted        (future, not assumed free)
 where useful)         != delivered
       ^
       | authenticated, scoped HTTPS / Realtime
Guardian web (responsive React/Next.js or minimal React/Vite)
  Invite acceptance / incident acknowledgement / expiring location view
```

**Hosting:** Local FastAPI + Supabase free project + FCM for development. A publicly reachable HTTPS backend is required for cross-network demos; free hosting may sleep or change limits, so do not present a sleeping free-tier host as production emergency infrastructure. Use mock providers in CI. PostGIS is optional for MVP; no paid map API is required for basic coordinates/maps if licensing and tile-use limits are respected.

## 3. User workflows and state machines

### 3.1 Enrollment
1. Register/sign in with Supabase Auth; verify token server-side. Explain limitations and request **only necessary** permissions in context.
2. Invite guardian via one-time, short-lived token/link; guardian authenticates, sees inviter identity, accepts or rejects. Do not silently register arbitrary phone numbers as consented guardians.
3. User selects guardian order and location-sharing preferences; server stores membership, consent timestamp and revocation.
4. Register FCM token per device; refresh/revoke on logout and rotation.

### 3.2 SOS lifecycle
1. User completes the deliberate SOS hold, uses accessible tap-and-confirm, or triggers a deliberate gesture; display an accessible 3-second cancellation countdown, with a clear immediate-send option. Prevent duplicate triggers.
2. Client generates `client_event_id` UUID, stores pending incident in encrypted local outbox, captures current GPS or timestamped last known location and accuracy. GPS failure must not block SOS.
3. POST incident with `Idempotency-Key`; API atomically creates incident and first alert jobs. Client marks **server accepted** only after confirmed response.
4. Worker attempts push to consented guardians. Track `queued`, `provider_accepted`, `provider_failed`, and guardian `acknowledged`; do not invent device delivery/read receipts.
5. After configurable acknowledgement timeout, escalate to next opted-in guardian. Escalation stops on valid acknowledgement or closure; prevent duplicate notifications using unique job keys.
6. While active, user explicitly enables time-limited location updates. Guardian can access only an incident for which they are authorized. User can stop sharing immediately; expiration also enforced server-side.
7. User can mark safe and close. If safety is uncertain, do not allow a guardian to silently erase the user's incident. Preserve minimal audit events and purge precise location per retention policy.
8. Offer 112 dialer action in India; this is a dialer handoff, not emergency-service integration.

**States:** `draft_local -> pending_upload -> active -> acknowledged -> resolved` with parallel `failed_upload`, `cancelled_before_send`, `expired`; incident `active` and alert delivery state are distinct. Server owns authoritative state transitions. Acknowledgement is not proof of rescue.

### 3.3 Safe Journey
User sets destination label, estimated arrival, selected guardians, and check-in grace period. Server schedules reminder; mobile prompts at ETA. If no response after grace period, create `missed_check_in` notification (not automatically a confirmed attack). Optional escalation requires user opt-in. Location sampling occurs only while user opted into active journey and permissions permit. Journey automatically expires; allow cancellation at any time.

### 3.4 No network / device restrictions
Keep SOS request locally encrypted with clear **NOT SENT** warning; allow emergency dialer and SMS composer where supported. Retry queued incident on reconnection with same idempotency key. If device is switched off, has no cellular signal, has restricted background execution, or GPS is blocked, the app cannot promise remote help. Test foreground, background, force-stop and reboot separately; Android may prohibit some operations after force-stop.

## 4. API contract (freeze before parallel implementation)

Base `/api/v1`; `Authorization: Bearer <Supabase access token>`; ISO-8601 UTC timestamps; UUID identifiers; JSON error envelope `{ "error": { "code": "...", "message": "...", "request_id": "..." } }`. Rate-limit auth-sensitive and alert routes. No service-role key in mobile/web clients.

| Method | Path | Owner | Purpose |
|---|---|---|---|
| GET | `/me` | Backend | Authenticated profile + setup status |
| POST | `/devices` | Backend | Register/rotate FCM token |
| POST | `/guardian-invites` | Backend | Create short-lived invite |
| POST | `/guardian-invites/{token}/accept` | Backend | Guardian opts in |
| GET | `/guardians` | Backend | Accepted guardians and order |
| DELETE | `/guardians/{id}` | Backend | Revoke access and active links |
| POST | `/incidents` | Backend | Idempotent SOS or missed check-in |
| GET | `/incidents/{id}` | Backend | Owner or authorized guardian view |
| POST | `/incidents/{id}/acknowledge` | Backend | Guardian acknowledgement |
| POST | `/incidents/{id}/resolve` | Backend | User resolves own incident |
| POST | `/incidents/{id}/locations` | Backend | Time-limited location update |
| GET | `/incidents/{id}/locations/latest` | Backend | Scoped guardian/owner access |
| POST | `/journeys` | Backend | Create opted-in journey |
| POST | `/journeys/{id}/check-in` | Backend | Confirm arrival |
| POST | `/journeys/{id}/cancel` | Backend | End journey |
| GET | `/health/live` | Backend | Process health, no secrets |

**Example create request:**
```json
{
  "client_event_id": "b3c9266c-2f45-4c29-8f1c-62e13017931e",
  "trigger": "manual",
  "occurred_at": "2026-09-24T09:00:00Z",
  "location": {"latitude": 22.7196, "longitude": 75.8577, "accuracy_m": 30, "captured_at": "2026-09-24T08:59:58Z"},
  "share_location": true
}
```
Example response: `201 {"id":"<uuid>","status":"active","alert_status":"queued","created_at":"<utc>"}`. Duplicate `client_event_id` for the same user returns same incident and does not enqueue duplicate alerts. Avoid logging precise coordinates or tokens.

**Shared contract artifacts:** `packages/contracts/openapi.yaml`, `packages/contracts/examples/`, `packages/contracts/README.md`. Backend owns canonical OpenAPI and generates typed client or commits compatible types; mobile must not invent response fields. Contract changes require both developers' approval.

## 5. Database schema and security

Tables (UUID primary keys, UTC timestamps, indexes on owner/status/created_at):
- `profiles(user_id PK -> auth.users, display_name, created_at)`
- `devices(id, user_id, fcm_token_encrypted, platform, last_seen_at, revoked_at)`
- `guardian_invites(id, owner_id, token_hash, expires_at, accepted_by, used_at)`
- `guardian_links(id, owner_id, guardian_id, priority, consented_at, revoked_at, UNIQUE(owner_id,guardian_id))`
- `incidents(id, owner_id, client_event_id, trigger, status, started_at, resolved_at, UNIQUE(owner_id,client_event_id))`
- `incident_locations(id, incident_id, lat, lon, accuracy_m, captured_at, expires_at)`
- `alert_jobs(id, incident_id, guardian_id, channel, stage, state, provider_ref, attempt_count, next_attempt_at, UNIQUE(incident_id,guardian_id,channel,stage))`
- `acknowledgements(id, incident_id, guardian_id, acknowledged_at, UNIQUE(incident_id,guardian_id))`
- `journeys(id, owner_id, destination_label, eta_at, grace_seconds, status, expires_at)`
- `audit_events(id, actor_id, incident_id, event_type, created_at, minimal_metadata)`

**Authorization:** Supabase JWT verified against project JWKS/issuer/audience (with key rotation); backend checks owner/accepted guardian for **every** incident and location read. Enable RLS on exposed tables; prefer backend-mediated access and restrict client direct table grants. Backend service credentials stay server-side. Revoke guardian access immediately and invalidate active viewing permissions. Signed links must be short-lived and bound to authenticated users. Encrypt in transit; minimize precise location retention (suggest 24–72 hours after resolution, configurable, document actual choice). Account deletion must cascade/anonymize appropriately; do not store raw audio or unneeded location history.

## 6. Ownership and no-conflict rules

**Dev 1 owns:** `mobile/**`, Android native config and physical-device tests, `docs/mobile-testing.md`. Implements UI, sensors, foreground/background permissions, local outbox, typed API client, FCM token registration and push handling. Does not edit `backend/**` or DB migrations except via reviewed PR.

**Dev 2 owns:** `backend/**`, `supabase/migrations/**`, `guardian-web/**`, `docs/backend-runbook.md`, canonical `packages/contracts/openapi.yaml`. Implements authorization, alert orchestration, idempotency, guardian invites/acknowledgements, journey scheduling, retention jobs and mock FCM provider. Does not edit `mobile/**` except reviewed PR.

**Shared:** `architecture.md`, `design.md`, `folder-structure.md`, `README.md`, CI, contract changes, integration tests, threat model and emergency-state design approval. One PR per feature; no direct pushes to `main`; no rebasing another developer's branch; require tests and one review for shared files. Use feature flags/mock providers so both can develop before the other finishes.

## 7. Proposed monorepo file tree

```text
SHEild-AI/
├── architecture.md
├── design.md
├── folder-structure.md
├── README.md
├── .gitignore
├── .github/
│   ├── CODEOWNERS
│   ├── pull_request_template.md
│   └── workflows/ci.yml
├── docs/
│   ├── component-inventory.md
│   ├── screen-flows.md
│   ├── accessibility-checklist.md
│   ├── decisions/0001-stack.md
│   ├── threat-model.md
│   ├── privacy-and-retention.md
│   ├── mobile-testing.md
│   └── backend-runbook.md
├── mobile/                         # Dev 1; migrated woman-safety-clean
│   ├── app.json
│   ├── package.json
│   ├── .env.example
│   ├── app/
│   │   ├── _layout.tsx
│   │   ├── (auth)/sign-in.tsx
│   │   ├── (tabs)/index.tsx
│   │   ├── (tabs)/journey.tsx
│   │   ├── (tabs)/guardians.tsx
│   │   ├── (tabs)/settings.tsx
│   │   └── incident/[id].tsx
│   ├── src/
│   │   ├── theme/{tokens,typography}.ts
│   │   ├── components/ui/
│   │   ├── components/safety/
│   │   ├── features/sos/
│   │   ├── features/journey/
│   │   ├── features/guardians/
│   │   ├── services/api.ts
│   │   ├── services/auth.ts
│   │   ├── services/location.ts
│   │   ├── services/motion.ts
│   │   ├── services/notifications.ts
│   │   ├── services/offline-outbox.ts
│   │   ├── state/
│   │   └── types/                  # generated or contract-aligned
│   ├── assets/
│   └── __tests__/
├── backend/                        # Dev 2
│   ├── pyproject.toml
│   ├── .env.example
│   ├── app/
│   │   ├── main.py
│   │   ├── core/config.py
│   │   ├── core/security.py
│   │   ├── api/v1/{me,devices,guardians,incidents,journeys}.py
│   │   ├── schemas/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── services/{alerts,escalation,locations,retention}.py
│   │   └── workers/
│   └── tests/{unit,integration,security}/
├── guardian-web/                   # Dev 2, after backend MVP
│   ├── package.json
│   ├── .env.example
│   └── src/{pages,components,services,theme}/
├── supabase/
│   ├── migrations/
│   └── seed/                        # fake records ONLY
├── packages/design-tokens/          # semantic tokens shared, not UI code
├── packages/contracts/
│   ├── openapi.yaml
│   ├── examples/
│   └── README.md
└── scripts/
    ├── verify-contract.sh
    └── smoke-test.sh
```

Use real file names rather than literally creating `{...}` directories; tree braces are shorthand. Keep Android `android/` generation strategy explicit: if generated with `expo prebuild`, document whether checked in; any manual native change must survive regeneration via config plugin or checked-in native project.

### 7.1 Canonical structure rule

The **root-level `mobile/`, `backend/`, and `guardian-web/`** layout in this document and `folder-structure.md` is canonical. Do not create an `apps/` wrapper from earlier drafts. `mobile/app/` contains Expo Router route files only; `mobile/src/` contains reusable implementation. `packages/design-tokens/` is the only shared visual source; native and web renderers remain separate. The repo owner approves all changes to `packages/contracts/`, `packages/design-tokens/`, `architecture.md`, `design.md` and `folder-structure.md`.

## 8. GitHub branches and merge order

```bash
# Repo owner first: create repo and archive original code (do not overwrite existing work).
git checkout -b chore/architecture-and-contract
# Commit this document, directory skeleton, .gitignore, initial OpenAPI + mock fixtures.
git add . && git commit -m "docs: define SHEild AI 2.0 architecture and API contract"
git push -u origin chore/architecture-and-contract
# Open PR -> review -> merge to main. Protect main if repository settings permit.

# Both devs start from the same updated main:
git checkout main && git pull origin main
# Dev 1:
git checkout -b feat/mobile-foundation
git push -u origin feat/mobile-foundation
# Dev 2 (separate clone):
git checkout -b feat/backend-foundation
git push -u origin feat/backend-foundation
```

Subsequent branches: `feat/mobile-sos`, `feat/mobile-journey`, `feat/backend-incidents`, `feat/backend-alerts`, `feat/guardian-web`, `test/end-to-end`. PR flow: branch -> commits -> push -> PR to `main` -> CI -> review -> merge -> pull main -> next branch. Do not create two long-lived branches that diverge for weeks; merge small, independently testable slices frequently. Repo owner resolves shared-contract conflicts.

**Merge milestones:** (M0) architecture + contract + mock fixtures; (M1) mobile local build + backend auth/health; (M2) end-to-end SOS using mock push; (M3) real FCM + acknowledgement; (M4) location sharing + guardian dashboard; (M5) journey + reliability testing; (M6) optional experimental ML.

## 9. Definition of done and test matrix

**Every PR:** formatting/lint, TypeScript check or Python type check, unit tests, no leaked secrets, API examples updated if changed, screenshots or short test evidence, clear rollback note. CI runs independently for `mobile` and `backend` and validates OpenAPI.

**MVP acceptance (demonstrated, not assumed):**
1. On two real Android devices, user initiates SOS and authenticated guardian receives a push (with a record of FCM acceptance, separate from guardian acknowledgement).
2. Guardian acknowledges, server records identity/time, escalation stops; if no acknowledgement by timeout, second opted-in guardian is queued.
3. Duplicate incident POST with same key creates one incident and no duplicate first-stage jobs.
4. Guardian who is not linked to the user receives 403 on incident/location routes; revoked guardian loses access immediately.
5. With GPS denied, SOS still creates an incident and shows location unavailable; with internet off, app clearly shows not sent and queues retry.
6. User can stop live sharing and close incident; old location links stop working; expiry job deletes location according to policy.
7. App is tested on locked screen, background, force-stop, reboot, battery saver and denied notification permission; document **observed** limitations.
8. Test cancellation, accidental shake, duplicate tap, slow network, stale location, token rotation and notification failure.

**Evaluation metrics:** manual SOS success rate under defined test conditions; p50/p95 time from tap to backend acceptance and from backend acceptance to guardian acknowledgement; false alarms/hour for gesture detector; battery drain/hour in journey mode; unauthorized-access tests passed. State sample sizes and device models. No invented production accuracy or delivery guarantees.

## 10. Security and abuse cases

Threats: malicious guardian tracking, stolen invite links, leaked service keys, spoofed location, repeated alert spam, false SOS, compromised device, push token leakage, location retained indefinitely. Controls: explicit guardian consent, object-level authorization, short-lived single-use invite tokens stored as hashes, revocation, bounded retention, TLS, secrets in server env, rate limits, idempotency, minimal audit logs, location-sharing indicator and one-tap stop. Do not expose exact user coordinates in public links, analytics, CI logs or demo recordings. Use simulated test incidents and clearly marked demo mode; never automatically contact real emergency services during tests.

## 11. Local setup (Windows PowerShell examples)

Prerequisites: Git, Node LTS compatible with selected Expo SDK, Android Studio + Android SDK, Java version supported by Android Gradle plugin, Python 3.11+, Supabase project, Firebase project. Pin versions after first successful build. Do not commit `.env`, `google-services.json`, service account JSON, APK signing keys or personal test coordinates.

```powershell
# Dev 1: after architecture merged and mobile/ migrated
cd mobile
npm ci
npx expo install expo-dev-client
npx expo-doctor
npx expo run:android    # Android Studio SDK + USB device or emulator required

# Dev 2: from repository root
cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e ".[dev]"
python -m uvicorn app.main:app --reload --port 8000
# Android emulator accesses host via 10.0.2.2:8000; physical device uses LAN IP
# or an explicitly configured HTTPS dev tunnel. Never use localhost on phone.
```

Use `.env.example` placeholders: mobile `EXPO_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`; backend `SUPABASE_URL`, `SUPABASE_JWT_ISSUER`, `SUPABASE_JWT_AUDIENCE`, `SUPABASE_JWKS_URL`, `DATABASE_URL`, `FCM_CREDENTIALS_PATH`, `ALERT_PROVIDER=mock`, `LOCATION_RETENTION_HOURS=48`. Exact auth verification settings depend on your Supabase JWT configuration; confirm before implementation. `EXPO_PUBLIC_*` values are public, **never** put service role secrets there.

## 12. Antigravity prompts (paste separately in each developer's own workspace)

### Prompt A — Repo owner: architecture + skeleton (run first)

> You are the lead engineer for SHEild AI 2.0, an Android-first emergency alert and guardian coordination MVP. Read `architecture.md`, `design.md` and `folder-structure.md` completely before modifying anything. Inspect the existing ZIP/repository; there are two Expo roots, and the safety prototype is `woman-safety-clean`. Do not claim the starter root is the production app. Preserve original code in an archive branch/tag. Propose a minimal monorepo skeleton matching architecture.md, add a root README, gitignore, CODEOWNERS placeholder, PR template, CI skeleton, and a **real valid** initial OpenAPI 3.1 document for the agreed MVP endpoints with request/response/error schemas and examples. No credentials, fake success claims, or speculative police integrations. First output a file-by-file plan, API assumptions and commands; then implement only architecture/contracts/scaffolding on `chore/architecture-and-contract`. Do not modify live user data. Run validation and report exact test results, remaining TODOs, changed files and commit message. Stop before pushing unless the user authorizes the target repo and branch.

### Prompt B — Dev 1: mobile + Android

> You own ONLY `mobile/**` and `docs/mobile-testing.md` in SHEild AI 2.0. Read `architecture.md`, `design.md`, `folder-structure.md` and `packages/contracts/openapi.yaml` first. Work on `feat/mobile-foundation` from updated main. Migrate `woman-safety-clean` into `mobile/`; avoid mixing with the root Expo starter. Keep React Native/Expo Router, configure a LOCAL custom Expo development build (no Expo Go), Android SDK and permission prompts. Implement typed API client strictly from OpenAPI, Supabase sign-in, user setup, accepted guardians UI, hold-to-activate SOS with accessible tap-and-confirm and optional short cancellation, guarded shake gesture, location permission handling, incident status UI, secure local outbox with idempotency UUID, mockable push registration, and a simple journey check-in screen. Build accessible UI and explicit states `not sent`, `server accepted`, `provider accepted`, `acknowledged`; never claim guaranteed delivery. Do not hardcode a phone number, backend secrets or live GPS data. Handle permission denial, offline and GPS unavailable without blocking manual SOS. Do not create backend endpoints or edit database migrations. If contract gaps arise, open a small contract-change proposal and use mocks until approved. Run `npm ci`, lint, TypeScript checks and `npx expo run:android` where SDK/device available; report actual results and limitations. Commit only owned paths and open PR to main after review; never force-push main.

### Prompt C — Dev 2: backend + guardian dashboard

> You own ONLY `backend/**`, `supabase/migrations/**`, `guardian-web/**`, `docs/backend-runbook.md`, and canonical `packages/contracts/openapi.yaml` in SHEild AI 2.0. Read `architecture.md`, `design.md`, `folder-structure.md` and the shared contract before writing code. Work on `feat/backend-foundation` from updated main. Implement FastAPI `/api/v1`, Supabase JWT validation against the configured JWKS/issuer/audience, strict per-resource authorization, migrations for profiles/guardian links/invites/incidents/locations/alert jobs/acknowledgements/journeys/audit, invite acceptance and revocation, idempotent incident creation, mockable alert provider, FCM adapter, bounded retry and acknowledgement escalation, short-lived consent-based location access, journey grace-period jobs and location retention. Start with mock FCM for integration tests. Provide stable OpenAPI examples and a seed dataset with FAKE users and locations. Build a minimal responsive guardian web app only after auth, incidents and acknowledgement APIs pass. Never claim FCM provider acceptance is device delivery; never embed server keys in mobile/web. Do not edit `mobile/**`. Add unit/integration/security tests for duplicate incident requests, unauthorized location reads, revoked guardians, retries and expired links. Run migrations on a disposable test database first. Document local setup, tests, API examples and operational failure modes. Commit owned paths and open PR to main after review; no force-push to main.

### Prompt D — Integration and QA (both devs after M2)

> Act as SHEild AI 2.0 integration engineer. Read `architecture.md`, `design.md`, `folder-structure.md`, latest `packages/contracts/openapi.yaml`, and both merged PRs. Do not regenerate or overwrite working modules. Run a contract-diff check; connect the mobile typed API client to FastAPI using test users and mock alerts; execute the SOS-to-acknowledgement scenario and failure matrix. Verify no duplicate alerts on retries, guardian 403 after revocation, clear offline unsent state, GPS denial handling, expiry of location sessions and absence of secrets in commits. Then enable real FCM in a separate controlled test with two opted-in physical Android devices. Record test environment, observed p50/p95 timings, logs with redacted coordinates, failures and exact reproduction steps. Create focused fix PRs by file owner. Do not describe simulated results as real tests or automatically contact 112.

### Prompt E — Experimental AI, only after reliable MVP

> Read architecture.md and measured baseline gesture detector results. Design an **optional on-device** motion-gesture classifier using consented simulated accelerometer/gyroscope samples. Split training/test by participant and device where feasible to avoid leakage; compare against the fixed-threshold baseline on precision, recall, false positives per hour, latency and battery use. Provide dataset provenance, opt-in/withdrawal plan and evaluation scripts. The model may suggest SOS with cancellation, but must never prevent manual SOS or autonomously infer that a crime is occurring. Do not implement continuous audio surveillance. If the model does not outperform the baseline under agreed criteria, keep the baseline and document the negative result.

## 13. First-day checklist for both developers

- Owner confirms GitHub repo URL, invites both collaborators with appropriate access, creates archive branch/tag and merges M0 contract PR.
- Dev 1 and Dev 2 independently clone the same `main`, create their respective branches and paste their own prompts into separate Antigravity workspaces.
- Agree on auth strategy, API base URL, incident schemas, mock fixtures and FCM mock contract in a 30-minute kickoff.
- Daily: each developer posts branch, latest commit, completed endpoints/screens, blocked contract changes and passing/failing tests. Integrate via small PRs every 1–2 days.
- Do not expose a public production emergency service during student testing; clearly label prototype and use consented test contacts.

## 14. References to validate during implementation

- Expo development builds: https://docs.expo.dev/develop/development-builds/introduction/
- Local Android builds: https://docs.expo.dev/get-started/set-up-your-environment/
- React Native Android environment: https://reactnative.dev/docs/set-up-your-environment
- Android background location: https://developer.android.com/develop/sensors-and-location/location/permissions/background
- Android foreground services: https://developer.android.com/develop/background-work/services/fgs
- Supabase Auth: https://supabase.com/docs/guides/auth
- Firebase Cloud Messaging: https://firebase.google.com/docs/cloud-messaging
- FastAPI: https://fastapi.tiangolo.com/

**Decision gate:** The project is a safety-critical *prototype*. No real-world dependability claim until a documented reliability/security review, device testing and an operational response agreement exist.

## 15. Finalized product and team decisions (v1.0)

- **Identity:** Calm Guardian light mode; Midnight Shield dark mode; Plus Jakarta Sans headings and Inter body. Semantic tokens are specified in `design.md`.
- **Navigation:** mobile bottom tabs Home/Journey/Guardians/Profile; drawer for history, notifications, privacy, help and settings. SOS never lives only in a drawer. Guardian web uses desktop LineSidebar and compact CardNav.
- **Primary emergency action:** raised red Power-Smash-inspired button with HoldButton-style native progress (prototype 1.8 seconds); accessible tap-and-confirm alternative; optional 3-second cancellation countdown with Send Now. The hold duration is a prototype setting subject to user testing, not a verified safety optimum.
- **Motion:** routine UI only; no decorative animations, auto-dismissing critical messages or misleading loaders during active incidents.
- **Scope:** guardian web is part of the MVP for acknowledgement and time-limited location viewing; visual extras can follow after functional integration. AI and Radar remain optional post-MVP experiments/decorations, never required for emergency operation.
- **Responsibilities:** Dev 1 owns `mobile/**`, `docs/mobile-testing.md`; Dev 2 owns `backend/**`, `guardian-web/**`, `supabase/**`, `docs/backend-runbook.md`. Dev 2 proposes API edits, but **repo owner merges the frozen contract** after Dev 1 reviews compatibility. Repo owner owns root docs, shared tokens, CI and cross-app acceptance.
- **Design gate:** neither developer invents a new palette, alternate status vocabulary or parallel folder layout. Both use the same contract fixtures and shared semantic tokens.
- **Delivery gate:** an AI-generated implementation is not considered tested until checks actually run; safety features must be verified on physical Android devices with consented test contacts.


## 16. Existing-source migration and revised execution plan (v1.2; overrides conflicting earlier instructions)

**Verified source layout:** The supplied `SHEild-AI-main.zip` contains a root Expo starter (`src/app/`, root `package.json`) and a nested `woman-safety-clean/` Expo app with its own `app/`, `package.json`, lockfile and `assets/siren.wav`. The nested app is the migration candidate; it must be audited and run before assuming any functionality works. Do not merge the two Expo roots or copy generated dependencies. The ZIP does not establish that the app has production-ready emergency delivery, backend or guardians.

**Owner, before assigning work:** (1) Put the existing source under version control without secrets and record a baseline commit; if the GitHub repo already contains the source, tag its existing baseline rather than re-uploading duplicates. (2) Tag that baseline `v1-prototype` and/or create `legacy/sheild-ai-v1` at the same commit. (3) On a separate `chore/architecture-and-contract` branch, commit the three updated planning documents and agreed OpenAPI scaffold/mock fixtures/design tokens. (4) On `chore/migrate-existing-mobile` move `woman-safety-clean/` into `mobile/` with Git-aware moves where practical, preserving its `package-lock.json`, assets and attribution. Leave the unused root Expo starter out of the active monorepo, but retain it in baseline history. (5) Resolve any branch ordering conflicts: the owner merges docs/contracts and mobile migration to `main` **before** both developers branch from that same commit. Protect `main` and require PR review.

**Dev 1:** First run and document the *existing* nested Expo application (Node/Expo versions, install, Android build, location permission, shake behavior, SOS behavior, broken imports). Migrate/refactor it in `mobile/`; keep reusable logic/assets, remove unused starter screens and avoid rewriting functioning code merely for style. Then implement the `design.md` native design system and manual SOS integration. Verify the custom Android development build; do not treat Expo Go as proof of native behavior. Document retained/replaced features and regression tests in `docs/mobile-testing.md`.

**Dev 2:** Start from the agreed OpenAPI contract and mocks. Build FastAPI, Supabase migrations/RLS, incident state machine, notification attempts and guardian web independently of mobile UI. Confirm auth/token, idempotency, incident response and acknowledgement semantics with Dev 1 early. Do not claim an FCM send request equals human delivery.

**First shared milestone:** A clean Android build of the migrated app and a backend health/auth endpoint; next, an end-to-end manual SOS incident with accurate status and guardian acknowledgement. Only then prioritize advanced visual effects, motion ML or automated escalation.

**Git commands (adapt branch creation to existing repo state):**

```bash
git status --short                     # inspect before adding files
git switch main && git pull --ff-only
# Only if baseline is not already committed: review files and commit the safe existing source.
git tag v1-prototype                 # after baseline is committed
git branch legacy/sheild-ai-v1 v1-prototype
git push origin v1-prototype legacy/sheild-ai-v1
git switch -c chore/architecture-and-contract
# Add architecture.md, design.md, folder-structure.md, OpenAPI scaffold and mock fixtures.
# PR -> main; then migrate existing app on chore/migrate-existing-mobile -> PR -> main.
# Only after both PRs merge, each developer creates their assigned branch from updated main.
```

**Repository hygiene:** Inspect tracked files for `.env`, API keys, tokens, real contacts/coordinates and Android signing material before any push; rotate exposed credentials if discovered. Exclude `node_modules`, `.expo`, build outputs, caches and `.env*` except explicitly safe `.env.example`. Keep license/attribution records for supplied animation snippets; source snippets are references, not assumed compatible native modules.
