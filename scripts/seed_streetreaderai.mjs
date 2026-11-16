/**
 * Add StreetReaderAI tool + Latest release (accessible street-view AI).
 * Usage: node scripts/seed_streetreaderai.mjs
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

const TOOL = {
  name: "StreetReaderAI",
  slug: "streetreaderai",
  publisher: "research-ground",
  url: "https://github.com/research-ground/streetreaderAI",
  api_docs_url: null,
  repository_url: "https://github.com/research-ground/streetreaderAI",
  summary:
    "Open-source multimodal map app for non-visual exploration of street-level imagery — built with and for blind and low-vision users.",
  description:
    "StreetReaderAI is an accessible street-view / map application that lets blind and low-vision (BLV) users navigate panoramic street imagery via keyboard or voice, hear real-time accessibility-focused descriptions of location and intersections, and ask follow-up Q&A about the surrounding area. It combines street-level imagery (defaults: Panoramax), OpenStreetMap routing/POIs, and multimodal AI. Open source under Apache 2.0 — run locally or import the public GitHub repo into Google AI Studio (uses injected GEMINI_API_KEY; zero paid APIs required with default providers). Aimed at BLV users, HCI researchers, and builders of accessible AI tools. Related research: Google Research / UIST’25 StreetReaderAI work.",
  pricing_model: "Open source",
  price_display: "Free (Apache 2.0)",
  open_source: true,
  api_available: false,
  local_available: true,
  license: "Apache-2.0",
  keywords: [
    "streetreaderai",
    "accessibility",
    "blind",
    "low vision",
    "blv",
    "street view",
    "multimodal",
    "a11y",
    "open source",
    "google ai studio",
  ],
  strengths: [
    "Designed with and for BLV users (keyboard + voice)",
    "Real-time scene descriptions + conversational Q&A",
    "Apache 2.0; runs locally or in Google AI Studio",
    "Useful reference for accessible AI / HCI research",
  ],
  limits: [
    "Prototype / research-oriented — not a full commercial maps product",
    "Imagery/routing quality depends on Panoramax/OSM (or configured providers)",
    "Needs a multimodal model API key for AI describe/chat features",
  ],
  audience: [
    "Blind and low-vision users",
    "HCI / accessibility researchers",
    "Accessible AI developers",
  ],
  categories: ["research-education", "ai-assistants", "productivity"],
  type: "open-source",
  platforms: ["web", "self-hosted"],
  featureKeys: [
    "multimodal",
    "audio_speech",
    "agents_automation",
    "local_deploy",
  ],
};

const NEWS = {
  title: "StreetReaderAI open-sourced for non-visual street exploration",
  slug: "streetreaderai-open-source-release",
  kind: "release",
  published_at: "2026-11-16",
  solution_slug: "streetreaderai",
  source_url: "https://github.com/research-ground/streetreaderAI",
  summary:
    "StreetReaderAI — a multimodal map app for blind and low-vision users — is open source (Apache 2.0) and runnable locally or in Google AI Studio.",
  body: `## What changed
**StreetReaderAI** was released as open source under **Apache 2.0**. Built with and for **blind and low-vision (BLV)** users, it supports non-visual exploration of street-level imagery: navigate via **keyboard or voice**, hear **real-time location descriptions**, and ask **follow-up Q&A** about the surrounding area.

## How to try it
- GitHub: [research-ground/streetreaderAI](https://github.com/research-ground/streetreaderAI)
- Import the public repo into **Google AI Studio** (Build), or run locally
- Defaults use **Panoramax** + **OpenStreetMap**; AI Studio injects \`GEMINI_API_KEY\`

## Why it matters
Gives HCI researchers and accessible-AI builders a concrete, open reference for multimodal street-view accessibility — related to Google Research / UIST’25 StreetReaderAI work.

## Sources
- [GitHub repository](https://github.com/research-ground/streetreaderAI)
- [Google Research blog](https://research.google/blog/streetreaderai-towards-making-street-view-accessible-via-context-aware-multimodal-ai/)`,
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
    logo_url: "https://github.com/research-ground.png?size=128",
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
    if (!platformId) continue;
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
      plan_name: "Open source",
      price_amount: 0,
      currency: "USD",
      billing_period: "custom",
      pricing_model: "Open source",
      verified_at: today,
    },
  ]);

  const blogSrc = await ensureSource(
    sb,
    "https://research.google/blog/streetreaderai-towards-making-street-view-accessible-via-context-aware-multimodal-ai/",
  );
  for (const [sid, claim] of [
    [sourceId, "general"],
    [blogSrc, "research"],
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
