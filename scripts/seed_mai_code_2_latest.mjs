/**
 * Latest: MAI Code 2 + MAI Code 2 Flash in GitHub Copilot
 * Usage: node scripts/seed_mai_code_2_latest.mjs
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
  title: "MAI Code 2 and Code 2 Flash land in GitHub Copilot",
  slug: "mai-code-2-flash-github-copilot",
  kind: "version",
  published_at: "2026-11-17",
  solution_slug: "github-copilot",
  source_url:
    "https://github.blog/changelog/2026-11-17-mai-code-2-and-mai-code-2-flash-in-github-copilot/",
  summary:
    "Microsoft AI launched MAI Code 2 and MAI Code 2 Flash in GitHub Copilot on Nov 17, 2026 — frontier price-performance for enterprise coding, plus a cheaper Flash tier for routine work at scale. Pick both in the Copilot model picker.",
  body: `## What changed
On **November 17, 2026** (Microsoft Ignite), Microsoft AI shipped **MAI Code 2** and **MAI Code 2 Flash** into **GitHub Copilot** — the next generation of the MAI-Code family, spanning complex agentic engineering and high-volume everyday coding.

Microsoft positions **Code 2** for frontier **price-performance** on everyday enterprise coding tasks, and **Code 2 Flash** for affordable, high-quality coding on routine work at scale. Both are selectable today in Copilot’s model picker.

## Model lineup
- **MAI Code 2** — general-purpose coding model for deep debugging, multi-file implementation, refactoring, repository-wide reasoning, and shipping maintainable changes (including strong frontend / UI coding).
- **MAI Code 2 Flash** — lightweight, cost-efficient model for explanations, targeted edits, routine fixes, and rapid iteration.

Microsoft says these models prioritize **day-to-day enterprise coding** (not yet tuned for hard science research or very long-horizon agentic work).

## Price-performance claims (vendor)
From Microsoft AI’s announcement (benchmark averages on everyday Copilot-style tasks):
- **MAI Code 2** ≈ **98%** of GPT‑6.1 Sol performance at **~40%** of the cost; ≈ **96%** of Claude Opus 5.5 at **~5%** of the cost
- Blind frontend evals: reviewers preferred MAI Code 2 over GPT‑6 Sol **67%** of the time
- **MAI Code 2 Flash** comparable to GPT‑6 Luna / Claude Haiku 5.5 on routine coding benches at **~65%** / **~20%** of those costs

Treat vendor benchmarks as directional — validate on your own repos.

## Availability in GitHub Copilot
- **MAI Code 2:** Copilot **Pro, Pro+, Max, Business, Enterprise**
- **MAI Code 2 Flash:** Copilot **Free, Student, Pro, Pro+, Max, Business, Enterprise**
- Eligible subscribers on **annual** plans; billed under **usage-based** Copilot model pricing
- Business / Enterprise admins can enable or disable MAI models via Copilot **model policy** (new models auto-on unless defaults are locked down)

## Where to pick the models
Model picker surfaces include:
- Visual Studio Code · Visual Studio · JetBrains · Xcode · Eclipse
- Copilot CLI · Copilot cloud agent · Copilot app · github.com · GitHub Mobile

## Beyond Copilot
- **MAI Code 2 Flash** also noted in **limited-access preview** on **Microsoft Foundry**
- Microsoft says wider distribution is coming (e.g. OpenRouter, Vercel, Hermes, OpenCode, Kilo)
- A related **MAI Work Flash** derivative is positioned as a workhorse across Microsoft products (e.g. M365 / Fabric IQ)

## How to try it
1. Open GitHub Copilot chat / agent in your IDE or on github.com
2. Open the **model picker** and select **MAI Code 2** or **MAI Code 2 Flash**
3. Org admins: confirm the model is allowed under Copilot settings → model policy
4. Compare on a real multi-file refactor (Code 2) vs a batch of small fixes (Flash)

## Why it matters
- First-party Microsoft coding models now compete on **cost × quality** inside Copilot, not only via OpenAI / Anthropic pickers
- Flash on **Free / Student** lowers the barrier to try MAI coding at scale
- Clear “everyday enterprise” focus vs frontier agent-research models

## Sources
- [GitHub Changelog — MAI Code 2 and Flash in Copilot](https://github.blog/changelog/2026-11-17-mai-code-2-and-mai-code-2-flash-in-github-copilot/)
- [Microsoft AI — Introducing MAI Code 2 and Code 2 Flash](https://microsoft.ai/news/introducing-mai-code-2-and-mai-code-2-flash/)
- [GitHub Docs — supported Copilot models](https://docs.github.com/en/copilot/reference/ai-models/supported-models)`,
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
