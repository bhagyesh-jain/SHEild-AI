# SHEild AI 2.0 — Design System & Interaction Specification

> **v1.2 — EXISTING-PROJECT MIGRATION (authoritative):** SHEild AI 2.0 is an incremental migration of the supplied `SHEild-AI-main.zip`, not a greenfield application. Preserve the original code in Git history before restructuring. The migration and developer instructions below supersede any earlier wording that suggests creating a fresh mobile app or leaving the old project out of Git.


**Status:** FINAL v1.1 design specification (24 September 2026); implementation and usability testing pending.  
**Companion:** `architecture.md` defines architecture, API contracts, workflows and ownership. This document defines visual design, navigation, reusable components, motion and accessibility.  
**Design principle:** **Calm by default. Unmistakable in emergencies.**

## 1. Product surfaces

1. **Mobile user app:** React Native with a custom Expo development build. Touch-first, accessible, fast, battery-conscious. Do not copy web DOM, Tailwind classes, `motion/react`, `ogl` or browser event handlers directly into React Native.
2. **Guardian web dashboard:** React web app. Can reuse or adapt the supplied web component concepts and their CSS, subject to dependency/license review and accessibility testing.
3. **Emergency mode:** Separate minimal interaction state. No decorative effects, hidden essential actions, auto-dismissing critical messages or complex navigation.

## 2. Visual identity — finalized Calm Guardian / Midnight Shield

Color psychology is a design hypothesis, not a guarantee of emotional response. Test palette and emergency discoverability with actual users.

| Semantic token | Light | Dark | Use |
|---|---|---|---|
| `background` | `#F7F9F8` | `#101827` | App background |
| `surface` | `#FFFFFF` | `#253650` | Cards, sheets |
| `surface-muted` | `#E4EFEC` | `#1B2A3B` | Secondary containers |
| `text-primary` | `#142D3E` | `#F1F5F9` | Main text |
| `text-secondary` | `#516674` | `#B5C2D5` | Descriptions |
| `primary` | `#137C78` | `#42D6BD` | Navigation, ordinary CTAs |
| `emergency` | `#D92D3A` | `#FF5364` | SOS and confirmed emergency state only |
| `warning` | `#B45309` | `#FBBF24` | Pending / degraded state |
| `border` | `#DCE7E4` | `#40536B` | Separators and outlines |

**Rules:** Colors are semantic, never hard-coded in screen components. Never communicate state by color alone; use text, icons and timestamps. Check WCAG 2.2 AA contrast for text and non-text controls on the *actual* paired backgrounds; adjust tokens where necessary. No green “safe” claim merely because GPS or network is available.

**Typography:** Plus Jakarta Sans for headings; Inter for body, controls and data. Provide system-font fallback, dynamic type and text wrapping. Prefer sentence case except the `SOS` label. Icons: a consistent outline family with filled variants for selected states. Corner radii: 12 px controls, 16 px cards, 20–24 px major panels. Spacing: 4/8/12/16/24/32 px scale. Minimum touch targets: 48 × 48 dp on Android.

## 3. Navigation and information architecture

**Mobile bottom tabs:** Home, Journey, Guardians, Profile. Keep the SOS action persistently discoverable on Home and provide an accessible emergency shortcut elsewhere; do not depend on the drawer for SOS. A left drawer contains Incident History, Safety Preferences, Notifications, Help, Privacy and Settings. On active emergency screens, suspend ordinary drawer/tab navigation and show direct emergency actions instead.

**Guardian web:** CardNav for top-level navigation on compact layouts; LineSidebar on desktop for Overview, Active Incidents, Journeys, Contacts and Settings. Navigation is semantic, keyboard accessible, and respects focus management.

**Core mobile screens:** Onboarding and permission education; Home; SOS activation/countdown; Active Emergency; Safe Journey; Guardians; Incident History; Notifications; Profile and Settings. **Web screens:** Guardian Overview; Incident Detail; Journey Status; Notification Center; Account and Consent.

## 4. Supplied components — approved adaptations

