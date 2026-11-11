import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-ingest-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error("Empty URL");
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const u = new URL(withProtocol);
  u.hash = ""; u.hostname = u.hostname.toLowerCase();
  if ((u.protocol === "https:" && u.port === "443") || (u.protocol === "http:" && u.port === "80")) u.port = "";
  ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref", "fbclid", "gclid"].forEach((k) => u.searchParams.delete(k));
  u.pathname = u.pathname.replace(/\/+$/, "") || "/";
  return u.pathname === "/" ? `${u.origin}/` : `${u.origin}${u.pathname}${u.search}`;
}
function dedupeKeyFromUrl(url: string): string {
  const u = new URL(normalizeUrl(url));
  return `${u.hostname}${u.pathname}`.toLowerCase().replace(/\/+$/, "") || u.hostname;
}
type ExtractedTool = Record<string, unknown>;
const ALLOWED_PRICING = new Set(["Free", "Freemium", "Paid", "Open source", "Not disclosed"]);
const ALLOWED_TYPES = new Set(["Tool", "Model", "Agent", "API", "Platform", "Extension", "Framework", "Open source"]);
function sanitizeExtracted(raw: ExtractedTool, fallbackUrl: string) {
  const pricing = typeof raw.pricing_model === "string" && ALLOWED_PRICING.has(raw.pricing_model) ? raw.pricing_model : "Not disclosed";
  const type = typeof raw.type === "string" && ALLOWED_TYPES.has(raw.type) ? raw.type : "Tool";
  const arr = (v: unknown) => (Array.isArray(v) ? v.filter(Boolean) : []);
  return {
    name: typeof raw.name === "string" ? raw.name.trim() : null,
    publisher: typeof raw.publisher === "string" ? raw.publisher.trim() : null,
    summary: typeof raw.summary === "string" ? raw.summary.trim() : null,
    description: typeof raw.description === "string" ? raw.description.trim() : null,
    official_url: typeof raw.official_url === "string" ? raw.official_url.trim() : fallbackUrl,
    pricing_model: pricing, price_display: typeof raw.price_display === "string" ? raw.price_display.trim() : "To verify",
    api_available: typeof raw.api_available === "boolean" ? raw.api_available : null,
    open_source: typeof raw.open_source === "boolean" ? raw.open_source : null,
    local_available: typeof raw.local_available === "boolean" ? raw.local_available : null,
    platforms: arr(raw.platforms), categories: arr(raw.categories), type,
    keywords: arr(raw.keywords), strengths: arr(raw.strengths), limits: arr(raw.limits), audience: arr(raw.audience),
    source_url: typeof raw.source_url === "string" ? raw.source_url.trim() : fallbackUrl,
  };
}
function confidenceFromPayload(p: ReturnType<typeof sanitizeExtracted>) {
  let s = 0;
  if (p.name) s += 0.25; if (p.summary) s += 0.2; if (p.description) s += 0.15; if (p.publisher) s += 0.1;
  if (p.official_url) s += 0.1; if (p.categories.length) s += 0.1;
  if (p.pricing_model !== "Not disclosed") s += 0.05; if (p.keywords.length) s += 0.05;
  return Math.min(1, Number(s.toFixed(2)));
}
async function runtimeSecret(supabase: SupabaseClient, key: string) {
  const fromEnv = Deno.env.get(key);
  if (fromEnv) return fromEnv;
  const { data, error } = await supabase.from("runtime_secrets").select("value").eq("key", key).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.value) throw new Error(`${key} secret is not set`);
  return data.value as string;
}
async function firecrawlKey(supabase: SupabaseClient) {
  return runtimeSecret(supabase, "FIRECRAWL_API_KEY");
}
async function scrapeTool(url: string, supabase: SupabaseClient) {
  const schema = { type: "object", properties: { name: { type: "string" }, publisher: { type: "string" }, summary: { type: "string" }, description: { type: "string" }, official_url: { type: "string" }, pricing_model: { type: "string" }, price_display: { type: "string" }, api_available: { type: "boolean" }, open_source: { type: "boolean" }, local_available: { type: "boolean" }, platforms: { type: "array", items: { type: "string" } }, categories: { type: "array", items: { type: "string" } }, type: { type: "string" }, keywords: { type: "array", items: { type: "string" } }, strengths: { type: "array", items: { type: "string" } }, limits: { type: "array", items: { type: "string" } }, audience: { type: "array", items: { type: "string" } }, source_url: { type: "string" } }, required: ["name", "summary"] };
  const res = await fetch("https://api.firecrawl.dev/v2/scrape", { method: "POST", headers: { Authorization: `Bearer ${await firecrawlKey(supabase)}`, "Content-Type": "application/json" }, body: JSON.stringify({ url, formats: ["markdown", { type: "json", prompt: "Extract factual AI tool info only from the page. Never invent prices.", schema }], onlyMainContent: true }) });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error || body?.message || `Firecrawl scrape failed (${res.status})`);
  const data = body?.data ?? body;
  return { extracted: (data?.json ?? data?.extract ?? {}) as ExtractedTool, markdown: typeof data?.markdown === "string" ? data.markdown : null };
}
async function searchNewTools(supabase: SupabaseClient, query: string, limit = 8) {
  const res = await fetch("https://api.firecrawl.dev/v2/search", { method: "POST", headers: { Authorization: `Bearer ${await firecrawlKey(supabase)}`, "Content-Type": "application/json" }, body: JSON.stringify({ query, limit }) });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error || body?.message || `Firecrawl search failed (${res.status})`);
  const web = body?.data?.web ?? body?.web ?? body?.data ?? [];
  if (!Array.isArray(web)) return [] as { url: string }[];
  return web.map((item: Record<string, unknown>) => ({ url: String(item.url ?? item.link ?? "") })).filter((h: { url: string }) => Boolean(h.url));
}
function serviceClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL"); const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
async function assertCronSecret(req: Request, supabase: SupabaseClient) {
  const expected = await runtimeSecret(supabase, "INGEST_CRON_SECRET");
  if (req.headers.get("x-ingest-secret") !== expected) throw new Error("Invalid cron secret");
}
function urlsMatch(a: string, b: string) { try { return dedupeKeyFromUrl(a) === dedupeKeyFromUrl(b); } catch { return a === b; } }
async function ingestUrls(supabase: SupabaseClient, urls: string[], sourceType: "manual_url" | "daily_search") {
  const results: Array<{ url: string; status: string; candidate_id?: string; error?: string }> = [];
  for (const raw of urls) {
    let normalized: string; let key: string;
    try { normalized = normalizeUrl(raw); key = dedupeKeyFromUrl(normalized); }
    catch (err) { results.push({ url: raw, status: "error", error: err instanceof Error ? err.message : "Invalid URL" }); continue; }
    const { data: tools } = await supabase.from("tools").select("id, official_url, slug").limit(500);
    const existingTool = (tools ?? []).find((t) => urlsMatch(t.official_url, normalized));
    if (existingTool) {
      const { data: dup } = await supabase.from("ingestion_candidates").upsert({ candidate_url: normalized, dedupe_key: key, source_type: sourceType, status: "duplicate", extracted_payload: { existing_tool_id: existingTool.id }, error: "Already present in catalog", tool_id: existingTool.id }, { onConflict: "dedupe_key" }).select("id").single();
      results.push({ url: normalized, status: "exists", candidate_id: dup?.id }); continue;
    }
    const { data: existingCandidate } = await supabase.from("ingestion_candidates").select("id, status").eq("dedupe_key", key).maybeSingle();
    if (existingCandidate?.status === "pending") { results.push({ url: normalized, status: "duplicate", candidate_id: existingCandidate.id }); continue; }
    try {
      const { extracted, markdown } = await scrapeTool(normalized, supabase);
      const payload = sanitizeExtracted(extracted, normalized);
      if (!payload.name || !payload.summary) throw new Error("Extraction missing required name/summary");
      const { data: candidate, error } = await supabase.from("ingestion_candidates").upsert({ candidate_url: normalized, dedupe_key: key, source_type: sourceType, status: "pending", extracted_payload: payload, raw_markdown: markdown?.slice(0, 50000) ?? null, confidence: confidenceFromPayload(payload), error: null, discovered_at: new Date().toISOString() }, { onConflict: "dedupe_key" }).select("id").single();
      if (error) throw new Error(error.message);
      results.push({ url: normalized, status: "queued", candidate_id: candidate.id });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ingest failed";
      const { data: failed } = await supabase.from("ingestion_candidates").upsert({ candidate_url: normalized, dedupe_key: key, source_type: sourceType, status: "pending", extracted_payload: {}, error: message, discovered_at: new Date().toISOString() }, { onConflict: "dedupe_key" }).select("id").maybeSingle();
      results.push({ url: normalized, status: "error", candidate_id: failed?.id, error: message });
    }
  }
  return results;
}

