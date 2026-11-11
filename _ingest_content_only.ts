import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// ---- shared/cors.ts ----
const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-ingest-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ---- shared/normalize.ts ----
function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error("Empty URL");
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const u = new URL(withProtocol);
  u.hash = "";
  u.hostname = u.hostname.toLowerCase();
  if ((u.protocol === "https:" && u.port === "443") || (u.protocol === "http:" && u.port === "80")) {
    u.port = "";
  }
  // Drop common tracking params
  ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref", "fbclid", "gclid"].forEach(
    (k) => u.searchParams.delete(k),
  );
  let path = u.pathname.replace(/\/+$/, "");
  if (!path) path = "";
  u.pathname = path || "/";
  // Prefer origin without trailing slash for homepage
  if (u.pathname === "/") return `${u.origin}/`;
  return `${u.origin}${u.pathname}${u.search}`;
}

function dedupeKeyFromUrl(url: string): string {
  const u = new URL(normalizeUrl(url));
  return `${u.hostname}${u.pathname}`.toLowerCase().replace(/\/+$/, "") || u.hostname;
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

type ExtractedTool = {
  name?: string | null;
  publisher?: string | null;
  summary?: string | null;
  description?: string | null;
  official_url?: string | null;
  pricing_model?: string | null;
  price_display?: string | null;
  api_available?: boolean | null;
  open_source?: boolean | null;
  local_available?: boolean | null;
  platforms?: string[] | null;
  categories?: string[] | null;
  type?: string | null;
  keywords?: string[] | null;
  strengths?: string[] | null;
  limits?: string[] | null;
  audience?: string[] | null;
  source_url?: string | null;
};

const ALLOWED_PRICING = new Set(["Free", "Freemium", "Paid", "Open source", "Not disclosed"]);
const ALLOWED_TYPES = new Set([
  "Tool",
  "Model",
  "Agent",
  "API",
  "Platform",
  "Extension",
  "Framework",
  "Open source",
]);

function sanitizeExtracted(raw: ExtractedTool, fallbackUrl: string): ExtractedTool {
  const pricing = raw.pricing_model && ALLOWED_PRICING.has(raw.pricing_model)
    ? raw.pricing_model
    : "Not disclosed";
  const type = raw.type && ALLOWED_TYPES.has(raw.type) ? raw.type : "Tool";

  return {
    name: raw.name?.trim() || null,
    publisher: raw.publisher?.trim() || null,
    summary: raw.summary?.trim() || null,
    description: raw.description?.trim() || null,
    official_url: raw.official_url?.trim() || fallbackUrl,
    pricing_model: pricing,
    price_display: raw.price_display?.trim() || "To verify",
    api_available: typeof raw.api_available === "boolean" ? raw.api_available : null,
    open_source: typeof raw.open_source === "boolean" ? raw.open_source : null,
    local_available: typeof raw.local_available === "boolean" ? raw.local_available : null,
    platforms: Array.isArray(raw.platforms) ? raw.platforms.filter(Boolean) : [],
    categories: Array.isArray(raw.categories) ? raw.categories.filter(Boolean) : [],
    type,
    keywords: Array.isArray(raw.keywords) ? raw.keywords.filter(Boolean) : [],
    strengths: Array.isArray(raw.strengths) ? raw.strengths.filter(Boolean) : [],
    limits: Array.isArray(raw.limits) ? raw.limits.filter(Boolean) : [],
    audience: Array.isArray(raw.audience) ? raw.audience.filter(Boolean) : [],
    source_url: raw.source_url?.trim() || fallbackUrl,
  };
}

function confidenceFromPayload(payload: ExtractedTool): number {
  let score = 0;
  if (payload.name) score += 0.25;
  if (payload.summary) score += 0.2;
  if (payload.description) score += 0.15;
  if (payload.publisher) score += 0.1;
  if (payload.official_url) score += 0.1;
  if (payload.categories && payload.categories.length) score += 0.1;
  if (payload.pricing_model && payload.pricing_model !== "Not disclosed") score += 0.05;
  if (payload.keywords && payload.keywords.length) score += 0.05;
  return Math.min(1, Number(score.toFixed(2)));
}

// ---- shared/firecrawl.ts ----
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

type ScrapeResult = {
  extracted: ExtractedTool;
  markdown: string | null;
};

async function scrapeTool(url: string): Promise<ScrapeResult> {
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

type SearchHit = { url: string; title?: string; description?: string };

async function searchNewTools(query: string, limit = 8): Promise<SearchHit[]> {
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

// ---- shared/supabase.ts ----
function serviceClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function userClient(authHeader: string): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !anon) throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
  return createClient(url, anon, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function requireStaff(authHeader: string | null) {
  if (!authHeader) throw new Error("Missing Authorization header");
  const supabase = userClient(authHeader);
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error("Unauthorized");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, email")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profileError) throw new Error(profileError.message);
  if (!profile || !["editor", "admin", "owner"].includes(profile.role)) {
    throw new Error("Forbidden: staff role required");
  }

  return { supabase, user: userData.user, profile, service: serviceClient() };
}

function assertCronSecret(req: Request) {
  const expected = Deno.env.get("INGEST_CRON_SECRET");
  if (!expected) throw new Error("INGEST_CRON_SECRET is not configured");
  const provided = req.headers.get("x-ingest-secret");
  if (!provided || provided !== expected) throw new Error("Invalid cron secret");
}

// ---- shared/ingest.ts ----
type IngestSourceType = "manual_url" | "daily_search";

type IngestItemResult = {
  url: string;
  status: "queued" | "duplicate" | "exists" | "error";
  candidate_id?: string;
  error?: string;
};

function urlsMatch(a: string, b: string): boolean {
  try {
    return dedupeKeyFromUrl(a) === dedupeKeyFromUrl(b);
  } catch {
    return a === b;
  }
}

async function ingestUrls(
  supabase: SupabaseClient,
  urls: string[],
  sourceType: IngestSourceType,
): Promise<IngestItemResult[]> {
  const results: IngestItemResult[] = [];

  for (const raw of urls) {
    let normalized: string;
    let key: string;
    try {
      normalized = normalizeUrl(raw);
      key = dedupeKeyFromUrl(normalized);
    } catch (err) {
      results.push({
        url: raw,
        status: "error",
        error: err instanceof Error ? err.message : "Invalid URL",
      });
      continue;
    }

    // Already in catalog?
    const { data: tools, error: toolsError } = await supabase
      .from("tools")
      .select("id, official_url, slug")
      .limit(500);
    if (toolsError) {
      results.push({ url: normalized, status: "error", error: toolsError.message });
      continue;
    }
    const existingTool = (tools ?? []).find((t) => urlsMatch(t.official_url, normalized));
    if (existingTool) {
      const { data: dup, error: dupError } = await supabase
        .from("ingestion_candidates")
        .upsert(
          {
            candidate_url: normalized,
            dedupe_key: key,
            source_type: sourceType,
            status: "duplicate",
            extracted_payload: { existing_tool_id: existingTool.id, slug: existingTool.slug },
            error: "Already present in catalog",
            tool_id: existingTool.id,
          },
          { onConflict: "dedupe_key" },
        )
        .select("id")
        .single();
      if (dupError) {
        results.push({ url: normalized, status: "error", error: dupError.message });
      } else {
        results.push({ url: normalized, status: "exists", candidate_id: dup.id });
      }
      continue;
    }

    // Pending candidate already?
    const { data: existingCandidate } = await supabase
      .from("ingestion_candidates")
      .select("id, status")
      .eq("dedupe_key", key)
      .maybeSingle();

    if (existingCandidate?.status === "pending") {
      results.push({
        url: normalized,
        status: "duplicate",
        candidate_id: existingCandidate.id,
        error: "Already pending review",
      });
      continue;
    }

    try {
      const { extracted, markdown } = await scrapeTool(normalized);
      const payload = sanitizeExtracted(extracted, normalized);
      if (!payload.name || !payload.summary) {
        throw new Error("Extraction missing required name/summary");
      }

      const { data: candidate, error: insertError } = await supabase
        .from("ingestion_candidates")
        .upsert(
          {
            candidate_url: normalized,
            dedupe_key: key,
            source_type: sourceType,
            status: "pending",
            extracted_payload: payload,
            raw_markdown: markdown?.slice(0, 50_000) ?? null,
            confidence: confidenceFromPayload(payload),
            error: null,
            discovered_at: new Date().toISOString(),
            reviewed_at: null,
            reviewed_by: null,
            tool_id: null,
          },
          { onConflict: "dedupe_key" },
        )
        .select("id")
        .single();

      if (insertError) throw new Error(insertError.message);
      results.push({ url: normalized, status: "queued", candidate_id: candidate.id });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ingest failed";
      const { data: failed } = await supabase
        .from("ingestion_candidates")
        .upsert(
          {
            candidate_url: normalized,
            dedupe_key: key,
            source_type: sourceType,
            status: "pending",
            extracted_payload: {},
            error: message,
            discovered_at: new Date().toISOString(),
          },
          { onConflict: "dedupe_key" },
        )
        .select("id")
        .maybeSingle();

      results.push({
        url: normalized,
        status: "error",
        candidate_id: failed?.id,
        error: message,
      });
    }
  }

  return results;
}

// ---- entry ----
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

    const body = await req.json();
    const urls: string[] = Array.isArray(body?.urls)
      ? body.urls.map(String)
      : body?.url
        ? [String(body.url)]
        : [];

    if (!urls.length) return jsonResponse({ error: "Provide urls[] or url" }, 400);
    if (urls.length > 25) return jsonResponse({ error: "Max 25 URLs per request" }, 400);

    const cronHeader = req.headers.get("x-ingest-secret");
    let supabase;
    let sourceType: "manual_url" | "daily_search" = "manual_url";

    if (cronHeader) {
      assertCronSecret(req);
      supabase = serviceClient();
      sourceType = body?.source_type === "daily_search" ? "daily_search" : "manual_url";
    } else {
      const auth = await requireStaff(req.headers.get("Authorization"));
      supabase = auth.service;
      sourceType = "manual_url";
    }

    const { data: run, error: runError } = await supabase
      .from("ingestion_runs")
      .insert({ kind: "manual_ingest", stats: { requested: urls.length } })
      .select("id")
      .single();
    if (runError) throw new Error(runError.message);

    const results = await ingestUrls(supabase, urls, sourceType);
    const stats = {
      requested: urls.length,
      queued: results.filter((r) => r.status === "queued").length,
      duplicate: results.filter((r) => r.status === "duplicate").length,
      exists: results.filter((r) => r.status === "exists").length,
      error: results.filter((r) => r.status === "error").length,
    };

    await supabase
      .from("ingestion_runs")
      .update({ finished_at: new Date().toISOString(), stats })
      .eq("id", run.id);

    return jsonResponse({ run_id: run.id, stats, results });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ingest failed";
    const status = message.includes("Unauthorized") || message.includes("Forbidden")
      ? 401
      : message.includes("Invalid cron")
        ? 403
        : 500;
    return jsonResponse({ error: message }, status);
  }
});
