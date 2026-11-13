import type { Solution } from "@/lib/solutions";

export const SITE_NAME = "AI Discov";
export const SITE_LOCALE = "en_US";
export const DEFAULT_OG_IMAGE_PATH = "/brand/aidiscov-mark-dark.png";

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
    { property: "og:image", content: image },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:image", content: image },
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
    sameAs: [],
    contactPoint: [
      {
        "@type": "ContactPoint",
        email: "support@aidiscov.com",
        contactType: "customer support",
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

export function toolPageTitle(name: string): string {
  return `${name} — overview, pricing, and alternatives | AI Discovery`;
}
