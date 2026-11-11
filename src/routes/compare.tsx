import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef } from "react";
import { z } from "zod";
import { SiteShell } from "@/components/SiteShell";
import { fadeUp, staggerChildren } from "@/lib/motion";
import { displayApi, solutionsBySlugsQuery, type Solution } from "@/lib/solutions";
import { setCompareSlugs, useCompare } from "@/lib/store";

export const Route = createFileRoute("/compare")({
  validateSearch: z.object({
    tools: z.string().optional(),
  }),
  head: () => ({
    meta: [
      { title: "Compare — AI solution comparison | AI Discovery" },
      {
        name: "description",
        content: "Compare up to 5 AI solutions by pricing, API access, platforms, and limitations.",
      },
    ],
  }),
  component: Compare,
});

const UNKNOWN_RE = /to verify|not disclosed|not verified|unknown|^—$/i;

const ROWS: [string, (s: Solution) => string][] = [
  ["Type", (s) => s.type],
  ["Publisher", (s) => s.publisher],
  ["Pricing model", (s) => s.pricingModel],
  ["Price", (s) => s.price],
  ["Platforms", (s) => s.platforms.join(", ") || "To verify"],
  ["API", (s) => displayApi(s.apiAvailable)],
  ["Open source", (s) => (s.openSource ? "Yes" : "No")],
  ["License", (s) => s.license?.trim() || "Not disclosed"],
  ["Local", (s) => (s.local ? "Yes" : "No")],
  [
    "Capabilities",
    (s) =>
      s.features
        .map((f) =>
          f.availability === "available" ? f.label : `${f.label} (${f.availability})`,
        )
        .join(" · ") || "To verify",
  ],
  ["Strengths", (s) => s.strengths.join(" · ") || "To verify"],
  ["Limitations", (s) => s.limits.join(" · ") || "To verify"],
  [
    "Sources",
    (s) =>
      s.sources.length
        ? s.sources.map((src) => `${src.reliabilityLevel}:${src.claimKey}`).join(", ")
        : "To verify",
  ],
  ["Verified on", (s) => s.verifiedAt],
];

function isMissing(value: string): boolean {
  return !value.trim() || UNKNOWN_RE.test(value.trim());
}

function parseToolSlugs(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 5);
}

function buildConclusion(items: Solution[]): string {
  if (items.length < 2) return "";

  const scored = items.map((s) => {
    let points = 0;
    const reasons: string[] = [];
    if (s.status === "Verified") {
      points += 2;
      reasons.push("verified");
    }
    if (s.api) {
      points += 1;
      reasons.push("API");
    }
    if (s.openSource) {
      points += 1;
      reasons.push("open source");
    }
    if (s.local) {
      points += 1;
      reasons.push("local");
    }
    if (["Free", "Freemium", "Open source"].includes(s.pricingModel)) {
      points += 1;
      reasons.push(s.pricingModel.toLowerCase());
    }
    if (s.sources.some((src) => src.reliabilityLevel === "A")) {
      points += 1;
      reasons.push("primary sources");
    }
    return { s, points, reasons };
  });

  scored.sort((a, b) => b.points - a.points);
  const best = scored[0]!;
  const runner = scored[1];
  if (!runner || best.points === runner.points) {
    return `No universal winner — these tools trade off different strengths. Pick by the criteria that matter for your use case; cells marked “To verify” or “Not disclosed” are unknowns, not disadvantages.`;
  }

  const why = best.reasons.slice(0, 3).join(", ") || "catalog completeness";
  return `Best fit among this set for documented criteria: ${best.s.name} (${why}). This is not a global ranking — only a contextual read of the fields below.`;
}

