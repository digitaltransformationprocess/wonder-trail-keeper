-- AI Discovery Platform — core catalog schema

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TYPE public.tool_status AS ENUM (
  'discovered',
  'pending_review',
  'published',
  'needs_update',
  'archived'
);

CREATE TYPE public.news_status AS ENUM (
  'draft',
  'published',
  'archived'
);

CREATE TYPE public.reliability_level AS ENUM (
  'A',
  'B',
  'C',
  'D'
);

CREATE TABLE public.publishers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  website_url text,
  description text,
  country_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  parent_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.solution_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.platforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  publisher_id uuid REFERENCES public.publishers(id) ON DELETE SET NULL,
  summary text NOT NULL,
  description text NOT NULL,
  official_url text NOT NULL,
  logo_url text,
  status public.tool_status NOT NULL DEFAULT 'pending_review',
  pricing_model text,
  price_display text,
  api_available boolean,
  open_source boolean NOT NULL DEFAULT false,
  local_available boolean NOT NULL DEFAULT false,
  keywords text[] NOT NULL DEFAULT '{}',
  strengths text[] NOT NULL DEFAULT '{}',
  limits text[] NOT NULL DEFAULT '{}',
  audience text[] NOT NULL DEFAULT '{}',
  last_verified_at date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tools_pricing_model_check CHECK (
    pricing_model IS NULL OR pricing_model = ANY (ARRAY[
      'Free','Freemium','Paid','Open source','Not disclosed'
    ])
  )
);

CREATE TABLE public.tool_categories (
  tool_id uuid NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  is_primary boolean NOT NULL DEFAULT false,
  PRIMARY KEY (tool_id, category_id)
);

CREATE TABLE public.tool_types (
  tool_id uuid NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  solution_type_id uuid NOT NULL REFERENCES public.solution_types(id) ON DELETE CASCADE,
  is_primary boolean NOT NULL DEFAULT true,
  PRIMARY KEY (tool_id, solution_type_id)
);

CREATE TABLE public.tool_platforms (
  tool_id uuid NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  platform_id uuid NOT NULL REFERENCES public.platforms(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'available',
  notes text,
  PRIMARY KEY (tool_id, platform_id)
);

CREATE TABLE public.sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type text NOT NULL DEFAULT 'official',
  url text NOT NULL UNIQUE,
  publisher text,
  reliability_level public.reliability_level NOT NULL DEFAULT 'A',
  terms_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.tool_sources (
  tool_id uuid NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  source_id uuid NOT NULL REFERENCES public.sources(id) ON DELETE CASCADE,
  claim_key text NOT NULL DEFAULT 'general',
  captured_at timestamptz NOT NULL DEFAULT now(),
  verified_at date,
  PRIMARY KEY (tool_id, source_id, claim_key)
);

CREATE TABLE public.pricing_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  plan_name text NOT NULL,
  price_amount numeric,
  currency text,
  billing_period text,
  pricing_model text,
  limits_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_id uuid REFERENCES public.sources(id) ON DELETE SET NULL,
  verified_at date,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.tool_relations (
  source_tool_id uuid NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  target_tool_id uuid NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  relation_type text NOT NULL DEFAULT 'alternative',
  explanation text,
  PRIMARY KEY (source_tool_id, target_tool_id, relation_type),
  CONSTRAINT tool_relations_no_self CHECK (source_tool_id <> target_tool_id)
);

CREATE TABLE public.news_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE,
  summary text NOT NULL,
  body text,
  kind text NOT NULL,
  event_type text,
  published_at date NOT NULL,
  status public.news_status NOT NULL DEFAULT 'draft',
  solution_slug text,
  source_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.news_tool_links (
  news_item_id uuid NOT NULL REFERENCES public.news_items(id) ON DELETE CASCADE,
  tool_id uuid NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  PRIMARY KEY (news_item_id, tool_id)
);

CREATE TABLE public.change_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid REFERENCES public.tools(id) ON DELETE CASCADE,
  field_key text NOT NULL,
  old_value text,
  new_value text,
  source_id uuid REFERENCES public.sources(id) ON DELETE SET NULL,
  detected_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);

CREATE TABLE public.watch_state (
  id text PRIMARY KEY,
  last_result text,
  last_run_at timestamptz,
  locked_until timestamptz,
  paused_reason text
);

CREATE INDEX tools_status_idx ON public.tools (status);
CREATE INDEX tools_last_verified_idx ON public.tools (last_verified_at);
CREATE INDEX tools_name_trgm_idx ON public.tools USING gin (name gin_trgm_ops);
CREATE INDEX tools_keywords_idx ON public.tools USING gin (keywords);
CREATE INDEX news_items_published_idx ON public.news_items (published_at DESC);
CREATE INDEX news_items_status_idx ON public.news_items (status);
CREATE INDEX tool_categories_category_idx ON public.tool_categories (category_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER tools_set_updated_at
  BEFORE UPDATE ON public.tools
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER publishers_set_updated_at
  BEFORE UPDATE ON public.publishers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER news_items_set_updated_at
  BEFORE UPDATE ON public.news_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Public read for published catalog content
ALTER TABLE public.publishers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solution_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_tool_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY publishers_public_read ON public.publishers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY categories_public_read ON public.categories FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY solution_types_public_read ON public.solution_types FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY platforms_public_read ON public.platforms FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY tools_public_read ON public.tools FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY tool_categories_public_read ON public.tool_categories FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.tools t WHERE t.id = tool_id AND t.status = 'published'));
CREATE POLICY tool_types_public_read ON public.tool_types FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.tools t WHERE t.id = tool_id AND t.status = 'published'));
CREATE POLICY tool_platforms_public_read ON public.tool_platforms FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.tools t WHERE t.id = tool_id AND t.status = 'published'));
CREATE POLICY sources_public_read ON public.sources FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY tool_sources_public_read ON public.tool_sources FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.tools t WHERE t.id = tool_id AND t.status = 'published'));
CREATE POLICY pricing_plans_public_read ON public.pricing_plans FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.tools t WHERE t.id = tool_id AND t.status = 'published'));
CREATE POLICY tool_relations_public_read ON public.tool_relations FOR SELECT TO anon, authenticated
  USING (
    EXISTS (SELECT 1 FROM public.tools t WHERE t.id = source_tool_id AND t.status = 'published')
    AND EXISTS (SELECT 1 FROM public.tools t WHERE t.id = target_tool_id AND t.status = 'published')
  );
CREATE POLICY news_items_public_read ON public.news_items FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY news_tool_links_public_read ON public.news_tool_links FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.news_items n WHERE n.id = news_item_id AND n.status = 'published'));

-- No public access to change_events / watch_state (service role only)