| Component | Mobile adaptation | Guardian web | Constraints |
|---|---|---|---|
| Power Smash | Native tactile SOS styling: red, strong shadow, pressed depth, visible label | Optional demo CTA | Avoid perpetual pulse and decorative glare in emergency mode; never let animation delay activation |
| HoldButton | Native `Pressable` + Reanimated progress; haptic at completion; 1.5–2 s initial prototype hold, configurable after usability testing | Optional sensitive-action confirmation | `onHold` must fire exactly once; cancellation on release; alternative accessible tap + confirmation; **never use 600 ms as the sole emergency safeguard** |
| CountUp | Noncritical journey/incident stats | Dashboard metrics | Show final numeric value immediately with reduced motion; never animate critical countdowns in a misleading way |
| CardNav | Do not port DOM implementation; native drawer + tabs instead | Top nav / compact web menu | All destinations need real routes and keyboard access |
| AnimatedList | `FlatList` + subtle Reanimated entry for guardians/history | Web list with `motion/react` | No global Tab interception; stable IDs, virtualization, reduced motion |
| LineSidebar | Not used on phone | Desktop guardian nav | Replace clickable `li` with real links/buttons; focus states |
| SpotlightCard | Static card or subtle press feedback | Feature and overview cards | Pointer-only glow is optional; keyboard focus equivalent |
| LatticeLoader | Lightweight native progress indicator for routine loads | Sync and fetch status | Critical alert status is explicit text: queued/sent/delivered/acknowledged/failed; no indefinite spinner |
| SpringCheck | Native checkbox/switch for preferences | Settings and onboarding | Never strike through essential consent text; controlled state and accessible label |
| SloshGauge | Omit from MVP | Optional noncritical battery or resource demo | Avoid misleading “safety score”; no unnecessary continuous physics loop |
| Radar | Omit from emergency and routine mobile app | Optional decorative overview backdrop | Must not imply real threat scanning; pause when hidden, disable on reduced motion |
| MagicBento | Static two-column home feature grid, no hover particles | Desktop guardian overview | Disable particles, tilt and magnetism on touch/reduced-motion; never decorate active emergency panels |
| SwipeToast | Native toast for routine success/info only | Routine alerts with swipe dismiss | **Emergency warnings must be persistent banners or incident cards, not auto-dismissed toasts** |

### 4.1 Power Smash + HoldButton: combine, don't duplicate

Create one `EmergencySOSButton` using the **visual depth** of Power Smash and the **intentional hold-progress** of HoldButton. Default visual state: prominent red button with siren icon and `Hold for SOS`. On press: clear progress ring/fill and haptic response; release early resets progress. On completion: transition to a short, clearly labeled cancellation countdown **without preventing immediate emergency calling**. For users unable to hold, offer a separate accessible activation path. During an active incident, replace the initial button with persistent `Call 112`, `View alert status`, and `End session` (confirmed) controls. Verify emergency number for deployment jurisdiction.

### 4.2 Animated and decorative components

MagicBento, SpotlightCard, Radar and LineSidebar are **web-first**. Use them selectively in non-emergency guardian views. CountUp and LatticeLoader must reflect actual values/states, not fabricate success. SwipeToast is for routine feedback; error and delivery failure must remain visible until resolved or acknowledged.

## 5. Motion and feedback tokens

- Tap/press: 80–120 ms visual depression; haptics only on important actions, with user preference.
- Drawer/sheet: ~180–250 ms; avoid motion during emergency activation.
- Cards: subtle hover elevation on web, subtle press scale on mobile. No hover-only affordances.
- List entry: stagger only for small noncritical lists, max ~150–200 ms total; virtualize long lists.
- `prefers-reduced-motion` on web and platform reduce-motion on mobile disable parallax, particles, animated counters, radar and spring overshoot.
- No continuous decorative animation on the mobile home screen; avoid battery drain and distraction.

## 6. Screen-level component map

| Screen | Primary components | Key states |
|---|---|---|
| Home | Header, `SystemStatusCard`, `EmergencySOSButton`, `SafeJourneyCard`, `GuardianPreview`, bottom tabs | GPS denied, offline, no contacts, ready (not “guaranteed safe”) |
| SOS countdown | Large countdown, cancel button, call emergency shortcut | User cancelled, countdown completed, screen reader announcement |
| Active Emergency | Persistent status timeline, last known location + timestamp, `Call 112`, escalation status, confirmed end | Queued, attempting, delivered, acknowledged, failed, offline |
| Safe Journey | Destination, ETA, trusted contacts, check-in timer, route preview | In progress, due, missed, completed, offline |
| Guardians | Invite cards, acceptance status, priority order, remove access | Invited, accepted, declined, revoked |
| Incident History | AnimatedList (subtle), filters, incident details, deletion | Empty, loading, permission denied |
| Guardian Overview (web) | CardNav, LineSidebar, MagicBento, CountUp, SpotlightCard | Live data vs stale data distinctly labeled |
| Guardian Incident (web) | Persistent alert banner, map, timeline, acknowledge action | Delivered vs acknowledged vs responding |

