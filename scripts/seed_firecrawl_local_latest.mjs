/**
 * Latest + tool refresh: Firecrawl Local
 * Usage: node scripts/seed_firecrawl_local_latest.mjs
 * Source: https://github.com/firecrawl/firecrawl
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

const ITEM = {
  title: "Firecrawl Local: agents can scrape locally — 37× faster, 230× less memory",
  slug: "firecrawl-local-rust-scrape",
  kind: "release",
  published_at: "2026-11-19",
  solution_slug: "firecrawl",
  source_url: "https://github.com/firecrawl/firecrawl",
  summary:
    "Firecrawl rebuilt the open-source repo as Firecrawl Local so agents can scrape on-device: a Rust scrape primitive claimed 37× faster vs prior self-hosted, ~11 MB idle (230× less memory), 100% open source.",
  body: `## What shipped
**Firecrawl Local** is live. Firecrawl rebuilt the open-source repo so **agents can scrape locally**.

### Highlights (vendor claims)
- **37× faster** Rust-based scrape primitive vs previous self-hosted Firecrawl
- **230× less memory** — about **11 MB idle**
- **100% open source**

## Why it matters
Self-hosted / local scrape used to be heavy for agent loops. Firecrawl Local targets a small, fast on-machine primitive so agents can pull LLM-ready page content without always calling Firecrawl Cloud — useful for privacy, cost control, and offline-friendly workflows.

## How to try it
1. Open the [firecrawl/firecrawl](https://github.com/firecrawl/firecrawl) repo
2. Follow Firecrawl Local / self-host docs in the README
3. Point your agent, CLI, or MCP client at the local scrape endpoint

## Sources
- [GitHub — firecrawl/firecrawl](https://github.com/firecrawl/firecrawl)
- [firecrawl.dev](https://firecrawl.dev)`,
};

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

  const { data: tool } = await sb
    .from("tools")
    .select("id, slug, summary, description, keywords, strengths, limits, price_display, local_available")
    .eq("slug", ITEM.solution_slug)
    .maybeSingle();
  if (!tool) console.warn(`[warn] missing tool ${ITEM.solution_slug}`);

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
    console.log(`[update] ${ITEM.slug}`);
  } else {
    const { data: row, error } = await sb
      .from("news_items")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw error;
    newsId = row.id;
    console.log(`[insert] ${ITEM.slug}`);
  }

  if (tool?.id) {
    await sb.from("news_tool_links").delete().eq("news_item_id", newsId);
    await sb.from("news_tool_links").insert({
      news_item_id: newsId,
      tool_id: tool.id,
    });

    const today = new Date().toISOString().slice(0, 10);
    const keywords = Array.from(
      new Set([
        ...(tool.keywords ?? []),
        "firecrawl local",
        "local scrape",
        "rust",
        "self-hosted",
        "on-device",
      ]),
    );
    const strengths = [...(tool.strengths ?? [])];
    const localStrength =
      "Firecrawl Local: Rust scrape primitive — ~37× faster vs prior self-host, ~11 MB idle";
    if (!strengths.some((s) => /firecrawl local|11 mb|37×|37x/i.test(s))) {
      strengths.unshift(localStrength);
    }
    const limits = (tool.limits ?? []).filter(
      (l) => !/self-host does not include alexandria/i.test(l),
    );
    if (!limits.some((l) => /alexandria/i.test(l))) {
      limits.push(
        "Alexandria data providers are Cloud-oriented; Local may need login for full access",
      );
    }

    await sb
      .from("tools")
      .update({
        summary:
          "Knowledge infrastructure for agents — search, scrape, crawl via Cloud or Firecrawl Local (Rust, ~11 MB idle, 100% open source).",
        description: `${tool.description ?? ""}

Firecrawl Local (2026): the open-source repo was rebuilt so agents can scrape locally. Vendor claims a Rust-based scrape primitive about 37× faster than prior self-hosted Firecrawl, ~230× less memory (~11 MB idle), and 100% open source. Use alongside Firecrawl Cloud, MCP, CLI, and skills.`.trim(),
        keywords,
        strengths,
        limits,
        local_available: true,
        open_source: true,
        price_display: tool.price_display?.includes("Local")
          ? tool.price_display
          : "Free Local (OSS) · Cloud paid plans",
        last_verified_at: today,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tool.id);
    console.log(`[tool refresh] ${tool.slug}`);
  }

  console.log(`done -> /latest/${ITEM.slug}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
