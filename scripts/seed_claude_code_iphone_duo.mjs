/**
 * Latest: Claude Code Desktop iPhone Duo in iOS Simulator (public beta)
 * Usage: node scripts/seed_claude_code_iphone_duo.mjs
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
  title: "Claude Code Desktop adds iPhone Duo in the iOS Simulator (public beta)",
  slug: "claude-code-desktop-iphone-duo-simulator",
  kind: "feature",
  published_at: "2026-11-16",
  solution_slug: "claude-code",
  source_url: "https://code.claude.com/docs/en/desktop-ios-simulator",
  summary:
    "Claude Code on desktop can run your app on an iPhone Duo simulator beside the chat and fold/unfold the device to test each layout — iOS Simulator pane public beta on macOS.",
  body: `## What changed
**Claude Code Desktop** now supports **iPhone Duo** in the **iOS Simulator** pane (public beta). You can run your app on Duo next to the conversation, and Claude can **fold and unfold** the device to test closed, half-open, and open layouts.

The broader iOS Simulator pane already streams the simulated device beside chat when Claude builds, installs, launches, or checks an app — without taking over your desktop via computer use.

## Requirements (Duo)
- **Claude Desktop v4.29.0+** (simulator pane itself needs v1.24012.0+)
- **macOS** + **Xcode 27.1+** with the iOS 27.1 simulator runtime (includes iPhone Duo)
- Local sessions only (not cloud/SSH); Pro / Max / Ultra / Team / Enterprise (except HIPAA-configured Enterprise)
- Add an iPhone Duo device in the pane if it isn’t listed yet

## How to try it
Ask Claude to build and run on Duo, e.g. run the app on iPhone Duo and verify each fold pose. Official guide: [Test iOS apps in the simulator](https://code.claude.com/docs/en/desktop-ios-simulator).

## Sources
- [Claude Code docs — iOS Simulator / iPhone Duo](https://code.claude.com/docs/en/desktop-ios-simulator)`,
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

  console.log(`done -> /latest/${ITEM.slug}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
