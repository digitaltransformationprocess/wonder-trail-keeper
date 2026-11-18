/**
 * Enrich Semantic Scholar catalog page with API details + docs links.
 * Usage: node scripts/seed_semantic_scholar_improve.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SLUG = "semantic-scholar";

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

const API_OVERVIEW = "https://www.semanticscholar.org/product/api";
const API_DOCS = "https://api.semanticscholar.org/api-docs/";
const DATASETS_DOCS = "https://api.semanticscholar.org/api-docs/datasets";
const SITE = "https://www.semanticscholar.org";

const TOOL = {
  name: "Semantic Scholar",
  slug: SLUG,
  publisher: "Allen Institute for AI (AI2)",
  url: SITE,
  api_docs_url: API_DOCS,
  summary:
    "AI-powered academic search over 200M+ papers — free web discovery plus a free Academic Graph / Recommendations / Datasets API for authors, citations, embeddings, and bulk research data.",
  description: `Semantic Scholar (Allen Institute for AI) is a free AI research discovery engine for scientific literature — paper search, author pages, citation graphs, TLDRs, and related work across STEM and beyond.

Developers can use the free Semantic Scholar Academic Graph API (S2AG) for REST access to papers, authors, citations, venues, SPECTER2 embeddings, recommendations, and bulk datasets (S2AG + S2ORC). Most endpoints work without a key (shared public rate pool); a free API key (x-api-key) unlocks dedicated introductory limits (~1 RPS), with higher limits available after review.

Corpus scale cited by Semantic Scholar: ~214M papers, ~2.49B citations, ~79M authors (figures change over time). Data releases use ODC-BY with attribution. Widely used by tools such as Connected Papers and Litmaps.`,
  pricing_model: "Free",
  price_display: "Free web · Free API (rate limits)",
  open_source: false,
  api_available: true,
  local_available: false,
  keywords: [
    "semantic scholar",
    "academic graph",
    "s2ag",
    "citation api",
    "paper search",
    "research api",
    "allenai",
    "specter2",
    "s2orc",
    "scholarly data",
  ],
  strengths: [
    "Free Academic Graph API for papers, authors, citations, venues",
    "Recommendations API + SPECTER2 embeddings",
    "Bulk Datasets API (S2AG / S2ORC) for offline / high-volume use",
    "OpenAPI docs at api.semanticscholar.org — easy for agents and RAG pipelines",
  ],
  limits: [
    "Unauthenticated traffic shares a public rate pool and can be throttled",
    "API key intro limit ~1 request/second; higher limits need review",
    "Not a replacement for full-text publisher access on every paper",
    "Commercial / high-volume use should follow ODC-BY attribution terms",
  ],
  audience: [
    "Researchers and students",
    "AI / RAG developers",
    "Literature discovery startups",
    "Bibliometrics / science-of-science teams",
  ],
  categories: ["research-education", "data-analytics", "automation-agents"],
  type: "api",
  platforms: ["web", "python", "javascript"],
  featureKeys: [
    "api_access",
    "rag_knowledge",
    "structured_output",
    "agents_automation",
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
    console.error("Tool not found — insert path unexpected");
    process.exit(1);
  }

  const publisherId = await ensurePublisher(sb, TOOL.publisher);
  const today = new Date().toISOString().slice(0, 10);
  const logo =
    bySlug.logo_url ||
    `https://www.google.com/s2/favicons?sz=128&domain=${encodeURIComponent("semanticscholar.org")}`;

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
  } else {
    // Prefer search/tool type if "api" missing
    const fallback = await idBySlug(sb, "solution_types", "tool");
    if (fallback) {
      await sb.from("tool_types").upsert({
        tool_id: bySlug.id,
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
      plan_name: "Web search (free)",
      price_amount: 0,
      currency: "USD",
      billing_period: "custom",
      pricing_model: "Free",
      verified_at: today,
    },
    {
      tool_id: bySlug.id,
      plan_name: "Academic Graph API (free, rate-limited)",
      price_amount: 0,
      currency: "USD",
      billing_period: "usage",
      pricing_model: "Free",
      verified_at: today,
    },
    {
      tool_id: bySlug.id,
      plan_name: "Datasets API / S2ORC bulk (free + attribution)",
      price_amount: 0,
      currency: "USD",
      billing_period: "custom",
      pricing_model: "Free",
      verified_at: today,
    },
  ]);

  // Replace sources to avoid duplicate "api" rows
  await sb.from("tool_sources").delete().eq("tool_id", bySlug.id);
  for (const [url, claim] of [
    [SITE, "general"],
    [API_DOCS, "api"],
  ]) {
    const sid = await ensureSource(sb, url);
    await sb.from("tool_sources").insert({
      tool_id: bySlug.id,
      source_id: sid,
      claim_key: claim,
      verified_at: today,
    });
  }

  // Alternatives if present
  for (const alt of ["openalex", "google-scholar", "consensus", "elicit", "researchrabbit"]) {
    const altId = await idBySlug(sb, "tools", alt);
    if (!altId) continue;
    const { data: existing } = await sb
      .from("tool_relations")
      .select("source_tool_id")
      .eq("source_tool_id", bySlug.id)
      .eq("target_tool_id", altId)
      .eq("relation_type", "alternative")
      .maybeSingle();
    if (existing) continue;
    const { error } = await sb.from("tool_relations").insert({
      source_tool_id: bySlug.id,
      target_tool_id: altId,
      relation_type: "alternative",
    });
    if (error) console.warn(`[rel ${alt}] ${error.message}`);
    else console.log(`[alt] ${alt}`);
  }

  const { data: out } = await sb
    .from("tools")
    .select("slug,name,api_available,api_docs_url,price_display,summary")
    .eq("id", bySlug.id)
    .single();
  console.log(JSON.stringify(out, null, 2));
  console.log(`done -> /tools/${SLUG}`);
  console.log(`API overview: ${API_OVERVIEW}`);
  console.log(`API docs: ${API_DOCS}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
