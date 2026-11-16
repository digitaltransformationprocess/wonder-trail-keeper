/**
 * Add Okara (AI CMO) as a published catalog tool.
 * Usage: node scripts/seed_okara.mjs
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
  name: "Okara",
  slug: "okara",
  publisher: "Okara",
  url: "https://okara.ai/",
  api_docs_url: "https://okara.ai/docs",
  summary:
    "AI CMO that researches your brand, then runs specialized agents for SEO, GEO, Reddit, X, LinkedIn, influencers, UGC video, and coding fixes.",
  description:
    "Okara is an AI CMO for growth and marketing. It first builds strategy docs from your site (product info, marketing strategy, competitor analysis, brand voice, content strategy), then specialized agents execute channel by channel: Influencer, Reddit, SEO, Writer, X, LinkedIn, GEO (AI search citations), Coding (GitHub PRs for technical SEO/GEO), and UGC Videos. Connects to Search Console and Analytics; publishes to WordPress, Webflow, Framer, Wix, HubSpot, Sanity, GitHub, and social. Can also be driven from ChatGPT, Claude, or Cursor via a shared link / MCP (Enterprise). Free trial on paid plans; Lite $129/mo, Pro $249/mo (lower annually), Enterprise custom. Both Lite and Pro include 2,000 monthly credits.",
  pricing_model: "Paid",
  price_display: "Lite $129/mo · Pro $249/mo",
  open_source: false,
  api_available: false,
  local_available: false,
  keywords: [
    "okara",
    "ai cmo",
    "marketing agents",
    "seo",
    "geo",
    "aeo",
    "reddit",
    "linkedin",
    "influencer",
    "ugc",
  ],
  strengths: [
    "Full marketing agent suite under one AI CMO",
    "Strategy docs shared across agents so messaging stays consistent",
    "GEO for ChatGPT / Perplexity / Claude / Gemini visibility",
    "Publishes to CMS + social; coding agent ships SEO fixes as PRs",
  ],
  limits: [
    "Paid plans start at $129/mo — not a free forever tool",
    "Agent output still needs human review before publishing",
    "Credits (2,000/mo) can constrain heavy UGC / article volume",
  ],
  audience: ["Founders", "Marketing teams", "Growth / SEO leads"],
  categories: ["business-marketing", "writing-content", "automation-agents"],
  type: "agent",
  platforms: ["web"],
  featureKeys: ["agents_automation", "text_generation", "video_generation", "tool_calling"],
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
  await sb.from("pricing_plans").insert([
    {
      tool_id: toolId,
      plan_name: "AI CMO Lite",
      price_amount: 129,
      currency: "USD",
      billing_period: "monthly",
      pricing_model: "Paid",
      verified_at: today,
    },
    {
      tool_id: toolId,
      plan_name: "AI CMO Pro",
      price_amount: 249,
      currency: "USD",
      billing_period: "monthly",
      pricing_model: "Paid",
      verified_at: today,
    },
    {
      tool_id: toolId,
      plan_name: "Enterprise",
      price_amount: null,
      currency: "USD",
      billing_period: "custom",
      pricing_model: "Paid",
      verified_at: today,
    },
  ]);

  const pricingSrc = await ensureSource(sb, "https://okara.ai/pricing");
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

  await upsertTool(sb, TOOL);
  console.log(`done -> /tools/${TOOL.slug}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
