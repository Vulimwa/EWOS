# EWOS

Early Warning Operating System.
Shopify unified commerce. ClickUp unified work. M-Pesa unified digital services. EWOS unifies early warning systems. One platform. Many warning systems. Connected intelligence.

EWOS is an open, modular platform for multi-hazard environmental intelligence. It turns fragmented warning systems into installable HazardApps that can be connected, managed, and operated from a single workspace.

The platform is designed for governments, regional organizations, NGOs, researchers, developers, and communities that need one coordinated view of risk instead of many disconnected dashboards.

## Executive Summary

Environmental and disaster management organizations have invested heavily in early warning systems for specific hazards such as floods, droughts, wildfires, landslides, air quality, food security, and climate forecasting. While valuable, these systems usually operate as separate applications, dashboards, or portals.

That fragmentation forces users to switch between tools to understand a single evolving situation. EWOS changes that model by providing shared infrastructure for authentication, GIS mapping, notifications, AI assistance, user management, data integration, event processing, plugin development, and marketplace distribution.

Developers focus on hazard intelligence. EWOS handles the platform layer.

## Problem Statement

### Fragmented User Experience

Emergency managers often move between Hazard Watch, D-Watch, weather portals, river monitoring systems, wildfire dashboards, SMS platforms, and community reporting tools. Each system has its own interface and workflow, which makes operational coordination slow and fragmented.

### Developer Duplication

Every new warning system tends to rebuild the same base features: authentication, maps, notifications, dashboards, APIs, databases, and user management. That duplication slows innovation and increases delivery cost.

### Limited Interoperability

Most systems operate independently. A drought system may detect severe vegetation stress, but the wildfire, agriculture, and health systems do not automatically receive or act on that information. Emergency managers are left combining the picture manually.

### Slow Innovation

New capabilities often require procurement cycles, custom software development, and complex integrations before they can be used operationally.

## Vision

To become the operating system powering interoperable environmental intelligence and multi-hazard early warning ecosystems across Africa and beyond.

## Mission

Enable governments, NGOs, researchers, startups, and developers to build, integrate, deploy, and operate hazard intelligence services through one shared platform.

## Project Objectives

- Eliminate application fragmentation.
- Simplify developer onboarding.
- Enable plug-and-play hazard modules.
- Support AI-driven decision intelligence.
- Improve interoperability across hazards.
- Reduce implementation costs.
- Accelerate innovation.
- Strengthen regional resilience.

## Target Users

### Governments

National Disaster Agencies, Meteorological Departments, Ministries, and County Governments.

### Regional Organizations

ICPAC, IGAD, African Union, and River Basin Authorities.

### NGOs

Red Cross, World Vision, CARE, and Mercy Corps.

### Researchers

Universities, climate scientists, GIS specialists, and AI researchers.

### Developers

Independent developers, climate tech startups, and open source communities.

### Citizens

Farmers, community leaders, emergency volunteers, and the general public.

## Existing Challenges

Users currently rely on numerous disconnected systems such as Hazard Watch, Drought Watch, Agriculture Watch, Threshold Systems, Weather Portals, River Monitoring, and Community Reports.

Each system typically has separate login, dashboard, maps, and notifications. The result is context switching, information overload, duplicate infrastructure, and reduced situational awareness.

## Proposed Solution

EWOS provides one parent platform. Individual hazard systems become installable modules.

Instead of many isolated apps, EWOS hosts a unified set of HazardApps such as Flood Module, Wildfire Module, Drought Module, Weather Module, and Community Reporting Module.

All modules share one platform and one event-driven operating model.

## Core Platform Components

### Workspace

The Workspace is the unified operational dashboard. It provides maps, alerts, analytics, AI, and reports.

### Capability Store

Organizations browse and install capabilities such as Flood Monitoring, Wildfire Prediction, Drought Watch, Air Quality, Community Reports, SMS Gateway, and WhatsApp Alerts.

### Organization Manager

Organizations manage users, permissions, installed modules, locations, and assets.

### GIS Engine

Shared mapping services support GeoJSON, raster, vector, satellite imagery, and administrative boundaries.

### Notification Engine

Supports SMS, email, push notifications, WhatsApp, and CAP alerts.

### AI Decision Assistant

Provides risk summaries, situation reports, cross-hazard reasoning, and planning recommendations.

### Event Bus

The Event Bus is the heart of EWOS. Modules communicate through standardized events instead of direct coupling.

### Hazard Modules

Example capabilities include Flood Monitoring, Wildfire Prediction, Drought Monitoring, Landslide Risk, Heatwave Monitoring, Air Quality, River Gauges, Weather, Agriculture Watch, Food Security, Water Resources, Wildlife Conflict, and Disease Surveillance.

