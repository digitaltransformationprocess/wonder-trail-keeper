import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell, SolutionCard } from "@/components/SiteShell";
import { getSolution, type Solution } from "@/data/catalog";
import { useFavorites } from "@/lib/store";

export const Route = createFileRoute("/library")({
  head: () => ({ meta: [
    { title: "My Library — Vos solutions IA favorites | AI Discovery" },
    { name: "description", content: "Retrouvez les solutions IA que vous avez enregistrées." },
    { property: "og:title", content: "Ma bibliothèque IA" },
    { property: "og:description", content: "Favoris enregistrés sur cet appareil." },
  ] }),
  component: Library,
});

function Library() {
  const { list } = useFavorites();
  const items = list.map(getSolution).filter(Boolean) as Solution[];
  return (
    <SiteShell>
      <h1 className="font-display text-4xl">My Library</h1>
      <p className="mt-2 text-sm text-muted-foreground">Vos favoris sont enregistrés sur cet appareil, sans compte.</p>
      {items.length === 0 ? (
        <p className="mt-6">Aucun favori pour l'instant. <Link to="/explore" className="text-primary">Explorer le catalogue</Link></p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{items.map((s) => <SolutionCard key={s.slug} s={s} />)}</div>
      )}
    </SiteShell>
  );
}
