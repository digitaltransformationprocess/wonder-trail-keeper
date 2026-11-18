/**
 * Enrich Google Colab catalog page: notebooks + GPU/TPU + API/MCP + pricing + alternatives.
 * Usage: node scripts/seed_google_colab_improve.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SLUG = "google-colab";

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

const SITE = "https://colab.research.google.com";
const SIGNUP = "https://colab.research.google.com/signup";
const API_DOCS = "https://developers.google.com/colab";
const MCP_DOCS = "https://developers.google.com/colab/api/reference/mcp";
const ANNOUNCE =
  "https://medium.com/google-colab/the-google-colab-api-and-mcp-endpoint-for-developers-and-agents-65cfef497056";

const TOOL = {
  name: "Google Colab",
  slug: SLUG,
  publisher: "Google",
  url: SITE,
  api_docs_url: API_DOCS,
  summary:
    "Hosted Jupyter notebooks with free and paid GPUs/TPUs — plus a Colab API and hosted MCP endpoint for agent compute, runtime management, and headless Python execution.",
  description: `Google Colab is Google’s hosted Jupyter environment for ML and data work: write and run Python in the browser, attach free or paid accelerators (GPU / TPU), and share notebooks from Drive.

For builders and agents, Colab now exposes a public Colab API and a hosted MCP endpoint (colaboratory.googleapis.com/mcp). You can provision runtimes, list hardware specs (including Pro / Pro+ accelerators such as H100 or TPU v6e by tier), query subscription state, and execute code headlessly — useful for editor integrations (e.g. the official VS Code Colab extension) and agent harnesses.

Pricing is freemium: a free tier with usage limits and queues, Colab Pro and Pro+ subscriptions for more compute and priority, and optional pay-as-you-go compute units. Exact GPU access, session limits, and prices change over time — confirm on Colab’s signup and billing pages before committing.`,
  pricing_model: "Freemium",
  price_display: "Free · Pro ~$10/mo · Pro+ ~$50/mo · PAYG units",
  open_source: false,
  api_available: true,
  local_available: false,
  keywords: [
    "google colab",
    "colaboratory",
    "jupyter",
    "notebooks",
    "gpu",
    "tpu",
    "colab api",
    "mcp",
    "agents",
    "machine learning",
    "python",
    "free gpu",
  ],
  strengths: [
    "Zero-setup Jupyter in the browser with Drive sharing",
    "Free GPU/TPU tier for learning and light experiments",
    "Pro / Pro+ tiers unlock stronger accelerators and priority",
    "Public Colab API + hosted MCP for agents and headless runs",
    "Official editor integrations (e.g. VS Code Colab extension)",
  ],
  limits: [
    "Free tier: session timeouts, queues, and variable GPU availability",
    "Not a replacement for always-on production GPU clusters",
    "API / MCP need Google Cloud OAuth and Colab API enabled",
    "Paid plan prices and accelerator SKUs change — verify on signup",
  ],
  audience: [
    "Students and researchers",
    "ML / data science practitioners",
    "AI agent builders",
    "Educators and notebook-first teams",
  ],
  categories: [
    "coding-development",
    "research-education",
    "automation-agents",
    "mcp",
  ],
  type: "tool",
  platforms: ["web", "python", "vscode"],
  featureKeys: [
    "api_access",
    "agents_automation",
    "code_assistance",
    "team_collab",
    "tool_calling",
  ],
  alternatives: [
    "lightning-ai",
    "runpod",
    "vast-ai",
    "modal",
    "replicate",
    "huggingface",
    "vertex-ai",
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

  const { data: bySlug } = await sb
    .from("tools")
    .select("id, logo_url")
    .eq("slug", SLUG)
    .maybeSingle();
  if (!bySlug?.id) {
    console.error("Tool not found:", SLUG);
    process.exit(1);
  }

  const publisherId = await ensurePublisher(sb, TOOL.publisher);
  const today = new Date().toISOString().slice(0, 10);
  const logo =
    bySlug.logo_url ||
    `https://www.google.com/s2/favicons?sz=128&domain=${encodeURIComponent("colab.research.google.com")}`;

  const { error: updErr } = await sb
    .from("tools")
    .update({
      name: TOOL.name,
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
      status: "published",
      updated_at: new Date().toISOString(),
    })
    .eq("id", bySlug.id);
  if (updErr) throw updErr;
  console.log(`[update] ${SLUG}`);

  for (let i = 0; i < TOOL.categories.length; i++) {
    const catId = await idBySlug(sb, "categories", TOOL.categories[i]);
    if (!catId) {
      console.warn(`[skip cat] ${TOOL.categories[i]}`);
      continue;
    }
    await sb.from("tool_categories").upsert({
      tool_id: bySlug.id,
      category_id: catId,
      is_primary: i === 0,
    });
  }

  const typeId = await idBySlug(sb, "solution_types", TOOL.type);
  if (typeId) {
    await sb.from("tool_types").upsert({
      tool_id: bySlug.id,
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
      tool_id: bySlug.id,
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
      tool_id: bySlug.id,
      feature_id: f.id,
      availability: "available",
    });
  }

  await sb.from("pricing_plans").delete().eq("tool_id", bySlug.id);
  await sb.from("pricing_plans").insert([
    {
      tool_id: bySlug.id,
      plan_name: "Free",
      price_amount: 0,
      currency: "USD",
      billing_period: "custom",
      pricing_model: "Free",
      limits_json: {
        note: "Limited GPU/TPU sessions, queues, and idle timeouts",
      },
      verified_at: today,
    },
    {
      tool_id: bySlug.id,
      plan_name: "Colab Pro",
      price_amount: 9.99,
      currency: "USD",
      billing_period: "month",
      pricing_model: "Subscription",
      limits_json: {
        note: "More compute + priority vs free; confirm current price on signup",
      },
      verified_at: today,
    },
    {
      tool_id: bySlug.id,
      plan_name: "Colab Pro+",
      price_amount: 49.99,
      currency: "USD",
      billing_period: "month",
      pricing_model: "Subscription",
      limits_json: {
        note: "Highest priority / stronger accelerators by tier; confirm on signup",
      },
      verified_at: today,
    },
    {
      tool_id: bySlug.id,
      plan_name: "Pay As You Go (compute units)",
      price_amount: null,
      currency: "USD",
      billing_period: "usage",
      pricing_model: "Usage-based",
      limits_json: {
        note: "Optional compute units on top of subscription — see Colab billing",
      },
      verified_at: today,
    },
  ]);
  console.log("[pricing] 4 plans");

  await sb.from("tool_sources").delete().eq("tool_id", bySlug.id);
  for (const [url, claim] of [
    [SITE, "general"],
    [SIGNUP, "pricing"],
    [API_DOCS, "api"],
    [MCP_DOCS, "api"],
    [ANNOUNCE, "general"],
  ]) {
    const sid = await ensureSource(sb, url);
    const { error } = await sb.from("tool_sources").insert({
      tool_id: bySlug.id,
      source_id: sid,
      claim_key: claim,
      verified_at: today,
    });
    if (error) console.warn(`[source ${claim}] ${error.message}`);
  }

  // Avoid duplicate claim_key if unique — keep one api source as API docs, MCP as separate if allowed
  // If insert failed on duplicate claim, leave first api and skip

  for (const alt of TOOL.alternatives) {
    const altId = await idBySlug(sb, "tools", alt);
    if (!altId) {
      console.warn(`[skip alt] ${alt}`);
      continue;
    }
    const { data: existing } = await sb
      .from("tool_relations")
      .select("source_tool_id")
      .eq("source_tool_id", bySlug.id)
      .eq("target_tool_id", altId)
      .eq("relation_type", "alternative")
      .maybeSingle();
    if (existing) {
      console.log(`[alt exists] ${alt}`);
      continue;
    }
    const { error } = await sb.from("tool_relations").insert({
      source_tool_id: bySlug.id,
      target_tool_id: altId,
      relation_type: "alternative",
      explanation: "Cloud notebook / GPU compute alternative",
    });
    if (error) console.warn(`[rel ${alt}] ${error.message}`);
    else console.log(`[alt] ${alt}`);
  }

  const { data: out } = await sb
    .from("tools")
    .select(
      "slug,name,api_available,api_docs_url,price_display,summary,last_verified_at",
    )
    .eq("id", bySlug.id)
    .single();
  console.log(JSON.stringify(out, null, 2));
  console.log(`done -> /tools/${SLUG}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
