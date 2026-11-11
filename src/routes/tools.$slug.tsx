import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import { Suspense } from "react";
import { SiteShell, SolutionCard } from "@/components/SiteShell";
import { solutionQuery } from "@/lib/solutions";
import { useCompare, useFavorites } from "@/lib/store";
import { fadeUp, springSoft, staggerChildren } from "@/lib/motion";

export const Route = createFileRoute("/tools/$slug")({
  loader: async ({ context, params }) => {
    try {
      return await context.queryClient.ensureQueryData(solutionQuery(params.slug));
    } catch (error) {
      if (error instanceof Error && error.message === "NOT_FOUND") throw notFound();
      throw error;
    }
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          {
            title: `${loaderData.solution.name} — overview, pricing, and alternatives | AI Discovery`,
          },
          { name: "description", content: loaderData.solution.summary },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <SiteShell>
      <p className="text-muted-foreground">
        Solution not found.{" "}
        <Link to="/explore" className="text-primary">
          Back to the catalog
        </Link>
      </p>
    </SiteShell>
  ),
  component: DetailPage,
});

function DetailPage() {
  return (
    <SiteShell>
      <Suspense fallback={<p className="text-muted-foreground">Loading solution…</p>}>
        <Detail />
      </Suspense>
    </SiteShell>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b hairline py-4 text-[0.9375rem] sm:grid-cols-3 sm:gap-6">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="sm:col-span-2">{v}</dd>
    </div>
  );
}

function Detail() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(solutionQuery(slug));
  const s = data.solution;
  const alts = data.alternatives;
  const fav = useFavorites();
  const cmp = useCompare();
  const reduce = useReducedMotion();

  return (
    <motion.div initial={reduce ? false : "hidden"} animate="show" variants={staggerChildren}>
      <motion.p variants={fadeUp} className="text-[0.8125rem] text-muted-foreground">
        {s.type} · {s.categories.join(" · ")}
      </motion.p>
      <motion.h1
        variants={fadeUp}
        className="type-display text-clarity mt-3 text-[3rem] md:text-[4.5rem]"
      >
        {s.name}
      </motion.h1>
      <motion.p variants={fadeUp} className="mt-2 text-[1rem] text-muted-foreground">
        by {s.publisher}
      </motion.p>
      <motion.p
        variants={fadeUp}
        className="type-body mt-6 max-w-2xl text-[1.125rem] text-foreground/90"
      >
        {s.description}
      </motion.p>

      <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
        <a
          href={s.url}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-primary px-5 py-2.5 text-[0.875rem] font-medium text-primary-foreground transition-apple hover:brightness-110"
        >
          Official website
        </a>
        <button
          type="button"
          onClick={() => fav.toggle(s.slug)}
          className="glass rounded-full px-5 py-2.5 text-[0.875rem] transition-apple hover:brightness-105"
        >
          {fav.has(s.slug) ? "In Library" : "Add to Library"}
        </button>
        <button
          type="button"
          onClick={() => cmp.toggle(s.slug)}
          className="glass rounded-full px-5 py-2.5 text-[0.875rem] transition-apple hover:brightness-105"
        >
          {cmp.has(s.slug) ? "Remove from Compare" : "Compare"}
        </button>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="mt-14 grid gap-8 md:grid-cols-[minmax(0,1fr)_280px]"
      >
        <dl className="glass rounded-3xl px-5 md:px-6">
          <Row k="Pricing model" v={s.pricingModel} />
          <Row k="Price" v={s.price} />
          <Row k="Platforms" v={s.platforms.join(", ") || "To verify"} />
          <Row k="API" v={s.api ? "Yes" : "Not disclosed"} />
          <Row k="Open source" v={s.openSource ? "Yes" : "No"} />
          <Row k="Local execution" v={s.local ? "Possible" : "Cloud only"} />
          <Row k="Audience" v={s.audience.join(", ") || "To verify"} />
          <Row
            k="Strengths"
            v={
              s.strengths.length ? (
                <ul className="space-y-1">
                  {s.strengths.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              ) : (
                "To verify"
              )
            }
          />
          <Row
            k="Limitations"
            v={
              s.limits.length ? (
                <ul className="space-y-1">
                  {s.limits.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              ) : (
                "To verify"
              )
            }
          />
        </dl>

        <aside className="glass h-fit rounded-3xl p-6">
          <h2 className="type-title text-[1.125rem]">Verification</h2>
          <p className="mt-3 text-[0.875rem] text-muted-foreground">
            {s.status === "Verified" ? "Verified" : "To verify"} — last checked {s.verifiedAt}
          </p>
          <h3 className="mt-6 text-[0.8125rem] font-medium text-foreground">Sources</h3>
          {s.sources.length === 0 ? (
            <p className="mt-2 text-[0.8125rem] italic text-muted-foreground">No source linked yet.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {s.sources.map((u) => (
                <li key={u}>
                  <a
                    className="break-all text-[0.8125rem] text-primary transition-apple hover:opacity-70"
                    href={u}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {u}
                  </a>
                </li>
              ))}
            </ul>
          )}
          <a
            className="mt-6 inline-block text-[0.75rem] text-muted-foreground underline-offset-2 hover:underline"
            href={`mailto:corrections@aidiscovery.app?subject=Error in ${encodeURIComponent(s.name)}`}
          >
            Report an error
          </a>
        </aside>
      </motion.div>

      {alts.length > 0 && (
        <>
          <motion.h2 variants={fadeUp} className="type-title mt-16 text-[1.75rem]">
            Alternatives
          </motion.h2>
          <motion.div variants={staggerChildren} className="mt-5 grid gap-4 md:grid-cols-3">
            {alts.map((a) => (
              <motion.div key={a.slug} variants={fadeUp} transition={springSoft}>
                <SolutionCard s={a} />
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
