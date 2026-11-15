import { queryOptions } from "@tanstack/react-query";

export const TRUNCATED_CATEGORIES = [
  { id: "", label: "All" },
  { id: "models-research", label: "Models & Research" },
  { id: "ai-agents", label: "AI Agents" },
  { id: "ai-development", label: "AI Development" },
  { id: "infrastructure-hardware", label: "Infrastructure" },
  { id: "media-vision-audio", label: "Image, Video & Audio" },
  { id: "robotics-autonomy", label: "Robotics" },
  { id: "business-industry", label: "Business" },
  { id: "policy-regulation", label: "Policy" },
  { id: "safety-security", label: "Safety & Security" },
  { id: "benchmarks-evaluation", label: "Benchmarks" },
  { id: "open-source-community", label: "Open Source" },
  { id: "ai-society", label: "AI in Society" },
] as const;

export type TruncatedCategoryId =
  (typeof TRUNCATED_CATEGORIES)[number]["id"];

export interface TruncatedMedia {
  id: string;
  kind: string;
  width?: number;
  height?: number;
  alt?: string | null;
  owner?: string;
}

export interface TruncatedStory {
  id: string;
  headline: string;
  summary: string[] | string;
  canonical_url: string;
  primary_url: string;
  published_at: string | null;
  discovered_at: string;
  first_published_at: string;
  publisher_id: string;
  publisher_name: string;
  publisher_host: string;
  og_description: string | null;
  image: TruncatedMedia | null;
  favicon: TruncatedMedia | null;
  classification: {
    category_id: string | null;
    topic_ids?: string[];
    entity_ids?: string[];
    content_type_id?: string | null;
  } | null;
  legacy_category: string | null;
  note: { text: string; created_at?: string; updated_at?: string } | null;
  coverage: Array<{
    url: string;
    publisher_name: string;
    headline?: string | null;
  }>;
}

export interface TruncatedFeedResponse {
  stories: TruncatedStory[];
  total: number;
  page: number;
  pages: number;
  pinned?: TruncatedStory | null;
  revenue?: { sponsor?: unknown; disclosures?: unknown } | null;
}

export interface TruncatedSearchResponse extends TruncatedFeedResponse {
  sort?: string;
  query?: string;
  suggestion?: string | null;
  corrected?: boolean;
  facets?: unknown;
}

export interface TruncatedFilters {
  q?: string;
  category?: string;
  page?: number;
}

function summaryText(summary: TruncatedStory["summary"]): string {
  if (Array.isArray(summary)) return summary.filter(Boolean).join(" ");
  return typeof summary === "string" ? summary : "";
}

export function truncatedSummary(story: TruncatedStory): string {
  return summaryText(story.summary);
}

export function truncatedCategoryLabel(id: string | null | undefined): string {
  if (!id) return "AI news";
  const hit = TRUNCATED_CATEGORIES.find((c) => c.id === id);
  return hit?.label ?? id.replace(/-/g, " ");
}

export function truncatedPermalink(storyId: string): string {
  return `https://truncated.ai/story/${storyId}`;
}

/** Truncated serves media at /media/{kind}/{id}?o={owner}&w={width}. */
export function truncatedMediaUrl(
  media: TruncatedMedia | null | undefined,
  opts: { ownerFallback?: string; width?: number } = {},
): string | null {
  if (!media?.id || !media.kind) return null;
  const owner = media.owner || opts.ownerFallback;
  if (!owner) return null;
  const width = opts.width && opts.width > 0 ? opts.width : 800;
  const params = new URLSearchParams({ o: owner, w: String(width) });
  return `https://truncated.ai/media/${encodeURIComponent(media.kind)}/${encodeURIComponent(media.id)}?${params}`;
}

function buildProxyUrl(filters: TruncatedFilters): string {
  const params = new URLSearchParams();
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  params.set("page", String(page));

  const q = filters.q?.trim();
  const category = filters.category?.trim();

  if (q) {
    params.set("mode", "search");
    params.set("q", q.slice(0, 200));
    params.set("sort", "newest");
    if (category) params.set("category", category);
  } else {
    params.set("mode", "feed");
    if (category) params.set("category", category);
  }

  return `/api/truncated?${params.toString()}`;
}

export async function fetchTruncatedStories(
  filters: TruncatedFilters = {},
): Promise<TruncatedFeedResponse> {
  const url = buildProxyUrl(filters);
  const res = await fetch(url, { headers: { Accept: "application/json" } });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = (await res.json()) as { error?: string; detail?: string };
      detail = body.error || body.detail || detail;
    } catch {
      /* ignore */
    }
    throw new Error(`News unavailable (${res.status}): ${detail}`);
  }

  const data = (await res.json()) as TruncatedFeedResponse;
  const stories = Array.isArray(data.stories) ? data.stories : [];

  // First page of feed may pin a story separately — surface it at the top.
  if (!filters.q?.trim() && data.pinned && (filters.page ?? 1) <= 1) {
    const pinnedId = data.pinned.id;
    return {
      ...data,
      stories: [data.pinned, ...stories.filter((s) => s.id !== pinnedId)],
    };
  }

  return { ...data, stories };
}

export function truncatedNewsQuery(filters: TruncatedFilters = {}) {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const q = filters.q?.trim();
  const category = filters.category?.trim();
  const normalized: TruncatedFilters = { page };
  if (q) normalized.q = q;
  if (category) normalized.category = category;

  return queryOptions({
    queryKey: ["truncated-news", normalized],
    queryFn: () => fetchTruncatedStories(normalized),
    staleTime: 60_000,
  });
}
