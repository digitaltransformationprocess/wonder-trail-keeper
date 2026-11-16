/**
 * Add HyperFrames Studio (+ Latest) — video editor built for agents (HeyGen / Apache-2.0).
 * Usage: node scripts/seed_hyperframes_studio.mjs
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
  name: "HyperFrames Studio",
  slug: "hyperframes-studio",
  publisher: "HeyGen",
  url: "https://hyperframes.studio",
  api_docs_url: "https://hyperframes.heygen.com/studio-app",
  summary:
    "Desktop video editor built for AI agents — describe a video, your agent builds it, then you both edit the same timeline.",
  description:
    "HyperFrames Studio is a free desktop video editor from the HeyGen team behind open-source HyperFrames (Apache-2.0). An agent on your computer builds the first cut from your description; you iterate by typing, pointing, drawing, or commenting on frames while sharing the same timeline. Videos are composed from HTML/CSS/JS and rendered deterministically (not a generative video model). Available for macOS, Windows, and Linux; sign in with a free HeyGen account. Also usable via skills in Claude Code / Codex / Cursor (`npx skills add heygen-com/hyperframes`), chat connectors, or Studio on the web.",
  pricing_model: "Free",
  price_display: "Free (HeyGen sign-in)",
  open_source: true,
  api_available: false,
  local_available: true,
  keywords: [
    "hyperframes",
    "video editor",
    "agent",
    "heygen",
    "timeline",
    "html video",
  ],
  strengths: [
    "Shared agent + human timeline editing",
    "Deterministic HTML/CSS/JS rendering",
    "Desktop apps + open-source HyperFrames core",
  ],
  limits: [
    "Requires HeyGen sign-in for the Studio app",
    "Not a traditional NLE or generative video model",
  ],
  audience: ["Creators", "Developers", "Marketers"],
  categories: ["video-generation", "automation-agents", "design-creativity"],
  type: "tool",
  platforms: ["windows", "macos", "linux", "web"],
};

const NEWS = {
  title: "HyperFrames Studio — video editor built for agents",
  slug: "hyperframes-studio-agent-video-editor",
  kind: "new_tool",
  published_at: "2026-11-16",
  solution_slug: TOOL.slug,
  source_url: TOOL.url,
  summary:
    "HeyGen’s HyperFrames Studio is a free desktop editor where coding agents and humans share one timeline — describe a video, iterate with draws/comments, render from HTML/CSS/JS on Mac, Windows, and Linux.",
  body: `## What it is
**HyperFrames Studio** (\`hyperframes.studio\`) is a desktop video editor built for agents by the team that open-sourced **HyperFrames** (Apache-2.0, \`heygen-com/hyperframes\`).

You describe the video; an agent on your machine builds the cut; then you and the agent edit the **same timeline** — type, point, draw, or comment on a frame to drive the next change. Rendering is deterministic from HTML/CSS/JS (not diffusion video).

## How to start
- Download Studio for **macOS / Windows / Linux** (free HeyGen sign-in)
- Or add skills: \`npx skills add heygen-com/hyperframes\` in Claude Code, Codex, or Cursor
- Docs: [Install the Studio app](https://hyperframes.heygen.com/studio-app)

## Note
A separate catalog entry already covers the HyperFrames **skill** on skills.sh; this item is the Studio product surface.`,
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
  console.log(`done -> /tools/${TOOL.slug} · /latest/${NEWS.slug}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
