import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, ExternalLink, Search, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { SiteShell } from "@/components/SiteShell";
import { fadeUp, staggerChildren } from "@/lib/motion";
import { mergeHead, pageSeo } from "@/lib/seo";
import {
  TRUNCATED_CATEGORIES,
  truncatedCategoryLabel,
  truncatedMediaUrl,
  truncatedNewsQuery,
  truncatedPermalink,
  truncatedSummary,
  type TruncatedStory,
} from "@/lib/truncated";

export const Route = createFileRoute("/news")({
  validateSearch: z.object({
    q: z.string().optional(),
    category: z.string().optional(),
    page: z.coerce.number().int().min(1).optional(),
  }),
  loaderDeps: ({ search }) => ({
    q: search.q,
    category: search.category,
    page: search.page,
  }),
  loader: async ({ context, deps }) => {
    // Prefetch, but never throw — API blips should show the in-page error UI.
    try {
      await context.queryClient.ensureQueryData(
        truncatedNewsQuery({
          ...(deps.q ? { q: deps.q } : {}),
          ...(deps.category ? { category: deps.category } : {}),
          ...(deps.page ? { page: deps.page } : {}),
        }),
      );
    } catch {
      /* useQuery handles the error state */
    }
  },
  head: () =>
    mergeHead(
      {
        meta: [
          {
            title: "AI News — model launches, agents & tools | AI Discov",
          },
          {
            name: "description",
            content:
              "AI Discov News: concise briefings on AI model releases, agents, developer tools, infrastructure, safety, and policy — updated continuously with links to original publisher articles.",
          },
        ],
      },
      pageSeo({ path: "/news" }),
    ),
  component: NewsPage,
});

function formatRelativeWhen(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  const diffMs = Date.now() - d.getTime();
  const mins = Math.round(diffMs / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;

  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: d.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  });
}

function storyHref(story: TruncatedStory) {
  return story.primary_url || story.canonical_url;
}

function StoryMedia({
  story,
  className,
  priority = false,
  width = 800,
}: {
  story: TruncatedStory;
  className?: string;
  priority?: boolean;
  width?: number;
}) {
  const ownerFallback = story.image?.owner || story.publisher_id;
  const imageUrl = truncatedMediaUrl(story.image, { ownerFallback, width });
  if (!imageUrl) return null;

  const srcSet = [
    `${truncatedMediaUrl(story.image, { ownerFallback, width: 400 })} 400w`,
    `${truncatedMediaUrl(story.image, { ownerFallback, width: 800 })} 800w`,
    `${truncatedMediaUrl(story.image, { ownerFallback, width: 1200 })} 1200w`,
  ].join(", ");

  return (
    <img
      src={imageUrl}
      srcSet={srcSet}
      sizes={
        priority
          ? "(min-width: 768px) 320px, 100vw"
          : "(min-width: 768px) 192px, (min-width: 640px) 160px, 100vw"
      }
      alt={story.image?.alt?.trim() || story.headline}
      width={story.image?.width ?? width}
      height={story.image?.height ?? Math.round(width * 0.625)}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      {...(priority ? { fetchPriority: "high" as const } : {})}
    />
  );
}

function PublisherMeta({ story }: { story: TruncatedStory }) {
  const publishedAt = story.first_published_at || story.published_at;
  const when = formatRelativeWhen(publishedAt);
  const faviconUrl = truncatedMediaUrl(story.favicon, {
    ownerFallback: story.favicon?.owner || story.publisher_id,
    width: 64,
  });

  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.75rem] text-muted-foreground">
      {story.publisher_name ? (
        <span className="inline-flex items-center gap-1.5 font-medium text-foreground/80">
          {faviconUrl ? (
            <img
              src={faviconUrl}
              alt=""
              width={14}
              height={14}
              className="h-3.5 w-3.5 rounded-sm object-contain"
              loading="lazy"
              decoding="async"
            />
          ) : null}
          {story.publisher_name}
        </span>
      ) : null}
      {when && publishedAt ? (
        <>
          <span aria-hidden className="text-muted-foreground/50">
            ·
          </span>
          <time dateTime={publishedAt}>{when}</time>
        </>
      ) : null}
      {story.coverage?.length ? (
        <>
          <span aria-hidden className="text-muted-foreground/50">
            ·
          </span>
          <span>
            +{story.coverage.length}{" "}
            {story.coverage.length === 1 ? "source" : "sources"}
          </span>
        </>
      ) : null}
    </div>
  );
}

function StoryActions({ story }: { story: TruncatedStory }) {
  const href = storyHref(story);
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.8125rem]">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 font-medium text-primary transition-apple hover:opacity-70"
      >
        Read original
        <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />
      </a>
      <a
        href={truncatedPermalink(story.id)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground transition-apple hover:text-foreground"
      >
        Full briefing
      </a>
    </div>
  );
}

