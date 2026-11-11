-- P0 foundation: normalized features, tool metadata, merge support, public change history, publish guards

-- Extra tool fields for richer fiches + soft merge
ALTER TABLE public.tools
  ADD COLUMN IF NOT EXISTS api_docs_url text,
  ADD COLUMN IF NOT EXISTS repository_url text,
  ADD COLUMN IF NOT EXISTS license text,
  ADD COLUMN IF NOT EXISTS merged_into_tool_id uuid REFERENCES public.tools(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS archived_at timestamptz;

CREATE INDEX IF NOT EXISTS tools_merged_into_idx ON public.tools (merged_into_tool_id)
  WHERE merged_into_tool_id IS NOT NULL;

-- Normalized capabilities catalog
CREATE TABLE IF NOT EXISTS public.features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL UNIQUE,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tool_features (
  tool_id uuid NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  feature_id uuid NOT NULL REFERENCES public.features(id) ON DELETE CASCADE,
  availability text NOT NULL DEFAULT 'available'
    CHECK (availability = ANY (ARRAY['available', 'partial', 'unavailable', 'unknown'])),
  notes text,
  evidence_source_id uuid REFERENCES public.sources(id) ON DELETE SET NULL,
  verified_at date,
  PRIMARY KEY (tool_id, feature_id)
);

CREATE INDEX IF NOT EXISTS tool_features_feature_id_idx ON public.tool_features (feature_id);

ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_features ENABLE ROW LEVEL SECURITY;

-- Public read: features always; tool_features only for published tools
CREATE POLICY features_public_select ON public.features
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY tool_features_public_select ON public.tool_features
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tools t
      WHERE t.id = tool_id AND t.status = 'published'::public.tool_status
    )
  );

CREATE POLICY features_staff_all ON public.features
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY tool_features_staff_all ON public.tool_features
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- Public can read approved change events for published tools
CREATE POLICY change_events_public_approved_select ON public.change_events
  FOR SELECT TO anon, authenticated
  USING (
    review_status = 'approved'
    AND EXISTS (
      SELECT 1 FROM public.tools t
      WHERE t.id = tool_id AND t.status = 'published'::public.tool_status
    )
  );

-- Seed a practical feature catalog (idempotent)
INSERT INTO public.features (key, label, description, sort_order) VALUES
  ('text_generation', 'Text generation', 'Generates or rewrites text content', 10),
  ('image_generation', 'Image generation', 'Creates or edits images', 20),
  ('video_generation', 'Video generation', 'Creates or edits video', 30),
  ('audio_speech', 'Audio & speech', 'Speech, voice, or audio processing', 40),
  ('code_assistance', 'Code assistance', 'Helps write, review, or debug code', 50),
  ('rag_knowledge', 'Knowledge / RAG', 'Grounds answers in documents or knowledge bases', 60),
  ('agents_automation', 'Agents & automation', 'Multi-step agents or workflow automation', 70),
  ('api_access', 'API access', 'Programmatic API available', 80),
  ('structured_output', 'Structured output', 'JSON or schema-constrained responses', 90),
  ('tool_calling', 'Tool calling', 'Can call external tools or functions', 100),
  ('multimodal', 'Multimodal', 'Handles multiple input/output modalities', 110),
  ('local_deploy', 'Local deployment', 'Can run locally or self-hosted', 120),
  ('enterprise_sso', 'Enterprise SSO', 'SSO / enterprise identity support', 130),
  ('team_collab', 'Team collaboration', 'Shared workspaces or team features', 140)
ON CONFLICT (key) DO NOTHING;

-- Server-side publishability check
CREATE OR REPLACE FUNCTION public.tool_is_publishable(p_tool_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  t public.tools%ROWTYPE;
  cat_count integer;
  src_count integer;
BEGIN
  SELECT * INTO t FROM public.tools WHERE id = p_tool_id;
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF coalesce(nullif(trim(t.name), ''), '') = '' THEN RETURN false; END IF;
  IF coalesce(nullif(trim(t.slug), ''), '') = '' THEN RETURN false; END IF;
  IF coalesce(nullif(trim(t.summary), ''), '') = '' THEN RETURN false; END IF;
  IF coalesce(nullif(trim(t.description), ''), '') = '' THEN RETURN false; END IF;
  IF coalesce(nullif(trim(t.official_url), ''), '') = '' THEN RETURN false; END IF;
  IF t.publisher_id IS NULL THEN RETURN false; END IF;

  SELECT count(*) INTO cat_count FROM public.tool_categories WHERE tool_id = p_tool_id;
  IF cat_count < 1 THEN RETURN false; END IF;

  SELECT count(*) INTO src_count FROM public.tool_sources WHERE tool_id = p_tool_id;
  IF src_count < 1 THEN RETURN false; END IF;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.tool_is_publishable(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.tool_is_publishable(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.enforce_tool_publish_requirements()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'published'::public.tool_status
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status OR true) THEN
    -- Re-check after statement would miss junctions on same transaction insert;
    -- only enforce when transitioning into published or staying published with empty essentials.
    IF NEW.status = 'published'::public.tool_status THEN
      IF coalesce(nullif(trim(NEW.name), ''), '') = ''
         OR coalesce(nullif(trim(NEW.slug), ''), '') = ''
         OR coalesce(nullif(trim(NEW.summary), ''), '') = ''
         OR coalesce(nullif(trim(NEW.description), ''), '') = ''
         OR coalesce(nullif(trim(NEW.official_url), ''), '') = ''
         OR NEW.publisher_id IS NULL THEN
        RAISE EXCEPTION 'Cannot publish tool without name, slug, summary, description, official URL and publisher';
      END IF;

      IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM 'published'::public.tool_status THEN
        IF NOT EXISTS (SELECT 1 FROM public.tool_categories WHERE tool_id = NEW.id) THEN
          RAISE EXCEPTION 'Cannot publish tool without at least one category';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM public.tool_sources WHERE tool_id = NEW.id) THEN
          RAISE EXCEPTION 'Cannot publish tool without at least one source';
        END IF;
      END IF;
    END IF;
  END IF;

  IF NEW.status = 'archived'::public.tool_status AND NEW.archived_at IS NULL THEN
    NEW.archived_at := now();
  END IF;

  IF NEW.status IS DISTINCT FROM 'archived'::public.tool_status THEN
    NEW.archived_at := NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tools_enforce_publish ON public.tools;
CREATE TRIGGER tools_enforce_publish
  BEFORE INSERT OR UPDATE ON public.tools
  FOR EACH ROW EXECUTE FUNCTION public.enforce_tool_publish_requirements();
