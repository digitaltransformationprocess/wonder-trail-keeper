import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Code2,
  Columns2,
  ImageIcon,
  LayoutGrid,
  Music2,
  PenLine,
  Search,
  Sparkles,
  Video,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@ui-sdk/react/button";
import { motion, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import { z } from "zod";
import { SiteShell, SolutionCard } from "@/components/SiteShell";
import { discover, discoverSmart, discoverViaFts, extractConstraints } from "@/lib/discover";
import { fadeUp, springSoft, staggerChildren } from "@/lib/motion";
import { mergeHead, pageSeo } from "@/lib/seo";
import {
  categoriesQuery,
  filterSolutions,
  homeTopToolsByCategoryQuery,
  solutionsQuery,
  type Solution,
  type TaxonomyItem,
} from "@/lib/solutions";

const EXAMPLES = [
  { label: "AI Writing", q: "AI writing assistant" },
  { label: "AI Video", q: "Create short product videos from photos" },
  { label: "AI Agents", q: "AI agents automation" },
];

/** Curated home “top” categories (Aixploria-style), not the full taxonomy. */
const HOME_TOP_CATEGORY_SLUGS = [
  "ai-assistants",
  "writing-content",
  "image-generation",
  "video-generation",
  "coding-development",
  "automation-agents",
  "audio-music",
  "productivity",
] as const;

const TOOLS_PER_CATEGORY = 10;

export const Route = createFileRoute("/")({
  validateSearch: z.object({ q: z.string().optional() }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(solutionsQuery),
      context.queryClient.ensureQueryData(categoriesQuery),
      context.queryClient.ensureQueryData(
        homeTopToolsByCategoryQuery([...HOME_TOP_CATEGORY_SLUGS], TOOLS_PER_CATEGORY),
      ),
    ]);
  },
  head: () =>
    mergeHead(
      {
        meta: [
          { title: "AI Discov — Find the right AI solution for your needs" },
          {
            name: "description",
            content:
              "Describe what you want to accomplish and find verified AI solutions with clear explanations and comparisons.",
          },
        ],
      },
      pageSeo({ path: "/" }),
    ),
  component: Discover,
});

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "ai-assistants": Bot,
  "writing-content": PenLine,
  "image-generation": ImageIcon,
  "video-generation": Video,
  "coding-development": Code2,
  "automation-agents": Workflow,
  "audio-music": Music2,
  productivity: Sparkles,
};

function toolsInCategory(solutions: Solution[], slug: string): Solution[] {
  return filterSolutions(solutions, { cat: slug });
}

function orderToolsBySlugs(solutions: Solution[], orderedSlugs: string[]): Solution[] {
  const bySlug = new Map(solutions.map((s) => [s.slug, s]));
  const ordered: Solution[] = [];
  for (const slug of orderedSlugs) {
    const s = bySlug.get(slug);
    if (s) ordered.push(s);
  }
  if (ordered.length >= TOOLS_PER_CATEGORY) return ordered.slice(0, TOOLS_PER_CATEGORY);
  // Fallback fill if RPC misses some published tools
  for (const s of solutions) {
    if (ordered.length >= TOOLS_PER_CATEGORY) break;
    if (!ordered.some((x) => x.slug === s.slug)) ordered.push(s);
  }
  return ordered;
}

