import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SolutionType =
  | "Tool"
  | "Model"
  | "Agent"
  | "API"
  | "Platform"
  | "Extension"
  | "Framework"
  | "Open source";

export type PricingModel = "Free" | "Freemium" | "Paid" | "Open source" | "Not disclosed";

export interface Solution {
  slug: string;
  name: string;
  publisher: string;
  url: string;
  type: SolutionType;
  categories: string[];
  summary: string;
  description: string;
  keywords: string[];
  pricingModel: PricingModel;
  price: string;
  platforms: string[];
  api: boolean;
  openSource: boolean;
  local: boolean;
  strengths: string[];
  limits: string[];
  audience: string[];
  alternatives: string[];
  sources: string[];
  verifiedAt: string;
  status: "Verified" | "To verify";
}

export interface TaxonomyItem {
  name: string;
  slug: string;
}

const TOOL_SELECT = `
  id,
  name,
  slug,
  summary,
  description,
  official_url,
  pricing_model,
  price_display,
  api_available,
  open_source,
  local_available,
  keywords,
  strengths,
  limits,
  audience,
  last_verified_at,
  status,
  publishers ( name ),
  tool_types (
    is_primary,
    solution_types ( name )
  ),
  tool_categories (
    is_primary,
    categories ( name )
  ),
  tool_platforms (
    platforms ( label )
  ),
  tool_sources (
    sources ( url )
  ),
  tool_relations!tool_relations_source_tool_id_fkey (
    relation_type,
    tools!tool_relations_target_tool_id_fkey ( slug, status )
  )
`.trim();

type ToolRow = {
  id: string;
  name: string;
  slug: string;
  summary: string;
  description: string;
  official_url: string;
  pricing_model: string | null;
  price_display: string | null;
  api_available: boolean | null;
  open_source: boolean;
  local_available: boolean;
  keywords: string[];
  strengths: string[];
  limits: string[];
  audience: string[];
  last_verified_at: string | null;
  status: string;
  publishers: { name: string } | null;
  tool_types: Array<{
    is_primary: boolean;
    solution_types: { name: string } | null;
  }> | null;
  tool_categories: Array<{
    is_primary: boolean;
    categories: { name: string } | null;
  }> | null;
  tool_platforms: Array<{
    platforms: { label: string } | null;
  }> | null;
  tool_sources: Array<{
    sources: { url: string } | null;
  }> | null;
  tool_relations: Array<{
    relation_type: string;
    tools: { slug: string; status: string } | null;
  }> | null;
};

function asPricingModel(value: string | null): PricingModel {
  switch (value) {
    case "Free":
    case "Freemium":
    case "Paid":
    case "Open source":
    case "Not disclosed":
      return value;
    default:
      return "Not disclosed";
  }
}

function asSolutionType(value: string | null | undefined): SolutionType {
  switch (value) {
    case "Tool":
    case "Model":
    case "Agent":
    case "API":
    case "Platform":
    case "Extension":
    case "Framework":
    case "Open source":
      return value;
    default:
      return "Tool";
  }
}

function mapTool(row: ToolRow): Solution {
  const primaryType =
    row.tool_types?.find((t) => t.is_primary)?.solution_types?.name ??
    row.tool_types?.[0]?.solution_types?.name ??
    null;

  const categories = (row.tool_categories ?? [])
    .slice()
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary))
    .map((c) => c.categories?.name)
    .filter((name): name is string => Boolean(name));

  const platforms = (row.tool_platforms ?? [])
    .map((p) => p.platforms?.label)
    .filter((label): label is string => Boolean(label));

  const sources = (row.tool_sources ?? [])
    .map((s) => s.sources?.url)
    .filter((url): url is string => Boolean(url));

  const alternatives = (row.tool_relations ?? [])
    .filter((r) => r.relation_type === "alternative")
    .map((r) => r.tools)
    .filter((t): t is { slug: string; status: string } => Boolean(t))
    .filter((t) => t.status === "published")
    .map((t) => t.slug);

  const verifiedAt = row.last_verified_at ?? "Not verified";

  return {
    slug: row.slug,
    name: row.name,
    publisher: row.publishers?.name ?? "Unknown publisher",
    url: row.official_url,
    type: asSolutionType(primaryType),
    categories,
    summary: row.summary,
    description: row.description,
    keywords: row.keywords ?? [],
    pricingModel: asPricingModel(row.pricing_model),
    price: row.price_display?.trim() || "To verify",
    platforms,
    api: Boolean(row.api_available),
    openSource: row.open_source,
    local: row.local_available,
    strengths: row.strengths ?? [],
    limits: row.limits ?? [],
    audience: row.audience ?? [],
    alternatives,
    sources,
    verifiedAt,
    status: row.last_verified_at ? "Verified" : "To verify",
  };
}

