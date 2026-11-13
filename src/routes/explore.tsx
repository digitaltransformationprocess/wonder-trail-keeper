import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, useDragControls, useReducedMotion } from "motion/react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { SiteShell, SolutionCard } from "@/components/SiteShell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  categoriesQuery,
  filterSolutions,
  solutionTypesQuery,
  solutionsQuery,
} from "@/lib/solutions";
import { fadeUp, springSheet, staggerChildren } from "@/lib/motion";
import { mergeHead, pageSeo } from "@/lib/seo";

const PAGE_SIZE = 24;

export const Route = createFileRoute("/explore")({
  validateSearch: z.object({
    q: z.string().optional(),
    cat: z.string().optional(),
    type: z.string().optional(),
    price: z.string().optional(),
    api: z.boolean().optional(),
    oss: z.boolean().optional(),
    local: z.boolean().optional(),
    sort: z.enum(["name", "recent"]).optional(),
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(solutionsQuery),
      context.queryClient.ensureQueryData(categoriesQuery),
      context.queryClient.ensureQueryData(solutionTypesQuery),
    ]);
  },
  head: () =>
    mergeHead(
      {
        meta: [
          { title: "Explore — AI solution catalog | AI Discovery" },
          {
            name: "description",
            content: "Browse AI tools, models, APIs, and agents by category, pricing, and platform.",
          },
        ],
      },
      pageSeo({ path: "/explore" }),
    ),
  component: ExplorePage,
});

function ExplorePage() {
  return (
    <SiteShell>
      <Suspense
        fallback={
          <p className="text-[0.875rem] text-muted-foreground">Loading catalog…</p>
        }
      >
        <Explore />
      </Suspense>
    </SiteShell>
  );
}

