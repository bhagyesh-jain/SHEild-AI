# SHEild AI 2.0 — Canonical Monorepo Structure

> **v1.2 — EXISTING-PROJECT MIGRATION (authoritative):** SHEild AI 2.0 is an incremental migration of the supplied `SHEild-AI-main.zip`, not a greenfield application. Preserve the original code in Git history before restructuring. The migration and developer instructions below supersede any earlier wording that suggests creating a fresh mobile app or leaving the old project out of Git.


**Status:** FINAL v1.0, 24 September 2026. This is the agreed target structure, not a claim that the files already exist. Read alongside `architecture.md` and `design.md`.

## One authoritative repository layout

```text
SHEild-AI/
├── README.md
├── architecture.md                      # System behavior, contracts, workflow
├── design.md                            # UX, tokens, component specifications
├── folder-structure.md                  # This canonical path reference
├── .gitignore
├── .editorconfig
├── .github/
│   ├── CODEOWNERS
│   ├── pull_request_template.md
│   └── workflows/
│       ├── mobile.yml
│       ├── backend.yml
│       ├── guardian-web.yml
│       └── contracts.yml
├── docs/
│   ├── component-inventory.md           # Original snippet provenance, CSS/license/deps
│   ├── screen-flows.md
│   ├── accessibility-checklist.md
│   ├── threat-model.md
│   ├── privacy-and-retention.md
│   ├── mobile-testing.md               # Dev 1
│   ├── backend-runbook.md              # Dev 2
│   └── decisions/
│       └── 0001-stack.md
├── mobile/                               # Dev 1: Expo Router / React Native Android
│   ├── app.json
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── babel.config.js                   # Only if needed by installed versions
│   ├── .env.example
│   ├── app/
│   │   ├── _layout.tsx
│   │   ├── (auth)/
│   │   │   ├── sign-in.tsx
│   │   │   └── onboarding.tsx
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx                 # Home
│   │   │   ├── journey.tsx
│   │   │   ├── guardians.tsx
│   │   │   └── profile.tsx
│   │   ├── incident/
│   │   │   ├── activate.tsx
│   │   │   └── [id].tsx                  # Active incident / status
│   │   └── (drawer)/
│   │       ├── history.tsx
│   │       ├── notifications.tsx
│   │       ├── safety-preferences.tsx
│   │       ├── privacy.tsx
│   │       └── help.tsx
│   ├── src/
│   │   ├── theme/
│   │   │   ├── tokens.ts
│   │   │   ├── typography.ts
│   │   │   └── useAppTheme.ts
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── AppButton.tsx
│   │   │   │   ├── AppCard.tsx
│   │   │   │   ├── BottomSheet.tsx
│   │   │   │   ├── StatusBanner.tsx
│   │   │   │   ├── RoutineToast.tsx
│   │   │   │   └── AnimatedList.tsx
│   │   │   └── safety/
│   │   │       ├── EmergencySOSButton.tsx
│   │   │       ├── SOSCountdown.tsx
│   │   │       ├── AlertStatusTimeline.tsx
│   │   │       ├── SystemStatusCard.tsx
│   │   │       └── GuardianPreview.tsx
│   │   ├── features/
│   │   │   ├── sos/{hooks,utils}/
│   │   │   ├── journey/{components,hooks}/
│   │   │   ├── guardians/{components,hooks}/
│   │   │   ├── onboarding/
│   │   │   └── notifications/
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── auth.ts
│   │   │   ├── location.ts
│   │   │   ├── motion.ts
│   │   │   ├── notifications.ts
│   │   │   └── offline-outbox.ts
│   │   ├── state/
│   │   └── types/                     # Generated from approved OpenAPI
│   ├── assets/{fonts,images,sounds}/
│   └── __tests__/
├── backend/                              # Dev 2: FastAPI
│   ├── pyproject.toml
│   ├── .env.example
│   ├── app/
│   │   ├── main.py
│   │   ├── core/{config,security,logging}.py
│   │   ├── api/v1/
│   │   │   ├── router.py
│   │   │   ├── me.py
│   │   │   ├── devices.py
│   │   │   ├── guardians.py
│   │   │   ├── incidents.py
│   │   │   ├── locations.py
│   │   │   └── journeys.py
│   │   ├── schemas/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── services/
│   │   │   ├── alerts.py
│   │   │   ├── escalation.py
│   │   │   ├── locations.py
│   │   │   └── retention.py
│   │   ├── providers/{mock_fcm,fcm}.py
│   │   └── workers/
│   └── tests/{unit,integration,security}/
├── guardian-web/                         # Dev 2: React + Vite
│   ├── package.json
│   ├── package-lock.json
│   ├── .env.example
│   ├── src/
│   │   ├── app/
│   │   ├── theme/{tokens,global}.ts
│   │   ├── components/
│   │   │   ├── navigation/{CardNav,LineSidebar}/
│   │   │   ├── dashboard/{MagicBento,SpotlightCard,CountUp}/
│   │   │   ├── feedback/{SwipeToast,LatticeLoader}/
│   │   │   ├── lists/AnimatedList/
│   │   │   └── safety/{IncidentCard,AlertTimeline}/
│   │   ├── pages/{Overview,Incidents,IncidentDetail,Journeys,Contacts,Settings}/
│   │   ├── services/
│   │   └── types/
│   └── tests/
├── supabase/
│   ├── migrations/                      # Dev 2, reviewed by owner
│   └── seed/                            # Fake data only
├── packages/
│   ├── contracts/                       # Owner approves contract changes
│   │   ├── openapi.yaml
│   │   ├── examples/
│   │   └── README.md
│   └── design-tokens/                   # Owner approves semantic changes
│       ├── tokens.json
│       └── README.md
├── scripts/
│   ├── verify-contract.sh
│   └── smoke-test.sh
└── .antigravity/
    └── prompts/
        ├── 00-owner-scaffold.md
        ├── 01-mobile-dev.md
        ├── 02-backend-web-dev.md
        └── 03-integration.md
```