## 7. Accessibility, privacy and safety requirements

1. SOS and `Call 112` always have text labels, large targets, screen-reader names and non-gesture activation paths.
2. Never require animation, color recognition, long press or swipe as the *only* way to complete a safety-critical action.
3. All permission and location-sharing controls state who can see what, for how long, and how to revoke it.
4. Emergency UI prioritizes actual state and last-update timestamps; do not display simulated sensor readings or mock acknowledgements as live data.
5. The design must accommodate offline/low-battery/permission-denied states and offer appropriate manual alternatives.
6. Never claim automatic police dispatch, guaranteed alert delivery, guaranteed threat detection or continuous background tracking without verified implementation.
7. Respect device font scaling, screen readers, keyboard navigation (web), safe areas, and dark-mode contrast.

## 8. Canonical repository structure

```text
SHEild-AI/
├── architecture.md
├── design.md
├── folder-structure.md
├── mobile/app/                    # Expo Router screens
├── mobile/src/theme/              # Native semantic token adapter
├── mobile/src/components/ui/      # Native reusable controls
├── mobile/src/components/safety/  # EmergencySOSButton, status timeline
├── mobile/src/features/           # SOS, journey, guardians
├── guardian-web/src/theme/        # CSS variable adapter
├── guardian-web/src/components/   # Adapted web reference components
├── guardian-web/src/pages/        # Guardian screens
├── backend/app/                   # API, services, workers
├── supabase/migrations/           # Database schema + RLS
├── packages/contracts/           # Canonical OpenAPI contract
├── packages/design-tokens/       # Shared semantic values only
└── docs/                         # Tests, component provenance, privacy
```

Do not force a single cross-platform UI component package: mobile and web should share **tokens and behavior specifications**, not incompatible DOM/native implementations. Preserve the user's supplied original component sources in a reference folder or linked provenance record only after confirming usage rights and collecting their associated CSS and package versions.

## 9. Two-developer design responsibilities (finalized)

- **Developer 1 / mobile owner:** native tokens, tabs/drawer, EmergencySOSButton, Safe Journey and Guardians screens, Android accessibility, motion and device testing.
- **Developer 2 / backend + guardian web owner:** web tokens, guardian navigation, MagicBento and dashboard cards, web notifications, data-driven incident states and keyboard accessibility.
- **Shared approval:** semantic tokens, screen flows, API-driven state labels, accessibility acceptance criteria, integration screenshots and emergency failure-state review. Changes to shared tokens or emergency interaction require both developers' review.

## 10. Antigravity prompts

### Prompt A — Mobile design foundation

> Read `architecture.md` and `design.md` completely. Implement only the mobile design foundation in the existing React Native / Expo development-build app. Create semantic theme tokens for light/dark mode, Plus Jakarta Sans and Inter with system fallbacks, accessible bottom tabs and drawer, reusable UI primitives, and screen shells for Home, Journey, Guardians and Settings. Recreate web-inspired effects natively; do not import DOM components, CSS, `motion/react`, `ogl` or browser APIs. Use mock data clearly labeled as demo-only. Implement reduced motion, large touch targets, dynamic type and offline/permission-denied visual states. Do not modify backend contracts. Commit to `feat/mobile-design` and open a PR with Android screenshots and a component checklist.

### Prompt B — Safety-critical mobile interactions

> Read `architecture.md` and `design.md`. Implement `EmergencySOSButton` by combining the Power Smash visual depth with HoldButton-style progress. Use native Pressable/Reanimated, prevent duplicate activations, support cancellation on early release, add an accessible alternative, and connect to the existing SOS state machine/API contract. Build an explicit active-emergency status timeline and persistent delivery-failure messages. Never use decorative loading to imply an alert was delivered. Provide unit and physical-device test steps. Work only in mobile-owned paths and open a PR.

### Prompt C — Guardian web visual system

> Read `architecture.md` and `design.md`. Build a responsive guardian web dashboard using the supplied CardNav, LineSidebar, AnimatedList, SpotlightCard, CountUp, MagicBento and SwipeToast concepts. Keep web-specific animation libraries in the web app. Use Calm Guardian semantic tokens, keyboard navigation, focus rings and reduced-motion fallbacks. Show real API states when integrated; mock data must be visibly marked as demo. Keep emergency alerts persistent; never use auto-dismiss toasts for them. Disable decorative effects on touch/reduced-motion and pause offscreen animation. Work only in guardian-web-owned paths and open a PR with screenshots and accessibility checks.

