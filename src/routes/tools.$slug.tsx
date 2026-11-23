import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ExternalLink, Github } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Suspense } from "react";
import { SiteShell, SolutionCard } from "@/components/SiteShell";
import { dealForToolSlug } from "@/lib/deals";
import {
  breadcrumbJsonLd,
  mergeHead,
  pageSeo,
  toolFaqJsonLd,
  toolJsonLd,
  toolMetaDescription,
  toolPageTitle,
} from "@/lib/seo";
import { displayApi, solutionQuery } from "@/lib/solutions";
import { useCompare, useFavorites } from "@/lib/store";
import { fadeUp, springSoft, staggerChildren } from "@/lib/motion";

export const Route = createFileRoute("/tools/$slug")({
  loader: async ({ context, params }) => {
    try {
      const data = await context.queryClient.ensureQueryData(solutionQuery(params.slug));
      if (data.redirectSlug) {
        throw redirect({
          to: "/tools/$slug",
          params: { slug: data.redirectSlug },
        });
      }
      return data;
    } catch (error) {
      if (error instanceof Error && error.message === "NOT_FOUND") throw notFound();
      throw error;
    }
  },
  head: ({ loaderData, params }) => {
    if (!loaderData?.solution) return {};
    const s = loaderData.solution;
    const title = toolPageTitle(s.name);
    const description = toolMetaDescription(s);
    const primaryCat = s.categorySlugs[0]
      ? { name: s.categories[0] ?? "Category", path: `/categories/${s.categorySlugs[0]}` }
      : { name: "Explore", path: "/explore" };

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
        path: `/tools/${params.slug}`,
        // Prefer site OG card — tool logos are often tiny favicons, poor as 1200×630 previews.
        jsonLd: [
          toolJsonLd(s, params.slug),
          toolFaqJsonLd(s),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            primaryCat,
            { name: s.name, path: `/tools/${params.slug}` },
          ]),
        ],
      }),
    );
  },
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

function ReliabilityBadge({ level }: { level: string }) {
  return (
    <span className="rounded-full bg-fill px-2 py-0.5 text-[0.65rem] uppercase tracking-wide text-muted-foreground">
      {level}
    </span>
  );
}

/** Prefer the tool's full URL when a linked source is only a bare publisher origin. */
function resolveSourceHref(
  src: { url: string; claimKey: string },
  tool: { url: string; repositoryUrl: string | null; apiDocsUrl: string | null },
): string {
  const raw = src.url.trim();
  if (!raw) return tool.url;

  let bareOrigin = false;
  let host = "";
  try {
    const u = new URL(raw);
    host = u.hostname.replace(/^www\./i, "").toLowerCase();
    bareOrigin = u.pathname === "/" || u.pathname === "";
  } catch {
    return raw;
  }

  const claim = src.claimKey.toLowerCase();
  const isGithub = host === "github.com" || host.endsWith(".github.com");

  if (
    (claim.includes("repositor") || claim.includes("github") || isGithub) &&
    tool.repositoryUrl
  ) {
    return tool.repositoryUrl;
  }
  if (claim.includes("api") && tool.apiDocsUrl) {
    return tool.apiDocsUrl;
  }
  if (bareOrigin) {
    if (isGithub && tool.repositoryUrl) return tool.repositoryUrl;
    if (tool.url) return tool.url;
  }
  return raw;
}

