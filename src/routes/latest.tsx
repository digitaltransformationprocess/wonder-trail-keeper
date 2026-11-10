import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/SiteShell";
import { listNews } from "@/lib/news.functions";

const newsQuery = queryOptions({ queryKey: ["news"], queryFn: () => listNews() });

export const Route = createFileRoute("/latest")({
  head: () => ({ meta: [
    { title: "Latest — Nouveautés IA vérifiées | AI Discovery" },
    { name: "description", content: "Nouveaux outils, versions et changements de prix dans l'écosystème IA, sourcés." },
    { property: "og:title", content: "Nouveautés IA vérifiées" },
    { property: "og:description", content: "Suivez l'évolution des solutions IA avec sources." },
  ] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(newsQuery),
  component: Latest,
});

function Latest() {
  const { data: news } = useSuspenseQuery(newsQuery);
  return (
    <SiteShell>
      <h1 className="font-display text-4xl">Latest</h1>
      <p className="mt-2 text-sm text-muted-foreground">Veille automatique quotidienne. Résumés rédigés par IA à partir des sources citées.</p>
      {news.length === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">Aucune nouveauté pour l'instant. La veille passe chaque jour.</p>
      ) : (
        <ol className="mt-8 space-y-6">
          {news.map((n) => (
            <li key={n.id} className="grid gap-2 border-b border-border pb-6 md:grid-cols-[140px_1fr]">
              <div className="text-sm text-muted-foreground">{n.published_at}<br /><span className="text-primary">{n.kind}</span></div>
              <div>
                <h2 className="font-display text-2xl">{n.title}</h2>
                <p className="mt-1 text-sm">{n.summary}</p>
                <div className="mt-2 flex gap-4 text-xs">
                  {n.solution_slug && <Link to="/tools/$slug" params={{ slug: n.solution_slug }} className="text-primary">Voir la fiche</Link>}
                  <a href={n.source_url} target="_blank" rel="noreferrer" className="break-all text-muted-foreground underline">Source</a>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </SiteShell>
  );
}
