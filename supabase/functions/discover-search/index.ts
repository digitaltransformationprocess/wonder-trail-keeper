import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DEFAULT_CHAT_MODEL = "grok-4.20-0309-non-reasoning";
const DEFAULT_EMBED_MODEL = "text-embedding-3-small";
const DEFAULT_EMBED_BASE = "https://api.openai.com/v1";
const RRF_K = 60;

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
  last_verified_at: string | null;
};

type FtsRow = { id: string; slug: string; name: string; summary: string; rank: number };
type SemRow = { id: string; slug: string; name: string; summary: string; distance: number };

const STOP = new Set([
  "the", "and", "for", "with", "from", "that", "this", "are", "was", "were", "have", "has",
  "une", "des", "les", "pour", "avec", "dans", "que", "qui", "sur", "pas", "plus", "mon",
  "ma", "mes", "un", "du", "de", "la", "le", "je", "tu", "il", "nous", "vous", "cherche",
  "trouver", "besoin", "veux", "voudrais", "quelque", "chose", "outil", "outils", "aide",
]);

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

/** Drop constraint words from FTS text — they are applied as SQL filters. */
function lexicalQuery(q: string): string {
  return q
    .replace(
      /\b(free|gratuit|gratuite|gratuitement|sans payer|open[\s-]?source|libre|api|local|offline|hors[\s-]?ligne|self[\s-]?host)\b/gi,
      " ",
    )
    .replace(/\s+/g, " ")
    .trim();
}

async function ftsSearch(
  supabase: ReturnType<typeof createClient>,
  q: string,
  c: Constraints,
): Promise<FtsRow[]> {
  const attempts = [
    lexicalQuery(q) || q,
    expandQuery(lexicalQuery(q) || q),
    // Empty q → constraint-only catalog slice (see search_published_tools)
    Object.values(c).some(Boolean) ? "" : null,
  ].filter((v, i, arr): v is string => v != null && arr.indexOf(v) === i);

  let rows: FtsRow[] = [];
  for (const attempt of attempts) {
    const { data, error } = await supabase.rpc("search_published_tools", {
      q: attempt,
      want_free: c.free,
      want_oss: c.openSource,
      want_api: c.api,
      want_local: c.local,
      result_limit: 50,
    });
    if (error) throw new Error(error.message);
    rows = (data ?? []) as FtsRow[];
    if (rows.length) return rows;
  }
  return rows;
}

