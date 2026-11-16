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
  /** Company / tool display name when known */
  company_name: string | null;
  /** Catalog or favicon logo for the company concerned */
  company_logo_url: string | null;
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

export function hostnameFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/** Google favicon fallback when catalog has no logo_url. */
export function faviconForDomain(domain: string | null | undefined): string | null {
  if (!domain) return null;
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
}

function companyLabelFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

type ToolLogoRow = {
  slug: string;
  name: string;
  logo_url: string | null;
  official_url: string | null;
};

async function loadToolLogos(slugs: string[]): Promise<Map<string, ToolLogoRow>> {
  const unique = [...new Set(slugs.filter(Boolean))];
  const map = new Map<string, ToolLogoRow>();
  if (!unique.length) return map;

  const { data, error } = await supabase
    .from("tools")
    .select("slug, name, logo_url, official_url")
    .in("slug", unique);

  if (error) {
    console.warn("[latest] tool logos:", error.message);
    return map;
  }

  for (const row of data ?? []) {
    if (!row.slug) continue;
    map.set(row.slug, row);
  }
  return map;
}

function resolveCompany(
  solutionSlug: string | null,
  sourceUrl: string | null,
  tools: Map<string, ToolLogoRow>,
): { company_name: string | null; company_logo_url: string | null } {
  if (solutionSlug) {
    const tool = tools.get(solutionSlug);
    if (tool) {
      const logo =
        tool.logo_url?.trim() ||
        faviconForDomain(hostnameFromUrl(tool.official_url)) ||
        faviconForDomain(hostnameFromUrl(sourceUrl));
      return {
        company_name: tool.name || companyLabelFromSlug(solutionSlug),
        company_logo_url: logo,
      };
    }
    return {
      company_name: companyLabelFromSlug(solutionSlug),
      company_logo_url: faviconForDomain(hostnameFromUrl(sourceUrl)),
    };
  }

  const host = hostnameFromUrl(sourceUrl);
  return {
    company_name: host,
    company_logo_url: faviconForDomain(host),
  };
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

  const rows = data ?? [];
  const tools = await loadToolLogos(
    rows.map((r) => r.solution_slug).filter((s): s is string => Boolean(s)),
  );

  return rows.map((row) => {
    const company = resolveCompany(row.solution_slug, row.source_url, tools);
    return {
      id: `editorial:${row.id}`,
      slug: row.slug,
      published_at: asDate(row.published_at),
      kind: row.kind as LatestAdvanceKind,
      title: row.title,
      summary: row.summary,
      solution_slug: row.solution_slug,
      source_url: row.source_url,
      company_name: company.company_name,
      company_logo_url: company.company_logo_url,
      origin: "editorial" as const,
    };
  });
}

/** Resolve company logo for a single Latest article (detail page). */
export async function resolveCompanyForAdvance(opts: {
  solution_slug: string | null;
  source_url: string | null;
}): Promise<{ company_name: string | null; company_logo_url: string | null }> {
  const tools = opts.solution_slug
    ? await loadToolLogos([opts.solution_slug])
    : new Map<string, ToolLogoRow>();
  return resolveCompany(opts.solution_slug, opts.source_url, tools);
}

export function latestAdvancesQuery(filters: LatestFilters = {}) {
  return queryOptions({
    queryKey: ["latest-advances", filters],
    queryFn: () => listLatestAdvances(filters),
    staleTime: 60_000,
  });
}
