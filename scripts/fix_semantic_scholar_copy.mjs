/**
 * Fix Semantic Scholar: unique sources + cleaner description
 * Usage: node scripts/fix_semantic_scholar_copy.mjs
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

const SITE = "https://www.semanticscholar.org";
const API_OVERVIEW = "https://www.semanticscholar.org/product/api";
const API_DOCS = "https://api.semanticscholar.org/api-docs/";

const DESCRIPTION = `Semantic Scholar (Allen Institute for AI) is a free AI research discovery engine for scientific literature — paper search, author pages, citation graphs, TLDRs, and related work across STEM and beyond.

Developers can use the free Semantic Scholar Academic Graph API (S2AG) for REST access to papers, authors, citations, venues, SPECTER2 embeddings, recommendations, and bulk datasets (S2AG + S2ORC). Most endpoints work without a key (shared public rate pool); a free API key (x-api-key) unlocks dedicated introductory limits (~1 RPS), with higher limits available after review.

Corpus scale cited by Semantic Scholar: ~214M papers, ~2.49B citations, ~79M authors (figures change over time). Data releases use ODC-BY with attribution. Widely used by tools such as Connected Papers and Litmaps.`;

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

  const { data: tool, error: toolErr } = await sb
    .from("tools")
    .select("id")
    .eq("slug", SLUG)
    .single();
  if (toolErr) throw toolErr;

  const today = new Date().toISOString().slice(0, 10);

  const { error: updErr } = await sb
    .from("tools")
    .update({
      description: DESCRIPTION,
      api_docs_url: API_DOCS,
      official_url: SITE,
      last_verified_at: today,
      updated_at: new Date().toISOString(),
    })
    .eq("id", tool.id);
  if (updErr) throw updErr;
  console.log("[update] description cleaned");

  // Remove all existing tool_sources, then re-add unique ones only
  const { error: delErr } = await sb
    .from("tool_sources")
    .delete()
    .eq("tool_id", tool.id);
  if (delErr) throw delErr;

  // Keep exactly one API source (docs) + site — no duplicate api rows
  const uniqueSources = [
    { url: SITE, claim: "general" },
    { url: API_DOCS, claim: "api" },
  ];

  for (const { url, claim } of uniqueSources) {
    const sid = await ensureSource(sb, url);
    const { error } = await sb.from("tool_sources").insert({
      tool_id: tool.id,
      source_id: sid,
      claim_key: claim,
      verified_at: today,
    });
    if (error) throw error;
    console.log(`[source] ${claim} ${url}`);
  }

  const { data: rows } = await sb
    .from("tool_sources")
    .select("claim_key, sources(url)")
    .eq("tool_id", tool.id);
  console.log(
    "sources now:",
    (rows ?? []).map((r) => `${r.claim_key} ${(r.sources && r.sources.url) || "?"}`),
  );
  console.log(`done -> /tools/${SLUG}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