async function fetchTools(filter?: { slug?: string; slugs?: string[] }): Promise<Solution[]> {
  let query = supabase.from("tools").select(TOOL_SELECT).eq("status", "published");

  if (filter?.slug) {
    query = query.eq("slug", filter.slug).limit(1);
  } else if (filter?.slugs?.length) {
    query = query.in("slug", filter.slugs);
  } else {
    query = query.order("name", { ascending: true });
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Catalog unavailable: ${error.message}`);
  }

  return ((data ?? []) as unknown as ToolRow[]).map(mapTool);
}

export async function listSolutions(): Promise<Solution[]> {
  return fetchTools();
}

export async function getSolutionBySlug(slug: string): Promise<Solution | null> {
  const rows = await fetchTools({ slug });
  return rows[0] ?? null;
}

export async function getSolutionsBySlugs(slugs: string[]): Promise<Solution[]> {
  const unique = [...new Set(slugs.filter(Boolean))];
  if (unique.length === 0) return [];
  const rows = await fetchTools({ slugs: unique });
  const bySlug = new Map(rows.map((s) => [s.slug, s]));
  return unique.map((slug) => bySlug.get(slug)).filter((s): s is Solution => Boolean(s));
}

export async function listCategories(): Promise<TaxonomyItem[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("name, slug")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(`Categories unavailable: ${error.message}`);
  return data ?? [];
}

export async function listSolutionTypes(): Promise<TaxonomyItem[]> {
  const { data, error } = await supabase
    .from("solution_types")
    .select("name, slug")
    .order("name", { ascending: true });

  if (error) throw new Error(`Solution types unavailable: ${error.message}`);
  return data ?? [];
}

export const solutionsQuery = queryOptions({
  queryKey: ["solutions"],
  queryFn: listSolutions,
  staleTime: 60_000,
});

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: listCategories,
  staleTime: 300_000,
});

export const solutionTypesQuery = queryOptions({
  queryKey: ["solution-types"],
  queryFn: listSolutionTypes,
  staleTime: 300_000,
});

export function solutionQuery(slug: string) {
  return queryOptions({
    queryKey: ["solutions", slug],
    queryFn: async () => {
      const solution = await getSolutionBySlug(slug);
      if (!solution) throw new Error("NOT_FOUND");
      const alternatives = await getSolutionsBySlugs(solution.alternatives);
      return { solution, alternatives };
    },
    staleTime: 60_000,
  });
}

export function solutionsBySlugsQuery(slugs: string[]) {
  const key = [...slugs].sort();
  return queryOptions({
    queryKey: ["solutions", "by-slugs", key],
    queryFn: () => getSolutionsBySlugs(slugs),
    staleTime: 60_000,
    enabled: slugs.length > 0,
  });
}

export function filterSolutions(
  solutions: Solution[],
  filters: {
    q?: string | undefined;
    cat?: string | undefined;
    type?: string | undefined;
    price?: string | undefined;
    api?: boolean | undefined;
    oss?: boolean | undefined;
    local?: boolean | undefined;
    sort?: "name" | "recent" | undefined;
  },
): Solution[] {
  const q = filters.q?.trim().toLowerCase();
  let list = solutions.filter((x) => {
    if (
      q &&
      !`${x.name} ${x.publisher} ${x.summary} ${x.keywords.join(" ")}`.toLowerCase().includes(q)
    ) {
      return false;
    }
    if (filters.cat && !x.categories.includes(filters.cat)) return false;
    if (filters.type && x.type !== filters.type) return false;
    if (filters.price && x.pricingModel !== filters.price) return false;
    if (filters.api && !x.api) return false;
    if (filters.oss && !x.openSource) return false;
    if (filters.local && !x.local) return false;
    return true;
  });

  list = [...list].sort((a, b) =>
    filters.sort === "recent"
      ? b.verifiedAt.localeCompare(a.verifiedAt)
      : a.name.localeCompare(b.name),
  );

  return list;
}
