/**
 * Latest + catalog: GPT-Live-1.1 in the API
 * Usage: node scripts/seed_gpt_live_1_1_latest.mjs
 * Source: https://developers.openai.com/api/docs/models/gpt-live-1.1
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = "https://developers.openai.com/api/docs/models/gpt-live-1.1";

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

const MODEL = {
  name: "GPT-Live-1.1",
  slug: "gpt-live-1-1",
  publisher: "OpenAI",
  url: DOCS,
  api_docs_url: DOCS,
  summary:
    "OpenAI realtime voice model — more natural accents across languages, lower idle costs via standby, and more reliable task completion vs GPT-Live-1.",
  description:
    "GPT-Live-1.1 is available in the OpenAI API for realtime voice agents. Compared with GPT-Live-1, it transcribes speech more accurately and maintains a more consistent accent and voice across languages. It can listen while it speaks. A lower standby rate applies to WebRTC sessions while inference is paused (see GPT-Live pricing). Use model id gpt-live-1.1 in Realtime API requests. Part of OpenAI’s GPT-Live / Realtime audio stack for voice agents and multilingual spoken interfaces.",
  pricing_model: "Paid",
  price_display: "Realtime usage · standby rate when paused (WebRTC)",
  open_source: false,
  api_available: true,
  local_available: false,
  keywords: [
    "gpt-live-1.1",
    "gpt live",
    "openai realtime",
    "voice agent",
    "standby",
    "accents",
    "speech to speech",
    "webrtc",
  ],
  strengths: [
    "More natural, consistent accents across languages vs GPT-Live-1",
    "Lower idle costs with standby when WebRTC inference is paused",
    "More reliable task completion for voice agents",
  ],
  limits: [
    "API usage billed; standby applies to paused WebRTC sessions",
    "Rate limits depend on your OpenAI organization tier",
    "Realtime / voice stack — not a general text-only chat model",
  ],
  audience: ["Voice agent builders", "Realtime API developers", "Multilingual support products"],
  categories: ["audio-music", "automation-agents", "ai-assistants"],
  type: "model",
  platforms: ["web", "python", "javascript"],
  featureKeys: ["api_access", "audio_speech", "agents_automation"],
};

const NEWS = {
  title: "GPT-Live-1.1 is now available in the OpenAI API",
  slug: "gpt-live-1-1-api",
  kind: "version",
  published_at: "2026-11-19",
  solution_slug: MODEL.slug,
  source_url: DOCS,
  summary:
    "OpenAI released GPT-Live-1.1 for the Realtime API — more natural and consistent accents across languages, lower idle costs with standby, and more reliable task completion than GPT-Live-1.",
  body: `## What shipped
**GPT-Live-1.1** is now available in the **OpenAI API** (Realtime / GPT-Live voice stack).

Model id: \`gpt-live-1.1\`

### Highlights
- Speaks with **more natural and consistent accents** across languages (vs GPT-Live-1)
- Supports **lower idle costs** with a new **standby** option (lower standby rate for WebRTC sessions while inference is paused)
- Completes tasks **more reliably**
- Can **listen while it speaks**; improved speech transcription accuracy vs GPT-Live-1

## How to try it
1. Open the [GPT-Live-1.1 model page](${DOCS})
2. Start a voice session via the Realtime / GPT-Live guides
3. Set the model to \`gpt-live-1.1\`
4. Check [GPT-Live pricing](https://openai.com/api/pricing/) for standby vs active rates

## Sources
- [GPT-Live-1.1 | OpenAI API docs](${DOCS})`,
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
    logo_url: logoFor("https://openai.com"),
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
}

async function refreshRealtime(sb, modelId) {
  const { data: tool } = await sb
    .from("tools")
    .select("id, keywords, strengths, summary")
    .eq("slug", "openai-realtime-api")
    .maybeSingle();
  if (!tool) return null;

  const today = new Date().toISOString().slice(0, 10);
  const keywords = Array.from(
    new Set([...(tool.keywords ?? []), "gpt-live-1.1", "gpt live", "standby"]),
  );
  const strengths = [...(tool.strengths ?? [])];
  if (!strengths.some((s) => /gpt-live-1\.1/i.test(s))) {
    strengths.unshift(
      "Supports GPT-Live-1.1 — better accents, standby idle pricing, more reliable voice tasks",
    );
  }

  await sb
    .from("tools")
    .update({
      keywords,
      strengths,
      last_verified_at: today,
      updated_at: new Date().toISOString(),
    })
    .eq("id", tool.id);

  await linkAlternative(sb, modelId, tool.id);
  console.log("[tool refresh] openai-realtime-api");
  return tool.id;
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

  const modelId = await upsertTool(sb, MODEL);
  const realtimeId = await refreshRealtime(sb, modelId);
  const apiId = await idBySlug(sb, "tools", "openai-api");
  await linkAlternative(sb, modelId, apiId);

  await upsertNews(sb, NEWS, [modelId, realtimeId, apiId]);

  console.log(`done -> /tools/${MODEL.slug}`);
  console.log(`done -> /latest/${NEWS.slug}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