function Detail() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(solutionQuery(slug));
  const s = data.solution!;
  const alts = data.alternatives;
  const linkedNews = data.linkedNews;
  const changeHistory = data.changeHistory;
  const fav = useFavorites();
  const cmp = useCompare();
  const reduce = useReducedMotion();
  const deal = dealForToolSlug(slug);

  return (
    <motion.div initial={reduce ? false : "hidden"} animate="show" variants={staggerChildren}>
      <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3">
        {s.logoUrl ? (
          <img
            src={s.logoUrl}
            alt={`${s.name} logo`}
            className="h-12 w-12 rounded-2xl object-cover"
            loading="lazy"
          />
        ) : null}
        <p className="text-[0.8125rem] text-muted-foreground">
          {s.type} ·{" "}
          {s.categories.map((name, i) => (
            <span key={s.categorySlugs[i] ?? name}>
              {i > 0 ? " · " : null}
              {s.categorySlugs[i] ? (
                <Link
                  to="/categories/$slug"
                  params={{ slug: s.categorySlugs[i]! }}
                  className="hover:text-foreground"
                >
                  {name}
                </Link>
              ) : (
                name
              )}
            </span>
          ))}
        </p>
        <span
          className={`rounded-full px-2.5 py-1 text-[0.7rem] ${
            s.status === "Verified"
              ? "bg-primary/15 text-primary"
              : "bg-fill text-muted-foreground"
          }`}
        >
          {s.status === "Verified" ? "Verified" : "To verify"}
        </span>
        {deal?.discountPercent != null ? (
          <span className="rounded-full bg-deal-soft px-2.5 py-1 text-[0.7rem] font-semibold text-deal-ink">
            Deal −{deal.discountPercent}%
          </span>
        ) : deal ? (
          <Link
            to="/deals"
            className="rounded-full bg-deal-soft px-2.5 py-1 text-[0.7rem] font-semibold text-deal-ink transition-apple hover:brightness-110"
          >
            Deal available
          </Link>
        ) : null}
      </motion.div>

      <motion.h1
        variants={fadeUp}
        className="type-display text-clarity mt-3 text-[3rem] md:text-[4.5rem]"
      >
        {s.name}
      </motion.h1>
      <motion.p variants={fadeUp} className="mt-2 text-[1rem] text-muted-foreground">
        by {s.publisher}
        <span className="mx-2 text-muted-foreground/50">·</span>
        Updated {s.verifiedAt}
      </motion.p>

      <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
        {deal ? (
          <a
            href={deal.offerUrl}
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-deal px-5 py-2.5 text-[0.875rem] font-semibold text-deal-foreground transition-apple hover:brightness-105"
          >
            Get deal
            {deal.discountPercent != null ? ` (−${deal.discountPercent}%)` : ""}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        ) : null}
        <a
          href={s.url}
          target="_blank"
          rel="noreferrer"
          className={`rounded-full px-5 py-2.5 text-[0.875rem] font-medium transition-apple hover:brightness-110 ${
            deal
              ? "glass text-foreground"
              : "bg-primary text-primary-foreground"
          }`}
        >
          {/skills\.sh/i.test(s.url) || s.categorySlugs[0] === "skills"
            ? "View skill"
            : s.categorySlugs[0] === "mcp"
              ? "View MCP"
              : "Official website"}
        </a>
        {s.apiDocsUrl ? (
          <a
            href={s.apiDocsUrl}
            target="_blank"
            rel="noreferrer"
            className="glass rounded-full px-5 py-2.5 text-[0.875rem] transition-apple hover:brightness-105"
          >
            API docs
          </a>
        ) : null}
        {s.repositoryUrl ? (
          <a
            href={s.repositoryUrl}
            target="_blank"
            rel="noreferrer"
            className="glass inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[0.875rem] transition-apple hover:brightness-105"
          >
            {/github\.com/i.test(s.repositoryUrl) ? (
              <Github className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
            ) : null}
            Repository
          </a>
        ) : null}
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

      <motion.section variants={fadeUp} className="mt-14 max-w-2xl">
        <h2 className="type-title text-[1.75rem]">What is {s.name}?</h2>
        <p className="type-body mt-3 text-[1.125rem] text-foreground/90">
          {s.summary?.trim() ||
            `${s.name} is an AI ${s.type || "solution"} from ${s.publisher}.`}
        </p>
        <div className="type-body mt-4 space-y-4 text-[1.05rem] text-foreground/85">
          {s.description
            .split(/\n\s*\n/)
            .map((p) => p.trim())
            .filter(Boolean)
            .filter((p) => p !== s.summary?.trim())
            .map((p) => (
              <p key={p.slice(0, 48)}>{p}</p>
            ))}
        </div>
      </motion.section>

      <motion.div
        variants={fadeUp}
        className="mt-14 grid gap-8 md:grid-cols-[minmax(0,1fr)_280px]"
      >
        <div className="space-y-10">
          <section className="glass rounded-3xl px-5 py-2 md:px-6">
            <h2 className="type-title pt-5 text-[1.25rem]">Pricing</h2>
            <p className="mt-2 text-[0.9375rem] text-muted-foreground">
              {s.name} is listed as <span className="text-foreground">{s.pricingModel}</span>
              {s.price?.trim() && !/to verify|not disclosed/i.test(s.price)
                ? ` (${s.price.trim()})`
                : ""}{" "}
              on AI Discov.
            </p>
            <dl className="mt-2">
              <Row k="Pricing model" v={s.pricingModel} />
              <Row k="Price" v={s.price} />
              <Row
                k="Pricing plans"
                v={
                  s.pricingPlans.length > 0 ? (
                    <ul className="space-y-3">
                      {s.pricingPlans.map((p) => (
                        <li key={`${p.planName}-${p.billingPeriod ?? ""}`}>
                          <p className="font-medium text-foreground">{p.planName}</p>
                          <p className="text-[0.8125rem] text-muted-foreground">
                            {[
                              p.pricingModel,
                              p.priceAmount != null
                                ? `${p.currency ?? ""} ${p.priceAmount}`.trim()
                                : null,
                              p.billingPeriod,
                              p.verifiedAt ? `verified ${p.verifiedAt}` : "To verify",
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    "To verify"
                  )
                }
              />
            </dl>
          </section>

          <section className="glass rounded-3xl px-5 py-2 md:px-6">
            <h2 className="type-title pt-5 text-[1.25rem]">Platforms & API</h2>
            <p className="mt-2 text-[0.9375rem] text-muted-foreground">
              {s.name} runs on{" "}
              <span className="text-foreground">
                {s.platforms.join(", ") || "platforms to verify"}
              </span>
              . API: <span className="text-foreground">{displayApi(s.apiAvailable)}</span>
              {s.openSource ? "; listed as open source" : ""}.
            </p>
            <dl className="mt-2">
              <Row k="Platforms" v={s.platforms.join(", ") || "To verify"} />
              <Row k="API" v={displayApi(s.apiAvailable)} />
              <Row k="Open source" v={s.openSource ? "Yes" : "No"} />
              <Row k="License" v={s.license?.trim() || "Not disclosed"} />
              <Row k="Local execution" v={s.local ? "Possible" : "Cloud only"} />
              <Row k="Audience" v={s.audience.join(", ") || "To verify"} />
              <Row
                k="Capabilities"
                v={
                  s.features.length ? (
                    <ul className="flex flex-wrap gap-2">
                      {s.features.map((f) => (
                        <li
                          key={f.key}
                          className="rounded-full bg-fill px-2.5 py-1 text-[0.75rem] text-muted-foreground"
                          title={f.notes ?? undefined}
                        >
                          {f.label}
                          {f.availability !== "available" ? ` · ${f.availability}` : ""}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    "To verify"
                  )
                }
              />
            </dl>
          </section>

          <section className="glass rounded-3xl px-5 py-2 md:px-6">
            <h2 className="type-title pt-5 text-[1.25rem]">Strengths & limitations</h2>
            <p className="mt-2 text-[0.9375rem] text-muted-foreground">
              {s.strengths.length
                ? `${s.name}'s main strengths include ${s.strengths.slice(0, 2).join(" and ")}${s.strengths.length > 2 ? ", among others" : ""}.`
                : `${s.name} strengths are marked to verify on AI Discov.`}
              {s.limits.length
                ? ` Key limitations: ${s.limits.slice(0, 2).join("; ")}.`
                : ""}
            </p>
            <dl className="mt-2">
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
          </section>
        </div>

        <aside className="glass h-fit rounded-3xl p-6">
          <h2 className="type-title text-[1.125rem]">Verification</h2>
          <p className="mt-3 text-[0.875rem] text-muted-foreground">
            {s.status === "Verified" ? "Verified" : "To verify"} — last checked {s.verifiedAt}
          </p>
          <h2 className="mt-6 type-title text-[1.125rem]">Sources</h2>
          <p className="mt-2 text-[0.8125rem] text-muted-foreground">
            Claims on this page are tied to the sources below.
          </p>
          {s.sources.length === 0 ? (
            <p className="mt-2 text-[0.8125rem] italic text-muted-foreground">No source linked yet.</p>
          ) : (
            <ul className="mt-2 space-y-3">
              {s.sources.map((src) => {
                const href = resolveSourceHref(src, s);
                return (
                  <li key={`${src.claimKey}-${src.url}`} className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <ReliabilityBadge level={src.reliabilityLevel} />
                      <span className="text-[0.7rem] text-muted-foreground">{src.claimKey}</span>
                    </div>
                    <a
                      className="inline-flex max-w-full items-start gap-1.5 break-all text-[0.8125rem] text-primary transition-apple hover:opacity-70"
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {/github\.com/i.test(href) ? (
                        <Github className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
                      ) : null}
                      <span>{href}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
          <a
            className="mt-6 inline-block text-[0.75rem] text-muted-foreground underline-offset-2 hover:underline"
            href={`mailto:contact@aidiscov.com?subject=Error in ${encodeURIComponent(s.name)}`}
          >
            Report an error
          </a>
        </aside>
      </motion.div>

      {linkedNews.length > 0 ? (
        <section>
          <motion.h2 variants={fadeUp} className="type-title mt-16 text-[1.75rem]">
            Related updates
          </motion.h2>
          <p className="mt-2 max-w-2xl text-[0.9375rem] text-muted-foreground">
            Recent product advances linked to {s.name} on AI Discov Latest.
          </p>
          <motion.ul variants={staggerChildren} className="mt-5 space-y-3">
            {linkedNews.map((n) => (
              <motion.li key={n.slug} variants={fadeUp}>
                <Link
                  to="/latest/$slug"
                  params={{ slug: n.slug }}
                  className="glass block rounded-2xl p-4 transition-apple hover:brightness-105"
                >
                  <p className="text-[0.75rem] text-muted-foreground">
                    {n.kind} · {n.publishedAt.slice(0, 10)}
                  </p>
                  <p className="mt-1 font-medium">{n.title}</p>
                  <p className="mt-1 text-[0.875rem] text-muted-foreground">{n.summary}</p>
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        </section>
      ) : null}

      {changeHistory.length > 0 ? (
        <section>
          <motion.h2 variants={fadeUp} className="type-title mt-16 text-[1.75rem]">
            Change history
          </motion.h2>
          <p className="mt-2 max-w-2xl text-[0.9375rem] text-muted-foreground">
            Field-level updates recorded for {s.name} in the catalog.
          </p>
          <motion.ul variants={staggerChildren} className="mt-5 space-y-2">
            {changeHistory.map((c) => (
              <motion.li
                key={`${c.fieldKey}-${c.detectedAt}`}
                variants={fadeUp}
                className="glass rounded-2xl px-4 py-3 text-[0.875rem]"
              >
                <span className="text-muted-foreground">{c.detectedAt.slice(0, 10)}</span>
                <span className="mx-2 text-muted-foreground">·</span>
                <span className="font-medium">{c.fieldKey}</span>
                <span className="mt-1 block text-muted-foreground">
                  {(c.oldValue ?? "—").slice(0, 80)} → {(c.newValue ?? "—").slice(0, 80)}
                </span>
              </motion.li>
            ))}
          </motion.ul>
        </section>
      ) : null}

      {alts.length > 0 && (
        <section>
          <motion.h2 variants={fadeUp} className="type-title mt-16 text-[1.75rem]">
            Alternatives to {s.name}
          </motion.h2>
          <p className="mt-2 max-w-2xl text-[0.9375rem] text-muted-foreground">
            Alternatives to {s.name} on AI Discov include{" "}
            {alts
              .slice(0, 3)
              .map((a) => a.name)
              .join(", ")}
            {alts.length > 3 ? ", and more" : ""}.
          </p>
          <motion.div variants={staggerChildren} className="mt-5 grid gap-4 md:grid-cols-3">
            {alts.map((a) => (
              <motion.div key={a.slug} variants={fadeUp} transition={springSoft}>
                <SolutionCard s={a} />
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}
    </motion.div>
  );
}
