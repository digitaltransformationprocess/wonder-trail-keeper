import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const config = {
  maxDuration: 60,
};

const TRUSTED_HOSTS = [
  "techcrunch.com",
  "theverge.com",
  "reuters.com",
  "bloomberg.com",
  "wired.com",
  "arstechnica.com",
  "venturebeat.com",
  "axios.com",
  "semafor.com",
  "cnbc.com",
  "bbc.com",
  "bbc.co.uk",
  "ft.com",
  "wsj.com",
  "forbes.com",
  "nature.com",
  "science.org",
  "mit.edu",
  "openai.com",
  "anthropic.com",
  "blog.google",
  "deepmind.google",
  "deepmind.com",
  "ai.meta.com",
  "about.fb.com",
  "blogs.microsoft.com",
  "azure.microsoft.com",
  "news.microsoft.com",
  "aws.amazon.com",
  "nvidia.com",
  "huggingface.co",
  "cohere.com",
  "mistral.ai",
  "x.ai",
  "apple.com",
  "developer.apple.com",
];

const LISTING_PATH_HINTS = [
  "/news$",
  "/news/$",
  "/blog$",
  "/blog/$",
  "/tag/",
  "/tags/",
  "/category/",
  "/topics/",
  "/latest/?$",
  "/updates/?$",
  "/artificial-intelligence/?$",
  "/technology/artificial-intelligence/?$",
];

/** Cloud default. Local: FIRECRAWL_API_URL=http://127.0.0.1:3002 (+ firecrawl-local serve) */
function resolveFirecrawlBase() {
  let raw = (process.env.FIRECRAWL_API_URL || "https://api.firecrawl.dev/v2")
    .trim()
    .replace(/\/$/, "");
  if (/localhost|127\.0\.0\.1/i.test(raw) && !/\/v2$/i.test(raw)) {
    raw = `${raw}/v2`;
  }
  return raw;
}
const FIRECRAWL_BASE = resolveFirecrawlBase();
const FIRECRAWL_LOCAL = /localhost|127\.0\.0\.1/i.test(FIRECRAWL_BASE);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type, x-ingest-secret",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
  });
}

function env(name: string, ...alts: string[]) {
  for (const key of [name, ...alts]) {
    const v = process.env[key];
    if (v) return v;
  }
  return undefined;
}

function todayParis(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

function isTrusted(url: string): boolean {
  const host = hostOf(url);
  if (!host) return false;
  return TRUSTED_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
}

function looksLikeListing(url: string): boolean {
  try {
    const path = new URL(url).pathname.toLowerCase();
    if (path === "/" || path === "") return true;
    return LISTING_PATH_HINTS.some((re) => new RegExp(re, "i").test(path));
  } catch {
    return true;
  }
}

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error("Empty URL");
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const u = new URL(withProtocol);
  u.hash = "";
  u.hostname = u.hostname.toLowerCase();
  ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref", "fbclid", "gclid"].forEach(
    (k) => u.searchParams.delete(k),
  );
  let path = u.pathname.replace(/\/+$/, "");
  u.pathname = path || "/";
  if (u.pathname === "/") return `${u.origin}/`;
  return `${u.origin}${u.pathname}${u.search}`;
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

function inferKind(title: string, description: string, eventKind?: string): string {
  const t = `${title} ${description}`.toLowerCase();
  if (/pric|plan|billing|free tier|subscription/.test(t)) return "pricing";
  if (/v\d|version|update|upgrade|changelog|\d+\.\d+/.test(t)) return "version";
  if (/new tool|launches? a|introduces?|debut|arrives|added to/.test(t)) return "new_tool";
  if (/launch|releas|announce|introduc|unveil|generally available|ga\b/.test(t)) return "release";
  if (/acquisit|fund|rais|ipo|merger/.test(t)) return "business";
  if (eventKind && ["pricing", "release", "business", "news", "research"].includes(eventKind)) {
    return eventKind === "research" ? "news" : eventKind;
  }
  return "news";
}

function buildQueries(today: string): string[] {
  const sites = [
    "site:techcrunch.com",
    "site:theverge.com",
    "site:reuters.com",
    "site:bloomberg.com",
    "site:wired.com",
    "site:arstechnica.com",
    "site:venturebeat.com",
    "site:openai.com",
    "site:anthropic.com",
    "site:blog.google",
    "site:huggingface.co/blog",
    "site:nvidia.com",
  ];
  return [
    `(${sites.slice(0, 6).join(" OR ")}) AI (launch OR release OR announce OR model OR GPT OR Claude) after:${today}`,
    `(${sites.slice(6).join(" OR ")}) AI (launch OR release OR announce OR update) after:${today}`,
    `AI tool OR model launch announcement ${today}`,
    `"AI" (released OR launches OR unveils OR announces) ${today}`,
  ];
}

