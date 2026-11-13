import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import { Suspense } from "react";
import { SiteShell, SolutionCard } from "@/components/SiteShell";
import {
  breadcrumbJsonLd,
  mergeHead,
  pageSeo,
  toolJsonLd,
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
    const description = s.summary;

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
        image: s.logoUrl,
        jsonLd: [
          toolJsonLd(s, params.slug),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Explore", path: "/explore" },
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

  return (
    <motion.div initial={reduce ? false : "hidden"} animate="show" variants={staggerChildren}>
      <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3">
        {s.logoUrl ? (
          <img
            src={s.logoUrl}
            alt=""
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
      </motion.div>

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
            className="glass rounded-full px-5 py-2.5 text-[0.875rem] transition-apple hover:brightness-105"
          >
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

      <motion.div
        variants={fadeUp}
        className="mt-14 grid gap-8 md:grid-cols-[minmax(0,1fr)_280px]"
      >
        <dl className="glass rounded-3xl px-5 md:px-6">
          <Row k="Pricing model" v={s.pricingModel} />
          <Row k="Price" v={s.price} />
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

        <aside className="glass h-fit rounded-3xl p-6">
          <h2 className="type-title text-[1.125rem]">Verification</h2>
          <p className="mt-3 text-[0.875rem] text-muted-foreground">
            {s.status === "Verified" ? "Verified" : "To verify"} — last checked {s.verifiedAt}
          </p>
          <h3 className="mt-6 text-[0.8125rem] font-medium text-foreground">Sources</h3>
          {s.sources.length === 0 ? (
            <p className="mt-2 text-[0.8125rem] italic text-muted-foreground">No source linked yet.</p>
          ) : (
            <ul className="mt-2 space-y-3">
              {s.sources.map((src) => (
                <li key={`${src.claimKey}-${src.url}`} className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <ReliabilityBadge level={src.reliabilityLevel} />
                    <span className="text-[0.7rem] text-muted-foreground">{src.claimKey}</span>
                  </div>
                  <a
                    className="break-all text-[0.8125rem] text-primary transition-apple hover:opacity-70"
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {src.url}
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

      {linkedNews.length > 0 ? (
        <>
          <motion.h2 variants={fadeUp} className="type-title mt-16 text-[1.75rem]">
            Related news
          </motion.h2>
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
        </>
      ) : null}

      {changeHistory.length > 0 ? (
        <>
          <motion.h2 variants={fadeUp} className="type-title mt-16 text-[1.75rem]">
            Change history
          </motion.h2>
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
        </>
      ) : null}

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
