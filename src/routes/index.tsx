import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { z } from "zod";
import { AICoreSceneLazy, useIsDesktopHero } from "@/components/AICoreSceneLazy";
import { SiteShell, SolutionCard } from "@/components/SiteShell";
import { discover, discoverSmart, discoverViaFts, extractConstraints } from "@/lib/discover";
import { fadeUp, springSoft, staggerChildren } from "@/lib/motion";
import { solutionsQuery } from "@/lib/solutions";

export const Route = createFileRoute("/")({
  validateSearch: z.object({ q: z.string().optional() }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(solutionsQuery);
  },
  head: () => ({
    meta: [
      { title: "AI Discovery — Find the right AI solution for your needs" },
      {
        name: "description",
        content:
          "Describe what you want to accomplish and find verified AI solutions with clear explanations and comparisons.",
      },
    ],
  }),
  component: Discover,
});

const EXAMPLES = [
  { label: "AI Writing", q: "AI writing assistant" },
  { label: "AI Video", q: "Create short product videos from photos" },
  { label: "AI Agents", q: "AI agents automation" },
];

function Discover() {
  const { q } = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const [value, setValue] = useState(q ?? "");
  const reduce = useReducedMotion();
  const isDesktop = useIsDesktopHero();
  const { data: solutions = [], isLoading, isError, error, refetch } = useQuery(solutionsQuery);
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

  return (
    <SiteShell flush>
      <section className="relative min-h-0 overflow-hidden px-5 pb-14 pt-8 md:min-h-[calc(100svh-4.5rem)] md:px-8 md:pb-20 md:pt-10">
        {isDesktop === true ? (
          <div className="pointer-events-none absolute inset-0 z-0">
            <AICoreSceneLazy compact={false} onCategorySelect={go} />
          </div>
        ) : null}
        <div className="relative z-10 mx-auto grid max-w-6xl items-center">
          <motion.div
            className="relative z-10 max-w-xl"
            initial={reduce ? false : "hidden"}
            animate="show"
            variants={staggerChildren}
          >
            <motion.div
              variants={fadeUp}
              className="mb-5 flex items-center gap-2.5 text-[0.58rem] font-medium tracking-[0.14em] text-white/45 sm:mb-7 sm:text-[0.625rem] sm:tracking-[0.22em]"
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/70" />
              YOUR GATEWAY TO ARTIFICIAL INTELLIGENCE
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="type-display text-[2.35rem] leading-[1.05] text-white sm:text-[clamp(2.6rem,5vw,4.4rem)]"
            >
              Discover the right
              <br />
              <span className="text-clarity">AI solution</span>
              <br />
              for anything.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-md text-[0.95rem] leading-8 text-white/50"
            >
              Explore, compare and find AI tools, models and agents that help you turn ideas into
              reality.
            </motion.p>

            <motion.form
              variants={fadeUp}
              className="search-box mt-8"
              onSubmit={(e) => {
                e.preventDefault();
                if (value.trim()) go(value.trim());
              }}
            >
              <Search className="h-5 w-5 shrink-0 text-white/55" strokeWidth={1.6} />
              <input
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
              className="mt-4 flex flex-wrap items-center gap-3 text-[0.7rem] text-white/35"
            >
              <span>Popular:</span>
              {EXAMPLES.map((e) => (
                <button
                  key={e.label}
                  type="button"
                  onClick={() => go(e.q)}
                  className="text-white/55 transition-apple hover:text-white"
                >
                  {e.label}
                </button>
              ))}
            </motion.div>

            {isDesktop === false ? (
              <div className="relative mx-auto mt-8 h-[280px] w-full max-w-md">
                <AICoreSceneLazy compact onCategorySelect={go} />
              </div>
            ) : null}

            <motion.div
              variants={fadeUp}
              className="mt-8 grid grid-cols-3 gap-3 border-t border-white/10 pt-5 sm:mt-12 sm:flex sm:gap-8 sm:pt-6"
            >
              {[
                ["Discover", "Explore AI solutions"],
                ["Compare", "Find the right fit"],
                ["Stay updated", "Follow AI evolution"],
              ].map(([title, body]) => (
                <div key={title} className="flex flex-col gap-1.5">
                  <strong className="text-[0.75rem] font-semibold text-white/85">{title}</strong>
                  <span className="text-[0.625rem] text-white/40">{body}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <div className="mx-auto mt-16 max-w-6xl border-t border-white/[0.06] pt-10 text-center">
          <p className="text-[0.625rem] tracking-[0.28em] text-white/40">
            ONE PLACE. THE ENTIRE AI ECOSYSTEM.
          </p>
          <h2 className="type-display mt-3 text-[1.75rem] text-white md:text-[2rem]">
            Everything AI, connected.
          </h2>
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
    </SiteShell>
  );
}