async function runtimeSecret(sb: SupabaseClient, key: string) {
  const fromEnv = process.env[key];
  if (fromEnv) return fromEnv;
  const { data, error } = await sb.from("runtime_secrets").select("value").eq("key", key).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.value) throw new Error(`${key} secret is not set`);
  return data.value as string;
}

async function firecrawlKey(sb: SupabaseClient) {
  return runtimeSecret(sb, "FIRECRAWL_API_KEY");
}

async function firecrawlHeaders(sb: SupabaseClient): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (FIRECRAWL_LOCAL) {
    const token = process.env.FIRECRAWL_LOCAL_TOKEN || process.env.FIRECRAWL_API_KEY;
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }
  headers.Authorization = `Bearer ${await firecrawlKey(sb)}`;
  return headers;
}

type SearchHit = { url: string; title?: string; description?: string };

async function searchNews(
  query: string,
  limit: number,
  sb: SupabaseClient,
): Promise<SearchHit[]> {
  const res = await fetch(`${FIRECRAWL_BASE}/search`, {
    method: "POST",
    headers: await firecrawlHeaders(sb),
    body: JSON.stringify({ query, limit, tbs: "qdr:d" }),
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

async function scrapeNewsArticle(url: string, sb: SupabaseClient) {
  const formats: unknown[] = ["markdown"];
  // Firecrawl Local skips json extract — cloud only.
  if (!FIRECRAWL_LOCAL) {
    formats.push({
      type: "json",
      prompt:
        "Extract facts from this AI / tech news page. Only use facts on the page. published_date YYYY-MM-DD if visible. is_article=false for listings. product_names max 5. summary 1-2 sentences.",
      schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          published_date: { type: "string" },
          summary: { type: "string" },
          product_names: { type: "array", items: { type: "string" } },
          is_article: { type: "boolean" },
          event_kind: {
            type: "string",
            enum: ["release", "pricing", "business", "research", "news"],
          },
        },
        required: ["title", "summary", "is_article"],
      },
    });
  }
  const res = await fetch(`${FIRECRAWL_BASE}/scrape`, {
    method: "POST",
    headers: await firecrawlHeaders(sb),
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
  let extracted = (data?.json ?? data?.extract ?? {}) as Record<string, unknown>;
  if ((!extracted || !extracted.title) && markdown) {
    const lines = markdown.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const h1 = lines.find((l) => /^#\s+/.test(l))?.replace(/^#\s+/, "") ?? "";
    const paras = lines.filter((l) => !/^#/.test(l) && !/^[-*|]/.test(l));
    const summary = paras.slice(0, 2).join(" ").slice(0, 400) || h1;
    const dateHit = markdown.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
    extracted = {
      title: h1 || summary.slice(0, 120),
      summary,
      is_article: true,
      published_date: dateHit?.[1],
    };
  }
  return {
    title: extracted.title ? String(extracted.title) : undefined,
    published_date: extracted.published_date
      ? String(extracted.published_date).slice(0, 10)
      : undefined,
    summary: extracted.summary ? String(extracted.summary) : undefined,
    product_names: Array.isArray(extracted.product_names)
      ? extracted.product_names.map(String).slice(0, 5)
      : undefined,
    is_article: typeof extracted.is_article === "boolean" ? extracted.is_article : undefined,
    event_kind: extracted.event_kind ? String(extracted.event_kind) : undefined,
    markdown,
  };
}

async function reformulateNews(
  sb: SupabaseClient,
  input: {
    title: string;
    summary: string;
    markdown: string | null;
    source_url: string;
    product_names?: string[];
  },
) {
  let grokKey: string | null = null;
  try {
    grokKey = await runtimeSecret(sb, "GROK_API_KEY");
  } catch {
    try {
      grokKey = await runtimeSecret(sb, "XAI_API_KEY");
    } catch {
      return null;
    }
  }
  let model = process.env.GROK_MODEL;
  if (!model) {
    try {
      model = await runtimeSecret(sb, "GROK_MODEL");
    } catch {
      model = "grok-4.20-0309-non-reasoning";
    }
  }

  const system = [
    "You are an editor for AI Discov Blog — product posts like a tool review / release note.",
    "Rewrite the source into a clear blog article about an AI tool, model, version, launch, or pricing change.",
    "HARD RULES:",
    "1) Use ONLY facts present in the provided source text. Never invent prices, benchmarks, or features.",
    "2) Prefer concrete product names, version numbers, pricing, and capabilities when present.",
    "3) Neutral, practical tone — no hype, no affiliate CTA spam.",
    "4) Reply in English.",
    "5) body must use markdown sections with ## headings.",
    "OUTPUT ONLY valid JSON:",
    '{"title":"specific headline with product + angle, max 110 chars","summary":"lead paragraph 1-3 sentences max 360 chars","body":"markdown blog body"}',
  ].join("\n");

  const excerpt = (input.markdown ?? input.summary).slice(0, 9000);
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${grokKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.25,
      max_tokens: 1400,
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: JSON.stringify({
            source_url: input.source_url,
            source_title: input.title,
            source_summary: input.summary,
            products: input.product_names ?? [],
            article_excerpt: excerpt,
          }),
        },
      ],
    }),
  });
  if (!res.ok) return null;
  const body = await res.json();
  const content = body?.choices?.[0]?.message?.content;
  if (typeof content !== "string") return null;
  const match = content.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]) as { title?: string; summary?: string; body?: string };
    const title = (parsed.title ?? "").trim().slice(0, 180);
    const summary = (parsed.summary ?? "").trim().slice(0, 500);
    const articleBody = (parsed.body ?? "").trim().slice(0, 8000);
    if (!title || !summary) return null;
    return { title, summary, body: articleBody || summary };
  } catch {
    return null;
  }
}

