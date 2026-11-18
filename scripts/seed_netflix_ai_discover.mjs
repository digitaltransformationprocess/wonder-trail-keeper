/**
 * Catalog + Latest: Netflix AI Discover (TV recommendation tab)
 * Usage: node scripts/seed_netflix_ai_discover.mjs
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

const SITE = "https://about.netflix.com/en/news/introducing-ai-discover";

const TOOL = {
  name: "Netflix AI Discover",
  slug: "netflix-ai-discover",
  publisher: "Netflix",
  url: SITE,
  api_docs_url: null,
  summary:
    "Netflix TV tab that uses AI themes and real-time feedback to help members find what to watch next — mood, crew, time available, and tunable recommendations.",
  description: `Netflix AI Discover is a new Discover tab on the Netflix TV app (announced November 3, 2026). A limited set of US English members can try early AI-powered discovery experiences inside Netflix — separate from the classic personalized rows built on Thumbs Up and My List.

The first experience is theme-based: pick a vibe (“Something Light,” “Scare Me”), a social context (“Family Movie Night”), or a time box (“Quick Watches”), previewed with clips. Choosing a theme returns matching titles; you can drill into more specific themes or tap “Something Different.” Each title offers “Tune Your Recommendations” next to Play and My List so you can keep a pick or ask AI Discover not to show it again.

Netflix describes AI Discover as a “test kitchen”: AI helps generate themes and explain results, powered by a new intelligence layer that adapts in real time to member feedback. Successful experiments may later land in the main Netflix experience. Rollout starts on supported TVs in the US for English-language members, expanding gradually. Look for “Discover” with a red gem icon and a “New” label in the TV top nav when you have access.

Note: This is Netflix’s entertainment discovery feature — not related to AI Discov (aidiscov.com), the AI tools catalog.`,
  pricing_model: "Paid",
  price_display: "Included with Netflix · limited TV rollout",
  open_source: false,
  api_available: false,
  local_available: false,
  keywords: [
    "netflix ai discover",
    "ai discover",
    "netflix discover tab",
    "theme recommendations",
    "tv app",
    "what to watch",
    "netflix ai",
  ],
  strengths: [
    "Theme-first discovery (mood, crew, time) beyond classic rows",
    "Real-time tune / don’t-recommend-again feedback in the tab",
    "Clip previews help choose themes quickly on TV",
    "Netflix positions it as an experimental test kitchen for discovery UX",
  ],
  limits: [
    "Limited US English TV rollout — not all members or devices yet",
    "No public API; tied to the Netflix subscription and TV app",
    "Not a general AI tools catalog (distinct from AI Discov / aidiscov.com)",
    "Feature set may change as Netflix keeps or drops experiments",
  ],
  audience: [
    "Netflix TV members (US English, supported devices)",
    "Product / UX teams watching AI recommendation UIs",
    "Entertainment & media analysts",
  ],
  categories: ["ai-assistants", "automation-agents", "productivity"],
  type: "tool",
  platforms: ["web"],
  featureKeys: ["agents_automation", "multimodal", "team_collab"],
};

const ITEM = {
  title: "Netflix launches AI Discover — theme-based TV discovery tab",
  slug: "netflix-ai-discover-launch",
  kind: "new_tool",
  published_at: "2026-11-03",
  solution_slug: TOOL.slug,
  source_url: SITE,
  summary:
    "Netflix introduced AI Discover, a new TV-app Discover tab where US English members can browse AI-generated themes (mood, family night, quick watches), tune recommendations in real time, and explore an experimental intelligence layer for what to watch next.",
  body: `## What changed
On **November 3, 2026**, Netflix announced **AI Discover** — a new **Discover** tab on the **TV app** for a small group of members to try new ways to find their next watch.

### How the first experience works
1. **Start with a theme** — moods (“Something Light,” “Scare Me”), crew (“Family Movie Night”), time (“Quick Watches”), plus new / popular / recent-watching themes, each previewed with a clip
2. **See gathered titles** — theme selection returns matching recommendations
3. **Go deeper** — more specific themes, or **Something Different** for a fresh set
4. **Tune your picks** — **Tune Your Recommendations** next to Play / My List to keep a title or stop recommending it in AI Discover

AI helps create themes and explain results. Netflix calls AI Discover a **test kitchen**: feedback decides what stays, improves, or later ships into the main Netflix experience. It runs on a new **intelligence layer** that responds to member input in real time.

## Availability
- **Where:** supported **TVs**
- **Who (start):** US members using Netflix in **English**
- **Rollout:** gradual expansion over coming weeks
- **UI cue:** **Discover** with a red gem icon and a **New** label in the top nav

## Why it matters
- Streaming discovery is moving from static rows toward **conversational / theme** AI UX on the living-room screen
- Clear product naming: **Netflix AI Discover** (entertainment) vs **AI Discov** (aidiscov.com — AI tools catalog) — same words, different jobs
- Signal for how large consumer apps ship AI “labs” tabs before promoting winners into the main UI

## Sources
- [Introducing AI Discover — About Netflix](${SITE})
- [Netflix Help Center](https://help.netflix.com/) (search “AI Discover” for device eligibility)`,
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

async function upsertTool(sb) {
  const publisherId = await ensurePublisher(sb, TOOL.publisher);
  const today = new Date().toISOString().slice(0, 10);
  const logo = `https://www.google.com/s2/favicons?sz=128&domain=${encodeURIComponent("netflix.com")}`;

  const { data: existing } = await sb
    .from("tools")
    .select("id")
    .eq("slug", TOOL.slug)
    .maybeSingle();

  const payload = {
    name: TOOL.name,
    slug: TOOL.slug,
    publisher_id: publisherId,
    summary: TOOL.summary,
    description: TOOL.description,
    official_url: TOOL.url,
    api_docs_url: TOOL.api_docs_url,
    logo_url: logo,
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

  let toolId = existing?.id;
  if (toolId) {
    const { error } = await sb.from("tools").update(payload).eq("id", toolId);
    if (error) throw error;
    console.log(`[tool update] ${TOOL.slug}`);
  } else {
    const { data, error } = await sb
      .from("tools")
      .insert({ ...payload, status: "pending_review" })
      .select("id")
      .single();
    if (error) throw error;
    toolId = data.id;
    console.log(`[tool insert] ${TOOL.slug}`);
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

  for (const key of TOOL.platforms) {
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
      plan_name: "Netflix subscription (AI Discover tab)",
      price_amount: null,
      currency: "USD",
      billing_period: "month",
      pricing_model: "Included",
      limits_json: {
        note: "Limited US English TV rollout; included with eligible Netflix plans",
      },
      verified_at: today,
    },
  ]);

  await sb.from("tool_sources").delete().eq("tool_id", toolId);
  {
    const sid = await ensureSource(sb, SITE);
    const { error } = await sb.from("tool_sources").insert({
      tool_id: toolId,
      source_id: sid,
      claim_key: "general",
      verified_at: today,
    });
    if (error) console.warn(`[source] ${error.message}`);
  }

  const { error: pubErr } = await sb
    .from("tools")
    .update({ status: "published", updated_at: new Date().toISOString() })
    .eq("id", toolId);
  if (pubErr) throw pubErr;
  console.log(`[tool published] ${TOOL.slug}`);

  return toolId;
}

async function upsertLatest(sb, toolId) {
  const { data: existing } = await sb
    .from("news_items")
    .select("id")
    .eq("slug", ITEM.slug)
    .maybeSingle();

  const payload = {
    title: ITEM.title,
    slug: ITEM.slug,
    summary: ITEM.summary,
    body: ITEM.body,
    kind: ITEM.kind,
    event_type: "product_advance",
    published_at: ITEM.published_at,
    source_url: ITEM.source_url,
    solution_slug: ITEM.solution_slug,
    status: "published",
    updated_at: new Date().toISOString(),
  };

  let newsId = existing?.id;
  if (newsId) {
    const { error } = await sb.from("news_items").update(payload).eq("id", newsId);
    if (error) throw error;
    console.log(`[latest update] ${ITEM.slug}`);
  } else {
    const { data, error } = await sb
      .from("news_items")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw error;
    newsId = data.id;
    console.log(`[latest insert] ${ITEM.slug}`);
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
  const sb = createClient(
    env.VITE_SUPABASE_URL || env.SUPABASE_URL,
    env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } },
  );

  const toolId = await upsertTool(sb);
  await upsertLatest(sb, toolId);

  console.log(`done -> /tools/${TOOL.slug}`);
  console.log(`done -> /latest/${ITEM.slug}`);
  console.log(`source -> ${SITE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
