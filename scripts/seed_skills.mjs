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
    name: "ui-sdk",
    slug: "vercel-labs-ui",
    publisher: "Vercel Labs",
    url: "https://skills.sh/vercel-labs/ui/ui-sdk",
    repository: "https://github.com/vercel-labs/ui",
    summary:
      "Official Vercel UI SDK agent skill for building accessible, unstyled components across React and other frameworks.",
    description:
      "ui-sdk is the agent skill for vercel-labs/ui — behaviors + adapters used to build and review UI components with coding agents.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "ui-sdk", "vercel", "cursor", "a11y", "components"],
    strengths: ["Official Vercel stack", "Direct skills.sh page", "Multi-framework"],
    limits: ["Skills target the UI SDK workflow"],
    audience: ["Developers", "Design engineers"],
    categories: ["skills"],
    type: "open-source",
    platforms: ["web"],
    popularity: 92,
  },
  {
    name: "modern-web-guidance",
    slug: "modern-web-guidance",
    publisher: "Google Chrome",
    url: "https://skills.sh/googlechrome/modern-web-guidance/modern-web-guidance",
    repository: "https://github.com/GoogleChrome/modern-web-guidance",
    summary:
      "Chrome’s modern web guidance Agent Skill for updating sites to current platform best practices.",
    description:
      "modern-web-guidance is the installable Agent Skill (and CLI) from Google Chrome for searchable modern web guidance and legacy-pattern scans.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "web-platform", "chrome", "legacy-scan", "guidance"],
    strengths: ["Backed by Chrome", "Direct skills.sh skill page", "Actionable keep/drop rules"],
    limits: ["Guidance coverage expands over time"],
    audience: ["Frontend developers", "Agents"],
    categories: ["skills"],
    type: "open-source",
    platforms: ["web"],
    popularity: 90,
  },
  {
    name: "General Legal Templates",
    slug: "general-legal-templates",
    publisher: "General Legal",
    url: "https://github.com/General-Legal/legal-templates",
    repository: "https://github.com/General-Legal/legal-templates",
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
    categories: ["skills"],
    type: "open-source",
    platforms: ["web"],
    popularity: 82,
  },
  {
    name: "frontend-design (Anthropic pack)",
    slug: "anthropic-skills",
    publisher: "Anthropic",
    url: "https://skills.sh/anthropics/skills/frontend-design",
    repository: "https://github.com/anthropics/skills",
    summary:
      "Anthropic’s top Agent Skill for distinctive, production-minded frontend UI generation.",
    description:
      "frontend-design is the highest-install skill from anthropics/skills — guiding agents to produce polished UI instead of generic layouts. Full Anthropic pack lives on the linked repository.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "claude", "anthropic", "agent-skills", "frontend-design"],
    strengths: ["Official Anthropic skill page", "Very high installs", "Direct skills.sh link"],
    limits: ["Claude-oriented examples"],
    audience: ["Developers", "Claude users"],
    categories: ["skills"],
    type: "open-source",
    platforms: ["web"],
    popularity: 98,
  },
  {
    name: "vercel-react-best-practices (pack)",
    slug: "vercel-agent-skills",
    publisher: "Vercel Labs",
    url: "https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices",
    repository: "https://github.com/vercel-labs/agent-skills",
    summary:
      "Vercel’s top React best-practices Agent Skill from the official agent-skills pack.",
    description:
      "vercel-react-best-practices is the highest-install skill in vercel-labs/agent-skills — encoding Vercel React/Next patterns for coding agents.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "vercel", "react", "agent-browser", "find-skills"],
    strengths: ["Very high install volume", "Direct skills.sh skill page", "Cursor-ready"],
    limits: ["Focused on web/React/agent ops"],
    audience: ["Developers", "Cursor users"],
    categories: ["skills"],
    type: "open-source",
    platforms: ["web"],
    popularity: 96,
  },
  {
    name: "Skills CLI (skills.sh)",
    slug: "skills-cli",
    publisher: "Vercel Labs",
    url: "https://skills.sh",
    repository: "https://github.com/vercel-labs/skills",
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
    categories: ["skills"],
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
    categories: ["skills"],
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
    categories: ["skills"],
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
    categories: ["skills"],
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
    categories: ["skills"],
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
    categories: ["skills"],
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
    categories: ["skills"],
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
    categories: ["skills"],
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
    categories: ["skills"],
    type: "platform",
    platforms: ["macos", "windows", "linux"],
    popularity: 94,
  },
  {
    name: "microsoft-foundry",
    slug: "microsoft-foundry-skills",
    publisher: "Microsoft",
    url: "https://skills.sh/microsoft/azure-skills/microsoft-foundry",
    repository: "https://github.com/microsoft/azure-skills",
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
    strengths: ["Official Microsoft skill page", "Direct skills.sh link"],
    limits: ["Azure/Foundry-specific"],
    audience: ["Azure developers", "Enterprise teams"],
    categories: ["skills"],
    type: "open-source",
    platforms: ["web"],
    popularity: 91,
  },
  {
    name: "azure-deploy",
    slug: "microsoft-azure-skills",
    publisher: "Microsoft",
    url: "https://skills.sh/microsoft/azure-skills/azure-deploy",
    repository: "https://github.com/microsoft/azure-skills",
    summary:
      "Microsoft Azure deploy Agent Skill for cloud deployment workflows with coding agents.",
    description:
      "azure-deploy is a top skill from microsoft/azure-skills — guiding agents through Azure deployment patterns alongside diagnostics, storage, and related cloud skills.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "azure", "microsoft", "cloud", "devops"],
    strengths: ["Official Microsoft skill page", "Direct skills.sh link"],
    limits: ["Requires Azure context"],
    audience: ["Cloud engineers", "DevOps"],
    categories: ["skills"],
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
    categories: ["skills"],
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
    categories: ["skills"],
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
    categories: ["skills"],
    type: "open-source",
    platforms: ["web"],
    popularity: 88,
  },
  {
    name: "remotion-best-practices (pack)",
    slug: "remotion-skills",
    publisher: "Remotion",
    url: "https://skills.sh/remotion-dev/skills/remotion-best-practices",
    repository: "https://github.com/remotion-dev/skills",
    summary:
      "Official Remotion best-practices Agent Skill for React video with coding agents.",
    description:
      "remotion-best-practices is the flagship skill from remotion-dev/skills — companion skills cover render, create, captions, and markup.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "remotion", "react-video", "render", "captions"],
    strengths: ["Official Remotion skill page", "Direct skills.sh link"],
    limits: ["Remotion ecosystem only"],
    audience: ["Creative developers"],
    categories: ["skills"],
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
    categories: ["skills"],
    type: "open-source",
    platforms: ["web"],
    popularity: 84,
  },
  {
    name: "supabase-postgres-best-practices",
    slug: "supabase-skills",
    publisher: "Supabase",
    url: "https://skills.sh/supabase/agent-skills/supabase-postgres-best-practices",
    repository: "https://github.com/supabase/agent-skills",
    summary:
      "Official Supabase Agent Skill for Postgres performance, schema, and RLS best practices.",
    description:
      "supabase-postgres-best-practices is the top Supabase skill on skills.sh — guiding agents through query tuning, indexing, RLS, and schema design.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "supabase", "postgres", "auth", "edge-functions"],
    strengths: ["Official vendor skill page", "Direct skills.sh link"],
    limits: ["Supabase/Postgres-focused"],
    audience: ["Full-stack developers"],
    categories: ["skills"],
    type: "open-source",
    platforms: ["web"],
    popularity: 85,
  },
  {
    name: "firebase-basics",
    slug: "firebase-skills",
    publisher: "Firebase",
    url: "https://skills.sh/firebase/agent-skills/firebase-basics",
    repository: "https://github.com/firebase/agent-skills",
    summary:
      "Official Firebase basics Agent Skill for project setup and CLI workflows with coding agents.",
    description:
      "firebase-basics is the core Firebase skill on skills.sh for login, project init, and service setup before deeper Firebase skills.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "firebase", "google", "backend", "mobile"],
    strengths: ["Official Firebase skill page", "Direct skills.sh link"],
    limits: ["Firebase-specific"],
    audience: ["App developers"],
    categories: ["skills"],
    type: "open-source",
    platforms: ["web"],
    popularity: 84,
  },
  {
    name: "git-commit",
    slug: "github-agent-skills",
    publisher: "GitHub",
    url: "https://skills.sh/github/awesome-copilot/git-commit",
    repository: "https://github.com/github/awesome-copilot",
    summary:
      "Popular GitHub Agent Skill for writing clear, conventional git commits with coding agents.",
    description:
      "git-commit is a top skill from GitHub’s awesome-copilot collection on skills.sh — helping agents craft better commit messages and repo hygiene.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "github", "actions", "pull-requests", "devops"],
    strengths: ["Direct skills.sh skill page", "Very high installs"],
    limits: ["GitHub-workflow focused"],
    audience: ["Developers", "DevOps"],
    categories: ["skills"],
    type: "open-source",
    platforms: ["web"],
    popularity: 86,
  },
  {
    name: "firecrawl",
    slug: "firecrawl-skills",
    publisher: "Firecrawl",
    url: "https://skills.sh/firecrawl/cli/firecrawl",
    repository: "https://github.com/firecrawl/cli",
    summary:
      "Official Firecrawl Agent Skill for search, scrape, crawl, and markdown extraction.",
    description:
      "firecrawl is the primary Firecrawl CLI skill on skills.sh — teaching agents to gather clean, LLM-ready web content.",
    pricing_model: "Open source",
    price_display: "Free / Firecrawl plans",
    open_source: true,
    api_available: true,
    local_available: false,
    keywords: ["skills", "firecrawl", "scraping", "crawl", "markdown"],
    strengths: ["Official Firecrawl skill page", "Direct skills.sh link"],
    limits: ["Needs Firecrawl API access for live crawls"],
    audience: ["Builders", "Data/ingestion teams"],
    categories: ["skills"],
    type: "open-source",
    platforms: ["web"],
    popularity: 83,
  },
  {
    name: "building-native-ui",
    slug: "expo-skills",
    publisher: "Expo",
    url: "https://skills.sh/expo/skills/building-native-ui",
    repository: "https://github.com/expo/skills",
    summary:
      "Official Expo Agent Skill for native UI, routing, and React Native patterns.",
    description:
      "building-native-ui is a top Expo skill on skills.sh for Expo Router, styling, components, and platform conventions.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "expo", "react-native", "mobile"],
    strengths: ["Official Expo skill page", "Direct skills.sh link"],
    limits: ["Expo/RN-specific"],
    audience: ["Mobile developers"],
    categories: ["skills"],
    type: "open-source",
    platforms: ["web"],
    popularity: 82,
  },
  {
    name: "create-auth",
    slug: "better-auth-skills",
    publisher: "better-auth",
    url: "https://skills.sh/better-auth/skills/create-auth-skill",
    repository: "https://github.com/better-auth/skills",
    summary:
      "Official better-auth Agent Skill for scaffolding authentication in TypeScript apps.",
    description:
      "create-auth guides agents through Better Auth setup — frameworks, adapters, OAuth, and common auth plugins.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "auth", "better-auth", "typescript", "security"],
    strengths: ["Official skill page", "Direct skills.sh link"],
    limits: ["better-auth specific"],
    audience: ["Full-stack developers"],
    categories: ["skills"],
    type: "open-source",
    platforms: ["web"],
    popularity: 80,
  },
  {
    name: "cloudflare",
    slug: "cloudflare-skills",
    publisher: "Cloudflare",
    url: "https://skills.sh/cloudflare/skills/cloudflare",
    repository: "https://github.com/cloudflare/skills",
    summary:
      "Official Cloudflare Agent Skill for Workers, Pages, storage, AI, and edge products.",
    description:
      "cloudflare is the primary Cloudflare platform skill on skills.sh — routing agents to the right Cloudflare product and docs.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "cloudflare", "workers", "edge", "pages"],
    strengths: ["Official Cloudflare skill page", "Direct skills.sh link"],
    limits: ["Cloudflare-specific"],
    audience: ["Edge developers"],
    categories: ["skills"],
    type: "open-source",
    platforms: ["web"],
    popularity: 81,
  },
  {
    name: "sentry-fix-issues",
    slug: "sentry-skills",
    publisher: "Sentry",
    url: "https://skills.sh/getsentry/sentry-for-ai/sentry-fix-issues",
    repository: "https://github.com/getsentry/sentry-for-ai",
    summary:
      "Official Sentry Agent Skill for finding and fixing production issues with agents.",
    description:
      "sentry-fix-issues helps coding agents investigate Sentry errors and traces — a top skill from getsentry’s AI skill packs.",
    pricing_model: "Open source",
    price_display: "Free / Sentry plans",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["skills", "sentry", "observability", "errors", "tracing"],
    strengths: ["Official Sentry skill page", "Direct skills.sh link"],
    limits: ["Best with a Sentry project"],
    audience: ["Backend and frontend developers"],
    categories: ["skills"],
    type: "open-source",
    platforms: ["web"],
    popularity: 80,
  },
  {
    name: "clerk-setup",
    slug: "clerk-skills",
    publisher: "Clerk",
    url: "https://skills.sh/clerk/skills/clerk-setup",
    repository: "https://github.com/clerk/skills",
    summary:
      "Official Clerk Agent Skill for authentication setup across modern web frameworks.",
    description:
      "clerk-setup walks agents through Clerk install, env keys, providers, and framework-specific quickstarts.",
    pricing_model: "Open source",
    price_display: "Free / Clerk plans",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["skills", "clerk", "auth", "users", "sessions"],
    strengths: ["Official Clerk skill page", "Direct skills.sh link"],
    limits: ["Clerk-specific"],
    audience: ["Full-stack developers"],
    categories: ["skills"],
    type: "open-source",
    platforms: ["web"],
    popularity: 79,
  },
  {
    name: "prisma-client-api",
    slug: "prisma-skills",
    publisher: "Prisma",
    url: "https://skills.sh/prisma/skills/prisma-client-api",
    repository: "https://github.com/prisma/skills",
    summary:
      "Official Prisma Agent Skill for Prisma Client API patterns in TypeScript apps.",
    description:
      "prisma-client-api is a top Prisma skill on skills.sh for correct Client usage alongside setup and migration skills.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "prisma", "orm", "postgres", "typescript"],
    strengths: ["Official Prisma skill page", "Direct skills.sh link"],
    limits: ["Prisma-specific"],
    audience: ["Backend developers"],
    categories: ["skills"],
    type: "open-source",
    platforms: ["web"],
    popularity: 78,
  },
  {
    name: "neon-postgres",
    slug: "neon-skills",
    publisher: "Neon",
    url: "https://skills.sh/neondatabase/agent-skills/neon-postgres",
    repository: "https://github.com/neondatabase/agent-skills",
    summary:
      "Official Neon Agent Skill for serverless Postgres and Lakebase workflows.",
    description:
      "neon-postgres is the core Neon skill on skills.sh for branching, connections, and serverless Postgres patterns.",
    pricing_model: "Open source",
    price_display: "Free / Neon plans",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["skills", "neon", "postgres", "serverless", "database"],
    strengths: ["Official Neon skill page", "Direct skills.sh link"],
    limits: ["Neon-specific"],
    audience: ["Backend developers"],
    categories: ["skills"],
    type: "open-source",
    platforms: ["web"],
    popularity: 77,
  },
  {
    name: "security-best-practices",
    slug: "openai-skills",
    publisher: "OpenAI",
    url: "https://skills.sh/openai/skills/security-best-practices",
    repository: "https://github.com/openai/skills",
    summary:
      "Official OpenAI Agent Skill covering security best practices for agent and app workflows.",
    description:
      "security-best-practices is a top skill from OpenAI’s skills.sh pack for safer coding-agent and API integration patterns.",
    pricing_model: "Open source",
    price_display: "Free / OpenAI usage",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["skills", "openai", "api", "assistants", "models"],
    strengths: ["Official OpenAI skill page", "Direct skills.sh link"],
    limits: ["OpenAI ecosystem oriented"],
    audience: ["AI app developers"],
    categories: ["skills"],
    type: "open-source",
    platforms: ["web"],
    popularity: 82,
  },
  {
    name: "langgraph-fundamentals",
    slug: "langchain-skills",
    publisher: "LangChain",
    url: "https://skills.sh/langchain-ai/langchain-skills/langgraph-fundamentals",
    repository: "https://github.com/langchain-ai/langchain-skills",
    summary:
      "Official LangChain Agent Skill for LangGraph fundamentals and agent workflows.",
    description:
      "langgraph-fundamentals helps coding agents build correct LangGraph apps — a top skill from langchain-ai’s skills pack.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "langchain", "langgraph", "agents", "llm"],
    strengths: ["Official LangChain skill page", "Direct skills.sh link"],
    limits: ["Framework-specific"],
    audience: ["AI engineers"],
    categories: ["skills"],
    type: "open-source",
    platforms: ["web"],
    popularity: 80,
  },
  {
    name: "browser-use",
    slug: "browser-use-skills",
    publisher: "browser-use",
    url: "https://skills.sh/browser-use/browser-use/browser-use",
    repository: "https://github.com/browser-use/browser-use",
    summary:
      "Official browser-use Agent Skill for AI-driven browser automation.",
    description:
      "browser-use is the core skill for controlling real browsers in agent workflows via the browser-use stack.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "browser-use", "automation", "agents", "qa"],
    strengths: ["Direct skills.sh skill page", "Official pack"],
    limits: ["Needs browser runtime"],
    audience: ["Automation engineers"],
    categories: ["skills"],
    type: "open-source",
    platforms: ["web"],
    popularity: 78,
  },
  {
    name: "ui-sdk",
    slug: "ui-sdk-write-code",
    publisher: "Vercel Labs",
    url: "https://skills.sh/vercel-labs/ui/ui-sdk",
    repository: "https://github.com/vercel-labs/ui",
    summary:
      "Vercel UI SDK skill for writing idiomatic ui-sdk component code with agents.",
    description:
      "ui-sdk is the published coding skill from vercel-labs/ui — used when agents author or edit UI SDK core/adapters.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "ui-sdk", "write-code", "vercel", "components"],
    strengths: ["Official UI SDK skill page", "Direct skills.sh link"],
    limits: ["UI SDK repo-oriented"],
    audience: ["Component library authors"],
    categories: ["skills"],
    type: "open-source",
    platforms: ["web"],
    popularity: 83,
  },
  {
    name: "ui-sdk (review)",
    slug: "ui-sdk-unslop",
    publisher: "Vercel Labs",
    url: "https://skills.sh/vercel-labs/ui/ui-sdk",
    repository: "https://github.com/vercel-labs/ui",
    summary:
      "Vercel UI SDK skill page for idiomatic component work and agent code quality.",
    description:
      "Points to the published ui-sdk skill from vercel-labs/ui — the current public skill for UI SDK agent workflows.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "ui-sdk", "unslop", "review", "vercel"],
    strengths: ["Official UI SDK skill page", "Direct skills.sh link"],
    limits: ["UI SDK focused"],
    audience: ["Component authors"],
    categories: ["skills"],
    type: "open-source",
    platforms: ["web"],
    popularity: 81,
  },
  {
    name: "aws-serverless",
    slug: "aws-agent-skills",
    publisher: "Amazon Web Services",
    url: "https://skills.sh/aws/agent-toolkit-for-aws/aws-serverless",
    repository: "https://github.com/aws/agent-toolkit-for-aws",
    summary:
      "Official AWS Agent Skill for serverless architecture and service workflows.",
    description:
      "aws-serverless is a top skill from AWS’s agent toolkit on skills.sh for Lambda and related serverless patterns.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["skills", "aws", "cloud", "devops", "infrastructure"],
    strengths: ["Official AWS skill page", "Direct skills.sh link"],
    limits: ["AWS-specific"],
    audience: ["Cloud engineers"],
    categories: ["skills"],
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

/** Skills catalog entries must only belong to the Skills category. */
async function syncSkillsOnlyCategories(sb, toolId) {
  const skillsId = await idBySlug(sb, "categories", "skills");
  if (!skillsId) throw new Error("skills category missing");

  const { data: links, error } = await sb
    .from("tool_categories")
    .select("category_id")
    .eq("tool_id", toolId);
  if (error) throw error;

  for (const link of links ?? []) {
    if (link.category_id === skillsId) continue;
    const { error: delErr } = await sb
      .from("tool_categories")
      .delete()
      .eq("tool_id", toolId)
      .eq("category_id", link.category_id);
    if (delErr) throw delErr;
  }

  const { error: upErr } = await sb.from("tool_categories").upsert({
    tool_id: toolId,
    category_id: skillsId,
    is_primary: true,
  });
  if (upErr) throw upErr;
}

async function upsertTool(sb, tool, sourceId) {
  const { data: existing } = await sb
    .from("tools")
    .select("id")
    .eq("slug", tool.slug)
    .maybeSingle();

  const publisherId = await ensurePublisher(sb, tool.publisher);
  const logo_url = logoFor(tool.url);
  const payload = {
    name: tool.name,
    publisher_id: publisherId,
    summary: tool.summary,
    description: tool.description,
    official_url: tool.url,
    repository_url: tool.repository ?? null,
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
    last_verified_at: new Date().toISOString().slice(0, 10),
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    const { error: updErr } = await sb.from("tools").update(payload).eq("id", existing.id);
    if (updErr) throw updErr;
    await syncSkillsOnlyCategories(sb, existing.id);
    console.log(`[tool] updated ${tool.slug} → ${tool.url}`);
    return "updated";
  }

  const { data: inserted, error } = await sb
    .from("tools")
    .insert({
      ...payload,
      slug: tool.slug,
      status: "pending_review",
    })
    .select("id")
    .single();
  if (error) throw error;
  const toolId = inserted.id;

  await syncSkillsOnlyCategories(sb, toolId);

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
  let updated = 0;
  let failed = 0;
  for (const tool of TOOLS) {
    try {
      const r = await upsertTool(sb, tool, sourceId);
      if (r === "inserted") inserted += 1;
      else updated += 1;
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

  console.log(`[done] inserted=${inserted} updated=${updated} failed=${failed}`);
  console.log(`[done] skills category links=${count}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
