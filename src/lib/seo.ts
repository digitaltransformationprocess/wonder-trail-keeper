import type { PricingModel, Solution } from "@/lib/solutions";

export function siteUrl(): string {
  const raw = import.meta.env.VITE_SITE_URL;
  return typeof raw === "string" ? raw.replace(/\/$/, "") : "";
}

export function absoluteUrl(path: string): string {
  const base = siteUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${normalized}` : normalized;
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

export function toolPageTitle(name: string): string {
  return `${name} — overview, pricing, and alternatives | AI Discovery`;
}
