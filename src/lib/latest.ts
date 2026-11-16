import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Latest = real AI product advances in the world
 * (new models, features, versions, pricing, access) — not industry news,
 * and not “added to our catalog”.
 */
export const LATEST_ADVANCE_KINDS = [
  "new_tool",
  "release",
  "version",
  "feature",
  "pricing",
  "access",
] as const;

export type LatestAdvanceKind = (typeof LATEST_ADVANCE_KINDS)[number];

export const LATEST_KIND_LABELS: Record<LatestAdvanceKind, string> = {
  new_tool: "New tool",
  release: "Release",
  version: "New model",
  feature: "Feature",
  pricing: "Pricing",
  access: "Access",
};

export function isLatestAdvanceKind(kind: string): kind is LatestAdvanceKind {
  return (LATEST_ADVANCE_KINDS as readonly string[]).includes(kind);
}

export interface LatestAdvance {
  id: string;
  slug: string | null;
  published_at: string;
  kind: LatestAdvanceKind;
  title: string;
  summary: string;
  solution_slug: string | null;
  source_url: string | null;
  origin: "editorial";
}

export interface LatestFilters {
  kind?: string;
  since?: string;
}

function asDate(value: string | null | undefined): string {
  if (!value) return new Date().toISOString().slice(0, 10);
  return value.slice(0, 10);
}

export async function listLatestAdvances(filters: LatestFilters = {}): Promise<LatestAdvance[]> {
  let query = supabase
    .from("news_items")
    .select("id, slug, published_at, kind, title, summary, solution_slug, source_url")
    .eq("status", "published")
    .in("kind", [...LATEST_ADVANCE_KINDS])
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(60);

  const kind = filters.kind?.trim();
  if (kind && isLatestAdvanceKind(kind)) {
    query = query.eq("kind", kind);
  }

  const since = filters.since?.trim();
  if (since) {
    query = query.gte("published_at", since);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Latest unavailable: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: `editorial:${row.id}`,
    slug: row.slug,
    published_at: asDate(row.published_at),
    kind: row.kind as LatestAdvanceKind,
    title: row.title,
    summary: row.summary,
    solution_slug: row.solution_slug,
    source_url: row.source_url,
    origin: "editorial" as const,
  }));
}

export function latestAdvancesQuery(filters: LatestFilters = {}) {
  return queryOptions({
    queryKey: ["latest-advances", filters],
    queryFn: () => listLatestAdvances(filters),
    staleTime: 60_000,
  });
}
