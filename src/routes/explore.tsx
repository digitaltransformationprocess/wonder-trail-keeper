import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { SiteShell, SolutionCard } from "@/components/SiteShell";
import { CATEGORIES, SOLUTIONS, TYPES } from "@/data/catalog";

export const Route = createFileRoute("/explore")({
  validateSearch: z.object({
    q: z.string().optional(), cat: z.string().optional(), type: z.string().optional(),
    price: z.string().optional(), api: z.boolean().optional(), oss: z.boolean().optional(), local: z.boolean().optional(),
    sort: z.enum(["name", "recent"]).optional(),
  }),
  head: () => ({ meta: [
    { title: "Explore — AI solution catalog | AI Discovery" },
    { name: "description", content: "Browse AI tools, models, APIs, and agents by category, pricing, and platform." },
    { property: "og:title", content: "Explore the AI catalog" },
    { property: "og:description", content: "Filter by category, type, pricing, API access, open source, and local deployment." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Explore,
});

function Explore() {
  const s = Route.useSearch();
  const navigate = useNavigate({ from: "/explore" });
  const set = (patch: Record<string, unknown>) => navigate({ search: (p) => ({ ...p, ...patch }), replace: true });

  let list = SOLUTIONS.filter((x) =>
    (!s.q || `${x.name} ${x.publisher} ${x.summary} ${x.keywords.join(" ")}`.toLowerCase().includes(s.q.toLowerCase())) &&
    (!s.cat || x.categories.includes(s.cat)) && (!s.type || x.type === s.type) && (!s.price || x.pricingModel === s.price) &&
    (!s.api || x.api) && (!s.oss || x.openSource) && (!s.local || x.local));
  list = [...list].sort((a, b) => s.sort === "recent" ? b.verifiedAt.localeCompare(a.verifiedAt) : a.name.localeCompare(b.name));

  const sel = "rounded-lg border border-input bg-card px-3 py-2 text-sm";
  return (
    <SiteShell>
      <h1 className="font-display text-4xl">Explore</h1>
      <div className="mt-6 grid gap-3 md:grid-cols-4">
        <input className={sel + " md:col-span-2"} placeholder="Name, publisher, use case…" value={s.q ?? ""} onChange={(e) => set({ q: e.target.value || undefined })} />
        <select className={sel} value={s.cat ?? ""} onChange={(e) => set({ cat: e.target.value || undefined })}>
          <option value="">All categories</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className={sel} value={s.type ?? ""} onChange={(e) => set({ type: e.target.value || undefined })}>
          <option value="">All types</option>{TYPES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className={sel} value={s.price ?? ""} onChange={(e) => set({ price: e.target.value || undefined })}>
          <option value="">All pricing</option>{["Free", "Freemium", "Paid", "Open source"].map((c) => <option key={c}>{c}</option>)}
        </select>
        {([["api", "API"], ["oss", "Open source"], ["local", "Local"]] as const).map(([k, l]) => (
          <label key={k} className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!s[k]} onChange={(e) => set({ [k]: e.target.checked || undefined })} /> {l}
          </label>
        ))}
        <select className={sel} value={s.sort ?? "name"} onChange={(e) => set({ sort: e.target.value })}>
          <option value="name">Sort: name</option><option value="recent">Sort: last updated</option>
        </select>
      </div>
      <p className="mt-6 text-sm text-muted-foreground">{list.length} solution(s)</p>
      {list.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">No results. Try broader filters.</p>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{list.map((x) => <SolutionCard key={x.slug} s={x} />)}</div>
      )}
    </SiteShell>
  );
}
