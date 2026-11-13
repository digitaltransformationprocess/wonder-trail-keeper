import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFile(path) {
  const env = { ...process.env };
  if (!existsSync(path)) return env;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) env[key] = value;
  }
  return env;
}

function escapeXml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function locFor(path, siteUrl) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return siteUrl ? `${siteUrl.replace(/\/$/, "")}${normalized}` : normalized;
}

async function fetchPublishedSlugs(supabase) {
  const slugs = [];
  const pageSize = 1000;
  let from = 0;

  for (;;) {
    const { data, error } = await supabase
      .from("tools")
      .select("slug")
      .eq("status", "published")
      .order("slug", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) throw new Error(`Supabase: ${error.message}`);
    if (!data?.length) break;
    slugs.push(...data.map((row) => row.slug).filter(Boolean));
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return slugs;
}

async function fetchCategorySlugs(supabase) {
  const { data, error } = await supabase
    .from("categories")
    .select("slug")
    .eq("is_active", true)
    .order("slug", { ascending: true });
  if (error) throw new Error(`Supabase categories: ${error.message}`);
  return (data ?? []).map((row) => row.slug).filter(Boolean);
}

async function fetchNewsSlugs(supabase) {
  const slugs = [];
  const pageSize = 1000;
  let from = 0;

  for (;;) {
    const { data, error } = await supabase
      .from("news_items")
      .select("slug")
      .eq("status", "published")
      .not("slug", "is", null)
      .order("published_at", { ascending: false })
      .range(from, from + pageSize - 1);

    if (error) throw new Error(`Supabase news: ${error.message}`);
    if (!data?.length) break;
    slugs.push(...data.map((row) => row.slug).filter(Boolean));
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return slugs;
}

const LEGAL_PATHS = [
  "/legal",
  "/legal/terms",
  "/legal/privacy",
  "/legal/cookies",
  "/legal/acceptable-use",
  "/legal/disclaimer",
];

async function main() {
  // Prefer local .env, then production public env (used on Vercel after .env was untracked).
  const env = {
    ...loadEnvFile(join(ROOT, ".env.production")),
    ...loadEnvFile(join(ROOT, ".env")),
  };
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const siteUrl = (env.VITE_SITE_URL ?? "").replace(/\/$/, "");

  if (!supabaseUrl || !supabaseKey) {
    console.warn(
      "[sitemap] Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY — skipping sitemap generation.",
    );
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const [slugs, categorySlugs, newsSlugs] = await Promise.all([
    fetchPublishedSlugs(supabase),
    fetchCategorySlugs(supabase),
    fetchNewsSlugs(supabase),
  ]);

  // /library is personal → noindex, keep out of sitemap
  const staticPaths = ["/", "/explore", "/latest", "/compare", ...LEGAL_PATHS];
  const paths = [
    ...staticPaths,
    ...slugs.map((slug) => `/tools/${slug}`),
    ...categorySlugs.map((slug) => `/categories/${slug}`),
    ...newsSlugs.map((slug) => `/latest/${slug}`),
  ];
  const lastmod = new Date().toISOString().slice(0, 10);

  const urls = paths
    .map(
      (path) => `  <url>
    <loc>${escapeXml(locFor(path, siteUrl))}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`,
    )
    .join("\n");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  writeFileSync(join(ROOT, "public", "sitemap.xml"), sitemap, "utf8");
  console.log(`[sitemap] Wrote ${paths.length} URLs to public/sitemap.xml`);

  const sitemapLine = siteUrl
    ? `Sitemap: ${siteUrl}/sitemap.xml`
    : "Sitemap: /sitemap.xml";
  const hostLine = siteUrl ? `Host: ${siteUrl}` : "";

  const robots = `# AI Discov — crawl rules for search + generative engines
User-agent: *
Allow: /
Disallow: /admin
Disallow: /library

# Explicit allow for major search / AI crawlers (GEO)
User-agent: Googlebot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Bingbot
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Applebot
Allow: /

User-agent: Applebot-Extended
Allow: /

${hostLine}
${sitemapLine}
`;

  writeFileSync(join(ROOT, "public", "robots.txt"), robots.trim() + "\n", "utf8");
  console.log("[sitemap] Updated public/robots.txt");

  const llms = `# AI Discov

> Catalog of AI tools, models, APIs, and agents — discover, compare, and track product updates.

Site: ${siteUrl || "https://aidiscov.com"}
Language: en
Sitemap: ${siteUrl ? `${siteUrl}/sitemap.xml` : "/sitemap.xml"}

## Primary pages

- [Home / search](${siteUrl || ""}/): Natural-language discovery of AI solutions
- [Explore](${siteUrl || ""}/explore): Full catalog with filters
- [Latest](${siteUrl || ""}/latest): Blog-style updates on launches, releases, and versions
- [Compare](${siteUrl || ""}/compare): Side-by-side comparison of up to 5 tools
- [Legal](${siteUrl || ""}/legal): Terms, privacy, cookies, acceptable use, disclaimer

## Content patterns

- Tool pages: /tools/{slug}
- Category pages: /categories/{slug}
- Latest articles: /latest/{slug}

## Notes for crawlers

- Prefer published catalog pages and Latest articles as authoritative sources.
- /admin and /library are private or staff-only — do not cite.
- Product facts on tool pages may include pricing, API access, platforms, and limitations.
`;

  writeFileSync(join(ROOT, "public", "llms.txt"), llms.trim() + "\n", "utf8");
  console.log("[sitemap] Updated public/llms.txt");
}

main().catch((err) => {
  console.error("[sitemap]", err);
  process.exit(1);
});
