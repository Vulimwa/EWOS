# EWOS — Contribution & Manifest Rules

## Single source of truth

`project_manifest.json` at the repo root is the canonical project state. **Every AI run and every human contribution must:**

1. Read `project_manifest.json` before making changes.
2. Never delete historical entries — completed work is appended to `completed_tasks[]`.
3. Update `last_checkpoint_timestamp` (ISO8601), `backlog[]` statuses, and `open_issues[]` on every change.
4. Append a human-readable entry to `CHANGELOG.md` per run.
5. Respect `auto_proceed_flag`: when `false`, present the next sprint plan for approval before building; when `true`, continue to the next sprint automatically.

## Architecture invariants (do not break)

- **Modular HazardApps**: hazard features live in `src/modules/<slug>/` and register through the SDK (`src/sdk`). No hazard logic in the shell.
- **Event-driven**: modules communicate through the event bus (`events` table + realtime), never by importing each other.
- **Org scoping**: every domain table carries `org_id`; RLS enforces it. New tables must ship GRANTs + RLS in the same migration.
- **Design tokens only**: no hardcoded color classes in components; all colors/severity styles come from `src/styles.css` tokens (mirrored in `src/design/tokens.json`).
- **Event schema versioning**: event payloads follow the JSON Schemas in `src/events/schemas/`, versioned with semver in `events.schema_version`. Breaking payload changes bump the major version and keep the old schema file.

## Repo map (BRD monorepo → this repo)

| BRD package   | Location here                              |
| ------------- | ------------------------------------------ |
| app-web       | `src/routes/`, `src/components/`           |
| ui-lib        | `src/components/ewos/`, `src/styles.css`   |
| plugin-sdk    | `src/sdk/`                                 |
| backend-api   | `src/lib/*.functions.ts`, `src/routes/api/`|
| data          | Lovable Cloud migrations (managed)         |
| docs          | `docs/`                                    |

## QA gate per sprint

- Build passes (typecheck + vite build)
- Flood pipeline smoke test: risk scan publishes an event that appears in the alerts feed and on the map
- Release notes appended to `CHANGELOG.md`