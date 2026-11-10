import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteShell, SolutionCard } from "@/components/SiteShell";
import { getSolution } from "@/data/catalog";
import { useCompare, useFavorites } from "@/lib/store";

export const Route = createFileRoute("/tools/$slug")({
  loader: ({ params }) => { const s = getSolution(params.slug); if (!s) throw notFound(); return s; },
  head: ({ loaderData }) => ({ meta: loaderData ? [
    { title: `${loaderData.name} — overview, pricing, and alternatives | AI Discovery` },
    { name: "description", content: loaderData.summary },
    { property: "og:title", content: `${loaderData.name} | AI Discovery` },
    { property: "og:description", content: loaderData.summary },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] : [] }),
  notFoundComponent: () => <SiteShell><p>Solution not found. <Link to="/explore" className="text-primary">Back to the catalog</Link></p></SiteShell>,
  component: Detail,
});

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="grid grid-cols-3 gap-3 border-b border-border py-2.5 text-sm"><dt className="text-muted-foreground">{k}</dt><dd className="col-span-2">{v}</dd></div>;
}

function Detail() {
  const s = Route.useLoaderData();
  const fav = useFavorites();
  const cmp = useCompare();
  const alts = s.alternatives.map(getSolution).filter(Boolean);
  return (
    <SiteShell>
      <p className="text-sm text-muted-foreground">{s.type} · {s.categories.join(" · ")}</p>
      <h1 className="mt-2 font-display text-5xl">{s.name}</h1>
      <p className="mt-1 text-muted-foreground">by {s.publisher}</p>
      <p className="mt-5 max-w-2xl text-lg">{s.description}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        <a href={s.url} target="_blank" rel="noreferrer" className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">Official website ↗</a>
        <button onClick={() => fav.toggle(s.slug)} className="rounded-lg border border-border px-4 py-2 text-sm">{fav.has(s.slug) ? "★ In my library" : "☆ Add to favorites"}</button>
        <button onClick={() => cmp.toggle(s.slug)} className="rounded-lg border border-border px-4 py-2 text-sm">{cmp.has(s.slug) ? "Remove from comparison" : "+ Compare"}</button>
      </div>

      <div className="mt-10 grid gap-10 md:grid-cols-3">
        <dl className="md:col-span-2">
          <Row k="Pricing model" v={s.pricingModel} />
          <Row k="Price" v={s.price} />
          <Row k="Platforms" v={s.platforms.join(", ")} />
          <Row k="API" v={s.api ? "Yes" : "Not disclosed"} />
          <Row k="Open source" v={s.openSource ? "Yes" : "No"} />
          <Row k="Local execution" v={s.local ? "Possible" : "Cloud only"} />
          <Row k="Audience" v={s.audience.join(", ")} />
          <Row k="Strengths" v={<ul className="list-disc pl-4">{s.strengths.map((x) => <li key={x}>{x}</li>)}</ul>} />
          <Row k="Limitations" v={<ul className="list-disc pl-4">{s.limits.map((x) => <li key={x}>{x}</li>)}</ul>} />
        </dl>
        <aside className="rounded-lg border border-border bg-card p-5 text-sm">
          <h2 className="font-display text-xl">Verification</h2>
          <p className="mt-2">{s.status === "Verified" ? "✓ Verified" : "⚠ To verify"} — last verified on {s.verifiedAt}</p>
          <h3 className="mt-4 font-medium">Sources</h3>
          <ul className="mt-1 space-y-1">{s.sources.map((u) => <li key={u}><a className="break-all text-primary" href={u} target="_blank" rel="noreferrer">{u}</a></li>)}</ul>
          <a className="mt-4 inline-block text-xs text-muted-foreground underline" href={`mailto:corrections@example.com?subject=Error in ${s.name}`}>Report an error</a>
        </aside>
      </div>

      {alts.length > 0 && (<>
        <h2 className="mt-12 font-display text-2xl">Alternatives</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">{alts.map((a) => <SolutionCard key={a!.slug} s={a!} />)}</div>
      </>)}
    </SiteShell>
  );
}