### Prompt D — Integration and review

> Compare both apps with `architecture.md` and `design.md`. Check shared tokens, terminology, API status mapping, empty/offline/error states, accessibility, dark mode and consent. Run lint/tests and a real Android device smoke test. Report mismatches and fixes in the PR; do not merge automatically or claim emergency reliability from a visual demo.

## 11. Locked design decisions and validation gates

- **Locked:** Calm Guardian is default; Midnight Shield is dark mode. Contrast and usability remain mandatory validation gates.
- **Prototype default:** 1.8-second hold; accessible tap-and-confirm; optional 3-second cancel countdown and Send Now. Tune hold duration only after prototype testing.
- **Locked:** minimal guardian web acknowledgement and consent-based location view are MVP; decorative dashboard effects are deferred until reliable integration.
- Verify source component licenses, missing CSS, dependency versions and Android package compatibility.
- Agree on actual alert-status vocabulary with backend API owners before generating frontend screens.

**Acceptance criterion:** Every screen is legible, accessible, consistent across light/dark mode and honest about real system state; an emergency can be activated and understood without relying on decorative motion or hidden navigation.

## 12. Final visual component configurations

| Reference | Final use | Configuration / rule |
|---|---|---|
| Power Smash + HoldButton | Native `EmergencySOSButton` | `#D92D3A` light / `#FF5364` dark, 16px radius, strong pressed depth, 1.8s prototype hold, progress fill, haptic completion; accessible tap-and-confirm. Never gate 112 dialer behind hold. |
| CountUp | Noncritical journey metrics | 0.8–1s max, real API values only, static final value for reduced motion. |
| CardNav | Compact guardian web navigation | White/navy backgrounds per theme; route labels Overview, Incidents, Journeys, Contacts, Settings. |
| AnimatedList | Guardians and incident history | Native `FlatList` / accessible web list; 150ms entry max, stable keys, no keyboard Tab hijacking. |
| LineSidebar | Desktop guardian web | Primary teal active marker, visible focus ring, actual anchor/button semantics, pointer proximity optional. |
| SpotlightCard | Web overview cards | Teal subtle glow; focus-visible equivalent; disable in emergency views. |
| LatticeLoader | Routine data fetching | Teal progress; explicit failure state and timeout; never replace emergency status timeline. |
| SpringCheck | Settings and permission acknowledgements | Controlled accessible switch/checkbox, no strikethrough for consent. |
| SloshGauge | Post-MVP demo only | No fabricated safety score; only an actual measured quantity with source and units. |
| Radar | Optional non-emergency web decoration | Teal, reduced brightness, off when hidden/reduced-motion; never imply live threat detection. |
| MagicBento | Guardian web overview | 4–6 actual feature cards, restrained teal glow, no particles on touch/reduced-motion, no effects on active incidents. |
| SwipeToast | Routine confirmations | 4s default; pause on hover/focus; critical failures and emergency alerts must persist. |

**Reference source caveat:** The provided JSX alone is not a complete portable component library. Before importing into `guardian-web/`, obtain its companion CSS, package versions and usage licenses. `motion/react`, `gsap`, `ogl`, DOM events and Tailwind class strings are **not** React Native implementations. Rebuild the visual behavior natively with `Pressable`, Reanimated, Gesture Handler and haptics.

## 13. Final UX acceptance checks

1. From the home screen, SOS is visible without opening navigation; a screen-reader user has an accessible alternative to press-and-hold.
2. Active emergency view removes decorative animation and retains call, incident status and confirmed end-session actions.
3. Network, GPS, notification permission and guardian availability are displayed separately, never collapsed into a misleading 'safe' badge.
4. Offline queued alerts show **NOT SENT** until server acceptance; provider acceptance and human acknowledgement remain separate.
5. Both light and dark themes pass contrast and text-scaling checks on real devices; web navigation works with keyboard and reduced motion.
6. A screen cannot be marked complete using hard-coded incident counts, invented locations or decorative fake radar detections.


## 14. Complete supplied component inventory and implementation prompts

**Scope:** All 13 supplied references are included below, including the two separately attached sources (`MagicBento` and `SwipeToast`). These are **implementation prompts**, not claims that the source files, stylesheets or dependencies have been installed. Copy the relevant original source and companion CSS into a provenance-controlled reference directory only after license review. Antigravity must use `architecture.md`, `design.md` and `folder-structure.md` together and preserve the agreed API contract.

