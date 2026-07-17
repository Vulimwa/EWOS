
# Portal Chooser + Organization Portal Buildout

Goal: replace the direct `/` GIS workspace with a **portal chooser landing page**, give each portal its own auth flow, and complete the Organization Portal feature set. Developer and Platform Admin portals are scaffolded with role-gated dashboards so the architecture is in place without hardcoding.

## 1. Landing + auth routing

- **New `/` (public landing)**: three portal cards — Organization, Developer, Platform Admin. Each card links to `/auth/{portal}` (sign-in / sign-up scoped to that portal type). If the visitor is already signed in, cards route directly to the portal home.
- **Move GIS workspace** from `/` → `/portal/workspace` (keeps existing MapCanvas, LeftNav, RightPanel, AIAssistant, keyboard shortcuts). All existing `/` links updated.
- **Portal-scoped auth**: `/auth/organization`, `/auth/developer`, `/auth/admin` — each reuses the existing email + Google flow but stamps `intended_portal` on the profile at signup and redirects to the correct portal home on success. Existing `/auth` becomes a redirect to `/auth/organization` for backward compatibility.
- **Role enforcement**: extend `app_role` enum with `developer` and `platform_admin`. `handle_new_user` trigger assigns the role matching the chosen portal (organization sign-ups keep the current viewer-in-Demo-Org behavior). Route gates (`AuthGate` variants) check role via `has_role`.

## 2. Organization Portal — fill in missing features

Existing (keep, do not rebuild): Dashboard, Command Centers hierarchy, Incidents, Assets, Notifications feed, Users stub, Reports stub, Analytics stub, Capability Store at `/store`, GIS Workspace, AI Assistant floating panel.

Build the missing pieces:

- **Installed Capabilities manager** — `/portal/capabilities`: list `module_installs`, toggle status (active/paused), edit config JSON, show version, uninstall (publishes `CapabilityRemoved` event). Reuse existing event bus.
- **Response Planning** — `/portal/response`: new tables `response_plans`, `evacuation_routes` (LineString), `shelters` (Point, reuse `assets` with `type='shelter'`), `resources`. CRUD UI + map preview.
- **Users & Roles (real)** — replace stub: list members of current org (join `profiles` + `user_roles`), invite by email (creates pending invite row), change role (admin/responder/viewer), remove.
- **Reports (real)** — replace stub: generate Daily / Weekly / Monthly situation reports from incidents + events; export PDF (via `jspdf`) and Excel (via `xlsx`). Store generated report metadata in a new `reports` table.
- **Analytics (real)** — replace stub: Recharts dashboards for incident trends, hazard distribution, response time, module usage. Queries via existing supabase client.
- **Notifications broadcast** — extend existing feed: composer to send to SMS/WhatsApp/Push/Email channels (records intent in `notifications` table with `channel`; actual delivery integrations are out of scope, marked as `pending_delivery`).
- **Dashboard live map** — embed a compact MapCanvas on `/portal` showing active hazards + assets.

## 3. Developer Portal — scaffold

- `/developer` layout gated by `developer` role. Sidebar: Dashboard, Plugin Builder, SDK Docs, API Explorer, Event Registry, Sandbox, Marketplace, Analytics.
- Dashboard shows the developer's published `modules` (join on `modules.publisher_id` — new column). Plugin Builder is a form that writes to `modules`. SDK Docs surfaces existing `docs/sdk.md`. API Explorer renders `docs/api/openapi.json`. Event Registry lists JSON Schemas under `src/events/schemas/`. Sandbox = iframe running a test HazardApp against a demo org. Marketplace + Analytics start as stub pages powered by real queries where data exists.

## 4. Platform Admin Portal — scaffold

- `/admin` gated by `platform_admin`. Sidebar: Organizations, Marketplace Moderation, Users, AI Monitoring, Infrastructure.
- Organizations: list all orgs, approve/suspend (new `status` column), delete. Marketplace Moderation: pending modules → approve/reject (`modules.status`). Users: all-users table, disable/enable. AI Monitoring + Infrastructure: real Supabase health via `supabase--db_health` where possible, otherwise clearly labelled placeholders (no fabricated metrics).

## 5. Database migrations

- `app_role` enum: add `developer`, `platform_admin`, `responder`.
- `profiles`: add `intended_portal text`, `full_name text` (if missing).
- `modules`: add `publisher_id uuid`, `status text default 'draft'` (draft/pending/approved/rejected/archived), `version text`.
- `organizations`: add `status text default 'active'` (active/pending/suspended).
- New tables (with GRANTs + RLS scoped by `is_org_member` / `has_role('platform_admin')`):
  - `response_plans` (org_id, name, description, plan jsonb, status)
  - `evacuation_routes` (org_id, name, geom geography(LineString,4326), notes)
  - `resources` (org_id, name, type, quantity, location geography(Point,4326))
  - `reports` (org_id, kind, period_start, period_end, format, payload jsonb, generated_by, url)
  - `org_invites` (org_id, email, role, invited_by, status, token)
- `handle_new_user` trigger updated to read `intended_portal` from raw_user_meta_data and assign the matching role; organization signups keep Demo Org viewer default.

## 6. Events

Publish through existing event bus:
- `CapabilityInstalled` (already exists via store install flow — verify)
- `CapabilityRemoved` (new — from Installed Capabilities uninstall)
- `IncidentCreated`, `IncidentUpdated` (wire into existing incident forms)
- `NotificationSent` (from broadcast composer)
- `CommandCenterCreated` (from hierarchy form)

## Technical notes

- No hardcoded org IDs in new code — read from `useOrg()`. Demo org fallback stays only in the existing seed migration.
- All new server writes go through RLS + `is_org_member` / `has_role` checks. Admin actions use `supabaseAdmin` inside handlers guarded by `has_role('platform_admin')`.
- Route structure:

```text
/                          public landing (portal chooser)
/auth/organization         org signup/signin
/auth/developer            dev signup/signin
/auth/admin                admin signin (no self-signup; invite only)
/portal/*                  organization portal (existing + new pages)
/portal/workspace          GIS workspace (moved from /)
/developer/*               developer portal (new)
/admin/*                   platform admin portal (new)
/store                     capability store (existing, linked from /portal)
```

- New deps: `jspdf`, `xlsx`, `recharts` (if not present).
- All portal shells share the existing `TopBar`; each has its own sidebar component under `src/components/{portal,developer,admin}/Shell.tsx`.

## Scope this turn

This is ~2 sprints of work. I'll deliver in this order and stop after each checkpoint so you can review:

1. **Checkpoint A** (this turn): Migrations (roles, profile fields, new tables, module/org status), portal chooser landing at `/`, portal-scoped auth routes, GIS workspace moved to `/portal/workspace`, role-gated shells for Developer + Admin with dashboards wired to real queries.
2. **Checkpoint B**: Organization Portal missing features (Installed Capabilities, Response Planning, real Users/Reports/Analytics/Notifications broadcast, dashboard live map) + `CapabilityRemoved` / `IncidentCreated` / `NotificationSent` event wiring.
3. **Checkpoint C**: Developer Portal (Plugin Builder, API Explorer, Event Registry, Sandbox) + Platform Admin Portal (Org approval, Marketplace moderation, User management).

Confirm and I'll start Checkpoint A.
