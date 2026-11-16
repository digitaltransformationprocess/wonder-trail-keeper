/**
 * Split finance-legal → finance + legal, add popular tools, bump internal ranks
 * so home Top 10s put the best-known products first (search / industry signals).
 */
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv(path) {
  const env = {};
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
    env[k] = v;
  }
  return env;
}

function logoFor(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return `https://www.google.com/s2/favicons?domain=${host}&sz=128`;
  } catch {
    return null;
  }
}

/** Existing tools → target category (+ optional popularity 0–100). */
const REASSIGN = {
  // Legal (ILTA / search popularity)
  harvey: { cat: "legal", popularity: 98 },
  cocounsel: { cat: "legal", popularity: 96 },
  "lexis-plus-ai": { cat: "legal", popularity: 93 },
  ironclad: { cat: "legal", popularity: 90 },
  "docusign-iris": { cat: "legal", popularity: 88 },
  spellbook: { cat: "legal", popularity: 85 },
  legora: { cat: "legal", popularity: 84 },
  luminance: { cat: "legal", popularity: 80 },
  evisort: { cat: "legal", popularity: 78 },
  evenup: { cat: "legal", popularity: 74 },
  "kira-systems": { cat: "legal", popularity: 72 },
  "westlaw-ai": { cat: "legal", popularity: 86 },
  "paxton-ai": { cat: "legal", popularity: 68 },
  linksquares: { cat: "legal", popularity: 66 },
  "robin-ai": { cat: "legal", popularity: 64 },
  donotpay: { cat: "legal", popularity: 70 },
  // Finance
  hebbia: { cat: "finance", popularity: 92 },
  "ramp-ai": { cat: "finance", popularity: 86 },
  "vic-ai": { cat: "finance", popularity: 78 },
  "workday-illuminate": { cat: "finance", popularity: 82 },
};

