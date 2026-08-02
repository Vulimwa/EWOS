# EWOS

Early Warning Operating System.

EWOS is a modern operating platform for environmental intelligence, emergency coordination, and multi-hazard response. Instead of forcing teams to juggle separate systems for floods, droughts, wildfire, reporting, messaging, and analysis, EWOS brings those capabilities into one shared workspace.

Organizations get a single place to monitor risk, manage operations, and coordinate action. Developers get a clean platform for shipping HazardApps as modular capabilities that plug into the same shell, event bus, and GIS layer.

## Why EWOS

EWOS is built for the reality of operational work: fast-moving information, multiple stakeholders, and no room for fragmented tools.

- One workspace for hazard monitoring and response.
- One capability store for installing hazard modules.
- One event bus for cross-module intelligence.
- One AI assistant for summaries, guidance, and decision support.
- One developer SDK for building reusable environmental capabilities.

## What It Includes

### Operations Workspace

The main workspace is map-first and operations-ready. It combines a top bar, collapsible module navigation, a central MapLibre canvas, a contextual event panel, a live operations dock, and an AI assistant.

### Capability Store

Teams can browse available HazardApps, review permissions and classifications, and install the capabilities they need.

### Organization Portal

The organization portal provides a command view of active hazards, incidents, command centers, assets, installed apps, and notifications.

### Developer Portal

Developers can inspect the plugins they have published and build toward the marketplace model that EWOS is designed for.

### Admin Portal

Platform administrators can oversee organizations across the ecosystem.

### Citizen Portal

A public-facing safety experience gives communities a clearer way to receive alerts and report hazards.

## Product Highlights

- GIS-first interface with dark and satellite basemaps.
- GeoJSON overlays for hazard alerts, administrative boundaries, and gauges.
- Event-driven architecture for cross-hazard propagation.
- Flood risk scan flow that publishes live events into the workspace.
- AI Decision Assistant powered by the `/api/chat` endpoint.
- Plugin SDK for registering panels, map layers, lifecycle hooks, and event topics.
- Supabase-backed authentication and org-aware access control.

## Tech Stack

- Frontend: React, TypeScript, Tailwind CSS
- App framework: TanStack Start, TanStack Router, TanStack Query
- Mapping: MapLibre GL JS
- Backend and data: Supabase, PostgreSQL, PostGIS
- AI: AI SDK and Google Gemini
- UI: Radix UI, Lucide React, Sonner
- Tooling: Vite, ESLint, Prettier

## Getting Started

### Prerequisites

- Node.js 20 or newer
- A Supabase project
- A configured server-side API key for the AI assistant

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file at the project root with the required values.

```bash
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Set the assistant API key in your server environment as required by your deployment.

### Run the App

```bash
npm run dev
```

### Other Commands

```bash
npm run build
npm run preview
npm run lint
npm run format
```

## Repository Layout

```text
src/
  routes/         File-based routes for the landing page, workspace, portals, and API handlers
  components/     Shared UI and EWOS shell components
  modules/        HazardApp registry and module wiring
  sdk/            Plugin SDK and event bus utilities
  lib/            Data access, flood scan logic, AI helpers, and utilities
  integrations/   Supabase clients and auth wiring
  events/         Event schemas
  design/         Design tokens and visual system source
docs/             SDK and API documentation
supabase/         Database migrations and configuration
```

## Key Entry Points

- `src/routes/workspace.tsx`: main operations shell.
- `src/routes/store.tsx`: capability store.
- `src/routes/portal/index.tsx`: organization dashboard.
- `src/routes/developer/index.tsx`: developer portal.
- `src/routes/admin/index.tsx`: platform admin surface.
- `src/routes/api/chat.ts`: AI assistant endpoint.
- `src/modules/registry.ts`: HazardApp registration point.
- `src/sdk/event-bus.ts`: shared event bus.

## Design Notes

EWOS is intentionally structured around composition rather than coupling. The shell owns the platform experience, while HazardApps contribute modular panels, map layers, and events. That makes the system easier to extend without rebuilding the whole product each time a new hazard capability is introduced.

## Development Notes

- Routes are file-based under `src/routes`.
- `src/routes/__root.tsx` is the root shell and should be preserved.
- `routeTree.gen.ts` is generated and should not be edited by hand.
- Modules should communicate through the event bus rather than direct shell integration.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
