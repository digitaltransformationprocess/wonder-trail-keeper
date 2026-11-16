/**
 * Seed OpenClaw, Hermes Agent, and peer open-source agents missing from catalog.
 * Usage: node scripts/seed_open_agents_batch.mjs
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

function domainFromUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "") || null;
  } catch {
    return null;
  }
}

function logoFor(url) {
  const domain = domainFromUrl(url);
  return domain
    ? `https://www.google.com/s2/favicons?sz=128&domain=${encodeURIComponent(domain)}`
    : null;
}

const TOOLS = [
  {
    name: "OpenClaw",
    slug: "openclaw",
    publisher: "OpenClaw Foundation",
    url: "https://openclaw.ai",
    api_docs_url: "https://docs.openclaw.ai",
    summary:
      "Open-source personal AI assistant that runs on your machine and answers in WhatsApp, Telegram, Slack, Discord, and 20+ chat apps.",
    description:
      "OpenClaw is an MIT-licensed, local-first AI assistant stewarded by the OpenClaw Foundation (501(c)(3)). A Gateway on Mac, Windows, or Linux keeps memory and credentials on your hardware while you chat from WhatsApp, Telegram, Discord, Slack, Signal, iMessage, and other channels. It can browse, manage files, run commands, use skills/plugins, and share a multiplayer gateway with a team. Bring hosted, subscription, or local models — there is no paid OpenClaw product tier or hosted service.",
    pricing_model: "Free",
    price_display: "Free / Open source (BYOK)",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["openclaw", "personal assistant", "whatsapp", "telegram", "self-hosted", "gateway"],
    strengths: ["Chat apps you already use", "Local-first memory and state", "No paid product lock-in"],
    limits: ["Security hardening required for full system access", "Sandboxing off by default"],
    audience: ["Individuals", "Small teams"],
    categories: ["automation-agents", "ai-assistants", "productivity"],
    type: "agent",
    platforms: ["windows", "macos", "linux"],
  },
  {
    name: "Hermes Agent",
    slug: "hermes-agent",
    publisher: "Nous Research",
    url: "https://hermes-agent.nousresearch.com",
    api_docs_url: "https://hermes-agent.nousresearch.com/docs",
    summary:
      "Self-improving open-source AI agent from Nous Research with memory, skills, chat channels, and remote execution backends.",
    description:
      "Hermes Agent is an MIT-licensed agent from Nous Research with a built-in learning loop: curated memory, skills created from experience, cross-session recall, cron automations, and subagents. Talk to it from CLI, Telegram, Discord, Slack, WhatsApp, Signal, and more. Run locally or on Docker/SSH/Modal/Daytona/Vercel Sandbox backends. Bring your own model via Nous Portal, OpenRouter, OpenAI, Ollama, or custom endpoints. Optional Nous Portal and Hermes Cloud add paid models and always-on hosting.",
    pricing_model: "Freemium",
    price_display: "Free agent · optional Portal / Cloud",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["hermes", "nous research", "self-hosted", "skills", "memory", "telegram"],
    strengths: ["Learning loop and reusable skills", "Works in your project directory", "Many execution backends"],
    limits: ["Model spend is separate", "Cloud / Portal features are paid extras"],
    audience: ["Developers", "Power users"],
    categories: ["automation-agents", "coding-development", "ai-assistants"],
    type: "agent",
    platforms: ["windows", "macos", "linux"],
  },
  {
    name: "goose",
    slug: "goose",
    publisher: "Agentic AI Foundation",
    url: "https://goose-docs.ai",
    api_docs_url: "https://goose-docs.ai",
    summary:
      "Open-source general AI agent (desktop, CLI, API) from Block, now under the Linux Foundation’s Agentic AI Foundation.",
    description:
      "goose is an Apache-2.0 local AI agent for coding, research, automation, and more. It ships a native desktop app (macOS/Linux/Windows), CLI, and API/GDK to embed agents. Works with 15+ providers including Ollama and subscription access via ACP, plus 70+ MCP extensions, recipes, subagents, and sandbox/permission controls. Created at Block and stewarded by the Agentic AI Foundation.",
    pricing_model: "Free",
    price_display: "Free / Open source (BYOK)",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["goose", "block", "aaif", "mcp", "desktop agent", "cli"],
    strengths: ["Desktop + CLI + API", "Deep MCP ecosystem", "Vendor-neutral foundation home"],
    limits: ["Model quality depends on provider", "General agent — not chat-channel focused"],
    audience: ["Developers", "Knowledge workers"],
    categories: ["automation-agents", "coding-development", "ai-assistants"],
    type: "agent",
    platforms: ["windows", "macos", "linux"],
  },
  {
    name: "NanoClaw",
    slug: "nanoclaw",
    publisher: "NanoClaw",
    url: "https://nanoclaw.dev",
    api_docs_url: "https://github.com/nanocoai/nanoclaw",
    summary:
      "Lightweight, container-isolated open-source assistant — a smaller, security-minded alternative to OpenClaw.",
    description:
      "NanoClaw is an MIT-licensed personal AI assistant that runs agents in Docker containers with filesystem isolation. It connects to WhatsApp, Telegram, Slack, Discord, and other channels, supports memory and scheduled jobs, and routes credentials through a gateway so agents do not hold raw API keys. Built around Anthropic’s Agent SDK / Claude Code tooling for a compact, auditable codebase.",
    pricing_model: "Free",
    price_display: "Free / Open source (BYOK)",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["nanoclaw", "openclaw alternative", "docker", "container", "self-hosted"],
    strengths: ["Container isolation by default", "Smaller codebase to audit", "Multi-channel messaging"],
    limits: ["Fewer features than full OpenClaw", "Docker required for isolation model"],
    audience: ["Security-conscious users", "Developers"],
    categories: ["automation-agents", "ai-assistants"],
    type: "agent",
    platforms: ["macos", "linux", "windows"],
  },
  {
    name: "Agent Zero",
    slug: "agent-zero",
    publisher: "Agent Zero",
    url: "https://www.agent-zero.ai",
    api_docs_url: "https://github.com/agent0ai/agent-zero",
    summary:
      "Open-source agentic framework that gives the agent a full Linux computer — terminal, browser, and desktop apps in a sandbox.",
    description:
      "Agent Zero is an open-source agent with its own Linux workspace for research, coding, documents, browser automation, and desktop-app control. It runs sandboxed (often via Docker/Launcher) with optional host file access through A0 CLI, projects/memory per job, plugin hub, and subordinate agents. Aimed at users who want an agent that can operate a full computer environment, not just an IDE chat.",
    pricing_model: "Free",
    price_display: "Free / Open source (BYOK)",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["agent zero", "linux workspace", "browser", "desktop", "sandbox"],
    strengths: ["Full Linux computer per agent", "Browser annotation cowork", "Self-hostable"],
    limits: ["Heavier setup than a simple CLI agent", "Security depends on sandbox config"],
    audience: ["Developers", "Researchers"],
    categories: ["automation-agents", "coding-development"],
    type: "agent",
    platforms: ["windows", "macos", "linux", "web"],
  },
  {
    name: "Browser Use",
    slug: "browser-use",
    publisher: "Browser Use",
    url: "https://browser-use.com",
    api_docs_url: "https://docs.browser-use.com",
    summary:
      "Open-source AI browser agent library (and optional cloud) that controls a real Chrome browser via CDP to complete web tasks.",
    description:
      "Browser Use is an MIT-licensed Python/TypeScript library for AI browser agents: the model writes Python against a persistent REPL and Chrome DevTools Protocol helpers to click, type, navigate, and finish tasks. Use the open-source library or CLI locally with any LLM, or Browser Use Cloud for hosted stealth browsers and a hosted agent API. Commonly paired with coding agents like Hermes, OpenClaw, Claude Code, and Codex.",
    pricing_model: "Freemium",
    price_display: "Free OSS · Cloud from ~$0.06/browser-hour",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["browser agent", "cdp", "web automation", "browser-use", "rpa"],
    strengths: ["Real browser control via CDP", "Works with many agent harnesses", "Cloud option for scale"],
    limits: ["Web UIs change and break scripts", "Cloud usage is paid"],
    audience: ["Developers", "Automation teams"],
    categories: ["automation-agents", "coding-development"],
    type: "agent",
    platforms: ["linux", "macos", "windows", "web"],
  },
  {
    name: "Letta",
    slug: "letta",
    publisher: "Letta",
    url: "https://www.letta.com",
    api_docs_url: "https://docs.letta.com",
    summary:
      "Platform for stateful AI agents with advanced long-term memory (formerly MemGPT) — self-host or use Letta Cloud.",
    description:
      "Letta (formerly MemGPT) builds stateful agents whose memory can learn and improve over time. Run the open agent harness via CLI (`letta`), App Server, desktop/web apps, and channels like Slack, Telegram, and Discord, or use the Agent SDK in TypeScript. Self-host agent memory and identity, or keep them available across devices with Letta Cloud.",
    pricing_model: "Freemium",
    price_display: "Open source · optional Cloud",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["letta", "memgpt", "memory", "stateful agents", "self-hosted"],
    strengths: ["Advanced agent memory", "Self-host or Cloud", "Channels + SDK"],
    limits: ["Cloud features are paid", "Memory quality depends on model and setup"],
    audience: ["Developers", "Teams building agents"],
    categories: ["automation-agents", "ai-assistants", "coding-development"],
    type: "agent",
    platforms: ["windows", "macos", "linux", "web"],
  },
];

async function ensurePublisher(sb, name) {
  const { data: existing } = await sb.from("publishers").select("id").eq("name", name).maybeSingle();
  if (existing?.id) return existing.id;
  const { data, error } = await sb.from("publishers").insert({ name }).select("id").single();
  if (error) throw error;
  return data.id;
}

async function ensureSource(sb, url) {
  const { data: existing } = await sb.from("sources").select("id").eq("url", url).maybeSingle();
  if (existing?.id) return existing.id;
  const { data, error } = await sb
    .from("sources")
    .insert({
      url,
      source_type: "official",
      reliability_level: "A",
      publisher: domainFromUrl(url),
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function idBySlug(sb, table, slug) {
  const { data, error } = await sb.from(table).select("id").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

async function idByKey(sb, table, key) {
  const { data, error } = await sb.from(table).select("id").eq("key", key).maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

async function upsertTool(sb, tool) {
  const { data: bySlug } = await sb.from("tools").select("id, official_url").eq("slug", tool.slug).maybeSingle();
  if (!bySlug?.id) {
    const { data: byUrl } = await sb
      .from("tools")
      .select("id, slug")
      .eq("official_url", tool.url)
      .maybeSingle();
    if (byUrl?.id) {
      console.log(`[skip url] ${tool.slug} -> ${byUrl.slug}`);
      return "skipped";
    }
  }

  const publisherId = await ensurePublisher(sb, tool.publisher);
  const sourceId = await ensureSource(sb, tool.url);
  const today = new Date().toISOString().slice(0, 10);

  const row = {
    name: tool.name,
    slug: tool.slug,
    publisher_id: publisherId,
    summary: tool.summary,
    description: tool.description,
    official_url: tool.url,
    api_docs_url: tool.api_docs_url,
    logo_url: logoFor(tool.url),
    pricing_model: tool.pricing_model,
    price_display: tool.price_display,
    open_source: tool.open_source,
    api_available: tool.api_available,
    local_available: tool.local_available,
    keywords: tool.keywords,
    strengths: tool.strengths,
    limits: tool.limits,
    audience: tool.audience,
    last_verified_at: today,
    updated_at: new Date().toISOString(),
  };

  let toolId = bySlug?.id ?? null;
  if (toolId) {
    const { error } = await sb.from("tools").update(row).eq("id", toolId);
    if (error) throw error;
    console.log(`[update] ${tool.slug}`);
  } else {
    const { data: inserted, error } = await sb
      .from("tools")
      .insert({ ...row, status: "pending_review" })
      .select("id")
      .single();
    if (error) throw error;
    toolId = inserted.id;
    console.log(`[insert] ${tool.slug}`);
  }

  for (let i = 0; i < tool.categories.length; i++) {
    const catId = await idBySlug(sb, "categories", tool.categories[i]);
    if (!catId) continue;
    await sb.from("tool_categories").upsert({
      tool_id: toolId,
      category_id: catId,
      is_primary: i === 0,
    });
  }

  const typeId = await idBySlug(sb, "solution_types", tool.type);
  if (typeId) {
    await sb.from("tool_types").upsert({
      tool_id: toolId,
      solution_type_id: typeId,
      is_primary: true,
    });
  }

  for (const key of tool.platforms) {
    const platformId = await idByKey(sb, "platforms", key);
    if (!platformId) continue;
    await sb.from("tool_platforms").upsert({
      tool_id: toolId,
      platform_id: platformId,
      status: "available",
    });
  }

  await sb.from("tool_sources").upsert({
    tool_id: toolId,
    source_id: sourceId,
    claim_key: "general",
    verified_at: today,
  });

  const { error: pubErr } = await sb
    .from("tools")
    .update({ status: "published", updated_at: new Date().toISOString() })
    .eq("id", toolId);
  if (pubErr) throw pubErr;

  return "inserted";
}

async function main() {
  const env = {
    ...loadEnv(join(ROOT, ".env.production")),
    ...loadEnv(join(ROOT, ".env")),
  };
  const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
  const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing Supabase URL or secret key");
    process.exit(1);
  }

  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let inserted = 0;
  let skipped = 0;
  let failed = 0;
  for (const tool of TOOLS) {
    try {
      const r = await upsertTool(sb, tool);
      if (r === "skipped") skipped += 1;
      else inserted += 1;
    } catch (err) {
      failed += 1;
      console.error(`[fail] ${tool.slug}:`, err.message || err);
    }
  }

  console.log(`done inserted_or_updated=${inserted} skipped=${skipped} failed=${failed}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
