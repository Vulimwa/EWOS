
-- 1. command_centers (hierarchy)
CREATE TABLE public.command_centers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.command_centers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'layers',
  color TEXT DEFAULT 'primary',
  sort_order INT NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, slug)
);
CREATE INDEX idx_command_centers_org ON public.command_centers(org_id);
CREATE INDEX idx_command_centers_parent ON public.command_centers(parent_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.command_centers TO authenticated;
GRANT ALL ON public.command_centers TO service_role;
ALTER TABLE public.command_centers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read command_centers" ON public.command_centers FOR SELECT TO authenticated USING (public.is_org_member(auth.uid(), org_id));
CREATE POLICY "org members write command_centers" ON public.command_centers FOR ALL TO authenticated USING (public.is_org_member(auth.uid(), org_id)) WITH CHECK (public.is_org_member(auth.uid(), org_id));

-- 2. module_installs: attach to a command center
ALTER TABLE public.module_installs
  ADD COLUMN IF NOT EXISTS command_center_id UUID REFERENCES public.command_centers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS config JSONB NOT NULL DEFAULT '{}'::jsonb;
CREATE INDEX IF NOT EXISTS idx_module_installs_cc ON public.module_installs(command_center_id);

-- 3. incidents
CREATE TABLE public.incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  command_center_id UUID REFERENCES public.command_centers(id) ON DELETE SET NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  severity TEXT NOT NULL DEFAULT 'advisory',
  status TEXT NOT NULL DEFAULT 'open',
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  location_name TEXT,
  geom GEOGRAPHY(Point, 4326),
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_incidents_org ON public.incidents(org_id);
CREATE INDEX idx_incidents_status ON public.incidents(org_id, status);
CREATE INDEX idx_incidents_geom ON public.incidents USING GIST(geom);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.incidents TO authenticated;
GRANT ALL ON public.incidents TO service_role;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read incidents" ON public.incidents FOR SELECT TO authenticated USING (public.is_org_member(auth.uid(), org_id));
CREATE POLICY "org members write incidents" ON public.incidents FOR ALL TO authenticated USING (public.is_org_member(auth.uid(), org_id)) WITH CHECK (public.is_org_member(auth.uid(), org_id));

-- 4. assets
CREATE TABLE public.assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'operational',
  capacity INT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  geom GEOGRAPHY(Point, 4326),
  address TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_assets_org ON public.assets(org_id);
CREATE INDEX idx_assets_type ON public.assets(org_id, asset_type);
CREATE INDEX idx_assets_geom ON public.assets USING GIST(geom);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.assets TO authenticated;
GRANT ALL ON public.assets TO service_role;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read assets" ON public.assets FOR SELECT TO authenticated USING (public.is_org_member(auth.uid(), org_id));
CREATE POLICY "org members write assets" ON public.assets FOR ALL TO authenticated USING (public.is_org_member(auth.uid(), org_id)) WITH CHECK (public.is_org_member(auth.uid(), org_id));

-- 5. updated_at triggers
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;
CREATE TRIGGER trg_command_centers_touch BEFORE UPDATE ON public.command_centers FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_incidents_touch BEFORE UPDATE ON public.incidents FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_assets_touch BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 6. Seed HUSIKA command center for the Demo Org
INSERT INTO public.command_centers (org_id, slug, name, description, icon, color, sort_order)
VALUES
  ('00000000-0000-4000-8000-000000000001', 'husika', 'HUSIKA', 'Hazard Unified Situational Intelligence & Knowledge Aggregator', 'radar', 'primary', 0),
  ('00000000-0000-4000-8000-000000000001', 'field-ops', 'Field Operations', 'On-the-ground response coordination', 'siren', 'warning', 1)
ON CONFLICT (org_id, slug) DO NOTHING;
