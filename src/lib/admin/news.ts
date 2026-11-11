import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { slugify } from "@/lib/admin/catalog";

export type NewsStatus = Database["public"]["Enums"]["news_status"];

export interface AdminNewsListItem {
  id: string;
  title: string;
  slug: string | null;
  kind: string;
  status: NewsStatus;
  published_at: string;
  updated_at: string;
  solution_slug: string | null;
}

export interface AdminNewsInput {
  title: string;
  slug: string | null;
  summary: string;
  body: string | null;
  kind: string;
  eventType: string | null;
  publishedAt: string;
  sourceUrl: string;
  solutionSlug: string | null;
  status: NewsStatus;
}

export interface AdminNewsDetail extends AdminNewsInput {
  id: string;
}

async function syncToolLink(newsItemId: string, solutionSlug: string | null) {
  const { error: delError } = await supabase
    .from("news_tool_links")
    .delete()
    .eq("news_item_id", newsItemId);
  if (delError) throw new Error(delError.message);

  const slug = solutionSlug?.trim();
  if (!slug) return;

  const { data: tool, error: toolError } = await supabase
    .from("tools")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (toolError) throw new Error(toolError.message);
  if (!tool) return;

  const { error: linkError } = await supabase.from("news_tool_links").insert({
    news_item_id: newsItemId,
    tool_id: tool.id,
  });
  if (linkError) throw new Error(linkError.message);
}

function normalizeSlug(value: string | null): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return slugify(trimmed);
}

export async function listAdminNews(status?: NewsStatus | "all"): Promise<AdminNewsListItem[]> {
  let query = supabase
    .from("news_items")
    .select("id, title, slug, kind, status, published_at, updated_at, solution_slug")
    .order("updated_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Admin news unavailable: ${error.message}`);

  return data ?? [];
}

export async function getAdminNews(id: string): Promise<AdminNewsDetail | null> {
  const { data, error } = await supabase
    .from("news_items")
    .select(
      "id, title, slug, summary, body, kind, event_type, published_at, status, source_url, solution_slug",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    summary: data.summary,
    body: data.body,
    kind: data.kind,
    eventType: data.event_type,
    publishedAt: data.published_at,
    sourceUrl: data.source_url,
    solutionSlug: data.solution_slug,
    status: data.status,
  };
}

export async function createAdminNews(input: AdminNewsInput): Promise<string> {
  const { data, error } = await supabase
    .from("news_items")
    .insert({
      title: input.title.trim(),
      slug: normalizeSlug(input.slug),
      summary: input.summary.trim(),
      body: input.body?.trim() || null,
      kind: input.kind.trim(),
      event_type: input.eventType?.trim() || null,
      published_at: input.publishedAt,
      source_url: input.sourceUrl.trim(),
      solution_slug: input.solutionSlug?.trim() || null,
      status: input.status,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  await syncToolLink(data.id, input.solutionSlug);
  return data.id;
}

export async function updateAdminNews(newsId: string, input: AdminNewsInput): Promise<string> {
  const { data, error } = await supabase
    .from("news_items")
    .update({
      title: input.title.trim(),
      slug: normalizeSlug(input.slug),
      summary: input.summary.trim(),
      body: input.body?.trim() || null,
      kind: input.kind.trim(),
      event_type: input.eventType?.trim() || null,
      published_at: input.publishedAt,
      source_url: input.sourceUrl.trim(),
      solution_slug: input.solutionSlug?.trim() || null,
      status: input.status,
    })
    .eq("id", newsId)
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  await syncToolLink(data.id, input.solutionSlug);
  return data.id;
}

export async function setNewsStatus(newsId: string, status: NewsStatus) {
  const { data: existing, error: readError } = await supabase
    .from("news_items")
    .select("published_at")
    .eq("id", newsId)
    .maybeSingle();
  if (readError) throw new Error(readError.message);

  const patch: {
    status: NewsStatus;
    published_at?: string;
  } = { status };

  if (status === "published" && !existing?.published_at) {
    patch.published_at = new Date().toISOString().slice(0, 10);
  }

  const { error } = await supabase.from("news_items").update(patch).eq("id", newsId);
  if (error) throw new Error(error.message);
}

export function adminNewsQuery(status: NewsStatus | "all" = "all") {
  return queryOptions({
    queryKey: ["admin", "news", status],
    queryFn: () => listAdminNews(status),
    staleTime: 15_000,
  });
}

export function adminNewsItemQuery(id: string) {
  return queryOptions({
    queryKey: ["admin", "news", "item", id],
    queryFn: async () => {
      const item = await getAdminNews(id);
      if (!item) throw new Error("NOT_FOUND");
      return item;
    },
    staleTime: 15_000,
  });
}
