/**
 * Ensure "MCP Servers" category + "MCP" type, seed popular MCP servers.
 * Usage: node scripts/seed_mcp.mjs
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

function githubOrgFromRepo(repoUrl) {
  const m = String(repoUrl || "").match(/github\.com\/([^/?#]+)/i);
  return m?.[1] ?? null;
}

function logoFor(tool) {
  const org = githubOrgFromRepo(tool.repository);
  if (org) return `https://github.com/${org}.png?size=128`;
  const host = domainFromUrl(tool.url);
  return host
    ? `https://www.google.com/s2/favicons?sz=128&domain=${encodeURIComponent(host)}`
    : null;
}

const CATEGORY = {
  name: "MCP Servers",
  slug: "mcp",
  description:
    "Model Context Protocol (MCP) servers — connectors that give AI agents tools for GitHub, browsers, docs, databases, search, and more.",
  sort_order: 9,
};

const SOLUTION_TYPE = {
  name: "MCP",
  slug: "mcp",
};

/** Popular / widely used MCP servers (official + high-adoption). */
const TOOLS = [
  {
    name: "Filesystem MCP",
    slug: "mcp-filesystem",
    publisher: "Anthropic / MCP",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem",
    repository: "https://github.com/modelcontextprotocol/servers",
    summary:
      "Official MCP reference server for reading and writing files in allowed local directories.",
    description:
      "Filesystem MCP is one of the Model Context Protocol reference servers. It lets agents safely list, read, write, and search files inside configured directories — a baseline tool for local coding agents (Claude Desktop, Cursor, etc.).",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["mcp", "filesystem", "files", "local", "reference server"],
    strengths: ["Official reference server", "Simple local file access", "Widely adopted"],
    limits: ["Only works inside allowlisted paths", "No cloud storage by itself"],
    audience: ["Developers", "AI coding agents"],
    popularity: 98,
  },
  {
    name: "GitHub MCP Server",
    slug: "mcp-github",
    publisher: "GitHub",
    url: "https://github.com/github/github-mcp-server",
    repository: "https://github.com/github/github-mcp-server",
    summary:
      "Official GitHub MCP server to search code, manage issues/PRs, and work with repositories from your agent.",
    description:
      "GitHub’s official MCP server connects agents to GitHub APIs: search repositories and code, read files, manage issues and pull requests, and automate repo workflows with authenticated access.",
    pricing_model: "Open source",
    price_display: "Free (needs GitHub token)",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["mcp", "github", "issues", "pull requests", "code search"],
    strengths: ["Official GitHub product", "Issues + PRs + code", "High adoption in IDEs"],
    limits: ["Requires GitHub auth / PAT", "Rate limits apply"],
    audience: ["Developers", "DevOps"],
    popularity: 97,
  },
  {
    name: "Playwright MCP",
    slug: "mcp-playwright",
    publisher: "Microsoft",
    url: "https://github.com/microsoft/playwright-mcp",
    repository: "https://github.com/microsoft/playwright-mcp",
    summary:
      "Microsoft’s Playwright MCP for browser automation — navigate, click, fill forms, and snapshot pages.",
    description:
      "Playwright MCP exposes Playwright browser automation to agents via Model Context Protocol. Useful for testing, scraping with a real browser, and UI verification from Claude, Cursor, and similar clients.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["mcp", "playwright", "browser", "automation", "testing"],
    strengths: ["Official Microsoft / Playwright", "Real browser automation", "Strong for QA"],
    limits: ["Heavier than HTTP-only scrapers", "Needs browser binaries"],
    audience: ["QA engineers", "Developers"],
    popularity: 96,
  },
  {
    name: "Context7 MCP",
    slug: "mcp-context7",
    publisher: "Upstash",
    url: "https://github.com/upstash/context7",
    repository: "https://github.com/upstash/context7",
    summary:
      "Upstash Context7 MCP pulls up-to-date library documentation into your agent’s context.",
    description:
      "Context7 is a popular MCP that fetches current docs for libraries and frameworks so agents stop relying on stale training data. Widely used in Cursor and Claude workflows for accurate API guidance.",
    pricing_model: "Freemium",
    price_display: "Free tier · paid for volume",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["mcp", "context7", "documentation", "upstash", "docs"],
    strengths: ["Fresh library docs", "Huge adoption", "Cuts hallucinated APIs"],
    limits: ["Doc coverage depends on indexed libraries", "Rate / plan limits on heavy use"],
    audience: ["Developers"],
    popularity: 95,
  },
  {
    name: "Brave Search MCP",
    slug: "mcp-brave-search",
    publisher: "Anthropic / MCP",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search",
    repository: "https://github.com/modelcontextprotocol/servers",
    summary:
      "Official MCP reference server for web search via the Brave Search API.",
    description:
      "Brave Search MCP is a reference Model Context Protocol server that lets agents run web searches through Brave Search. Common starter MCP for research and grounding answers in live results.",
    pricing_model: "Freemium",
    price_display: "Free · Brave API key",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["mcp", "brave", "search", "web search"],
    strengths: ["Official reference server", "Simple web search for agents"],
    limits: ["Needs Brave Search API key", "Search quality ≠ Google for every query"],
    audience: ["Developers", "Researchers"],
    popularity: 90,
  },
  {
    name: "Memory MCP",
    slug: "mcp-memory",
    publisher: "Anthropic / MCP",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/memory",
    repository: "https://github.com/modelcontextprotocol/servers",
    summary:
      "Official knowledge-graph memory MCP so agents can store and recall facts across sessions.",
    description:
      "Memory MCP (reference server) persists entities and relations in a local knowledge graph, giving agents longer-term memory beyond a single chat.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["mcp", "memory", "knowledge graph", "persistence"],
    strengths: ["Cross-session memory", "Official reference"],
    limits: ["Local graph only — not a hosted vector DB"],
    audience: ["Developers", "Agent builders"],
    popularity: 88,
  },
  {
    name: "Firecrawl MCP",
    slug: "mcp-firecrawl",
    publisher: "Firecrawl",
    url: "https://docs.firecrawl.dev/mcp-server",
    repository: "https://github.com/mendableai/firecrawl-mcp-server",
    summary:
      "Firecrawl’s MCP for crawling and scraping clean markdown from websites into your agent.",
    description:
      "Firecrawl MCP wraps Firecrawl’s crawl/scrape APIs so agents can turn URLs into structured markdown or LLM-ready content for research, RAG, and content pipelines.",
    pricing_model: "Freemium",
    price_display: "Free tier · paid API",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["mcp", "firecrawl", "scrape", "crawl", "web"],
    strengths: ["Clean LLM-ready scrape output", "Popular for research agents"],
    limits: ["API credits on paid usage", "JS-heavy sites may need tuning"],
    audience: ["Developers", "Content / research teams"],
    popularity: 92,
  },
  {
    name: "Supabase MCP",
    slug: "mcp-supabase",
    publisher: "Supabase",
    url: "https://supabase.com/docs/guides/getting-started/mcp",
    repository: "https://github.com/supabase-community/supabase-mcp",
    summary:
      "Official Supabase MCP to query projects, run SQL safely, and manage schema from your agent.",
    description:
      "Supabase MCP connects coding agents to your Supabase projects — inspect tables, run SQL with safeguards, and manage development workflows without leaving the chat.",
    pricing_model: "Open source",
    price_display: "Free (Supabase account)",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["mcp", "supabase", "postgres", "sql", "database"],
    strengths: ["Official Supabase", "Great for full-stack agents", "SQL + project context"],
    limits: ["Needs Supabase auth", "Production writes need careful policy"],
    audience: ["Developers", "Full-stack teams"],
    popularity: 91,
  },
  {
    name: "Notion MCP",
    slug: "mcp-notion",
    publisher: "Notion",
    url: "https://github.com/makenotion/notion-mcp-server",
    repository: "https://github.com/makenotion/notion-mcp-server",
    summary:
      "Official Notion MCP to search and update Notion workspaces from AI agents.",
    description:
      "Notion’s MCP server lets agents search pages, read content, and update Notion workspaces — useful for docs, wikis, and knowledge bases connected to Claude or Cursor.",
    pricing_model: "Open source",
    price_display: "Free (Notion workspace)",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["mcp", "notion", "docs", "wiki", "productivity"],
    strengths: ["Official Notion", "Workspace search + updates"],
    limits: ["Needs Notion integration token", "Permission model follows Notion ACL"],
    audience: ["Teams", "PMs", "Knowledge workers"],
    popularity: 89,
  },
  {
    name: "Atlassian MCP",
    slug: "mcp-atlassian",
    publisher: "Atlassian",
    url: "https://www.atlassian.com/platform/remote-mcp-server",
    repository: "https://github.com/atlassian/atlassian-mcp-server",
    summary:
      "Atlassian remote MCP for Jira and Confluence — search issues, update tickets, read docs.",
    description:
      "Atlassian’s MCP connects agents to Jira and Confluence so you can search issues, update tickets, and pull documentation context into coding or support workflows.",
    pricing_model: "Freemium",
    price_display: "Included with Atlassian cloud",
    open_source: true,
    api_available: true,
    local_available: false,
    keywords: ["mcp", "atlassian", "jira", "confluence"],
    strengths: ["Official Atlassian", "Jira + Confluence in one place"],
    limits: ["Cloud / auth setup required", "Org admin may need to enable"],
    audience: ["Engineering teams", "Support"],
    popularity: 87,
  },
  {
    name: "Cloudflare MCP",
    slug: "mcp-cloudflare",
    publisher: "Cloudflare",
    url: "https://github.com/cloudflare/mcp-server-cloudflare",
    repository: "https://github.com/cloudflare/mcp-server-cloudflare",
    summary:
      "Cloudflare MCP to manage Workers, KV, R2, and docs from your AI agent.",
    description:
      "Cloudflare’s MCP servers help agents manage Workers deployments, storage, and Cloudflare docs — bridging edge infrastructure with agent workflows.",
    pricing_model: "Open source",
    price_display: "Free (Cloudflare account)",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["mcp", "cloudflare", "workers", "edge"],
    strengths: ["Official Cloudflare", "Workers + platform ops"],
    limits: ["Scoped to Cloudflare products", "Needs API tokens"],
    audience: ["Developers", "Platform engineers"],
    popularity: 86,
  },
  {
    name: "Sentry MCP",
    slug: "mcp-sentry",
    publisher: "Sentry",
    url: "https://docs.sentry.io/product/sentry-mcp/",
    repository: "https://github.com/getsentry/sentry-mcp",
    summary:
      "Sentry MCP so agents can investigate production errors and issues in context.",
    description:
      "Sentry’s MCP lets coding agents pull stack traces, issue details, and production error context into the IDE or chat to speed up debugging.",
    pricing_model: "Freemium",
    price_display: "Free with Sentry plan",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["mcp", "sentry", "errors", "observability", "debugging"],
    strengths: ["Official Sentry", "Great for debugging agents"],
    limits: ["Needs Sentry org access", "Sensitive error data — mind permissions"],
    audience: ["Developers", "SRE"],
    popularity: 85,
  },
  {
    name: "Stripe MCP",
    slug: "mcp-stripe",
    publisher: "Stripe",
    url: "https://docs.stripe.com/mcp",
    repository: "https://github.com/stripe/agent-toolkit",
    summary:
      "Stripe Agent Toolkit / MCP for payments — create products, payment links, and manage Stripe objects.",
    description:
      "Stripe’s agent toolkit exposes MCP tools for payment workflows: products, prices, customers, and payment links so agents can help build and operate Stripe integrations.",
    pricing_model: "Open source",
    price_display: "Free (Stripe account)",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["mcp", "stripe", "payments", "billing"],
    strengths: ["Official Stripe", "Payments tooling for agents"],
    limits: ["Live mode is dangerous — use test keys", "Needs Stripe API key"],
    audience: ["Developers", "Fintech"],
    popularity: 84,
  },
  {
    name: "Exa MCP",
    slug: "mcp-exa",
    publisher: "Exa",
    url: "https://github.com/exa-labs/exa-mcp-server",
    repository: "https://github.com/exa-labs/exa-mcp-server",
    summary:
      "Exa MCP for neural / real-time web search and research from AI agents.",
    description:
      "Exa MCP wraps Exa’s search API so agents can run high-quality web and research searches with content suited for LLM consumption.",
    pricing_model: "Freemium",
    price_display: "API credits",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["mcp", "exa", "search", "research"],
    strengths: ["Strong research search", "LLM-oriented results"],
    limits: ["Paid API for volume", "Needs Exa API key"],
    audience: ["Researchers", "Developers"],
    popularity: 83,
  },
  {
    name: "Figma MCP",
    slug: "mcp-figma",
    publisher: "Figma",
    url: "https://www.figma.com/mcp-catalog/",
    repository: "https://github.com/figma/mcp-server-guide",
    summary:
      "Figma MCP to bring design context (frames, components, variables) into coding agents.",
    description:
      "Figma’s MCP integrations let agents read design files and structure so UI implementation stays closer to the source of truth in Figma.",
    pricing_model: "Freemium",
    price_display: "With Figma access",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["mcp", "figma", "design", "ui"],
    strengths: ["Design-to-code context", "Official Figma direction"],
    limits: ["Needs Figma permissions", "Still evolving MCP surface"],
    audience: ["Design engineers", "Frontend developers"],
    popularity: 82,
  },
  {
    name: "Browser Use MCP",
    slug: "mcp-browser-use",
    publisher: "browser-use",
    url: "https://github.com/browser-use/browser-use",
    repository: "https://github.com/browser-use/browser-use",
    summary:
      "Browser Use MCP / toolkit for AI-driven browser control and web agents.",
    description:
      "Browser Use is a popular open-source browser agent stack with MCP support so models can navigate the web, fill forms, and automate multi-step browser tasks.",
    pricing_model: "Open source",
    price_display: "Free · cloud options",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["mcp", "browser-use", "browser agent", "automation"],
    strengths: ["High adoption", "Full browser agent workflows"],
    limits: ["Heavier runtime", "Cloud features may be paid"],
    audience: ["Agent builders", "Automation engineers"],
    popularity: 94,
  },
  {
    name: "Chrome DevTools MCP",
    slug: "mcp-chrome-devtools",
    publisher: "Chrome DevTools",
    url: "https://github.com/ChromeDevTools/chrome-devtools-mcp",
    repository: "https://github.com/ChromeDevTools/chrome-devtools-mcp",
    summary:
      "Chrome DevTools MCP for debugging pages, performance, and network from an agent.",
    description:
      "Chrome DevTools MCP connects agents to DevTools protocol capabilities — inspect pages, debug issues, and gather performance/network signals during development.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["mcp", "chrome", "devtools", "debugging"],
    strengths: ["Official Chrome DevTools angle", "Deep page debugging"],
    limits: ["Chrome / DevTools environment required"],
    audience: ["Frontend developers"],
    popularity: 88,
  },
  {
    name: "Prisma MCP",
    slug: "mcp-prisma",
    publisher: "Prisma",
    url: "https://www.prisma.io/docs/postgres/integrations/mcp-server",
    repository: "https://github.com/prisma/mcp",
    summary:
      "Prisma MCP to explore schemas and work with Prisma Postgres from AI agents.",
    description:
      "Prisma’s MCP server helps agents understand your data model and interact with Prisma Postgres / schema workflows during app development.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["mcp", "prisma", "orm", "postgres", "schema"],
    strengths: ["Official Prisma", "Schema-aware agent help"],
    limits: ["Tied to Prisma stack"],
    audience: ["Developers"],
    popularity: 81,
  },
  {
    name: "AWS MCP Servers",
    slug: "mcp-aws",
    publisher: "Amazon Web Services",
    url: "https://github.com/awslabs/mcp",
    repository: "https://github.com/awslabs/mcp",
    summary:
      "AWS Labs collection of MCP servers for docs, cloud guidance, and AWS workflows.",
    description:
      "awslabs/mcp hosts multiple AWS-oriented MCP servers (documentation, best practices, service helpers) so agents can work with AWS more accurately.",
    pricing_model: "Open source",
    price_display: "Free (AWS account for APIs)",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["mcp", "aws", "cloud", "documentation"],
    strengths: ["Official AWS Labs", "Multiple specialized servers"],
    limits: ["IAM / credentials required for live APIs", "Large surface to configure"],
    audience: ["Cloud engineers", "Developers"],
    popularity: 86,
  },
  {
    name: "Sequential Thinking MCP",
    slug: "mcp-sequential-thinking",
    publisher: "Anthropic / MCP",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking",
    repository: "https://github.com/modelcontextprotocol/servers",
    summary:
      "Official MCP that structures multi-step reasoning for harder agent tasks.",
    description:
      "Sequential Thinking is a reference MCP server that helps agents break problems into ordered thought steps — useful for planning and complex tool-using workflows.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["mcp", "sequential thinking", "reasoning", "planning"],
    strengths: ["Official reference", "Improves multi-step planning"],
    limits: ["Meta-tool — not an external data source"],
    audience: ["Agent builders"],
    popularity: 80,
  },
  {
    name: "Fetch MCP",
    slug: "mcp-fetch",
    publisher: "Anthropic / MCP",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/fetch",
    repository: "https://github.com/modelcontextprotocol/servers",
    summary:
      "Official MCP to fetch and convert web pages to readable text/markdown for agents.",
    description:
      "Fetch MCP is a reference server that retrieves URL content and converts HTML to markdown/text so agents can read web pages without a full browser stack.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["mcp", "fetch", "http", "markdown", "web"],
    strengths: ["Lightweight URL reading", "Official reference"],
    limits: ["Weaker on heavy JS apps vs Playwright"],
    audience: ["Developers"],
    popularity: 85,
  },
  {
    name: "n8n MCP",
    slug: "mcp-n8n",
    publisher: "n8n community",
    url: "https://github.com/czlonkowski/n8n-mcp",
    repository: "https://github.com/czlonkowski/n8n-mcp",
    summary:
      "Popular community MCP to explore and drive n8n workflows from AI agents.",
    description:
      "n8n-mcp connects agents to n8n automation — discover nodes, inspect workflows, and help build/run automation with MCP tool calls.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["mcp", "n8n", "automation", "workflows"],
    strengths: ["Strong community adoption", "Automation + agents bridge"],
    limits: ["Community-maintained", "Needs reachable n8n instance"],
    audience: ["Automation builders", "Ops"],
    popularity: 84,
  },
  {
    name: "BlenderMCP",
    slug: "mcp-blender",
    publisher: "ahujasid",
    url: "https://github.com/ahujasid/blender-mcp",
    repository: "https://github.com/ahujasid/blender-mcp",
    summary:
      "Popular MCP that lets agents control Blender for 3D modeling and scene edits.",
    description:
      "BlenderMCP bridges Claude/agents to Blender so you can create and modify 3D scenes via natural language and MCP tools — one of the most starred creative MCP projects.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["mcp", "blender", "3d", "creative"],
    strengths: ["Viral creative MCP", "Direct Blender control"],
    limits: ["Needs Blender running locally", "3D learning curve"],
    audience: ["3D artists", "Creative technologists"],
    popularity: 90,
  },
  {
    name: "MarkItDown MCP",
    slug: "mcp-markitdown",
    publisher: "Microsoft",
    url: "https://github.com/microsoft/markitdown",
    repository: "https://github.com/microsoft/markitdown",
    summary:
      "Microsoft MarkItDown converts PDFs, Office files, and more to Markdown — with MCP support.",
    description:
      "MarkItDown is Microsoft’s tool for converting documents (PDF, PPTX, DOCX, images, etc.) into Markdown for LLMs, with MCP integration for agent pipelines.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["mcp", "markitdown", "pdf", "markdown", "documents"],
    strengths: ["Microsoft-backed", "Many file formats → Markdown"],
    limits: ["Conversion quality varies by format"],
    audience: ["Developers", "Knowledge workers"],
    popularity: 93,
  },
  {
    name: "Google Drive MCP",
    slug: "mcp-google-drive",
    publisher: "Anthropic / MCP",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/gdrive",
    repository: "https://github.com/modelcontextprotocol/servers",
    summary:
      "Official MCP reference server to search and read files from Google Drive.",
    description:
      "Google Drive MCP is a Model Context Protocol reference server for searching Drive and reading file contents into agent context with OAuth.",
    pricing_model: "Open source",
    price_display: "Free (Google OAuth)",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["mcp", "google drive", "gdrive", "files"],
    strengths: ["Official reference", "Drive search for agents"],
    limits: ["OAuth setup required", "Respects Drive permissions"],
    audience: ["Teams", "Knowledge workers"],
    popularity: 91,
  },
  {
    name: "Grafana MCP",
    slug: "mcp-grafana",
    publisher: "Grafana Labs",
    url: "https://github.com/grafana/mcp-grafana",
    repository: "https://github.com/grafana/mcp-grafana",
    summary:
      "Grafana MCP to query dashboards, panels, and observability data from agents.",
    description:
      "Grafana’s MCP server lets agents search dashboards and query observability data — useful for incident response and metrics investigation in chat.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["mcp", "grafana", "observability", "dashboards"],
    strengths: ["Official Grafana", "Incident / metrics workflows"],
    limits: ["Needs Grafana access token", "Sensitive ops data"],
    audience: ["SRE", "Platform engineers"],
    popularity: 80,
  },
];

