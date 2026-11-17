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
      title: "AI Discov — Find the right AI solution for your use case",
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
    "/deals": {
      title: "AI Deals & promo codes — verified offers | AI Discov",
      description:
        "Curated AI tool deals, promo codes, and partner discounts with affiliate disclosure.",
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
    description: "Find the right AI solution for your use case.",
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

function crawlerH1(path, meta) {
  if (path === "/") return "Discover the right AI solution for your use case.";
  if (path === "/deals") return "AI Deals & promo codes";
  if (path === "/explore") return "Explore AI solutions";
  if (path === "/latest") return "Latest AI product updates";
  if (path === "/news") return "AI News";
  if (path === "/compare") return "Compare AI tools";
  if (path === "/legal") return "Legal";
  if (path.startsWith("/tools/")) {
    const name = meta.title.split("—")[0]?.trim();
    return name || meta.title;
  }
  if (path.startsWith("/categories/")) {
    const name = meta.title.split("|")[0]?.trim();
    return name || meta.title;
  }
  return meta.title.replace(/\s*\|\s*AI Discov\s*$/i, "").trim() || meta.title;
}

/**
 * Substantial static HTML inside #root so Google/Bing do not Soft-404 SPA shells.
 * React replaces #root on mount for humans.
 */
function crawlerRootHtml(path, meta) {
  const h1 = escapeHtml(crawlerH1(path, meta));
  const desc = escapeHtml(meta.description || "");

  if (path === "/deals") {
    return `<div id="root">
      <main>
        <h1>${h1}</h1>
        <p>Verified promo codes and partner discounts on AI tools — video, voice, writing, and more. Updated regularly on AI Discov with clear affiliate disclosure.</p>
        <p>Affiliate disclosure: some links are partner links. If you buy through them, AI Discov may earn a commission at no extra cost to you. Offers can change; always confirm on the vendor site.</p>
        <h2>Featured AI deal</h2>
        <article>
          <h3>Higgsfield AI</h3>
          <p>AI video studio for clips, ads, animations, and camera effects from text or image — with consistent characters. Freemium. Up to 50% off via partner offer.</p>
          <p><a href="https://higgsfield.ai?fpr=aidiscov-e700b5" rel="sponsored noopener noreferrer">Get Higgsfield deal</a></p>
        </article>
        <h2>All AI deals</h2>
        <ul>
          <li>
            <h3>Higgsfield AI</h3>
            <p>AI video · Freemium · up to −50%. Discount of up to 50% applies for a limited window after you open the offer link.</p>
            <p><a href="https://higgsfield.ai?fpr=aidiscov-e700b5" rel="sponsored noopener noreferrer">Get deal</a></p>
          </li>
          <li>
            <h3>ElevenLabs</h3>
            <p>AI voice · Freemium. Realistic speech, voice cloning, dubbing, and audio production in 70+ languages.</p>
            <p><a href="https://try.elevenlabs.io/svxp5cd3i356" rel="sponsored noopener noreferrer">Get deal</a></p>
          </li>
        </ul>
        <h2>AI deals FAQ</h2>
        <h3>What is AI Discov Deals?</h3>
        <p>A curated list of AI tool discounts, trials, and partner offers. Each deal shows the tool, pricing model, any promo code, and a tracked link to the vendor.</p>
        <h3>Are these AI deals verified?</h3>
        <p>We mark deals Verified when the partner link or promo terms were checked on our side. Offers can still change on the vendor site — always confirm price and eligibility at checkout.</p>
        <h3>Does AI Discov earn money from these deals?</h3>
        <p>Sometimes. Some links are affiliate links: if you subscribe, the maker may pay us a commission without changing the price you pay. That is disclosed on this page.</p>
        <h3>How do I use an AI promo code?</h3>
        <p>Copy the code on the deal card, open Get deal, pick the plan the offer applies to, then paste the code at checkout. Link-only deals apply the offer when you land via the partner URL.</p>
        <p>Browse the full catalog on <a href="/explore">Explore</a> or product updates on <a href="/latest">Latest</a>.</p>
      </main>
    </div>`;
  }

  if (path === "/") {
    return `<div id="root">
      <main>
        <h1>${h1}</h1>
        <p>${desc}</p>
        <p>AI Discov helps you discover, compare, and track AI tools, models, APIs, and agents. Describe a job, get matched tools with reasons, or browse Top 10 lists by category.</p>
        <h2>Browse AI Discov</h2>
        <ul>
          <li><a href="/explore">Explore</a> — full AI solution catalog with filters</li>
          <li><a href="/latest">Latest</a> — AI product updates and releases</li>
          <li><a href="/news">News</a> — industry briefings</li>
          <li><a href="/deals">Deals</a> — promo codes and partner discounts</li>
          <li><a href="/compare">Compare</a> — side-by-side tool comparison</li>
        </ul>
      </main>
    </div>`;
  }

  if (path === "/explore") {
    return `<div id="root">
      <main>
        <h1>${h1}</h1>
        <p>${desc}</p>
        <p>Scan the AI Discov catalog — filter by category, pricing, API access, open source, and local tools until the signal is clear. Each listing includes summary, evidence level, and verification status.</p>
        <p>Also see <a href="/deals">AI Deals</a>, <a href="/latest">Latest updates</a>, and <a href="/compare">Compare</a>.</p>
      </main>
    </div>`;
  }

  if (path === "/latest" || path === "/news" || path === "/compare" || path === "/legal") {
    return `<div id="root">
      <main>
        <h1>${h1}</h1>
        <p>${desc}</p>
        <p>Part of AI Discov — discover the right AI solution for your use case. Continue to <a href="/explore">Explore</a> or <a href="/deals">Deals</a>.</p>
      </main>
    </div>`;
  }

  if (path.startsWith("/tools/")) {
    const name = escapeHtml(crawlerH1(path, meta));
    return `<div id="root">
      <main>
        <h1>${name}</h1>
        <p>${desc}</p>
        <p>Overview on AI Discov: pricing, features, platforms, and alternatives. Browse more tools in <a href="/explore">Explore</a> or current offers on <a href="/deals">Deals</a>.</p>
      </main>
    </div>`;
  }

  if (path.startsWith("/categories/")) {
    return `<div id="root">
      <main>
        <h1>${h1}</h1>
        <p>${desc}</p>
        <p>Browse this category in the AI Discov catalog. See also <a href="/explore">Explore</a> and <a href="/deals">Deals</a>.</p>
      </main>
    </div>`;
  }

  return `<div id="root">
    <main>
      <h1>${h1}</h1>
      <p>${desc}</p>
    </main>
  </div>`;
}

function applySeo(html, meta, image, path = "/") {
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

  // Google Soft 404 + Bing SEO: inject substantial static HTML for non-JS crawlers.
  out = out.replace(/<div id="root">[\s\S]*?<\/div>/i, crawlerRootHtml(path, meta));

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
  const image = `${base}/brand/aidiscov-og-home.jpg`;
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

    const html = applySeo(template, meta, image, path);
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
