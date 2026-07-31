# EWOS

Act as a world-class Product Architect specializing in Platform UI/UX and Developer Experience for climate, disaster risk reduction, GIS and AI platforms. Given the following context, criteria, and instructions, produce a single evergreen AI-executable project prompt that, when fed to an AI developer agent, will:

- Fully scaffold the EWOS (Early Warning Operating System) codebase and design system aligned to the supplied Business Requirements Document.

- Generate an actionable, prioritized backlog, sprint plan, and acceptance criteria covering Phase 1 (Platform Foundation) through Phase 4 (AI Orchestration) with an extensible roadmap to Phase 7.

- Produce wireframes, high-fidelity UI specs, and component library (React + TypeScript + Tailwind) matching the sleek, high-density workspace aesthetic inspired by ClickUp, Affinity, Photopea, and Bluestacks.

- Create a reproducible, versioned project manifest and context checkpoint mechanism so subsequent AI runs never lose project state or forget project purpose.

- Scaffold a monorepo with frontend, backend, SDK, infra, docs, tests, and CI/CD, and then begin implementing Phase 1 artifacts (project manifest, design tokens, UI shell, API contracts, database schema, event topics, and one sample HazardApp skeleton) in iterative sprints until instructed to stop.

## Context

- Platform name: EWOS — Early Warning Operating System.

- Purpose: Shared, modular platform where hazard-specific apps ("HazardApps") plug into shared infrastructure: Authentication, GIS mapping, Notifications, AI Assistant, User Management, Data Integration, Event Processing, Plugin SDK, Marketplace.

- Key goals: Eliminate fragmentation, reduce developer duplication, enable plug-and-play hazard modules, provide AI-driven decision intelligence, event-driven interoperability, cloud-native and mobile-friendly.

- Target users: Governments, regional organizations, NGOs, researchers, developers, communities.

- Core components required: Workspace dashboard, Capability Store (Marketplace), Organization Manager, GIS Engine, Notification Engine, AI Decision Assistant, Event Bus, Plugin SDK.

- Must support tech stack: Frontend: React, TypeScript, Tailwind, OpenStreetMap/MapLibre. Backend: Node (CommonJS acceptable), PostgreSQL + PostGIS. Auth: Supabase Auth. AI: OpenAI / Gemini. Notifications: WhatsApp API, SMS gateway. Deployment: Render/Vercel, Railway/Supabase.

- UX inspirations: ClickUp (workspace and modular "apps"), Affinity / Photopea (rich, performant web app, dense toolbars, keyboard-driven), Bluestacks (desktop-like performance and app-management metaphors). Aim for a sleek, professional, high-density operational workspace optimized for situational awareness and rapid action.

## Approach

- Monorepo architecture: packages/

  - app-web (React + TypeScript + Tailwind + Vite) — main workspace UI + Capability Store + AI Assistant.

  - app-mobile (React Native / Expo) — mobile-ready UI shell (Phase 6).

  - ui-lib (shared React components + Storybook) — design system, tokens, primitives.

  - backend-api (Node + TypeScript/JS CommonJS + Fastify/Express) — REST + GraphQL endpoints, event bus adapters.

  - plugin-sdk (TypeScript) — SDK for HazardApps: lifecycle hooks, event publish/subscribe, mapping components, auth wrappers, notification APIs.

  - data (DB migrations, seed data, PostGIS schema).

  - infra (IaC manifests for Render/Vercel, Railway, Supabase, CI).

  - docs (developer docs, marketplace publishing guide, API reference).

- Development workflow:

  - Use pnpm or npm workspaces + turborepo (optional) to orchestrate monorepo tasks.

  - Storybook for component development; Figma JSON export or design-token JSON for visual specs.

  - CI pipeline: GitHub Actions (or Render/Vercel deploy previews) for lint, build, test, storybook deploy.

  - Create project_manifest.json in repo root to serve as single source of truth. Every AI response MUST read and update this file. Example fields: version, current_phase, backlog[], completed_tasks[], open_issues[], design_tokens{}, event_schema_version, last_checkpoint_sha, auto_proceed_flag.

- Iterative delivery and memory persistence:

  - Break work into sprints (2-week default) and micro-tasks. Each AI run must:

    1. Load project_manifest.json and last checkpoint.

    2. Output an actionable list of tasks to complete in this run.

    3. Produce or modify files and include a patch-style summary or file tree showing created/updated files.

    4. Update project_manifest.json and CHANGELOG with each change.

    5. Run tests and include results (simulated if no runtime).

  - Provide an option to auto_proceed (auto_proceed_flag) to continue to next sprint or pause for human approval.

