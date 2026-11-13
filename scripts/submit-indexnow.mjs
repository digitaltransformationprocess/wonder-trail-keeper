/**
 * Submit site URLs to IndexNow (Bing + participating engines).
 * Usage:
 *   node scripts/submit-indexnow.mjs
 *   node scripts/submit-indexnow.mjs / /explore /tools/foo
 *   node scripts/submit-indexnow.mjs --sitemap
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  absoluteUrls,
  resolveIndexNowKey,
  submitIndexNow,
} from "./lib/indexnow.mjs";

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

async function fetchAllPaths(supabase) {
  const paths = ["/", "/explore", "/latest", "/compare", "/legal"];
  for (const table of [
    ["tools", "slug", "/tools/", { status: "published" }],
    ["categories", "slug", "/categories/", { is_active: true }],
    ["news_items", "slug", "/latest/", { status: "published" }],
  ]) {
    const [name, col, prefix, filters] = table;
    let from = 0;
    for (;;) {
      let q = supabase.from(name).select(col).range(from, from + 999);
      if (filters.status) q = q.eq("status", filters.status);
      if (filters.is_active) q = q.eq("is_active", true);
      const { data, error } = await q;
      if (error) throw error;
      if (!data?.length) break;
      for (const row of data) paths.push(`${prefix}${row[col]}`);
      if (data.length < 1000) break;
      from += 1000;
    }
  }
  return paths;
}

async function main() {
  const env = {
    ...loadEnv(join(ROOT, ".env.production")),
    ...loadEnv(join(ROOT, ".env")),
    ...process.env,
  };
  const siteUrl = (env.VITE_SITE_URL || "https://aidiscov.com").replace(/\/$/, "");
  const host = new URL(siteUrl).host;
  const key = resolveIndexNowKey(ROOT, env);
  if (!key) {
    console.error("[indexnow] Missing INDEXNOW_KEY / public/{key}.txt");
    process.exit(1);
  }

  const args = process.argv.slice(2).filter((a) => a !== "--sitemap");
  const wantAll = process.argv.includes("--sitemap") || args.length === 0;

  let paths = args;
  if (wantAll) {
    const url = env.VITE_SUPABASE_URL;
    const anon = env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !anon) {
      console.error("[indexnow] Need Supabase env to load catalog paths");
      process.exit(1);
    }
    const sb = createClient(url, anon, { auth: { persistSession: false } });
    paths = await fetchAllPaths(sb);
  }

  const urlList = absoluteUrls(siteUrl, paths);
  console.log(`[indexnow] Submitting ${urlList.length} URL(s) for ${host}…`);
  const result = await submitIndexNow({ host, key, urlList });
  for (const r of result.results) {
    console.log(`[indexnow] batch status=${r.status} count=${r.count}${r.body ? ` body=${r.body}` : ""}`);
  }
  if (!result.results.every((r) => r.ok)) process.exit(1);
  console.log(`[indexnow] done submitted=${result.submitted}`);
}

main().catch((err) => {
  console.error("[indexnow]", err);
  process.exit(1);
});
