/**
 * Add QwenCloud tool (if missing) + Latest: Qwen4-Max on Token Plan
 * Usage: node scripts/seed_qwen_token_plan_latest.mjs
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
  name: "QwenCloud",
  slug: "qwencloud",
  publisher: "Alibaba",
  url: "https://docs.qwencloud.com",
  api_docs_url: "https://docs.qwencloud.com/token-plan/personal/token-plan-personal-overview",
  summary:
    "Alibaba’s Qwen cloud platform for Token Plan subscriptions, API access, and model + agent tooling.",
  description:
    "QwenCloud hosts Alibaba’s Qwen models and Token Plan — a credit-based subscription covering 20+ flagship models (Qwen, DeepSeek, GLM, Wan, and more) plus agent harness tools such as web search. Individual plans (Lite–Pro) and Team Edition support concurrent agents; Qwen4-Max is available on Token Plan and API.",
  pricing_model: "Paid",
  price_display: "Token Plan from ~$3–$43/mo (promos vary)",
  open_source: false,
  api_available: true,
  local_available: false,
  keywords: ["qwencloud", "token plan", "qwen4-max", "alibaba", "api"],
  strengths: ["Many flagship models in one plan", "Model + agent tooling", "API + product binding"],
  limits: ["Credits pause when quota runs out", "Promos and regional pricing change"],
  audience: ["Developers", "Teams"],
  categories: ["coding-development", "ai-assistants", "automation-agents"],
  type: "platform",
  platforms: ["web"],
};

const NEWS = {
  title: "Qwen4-Max launches on Token Plan with 78% more credits",
  slug: "qwen4-max-token-plan-78-credits",
  kind: "pricing",
  published_at: "2026-11-16",
  solution_slug: "qwencloud",
  source_url: "https://www.qianwenai.com/benefits/tokenplan",
  summary:
    "QwenCloud Token Plan now includes Qwen4-Max, with up to ~78% more monthly Credits, 20+ flagship models, and model + agent capabilities in one subscription (Individual and Team).",
  body: `## What shipped
**Qwen4-Max** is available on **QwenCloud Token Plan** (Individual and Team Edition) as of November 16, 2026, per QwenCloud product updates.

QwenCloud’s Token Plan marketing highlights:
- **~78% more Credits** on Individual plan quotas (quota increase rolled out from Nov 9; Lite / Essential / Standard ~74–78% higher; Pro raised to 200,000 Credits)
- **20+ flagship models** in one place (Qwen, DeepSeek, GLM, Wan, HappyHorse, audio/image, and more)
- **Model + agent capabilities** — credits cover model calls and agent harness tools (e.g. web search), with concurrent agent slots by plan

New-user discounts on Lite/Essential and night-time credit discounts on select models are time-limited; confirm current rates on the Token Plan page.

## Plans (Individual overview)
Lite → Pro monthly credit quotas and concurrent agents (1–2 up to 6–8), plus optional Credit Packs. See QwenCloud Token Plan docs for live pricing.

## Sources
- [Token Plan product updates](https://docs.qwencloud.com/token-plan/token-plan-product-updates) (Qwen4-Max available Nov 16)
- [Token Plan Individual overview](https://docs.qwencloud.com/token-plan/personal/token-plan-personal-overview)
- [Token Plan benefits / launch page](https://www.qianwenai.com/benefits/tokenplan)`,
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
    logo_url: logoFor("https://www.qianwenai.com"),
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
    console.log(`[tool update] ${tool.slug}`);
  } else {
    const { data: inserted, error } = await sb
      .from("tools")
      .insert({ ...row, status: "pending_review" })
      .select("id")
      .single();
    if (error) throw error;
    toolId = inserted.id;
    console.log(`[tool insert] ${tool.slug}`);
  }

  for (let i = 0; i < tool.categories.length; i++) {
    const catId = await idBySlug(sb, "categories", tool.categories[i]);
    if (!catId) continue;
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

  await sb
    .from("tools")
    .update({ status: "published", updated_at: new Date().toISOString() })
    .eq("id", toolId);

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
  const sb = createClient(
    env.VITE_SUPABASE_URL || env.SUPABASE_URL,
    env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } },
  );

  const toolId = await upsertTool(sb, TOOL);
  await upsertNews(sb, NEWS, toolId);
  console.log(`done -> /latest/${NEWS.slug} · /tools/${TOOL.slug}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
