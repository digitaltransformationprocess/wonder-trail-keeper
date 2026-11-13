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
  {
    name: "Microsoft Foundry Skills",
    slug: "microsoft-foundry-skills",
    publisher: "Microsoft",
    url: "https://skills.sh/microsoft/azure-skills/microsoft-foundry",
    summary:
      "Microsoft’s high-install Foundry Agent Skill for Azure AI / Foundry workflows in coding agents.",
    description:
      "microsoft-foundry is among the top skills.sh installs from Microsoft’s azure-skills collection — guiding agents through Foundry and Azure AI setup and operations.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "microsoft", "azure", "foundry", "ai"],
    strengths: ["Official Microsoft", "Very high install volume"],
    limits: ["Azure/Foundry-specific"],
    audience: ["Azure developers", "Enterprise teams"],
    categories: ["skills", "coding-development", "data-analytics"],
    type: "open-source",
    platforms: ["web"],
    popularity: 91,
  },
  {
    name: "Microsoft Azure Skills",
    slug: "microsoft-azure-skills",
    publisher: "Microsoft",
    url: "https://github.com/microsoft/azure-skills",
    summary:
      "Official Microsoft Azure Agent Skills pack (deploy, storage, diagnostics, compliance, and more).",
    description:
      "microsoft/azure-skills is the vendor collection powering many of the highest-install Azure skills on skills.sh — deploy, storage, AI gateway, Kubernetes, and related cloud workflows for agents.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "azure", "microsoft", "cloud", "devops"],
    strengths: ["Largest official vendor pack", "Broad Azure coverage"],
    limits: ["Requires Azure context"],
    audience: ["Cloud engineers", "DevOps"],
    categories: ["skills", "coding-development", "automation-agents"],
    type: "open-source",
    platforms: ["web"],
    popularity: 90,
  },
  {
    name: "grill-me",
    slug: "grill-me",
    publisher: "Matt Pocock",
    url: "https://skills.sh/mattpocock/skills/grill-me",
    summary:
      "Popular Matt Pocock skill that forces agents to interrogate requirements before writing code.",
    description:
      "grill-me is a top community Agent Skill that makes coding agents ask clarifying questions and pressure-test assumptions before implementing — widely installed on skills.sh.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "requirements", "grill-me", "matt-pocock", "planning"],
    strengths: ["Huge install base", "Improves agent requirement gathering"],
    limits: ["Adds back-and-forth before coding"],
    audience: ["Developers", "Tech leads"],
    categories: ["skills", "coding-development", "productivity"],
    type: "open-source",
    platforms: ["web"],
    popularity: 89,
  },
  {
    name: "grill-with-docs",
    slug: "grill-with-docs",
    publisher: "Matt Pocock",
    url: "https://skills.sh/mattpocock/skills/grill-with-docs",
    summary:
      "Matt Pocock skill that grills requirements while grounding answers in project docs.",
    description:
      "grill-with-docs extends the grill-me pattern with documentation-aware questioning — another high-install skill from mattpocock/skills.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "docs", "grill-with-docs", "matt-pocock", "planning"],
    strengths: ["Docs-aware clarification", "Strong community adoption"],
    limits: ["Needs readable project docs"],
    audience: ["Developers"],
    categories: ["skills", "coding-development", "productivity"],
    type: "open-source",
    platforms: ["web"],
    popularity: 87,
  },
  {
    name: "Hyperframes",
    slug: "hyperframes-skill",
    publisher: "HeyGen",
    url: "https://skills.sh/heygen-com/skills/hyperframes",
    summary:
      "HeyGen’s popular Hyperframes Agent Skill for AI video / creative frame workflows.",
    description:
      "hyperframes is a top-install HeyGen skill on skills.sh for agent-assisted video and creative production workflows.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "heygen", "hyperframes", "video", "creative"],
    strengths: ["High install volume", "Official HeyGen skill"],
    limits: ["Creative/video-oriented"],
    audience: ["Creators", "Video engineers"],
    categories: ["skills", "video-generation", "design-creativity"],
    type: "open-source",
    platforms: ["web"],
    popularity: 88,
  },
  {
    name: "Remotion Skills",
    slug: "remotion-skills",
    publisher: "Remotion",
    url: "https://github.com/remotion-dev/skills",
    summary:
      "Official Remotion Agent Skills pack (create, render, captions, markup) for React video.",
    description:
      "remotion-dev/skills is the official collection behind remotion-best-practices, remotion-render, remotion-create, and related high-traffic video skills on skills.sh.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "remotion", "react-video", "render", "captions"],
    strengths: ["Official Remotion", "Multiple specialized skills"],
    limits: ["Remotion ecosystem only"],
    audience: ["Creative developers"],
    categories: ["skills", "video-generation", "coding-development"],
    type: "open-source",
    platforms: ["web"],
    popularity: 87,
  },
  {
    name: "remotion-render",
    slug: "remotion-render",
    publisher: "Remotion",
    url: "https://skills.sh/remotion-dev/skills/remotion-render",
    summary:
      "Remotion skill focused on rendering programmatic React videos with agents.",
    description:
      "remotion-render helps agents correctly render Remotion compositions — a frequently installed companion to remotion-best-practices.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "remotion", "render", "video"],
    strengths: ["Task-specific", "Strong Remotion adoption"],
    limits: ["Render pipeline must be available"],
    audience: ["Video engineers"],
    categories: ["skills", "video-generation"],
    type: "open-source",
    platforms: ["web"],
    popularity: 84,
  },
  {
    name: "Supabase Skills",
    slug: "supabase-skills",
    publisher: "Supabase",
    url: "https://skills.sh/supabase",
    summary:
      "Official Supabase Agent Skills for database, auth, storage, and edge function workflows.",
    description:
      "Supabase’s skills.sh vendor pack helps coding agents work correctly with Postgres, Auth, Storage, and Edge Functions in Supabase projects.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "supabase", "postgres", "auth", "edge-functions"],
    strengths: ["Official vendor", "High relevance for app backends"],
    limits: ["Supabase-specific"],
    audience: ["Full-stack developers"],
    categories: ["skills", "coding-development", "data-analytics"],
    type: "open-source",
    platforms: ["web"],
    popularity: 85,
  },
  {
    name: "Firebase Skills",
    slug: "firebase-skills",
    publisher: "Firebase",
    url: "https://skills.sh/firebase",
    summary:
      "Official Firebase Agent Skills pack for Google Firebase app backends and client SDKs.",
    description:
      "Firebase’s skills.sh collection guides agents through common Firebase product workflows — among the higher official-vendor install totals on the registry.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "firebase", "google", "backend", "mobile"],
    strengths: ["Official Google/Firebase", "Strong install volume"],
    limits: ["Firebase-specific"],
    audience: ["App developers"],
    categories: ["skills", "coding-development"],
    type: "open-source",
    platforms: ["web"],
    popularity: 84,
  },
  {
    name: "GitHub Skills",
    slug: "github-agent-skills",
    publisher: "GitHub",
    url: "https://skills.sh/github",
    summary:
      "Official GitHub Agent Skills for repository, Actions, and collaboration workflows.",
    description:
      "GitHub’s skills.sh vendor pack is one of the largest official collections by install volume — helping agents operate safely around repos, PRs, and Actions.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "github", "actions", "pull-requests", "devops"],
    strengths: ["Official GitHub", "Very high aggregate installs"],
    limits: ["GitHub-platform focused"],
    audience: ["Developers", "DevOps"],
    categories: ["skills", "coding-development", "automation-agents"],
    type: "open-source",
    platforms: ["web"],
    popularity: 86,
  },
  {
    name: "Firecrawl Skills",
    slug: "firecrawl-skills",
    publisher: "Firecrawl",
    url: "https://skills.sh/firecrawl",
    summary:
      "Official Firecrawl Agent Skills for web crawling and page-to-markdown extraction in agents.",
    description:
      "Firecrawl’s skills.sh pack teaches agents how to scrape and structure web content via Firecrawl — a popular vendor collection for research and ingestion workflows.",
    pricing_model: "Open source",
    price_display: "Free / Firecrawl plans",
    open_source: true,
    api_available: true,
    local_available: false,
    keywords: ["skills", "firecrawl", "scraping", "crawl", "markdown"],
    strengths: ["Official Firecrawl", "Useful for agent research"],
    limits: ["Needs Firecrawl API access for live crawls"],
    audience: ["Builders", "Data/ingestion teams"],
    categories: ["skills", "automation-agents", "research-education"],
    type: "open-source",
    platforms: ["web"],
    popularity: 83,
  },
  {
    name: "Expo Skills",
    slug: "expo-skills",
    publisher: "Expo",
    url: "https://skills.sh/expo",
    summary:
      "Official Expo Agent Skills for React Native / Expo app development with coding agents.",
    description:
      "Expo’s skills.sh pack helps agents follow current Expo and React Native patterns when scaffolding and shipping mobile apps.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "expo", "react-native", "mobile"],
    strengths: ["Official Expo", "Strong mobile relevance"],
    limits: ["Expo/RN-specific"],
    audience: ["Mobile developers"],
    categories: ["skills", "coding-development"],
    type: "open-source",
    platforms: ["web"],
    popularity: 82,
  },
  {
    name: "better-auth Skills",
    slug: "better-auth-skills",
    publisher: "better-auth",
    url: "https://skills.sh/better-auth",
    summary:
      "Official better-auth Agent Skills for modern authentication setup in TypeScript apps.",
    description:
      "better-auth’s skills.sh pack guides agents through auth configuration patterns for the popular TypeScript authentication library.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "auth", "better-auth", "typescript", "security"],
    strengths: ["Official library skills", "Auth-focused"],
    limits: ["better-auth specific"],
    audience: ["Full-stack developers"],
    categories: ["skills", "coding-development"],
    type: "open-source",
    platforms: ["web"],
    popularity: 80,
  },
  {
    name: "Cloudflare Skills",
    slug: "cloudflare-skills",
    publisher: "Cloudflare",
    url: "https://skills.sh/cloudflare",
    summary:
      "Official Cloudflare Agent Skills for Workers, Pages, and edge deployment workflows.",
    description:
      "Cloudflare’s skills.sh vendor pack helps agents build and deploy on Workers/Pages and related Cloudflare products.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "cloudflare", "workers", "edge", "pages"],
    strengths: ["Official Cloudflare", "Edge/dev platform coverage"],
    limits: ["Cloudflare-specific"],
    audience: ["Edge developers"],
    categories: ["skills", "coding-development", "automation-agents"],
    type: "open-source",
    platforms: ["web"],
    popularity: 81,
  },
  {
    name: "Sentry Skills",
    slug: "sentry-skills",
    publisher: "Sentry",
    url: "https://skills.sh/getsentry",
    summary:
      "Official Sentry Agent Skills for error monitoring, tracing, and observability setup.",
    description:
      "getsentry’s skills.sh pack guides agents to instrument apps with Sentry correctly — useful for production-ready agent coding sessions.",
    pricing_model: "Open source",
    price_display: "Free / Sentry plans",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["skills", "sentry", "observability", "errors", "tracing"],
    strengths: ["Official Sentry", "Large skill catalog"],
    limits: ["Best with a Sentry project"],
    audience: ["Backend and frontend developers"],
    categories: ["skills", "coding-development"],
    type: "open-source",
    platforms: ["web"],
    popularity: 80,
  },
  {
    name: "Clerk Skills",
    slug: "clerk-skills",
    publisher: "Clerk",
    url: "https://skills.sh/clerk",
    summary:
      "Official Clerk Agent Skills for authentication and user management in modern web apps.",
    description:
      "Clerk’s skills.sh pack helps agents integrate Clerk auth, sessions, and organization features with current SDK patterns.",
    pricing_model: "Open source",
    price_display: "Free / Clerk plans",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["skills", "clerk", "auth", "users", "sessions"],
    strengths: ["Official Clerk", "Auth UX focused"],
    limits: ["Clerk-specific"],
    audience: ["Full-stack developers"],
    categories: ["skills", "coding-development"],
    type: "open-source",
    platforms: ["web"],
    popularity: 79,
  },
  {
    name: "Prisma Skills",
    slug: "prisma-skills",
    publisher: "Prisma",
    url: "https://skills.sh/prisma",
    summary:
      "Official Prisma Agent Skills for schema design, migrations, and Prisma Client usage.",
    description:
      "Prisma’s skills.sh pack steers agents toward correct Prisma schema and Client patterns when building TypeScript data layers.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "prisma", "orm", "postgres", "typescript"],
    strengths: ["Official Prisma", "Common stack coverage"],
    limits: ["Prisma-specific"],
    audience: ["Backend developers"],
    categories: ["skills", "coding-development", "data-analytics"],
    type: "open-source",
    platforms: ["web"],
    popularity: 78,
  },
  {
    name: "Neon Skills",
    slug: "neon-skills",
    publisher: "Neon",
    url: "https://skills.sh/neondatabase",
    summary:
      "Official Neon Agent Skills for serverless Postgres branching and database workflows.",
    description:
      "neondatabase’s skills.sh pack helps agents work with Neon’s serverless Postgres, branches, and connection patterns.",
    pricing_model: "Open source",
    price_display: "Free / Neon plans",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["skills", "neon", "postgres", "serverless", "database"],
    strengths: ["Official Neon", "Serverless Postgres focus"],
    limits: ["Neon-specific"],
    audience: ["Backend developers"],
    categories: ["skills", "coding-development", "data-analytics"],
    type: "open-source",
    platforms: ["web"],
    popularity: 77,
  },
  {
    name: "OpenAI Skills",
    slug: "openai-skills",
    publisher: "OpenAI",
    url: "https://skills.sh/openai",
    summary:
      "Official OpenAI Agent Skills for API, Assistants, and model integration patterns.",
    description:
      "OpenAI’s skills.sh vendor pack helps coding agents use OpenAI APIs and related product patterns correctly.",
    pricing_model: "Open source",
    price_display: "Free / OpenAI usage",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["skills", "openai", "api", "assistants", "models"],
    strengths: ["Official OpenAI", "Large skill catalog"],
    limits: ["OpenAI platform focused"],
    audience: ["AI app developers"],
    categories: ["skills", "coding-development", "ai-assistants"],
    type: "open-source",
    platforms: ["web"],
    popularity: 82,
  },
  {
    name: "LangChain Skills",
    slug: "langchain-skills",
    publisher: "LangChain",
    url: "https://skills.sh/langchain-ai",
    summary:
      "Official LangChain Agent Skills for building LLM apps, agents, and LangGraph workflows.",
    description:
      "langchain-ai’s skills.sh pack guides agents through LangChain/LangGraph patterns for tool-using LLM applications.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "langchain", "langgraph", "agents", "llm"],
    strengths: ["Official LangChain", "Agent framework coverage"],
    limits: ["Framework-specific"],
    audience: ["AI engineers"],
    categories: ["skills", "coding-development", "automation-agents"],
    type: "open-source",
    platforms: ["web"],
    popularity: 80,
  },
  {
    name: "browser-use Skills",
    slug: "browser-use-skills",
    publisher: "browser-use",
    url: "https://skills.sh/browser-use",
    summary:
      "Official browser-use Agent Skills for AI-driven browser automation agents.",
    description:
      "browser-use’s skills.sh pack helps agents control real browsers for automation and QA-style tasks using the browser-use stack.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "browser-use", "automation", "agents", "qa"],
    strengths: ["Focused browser-agent tooling", "Official pack"],
    limits: ["Needs browser runtime"],
    audience: ["Automation engineers"],
    categories: ["skills", "automation-agents", "coding-development"],
    type: "open-source",
    platforms: ["web"],
    popularity: 78,
  },
  {
    name: "ui-sdk-write-code",
    slug: "ui-sdk-write-code",
    publisher: "Vercel Labs",
    url: "https://skills.sh/vercel-labs/ui/ui-sdk-write-code",
    summary:
      "Vercel UI SDK skill for writing idiomatic ui-sdk component code with agents.",
    description:
      "ui-sdk-write-code is the primary coding skill from vercel-labs/ui — used when agents author or edit UI SDK core/adapters the way framework experts would.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "ui-sdk", "write-code", "vercel", "components"],
    strengths: ["Official UI SDK skill", "Expert coding bar"],
    limits: ["UI SDK repo-oriented"],
    audience: ["Component library authors"],
    categories: ["skills", "coding-development", "design-creativity"],
    type: "open-source",
    platforms: ["web"],
    popularity: 83,
  },
  {
    name: "ui-sdk-unslop",
    slug: "ui-sdk-unslop",
    publisher: "Vercel Labs",
    url: "https://skills.sh/vercel-labs/ui/ui-sdk-unslop",
    summary:
      "Vercel UI SDK skill that strips AI slop from component diffs before merge.",
    description:
      "ui-sdk-unslop reviews agent-written UI SDK changes for readability and idiomatic style — part of the official vercel-labs/ui skill set.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "ui-sdk", "unslop", "review", "vercel"],
    strengths: ["Quality gate for agent code", "Official Vercel Labs"],
    limits: ["UI SDK focused"],
    audience: ["Component authors"],
    categories: ["skills", "coding-development"],
    type: "open-source",
    platforms: ["web"],
    popularity: 81,
  },
  {
    name: "AWS Skills",
    slug: "aws-agent-skills",
    publisher: "Amazon Web Services",
    url: "https://skills.sh/aws",
    summary:
      "Official AWS Agent Skills for cloud architecture and service workflows with coding agents.",
    description:
      "AWS’s skills.sh vendor pack helps agents work with common AWS services and deployment patterns.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "aws", "cloud", "devops", "infrastructure"],
    strengths: ["Official AWS", "Broad cloud coverage"],
    limits: ["AWS-specific"],
    audience: ["Cloud engineers"],
    categories: ["skills", "coding-development", "automation-agents"],
    type: "open-source",
    platforms: ["web"],
    popularity: 79,
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