**Component inventory (13 references):** Power Smash, HoldButton, CountUp, CardNav, AnimatedList, LineSidebar, SpotlightCard, LatticeLoader, SpringCheck, SloshGauge, Radar, MagicBento and SwipeToast. Power Smash and HoldButton are combined into **one** production `EmergencySOSButton`; both references remain documented separately.

### 14.1 Reference-to-target mapping

| Reference | Canonical target | Implementation priority | Expected dependencies / prerequisites |
|---|---|---|---|
| Power Smash | `mobile/src/components/safety/EmergencySOSButton.tsx` | P0 | React Native Pressable, Reanimated, haptics; adapt Tailwind web appearance |
| HoldButton | Same `EmergencySOSButton.tsx`; reusable `HoldToConfirm.tsx` only for non-SOS actions if needed | P0 | Gesture Handler/Reanimated, cancellation and accessibility alternative; source implementation not included in pasted snippet |
| CountUp | `guardian-web/src/components/ui/CountUp.tsx`; optional native `StatCounter.tsx` | P2 | CSS/web motion; reduced-motion fallback |
| CardNav | `guardian-web/src/components/navigation/CardNav.tsx` | P1 | Web implementation + associated CSS and logo asset; use real routes |
| AnimatedList | `guardian-web/src/components/ui/AnimatedList.tsx`; native `AnimatedFlatList.tsx` | P1 | `motion/react` on web; FlatList/Reanimated on native; associated CSS |
| LineSidebar | `guardian-web/src/components/navigation/LineSidebar.tsx` | P1 | Web CSS, semantic links and pointer/keyboard focus behavior |
| SpotlightCard | `guardian-web/src/components/ui/SpotlightCard.tsx` | P2 | CSS radial spotlight and keyboard focus alternative |
| LatticeLoader | `guardian-web/src/components/ui/LatticeLoader.tsx`; native `SyncIndicator.tsx` | P1 | Companion CSS; actual async status and timeouts |
| SpringCheck | `guardian-web/src/components/ui/SpringCheck.tsx`; native `AccessibleToggle.tsx` | P1 | `motion/react`, Hugeicons or replacement SVG, companion CSS |
| SloshGauge | `guardian-web/src/components/visualizations/SloshGauge.tsx` | P3 | Companion CSS; measured, clearly labeled noncritical quantity only |
| Radar | `guardian-web/src/components/visualizations/Radar.tsx` | P3 | `ogl`, WebGL availability, CSS, visibility and reduced-motion gating |
| MagicBento | `guardian-web/src/components/dashboard/MagicBento.tsx` | P2 | `gsap`, companion CSS; attached source is a reference, not a native component |
| SwipeToast | `guardian-web/src/components/feedback/SwipeToast.tsx`; native `RoutineToast.tsx` | P1 | `motion/react`, Hugeicons or replacement, companion CSS; routine-only |

**Priority key:** P0 = SOS critical path; P1 = functional navigation and feedback; P2 = polish after functional integration; P3 = optional showcase only. Do not block the MVP on P2/P3 effects.

### 14.2 Component-specific Antigravity prompts

#### Prompt 01 — Power Smash appearance

> Read all three project specifications. Recreate the supplied red raised Power Smash button's tactile visual language as a **React Native** component, not an HTML `<button>`. Use semantic emergency tokens, a restrained bottom-edge depth/shadow, a large siren icon, high-contrast label, 48dp+ target and pressed-depth feedback. Integrate it **inside** `EmergencySOSButton`; do not create a second competing SOS action. Remove the continuous pulsing lightning icon and unnecessary glare in emergency mode. Support light/dark, dynamic type, screen readers and reduced motion. Provide Android screenshots and press-state tests.

#### Prompt 02 — HoldButton behavior

> Implement the intentional hold-progress behavior described by the supplied HoldButton example inside `EmergencySOSButton`: prototype `holdTime=1800ms`, configurable after testing; `releaseTime=200ms` for a noncritical reset animation; modest `pressScale` no lower than 0.96 for SOS; red semantic fill; `fillDirection=right` or accessible progress ring. Disable `wave`, exaggerated `waveAmplitude`, continuous `glow` and decorative `resetAfter` on the emergency screen. Fire activation once only, cancel unfinished holds on release/interruption, never activate on unmount, offer accessible tap-and-confirm, and provide an always-visible direct emergency dialer shortcut. Distinguish activation, cancel countdown, server acceptance, notification delivery and human acknowledgement. Test interrupted gestures, repeated taps, background transitions and accessibility.

