CREATE TABLE public.news_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  published_at date NOT NULL DEFAULT current_date,
  kind text NOT NULL DEFAULT 'Annonce',
  title text NOT NULL,
  summary text NOT NULL,
  solution_slug text,
  source_url text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.news_items TO anon, authenticated;
GRANT ALL ON public.news_items TO service_role;
ALTER TABLE public.news_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "News are public" ON public.news_items FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.watch_state (
  id text PRIMARY KEY,
  locked_until timestamptz,
  paused_reason text,
  last_run_at timestamptz,
  last_result text
);
GRANT ALL ON public.watch_state TO service_role;
ALTER TABLE public.watch_state ENABLE ROW LEVEL SECURITY;
INSERT INTO public.watch_state (id) VALUES ('veille');