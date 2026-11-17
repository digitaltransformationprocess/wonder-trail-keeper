/**
 * Latest: Google Colab API + hosted MCP endpoint
 * Usage: node scripts/seed_colab_api_mcp_latest.mjs
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
  title: "Google Colab launches API and hosted MCP endpoint for agents",
  slug: "google-colab-api-mcp-endpoint",
  kind: "feature",
  published_at: "2026-11-17",
  solution_slug: "google-colab",
  source_url:
    "https://medium.com/google-colab/the-google-colab-api-and-mcp-endpoint-for-developers-and-agents-65cfef497056",
  summary:
    "Google Colab announced a public API and hosted MCP endpoint so developers and agents can provision runtimes, discover GPU/TPU specs, and execute Python headlessly on Colab compute.",
  body: `## What changed
Google Colab launched the **Colab API** and a **hosted MCP endpoint** for developers and AI agents. You can programmatically provision, manage, and execute code on Colab runtimes — including headless agent workflows.

### API highlights
- Runtime management: create, get, list, delete runtimes
- Hardware discovery: CPU / GPU / TPU specs via \`ListRuntimeSpecs\` (Pro / Pro+ accelerators like H100 or TPU v6e by tier)
- Subscription query: \`GetSubscription\`
- Jupyter connection info for editor integrations (e.g. official VS Code Colab extension)
- OAuth 2.0 + Google API / OpenAPI discovery

### MCP highlights
- Hosted endpoint: \`https://colaboratory.googleapis.com/mcp\`
- REST tools exposed for agents (some simplified)
- Code execution: \`execute_code\` plus session/runtime helpers (\`create_session\`, etc.)

## How to try it
1. Enable the Colab API in Google Cloud Console
2. Configure OAuth 2.0 client credentials
3. Explore methods in APIs Explorer / API reference
4. Point your agent harness at the hosted MCP endpoint

## Sources
- [Google Colab Medium announcement](https://medium.com/google-colab/the-google-colab-api-and-mcp-endpoint-for-developers-and-agents-65cfef497056)
- [MCP reference — colaboratory.googleapis.com](https://developers.google.com/colab/api/reference/mcp)`,
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
    .select("id, slug")
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
    const { data, error } = await sb
      .from("news_items")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw error;
    newsId = data.id;
    console.log(`[insert] ${ITEM.slug}`);
  }

  if (tool?.id) {
    await sb.from("news_tool_links").delete().eq("news_item_id", newsId);
    await sb
      .from("news_tool_links")
      .insert({ news_item_id: newsId, tool_id: tool.id });
  }

  // Light enrichment: note MCP on the tool page if thin
  if (tool?.id) {
    const today = new Date().toISOString().slice(0, 10);
    const { data: t } = await sb
      .from("tools")
      .select("api_docs_url, keywords, strengths")
      .eq("id", tool.id)
      .single();
    const keywords = Array.from(
      new Set([...(t?.keywords ?? []), "mcp", "colab api", "agents", "gpu", "tpu"]),
    );
    const strengths = t?.strengths?.length
      ? t.strengths
      : [
          "Free GPU/TPU notebooks in the browser",
          "Now has API + hosted MCP for agents",
        ];
    if (!strengths.some((s) => /mcp|api/i.test(s))) {
      strengths.push("API + hosted MCP for headless agent compute");
    }
    await sb
      .from("tools")
      .update({
        api_docs_url:
          t?.api_docs_url ||
          "https://developers.google.com/colab/api/reference/mcp",
        keywords,
        strengths,
        last_verified_at: today,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tool.id);

    const mcpCat = await sb
      .from("categories")
      .select("id")
      .eq("slug", "mcp")
      .maybeSingle();
    if (mcpCat.data?.id) {
      await sb.from("tool_categories").upsert({
        tool_id: tool.id,
        category_id: mcpCat.data.id,
        is_primary: false,
      });
    }
  }

  console.log(`done -> /latest/${ITEM.slug}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
