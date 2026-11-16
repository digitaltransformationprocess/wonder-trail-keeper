import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";

function loadEnv(path) {
  const out = {};
  if (!existsSync(path)) return out;
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
    out[k] = v;
  }
  return out;
}

const env = { ...loadEnv(".env.production"), ...loadEnv(".env") };
const sb = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
});

const SLUG = "wandb-weave";
const today = new Date().toISOString().slice(0, 10);

const { data: tool, error: findErr } = await sb
  .from("tools")
  .select("id")
  .eq("slug", SLUG)
  .single();
if (findErr) throw findErr;

const id = tool.id;

const patch = {
  name: "Weights & Biases Weave",
  summary:
    "Observability, tracing, and evaluation for production LLM agents and GenAI apps — from Weights & Biases.",
  description:
    "W&B Weave is the Weights & Biases toolkit for monitoring and improving LLM agents and applications. It provides agent-native tracing (sessions, turns, tools, sub-agents), out-of-the-box behavior signals and alerts, a flexible evaluation framework with scorers and LLM-as-judge, Playground for prompt/model iteration, Guardrails for safety/quality checks, and leaderboards to compare recipes. Coding agents can connect via W&B skills / MCP to read production data and run eval loops. Free tier includes tracing and evaluations with limited Weave data ingestion; Pro starts around $60/month with higher limits. Official site: https://wandb.ai/site/weave — docs and SDK on GitHub (wandb/weave).",
  official_url: "https://wandb.ai/site/weave",
  api_docs_url: "https://docs.wandb.ai/guides/weave/",
  repository_url: "https://github.com/wandb/weave",
  logo_url: "https://www.google.com/s2/favicons?sz=128&domain=wandb.ai",
  pricing_model: "Freemium",
  price_display: "Free · Pro from ~$60/mo",
  api_available: true,
  open_source: true,
  local_available: false,
  license: "Apache-2.0 (SDK)",
  keywords: [
    "weave",
    "wandb",
    "weights and biases",
    "llmops",
    "observability",
    "tracing",
    "evals",
    "agents",
    "guardrails",
    "llm",
  ],
  strengths: [
    "Agent-native tracing (sessions, turns, tools, sub-agents)",
    "Built-in evaluations, scorers, and LLM-as-judge",
    "Playground, Guardrails, and production monitoring signals",
    "Part of the broader W&B AI developer platform",
  ],
  limits: [
    "Hosted Weave ingestion quotas; overage can get expensive at scale",
    "Best value inside the W&B stack — not a minimal standalone logger",
    "Confirm current Free/Pro limits on the W&B pricing page",
  ],
  audience: ["ML / LLM engineers", "Agent builders", "AI platform teams"],
  last_verified_at: today,
  updated_at: new Date().toISOString(),
};

const { error: updErr } = await sb.from("tools").update(patch).eq("id", id);
if (updErr) throw updErr;

await sb.from("pricing_plans").delete().eq("tool_id", id);
const { error: planErr } = await sb.from("pricing_plans").insert([
  {
    tool_id: id,
    plan_name: "Free",
    price_amount: 0,
    currency: "USD",
    billing_period: "monthly",
    pricing_model: "Freemium",
    verified_at: today,
  },
  {
    tool_id: id,
    plan_name: "Pro",
    price_amount: 60,
    currency: "USD",
    billing_period: "monthly",
    pricing_model: "Paid",
    verified_at: today,
  },
  {
    tool_id: id,
    plan_name: "Enterprise",
    price_amount: null,
    currency: "USD",
    billing_period: "custom",
    pricing_model: "Enterprise",
    verified_at: today,
  },
]);
if (planErr) throw planErr;

async function ensureSource(url, publisher) {
  const { data: existing } = await sb
    .from("sources")
    .select("id")
    .eq("url", url)
    .maybeSingle();
  if (existing?.id) return existing.id;
  const { data: ins, error } = await sb
    .from("sources")
    .insert({
      url,
      source_type: "official",
      reliability_level: "A",
      publisher,
    })
    .select("id")
    .single();
  if (error) throw error;
  return ins.id;
}

const weaveSrc = await ensureSource("https://wandb.ai/site/weave", "wandb.ai");
const pricingSrc = await ensureSource(
  "https://wandb.ai/site/pricing/",
  "wandb.ai",
);
const docsSrc = await ensureSource(
  "https://docs.wandb.ai/guides/weave/",
  "wandb.ai",
);

for (const [sourceId, claimKey] of [
  [weaveSrc, "general"],
  [pricingSrc, "pricing"],
  [docsSrc, "api"],
]) {
  const { error } = await sb.from("tool_sources").upsert({
    tool_id: id,
    source_id: sourceId,
    claim_key: claimKey,
    verified_at: today,
  });
  if (error) throw error;
}

for (const slug of ["langfuse", "helicone"]) {
  const { data: alt } = await sb
    .from("tools")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (!alt?.id) continue;
  const { error } = await sb.from("tool_relations").upsert({
    from_tool_id: id,
    to_tool_id: alt.id,
    relation_type: "alternative",
  });
  if (error) console.warn("relation", slug, error.message);
  else console.log("alt linked:", slug);
}

const { data: out } = await sb
  .from("tools")
  .select("slug,name,summary,price_display,api_docs_url,strengths,limits")
  .eq("id", id)
  .single();
console.log(JSON.stringify(out, null, 2));
console.log("OK updated", SLUG);
