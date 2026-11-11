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

async function main() {
  const env = loadEnvFile(join(ROOT, ".env"));
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
  const [slugs, categorySlugs] = await Promise.all([
    fetchPublishedSlugs(supabase),
    fetchCategorySlugs(supabase),
  ]);
  const staticPaths = ["/", "/explore", "/latest", "/compare", "/library"];
  const paths = [
    ...staticPaths,
    ...slugs.map((slug) => `/tools/${slug}`),
    ...categorySlugs.map((slug) => `/categories/${slug}`),
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

  const robots = `User-agent: *
Allow: /
Disallow: /admin

${sitemapLine}
`;

  writeFileSync(join(ROOT, "public", "robots.txt"), robots, "utf8");
  console.log("[sitemap] Updated public/robots.txt");
}

main().catch((err) => {
  console.error("[sitemap]", err);
  process.exit(1);
});
