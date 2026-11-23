/**
 * Catalog: ElevenCreative, ElevenAgents, ElevenAPI (+ refresh ElevenLabs)
 * Affiliate: https://try.elevenlabs.io/svxp5cd3i356
 * Usage: node scripts/seed_elevenlabs_platforms.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const AFFILIATE = "https://try.elevenlabs.io/svxp5cd3i356";

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

const TOOLS = [
  {
    name: "ElevenLabs",
    slug: "elevenlabs",
    publisher: "ElevenLabs",
    url: AFFILIATE,
    api_docs_url: "https://elevenlabs.io/docs",
    summary:
      "AI voice platform with ElevenCreative (TTS, cloning, dubbing), ElevenAgents, and ElevenAPI for developers.",
    description:
      "ElevenLabs is an AI voice company with three core platforms. ElevenCreative is the AI-native creative workspace for generating, editing, and localizing audio and video — including Text to Speech, Voices & Voice Cloning, and Dubbing. ElevenAgents are conversational AI voice agents for customer support, sales qualification, and more. ElevenAPI lets developers embed ElevenLabs voice models into their own apps. Start via the partner link to explore plans and credits on ElevenLabs.",
    pricing_model: "Freemium",
    price_display: "Free tier · Paid Creator / Pro / Scale / Business",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: [
      "elevenlabs",
      "elevencreative",
      "elevenagents",
      "elevenapi",
      "text to speech",
      "voice cloning",
      "dubbing",
      "voice agents",
    ],
    strengths: [
      "Lifelike TTS across dozens of languages",
      "Voice cloning and video dubbing in one creative suite",
      "Conversational agents + developer API on the same platform",
    ],
    limits: [
      "Paid usage for high volume / commercial cloning",
      "Agent and API quotas depend on plan",
    ],
    audience: ["Creators", "Marketers", "Support teams", "Developers"],
    categories: ["audio-music", "video-generation", "automation-agents"],
    type: "platform",
    platforms: ["web", "api"],
    featureKeys: ["audio_speech", "video_generation", "api_access", "agents_automation"],
  },
  {
    name: "ElevenCreative",
    slug: "elevencreative",
    publisher: "ElevenLabs",
    url: AFFILIATE,
    api_docs_url: null,
    summary:
      "AI-native creative workspace for generating, editing, and localizing audio and video at scale — TTS, voices, and dubbing.",
    description:
      "ElevenCreative is ElevenLabs’ AI-native creative workspace for audio and video content at scale. Core features audiences love: Text to Speech — turn any script into lifelike, expressive speech across dozens of languages (strongest all-round converter); Voices and Voice Cloning — a large library of ready-to-use voices plus clone-and-reuse across projects; Dubbing — translate and dub a video into another language while keeping the original tone and delivery (paste a video, pick a language, done). Part of the ElevenLabs platform alongside ElevenAgents and ElevenAPI.",
    pricing_model: "Freemium",
    price_display: "Free tier · Paid ElevenLabs plans",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: [
      "elevencreative",
      "elevenlabs",
      "text to speech",
      "voice cloning",
      "dubbing",
      "ai audio",
      "ai video localization",
    ],
    strengths: [
      "Text to Speech across dozens of languages",
      "Ready voices + custom voice cloning",
      "One-click style video dubbing with tone preserved",
    ],
    limits: [
      "Commercial voice cloning and high volume need paid plans",
      "Output quality depends on script and source audio/video",
    ],
    audience: ["Content creators", "Video editors", "Localization teams", "Podcasters"],
    categories: ["audio-music", "video-generation", "design-creativity"],
    type: "tool",
    platforms: ["web"],
    featureKeys: ["audio_speech", "video_generation"],
  },
  {
    name: "ElevenAgents",
    slug: "elevenagents",
    publisher: "ElevenLabs",
    url: AFFILIATE,
    api_docs_url: "https://elevenlabs.io/docs/agents-platform/overview",
    summary:
      "Conversational AI voice agents for customer support, sales qualification, and more — used by solo operators and businesses.",
    description:
      "ElevenAgents are ElevenLabs’ conversational AI voice agents for customer support, sales qualification, and similar voice workflows. Solo operators and businesses use them to handle calls and conversations with natural-sounding voices. On the ElevenLabs affiliate program, Agents customers are highlighted as higher value (more commission per customer vs median, more frequent upgrades, lower churn). Part of the same platform as ElevenCreative and ElevenAPI.",
    pricing_model: "Freemium",
    price_display: "Free trial / paid agent plans (confirm on site)",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: [
      "elevenagents",
      "elevenlabs",
      "voice agents",
      "conversational ai",
      "customer support",
      "sales qualification",
      "ivr",
    ],
    strengths: [
      "Natural conversational voice agents for support and sales",
      "Fits solo operators through larger businesses",
      "Same ElevenLabs voice quality as Creative / API",
    ],
    limits: [
      "Needs setup for phone / channel integrations",
      "Ongoing usage billed per plan / minutes",
    ],
    audience: [
      "Support teams",
      "Sales / SDR teams",
      "Founders automating intake",
      "Contact centers",
    ],
    categories: ["automation-agents", "audio-music", "business-marketing"],
    type: "agent",
    platforms: ["web", "api"],
    featureKeys: ["agents_automation", "audio_speech", "api_access"],
  },
  {
    name: "ElevenAPI",
    slug: "elevenapi",
    publisher: "ElevenLabs",
    url: AFFILIATE,
    api_docs_url: "https://elevenlabs.io/docs/api-reference/introduction",
    summary:
      "Developer API to build ElevenLabs voice models — TTS, cloning, and more — straight into your own apps and products.",
    description:
      "ElevenAPI is ElevenLabs’ developer surface for embedding voice models into your own apps and products. Use it for text-to-speech, voice cloning, speech-to-text, and related audio APIs with SDKs and HTTP endpoints. Complements ElevenCreative (workspace UI) and ElevenAgents (hosted conversational agents) when you need first-party control in your product stack.",
    pricing_model: "Freemium",
    price_display: "API credits · paid usage tiers",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: [
      "elevenapi",
      "elevenlabs api",
      "tts api",
      "voice api",
      "speech synthesis",
      "developers",
    ],
    strengths: [
      "Production voice models via API / SDKs",
      "Same model family as Creative and Agents",
      "Fits custom apps, games, and agent stacks",
    ],
    limits: [
      "Billed by character / credit usage",
      "Rate limits and model access depend on tier",
    ],
    audience: ["Developers", "Product teams", "AI app builders"],
    categories: ["audio-music", "coding-development", "automation-agents"],
    type: "api",
    platforms: ["web", "python", "javascript"],
    featureKeys: ["api_access", "audio_speech"],
  },
];

const NEWS = {
  title: "ElevenLabs platforms: ElevenCreative, ElevenAgents, and ElevenAPI",
  slug: "elevenlabs-creative-agents-api-platforms",
  kind: "feature",
  published_at: "2026-11-19",
  solution_slug: "elevenlabs",
  source_url: AFFILIATE,
  summary:
    "ElevenLabs’ affiliate onboarding highlights three cores: ElevenCreative (TTS, cloning, dubbing), ElevenAgents (conversational voice agents), and ElevenAPI for developers.",
  body: `## What shipped / how the platform splits
ElevenLabs organizes around three cores:

### ElevenCreative
AI-native creative workspace for generating, editing, and localizing **audio and video** at scale:
- **Text to Speech** — lifelike speech across dozens of languages
- **Voices & Voice Cloning** — library voices plus clone-and-reuse
- **Dubbing** — paste a video, pick a language, keep tone and delivery

### ElevenAgents
Conversational **AI voice agents** for customer support, sales qualification, and more. Positioned as a high-value line for businesses and solo operators (higher upgrade rates / lower churn vs median products in affiliate messaging).

### ElevenAPI
For **developers** who want ElevenLabs voice models inside their own apps and products.

## Try it
Use the partner link: [try.elevenlabs.io/svxp5cd3i356](${AFFILIATE})`,
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
    logo_url: logoFor("https://elevenlabs.io"),
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

  const ids = {};
  for (const tool of TOOLS) {
    ids[tool.slug] = await upsertTool(sb, tool);
  }

  const slugs = TOOLS.map((t) => t.slug);
  for (const a of slugs) {
    for (const b of slugs) {
      if (a !== b) await linkAlternative(sb, ids[a], ids[b]);
    }
  }

  await upsertNews(sb, NEWS, slugs.map((s) => ids[s]));

  for (const s of slugs) console.log(`done -> /tools/${s}`);
  console.log(`done -> /latest/${NEWS.slug}`);
  console.log(`affiliate -> ${AFFILIATE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
