import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/** Fast non-reasoning default — override with GROK_MODEL secret/env. */
const DEFAULT_MODEL = "grok-4.20-0309-non-reasoning";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

type Constraints = {
  free: boolean;
  openSource: boolean;
  api: boolean;
  local: boolean;
};

function extractConstraints(q: string): Constraints {
  const t = q.toLowerCase();
  return {
    free: /\b(free|gratuit|gratuite|gratuitement|sans payer)\b/.test(t),
    openSource: /open.?source|libre/.test(t),
    api: /\bapi\b/.test(t),
    local: /\b(local|offline|hors.?ligne|self.?host)/.test(t),
  };
}

type ToolRow = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  description: string;
  pricing_model: string | null;
  price_display: string | null;
  open_source: boolean;
  api_available: boolean | null;
  local_available: boolean;
  keywords: string[] | null;
  strengths: string[] | null;
  limits: string[] | null;
};

function groundedReasons(tool: ToolRow, c: Constraints, extra: string[] = []): string[] {
  const out: string[] = [];
  for (const r of extra) {
    if (typeof r === "string" && r.trim()) out.push(r.trim());
  }
  if (tool.summary) out.push(tool.summary);
  if (c.free && tool.pricing_model && ["Free", "Freemium", "Open source"].includes(tool.pricing_model)) {
    out.push(`Pricing model: ${tool.pricing_model}`);
  }
  if (c.openSource && tool.open_source) out.push("Open source");
  if (c.api && tool.api_available) out.push("API available");
  if (c.local && tool.local_available) out.push("Runs locally");
  const seen = new Set<string>();
  return out.filter((x) => {
    if (seen.has(x)) return false;
    seen.add(x);
    return true;
  }).slice(0, 3);
}

type FtsRow = { id: string; slug: string; name: string; summary: string; rank: number };

const STOP = new Set([
  "the", "and", "for", "with", "from", "that", "this", "are", "was", "were", "have", "has",
  "une", "des", "les", "pour", "avec", "dans", "que", "qui", "sur", "pas", "plus", "mon",
  "ma", "mes", "un", "du", "de", "la", "le", "je", "tu", "il", "nous", "vous", "cherche",
  "trouver", "besoin", "veux", "voudrais", "quelque", "chose", "outil", "outils", "aide",
]);

/** Expand common FR/EN need words so FTS still finds catalog English copy. */
function expandQuery(q: string): string {
  const t = q.toLowerCase();
  const extras: string[] = [];
  if (/[ée]criv|redact|email|mail|lettre|texte|writing|copy|content/.test(t)) {
    extras.push("writing", "assistant", "email", "copy");
  }
  if (/vid[eé]o|montage|film|reel|reels/.test(t)) extras.push("video", "generate");
  if (/image|photo|illustration|visuel/.test(t)) extras.push("image", "generate");
  if (/code|d[eé]velopp|program/.test(t)) extras.push("code", "coding", "developer");
  if (/agent|automat/.test(t)) extras.push("agent", "automation", "workflow");
  if (/local|hors.?ligne|offline|self.?host/.test(t)) extras.push("local", "offline");
  if (/open.?source|libre/.test(t)) extras.push("open", "source");
  const tokens = t
    .split(/[^a-zà-ÿ0-9]+/i)
    .map((w) => w.trim())
    .filter((w) => w.length > 2 && !STOP.has(w));
  return [...new Set([...tokens, ...extras])].join(" ");
}

async function ftsSearch(
  supabase: ReturnType<typeof createClient>,
  q: string,
  c: Constraints,
): Promise<FtsRow[]> {
  const { data, error } = await supabase.rpc("search_published_tools", {
    q,
    want_free: c.free,
    want_oss: c.openSource,
    want_api: c.api,
    want_local: c.local,
    result_limit: 6,
  });
  if (error) throw new Error(error.message);
  let rows = (data ?? []) as FtsRow[];
  if (rows.length) return rows;

  const expanded = expandQuery(q);
  if (expanded && expanded !== q.trim().toLowerCase()) {
    const second = await supabase.rpc("search_published_tools", {
      q: expanded,
      want_free: c.free,
      want_oss: c.openSource,
      want_api: c.api,
      want_local: c.local,
      result_limit: 6,
    });
    if (second.error) throw new Error(second.error.message);
    rows = (second.data ?? []) as FtsRow[];
    if (rows.length) return rows;
  }

  // Last-resort: published tools matching any meaningful token via ilike on name/summary.
  const tokens = expandQuery(q).split(/\s+/).filter(Boolean).slice(0, 6);
  if (!tokens.length) return [];
  let query = supabase
    .from("tools")
    .select("id, slug, name, summary")
    .eq("status", "published")
    .limit(6);
  // PostgREST or() filter
  const orParts = tokens.flatMap((tok) => [
    `name.ilike.%${tok}%`,
    `summary.ilike.%${tok}%`,
  ]);
  const { data: soft, error: softErr } = await query.or(orParts.join(","));
  if (softErr) throw new Error(softErr.message);
  return (soft ?? []).map((t) => ({
    id: t.id as string,
    slug: t.slug as string,
    name: t.name as string,
    summary: t.summary as string,
    rank: 0.01,
  }));
}