function Explore() {
  const s = Route.useSearch();
  const navigate = useNavigate({ from: "/explore" });
  const set = (patch: Record<string, unknown>) =>
    navigate({ search: (p) => ({ ...p, ...patch }), replace: true });
  const [sheetOpen, setSheetOpen] = useState(false);
  const [qDraft, setQDraft] = useState(s.q ?? "");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const reduce = useReducedMotion();
  const dragControls = useDragControls();

  const { data: solutions } = useSuspenseQuery(solutionsQuery);
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const { data: types } = useSuspenseQuery(solutionTypesQuery);

  useEffect(() => {
    setQDraft(s.q ?? "");
  }, [s.q]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const next = qDraft.trim() || undefined;
      if (next !== (s.q || undefined)) set({ q: next });
    }, 250);
    return () => window.clearTimeout(handle);
  }, [qDraft]); // eslint-disable-line react-hooks/exhaustive-deps -- debounce draft only

  const list = useMemo(() => filterSolutions(solutions, s), [solutions, s]);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [s.q, s.cat, s.type, s.price, s.api, s.oss, s.local, s.sort]);

  const shown = list.slice(0, visible);
  const hasMore = visible < list.length;

  const field =
    "w-full rounded-xl glass px-3.5 py-2.5 text-[0.875rem] outline-none transition-apple focus:ring-1 focus:ring-signal/40";

  const filters = (
    <>
      <input
        className={`${field} md:col-span-2`}
        placeholder="Name, publisher, use case…"
        value={qDraft}
        onChange={(e) => setQDraft(e.target.value)}
      />
      <Select
        value={s.cat ?? "all"}
        onValueChange={(v) => set({ cat: v === "all" ? undefined : v })}
      >
        <SelectTrigger aria-label="Category">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.slug} value={c.slug}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={s.type ?? "all"}
        onValueChange={(v) => set({ type: v === "all" ? undefined : v })}
      >
        <SelectTrigger aria-label="Type">
          <SelectValue placeholder="All types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          {types.map((c) => (
            <SelectItem key={c.slug} value={c.name}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={s.price ?? "all"}
        onValueChange={(v) => set({ price: v === "all" ? undefined : v })}
      >
        <SelectTrigger aria-label="Pricing">
          <SelectValue placeholder="All pricing" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All pricing</SelectItem>
          {["Free", "Freemium", "Paid", "Open source"].map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={s.sort ?? "name"}
        onValueChange={(v) => set({ sort: v as "name" | "recent" })}
      >
        <SelectTrigger aria-label="Sort">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name">Sort: name</SelectItem>
          <SelectItem value="recent">Sort: last updated</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex flex-wrap items-center gap-4 text-[0.875rem] md:col-span-2">
        {(
          [
            ["api", "API"],
            ["oss", "Open source"],
            ["local", "Local"],
          ] as const
        ).map(([k, l]) => (
          <label key={k} className="flex items-center gap-2 text-muted-foreground">
            <input
              type="checkbox"
              className="accent-primary"
              checked={!!s[k]}
              onChange={(e) => set({ [k]: e.target.checked || undefined })}
            />
            {l}
          </label>
        ))}
      </div>
    </>
  );

  return (
    <>
      <motion.div initial={reduce ? false : "hidden"} animate="show" variants={staggerChildren}>
        <motion.div variants={fadeUp} className="flex items-end justify-between gap-4">
          <div>
            <h1 className="type-display text-clarity text-[2.5rem] md:text-[3.25rem]">Explore</h1>
            <p className="mt-2 text-[0.9375rem] text-muted-foreground">
              Scan the catalog — filter until the signal is clear.
            </p>
          </div>
          <button
            type="button"
            className="glass rounded-full px-4 py-2 text-[0.8125rem] font-medium text-foreground md:hidden"
            onClick={() => setSheetOpen(true)}
          >
            Filters
          </button>
        </motion.div>

        <motion.div variants={fadeUp} className="glass mt-8 hidden grid-cols-4 gap-3 rounded-3xl p-4 md:grid">
          {filters}
        </motion.div>

        <motion.div variants={fadeUp} className="mt-6 flex flex-wrap gap-2">
          {categories.slice(0, 12).map((c) => (
            <Link
              key={c.slug}
              to="/categories/$slug"
              params={{ slug: c.slug }}
              className="rounded-full glass px-3 py-1.5 text-[0.75rem] text-muted-foreground transition-apple hover:text-foreground"
            >
              {c.name}
            </Link>
          ))}
        </motion.div>

        <motion.p variants={fadeUp} className="mt-8 text-[0.8125rem] text-muted-foreground">
          {list.length === 0
            ? "0 solutions"
            : `Showing ${shown.length} of ${list.length} solution${list.length === 1 ? "" : "s"}`}
        </motion.p>
      </motion.div>

      {list.length === 0 ? (
        <p className="glass mt-6 rounded-3xl px-6 py-12 text-center text-muted-foreground">
          No results. Try broader filters.
        </p>
      ) : (
        <>
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {shown.map((x) => (
              <SolutionCard key={x.slug} s={x} lite />
            ))}
          </div>
          {hasMore ? (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                className="glass rounded-full px-5 py-2.5 text-[0.875rem] font-medium text-foreground transition-apple hover:bg-fill/50"
                onClick={() => setVisible((n) => n + PAGE_SIZE)}
              >
                Load more
              </button>
            </div>
          ) : null}
        </>
      )}

      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close filters"
              className="fixed inset-0 z-50 bg-foreground/25 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSheetOpen(false)}
            />
            <motion.div
              className="glass-strong fixed inset-x-0 bottom-0 z-50 max-h-[85svh] overflow-auto rounded-t-3xl px-5 pb-8 pt-3 md:hidden"
              initial={reduce ? { opacity: 0 } : { y: "100%" }}
              animate={reduce ? { opacity: 1 } : { y: 0 }}
              exit={reduce ? { opacity: 0 } : { y: "100%" }}
              transition={springSheet}
              drag={reduce ? false : "y"}
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.45 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100 || info.velocity.y > 500) setSheetOpen(false);
              }}
            >
              <div
                className="mx-auto mb-4 flex h-8 w-full cursor-grab items-center justify-center active:cursor-grabbing"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <div className="h-1 w-10 rounded-full bg-foreground/20" />
              </div>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="type-title text-[1.125rem]">Filters</h2>
                <button
                  type="button"
                  className="text-[0.875rem] text-primary"
                  onClick={() => setSheetOpen(false)}
                >
                  Done
                </button>
              </div>
              <div className="grid gap-3">{filters}</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