function CategoryTopCard({
  category,
  tools,
  total,
}: {
  category: TaxonomyItem;
  tools: Solution[];
  total: number;
}) {
  const Icon = CATEGORY_ICONS[category.slug] ?? Sparkles;

  return (
    <article className="glass group/card flex h-full flex-col overflow-hidden rounded-[1.35rem] p-5 md:p-6">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-fill/80 ring-1 ring-black/5 dark:ring-white/10">
            <Icon className="h-4 w-4 text-foreground/85" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0 pt-0.5">
            <p className="text-[0.625rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Top 10
            </p>
            <h3 className="type-title mt-1 text-[1.05rem] leading-tight tracking-[-0.02em] text-foreground">
              {category.name}
            </h3>
          </div>
        </div>
        <span className="mt-1 shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-medium tabular-nums text-primary">
          {total}
        </span>
      </header>

      <div className="mt-4 flex items-center gap-2" aria-hidden>
        <span className="h-0.5 w-8 rounded-full bg-primary/70" />
        <span className="h-px flex-1 bg-gradient-to-r from-foreground/15 to-transparent" />
      </div>

      <ol className="mt-2 flex-1">
        {tools.map((s, idx) => {
          const rank = String(idx + 1).padStart(2, "0");
          const external = s.url ? (
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${s.name} website`}
              className="shrink-0 rounded-lg p-1 text-muted-foreground opacity-0 transition-apple group-hover/row:opacity-100 hover:bg-fill hover:text-foreground focus-visible:opacity-100"
            >
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </a>
          ) : (
            <Link
              to="/tools/$slug"
              params={{ slug: s.slug }}
              aria-label={`Open ${s.name}`}
              className="shrink-0 rounded-lg p-1 text-muted-foreground opacity-0 transition-apple group-hover/row:opacity-100 hover:bg-fill hover:text-foreground focus-visible:opacity-100"
            >
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </Link>
          );

          return (
            <li key={s.slug}>
              <div className="group/row -mx-2 flex items-center gap-2 rounded-xl px-2 py-2 transition-apple hover:bg-fill/55">
                <span className="w-6 shrink-0 font-mono text-[0.7rem] tabular-nums text-muted-foreground/80">
                  {rank}
                </span>
                <Link
                  to="/tools/$slug"
                  params={{ slug: s.slug }}
                  className="flex min-w-0 flex-1 items-center gap-2.5"
                >
                  {s.logoUrl ? (
                    <img
                      src={s.logoUrl}
                      alt=""
                      className="h-6 w-6 shrink-0 rounded-lg object-cover ring-1 ring-black/5 dark:ring-white/10"
                      loading="lazy"
                    />
                  ) : (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-fill text-[0.65rem] font-medium text-muted-foreground ring-1 ring-black/5 dark:ring-white/10">
                      {s.name.charAt(0)}
                    </span>
                  )}
                  <span className="truncate text-[0.875rem] font-medium text-foreground transition-apple group-hover/row:text-primary">
                    {s.name}
                  </span>
                </Link>
                {external}
              </div>
            </li>
          );
        })}
      </ol>

      <Link
        to="/categories/$slug"
        params={{ slug: category.slug }}
        className="mt-3 flex items-center justify-between gap-2 rounded-xl border hairline bg-background/40 px-3.5 py-2.5 text-[0.8125rem] font-medium text-foreground transition-apple hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
      >
        <span>Browse all in {category.name.split("&")[0]?.trim() ?? category.name}</span>
        <span className="tabular-nums text-muted-foreground">
          {total}
          <span className="ml-1 inline-block transition-transform group-hover/card:translate-x-0.5">
            →
          </span>
        </span>
      </Link>
    </article>
  );
}

function HomeCategorySections({
  categories,
  solutions,
  reduce,
}: {
  categories: TaxonomyItem[];
  solutions: Solution[];
  reduce: boolean | null;
}) {
  const categorySlugs = [...HOME_TOP_CATEGORY_SLUGS];
  const { data: topByCategory } = useQuery(
    homeTopToolsByCategoryQuery(categorySlugs, TOOLS_PER_CATEGORY),
  );

  const bySlug = new Map(categories.map((c) => [c.slug, c]));
  const sections = HOME_TOP_CATEGORY_SLUGS.map((slug) => {
    const meta = bySlug.get(slug);
    if (!meta) return null;
    const all = toolsInCategory(solutions, slug);
    if (all.length === 0) return null;
    const rankedSlugs = topByCategory?.get(slug) ?? [];
    const tools = rankedSlugs.length
      ? orderToolsBySlugs(all, rankedSlugs)
      : all.slice(0, TOOLS_PER_CATEGORY);
    return { ...meta, tools, total: all.length };
  }).filter(Boolean) as Array<TaxonomyItem & { tools: Solution[]; total: number }>;

  if (sections.length === 0) return null;

  return (
      <section id="top-categories" className="relative z-10 mx-auto max-w-6xl scroll-mt-24 px-5 pb-20 md:px-8">
      <div className="mb-8 max-w-2xl">
        <p className="text-[0.625rem] font-medium tracking-[0.22em] text-muted-foreground">
          TOP 10 BY CATEGORY
        </p>
        <h2 className="type-display mt-3 text-[1.75rem] text-foreground md:text-[2rem]">
          Best AI tools by category
        </h2>
      </div>

      <motion.div
        className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
        initial={reduce ? false : "hidden"}
        whileInView={reduce ? undefined : "show"}
        viewport={{ once: true, margin: "-40px" }}
        variants={staggerChildren}
      >
        {sections.map((section) => (
          <motion.div key={section.slug} variants={fadeUp} transition={springSoft}>
            <CategoryTopCard category={section} tools={section.tools} total={section.total} />
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-10 text-center">
        <Link
          to="/explore"
          className="inline-flex rounded-full bg-primary px-5 py-2.5 text-[0.875rem] font-medium text-primary-foreground transition-apple hover:brightness-110"
        >
          Explore full catalog
        </Link>
      </div>
    </section>
  );
}

function Discover() {
  const { q } = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const [value, setValue] = useState(q ?? "");
  const reduce = useReducedMotion();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { data: solutions = [], isLoading, isError, error, refetch } = useQuery(solutionsQuery);
  const { data: categories = [] } = useQuery(categoriesQuery);
  const catalogKey = solutions.map((s) => s.slug).join(",");
  const enabled = Boolean(q) && solutions.length > 0 && !isLoading;

  // Fast path: show catalog matches immediately while Grok answers.
  const ftsQuery = useQuery({
    queryKey: ["discover-fts", q, catalogKey],
    queryFn: async () => {
      const bySlug = new Map(solutions.map((s) => [s.slug, s]));
      try {
        return await discoverViaFts(q!, bySlug);
      } catch {
        return discover(q!, solutions);
      }
    },
    enabled,
    staleTime: 30_000,
  });

  const discoverQuery = useQuery({
    queryKey: ["discover", q, catalogKey],
    queryFn: () => discoverSmart(q!, solutions),
    enabled,
    staleTime: 30_000,
  });

  const matches = discoverQuery.data?.matches?.length
    ? discoverQuery.data.matches
    : (ftsQuery.data ?? []);
  const results = matches.map((m) => ({
    solution: m.solution,
    reasons: m.reasons,
    tradeoffs: m.tradeoffs?.length ? m.tradeoffs : [m.solution.limits[0] ?? "To verify"],
    confidence: m.confidence ?? "medium",
    evidence: m.evidence ?? [],
    source: m.source,
  }));
  const answer = discoverQuery.data?.answer;
  const clarificationNeeded = discoverQuery.data?.clarificationNeeded;
  const clarificationQuestion = discoverQuery.data?.clarificationQuestion;
  const coverageNote = discoverQuery.data?.coverageNote;
  const c = q ? extractConstraints(q) : null;
  const searching = Boolean(q) && isLoading;
  const waitingAi = Boolean(q) && discoverQuery.isLoading && !answer;
  const go = (next: string) => {
    setValue(next);
    navigate({ search: { q: next } });
  };

  const focusSearch = () => {
    searchInputRef.current?.focus();
    searchInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <SiteShell flush>
      <section className="relative min-h-0 overflow-hidden px-5 pb-10 pt-8 md:px-8 md:pb-12 md:pt-10">
        <div className="relative z-10 mx-auto max-w-6xl">
          <motion.div
            className="relative z-10 max-w-2xl"
            initial={reduce ? false : "hidden"}
            animate="show"
            variants={staggerChildren}
          >
            <motion.div
              variants={fadeUp}
              className="mb-5 flex items-center gap-2.5 text-[0.58rem] font-medium tracking-[0.14em] text-muted-foreground sm:mb-7 sm:text-[0.625rem] sm:tracking-[0.22em]"
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-foreground/70" />
              YOUR GATEWAY TO ARTIFICIAL INTELLIGENCE
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="type-display text-[2.35rem] leading-[1.05] text-foreground sm:text-[clamp(2.6rem,5vw,4.4rem)]"
            >
              Discover the right
              <br />
              <span className="text-clarity">AI solution</span>
              <br />
              for anything.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-md text-[0.95rem] leading-8 text-muted-foreground"
            >
              Describe a job, get matched tools with reasons — or jump straight to a Top 10 list.
            </motion.p>

            <motion.form
              variants={fadeUp}
              className="search-box mt-8"
              onSubmit={(e) => {
                e.preventDefault();
                if (value.trim()) go(value.trim());
              }}
            >
              <Search className="h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={1.6} />
              <input
                ref={searchInputRef}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="What do you want to accomplish?"
                aria-label="Describe what you want to accomplish"
              />
              <button type="submit">
                Search <span className="ml-1">→</span>
              </button>
            </motion.form>

            <motion.div
              variants={fadeUp}
              className="mt-4 flex flex-wrap items-center gap-2 text-[0.7rem] text-muted-foreground/80"
            >
              <span className="mr-1">Try:</span>
              {EXAMPLES.map((e) => (
                <Button
                  key={e.label}
                  type="button"
                  onClick={() => go(e.q)}
                  className="rounded-full border hairline bg-fill/40 px-3 py-1 text-[0.7rem] text-muted-foreground transition-apple hover:border-primary/25 hover:bg-primary/5 hover:text-foreground"
                >
                  {e.label}
                </Button>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            className="mt-10 grid gap-3 sm:grid-cols-3"
            initial={reduce ? false : "hidden"}
            animate="show"
            variants={staggerChildren}
          >
            <motion.div variants={fadeUp}>
              <Button
                type="button"
                onClick={focusSearch}
                className="glass group flex h-full w-full flex-col items-start gap-3 rounded-[1.25rem] p-4 text-left transition-apple hover:bg-fill/40 md:p-5"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Search className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </span>
                <span>
                  <span className="block text-[0.9375rem] font-semibold text-foreground">
                    Ask for a match
                  </span>
                  <span className="mt-1 block text-[0.8125rem] leading-5 text-muted-foreground">
                    Describe the job — get ranked tools and why they fit.
                  </span>
                </span>
                <span className="mt-auto inline-flex items-center gap-1 text-[0.75rem] font-medium text-primary">
                  Start typing
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Button>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Button
                type="button"
                className="glass group flex h-full w-full flex-col items-start gap-3 rounded-[1.25rem] p-4 text-left transition-apple hover:bg-fill/40 md:p-5"
                render={<a href="#top-categories" />}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <LayoutGrid className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </span>
                <span>
                  <span className="block text-[0.9375rem] font-semibold text-foreground">
                    Browse Top 10s
                  </span>
                  <span className="mt-1 block text-[0.8125rem] leading-5 text-muted-foreground">
                    Best-known tools by category — pick a list in seconds.
                  </span>
                </span>
                <span className="mt-auto inline-flex items-center gap-1 text-[0.75rem] font-medium text-primary">
                  Jump to lists
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Button>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Button
                type="button"
                className="glass group flex h-full w-full flex-col items-start gap-3 rounded-[1.25rem] p-4 text-left transition-apple hover:bg-fill/40 md:p-5"
                render={<Link to="/compare" />}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Columns2 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </span>
                <span>
                  <span className="block text-[0.9375rem] font-semibold text-foreground">
                    Compare options
                  </span>
                  <span className="mt-1 block text-[0.8125rem] leading-5 text-muted-foreground">
                    Put up to 5 tools side by side on pricing, API, and limits.
                  </span>
                </span>
                <span className="mt-auto inline-flex items-center gap-1 text-[0.75rem] font-medium text-primary">
                  Open compare
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {q && (
        <section className="relative z-10 mx-auto max-w-5xl px-5 pb-20 md:px-8">
          <div className="glass mb-8 rounded-3xl px-5 py-5 md:px-6">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
              <h2 className="type-title text-[1.35rem]">Matched signals</h2>
              <p className="text-[0.875rem] text-muted-foreground">for “{q}”</p>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8125rem]">
              <span className="text-muted-foreground">Requirements</span>
              {c &&
                Object.entries({
                  Free: c.free,
                  "Open source": c.openSource,
                  API: c.api,
                  Local: c.local,
                })
                  .filter(([, v]) => v)
                  .map(([k]) => (
                    <span key={k} className="text-foreground">
                      {k}
                    </span>
                  ))}
              {c && !Object.values(c).some(Boolean) && (
                <span className="text-muted-foreground">none detected</span>
              )}
            </div>
          </div>

          {(answer || waitingAi || clarificationNeeded) && (
            <div className="glass mb-6 rounded-3xl px-5 py-5 md:px-6">
              <p className="text-[0.7rem] tracking-[0.14em] text-muted-foreground">ASSISTANT</p>
              {answer ? (
                <p className="type-body mt-3 text-[1.05rem] leading-7 text-foreground/90">{answer}</p>
              ) : waitingAi ? (
                <p className="mt-3 text-[0.9375rem] text-muted-foreground">
                  Writing a grounded answer from the catalog…
                </p>
              ) : null}
              {clarificationNeeded && clarificationQuestion ? (
                <p className="mt-4 rounded-2xl bg-fill/60 px-4 py-3 text-[0.875rem] text-foreground/85">
                  Clarification: {clarificationQuestion}
                </p>
              ) : null}
              <p className="mt-3 text-[0.75rem] text-muted-foreground">
                {coverageNote ??
                  "Answers use published catalog fields only. Missing data stays “To verify”."}
              </p>
            </div>
          )}

          {searching ? (
            <p className="glass rounded-3xl px-6 py-12 text-center text-muted-foreground">
              Searching the live catalog…
            </p>
          ) : isError ? (
            <div className="glass rounded-3xl px-6 py-12 text-center">
              <p className="text-muted-foreground">
                Couldn’t load the catalog{error instanceof Error ? `: ${error.message}` : "."}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 rounded-full bg-primary px-5 py-2.5 text-[0.875rem] font-medium text-primary-foreground"
              >
                Retry
              </button>
            </div>
          ) : results.length === 0 && !ftsQuery.isLoading ? (
            <p className="glass rounded-3xl px-6 py-12 text-center text-muted-foreground">
              No matching solutions. Try rephrasing or removing a requirement.
            </p>
          ) : results.length === 0 ? (
            <p className="glass rounded-3xl px-6 py-12 text-center text-muted-foreground">
              Searching the live catalog…
            </p>
          ) : (
            <motion.div
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              initial={reduce ? false : "hidden"}
              animate="show"
              variants={staggerChildren}
            >
              {results.map((m) => (
                <motion.div key={m.solution.slug} variants={fadeUp} transition={springSoft}>
                  <SolutionCard s={m.solution}>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-fill px-2 py-0.5 text-[0.65rem] uppercase tracking-wide text-muted-foreground">
                        {m.confidence} confidence
                      </span>
                      {m.source ? (
                        <span className="rounded-full bg-fill px-2 py-0.5 text-[0.65rem] text-muted-foreground">
                          {m.source}
                        </span>
                      ) : null}
                    </div>
                    <ul className="mt-4 space-y-1.5 text-[0.8125rem]">
                      {m.reasons.map((r) => (
                        <li key={r} className="text-primary">
                          {r}
                        </li>
                      ))}
                      {m.tradeoffs.map((t) => (
                        <li key={t} className="text-muted-foreground">
                          Tradeoff: {t}
                        </li>
                      ))}
                      <li className="text-muted-foreground">Price: {m.solution.price}</li>
                      {m.evidence[0] ? (
                        <li className="truncate text-muted-foreground" title={m.evidence[0]}>
                          Evidence: {m.evidence[0].split(":").slice(0, 2).join(" · ")}
                        </li>
                      ) : (
                        <li className="text-muted-foreground">Evidence: To verify</li>
                      )}
                    </ul>
                  </SolutionCard>
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>
      )}

      {!q && !isLoading && !isError ? (
        <HomeCategorySections categories={categories} solutions={solutions} reduce={reduce} />
      ) : null}
    </SiteShell>
  );
}
