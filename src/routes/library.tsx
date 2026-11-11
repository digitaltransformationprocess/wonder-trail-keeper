import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import { SiteShell, SolutionCard } from "@/components/SiteShell";
import { solutionsBySlugsQuery } from "@/lib/solutions";
import { useFavorites } from "@/lib/store";
import { fadeUp, springSoft, staggerChildren } from "@/lib/motion";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "My Library — Your saved AI solutions | AI Discovery" },
      { name: "description", content: "Find the AI solutions you have saved." },
    ],
  }),
  component: Library,
});

function Library() {
  const { list } = useFavorites();
  const { data: items = [], isLoading, isError, error, refetch } = useQuery(
    solutionsBySlugsQuery(list),
  );
  const reduce = useReducedMotion();

  return (
    <SiteShell>
      <motion.div initial={reduce ? false : "hidden"} animate="show" variants={staggerChildren}>
        <motion.h1 variants={fadeUp} className="type-display text-clarity text-[2.5rem] md:text-[3.25rem]">
          Library
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-3 max-w-xl text-[0.9375rem] text-muted-foreground">
          Your kept signals — saved on this device, no account required.
        </motion.p>

        {list.length === 0 ? (
          <motion.div variants={fadeUp} className="glass mt-14 max-w-md rounded-3xl p-8">
            <p className="text-[1.0625rem] text-foreground/90">Nothing saved yet.</p>
            <Link
              to="/explore"
              className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-[0.875rem] font-medium text-primary-foreground transition-apple hover:brightness-110"
            >
              Explore the catalog
            </Link>
          </motion.div>
        ) : isLoading ? (
          <motion.p variants={fadeUp} className="mt-12 text-muted-foreground">
            Loading library…
          </motion.p>
        ) : isError ? (
          <motion.div variants={fadeUp} className="glass mt-12 max-w-md rounded-3xl p-8">
            <p className="text-muted-foreground">
              Couldn’t load saved solutions{error instanceof Error ? `: ${error.message}` : "."}
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
          <motion.div variants={fadeUp} className="glass mt-14 max-w-md rounded-3xl p-8">
            <p className="text-[1.0625rem] text-foreground/90">
              Saved items are no longer published in the catalog.
            </p>
            <Link
              to="/explore"
              className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-[0.875rem] font-medium text-primary-foreground transition-apple hover:brightness-110"
            >
              Explore the catalog
            </Link>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerChildren}
            className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {items.map((s) => (
              <motion.div key={s.slug} variants={fadeUp} transition={springSoft}>
                <SolutionCard s={s} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </SiteShell>
  );
}
