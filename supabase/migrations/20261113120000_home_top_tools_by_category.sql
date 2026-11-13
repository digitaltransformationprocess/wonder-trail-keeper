-- Public ordered top tools per category for homepage (no scores exposed).
CREATE OR REPLACE FUNCTION public.home_top_tools_by_category(
  p_category_slugs text[] DEFAULT NULL,
  p_limit integer DEFAULT 10
)
RETURNS TABLE (
  category_slug text,
  tool_slug text,
  list_position integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH cats AS (
    SELECT c.id, c.slug
    FROM public.categories c
    WHERE c.is_active = true
      AND (
        p_category_slugs IS NULL
        OR cardinality(p_category_slugs) = 0
        OR c.slug = ANY (p_category_slugs)
      )
  ),
  ranked AS (
    SELECT
      cats.slug AS category_slug,
      t.slug AS tool_slug,
      row_number() OVER (
        PARTITION BY cats.slug
        ORDER BY coalesce(r.rank_score, 40) DESC, t.name ASC
      )::integer AS list_position
    FROM cats
    JOIN public.tool_categories tc ON tc.category_id = cats.id
    JOIN public.tools t ON t.id = tc.tool_id
    LEFT JOIN public.tool_internal_ranks r ON r.tool_id = t.id
    WHERE t.status = 'published'::public.tool_status
  )
  SELECT ranked.category_slug, ranked.tool_slug, ranked.list_position
  FROM ranked
  WHERE ranked.list_position <= GREATEST(1, LEAST(coalesce(p_limit, 10), 50));
$$;

REVOKE ALL ON FUNCTION public.home_top_tools_by_category(text[], integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.home_top_tools_by_category(text[], integer) TO anon, authenticated, service_role;
