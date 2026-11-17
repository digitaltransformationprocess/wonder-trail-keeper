/**
 * Add Mirelo AI Audio Editor to the catalog.
 * Usage: node scripts/seed_mirelo.mjs
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

const TOOL = {
  name: "Mirelo",
  slug: "mirelo",
  publisher: "Mirelo",
  url: "https://mirelo.ai/audio-editor",
  api_docs_url: "https://mirelo.ai/pricing",
  repository_url: null,
  summary:
    "Conversational AI audio editor for video — generate synced SFX and music, clean dialogue, dub, and edit on a timeline; also via Claude / Cursor / MCP.",
  description:
    "Mirelo is an AI audio editor for video: describe what you want and it generates sound effects and ambience that follow the action, creates scene-matched music, isolates speech, removes unwanted music or noise, and can dub video into other languages while keeping effects. Manual timeline editing is available alongside chat. Audio-only edits — it does not change the video picture. Also available from Claude, Cursor, or any MCP client for agent workflows (SFX generate/extend/fix). Credit plans: Free (~5k credits), Creator ~$20/mo, Studio ~$100/mo, Scale ~$300/mo, Business ~$1,000/mo (annual ~15% off). SFX 2.0 and Music billed per generated second of audio.",
  pricing_model: "Freemium",
  price_display: "Free · Creator ~$20/mo · Studio ~$100/mo",
  open_source: false,
  api_available: true,
  local_available: false,
  keywords: [
    "mirelo",
    "audio editor",
    "sfx",
    "foley",
    "music generation",
    "video sound",
    "dubbing",
    "voice isolation",
    "mcp",
  ],
  strengths: [
    "Talk-to-edit soundtrack for video in one project",
    "Synced SFX + music + cleanup + dubbing",
    "Agent/MCP access from Claude and Cursor",
    "Keeps footage; only reshapes audio",
  ],
  limits: [
    "Does not edit video frames — audio only",
    "Credit-based; heavy SFX/music burns seconds fast",
    "Cloud product — not a local offline DAW",
  ],
  audience: ["Video creators", "Editors", "Marketing / social teams"],
  categories: ["audio-music", "video-generation", "mcp"],
  type: "tool",
  platforms: ["web"],
  featureKeys: ["audio_speech", "video_generation", "api_access", "agents_automation"],
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
      publisher: "mirelo.ai",
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function idBySlug(sb, table, slug) {
  const { data } = await sb.from(table).select("id").eq("slug", slug).maybeSingle();
  return data?.id ?? null;
}

async function idByKey(sb, table, key) {
  const { data } = await sb.from(table).select("id").eq("key", key).maybeSingle();
  return data?.id ?? null;
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

  const today = new Date().toISOString().slice(0, 10);
  const { data: bySlug } = await sb
    .from("tools")
    .select("id")
    .eq("slug", TOOL.slug)
    .maybeSingle();

  const publisherId = await ensurePublisher(sb, TOOL.publisher);
  const sourceId = await ensureSource(sb, TOOL.url);

  const row = {
    name: TOOL.name,
    publisher_id: publisherId,
    summary: TOOL.summary,
    description: TOOL.description,
    official_url: TOOL.url,
    api_docs_url: TOOL.api_docs_url,
    repository_url: TOOL.repository_url,
    logo_url: "https://www.google.com/s2/favicons?sz=128&domain=mirelo.ai",
    pricing_model: TOOL.pricing_model,
    price_display: TOOL.price_display,
    open_source: TOOL.open_source,
    api_available: TOOL.api_available,
    local_available: TOOL.local_available,
    keywords: TOOL.keywords,
    strengths: TOOL.strengths,
    limits: TOOL.limits,
    audience: TOOL.audience,
    last_verified_at: today,
    updated_at: new Date().toISOString(),
  };

  let toolId = bySlug?.id ?? null;
  if (toolId) {
    const { error } = await sb.from("tools").update(row).eq("id", toolId);
    if (error) throw error;
    console.log(`[update] ${TOOL.slug}`);
  } else {
    const { data: inserted, error } = await sb
      .from("tools")
      .insert({ ...row, slug: TOOL.slug, status: "pending_review" })
      .select("id")
      .single();
    if (error) throw error;
    toolId = inserted.id;
    console.log(`[insert] ${TOOL.slug}`);
  }

  for (let i = 0; i < TOOL.categories.length; i++) {
    const catId = await idBySlug(sb, "categories", TOOL.categories[i]);
    if (!catId) {
      console.warn(`[skip cat] ${TOOL.categories[i]}`);
      continue;
    }
    await sb.from("tool_categories").upsert({
      tool_id: toolId,
      category_id: catId,
      is_primary: i === 0,
    });
  }

  const typeId = await idBySlug(sb, "solution_types", TOOL.type);
  if (typeId) {
    await sb.from("tool_types").upsert({
      tool_id: toolId,
      solution_type_id: typeId,
      is_primary: true,
    });
  }
  const mcpTypeId = await idBySlug(sb, "solution_types", "mcp");
  if (mcpTypeId) {
    await sb.from("tool_types").upsert({
      tool_id: toolId,
      solution_type_id: mcpTypeId,
      is_primary: false,
    });
  }

  for (const key of TOOL.platforms) {
    const platformId = await idByKey(sb, "platforms", key);
    if (!platformId) continue;
    await sb.from("tool_platforms").upsert({
      tool_id: toolId,
      platform_id: platformId,
      status: "available",
    });
  }

  const { data: feats } = await sb
    .from("features")
    .select("id,key")
    .in("key", TOOL.featureKeys);
  for (const f of feats ?? []) {
    await sb.from("tool_features").upsert({
      tool_id: toolId,
      feature_id: f.id,
      availability: "available",
    });
  }

  await sb.from("pricing_plans").delete().eq("tool_id", toolId);
  await sb.from("pricing_plans").insert([
    {
      tool_id: toolId,
      plan_name: "Free",
      price_amount: 0,
      currency: "USD",
      billing_period: "monthly",
      pricing_model: "Freemium",
      verified_at: today,
    },
    {
      tool_id: toolId,
      plan_name: "Creator",
      price_amount: 20,
      currency: "USD",
      billing_period: "monthly",
      pricing_model: "Paid",
      verified_at: today,
    },
    {
      tool_id: toolId,
      plan_name: "Studio",
      price_amount: 100,
      currency: "USD",
      billing_period: "monthly",
      pricing_model: "Paid",
      verified_at: today,
    },
    {
      tool_id: toolId,
      plan_name: "Scale",
      price_amount: 300,
      currency: "USD",
      billing_period: "monthly",
      pricing_model: "Paid",
      verified_at: today,
    },
  ]);

  const pricingSrc = await ensureSource(sb, "https://mirelo.ai/pricing");
  for (const [sid, claim] of [
    [sourceId, "general"],
    [pricingSrc, "pricing"],
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

  console.log(`done -> /tools/${TOOL.slug}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
