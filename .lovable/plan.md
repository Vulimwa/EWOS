# EWOS — Early Warning Operating System: Phase 1 Bootstrap

## Platform adaptation (important)

Lovable projects are a single full-stack TanStack Start app — not a pnpm monorepo with separate packages, and React Native / Express / Render deploys aren't supported here. Everything from your spec maps cleanly anyway:

| Your spec | Lovable equivalent |
| --- | --- |
| `app-web` (React + TS + Tailwind + Vite) | This app (TanStack Start, React 19, Tailwind v4, Vite) |
| `backend-api` (Node + Fastify) | TanStack server functions + API routes (typed, same repo) |
| PostgreSQL + PostGIS + Supabase Auth | Lovable Cloud (Postgres with PostGIS extension, built-in auth) |
| `ui-lib` + Storybook | `src/components/ewos/` design-system library + a living `/design-system` showcase route |
| `plugin-sdk` | `src/sdk/` TypeScript module: lifecycle hooks, event pub/sub, map layer registration, notification API |
| `infra` / CI | Lovable build pipeline + one-click publish |
| Context persistence | `project_manifest.json` in repo root (updated every run) + Lovable project memory (`mem://`) so no session forgets project state |

## Sprint 1 scope (this build)

**1. Project manifest & checkpointing**
- `project_manifest.json` at repo root: version, phase, sprint, backlog (IDs, priorities, estimates, acceptance criteria), completed_tasks, event_topics, api_contracts, db_schema_version, auto_proceed_flag.
- Memory rules saved so every future session loads EWOS context automatically.
- `docs/CONTRIBUTING.md` + `CHANGELOG.md` with manifest usage rules.

**2. Design system (dense operational workspace)**
- Dark-first "operations console" aesthetic: near-black slate surfaces, high-contrast alert semantics (hazard severity scale: advisory/watch/warning/emergency), monospace data accents, compact density tokens.
- Full token set in `src/styles.css` (oklch): colors, spacing density scale, elevation, radii, severity palette. Design tokens also exported as `src/design/tokens.json`.
- Distinctive typography (not Inter): a sharp grotesk for UI + monospace for telemetry/coordinates.

**3. Workspace shell (ClickUp × Photopea inspired)**
- Three-column layout: collapsible left nav (org switcher + HazardApp modules), center map-first canvas (MapLibre GL + OSM raster/vector basemaps, layer opacity controls, satellite toggle), right contextual panel (alerts feed, incident detail, AI insights tabs).
- Top bar: global search (Cmd+K), notifications bell, user menu. Bottom dock: active operations / quick actions.
- Resizable panes, keyboard shortcuts (documented in a shortcuts modal), compact console mode toggle.

**4. AI Decision Assistant**
- Floating action button → slide-in chat panel with Explain/Act mode toggle and region/module scope chips, powered by Lovable AI (streaming chat, server-side).

**5. Backend + data (Lovable Cloud)**
- Enable Cloud; PostGIS extension; schema v1: `organizations`, `org_members` (+ roles table per security best practice), `modules`, `module_installs`, `events`, `hazard_data` (geometry columns), `notifications`, `river_gauges`. Org-scoped RLS on everything.
- Seed data: one demo org, one river gauge, one admin boundary polygon.
- Event bus v1: `events` table + typed publish/subscribe helpers; canonical event envelope with semantic schema versioning; JSON Schemas for `VegetationStressHigh` and `FloodAlertIssued` in `src/events/schemas/`.
- API contract stubs (OpenAPI partial) in `docs/api/openapi.json`: auth, organizations, modules, events, notifications.

**6. Plugin SDK skeleton (`src/sdk/`)**
- `defineHazardApp()` with lifecycle hooks (onInstall/onActivate/onDeactivate), event publish/subscribe, map layer registration, panel registration, notification request API. Typed, documented in `docs/sdk.md`.

**7. Flood Module — canonical HazardApp**
- Registered via the SDK: left-nav entry, map flood-forecast layer (demo GeoJSON polygon), gauge readings panel, "Issue Safety Alert" action.
- Server function: ingest sample gauge reading → compute risk → publish `FloodAlertIssued` event with GeoJSON polygon + severity → appears in the alerts feed.

**8. Capability Store (marketplace) v0**
- `/store` route listing installable modules from the `modules` table, with the Flood Module as the example listing (metadata schema per your spec).

## Backlog beyond Sprint 1 (recorded in manifest, not built yet)
- Sprint 2: Organization Manager UI, role management, notification channels (WhatsApp/SMS stubs), timeline slider for time-series layers.
- Sprint 3: polygon drawing/geofencing, PNG/PDF report export, event flow chain demo (DroughtIndex → … → CommunityAlert).
- Sprint 4+: AI "Act" mode actions, marketplace publishing flow, mobile-responsive shell, extensibility toward Phase 7.

## Technical notes
- Auth: Lovable Cloud auth with org-scoped RLS; roles in a separate `user_roles` table with security-definer checks.
- Map: MapLibre GL JS + OpenStreetMap tiles.
- AI: Lovable AI Gateway (streaming), server-side only.
- All UI colors via semantic tokens; WCAG AA contrast; ARIA + keyboard nav on interactive components.
- What I won't build here: separate npm packages, Storybook (replaced by an in-app design-system page), React Native app, GitHub Actions YAML (Lovable handles CI/deploy).

After approval I'll enable the backend, then build Sprint 1 end-to-end and finish with the manifest, run summary, and next-sprint proposal.