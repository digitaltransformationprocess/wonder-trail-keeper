import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import { SiteShell } from "@/components/SiteShell";
import { solutionsBySlugsQuery, type Solution } from "@/lib/solutions";
import { useCompare } from "@/lib/store";
import { fadeUp, staggerChildren } from "@/lib/motion";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare — AI solution comparison | AI Discovery" },
      {
        name: "description",
        content: "Compare up to 4 AI solutions by pricing, API access, platforms, and limitations.",
      },
    ],
  }),
  component: Compare,
});

const ROWS: [string, (s: Solution) => string][] = [
  ["Type", (s) => s.type],
  ["Publisher", (s) => s.publisher],
  ["Pricing model", (s) => s.pricingModel],
  ["Price", (s) => s.price],
  ["Platforms", (s) => s.platforms.join(", ") || "To verify"],
  ["API", (s) => (s.api ? "Yes" : "Not disclosed")],
  ["Open source", (s) => (s.openSource ? "Yes" : "No")],
  ["Local", (s) => (s.local ? "Yes" : "No")],
  ["Strengths", (s) => s.strengths.join(" · ") || "To verify"],
  ["Limitations", (s) => s.limits.join(" · ") || "To verify"],
  ["Verified on", (s) => s.verifiedAt],
];

function Compare() {
  const { list, toggle } = useCompare();
  const { data: items = [], isLoading, isError, error, refetch } = useQuery(
    solutionsBySlugsQuery(list),
  );
  const reduce = useReducedMotion();

  return (
    <SiteShell>
      <motion.div initial={reduce ? false : "hidden"} animate="show" variants={staggerChildren}>
        <motion.h1 variants={fadeUp} className="type-display text-clarity text-[2.5rem] md:text-[3.25rem]">
          Compare
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-3 max-w-xl text-[0.9375rem] text-muted-foreground">
          Side-by-side criteria — missing data stays missing.
        </motion.p>

        {list.length === 0 ? (
          <motion.p variants={fadeUp} className="mt-12 text-[0.9375rem] text-muted-foreground">
            Add up to 4 solutions from{" "}
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
          <motion.div variants={fadeUp} className="glass mt-10 overflow-x-auto rounded-3xl">
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
                      const muted =
                        v.includes("verify") ||
                        v.includes("Not disclosed") ||
                        v.includes("To verify") ||
                        v.includes("Not verified");
                      return (
                        <td
                          key={s.slug}
                          className={`p-4 align-top ${muted ? "italic text-muted-foreground" : ""}`}
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
        )}
      </motion.div>
    </SiteShell>
  );
}