async function matchSolutionSlug(
  sb: SupabaseClient,
  productNames: string[] | undefined,
  text: string,
) {
  const { data: tools } = await sb.from("tools").select("slug,name").eq("status", "published").limit(800);
  if (!tools?.length) return null;
  const hay = `${(productNames ?? []).join(" ")} ${text}`.toLowerCase();
  let best: { slug: string; score: number } | null = null;
  for (const t of tools) {
    const name = String(t.name ?? "").toLowerCase();
    const slug = String(t.slug ?? "");
    if (!name || name.length < 3) continue;
    if (hay.includes(name) || hay.includes(slug.replace(/-/g, " "))) {
      const score = name.length;
      if (!best || score > best.score) best = { slug, score };
    }
  }
  return best?.slug ?? null;
}

async function requireStaff(authHeader: string | null) {
  if (!authHeader) throw new Error("Missing Authorization header");
  const url = env("SUPABASE_URL", "VITE_SUPABASE_URL");
  const anon = env(
    "SUPABASE_ANON_KEY",
    "VITE_SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_PUBLISHABLE_KEY",
  );
  const serviceKey = env("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY");
  if (!url || !anon || !serviceKey) {
    throw new Error("Missing Supabase env on server (URL / anon / service key)");
  }

  const userSb = createClient(url, anon, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error: userError } = await userSb.auth.getUser();
  if (userError || !userData.user) throw new Error("Unauthorized");

  const { data: profile, error: profileError } = await userSb
    .from("profiles")
    .select("id, role, email")
    .eq("id", userData.user.id)
    .maybeSingle();
  if (profileError) throw new Error(profileError.message);
  if (!profile || !["editor", "admin", "owner"].includes(profile.role)) {
    throw new Error("Forbidden: staff role required");
  }

  const service = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return { service, profile };
}

