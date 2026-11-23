/**
 * Catalog + Latest: TradingView MCP Server (official)
 * Usage: node scripts/seed_tradingview_mcp.mjs
 * Source: https://www.tradingview.com/mcp/docs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = "https://www.tradingview.com/mcp/docs";
const SERVER = "https://mcp.tradingview.com/mcp";

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
  name: "TradingView MCP",
  slug: "tradingview-mcp",
  publisher: "TradingView",
  url: DOCS,
  api_docs_url: DOCS,
  repository_url: null,
  summary:
    "Official TradingView MCP server — connect Claude, ChatGPT, Perplexity, Grok, Cursor and other MCP clients to research markets, filings, watchlists, alerts, and Pine Script.",
  description:
    "TradingView MCP Server is TradingView’s official Model Context Protocol endpoint (https://mcp.tradingview.com/mcp). Authenticate with OAuth 2.1 via your TradingView account — no API keys. It connects to Claude (web, desktop, mobile; listed in Claude’s connector directory), Claude Code, ChatGPT/Codex, Perplexity (verified plugin), Grok, Cursor, and any streamable HTTP MCP client with OAuth 2.1. Ask in plain English to research markets, read filings, build watchlists, set alerts, and write / validate / backtest Pine Script. About 38 tools in 9 categories (watchlists, market data, symbol search, screener, news, documents/filings, calendars, alerts, Pine scripts). Toolset is in beta and expands over time. Usage counts against TradingView plan quotas; AI subscription (AI Copilot + MCP) raises the ceiling to 500 calls/day and 50/min on any plan. Does not expose broker balances, positions, or order execution — not for automated trading.",
  pricing_model: "Paid",
  price_display: "Essential+ plans · AI subscription extends MCP limits",
  open_source: false,
  api_available: true,
  local_available: false,
  license: null,
  keywords: [
    "tradingview mcp",
    "mcp server",
    "claude connector",
    "pine script",
    "watchlists",
    "alerts",
    "filings",
    "market research",
    "backtest",
    "chatgpt",
    "cursor",
  ],
  strengths: [
    "Official TradingView MCP — OAuth, one server URL for all clients",
    "In Claude’s connector directory plus ChatGPT, Perplexity, Grok, Cursor",
    "Plain-English market research, filings, watchlists, alerts, Pine + backtest",
  ],
  limits: [
    "Beta toolset — features and quotas can change",
    "Daily call limits by TradingView plan (AI sub raises to 500/day)",
    "No broker execution / balances / positions via MCP",
    "Not for automated trading decisions per TradingView terms",
  ],
  audience: [
    "Traders using Claude / ChatGPT / Cursor",
    "Pine Script developers",
    "Retail researchers and screeners",
  ],
  categories: ["mcp", "finance", "finance-legal", "automation-agents"],
  type: "mcp",
  platforms: ["web"],
  featureKeys: ["agents_automation", "api_access", "data_extraction"],
};

const NEWS = {
  title: "TradingView MCP connects Claude, ChatGPT, Perplexity, Grok and Cursor",
  slug: "tradingview-mcp-claude-connector",
  kind: "feature",
  published_at: "2026-11-19",
  solution_slug: TOOL.slug,
  source_url: DOCS,
  summary:
    "TradingView’s official MCP server is live (beta): connect Claude — now in its connector directory — plus ChatGPT, Perplexity, Grok, Cursor and other MCP clients to research markets, read filings, manage watchlists/alerts, and write and backtest Pine Script.",
  body: `## What shipped
**TradingView MCP Server** lets AI assistants use your TradingView account over MCP.

- **Server URL:** \`${SERVER}\`
- **Auth:** OAuth 2.1 with your TradingView login (no API keys)
- **Docs:** [tradingview.com/mcp/docs](${DOCS})

### Clients
- **Claude** (web, desktop, mobile) — search *TradingView MCP* under Customize → Connectors (Claude connector directory)
- **Claude Code** — \`claude mcp add --transport http mcp-tradingview ${SERVER}\`
- **ChatGPT / Codex**
- **Perplexity** — verified connector under Plugins
- **Grok** — custom connector by server URL
- **Cursor** — \`mcp.json\` (user or workspace)
- Any streamable HTTP MCP client with OAuth 2.1

### What you can ask in plain English
Research markets, read **filings**, build **watchlists**, set **alerts**, and **write / validate / backtest Pine Script**.

Roughly **38 tools** across 9 categories (watchlists, market data, symbol search, screener, news, documents, calendars, alerts, Pine scripts). Toolset is **beta** and expands over time.

## Limits & pricing notes
- Calls count toward your TradingView plan; **AI subscription** (AI Copilot + MCP) raises the ceiling to **500 calls/day**, **50/min** on any plan
- Coverage commonly cited from **Essential** and higher (confirm on your account)
- **No** broker balances, positions, or order placement through MCP
- Terms: not for automated trading / machine trading decisions

## How to try it (Claude)
1. Claude → Settings → Customize → Connectors
2. Search **TradingView MCP** → Connect to Claude
3. Allow \`mcp:read\` / \`mcp:tools\` on TradingView
4. Ask e.g. “What are my watchlists on TradingView?”

## Sources
- [TradingView MCP docs](${DOCS})`,
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
    logo_url: logoFor("https://www.tradingview.com"),
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
    const { data, error } = await sb
      .from("news_items")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw error;
    newsId = data.id;
    console.log(`[news insert] ${item.slug}`);
  }

  if (toolId) {
    await sb.from("news_tool_links").delete().eq("news_item_id", newsId);
    await sb.from("news_tool_links").insert({
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
  const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
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
  console.log(`done -> /latest/${NEWS.slug}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
