import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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
  // Deduplicate while preserving order
  const seen = new Set<string>();
  return out.filter((x) => {
    if (seen.has(x)) return false;
    seen.add(x);
    return true;
  }).slice(0, 3);
}

async function ftsSearch(
  supabase: ReturnType<typeof createClient>,
  q: string,
  c: Constraints,
) {
  const { data, error } = await supabase.rpc("search_published_tools", {
    q,
    want_free: c.free,
    want_oss: c.openSource,
    want_api: c.api,
    want_local: c.local,
    result_limit: 8,
  });
  if (error) throw new Error(error.message);
  return (data ?? []) as Array<{ id: string; slug: string; name: string; summary: string; rank: number }>;
}

async function loadTools(
  supabase: ReturnType<typeof createClient>,
  slugs: string[],
): Promise<ToolRow[]> {
  if (!slugs.length) return [];
  const { data, error } = await supabase
    .from("tools")
    .select(
      "id, slug, name, summary, description, pricing_model, open_source, api_available, local_available, keywords, strengths, limits",
    )
    .eq("status", "published")
    .in("slug", slugs);
  if (error) throw new Error(error.message);
  return (data ?? []) as ToolRow[];
}

async function maybeLlmRerank(
  q: string,
  tools: ToolRow[],
  c: Constraints,
  openaiKey: string | null,
): Promise<{ reasonsBySlug: Record<string, string[]>; used: boolean } | null> {
  if (!openaiKey || tools.length === 0) return null;

  const catalog = tools.map((t) => ({
    slug: t.slug,
    name: t.name,
    summary: t.summary,
    description: t.description?.slice(0, 400) ?? "",
    pricing_model: t.pricing_model,
    open_source: t.open_source,
    api_available: t.api_available,
    local_available: t.local_available,
    keywords: (t.keywords ?? []).slice(0, 8),
    strengths: (t.strengths ?? []).slice(0, 4),
    limits: (t.limits ?? []).slice(0, 3),
  }));

  const system =
    "You match user needs to AI catalog tools. Use ONLY fields provided. Never invent prices, features, or claims. Return JSON {results:[{slug, reasons:string[]}]}. reasons must quote or paraphrase catalog fields only. Max 6 results, max 2 reasons each.";

  const user = JSON.stringify({ query: q, constraints: c, catalog });

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) return null;
    const body = await res.json();
    const content = body?.choices?.[0]?.message?.content;
    if (typeof content !== "string") return null;
    const parsed = JSON.parse(content) as {
      results?: Array<{ slug?: string; reasons?: string[] }>;
    };
    const allowed = new Set(tools.map((t) => t.slug));
    const reasonsBySlug: Record<string, string[]> = {};
    for (const row of parsed.results ?? []) {
      if (!row.slug || !allowed.has(row.slug)) continue;
      reasonsBySlug[row.slug] = (row.reasons ?? [])
        .filter((r) => typeof r === "string" && r.trim())
        .slice(0, 2);
    }
    return { reasonsBySlug, used: Object.keys(reasonsBySlug).length > 0 };
  } catch {
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

    let openaiKey: string | null = Deno.env.get("OPENAI_API_KEY") ?? null;
    if (!openaiKey) {
      const { data } = await supabase
        .from("runtime_secrets")
        .select("value")
        .eq("key", "OPENAI_API_KEY")
        .maybeSingle();
      openaiKey = data?.value ?? null;
    }

    const llm = await maybeLlmRerank(query, tools, c, openaiKey);
    const source: "ai" | "fts" = llm?.used ? "ai" : "fts";

    const orderedSlugs =
      llm?.used && Object.keys(llm.reasonsBySlug).length
        ? [
            ...Object.keys(llm.reasonsBySlug),
            ...ftsRows.map((r) => r.slug).filter((s) => !llm.reasonsBySlug[s]),
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

    await supabase.from("search_logs").insert({
      query,
      constraints: c,
      result_count: results.length,
      latency_ms: Date.now() - started,
      source,
    });

    return json({
      source,
      intent: { query, constraints: c },
      results,
    });
  } catch (err) {
    return json(
      { error: err instanceof Error ? err.message : "discover-search failed" },
      500,
    );
  }
});
