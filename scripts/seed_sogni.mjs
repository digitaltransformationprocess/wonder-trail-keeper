/**
 * Add Sogni AI platform + Creative Agent Skill (and MCP).
 * Usage: node scripts/seed_sogni.mjs
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

function logoFor(url) {
  try {
    const domain = new URL(url).hostname.replace(/^www\./, "");
    return `https://www.google.com/s2/favicons?sz=128&domain=${encodeURIComponent(domain)}`;
  } catch {
    return null;
  }
}

const TODAY = new Date().toISOString().slice(0, 10);

const SOGNI = {
  name: "Sogni",
  slug: "sogni",
  publisher: "Sogni AI",
  url: "https://www.sogni.ai/",
  api_docs_url: "https://docs.sogni.ai/",
  repository_url: null,
  summary:
    "Creative AI platform with 200+ image/video/music/language models on a decentralized Supernet — apps, API, MCP, and Unlimited fair-use plans.",
  description:
    "Sogni is a creative AI suite for unrestricted image and video generation across 200+ open-weight and premium partner models (FLUX, MiniMax H3 / FastH3, Krea, Wan, Seedance, music, TTS, 3D, upscaling, and more). Runs on the Sogni Supernet (decentralized GPU workers) plus local device options. Includes workflow apps (storyboard→video, lipsync, motion transfer, restore/animate photos), native apps, OpenAPI-compatible REST API, hosted MCP, and the Sogni Creative Agent Skill for Claude Code / Codex / Hermes. Free tier with filtered Spark; Unlimited from about $20/mo (fair-use open models, 3-day trial); Premium Spark packs for frontier/partner models.",
  pricing_model: "Freemium",
  price_display: "Free · Unlimited from ~$20/mo · Spark packs",
  open_source: false,
  api_available: true,
  local_available: true,
  keywords: [
    "sogni",
    "image generation",
    "video generation",
    "supernet",
    "uncensored",
    "minimax h3",
    "flux",
    "creative ai",
  ],
  strengths: [
    "Large model catalog under one account",
    "Unlimited fair-use plans for eligible open models",
    "Agent-ready: API, MCP, Creative Agent Skill",
    "Decentralized Supernet + creative workflow apps",
  ],
  limits: [
    "Unlimited is fair-use (not 24/7 multi-user infra)",
    "Partner/frontier models need Premium Spark",
    "Mature/uncensored content is opt-in 18+",
  ],
  audience: ["Artists", "Creators", "Developers building creative agents"],
  categories: [
    "image-generation",
    "video-generation",
    "audio-music",
    "design-creativity",
  ],
  type: "platform",
  platforms: ["web", "ios", "android", "macos", "windows"],
  featureKeys: [
    "image_generation",
    "video_generation",
    "audio_speech",
    "api_access",
    "agents_automation",
    "multimodal",
    "local_deploy",
  ],
  plans: [
    { plan_name: "Free", price_amount: 0, billing_period: "monthly", pricing_model: "Freemium" },
    { plan_name: "Unlimited", price_amount: 20, billing_period: "monthly", pricing_model: "Paid" },
    { plan_name: "Premium Spark packs", price_amount: null, billing_period: "usage", pricing_model: "Paid" },
  ],
  sources: [
    ["https://www.sogni.ai/", "general"],
    ["https://www.sogni.ai/pricing", "pricing"],
    ["https://docs.sogni.ai/", "api"],
  ],
};

const SKILL = {
  name: "Sogni Creative Agent Skill",
  slug: "sogni-creative-agent-skill",
  publisher: "Sogni AI",
  url: "https://github.com/Sogni-AI/sogni-creative-agent-skill",
  repository_url: "https://github.com/Sogni-AI/sogni-creative-agent-skill",
  api_docs_url: "https://docs.sogni.ai/agents/",
  summary:
    "Official Sogni agent skill + MCP — give Claude Code, Codex, Hermes, and MCP clients image, video, and music generation on the Supernet.",
  description:
    "The Sogni Creative Agent Skill plugs Sogni into agent runtimes via a Node CLI (`sogni-agent`), SKILL.md (plus focused skills/*.md for image, video, music, analysis, personas), a local MCP server (`sogni-agent-mcp`), hosted MCP, Claude Code plugin, and OpenClaw plugin. Install with `npx setup-sogni-agent-skill --version=latest` (detects Claude Code, Codex, Hermes; Desktop MCP optional). Needs a Sogni API key. Covers image/video/music generation, durable creative workflows, personas/memory, and MiniMax H3 / FastH3 video with audio. Not listed as a first-party skills.sh pack — official GitHub + docs.sogni.ai.",
  pricing_model: "Freemium",
  price_display: "Free skill · needs Sogni API / plan",
  open_source: true,
  api_available: true,
  local_available: true,
  license: "MIT",
  keywords: [
    "sogni",
    "skill",
    "mcp",
    "creative agent",
    "claude code",
    "image",
    "video",
    "music",
  ],
  strengths: [
    "Official Sogni skill + local/hosted MCP",
    "One CLI for Claude Code, Codex, Hermes, OpenClaw",
    "Focused per-skill manifests (image/video/music/…)",
    "Production creative workflows on Supernet models",
  ],
  limits: [
    "Requires Sogni API key and account credits/plan",
    "Generations go to Sogni network (not fully offline)",
    "Not on skills.sh — install from GitHub / npx setup",
  ],
  audience: ["Developers", "Creative agents builders"],
  categories: ["skills", "mcp", "image-generation", "video-generation"],
  type: "open-source",
  platforms: ["macos", "linux", "windows", "web"],
  featureKeys: [
    "image_generation",
    "video_generation",
    "audio_speech",
    "agents_automation",
    "api_access",
    "tool_calling",
  ],
  plans: [
    {
      plan_name: "Skill / MCP (open source)",
      price_amount: 0,
      billing_period: "custom",
      pricing_model: "Open source",
    },
  ],
  sources: [
    ["https://github.com/Sogni-AI/sogni-creative-agent-skill", "general"],
    ["https://docs.sogni.ai/agents/", "api"],
    ["https://docs.sogni.ai/more-superapps/creative-agent-skill/", "general"],
  ],
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
  let publisher = "sogni.ai";
  try {
    publisher = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    /* ignore */
  }
  const { data, error } = await sb
    .from("sources")
    .insert({
      url,
      source_type: "official",
      reliability_level: "A",
      publisher,
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

async function upsertTool(sb, tool) {
  const { data: bySlug } = await sb
    .from("tools")
    .select("id")
    .eq("slug", tool.slug)
    .maybeSingle();
  const publisherId = await ensurePublisher(sb, tool.publisher);

  const row = {
    name: tool.name,
    publisher_id: publisherId,
    summary: tool.summary,
    description: tool.description,
    official_url: tool.url,
    api_docs_url: tool.api_docs_url,
    repository_url: tool.repository_url,
    logo_url:
      tool.repository_url && /github\.com\/([^/]+)/i.test(tool.repository_url)
        ? `https://github.com/${tool.repository_url.match(/github\.com\/([^/]+)/i)[1]}.png?size=128`
        : logoFor(tool.url),
    pricing_model: tool.pricing_model,
    price_display: tool.price_display,
    open_source: tool.open_source,
    api_available: tool.api_available,
    local_available: tool.local_available,
    license: tool.license ?? null,
    keywords: tool.keywords,
    strengths: tool.strengths,
    limits: tool.limits,
    audience: tool.audience,
    last_verified_at: TODAY,
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
      .insert({ ...row, slug: tool.slug, status: "pending_review" })
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
  if (tool.categories.includes("mcp")) {
    const mcpTypeId = await idBySlug(sb, "solution_types", "mcp");
    if (mcpTypeId) {
      await sb.from("tool_types").upsert({
        tool_id: toolId,
        solution_type_id: mcpTypeId,
        is_primary: false,
      });
    }
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
  if (tool.plans?.length) {
    await sb.from("pricing_plans").insert(
      tool.plans.map((p) => ({
        tool_id: toolId,
        plan_name: p.plan_name,
        price_amount: p.price_amount,
        currency: "USD",
        billing_period: p.billing_period,
        pricing_model: p.pricing_model,
        verified_at: TODAY,
      })),
    );
  }

  for (const [srcUrl, claim] of tool.sources ?? []) {
    const sourceId = await ensureSource(sb, srcUrl);
    await sb.from("tool_sources").upsert({
      tool_id: toolId,
      source_id: sourceId,
      claim_key: claim,
      verified_at: TODAY,
    });
  }

  const { error: pubErr } = await sb
    .from("tools")
    .update({ status: "published", updated_at: new Date().toISOString() })
    .eq("id", toolId);
  if (pubErr) throw pubErr;

  return toolId;
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

  await upsertTool(sb, SOGNI);
  await upsertTool(sb, SKILL);

  console.log("done -> /tools/sogni");
  console.log("done -> /tools/sogni-creative-agent-skill");
  console.log("skills.sh: no first-party Sogni pack found (GitHub/npx only)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
