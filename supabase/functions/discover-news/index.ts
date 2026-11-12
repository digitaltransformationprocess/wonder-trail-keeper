import { corsHeaders, jsonResponse } from "./_shared/cors.ts";
import { scrapeNewsArticle, searchNewTools } from "./_shared/firecrawl.ts";
import { normalizeUrl, slugify } from "./_shared/normalize.ts";
import { assertCronSecret, requireStaff, serviceClient } from "./_shared/supabase.ts";
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

/** Recognized / reliable AI & tech news publishers */
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
    const u = new URL(url);
    const path = u.pathname.toLowerCase();
    if (path === "/" || path === "") return true;
    return LISTING_PATH_HINTS.some((re) => new RegExp(re, "i").test(path));
  } catch {
    return true;
  }
}

function inferKind(title: string, description: string, eventKind?: string): string {
  if (eventKind && ["pricing", "release", "business", "news", "research"].includes(eventKind)) {
    return eventKind === "research" ? "news" : eventKind;
  }
  const t = `${title} ${description}`.toLowerCase();
  if (/pric|plan|billing|free tier/.test(t)) return "pricing";
  if (/launch|releas|announce|introduc|unveil/.test(t)) return "release";
  if (/acquisit|fund|rais|ipo/.test(t)) return "business";
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

async function readSecret(supabase: SupabaseClient, keys: string[]): Promise<string | null> {
  for (const key of keys) {
    const fromEnv = Deno.env.get(key);
    if (fromEnv) return fromEnv;
  }
  for (const key of keys) {
    const { data } = await supabase.from("runtime_secrets").select("value").eq("key", key).maybeSingle();
    if (data?.value) return data.value as string;
  }
  return null;
}

async function reformulateNews(
  supabase: SupabaseClient,
  input: {
    title: string;
    summary: string;
    markdown: string | null;
    source_url: string;
    product_names?: string[];
  },
): Promise<{ title: string; summary: string; body: string } | null> {
  const grokKey = await readSecret(supabase, ["GROK_API_KEY", "XAI_API_KEY"]);
  if (!grokKey) return null;
  const model =
    Deno.env.get("GROK_MODEL") ??
    (await readSecret(supabase, ["GROK_MODEL"])) ??
    "grok-4.20-0309-non-reasoning";

  const system = [
    "You are an editor for an AI Discovery catalog (Latest news).",
    "Rewrite the source article into a short, neutral product-news item.",
    "HARD RULES:",
    "1) Use ONLY facts present in the provided source text. Never invent.",
    "2) Focus on AI tools, models, APIs, agents, or platforms when possible.",
    "3) No hype, no affiliate tone, no speculation.",
    "4) Reply in English.",
    "OUTPUT ONLY valid JSON:",
    '{"title":"max 90 chars","summary":"1-2 sentences max 280 chars","body":"2-4 short paragraphs"}',
  ].join("\n");

  const excerpt = (input.markdown ?? input.summary).slice(0, 6000);
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${grokKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 700,
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

  if (!res.ok) {
    console.error("Grok reformulate failed", res.status, await res.text());
    return null;
  }
  const body = await res.json();
  const content = body?.choices?.[0]?.message?.content;
  if (typeof content !== "string") return null;

  const match = content.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]) as { title?: string; summary?: string; body?: string };
    const title = (parsed.title ?? "").trim().slice(0, 180);
    const summary = (parsed.summary ?? "").trim().slice(0, 400);
    const articleBody = (parsed.body ?? "").trim().slice(0, 4000);
    if (!title || !summary) return null;
    return { title, summary, body: articleBody || summary };
  } catch {
    return null;
  }
}

async function matchSolutionSlug(
  supabase: SupabaseClient,
  productNames: string[] | undefined,
  text: string,
): Promise<string | null> {
  const { data: tools } = await supabase.from("tools").select("slug,name").eq("status", "published").limit(800);
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

    const body = (await req.json().catch(() => ({}))) as {
      publish?: boolean;
      limit?: number;
      days?: number;
    };
    const publish = Boolean(body.publish);
    const limit = Math.max(1, Math.min(Number(body.limit ?? 12), 20));
    const daysWindow = Math.max(1, Math.min(Number(body.days ?? 1), 3));

    const cronHeader = req.headers.get("x-ingest-secret");
    let supabase: SupabaseClient;
    if (cronHeader) {
      supabase = serviceClient();
      await assertCronSecret(req, supabase);
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
    const hits: Array<{ url: string; title?: string; description?: string }> = [];
    for (const query of queries) {
      try {
        const found = await searchNewTools(query, 6, supabase, { tbs: "qdr:d" });
        hits.push(...found);
      } catch (err) {
        console.error("search failed", query, err);
      }
    }

    const unique = new Map<string, { url: string; title?: string; description?: string }>();
    for (const hit of hits) {
      if (!hit.url) continue;
      let normalized: string;
      try {
        normalized = normalizeUrl(hit.url);
      } catch {
        continue;
      }
      if (!isTrusted(normalized)) continue;
      if (looksLikeListing(normalized)) continue;
      const key = normalized.replace(/\/+$/, "").toLowerCase();
      if (!unique.has(key)) unique.set(key, { ...hit, url: normalized });
    }

    const candidates = [...unique.values()].slice(0, limit);
    let created = 0;
    let skipped = 0;
    let stale = 0;
    let untrusted = 0;
    let listing = 0;
    let errors = 0;
    let reformulated = 0;
    const results: Array<{ url: string; status: string; id?: string; error?: string }> = [];

    // Count pre-filtered for transparency
    for (const hit of hits) {
      if (!hit.url) continue;
      try {
        const n = normalizeUrl(hit.url);
        if (!isTrusted(n)) untrusted += 1;
        else if (looksLikeListing(n)) listing += 1;
      } catch {
        untrusted += 1;
      }
    }

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
        // Undated articles are kept when search was already day-scoped (tbs=qdr:d)
        // and the host is trusted; published_at falls back to today.

        const rawTitle = (scraped.title || hit.title || hostOf(hit.url) || "AI update").trim().slice(0, 180);
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
          const { data: clash } = await supabase.from("news_items").select("id").eq("slug", slug).maybeSingle();
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

    return jsonResponse({
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
    return jsonResponse({ error: message }, status);
  }
});
