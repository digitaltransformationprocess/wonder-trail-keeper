import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import type { ExtractedTool } from "./normalize.ts";

const FIRECRAWL_BASE = "https://api.firecrawl.dev/v2";

const TOOL_JSON_SCHEMA = {
  type: "object",
  properties: {
    name: { type: "string" },
    publisher: { type: "string" },
    summary: { type: "string" },
    description: { type: "string" },
    official_url: { type: "string" },
    pricing_model: {
      type: "string",
      enum: ["Free", "Freemium", "Paid", "Open source", "Not disclosed"],
    },
    price_display: { type: "string" },
    api_available: { type: "boolean" },
    open_source: { type: "boolean" },
    local_available: { type: "boolean" },
    platforms: { type: "array", items: { type: "string" } },
    categories: { type: "array", items: { type: "string" } },
    type: {
      type: "string",
      enum: ["Tool", "Model", "Agent", "API", "Platform", "Extension", "Framework", "Open source"],
    },
    keywords: { type: "array", items: { type: "string" } },
    strengths: { type: "array", items: { type: "string" } },
    limits: { type: "array", items: { type: "string" } },
    audience: { type: "array", items: { type: "string" } },
    source_url: { type: "string" },
  },
  required: ["name", "summary"],
};

const EXTRACT_PROMPT = `Extract factual product information about this AI tool/product page for a discovery catalog.
Rules:
- Only use facts present on the page.
- If a field is unknown, omit it or use null. Never invent prices or capabilities.
- pricing_model must be one of: Free, Freemium, Paid, Open source, Not disclosed.
- categories should map to common AI catalog categories when possible (e.g. AI Assistants, Image Generation, Coding & Development).
- Keep summary under 200 characters. description can be longer but factual.`;

const NEWS_JSON_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    published_date: { type: "string", description: "ISO date YYYY-MM-DD when the article was published" },
    summary: { type: "string" },
    product_names: { type: "array", items: { type: "string" } },
    is_article: {
      type: "boolean",
      description: "true if this is a single news article, false if listing/index/homepage",
    },
    event_kind: {
      type: "string",
      enum: ["release", "pricing", "business", "research", "news"],
    },
  },
  required: ["title", "summary", "is_article"],
};

const NEWS_EXTRACT_PROMPT = `Extract facts from this AI / tech news page.
Rules:
- Only use facts present on the page. Never invent.
- published_date must be YYYY-MM-DD if visible (byline, timestamp, JSON-LD). Otherwise omit.
- is_article=false for listing pages, tag hubs, homepages, trackers, or “latest news” indexes.
- is_article=true only for a single news/announcement article.
- product_names: AI products/models/tools mentioned (max 5).
- summary: 1-2 factual sentences from the article.`;

async function firecrawlKey(supabase?: SupabaseClient) {
  const fromEnv = Deno.env.get("FIRECRAWL_API_KEY");
  if (fromEnv) return fromEnv;
  if (!supabase) throw new Error("FIRECRAWL_API_KEY secret is not set");
  const { data, error } = await supabase
    .from("runtime_secrets")
    .select("value")
    .eq("key", "FIRECRAWL_API_KEY")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.value) throw new Error("FIRECRAWL_API_KEY secret is not set");
  return data.value;
}

export type ScrapeResult = {
  extracted: ExtractedTool;
  markdown: string | null;
};

export async function scrapeTool(url: string, supabase?: SupabaseClient): Promise<ScrapeResult> {
  const key = await firecrawlKey(supabase);
  const res = await fetch(`${FIRECRAWL_BASE}/scrape`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      formats: [
        "markdown",
        {
          type: "json",
          prompt: EXTRACT_PROMPT,
          schema: TOOL_JSON_SCHEMA,
        },
      ],
      onlyMainContent: true,
    }),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body?.error || body?.message || `Firecrawl scrape failed (${res.status})`);
  }

  const data = body?.data ?? body;
  const extracted = (data?.json ?? data?.extract ?? {}) as ExtractedTool;
  const markdown = typeof data?.markdown === "string" ? data.markdown : null;
  return { extracted, markdown };
}

export type NewsScrape = {
  title?: string;
  published_date?: string;
  summary?: string;
  product_names?: string[];
  is_article?: boolean;
  event_kind?: string;
  markdown: string | null;
};

export async function scrapeNewsArticle(url: string, supabase?: SupabaseClient): Promise<NewsScrape> {
  const key = await firecrawlKey(supabase);
  const res = await fetch(`${FIRECRAWL_BASE}/scrape`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      formats: [
        "markdown",
        {
          type: "json",
          prompt: NEWS_EXTRACT_PROMPT,
          schema: NEWS_JSON_SCHEMA,
        },
      ],
      onlyMainContent: true,
    }),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body?.error || body?.message || `Firecrawl scrape failed (${res.status})`);
  }

  const data = body?.data ?? body;
  const extracted = (data?.json ?? data?.extract ?? {}) as Record<string, unknown>;
  const markdown = typeof data?.markdown === "string" ? data.markdown : null;
  return {
    title: extracted.title ? String(extracted.title) : undefined,
    published_date: extracted.published_date ? String(extracted.published_date).slice(0, 10) : undefined,
    summary: extracted.summary ? String(extracted.summary) : undefined,
    product_names: Array.isArray(extracted.product_names)
      ? extracted.product_names.map(String).slice(0, 5)
      : undefined,
    is_article: typeof extracted.is_article === "boolean" ? extracted.is_article : undefined,
    event_kind: extracted.event_kind ? String(extracted.event_kind) : undefined,
    markdown,
  };
}

export type SearchHit = { url: string; title?: string; description?: string };

export async function searchNewTools(
  query: string,
  limit = 8,
  supabase?: SupabaseClient,
  options: { tbs?: string } = {},
): Promise<SearchHit[]> {
  const key = await firecrawlKey(supabase);
  const payload: Record<string, unknown> = {
    query,
    limit,
  };
  // Google-style time filter when supported by Firecrawl search
  if (options.tbs) payload.tbs = options.tbs;

  const res = await fetch(`${FIRECRAWL_BASE}/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body?.error || body?.message || `Firecrawl search failed (${res.status})`);
  }

  const web = body?.data?.web ?? body?.web ?? body?.data ?? [];
  if (!Array.isArray(web)) return [];

  return web
    .map((item: Record<string, unknown>) => ({
      url: String(item.url ?? item.link ?? ""),
      title: item.title ? String(item.title) : undefined,
      description: item.description ? String(item.description) : undefined,
    }))
    .filter((h: SearchHit) => Boolean(h.url));
}
