/**
 * Catalog + Latest: Mistral Vibe Desktop (macOS / Windows) + LECHONK Europe Pro offer
 * Usage: node scripts/seed_mistral_vibe_desktop.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SLUG = "mistral-vibe";
const SITE = "https://mistral.ai/products/vibe/";
const PRICING = "https://mistral.ai/pricing/";

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
  name: "Mistral Vibe",
  slug: SLUG,
  publisher: "Mistral AI",
  url: SITE,
  api_docs_url: null,
  repository_url: null,
  summary:
    "Mistral’s chat + coding agent — now on Desktop for macOS and Windows. Run agents locally or remotely and ship from your machine. Europe builders can try Pro free with code LECHONK.",
  description: `Mistral Vibe is Mistral AI’s product for chat and agentic coding (evolution of Le Chat). It pairs Mistral models — including open frontier stacks nicknamed Le Chonk / Mistral Large 4 — with a harness for multi-step coding work.

**Desktop (macOS & Windows):** Vibe is available as a native desktop app so you can run agents locally or remotely and ship from your machine. Desktop highlights include parallel agents, watching them work side by side, and reviewing diffs / pull requests in one workspace — alongside web, CLI, and editor surfaces.

**Pricing:** Freemium with a Pro plan (reported ~$14.99/mo). Developers building in Europe can try the Pro plan free with promo code **LECHONK** (limited, terms apply — confirm live on Mistral).`,
  pricing_model: "Freemium",
  price_display: "Free · Pro ~$14.99/mo · LECHONK Europe trial",
  open_source: false,
  api_available: false,
  local_available: true,
  keywords: [
    "mistral vibe",
    "vibe desktop",
    "le chat",
    "lechonk",
    "mistral large 4",
    "coding agent",
    "macos",
    "windows",
    "parallel agents",
  ],
  strengths: [
    "Native Desktop app for macOS and Windows",
    "Run agents locally or remotely from your machine",
    "Parallel agents + diffs / PRs in one workspace",
    "Europe Pro trial via coupon LECHONK (when available)",
  ],
  limits: [
    "Pro coupon LECHONK is Europe-focused, limited, and can sell out",
    "Desktop feature set may differ from web / CLI / IDE extensions",
    "Confirm current pricing and eligibility on mistral.ai",
  ],
  audience: [
    "Developers on Mac or Windows",
    "Teams wanting European open-model coding agents",
    "Builders comparing agent harnesses",
  ],
  categories: ["coding-development", "automation-agents", "ai-assistants"],
  type: "agent",
  platforms: ["macos", "windows", "web"],
  featureKeys: [
    "code_assistance",
    "agents_automation",
    "text_generation",
    "tool_calling",
    "local_deploy",
  ],
  alternatives: ["claude-code", "cursor", "github-copilot", "windsurf", "aider"],
};

const ITEM = {
  title: "Mistral Vibe Desktop launches for macOS and Windows — LECHONK Pro free in Europe",
  slug: "mistral-vibe-desktop-lechonk",
  kind: "feature",
  published_at: "2026-11-18",
  solution_slug: SLUG,
  source_url: SITE,
  summary:
    "Mistral Vibe is now on Desktop for macOS and Windows — run agents locally or remotely and ship from your machine. Developers building in Europe can try the Pro plan free with coupon code LECHONK.",
  body: `## What changed
**Mistral Vibe** is now available on **Desktop** for **macOS** and **Windows**.

You can run agents **locally or remotely** and start shipping straight from your machine — not only from the browser.

### Desktop highlights
- Native app on **MacOS** and **Windows**
- Agents **local** or **remote**
- Parallel agent workflows (ship multiple tasks, review diffs / PRs)

## Deal — Pro free in Europe (LECHONK)
If you’re **building in Europe**, you can try the **Pro** plan for free with coupon code:

\`\`\`
LECHONK
\`\`\`

- **Product:** [Mistral Vibe](${SITE})
- **Offer:** Pro trial / free period for Europe builders (confirm live terms)
- **Code:** **LECHONK**
- Limited availability — redeem on Mistral’s site before it sells out

## How to try it
1. Download / open **Vibe Desktop** from [mistral.ai/products/vibe](${SITE})
2. Sign in and start an agent locally or remotely
3. (Europe) Apply code **LECHONK** on the Pro plan if still available

## Why it matters
- Moves Mistral’s agent harness onto the desktop where many developers live
- Couples the Desktop launch with a clear Europe-friendly Pro promo
- Useful for teams evaluating Mistral vs US coding agents on Mac/Windows

## Sources
- [Mistral Vibe](${SITE})
- [Mistral pricing](${PRICING})`,
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
  const logo = `https://www.google.com/s2/favicons?sz=128&domain=${encodeURIComponent("mistral.ai")}`;

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
    repository_url: TOOL.repository_url,
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
  } else {
    const fallback = await idBySlug(sb, "solution_types", "tool");
    if (fallback) {
      await sb.from("tool_types").upsert({
        tool_id: toolId,
        solution_type_id: fallback,
        is_primary: true,
      });
    }
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
      plan_name: "Free",
      price_amount: 0,
      currency: "USD",
      billing_period: "custom",
      pricing_model: "Free",
      verified_at: today,
    },
    {
      tool_id: toolId,
      plan_name: "Vibe Pro",
      price_amount: 14.99,
      currency: "USD",
      billing_period: "month",
      pricing_model: "Subscription",
      limits_json: {
        note: "Europe builders: try Pro free with code LECHONK when available",
      },
      verified_at: today,
    },
    {
      tool_id: toolId,
      plan_name: "LECHONK — Europe Pro trial",
      price_amount: 0,
      currency: "USD",
      billing_period: "custom",
      pricing_model: "Free",
      limits_json: {
        note: "Promo code LECHONK — Europe builders; limited / confirm on site",
      },
      verified_at: today,
    },
  ]);

  await sb.from("tool_sources").delete().eq("tool_id", toolId);
  for (const [url, claim] of [
    [SITE, "general"],
    [PRICING, "pricing"],
  ]) {
    const sid = await ensureSource(sb, url);
    const { error } = await sb.from("tool_sources").insert({
      tool_id: toolId,
      source_id: sid,
      claim_key: claim,
      verified_at: today,
    });
    if (error) console.warn(`[source] ${error.message}`);
  }

  for (const alt of TOOL.alternatives) {
    const altId = await idBySlug(sb, "tools", alt);
    if (!altId) continue;
    const { data: existingRel } = await sb
      .from("tool_relations")
      .select("source_tool_id")
      .eq("source_tool_id", toolId)
      .eq("target_tool_id", altId)
      .eq("relation_type", "alternative")
      .maybeSingle();
    if (existingRel) continue;
    const { error } = await sb.from("tool_relations").insert({
      source_tool_id: toolId,
      target_tool_id: altId,
      relation_type: "alternative",
      explanation: "Coding agent / AI IDE alternative",
    });
    if (error) console.warn(`[rel ${alt}] ${error.message}`);
    else console.log(`[alt] ${alt}`);
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
  console.log(`done -> /tools/${SLUG}`);
  console.log(`done -> /latest/${ITEM.slug}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
