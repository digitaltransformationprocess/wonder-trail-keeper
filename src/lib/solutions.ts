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

export type ReliabilityLevel = "A" | "B" | "C" | "D";

export interface SolutionSource {
  url: string;
  reliabilityLevel: ReliabilityLevel;
  claimKey: string;
  verifiedAt: string | null;
  sourceType: string;
}

export interface PricingPlan {
  planName: string;
  priceAmount: number | null;
  currency: string | null;
  billingPeriod: string | null;
  pricingModel: string | null;
  limitsJson: unknown;
  verifiedAt: string | null;
}

export interface SolutionFeature {
  key: string;
  label: string;
  availability: string;
  notes: string | null;
  verifiedAt: string | null;
}

export interface LinkedNewsItem {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  kind: string;
}

export interface ChangeHistoryItem {
  fieldKey: string;
  oldValue: string | null;
  newValue: string | null;
  detectedAt: string;
}

export interface Solution {
  id: string;
  slug: string;
  name: string;
  publisher: string;
  url: string;
  logoUrl: string | null;
  type: SolutionType;
  categories: string[];
  categorySlugs: string[];
  summary: string;
  description: string;
  keywords: string[];
  pricingModel: PricingModel;
  price: string;
  pricingPlans: PricingPlan[];
  platforms: string[];
  /** True only when API is known available (filters / scoring). */
  api: boolean;
  /** Raw catalog value for display (null = Not disclosed). */
  apiAvailable: boolean | null;
  apiDocsUrl: string | null;
  repositoryUrl: string | null;
  license: string | null;
  openSource: boolean;
  local: boolean;
  strengths: string[];
  limits: string[];
  audience: string[];
  features: SolutionFeature[];
  alternatives: string[];
  sources: SolutionSource[];
  verifiedAt: string;
  status: "Verified" | "To verify";
}

