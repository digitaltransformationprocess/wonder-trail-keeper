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

function apiKey(): string {
  const key = Deno.env.get("FIRECRAWL_API_KEY");
  if (!key) throw new Error("FIRECRAWL_API_KEY secret is not set");
  return key;
}

export type ScrapeResult = {
  extracted: ExtractedTool;
  markdown: string | null;
};

export async function scrapeTool(url: string): Promise<ScrapeResult> {
  const res = await fetch(`${FIRECRAWL_BASE}/scrape`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
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

export type SearchHit = { url: string; title?: string; description?: string };

export async function searchNewTools(query: string, limit = 8): Promise<SearchHit[]> {
  const res = await fetch(`${FIRECRAWL_BASE}/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
    },
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