### Plugin SDK

Developers receive APIs, templates, UI components, authentication, mapping components, notification APIs, and event APIs. They only implement business logic.

## Event-Driven Architecture

EWOS is built around chained hazard intelligence.

Example workflow:

Drought Index

Vegetation Stress

Wildfire Risk

Agriculture Impact

Food Security Risk

Community Alert

Response Planning

This model lets hazards become connected instead of isolated.

## Artificial Intelligence

EWOS uses AI for cross-hazard reasoning, risk summarization, incident explanation, situation awareness, recommendation generation, and planning support.

Example query: “What hazards currently affect Marsabit?”

The AI assistant summarizes the relevant installed modules into one report.

## Marketplace Workflow

Developer

Builds Plugin

Publishes Capability

EWOS Reviews

Marketplace

Organization Installs

Immediately Available

## User Journey

County Disaster Officer

Login

Browse Capability Store

Install Flood Module

Install Wildfire Module

Configure Notifications

Monitor Dashboard

Receive AI Insights

Coordinate Response

## Functional Requirements

The system shall authenticate users, manage organizations, manage modules, display GIS maps, visualize hazard layers, support notifications, expose APIs, process events, support an AI assistant, manage permissions, and generate reports.

## Non-Functional Requirements

Scalable, modular, secure, cloud-native, mobile-friendly, API-first, offline-capable, high availability, and extensible.

## Technology Stack

### Hackathon MVP

- Frontend: React, TypeScript, Tailwind CSS, MapLibre GL JS
- Backend: FastAPI, Python
- Database: PostgreSQL, PostGIS
- Authentication: Supabase Auth
- AI: OpenAI, Gemini
- Maps: OpenStreetMap, MapLibre
- Notifications: WhatsApp API, SMS Gateway
- Deployment: Docker, Render/Vercel, Railway/Supabase

### Repository Implementation

This repository currently contains the TanStack Start frontend shell, Supabase integration, event-driven workspace, SDK scaffolding, and the initial EWOS product surfaces.

## Hackathon MVP Scope

Deliverables:

- Unified Dashboard
- Interactive Map
- Capability Store
- Wildfire Module
- Drought Module
- Community Reports Module
- Event Bus Demonstration
- AI Assistant

## Future Roadmap

### Phase 1

Platform Foundation.

### Phase 2

Developer SDK.

### Phase 3

Marketplace.

### Phase 4

AI Orchestration.

### Phase 5

Regional Integrations.

### Phase 6

Mobile Applications.

### Phase 7

Open Ecosystem.

## Expected Benefits

### Governments

Lower implementation cost, faster deployment, and better coordination.

### Developers

Less duplicated work, standardized development, and faster innovation.

### Communities

Better awareness, a single user experience, and faster alerts.

### Researchers

Easier deployment, a larger audience, and shared infrastructure.

## Competitive Positioning

Unlike traditional multi-hazard early warning systems that primarily aggregate hazard data, EWOS provides the infrastructure for building, integrating, and operating interoperable hazard capabilities.

EWOS is not another warning system.

EWOS is the platform upon which future warning systems are built.

## Product Surfaces in This Repository

- Landing page: portal chooser and access routing.
- Workspace: map-first operational shell with top bar, module navigation, event feed, contextual panel, bottom actions, and AI assistant.
- Capability Store: browse installed and available HazardApps.
- Organization Portal: dashboard for hazards, incidents, command centers, installs, assets, and notifications.
- Developer Portal: list and publish HazardApps tied to the current user.
- Admin Portal: organization oversight.
- Citizen Portal: public-facing safety surface.

## Technical Highlights

- Authentication and portal-based access control through Supabase.
- TanStack Start file-based routing.
- MapLibre-based GIS canvas with dark and satellite basemaps.
- GeoJSON overlays for alerts, administrative boundaries, and gauges.
- Flood risk scan flow that publishes `FloodAlertIssued` events.
- Realtime event feed with severity badges and event detail drilldown.
- AI chat endpoint at `/api/chat` backed by server-side AI integration.
- Plugin registration through `src/modules/registry.ts` and `src/sdk`.

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

## Getting Started

### Prerequisites

- Node.js 20 or newer
- A Supabase project
- A server-side API key for the AI assistant

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
npm run seed:demo-user
```

## Development Notes

- Routes are file-based under `src/routes`.
- `src/routes/__root.tsx` is the root shell and should be preserved.
- `routeTree.gen.ts` is generated and should not be edited by hand.
- Modules should communicate through the event bus rather than direct shell integration.
- The organization demo data uses a shared demo org so the workspace can show live hazard context immediately.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
