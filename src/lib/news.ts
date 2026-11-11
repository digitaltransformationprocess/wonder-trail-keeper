import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface NewsRow {
  id: string;
  slug: string | null;
  published_at: string;
  kind: string;
  title: string;
  summary: string;
  body: string | null;
  solution_slug: string | null;
  source_url: string;
}

export interface NewsFilters {
  kind?: string;
  since?: string;
}

export async function listNews(filters: NewsFilters = {}): Promise<NewsRow[]> {
  let query = supabase
    .from("news_items")
    .select(
      "id, slug, published_at, kind, title, summary, body, solution_slug, source_url",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(50);

  const kind = filters.kind?.trim();
  if (kind) {
    query = query.eq("kind", kind);
  }

  const since = filters.since?.trim();
  if (since) {
    query = query.gte("published_at", since);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`News unavailable: ${error.message}`);
  }

  return data ?? [];
}

export async function getPublishedNewsBySlug(slug: string): Promise<NewsRow | null> {
  const trimmed = slug.trim();
  if (!trimmed) return null;

  const { data, error } = await supabase
    .from("news_items")
    .select(
      "id, slug, published_at, kind, title, summary, body, solution_slug, source_url",
    )
    .eq("status", "published")
    .eq("slug", trimmed)
    .maybeSingle();

  if (error) {
    throw new Error(`News unavailable: ${error.message}`);
  }

  return data;
}

export function newsQuery(filters: NewsFilters = {}) {
  return queryOptions({
    queryKey: ["news", filters],
    queryFn: () => listNews(filters),
    staleTime: 60_000,
  });
}

export function newsBySlugQuery(slug: string) {
  return queryOptions({
    queryKey: ["news", "slug", slug],
    queryFn: async () => {
      const item = await getPublishedNewsBySlug(slug);
      if (!item) throw new Error("NOT_FOUND");
      return item;
    },
    staleTime: 60_000,
  });
}
