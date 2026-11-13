/**
 * Ensure "Skills" category + seed popular verified agent/skill packs.
 * Usage: node scripts/seed_skills.mjs
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

const CATEGORY = {
  name: "Skills",
  slug: "skills",
  description:
    "Agent skills, coding guidelines, and installable skill packs for Cursor, Claude, Codex, and similar AI coding agents.",
  sort_order: 8,
};

/** Popular, verifiable skill packs / skill tooling (GitHub + official docs). */
const TOOLS = [
  {
    name: "Vercel UI SDK",
    slug: "vercel-labs-ui",
    publisher: "Vercel Labs",
    url: "https://github.com/vercel-labs/ui",
    summary:
      "Official Vercel UI SDK and agent skills for building accessible, unstyled components across React and other frameworks.",
    description:
      "vercel-labs/ui is the open-source UI SDK (behaviors + adapters) with companion agent skills (write-code, docs, unslop, expert-review) used to build and review UI components with coding agents.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "ui-sdk", "vercel", "cursor", "a11y", "components"],
    strengths: ["Official Vercel stack", "Agent skills included", "Multi-framework"],
    limits: ["Skills target the UI SDK workflow"],
    audience: ["Developers", "Design engineers"],
    categories: ["skills", "coding-development", "design-creativity"],
    type: "open-source",
    platforms: ["web"],
    popularity: 92,
  },
  {
    name: "Modern Web Guidance",
    slug: "modern-web-guidance",
    publisher: "Google Chrome",
    url: "https://github.com/GoogleChrome/modern-web-guidance-src",
    summary:
      "Chrome’s modern web guidance corpus and analyzer for updating sites to current platform best practices.",
    description:
      "modern-web-guidance-src powers the Modern Web Guidance analyzer (npx modern-web-guidance) with keep/drop criteria for legacy patterns like dark-mode toggles, helping agents and humans modernize frontends safely.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "web-platform", "chrome", "legacy-scan", "guidance"],
    strengths: ["Backed by Chrome", "Deterministic legacy scans", "Actionable keep/drop rules"],
    limits: ["Guidance coverage expands over time"],
    audience: ["Frontend developers", "Agents"],
    categories: ["skills", "coding-development"],
    type: "open-source",
    platforms: ["web"],
    popularity: 90,
  },
  {
    name: "General Legal Templates",
    slug: "general-legal-templates",
    publisher: "General Legal",
    url: "https://github.com/General-Legal/legal-templates",
    summary:
      "Open legal document templates (privacy, terms, cookies, and more) useful for product and agent workflows.",
    description:
      "General-Legal/legal-templates is a public library of starter legal templates that teams and agents adapt for SaaS and catalog sites — useful as a skill/source pack for drafting site policies.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "legal", "templates", "privacy", "terms"],
    strengths: ["Practical starter templates", "Open GitHub source"],
    limits: ["Not legal advice — must be customized"],
    audience: ["Founders", "Product teams", "Agents"],
    categories: ["skills", "finance-legal"],
    type: "open-source",
    platforms: ["web"],
    popularity: 82,
  },
  {
    name: "Anthropic Skills",
    slug: "anthropic-skills",
    publisher: "Anthropic",
    url: "https://github.com/anthropics/skills",
    summary:
      "Anthropic’s official public Agent Skills repository, including document and creative skill examples.",
    description:
      "anthropics/skills is the reference collection of Agent Skills for Claude — covering skill creation patterns and popular skills such as frontend-design and document workflows (DOCX, PDF, PPTX, XLSX).",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "claude", "anthropic", "agent-skills", "frontend-design"],
    strengths: ["Official Anthropic source", "Widely installed skills", "Skill-creator patterns"],
    limits: ["Claude-oriented examples"],
    audience: ["Developers", "Claude users"],
    categories: ["skills", "coding-development", "automation-agents"],
    type: "open-source",
    platforms: ["web"],
    popularity: 98,
  },
  {
    name: "Vercel Agent Skills",
    slug: "vercel-agent-skills",
    publisher: "Vercel Labs",
    url: "https://github.com/vercel-labs/agent-skills",
    summary:
      "Vercel’s official collection of high-traffic agent skills for React, design guidelines, and agent tooling.",
    description:
      "vercel-labs/agent-skills hosts widely used skills such as web-design-guidelines, vercel-react-best-practices, find-skills, and agent-browser — installable via skills.sh for Cursor and other agents.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "vercel", "react", "agent-browser", "find-skills"],
    strengths: ["Very high install volume", "Official Vercel Labs", "Cursor-ready"],
    limits: ["Focused on web/React/agent ops"],
    audience: ["Developers", "Cursor users"],
    categories: ["skills", "coding-development", "automation-agents"],
    type: "open-source",
    platforms: ["web"],
    popularity: 96,
  },
  {
    name: "Skills CLI (skills.sh)",
    slug: "skills-cli",
    publisher: "Vercel Labs",
    url: "https://github.com/vercel-labs/skills",
    summary:
      "The skills.sh CLI and registry for discovering and installing agent skills across Cursor, Claude Code, Codex, and more.",
    description:
      "vercel-labs/skills powers `npx skills add` / skills.sh — the common installer and discovery surface for Agent Skills across many coding agents.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "skills.sh", "cli", "registry", "cursor"],
    strengths: ["De-facto skills installer", "Multi-agent support", "Open registry"],
    limits: ["Requires network to install packs"],
    audience: ["Developers", "Agent builders"],
    categories: ["skills", "coding-development", "automation-agents"],
    type: "open-source",
    platforms: ["web", "macos", "windows", "linux"],
    popularity: 97,
  },
  {
    name: "find-skills",
    slug: "find-skills",
    publisher: "Vercel Labs",
    url: "https://skills.sh/vercel-labs/agent-skills/find-skills",
    summary:
      "Ultra-popular skill that helps agents discover and recommend the right skills for a task.",
    description:
      "find-skills is one of the most installed Agent Skills on skills.sh — used when an agent should search and suggest relevant skills instead of guessing workflows.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "discovery", "find-skills", "vercel", "agent"],
    strengths: ["Massive install base", "Meta-skill for skill discovery"],
    limits: ["Depends on skills registry availability"],
    audience: ["Developers", "Agent users"],
    categories: ["skills", "automation-agents"],
    type: "open-source",
    platforms: ["web"],
    popularity: 99,
  },
  {
    name: "agent-browser",
    slug: "agent-browser",
    publisher: "Vercel Labs",
    url: "https://skills.sh/vercel-labs/agent-skills/agent-browser",
    summary:
      "Widely used Vercel skill for browser automation and page interaction inside coding agents.",
    description:
      "agent-browser is a top skills.sh install that gives agents structured browser control patterns for navigating and verifying web UIs.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "browser", "automation", "vercel", "agent"],
    strengths: ["Top install counts", "Practical browser workflows"],
    limits: ["Needs a browser runtime in the agent environment"],
    audience: ["Developers", "QA with agents"],
    categories: ["skills", "automation-agents", "coding-development"],
    type: "open-source",
    platforms: ["web"],
    popularity: 95,
  },
  {
    name: "frontend-design (Anthropic)",
    slug: "frontend-design-skill",
    publisher: "Anthropic",
    url: "https://skills.sh/anthropics/skills/frontend-design",
    summary:
      "Anthropic’s popular frontend-design Agent Skill for polished UI generation and design-system-aware UI work.",
    description:
      "frontend-design is among the most installed skills from anthropics/skills — guiding agents to produce distinctive, production-minded UI instead of generic layouts.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "frontend", "design", "anthropic", "ui"],
    strengths: ["Very high adoption", "Official Anthropic skill"],
    limits: ["Design taste still needs human review"],
    audience: ["Frontend developers", "Design engineers"],
    categories: ["skills", "design-creativity", "coding-development"],
    type: "open-source",
    platforms: ["web"],
    popularity: 94,
  },
  {
    name: "web-design-guidelines",
    slug: "web-design-guidelines",
    publisher: "Vercel Labs",
    url: "https://skills.sh/vercel-labs/agent-skills/web-design-guidelines",
    summary:
      "Vercel Labs skill packing modern web design guidelines for agent-assisted UI work.",
    description:
      "web-design-guidelines is a high-traffic Vercel agent skill that steers coding agents toward contemporary layout, typography, and interaction patterns.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "design", "vercel", "guidelines", "ui"],
    strengths: ["Popular on skills.sh", "Pairs with React best practices"],
    limits: ["Opinionated toward Vercel design taste"],
    audience: ["Frontend developers"],
    categories: ["skills", "design-creativity", "coding-development"],
    type: "open-source",
    platforms: ["web"],
    popularity: 91,
  },
  {
    name: "vercel-react-best-practices",
    slug: "vercel-react-best-practices",
    publisher: "Vercel Labs",
    url: "https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices",
    summary:
      "Vercel’s React best-practices Agent Skill for modern React and Next.js coding patterns.",
    description:
      "vercel-react-best-practices is a widely installed skill that encodes Vercel’s recommended React patterns for agents writing app code.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "react", "nextjs", "vercel", "best-practices"],
    strengths: ["Official Vercel guidance", "High install volume"],
    limits: ["React/Next-centric"],
    audience: ["React developers"],
    categories: ["skills", "coding-development"],
    type: "open-source",
    platforms: ["web"],
    popularity: 93,
  },
  {
    name: "Remotion Best Practices",
    slug: "remotion-best-practices",
    publisher: "Remotion",
    url: "https://skills.sh/remotion-dev/skills/remotion-best-practices",
    summary:
      "Popular Remotion skill pack for agent-assisted programmatic video creation in React.",
    description:
      "remotion-best-practices is a top skills.sh pack from remotion-dev for building and rendering React-based videos with agents.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "remotion", "video", "react", "motion"],
    strengths: ["Category leader for Remotion", "Strong community installs"],
    limits: ["Remotion-specific"],
    audience: ["Video engineers", "Creative developers"],
    categories: ["skills", "video-generation", "coding-development"],
    type: "open-source",
    platforms: ["web"],
    popularity: 88,
  },
  {
    name: "skill-creator",
    slug: "skill-creator",
    publisher: "Anthropic",
    url: "https://skills.sh/anthropics/skills/skill-creator",
    summary:
      "Anthropic’s skill for authoring new Agent Skills with the recommended structure and patterns.",
    description:
      "skill-creator helps agents and humans draft new SKILL.md packages correctly — a core meta-skill in the Anthropic skills ecosystem.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "skill-creator", "anthropic", "authoring"],
    strengths: ["Official authoring guidance", "Widely referenced"],
    limits: ["Oriented to Agent Skills format"],
    audience: ["Skill authors", "Developers"],
    categories: ["skills", "automation-agents", "coding-development"],
    type: "open-source",
    platforms: ["web"],
    popularity: 86,
  },
  {
    name: "Cursor Agent Skills",
    slug: "cursor-agent-skills",
    publisher: "Cursor",
    url: "https://cursor.com/docs/skills",
    summary:
      "Cursor’s official Agent Skills documentation and built-in skill system for project and personal skills.",
    description:
      "Cursor Agent Skills documents how Cursor loads skills from .agents/skills / .cursor/skills, plus built-in skills for automation, PRs, hooks, and more — the host platform many skill packs target.",
    pricing_model: "Freemium",
    price_display: "Included with Cursor",
    open_source: false,
    api_available: false,
    local_available: true,
    keywords: ["skills", "cursor", "agent-skills", "ide"],
    strengths: ["Native Cursor integration", "Personal + project skills"],
    limits: ["Docs evolve with Cursor releases"],
    audience: ["Cursor users", "Developers"],
    categories: ["skills", "coding-development", "automation-agents"],
    type: "platform",
    platforms: ["macos", "windows", "linux"],
    popularity: 94,
  },
];

