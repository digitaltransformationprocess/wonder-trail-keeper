-- Internal tool ranking (popularity + trust). Not exposed to anon/authenticated clients.

CREATE TABLE IF NOT EXISTS public.tool_internal_ranks (
  tool_id uuid PRIMARY KEY REFERENCES public.tools(id) ON DELETE CASCADE,
  popularity smallint NOT NULL DEFAULT 40 CHECK (popularity BETWEEN 0 AND 100),
  trust smallint NOT NULL DEFAULT 40 CHECK (trust BETWEEN 0 AND 100),
  rank_score smallint NOT NULL DEFAULT 40 CHECK (rank_score BETWEEN 0 AND 100),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tool_internal_ranks_score_idx
  ON public.tool_internal_ranks (rank_score DESC);

ALTER TABLE public.tool_internal_ranks ENABLE ROW LEVEL SECURITY;

-- No policies for anon/authenticated → PostgREST cannot read/write this table.
-- service_role bypasses RLS for edge functions / admin jobs.
REVOKE ALL ON TABLE public.tool_internal_ranks FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.tool_internal_ranks TO service_role;

CREATE OR REPLACE FUNCTION public.compute_tool_trust(p_tool_id uuid)
RETURNS smallint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH src AS (
    SELECT s.reliability_level, ts.verified_at, t.last_verified_at
    FROM public.tools t
    LEFT JOIN public.tool_sources ts ON ts.tool_id = t.id
    LEFT JOIN public.sources s ON s.id = ts.source_id
    WHERE t.id = p_tool_id
  ),
  agg AS (
    SELECT
      COALESCE(MAX(
        CASE reliability_level
          WHEN 'A' THEN 92
          WHEN 'B' THEN 74
          WHEN 'C' THEN 52
          WHEN 'D' THEN 30
          ELSE 40
        END
      ), 40) AS source_trust,
      MAX(COALESCE(verified_at, last_verified_at)) AS verified_on
    FROM src
  )
  SELECT LEAST(100, GREATEST(0,
    source_trust
    + CASE
        WHEN verified_on IS NULL THEN -8
        WHEN verified_on >= (CURRENT_DATE - 60) THEN 8
        WHEN verified_on >= (CURRENT_DATE - 180) THEN 4
        WHEN verified_on >= (CURRENT_DATE - 365) THEN 0
        ELSE -6
      END
  ))::smallint
  FROM agg;
$$;

REVOKE ALL ON FUNCTION public.compute_tool_trust(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.compute_tool_trust(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.refresh_tool_internal_ranks()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  touched integer := 0;
BEGIN
  -- Ensure every published tool has a row
  INSERT INTO public.tool_internal_ranks (tool_id, popularity, trust, rank_score)
  SELECT t.id, 40, public.compute_tool_trust(t.id), 40
  FROM public.tools t
  WHERE t.status = 'published'::public.tool_status
  ON CONFLICT (tool_id) DO NOTHING;

  -- Curated popularity for well-known / widely used tools (slug → popularity)
  WITH curated(slug, popularity) AS (
    VALUES
      ('chatgpt', 100),
      ('claude', 98),
      ('gemini', 96),
      ('github-copilot', 95),
      ('cursor', 94),
      ('midjourney', 93),
      ('perplexity', 92),
      ('notion-ai', 88),
      ('canva-magic-studio', 87),
      ('adobe-firefly', 86),
      ('runway', 86),
      ('elevenlabs', 85),
      ('huggingface', 90),
      ('zapier', 88),
      ('make', 84),
      ('n8n', 82),
      ('ollama', 88),
      ('langchain', 84),
      ('replicate', 83),
      ('mistral', 86),
      ('grok', 84),
      ('llama', 85),
      ('leonardo-ai', 78),
      ('ideogram', 76),
      ('sora', 80),
      ('v0', 79),
      ('lovable', 78),
      ('bolt-new', 77),
      ('replit', 82),
      ('windsurf', 76),
      ('tabnine', 74),
      ('grammarly', 85),
      ('jasper', 72),
      ('copy-ai', 70),
      ('synthesia', 78),
      ('heygen', 77),
      ('descript', 75),
      ('fireflies', 73),
      ('whisper', 82),
      ('deepseek', 80),
      ('anthropic-claude', 97),
      ('openai-chatgpt', 99),
      ('stability-ai', 80),
      ('dall-e', 84),
      ('microsoft-copilot', 90),
      ('bing-image-creator', 70),
      ('krea', 68),
      ('recraft', 68),
      ('aider', 72),
      ('continue-dev', 70),
      ('cody', 68),
      ('amazon-q-developer', 74)
  )
  UPDATE public.tool_internal_ranks r
  SET
    popularity = c.popularity,
    updated_at = now()
  FROM curated c
  JOIN public.tools t ON t.slug = c.slug
  WHERE r.tool_id = t.id;

  -- Recompute trust + blended rank_score for all published tools
  UPDATE public.tool_internal_ranks r
  SET
    trust = public.compute_tool_trust(r.tool_id),
    rank_score = LEAST(100, GREATEST(0,
      ROUND(r.popularity * 0.65 + public.compute_tool_trust(r.tool_id) * 0.35)
    ))::smallint,
    updated_at = now()
  FROM public.tools t
  WHERE t.id = r.tool_id
    AND t.status = 'published'::public.tool_status;

  GET DIAGNOSTICS touched = ROW_COUNT;
  RETURN touched;
END;
$$;

REVOKE ALL ON FUNCTION public.refresh_tool_internal_ranks() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.refresh_tool_internal_ranks() TO service_role;

-- Initial fill
SELECT public.refresh_tool_internal_ranks();

-- FTS: relevance first, then internal rank (known/reliable boost)
CREATE OR REPLACE FUNCTION public.search_published_tools(
  q text,
  want_free boolean default false,
  want_oss boolean default false,
  want_api boolean default false,
  want_local boolean default false,
  result_limit integer default 20
)
returns table (
  id uuid,
  slug text,
  name text,
  summary text,
  rank real
)
language sql
stable
security definer
set search_path = public
as $$
  with cleaned as (
    select trim(coalesce(q, '')) as q
  ),
  tsq as (
    select case
      when cleaned.q = '' then null
      else websearch_to_tsquery('english', cleaned.q)
    end as query
    from cleaned
  )
  select t.id, t.slug, t.name, t.summary,
    (
      case
        when tsq.query is null then 0::real
        else ts_rank_cd(t.search_tsv, tsq.query)
      end * 0.55
      + coalesce(r.rank_score, 40)::real / 100.0 * 0.45
    )::real as rank
  from public.tools t
  cross join tsq
  left join public.tool_internal_ranks r on r.tool_id = t.id
  where t.status = 'published'
    and (
      tsq.query is null
      or t.search_tsv @@ tsq.query
      or t.name ilike '%' || (select q from cleaned) || '%'
    )
    and (not want_free or t.pricing_model in ('Free', 'Freemium', 'Open source'))
    and (not want_oss or t.open_source = true)
    and (not want_api or t.api_available = true)
    and (not want_local or t.local_available = true)
  order by rank desc, coalesce(r.rank_score, 40) desc, t.name asc
  limit greatest(1, least(result_limit, 50));
$$;

REVOKE ALL ON FUNCTION public.search_published_tools(text, boolean, boolean, boolean, boolean, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_published_tools(text, boolean, boolean, boolean, boolean, integer) TO anon, authenticated, service_role;

-- Semantic: similarity + internal rank blend
CREATE OR REPLACE FUNCTION public.search_published_tools_semantic(
  query_embedding vector(1536),
  want_free boolean DEFAULT false,
  want_oss boolean DEFAULT false,
  want_api boolean DEFAULT false,
  want_local boolean DEFAULT false,
  result_limit integer DEFAULT 8
)
RETURNS TABLE (
  id uuid,
  slug text,
  name text,
  summary text,
  distance real
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    t.id,
    t.slug,
    t.name,
    t.summary,
    -- Lower is better; invert rank boost into distance space
    (
      (e.embedding <=> query_embedding)::real * 0.55
      + (1.0 - coalesce(r.rank_score, 40)::real / 100.0) * 0.45
    )::real AS distance
  FROM public.tool_embeddings e
  JOIN public.tools t ON t.id = e.tool_id
  LEFT JOIN public.tool_internal_ranks r ON r.tool_id = t.id
  WHERE t.status = 'published'::public.tool_status
    AND (
      NOT want_free
      OR t.pricing_model = ANY (ARRAY['Free','Freemium','Open source'])
    )
    AND (NOT want_oss OR t.open_source = true)
    AND (NOT want_api OR t.api_available = true)
    AND (NOT want_local OR t.local_available = true)
  ORDER BY distance ASC, coalesce(r.rank_score, 40) DESC
  LIMIT GREATEST(1, LEAST(COALESCE(result_limit, 8), 50));
$$;

REVOKE ALL ON FUNCTION public.search_published_tools_semantic(vector, boolean, boolean, boolean, boolean, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_published_tools_semantic(vector, boolean, boolean, boolean, boolean, integer) TO anon, authenticated, service_role;
