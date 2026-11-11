-- Ingestion pipeline for Firecrawl candidates

CREATE TYPE public.ingestion_candidate_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'duplicate'
);

CREATE TYPE public.ingestion_source_type AS ENUM (
  'manual_url',
  'daily_search'
);

CREATE TYPE public.ingestion_run_kind AS ENUM (
  'manual_ingest',
  'daily_discover'
);

CREATE TABLE public.ingestion_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_url text NOT NULL,
  dedupe_key text NOT NULL,
  source_type public.ingestion_source_type NOT NULL DEFAULT 'manual_url',
  status public.ingestion_candidate_status NOT NULL DEFAULT 'pending',
  extracted_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  raw_markdown text,
  confidence numeric,
  error text,
  discovered_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  tool_id uuid REFERENCES public.tools(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ingestion_candidates_dedupe_key_unique UNIQUE (dedupe_key)
);

CREATE TABLE public.ingestion_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind public.ingestion_run_kind NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  stats jsonb NOT NULL DEFAULT '{}'::jsonb,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ingestion_candidates_status_idx ON public.ingestion_candidates (status);
CREATE INDEX ingestion_candidates_discovered_idx ON public.ingestion_candidates (discovered_at DESC);
CREATE INDEX ingestion_runs_started_idx ON public.ingestion_runs (started_at DESC);

CREATE TRIGGER ingestion_candidates_set_updated_at
  BEFORE UPDATE ON public.ingestion_candidates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.ingestion_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingestion_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY ingestion_candidates_staff_all ON public.ingestion_candidates
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY ingestion_runs_staff_all ON public.ingestion_runs
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- Seed lock row for daily discover job
INSERT INTO public.watch_state (id, last_result)
VALUES ('discover_daily', 'initialized')
ON CONFLICT (id) DO NOTHING;
