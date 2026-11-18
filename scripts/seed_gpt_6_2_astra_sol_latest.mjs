/**
 * Latest: GPT-6.2 Astra and Sol available (OpenAI, Nov 17, 2026)
 * Usage: node scripts/seed_gpt_6_2_astra_sol_latest.mjs
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
  title: "GPT-6.2 Astra and Sol are now available",
  slug: "gpt-6-2-astra-sol-available",
  kind: "version",
  published_at: "2026-11-17",
  solution_slug: "openai-api",
  source_url: "https://openai.com/index/introducing-gpt-6-2-astra-sol",
  summary:
    "OpenAI launched GPT-6.2 Astra (frontier for hard projects) and GPT-6.2 Sol (efficient everyday work) — live in ChatGPT Work, Codex, and the API with lower Astra token prices and stronger professional / science / coding benchmarks.",
  body: `## What shipped
On **November 17, 2026**, OpenAI released **GPT‑6.2 Astra** and **GPT‑6.2 Sol**.

- **GPT‑6.2 Astra** — new frontier model for the hardest professional projects (slides, spreadsheets, docs, coding, science, computer use / 3D)
- **GPT‑6.2 Sol** — smarter, more efficient successor to GPT‑6.1 Sol for everyday and multistep agentic work at lower cost

Both aim for better results on demanding tasks with **fewer output tokens**, so paid plans go further.

## Where you can use them
- **ChatGPT Work** and **Codex** for Plus, Pro, Enterprise, and Edu (rollout **does not** add them to regular Chat)
- **API** model IDs: \`gpt-6.2-astra\` and \`gpt-6.2-sol\`
- Docs: [Using GPT-6.2](https://developers.openai.com/api/docs/guides/latest-model)

## API pricing (vendor)
- **GPT‑6.2 Astra:** **$8** / **$0.40** / **$40** per 1M input / cached input / output tokens — **20% lower** input/output vs GPT‑6 Astra, **60%** discount on cached input
- **GPT‑6.2 Sol:** keeps **GPT‑6.1 Sol** token prices

## Highlights (OpenAI claims — validate yourself)
- **Agents’ Last Exam:** Astra +5.2 pts vs GPT‑6 Astra at **&lt;1/3** the cost; +5.5 vs Claude Fable 5.2 at **~5%** of the cost
- **Science:** new highs on Terminal-Bench-Science 0.1 and Vals Science Index
- **Coding / FrontierCode 2.0:** Sol within **0.5** pts of Astra at ~**1/5** the cost (max settings)
- **AA‑3D (human pref Elo):** Astra **1,318** · Fable 5.2 **1,271** · Sol **1,259**
- Stronger professional outputs (legal, finance, decks) and cleaner code style with fewer revision rounds

## Safety note
OpenAI says both models meet **Critical** cybersecurity and **High** bio/chem thresholds under its Preparedness Framework, with tighter dual-use safeguards. Astra is also described as the first external release meeting **High** for AI self-improvement capability. Authorized defender access for reduced cyber refusals is framed via OpenAI Daybreak (with 6.2 models expected to follow).

## How to try it
1. In ChatGPT Work / Codex, pick **GPT‑6.2 Astra** or **GPT‑6.2 Sol** (update desktop / Codex CLI if the picker is missing)
2. Via API: set \`model\` to \`gpt-6.2-astra\` or \`gpt-6.2-sol\`
3. Prefer Sol for volume / everyday agent loops; Astra for hardest professional or science jobs

## Sources
- [OpenAI — Introducing GPT-6.2 Astra and Sol](https://openai.com/index/introducing-gpt-6-2-astra-sol)
- [Using GPT-6.2 (API docs)](https://developers.openai.com/api/docs/guides/latest-model)
- [ChatGPT Work and Codex help](https://help.openai.com/en/articles/20001275-chatgpt-work-and-codex)`,
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

  const linkSlugs = ["openai-api", "chatgpt", "openai", "codex-cli"];
  const toolIds = [];
  for (const slug of linkSlugs) {
    const { data } = await sb.from("tools").select("id").eq("slug", slug).maybeSingle();
    if (data?.id) toolIds.push(data.id);
    else console.warn(`[warn] missing tool ${slug}`);
  }

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

  await sb.from("news_tool_links").delete().eq("news_item_id", newsId);
  if (toolIds.length) {
    await sb.from("news_tool_links").insert(
      toolIds.map((tool_id) => ({ news_item_id: newsId, tool_id })),
    );
  }

  console.log(`done -> /latest/${ITEM.slug}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