const TOOL_SELECT = `
  id,
  name,
  slug,
  summary,
  description,
  official_url,
  logo_url,
  pricing_model,
  price_display,
  api_available,
  api_docs_url,
  repository_url,
  license,
  open_source,
  local_available,
  keywords,
  strengths,
  limits,
  audience,
  last_verified_at,
  status,
  merged_into_tool_id,
  publishers ( name ),
  tool_types (
    is_primary,
    solution_types ( name )
  ),
  tool_categories (
    is_primary,
    categories ( name, slug )
  ),
  tool_platforms (
    platforms ( label )
  ),
  tool_sources (
    claim_key,
    verified_at,
    sources ( url, reliability_level, source_type )
  ),
  pricing_plans (
    plan_name,
    price_amount,
    currency,
    billing_period,
    pricing_model,
    limits_json,
    verified_at
  ),
  tool_features (
    availability,
    notes,
    verified_at,
    features ( key, label, sort_order )
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
  logo_url: string | null;
  pricing_model: string | null;
  price_display: string | null;
  api_available: boolean | null;
  api_docs_url: string | null;
  repository_url: string | null;
  license: string | null;
  open_source: boolean;
  local_available: boolean;
  keywords: string[];
  strengths: string[];
  limits: string[];
  audience: string[];
  last_verified_at: string | null;
  status: string;
  merged_into_tool_id: string | null;
  publishers: { name: string } | null;
  tool_types: Array<{
    is_primary: boolean;
    solution_types: { name: string } | null;
  }> | null;
  tool_categories: Array<{
    is_primary: boolean;
    categories: { name: string; slug: string } | null;
  }> | null;
  tool_platforms: Array<{
    platforms: { label: string } | null;
  }> | null;
  tool_sources: Array<{
    claim_key: string;
    verified_at: string | null;
    sources: { url: string; reliability_level: string; source_type: string } | null;
  }> | null;
  pricing_plans: Array<{
    plan_name: string;
    price_amount: number | null;
    currency: string | null;
    billing_period: string | null;
    pricing_model: string | null;
    limits_json: unknown;
    verified_at: string | null;
  }> | null;
  tool_features: Array<{
    availability: string;
    notes: string | null;
    verified_at: string | null;
    features: { key: string; label: string; sort_order: number } | null;
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

function asReliability(value: string | null | undefined): ReliabilityLevel {
  switch (value) {
    case "A":
    case "B":
    case "C":
    case "D":
      return value;
    default:
      return "D";
  }
}

export function displayUnknown(value: string | null | undefined, emptyLabel = "To verify"): string {
  const trimmed = value?.trim();
  if (!trimmed || trimmed.toLowerCase() === "to verify" || trimmed.toLowerCase() === "unknown") {
    return emptyLabel;
  }
  return trimmed;
}

export function displayApi(apiAvailable: boolean | null): string {
  if (apiAvailable === true) return "Yes";
  if (apiAvailable === false) return "No";
  return "Not disclosed";
}

function mapTool(row: ToolRow): Solution {
  const primaryType =
    row.tool_types?.find((t) => t.is_primary)?.solution_types?.name ??
    row.tool_types?.[0]?.solution_types?.name ??
    null;

  const categoryRows = (row.tool_categories ?? [])
    .slice()
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary));

  const categories = categoryRows
    .map((c) => c.categories?.name)
    .filter((name): name is string => Boolean(name));

  const categorySlugs = categoryRows
    .map((c) => c.categories?.slug)
    .filter((slug): slug is string => Boolean(slug));

  const platforms = (row.tool_platforms ?? [])
    .map((p) => p.platforms?.label)
    .filter((label): label is string => Boolean(label));

  const sources: SolutionSource[] = (row.tool_sources ?? [])
    .map((s) => {
      if (!s.sources?.url) return null;
      return {
        url: s.sources.url,
        reliabilityLevel: asReliability(s.sources.reliability_level),
        claimKey: s.claim_key || "general",
        verifiedAt: s.verified_at,
        sourceType: s.sources.source_type || "official",
      };
    })
    .filter((s): s is SolutionSource => Boolean(s));

  const pricingPlans: PricingPlan[] = (row.pricing_plans ?? []).map((p) => ({
    planName: p.plan_name,
    priceAmount: p.price_amount,
    currency: p.currency,
    billingPeriod: p.billing_period,
    pricingModel: p.pricing_model,
    limitsJson: p.limits_json,
    verifiedAt: p.verified_at,
  }));

  const features: SolutionFeature[] = (row.tool_features ?? [])
    .map((f) => {
      if (!f.features) return null;
      return {
        key: f.features.key,
        label: f.features.label,
        availability: f.availability,
        notes: f.notes,
        verifiedAt: f.verified_at,
      };
    })
    .filter((f): f is SolutionFeature => Boolean(f))
    .sort((a, b) => a.label.localeCompare(b.label));

  const alternatives = (row.tool_relations ?? [])
    .filter((r) => r.relation_type === "alternative")
    .map((r) => r.tools)
    .filter((t): t is { slug: string; status: string } => Boolean(t))
    .filter((t) => t.status === "published")
    .map((t) => t.slug);

  const verifiedAt = row.last_verified_at ?? "Not verified";

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    publisher: row.publishers?.name ?? "Unknown publisher",
    url: row.official_url,
    logoUrl: row.logo_url,
    type: asSolutionType(primaryType),
    categories,
    categorySlugs,
    summary: row.summary,
    description: row.description,
    keywords: row.keywords ?? [],
    pricingModel: asPricingModel(row.pricing_model),
    price: displayUnknown(row.price_display),
    pricingPlans,
    platforms,
    api: row.api_available === true,
    apiAvailable: row.api_available,
    apiDocsUrl: row.api_docs_url,
    repositoryUrl: row.repository_url,
    license: row.license,
    openSource: row.open_source,
    local: row.local_available,
    strengths: row.strengths ?? [],
    limits: row.limits ?? [],
    audience: row.audience ?? [],
    features,
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

export async function resolveToolSlug(slug: string): Promise<{
  solution: Solution | null;
  redirectSlug: string | null;
}> {
  const published = await getSolutionBySlug(slug);
  if (published) return { solution: published, redirectSlug: null };

  const { data, error } = await supabase
    .from("tools")
    .select("id, slug, status, merged_into_tool_id")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data?.merged_into_tool_id) return { solution: null, redirectSlug: null };

  const { data: target } = await supabase
    .from("tools")
    .select("slug, status")
    .eq("id", data.merged_into_tool_id)
    .maybeSingle();

  if (target?.status === "published") {
    return { solution: null, redirectSlug: target.slug };
  }

  return { solution: null, redirectSlug: null };
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

export async function getLinkedNewsForTool(toolId: string): Promise<LinkedNewsItem[]> {
  const { data, error } = await supabase
    .from("news_tool_links")
    .select(
      "news_items!inner ( slug, title, summary, published_at, kind, status )",
    )
    .eq("tool_id", toolId);

  if (error) throw new Error(`Linked news unavailable: ${error.message}`);

  return (data ?? [])
    .map((row) => {
      const n = row.news_items as {
        slug: string | null;
        title: string;
        summary: string;
        published_at: string;
        kind: string;
        status: string;
      } | null;
      if (!n || n.status !== "published" || !n.slug) return null;
      return {
        slug: n.slug,
        title: n.title,
        summary: n.summary,
        publishedAt: n.published_at,
        kind: n.kind,
      };
    })
    .filter((n): n is LinkedNewsItem => Boolean(n))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 8);
}

export async function getApprovedChangesForTool(toolId: string): Promise<ChangeHistoryItem[]> {
  const { data, error } = await supabase
    .from("change_events")
    .select("field_key, old_value, new_value, detected_at")
    .eq("tool_id", toolId)
    .eq("review_status", "approved")
    .order("detected_at", { ascending: false })
    .limit(12);

  if (error) throw new Error(`Change history unavailable: ${error.message}`);

  return (data ?? []).map((row) => ({
    fieldKey: row.field_key,
    oldValue: row.old_value,
    newValue: row.new_value,
    detectedAt: row.detected_at,
  }));
}

export async function listCategories(): Promise<TaxonomyItem[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("name, slug, description")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(`Categories unavailable: ${error.message}`);
  return (data ?? []).map((c) => ({
    name: c.name,
    slug: c.slug,
    description: c.description,
  }));
}

export interface TaxonomyItem {
  name: string;
  slug: string;
  description?: string | null;
}

export async function getCategoryBySlug(slug: string): Promise<TaxonomyItem | null> {
  const { data, error } = await supabase
    .from("categories")
    .select("name, slug, description")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(`Category unavailable: ${error.message}`);
  if (!data) return null;
  return { name: data.name, slug: data.slug, description: data.description };
}

export async function listSolutionTypes(): Promise<TaxonomyItem[]> {
  const { data, error } = await supabase
    .from("solution_types")
    .select("name, slug")
    .order("name", { ascending: true });

  if (error) throw new Error(`Solution types unavailable: ${error.message}`);
  return data ?? [];
}

export async function listFeaturesCatalog(): Promise<Array<{ key: string; label: string }>> {
  const { data, error } = await supabase
    .from("features")
    .select("key, label")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`Features unavailable: ${error.message}`);
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

export const featuresCatalogQuery = queryOptions({
  queryKey: ["features-catalog"],
  queryFn: listFeaturesCatalog,
  staleTime: 300_000,
});

export function categoryQuery(slug: string) {
  return queryOptions({
    queryKey: ["categories", slug],
    queryFn: async () => {
      const category = await getCategoryBySlug(slug);
      if (!category) throw new Error("NOT_FOUND");
      return category;
    },
    staleTime: 300_000,
  });
}

export function solutionQuery(slug: string) {
  return queryOptions({
    queryKey: ["solutions", slug],
    queryFn: async () => {
      const resolved = await resolveToolSlug(slug);
      if (resolved.redirectSlug) {
        return { redirectSlug: resolved.redirectSlug, solution: null, alternatives: [], linkedNews: [], changeHistory: [] };
      }
      const solution = resolved.solution ?? (await getSolutionBySlug(slug));
      if (!solution) throw new Error("NOT_FOUND");
      const [alternatives, linkedNews, changeHistory] = await Promise.all([
        getSolutionsBySlugs(solution.alternatives),
        getLinkedNewsForTool(solution.id),
        getApprovedChangesForTool(solution.id),
      ]);
      return { solution, alternatives, linkedNews, changeHistory, redirectSlug: null as string | null };
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
    if (filters.cat) {
      const cat = filters.cat;
      if (!x.categories.includes(cat) && !x.categorySlugs.includes(cat)) return false;
    }
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