#### Prompt 03 — CountUp

> Implement CountUp for noncritical metrics such as completed journeys or historical incident counts, driven by actual API responses. Match `from`, `to`, `separator`, `direction`, `duration` and `className` semantics where useful. Cap animation at 1 second; show final values immediately with reduced motion. Render a skeleton or explicit unavailable state while fetching; never animate fabricated numbers or critical emergency countdowns. Add unit tests for zero, large values, changing props and unavailable data.

#### Prompt 04 — CardNav

> Build responsive guardian-web CardNav with real routes: Overview, Active Incidents, Journeys, Contacts and Settings. Adapt the supplied expandable cards to Calm Guardian/Midnight Shield tokens and replace example Company/Careers/Projects links. Provide a logo fallback, mobile-width collapsed menu, keyboard and Escape handling, visible focus, active-route indication, proper link semantics and outside-click dismissal. Do not reuse this DOM implementation in React Native; the mobile app uses native bottom tabs and drawer.

#### Prompt 05 — AnimatedList

> Adapt AnimatedList for guardian invitations, incident history and activity timelines. Keep its optional gradient scroll affordances and brief entry animations, but use stable item IDs rather than array indexes, respect reduced motion, and virtualize long lists. **Remove global Tab interception**: native browser Tab behavior must remain intact. Implement roving arrow navigation only when the list itself is focused, with correct semantic roles and accessible selection. On mobile create a separate FlatList/Reanimated adaptation. Add loading, empty, stale, error and retry states.

#### Prompt 06 — LineSidebar

> Build the guardian-web desktop LineSidebar using actual anchor links or buttons inside semantic navigation. Use teal active indicators, neutral inactive text and optional restrained proximity shift; adapt pointer falloff and smoothing from the reference only when reduced motion is off. Keep labels stationary for keyboard focus and emergency navigation, with a visible focus ring. Provide responsive collapse into CardNav and test pointer, keyboard and screen-reader behavior. Never render this desktop sidebar in the mobile native app.

#### Prompt 07 — SpotlightCard

> Implement web-only SpotlightCard for noncritical dashboard overview cards using the supplied pointer-position CSS custom-property concept. Use subtle teal glow, sufficient contrast, keyboard focus-visible equivalent, and no motion when reduced motion is enabled. Avoid spotlight on active incident alerts, consent prompts and emergency actions. Provide a static fallback for touch devices and missing CSS support. Keep real content and actions accessible independent of glow.

#### Prompt 08 — LatticeLoader

> Adapt LatticeLoader for routine data fetching and synchronization. Use the supplied orbit/dots/ripple patterns as optional decoration; teal working, semantic success and semantic error states; show a meaningful accessible label and optional elapsed time. Stop timers and animation on unmount, hidden tabs and reduced-motion preference. Enforce a finite timeout with an explicit retry/error message. **Never** use an indefinite loader in place of the emergency incident state machine or imply notification delivery from a finished animation.

#### Prompt 09 — SpringCheck

> Implement SpringCheck as an accessible controlled checkbox/switch for noncritical preferences and onboarding acknowledgements. Keep the restrained spring fill/checkmark but disable decorative strikethrough for privacy permissions and consent. Use semantic labels, real `checked` state, disabled state, keyboard Space behavior and reduced-motion fallback. On mobile create a native switch/checkbox adaptation. Never precheck consent for live location sharing; store consent only after an explicit user action.

#### Prompt 10 — SloshGauge

> Implement SloshGauge only as an optional post-MVP guardian-web visualization for a **real, measured, explicitly sourced quantity**, such as device battery percentage if legitimately available and current. Preserve value/defaultValue and accessible meter semantics; interactive slider mode only if there is a genuine setting to change. Disable continuous liquid physics under reduced motion or when offscreen, and clean up animation frames. Do not display a fabricated safety/readiness percentage or suggest that the gauge measures threat.

#### Prompt 11 — Radar

> Implement the supplied OGL Radar as an optional guardian-web **decorative** overview background, using muted teal (`#137C78` light / `#42D6BD` dark) and restrained brightness. Add WebGL fallback, device performance guard, resize observer, visibility pause, reduced-motion static replacement and full renderer cleanup. Set `enableMouseInteraction=false` by default. Label it as visual decoration if necessary; do not represent it as live danger scanning, location monitoring or AI detection. Never show it in emergency mode or on the mobile app's home screen.