function LeadStory({ story }: { story: TruncatedStory }) {
  const categoryId = story.classification?.category_id ?? story.legacy_category;
  const summary = truncatedSummary(story);
  const href = storyHref(story);
  const hasImage = Boolean(story.image?.id);

  return (
    <motion.article
      variants={fadeUp}
      className="glass group overflow-hidden rounded-[1.75rem] transition-apple hover:bg-fill/35"
    >
      <div
        className={`grid gap-0 ${hasImage ? "md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]" : ""}`}
      >
        {hasImage ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="relative block overflow-hidden bg-fill md:min-h-full"
            aria-label={story.headline}
          >
            <StoryMedia
              story={story}
              priority
              width={1200}
              className="aspect-[16/10] w-full object-cover transition-apple duration-500 group-hover:scale-[1.02] md:aspect-auto md:h-full md:min-h-[17rem]"
            />
          </a>
        ) : null}

        <div className="flex flex-col justify-center px-5 py-6 md:px-7 md:py-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-signal/15 px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-signal">
              Top story
            </span>
            <span className="rounded-full bg-fill px-2.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-[0.06em] text-muted-foreground">
              {truncatedCategoryLabel(categoryId)}
            </span>
          </div>

          <PublisherMeta story={story} />

          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block"
          >
            <h2 className="type-title text-[1.45rem] tracking-[-0.03em] text-balance transition-apple group-hover:text-primary md:text-[1.75rem]">
              {story.headline}
            </h2>
            {summary ? (
              <p className="mt-3 line-clamp-4 text-[0.975rem] leading-7 text-muted-foreground md:line-clamp-5">
                {summary}
              </p>
            ) : null}
          </a>

          {story.note?.text ? (
            <p className="mt-4 border-l-2 border-signal/40 pl-3 text-[0.8125rem] leading-6 text-muted-foreground">
              {story.note.text}
            </p>
          ) : null}

          <StoryActions story={story} />
        </div>
      </div>
    </motion.article>
  );
}

function StoryCard({
  story,
  deferPaint,
}: {
  story: TruncatedStory;
  deferPaint?: boolean;
}) {
  const categoryId = story.classification?.category_id ?? story.legacy_category;
  const summary = truncatedSummary(story);
  const href = storyHref(story);
  const hasImage = Boolean(story.image?.id);

  return (
    <motion.li
      variants={fadeUp}
      className={`glass overflow-hidden rounded-3xl transition-apple hover:bg-fill/40 ${
        deferPaint ? "[content-visibility:auto] [contain-intrinsic-size:auto_11rem]" : ""
      }`}
    >
      <div
        className={`flex flex-col gap-0 sm:flex-row sm:items-stretch ${
          hasImage ? "" : "px-5 py-5 md:px-6"
        }`}
      >
        {hasImage ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="block shrink-0 overflow-hidden bg-fill sm:w-40 md:w-48"
            aria-label={story.headline}
          >
            <StoryMedia
              story={story}
              className="aspect-[16/10] h-full w-full object-cover transition-apple group-hover:opacity-90 sm:aspect-auto sm:min-h-[7.5rem]"
            />
          </a>
        ) : null}

        <div
          className={`min-w-0 flex-1 ${hasImage ? "px-5 py-5 md:px-6" : ""}`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-fill px-2.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-[0.06em] text-muted-foreground">
              {truncatedCategoryLabel(categoryId)}
            </span>
          </div>

          <div className="mt-2">
            <PublisherMeta story={story} />
          </div>

          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="group/title mt-2 block"
          >
            <h2 className="type-title text-[1.15rem] tracking-[-0.02em] text-pretty transition-apple group-hover/title:text-primary md:text-[1.28rem]">
              {story.headline}
            </h2>
            {summary ? (
              <p className="mt-2 line-clamp-2 text-[0.9rem] leading-7 text-muted-foreground md:line-clamp-3">
                {summary}
              </p>
            ) : null}
          </a>

          {story.note?.text ? (
            <p className="mt-3 border-l-2 border-signal/40 pl-3 text-[0.8125rem] leading-6 text-muted-foreground">
              {story.note.text}
            </p>
          ) : null}

          <StoryActions story={story} />
        </div>
      </div>
    </motion.li>
  );
}

