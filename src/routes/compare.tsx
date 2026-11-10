import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/SiteShell";
import { getSolution, type Solution } from "@/data/catalog";
import { useCompare } from "@/lib/store";

export const Route = createFileRoute("/compare")({
  head: () => ({ meta: [
    { title: "Compare — AI solution comparison | AI Discovery" },
    { name: "description", content: "Compare up to 4 AI solutions by pricing, API access, platforms, and limitations." },
    { property: "og:title", content: "AI solution comparison" },
    { property: "og:description", content: "Clear side-by-side comparisons with missing information highlighted." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Compare,
});

const ROWS: [string, (s: Solution) => string][] = [
  ["Type", (s) => s.type], ["Publisher", (s) => s.publisher], ["Pricing model", (s) => s.pricingModel], ["Price", (s) => s.price],
  ["Platforms", (s) => s.platforms.join(", ")], ["API", (s) => (s.api ? "Yes" : "Not disclosed")], ["Open source", (s) => (s.openSource ? "Yes" : "No")],
  ["Local", (s) => (s.local ? "Yes" : "No")], ["Strengths", (s) => s.strengths.join(" · ")], ["Limitations", (s) => s.limits.join(" · ")],
  ["Verified on", (s) => s.verifiedAt],
];

function Compare() {
  const { list, toggle } = useCompare();
  const items = list.map(getSolution).filter(Boolean) as Solution[];
  return (
    <SiteShell>
      <h1 className="font-display text-4xl">Compare</h1>
      {items.length === 0 ? (
        <p className="mt-6 text-muted-foreground">Add up to 4 solutions from <Link to="/explore" className="text-primary">Explore</Link> using “+ Compare”.</p>
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
                {items.map((s) => { const v = f(s); return <td key={s.slug} className={`p-3 align-top ${v.includes("verify") || v.includes("Not disclosed") ? "text-muted-foreground italic" : ""}`}>{v}</td>; })}
              </tr>))}</tbody>
          </table>
        </div>
      )}
    </SiteShell>
  );
}
