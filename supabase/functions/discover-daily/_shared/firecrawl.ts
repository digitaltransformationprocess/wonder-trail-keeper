import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import type { ExtractedTool } from "./normalize.ts";

/** Cloud default. For Firecrawl Local set FIRECRAWL_API_URL=http://127.0.0.1:3002 */
const CLOUD_BASE = "https://api.firecrawl.dev/v2";

function firecrawlBase(): string {
  let raw = (Deno.env.get("FIRECRAWL_API_URL") || CLOUD_BASE).trim().replace(/\/$/, "");
  if (/localhost|127\.0\.0\.1/i.test(raw) && !/\/v2$/i.test(raw)) {
    raw = `${raw}/v2`;
  }
  return raw;
}

function isLocalFirecrawl(base = firecrawlBase()): boolean {
  return /localhost|127\.0\.0\.1/i.test(base);
}

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

async function firecrawlHeaders(supabase?: SupabaseClient): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const base = firecrawlBase();
  if (isLocalFirecrawl(base)) {
    const token =
      Deno.env.get("FIRECRAWL_LOCAL_TOKEN") || Deno.env.get("FIRECRAWL_API_KEY");
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }
  headers.Authorization = `Bearer ${await firecrawlKey(supabase)}`;
  return headers;
}

function extractToolFromMarkdown(markdown: string, url: string): ExtractedTool {
  const lines = markdown.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const h1 = lines.find((l) => /^#\s+/.test(l))?.replace(/^#\s+/, "") ?? "";
  const paras = lines.filter((l) => !/^#/.test(l) && !/^[-*|]/.test(l));
  const summary = (paras[0] || h1 || "To verify").slice(0, 200);
  const description = paras.slice(0, 6).join("\n\n").slice(0, 4000) || summary;
  return {
    name: h1 || new URL(url).hostname.replace(/^www\./, ""),
    summary,
    description,
    official_url: url,
    source_url: url,
  } as ExtractedTool;
}

export type ScrapeResult = {
  extracted: ExtractedTool;
  markdown: string | null;
};

export async function scrapeTool(url: string, supabase?: SupabaseClient): Promise<ScrapeResult> {
  const base = firecrawlBase();
  const local = isLocalFirecrawl(base);
  const headers = await firecrawlHeaders(supabase);

  const formats: unknown[] = ["markdown"];
  if (!local) {
    formats.push({
      type: "json",
      prompt: EXTRACT_PROMPT,
      schema: TOOL_JSON_SCHEMA,
    });
  }

  const res = await fetch(`${base}/scrape`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      url,
      formats,
      onlyMainContent: true,
    }),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body?.error || body?.message || `Firecrawl scrape failed (${res.status})`);
  }

  const data = body?.data ?? body;
  const markdown = typeof data?.markdown === "string" ? data.markdown : null;
  let extracted = (data?.json ?? data?.extract ?? {}) as ExtractedTool;
  if ((!extracted || !extracted.name) && markdown) {
    extracted = extractToolFromMarkdown(markdown, url);
  }
  return { extracted, markdown };
}

export type SearchHit = { url: string; title?: string; description?: string };

export async function searchNewTools(
  query: string,
  limit = 8,
  supabase?: SupabaseClient,
): Promise<SearchHit[]> {
  const base = firecrawlBase();
  const headers = await firecrawlHeaders(supabase);
  const res = await fetch(`${base}/search`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query,
      limit,
    }),
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