export default async function handler(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type, x-ingest-secret",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  try {
    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

    const body = (await req.json().catch(() => ({}))) as {
      publish?: boolean;
      limit?: number;
      days?: number;
    };
    const publish = Boolean(body.publish);
    const limit = Math.max(1, Math.min(Number(body.limit ?? 12), 20));
    const daysWindow = Math.max(1, Math.min(Number(body.days ?? 7), 21));

    const cronHeader = req.headers.get("x-ingest-secret");
    let supabase: SupabaseClient;

    if (cronHeader) {
      const url = env("SUPABASE_URL", "VITE_SUPABASE_URL");
      const serviceKey = env("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY");
      if (!url || !serviceKey) throw new Error("Missing Supabase service env");
      supabase = createClient(url, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const expected = await runtimeSecret(supabase, "INGEST_CRON_SECRET");
      if (cronHeader !== expected) throw new Error("Invalid cron secret");
    } else {
      const auth = await requireStaff(req.headers.get("Authorization"));
      supabase = auth.service;
    }

    const today = todayParis();
    const allowedDates = new Set<string>();
    for (let i = 0; i < daysWindow; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      allowedDates.add(
        new Intl.DateTimeFormat("en-CA", {
          timeZone: "Europe/Paris",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(d),
      );
    }

    const queries = buildQueries(today);
    const hits: SearchHit[] = [];
    for (const query of queries) {
      try {
        hits.push(...(await searchNews(query, 6, supabase)));
      } catch (err) {
        console.error("search failed", query, err);
      }
    }

    const unique = new Map<string, SearchHit>();
    let untrusted = 0;
    let listing = 0;
    for (const hit of hits) {
      if (!hit.url) continue;
      try {
        const normalized = normalizeUrl(hit.url);
        if (!isTrusted(normalized)) {
          untrusted += 1;
          continue;
        }
        if (looksLikeListing(normalized)) {
          listing += 1;
          continue;
        }
        const key = normalized.replace(/\/+$/, "").toLowerCase();
        if (!unique.has(key)) unique.set(key, { ...hit, url: normalized });
      } catch {
        untrusted += 1;
      }
    }

    const candidates = [...unique.values()].slice(0, limit);
    let created = 0;
    let skipped = 0;
    let stale = 0;
    let errors = 0;
    let reformulated = 0;
    const results: Array<{ url: string; status: string; id?: string; error?: string }> = [];

    for (const hit of candidates) {
      try {
        const { data: existing } = await supabase
          .from("news_items")
          .select("id")
          .eq("source_url", hit.url)
          .maybeSingle();
        if (existing) {
          skipped += 1;
          results.push({ url: hit.url, status: "exists", id: existing.id });
          continue;
        }

        const scraped = await scrapeNewsArticle(hit.url, supabase);
        if (scraped.is_article === false || looksLikeListing(hit.url)) {
          listing += 1;
          results.push({ url: hit.url, status: "listing" });
          continue;
        }

        const articleDate = scraped.published_date?.slice(0, 10);
        if (articleDate && !allowedDates.has(articleDate)) {
          stale += 1;
          results.push({ url: hit.url, status: "stale", error: `published ${articleDate}` });
          continue;
        }

        const rawTitle = (scraped.title || hit.title || hostOf(hit.url) || "AI update")
          .trim()
          .slice(0, 180);
        const rawSummary = (scraped.summary || hit.description || rawTitle).trim().slice(0, 400);

        const rewritten = await reformulateNews(supabase, {
          title: rawTitle,
          summary: rawSummary,
          markdown: scraped.markdown,
          source_url: hit.url,
          product_names: scraped.product_names,
        });
        if (rewritten) reformulated += 1;

        const title = (rewritten?.title || rawTitle).slice(0, 180);
        const summary = (rewritten?.summary || rawSummary).slice(0, 400);
        const articleBody = rewritten?.body || scraped.markdown?.slice(0, 2500) || null;

        let slug = slugify(title) || slugify(hostOf(hit.url) || "news");
        if (slug) {
          const { data: clash } = await supabase
            .from("news_items")
            .select("id")
            .eq("slug", slug)
            .maybeSingle();
          if (clash) slug = `${slug}-${crypto.randomUUID().slice(0, 6)}`;
        }

        const solutionSlug = await matchSolutionSlug(
          supabase,
          scraped.product_names,
          `${title} ${summary}`,
        );

        const publishedAt = articleDate || today;
        const { data: row, error } = await supabase
          .from("news_items")
          .insert({
            title,
            slug: slug || null,
            summary,
            body: articleBody,
            kind: inferKind(title, summary, scraped.event_kind),
            event_type: rewritten ? "discovered_reformulated" : "discovered",
            published_at: publishedAt,
            source_url: hit.url,
            solution_slug: solutionSlug,
            status: publish ? "published" : "draft",
          })
          .select("id")
          .single();
        if (error) throw new Error(error.message);

        if (solutionSlug && row?.id) {
          const { data: tool } = await supabase
            .from("tools")
            .select("id")
            .eq("slug", solutionSlug)
            .maybeSingle();
          if (tool?.id) {
            await supabase.from("news_tool_links").upsert({
              news_item_id: row.id,
              tool_id: tool.id,
            });
          }
        }

        created += 1;
        results.push({
          url: hit.url,
          status: publish ? "published" : "draft",
          id: row.id,
        });
      } catch (err) {
        errors += 1;
        results.push({
          url: hit.url,
          status: "error",
          error: err instanceof Error ? err.message : "failed",
        });
      }
    }

    return json({
      ok: true,
      stats: {
        day: today,
        days_window: daysWindow,
        searched_queries: queries.length,
        urls_found: hits.length,
        considered: candidates.length,
        created,
        skipped,
        stale,
        untrusted,
        listing,
        reformulated,
        errors,
        status: publish ? "published" : "draft",
        via: "vercel-api",
      },
      results,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "discover-news failed";
    const status =
      message.includes("Invalid cron") || message.includes("Forbidden")
        ? 403
        : message.includes("Unauthorized")
          ? 401
          : 500;
    return json({ error: message }, status);
  }
}
