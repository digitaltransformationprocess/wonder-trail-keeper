/**
 * Refresh Murf catalog entry + Latest with partner referral link
 * Affiliate: https://get.murf.ai/z72xb1oikg7m
 * Usage: node scripts/seed_murf_partner.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const AFFILIATE = "https://get.murf.ai/z72xb1oikg7m";

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

  const { data: tool, error } = await sb
    .from("tools")
    .select("id, slug, keywords, strengths, summary, description")
    .eq("slug", "murf")
    .maybeSingle();
  if (error) throw error;
  if (!tool) {
    console.error("murf tool not found");
    process.exit(1);
  }

  const today = new Date().toISOString().slice(0, 10);
  const keywords = Array.from(
    new Set([
      ...(tool.keywords ?? []),
      "murf ai",
      "studio tts",
      "voice agents",
      "dubbing",
      "tts api",
      "voice cloning",
    ]),
  );
  const strengths = [...(tool.strengths ?? [])];
  if (!strengths.some((s) => /studio|agent|dubbing/i.test(s))) {
    strengths.unshift(
      "Studio TTS, AI dubbing, voice cloning, and TTS APIs for agents and content",
    );
  }

  const { error: updErr } = await sb
    .from("tools")
    .update({
      name: "Murf AI",
      official_url: AFFILIATE,
      api_docs_url: "https://murf.ai/api",
      summary:
        "AI voice & conversational agent platform — Studio TTS for content, voice agents, dubbing, and TTS APIs.",
      description:
        "Murf AI is a voice AI platform for studio-quality text-to-speech, AI dubbing, voice cloning, and conversational voice agents. Use Murf Studio for content voiceovers (200+ voices), build customer support / sales / reservation agents, and integrate fast TTS / speech APIs into products. Partner referral link credits signups when users start via the tracked URL.",
      keywords,
      strengths,
      pricing_model: "Freemium",
      price_display: "Free tier · paid Studio / API / Agents plans",
      api_available: true,
      logo_url: `https://www.google.com/s2/favicons?sz=128&domain=${encodeURIComponent("murf.ai")}`,
      last_verified_at: today,
      updated_at: new Date().toISOString(),
    })
    .eq("id", tool.id);
  if (updErr) throw updErr;
  console.log(`[update] murf -> ${AFFILIATE}`);

  const sourceId = await ensureSource(sb, AFFILIATE);
  await sb.from("tool_sources").upsert({
    tool_id: tool.id,
    source_id: sourceId,
    claim_key: "affiliate",
    verified_at: today,
  });

  const catAudio = await sb
    .from("categories")
    .select("id")
    .eq("slug", "audio-music")
    .maybeSingle();
  if (catAudio.data?.id) {
    await sb.from("tool_categories").upsert({
      tool_id: tool.id,
      category_id: catAudio.data.id,
      is_primary: true,
    });
  }

  const newsSlug = "murf-ai-partner-deal";
  const newsPayload = {
    title: "Murf AI partner offer — Studio TTS, agents, dubbing & API",
    slug: newsSlug,
    kind: "access",
    event_type: "product_advance",
    published_at: "2026-11-23",
    solution_slug: "murf",
    source_url: AFFILIATE,
    summary:
      "Murf AI partner referral is live: start with Studio TTS, conversational voice agents, AI dubbing, and TTS APIs via the tracked partner link.",
    body: `## What it is
**Murf AI** is a voice platform for:
- **Studio** — studio-quality TTS / voiceovers (200+ voices)
- **Voice agents** — support, sales, reservations, and more
- **AI dubbing** — localize video audio
- **TTS API** — fast natural speech for agents and apps

## Partner link
Use the AI Discov partner referral: [get.murf.ai/z72xb1oikg7m](${AFFILIATE})

Signups through this link are credited to the partner program. Confirm current plans and free-tier limits on Murf.

## Sources
- [Murf AI](${AFFILIATE})`,
    status: "published",
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await sb
    .from("news_items")
    .select("id")
    .eq("slug", newsSlug)
    .maybeSingle();

  let newsId = existing?.id;
  if (newsId) {
    const { error: nErr } = await sb
      .from("news_items")
      .update(newsPayload)
      .eq("id", newsId);
    if (nErr) throw nErr;
    console.log(`[news update] ${newsSlug}`);
  } else {
    const { data: row, error: nErr } = await sb
      .from("news_items")
      .insert(newsPayload)
      .select("id")
      .single();
    if (nErr) throw nErr;
    newsId = row.id;
    console.log(`[news insert] ${newsSlug}`);
  }

  await sb.from("news_tool_links").delete().eq("news_item_id", newsId);
  await sb.from("news_tool_links").insert({
    news_item_id: newsId,
    tool_id: tool.id,
  });

  // Link as alternative to ElevenLabs family
  for (const slug of ["elevenlabs", "elevencreative", "elevenagents", "elevenapi"]) {
    const { data: t } = await sb.from("tools").select("id").eq("slug", slug).maybeSingle();
    if (!t?.id) continue;
    const { data: rel } = await sb
      .from("tool_relations")
      .select("source_tool_id")
      .eq("source_tool_id", tool.id)
      .eq("target_tool_id", t.id)
      .eq("relation_type", "alternative")
      .maybeSingle();
    if (rel) continue;
    await sb.from("tool_relations").insert({
      source_tool_id: tool.id,
      target_tool_id: t.id,
      relation_type: "alternative",
    });
  }

  console.log(`done -> /tools/murf`);
  console.log(`done -> /deals (murf)`);
  console.log(`done -> /latest/${newsSlug}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
