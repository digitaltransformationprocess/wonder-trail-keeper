import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import { z } from "zod";
import { SiteShell } from "@/components/SiteShell";
import { newsQuery, type NewsFilters, type NewsRow } from "@/lib/news";
import { fadeUp, staggerChildren } from "@/lib/motion";
import { mergeHead, pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/latest")({
  validateSearch: z.object({
    kind: z.string().optional(),
    since: z.string().optional(),
  }),
  loaderDeps: ({ search }) => ({
    kind: search.kind,
    since: search.since,
  }),
  loader: async ({ context, deps, location }) => {
    // Child article route (/latest/$slug) renders via <Outlet />; skip list fetch.
    if (location.pathname !== "/latest" && location.pathname.startsWith("/latest/")) {
      return;
    }
    const filters: NewsFilters = {};
    if (deps.kind) filters.kind = deps.kind;
    if (deps.since) filters.since = deps.since;
    await context.queryClient.ensureQueryData(newsQuery(filters));
  },
  head: () =>
    mergeHead(
      {
        meta: [
          { title: "Latest — New AI tools, releases & versions | AI Discov" },
          {
            name: "description",
            content:
              "Updates on new AI tools, model releases, version upgrades, pricing, and product launches.",
          },
        ],
      },
      pageSeo({ path: "/latest" }),
    ),
  component: LatestLayout,
});

function LatestLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname !== "/latest" && pathname.startsWith("/latest/")) {
    return <Outlet />;
  }
  return <Latest />;
}

const KINDS = [
  { value: "", label: "All" },
  { value: "release", label: "Releases" },
  { value: "version", label: "Versions" },
  { value: "new_tool", label: "New tools" },
  { value: "pricing", label: "Pricing" },
  { value: "business", label: "Business" },
] as const;

function kindLabel(kind: string) {
  const map: Record<string, string> = {
    release: "Release",
    version: "Version",
    new_tool: "New tool",
    pricing: "Pricing",
    business: "Business",
    news: "News",
  };
  return map[kind] ?? kind;
}

function toolLabel(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function groupByDate(items: NewsRow[]) {
  const groups = new Map<string, NewsRow[]>();
  for (const item of items) {
    const key = item.published_at || "Undated";
    const list = groups.get(key) ?? [];
    list.push(item);
    groups.set(key, list);
  }
  return [...groups.entries()];
}

function Latest() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/latest" });
  const filters: NewsFilters = {};
  if (search.kind) filters.kind = search.kind;
  if (search.since) filters.since = search.since;

  const { data: news = [], isLoading, isError, error, refetch } = useQuery(newsQuery(filters));
  const reduce = useReducedMotion();
  const grouped = groupByDate(news);

  return (
    <SiteShell>
      <motion.div
        initial={reduce ? false : "hidden"}
        animate="show"
        variants={staggerChildren}
        // Faster entrance: Latest is a frequent nav target; long stagger feels laggy.
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
          Latest
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-4 max-w-2xl text-[1.05rem] leading-8 text-muted-foreground">
          New AI tools, model versions, pricing changes, and product milestones — clear posts you
          can skim in a minute.
        </motion.p>

        <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-2">
          {KINDS.map((k) => {
            const active = (search.kind ?? "") === k.value;
            return (
              <button
                key={k.label}
                type="button"
                className={`rounded-full px-3.5 py-1.5 text-[0.8125rem] transition-apple ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "glass text-muted-foreground hover:text-foreground"
                }`}
                onClick={() =>
                  navigate({
                    search: (prev) => ({
                      ...prev,
                      kind: k.value || undefined,
                    }),
                    replace: true,
                  })
                }
              >
                {k.label}
              </button>
            );
          })}
        </motion.div>

        {isLoading ? (
          <motion.p variants={fadeUp} className="mt-12 text-[0.875rem] text-muted-foreground">
            Loading…
          </motion.p>
        ) : isError ? (
          <motion.div variants={fadeUp} className="glass mt-12 rounded-3xl px-6 py-12 text-center">
            <p className="text-muted-foreground">
              Couldn’t load updates{error instanceof Error ? `: ${error.message}` : "."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 rounded-full bg-primary px-5 py-2.5 text-[0.875rem] font-medium text-primary-foreground"
            >
              Retry
            </button>
          </motion.div>
        ) : news.length === 0 ? (
          <motion.p
            variants={fadeUp}
            className="glass mt-12 rounded-3xl px-6 py-12 text-center text-muted-foreground"
          >
            No published updates{search.kind ? " in this category" : ""} yet.
          </motion.p>
        ) : (
          <motion.div variants={staggerChildren} className="mt-12 space-y-12">
            {grouped.map(([date, items]) => (
              <motion.section key={date} variants={fadeUp}>
                <h2 className="type-title text-[0.95rem] tracking-[-0.01em] text-muted-foreground">
                  {date === new Date().toISOString().slice(0, 10) ? "Today" : date}
                </h2>
                <ol className="mt-4 space-y-3">
                  {items.map((n, idx) => (
                    <li
                      key={n.id}
                      className="glass flex gap-4 rounded-3xl px-5 py-5 transition-apple hover:bg-fill/40 md:gap-6 md:px-6"
                    >
                      <span className="mt-1 w-7 shrink-0 text-[0.875rem] tabular-nums text-muted-foreground">
                        {idx + 1}.
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-fill px-2.5 py-0.5 text-[0.7rem] font-medium uppercase tracking-[0.06em] text-muted-foreground">
                            {kindLabel(n.kind)}
                          </span>
                          {n.solution_slug ? (
                            <Link
                              to="/tools/$slug"
                              params={{ slug: n.solution_slug }}
                              className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[0.7rem] font-medium text-primary transition-apple hover:bg-primary/15"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Tool · {toolLabel(n.solution_slug)}
                            </Link>
                          ) : null}
                        </div>
                        {n.slug ? (
                          <Link to="/latest/$slug" params={{ slug: n.slug }} className="group block">
                            <h3 className="type-title mt-2 text-[1.25rem] tracking-[-0.02em] transition-apple group-hover:text-primary md:text-[1.45rem]">
                              {n.title}
                            </h3>
                            <p className="mt-2 line-clamp-2 text-[0.9375rem] leading-7 text-muted-foreground">
                              {n.summary}
                            </p>
                          </Link>
                        ) : (
                          <>
                            <h3 className="type-title mt-2 text-[1.25rem] tracking-[-0.02em] md:text-[1.45rem]">
                              {n.title}
                            </h3>
                            <p className="mt-2 line-clamp-2 text-[0.9375rem] leading-7 text-muted-foreground">
                              {n.summary}
                            </p>
                          </>
                        )}
                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[0.8125rem]">
                          {n.solution_slug ? (
                            <Link
                              to="/tools/$slug"
                              params={{ slug: n.solution_slug }}
                              className="font-medium text-primary transition-apple hover:opacity-70"
                            >
                              Open {toolLabel(n.solution_slug)}
                            </Link>
                          ) : null}
                          {n.slug ? (
                            <Link
                              to="/latest/$slug"
                              params={{ slug: n.slug }}
                              className="text-muted-foreground transition-apple hover:text-foreground"
                            >
                              Read article
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </motion.section>
            ))}
          </motion.div>
        )}
      </motion.div>
    </SiteShell>
  );
}
