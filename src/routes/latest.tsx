import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import { z } from "zod";
import { SiteShell } from "@/components/SiteShell";
import { newsQuery, type NewsFilters } from "@/lib/news";
import { fadeUp, staggerChildren } from "@/lib/motion";

export const Route = createFileRoute("/latest")({
  validateSearch: z.object({
    kind: z.string().optional(),
    since: z.string().optional(),
  }),
  loaderDeps: ({ search }) => ({
    kind: search.kind,
    since: search.since,
  }),
  loader: async ({ context, deps }) => {
    const filters: NewsFilters = {};
    if (deps.kind) filters.kind = deps.kind;
    if (deps.since) filters.since = deps.since;
    await context.queryClient.ensureQueryData(newsQuery(filters));
  },
  head: () => ({
    meta: [
      { title: "Latest — Verified AI news | AI Discovery" },
      {
        name: "description",
        content: "Sourced news about new AI tools, releases, and pricing changes.",
      },
    ],
  }),
  component: Latest,
});

const field =
  "rounded-xl glass px-3.5 py-2.5 text-[0.875rem] outline-none transition-apple focus:ring-1 focus:ring-signal/40";

function Latest() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/latest" });
  const filters: NewsFilters = {};
  if (search.kind) filters.kind = search.kind;
  if (search.since) filters.since = search.since;

  const { data: news = [], isLoading, isError, error, refetch } = useQuery(newsQuery(filters));
  const reduce = useReducedMotion();

  return (
    <SiteShell>
      <motion.div initial={reduce ? false : "hidden"} animate="show" variants={staggerChildren}>
        <motion.h1 variants={fadeUp} className="type-display text-clarity text-[2.5rem] md:text-[3.25rem]">
          Latest
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-3 max-w-xl text-[0.9375rem] text-muted-foreground">
          Fresh signal only — launches, releases, and pricing after verification.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="glass mt-8 flex flex-wrap items-end gap-4 rounded-3xl px-5 py-5"
        >
          <div>
            <label className="mb-1.5 block text-[0.75rem] text-muted-foreground">Kind</label>
            <input
              className={field}
              placeholder="e.g. release"
              value={search.kind ?? ""}
              onChange={(e) =>
                navigate({
                  search: (prev) => ({
                    ...prev,
                    kind: e.target.value || undefined,
                  }),
                  replace: true,
                })
              }
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[0.75rem] text-muted-foreground">Since</label>
            <input
              className={field}
              type="date"
              value={search.since ?? ""}
              onChange={(e) =>
                navigate({
                  search: (prev) => ({
                    ...prev,
                    since: e.target.value || undefined,
                  }),
                  replace: true,
                })
              }
            />
          </div>
          {(search.kind || search.since) && (
            <button
              type="button"
              className="text-[0.8125rem] text-primary"
              onClick={() => navigate({ search: {}, replace: true })}
            >
              Clear filters
            </button>
          )}
        </motion.div>

        {isLoading ? (
          <motion.p variants={fadeUp} className="mt-12 text-[0.875rem] text-muted-foreground">
            Loading…
          </motion.p>
        ) : isError ? (
          <motion.div variants={fadeUp} className="glass mt-12 rounded-3xl px-6 py-12 text-center">
            <p className="text-muted-foreground">
              Couldn’t load news{error instanceof Error ? `: ${error.message}` : "."}
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
            No published updates{search.kind || search.since ? " matching filters" : ""} yet.
          </motion.p>
        ) : (
          <motion.ol variants={staggerChildren} className="mt-12">
            {news.map((n) => (
              <motion.li
                key={n.id}
                variants={fadeUp}
                className="glass mb-3 grid gap-3 rounded-3xl px-5 py-6 md:grid-cols-[140px_minmax(0,1fr)]"
              >
                <div className="text-[0.8125rem] text-muted-foreground">
                  <div>{n.published_at}</div>
                  <div className="mt-1 text-primary">{n.kind}</div>
                </div>
                <div>
                  {n.slug ? (
                    <Link to="/latest/$slug" params={{ slug: n.slug }}>
                      <h2 className="type-title text-[1.5rem] tracking-[-0.02em] transition-apple hover:text-primary md:text-[1.75rem]">
                        {n.title}
                      </h2>
                    </Link>
                  ) : (
                    <h2 className="type-title text-[1.5rem] tracking-[-0.02em] md:text-[1.75rem]">
                      {n.title}
                    </h2>
                  )}
                  <p className="type-body mt-2 text-[0.9375rem] text-foreground/85">{n.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[0.8125rem]">
                    {n.slug ? (
                      <Link
                        to="/latest/$slug"
                        params={{ slug: n.slug }}
                        className="text-primary transition-apple hover:opacity-70"
                      >
                        Read more
                      </Link>
                    ) : null}
                    {n.solution_slug && (
                      <Link
                        to="/tools/$slug"
                        params={{ slug: n.solution_slug }}
                        className="text-primary transition-apple hover:opacity-70"
                      >
                        View tool
                      </Link>
                    )}
                    <a
                      href={n.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted-foreground transition-apple hover:text-foreground"
                    >
                      Source
                    </a>
                  </div>
                </div>
              </motion.li>
            ))}
          </motion.ol>
        )}
      </motion.div>
    </SiteShell>
  );
}
