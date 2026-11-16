import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Product advances shown on /latest — never industry news. */
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
  version: "Version",
  feature: "Feature",
  pricing: "Pricing",
  access: "Access",
};

export function isLatestAdvanceKind(kind: string): kind is LatestAdvanceKind {
  return (LATEST_ADVANCE_KINDS as readonly string[]).includes(kind);
}

export interface LatestAdvance {
  id: string;
  /** Editorial article slug when present */
  slug: string | null;
  published_at: string;
  kind: LatestAdvanceKind;
  title: string;
  summary: string;
  solution_slug: string | null;
  source_url: string | null;
  /** Where this advance came from */
  origin: "editorial" | "catalog" | "change";
}

export interface LatestFilters {
  kind?: string;
  since?: string;
}

function asDate(value: string | null | undefined): string {
  if (!value) return new Date().toISOString().slice(0, 10);
  return value.slice(0, 10);
}

function mapChangeKind(fieldKey: string): LatestAdvanceKind {
  const key = fieldKey.toLowerCase();
  if (key.includes("pric") || key.includes("plan") || key.includes("billing")) return "pricing";
  if (key.includes("version") || key.includes("model")) return "version";
  if (key.includes("access") || key.includes("region") || key.includes("status")) return "access";
  if (key.includes("feature") || key.includes("capabilit")) return "feature";
  return "feature";
}

function fieldLabel(fieldKey: string): string {
  return fieldKey
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

async function listEditorialAdvances(filters: LatestFilters): Promise<LatestAdvance[]> {
  let query = supabase
    .from("news_items")
    .select("id, slug, published_at, kind, title, summary, solution_slug, source_url")
    .eq("status", "published")
    .in("kind", [...LATEST_ADVANCE_KINDS])
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(80);

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

async function listCatalogNewTools(filters: LatestFilters): Promise<LatestAdvance[]> {
  // Only inject catalog “new tool” rows when the kind filter allows it.
  if (filters.kind && filters.kind !== "new_tool") return [];

  const since =
    filters.since?.trim() ||
    new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString();

  // Prefer primary category; skip Skills flood (agent skill packs ≠ product launches).
  const { data, error } = await supabase
    .from("tools")
    .select(
      "id, slug, name, summary, created_at, official_url, tool_categories!inner ( is_primary, categories!inner ( slug ) )",
    )
    .eq("status", "published")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(80);

  if (error) throw new Error(`Latest catalog unavailable: ${error.message}`);

  return (data ?? [])
    .filter((tool) => {
      const cats = (tool.tool_categories ?? []) as Array<{
        is_primary: boolean | null;
        categories: { slug: string } | null;
      }>;
      const primary = cats.find((c) => c.is_primary)?.categories?.slug;
      const anySkill = cats.some((c) => c.categories?.slug === "skills");
      if (primary === "skills" || (anySkill && !primary)) return false;
      return true;
    })
    .slice(0, 30)
    .map((tool) => ({
      id: `catalog:${tool.id}`,
      slug: null,
      published_at: asDate(tool.created_at),
      kind: "new_tool" as const,
      title: `${tool.name} added to the catalog`,
      summary: tool.summary || `${tool.name} is now listed on AI Discov.`,
      solution_slug: tool.slug,
      source_url: tool.official_url,
      origin: "catalog" as const,
    }));
}

async function listApprovedChanges(filters: LatestFilters): Promise<LatestAdvance[]> {
  let query = supabase
    .from("change_events")
    .select(
      "id, field_key, old_value, new_value, detected_at, review_status, tools!inner ( slug, name, status )",
    )
    .eq("review_status", "approved")
    .order("detected_at", { ascending: false })
    .limit(40);

  const since = filters.since?.trim();
  if (since) {
    query = query.gte("detected_at", since);
  }

  const { data, error } = await query;
  if (error) {
    // Older schemas may lack review_status — don't break Latest.
    console.warn("[latest] change_events:", error.message);
    return [];
  }

  const kindFilter = filters.kind?.trim();

  return (data ?? [])
    .map((row) => {
      const tool = row.tools as { slug: string; name: string; status: string } | null;
      if (!tool || tool.status !== "published") return null;
      const kind = mapChangeKind(row.field_key);
      if (kindFilter && kindFilter !== kind) return null;

      const label = fieldLabel(row.field_key);
      const next = (row.new_value || "").trim();
      const summary = next
        ? `${label} is now “${next.slice(0, 160)}”.`
        : `${label} changed for ${tool.name}.`;

      return {
        id: `change:${row.id}`,
        slug: null,
        published_at: asDate(row.detected_at),
        kind,
        title: `${tool.name}: ${label} update`,
        summary,
        solution_slug: tool.slug,
        source_url: null,
        origin: "change" as const,
      } satisfies LatestAdvance;
    })
    .filter((row): row is LatestAdvance => Boolean(row));
}

function dedupeAdvances(items: LatestAdvance[]): LatestAdvance[] {
  const seen = new Set<string>();
  const out: LatestAdvance[] = [];

  for (const item of items) {
    // Prefer editorial posts over synthetic catalog rows for the same tool+day+kind.
    const key = [
      item.kind,
      item.solution_slug || item.slug || item.title.toLowerCase(),
      item.published_at,
    ].join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

export async function listLatestAdvances(filters: LatestFilters = {}): Promise<LatestAdvance[]> {
  const [editorial, catalog, changes] = await Promise.all([
    listEditorialAdvances(filters),
    listCatalogNewTools(filters),
    listApprovedChanges(filters),
  ]);

  // Editorial first within the same day so real release notes win over catalog injects.
  const merged = dedupeAdvances([...editorial, ...changes, ...catalog]);
  merged.sort((a, b) => {
    const byDate = b.published_at.localeCompare(a.published_at);
    if (byDate !== 0) return byDate;
    const rank = (o: LatestAdvance["origin"]) =>
      o === "editorial" ? 0 : o === "change" ? 1 : 2;
    return rank(a.origin) - rank(b.origin);
  });

  return merged.slice(0, 60);
}

export function latestAdvancesQuery(filters: LatestFilters = {}) {
  return queryOptions({
    queryKey: ["latest-advances", filters],
    queryFn: () => listLatestAdvances(filters),
    staleTime: 60_000,
  });
}
