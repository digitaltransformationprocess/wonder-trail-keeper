import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type ToolStatus = Database["public"]["Enums"]["tool_status"];

export interface AdminToolListItem {
  id: string;
  name: string;
  slug: string;
  status: ToolStatus;
  pricing_model: string | null;
  last_verified_at: string | null;
  updated_at: string;
  publisher: string | null;
}

export interface AdminToolInput {
  name: string;
  slug: string;
  publisherName: string;
  summary: string;
  description: string;
  officialUrl: string;
  status: ToolStatus;
  pricingModel: string;
  priceDisplay: string;
  apiAvailable: boolean;
  openSource: boolean;
  localAvailable: boolean;
  keywords: string[];
  strengths: string[];
  limits: string[];
  audience: string[];
  typeName: string;
  categoryNames: string[];
  platformLabels: string[];
  sourceUrl: string;
  lastVerifiedAt: string | null;
  alternativeSlugs: string[];
}

export interface AdminToolDetail extends AdminToolInput {
  id: string;
}

function splitLines(value: string): string[] {
  return value
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function linesToList(value: string): string[] {
  return splitLines(value);
}

export function listToLines(value: string[]): string {
  return value.join("\n");
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export { slugify };

async function ensurePublisher(name: string): Promise<string> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Publisher is required");

  const { data: existing, error: findError } = await supabase
    .from("publishers")
    .select("id")
    .eq("name", trimmed)
    .maybeSingle();
  if (findError) throw new Error(findError.message);
  if (existing) return existing.id;

  const { data, error } = await supabase
    .from("publishers")
    .insert({ name: trimmed })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id;
}

async function ensureSource(url: string, publisher: string): Promise<string | null> {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const { data: existing, error: findError } = await supabase
    .from("sources")
    .select("id")
    .eq("url", trimmed)
    .maybeSingle();
  if (findError) throw new Error(findError.message);
  if (existing) return existing.id;

  const { data, error } = await supabase
    .from("sources")
    .insert({
      url: trimmed,
      publisher,
      source_type: "official",
      reliability_level: "A",
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id;
}

async function syncRelations(toolId: string, input: AdminToolInput) {
  const [{ data: typeRow, error: typeError }, { data: categories, error: catError }, { data: platforms, error: platError }] =
    await Promise.all([
      supabase.from("solution_types").select("id, name").eq("name", input.typeName).maybeSingle(),
      supabase.from("categories").select("id, name").in("name", input.categoryNames.length ? input.categoryNames : ["__none__"]),
      supabase.from("platforms").select("id, label").in("label", input.platformLabels.length ? input.platformLabels : ["__none__"]),
    ]);

  if (typeError) throw new Error(typeError.message);
  if (catError) throw new Error(catError.message);
  if (platError) throw new Error(platError.message);
  if (!typeRow) throw new Error(`Unknown type: ${input.typeName}`);

  const categoryIds = (categories ?? [])
    .filter((c) => input.categoryNames.includes(c.name))
    .map((c) => c.id);
  const platformIds = (platforms ?? [])
    .filter((p) => input.platformLabels.includes(p.label))
    .map((p) => p.id);

  const sourceId = await ensureSource(input.sourceUrl || input.officialUrl, input.publisherName);

  // Replace junction rows
  const deletes = await Promise.all([
    supabase.from("tool_types").delete().eq("tool_id", toolId),
    supabase.from("tool_categories").delete().eq("tool_id", toolId),
    supabase.from("tool_platforms").delete().eq("tool_id", toolId),
    supabase.from("tool_sources").delete().eq("tool_id", toolId),
    supabase.from("tool_relations").delete().eq("source_tool_id", toolId).eq("relation_type", "alternative"),
  ]);
  for (const d of deletes) {
    if (d.error) throw new Error(d.error.message);
  }

  const { error: typeInsertError } = await supabase.from("tool_types").insert({
    tool_id: toolId,
    solution_type_id: typeRow.id,
    is_primary: true,
  });
  if (typeInsertError) throw new Error(typeInsertError.message);

  if (categoryIds.length) {
    const { error } = await supabase.from("tool_categories").insert(
      categoryIds.map((category_id, index) => ({
        tool_id: toolId,
        category_id,
        is_primary: index === 0,
      })),
    );
    if (error) throw new Error(error.message);
  }

  if (platformIds.length) {
    const { error } = await supabase.from("tool_platforms").insert(
      platformIds.map((platform_id) => ({
        tool_id: toolId,
        platform_id,
        status: "available",
      })),
    );
    if (error) throw new Error(error.message);
  }

  if (sourceId) {
    const { error } = await supabase.from("tool_sources").insert({
      tool_id: toolId,
      source_id: sourceId,
      claim_key: "general",
      verified_at: input.lastVerifiedAt,
    });
    if (error) throw new Error(error.message);
  }

  if (input.alternativeSlugs.length) {
    const { data: alts, error: altError } = await supabase
      .from("tools")
      .select("id, slug")
      .in("slug", input.alternativeSlugs);
    if (altError) throw new Error(altError.message);
    const rows = (alts ?? [])
      .filter((a) => a.id !== toolId)
      .map((a) => ({
        source_tool_id: toolId,
        target_tool_id: a.id,
        relation_type: "alternative",
      }));
    if (rows.length) {
      const { error } = await supabase.from("tool_relations").insert(rows);
      if (error) throw new Error(error.message);
    }
  }
}

export async function listAdminTools(): Promise<AdminToolListItem[]> {
  const { data, error } = await supabase
    .from("tools")
    .select("id, name, slug, status, pricing_model, last_verified_at, updated_at, publishers(name)")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(`Admin catalog unavailable: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: row.status,
    pricing_model: row.pricing_model,
    last_verified_at: row.last_verified_at,
    updated_at: row.updated_at,
    publisher: (row.publishers as { name: string } | null)?.name ?? null,
  }));
}

export async function getAdminTool(slug: string): Promise<AdminToolDetail | null> {
  const { data, error } = await supabase
    .from("tools")
    .select(
      `
      id, name, slug, summary, description, official_url, status,
      pricing_model, price_display, api_available, open_source, local_available,
      keywords, strengths, limits, audience, last_verified_at,
      publishers ( name ),
      tool_types ( is_primary, solution_types ( name ) ),
      tool_categories ( is_primary, categories ( name ) ),
      tool_platforms ( platforms ( label ) ),
      tool_sources ( sources ( url ) ),
      tool_relations!tool_relations_source_tool_id_fkey (
        relation_type,
        tools!tool_relations_target_tool_id_fkey ( slug )
      )
    `,
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const typeName =
    (data.tool_types as Array<{ is_primary: boolean; solution_types: { name: string } | null }> | null)
      ?.find((t) => t.is_primary)?.solution_types?.name ??
    (data.tool_types as Array<{ solution_types: { name: string } | null }> | null)?.[0]?.solution_types
      ?.name ??
    "Tool";

  const categoryNames = (
    (data.tool_categories as Array<{
      is_primary: boolean;
      categories: { name: string } | null;
    }> | null) ?? []
  )
    .slice()
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary))
    .map((c) => c.categories?.name)
    .filter((n): n is string => Boolean(n));

  const platformLabels = (
    (data.tool_platforms as Array<{ platforms: { label: string } | null }> | null) ?? []
  )
    .map((p) => p.platforms?.label)
    .filter((n): n is string => Boolean(n));

  const sourceUrl =
    ((data.tool_sources as Array<{ sources: { url: string } | null }> | null) ?? [])[0]?.sources
      ?.url ?? data.official_url;

  const alternativeSlugs = (
    (data.tool_relations as Array<{
      relation_type: string;
      tools: { slug: string } | null;
    }> | null) ?? []
  )
    .filter((r) => r.relation_type === "alternative")
    .map((r) => r.tools?.slug)
    .filter((s): s is string => Boolean(s));

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    publisherName: (data.publishers as { name: string } | null)?.name ?? "",
    summary: data.summary,
    description: data.description,
    officialUrl: data.official_url,
    status: data.status,
    pricingModel: data.pricing_model ?? "Not disclosed",
    priceDisplay: data.price_display ?? "To verify",
    apiAvailable: Boolean(data.api_available),
    openSource: data.open_source,
    localAvailable: data.local_available,
    keywords: data.keywords ?? [],
    strengths: data.strengths ?? [],
    limits: data.limits ?? [],
    audience: data.audience ?? [],
    typeName,
    categoryNames,
    platformLabels,
    sourceUrl,
    lastVerifiedAt: data.last_verified_at,
    alternativeSlugs,
  };
}

export async function createAdminTool(input: AdminToolInput): Promise<string> {
  const publisherId = await ensurePublisher(input.publisherName);
  const { data, error } = await supabase
    .from("tools")
    .insert({
      name: input.name.trim(),
      slug: input.slug.trim(),
      publisher_id: publisherId,
      summary: input.summary.trim(),
      description: input.description.trim(),
      official_url: input.officialUrl.trim(),
      status: input.status,
      pricing_model: input.pricingModel,
      price_display: input.priceDisplay.trim() || "To verify",
      api_available: input.apiAvailable,
      open_source: input.openSource,
      local_available: input.localAvailable,
      keywords: input.keywords,
      strengths: input.strengths,
      limits: input.limits,
      audience: input.audience,
      last_verified_at: input.lastVerifiedAt,
    })
    .select("id, slug")
    .single();

  if (error) throw new Error(error.message);
  await syncRelations(data.id, input);
  return data.slug;
}

export async function updateAdminTool(toolId: string, input: AdminToolInput): Promise<string> {
  const publisherId = await ensurePublisher(input.publisherName);
  const { data, error } = await supabase
    .from("tools")
    .update({
      name: input.name.trim(),
      slug: input.slug.trim(),
      publisher_id: publisherId,
      summary: input.summary.trim(),
      description: input.description.trim(),
      official_url: input.officialUrl.trim(),
      status: input.status,
      pricing_model: input.pricingModel,
      price_display: input.priceDisplay.trim() || "To verify",
      api_available: input.apiAvailable,
      open_source: input.openSource,
      local_available: input.localAvailable,
      keywords: input.keywords,
      strengths: input.strengths,
      limits: input.limits,
      audience: input.audience,
      last_verified_at: input.lastVerifiedAt,
    })
    .eq("id", toolId)
    .select("id, slug")
    .single();

  if (error) throw new Error(error.message);
  await syncRelations(data.id, input);
  return data.slug;
}

export async function setToolStatus(toolId: string, status: ToolStatus) {
  const patch: {
    status: ToolStatus;
    last_verified_at?: string;
  } = { status };
  if (status === "published") {
    patch.last_verified_at = new Date().toISOString().slice(0, 10);
  }
  const { error } = await supabase.from("tools").update(patch).eq("id", toolId);
  if (error) throw new Error(error.message);
}

export async function getAdminDashboardCounts() {
  const [
    { data: tools, error: toolsError },
    { data: news, error: newsError },
    { count: pendingCandidates, error: candidatesError },
    { count: pendingChanges, error: changesError },
    { data: latestRun, error: runError },
  ] = await Promise.all([
    supabase.from("tools").select("id, status"),
    supabase.from("news_items").select("id, status"),
    supabase
      .from("ingestion_candidates")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("change_events")
      .select("id", { count: "exact", head: true })
      .eq("review_status", "pending"),
    supabase
      .from("ingestion_runs")
      .select("id, kind, started_at, finished_at, stats, error")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  if (toolsError) throw new Error(toolsError.message);
  if (newsError) throw new Error(newsError.message);
  if (candidatesError) throw new Error(candidatesError.message);
  if (changesError) throw new Error(changesError.message);
  if (runError) throw new Error(runError.message);

  const byStatus = (tools ?? []).reduce<Record<string, number>>((acc, t) => {
    acc[t.status] = (acc[t.status] ?? 0) + 1;
    return acc;
  }, {});

  const newsByStatus = (news ?? []).reduce<Record<string, number>>((acc, n) => {
    acc[n.status] = (acc[n.status] ?? 0) + 1;
    return acc;
  }, {});

  return {
    toolsTotal: tools?.length ?? 0,
    published: byStatus["published"] ?? 0,
    pendingReview: byStatus["pending_review"] ?? 0,
    needsUpdate: byStatus["needs_update"] ?? 0,
    archived: byStatus["archived"] ?? 0,
    newsDraft: newsByStatus["draft"] ?? 0,
    newsPublished: newsByStatus["published"] ?? 0,
    newsArchived: newsByStatus["archived"] ?? 0,
    pendingCandidates: pendingCandidates ?? 0,
    pendingChanges: pendingChanges ?? 0,
    latestIngestionRun: latestRun,
  };
}

export const adminToolsQuery = queryOptions({
  queryKey: ["admin", "tools"],
  queryFn: listAdminTools,
  staleTime: 15_000,
});

export function adminToolQuery(slug: string) {
  return queryOptions({
    queryKey: ["admin", "tools", slug],
    queryFn: async () => {
      const tool = await getAdminTool(slug);
      if (!tool) throw new Error("NOT_FOUND");
      return tool;
    },
    staleTime: 15_000,
  });
}

export const adminDashboardQuery = queryOptions({
  queryKey: ["admin", "dashboard"],
  queryFn: getAdminDashboardCounts,
  staleTime: 15_000,
});

export async function listPublishers() {
  const { data, error } = await supabase.from("publishers").select("id, name").order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listPlatforms() {
  const { data, error } = await supabase.from("platforms").select("id, label").order("label");
  if (error) throw new Error(error.message);
  return data ?? [];
}
