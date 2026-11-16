/**
 * Seed OpenAI computer-use healthcare advance into /latest
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

const ITEM = {
  title: "OpenAI advances computer-use agents for healthcare teams",
  slug: "openai-computer-use-healthcare",
  kind: "feature",
  published_at: "2026-11-16",
  solution_slug: "chatgpt",
  source_url:
    "https://openai.com/index/advancing-computer-use-for-healthcare-teams/",
  summary:
    "OpenAI shared new computer-use results for clinical and admin workflows—EHR inbox tasks, prior auth, and partner rollouts with CVS Health, Abridge, Cigna, and Ambience—available via ChatGPT for Healthcare, Clinicians, and the API.",
  body: `## What shipped
OpenAI published new results on **computer-use agents for healthcare** (November 16, 2026): multi-step agents that click, type, and move between existing clinical and admin apps.

Highlights include EHR inbox evaluations with **GPT-6 Astra**, administrative benchmarks on HealthAdminBench, and production-style partner workflows (referrals, document sending, prior authorization prep).

## Who it is for
Healthcare organizations on ChatGPT for Healthcare, U.S. clinicians on ChatGPT for Clinicians, and developers building with the OpenAI API / computer-use guide. HIPAA-eligible use requires covered services and a Business Associate Agreement.

## Safety notes
OpenAI reports clinical safety review on inbox-style tasks and emphasizes human review, role-based access, audit logs, and agent controls when handling protected health information.

## FAQ
### Is this a new model launch?
No — it is a product / capability advance for **computer use** in healthcare workflows, with evaluation results and partner deployments.

### Where can teams start?
Organizations can enable computer use in ChatGPT for Healthcare; clinicians can use ChatGPT for Clinicians; developers can build via the OpenAI API computer-use guide.`,
};

async function ensureToolLink(sb, newsId, solutionSlug) {
  if (!solutionSlug) return;
  const { data: tool } = await sb
    .from("tools")
    .select("id")
    .eq("slug", solutionSlug)
    .maybeSingle();
  if (!tool?.id) {
    console.warn(`[skip link] no tool ${solutionSlug}`);
    return;
  }
  await sb.from("news_tool_links").upsert({
    news_item_id: newsId,
    tool_id: tool.id,
  });
}

async function main() {
  const env = { ...load(".env.production"), ...load(".env") };
  const sb = createClient(
    env.VITE_SUPABASE_URL,
    env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } },
  );

  const { data: tools } = await sb
    .from("tools")
    .select("slug,name")
    .or(
      "slug.ilike.%chatgpt%,slug.ilike.%openai%,name.ilike.%ChatGPT%,name.ilike.%OpenAI%",
    )
    .limit(25);
  console.log("candidate tools", tools);

  let solutionSlug = ITEM.solution_slug;
  const preferred = ["chatgpt", "openai", "chatgpt-enterprise", "openai-api"];
  const bySlug = new Map((tools ?? []).map((t) => [t.slug, t]));
  const found = preferred.map((s) => bySlug.get(s)).find(Boolean);
  if (found) solutionSlug = found.slug;
  else if (tools?.[0]?.slug) solutionSlug = tools[0].slug;

  const { data: existing } = await sb
    .from("news_items")
    .select("id,status")
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
    solution_slug: solutionSlug,
    status: "published",
    updated_at: new Date().toISOString(),
  };

  if (existing?.id) {
    const { error } = await sb.from("news_items").update(payload).eq("id", existing.id);
    if (error) throw error;
    await ensureToolLink(sb, existing.id, solutionSlug);
    console.log(`[update] ${ITEM.slug} -> ${solutionSlug}`);
  } else {
    const { data: row, error } = await sb
      .from("news_items")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw error;
    await ensureToolLink(sb, row.id, solutionSlug);
    console.log(`[insert] ${ITEM.slug} -> ${solutionSlug}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
