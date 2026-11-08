import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/SiteShell";
import { NEWS } from "@/data/catalog";

export const Route = createFileRoute("/latest")({
  head: () => ({ meta: [
    { title: "Latest — Nouveautés IA vérifiées | AI Discovery" },
    { name: "description", content: "Nouveaux outils, versions et changements de prix dans l'écosystème IA, sourcés." },
    { property: "og:title", content: "Nouveautés IA vérifiées" },
    { property: "og:description", content: "Suivez l'évolution des solutions IA avec sources." },
  ] }),
  component: Latest,
});

function Latest() {
  return (
    <SiteShell>
      <h1 className="font-display text-4xl">Latest</h1>
      <ol className="mt-8 space-y-6">
        {NEWS.map((n) => (
          <li key={n.id} className="grid gap-2 border-b border-border pb-6 md:grid-cols-[140px_1fr]">
            <div className="text-sm text-muted-foreground">{n.date}<br /><span className="text-primary">{n.kind}</span></div>
            <div>
              <h2 className="font-display text-2xl">{n.title}</h2>
              <p className="mt-1 text-sm">{n.summary}</p>
              <div className="mt-2 flex gap-4 text-xs">
                {n.solution && <Link to="/tools/$slug" params={{ slug: n.solution }} className="text-primary">Voir la fiche</Link>}
                <a href={n.source} target="_blank" rel="noreferrer" className="text-muted-foreground underline">Source</a>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </SiteShell>
  );
}
