/**
 * Latest: Hy4 flash free / near-unlimited promo (verified Nov 16, 2026)
 * Usage: node scripts/seed_hy4_flash_free_latest.mjs
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
  title: "Hy4 flash is free with near-unlimited usage for ~2 weeks",
  slug: "hy4-flash-free-opencode-two-weeks",
  kind: "access",
  published_at: "2026-11-16",
  solution_slug: "tencent-hunyuan",
  source_url: "https://models.opencode.ai/models/tencent/hy4-flash/",
  summary:
    "Tencent Hy4 flash launched Nov 16 with a free OpenCode tier (hy4-flash-free: $0 input/output/cache) for a limited ~2-week window with near-unlimited usage in the OpenCode client; WorkBuddy also offers free access through Nov 30.",
  body: `## What changed
**Tencent Hy4 flash** (Hunyuan family) shipped on November 16, 2026 — a fast, cost-efficient multimodal model (~224B total / 12B active, ~1M context).

OpenCode lists a free model ID **\`hy4-flash-free\`** at **$0 / $0 / $0** for input, output, and cache reads in the OpenCode Models catalog (also on OpenCode Go). Promo trackers and OpenCode messaging describe **near-unlimited usage for about two weeks** from Nov 16 (roughly through ~Nov 30). Free chat models are intended for use **inside the OpenCode client**.

Separately, reporting on Tencent’s launch says **WorkBuddy** users get Hy4 flash **free through November 30**, and TokenHub has temporary discounts on paid API rates.

## Specs (launch)
- Context ~**1,048,576** tokens; multimodal (image + text)
- Paid list rates (outside free promos) around **$0.07 / $0.281** per 1M input/output tokens (provider-dependent)

## How to try it
In OpenCode, pick **Hy4 flash Free** via \`/models\` or set \`opencode/hy4-flash-free\`. Confirm current eligibility and limits in OpenCode before heavy use — free windows can end without long notice.

## Sources checked
- OpenCode / Models.dev Hy4 flash provider table (\`hy4-flash-free\` at $0)
- TechNode launch report (WorkBuddy free through Nov 30)
- Corroborating promo write-ups citing the ~2-week OpenCode free window`,
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
    const { data: row, error } = await sb.from("news_items").insert(payload).select("id").single();
    if (error) throw error;
    newsId = row.id;
    console.log(`[insert] ${ITEM.slug}`);
  }

  if (tool?.id) {
    await sb.from("news_tool_links").upsert({
      news_item_id: newsId,
      tool_id: tool.id,
    });
  }

  console.log(`done -> /latest/${ITEM.slug}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
