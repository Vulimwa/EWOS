/** Portal registry — one source of truth for portal-scoped auth, roles, and homes. */
import type { LucideIcon } from "lucide-react";
import { Building2, Code2, ShieldCheck, Users } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];
export type PortalId = "organization" | "developer" | "admin" | "citizen";

export interface PortalDef {
  id: PortalId;
  name: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  authPath: string;
  home: string;
  allowSignup: boolean;
  role: AppRole; // role assigned/checked for this portal
}

export const PORTALS: Record<PortalId, PortalDef> = {
  organization: {
    id: "organization",
    name: "Organization Portal",
    tagline: "Operate hazards, incidents, and response.",
    description:
      "For governments, NGOs, counties, and regional agencies running command centers and HazardApps.",
    icon: Building2,
    accent: "from-primary/20 to-primary/5",
    authPath: "/auth/organization",
    home: "/portal",
    allowSignup: true,
    role: "viewer",
  },
  citizen: {
    id: "citizen",
    name: "Citizen Portal",
    tagline: "Stay informed. Report hazards.",
    description:
      "For the public — receive alerts, view live hazards, report incidents, and get AI-guided safety help.",
    icon: Users,
    accent: "from-emerald-500/20 to-emerald-500/5",
    authPath: "/auth/citizen",
    home: "/citizen",
    allowSignup: true,
    role: "citizen",
  },
  developer: {
    id: "developer",
    name: "Developer Portal",
    tagline: "Build and publish HazardApps.",
    description:
      "SDK, event registry, plugin builder, sandbox, and marketplace analytics for HazardApp authors.",
    icon: Code2,
    accent: "from-cyan-500/20 to-cyan-500/5",
    authPath: "/auth/developer",
    home: "/developer",
    allowSignup: true,
    role: "developer",
  },
  admin: {
    id: "admin",
    name: "Platform Admin",
    tagline: "Operate the EWOS ecosystem.",
    description:
      "Approve organizations, moderate the marketplace, monitor AI usage, and manage infrastructure.",
    icon: ShieldCheck,
    accent: "from-amber-500/20 to-amber-500/5",
    authPath: "/auth/admin",
    home: "/admin",
    allowSignup: false,
    role: "platform_admin",
  },
};

export const PORTAL_LIST: PortalDef[] = [
  PORTALS.organization,
  PORTALS.citizen,
  PORTALS.developer,
  PORTALS.admin,
];

/** Roles that count as access to the organization portal (any operational role). */
export const ORG_ROLES: AppRole[] = ["viewer", "operator", "admin", "responder"];