#### Prompt 12 — MagicBento

> Use the separately supplied MagicBento reference to build 4–6 actual guardian dashboard feature cards: Active Incidents, Ongoing Journeys, Guardian Acknowledgements, Recent Activity, Contact Management and System Connectivity. Replace its generic analytics/company copy and purple `glowColor` with semantic teal. Set `enableTilt=false`, `enableMagnetism=false`, `enableStars=false` and `enableSpotlight=false` initially; selectively enable subtle spotlight on desktop after performance/accessibility checks. Disable all decorative effects on touch, reduced motion, low-power and active-emergency screens. Use stable keys, semantic links, real API values and explicit stale-data labels. Avoid global mouse listeners when the feature is disabled.

#### Prompt 13 — SwipeToast

> Use the separately supplied SwipeToast reference for **routine** guardian-web confirmations (invitation sent, preference saved, history filter applied). Configure `duration=4000`, `dismissible=true`, `pauseOnHover=true`, clear accessible labels, close button and a visible action where relevant. Match teal/neutral semantic theme tokens, and ensure swipe dismissal has a keyboard-accessible equivalent. Implement a native routine toast separately for mobile. Critical emergency alerts, failed deliveries, consent revocation and guardian acknowledgements must instead appear as persistent banners or incident timeline entries, not auto-dismissed toasts. Test reduced motion, screen-reader announcements and dismissal while focused.

### 14.3 Master Antigravity prompt — implement the entire approved design system

Copy the following into Antigravity **after** the repository contains the three specification documents and the reference sources you have permission to use:

```text
You are implementing the approved SHEild AI 2.0 frontend design system.
Read architecture.md, design.md, and folder-structure.md completely before editing.
Treat architecture.md as the source of truth for API/data/security behavior;
design.md as the source of truth for visuals/interactions;
folder-structure.md as the source of truth for paths and ownership.

Implement all 13 supplied reference concepts, subject to the priority and platform
mapping in design.md §14.1 and component-specific prompts §14.2:
Power Smash, HoldButton, CountUp, CardNav, AnimatedList, LineSidebar,
SpotlightCard, LatticeLoader, SpringCheck, SloshGauge, Radar,
MagicBento, SwipeToast.
Power Smash + HoldButton become ONE EmergencySOSButton, not duplicate SOS controls.
P3 optional visualizations may be scaffolded and documented but must not block MVP.

Use Calm Guardian light mode and Midnight Shield dark mode. Share semantic tokens,
not DOM UI code, between React Native mobile and React guardian-web.
Do not import web CSS, Tailwind DOM components, motion/react, GSAP, OGL or
window/document APIs into React Native. Implement native touch feedback with
Pressable, Reanimated, Gesture Handler and haptics where compatible.

Implement each component with loading, empty, error, offline, disabled, reduced-
motion and accessibility behavior appropriate to its purpose. No invented live
locations, notification receipts, incident counts, danger scores or police links.
SOS must be accessible without a long press and must not hide the emergency dialer.
Keep active emergency UI free from decorative effects and auto-dismissing alerts.

Developer 1 owns mobile/**. Developer 2 owns guardian-web/** and backend/**.
Changes to packages/**, docs/contracts or emergency status vocabulary require
joint review. Work on feature branches, commit small tested changes and open PRs.
Do not modify the other developer's owned paths without explicit approval.

Deliver: component checklist with 13/13 accounted for, dependency/license audit,
file tree of added/changed paths, Android and web screenshots, light/dark and
reduced-motion screenshots, accessibility results, unit tests, integration test
notes and a list of deferred P2/P3 enhancements. Do not claim deployment or
emergency reliability until physically verified.
```

### 14.4 Developer-specific execution prompts

**Developer 1 — mobile:**

```text
Read all three specifications and design.md §14. Implement mobile P0/P1:
EmergencySOSButton (Power Smash + HoldButton), native AnimatedList, native
SyncIndicator inspired by LatticeLoader, native AccessibleToggle inspired by
SpringCheck, native RoutineToast inspired by SwipeToast, accessible drawer and
bottom tabs, and static MagicBento-inspired home feature cards. Implement the
full SOS and emergency visual states defined by architecture.md. Do not port
CardNav, LineSidebar, SpotlightCard, Radar, SloshGauge or GSAP to mobile.
Work only in mobile/** unless a shared change is reviewed. Open a PR with
physical Android test evidence and an explicit unimplemented-items checklist.
```

