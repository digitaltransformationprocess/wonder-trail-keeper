/**
 * Catalog: MAI Code 2 + MAI Code 2 Flash (Microsoft AI)
 * Relinks Latest mai-code-2-flash-github-copilot → mai-code-2
 * Usage: node scripts/seed_mai_code_2.mjs
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

const SHARED = {
  publisher: "Microsoft AI",
  url: "https://microsoft.ai/news/introducing-mai-code-2-and-mai-code-2-flash/",
  api_docs_url:
    "https://docs.github.com/en/copilot/reference/ai-models/supported-models",
  repository_url: null,
  pricing_model: "Paid",
  open_source: false,
  api_available: true,
  local_available: false,
  license: null,
  categories: ["coding-development", "automation-agents"],
  type: "model",
  platforms: ["web", "windows", "macos", "linux"],
  featureKeys: [
    "text_generation",
    "code_assistance",
    "agents_automation",
    "api_access",
    "tool_calling",
    "multimodal",
  ],
};

const TOOLS = [
  {
    ...SHARED,
    name: "MAI Code 2",
    slug: "mai-code-2",
    summary:
      "Microsoft AI coding model for everyday enterprise work — deep debugging, multi-file changes, refactoring, and repo-wide reasoning at frontier price-performance inside GitHub Copilot.",
    description:
      "MAI Code 2 is Microsoft AI’s general-purpose coding model (Nov 17, 2026) aimed at day-to-day enterprise software engineering: taking code to production, deep debugging, multi-file implementation, refactoring, repository-wide reasoning, and UI / visual coding. Microsoft claims ~98% of GPT-6.1 Sol performance at ~40% of the cost and ~96% of Claude Opus 5.5 at ~5% of the cost on everyday Copilot-style benches (vendor evals; validate yourself). Available in GitHub Copilot for Pro, Pro+, Max, Business, and Enterprise (usage-based billing). Not yet positioned for hard science research or very long-horizon agentic workloads. Customization options are offered via Microsoft’s Custom Models path; wider API distribution (OpenRouter, Vercel, etc.) was announced as coming soon.",
    price_display: "Via GitHub Copilot · usage-based",
    keywords: [
      "mai code 2",
      "mai-code-2",
      "microsoft ai",
      "github copilot",
      "coding model",
      "enterprise coding",
      "agentic coding",
    ],
    strengths: [
      "Strong everyday enterprise coding (debug, multi-file, refactor)",
      "Competitive vendor price-performance vs Sol / Opus on Copilot-style tasks",
      "Tuned for frontend / dashboards / visual coding",
      "Native in GitHub Copilot model picker across IDEs and CLI",
    ],
    limits: [
      "Access mainly through GitHub Copilot plans (not Free/Student for Code 2)",
      "Usage-based billing; org model policy can disable MAI models",
      "Not tuned yet for hardest research / ultra long-horizon agent work",
      "Vendor benchmarks — results vary by workload",
    ],
    audience: [
      "Enterprise developers",
      "Platform / Copilot admins",
      "Teams optimizing coding cost vs quality",
    ],
    plans: [
      {
        plan_name: "GitHub Copilot (Pro+)",
        billing_period: "usage",
        pricing_model: "Paid",
      },
    ],
  },
  {
    ...SHARED,
    name: "MAI Code 2 Flash",
    slug: "mai-code-2-flash",
    summary:
      "Lightweight Microsoft AI coding model for high-volume routine work — explanations, targeted edits, and rapid iteration at lower cost in GitHub Copilot (including Free/Student).",
    description:
      "MAI Code 2 Flash is the cost-efficient sibling of MAI Code 2 (Nov 17, 2026), optimized for everyday high-volume coding: explanations, targeted edits, routine fixes, and rapid iteration. Microsoft positions it as comparable to GPT-6 Luna / Claude Haiku 5.5 on routine coding benches at a fraction of those costs (vendor evals). Available in GitHub Copilot for Free, Student, Pro, Pro+, Max, Business, and Enterprise under usage-based billing. Also noted in limited-access preview on Microsoft Foundry, with broader distribution announced as forthcoming. A related derivative, MAI Work Flash, powers multiple Microsoft product surfaces (e.g. M365 / Fabric IQ).",
    price_display: "Via GitHub Copilot · usage-based (Free+)",
    keywords: [
      "mai code 2 flash",
      "mai-code-2-flash",
      "microsoft ai",
      "github copilot",
      "fast coding model",
      "cheap coding model",
    ],
    strengths: [
      "Affordable high-volume routine coding",
      "Available on Copilot Free and Student",
      "Good fit for explanations and small iterative edits",
      "Foundry limited preview + wider API distribution planned",
    ],
    limits: [
      "Weaker fit for deep multi-file / repo-wide refactors vs Code 2",
      "Usage-based; still subject to Copilot quotas and org policy",
      "Foundry access limited at launch",
      "Vendor cost claims use promotional pricing assumptions",
    ],
    audience: [
      "Students and Free Copilot users",
      "Teams with high volume of small coding tasks",
      "Cost-sensitive agentic workflows",
    ],
    plans: [
      {
        plan_name: "GitHub Copilot (Free+)",
        billing_period: "usage",
        pricing_model: "Paid",
      },
    ],
  },
];

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
  const changelogSrc = await ensureSource(
    sb,
    "https://github.blog/changelog/2026-11-17-mai-code-2-and-mai-code-2-flash-in-github-copilot/",
  );
  const today = new Date().toISOString().slice(0, 10);

  const row = {
    name: tool.name,
    slug: tool.slug,
    publisher_id: publisherId,
    summary: tool.summary,
    description: tool.description,
    official_url: tool.url,
    api_docs_url: tool.api_docs_url,
    repository_url: tool.repository_url,
    logo_url: logoFor("https://microsoft.ai"),
    pricing_model: tool.pricing_model,
    price_display: tool.price_display,
    open_source: tool.open_source,
    api_available: tool.api_available,
    local_available: tool.local_available,
    license: tool.license,
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
  } else {
    console.warn(`[skip type] ${tool.type}`);
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
    const found = new Set((feats ?? []).map((f) => f.key));
    for (const key of tool.featureKeys) {
      if (!found.has(key)) console.warn(`[skip feature] ${key}`);
    }
    for (const f of feats ?? []) {
      await sb.from("tool_features").upsert({
        tool_id: toolId,
        feature_id: f.id,
        availability: "available",
      });
    }
  }

  await sb.from("pricing_plans").delete().eq("tool_id", toolId);
  await sb.from("pricing_plans").insert(
    tool.plans.map((p) => ({
      tool_id: toolId,
      plan_name: p.plan_name,
      price_amount: null,
      currency: "USD",
      billing_period: p.billing_period,
      pricing_model: p.pricing_model,
      verified_at: today,
    })),
  );

  for (const [sid, claim] of [
    [sourceId, "general"],
    [changelogSrc, "access"],
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

async function linkAlternative(sb, sourceId, targetId) {
  if (!sourceId || !targetId || sourceId === targetId) return;
  const { error } = await sb.from("tool_relations").upsert(
    {
      source_tool_id: sourceId,
      target_tool_id: targetId,
      relation_type: "alternative",
    },
    { onConflict: "source_tool_id,target_tool_id,relation_type" },
  );
  if (error) {
    // Some schemas omit a unique constraint — try plain insert ignore via select
    const { data: existing } = await sb
      .from("tool_relations")
      .select("source_tool_id")
      .eq("source_tool_id", sourceId)
      .eq("target_tool_id", targetId)
      .eq("relation_type", "alternative")
      .maybeSingle();
    if (existing) return;
    const { error: insErr } = await sb.from("tool_relations").insert({
      source_tool_id: sourceId,
      target_tool_id: targetId,
      relation_type: "alternative",
    });
    if (insErr) console.warn(`[rel] ${insErr.message}`);
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

  const copilotId = await idBySlug(sb, "tools", "github-copilot");
  await linkAlternative(sb, ids["mai-code-2"], ids["mai-code-2-flash"]);
  await linkAlternative(sb, ids["mai-code-2-flash"], ids["mai-code-2"]);
  if (copilotId) {
    await linkAlternative(sb, ids["mai-code-2"], copilotId);
    await linkAlternative(sb, ids["mai-code-2-flash"], copilotId);
  }

  // Point Latest article at MAI Code 2 and link related tools
  const newsSlug = "mai-code-2-flash-github-copilot";
  const { data: news } = await sb
    .from("news_items")
    .select("id")
    .eq("slug", newsSlug)
    .maybeSingle();
  if (news?.id) {
    await sb
      .from("news_items")
      .update({
        solution_slug: "mai-code-2",
        updated_at: new Date().toISOString(),
      })
      .eq("id", news.id);
    await sb.from("news_tool_links").delete().eq("news_item_id", news.id);
    const linkIds = [
      ids["mai-code-2"],
      ids["mai-code-2-flash"],
      copilotId,
    ].filter(Boolean);
    if (linkIds.length) {
      await sb.from("news_tool_links").insert(
        linkIds.map((tool_id) => ({ news_item_id: news.id, tool_id })),
      );
    }
    console.log(`[news] relinked ${newsSlug} -> mai-code-2`);
  }

  console.log("done -> /tools/mai-code-2");
  console.log("done -> /tools/mai-code-2-flash");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