const NEW_TOOLS = [
  {
    name: "Bloomberg Terminal",
    slug: "bloomberg-terminal",
    publisher: "Bloomberg",
    url: "https://www.bloomberg.com/professional/products/bloomberg-terminal/",
    summary:
      "Institutional market data terminal with ASKB conversational AI for research and analytics.",
    description:
      "Bloomberg Terminal is the industry-standard desktop for real-time market data, news, and analytics. Bloomberg AI / ASKB adds natural-language research, earnings summaries, and sourced answers across Terminal content.",
    pricing_model: "Paid",
    price_display: "Enterprise",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["markets", "terminal", "askb", "institutional", "data"],
    strengths: ["Unmatched data breadth", "Desk-standard workflow", "AskB AI agents"],
    limits: ["Very high seat cost", "Steep learning curve"],
    audience: ["Traders", "PMs", "Analysts"],
    categories: ["finance"],
    type: "platform",
    platforms: ["windows", "macos"],
    popularity: 99,
  },
  {
    name: "AlphaSense",
    slug: "alphasense",
    publisher: "AlphaSense",
    url: "https://www.alpha-sense.com",
    summary:
      "Enterprise market-intelligence search across filings, transcripts, research, and expert calls.",
    description:
      "AlphaSense indexes broker research, filings, earnings transcripts, and expert-network content with generative search and cited answers for investment and strategy teams.",
    pricing_model: "Paid",
    price_display: "Enterprise",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["research", "filings", "transcripts", "equity"],
    strengths: ["Deep primary-source corpus", "Cited generative answers"],
    limits: ["Enterprise pricing"],
    audience: ["Investors", "Strategy teams"],
    categories: ["finance", "research-education"],
    type: "platform",
    platforms: ["web"],
    popularity: 95,
  },
  {
    name: "Kensho",
    slug: "kensho",
    publisher: "S&P Global",
    url: "https://kensho.com",
    summary:
      "S&P Global’s AI/ML toolkit for event impact analysis, NLP, and financial data linking.",
    description:
      "Kensho applies machine learning to market and alternative data for scenario analysis, transcription, and entity-aware search, typically delivered with S&P Global data products.",
    pricing_model: "Paid",
    price_display: "Enterprise",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["sp-global", "quant", "scenarios", "nlp"],
    strengths: ["Institutional quant tooling", "S&P data adjacency"],
    limits: ["Usually tied to S&P stack"],
    audience: ["Quant teams", "Banks"],
    categories: ["finance", "data-analytics"],
    type: "platform",
    platforms: ["web"],
    popularity: 90,
  },
  {
    name: "FactSet",
    slug: "factset",
    publisher: "FactSet",
    url: "https://www.factset.com",
    summary:
      "Investment research and portfolio workstation with AI transcript and workflow automation.",
    description:
      "FactSet delivers market data, analytics, and research workflows for buy-side and sell-side teams, with AI features for transcripts, alerts, and research automation.",
    pricing_model: "Paid",
    price_display: "Enterprise",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["portfolio", "research", "workstation", "buy-side"],
    strengths: ["Research workstation depth", "API + desktop workflows"],
    limits: ["Enterprise contracts"],
    audience: ["Portfolio managers", "Analysts"],
    categories: ["finance"],
    type: "platform",
    platforms: ["web", "windows"],
    popularity: 91,
  },
  {
    name: "Koyfin",
    slug: "koyfin",
    publisher: "Koyfin",
    url: "https://www.koyfin.com",
    summary: "Modern financial data and charting platform with AI-assisted reporting.",
    description:
      "Koyfin provides equity and fund analytics, dashboards, and templated reporting aimed at PMs and research analysts, including AI-assisted charting and report generation.",
    pricing_model: "Freemium",
    price_display: "Free / Paid",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["charts", "equity", "dashboards", "research"],
    strengths: ["Clean modern UI", "Strong for equity research"],
    limits: ["Not a full Terminal replacement"],
    audience: ["Analysts", "PMs"],
    categories: ["finance", "data-analytics"],
    type: "tool",
    platforms: ["web"],
    popularity: 84,
  },
  {
    name: "Anaplan",
    slug: "anaplan",
    publisher: "Anaplan",
    url: "https://www.anaplan.com",
    summary: "Connected financial planning platform with scenario modeling and AI assist.",
    description:
      "Anaplan supports FP&A and enterprise planning with connected models, scenario analysis, and collaboration—used widely for budgeting, forecasting, and what-if planning.",
    pricing_model: "Paid",
    price_display: "Enterprise",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["fpa", "planning", "forecasting", "scenarios"],
    strengths: ["Enterprise planning standard", "Scenario modeling"],
    limits: ["Implementation heavy"],
    audience: ["FP&A", "Finance ops"],
    categories: ["finance"],
    type: "platform",
    platforms: ["web"],
    popularity: 87,
  },
  {
    name: "Fiscal.ai",
    slug: "fiscal-ai",
    publisher: "Fiscal.ai",
    url: "https://fiscal.ai",
    summary: "AI copilot for company financials, filings, and investor research.",
    description:
      "Fiscal.ai (formerly FinChat) offers NLP queries over financials, filings, and company KPIs for individual investors and analysts.",
    pricing_model: "Freemium",
    price_display: "Free / Paid",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["filings", "investor", "copilot", "financials"],
    strengths: ["Accessible research UX", "Filing + KPI focus"],
    limits: ["Retail/prosumer tilt vs Terminal depth"],
    audience: ["Investors", "Analysts"],
    categories: ["finance"],
    type: "tool",
    platforms: ["web"],
    popularity: 81,
  },
  {
    name: "Clio Duo",
    slug: "clio-duo",
    publisher: "Clio",
    url: "https://www.clio.com",
    summary: "Clio’s AI assistant for legal practice management and matter workflows.",
    description:
      "Clio Duo brings generative AI into Clio’s practice management suite for drafting, summarization, and matter productivity—widely used by small and mid-size firms.",
    pricing_model: "Paid",
    price_display: "Subscription",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["practice-management", "law-firms", "duo"],
    strengths: ["Large installed base", "Matter workflow fit"],
    limits: ["Best inside Clio ecosystem"],
    audience: ["Law firms"],
    categories: ["legal"],
    type: "platform",
    platforms: ["web"],
    popularity: 89,
  },
  {
    name: "Litera One",
    slug: "litera-one",
    publisher: "Litera",
    url: "https://www.litera.com",
    summary: "Legal drafting, review, and AI assistant suite for law firms.",
    description:
      "Litera One / Lito combines document drafting, comparison, and AI assistance used across law firms for transactional and litigation document workflows.",
    pricing_model: "Paid",
    price_display: "Enterprise",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["drafting", "document-review", "law-firms"],
    strengths: ["Firm document tooling", "ILTA visibility"],
    limits: ["Enterprise deployment"],
    audience: ["Law firms"],
    categories: ["legal"],
    type: "platform",
    platforms: ["windows", "web"],
    popularity: 83,
  },
  {
    name: "Eve",
    slug: "eve-legal",
    publisher: "Eve",
    url: "https://www.eve.legal",
    summary: "AI platform for plaintiff firms—case intake, demand letters, and litigation work.",
    description:
      "Eve helps plaintiff-side practices automate case assessment, document generation, and litigation workflows with AI.",
    pricing_model: "Paid",
    price_display: "Subscription",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["plaintiff", "litigation", "demand-letters"],
    strengths: ["Plaintiff-firm focus", "Rising legal-AI brand"],
    limits: ["Niche to plaintiff workflows"],
    audience: ["Plaintiff firms"],
    categories: ["legal"],
    type: "tool",
    platforms: ["web"],
    popularity: 76,
  },
];

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

