/**
 * Catalog: Firecrawl (main API / open-source crawl+scrape)
 * Usage: node scripts/seed_firecrawl.mjs
 * Source: https://github.com/firecrawl/firecrawl · https://firecrawl.dev
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
  name: "Firecrawl",
  slug: "firecrawl",
  publisher: "Firecrawl",
  url: "https://firecrawl.dev",
  api_docs_url: "https://docs.firecrawl.dev",
  repository_url: "https://github.com/firecrawl/firecrawl",
  summary:
    "Knowledge infrastructure for agents — search, scrape, crawl, and 550+ data providers through one API (cloud or self-host).",
  description:
    "Firecrawl is open-source (AGPL-3.0) knowledge infrastructure to make AI agents smarter. One API covers web search with full page content, scrape to LLM-ready markdown/JSON/screenshots, crawl and map of whole sites, batch scrape, interact (click/scroll before extract), Agent (describe the data — no URLs required), Monitor, plus MCP, CLI, and agent skills. Firecrawl Alexandria adds 550+ data providers in one library (people, companies, research papers, and specialized indexes). Use Firecrawl Cloud at firecrawl.dev, or self-host / Firecrawl Local from the GitHub repo. Built for RAG, research agents, and any pipeline that needs clean web context without brittle scrapers.",
  pricing_model: "Freemium",
  price_display: "Free tier · Cloud paid plans · Self-host AGPL",
  open_source: true,
  api_available: true,
  local_available: true,
  license: "AGPL-3.0",
  keywords: [
    "firecrawl",
    "web scraping",
    "crawl",
    "scrape",
    "search api",
    "markdown",
    "rag",
    "mcp",
    "ai agents",
    "alexandria",
  ],
  strengths: [
    "Search + scrape + crawl + agent endpoints in one API",
    "LLM-ready markdown / JSON / screenshots from any URL",
    "Open source (AGPL) with cloud, local, MCP, CLI, and skills",
    "Alexandria: 550+ data providers for agent knowledge",
  ],
  limits: [
    "Cloud usage is credit / plan based",
    "Self-host does not include Alexandria by default",
    "AGPL-3.0 license obligations if you distribute modifications",
  ],
  audience: [
    "AI agent builders",
    "RAG / research engineers",
    "Developers replacing brittle scrapers",
  ],
  categories: ["data-analytics", "automation-agents", "research-education", "mcp"],
  type: "api",
  platforms: ["web", "python", "javascript"],
  featureKeys: [
    "api_access",
    "web_search",
    "data_extraction",
    "agents_automation",
    "open_source",
  ],
};

const NEWS = {
  title: "Firecrawl: open-source search, scrape, and crawl API for AI agents",
  slug: "firecrawl-open-source-agent-web-api",
  kind: "new_tool",
  published_at: "2026-11-18",
  solution_slug: TOOL.slug,
  source_url: TOOL.repository_url,
  summary:
    "Firecrawl is open-source knowledge infrastructure for agents — one API for search, scrape, crawl, interact, and Agent data retrieval, plus MCP/CLI and Alexandria’s 550+ providers.",
  body: `## What it is
**[Firecrawl](https://firecrawl.dev)** is knowledge infrastructure to make agents smarter: **search, scrape, and 550+ data providers through one API**. The core repo is open source on GitHub under **AGPL-3.0**.

## Core capabilities
- **Search** — web search with full content from results
- **Scrape** — LLM-ready markdown, JSON, screenshots, and more
- **Crawl / Map / Batch scrape** — whole sites and multi-URL jobs
- **Interact** — click, scroll, write, wait before extracting
- **Agent** — describe the data you need; Firecrawl finds and retrieves it (evolution of \`/extract\`)
- **Monitor** — keep watching pages / sources
- **MCP, CLI, Skills** — plug into Claude Code, OpenCode, and other agent hosts

## Alexandria
**Firecrawl Alexandria** packages **550+ data providers** (people, companies, research papers, specialized indexes) for agent knowledge. Available on Firecrawl Cloud; Local can use it after login. Self-hosted server does not include it by default.

## How to try it
1. Sign up at [firecrawl.dev](https://firecrawl.dev) or clone [github.com/firecrawl/firecrawl](https://github.com/firecrawl/firecrawl)
2. Get an API key and try the playground
3. Or connect via **MCP** / install the Firecrawl skill for your agent

## Sources
- [GitHub — firecrawl/firecrawl](https://github.com/firecrawl/firecrawl)
- [firecrawl.dev](https://firecrawl.dev)
- [Docs](https://docs.firecrawl.dev)`,
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
  const repoSrc = await ensureSource(sb, tool.repository_url);
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
    logo_url: logoFor(tool.url),
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
  const ossType = await idBySlug(sb, "solution_types", "open-source");
  if (ossType) {
    await sb.from("tool_types").upsert({
      tool_id: toolId,
      solution_type_id: ossType,
      is_primary: false,
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

  for (const [sid, claim] of [
    [sourceId, "general"],
    [repoSrc, "repository"],
  ]) {
    await sb.from("tool_sources").upsert({
      tool_id: toolId,
      source_id: sid,
      claim_key: claim,
      verified_at: today,
    });
  }

  const { error: pubErr } = await sb
    .from("tools")
    .update({ status: "published", updated_at: new Date().toISOString() })
    .eq("id", toolId);
  if (pubErr) throw pubErr;

  return toolId;
}

async function linkRelated(sb, sourceId, targetId, relation_type = "alternative") {
  if (!sourceId || !targetId || sourceId === targetId) return;
  const { data: existing } = await sb
    .from("tool_relations")
    .select("source_tool_id")
    .eq("source_tool_id", sourceId)
    .eq("target_tool_id", targetId)
    .eq("relation_type", relation_type)
    .maybeSingle();
  if (existing) return;
  const { error } = await sb.from("tool_relations").insert({
    source_tool_id: sourceId,
    target_tool_id: targetId,
    relation_type,
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
  const mcpId = await idBySlug(sb, "tools", "mcp-firecrawl");
  const skillsId = await idBySlug(sb, "tools", "firecrawl-skills");
  const contextId = await idBySlug(sb, "tools", "perplexity-context-api");

  await linkRelated(sb, toolId, mcpId);
  await linkRelated(sb, toolId, skillsId);
  await linkRelated(sb, toolId, contextId);

  await upsertNews(sb, NEWS, [toolId, mcpId, skillsId]);

  console.log(`done -> /tools/${TOOL.slug}`);
  console.log(`done -> /latest/${NEWS.slug}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
