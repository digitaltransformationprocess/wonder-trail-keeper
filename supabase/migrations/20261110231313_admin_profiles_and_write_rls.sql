-- Roles & profiles for admin catalog operations

CREATE TYPE public.app_role AS ENUM (
  'visitor',
  'user',
  'contributor',
  'editor',
  'admin',
  'owner'
);

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX profiles_role_idx ON public.profiles (role);

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('editor'::public.app_role, 'admin'::public.app_role, 'owner'::public.app_role)
  );
$$;

CREATE OR REPLACE FUNCTION public.current_role()
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()),
    'visitor'::public.app_role
  );
$$;

-- First registered account becomes owner; later accounts stay regular users.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  staff_count integer;
BEGIN
  SELECT count(*) INTO staff_count
  FROM public.profiles
  WHERE role IN ('editor'::public.app_role, 'admin'::public.app_role, 'owner'::public.app_role);

  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    CASE
      WHEN staff_count = 0 THEN 'owner'::public.app_role
      ELSE 'user'::public.app_role
    END
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Profiles policies
CREATE POLICY profiles_select_own_or_staff ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_staff());

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
  );

CREATE POLICY profiles_staff_update ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- Staff can read all catalog rows (including drafts/archived)
CREATE POLICY tools_staff_select ON public.tools
  FOR SELECT TO authenticated USING (public.is_staff());
CREATE POLICY tools_staff_insert ON public.tools
  FOR INSERT TO authenticated WITH CHECK (public.is_staff());
CREATE POLICY tools_staff_update ON public.tools
  FOR UPDATE TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY tools_staff_delete ON public.tools
  FOR DELETE TO authenticated USING (public.is_staff());

CREATE POLICY publishers_staff_write ON public.publishers
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY categories_staff_write ON public.categories
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY solution_types_staff_write ON public.solution_types
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY platforms_staff_write ON public.platforms
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY sources_staff_write ON public.sources
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY pricing_plans_staff_write ON public.pricing_plans
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY news_items_staff_select ON public.news_items
  FOR SELECT TO authenticated USING (public.is_staff());
CREATE POLICY news_items_staff_write ON public.news_items
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY change_events_staff_all ON public.change_events
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY watch_state_staff_all ON public.watch_state
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());

-- Junction tables
CREATE POLICY tool_categories_staff_all ON public.tool_categories
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY tool_types_staff_all ON public.tool_types
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY tool_platforms_staff_all ON public.tool_platforms
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY tool_sources_staff_all ON public.tool_sources
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY tool_relations_staff_all ON public.tool_relations
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY news_tool_links_staff_all ON public.news_tool_links
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