function Compare() {
  const { tools: toolsParam } = Route.useSearch();
  const navigate = useNavigate({ from: "/compare" });
  const { list, toggle } = useCompare();
  const { data: items = [], isLoading, isError, error, refetch } = useQuery(
    solutionsBySlugsQuery(list),
  );
  const reduce = useReducedMotion();
  const urlReady = useRef(false);
  const conclusion = useMemo(() => buildConclusion(items), [items]);

  useEffect(() => {
    if (toolsParam) {
      setCompareSlugs(parseToolSlugs(toolsParam));
    }
    urlReady.current = true;
  }, []);

  useEffect(() => {
    if (!urlReady.current) return;
    const next = list.length > 0 ? list.join(",") : undefined;
    const current = toolsParam || undefined;
    if (next === current) return;
    void navigate({
      search: (prev) => ({ ...prev, tools: next }),
      replace: true,
    });
  }, [list, toolsParam, navigate]);

  return (
    <SiteShell>
      <motion.div initial={reduce ? false : "hidden"} animate="show" variants={staggerChildren}>
        <motion.h1 variants={fadeUp} className="type-display text-clarity text-[2.5rem] md:text-[3.25rem]">
          Compare
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-3 max-w-xl text-[0.9375rem] text-muted-foreground">
          Side-by-side criteria for up to 5 solutions — missing data stays missing. Share this URL
          to pass the list along.
        </motion.p>

        {list.length === 0 ? (
          <motion.p variants={fadeUp} className="mt-12 text-[0.9375rem] text-muted-foreground">
            Add up to 5 solutions from{" "}
            <Link to="/explore" className="text-primary transition-apple hover:opacity-70">
              Explore
            </Link>{" "}
            using Compare.
          </motion.p>
        ) : isLoading ? (
          <motion.p variants={fadeUp} className="mt-12 text-muted-foreground">
            Loading comparison…
          </motion.p>
        ) : isError ? (
          <motion.div variants={fadeUp} className="glass mt-12 rounded-3xl px-6 py-10">
            <p className="text-muted-foreground">
              Couldn’t load solutions{error instanceof Error ? `: ${error.message}` : "."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 rounded-full bg-primary px-5 py-2.5 text-[0.875rem] font-medium text-primary-foreground"
            >
              Retry
            </button>
          </motion.div>
        ) : items.length === 0 ? (
          <motion.p variants={fadeUp} className="mt-12 text-muted-foreground">
            Saved items are no longer in the published catalog. Remove them and pick again from
            Explore.
          </motion.p>
        ) : (
          <>
            {conclusion ? (
              <motion.div variants={fadeUp} className="glass mt-8 rounded-3xl px-5 py-5 md:px-6">
                <p className="text-[0.7rem] tracking-[0.14em] text-muted-foreground">
                  CONTEXTUAL READ
                </p>
                <p className="mt-2 text-[0.9375rem] text-foreground/90">{conclusion}</p>
              </motion.div>
            ) : null}

            <motion.div variants={fadeUp} className="glass mt-6 overflow-x-auto rounded-3xl">
              <table className="w-full min-w-[640px] border-collapse text-[0.875rem]">
                <thead className="sticky top-0 glass-nav">
                  <tr>
                    <th className="w-36 p-4 text-left font-medium text-muted-foreground" />
                    {items.map((s) => (
                      <th key={s.slug} className="p-4 text-left align-top">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to="/tools/$slug"
                            params={{ slug: s.slug }}
                            className="type-title text-[1.125rem] transition-apple hover:text-primary"
                          >
                            {s.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => toggle(s.slug)}
                            className="text-[0.75rem] text-muted-foreground transition-apple hover:text-foreground"
                            aria-label={`Remove ${s.name}`}
                          >
                            Remove
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map(([k, f]) => (
                    <tr key={k} className="border-t hairline">
                      <td className="p-4 text-muted-foreground">{k}</td>
                      {items.map((s) => {
                        const v = f(s);
                        const missing = isMissing(v);
                        return (
                          <td
                            key={s.slug}
                            className={`p-4 align-top ${
                              missing
                                ? "rounded-md bg-amber-500/5 italic text-amber-200/80"
                                : ""
                            }`}
                            title={missing ? "Missing or unverified catalog field" : undefined}
                          >
                            {v}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </>
        )}
      </motion.div>
    </SiteShell>
  );
}
