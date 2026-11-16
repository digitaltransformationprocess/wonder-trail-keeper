/**
 * Enrich LM Studio (Bionic + local API) catalog entry.
 * Usage: node scripts/seed_lm_studio.mjs
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

async function ensurePublisher(sb, name) {
  const { data: existing } = await sb
    .from("publishers")
    .select("id")
    .eq("name", name)
    .maybeSingle();
  if (existing?.id) return existing.id;
  const { data, error } = await sb
    .from("publishers")
    .insert({ name })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function ensureSource(sb, url) {
  const { data: existing } = await sb
    .from("sources")
    .select("id")
    .eq("url", url)
    .maybeSingle();
  if (existing?.id) return existing.id;
  const { data, error } = await sb
    .from("sources")
    .insert({
      url,
      source_type: "official",
      reliability_level: "A",
      publisher: new URL(url).hostname.replace(/^www\./, ""),
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function idBySlug(sb, table, slug) {
  const { data } = await sb.from(table).select("id").eq("slug", slug).maybeSingle();
  return data?.id ?? null;
}

async function idByKey(sb, table, key) {
  const { data } = await sb.from(table).select("id").eq("key", key).maybeSingle();
  return data?.id ?? null;
}

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
    .select("id")
    .eq("slug", "lm-studio")
    .single();
  if (!tool) throw new Error("lm-studio missing");

  const id = tool.id;
  const today = new Date().toISOString().slice(0, 10);
  const publisherId = await ensurePublisher(sb, "LM Studio");

  const { error } = await sb
    .from("tools")
    .update({
      name: "LM Studio",
      publisher_id: publisherId,
      summary:
        "Desktop app and Bionic agent to run open LLMs locally (llama.cpp / MLX), with optional cloud models and a local OpenAI/Anthropic-compatible API.",
      description:
        "LM Studio is a free desktop app for macOS, Windows, and Linux to discover, download, and run open models privately on your machine (llama.cpp + MLX). Bionic is LM Studio's agent for work, coding, documents, computer control, and real-time local voice transcription. Free plan includes Bionic Agent, local LLMs, offline voice transcription, and LM Link for up to 5 devices. Optional Bionic+ ($20/mo) and Pro ($100/mo) add US-hosted open models with Zero Data Retention. Developer server on localhost (lms server start) offers native REST API plus OpenAI- and Anthropic-compatible endpoints, MCP via API, and headless/llmster options.",
      official_url: "https://lmstudio.ai/",
      api_docs_url: "https://lmstudio.ai/docs/developer",
      logo_url: "https://www.google.com/s2/favicons?sz=128&domain=lmstudio.ai",
      pricing_model: "Freemium",
      price_display: "Free · Bionic+ $20/mo · Pro $100/mo",
      open_source: false,
      api_available: true,
      local_available: true,
      keywords: [
        "lm studio",
        "bionic",
        "local llm",
        "gguf",
        "mlx",
        "llama.cpp",
        "offline",
        "openai compatible",
        "mcp",
      ],
      strengths: [
        "Free local LLM runner for home and work",
        "Bionic agent + local voice transcription",
        "OpenAI- and Anthropic-compatible local API",
        "MCP via API and strong privacy / ZDR cloud option",
      ],
      limits: [
        "Local quality depends on your GPU/RAM",
        "Paid plans are for cloud Bionic models, not required for local use",
        "Largest frontier models still need strong hardware",
      ],
      audience: [
        "Developers",
        "Privacy-conscious users",
        "Teams running local AI",
      ],
      last_verified_at: today,
      updated_at: new Date().toISOString(),
      status: "published",
    })
    .eq("id", id);
  if (error) throw error;

  for (const [i, slug] of [
    "ai-assistants",
    "coding-development",
    "automation-agents",
  ].entries()) {
    const catId = await idBySlug(sb, "categories", slug);
    if (!catId) continue;
    await sb.from("tool_categories").upsert({
      tool_id: id,
      category_id: catId,
      is_primary: i === 0,
    });
  }

  const typeId = await idBySlug(sb, "solution_types", "tool");
  if (typeId) {
    await sb.from("tool_types").upsert({
      tool_id: id,
      solution_type_id: typeId,
      is_primary: true,
    });
  }

  for (const key of ["windows", "macos", "linux", "web"]) {
    const pid = await idByKey(sb, "platforms", key);
    if (pid) {
      await sb.from("tool_platforms").upsert({
        tool_id: id,
        platform_id: pid,
        status: "available",
      });
    }
  }

  const { data: feats } = await sb
    .from("features")
    .select("id,key")
    .in("key", [
      "text_generation",
      "code_assistance",
      "agents_automation",
      "api_access",
      "local_deploy",
      "audio_speech",
      "tool_calling",
    ]);
  for (const f of feats ?? []) {
    await sb.from("tool_features").upsert({
      tool_id: id,
      feature_id: f.id,
      availability: "available",
    });
  }

  await sb.from("pricing_plans").delete().eq("tool_id", id);
  await sb.from("pricing_plans").insert([
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
      plan_name: "Bionic+",
      price_amount: 20,
      currency: "USD",
      billing_period: "monthly",
      pricing_model: "Paid",
      verified_at: today,
    },
    {
      tool_id: id,
      plan_name: "Pro",
      price_amount: 100,
      currency: "USD",
      billing_period: "monthly",
      pricing_model: "Paid",
      verified_at: today,
    },
  ]);

  for (const [url, claim] of [
    ["https://lmstudio.ai/", "general"],
    ["https://lmstudio.ai/pricing", "pricing"],
    ["https://lmstudio.ai/docs/developer", "api"],
  ]) {
    const sid = await ensureSource(sb, url);
    await sb.from("tool_sources").upsert({
      tool_id: id,
      source_id: sid,
      claim_key: claim,
      verified_at: today,
    });
  }

  console.log("done -> /tools/lm-studio");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