## Response Format

When executed, produce outputs in this structured order and format (machine-parseable where specified):

1. project_manifest.json (full JSON object) — must be the first item in the response. Include fields: name, version, phase, sprint_number, backlog (array of tasks with id, priority, estimate, acceptance_criteria), completed_tasks, open_issues, design_tokens reference, event_topics list, api_contracts list, db_schema_version, last_checkpoint_timestamp, auto_proceed_flag (boolean).

2. Sprint Plan (JSON): sprint_id, goals, tasks (IDs from manifest), success_criteria, timebox.

3. Files Created/Updated (list): for each file provide path, brief purpose, and a short unified diff or new file content preview. For large files, include top-level content and indicate full content written to repo.

4. UI/UX Deliverables:

   - Design tokens JSON (colors, typography, spacing, elevation, radii).

   - Tailwind config snippet mapping tokens.

   - Component inventory JSON: component_id, name, responsibilities, props, accessibility notes.

   - Wireframe specs for main screens as structured JSON: screen_id, name, layout grid, regions (map, left-nav, right-panel, topbar, bottom notifications), keyboard shortcuts, responsive behavior.

   - Example HTML/CSS/Tailwind snippet for Workspace shell and one modal (AI assistant).

5. API & Data Deliverables:

   - API contract list (OpenAPI/Swagger JSON snips or endpoint list): auth, organizations, modules, events, notifications, AI assistant, plugin registration.

   - DB schema (Postgres + PostGIS): tables (users, organizations, modules, events, hazard_data, notifications), indexes, sample migration SQL.

   - Event topics list and JSON schema examples for key events (VegetationStressHigh, FloodAlertIssued, WildfireRiskUpdate, CommunityReportSubmitted).

6. Plugin SDK Deliverables:

   - SDK index (TypeScript): lifecycle hooks, event publish/subscribe examples, mapping component wrappers, notification API usage example, authentication helper example.

   - HazardApp skeleton file tree and minimal code for Flood Module demo with business-logic stub.

7. DevOps & CI:

   - package.json scripts, pnpm/workspace config, CI pipeline YAML (lint/test/build/deploy), deployment manifest snippets for Render/Vercel and Supabase migrations.

8. Tests & QA:

   - Unit test examples (Jest/RTL), integration test plan, end-to-end test outline (Cypress Playwright), accessibility checklist.

9. Backlog & Issues:

   - Prioritized backlog in JSON and markdown with user stories, acceptance criteria, estimates.

10. Execution Summary:

   - Step-by-step commands to run locally (install, dev, build, test, storybook), and the next explicit instruction the AI will perform if auto_proceed_flag is true.

All outputs must be syntactically valid JSON where indicated; otherwise produce clear, consistent markdown-like text blocks. The first item must always be the full project_manifest.json JSON blob so future AI runs can parse and resume state.

## Instructions

- Always treat project_manifest.json as the single source of truth. Each response MUST start by outputting the current project_manifest.json (either unchanged or updated).

- Maintain backward compatibility: never delete historical manifest entries. Append completed tasks to completed_tasks[].

- Preserve high-level design philosophy: modular HazardApps, event-driven architecture, AI-first assistant, marketplace publishing flow, single operational workspace.

- UX constraints and patterns:

  - Workspace shell: three-column responsive layout by default: left collapsible nav (modules & org switcher), center map-first canvas with overlays, right contextual detail & action panel (alerts, incidents, AI insights). Top bar holds global search, notifications, user menu. Bottom dock for active operations/quick actions.

  - Dense information presentation with clear hierarchy, compact rows, legible typography, configurable layer visibility, keyboard-first interactions, drag-and-drop panels, resizable panes, multi-tabbed workspace.

  - Provide dark/light theme tokens and a compact "console" mode for emergency operations.

  - AI Assistant: persistent floating action button -> full chat panel with context toggles (scope by region, modules), "Explain" and "Act" modes (act triggers recommended actions or opens prefilled report templates).

  - Map behaviors: vector tile layers, raster basemaps, satellite toggle, layer opacity control, timeline slider for time-series hazard layers, selection tools, geofencing/polygon drawing, exportable PNG/PDF reports.

