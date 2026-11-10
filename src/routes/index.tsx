import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { SiteShell, SolutionCard } from "@/components/SiteShell";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { discover, extractConstraints } from "@/lib/discover";
import { aiDiscover } from "@/lib/ai-discover.functions";
import { getSolution } from "@/data/catalog";

export const Route = createFileRoute("/")({
  validateSearch: z.object({ q: z.string().optional() }),
  head: () => ({ meta: [
    { title: "AI Discovery — Find the right AI solution for your needs" },
    { name: "description", content: "Describe what you want to accomplish and find verified AI solutions with clear explanations and comparisons." },
    { property: "og:title", content: "AI Discovery — AI search based on your needs" },
    { property: "og:description", content: "AI tool recommendations with explanations, sources, and verification dates." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
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
  const runAi = useServerFn(aiDiscover);
  const ai = useQuery({ queryKey: ["ai-discover", q], queryFn: () => runAi({ data: { q: q! } }), enabled: !!q, staleTime: Infinity, retry: false });
  const useAi = !!ai.data && !ai.data.error;
  const keyword = q ? discover(q) : [];
  const results = useAi
    ? ai.data!.matches.map((m) => ({ solution: getSolution(m.slug)!, reasons: [m.why], caveat: m.caveat })).filter((r) => r.solution)
    : keyword.map((m) => ({ solution: m.solution, reasons: m.reasons, caveat: m.solution.limits[0] }));
  const c = q ? extractConstraints(q) : null;
  const go = (v: string) => { setValue(v); navigate({ search: { q: v } }); };

  return (
    <SiteShell>
      <section className="py-8">
        <p className="text-sm uppercase tracking-widest text-primary">Discover</p>
        <h1 className="mt-3 max-w-3xl font-display text-5xl leading-tight md:text-6xl">Find the right AI solution for what you want to accomplish.</h1>
        <form onSubmit={(e) => { e.preventDefault(); if (value.trim()) go(value.trim()); }} className="mt-8 flex max-w-3xl gap-2">
          <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Describe what you need in one sentence…"
            className="flex-1 rounded-lg border border-input bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-ring" />
          <button className="rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground hover:opacity-90">Search</button>
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
            <span className="text-muted-foreground">Detected requirements:</span>
            {c && Object.entries({ Free: c.free, "Open source": c.openSource, API: c.api, Local: c.local }).filter(([, v]) => v).map(([k]) => (
              <span key={k} className="rounded-full bg-accent px-2.5 py-0.5 text-accent-foreground">{k}</span>
            ))}
            {c && !Object.values(c).some(Boolean) && <span className="text-muted-foreground">none</span>}
          </div>
          {ai.isFetching ? (
            <p className="mb-5 text-sm text-muted-foreground animate-pulse">AI is analyzing your request…</p>
          ) : useAi ? (
            <p className="mb-5 text-sm"><span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">AI</span> <span className="text-muted-foreground">Understood:</span> {ai.data!.understood}</p>
          ) : ai.data?.error ? (
            <p className="mb-5 text-sm text-muted-foreground">{ai.data.error} Showing keyword-based results.</p>
          ) : null}
          {ai.isFetching ? null : results.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">No matching solutions. Try rephrasing or removing a requirement.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {results.map((m) => (
                <SolutionCard key={m.solution.slug} s={m.solution}>
                  <ul className="mt-3 space-y-1 text-xs">
                    {m.reasons.map((r) => <li key={r} className="text-primary">● {r}</li>)}
                    <li className="text-muted-foreground">Limitation: {m.caveat}</li>
                    <li className="text-muted-foreground">Price: {m.solution.price}</li>
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