**Tree notation:** Curly braces are shorthand for separate folders/files, not literal folder names. `guardian-web/src/theme/{tokens,global}.ts` means appropriate separate token and global-style files (e.g., `tokens.ts`, `global.css`), not a `.ts` file containing CSS. Only create paths when needed; do not add empty placeholder modules simply to match this diagram.

## Source migration

1. Archive the original repository/ZIP in `archive/original-prototype` or a tagged commit before modifying it.
2. Move the existing `woman-safety-clean/` Expo application into `mobile/` as the **only** mobile app root. The root `src/app/` in the original ZIP is largely a separate Expo starter; do not merge it into the safety application.
3. Keep Expo Router `app/` at `mobile/app/` and implementation code in `mobile/src/`. Verify installed Expo SDK package compatibility before changing dependencies.
4. Build a custom Expo development client locally with Android Studio. No Expo Go is required.
5. Add `backend/`, `guardian-web/`, `supabase/` and `packages/` incrementally as their first tested feature is implemented.

## File ownership and PR review

| Path | Primary owner | Required reviewer |
|---|---|---|
| `mobile/**`, `docs/mobile-testing.md` | Dev 1 | Repo owner or Dev 2 for API-affecting changes |
| `backend/**`, `guardian-web/**`, `supabase/**`, `docs/backend-runbook.md` | Dev 2 | Repo owner; Dev 1 for contract-facing changes |
| `packages/contracts/**` | Dev 2 proposes | Repo owner approves; Dev 1 checks client compatibility |
| `packages/design-tokens/**`, root docs, CI | Repo owner | Both developers for emergency behavior and shared semantics |
| `docs/component-inventory.md`, `docs/screen-flows.md`, accessibility | Dev 1 drafts mobile; Dev 2 drafts web | Repo owner reconciles |

## Branch sequence

`chore/architecture-and-contract` (owner, merge first) → `feat/mobile-foundation` (Dev 1) and `feat/backend-foundation` (Dev 2) in parallel → small feature PRs → `feat/guardian-web` → `test/end-to-end` → optional `experiment/motion-ml`. Use separate local clones/workspaces; never allow two Antigravity agents to write the same working directory or force-push `main`.

## Shared contract and design rules

- `packages/contracts/openapi.yaml` is the only authoritative HTTP API contract. Generate or align TypeScript/Python types from it; use mock fixtures while the other developer works.
- `packages/design-tokens/tokens.json` is the single authoritative palette, spacing and typography definition. Web and native each implement their own rendering adapter.
- `architecture.md` controls behavior, consent, security and alert state semantics; `design.md` controls screens, component behavior, accessibility and animation.
- No client secrets, private coordinates, signing keys or real emergency contact numbers in Git. No claim that an FCM request was delivered or that a guardian responded unless the corresponding event exists.
- Original visual snippets are reference implementations only until their associated CSS, dependencies and usage licenses are checked. Never import browser-only code into React Native.

## First PR acceptance

The owner PR contains the three root documents, `.gitignore`, basic README, valid OpenAPI scaffold, design tokens, mock incident fixtures and CI skeleton. The mobile and backend developers branch **only after this PR is merged**. The guardian web can start with API mocks, but real acknowledgement and consent checks must be integrated before MVP sign-off.


## Existing repository: exact migration map and branch gates (v1.2; authoritative)

| Existing ZIP path | Target or disposition | Owner |
|---|---|---|
| `SHEild-AI-main/woman-safety-clean/app/` | `mobile/app/`; refactor routes after baseline test | Owner migration PR, then Dev 1 |
| `woman-safety-clean/components/`, `hooks/`, `constants/` | `mobile/src/` after reviewing each import and dependency; temporary old locations acceptable during a tested incremental migration | Dev 1 |
| `woman-safety-clean/assets/` including `siren.wav` | `mobile/assets/`; retain licensing/provenance | Dev 1 |
| `woman-safety-clean/package.json`, `package-lock.json`, `app.json`, `tsconfig.json` | `mobile/` root; preserve lockfile and verify Expo SDK compatibility | Owner migration PR + Dev 1 |
| Root `src/app/`, root `package.json`, root `assets/` | Separate Expo starter: preserve in `v1-prototype` Git history; do not merge into active mobile app | Owner |
| Existing `README.md`, `.gitignore` | Review and update for monorepo; preserve project credit and setup information | Owner |
| New `backend/`, `guardian-web/`, `supabase/`, `packages/` | Add incrementally according to the canonical tree above | Dev 2/shared approval |

**Correct order for an existing GitHub repository:** inspect and commit the original source if not yet tracked → audit for secrets → tag `v1-prototype` and preserve `legacy/sheild-ai-v1` → owner merges `chore/architecture-and-contract` with the three docs, OpenAPI scaffold, design tokens and mocks → owner merges `chore/migrate-existing-mobile` moving the nested app to `mobile/` and removing the unused root starter from active `main` → both developers branch from the same updated `main` as `feat/mobile-foundation` and `feat/backend-foundation`. If the original source is already in Git, do not duplicate it or rewrite history. If the source is not yet in Git, import it safely first.

**Migration PR acceptance:** clean `git status`, only one active Expo app, lockfile kept, assets preserved, no credentials committed, native Android build/install verified or clearly documented blocker, baseline features inventoried, and all changes reviewable as a move/refactor rather than a generated replacement. `architecture.md` §16 and `design.md` §15 provide the updated execution prompts.