async function loadTools(
  supabase: ReturnType<typeof createClient>,
  slugs: string[],
): Promise<ToolRow[]> {
  if (!slugs.length) return [];
  const { data, error } = await supabase
    .from("tools")
    .select(
      "id, slug, name, summary, description, pricing_model, price_display, open_source, api_available, local_available, keywords, strengths, limits",
    )
    .eq("status", "published")
    .in("slug", slugs);
  if (error) throw new Error(error.message);
  return (data ?? []) as ToolRow[];
}

async function readSecret(
  supabase: ReturnType<typeof createClient>,
  keys: string[],
): Promise<string | null> {
  for (const key of keys) {
    const fromEnv = Deno.env.get(key);
    if (fromEnv) return fromEnv;
  }
  for (const key of keys) {
    const { data } = await supabase
      .from("runtime_secrets")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    if (data?.value) return data.value as string;
  }
  return null;
}

function extractJsonObject(content: string): unknown {
  const trimmed = content.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error("No JSON object in model response");
  }
}

function buildFallbackAnswer(q: string, tools: ToolRow[]): string {
  if (!tools.length) {
    return `I couldn’t find a solid match in the verified catalog for “${q}”. Try rephrasing, or loosen constraints like free / open source / API / local.`;
  }
  const names = tools.slice(0, 3).map((t) => t.name);
  const lead = names.length === 1
    ? `${names[0]} looks like the closest catalog match`
    : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]} look like the closest catalog matches`;
  return `${lead} for “${q}”. Recommendations below use only published catalog fields — anything missing stays “To verify”.`;
}

function sanitizeAnswer(answer: string, tools: ToolRow[]): string {
  const cleaned = answer.replace(/\s+/g, " ").trim();
  if (!cleaned) return buildFallbackAnswer("", tools);
  // Hard length cap to keep UI readable
  if (cleaned.length > 900) return `${cleaned.slice(0, 880).trim()}…`;
  return cleaned;
}

async function maybeGrokAnswer(
  q: string,
  tools: ToolRow[],
  c: Constraints,
  grokKey: string | null,
  model: string,
): Promise<{
  answer: string;
  reasonsBySlug: Record<string, string[]>;
  orderedSlugs: string[];
  used: boolean;
} | null> {
  if (!grokKey || tools.length === 0) return null;

  const catalog = tools.map((t) => ({
    slug: t.slug,
    name: t.name,
    summary: t.summary,
    // Keep short for latency
    description: (t.description ?? "").slice(0, 220),
    pricing_model: t.pricing_model,
    price_display: t.price_display,
    open_source: t.open_source,
    api_available: t.api_available,
    local_available: t.local_available,
    keywords: (t.keywords ?? []).slice(0, 6),
    strengths: (t.strengths ?? []).slice(0, 3),
    limits: (t.limits ?? []).slice(0, 2),
  }));

  const allowedNames = catalog.map((t) => t.name);
  const allowedSlugs = catalog.map((t) => t.slug);

  const system = [
    "You are the AI Discovery assistant for a verified AI-tools catalog.",
    "Reply in the same language as the user query.",
    "HARD GUARDRAILS:",
    "1) Use ONLY the provided catalog JSON. Never invent tools, prices, features, integrations, or URLs.",
    "2) If a field is missing/null/To verify, say it is unverified — do not guess.",
    "3) Only recommend tools from the catalog list. Never mention tools outside that list.",
    "4) Refuse harmful, illegal, or off-catalog requests; stay helpful for AI-tool discovery.",
    "5) Do not claim sponsorship or ranking deals.",
    "OUTPUT: return ONLY valid JSON with shape:",
    '{"answer":"2-4 short sentences in natural language","results":[{"slug":"...","reasons":["..."]}]}',
    "answer: speak directly to the user, explain which catalog tools fit and why, using catalog facts only.",
    "results: max 5, only allowed slugs, max 2 reasons each that paraphrase catalog fields.",
    `Allowed slugs: ${allowedSlugs.join(", ")}`,
    `Allowed names: ${allowedNames.join(", ")}`,
  ].join("\n");

  const user = JSON.stringify({ query: q, constraints: c, catalog });

  try {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${grokKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        max_tokens: 500,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) {
      console.error("Grok API error", res.status, await res.text());
      return null;
    }
    const body = await res.json();
    const content = body?.choices?.[0]?.message?.content;
    if (typeof content !== "string") return null;
    const parsed = extractJsonObject(content) as {
      answer?: string;
      results?: Array<{ slug?: string; reasons?: string[] }>;
    };

    const allowed = new Set(allowedSlugs);
    const reasonsBySlug: Record<string, string[]> = {};
    const orderedSlugs: string[] = [];
    for (const row of parsed.results ?? []) {
      if (!row.slug || !allowed.has(row.slug) || orderedSlugs.includes(row.slug)) continue;
      orderedSlugs.push(row.slug);
      reasonsBySlug[row.slug] = (row.reasons ?? [])
        .filter((r) => typeof r === "string" && r.trim())
        .slice(0, 2);
      if (orderedSlugs.length >= 5) break;
    }

    const answer = sanitizeAnswer(
      typeof parsed.answer === "string" ? parsed.answer : "",
      tools,
    );

    return {
      answer,
      reasonsBySlug,
      orderedSlugs,
      used: Boolean(answer) || orderedSlugs.length > 0,
    };
  } catch (err) {
    console.error("Grok answer failed", err);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const started = Date.now();
  try {
    const { q } = (await req.json()) as { q?: string };
    const query = typeof q === "string" ? q.trim() : "";
    if (!query) return json({ error: "q required" }, 400);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);
    const c = extractConstraints(query);

    const ftsRows = await ftsSearch(supabase, query, c);
    const tools = await loadTools(
      supabase,
      ftsRows.map((r) => r.slug),
    );
    const bySlug = new Map(tools.map((t) => [t.slug, t]));

    const grokKey = await readSecret(supabase, ["GROK_API_KEY", "XAI_API_KEY"]);
    const model =
      Deno.env.get("GROK_MODEL") ??
      (await readSecret(supabase, ["GROK_MODEL"])) ??
      DEFAULT_MODEL;

    const llm = await maybeGrokAnswer(query, tools, c, grokKey, model);
    const source: "ai" | "fts" = llm?.used ? "ai" : "fts";

    const orderedSlugs =
      llm?.orderedSlugs?.length
        ? [
            ...llm.orderedSlugs,
            ...ftsRows.map((r) => r.slug).filter((s) => !llm.orderedSlugs.includes(s)),
          ]
        : ftsRows.map((r) => r.slug);

    const results = [];
    for (const slug of orderedSlugs) {
      const tool = bySlug.get(slug);
      if (!tool) continue;
      const rank = ftsRows.find((r) => r.slug === slug)?.rank ?? 0;
      results.push({
        slug: tool.slug,
        name: tool.name,
        summary: tool.summary,
        score: Math.max(1, Math.round(rank * 100)),
        reasons: groundedReasons(tool, c, llm?.reasonsBySlug?.[slug] ?? []),
      });
      if (results.length >= 6) break;
    }

    const answer =
      llm?.answer ||
      buildFallbackAnswer(
        query,
        results.map((r) => bySlug.get(r.slug)!).filter(Boolean),
      );

    await supabase.from("search_logs").insert({
      query,
      constraints: c,
      result_count: results.length,
      latency_ms: Date.now() - started,
      source,
    });

    return json({
      source,
      answer,
      intent: {
        query,
        constraints: c,
        provider: grokKey ? "grok" : null,
        model: grokKey ? model : null,
      },
      results,
    });
  } catch (err) {
    return json(
      { error: err instanceof Error ? err.message : "discover-search failed" },
      500,
    );
  }
});
