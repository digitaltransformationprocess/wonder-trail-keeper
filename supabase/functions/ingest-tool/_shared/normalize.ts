export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error("Empty URL");
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const u = new URL(withProtocol);
  u.hash = "";
  u.hostname = u.hostname.toLowerCase();
  if ((u.protocol === "https:" && u.port === "443") || (u.protocol === "http:" && u.port === "80")) {
    u.port = "";
  }
  // Drop common tracking params
  ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref", "fbclid", "gclid"].forEach(
    (k) => u.searchParams.delete(k),
  );
  let path = u.pathname.replace(/\/+$/, "");
  if (!path) path = "";
  u.pathname = path || "/";
  // Prefer origin without trailing slash for homepage
  if (u.pathname === "/") return `${u.origin}/`;
  return `${u.origin}${u.pathname}${u.search}`;
}

export function dedupeKeyFromUrl(url: string): string {
  const u = new URL(normalizeUrl(url));
  return `${u.hostname}${u.pathname}`.toLowerCase().replace(/\/+$/, "") || u.hostname;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export type ExtractedTool = {
  name?: string | null;
  publisher?: string | null;
  summary?: string | null;
  description?: string | null;
  official_url?: string | null;
  pricing_model?: string | null;
  price_display?: string | null;
  api_available?: boolean | null;
  open_source?: boolean | null;
  local_available?: boolean | null;
  platforms?: string[] | null;
  categories?: string[] | null;
  type?: string | null;
  keywords?: string[] | null;
  strengths?: string[] | null;
  limits?: string[] | null;
  audience?: string[] | null;
  source_url?: string | null;
};

const ALLOWED_PRICING = new Set(["Free", "Freemium", "Paid", "Open source", "Not disclosed"]);
const ALLOWED_TYPES = new Set([
  "Tool",
  "Model",
  "Agent",
  "API",
  "Platform",
  "Extension",
  "Framework",
  "Open source",
]);

export function sanitizeExtracted(raw: ExtractedTool, fallbackUrl: string): ExtractedTool {
  const pricing = raw.pricing_model && ALLOWED_PRICING.has(raw.pricing_model)
    ? raw.pricing_model
    : "Not disclosed";
  const type = raw.type && ALLOWED_TYPES.has(raw.type) ? raw.type : "Tool";

  return {
    name: raw.name?.trim() || null,
    publisher: raw.publisher?.trim() || null,
    summary: raw.summary?.trim() || null,
    description: raw.description?.trim() || null,
    official_url: raw.official_url?.trim() || fallbackUrl,
    pricing_model: pricing,
    price_display: raw.price_display?.trim() || "To verify",
    api_available: typeof raw.api_available === "boolean" ? raw.api_available : null,
    open_source: typeof raw.open_source === "boolean" ? raw.open_source : null,
    local_available: typeof raw.local_available === "boolean" ? raw.local_available : null,
    platforms: Array.isArray(raw.platforms) ? raw.platforms.filter(Boolean) : [],
    categories: Array.isArray(raw.categories) ? raw.categories.filter(Boolean) : [],
    type,
    keywords: Array.isArray(raw.keywords) ? raw.keywords.filter(Boolean) : [],
    strengths: Array.isArray(raw.strengths) ? raw.strengths.filter(Boolean) : [],
    limits: Array.isArray(raw.limits) ? raw.limits.filter(Boolean) : [],
    audience: Array.isArray(raw.audience) ? raw.audience.filter(Boolean) : [],
    source_url: raw.source_url?.trim() || fallbackUrl,
  };
}

export function confidenceFromPayload(payload: ExtractedTool): number {
  let score = 0;
  if (payload.name) score += 0.25;
  if (payload.summary) score += 0.2;
  if (payload.description) score += 0.15;
  if (payload.publisher) score += 0.1;
  if (payload.official_url) score += 0.1;
  if (payload.categories && payload.categories.length) score += 0.1;
  if (payload.pricing_model && payload.pricing_model !== "Not disclosed") score += 0.05;
  if (payload.keywords && payload.keywords.length) score += 0.05;
  return Math.min(1, Number(score.toFixed(2)));
}
