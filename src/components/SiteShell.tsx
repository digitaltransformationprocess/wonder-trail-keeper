import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useCompare } from "@/lib/store";
import type { Solution } from "@/data/catalog";

export function SiteShell({ children }: { children: ReactNode }) {
  const { list } = useCompare();
  const nav = [
    { to: "/", label: "Discover" },
    { to: "/explore", label: "Explore" },
    { to: "/latest", label: "Latest" },
    { to: "/compare", label: `Compare${list.length ? ` (${list.length})` : ""}` },
    { to: "/library", label: "My Library" },
  ] as const;
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <Link to="/" className="font-display text-2xl tracking-tight">AI Discovery<span className="text-primary">.</span></Link>
          <nav className="flex flex-wrap gap-1 text-sm">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }}
                className="rounded-full px-3 py-1.5 text-muted-foreground hover:text-foreground"
                activeProps={{ className: "rounded-full px-3 py-1.5 bg-foreground text-background" }}>
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10">{children}</main>
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-5 py-6 text-xs text-muted-foreground">
          Les informations non vérifiées sont affichées « À vérifier ». Aucun contenu sponsorisé n'est mélangé aux recommandations.
        </div>
      </footer>
    </div>
  );
}

export function SolutionCard({ s, children }: { s: Solution; children?: ReactNode }) {
  const { has, toggle } = useCompare();
  return (
    <article className="flex flex-col rounded-lg border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link to="/tools/$slug" params={{ slug: s.slug }} className="font-display text-xl hover:text-primary">{s.name}</Link>
          <p className="text-xs text-muted-foreground">{s.publisher} · {s.type}</p>
        </div>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">{s.pricingModel}</span>
      </div>
      <p className="mt-3 text-sm">{s.summary}</p>
      {children}
      <div className="mt-auto flex items-center justify-between pt-4 text-xs text-muted-foreground">
        <span>{s.status === "Vérifié" ? "✓ Vérifié" : "⚠ À vérifier"} le {s.verifiedAt}</span>
        <button onClick={() => toggle(s.slug)} className="rounded-full border border-border px-2.5 py-1 hover:border-primary hover:text-primary">
          {has(s.slug) ? "Retirer" : "+ Comparer"}
        </button>
      </div>
    </article>
  );
}
