/**
 * Archive Latest posts that are industry news or catalog blurbs,
 * so /latest only shows real product advances (+ catalog new-tool signals).
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";

function load(p) {
  const e = {};
  if (!existsSync(p)) return e;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    let k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    )
      v = v.slice(1, -1);
    e[k] = v;
  }
  return e;
}

const PRODUCT_KINDS = new Set([
  "new_tool",
  "release",
  "version",
  "feature",
  "pricing",
  "access",
]);

function looksLikeJunk(title, summary) {
  const t = `${title} ${summary}`;
  if (/migrant|vulnerabilit|lawsuit|dj\b|groove|departure|canary islands/i.test(t)) {
    return true;
  }
  // "ChatGPT: the general-purpose assistant..." style intros
  if (
    /^[A-Za-z0-9][^:]{1,40}:\s+.{20,}/.test(title) &&
    /catalog|assistant|generation|workflow|editor|platform/i.test(t)
  ) {
    return true;
  }
  if (/added to the catalog|listed on AI Discov/i.test(summary)) return false;
  if (/launch|releas|version|v\d|pricing|feature|changelog|ga\b|now available/i.test(t)) {
    return false;
  }
  // Generic product one-liners without an advance signal
  return /:\s+.{10,}/.test(title);
}

const env = { ...load(".env.production"), ...load(".env") };
const sb = createClient(
  env.VITE_SUPABASE_URL,
  env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const { data, error } = await sb
  .from("news_items")
  .select("id,title,summary,kind,status,solution_slug")
  .in("status", ["published", "draft"]);

if (error) {
  console.error(error);
  process.exit(1);
}

let archived = 0;
for (const row of data || []) {
  const nonProduct = !PRODUCT_KINDS.has(row.kind);
  const blurb = looksLikeJunk(row.title, row.summary);
  if (!nonProduct && !blurb) continue;

  const { error: updErr } = await sb
    .from("news_items")
    .update({
      status: "archived",
      updated_at: new Date().toISOString(),
      event_type: nonProduct
        ? "archived_non_product_news"
        : "archived_catalog_blurb",
    })
    .eq("id", row.id);
  if (updErr) {
    console.warn("fail", row.id, updErr.message);
    continue;
  }
  archived += 1;
  console.log(
    `[archive] ${row.status}/${row.kind} — ${row.title.slice(0, 70)}${blurb ? " (blurb)" : " (non-product)"}`,
  );
}

console.log(`archived ${archived} / ${(data || []).length}`);