async function idBySlug(sb, table, slug) {
  const { data, error } = await sb
    .from(table)
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

async function idByKey(sb, table, key) {
  const { data, error } = await sb
    .from(table)
    .select("id")
    .eq("key", key)
    .maybeSingle();
  if (error) throw error;
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

async function ensureSolutionType(sb) {
  const existing = await idBySlug(sb, "solution_types", SOLUTION_TYPE.slug);
  if (existing) {
    await sb
      .from("solution_types")
      .update({ name: SOLUTION_TYPE.name })
      .eq("id", existing);
    console.log(`[type] updated ${SOLUTION_TYPE.slug}`);
    return existing;
  }
  const { data, error } = await sb
    .from("solution_types")
    .insert({ name: SOLUTION_TYPE.name, slug: SOLUTION_TYPE.slug })
    .select("id")
    .single();
  if (error) throw error;
  console.log(`[type] inserted ${SOLUTION_TYPE.slug}`);
  return data.id;
}

async function ensurePublisher(sb, name) {
  const { data: existing } = await sb
    .from("publishers")
    .select("id")
    .eq("name", name)
    .maybeSingle();
  if (existing) return existing.id;
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
  if (existing) return existing.id;
  const { data, error } = await sb
    .from("sources")
    .insert({
      url,
      publisher: domainFromUrl(url) || "GitHub",
      source_type: "official",
      reliability_level: "A",
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

/** MCP catalog entries belong primarily to the MCP category. */
async function syncMcpCategory(sb, toolId, mcpCategoryId) {
  const { data: links, error } = await sb
    .from("tool_categories")
    .select("category_id")
    .eq("tool_id", toolId);
  if (error) throw error;

  for (const link of links ?? []) {
    if (link.category_id === mcpCategoryId) continue;
    await sb
      .from("tool_categories")
      .delete()
      .eq("tool_id", toolId)
      .eq("category_id", link.category_id);
  }

  const { error: upErr } = await sb.from("tool_categories").upsert({
    tool_id: toolId,
    category_id: mcpCategoryId,
    is_primary: true,
  });
  if (upErr) throw upErr;
}

async function upsertTool(sb, tool, mcpCategoryId, mcpTypeId) {
  const { data: existing } = await sb
    .from("tools")
    .select("id")
    .eq("slug", tool.slug)
    .maybeSingle();

  const publisherId = await ensurePublisher(sb, tool.publisher);
  const sourceId = await ensureSource(sb, tool.url);
  const logo_url = logoFor(tool);
  const payload = {
    name: tool.name,
    publisher_id: publisherId,
    summary: tool.summary,
    description: tool.description,
    official_url: tool.url,
    repository_url: tool.repository,
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

  let toolId = existing?.id ?? null;
  if (toolId) {
    const { error: updErr } = await sb.from("tools").update(payload).eq("id", toolId);
    if (updErr) throw updErr;
    console.log(`[tool] updated ${tool.slug}`);
  } else {
    const { data: inserted, error } = await sb
      .from("tools")
      .insert({ ...payload, slug: tool.slug, status: "pending_review" })
      .select("id")
      .single();
    if (error) throw error;
    toolId = inserted.id;
    console.log(`[tool] inserted ${tool.slug}`);
  }

  await syncMcpCategory(sb, toolId, mcpCategoryId);

  await sb.from("tool_types").upsert({
    tool_id: toolId,
    solution_type_id: mcpTypeId,
    is_primary: true,
  });

  for (const key of ["web", "self-hosted"]) {
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

  return toolId;
}

async function bumpRanks(sb) {
  const refreshed = await sb.rpc("refresh_tool_internal_ranks");
  if (refreshed.error) {
    console.warn("[rank] refresh:", refreshed.error.message);
  }

  for (const tool of TOOLS) {
    const { data: t } = await sb
      .from("tools")
      .select("id")
      .eq("slug", tool.slug)
      .maybeSingle();
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
  console.log("[rank] curated MCP popularity applied");
}

async function shiftCategoryOrders(sb) {
  // Keep Skills at 8, MCP at 9, push the rest down.
  const shifts = [
    ["research-education", 10],
    ["business-marketing", 11],
    ["data-analytics", 12],
    ["automation-agents", 13],
    ["design-creativity", 14],
    ["finance", 15],
    ["legal", 16],
    ["healthcare", 17],
    ["robotics-hardware", 18],
  ];
  for (const [slug, order] of shifts) {
    await sb.from("categories").update({ sort_order: order }).eq("slug", slug);
  }
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

  const mcpCategoryId = await ensureCategory(sb);
  const mcpTypeId = await ensureSolutionType(sb);
  await shiftCategoryOrders(sb);

  let inserted = 0;
  let updated = 0;
  let failed = 0;
  for (const tool of TOOLS) {
    try {
      const { data: before } = await sb
        .from("tools")
        .select("id")
        .eq("slug", tool.slug)
        .maybeSingle();
      await upsertTool(sb, tool, mcpCategoryId, mcpTypeId);
      if (before) updated += 1;
      else inserted += 1;
    } catch (err) {
      failed += 1;
      console.error(`[fail] ${tool.slug}:`, err.message || err);
    }
  }

  await bumpRanks(sb);

  const { count } = await sb
    .from("tool_categories")
    .select("*", { count: "exact", head: true })
    .eq("category_id", mcpCategoryId);

  console.log(`[done] inserted=${inserted} updated=${updated} failed=${failed}`);
  console.log(`[done] mcp category links=${count}`);
  console.log(`[done] browse /categories/mcp · filter type MCP`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
