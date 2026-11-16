import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  isLatestAdvanceKind,
  LATEST_ADVANCE_KINDS,
  resolveCompanyForAdvance,
} from "@/lib/latest";

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
  company_name: string | null;
  company_logo_url: string | null;
}

export interface NewsFilters {
  kind?: string;
  since?: string;
}

export async function listNews(filters: NewsFilters = {}): Promise<NewsRow[]> {
  // Product advances only — industry news belongs on /news (Truncated).
  let query = supabase
    .from("news_items")
    .select(
      "id, slug, published_at, kind, title, summary, solution_slug, source_url",
    )
    .eq("status", "published")
    .in("kind", [...LATEST_ADVANCE_KINDS])
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(50);

  const kind = filters.kind?.trim();
  if (kind) {
    if (!isLatestAdvanceKind(kind)) return [];
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

  return (data ?? []).map((row) => ({
    ...row,
    body: null,
    company_name: null,
    company_logo_url: null,
  }));
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

  // Detail pages under /latest only serve product advances.
  if (!data || !isLatestAdvanceKind(data.kind)) return null;

  const company = await resolveCompanyForAdvance({
    solution_slug: data.solution_slug,
    source_url: data.source_url,
  });

  return {
    ...data,
    company_name: company.company_name,
    company_logo_url: company.company_logo_url,
  };
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
