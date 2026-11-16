/**
 * Add Perplexity Monitor API as a published catalog tool (+ Latest advance).
 * Usage: node scripts/seed_perplexity_monitor_api.mjs
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
  name: "Perplexity Monitor API",
  slug: "perplexity-monitor-api",
  publisher: "Perplexity",
  url: "https://www.perplexity.ai/hub/blog/introducing-perplexitys-monitor-api",
  api_docs_url: "https://docs.perplexity.ai/docs/monitors/overview",
  summary:
    "API to monitor the web or specific pages on a schedule and deliver relevant updates via signed webhooks.",
  description:
    "Perplexity Monitor API watches topics across the web or tracks changes on up to 10 pages (pricing, changelogs, policies). Plain-language goals and Decider filters (relevance, source legitimacy, novelty, freshness) decide when an update is sent. Runs can be interval- or cron-based, paused/resumed on demand, and deliver signed webhooks with retries. Uses the same API key as Search, Context, and Agent API. Web monitors: $1 per 1,000 successful runs; page monitors: $1 per 1,000 URLs fetched.",
  pricing_model: "Paid",
  price_display: "$1 / 1K web runs · $1 / 1K page fetches",
  open_source: false,
  api_available: true,
  local_available: false,
  keywords: [
    "monitor",
    "webhook",
    "web monitoring",
    "page diff",
    "perplexity",
    "search api",
    "agents",
  ],
  strengths: [
    "Topic and page monitoring in one API",
    "Goal-based filtering with confidence scores",
    "Signed webhooks for agent workflows",
  ],
  limits: [
    "Page monitors capped at 10 URLs per monitor",
    "Usage billed per successful run / URL fetch",
  ],
  audience: ["Developers", "GTM teams", "Research analysts"],
  categories: ["automation-agents", "research-education", "data-analytics"],
  type: "api",
  platforms: ["api"],
};

const NEWS = {
  title: "Perplexity launches Monitor API for web and page change tracking",
  slug: "perplexity-monitor-api-launch",
  kind: "new_tool",
  published_at: "2026-11-16",
  solution_slug: TOOL.slug,
  source_url: TOOL.url,
  summary:
    "Perplexity released Monitor API to watch web topics or specific pages on a schedule and push filtered updates via signed webhooks—priced from $1 per 1,000 runs or URL fetches.",
  body: `## What shipped
**Perplexity Monitor API** lets developers create monitors in plain language for (1) web topic monitoring via Perplexity Search or (2) page change tracking with text diffs on up to 10 URLs.

Updates pass Decider checks (relevance, legitimacy, novelty, freshness) and arrive as signed webhooks. Schedules support intervals or cron; monitors can be paused, resumed, or run on demand from the API / API Console.

## Pricing notes
Web monitors: **$1 per 1,000 successful runs**. Page monitors: **$1 per 1,000 URLs fetched**. Same API key as Search, Context, and Agent API.

## Who it is for
Developers building GTM, competitive intel, equity research, and regulatory monitoring agents that need continuous web awareness.`,
};

async function ensurePublisher(sb, name) {
  const { data: existing } = await sb.from("publishers").select("id").eq("name", name).maybeSingle();
  if (existing?.id) return existing.id;
  const { data, error } = await sb.from("publishers").insert({ name }).select("id").single();
  if (error) throw error;
  return data.id;
}

async function ensureSource(sb, url) {
  const { data: existing } = await sb.from("sources").select("id").eq("url", url).maybeSingle();
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
  const { data, error } = await sb.from(table).select("id").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

async function idByKey(sb, table, key) {
  const { data, error } = await sb.from(table).select("id").eq("key", key).maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

async function upsertTool(sb, tool) {
  const { data: bySlug } = await sb.from("tools").select("id").eq("slug", tool.slug).maybeSingle();
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
    logo_url: logoFor("https://www.perplexity.ai"),
    pricing_model: tool.pricing_model,
    price_display: tool.price_display,
    open_source: tool.open_source,
    api_available: tool.api_available,
    local_available: tool.local_available,
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
    if (!platformId) continue;
    await sb.from("tool_platforms").upsert({
      tool_id: toolId,
      platform_id: platformId,
      status: "available",
    });
  }

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

async function upsertNews(sb, item, toolId) {
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
    const { data: row, error } = await sb.from("news_items").insert(payload).select("id").single();
    if (error) throw error;
    newsId = row.id;
    console.log(`[news insert] ${item.slug}`);
  }

  if (toolId) {
    await sb.from("news_tool_links").upsert({
      news_item_id: newsId,
      tool_id: toolId,
    });
  }
}

async function main() {
  const env = {
    ...loadEnv(join(ROOT, ".env.production")),
    ...loadEnv(join(ROOT, ".env")),
  };
  const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    console.error("Missing Supabase URL or secret key");
    process.exit(1);
  }

  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const toolId = await upsertTool(sb, TOOL);
  await upsertNews(sb, NEWS, toolId);
  console.log(`done -> /tools/${TOOL.slug}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
