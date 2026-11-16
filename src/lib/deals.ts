export type DealPricing = "free" | "freemium" | "trial" | "paid";

export type DealCategory =
  | "video"
  | "image"
  | "writing"
  | "productivity"
  | "coding"
  | "audio"
  | "marketing"
  | "education"
  | "other";

export interface Deal {
  id: string;
  name: string;
  slug: string;
  summary: string;
  pricing: DealPricing;
  category: DealCategory;
  /** Percent off when known (0–100). Link-only deals can omit. */
  discountPercent?: number;
  /** Promo / coupon code; omit when the discount is applied via affiliate link only. */
  code?: string;
  /** Affiliate or tracked offer URL */
  offerUrl: string;
  /** Optional catalog tool slug for deep link */
  toolSlug?: string;
  logoUrl?: string;
  verified?: boolean;
  /** ISO date the deal was last checked */
  updatedAt: string;
  /** Optional expiry (ISO date); omit if ongoing */
  expiresAt?: string;
  notes?: string;
}

export const DEAL_PRICING_LABELS: Record<DealPricing, string> = {
  free: "Free",
  freemium: "Freemium",
  trial: "Free trial",
  paid: "Paid",
};

export const DEAL_CATEGORY_LABELS: Record<DealCategory, string> = {
  video: "AI video",
  image: "AI image",
  writing: "Writing",
  productivity: "Productivity",
  coding: "Coding",
  audio: "Audio",
  marketing: "Marketing",
  education: "Courses",
  other: "Other",
};

/** Curated deals — expand as affiliate partnerships are approved. */
export const DEALS: Deal[] = [
  {
    id: "higgsfield",
    name: "Higgsfield AI",
    slug: "higgsfield",
    summary:
      "AI video studio for clips, ads, animations, and camera effects from text or image — with consistent characters.",
    pricing: "freemium",
    category: "video",
    discountPercent: 50,
    offerUrl: "https://higgsfield.ai?fpr=aidiscov-e700b5",
    logoUrl: "https://www.google.com/s2/favicons?domain=higgsfield.ai&sz=128",
    verified: true,
    updatedAt: "2026-11-16",
    notes:
      "Discount of up to 50% applies for a limited window after you open the offer link (Higgsfield affiliate terms).",
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    slug: "elevenlabs",
    summary:
      "AI voice platform for realistic speech, voice cloning, dubbing, and audio production in 70+ languages.",
    pricing: "freemium",
    category: "audio",
    offerUrl: "https://try.elevenlabs.io/svxp5cd3i356",
    logoUrl: "https://www.google.com/s2/favicons?domain=elevenlabs.io&sz=128",
    verified: true,
    updatedAt: "2026-11-16",
    notes: "Partner offer link — open it to start with ElevenLabs (plans and trials set on their site).",
  },
];

export function filterDeals(
  deals: Deal[],
  opts: {
    q?: string;
    pricing?: DealPricing | "all";
    category?: DealCategory | "all";
    sort?: "discount" | "alpha" | "code";
  },
): Deal[] {
  const q = opts.q?.trim().toLowerCase() ?? "";
  let list = deals.filter((d) => {
    if (opts.pricing && opts.pricing !== "all" && d.pricing !== opts.pricing) return false;
    if (opts.category && opts.category !== "all" && d.category !== opts.category) return false;
    if (!q) return true;
    const hay = `${d.name} ${d.summary} ${d.code ?? ""} ${d.category}`.toLowerCase();
    return hay.includes(q);
  });

  const sort = opts.sort ?? "discount";
  list = [...list].sort((a, b) => {
    if (sort === "alpha") return a.name.localeCompare(b.name);
    if (sort === "code") {
      const ac = a.code ? 0 : 1;
      const bc = b.code ? 0 : 1;
      if (ac !== bc) return ac - bc;
      return (b.discountPercent ?? 0) - (a.discountPercent ?? 0);
    }
    return (b.discountPercent ?? 0) - (a.discountPercent ?? 0) || a.name.localeCompare(b.name);
  });

  return list;
}

export function dealsUpdatedLabel(deals: Deal[]): string {
  const latest = deals
    .map((d) => d.updatedAt)
    .sort()
    .at(-1);
  if (!latest) return "—";
  return new Date(latest).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
