-- Forbid INSERT directly as published; relations must exist before publish UPDATE.

CREATE OR REPLACE FUNCTION public.enforce_tool_publish_requirements()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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

    IF TG_OP = 'INSERT' THEN
      RAISE EXCEPTION 'Cannot insert a tool directly as published; insert as pending_review then publish after linking category and source';
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
