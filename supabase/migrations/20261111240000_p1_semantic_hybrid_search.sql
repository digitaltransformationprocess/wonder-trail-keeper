-- P1: pgvector semantic search + hybrid recall for Discover

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS public.tool_embeddings (
  tool_id uuid PRIMARY KEY REFERENCES public.tools(id) ON DELETE CASCADE,
  model text NOT NULL,
  dimensions integer NOT NULL CHECK (dimensions > 0),
  embedding vector(1536) NOT NULL,
  content_hash text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tool_embeddings_hnsw_idx
  ON public.tool_embeddings
  USING hnsw (embedding vector_cosine_ops);

ALTER TABLE public.tool_embeddings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tool_embeddings_public_select ON public.tool_embeddings;
CREATE POLICY tool_embeddings_public_select ON public.tool_embeddings
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tools t
      WHERE t.id = tool_id AND t.status = 'published'::public.tool_status
    )
  );

DROP POLICY IF EXISTS tool_embeddings_staff_all ON public.tool_embeddings;
CREATE POLICY tool_embeddings_staff_all ON public.tool_embeddings
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

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
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    t.id,
    t.slug,
    t.name,
    t.summary,
    (e.embedding <=> query_embedding)::real AS distance
  FROM public.tool_embeddings e
  JOIN public.tools t ON t.id = e.tool_id
  WHERE t.status = 'published'::public.tool_status
    AND (
      NOT want_free
      OR t.pricing_model = ANY (ARRAY['Free','Freemium','Open source'])
    )
    AND (NOT want_oss OR t.open_source = true)
    AND (NOT want_api OR t.api_available = true)
    AND (NOT want_local OR t.local_available = true)
  ORDER BY e.embedding <=> query_embedding
  LIMIT GREATEST(1, LEAST(COALESCE(result_limit, 8), 50));
$$;

REVOKE ALL ON FUNCTION public.search_published_tools_semantic(vector, boolean, boolean, boolean, boolean, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_published_tools_semantic(vector, boolean, boolean, boolean, boolean, integer) TO anon, authenticated, service_role;
