import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, Copy, ExternalLink, Percent, Search, Sparkles, Tag } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { z } from "zod";
import { SiteShell } from "@/components/SiteShell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEAL_CATEGORY_LABELS,
  DEAL_PRICING_LABELS,
  DEALS,
  DEALS_FAQS,
  dealsUpdatedLabel,
  featuredDeal,
  filterDeals,
  maxDealDiscount,
  type Deal,
  type DealCategory,
  type DealPricing,
} from "@/lib/deals";
import { fadeUp, staggerChildren } from "@/lib/motion";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  mergeHead,
  pageSeo,
  SITE_NAME,
} from "@/lib/seo";

const pricingOptions = ["all", ...Object.keys(DEAL_PRICING_LABELS)] as const;
const categoryOptions = ["all", ...Object.keys(DEAL_CATEGORY_LABELS)] as const;
const sortOptions = ["discount", "alpha", "code"] as const;

const CATEGORY_CHIPS: Array<{ value: "" | DealCategory; label: string }> = [
  { value: "", label: "All" },
  ...(Object.keys(DEAL_CATEGORY_LABELS) as DealCategory[]).map((c) => ({
    value: c,
    label: DEAL_CATEGORY_LABELS[c],
  })),
];

function dealsItemListJsonLd(deals: Deal[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "AI tool deals and promo codes",
    description:
      "Curated discounts, trials, and partner offers on AI video, voice, writing, and productivity tools.",
    numberOfItems: deals.length,
    itemListElement: deals.map((d, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: d.name,
      url: absoluteUrl("/deals"),
      description: d.discountPercent
        ? `${d.name}: up to ${d.discountPercent}% off — ${d.summary}`
        : `${d.name}: ${d.summary}`,
    })),
  };
}

function dealsFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: DEALS_FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

function dealsWebPageJsonLd(updated: string, count: number, maxDiscount: number) {
  const url = absoluteUrl("/deals");
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "AI Deals & promo codes",
    description:
      "Verified AI tool deals, promo codes, and partner discounts with affiliate disclosure.",
    url,
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: absoluteUrl("/") },
    dateModified: updated,
    about: {
      "@type": "Thing",
      name: "AI software discounts and affiliate offers",
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: count,
      name:
        maxDiscount > 0
          ? `AI deals with discounts up to ${maxDiscount}%`
          : "AI partner offers",
    },
  };
}

export const Route = createFileRoute("/deals")({
  validateSearch: z.object({
    q: z.string().optional(),
    pricing: z.enum(pricingOptions).optional(),
    category: z.enum(categoryOptions).optional(),
    sort: z.enum(sortOptions).optional(),
  }),
  head: ({ match }) => {
    const s = match.search;
    const filtered = Boolean(s.q || s.pricing || s.category || s.sort);
    const max = maxDealDiscount(DEALS);
    const updated = DEALS.map((d) => d.updatedAt).sort().at(-1) ?? "2026-11-16";
    const title =
      max > 0
        ? `AI Deals ${new Date().getFullYear()} — up to ${max}% off promo codes | ${SITE_NAME}`
        : `AI Deals & promo codes — verified offers | ${SITE_NAME}`;
    return mergeHead(
      {
        meta: [
          { title },
          {
            name: "description",
            content:
              "Find verified AI tool deals, promo codes, and partner discounts for video, voice, writing, and more. Updated regularly on AI Discov with clear affiliate disclosure.",
          },
          { name: "keywords", content: "AI deals, AI promo codes, AI discounts, AI tool coupons" },
        ],
      },
      pageSeo(
        filtered
          ? { path: "/deals", noindex: true }
          : {
              path: "/deals",
              jsonLd: [
                breadcrumbJsonLd([
                  { name: "Home", path: "/" },
                  { name: "Deals", path: "/deals" },
                ]),
                dealsWebPageJsonLd(updated, DEALS.length, max),
                dealsItemListJsonLd(DEALS),
                dealsFaqJsonLd(),
              ],
            },
      ),
    );
  },
  component: DealsPage,
});

function DealsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/deals" });
  const reduce = useReducedMotion();
  const [qDraft, setQDraft] = useState(search.q ?? "");
  const chipRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  useEffect(() => {
    setQDraft(search.q ?? "");
  }, [search.q]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const next = qDraft.trim() || undefined;
      if ((search.q ?? undefined) === next) return;
      void navigate({
        search: (prev) => ({ ...prev, q: next }),
        replace: true,
      });
    }, 250);
    return () => window.clearTimeout(handle);
  }, [qDraft, navigate, search.q]);

  const set = (patch: Record<string, unknown>) =>
    void navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

  const activeCategory = (search.category ?? "") as "" | DealCategory;

  useEffect(() => {
    const key = activeCategory || "all";
    const el = chipRefs.current.get(key);
    el?.scrollIntoView({ inline: "center", block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }, [activeCategory, reduce]);

  const deals = filterDeals(DEALS, {
    ...(search.q ? { q: search.q } : {}),
    pricing: (search.pricing ?? "all") as DealPricing | "all",
    category: (search.category ?? "all") as DealCategory | "all",
    sort: search.sort ?? "discount",
  });

  const updated = dealsUpdatedLabel(DEALS);
  const spotlight = featuredDeal(DEALS);
  const maxDiscount = maxDealDiscount(DEALS);
  const showSpotlight =
    spotlight &&
    !search.q &&
    (!search.category || search.category === "all" || search.category === spotlight.category) &&
    (!search.pricing || search.pricing === "all" || search.pricing === spotlight.pricing);

  return (
    <SiteShell>
      <motion.div
        initial={reduce ? false : "hidden"}
        animate="show"
        variants={staggerChildren}
        transition={{ staggerChildren: 0.03, delayChildren: 0 }}
      >
        <motion.p
          variants={fadeUp}
          className="text-[0.75rem] font-medium uppercase tracking-[0.12em] text-muted-foreground"
        >
          AI Discov
        </motion.p>
        <motion.h1
          variants={fadeUp}
          className="type-display text-clarity mt-2 text-[clamp(2.1rem,8vw,3.4rem)] leading-[1.05]"
        >
          AI Deals
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="mt-4 max-w-2xl text-[1.05rem] leading-7 text-muted-foreground text-pretty md:leading-8"
        >
          Verified promo codes and partner discounts on AI tools — video, voice, writing, and more.
          Last checked <span className="text-foreground">{updated}</span>
          {maxDiscount > 0 ? (
            <>
              {" "}
              · savings up to{" "}
              <span className="font-medium text-signal">−{maxDiscount}%</span>
            </>
          ) : null}
          .
        </motion.p>

        {showSpotlight && spotlight ? (
          <motion.div variants={fadeUp} className="mt-7 md:mt-8">
            <FeaturedDeal deal={spotlight} reduce={!!reduce} />
          </motion.div>
        ) : null}

        <motion.div
          variants={fadeUp}
          className="sticky top-[4.25rem] z-20 -mx-1 mt-7 space-y-3 rounded-3xl bg-background/75 px-1 py-3 backdrop-blur-md md:top-[4.75rem] md:mt-8"
        >
          <label className="relative block max-w-xl">
            <span className="sr-only">Search AI deals</span>
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              value={qDraft}
              onChange={(e) => setQDraft(e.target.value)}
              placeholder="Search AI deals…"
              className="glass w-full rounded-full py-2.5 pl-10 pr-3.5 text-[0.875rem] outline-none transition-apple placeholder:text-muted-foreground focus:ring-1 focus:ring-signal/40"
            />
          </label>

          <div className="news-chip-scroll -mx-1 px-1">
            <div className="flex w-max gap-2 pb-0.5" role="toolbar" aria-label="Deal categories">
              {CATEGORY_CHIPS.map((c) => {
                const key = c.value || "all";
                const active = activeCategory === c.value;
                return (
                  <button
                    key={key}
                    type="button"
                    ref={(el) => {
                      if (el) chipRefs.current.set(key, el);
                      else chipRefs.current.delete(key);
                    }}
                    aria-pressed={active}
                    className={`min-h-9 shrink-0 rounded-full px-3.5 py-1.5 text-[0.8125rem] transition-apple ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "glass text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() =>
                      set({ category: c.value ? c.value : undefined })
                    }
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          <details className="group sm:hidden">
            <summary className="cursor-pointer list-none rounded-full px-3.5 py-2 text-[0.8125rem] text-muted-foreground transition-apple marker:content-none hover:text-foreground [&::-webkit-details-marker]:hidden">
              <span className="inline-flex items-center gap-1.5">
                More filters
                <span className="text-[0.6875rem] opacity-70 group-open:hidden">pricing · sort</span>
              </span>
            </summary>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <PricingSelect
                value={search.pricing ?? "all"}
                onChange={(v) => set({ pricing: v === "all" ? undefined : v })}
              />
              <SortSelect
                value={search.sort ?? "discount"}
                onChange={(v) => set({ sort: v === "discount" ? undefined : v })}
              />
            </div>
          </details>

          <div className="hidden gap-2 sm:flex sm:flex-wrap">
            <PricingSelect
              value={search.pricing ?? "all"}
              onChange={(v) => set({ pricing: v === "all" ? undefined : v })}
            />
            <SortSelect
              value={search.sort ?? "discount"}
              onChange={(v) => set({ sort: v === "discount" ? undefined : v })}
            />
          </div>
        </motion.div>

        <p className="sr-only">
          Affiliate disclosure: some links are partner links. If you buy through them, AI Discov may
          earn a commission at no extra cost to you. Offers can change; always confirm on the vendor
          site.
        </p>
        <motion.p
          variants={fadeUp}
          className="mt-4 text-[0.75rem] leading-5 text-muted-foreground md:max-w-2xl md:text-[0.8125rem] md:leading-6"
        >
          Affiliate disclosure: some links are partner links. If you buy through them, {SITE_NAME} may
          earn a commission at no extra cost to you.
        </motion.p>

        <h2 className="sr-only">All AI deals</h2>

        {deals.length === 0 ? (
          <motion.p
            variants={fadeUp}
            className="glass mt-10 rounded-3xl px-6 py-12 text-center text-muted-foreground"
          >
            No deals match these filters.
          </motion.p>
        ) : (
          <motion.ul
            variants={staggerChildren}
            className="mt-8 grid list-none gap-3 p-0 sm:mt-10 sm:grid-cols-2 sm:gap-4"
          >
            {deals.map((deal) => (
              <motion.li
                key={deal.id}
                variants={fadeUp}
                className="[content-visibility:auto] [contain-intrinsic-size:auto_220px]"
              >
                <DealCard deal={deal} />
              </motion.li>
            ))}
          </motion.ul>
        )}

        <motion.section variants={fadeUp} className="mt-14 md:mt-16" aria-labelledby="deals-faq">
          <h2 id="deals-faq" className="type-title text-[1.15rem] tracking-[-0.01em]">
            AI deals FAQ
          </h2>
          <p className="mt-2 max-w-2xl text-[0.875rem] leading-6 text-muted-foreground">
            Straight answers for shoppers and for search / AI assistants citing this page.
          </p>
          <div className="mt-5 space-y-2">
            {DEALS_FAQS.map((f) => (
              <details
                key={f.q}
                className="glass group rounded-2xl px-4 py-1 open:pb-3 md:px-5"
              >
                <summary className="cursor-pointer list-none py-3 text-[0.9375rem] font-medium text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
                  {f.q}
                </summary>
                <p className="pb-1 text-[0.875rem] leading-6 text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
          <p className="mt-6 text-[0.8125rem] text-muted-foreground">
            Browse the full catalog on{" "}
            <Link to="/explore" className="font-medium text-primary hover:opacity-80">
              Explore
            </Link>{" "}
            or product updates on{" "}
            <Link to="/latest" className="font-medium text-primary hover:opacity-80">
              Latest
            </Link>
            .
          </p>
        </motion.section>
      </motion.div>
    </SiteShell>
  );
}

function PricingSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full sm:w-[10.5rem]" aria-label="Filter by pricing">
        <SelectValue placeholder="Pricing" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All pricing</SelectItem>
        {(Object.keys(DEAL_PRICING_LABELS) as DealPricing[]).map((p) => (
          <SelectItem key={p} value={p}>
            {DEAL_PRICING_LABELS[p]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function SortSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full sm:w-[10.5rem]" aria-label="Sort deals">
        <SelectValue placeholder="Sort" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="discount">Best discount</SelectItem>
        <SelectItem value="alpha">A–Z</SelectItem>
        <SelectItem value="code">With code first</SelectItem>
      </SelectContent>
    </Select>
  );
}

function FeaturedDeal({ deal, reduce }: { deal: Deal; reduce: boolean }) {
  return (
    <article className="relative overflow-hidden rounded-[1.75rem] border border-signal/25 bg-gradient-to-br from-signal/12 via-background to-background p-5 md:rounded-3xl md:p-7">
      <div
        className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-signal/20 blur-3xl"
        aria-hidden
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1">
          <p className="inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-signal">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Featured deal
            {!reduce ? (
              <span className="ml-0.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-signal" />
            ) : null}
          </p>
          <div className="mt-2.5 flex items-start gap-3">
            {deal.logoUrl ? (
              <img
                src={deal.logoUrl}
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 shrink-0 rounded-2xl bg-fill object-contain p-2"
                decoding="async"
                fetchPriority="high"
              />
            ) : null}
            <div className="min-w-0">
              <h2 className="type-title text-[1.25rem] tracking-[-0.02em] text-foreground md:text-[1.45rem]">
                {deal.name}
              </h2>
              <p className="mt-1 text-[0.875rem] leading-6 text-muted-foreground text-pretty">
                {deal.summary}
              </p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-3 sm:items-end">
          {deal.discountPercent != null ? (
            <p className="inline-flex items-center gap-1.5 self-start rounded-2xl bg-signal px-3.5 py-2 text-[1.05rem] font-semibold tracking-tight text-background sm:self-end">
              <Percent className="h-4 w-4" aria-hidden />
              Up to −{deal.discountPercent}%
            </p>
          ) : null}
          <a
            href={deal.offerUrl}
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-[0.875rem] font-medium text-primary-foreground transition-apple hover:opacity-90 sm:w-auto"
          >
            Claim offer
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        </div>
      </div>
    </article>
  );
}

function DealCard({ deal }: { deal: Deal }) {
  const tipRef = useRef<HTMLSpanElement>(null);
  const [copyState, setCopyState] = useState<"idle" | "ok" | "fail">("idle");
  const timerRef = useRef<number | null>(null);
  const codeId = useId();

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  async function copyCode() {
    if (!deal.code) return;
    const tip = tipRef.current;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setCopyState("idle");
    if (tip) tip.textContent = "";
    try {
      await navigator.clipboard.writeText(deal.code);
      setCopyState("ok");
      requestAnimationFrame(() => {
        if (tip) tip.textContent = "Copied";
      });
    } catch {
      setCopyState("fail");
      requestAnimationFrame(() => {
        if (tip) tip.textContent = "Copy failed";
      });
    }
    timerRef.current = window.setTimeout(() => {
      setCopyState("idle");
      if (tip) tip.textContent = "";
    }, 2000);
  }

  return (
    <article className="glass flex h-full flex-col rounded-[1.5rem] p-4 sm:rounded-3xl sm:p-6">
      <div className="flex items-start gap-3 sm:gap-3.5">
        {deal.logoUrl ? (
          <img
            src={deal.logoUrl}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 rounded-xl bg-fill object-contain p-1.5"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-fill text-muted-foreground"
            aria-hidden
          >
            <Tag className="h-4 w-4" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="type-title text-[1.05rem] tracking-[-0.01em] text-foreground">
              {deal.name}
            </h3>
            {deal.discountPercent != null ? (
              <span className="rounded-full bg-signal/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.06em] text-signal">
                −{deal.discountPercent}%
              </span>
            ) : null}
            {deal.verified ? (
              <span className="text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                Verified
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-[0.75rem] text-muted-foreground">
            {DEAL_CATEGORY_LABELS[deal.category]} · {DEAL_PRICING_LABELS[deal.pricing]}
          </p>
        </div>
      </div>

      <p className="mt-3 flex-1 text-[0.875rem] leading-6 text-muted-foreground sm:mt-4">
        {deal.summary}
      </p>

      {deal.notes ? (
        <p className="mt-2 text-[0.75rem] leading-5 text-muted-foreground sm:mt-3">{deal.notes}</p>
      ) : null}

      <div className="mt-4 flex flex-col gap-2 sm:mt-5 sm:flex-row sm:flex-wrap sm:items-center">
        {deal.code ? (
          <div className="relative flex items-center gap-1">
            <code
              id={codeId}
              className="rounded-xl bg-fill px-3 py-2.5 font-mono text-[0.8125rem] text-foreground"
            >
              {deal.code}
            </code>
            <span className="relative inline-flex">
              <button
                type="button"
                onClick={() => void copyCode()}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-muted-foreground transition-apple hover:bg-fill hover:text-foreground"
                aria-label={`Copy promo code ${deal.code}`}
                data-copied={copyState === "ok" ? "" : undefined}
                data-failed={copyState === "fail" ? "" : undefined}
              >
                {copyState === "ok" ? (
                  <Check className="h-4 w-4" aria-hidden />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden />
                )}
              </button>
              <span
                ref={tipRef}
                role="status"
                className={`pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded-md bg-foreground px-2 py-0.5 text-[0.6875rem] text-background transition-opacity ${
                  copyState === "idle" ? "opacity-0" : "opacity-100"
                }`}
              />
            </span>
          </div>
        ) : null}

        <a
          href={deal.offerUrl}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-[0.8125rem] font-medium text-primary-foreground transition-apple hover:opacity-90 sm:w-auto"
        >
          Get deal
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
      </div>
    </article>
  );
}
