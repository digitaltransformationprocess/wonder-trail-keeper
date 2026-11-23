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

export type DealOfferType = "discount" | "trial" | "partner" | "code";

export interface Deal {
  id: string;
  name: string;
  slug: string;
  summary: string;
  pricing: DealPricing;
  category: DealCategory;
  offerType: DealOfferType;
  /** Short feature chips shown on the deal card */
  features: string[];
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
  /** Spotlight on /deals (mobile + desktop) */
  featured?: boolean;
}

export const DEAL_PRICING_LABELS: Record<DealPricing, string> = {
  free: "Free",
  freemium: "Freemium",
  trial: "Free trial",
  paid: "Paid",
};

export const DEAL_CATEGORY_LABELS: Record<DealCategory, string> = {
  video: "AI Video Generation",
  image: "AI Image Generation",
  writing: "AI Writing",
  productivity: "Productivity",
  coding: "AI Coding",
  audio: "AI Voice & Audio",
  marketing: "AI Marketing",
  education: "AI Courses",
  other: "Other",
};

export const DEAL_OFFER_TYPE_LABELS: Record<DealOfferType, string> = {
  discount: "Discount",
  trial: "Free trial",
  partner: "Partner offer",
  code: "Promo code",
};

/** Curated deals — expand as affiliate partnerships are approved. */
export const DEALS: Deal[] = [
  {
    id: "higgsfield",
    name: "Higgsfield AI",
    slug: "higgsfield",
    summary:
      "Create cinematic videos, dynamic scenes and visual stories with AI.",
    pricing: "freemium",
    category: "video",
    offerType: "discount",
    features: ["Text to video", "Cinematic styles", "High quality"],
    discountPercent: 65,
    offerUrl: "https://higgsfield.ai?fpr=aidiscov-e700b5",
    toolSlug: "higgsfield",
    logoUrl: "https://www.google.com/s2/favicons?domain=higgsfield.ai&sz=128",
    verified: true,
    featured: true,
    updatedAt: "2026-11-16",
    notes:
      "Black Friday promo: up to 65% off shown on Higgsfield via the partner link (confirm at checkout; offer is time-limited).",
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    slug: "elevenlabs",
    summary:
      "AI voice platform: ElevenCreative (TTS, cloning, dubbing), ElevenAgents, and ElevenAPI.",
    pricing: "freemium",
    category: "audio",
    offerType: "partner",
    features: ["ElevenCreative", "ElevenAgents", "ElevenAPI"],
    offerUrl: "https://try.elevenlabs.io/svxp5cd3i356",
    toolSlug: "elevenlabs",
    logoUrl: "https://www.google.com/s2/favicons?domain=elevenlabs.io&sz=128",
    verified: true,
    updatedAt: "2026-11-19",
    notes:
      "Partner link — covers Creative, Agents, and API sign-ups (plans and trials set on ElevenLabs).",
  },
  {
    id: "elevencreative",
    name: "ElevenCreative",
    slug: "elevencreative",
    summary:
      "AI-native creative workspace for audio and video — text to speech, voice cloning, and dubbing at scale.",
    pricing: "freemium",
    category: "audio",
    offerType: "partner",
    features: ["Text to Speech", "Voice cloning", "Dubbing"],
    offerUrl: "https://try.elevenlabs.io/svxp5cd3i356",
    toolSlug: "elevencreative",
    logoUrl: "https://www.google.com/s2/favicons?domain=elevenlabs.io&sz=128",
    verified: true,
    updatedAt: "2026-11-19",
    notes:
      "Partner link for ElevenCreative (TTS, Voices / cloning, Dubbing). Confirm current plans on ElevenLabs.",
  },
  {
    id: "elevenagents",
    name: "ElevenAgents",
    slug: "elevenagents",
    summary:
      "Conversational AI voice agents for support, sales qualification, and more — high-value ElevenLabs product line.",
    pricing: "freemium",
    category: "audio",
    offerType: "partner",
    features: ["Voice agents", "Customer support", "Sales qualification"],
    offerUrl: "https://try.elevenlabs.io/svxp5cd3i356",
    toolSlug: "elevenagents",
    logoUrl: "https://www.google.com/s2/favicons?domain=elevenlabs.io&sz=128",
    verified: true,
    updatedAt: "2026-11-19",
    notes:
      "Partner link for ElevenAgents (conversational voice agents). Confirm pricing and eligibility on ElevenLabs.",
  },
  {
    id: "elevenapi",
    name: "ElevenAPI",
    slug: "elevenapi",
    summary:
      "Developer API to embed ElevenLabs voice models into your own apps and products.",
    pricing: "freemium",
    category: "audio",
    offerType: "partner",
    features: ["Voice API", "TTS models", "Developer SDKs"],
    offerUrl: "https://try.elevenlabs.io/svxp5cd3i356",
    toolSlug: "elevenapi",
    logoUrl: "https://www.google.com/s2/favicons?domain=elevenlabs.io&sz=128",
    verified: true,
    updatedAt: "2026-11-19",
    notes:
      "Partner link for ElevenAPI developer sign-ups. Confirm API credits and plan limits on ElevenLabs.",
  },
  {
    id: "murf",
    name: "Murf AI",
    slug: "murf",
    summary:
      "AI voice & conversational agents — Studio TTS, dubbing, voice cloning, and TTS APIs for agents and content.",
    pricing: "freemium",
    category: "audio",
    offerType: "partner",
    features: ["Studio TTS", "Voice agents", "Dubbing", "TTS API"],
    offerUrl: "https://get.murf.ai/z72xb1oikg7m",
    toolSlug: "murf",
    logoUrl: "https://www.google.com/s2/favicons?domain=murf.ai&sz=128",
    verified: true,
    updatedAt: "2026-11-23",
    notes:
      "Partner referral link — credited signups via this URL. Confirm current plans and trials on Murf.",
  },
  {
    id: "mistral-vibe-lechonk",
    name: "Mistral Vibe Pro",
    slug: "mistral-vibe-lechonk",
    summary:
      "Vibe Desktop is out (macOS/Windows). Building in Europe? Try Pro free with coupon LECHONK.",
    pricing: "trial",
    category: "coding",
    offerType: "code",
    features: ["Desktop macOS/Windows", "Local or remote agents", "Code LECHONK"],
    code: "LECHONK",
    offerUrl: "https://mistral.ai/products/vibe/",
    toolSlug: "mistral-vibe",
    logoUrl: "https://www.google.com/s2/favicons?domain=mistral.ai&sz=128",
    verified: true,
    updatedAt: "2026-11-18",
    expiresAt: "2026-12-18",
    notes:
      "Coupon LECHONK — Europe builders, limited stock. Confirm eligibility and redemption on Mistral; offers can sell out.",
  },
];

