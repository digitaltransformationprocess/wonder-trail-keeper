/**
 * After `vite build`, write per-route HTML under dist/ with correct SEO tags.
 * Without this, every SPA route serves the homepage canonical → GSC
 * "Alternate page with proper canonical tag" and tools never get indexed.
 */
import { createClient } from "@supabase/supabase-js";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const distIndex = join(ROOT, "dist", "index.html");
const sitemapPath = join(ROOT, "public", "sitemap.xml");

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

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pathsFromSitemap(xml) {
  const paths = [];
  const re = /<loc>([^<]+)<\/loc>/g;
  let match;
  while ((match = re.exec(xml)) !== null) {
    try {
      const u = new URL(match[1]);
      let path = u.pathname || "/";
      if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
      paths.push(path || "/");
    } catch {
      /* skip */
    }
  }
  return [...new Set(paths)];
}

function siteBase(env) {
  return (env.VITE_SITE_URL || "https://aidiscov.com").replace(/\/$/, "");
}

function defaultMeta(path, base) {
  const url = path === "/" ? `${base}/` : `${base}${path}`;
  const map = {
    "/": {
      title: "AI Discov — Find the right AI solution for your needs",
      description:
        "Describe what you want to accomplish and find verified AI solutions with clear explanations and comparisons.",
    },
    "/explore": {
      title: "Explore — AI solution catalog | AI Discov",
      description:
        "Browse AI tools, models, APIs, and agents by category, pricing, and platform.",
    },
    "/latest": {
      title: "Latest — New AI tools, releases & versions | AI Discov",
      description:
        "Updates on new AI tools, model releases, version upgrades, pricing, and product launches.",
    },
    "/news": {
      title:
        "AI News — model launches, agents, tools & industry briefings | AI Discov",
      description:
        "AI Discov News: concise briefings on AI model releases, agents, developer tools, infrastructure, safety, and policy.",
    },
    "/compare": {
      title: "Compare AI tools | AI Discov",
      description: "Compare up to 5 AI tools side by side on pricing, API, and limits.",
    },
    "/legal": {
      title: "Legal | AI Discov",
      description: "Terms, privacy, cookies, and policies for AI Discov.",
    },
  };

  if (map[path]) {
    return { ...map[path], url, ogType: "website" };
  }

  if (path.startsWith("/tools/")) {
    const slug = path.slice("/tools/".length);
    const name = slug
      .split("-")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return {
      title: `${name} — overview, pricing, and alternatives | AI Discov`,
      description: `Overview of ${name}: pricing, features, platforms, and alternatives on AI Discov.`,
      url,
      ogType: "website",
    };
  }

  if (path.startsWith("/categories/")) {
    const slug = path.slice("/categories/".length);
    const name = slug
      .split("-")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return {
      title: `${name} AI tools | AI Discov`,
      description: `Browse ${name} AI tools and solutions on AI Discov.`,
      url,
      ogType: "website",
    };
  }

  if (path.startsWith("/latest/")) {
    return {
      title: "AI update | AI Discov",
      description: "Product update from the AI Discov Latest feed.",
      url,
      ogType: "article",
    };
  }

  if (path.startsWith("/legal/")) {
    const slug = path.slice("/legal/".length);
    const name = slug
      .split("-")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return {
      title: `${name} | AI Discov`,
      description: `${name} for AI Discov.`,
      url,
      ogType: "website",
    };
  }

  return {
    title: "AI Discov",
    description: "Find the right AI solution for your needs.",
    url,
    ogType: "website",
  };
}

async function loadToolMeta(env) {
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return new Map();

  const supabase = createClient(url, key);
  const map = new Map();
  const pageSize = 1000;
  let from = 0;
  for (;;) {
    const { data, error } = await supabase
      .from("tools")
      .select("slug, name, summary, description")
      .eq("status", "published")
      .range(from, from + pageSize - 1);
    if (error) {
      console.warn("[prerender] tool meta:", error.message);
      break;
    }
    const rows = data ?? [];
    for (const row of rows) {
      if (!row.slug) continue;
      map.set(row.slug, {
        name: row.name,
        summary: row.summary || row.description || "",
      });
    }
    if (rows.length < pageSize) break;
    from += pageSize;
  }
  return map;
}

