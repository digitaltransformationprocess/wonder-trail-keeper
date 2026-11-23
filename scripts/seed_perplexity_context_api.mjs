/**
 * Catalog + Latest: Perplexity Context API (live)
 * Usage: node scripts/seed_perplexity_context_api.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv(path) {
  const env = { ...process.env };
  if (!existsSync(path)) return env;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    let k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!(k in process.env)) env[k] = v;
  }
  return env;
}

function domainFromUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "") || null;
  } catch {
    return null;
  }
}

function logoFor(url) {
  const domain = domainFromUrl(url);
  return domain
    ? `https://www.google.com/s2/favicons?sz=128&domain=${encodeURIComponent(domain)}`
    : null;
}

const TOOL = {
  name: "Perplexity Context API",
  slug: "perplexity-context-api",
  publisher: "Perplexity",
  url: "https://pplx.ai/context-api",
  api_docs_url: "https://docs.perplexity.ai/docs/context/overview",
  repository_url: null,
  summary:
    "Fetch up to 10 URLs per call and get clean Markdown, HTML, links, and snippets — priced at $1 per 1,000 URLs.",
  description:
    "Perplexity Context API turns raw web pages into structured, LLM-ready context. Each call can read up to 10 URLs and returns clean Markdown, HTML, extracted links, and snippets per page. Perplexity reports usable content for 92.3% of URLs, 87.9% fact recall, and 80.3% content precision, billed at $1 per 1,000 URLs fetched. Same API key family as Search, Monitor, Agent, and Orchestrator. Built for RAG pipelines, research agents, and any workflow that needs high-quality page content without brittle scrapers.",
  pricing_model: "Paid",
  price_display: "$1 / 1K URLs fetched",
  open_source: false,
  api_available: true,
  local_available: false,
  license: null,
  keywords: [
    "context api",
    "perplexity",
    "url fetch",
    "markdown",
    "web scraping",
    "rag",
    "page content",
    "html extract",
  ],
  strengths: [
    "Up to 10 URLs per call with clean .md, HTML, links, and snippets",
    "Strong extraction quality (92.3% usable content reported)",
    "Simple usage pricing at $1 / 1,000 URLs",
  ],
  limits: [
    "Max 10 URLs per request",
    "Billed per URL fetched",
    "Content quality still depends on the source page",
  ],
  audience: [
    "Developers building RAG / research agents",
    "Teams replacing brittle scrapers",
    "Apps that need clean page context for LLMs",
  ],
  categories: ["research-education", "data-analytics", "automation-agents"],
  type: "api",
  platforms: ["api", "web", "python", "javascript"],
  featureKeys: ["api_access", "web_search", "data_extraction", "agents_automation"],
};

const NEWS = {
  title: "Perplexity Context API is live: clean page content from up to 10 URLs",
  slug: "perplexity-context-api-live",
  kind: "new_tool",
  published_at: "2026-11-18",
  solution_slug: TOOL.slug,
  source_url: TOOL.url,
  summary:
    "Perplexity Context API is live — read up to 10 URLs per call and get clean Markdown, HTML, links, and snippets, with $1 / 1,000 URLs pricing and strong extraction quality metrics.",
  body: `## What shipped
**Perplexity Context API** is live. One call can read **up to 10 URLs** and returns usable page context for downstream models and agents.

### What you get per page
- Clean **Markdown** (\`.md\`)
- **HTML**
- Extracted **links**
- **Snippets**

### Quality & pricing (vendor metrics)
- **92.3%** of URLs return usable content
- **87.9%** fact recall
- **80.3%** content precision
- **$1 / 1,000 URLs** fetched

## Why it matters
- Drop-in page context for RAG and research agents without maintaining custom scrapers
- Fits the same Perplexity API platform as Search, Monitor, Agent, and Orchestrator
- Predictable per-URL pricing for high-volume fetch pipelines

## How to try it
1. Open [pplx.ai/context-api](https://pplx.ai/context-api)
2. Use your Perplexity API key
3. Send up to 10 URLs per call and consume the structured Markdown / HTML / links / snippets

## Sources
- [Perplexity Context API](https://pplx.ai/context-api)`,
};

async function ensurePublisher(sb, name) {
  const { data: existing } = await sb
    .from("publishers")
    .select("id")
    .eq("name", name)
    .maybeSingle();
  if (existing?.id) return existing.id;
  const { data, error } = await sb
    .from("publishers")
    .insert({ name })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function ensureSource(sb, url) {
  const { data: existing } = await sb
    .from("sources")
    .select("id")
    .eq("url", url)
    .maybeSingle();
  if (existing?.id) return existing.id;
  const { data, error } = await sb
    .from("sources")
    .insert({
      url,
      source_type: "official",
      reliability_level: "A",
      publisher: domainFromUrl(url),
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function idBySlug(sb, table, slug) {
  const { data, error } = await sb
    .from(table)
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

async function idByKey(sb, table, key) {
  const { data, error } = await sb
    .from(table)
    .select("id")
    .eq("key", key)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

async function upsertTool(sb, tool) {
  const { data: bySlug } = await sb
    .from("tools")
    .select("id")
    .eq("slug", tool.slug)
    .maybeSingle();
  const publisherId = await ensurePublisher(sb, tool.publisher);
  const sourceId = await ensureSource(sb, tool.url);
  const today = new Date().toISOString().slice(0, 10);

  const row = {
    name: tool.name,
    slug: tool.slug,
    publisher_id: publisherId,
    summary: tool.summary,
    description: tool.description,
    official_url: tool.url,
    api_docs_url: tool.api_docs_url,
    repository_url: tool.repository_url,
    logo_url: logoFor("https://www.perplexity.ai"),
    pricing_model: tool.pricing_model,
    price_display: tool.price_display,
    open_source: tool.open_source,
    api_available: tool.api_available,
    local_available: tool.local_available,
    license: tool.license,
    keywords: tool.keywords,
    strengths: tool.strengths,
    limits: tool.limits,
    audience: tool.audience,
    last_verified_at: today,
    updated_at: new Date().toISOString(),
  };

  let toolId = bySlug?.id ?? null;
  if (toolId) {
    const { error } = await sb.from("tools").update(row).eq("id", toolId);
    if (error) throw error;
    console.log(`[update] ${tool.slug}`);
  } else {
    const { data: inserted, error } = await sb
      .from("tools")
      .insert({ ...row, status: "pending_review" })
      .select("id")
      .single();
    if (error) throw error;
    toolId = inserted.id;
    console.log(`[insert] ${tool.slug}`);
  }

  for (let i = 0; i < tool.categories.length; i++) {
    const catId = await idBySlug(sb, "categories", tool.categories[i]);
    if (!catId) {
      console.warn(`[skip cat] ${tool.categories[i]}`);
      continue;
    }
    await sb.from("tool_categories").upsert({
      tool_id: toolId,
      category_id: catId,
      is_primary: i === 0,
    });
  }

  const typeId = await idBySlug(sb, "solution_types", tool.type);
  if (typeId) {
    await sb.from("tool_types").upsert({
      tool_id: toolId,
      solution_type_id: typeId,
      is_primary: true,
    });
  }

  for (const key of tool.platforms) {
    const platformId = await idByKey(sb, "platforms", key);
    if (!platformId) {
      console.warn(`[skip platform] ${key}`);
      continue;
    }
    await sb.from("tool_platforms").upsert({
      tool_id: toolId,
      platform_id: platformId,
      status: "available",
    });
  }

  if (tool.featureKeys?.length) {
    const { data: feats } = await sb
      .from("features")
      .select("id,key")
      .in("key", tool.featureKeys);
    for (const f of feats ?? []) {
      await sb.from("tool_features").upsert({
        tool_id: toolId,
        feature_id: f.id,
        availability: "available",
      });
    }
  }

  await sb.from("pricing_plans").delete().eq("tool_id", toolId);
  await sb.from("pricing_plans").insert([
    {
      tool_id: toolId,
      plan_name: "Usage — $1 / 1K URLs fetched",
      price_amount: 1,
      currency: "USD",
      billing_period: "usage",
      pricing_model: "Paid",
      verified_at: today,
    },
  ]);

  await sb.from("tool_sources").upsert({
    tool_id: toolId,
    source_id: sourceId,
    claim_key: "general",
    verified_at: today,
  });

  const { error: pubErr } = await sb
    .from("tools")
    .update({ status: "published", updated_at: new Date().toISOString() })
    .eq("id", toolId);
  if (pubErr) throw pubErr;

  return toolId;
}

async function linkAlternative(sb, sourceId, targetId) {
  if (!sourceId || !targetId || sourceId === targetId) return;
  const { data: existing } = await sb
    .from("tool_relations")
    .select("source_tool_id")
    .eq("source_tool_id", sourceId)
    .eq("target_tool_id", targetId)
    .eq("relation_type", "alternative")
    .maybeSingle();
  if (existing) return;
  const { error } = await sb.from("tool_relations").insert({
    source_tool_id: sourceId,
    target_tool_id: targetId,
    relation_type: "alternative",
  });
  if (error) console.warn(`[rel] ${error.message}`);
}

async function upsertNews(sb, item, toolIds) {
  const { data: existing } = await sb
    .from("news_items")
    .select("id")
    .eq("slug", item.slug)
    .maybeSingle();

  const payload = {
    title: item.title,
    slug: item.slug,
    summary: item.summary,
    body: item.body,
    kind: item.kind,
    event_type: "product_advance",
    published_at: item.published_at,
    source_url: item.source_url,
    solution_slug: item.solution_slug,
    status: "published",
    updated_at: new Date().toISOString(),
  };

  let newsId = existing?.id;
  if (newsId) {
    const { error } = await sb.from("news_items").update(payload).eq("id", newsId);
    if (error) throw error;
    console.log(`[news update] ${item.slug}`);
  } else {
    const { data, error } = await sb
      .from("news_items")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw error;
    newsId = data.id;
    console.log(`[news insert] ${item.slug}`);
  }

  await sb.from("news_tool_links").delete().eq("news_item_id", newsId);
  const ids = toolIds.filter(Boolean);
  if (ids.length) {
    await sb.from("news_tool_links").insert(
      ids.map((tool_id) => ({ news_item_id: newsId, tool_id })),
    );
  }
  return newsId;
}

async function main() {
  const env = {
    ...loadEnv(join(ROOT, ".env.production")),
    ...loadEnv(join(ROOT, ".env")),
  };
  const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
  const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing Supabase URL or secret key");
    process.exit(1);
  }

  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const toolId = await upsertTool(sb, TOOL);
  const perplexityId = await idBySlug(sb, "tools", "perplexity");
  const monitorId = await idBySlug(sb, "tools", "perplexity-monitor-api");
  const orchestratorId = await idBySlug(sb, "tools", "perplexity-orchestrator");

  await linkAlternative(sb, toolId, perplexityId);
  await linkAlternative(sb, toolId, monitorId);
  await linkAlternative(sb, toolId, orchestratorId);

  await upsertNews(sb, NEWS, [toolId, perplexityId, monitorId]);

  console.log(`done -> /tools/${TOOL.slug}`);
  console.log(`done -> /latest/${NEWS.slug}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