function NewsSkeleton() {
  return (
    <div className="mt-8 space-y-4" aria-hidden>
      <div className="glass overflow-hidden rounded-[1.75rem]">
        <div className="grid md:grid-cols-2">
          <div className="aspect-[16/10] animate-pulse bg-fill md:aspect-auto md:min-h-[17rem]" />
          <div className="space-y-3 px-5 py-6 md:px-7 md:py-8">
            <div className="h-5 w-24 animate-pulse rounded-full bg-fill" />
            <div className="h-8 w-[80%] animate-pulse rounded-xl bg-fill" />
            <div className="h-4 w-full animate-pulse rounded-lg bg-fill" />
            <div className="h-4 w-[88%] animate-pulse rounded-lg bg-fill" />
            <div className="h-4 w-[66%] animate-pulse rounded-lg bg-fill" />
          </div>
        </div>
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="glass flex overflow-hidden rounded-3xl"
        >
          <div className="hidden w-44 shrink-0 animate-pulse bg-fill sm:block" />
          <div className="flex-1 space-y-3 px-5 py-5">
            <div className="h-4 w-20 animate-pulse rounded-full bg-fill" />
            <div className="h-6 w-[75%] animate-pulse rounded-xl bg-fill" />
            <div className="h-4 w-full animate-pulse rounded-lg bg-fill" />
            <div className="h-4 w-[66%] animate-pulse rounded-lg bg-fill" />
          </div>
        </div>
      ))}
    </div>
  );
}

function NewsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/news" });
  const reduce = useReducedMotion();
  const page = search.page && search.page > 0 ? search.page : 1;
  const [qDraft, setQDraft] = useState(search.q ?? "");
  const listRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  useEffect(() => {
    setQDraft(search.q ?? "");
  }, [search.q]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const next = qDraft.trim() || undefined;
      if (next !== (search.q || undefined)) {
        navigate({
          search: (prev) => ({ ...prev, q: next, page: undefined }),
          replace: true,
        });
      }
    }, 280);
    return () => window.clearTimeout(handle);
  }, [qDraft]); // eslint-disable-line react-hooks/exhaustive-deps -- debounce draft only

  useEffect(() => {
    const key = search.category ?? "";
    const el = chipRefs.current.get(key);
    el?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [search.category, reduce]);

  const filters = {
    page,
    ...(search.q ? { q: search.q } : {}),
    ...(search.category ? { category: search.category } : {}),
  };

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery(
    truncatedNewsQuery(filters),
  );

  const stories = data?.stories ?? [];
  const pages = data?.pages ?? 1;
  const total = data?.total ?? 0;
  const showLead = page === 1 && !search.q && stories.length > 0;
  const lead = showLead ? stories[0] : undefined;
  const rest = showLead ? stories.slice(1) : stories;
  const hasFilters = Boolean(search.q || search.category);

  const setSearch = (patch: {
    q?: string | undefined;
    category?: string | undefined;
    page?: number | undefined;
  }) => {
    navigate({
      search: (prev) => ({
        ...prev,
        ...patch,
      }),
      replace: true,
    });
  };

  const goPage = (next: number | undefined) => {
    setSearch({ page: next });
    listRef.current?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <SiteShell>
      <motion.div
        initial={reduce ? false : "hidden"}
        animate="show"
        variants={staggerChildren}
        transition={{ staggerChildren: 0.03, delayChildren: 0 }}
      >
        <motion.p
          variants={fadeUp}
          className="text-[0.75rem] font-medium uppercase tracking-[0.12em] text-muted-foreground"
        >
          AI Discov
        </motion.p>
        <motion.h1
          variants={fadeUp}
          className="type-display text-clarity mt-2 text-[2.5rem] md:text-[3.4rem]"
        >
          News
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="mt-4 max-w-2xl text-[1.05rem] leading-8 text-muted-foreground text-pretty"
        >
          Track what is shipping in AI: model launches, agent frameworks,
          developer tools, infrastructure, safety, and policy. Short briefings
          with links to original publishers — built for fast scanning, search,
          and citation.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="sticky top-[4.25rem] z-20 -mx-1 mt-8 space-y-4 rounded-3xl bg-background/70 px-1 py-3 backdrop-blur-md md:top-[4.75rem]"
        >
          <div className="relative max-w-xl">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.75}
            />
            <input
              type="search"
              value={qDraft}
              onChange={(e) => setQDraft(e.target.value)}
              placeholder="Search models, agents, tools…"
              className="w-full rounded-full glass py-2.5 pl-10 pr-11 text-[0.875rem] outline-none transition-apple focus:ring-1 focus:ring-signal/40"
              aria-label="Search AI news"
            />
            {qDraft ? (
              <button
                type="button"
                onClick={() => {
                  setQDraft("");
                  setSearch({ q: undefined, page: undefined });
                }}
                className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-apple hover:bg-fill hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            ) : null}
          </div>

          <div className="news-chip-scroll -mx-1 px-1">
            <div
              className="flex w-max gap-2 pb-0.5"
              role="toolbar"
              aria-label="News categories"
            >
              {TRUNCATED_CATEGORIES.map((c) => {
                const active = (search.category ?? "") === c.id;
                return (
                  <button
                    key={c.label}
                    type="button"
                    ref={(el) => {
                      if (el) chipRefs.current.set(c.id, el);
                      else chipRefs.current.delete(c.id);
                    }}
                    aria-pressed={active}
                    className={`shrink-0 rounded-full px-3.5 py-1.5 text-[0.8125rem] transition-apple ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "glass text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() =>
                      setSearch({
                        category: c.id || undefined,
                        page: undefined,
                      })
                    }
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        <div ref={listRef} className="scroll-mt-36">
          {!isLoading && !isError ? (
            <motion.div
              variants={fadeUp}
              className="mt-5 flex flex-wrap items-center justify-between gap-2 text-[0.8125rem] text-muted-foreground"
            >
              <p>
                <span className="tabular-nums text-foreground">
                  {total.toLocaleString()}
                </span>{" "}
                {total === 1 ? "story" : "stories"}
                {search.q ? (
                  <>
                    {" "}
                    for <span className="text-foreground">“{search.q.trim()}”</span>
                  </>
                ) : null}
                {search.category ? (
                  <>
                    {" "}
                    in{" "}
                    <span className="text-foreground">
                      {truncatedCategoryLabel(search.category)}
                    </span>
                  </>
                ) : null}
                {isFetching ? (
                  <span className="ml-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-signal align-middle" />
                ) : null}
              </p>
              {hasFilters ? (
                <button
                  type="button"
                  onClick={() => {
                    setQDraft("");
                    setSearch({
                      q: undefined,
                      category: undefined,
                      page: undefined,
                    });
                  }}
                  className="rounded-full px-2.5 py-1 transition-apple hover:bg-fill hover:text-foreground"
                >
                  Clear filters
                </button>
              ) : null}
            </motion.div>
          ) : null}

          {isLoading ? (
            <NewsSkeleton />
          ) : isError ? (
            <motion.div
              variants={fadeUp}
              className="glass mt-8 rounded-3xl px-6 py-12 text-center"
            >
              <p className="text-muted-foreground">
                Couldn’t load news
                {error instanceof Error ? `: ${error.message}` : "."}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 rounded-full bg-primary px-5 py-2.5 text-[0.875rem] font-medium text-primary-foreground"
              >
                Retry
              </button>
            </motion.div>
          ) : stories.length === 0 ? (
            <motion.div
              variants={fadeUp}
              className="glass mt-8 rounded-3xl px-6 py-12 text-center"
            >
              <p className="text-muted-foreground">
                No stories match
                {hasFilters ? " these filters" : ""}.
              </p>
              {hasFilters ? (
                <button
                  type="button"
                  onClick={() => {
                    setQDraft("");
                    setSearch({
                      q: undefined,
                      category: undefined,
                      page: undefined,
                    });
                  }}
                  className="mt-4 rounded-full bg-primary px-5 py-2.5 text-[0.875rem] font-medium text-primary-foreground"
                >
                  Reset filters
                </button>
              ) : null}
            </motion.div>
          ) : (
            <div
              className={`mt-6 space-y-4 transition-opacity ${isFetching ? "opacity-70" : "opacity-100"}`}
              aria-busy={isFetching}
            >
              {lead ? <LeadStory story={lead} /> : null}
              <motion.ol variants={staggerChildren} className="space-y-3">
                {rest.map((story, idx) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    deferPaint={idx > 1}
                  />
                ))}
              </motion.ol>
            </div>
          )}

          {!isLoading && !isError && pages > 1 ? (
            <motion.nav
              variants={fadeUp}
              aria-label="News pagination"
              className="mt-10 flex flex-wrap items-center justify-between gap-3"
            >
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => goPage(page <= 2 ? undefined : page - 1)}
                className="inline-flex items-center gap-1.5 rounded-full glass px-4 py-2 text-[0.8125rem] transition-apple enabled:hover:text-foreground disabled:opacity-40"
              >
                <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
                Previous
              </button>
              <p className="text-[0.8125rem] tabular-nums text-muted-foreground">
                Page {page} of {pages}
              </p>
              <button
                type="button"
                disabled={page >= pages}
                onClick={() => goPage(page + 1)}
                className="inline-flex items-center gap-1.5 rounded-full glass px-4 py-2 text-[0.8125rem] transition-apple enabled:hover:text-foreground disabled:opacity-40"
              >
                Next
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
            </motion.nav>
          ) : null}
        </div>

        <motion.p
          variants={fadeUp}
          className="mt-12 text-[0.75rem] leading-relaxed text-muted-foreground"
        >
          AI Discov News aggregates publisher-linked AI coverage for discovery
          and citation. Headlines and article text belong to their publishers.
        </motion.p>
      </motion.div>
    </SiteShell>
  );
}