const TYPE_ALIASES = {
  "open-source": "open-source",
  tool: "tool",
  platform: "platform",
  framework: "framework",
  agent: "agent",
};

const PLATFORM_ALIASES = {
  web: "web",
  macos: "macos",
  windows: "windows",
  linux: "linux",
  "self-hosted": "self-hosted",
};

async function idBySlug(sb, table, slug) {
  const { data } = await sb.from(table).select("id").eq("slug", slug).maybeSingle();
  return data?.id ?? null;
}

async function idByKey(sb, table, key) {
  const { data } = await sb.from(table).select("id").eq("key", key).maybeSingle();
  return data?.id ?? null;
}

async function ensureCategory(sb) {
  const existing = await idBySlug(sb, "categories", CATEGORY.slug);
  if (existing) {
    await sb
      .from("categories")
      .update({
        name: CATEGORY.name,
        description: CATEGORY.description,
        is_active: true,
        sort_order: CATEGORY.sort_order,
      })
      .eq("id", existing);
    console.log(`[category] updated ${CATEGORY.slug}`);
    return existing;
  }
  const { data, error } = await sb
    .from("categories")
    .insert({
      name: CATEGORY.name,
      slug: CATEGORY.slug,
      description: CATEGORY.description,
      is_active: true,
      sort_order: CATEGORY.sort_order,
    })
    .select("id")
    .single();
  if (error) throw error;
  console.log(`[category] inserted ${CATEGORY.slug}`);
  return data.id;
}