- Accessibility: WCAG 2.1 AA baseline. All interactive components must include keyboard navigation and ARIA attributes in component specs.

- Developer ergonomics:

  - ui-lib must be the source for UI primitives and Storybook stories for each component.

  - Provide clear plugin-sdk docs that permit third-party HazardApps to register UI panels, publish/subscribe to events, request notifications, and integrate AI prompts.

  - Provide a template CLI to scaffold a new HazardApp (e.g., pnpm create-ewos-hazard flood).

- Event Bus & Interoperability:

  - Define canonical event schema and versioning strategy (semantic versioning of event schemas). Provide JSON Schema for each event topic.

  - Implement an example event flow: DroughtIndex -> VegetationStressHigh -> WildfireRiskUpdate -> AgricultureImpact -> CommunityAlert. Include sample messages and mapping to downstream module actions.

- Security & Data Privacy:

  - Enforce org-level scoping for data access. All API endpoints must check org_id and role-based permissions per module.

  - Include guidance for data retention policies and PII handling for community reports.

- QA gates:

  - Each sprint must end with: passing unit tests, component visual regression checks (Chromatic or Storybook snapshot), basic integration smoke tests, and a human-readable release notes summary.

- When producing code, adhere to the listed tech stack. Use TypeScript for frontend and SDK. Backend may use JS CommonJS modules with clearly typed API contracts (OpenAPI).

- Startup behavior for AI agent executing this prompt:

  1. Read project_manifest.json (if missing, create initial manifest with default fields and Phase 1 backlog).

  2. Present sprint plan for confirmation unless auto_proceed_flag is true.

  3. On approval or auto_proceed, create files for the sprint and update manifest, then run tests (or simulate test results) and output results and updated manifest.

  4. Repeat for next sprint until halted by human input or completion of requested phases.

- Provide a minimal Flood Module implementation in this first run as the canonical HazardApp example:

  - Frontend: UI panel registered via plugin-sdk that displays flood forecast layer, gauges, and issue-safety actions.

  - Backend: endpoint to ingest sample flood gauge data, a scheduled job to compute flood risk, and an event publisher that emits FloodAlertIssued with geojson polygon + severity.

  - DB: sample schema and seed data for one river gauge and one admin boundary.

  - Tests: unit test for event publisher and basic UI rendering test.

- Documentation & marketplace flow:

  - Provide publishing checklist for HazardApp authors: manifest schema, required permissions, sample icons, privacy classification, required tests, QA checklist.

  - Provide marketplace item metadata schema and example listing for Flood Module.

- Output style and verbosity:

  - Be concise, structured, and machine-actionable. Use clear IDs, timestamps (ISO8601), semantic versions for files and schemas.

  - Avoid narrative prose beyond necessary explanations for acceptance criteria and instructions.

- Failure & rollback:

  - If any creation step fails, update project_manifest.json with an "error" section describing the failure, revert or flag files, and propose remediation steps.

Required immediate deliverables for this run (Phase 1 bootstrap):

1. project_manifest.json (initial or updated).

2. Sprint plan for Sprint 1 (Platform Foundation) with tasks to create monorepo, ui-lib skeleton + Storybook, app-web shell, backend-api skeleton, project manifest persistence, design tokens, Tailwind config, one sample Flood Module skeleton, and CI pipeline stub.

3. Files created/updated summary with small content previews for:

   - package.json workspace config

   - pnpm-workspace.yaml (or equivalent)

   - project_manifest.json

   - ui-lib/src/components/WorkspaceShell.tsx (shell skeleton)

   - app-web/src/pages/Dashboard.tsx (shell page)

   - backend-api/src/index.js (CommonJS server skeleton)

   - plugin-sdk/src/index.ts (TypeScript SDK skeleton)

   - data/migrations/0001_initial.sql (DB schema)

   - docs/CONTRIBUTING.md (manifest usage rules)

4. Design tokens JSON and Tailwind config snippet.

5. API contract stubs (OpenAPI partial) for auth, organizations, modules, events.

6. Event topic JSON schemas for VegetationStressHigh and FloodAlertIssued.

7. Minimal Flood Module skeleton files (frontend component registration + backend event publisher stub).

8. Explicit next command list and how to run locally.

Produce the entire prompt content above as a single output (no extra commentary).

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1de6e1b5-82ef-493f-9fef-7b2f5fd36dbb).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
