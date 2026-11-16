import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Copy, ExternalLink, Search, Tag } from "lucide-react";
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
  dealsUpdatedLabel,
  filterDeals,
  type Deal,
  type DealCategory,
  type DealPricing,
} from "@/lib/deals";
import { fadeUp, staggerChildren } from "@/lib/motion";
import { mergeHead, pageSeo } from "@/lib/seo";

const pricingOptions = ["all", ...Object.keys(DEAL_PRICING_LABELS)] as const;
const categoryOptions = ["all", ...Object.keys(DEAL_CATEGORY_LABELS)] as const;
const sortOptions = ["discount", "alpha", "code"] as const;

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
    return mergeHead(
      {
        meta: [
          {
            title: "AI Deals & promo codes — verified offers | AI Discov",
          },
          {
            name: "description",
            content:
              "Curated AI tool deals and affiliate offers — discounts, trials, and promo codes for video, image, writing, and more. Updated regularly with clear disclosure.",
          },
        ],
      },
      pageSeo({ path: "/deals", noindex: filtered }),
    );
  },
  component: DealsPage,
});

function DealsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/deals" });
  const reduce = useReducedMotion();
  const [qDraft, setQDraft] = useState(search.q ?? "");

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

  const deals = filterDeals(DEALS, {
    ...(search.q ? { q: search.q } : {}),
    pricing: (search.pricing ?? "all") as DealPricing | "all",
    category: (search.category ?? "all") as DealCategory | "all",
    sort: search.sort ?? "discount",
  });

  const updated = dealsUpdatedLabel(DEALS);

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
          className="type-display text-clarity mt-2 text-[2.5rem] md:text-[3.4rem]"
        >
          Deals
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="mt-4 max-w-2xl text-[1.05rem] leading-8 text-muted-foreground"
        >
          Promo codes and partner offers on AI tools we list. Last checked{" "}
          <span className="text-foreground">{updated}</span>.
        </motion.p>

        <motion.p
          variants={fadeUp}
          className="mt-4 max-w-2xl text-[0.8125rem] leading-6 text-muted-foreground"
        >
          Affiliate disclosure: some links are partner links. If you buy through them, AI Discov may
          earn a commission at no extra cost to you. Offers can change; always confirm on the
          vendor site.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
        >
          <label className="relative min-w-0 flex-1 sm:max-w-xs">
            <span className="sr-only">Search deals</span>
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              value={qDraft}
              onChange={(e) => setQDraft(e.target.value)}
              placeholder="Search deals…"
              className="glass w-full rounded-xl py-2.5 pl-10 pr-3.5 text-[0.875rem] outline-none transition-apple placeholder:text-muted-foreground focus:ring-1 focus:ring-signal/40"
            />
          </label>

          <Select
            value={search.pricing ?? "all"}
            onValueChange={(v) => set({ pricing: v === "all" ? undefined : v })}
          >
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

          <Select
            value={search.category ?? "all"}
            onValueChange={(v) => set({ category: v === "all" ? undefined : v })}
          >
            <SelectTrigger className="w-full sm:w-[10.5rem]" aria-label="Filter by category">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {(Object.keys(DEAL_CATEGORY_LABELS) as DealCategory[]).map((c) => (
                <SelectItem key={c} value={c}>
                  {DEAL_CATEGORY_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={search.sort ?? "discount"}
            onValueChange={(v) => set({ sort: v === "discount" ? undefined : v })}
          >
            <SelectTrigger className="w-full sm:w-[10.5rem]" aria-label="Sort deals">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="discount">Best discount</SelectItem>
              <SelectItem value="alpha">A–Z</SelectItem>
              <SelectItem value="code">With code first</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {deals.length === 0 ? (
          <motion.p
            variants={fadeUp}
            className="glass mt-12 rounded-3xl px-6 py-12 text-center text-muted-foreground"
          >
            No deals match these filters.
          </motion.p>
        ) : (
          <motion.ul
            variants={staggerChildren}
            className="mt-10 grid list-none gap-4 p-0 sm:grid-cols-2"
          >
            {deals.map((deal) => (
              <motion.li key={deal.id} variants={fadeUp}>
                <DealCard deal={deal} />
              </motion.li>
            ))}
          </motion.ul>
        )}
      </motion.div>
    </SiteShell>
  );
}

function DealCard({ deal }: { deal: Deal }) {
  const codeId = useId();
  const tipRef = useRef<HTMLSpanElement>(null);
  const [copyState, setCopyState] = useState<"idle" | "ok" | "fail">("idle");
  const timerRef = useRef<number | null>(null);

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
    <article className="glass flex h-full flex-col rounded-3xl p-5 md:p-6">
      <div className="flex items-start gap-3.5">
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
            <h2 className="type-title text-[1.05rem] tracking-[-0.01em] text-foreground">
              {deal.name}
            </h2>
            {deal.verified ? (
              <span className="text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                Verified
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-[0.75rem] text-muted-foreground">
            {DEAL_CATEGORY_LABELS[deal.category]} · {DEAL_PRICING_LABELS[deal.pricing]}
            {deal.discountPercent != null ? ` · up to −${deal.discountPercent}%` : ""}
          </p>
        </div>
      </div>

      <p className="mt-4 flex-1 text-[0.875rem] leading-6 text-muted-foreground">{deal.summary}</p>

      {deal.notes ? (
        <p className="mt-3 text-[0.75rem] leading-5 text-muted-foreground">{deal.notes}</p>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {deal.code ? (
          <div className="relative flex items-center gap-1">
            <code
              id={codeId}
              className="rounded-xl bg-fill px-3 py-2 font-mono text-[0.8125rem] text-foreground"
            >
              {deal.code}
            </code>
            <span className="relative inline-flex">
              <button
                type="button"
                onClick={() => void copyCode()}
                className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-xl text-muted-foreground transition-apple hover:bg-fill hover:text-foreground"
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
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[0.8125rem] font-medium text-primary-foreground transition-apple hover:opacity-90"
        >
          Get deal
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
      </div>
    </article>
  );
}
