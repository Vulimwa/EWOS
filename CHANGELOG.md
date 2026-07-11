# EWOS Changelog

All notable changes to the EWOS platform. Versions follow semver; each AI run appends here and updates `project_manifest.json`.

## [0.1.0] — 2026-07-11 — Sprint 1: Platform Foundation bootstrap

### Added
- `project_manifest.json` single source of truth + checkpoint rules (`docs/CONTRIBUTING.md`)
- Design system: dark operations-console tokens (oklch), 4-level hazard severity scale, Space Grotesk + JetBrains Mono
- Workspace shell: collapsible left nav, MapLibre map-first canvas, resizable right contextual panel, top bar (Cmd/Ctrl+K search), bottom operations dock
- GIS engine v0: dark/satellite basemaps, layer visibility + opacity controls, GeoJSON hazard polygons, gauge markers, admin boundaries
- Database schema v1 (PostGIS): organizations, user_roles, modules, module_installs, events, notifications, river_gauges, gauge_readings, admin_boundaries — all RLS-enabled, seeded demo org (Lake Victoria Basin / Nzoia River)
- Event bus v1: `events` table with semver `schema_version`, realtime feed, JSON Schemas for `FloodAlertIssued` and `VegetationStressHigh`
- Plugin SDK skeleton (`src/sdk`): `defineHazardApp`, lifecycle hooks, panel/map-layer registration, event pub/sub
- Flood Watch module (canonical HazardApp): gauge readings panel, server-side risk scan publishing `FloodAlertIssued` with GeoJSON impact polygon
- AI Decision Assistant v0: streaming chat, Explain/Act modes, live event context injection
- Capability Store v0 (`/store`)
- API contract stubs: `docs/api/openapi.json`

### Known issues
- Demo-org anonymous write policies (removed in Sprint 2 when auth lands) — see manifest ISSUE-1