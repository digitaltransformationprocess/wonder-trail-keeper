/**
 * Add Liquid AI (LFM / d1 / LEAP) + Latest: d1.2 announcement (Nov 16, 2026)
 * Usage: node scripts/seed_liquid_ai.mjs
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
  name: "Liquid AI",
  slug: "liquid-ai",
  publisher: "Liquid AI",
  url: "https://www.liquid.ai/",
  api_docs_url: "https://docs.liquid.ai/",
  repository_url: "https://huggingface.co/LiquidAI",
  summary:
    "Efficiency-first foundation models (LFM + d1) for on-device and low-latency AI — open weights under $10M revenue, hosted API, and LEAP edge SDKs.",
  description:
    "Liquid AI builds Liquid Foundation Models (LFM) and d1 decision models co-designed with real hardware for phones, laptops, cars, on-prem, and edge. Open-weight LFMs are free for commercial use under the LFM Open License when annual revenue is under $10M (enterprise license above that). Hosted API is pay-per-token on Liquid Console (also on OpenRouter / Vercel AI Gateway), with a small free credit for new orgs. LEAP provides Android/iOS edge SDKs; models run via llama.cpp, MLX, ONNX, Ollama, SGLang, vLLM and partners. Flagship lines include LFM3 (multimodal agents), LFM2.5, and d1 / d1.2 decision models with calibrated probabilities over text, vision, and audio.",
  pricing_model: "Freemium",
  price_display: "Open weights (<$10M) · API pay-per-token",
  open_source: false,
  api_available: true,
  local_available: true,
  license: "LFM Open License (weights)",
  keywords: [
    "liquid ai",
    "lfm",
    "d1",
    "on-device",
    "edge ai",
    "foundation models",
    "decision models",
    "leap",
    "open weights",
  ],
  strengths: [
    "Models co-designed for device latency, memory, and privacy",
    "Open weights free commercially under $10M revenue",
    "Hosted API + OpenRouter/Vercel; LEAP for mobile edge",
    "d1 decision API returns calibrated probabilities, not free text",
  ],
  limits: [
    "Open weights need a paid enterprise license above $10M revenue",
    "Open weight ≠ full open source (training code/data not fully released)",
    "Best fit for edge / efficiency use cases vs largest cloud-only LLMs",
  ],
  audience: [
    "Edge / mobile developers",
    "AI platform teams",
    "Enterprises needing private local inference",
  ],
  categories: [
    "automation-agents",
    "robotics-hardware",
    "coding-development",
    "data-analytics",
  ],
  type: "model",
  platforms: ["web", "ios", "android", "macos", "linux", "windows", "self-hosted"],
  featureKeys: [
    "text_generation",
    "image_generation",
    "audio_speech",
    "agents_automation",
    "api_access",
    "local_deploy",
    "tool_calling",
    "multimodal",
    "structured_output",
  ],
};

const NEWS = {
  title: "Liquid AI ships d1.2 omnimodal decision models",
  slug: "liquid-ai-d1-2-omnimodal-decision-models",
  kind: "release",
  published_at: "2026-11-16",
  solution_slug: "liquid-ai",
  source_url: "https://www.liquid.ai/blog/d1-2",
  summary:
    "Liquid AI released d1.2 and d1.2-ultra — omnimodal decision models with audio input and five new structured tasks; d1.2-ultra leads Artificial Analysis Decision Index v2.1.",
  body: `## What changed
On **November 16, 2026**, Liquid AI launched **d1.2** and **d1.2-ultra**, new versions of its decision models. They add **audio input** and five structured task types (read a value, find spans/PII, locate boxes in images, estimate a number with range, multi-label choice), and return calibrated probabilities instead of free-form text.

**d1.2-ultra** ranks first on the Artificial Analysis Decision Index v2.1 (score 75). Both models are billed on **input tokens only** via the Liquid API: **$0.02 / MTok** (d1.2) and **$0.042 / MTok** (d1.2-ultra).

## How to try it
Get a key at [console.liquid.ai](https://console.liquid.ai) and call \`POST /decisions/v1/systemone\` with model \`d1.2\` or \`d1.2-ultra\`. Coming to OpenRouter and Vercel soon per the announcement.

## Sources
- [d1.2 announcement](https://www.liquid.ai/blog/d1-2)
- [Liquid pricing](https://www.liquid.ai/pricing)`,
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

  await sb.from("pricing_plans").delete().eq("tool_id", toolId);
  await sb.from("pricing_plans").insert([
    {
      tool_id: toolId,
      plan_name: "Open weights (LFM Open License)",
      price_amount: 0,
      currency: "USD",
      billing_period: "custom",
      pricing_model: "Freemium",
      verified_at: today,
    },
    {
      tool_id: toolId,
      plan_name: "Hosted API",
      price_amount: null,
      currency: "USD",
      billing_period: "usage",
      pricing_model: "Usage-based",
      verified_at: today,
    },
    {
      tool_id: toolId,
      plan_name: "Enterprise (>$10M revenue)",
      price_amount: null,
      currency: "USD",
      billing_period: "custom",
      pricing_model: "Enterprise",
      verified_at: today,
    },
  ]);

  const pricingSrc = await ensureSource(sb, "https://www.liquid.ai/pricing");
  const apiSrc = await ensureSource(sb, "https://www.liquid.ai/api");
  for (const [sid, claim] of [
    [sourceId, "general"],
    [pricingSrc, "pricing"],
    [apiSrc, "api"],
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
    await sb
      .from("news_tool_links")
      .insert({ news_item_id: newsId, tool_id: toolId });
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
  await upsertNews(sb, NEWS, toolId);

  console.log(`done -> /tools/${TOOL.slug}`);
  console.log(`done -> /latest/${NEWS.slug}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
