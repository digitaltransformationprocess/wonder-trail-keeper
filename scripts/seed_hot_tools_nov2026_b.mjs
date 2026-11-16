/**
 * Second hot-tools batch — only inserts if slug/url missing.
 * Usage: node scripts/seed_hot_tools_nov2026_b.mjs
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
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
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
    name: "Magnific",
    slug: "magnific",
    publisher: "Freepik",
    url: "https://magnific.ai",
    summary: "AI image upscaler and enhancer known for creative detail hallucination control.",
    description:
      "Magnific upscales and retextures images with controllable creativity, popular for designers who need sharper marketing and concept art outputs.",
    pricing_model: "Paid",
    price_display: "Credits",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["upscale", "enhance", "image", "freepik"],
    strengths: ["Detail enhancement", "Creative control"],
    limits: ["Credit-based"],
    audience: ["Designers", "Creators"],
    categories: ["image-generation", "design-creativity"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Circleback",
    slug: "circleback",
    publisher: "Circleback",
    url: "https://circleback.ai",
    summary: "AI meeting notes and action tracking that syncs follow-ups into your workflow.",
    description:
      "Circleback captures meetings, generates notes, and helps teams track action items without living in a separate notes silo.",
    pricing_model: "Freemium",
    price_display: "Free / Paid",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["meetings", "notes", "actions", "crm"],
    strengths: ["Action-oriented notes", "Workflow sync"],
    limits: ["Meeting platform coverage varies"],
    audience: ["Teams", "Sales"],
    categories: ["productivity", "audio-music"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Reflect",
    slug: "reflect-ai",
    publisher: "Reflect",
    url: "https://reflect.app",
    summary: "Networked notes app with AI writing and backlinking for personal knowledge.",
    description:
      "Reflect combines daily notes, backlinks, and AI assistance for thinking and writing in a calendar-oriented knowledge base.",
    pricing_model: "Paid",
    price_display: "Subscription",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["notes", "pkm", "backlinks", "writing"],
    strengths: ["Clean PKM UX", "AI writing assist"],
    limits: ["Paid product"],
    audience: ["Professionals", "Writers"],
    categories: ["productivity", "writing-content"],
    type: "tool",
    platforms: ["web", "macos", "ios"],
  },
  {
    name: "Craft",
    slug: "craft-ai",
    publisher: "Craft Docs",
    url: "https://www.craft.do",
    summary: "Beautiful docs and notes app with AI drafting and organization features.",
    description:
      "Craft is a documents app for notes, wikis, and sharing, with AI help for drafting and structuring content.",
    pricing_model: "Freemium",
    price_display: "Free / Pro",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["docs", "notes", "wiki", "writing"],
    strengths: ["Polished writing UX", "Cross-platform"],
    limits: ["Advanced AI on higher plans"],
    audience: ["Professionals", "Teams"],
    categories: ["productivity", "writing-content"],
    type: "tool",
    platforms: ["web", "macos", "ios", "windows"],
  },
  {
    name: "Affine",
    slug: "affine",
    publisher: "ToEverything",
    url: "https://affine.pro",
    summary: "Open-source Notion/whiteboard hybrid with local-first docs and AI.",
    description:
      "AFFiNE merges docs, whiteboards, and databases in an open-source workspace with local-first options and AI assistance.",
    pricing_model: "Freemium",
    price_display: "Free / Cloud",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["notion alternative", "whiteboard", "local-first", "open source"],
    strengths: ["Open source", "Docs + canvas"],
    limits: ["Ecosystem still maturing"],
    audience: ["Teams", "Privacy-focused users"],
    categories: ["productivity"],
    type: "tool",
    platforms: ["web", "windows", "macos", "linux", "self-hosted"],
  },
  {
    name: "AppFlowy",
    slug: "appflowy",
    publisher: "AppFlowy",
    url: "https://appflowy.io",
    summary: "Open-source Notion alternative focused on privacy and extensibility.",
    description:
      "AppFlowy is an open-source workspace for docs and databases that can run locally with community plugins and AI features.",
    pricing_model: "Free",
    price_display: "Free / Open source",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["notion alternative", "open source", "local", "docs"],
    strengths: ["Privacy-first", "Open source"],
    limits: ["Fewer integrations than Notion"],
    audience: ["Individuals", "Teams"],
    categories: ["productivity"],
    type: "tool",
    platforms: ["windows", "macos", "linux", "self-hosted"],
  },
  {
    name: "Logseq",
    slug: "logseq",
    publisher: "Logseq",
    url: "https://logseq.com",
    summary: "Local-first outliner PKM with graph view and plugin ecosystem.",
    description:
      "Logseq stores knowledge as local Markdown/Org files with block outlining, graph view, and community plugins including AI helpers.",
    pricing_model: "Free",
    price_display: "Free / Open source",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["pkm", "outliner", "local-first", "graph"],
    strengths: ["Local files", "Block-based thinking"],
    limits: ["Steeper learning curve"],
    audience: ["Researchers", "Writers"],
    categories: ["productivity", "research-education"],
    type: "tool",
    platforms: ["windows", "macos", "linux", "ios", "android"],
  },
  {
    name: "OpenAI Codex CLI",
    slug: "codex-cli",
    publisher: "OpenAI",
    url: "https://github.com/openai/codex",
    summary: "OpenAI’s coding agent CLI for terminal-native software engineering tasks.",
    description:
      "Codex CLI brings OpenAI coding agents into the terminal for repo-aware edits, commands, and iterative development workflows.",
    pricing_model: "Paid",
    price_display: "API / ChatGPT plans",
    open_source: true,
    api_available: true,
    local_available: false,
    keywords: ["cli", "coding agent", "openai", "terminal"],
    strengths: ["Terminal-native", "Repo workflows"],
    limits: ["Needs OpenAI access/billing"],
    audience: ["Developers"],
    categories: ["coding-development"],
    type: "tool",
    platforms: ["windows", "macos", "linux", "api"],
  },
  {
    name: "Sourcegraph Cody",
    slug: "cody-sourcegraph",
    publisher: "Sourcegraph",
    url: "https://sourcegraph.com/cody",
    summary: "AI coding assistant grounded in your codebase via Sourcegraph context.",
    description:
      "Cody answers questions and edits code using deep codebase context from Sourcegraph search and embeddings.",
    pricing_model: "Freemium",
    price_display: "Free / Enterprise",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["coding", "codebase", "assistant", "sourcegraph"],
    strengths: ["Codebase-aware answers", "IDE integrations"],
    limits: ["Best with Sourcegraph indexing"],
    audience: ["Developers", "Enterprises"],
    categories: ["coding-development"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Codeium",
    slug: "codeium",
    publisher: "Codeium",
    url: "https://codeium.com",
    summary: "Fast AI code completion and chat across many IDEs, with free tiers.",
    description:
      "Codeium provides autocomplete, chat, and codebase awareness in popular editors, often used as a Copilot alternative.",
    pricing_model: "Freemium",
    price_display: "Free / Teams",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["autocomplete", "copilot alternative", "ide"],
    strengths: ["Generous free tier", "Broad IDE support"],
    limits: ["Enterprise features paid"],
    audience: ["Developers"],
    categories: ["coding-development"],
    type: "tool",
    platforms: ["windows", "macos", "linux"],
  },
  {
    name: "Ellipsis",
    slug: "ellipsis-dev",
    publisher: "Ellipsis",
    url: "https://www.ellipsis.dev",
    summary: "AI code review bot that comments on pull requests automatically.",
    description:
      "Ellipsis reviews PRs for bugs, style, and risk, posting actionable comments in GitHub workflows.",
    pricing_model: "Freemium",
    price_display: "Free / Paid",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["code review", "github", "pr", "bot"],
    strengths: ["Automated PR reviews", "GitHub-native"],
    limits: ["Review quality varies by repo"],
    audience: ["Engineering teams"],
    categories: ["coding-development"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Softgen",
    slug: "softgen",
    publisher: "Softgen",
    url: "https://softgen.ai",
    summary: "AI app builder that turns prompts into full-stack web applications.",
    description:
      "Softgen generates and iterates on web apps from natural language, targeting founders who want speed over blank-repo setup.",
    pricing_model: "Paid",
    price_display: "Subscription",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["app builder", "codegen", "fullstack", "prompt"],
    strengths: ["Fast app scaffolding", "Iterative edits"],
    limits: ["Complex products still need engineers"],
    audience: ["Founders", "Builders"],
    categories: ["coding-development"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Databutton",
    slug: "databutton",
    publisher: "Databutton",
    url: "https://databutton.com",
    summary: "AI builder for internal tools and data apps with Python backends.",
    description:
      "Databutton helps teams ship internal apps and AI workflows with generated UI and Python services.",
    pricing_model: "Paid",
    price_display: "Subscription",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["internal tools", "python", "data apps"],
    strengths: ["Data-app focus", "Python-friendly"],
    limits: ["Best for internal/ops use cases"],
    audience: ["Builders", "Ops teams"],
    categories: ["coding-development", "data-analytics"],
    type: "platform",
    platforms: ["web"],
  },
  {
    name: "Webflow AI",
    slug: "webflow-ai",
    publisher: "Webflow",
    url: "https://webflow.com/ai",
    summary: "AI features inside Webflow for copy, layout help, and faster site building.",
    description:
      "Webflow AI assists with generating section copy and accelerating website builds inside the Webflow designer.",
    pricing_model: "Paid",
    price_display: "Webflow plans",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["webflow", "website", "copy", "no-code"],
    strengths: ["Native to Webflow", "Design-quality sites"],
    limits: ["Requires Webflow workspace"],
    audience: ["Designers", "Marketers"],
    categories: ["design-creativity", "business-marketing"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Magic Patterns",
    slug: "magic-patterns",
    publisher: "Magic Patterns",
    url: "https://www.magicpatterns.com",
    summary: "AI UI generation for React components and design systems.",
    description:
      "Magic Patterns generates UI from prompts with an emphasis on reusable components and design-system friendly output.",
    pricing_model: "Freemium",
    price_display: "Free / Pro",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["ui", "react", "components", "design system"],
    strengths: ["Component-oriented", "Fast UI ideation"],
    limits: ["Still needs product polish"],
    audience: ["Designers", "Frontend developers"],
    categories: ["design-creativity", "coding-development"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Stitch by Google",
    slug: "stitch-google",
    publisher: "Google",
    url: "https://stitch.withgoogle.com",
    summary: "Google experiment for AI-assisted UI design from prompts and sketches.",
    description:
      "Stitch explores turning natural language and rough inputs into UI designs, aimed at faster product exploration.",
    pricing_model: "Free",
    price_display: "Experimental / Free",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["ui", "google", "design", "experiment"],
    strengths: ["Google Labs backing", "Fast mockups"],
    limits: ["Experimental availability"],
    audience: ["Designers", "PMs"],
    categories: ["design-creativity"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Durable",
    slug: "durable-ai",
    publisher: "Durable",
    url: "https://durable.co",
    summary: "AI website builder for small businesses that generates a full site in seconds.",
    description:
      "Durable creates small-business websites with AI, including copy, images, and basic business tools for getting online quickly.",
    pricing_model: "Freemium",
    price_display: "Free trial / Paid",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["website builder", "smb", "ai site"],
    strengths: ["Very fast SMB sites", "All-in-one"],
    limits: ["Less flexible than pro builders"],
    audience: ["Small businesses"],
    categories: ["business-marketing", "design-creativity"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "10Web",
    slug: "10web",
    publisher: "10Web",
    url: "https://10web.io",
    summary: "AI WordPress website builder and hosting with automated site generation.",
    description:
      "10Web generates WordPress sites with AI and pairs them with hosting, Elementor workflows, and optimization tools.",
    pricing_model: "Paid",
    price_display: "Subscription",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["wordpress", "website builder", "hosting"],
    strengths: ["WordPress-native", "Hosting included"],
    limits: ["WordPress lock-in"],
    audience: ["Agencies", "SMBs"],
    categories: ["business-marketing", "design-creativity"],
    type: "platform",
    platforms: ["web"],
  },
  {
    name: "Hostinger Horizons",
    slug: "hostinger-horizons",
    publisher: "Hostinger",
    url: "https://www.hostinger.com/horizons",
    summary: "Hostinger’s AI website builder for generating and hosting sites quickly.",
    description:
      "Horizons uses AI to generate website structure and content, then deploys on Hostinger infrastructure for beginners and small businesses.",
    pricing_model: "Paid",
    price_display: "Hosting plans",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["website builder", "hosting", "hostinger"],
    strengths: ["Cheap hosting bundle", "Beginner-friendly"],
    limits: ["Less design depth than pro tools"],
    audience: ["Small businesses"],
    categories: ["business-marketing"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Mixo",
    slug: "mixo",
    publisher: "Mixo",
    url: "https://www.mixo.io",
    summary: "AI landing page builder that creates launch sites from a short prompt.",
    description:
      "Mixo generates startup landing pages with copy, sections, and waitlist collection so founders can validate ideas quickly.",
    pricing_model: "Freemium",
    price_display: "Free / Paid",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["landing page", "waitlist", "startup"],
    strengths: ["Fast launch pages", "Waitlist built-in"],
    limits: ["Template-like output"],
    audience: ["Founders"],
    categories: ["business-marketing"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Jasper",
    slug: "jasper-ai",
    publisher: "Jasper",
    url: "https://www.jasper.ai",
    summary: "Enterprise AI content platform for marketing teams and brand voice.",
    description:
      "Jasper helps marketing teams generate on-brand content across campaigns with templates, brand voice, and collaboration features.",
    pricing_model: "Paid",
    price_display: "Subscription",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["marketing", "copy", "brand voice", "content"],
    strengths: ["Brand voice controls", "Team workflows"],
    limits: ["Premium pricing"],
    audience: ["Marketing teams"],
    categories: ["writing-content", "business-marketing"],
    type: "platform",
    platforms: ["web", "api"],
  },
  {
    name: "DeepL Write",
    slug: "deepl-write",
    publisher: "DeepL",
    url: "https://www.deepl.com/write",
    summary: "AI writing improvement from DeepL for clarity, tone, and rewrites.",
    description:
      "DeepL Write improves sentences for clarity and style, complementing DeepL Translate for multilingual professionals.",
    pricing_model: "Freemium",
    price_display: "Free / Pro",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["writing", "rewrite", "tone", "deepl"],
    strengths: ["High-quality rewrites", "Trusted brand"],
    limits: ["Language coverage varies vs Translate"],
    audience: ["Professionals", "Writers"],
    categories: ["writing-content"],
    type: "tool",
    platforms: ["web", "api"],
  },
  {
    name: "Explainpaper",
    slug: "explainpaper",
    publisher: "Explainpaper",
    url: "https://www.explainpaper.com",
    summary: "Upload research PDFs and highlight passages for plain-language explanations.",
    description:
      "Explainpaper helps readers understand academic papers by explaining highlighted sections in simpler language.",
    pricing_model: "Freemium",
    price_display: "Free / Paid",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["research", "pdf", "papers", "explain"],
    strengths: ["Great for dense papers", "Simple UX"],
    limits: ["Best on text-heavy PDFs"],
    audience: ["Students", "Researchers"],
    categories: ["research-education"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Missive",
    slug: "missive",
    publisher: "Missive",
    url: "https://missiveapp.com",
    summary: "Collaborative inbox for teams with shared email, chat, and AI assists.",
    description:
      "Missive combines shared inboxes, internal comments, and AI writing help for customer and ops teams that live in email.",
    pricing_model: "Freemium",
    price_display: "Free / Paid",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["shared inbox", "email", "collaboration", "support"],
    strengths: ["Team email collaboration", "Integrations"],
    limits: ["AI depends on plan"],
    audience: ["Support teams", "Ops"],
    categories: ["productivity", "business-marketing"],
    type: "tool",
    platforms: ["web", "macos", "windows", "ios", "android"],
  },
  {
    name: "Plane",
    slug: "plane-so",
    publisher: "Plane",
    url: "https://plane.so",
    summary: "Open-source project management alternative to Jira with modern UX.",
    description:
      "Plane is an open-source project management tool for issues, cycles, and roadmaps, with self-host and cloud options.",
    pricing_model: "Freemium",
    price_display: "Free / Cloud",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["project management", "jira alternative", "open source"],
    strengths: ["Open source", "Modern PM UX"],
    limits: ["Fewer enterprise plugins than Jira"],
    audience: ["Engineering teams"],
    categories: ["productivity", "coding-development"],
    type: "platform",
    platforms: ["web", "self-hosted"],
  },
];

const PLATFORM_ALIASES = { chrome: "web", docker: "self-hosted", cloud: "web" };

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
  const { data: bySlug } = await sb.from("tools").select("id").eq("slug", tool.slug).maybeSingle();
  if (bySlug?.id) {
    console.log(`[skip] slug ${tool.slug}`);
    return "skipped";
  }
  const { data: byUrl } = await sb
    .from("tools")
    .select("id, slug")
    .eq("official_url", tool.url)
    .maybeSingle();
  if (byUrl?.id) {
    console.log(`[skip] url -> ${byUrl.slug}`);
    return "skipped";
  }

  const publisherId = await ensurePublisher(sb, tool.publisher);
  const sourceId = await ensureSource(sb, tool.url);

  const { data: inserted, error } = await sb
    .from("tools")
    .insert({
      name: tool.name,
      slug: tool.slug,
      publisher_id: publisherId,
      summary: tool.summary,
      description: tool.description,
      official_url: tool.url,
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
      status: "pending_review",
      last_verified_at: new Date().toISOString().slice(0, 10),
    })
    .select("id")
    .single();
  if (error) throw error;

  const toolId = inserted.id;
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

  console.log(`[tool] ${tool.slug}`);
  return "inserted";
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

  let inserted = 0;
  let skipped = 0;
  let failed = 0;
  for (const tool of TOOLS) {
    try {
      const r = await upsertTool(sb, tool);
      if (r === "inserted") inserted += 1;
      else skipped += 1;
    } catch (err) {
      failed += 1;
      console.error(`[fail] ${tool.slug}:`, err.message || err);
    }
  }

  const { count: published } = await sb
    .from("tools")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");

  console.log(`[done] inserted=${inserted} skipped=${skipped} failed=${failed} published=${published}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
