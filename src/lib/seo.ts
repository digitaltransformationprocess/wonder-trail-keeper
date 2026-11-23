import type { Solution } from "@/lib/solutions";

export const SITE_NAME = "AI Discov";
export const SITE_LOCALE = "en_US";
/** Public contact inbox (ImprovMX). */
export const SITE_CONTACT_EMAIL = "contact@aidiscov.com";
export const SITE_X_URL = "https://x.com/Aidiscov";
export const SITE_X_HANDLE = "@Aidiscov";
/** Social preview (1200×630) — landing hero with search, not the bare mark. */
export const DEFAULT_OG_IMAGE_PATH = "/brand/aidiscov-og-home.jpg";
export const DEFAULT_OG_IMAGE_WIDTH = "1200";
export const DEFAULT_OG_IMAGE_HEIGHT = "630";
export const SITE_TAGLINE = "Find the right AI solution for your use case.";
export const SITE_DESCRIPTION =
  "Describe a job, get matched AI tools with reasons — or open a Top 10 list. Verified pricing and comparisons.";

export function siteUrl(): string {
  const raw = import.meta.env.VITE_SITE_URL;
  return typeof raw === "string" ? raw.replace(/\/$/, "") : "";
}

export function absoluteUrl(path: string): string {
  const base = siteUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${normalized}` : normalized;
}

export function defaultOgImage(): string {
  return absoluteUrl(DEFAULT_OG_IMAGE_PATH);
}

type MetaEntry =
  | { title: string }
  | { name: string; content: string }
  | { property: string; content: string };

type LinkEntry = { rel: string; href: string; type?: string; hreflang?: string };

type ScriptEntry = { type: string; children: string };

export type SeoHeadParts = {
  meta: MetaEntry[];
  links: LinkEntry[];
  scripts: ScriptEntry[];
};

function isAbsoluteHttp(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

/** Sitewide verification + social defaults for Google Search Console / sharing. */
export function sitewideHead(): SeoHeadParts {
  const base = siteUrl();
  const image = defaultOgImage();
  const google = import.meta.env.VITE_GOOGLE_SITE_VERIFICATION as string | undefined;
  const bing = import.meta.env.VITE_BING_SITE_VERIFICATION as string | undefined;

  const meta: MetaEntry[] = [
    { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
    { name: "googlebot", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:locale", content: SITE_LOCALE },
    { property: "og:type", content: "website" },
    { property: "og:title", content: `${SITE_NAME} — ${SITE_TAGLINE}` },
    { property: "og:description", content: SITE_DESCRIPTION },
    { property: "og:image", content: image },
    { property: "og:image:width", content: DEFAULT_OG_IMAGE_WIDTH },
    { property: "og:image:height", content: DEFAULT_OG_IMAGE_HEIGHT },
    { property: "og:image:alt", content: `${SITE_NAME} — ${SITE_TAGLINE}` },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: SITE_X_HANDLE },
    { name: "twitter:creator", content: SITE_X_HANDLE },
    { name: "twitter:title", content: `${SITE_NAME} — ${SITE_TAGLINE}` },
    { name: "twitter:description", content: SITE_DESCRIPTION },
    { name: "twitter:image", content: image },
    { name: "twitter:image:alt", content: `${SITE_NAME} — ${SITE_TAGLINE}` },
    { name: "theme-color", content: "#0a0a0a" },
    { name: "format-detection", content: "telephone=no" },
  ];

  if (typeof google === "string" && google.trim()) {
    meta.push({ name: "google-site-verification", content: google.trim() });
  }
  if (typeof bing === "string" && bing.trim()) {
    meta.push({ name: "msvalidate.01", content: bing.trim() });
  }

  const links: LinkEntry[] = [
    { rel: "alternate", type: "text/plain", href: absoluteUrl("/llms.txt") },
  ];
  if (base) {
    links.push({ rel: "alternate", hreflang: "en", href: `${base}/` });
    links.push({ rel: "alternate", hreflang: "x-default", href: `${base}/` });
  }

  const scripts: ScriptEntry[] = [
    {
      type: "application/ld+json",
      children: JSON.stringify(organizationJsonLd()),
    },
    {
      type: "application/ld+json",
      children: JSON.stringify(websiteJsonLd()),
    },
  ];

  return { meta, links, scripts };
}

/** Per-page technical SEO (canonical, og:url, robots). Does not set title/description. */
export function pageSeo(opts: {
  path: string;
  noindex?: boolean;
  ogType?: string;
  image?: string | null;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}): SeoHeadParts {
  const pageUrl = absoluteUrl(opts.path);
  const abs = isAbsoluteHttp(pageUrl);
  const image = opts.image && opts.image.trim() ? opts.image : defaultOgImage();
  const imageAbs = isAbsoluteHttp(image) ? image : absoluteUrl(image);

  const meta: MetaEntry[] = [
    {
      name: "robots",
      content: opts.noindex
        ? "noindex, nofollow"
        : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    },
    { property: "og:type", content: opts.ogType ?? "website" },
    { property: "og:image", content: imageAbs },
    { name: "twitter:image", content: imageAbs },
  ];
  if (abs) {
    meta.push({ property: "og:url", content: pageUrl });
  }

  const links: LinkEntry[] = abs
    ? [
        { rel: "canonical", href: pageUrl },
        { rel: "alternate", hreflang: "en", href: pageUrl },
        { rel: "alternate", hreflang: "x-default", href: pageUrl },
      ]
    : [];

  const graphs = opts.jsonLd
    ? Array.isArray(opts.jsonLd)
      ? opts.jsonLd
      : [opts.jsonLd]
    : [];
  const scripts: ScriptEntry[] = graphs.map((g) => ({
    type: "application/ld+json",
    children: JSON.stringify(g),
  }));

  return { meta, links, scripts };
}

export function mergeHead(
  base: { meta?: MetaEntry[]; links?: LinkEntry[]; scripts?: ScriptEntry[] },
  extra: SeoHeadParts,
): { meta: MetaEntry[]; links: LinkEntry[]; scripts: ScriptEntry[] } {
  return {
    meta: [...(base.meta ?? []), ...extra.meta],
    links: [...(base.links ?? []), ...extra.links],
    scripts: [...(base.scripts ?? []), ...extra.scripts],
  };
}

export function organizationJsonLd(): Record<string, unknown> {
  const url = siteUrl() || absoluteUrl("/");
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url,
    logo: absoluteUrl("/brand/aidiscov-mark-dark.png"),
    sameAs: [SITE_X_URL],
    email: SITE_CONTACT_EMAIL,
    contactPoint: [
      {
        "@type": "ContactPoint",
        email: SITE_CONTACT_EMAIL,
        contactType: "customer support",
        url: SITE_X_URL,
      },
    ],
  };
}

export function websiteJsonLd(): Record<string, unknown> {
  const url = siteUrl() || absoluteUrl("/");
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url,
    inLanguage: "en",
    publisher: { "@type": "Organization", name: SITE_NAME, url },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

function offersForSolution(s: Solution): Record<string, unknown> | undefined {
  if (s.pricingModel === "Free" || s.pricingModel === "Open source") {
    return {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    };
  }
  if (s.pricingModel === "Not disclosed") return undefined;
  const price = s.price.trim();
  if (!price || /to verify|not disclosed|n\/a/i.test(price)) return undefined;
  return {
    "@type": "Offer",
    description: price,
  };
}

export function toolJsonLd(s: Solution, slug: string): Record<string, unknown> {
  const pageUrl = absoluteUrl(`/tools/${slug}`);
  const payload: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: s.name,
    description: s.description || s.summary,
    url: s.url || pageUrl,
    applicationCategory: s.categories[0] ?? s.type,
  };
  const offers = offersForSolution(s);
  if (offers) payload.offers = offers;
  return payload;
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** Clip meta descriptions to a SERP-friendly length (Semrush ~105–155). */
export function clipMetaDescription(text: string, max = 155): string {
  const t = (text || "").replace(/\s+/g, " ").trim();
  if (!t) return "";
  if (t.length <= max) return t;
  const budget = max - 1;
  const slice = t.slice(0, budget);
  const sp = slice.lastIndexOf(" ");
  const base = sp > Math.floor(budget * 0.55) ? slice.slice(0, sp) : slice;
  return `${base.replace(/[,:;.–—-]\s*$/u, "").trimEnd()}…`;
}

/** Prefer ≤60 characters; shorten mid-phrase for long tool names. */
export function toolPageTitle(name: string): string {
  const suffix = " | AI Discov";
  const candidates = [
    `${name}: pricing, features & alternatives${suffix}`,
    `${name}: pricing & alternatives${suffix}`,
    `${name} — pricing & alternatives${suffix}`,
    `${name} overview${suffix}`,
    `${name}${suffix}`,
  ];
  for (const c of candidates) {
    if (c.length <= 60) return c;
  }
  const maxName = Math.max(8, 60 - suffix.length - 1);
  return `${name.slice(0, maxName)}…${suffix}`;
}

export function toolMetaDescription(s: Solution): string {
  const raw =
    s.summary?.trim() ||
    s.description?.trim() ||
    `${s.name}: pricing, features, and alternatives on AI Discov.`;
  return clipMetaDescription(raw, 155);
}

export function toolFaqJsonLd(s: Solution): Record<string, unknown> {
  const priceHint =
    s.price?.trim() && !/to verify|not disclosed|n\/a/i.test(s.price)
      ? s.price.trim()
      : null;
  const apiText =
    s.apiAvailable === true
      ? `Yes — ${s.name} lists an API as available${s.apiDocsUrl ? ` (docs: ${s.apiDocsUrl})` : ""}.`
      : s.apiAvailable === false
        ? `No API is listed as available for ${s.name} on AI Discov.`
        : `API availability for ${s.name} is not disclosed on AI Discov.`;

  const faqs: Array<{ q: string; a: string }> = [
    {
      q: `What is ${s.name}?`,
      a:
        s.summary?.trim() ||
        `${s.name} is an AI ${s.type || "solution"} from ${s.publisher}, listed on AI Discov.`,
    },
    {
      q: `How much does ${s.name} cost?`,
      a: priceHint
        ? `${s.name} is listed as ${s.pricingModel} (${priceHint}) on AI Discov. Confirm current pricing on the official site.`
        : `${s.name} is listed as ${s.pricingModel} on AI Discov. Confirm current pricing on the official site.`,
    },
    {
      q: `Does ${s.name} have an API?`,
      a: apiText,
    },
    {
      q: `Is ${s.name} open source?`,
      a: s.openSource
        ? `Yes — ${s.name} is listed as open source${s.license?.trim() ? ` (${s.license.trim()})` : ""}.`
        : `No — ${s.name} is not listed as open source on AI Discov.`,
    },
  ];

  if (s.audience.length) {
    faqs.push({
      q: `Who is ${s.name} for?`,
      a: `${s.name} is geared toward ${s.audience.join(", ")}.`,
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function articleJsonLd(opts: {
  title: string;
  description: string;
  path: string;
  publishedAt: string;
  modifiedAt?: string | null;
  sourceUrl?: string | null;
}): Record<string, unknown> {
  const pageUrl = absoluteUrl(opts.path);
  const payload: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: opts.title,
    description: opts.description,
    datePublished: opts.publishedAt,
    dateModified: opts.modifiedAt || opts.publishedAt,
    mainEntityOfPage: pageUrl,
    url: pageUrl,
    author: { "@type": "Organization", name: SITE_NAME, url: siteUrl() || absoluteUrl("/") },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/brand/aidiscov-mark-dark.png"),
      },
    },
    image: [defaultOgImage()],
  };
  if (opts.sourceUrl?.trim()) {
    payload.isBasedOn = opts.sourceUrl.trim();
  }
  return payload;
}
