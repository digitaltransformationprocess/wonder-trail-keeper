/**
 * Catalog + Latest: Perplexity Orchestrator API (Nov 17, 2026)
 * Usage: node scripts/seed_perplexity_orchestrator.mjs
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
  name: "Perplexity Orchestrator API",
  slug: "perplexity-orchestrator",
  publisher: "Perplexity",
  url: "https://www.perplexity.ai/hub/blog/orchestrator-one-api-for-reliable-inference",
  api_docs_url: "https://docs.perplexity.ai/docs/orchestrator/quickstart",
  repository_url: null,
  summary:
    "One API for open-weight and proprietary models with unified billing, automatic same-model failover, and optional perplexity/auto model routing.",
  description:
    "Perplexity Orchestrator (announced Nov 17, 2026) is a model-inference API that serves open-weight models on Perplexity infrastructure plus proprietary models from other providers through one API key and consolidated prepaid credits. Base URL: https://api.perplexity.ai/orchestrator/v1. Compatible with OpenAI Chat Completions, OpenAI Responses, and Anthropic Messages — point your existing SDK at the Orchestrator base URL and use catalog IDs like openai/gpt-6-luna or perplexity/glm-5.3. Provider routing picks deployments by health, capacity, and latency; on error, rate limit, or timeout it retries another deployment of the same model. Optional model routing via perplexity/auto (preview) uses a decision model + route descriptions to pick a model per request. Billing is always at the answering model’s published per-token rates regardless of which deployment served. Google, xAI, and open-weight models work at every usage tier; OpenAI/Anthropic need Tier 1+; Claude Opus 5 / 5.5 / Fable need Tier 2+. Distinct from Agent API (web-grounded answers), Search API, Decisions API, Embeddings, and Monitor API.",
  pricing_model: "Paid",
  price_display: "Per-token · prepaid credits (model catalog rates)",
  open_source: false,
  api_available: true,
  local_available: false,
  license: null,
  keywords: [
    "perplexity orchestrator",
    "orchestrator api",
    "model routing",
    "failover",
    "openai compatible",
    "anthropic messages",
    "perplexity/auto",
    "inference api",
  ],
  strengths: [
    "One key + unified billing across open-weight and proprietary models",
    "Automatic same-model provider failover for higher reliability",
    "Drop-in OpenAI / Anthropic SDK compatibility",
    "Optional perplexity/auto task-based model routing",
  ],
  limits: [
    "Stateless — no server-side conversation state fields",
    "Higher tiers required for OpenAI / Anthropic / Opus / Fable models",
    "Auto routing is preview; billed at whichever model answers",
    "Not a substitute for Agent API when you need web citations built-in",
  ],
  audience: [
    "API developers",
    "Platform teams consolidating multi-provider inference",
    "Apps needing reliable OpenAI/Anthropic-compatible endpoints",
  ],
  categories: ["automation-agents", "coding-development", "data-analytics"],
  type: "api",
  platforms: ["web", "python", "javascript"],
  featureKeys: [
    "api_access",
    "text_generation",
    "tool_calling",
    "agents_automation",
    "structured_output",
  ],
};

const NEWS = {
  title: "Perplexity Orchestrator: one API for reliable multi-provider inference",
  slug: "perplexity-orchestrator-reliable-inference-api",
  kind: "new_tool",
  published_at: "2026-11-17",
  solution_slug: TOOL.slug,
  source_url: TOOL.url,
  summary:
    "Perplexity launched Orchestrator — a single inference API for open-weight and proprietary models with unified billing, automatic same-model failover across providers, and optional perplexity/auto model routing.",
  body: `## What shipped
On **November 17, 2026**, Perplexity announced **Orchestrator**: one API that connects to **open-weight** models on Perplexity’s inference stack and **proprietary** models from other providers, with **unified billing** and **automatic same-model failover**.

Base URL: \`https://api.perplexity.ai/orchestrator/v1\` (same Perplexity API key / prepaid credits as the rest of the platform).

## Why it matters
- Stop wiring separate OpenAI, Anthropic, Azure, Bedrock, etc. clients just for uptime
- Keep the **model ID** stable while deployments fail over (e.g. Claude via Anthropic → Bedrock)
- Use familiar **OpenAI Chat Completions / Responses** or **Anthropic Messages** request shapes

## Reliability & routing
- **Provider routing (automatic):** pick a healthy deployment by error rate, capacity, and latency; retry on another deployment of the **same model** after errors, rate limits, or timeouts
- Perplexity reports higher / more stable success rates for Claude and GPT traffic through Orchestrator vs individual providers in an Oct 4–Nov 2, 2026 window (vendor measurements)
- **Model routing (optional, preview):** set \`model\` to \`perplexity/auto\` with a default + plain-language routes; a decision model matches the conversation to a route and bills the model that answers

## Access tiers (high level)
- Google, xAI, and open-weight models: available at every usage tier
- OpenAI / Anthropic models: **Tier 1+**
- Claude Opus 5 / 5.5 and Fable models: **Tier 2+**

## How to try it
1. Create / reuse a Perplexity API key
2. Point OpenAI SDK \`base_url\` to \`https://api.perplexity.ai/orchestrator/v1\` (Anthropic SDK: \`https://api.perplexity.ai/orchestrator\`)
3. Call a catalog ID (e.g. \`perplexity/glm-5.3\`) or \`perplexity/auto\` with a \`routing\` profile
4. List models: \`GET /orchestrator/v1/models\`

## How it fits the Perplexity API platform
- **Direct model inference + failover** → **Orchestrator**
- **Web-grounded answers + citations** → Agent API
- **Ranked web results only** → Search API
- **Probabilities / classifications** → Decisions API
- **Embeddings** → Embeddings API
- **Scheduled web / page watches** → Monitor API

## Sources
- [Orchestrator blog announcement](https://www.perplexity.ai/hub/blog/orchestrator-one-api-for-reliable-inference)
- [Orchestrator quickstart](https://docs.perplexity.ai/docs/orchestrator/quickstart)
- [Routing & reliability](https://docs.perplexity.ai/docs/orchestrator/routing-and-reliability)
- [Models & pricing](https://docs.perplexity.ai/docs/orchestrator/models)`,
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
  const docsSrc = await ensureSource(sb, tool.api_docs_url);
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
      plan_name: "Prepaid API credits (per-model rates)",
      price_amount: null,
      currency: "USD",
      billing_period: "usage",
      pricing_model: "Paid",
      verified_at: today,
    },
  ]);

  for (const [sid, claim] of [
    [sourceId, "general"],
    [docsSrc, "api"],
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
  const openrouterId = await idBySlug(sb, "tools", "openrouter");

  await linkAlternative(sb, toolId, perplexityId);
  await linkAlternative(sb, toolId, monitorId);
  await linkAlternative(sb, toolId, openrouterId);

  await upsertNews(sb, NEWS, [toolId, perplexityId, monitorId]);

  console.log(`done -> /tools/${TOOL.slug}`);
  console.log(`done -> /latest/${NEWS.slug}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