const QUERIES = ["new AI tools launched this week", "new AI API platform launch", "new open source LLM tool release"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);
    const supabase = serviceClient();
    await assertCronSecret(req, supabase);
    const now = new Date();
    const { data: state } = await supabase.from("watch_state").select("*").eq("id", "discover_daily").maybeSingle();
    if (state?.locked_until && new Date(state.locked_until) > now) return jsonResponse({ skipped: true, reason: "locked", locked_until: state.locked_until });
    await supabase.from("watch_state").upsert({ id: "discover_daily", locked_until: new Date(now.getTime() + 15 * 60_000).toISOString() });
    const { data: run, error: runError } = await supabase.from("ingestion_runs").insert({ kind: "daily_discover", stats: {} }).select("id").single();
    if (runError) throw new Error(runError.message);
    try {
      const foundUrls: string[] = [];
      for (const query of QUERIES) {
        const hits = await searchNewTools(supabase, query, 5);
        for (const hit of hits) foundUrls.push(hit.url);
      }
      const unique = [...new Set(foundUrls)].slice(0, 15);
      const results = await ingestUrls(supabase, unique, "daily_search");
      const stats = { searched_queries: QUERIES.length, urls_found: foundUrls.length, urls_unique: unique.length, queued: results.filter((r) => r.status === "queued").length, duplicate: results.filter((r) => r.status === "duplicate").length, exists: results.filter((r) => r.status === "exists").length, error: results.filter((r) => r.status === "error").length };
      await supabase.from("ingestion_runs").update({ finished_at: new Date().toISOString(), stats }).eq("id", run.id);
      await supabase.from("watch_state").update({ locked_until: null, last_run_at: new Date().toISOString(), last_result: JSON.stringify(stats), paused_reason: null }).eq("id", "discover_daily");
      return jsonResponse({ run_id: run.id, stats, results });
    } catch (inner) {
      const message = inner instanceof Error ? inner.message : "Discover failed";
      await supabase.from("ingestion_runs").update({ finished_at: new Date().toISOString(), error: message }).eq("id", run.id);
      await supabase.from("watch_state").update({ locked_until: null, last_run_at: new Date().toISOString(), last_result: message, paused_reason: message }).eq("id", "discover_daily");
      throw inner;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Discover failed";
    return jsonResponse({ error: message }, message.includes("Invalid cron") ? 403 : 500);
  }
});
