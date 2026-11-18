import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Suspense } from "react";
import { BlogContent } from "@/components/BlogContent";
import { CompanyMark } from "@/components/CompanyMark";
import { SiteShell } from "@/components/SiteShell";
import { LATEST_KIND_LABELS, type LatestAdvanceKind } from "@/lib/latest";
import { newsBySlugQuery } from "@/lib/news";
import { fadeUp, staggerChildren } from "@/lib/motion";
import { mergeHead, pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/latest/$slug")({
  loader: async ({ context, params }) => {
    try {
      const item = await context.queryClient.ensureQueryData(newsBySlugQuery(params.slug));
      return { item };
    } catch (error) {
      if (error instanceof Error && error.message === "NOT_FOUND") throw notFound();
      throw error;
    }
  },
  head: ({ loaderData, params }) => {
    const item = loaderData?.item;
    if (!item) return {};
    const title = `${item.title} | AI Discov Latest`;
    const description = item.summary;

    return mergeHead(
      {
        meta: [
          { title },
          { name: "description", content: description },
          { property: "og:title", content: title },
          { property: "og:description", content: description },
          { name: "twitter:card", content: "summary_large_image" },
          { name: "twitter:title", content: title },
          { name: "twitter:description", content: description },
        ],
      },
      pageSeo({
        path: `/latest/${params.slug}`,
        ogType: "article",
        jsonLd: [
          articleJsonLd({
            title: item.title,
            description,
            path: `/latest/${params.slug}`,
            publishedAt: item.published_at,
            sourceUrl: item.source_url,
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Latest", path: "/latest" },
            { name: item.title, path: `/latest/${params.slug}` },
          ]),
        ],
      }),
    );
  },
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
  if (kind in LATEST_KIND_LABELS) {
    return LATEST_KIND_LABELS[kind as LatestAdvanceKind];
  }
  return kind;
}

function toolLabel(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
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
      className="relative mx-auto max-w-3xl"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-8 -top-10 h-56 rounded-[2rem] bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--signal)_18%,transparent),transparent_70%)]"
      />

      <motion.nav
        variants={fadeUp}
        className="relative flex flex-wrap items-center gap-2 text-[0.8125rem] text-muted-foreground"
        aria-label="Breadcrumb"
      >
        <Link to="/latest" className="transition-apple hover:text-primary">
          Latest
        </Link>
        <span aria-hidden>/</span>
        <span className="rounded-full bg-fill px-2.5 py-0.5 text-[0.7rem] font-medium uppercase tracking-[0.08em] text-foreground/80">
          {kindLabel(item.kind)}
        </span>
      </motion.nav>

      <motion.h1
        variants={fadeUp}
        className="type-display text-clarity relative mt-5 text-[clamp(1.9rem,4.5vw,3.15rem)] leading-[1.08] text-balance"
      >
        {item.title}
      </motion.h1>

      <motion.div
        variants={fadeUp}
        className="relative mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.875rem] text-muted-foreground"
      >
        {(item.company_logo_url || item.company_name || item.solution_slug) && (
          <span className="inline-flex items-center gap-2">
            <CompanyMark
              name={item.company_name || (item.solution_slug ? toolLabel(item.solution_slug) : null)}
              logoUrl={item.company_logo_url}
              size="sm"
            />
            {item.solution_slug ? (
              <Link
                to="/tools/$slug"
                params={{ slug: item.solution_slug }}
                className="font-medium text-foreground transition-apple hover:text-primary"
              >
                {item.company_name || toolLabel(item.solution_slug)}
              </Link>
            ) : item.company_name ? (
              <span className="font-medium text-foreground">{item.company_name}</span>
            ) : null}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5 opacity-70" aria-hidden />
          <time dateTime={item.published_at}>{formatDate(item.published_at)}</time>
        </span>
        {item.solution_slug ? (
          <Link
            to="/tools/$slug"
            params={{ slug: item.solution_slug }}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[0.75rem] font-medium text-primary transition-apple hover:bg-primary/15"
          >
            Tool · {toolLabel(item.solution_slug)}
          </Link>
        ) : null}
      </motion.div>

      <motion.p
        variants={fadeUp}
        className="type-body relative mt-8 max-w-[62ch] text-[1.125rem] leading-[1.7] text-pretty text-foreground/90 md:text-[1.2rem]"
      >
        {item.summary}
      </motion.p>

      {item.body ? (
        <motion.div variants={fadeUp} className="relative mt-10 max-w-[62ch]">
          <BlogContent content={item.body} variant="advance" />
        </motion.div>
      ) : null}

      <motion.div
        variants={fadeUp}
        className="relative mt-12 flex flex-wrap items-center gap-3 border-t hairline pt-8"
      >
        {item.solution_slug ? (
          <Link
            to="/tools/$slug"
            params={{ slug: item.solution_slug }}
            className="rounded-full bg-primary px-5 py-2.5 text-[0.875rem] font-medium text-primary-foreground transition-apple hover:brightness-110"
          >
            Open {toolLabel(item.solution_slug)}
          </Link>
        ) : null}
        <a
          href={item.source_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full glass px-5 py-2.5 text-[0.875rem] text-muted-foreground transition-apple hover:text-foreground"
        >
          Original source
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
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
