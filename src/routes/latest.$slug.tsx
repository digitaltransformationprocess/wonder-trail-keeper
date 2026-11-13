import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import { Suspense } from "react";
import { BlogContent } from "@/components/BlogContent";
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
  head: ({ loaderData: _ld, params }) => ({
    meta: [
      { title: `${params.slug} — Latest | AI Discov` },
      { name: "description", content: "AI product update, release, or version deep-dive." },
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
    <motion.article
      initial={reduce ? false : "hidden"}
      animate="show"
      variants={staggerChildren}
      className="mx-auto max-w-3xl"
    >
      <motion.p variants={fadeUp} className="text-[0.8125rem] text-muted-foreground">
        <Link to="/latest" className="hover:text-primary">
          Latest
        </Link>
        {" · "}
        <span className="text-foreground/80">{kindLabel(item.kind)}</span>
      </motion.p>

      <motion.h1
        variants={fadeUp}
        className="type-display text-clarity mt-4 text-[2.35rem] leading-[1.1] md:text-[3.1rem]"
      >
        {item.title}
      </motion.h1>

      <motion.p variants={fadeUp} className="mt-4 text-[0.875rem] text-muted-foreground">
        Updated on{" "}
        {new Date(item.published_at).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </motion.p>

      <motion.p
        variants={fadeUp}
        className="type-body mt-8 border-l-2 border-signal/40 pl-5 text-[1.125rem] leading-8 text-foreground/90"
      >
        {item.summary}
      </motion.p>

      {item.body ? (
        <motion.div variants={fadeUp} className="mt-10">
          <BlogContent content={item.body} />
        </motion.div>
      ) : null}

      <motion.div
        variants={fadeUp}
        className="mt-12 flex flex-wrap items-center gap-3 border-t hairline pt-8"
      >
        {item.solution_slug ? (
          <Link
            to="/tools/$slug"
            params={{ slug: item.solution_slug }}
            className="rounded-full bg-primary px-5 py-2.5 text-[0.875rem] font-medium text-primary-foreground transition-apple hover:brightness-110"
          >
            Open{" "}
            {item.solution_slug
              .split("-")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ")}
          </Link>
        ) : null}
        <a
          href={item.source_url}
          target="_blank"
          rel="noreferrer"
          className="rounded-full glass px-5 py-2.5 text-[0.875rem] text-muted-foreground transition-apple hover:text-foreground"
        >
          Original source
        </a>
        <Link
          to="/latest"
          className="rounded-full px-5 py-2.5 text-[0.875rem] text-muted-foreground transition-apple hover:text-foreground"
        >
          More updates
        </Link>
      </motion.div>
    </motion.article>
  );
}