async function embedQuery(
  supabase: ReturnType<typeof createClient>,
  text: string,
): Promise<{ embedding: number[]; model: string } | null> {
  const apiKey = await readSecret(supabase, [
    "EMBEDDING_API_KEY",
    "OPENAI_API_KEY",
    "XAI_API_KEY",
    "GROK_API_KEY",
  ]);
  if (!apiKey) return null;

  const model =
    Deno.env.get("EMBEDDING_MODEL") ??
    (await readSecret(supabase, ["EMBEDDING_MODEL"])) ??
    DEFAULT_EMBED_MODEL;
  const base =
    (Deno.env.get("EMBEDDING_BASE_URL") ??
      (await readSecret(supabase, ["EMBEDDING_BASE_URL"])) ??
      DEFAULT_EMBED_BASE).replace(/\/$/, "");

  try {
    const res = await fetch(`${base}/embeddings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model, input: text.slice(0, 8000) }),
    });
    if (!res.ok) {
      console.error("Embedding API error", res.status, await res.text());
      return null;
    }
    const body = await res.json();
    const embedding = body?.data?.[0]?.embedding;
    if (!Array.isArray(embedding) || embedding.length !== 1536) {
      console.error("Unexpected embedding dimensions", embedding?.length);
      return null;
    }
    return { embedding: embedding as number[], model };
  } catch (err) {
    console.error("embedQuery failed", err);
    return null;
  }
}

async function semanticSearch(
  supabase: ReturnType<typeof createClient>,
  embedding: number[],
  c: Constraints,
): Promise<SemRow[]> {
  const { data, error } = await supabase.rpc("search_published_tools_semantic", {
    query_embedding: embedding as unknown as string,
    want_free: c.free,
    want_oss: c.openSource,
    want_api: c.api,
    want_local: c.local,
    result_limit: 50,
  });
  if (error) {
    console.error("semantic search failed", error.message);
    return [];
  }
  return (data ?? []) as SemRow[];
}

/** Reciprocal rank fusion of FTS + semantic slug lists. */
function hybridMerge(fts: FtsRow[], sem: SemRow[]): Array<{ slug: string; rrf: number; ftsRank: number; semDistance: number | null }> {
  const scores = new Map<string, { rrf: number; ftsRank: number; semDistance: number | null }>();

  fts.forEach((row, i) => {
    const cur = scores.get(row.slug) ?? { rrf: 0, ftsRank: 0, semDistance: null };
    cur.rrf += 1 / (RRF_K + i + 1);
    cur.ftsRank = row.rank ?? 0;
    scores.set(row.slug, cur);
  });
  sem.forEach((row, i) => {
    const cur = scores.get(row.slug) ?? { rrf: 0, ftsRank: 0, semDistance: null };
    cur.rrf += 1 / (RRF_K + i + 1);
    cur.semDistance = row.distance;
    scores.set(row.slug, cur);
  });

  return [...scores.entries()]
    .map(([slug, v]) => ({ slug, ...v }))
    .sort((a, b) => b.rrf - a.rrf);
}

async function loadTools(
  supabase: ReturnType<typeof createClient>,
  slugs: string[],
): Promise<ToolRow[]> {
  if (!slugs.length) return [];
  const { data, error } = await supabase
    .from("tools")
    .select(
      "id, slug, name, summary, description, pricing_model, price_display, open_source, api_available, local_available, keywords, strengths, limits, last_verified_at",
    )
    .eq("status", "published")
    .in("slug", slugs);
  if (error) throw new Error(error.message);
  return (data ?? []) as ToolRow[];
}

async function loadEvidence(
  supabase: ReturnType<typeof createClient>,
  toolIds: string[],
): Promise<Map<string, string[]>> {
  const out = new Map<string, string[]>();
  if (!toolIds.length) return out;
  const { data } = await supabase
    .from("tool_sources")
    .select("tool_id, claim_key, sources ( url, reliability_level )")
    .in("tool_id", toolIds);
  for (const row of data ?? []) {
    const src = row.sources as { url: string; reliability_level: string } | null;
    if (!src?.url) continue;
    const list = out.get(row.tool_id) ?? [];
    list.push(`${src.reliability_level}:${row.claim_key}:${src.url}`);
    out.set(row.tool_id, list.slice(0, 4));
  }
  return out;
}

function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const t = Date.parse(dateStr);
  if (Number.isNaN(t)) return null;
  return Math.max(0, (Date.now() - t) / (1000 * 60 * 60 * 24));
}

/** Weighted score: need 40%, features 25%, price 15%, compat 10%, freshness 10%. */
function weightedScore(
  tool: ToolRow,
  c: Constraints,
  hybrid: { rrf: number; ftsRank: number; semDistance: number | null },
  queryTokens: string[],
): { score: number; confidence: "high" | "medium" | "low"; matchReasons: string[]; tradeoffs: string[] } {
  const need = Math.min(1, hybrid.rrf * 20 + (hybrid.ftsRank ?? 0) * 2 + (hybrid.semDistance != null ? Math.max(0, 1 - hybrid.semDistance) * 0.5 : 0));

  const hay = [
    tool.name,
    tool.summary,
    tool.description,
    ...(tool.keywords ?? []),
    ...(tool.strengths ?? []),
  ]
    .join(" ")
    .toLowerCase();
  const featureHits = queryTokens.filter((w) => hay.includes(w)).length;
  const features = Math.min(1, featureHits / Math.max(3, queryTokens.length || 1));

  let price = 0.5;
  if (c.free) {
    price = ["Free", "Freemium", "Open source"].includes(tool.pricing_model ?? "") ? 1 : 0.1;
  } else if (tool.pricing_model && tool.pricing_model !== "Not disclosed") {
    price = 0.7;
  }

  let compat = 0.5;
  let compatHits = 0;
  let compatNeed = 0;
  if (c.openSource) {
    compatNeed += 1;
    if (tool.open_source) compatHits += 1;
  }
  if (c.api) {
    compatNeed += 1;
    if (tool.api_available === true) compatHits += 1;
  }
  if (c.local) {
    compatNeed += 1;
    if (tool.local_available) compatHits += 1;
  }
  if (compatNeed > 0) compat = compatHits / compatNeed;

  const age = daysSince(tool.last_verified_at);
  const freshness = age == null ? 0.35 : age <= 30 ? 1 : age <= 90 ? 0.7 : age <= 180 ? 0.45 : 0.2;

  const score =
    0.4 * need + 0.25 * features + 0.15 * price + 0.1 * compat + 0.1 * freshness;

  const matchReasons: string[] = [];
  if (tool.summary) matchReasons.push(tool.summary);
  if (c.free && ["Free", "Freemium", "Open source"].includes(tool.pricing_model ?? "")) {
    matchReasons.push(`Pricing model: ${tool.pricing_model}`);
  }
  if (c.openSource && tool.open_source) matchReasons.push("Open source");
  if (c.api && tool.api_available) matchReasons.push("API available");
  if (c.local && tool.local_available) matchReasons.push("Runs locally");
  for (const s of (tool.strengths ?? []).slice(0, 1)) matchReasons.push(s);

  const tradeoffs = (tool.limits ?? []).filter(Boolean).slice(0, 2);
  if (!tool.last_verified_at) tradeoffs.push("Verification date unknown");
  if (tool.api_available == null && c.api) tradeoffs.push("API availability not disclosed");

  const confidence: "high" | "medium" | "low" =
    score >= 0.65 && tool.last_verified_at ? "high" : score >= 0.4 ? "medium" : "low";

  return {
    score: Math.round(score * 100),
    confidence,
    matchReasons: [...new Set(matchReasons)].slice(0, 3),
    tradeoffs: [...new Set(tradeoffs)].slice(0, 3),
  };
}

function clarificationFor(q: string, c: Constraints): { needed: boolean; question: string | null } {
  const words = q
    .toLowerCase()
    .split(/[^a-zà-ÿ0-9]+/i)
    .filter((w) => w.length > 2 && !STOP.has(w));
  const hasConstraint = Object.values(c).some(Boolean);
  if (words.length <= 2 && !hasConstraint) {
    return {
      needed: true,
      question:
        "Do you need it free, open source, with an API, or running locally? That will narrow the catalog match.",
    };
  }
  if (/enterprise|sso|hipaa|gdpr|on.?prem/i.test(q) && !hasConstraint) {
    return {
      needed: true,
      question:
        "Should I prioritize compliance (SSO/GDPR), self-hosting, or budget constraints?",
    };
  }
  return { needed: false, question: null };
}

function extractJsonObject(content: string): unknown {
  const trimmed = content.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(trimmed.slice(start, end + 1));
    throw new Error("No JSON object in model response");
  }
}

function buildFallbackAnswer(q: string, tools: ToolRow[]): string {
  if (!tools.length) {
    return `I couldn’t find a solid match in the verified catalog for “${q}”. Try rephrasing, or loosen constraints like free / open source / API / local.`;
  }
  const names = tools.slice(0, 3).map((t) => t.name);
  const lead =
    names.length === 1
      ? `${names[0]} looks like the closest catalog match`
      : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]} look like the closest catalog matches`;
  return `${lead} for “${q}”. Recommendations use only published catalog fields — missing data stays “To verify”.`;
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
    description: (t.description ?? "").slice(0, 220),
    pricing_model: t.pricing_model,
    price_display: t.price_display,
    open_source: t.open_source,
    api_available: t.api_available,
    local_available: t.local_available,
    keywords: (t.keywords ?? []).slice(0, 6),
    strengths: (t.strengths ?? []).slice(0, 3),
    limits: (t.limits ?? []).slice(0, 2),
    last_verified_at: t.last_verified_at,
  }));

  const allowedSlugs = catalog.map((t) => t.slug);
  const system = [
    "You are the AI Discovery assistant for a verified AI-tools catalog.",
    "Reply in the same language as the user query.",
    "HARD GUARDRAILS:",
    "1) Use ONLY the provided catalog JSON. Never invent tools, prices, features, integrations, or URLs.",
    "2) If a field is missing/null/To verify, say it is unverified — do not guess.",
    "3) Only recommend tools from the catalog list.",
    "OUTPUT: return ONLY valid JSON:",
    '{"answer":"2-4 short sentences","results":[{"slug":"...","reasons":["..."],"tradeoffs":["..."]}]}',
    "results: rank all relevant allowed slugs (no artificial max of 5), max 2 reasons and 1 tradeoff each.",
    `Allowed slugs: ${allowedSlugs.join(", ")}`,
  ].join("\n");

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
        max_tokens: 900,
        messages: [
          { role: "system", content: system },
          { role: "user", content: JSON.stringify({ query: q, constraints: c, catalog }) },
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
      results?: Array<{ slug?: string; reasons?: string[]; tradeoffs?: string[] }>;
    };

    const allowed = new Set(allowedSlugs);
    const reasonsBySlug: Record<string, string[]> = {};
    const orderedSlugs: string[] = [];
    for (const row of parsed.results ?? []) {
      if (!row.slug || !allowed.has(row.slug) || orderedSlugs.includes(row.slug)) continue;
      orderedSlugs.push(row.slug);
      reasonsBySlug[row.slug] = [
        ...(row.reasons ?? []),
        ...(row.tradeoffs ?? []).map((t) => `Tradeoff: ${t}`),
      ]
        .filter((r) => typeof r === "string" && r.trim())
        .slice(0, 3);
    }

    const answer = (typeof parsed.answer === "string" ? parsed.answer : "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 900);

    return {
      answer: answer || buildFallbackAnswer(q, tools),
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
    const clarification = clarificationFor(query, c);
    const queryTokens = expandQuery(query).split(/\s+/).filter(Boolean);

    const ftsRows = await ftsSearch(supabase, query, c);
    const embedded = await embedQuery(supabase, query);
    const semRows = embedded
      ? await semanticSearch(supabase, embedded.embedding, c)
      : [];

    const hybrid = hybridMerge(ftsRows, semRows);
    const candidateSlugs = hybrid.map((h) => h.slug);
    const tools = await loadTools(supabase, candidateSlugs);
    const bySlug = new Map(tools.map((t) => [t.slug, t]));
    const evidenceByTool = await loadEvidence(
      supabase,
      tools.map((t) => t.id),
    );
    const hybridBySlug = new Map(hybrid.map((h) => [h.slug, h]));

    const grokKey = await readSecret(supabase, ["GROK_API_KEY", "XAI_API_KEY"]);
    const model =
      Deno.env.get("GROK_MODEL") ??
      (await readSecret(supabase, ["GROK_MODEL"])) ??
      DEFAULT_CHAT_MODEL;

    const llm = await maybeGrokAnswer(query, tools, c, grokKey, model);
    const source: "ai" | "hybrid" | "fts" = llm?.used
      ? "ai"
      : semRows.length
        ? "hybrid"
        : "fts";

    const orderedSlugs = llm?.orderedSlugs?.length
      ? [
          ...llm.orderedSlugs,
          ...candidateSlugs.filter((s) => !llm.orderedSlugs.includes(s)),
        ]
      : candidateSlugs;

    const results = [];
    for (const slug of orderedSlugs) {
      const tool = bySlug.get(slug);
      if (!tool) continue;
      const h = hybridBySlug.get(slug) ?? { rrf: 0, ftsRank: 0, semDistance: null };
      const scored = weightedScore(tool, c, h, queryTokens);
      const llmReasons = (llm?.reasonsBySlug?.[slug] ?? []).filter(
        (r) => !r.startsWith("Tradeoff:"),
      );
      const llmTradeoffs = (llm?.reasonsBySlug?.[slug] ?? [])
        .filter((r) => r.startsWith("Tradeoff:"))
        .map((r) => r.replace(/^Tradeoff:\s*/, ""));

      results.push({
        slug: tool.slug,
        name: tool.name,
        summary: tool.summary,
        score: scored.score,
        reasons: [...new Set([...llmReasons, ...scored.matchReasons])].slice(0, 3),
        match_reason: [...new Set([...llmReasons, ...scored.matchReasons])].slice(0, 3),
        tradeoffs: [...new Set([...llmTradeoffs, ...scored.tradeoffs])].slice(0, 3),
        confidence: scored.confidence,
        evidence: evidenceByTool.get(tool.id) ?? [],
      });
    }

    const answer =
      llm?.answer ||
      buildFallbackAnswer(
        query,
        results.map((r) => bySlug.get(r.slug)!).filter(Boolean),
      );

    const coverage_note = results.length
      ? `Scoring: need 40% · features 25% · price 15% · compatibility 10% · freshness 10%. ${
          embedded ? "Hybrid FTS+semantic recall." : "FTS recall (embeddings unavailable)."
        }`
      : "No published catalog match under current constraints.";

    await supabase.from("search_logs").insert({
      query,
      constraints: { ...c, clarification_needed: clarification.needed, semantic: Boolean(embedded) },
      result_count: results.length,
      latency_ms: Date.now() - started,
      source,
    });

    return json({
      source,
      answer,
      interpreted_need: query,
      constraints: c,
      clarification_needed: clarification.needed,
      clarification_question: clarification.question,
      coverage_note,
      intent: {
        query,
        constraints: c,
        provider: grokKey ? "grok" : null,
        model: grokKey ? model : null,
        embedding_model: embedded?.model ?? null,
        retrieval: semRows.length ? "hybrid" : "fts",
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