async function ensurePublisher(sb, name) {
  const { data: existing } = await sb
    .from("publishers")
    .select("id")
    .eq("name", name)
    .maybeSingle();
  if (existing?.id) return existing.id;
  const { data, error } = await sb.from("publishers").insert({ name }).select("id").single();
  if (error) throw error;
  return data.id;
}

async function ensureSource(sb, url) {
  const { data: existing } = await sb.from("sources").select("id").eq("url", url).maybeSingle();
  if (existing?.id) return existing.id;
  let host = url;
  try {
    host = new URL(url).hostname;
  } catch {
    /* keep */
  }
  const { data, error } = await sb
    .from("sources")
    .insert({
      url,
      publisher: host,
      source_type: "official",
      reliability_level: "A",
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function ensureCategories(sb) {
  const finance = {
    slug: "finance",
    name: "Finance",
    description: "AI for markets, research, FP&A, payments, and financial operations.",
    sort_order: 14,
    is_active: true,
  };
  const legal = {
    slug: "legal",
    name: "Legal",
    description: "AI for legal research, contracts, practice management, and compliance.",
    sort_order: 15,
    is_active: true,
  };

  for (const cat of [finance, legal]) {
    const { data: existing } = await sb
      .from("categories")
      .select("id")
      .eq("slug", cat.slug)
      .maybeSingle();
    if (existing?.id) {
      await sb
        .from("categories")
        .update({
          name: cat.name,
          description: cat.description,
          sort_order: cat.sort_order,
          is_active: true,
        })
        .eq("id", existing.id);
      console.log(`[cat] updated ${cat.slug}`);
    } else {
      const { error } = await sb.from("categories").insert(cat);
      if (error) throw error;
      console.log(`[cat] created ${cat.slug}`);
    }
  }

  await sb
    .from("categories")
    .update({ is_active: false, sort_order: 99 })
    .eq("slug", "finance-legal");
  console.log("[cat] deactivated finance-legal");

  await sb.from("categories").update({ sort_order: 16 }).eq("slug", "healthcare");
  await sb.from("categories").update({ sort_order: 17 }).eq("slug", "robotics-hardware");
}

async function setPrimaryCategory(sb, toolId, categorySlug) {
  const catId = await idBySlug(sb, "categories", categorySlug);
  if (!catId) throw new Error(`Missing category ${categorySlug}`);

  // Drop link to old combined category if present
  const oldId = await idBySlug(sb, "categories", "finance-legal");
  if (oldId) {
    await sb
      .from("tool_categories")
      .delete()
      .eq("tool_id", toolId)
      .eq("category_id", oldId);
  }

  // Clear primary on other cats for this tool, then upsert target as primary
  await sb.from("tool_categories").update({ is_primary: false }).eq("tool_id", toolId);
  await sb.from("tool_categories").upsert({
    tool_id: toolId,
    category_id: catId,
    is_primary: true,
  });
}

async function bumpRank(sb, toolId, popularity) {
  const trust = 90;
  const rank_score = Math.min(100, Math.round(popularity * 0.65 + trust * 0.35));
  const { error } = await sb.from("tool_internal_ranks").upsert({
    tool_id: toolId,
    popularity,
    trust,
    rank_score,
    updated_at: new Date().toISOString(),
  });
  if (error) console.warn("[rank]", error.message);
}

async function upsertNewTool(sb, tool) {
  const { data: bySlug } = await sb
    .from("tools")
    .select("id")
    .eq("slug", tool.slug)
    .maybeSingle();

  let toolId = bySlug?.id ?? null;
  if (!toolId) {
    const publisherId = await ensurePublisher(sb, tool.publisher);
    const sourceId = await ensureSource(sb, tool.url);
    const { data: inserted, error } = await sb
      .from("tools")
      .insert({
        name: tool.name,
        slug: tool.slug,
        publisher_id: publisherId,
        summary: tool.summary,
        description: tool.description,
        official_url: tool.url,
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
        status: "pending_review",
        last_verified_at: new Date().toISOString().slice(0, 10),
      })
      .select("id")
      .single();
    if (error) throw error;
    toolId = inserted.id;

    const typeId = await idBySlug(sb, "solution_types", tool.type);
    if (typeId) {
      await sb.from("tool_types").upsert({
        tool_id: toolId,
        solution_type_id: typeId,
        is_primary: true,
      });
    }
    for (const raw of tool.platforms) {
      const platformId = await idByKey(sb, "platforms", raw);
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
      verified_at: new Date().toISOString().slice(0, 10),
    });
    console.log(`[tool] inserted ${tool.slug}`);
  } else {
    console.log(`[tool] exists ${tool.slug}`);
  }

  // Categories
  await sb.from("tool_categories").update({ is_primary: false }).eq("tool_id", toolId);
  for (let i = 0; i < tool.categories.length; i++) {
    const catId = await idBySlug(sb, "categories", tool.categories[i]);
    if (!catId) continue;
    const { error: catErr } = await sb.from("tool_categories").upsert({
      tool_id: toolId,
      category_id: catId,
      is_primary: i === 0,
    });
    if (catErr) console.warn(`[cat] ${tool.slug}:`, catErr.message);
  }
  const oldId = await idBySlug(sb, "categories", "finance-legal");
  if (oldId) {
    await sb
      .from("tool_categories")
      .delete()
      .eq("tool_id", toolId)
      .eq("category_id", oldId);
  }

  await bumpRank(sb, toolId, tool.popularity ?? 80);

  const { error: pubErr } = await sb
    .from("tools")
    .update({ status: "published", updated_at: new Date().toISOString() })
    .eq("id", toolId);
  if (pubErr) throw new Error(`publish ${tool.slug}: ${pubErr.message}`);
}

async function main() {
  const env = {
    ...loadEnv(join(ROOT, ".env.production")),
    ...loadEnv(join(ROOT, ".env")),
  };
  const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    console.error("Missing Supabase URL or secret key");
    process.exit(1);
  }
  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  await ensureCategories(sb);

  for (const [slug, cfg] of Object.entries(REASSIGN)) {
    const { data: tool } = await sb.from("tools").select("id").eq("slug", slug).maybeSingle();
    if (!tool) {
      console.warn(`[skip] missing ${slug}`);
      continue;
    }
    await setPrimaryCategory(sb, tool.id, cfg.cat);
    await bumpRank(sb, tool.id, cfg.popularity);
    console.log(`[reassign] ${slug} → ${cfg.cat} (pop ${cfg.popularity})`);
  }

  for (const tool of NEW_TOOLS) {
    try {
      await upsertNewTool(sb, tool);
    } catch (err) {
      console.error(`[fail] ${tool.slug}:`, err.message);
    }
  }

  const refreshed = await sb.rpc("refresh_tool_internal_ranks");
  if (refreshed.error) console.warn("[rank] refresh:", refreshed.error.message);
  else console.log("[rank] refresh_tool_internal_ranks ok");

  // Re-apply curated popularity after refresh (refresh may overwrite)
  for (const [slug, cfg] of Object.entries(REASSIGN)) {
    const { data: tool } = await sb.from("tools").select("id").eq("slug", slug).maybeSingle();
    if (tool) await bumpRank(sb, tool.id, cfg.popularity);
  }
  for (const tool of NEW_TOOLS) {
    const { data: t } = await sb.from("tools").select("id").eq("slug", tool.slug).maybeSingle();
    if (t) await bumpRank(sb, t.id, tool.popularity ?? 80);
  }

  const { data: tops } = await sb.rpc("home_top_tools_by_category", {
    p_category_slugs: ["finance", "legal"],
    p_limit: 10,
  });
  console.log(
    "tops",
    tops?.map((r) => `${r.list_position}. [${r.category_slug}] ${r.tool_slug}`),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