function escapeRegExp(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function upsertMeta(html, attrs, content) {
  const attr = Object.entries(attrs)
    .map(([k, v]) => `${k}="${escapeHtml(v)}"`)
    .join(" ");
  const [[k0, v0]] = Object.entries(attrs);
  const simple = new RegExp(
    `<meta\\s+[^>]*${escapeRegExp(k0)}=["']${escapeRegExp(v0)}["'][^>]*>`,
    "i",
  );
  const tag = `<meta ${attr} content="${escapeHtml(content)}" />`;
  if (simple.test(html)) return html.replace(simple, tag);
  return html.replace(/<\/head>/i, `    ${tag}\n  </head>`);
}

function upsertLink(html, rel, href, hreflang) {
  let pattern;
  if (hreflang) {
    pattern = new RegExp(
      `<link\\s+[^>]*(?:rel=["']${escapeRegExp(rel)}["'][^>]*hreflang=["']${escapeRegExp(hreflang)}["']|hreflang=["']${escapeRegExp(hreflang)}["'][^>]*rel=["']${escapeRegExp(rel)}["'])[^>]*>`,
      "i",
    );
  } else {
    pattern = new RegExp(
      `<link\\s+[^>]*rel=["']${escapeRegExp(rel)}["'](?![^>]*hreflang=)[^>]*>`,
      "i",
    );
  }
  const tag = hreflang
    ? `<link rel="${rel}" hreflang="${escapeHtml(hreflang)}" href="${escapeHtml(href)}" />`
    : `<link rel="${rel}" href="${escapeHtml(href)}" />`;
  if (pattern.test(html)) return html.replace(pattern, tag);
  return html.replace(/<\/head>/i, `    ${tag}\n  </head>`);
}

function applySeo(html, meta, image) {
  let out = html;
  out = out.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);

  out = upsertMeta(out, { name: "description" }, meta.description);
  out = upsertMeta(out, { name: "robots" }, "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
  out = upsertMeta(out, { property: "og:title" }, meta.title);
  out = upsertMeta(out, { property: "og:description" }, meta.description);
  out = upsertMeta(out, { property: "og:type" }, meta.ogType || "website");
  out = upsertMeta(out, { property: "og:url" }, meta.url);
  out = upsertMeta(out, { property: "og:image" }, image);
  out = upsertMeta(out, { name: "twitter:card" }, "summary_large_image");
  out = upsertMeta(out, { name: "twitter:title" }, meta.title);
  out = upsertMeta(out, { name: "twitter:description" }, meta.description);
  out = upsertMeta(out, { name: "twitter:image" }, image);

  out = upsertLink(out, "canonical", meta.url);
  out = upsertLink(out, "alternate", meta.url, "en");
  out = upsertLink(out, "alternate", meta.url, "x-default");

  return out;
}

function distFileForPath(path) {
  if (path === "/") return join(ROOT, "dist", "index.html");
  const parts = path.replace(/^\//, "").split("/");
  return join(ROOT, "dist", ...parts, "index.html");
}

async function main() {
  if (!existsSync(distIndex)) {
    console.warn("[prerender] dist/index.html not found — run build first.");
    return;
  }
  if (!existsSync(sitemapPath)) {
    console.warn("[prerender] public/sitemap.xml not found — run sitemap first.");
    return;
  }

  const env = {
    ...loadEnvFile(join(ROOT, ".env.production")),
    ...loadEnvFile(join(ROOT, ".env")),
    ...process.env,
  };
  const base = siteBase(env);
  const image = `${base}/brand/aidiscov-mark-dark.png`;
  const template = readFileSync(distIndex, "utf8");
  const paths = pathsFromSitemap(readFileSync(sitemapPath, "utf8"));
  if (!paths.includes("/")) paths.unshift("/");

  const toolMeta = await loadToolMeta(env);
  let written = 0;

  for (const path of paths) {
    let meta = defaultMeta(path, base);
    if (path.startsWith("/tools/")) {
      const slug = path.slice("/tools/".length);
      const row = toolMeta.get(slug);
      if (row?.name) {
        meta = {
          title: `${row.name} — overview, pricing, and alternatives | AI Discov`,
          description: (row.summary || meta.description).slice(0, 300),
          url: meta.url,
          ogType: "website",
        };
      }
    }

    const html = applySeo(template, meta, image);
    const outFile = distFileForPath(path);
    mkdirSync(dirname(outFile), { recursive: true });
    writeFileSync(outFile, html, "utf8");
    written += 1;
  }

  console.log(`[prerender] Wrote SEO HTML for ${written} routes under dist/`);
}

main().catch((err) => {
  console.error("[prerender]", err);
  process.exitCode = 1;
});
