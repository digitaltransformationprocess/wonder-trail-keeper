import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const distIndex = join(ROOT, "dist", "index.html");
const sitemapPath = join(ROOT, "public", "sitemap.xml");

function toolSlugsFromSitemap(xml) {
  const slugs = [];
  const re = /<loc>([^<]+)<\/loc>/g;
  let match;
  while ((match = re.exec(xml)) !== null) {
    const loc = match[1];
    const toolMatch = loc.match(/\/tools\/([^/]+)\/?$/);
    if (toolMatch) slugs.push(toolMatch[1]);
  }
  return [...new Set(slugs)];
}

function main() {
  if (!existsSync(distIndex)) {
    console.warn("[prerender] dist/index.html not found — run build first.");
    return;
  }
  if (!existsSync(sitemapPath)) {
    console.warn("[prerender] public/sitemap.xml not found — run sitemap first.");
    return;
  }

  const slugs = toolSlugsFromSitemap(readFileSync(sitemapPath, "utf8"));
  if (slugs.length === 0) {
    console.log("[prerender] No tool URLs in sitemap.");
    return;
  }

  for (const slug of slugs) {
    const dir = join(ROOT, "dist", "tools", slug);
    mkdirSync(dir, { recursive: true });
    copyFileSync(distIndex, join(dir, "index.html"));
  }

  console.log(`[prerender] Copied index.html for ${slugs.length} tool routes under dist/tools/`);
}

main();
