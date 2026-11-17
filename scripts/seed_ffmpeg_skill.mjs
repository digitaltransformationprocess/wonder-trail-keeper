/**
 * Add ffmpeg-skill (local FFmpeg agent skill + MCP) to Skills catalog.
 * Usage: node scripts/seed_ffmpeg_skill.mjs
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
  name: "ffmpeg-skill",
  slug: "ffmpeg-skill",
  publisher: "kajisho5",
  url: "https://github.com/kajisho5/ffmpeg-skill",
  repository: "https://github.com/kajisho5/ffmpeg-skill",
  summary:
    "Local video editor for coding agents — 42 FFmpeg tools with a machine-readable contract and MCP server for Claude Code, Cursor, and Codex.",
  description:
    "ffmpeg-skill is an Agent Skill (and MCP server) that gives Claude Code, Cursor, Codex, and other MCP clients a local FFmpeg video editor: cut, join, silence removal, captions/karaoke, reframe, overlays, loudness, delivery checks, and more — 42 tools total. Install with `npx ffmpeg-skill`. No cloud, no API keys; needs ffmpeg/ffprobe and Python on PATH. Teaches agents a probe → edit → verify workflow via SKILL.md and a SPEC-derived contract (`contract --json`). MCP advertises a core 12 tools by default (full 42 with FFMPEG_SKILL_MCP_FULL=1). Optional local ASR for transcription; audio never uploaded.",
  pricing_model: "Open source",
  price_display: "Free",
  open_source: true,
  api_available: true,
  local_available: true,
  license: "See repository",
  keywords: [
    "ffmpeg",
    "skill",
    "mcp",
    "video",
    "editing",
    "claude code",
    "cursor",
    "local",
    "agent skill",
  ],
  strengths: [
    "42 local FFmpeg tools with verification-first workflow",
    "Works as Agent Skill + MCP (Claude Code / Cursor / Codex)",
    "No cloud or API keys — offline on your footage",
    "Machine-readable contract derived from CLI (SPEC)",
  ],
  limits: [
    "Requires local ffmpeg / ffprobe (and python3)",
    "Transcription needs a separate local speech engine",
    "Agent still needs enough context to choose the right tool",
  ],
  audience: ["Developers", "Video editors using AI agents"],
  categories: ["skills", "mcp", "video-generation", "audio-music"],
  type: "open-source",
  platforms: ["macos", "linux", "windows", "self-hosted"],
  featureKeys: ["video_generation", "audio_speech", "api_access", "local_deploy", "agents_automation"],
  popularity: 78,
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
      publisher: "github.com",
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
    repository_url: TOOL.repository,
    logo_url: "https://github.com/kajisho5.png?size=128",
    pricing_model: TOOL.pricing_model,
    price_display: TOOL.price_display,
    open_source: TOOL.open_source,
    api_available: TOOL.api_available,
    local_available: TOOL.local_available,
    license: TOOL.license,
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

  // Primary Skills; also MCP + media categories (skill + MCP hybrid)
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
  // Also tag MCP type as secondary when present
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
      plan_name: "Open source",
      price_amount: 0,
      currency: "USD",
      billing_period: "custom",
      pricing_model: "Open source",
      verified_at: today,
    },
  ]);

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

  const popularity = TOOL.popularity ?? 78;
  const rank_score = Math.min(100, Math.round(popularity * 0.65 + 88 * 0.35));
  await sb.from("tool_internal_ranks").upsert({
    tool_id: toolId,
    popularity,
    trust: 88,
    rank_score,
    updated_at: new Date().toISOString(),
  });

  console.log(`done -> /tools/${TOOL.slug}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