**Developer 2 — guardian web:**

```text
Read all three specifications and design.md §14. Implement guardian-web P1:
CardNav, AnimatedList, LineSidebar, LatticeLoader, SpringCheck and SwipeToast.
After API-backed incident and consent flows work, implement P2 CountUp,
SpotlightCard and MagicBento. Scaffold P3 SloshGauge and Radar behind disabled
feature flags; only activate if real measured data, accessibility, performance
and source-license conditions are satisfied. All components use real routes,
semantic tokens, keyboard focus, reduced motion and honest backend states.
Work in guardian-web/** and your backend-owned paths; open a PR with tests,
web screenshots, keyboard audit and deferred-effects checklist.
```

### 14.5 Reference-source and acceptance checklist

- [ ] All **13 references** appear in the implementation checklist and have an owner, target and priority.
- [ ] Original JSX, companion CSS, icons/assets and package versions are collected where available; missing material is explicitly listed rather than fabricated.
- [ ] Source usage rights and dependency licenses are reviewed before copying code into the public repository.
- [ ] Native mobile adaptations are independent of DOM-only libraries.
- [ ] All P0/P1 components work with actual or clearly labeled demo data; P2/P3 features cannot obscure emergency actions.
- [ ] Both themes, keyboard/screen-reader operation, large text and reduced-motion states are tested.
- [ ] Emergency incident delivery states come from backend events, never visual animation completion.


## 15. Existing mobile prototype integration prompts (v1.2; supersedes greenfield setup instructions)

**All 13 components and the 13 component-specific prompts in §14 remain in scope.** The source prototype is the starting point, not an excuse to replace existing working code. Reconcile its existing Expo Router screens, theme and siren asset with the canonical `mobile/` paths; preserve functional native logic after testing. The guardian web remains a new React application. No web-only GSAP, `motion/react`, pointer spotlight or OGL component may be copied into React Native.

### Revised Antigravity master prompt — Developer 1 (paste into existing repository)

```text
You are working on the EXISTING SHEild AI project, not generating a new Expo starter. Read architecture.md, design.md and folder-structure.md first. Inspect the tracked prototype and the preserved baseline v1-prototype/legacy branch. The active migration source is woman-safety-clean/; the original root src/app is a separate starter and must not be merged into it. If the owner has already migrated it, work only in mobile/. First audit and run the existing app, record working and broken screens, package versions, permissions, shake trigger, siren and current SOS action. Preserve reusable code/assets, migrate to mobile/ only if not already done, and make a clean Android custom development build. Implement the Calm Guardian/Midnight Shield tokens and all mobile-approved components from design.md §14, including the Power Smash + HoldButton-derived EmergencySOSButton with accessible alternative. Do not install web-only component packages in native. Wire manual SOS to the approved OpenAPI contract; display backend accepted, notification attempted and guardian acknowledged as distinct states; show offline-unsent explicitly. Prioritize working SOS and regression tests over decorative animation. Modify mobile/** and docs/mobile-testing.md only; propose contract changes for review. Make small commits and a PR with before/after audit, retained features and test evidence.
```

### Revised Antigravity master prompt — Developer 2 (paste into existing repository)

```text
Read architecture.md, design.md and folder-structure.md. This repo contains an existing Expo prototype being migrated by Developer 1; do not create or edit a competing mobile app. Own backend/**, guardian-web/**, supabase/** and propose packages/contracts/** changes for owner approval and Dev 1 review. Implement the agreed FastAPI/Supabase/FCM contracts and authenticated guardian dashboard using the web-approved design.md §14 components (CardNav, LineSidebar, MagicBento, SpotlightCard, AnimatedList, CountUp, LatticeLoader, SpringCheck, optional SloshGauge/Radar, SwipeToast for routine feedback). Verify licenses and dependency compatibility before importing supplied snippets. Keep critical incidents as persistent accessible alerts, not dismissible toasts. Provide mock fixtures and API examples immediately so Dev 1 can integrate the migrated app. Include migrations, RLS tests, incident idempotency, permission tests and runbook. Deliver a first PR with backend health/auth, incident creation and a basic guardian acknowledgement flow.
```

**Owner prompt:** Audit the baseline ZIP/Git history, confirm no secrets are tracked, preserve baseline with `v1-prototype`, merge planning/contracts PR, migrate the existing nested Expo app through a separate reviewed PR, then assign both feature branches from updated `main`. Never overwrite an existing developer's branch or force-push.
