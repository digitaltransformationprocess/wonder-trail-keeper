import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/SiteShell";
import { getSolution, type Solution } from "@/data/catalog";
import { useCompare } from "@/lib/store";

export const Route = createFileRoute("/compare")({
  head: () => ({ meta: [
    { title: "Compare — Comparateur de solutions IA | AI Discovery" },
    { name: "description", content: "Comparez jusqu'à 4 solutions IA sur des critères communs : prix, API, plateformes, limites." },
    { property: "og:title", content: "Comparateur de solutions IA" },
    { property: "og:description", content: "Tableau comparatif clair, données manquantes signalées." },
  ] }),
  component: Compare,
});

const ROWS: [string, (s: Solution) => string][] = [
  ["Type", (s) => s.type], ["Éditeur", (s) => s.publisher], ["Modèle tarifaire", (s) => s.pricingModel], ["Prix", (s) => s.price],
  ["Plateformes", (s) => s.platforms.join(", ")], ["API", (s) => (s.api ? "Oui" : "Non communiqué")], ["Open source", (s) => (s.openSource ? "Oui" : "Non")],
  ["Local", (s) => (s.local ? "Oui" : "Non")], ["Points forts", (s) => s.strengths.join(" · ")], ["Limites", (s) => s.limits.join(" · ")],
  ["Vérifié le", (s) => s.verifiedAt],
];

function Compare() {
  const { list, toggle } = useCompare();
  const items = list.map(getSolution).filter(Boolean) as Solution[];
  return (
    <SiteShell>
      <h1 className="font-display text-4xl">Compare</h1>
      {items.length === 0 ? (
        <p className="mt-6 text-muted-foreground">Ajoutez jusqu'à 4 solutions depuis <Link to="/explore" className="text-primary">Explore</Link> avec « + Comparer ».</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead><tr><th className="w-40" />{items.map((s) => (
              <th key={s.slug} className="p-3 text-left align-top">
                <Link to="/tools/$slug" params={{ slug: s.slug }} className="font-display text-xl">{s.name}</Link>
                <button onClick={() => toggle(s.slug)} className="ml-2 text-xs text-muted-foreground">✕</button>
              </th>))}</tr></thead>
            <tbody>{ROWS.map(([k, f]) => (
              <tr key={k} className="border-t border-border"><td className="p-3 text-muted-foreground">{k}</td>
                {items.map((s) => { const v = f(s); return <td key={s.slug} className={`p-3 align-top ${v.includes("vérifier") || v.includes("Non communiqué") ? "text-muted-foreground italic" : ""}`}>{v}</td>; })}
              </tr>))}</tbody>
          </table>
        </div>
      )}
    </SiteShell>
  );
}