export const DEALS_FAQS: Array<{ q: string; a: string }> = [
  {
    q: "What is AI Discov Deals?",
    a: "A curated list of AI tool discounts, trials, and partner offers. Each deal shows the tool, pricing model, any promo code, and a tracked link to the vendor.",
  },
  {
    q: "Are these AI deals verified?",
    a: "We mark deals Verified when the partner link or promo terms were checked on our side. Offers can still change on the vendor site — always confirm price and eligibility at checkout.",
  },
  {
    q: "Does AI Discov earn money from these deals?",
    a: "Sometimes. Some links are affiliate links: if you subscribe, the maker may pay us a commission without changing the price you pay. That is disclosed on this page.",
  },
  {
    q: "How do I use an AI promo code?",
    a: "Copy the code on the deal card, open Get deal, pick the plan the offer applies to, then paste the code at checkout. Link-only deals apply the offer when you land via the partner URL.",
  },
];

export function featuredDeal(deals: Deal[] = DEALS): Deal | undefined {
  return deals.find((d) => d.featured) ?? [...deals].sort(
    (a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0),
  )[0];
}

/** Active deal for a catalog tool page, if any. */
export function dealForToolSlug(toolSlug: string, deals: Deal[] = DEALS): Deal | undefined {
  const key = toolSlug.trim().toLowerCase();
  if (!key) return undefined;
  return deals.find((d) => d.toolSlug?.toLowerCase() === key || d.slug.toLowerCase() === key);
}

export function maxDealDiscount(deals: Deal[] = DEALS): number {
  return deals.reduce((max, d) => Math.max(max, d.discountPercent ?? 0), 0);
}

export function formatDealDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

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
    const hay = `${d.name} ${d.summary} ${d.code ?? ""} ${d.category} ${d.features.join(" ")}`.toLowerCase();
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
