import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell, SolutionCard } from "@/components/SiteShell";
import { getSolution, type Solution } from "@/data/catalog";
import { useFavorites } from "@/lib/store";

export const Route = createFileRoute("/library")({
  head: () => ({ meta: [
    { title: "My Library — Your saved AI solutions | AI Discovery" },
    { name: "description", content: "Find the AI solutions you have saved." },
    { property: "og:title", content: "My AI library" },
    { property: "og:description", content: "Favorites saved on this device." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Library,
});

function Library() {
  const { list } = useFavorites();
  const items = list.map(getSolution).filter(Boolean) as Solution[];
  return (
    <SiteShell>
      <h1 className="font-display text-4xl">My Library</h1>
      <p className="mt-2 text-sm text-muted-foreground">Your favorites are saved on this device, without an account.</p>
      {items.length === 0 ? (
        <p className="mt-6">No favorites yet. <Link to="/explore" className="text-primary">Explore the catalog</Link></p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{items.map((s) => <SolutionCard key={s.slug} s={s} />)}</div>
      )}
    </SiteShell>
  );
}
