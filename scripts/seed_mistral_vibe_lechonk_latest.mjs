/**
 * Latest: Mistral Vibe Pro free 3 months in Europe (code LECHONK)
 * Usage: node scripts/seed_mistral_vibe_lechonk_latest.mjs
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
  title: "Mistral Vibe Pro free for 3 months in Europe with code LECHONK",
  slug: "mistral-vibe-pro-lechonk-europe-free",
  kind: "access",
  published_at: "2026-11-17",
  solution_slug: "mistral",
  source_url: "https://mistral.ai/products/vibe/",
  summary:
    "To celebrate Mistral Vibe + Le Chonk (Mistral Large 4) as a top open model-harness coding duo, Mistral offered Vibe Pro free for three months to developers in Europe via promo code LECHONK — limited, first-come, first-served. Vibe desktop also launched with parallel agents.",
  body: `## What changed
On **November 17, 2026**, Mistral promoted **Vibe Pro** as free for **three months** for **developers in Europe**, using the promo code **\`LECHONK\`**.

The offer celebrates **Mistral Vibe** paired with **Le Chonk** (nickname for **Mistral Large 4**) as what Mistral calls the world’s best open **model + harness** coding duo — claiming stronger coding performance than **GLM** / **DeepSeek** in their agent setup. The same day, Mistral highlighted **Vibe desktop**: hand several tasks to agents at once, watch them work in parallel, and review diffs / pull requests in one window.

## Offer details
- **Product:** [Mistral Vibe](https://mistral.ai/products/vibe/) (chat + coding agent; formerly Le Chat)
- **Plan:** **Vibe Pro** (normally ~$14.99/mo)
- **Promo code:** **\`LECHONK\`**
- **Duration:** **3 months** free
- **Who:** developers **in Europe**
- **Limits:** limited inventory · **first-come, first-served** · terms apply

## What is Le Chonk?
**Le Chonk** is the community / Mistral nickname for **Mistral Large 4** — a large open-weight frontier model trained in Europe (reported ~1T parameters with sparse activation). Open weights were highlighted around late October 2026. Mistral positions the **Vibe + Le Chonk** stack as competitive on agent coding benches such as **FrontierCode** and **Terminal-Bench**.

## Vibe desktop (same wave)
Alongside the promo, Mistral announced **Vibe desktop**:
- Run **multiple agents** on different tasks in parallel
- Inspect **diffs** and **PRs** in a single workspace
- Complements existing Vibe surfaces (web, CLI, VS Code extension)

## How to claim (if still available)
1. Open [Mistral Vibe](https://mistral.ai/products/vibe/) / Pro upgrade flow (link from Mistral’s announcement thread when provided).
2. Enter promo code **\`LECHONK\`** during checkout / redemption.
3. Confirm you qualify as a **Europe**-based developer and accept the offer terms.

**Availability note (Nov 17, 2026):** press coverage later the same day reported that the first batch of codes was already exhausted, with possible additional windows afterward. Always verify live eligibility on Mistral’s site before planning around the promo.

## Why it matters
- Cheaper path to try **all-day coding** limits on Vibe Pro with Mistral’s own open frontier model in the loop
- Useful signal for teams comparing **open European** coding agents vs closed US / China stacks
- Desktop multi-agent UX is the product story beyond the coupon

## Sources
- [Mistral Vibe product](https://mistral.ai/products/vibe/)
- [Mistral pricing (Pro ~$14.99/mo)](https://mistral.ai/pricing/)
- Corroborating report: [DDay.it — Vibe Pro LECHONK Europe](https://www.dday.it/news/32/mistral-regala-tre-mesi-di-vibe-pro-agli-sviluppatori-europei) (incl. same-day “codes exhausted” update)`,
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
  }

  console.log(`done -> /latest/${ITEM.slug}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
