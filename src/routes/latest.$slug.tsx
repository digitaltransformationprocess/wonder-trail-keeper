import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import { Suspense } from "react";
import { SiteShell } from "@/components/SiteShell";
import { newsBySlugQuery } from "@/lib/news";
import { fadeUp, staggerChildren } from "@/lib/motion";

export const Route = createFileRoute("/latest/$slug")({
  loader: async ({ context, params }) => {
    try {
      await context.queryClient.ensureQueryData(newsBySlugQuery(params.slug));
    } catch (error) {
      if (error instanceof Error && error.message === "NOT_FOUND") throw notFound();
      throw error;
    }
  },
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Latest | AI Discovery` },
      { name: "description", content: "Verified AI news and catalog updates." },
    ],
  }),
  notFoundComponent: () => (
    <SiteShell>
      <p className="text-muted-foreground">
        Update not found.{" "}
        <Link to="/latest" className="text-primary">
          Back to Latest
        </Link>
      </p>
    </SiteShell>
  ),
  component: NewsDetailPage,
});

function NewsDetailPage() {
  return (
    <SiteShell>
      <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
        <NewsDetail />
      </Suspense>
    </SiteShell>
  );
}

function NewsDetail() {
  const { slug } = Route.useParams();
  const { data: item } = useSuspenseQuery(newsBySlugQuery(slug));
  const reduce = useReducedMotion();

  return (
    <motion.article initial={reduce ? false : "hidden"} animate="show" variants={staggerChildren}>
      <motion.p variants={fadeUp} className="text-[0.8125rem] text-muted-foreground">
        <Link to="/latest" className="hover:text-primary">
          Latest
        </Link>
        {" · "}
        {item.published_at} · {item.kind}
      </motion.p>
      <motion.h1
        variants={fadeUp}
        className="type-display text-clarity mt-3 text-[2.5rem] md:text-[3.25rem]"
      >
        {item.title}
      </motion.h1>
      <motion.p variants={fadeUp} className="type-body mt-4 max-w-2xl text-[1rem] text-foreground/90">
        {item.summary}
      </motion.p>
      {item.body ? (
        <motion.div
          variants={fadeUp}
          className="glass type-body mt-8 rounded-3xl px-6 py-8 text-[0.9375rem] leading-relaxed whitespace-pre-wrap"
        >
          {item.body}
        </motion.div>
      ) : null}
      <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[0.8125rem]">
        {item.solution_slug ? (
          <Link
            to="/tools/$slug"
            params={{ slug: item.solution_slug }}
            className="text-primary transition-apple hover:opacity-70"
          >
            View tool
          </Link>
        ) : null}
        <a
          href={item.source_url}
          target="_blank"
          rel="noreferrer"
          className="text-muted-foreground transition-apple hover:text-foreground"
        >
          Source
        </a>
      </motion.div>
    </motion.article>
  );
}
