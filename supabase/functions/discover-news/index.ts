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

/** Product advances for /latest — never industry/business news. */
const PRODUCT_ADVANCE_KINDS = new Set([
  "new_tool",
  "release",
  "version",
  "feature",
  "pricing",
  "access",
]);

function inferKind(title: string, description: string, eventKind?: string): string {
  const t = `${title} ${description}`.toLowerCase();
  if (/pric|plan|billing|free tier|subscription|credits?/.test(t)) return "pricing";
  if (/api access|generally available|ga\b|waitlist|region|availability|open.?source/.test(t)) {
    return "access";
  }
  if (/feature|capability|adds? support|now supports|shipped|changelog/.test(t)) return "feature";
  if (/v\d|version|upgrade|\d+\.\d+|model update|gpt-\d|claude\s?\d|gemini\s?\d/.test(t)) {
    return "version";
  }
  if (/new tool|launches? a|introduces?|debut|arrives|added to|new product/.test(t)) {
    return "new_tool";
  }
  if (/launch|releas|announce|introduc|unveil|generally available/.test(t)) return "release";
  if (/acquisit|fund|rais|ipo|merger|lawsuit|regulat|politic|migrant|vulnerabilit/.test(t)) {
    return "news";
  }
  if (eventKind && PRODUCT_ADVANCE_KINDS.has(eventKind)) return eventKind;
  if (eventKind === "pricing" || eventKind === "release") return eventKind;
  return "news";
}

function isProductAdvance(kind: string, title: string, summary: string, hasTool: boolean): boolean {
  if (!PRODUCT_ADVANCE_KINDS.has(kind)) return false;
  const t = `${title} ${summary}`.toLowerCase();
  // Reject obvious non-product headlines that slipped past kind inference.
  if (/migrant|vulnerabilit|lawsuit|election|war |killed|dj\b|groove/.test(t)) return false;
  // Prefer items linked to a catalog tool; otherwise require a strong product signal.
  if (hasTool) return true;
  return /launch|releas|version|pricing|feature|model|api|ga\b|tool|platform/.test(t);
}

function buildQueries(today: string): string[] {
  const productSites = [
    "site:openai.com",
    "site:anthropic.com",
    "site:blog.google",
    "site:huggingface.co/blog",
    "site:nvidia.com",
    "site:github.blog",
    "site:microsoft.com",
    "site:aws.amazon.com",
  ];
  const launchPress = [
    "site:techcrunch.com",
    "site:theverge.com",
    "site:venturebeat.com",
    "site:arstechnica.com",
  ];
  return [
    `(${productSites.join(" OR ")}) (introducing OR launches OR "now available" OR "new model" OR "new feature" OR changelog) after:${today}`,
    `(${launchPress.join(" OR ")}) (Gemini OR Claude OR GPT OR Copilot OR Qwen) (model OR feature OR version) (launch OR release OR ships OR unveils) after:${today}`,
    `"new model" OR "now available" OR "Code Mode" OR changelog (OpenAI OR Anthropic OR Google OR Gemini) ${today}`,
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
    "You are an editor for AI Discov Latest — product advance notes only.",
    "Rewrite the source as a short release note about what an AI PRODUCT just shipped:",
    "new model, new feature, new version, pricing change, or access/GA change.",
    "NOT industry news, funding, lawsuits, opinion, or generic tool-overview blurbs.",
    "HARD RULES:",
    "1) Use ONLY facts present in the provided source text. Never invent prices, benchmarks, or features.",
    "2) Headline must name the product + what shipped (model/feature/version).",
    "3) Neutral, practical tone — no hype, no affiliate CTA spam.",
    "4) Reply in English.",
    "5) body must use markdown sections with ## headings.",
    "OUTPUT ONLY valid JSON:",
    '{"title":"Product + what shipped, max 110 chars","summary":"1-3 sentences: what changed, for whom, max 360 chars","body":"markdown"}',
    "body structure (omit a section if source lacks facts):",
    "## What shipped",
    "## Who it is for",
    "## Pricing notes",
    "## FAQ",
    "### Question?\\nAnswer.",
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
    const summary = (parsed.summary ?? "").trim().slice(0, 500);
    const articleBody = (parsed.body ?? "").trim().slice(0, 8000);
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
      ping?: boolean;
    };

    // Health check used after deploy (still requires staff JWT or cron secret).
    const cronHeader = req.headers.get("x-ingest-secret");
    let supabase: SupabaseClient;
    if (cronHeader) {
      supabase = serviceClient();
      await assertCronSecret(req, supabase);
    } else {
      const auth = await requireStaff(req.headers.get("Authorization"));
      supabase = auth.service;
    }

    if (body.ping) {
      return jsonResponse({
        ok: true,
        ping: true,
        function: "discover-news",
        has_firecrawl_env: Boolean(Deno.env.get("FIRECRAWL_API_KEY")),
      });
    }

    const publish = Boolean(body.publish);
    const limit = Math.max(1, Math.min(Number(body.limit ?? 12), 20));
    // Blog regen often needs a wider window than same-day only.
    const daysWindow = Math.max(1, Math.min(Number(body.days ?? 7), 21));

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

        const kind = inferKind(title, summary, scraped.event_kind);
        if (!isProductAdvance(kind, title, summary, Boolean(solutionSlug))) {
          skipped += 1;
          results.push({
            url: hit.url,
            status: "skipped_non_product",
            error: `kind=${kind}`,
          });
          continue;
        }

        const publishedAt = articleDate || today;
        const { data: row, error } = await supabase
          .from("news_items")
          .insert({
            title,
            slug: slug || null,
            summary,
            body: articleBody,
            kind,
            event_type: rewritten ? "discovered_reformulated" : "discovered",
            published_at: publishedAt,
            source_url: hit.url,
            solution_slug: solutionSlug,
            // Product advances still start as draft unless explicitly published.
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
