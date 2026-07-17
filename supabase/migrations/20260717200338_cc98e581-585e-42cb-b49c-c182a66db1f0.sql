
-- profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS intended_portal text NOT NULL DEFAULT 'organization';

-- organizations
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

-- modules
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS publisher_id uuid;
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'approved';
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS version text NOT NULL DEFAULT '0.1.0';

-- helper: updated_at
CREATE OR REPLACE FUNCTION public.tg_set_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- response_plans
CREATE TABLE IF NOT EXISTS public.response_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  plan jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.response_plans TO authenticated;
GRANT ALL ON public.response_plans TO service_role;
ALTER TABLE public.response_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read plans" ON public.response_plans FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), org_id));
CREATE POLICY "org members write plans" ON public.response_plans FOR ALL TO authenticated
  USING (public.is_org_member(auth.uid(), org_id)) WITH CHECK (public.is_org_member(auth.uid(), org_id));
CREATE TRIGGER response_plans_updated BEFORE UPDATE ON public.response_plans
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- evacuation_routes
CREATE TABLE IF NOT EXISTS public.evacuation_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  notes text,
  geom geography(LineString, 4326),
  geom_geojson jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.evacuation_routes TO authenticated;
GRANT ALL ON public.evacuation_routes TO service_role;
ALTER TABLE public.evacuation_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read routes" ON public.evacuation_routes FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), org_id));
CREATE POLICY "org members write routes" ON public.evacuation_routes FOR ALL TO authenticated
  USING (public.is_org_member(auth.uid(), org_id)) WITH CHECK (public.is_org_member(auth.uid(), org_id));
CREATE TRIGGER evacuation_routes_updated BEFORE UPDATE ON public.evacuation_routes
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- resources
CREATE TABLE IF NOT EXISTS public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  resource_type text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'available',
  location_geojson jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resources TO authenticated;
GRANT ALL ON public.resources TO service_role;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read resources" ON public.resources FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), org_id));
CREATE POLICY "org members write resources" ON public.resources FOR ALL TO authenticated
  USING (public.is_org_member(auth.uid(), org_id)) WITH CHECK (public.is_org_member(auth.uid(), org_id));
CREATE TRIGGER resources_updated BEFORE UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- reports
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  kind text NOT NULL,
  period_start timestamptz,
  period_end timestamptz,
  format text NOT NULL DEFAULT 'pdf',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  generated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read reports" ON public.reports FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), org_id));
CREATE POLICY "org members write reports" ON public.reports FOR ALL TO authenticated
  USING (public.is_org_member(auth.uid(), org_id)) WITH CHECK (public.is_org_member(auth.uid(), org_id));

-- org_invites
CREATE TABLE IF NOT EXISTS public.org_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  role public.app_role NOT NULL DEFAULT 'viewer',
  status text NOT NULL DEFAULT 'pending',
  invited_by uuid,
  token text NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, email)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.org_invites TO authenticated;
GRANT ALL ON public.org_invites TO service_role;
ALTER TABLE public.org_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read invites" ON public.org_invites FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), org_id));
CREATE POLICY "org members write invites" ON public.org_invites FOR ALL TO authenticated
  USING (public.is_org_member(auth.uid(), org_id)) WITH CHECK (public.is_org_member(auth.uid(), org_id));

-- Updated new-user trigger: read intended_portal from user metadata.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  demo_org UUID := '00000000-0000-4000-8000-000000000001';
  portal TEXT := COALESCE(NEW.raw_user_meta_data->>'intended_portal', 'organization');
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url, intended_portal)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    portal
  )
  ON CONFLICT (id) DO UPDATE SET intended_portal = EXCLUDED.intended_portal;

  IF portal = 'developer' THEN
    INSERT INTO public.user_roles (user_id, org_id, role)
    VALUES (NEW.id, demo_org, 'developer') ON CONFLICT DO NOTHING;
  ELSIF portal = 'admin' THEN
    -- Platform admin cannot self-elevate; a bootstrap admin must grant this role.
    INSERT INTO public.user_roles (user_id, org_id, role)
    VALUES (NEW.id, demo_org, 'viewer') ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, org_id, role)
    VALUES (NEW.id, demo_org, 'viewer') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END $$;
