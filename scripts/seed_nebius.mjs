/**
 * Catalog + Latest: Nebius AI Cloud
 * Usage: node scripts/seed_nebius.mjs
 * Source: https://nebius.com/
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://nebius.com/";
const DOCS = "https://docs.nebius.com/";
const PRICES = "https://nebius.com/prices";
const TOKEN_FACTORY = "https://tokenfactory.nebius.com/";

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
  name: "Nebius",
  slug: "nebius",
  publisher: "Nebius",
  url: SITE,
  api_docs_url: DOCS,
  repository_url: null,
  summary:
    "Purpose-built AI cloud — NVIDIA GPU clusters for training and inference, managed services, Token Factory model APIs, and spot pricing.",
  description:
    "Nebius AI Cloud is a cloud engineered from silicon to API for AI workloads. It offers non-virtualized NVIDIA GPUs with InfiniBand for training and inference, self-service clusters in minutes, MLOps tooling, serverless and managed inference, Kubernetes, and flexible consumption including live GPU spot / preemptible VMs. GPU catalog on published pricing includes NVIDIA GB300, B300, GB200, B200, H200, H100, RTX PRO 6000, and L40S. Nebius Token Factory provides model inference APIs (including open-source models) for production agents and apps. Positioned for AI developers and enterprises with white-glove PoC, expert support, and enterprise-grade compliance. Customers publicly cited include Revolut, Shopify, Sword Health, and RoboForce.",
  pricing_model: "Paid",
  price_display: "GPU hourly · Spot · Token Factory usage",
  open_source: false,
  api_available: true,
  local_available: false,
  license: null,
  keywords: [
    "nebius",
    "nebius ai cloud",
    "gpu cloud",
    "nvidia",
    "h100",
    "h200",
    "b200",
    "gb200",
    "token factory",
    "inference",
    "training",
    "managed inference",
    "kubernetes",
    "ai cloud",
  ],
  strengths: [
    "Purpose-built AI cloud from GPUs to APIs (training → inference)",
    "Non-virtualized NVIDIA GPUs with InfiniBand; broad latest SKUs",
    "Token Factory for managed / serverless model inference APIs",
    "Live spot / preemptible pricing and flexible consumption",
  ],
  limits: [
    "Usage-based GPU and inference costs can scale quickly",
    "Spot / preemptible capacity can be interrupted",
    "Enterprise features and regions vary — confirm on account / docs",
  ],
  audience: [
    "ML / AI infrastructure engineers",
    "Startups training or serving large models",
    "Enterprises needing managed GPU + inference",
  ],
  categories: ["coding-development", "data-analytics", "automation-agents"],
  type: "platform",
  platforms: ["web"],
  featureKeys: ["api_access", "agents_automation"],
};

const NEWS = {
  title: "Nebius AI Cloud: NVIDIA GPU cloud for training, inference, and Token Factory",
  slug: "nebius-ai-cloud-gpu-token-factory",
  kind: "new_tool",
  published_at: "2026-11-23",
  solution_slug: TOOL.slug,
  source_url: SITE,
  summary:
    "Nebius is a purpose-built AI cloud with NVIDIA GPU clusters (training and inference), managed services, live spot pricing, and Token Factory model APIs — from silicon to API.",
  body: `## What it is
**[Nebius](${SITE})** markets **Nebius AI Cloud** as a cloud built for AI: from **training to inference**, engineered from silicon to API.

## Highlights
- **GPU cloud** — non-virtualized NVIDIA GPUs with InfiniBand; published SKUs include **GB300, B300, GB200, B200, H200, H100, RTX PRO 6000, L40S** ([pricing](${PRICES}))
- **Clusters in minutes** — self-service access with repeatability for AI developers
- **Managed path** — MLOps tooling, serverless and **managed inference**, Kubernetes
- **Elastic consumption** — including **live GPU spot prices** and preemptible VMs
- **[Token Factory](${TOKEN_FACTORY})** — model inference APIs for production agents and apps (open-source and hosted models)
- Enterprise posture — white-glove PoC, expert support, compliance-oriented offering

## How to try it
1. Open [nebius.com](${SITE}) → Start building / talk to an expert
2. Review [GPU pricing](${PRICES}) and [docs](${DOCS})
3. For model APIs, explore [Token Factory](${TOKEN_FACTORY})

## Sources
- [nebius.com](${SITE})
- [NVIDIA GPU pricing](${PRICES})
- [Docs](${DOCS})
- [Token Factory](${TOKEN_FACTORY})`,
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
  const pricesSrc = await ensureSource(sb, PRICES);
  const docsSrc = await ensureSource(sb, tool.api_docs_url);
  const tfSrc = await ensureSource(sb, TOKEN_FACTORY);
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
    [pricesSrc, "pricing"],
    [docsSrc, "api"],
    [tfSrc, "token-factory"],
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

  for (const alt of ["runpod", "coreweave", "lambda-labs", "vast-ai"]) {
    const altId = await idBySlug(sb, "tools", alt);
    await linkRelated(sb, toolId, altId);
  }

  await upsertNews(sb, NEWS, toolId);

  console.log(`done -> /tools/${TOOL.slug}`);
  console.log(`done -> /latest/${NEWS.slug}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
