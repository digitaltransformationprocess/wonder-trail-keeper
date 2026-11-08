import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { SiteShell, SolutionCard } from "@/components/SiteShell";
import { discover, extractConstraints } from "@/lib/discover";

export const Route = createFileRoute("/")({
  validateSearch: z.object({ q: z.string().optional() }),
  head: () => ({ meta: [
    { title: "AI Discovery — Trouvez la bonne solution IA pour votre besoin" },
    { name: "description", content: "Décrivez ce que vous voulez accomplir et obtenez des solutions IA vérifiées, expliquées et comparables." },
    { property: "og:title", content: "AI Discovery — Recherche IA par besoin" },
    { property: "og:description", content: "Des recommandations d'outils IA expliquées, sourcées et datées." },
  ] }),
  component: Discover,
});

const EXAMPLES = [
  "I need to remove background noise from a voice recording for free",
  "Turn lecture notes into flashcards",
  "Create short product videos from photos",
  "Run an open source LLM locally with an API",
  "AI assistant for customer support on my website",
];

function Discover() {
  const { q } = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const [value, setValue] = useState(q ?? "");
  const results = q ? discover(q) : [];
  const c = q ? extractConstraints(q) : null;
  const go = (v: string) => { setValue(v); navigate({ search: { q: v } }); };

  return (
    <SiteShell>
      <section className="py-8">
        <p className="text-sm uppercase tracking-widest text-primary">Discover</p>
        <h1 className="mt-3 max-w-3xl font-display text-5xl leading-tight md:text-6xl">Find the right AI solution for what you want to accomplish.</h1>
        <form onSubmit={(e) => { e.preventDefault(); if (value.trim()) go(value.trim()); }} className="mt-8 flex max-w-3xl gap-2">
          <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Décrivez votre besoin en une phrase…"
            className="flex-1 rounded-lg border border-input bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-ring" />
          <button className="rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground hover:opacity-90">Rechercher</button>
        </form>
        <div className="mt-4 flex max-w-3xl flex-wrap gap-2">
          {EXAMPLES.map((e) => (
            <button key={e} onClick={() => go(e)} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary">{e}</button>
          ))}
        </div>
      </section>

      {q && (
        <section>
          <div className="mb-5 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Contraintes détectées :</span>
            {c && Object.entries({ Gratuit: c.free, "Open source": c.openSource, API: c.api, Local: c.local }).filter(([, v]) => v).map(([k]) => (
              <span key={k} className="rounded-full bg-accent px-2.5 py-0.5 text-accent-foreground">{k}</span>
            ))}
            {c && !Object.values(c).some(Boolean) && <span className="text-muted-foreground">aucune</span>}
          </div>
          {results.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">Aucune solution correspondante. Essayez de reformuler ou d'enlever une contrainte.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {results.map((m) => (
                <SolutionCard key={m.solution.slug} s={m.solution}>
                  <ul className="mt-3 space-y-1 text-xs">
                    {m.reasons.map((r) => <li key={r} className="text-primary">● {r}</li>)}
                    <li className="text-muted-foreground">Limite : {m.solution.limits[0]}</li>
                    <li className="text-muted-foreground">Prix : {m.solution.price}</li>
                  </ul>
                </SolutionCard>
              ))}
            </div>
          )}
        </section>
      )}
    </SiteShell>
  );
}
