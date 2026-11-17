/**
 * Add Treg (OpenRouter for agent tools) — platform + skill/MCP surface.
 * Usage: node scripts/seed_treg.mjs
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

const TOOL = {
  name: "Treg",
  slug: "treg",
  publisher: "Superdesign",
  url: "https://treg.to",
  api_docs_url: "https://github.com/superdesigndev/treg",
  repository_url: "https://github.com/superdesigndev/treg",
  summary:
    "OpenRouter for agent tools — one base URL and token to call a curated catalog of SEO, social, enrichment, scrape, and media APIs, priced per call.",
  description:
    "Treg is a tool catalog and auth-injecting proxy for AI agents: point the agent at one base URL with one token and search/call thousands of endpoints across providers (SEO/backlinks, social, people & company enrichment, ads, scraping, image/video) without signing up for each vendor. Hosted at treg.to; self-host from open source. Own-key / team tools (endpoints, CLIs, SKILL.md bundles) are never metered; catalog calls use prepaid balance (new verified teams get $1 free). Install CLI via curl install.sh, or Claude Code plugin (`/plugin marketplace add superdesigndev/treg`) which installs the treg skill + MCP tools. Built by the Superdesign team.",
  pricing_model: "Freemium",
  price_display: "Free tier · pay-per-call catalog",
  open_source: true,
  api_available: true,
  local_available: true,
  license: "See repository",
  keywords: [
    "treg",
    "openrouter for tools",
    "agent tools",
    "mcp",
    "skill",
    "api proxy",
    "superdesign",
    "catalog",
  ],
  strengths: [
    "One token for a multi-provider tool catalog",
    "Pay per call instead of full SaaS seats",
    "Team keys/skills/CLIs shared without leaking credentials",
    "Claude Code plugin + CLI + self-host",
  ],
  limits: [
    "Catalog coverage depends on what Treg has onboarded",
    "Metered catalog calls need prepaid balance after free credit",
    "Self-hosting means you operate the proxy and secrets",
  ],
  audience: ["Agent builders", "Growth / SEO teams", "Developers"],
  categories: [
    "automation-agents",
    "coding-development",
    "mcp",
    "skills",
    "business-marketing",
  ],
  type: "platform",
  platforms: ["web", "macos", "linux", "windows", "self-hosted"],
  featureKeys: [
    "agents_automation",
    "api_access",
    "tool_calling",
    "local_deploy",
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
      publisher: "github.com",
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function idBySlug(sb, table, slug) {
  const { data } = await sb.from(table).select("id").eq("slug", slug).maybeSingle();
  return data?.id ?? null;
}

async function idByKey(sb, table, key) {
  const { data } = await sb.from(table).select("id").eq("key", key).maybeSingle();
  return data?.id ?? null;
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

  const today = new Date().toISOString().slice(0, 10);
  const { data: bySlug } = await sb
    .from("tools")
    .select("id")
    .eq("slug", TOOL.slug)
    .maybeSingle();

  const publisherId = await ensurePublisher(sb, TOOL.publisher);
  const sourceId = await ensureSource(sb, TOOL.repository_url);

  const row = {
    name: TOOL.name,
    publisher_id: publisherId,
    summary: TOOL.summary,
    description: TOOL.description,
    official_url: TOOL.url,
    api_docs_url: TOOL.api_docs_url,
    repository_url: TOOL.repository_url,
    logo_url: "https://github.com/superdesigndev.png?size=128",
    pricing_model: TOOL.pricing_model,
    price_display: TOOL.price_display,
    open_source: TOOL.open_source,
    api_available: TOOL.api_available,
    local_available: TOOL.local_available,
    license: TOOL.license,
    keywords: TOOL.keywords,
    strengths: TOOL.strengths,
    limits: TOOL.limits,
    audience: TOOL.audience,
    last_verified_at: today,
    updated_at: new Date().toISOString(),
  };

  let toolId = bySlug?.id ?? null;
  if (toolId) {
    const { error } = await sb.from("tools").update(row).eq("id", toolId);
    if (error) throw error;
    console.log(`[update] ${TOOL.slug}`);
  } else {
    const { data: inserted, error } = await sb
      .from("tools")
      .insert({ ...row, slug: TOOL.slug, status: "pending_review" })
      .select("id")
      .single();
    if (error) throw error;
    toolId = inserted.id;
    console.log(`[insert] ${TOOL.slug}`);
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
  const mcpTypeId = await idBySlug(sb, "solution_types", "mcp");
  if (mcpTypeId) {
    await sb.from("tool_types").upsert({
      tool_id: toolId,
      solution_type_id: mcpTypeId,
      is_primary: false,
    });
  }

  for (const key of TOOL.platforms) {
    const platformId = await idByKey(sb, "platforms", key);
    if (!platformId) continue;
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
      plan_name: "Free / self-host",
      price_amount: 0,
      currency: "USD",
      billing_period: "custom",
      pricing_model: "Open source",
      verified_at: today,
    },
    {
      tool_id: toolId,
      plan_name: "Hosted catalog (pay per call)",
      price_amount: null,
      currency: "USD",
      billing_period: "usage",
      pricing_model: "Freemium",
      verified_at: today,
    },
  ]);

  const siteSrc = await ensureSource(sb, "https://treg.to");
  for (const [sid, claim] of [
    [sourceId, "general"],
    [siteSrc, "pricing"],
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

  console.log(`done -> /tools/${TOOL.slug}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
