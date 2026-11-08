import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteShell, SolutionCard } from "@/components/SiteShell";
import { getSolution } from "@/data/catalog";
import { useCompare, useFavorites } from "@/lib/store";

export const Route = createFileRoute("/tools/$slug")({
  loader: ({ params }) => { const s = getSolution(params.slug); if (!s) throw notFound(); return s; },
  head: ({ loaderData }) => ({ meta: loaderData ? [
    { title: `${loaderData.name} — fiche, prix et alternatives | AI Discovery` },
    { name: "description", content: loaderData.summary },
    { property: "og:title", content: `${loaderData.name} | AI Discovery` },
    { property: "og:description", content: loaderData.summary },
  ] : [] }),
  notFoundComponent: () => <SiteShell><p>Solution introuvable. <Link to="/explore" className="text-primary">Retour au catalogue</Link></p></SiteShell>,
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
      <p className="mt-1 text-muted-foreground">par {s.publisher}</p>
      <p className="mt-5 max-w-2xl text-lg">{s.description}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        <a href={s.url} target="_blank" rel="noreferrer" className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">Site officiel ↗</a>
        <button onClick={() => fav.toggle(s.slug)} className="rounded-lg border border-border px-4 py-2 text-sm">{fav.has(s.slug) ? "★ Dans ma bibliothèque" : "☆ Ajouter aux favoris"}</button>
        <button onClick={() => cmp.toggle(s.slug)} className="rounded-lg border border-border px-4 py-2 text-sm">{cmp.has(s.slug) ? "Retirer du comparateur" : "+ Comparer"}</button>
      </div>

      <div className="mt-10 grid gap-10 md:grid-cols-3">
        <dl className="md:col-span-2">
          <Row k="Modèle tarifaire" v={s.pricingModel} />
          <Row k="Prix" v={s.price} />
          <Row k="Plateformes" v={s.platforms.join(", ")} />
          <Row k="API" v={s.api ? "Oui" : "Non communiqué"} />
          <Row k="Open source" v={s.openSource ? "Oui" : "Non"} />
          <Row k="Exécution locale" v={s.local ? "Possible" : "Cloud uniquement"} />
          <Row k="Public cible" v={s.audience.join(", ")} />
          <Row k="Points forts" v={<ul className="list-disc pl-4">{s.strengths.map((x) => <li key={x}>{x}</li>)}</ul>} />
          <Row k="Limites" v={<ul className="list-disc pl-4">{s.limits.map((x) => <li key={x}>{x}</li>)}</ul>} />
        </dl>
        <aside className="rounded-lg border border-border bg-card p-5 text-sm">
          <h2 className="font-display text-xl">Confiance</h2>
          <p className="mt-2">{s.status === "Vérifié" ? "✓ Vérifié" : "⚠ À vérifier"} — dernière vérification le {s.verifiedAt}</p>
          <h3 className="mt-4 font-medium">Sources</h3>
          <ul className="mt-1 space-y-1">{s.sources.map((u) => <li key={u}><a className="break-all text-primary" href={u} target="_blank" rel="noreferrer">{u}</a></li>)}</ul>
          <a className="mt-4 inline-block text-xs text-muted-foreground underline" href={`mailto:corrections@example.com?subject=Erreur sur ${s.name}`}>Signaler une erreur</a>
        </aside>
      </div>

      {alts.length > 0 && (<>
        <h2 className="mt-12 font-display text-2xl">Alternatives</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">{alts.map((a) => <SolutionCard key={a!.slug} s={a!} />)}</div>
      </>)}
    </SiteShell>
  );
}