async function ensurePublisher(sb, name) {
  const { data: existing } = await sb
    .from("publishers")
    .select("id")
    .eq("name", name)
    .maybeSingle();
  if (existing) return existing.id;
  const { data, error } = await sb.from("publishers").insert({ name }).select("id").single();
  if (error) throw error;
  return data.id;
}

async function ensureSource(sb) {
  const url = "https://github.com";
  const { data: existing } = await sb.from("sources").select("id").eq("url", url).maybeSingle();
  if (existing) return existing.id;
  const { data, error } = await sb
    .from("sources")
    .insert({
      url,
      publisher: "GitHub",
      source_type: "official",
      reliability_level: "A",
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function upsertTool(sb, tool, sourceId) {
  const { data: existing } = await sb
    .from("tools")
    .select("id")
    .eq("slug", tool.slug)
    .maybeSingle();
  if (existing) {
    console.log(`[tool] skip existing ${tool.slug}`);
    // Still ensure category link
    const catId = await idBySlug(sb, "categories", "skills");
    if (catId) {
      await sb.from("tool_categories").upsert({
        tool_id: existing.id,
        category_id: catId,
        is_primary: true,
      });
    }
    return "skipped";
  }

  const publisherId = await ensurePublisher(sb, tool.publisher);
  const logo_url = logoFor(tool.url);

  const { data: inserted, error } = await sb
    .from("tools")
    .insert({
      name: tool.name,
      slug: tool.slug,
      publisher_id: publisherId,
      summary: tool.summary,
      description: tool.description,
      official_url: tool.url,
      logo_url,
      pricing_model: tool.pricing_model,
      price_display: tool.price_display,
      open_source: tool.open_source,
      api_available: tool.api_available,
      local_available: tool.local_available,
      keywords: tool.keywords,
      strengths: tool.strengths,
      limits: tool.limits,
      audience: tool.audience,
      status: "pending_review",
      last_verified_at: new Date().toISOString().slice(0, 10),
    })
    .select("id")
    .single();
  if (error) throw error;
  const toolId = inserted.id;

  for (let i = 0; i < tool.categories.length; i++) {
    const catId = await idBySlug(sb, "categories", tool.categories[i]);
    if (!catId) {
      console.warn(`[warn] missing category ${tool.categories[i]} for ${tool.slug}`);
      continue;
    }
    await sb.from("tool_categories").upsert({
      tool_id: toolId,
      category_id: catId,
      is_primary: i === 0,
    });
  }

  const typeSlug = TYPE_ALIASES[tool.type] ?? tool.type;
  const typeId = await idBySlug(sb, "solution_types", typeSlug);
  if (typeId) {
    await sb.from("tool_types").upsert({
      tool_id: toolId,
      solution_type_id: typeId,
      is_primary: true,
    });
  }

  for (const raw of tool.platforms) {
    const key = PLATFORM_ALIASES[raw] ?? raw;
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
    verified_at: new Date().toISOString().slice(0, 10),
  });

  const { error: pubErr } = await sb
    .from("tools")
    .update({ status: "published", updated_at: new Date().toISOString() })
    .eq("id", toolId);
  if (pubErr) throw pubErr;

  console.log(`[tool] inserted ${tool.slug}`);
  return "inserted";
}

async function bumpRanks(sb) {
  const refreshed = await sb.rpc("refresh_tool_internal_ranks");
  if (refreshed.error) {
    console.warn("[rank] refresh:", refreshed.error.message);
  }

  for (const tool of TOOLS) {
    const { data: t } = await sb.from("tools").select("id").eq("slug", tool.slug).maybeSingle();
    if (!t) continue;
    const popularity = tool.popularity ?? 80;
    const rank_score = Math.min(100, Math.round(popularity * 0.65 + 92 * 0.35));
    const { error } = await sb.from("tool_internal_ranks").upsert({
      tool_id: t.id,
      popularity,
      trust: 92,
      rank_score,
      updated_at: new Date().toISOString(),
    });
    if (error) console.warn(`[rank] ${tool.slug}:`, error.message);
  }
  console.log("[rank] curated skill popularity applied");
}

async function main() {
  const env = {
    ...loadEnv(join(ROOT, ".env.production")),
    ...loadEnv(join(ROOT, ".env")),
  };
  const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    console.error("Missing Supabase URL or secret key");
    process.exit(1);
  }

  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  await ensureCategory(sb);
  // Shift research-education sort if needed — skills uses 8; bump research+ to make room
  await sb.from("categories").update({ sort_order: 9 }).eq("slug", "research-education");
  await sb.from("categories").update({ sort_order: 10 }).eq("slug", "business-marketing");
  await sb.from("categories").update({ sort_order: 11 }).eq("slug", "data-analytics");
  await sb.from("categories").update({ sort_order: 12 }).eq("slug", "automation-agents");
  await sb.from("categories").update({ sort_order: 13 }).eq("slug", "design-creativity");
  await sb.from("categories").update({ sort_order: 14 }).eq("slug", "finance-legal");
  await sb.from("categories").update({ sort_order: 15 }).eq("slug", "healthcare");
  await sb.from("categories").update({ sort_order: 16 }).eq("slug", "robotics-hardware");

  const sourceId = await ensureSource(sb);

  let inserted = 0;
  let skipped = 0;
  let failed = 0;
  for (const tool of TOOLS) {
    try {
      const r = await upsertTool(sb, tool, sourceId);
      if (r === "inserted") inserted += 1;
      else skipped += 1;
    } catch (err) {
      failed += 1;
      console.error(`[fail] ${tool.slug}:`, err.message || err);
    }
  }

  await bumpRanks(sb);

  const { count } = await sb
    .from("tool_categories")
    .select("*", { count: "exact", head: true })
    .eq("category_id", await idBySlug(sb, "categories", "skills"));

  console.log(`[done] inserted=${inserted} skipped=${skipped} failed=${failed}`);
  console.log(`[done] skills category links=${count}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
