/**
 * Add OpenCode (open source coding agent) as a published catalog tool.
 * Usage: node scripts/seed_opencode.mjs
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
  name: "OpenCode",
  slug: "opencode",
  publisher: "Anomaly",
  url: "https://opencode.ai",
  api_docs_url: "https://opencode.ai/docs",
  summary:
    "Open-source coding agent for desktop, terminal, mobile, and SDK — free models, BYOK providers, or OpenCode Go subscriptions.",
  description:
    "OpenCode is an MIT-licensed coding agent from Anomaly that runs on your machine via desktop app, terminal UI, mobile, or SDK. It connects to 200+ LLM providers through Models.dev (including local models), supports multi-session agents, plugins, MCP servers, custom agents/skills/commands, and permission controls with undo/redo. Start with free models (no account required), bring ChatGPT Plus/Pro or GitHub Copilot, or use OpenCode Console inference. Optional OpenCode Go is $10/month, Go Plus $40/month, Go Teams $20/member/month.",
  pricing_model: "Freemium",
  price_display: "Free · Go $10/mo · Go Plus $40/mo",
  open_source: true,
  api_available: true,
  local_available: true,
  keywords: [
    "coding agent",
    "cli",
    "desktop",
    "mcp",
    "open source",
    "opencode",
    "anomaly",
    "byok",
  ],
  strengths: [
    "Open source with desktop, terminal, mobile, and SDK",
    "200+ providers including free and local models",
    "MCP, plugins, skills, and multi-session agents",
  ],
  limits: [
    "Model quality depends on provider or Go plan limits",
    "Heavy agent use still needs capable models / spend",
  ],
  audience: ["Developers", "Engineering teams"],
  categories: ["coding-development", "automation-agents", "ai-assistants"],
  type: "agent",
  platforms: ["windows", "macos", "linux", "api", "web"],
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
    logo_url: logoFor(tool.url),
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

  // Point Hy4 flash free Latest item at OpenCode when present
  const { data: news } = await sb
    .from("news_items")
    .select("id")
    .eq("slug", "hy4-flash-free-opencode-two-weeks")
    .maybeSingle();
  if (news?.id && toolId) {
    await sb
      .from("news_items")
      .update({ solution_slug: "opencode", updated_at: new Date().toISOString() })
      .eq("id", news.id);
    await sb.from("news_tool_links").delete().eq("news_item_id", news.id);
    await sb.from("news_tool_links").insert({ news_item_id: news.id, tool_id: toolId });
    console.log("[link] hy4-flash-free-opencode-two-weeks -> opencode");
  }

  console.log(`done -> /tools/${TOOL.slug}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
