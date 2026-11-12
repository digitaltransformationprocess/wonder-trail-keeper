import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  approveAllCandidates,
  queueIngestUrls,
  triggerDiscoverDaily,
  triggerDiscoverNews,
} from "@/lib/admin/ingestion";

export const Route = createFileRoute("/admin/import")({
  head: () => ({
    meta: [{ title: "Import & discovery | AI Discovery Admin" }],
  }),
  component: AdminImport,
});

function AdminImport() {
  const queryClient = useQueryClient();
  const [urls, setUrls] = useState("");
  const [autoApproveTools, setAutoApproveTools] = useState(true);
  const [publishApprovedTools, setPublishApprovedTools] = useState(true);
  const [publishDiscoveredNews, setPublishDiscoveredNews] = useState(false);

  const mutation = useMutation({
    mutationFn: () => queueIngestUrls(urls),
  });

  const discoverToolsMutation = useMutation({
    mutationFn: async () => {
      const discovery = await triggerDiscoverDaily();
      if (discovery.skipped) return { discovery, approval: null };
      let approval = null;
      if (autoApproveTools) {
        approval = await approveAllCandidates(publishApprovedTools);
      }
      return { discovery, approval };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });

  const discoverNewsMutation = useMutation({
    mutationFn: () => triggerDiscoverNews({ publish: publishDiscoveredNews }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
      await queryClient.invalidateQueries({ queryKey: ["news"] });
    },
  });

  return (
    <div>
      <div>
        <h1 className="type-display text-clarity text-[2.5rem]">Import</h1>
        <p className="mt-2 max-w-2xl text-[0.9375rem] text-muted-foreground">
          Lance Firecrawl en recherche (sans coller de liens), ou importe des URLs manuelles.
        </p>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="glass rounded-3xl p-6">
          <p className="text-[0.875rem] text-foreground/90">Découvrir de nouveaux outils</p>
          <p className="mt-2 text-[0.8125rem] text-muted-foreground">
            Firecrawl cherche de nouveaux outils AI, scrape les pages produit, puis les enfile pour
            revue — ou les approuve directement.
          </p>
          <label className="mt-4 flex items-center gap-2 text-[0.8125rem]">
            <input
              type="checkbox"
              checked={autoApproveTools}
              onChange={(e) => setAutoApproveTools(e.target.checked)}
            />
            Approuver automatiquement tout ce qui est extrait
          </label>
          <label className="mt-2 flex items-center gap-2 text-[0.8125rem]">
            <input
              type="checkbox"
              checked={publishApprovedTools}
              onChange={(e) => setPublishApprovedTools(e.target.checked)}
              disabled={!autoApproveTools}
            />
            Publier immédiatement (sinon pending_review)
          </label>
          <button
            type="button"
            disabled={discoverToolsMutation.isPending}
            onClick={() => {
              discoverToolsMutation.reset();
              discoverToolsMutation.mutate();
            }}
            className="mt-4 rounded-full bg-primary px-5 py-2.5 text-[0.875rem] font-medium text-primary-foreground disabled:opacity-50"
          >
            {discoverToolsMutation.isPending ? "Recherche outils…" : "Lancer scraping outils"}
          </button>
          {discoverToolsMutation.isError ? (
            <p className="mt-3 text-[0.875rem] text-red-400">
              {discoverToolsMutation.error instanceof Error
                ? discoverToolsMutation.error.message
                : "Discovery failed"}
            </p>
          ) : null}
          {discoverToolsMutation.data ? (
            <p className="mt-3 text-[0.8125rem] text-muted-foreground">
              {discoverToolsMutation.data.discovery.skipped
                ? `Skipped (${discoverToolsMutation.data.discovery.reason ?? "locked"})`
                : `queued ${discoverToolsMutation.data.discovery.stats?.queued ?? 0} · error ${discoverToolsMutation.data.discovery.stats?.error ?? 0}`}
              {discoverToolsMutation.data.approval
                ? ` · approved ${discoverToolsMutation.data.approval.stats.approved}/${discoverToolsMutation.data.approval.stats.considered}`
                : null}
              {" · "}
              <Link to="/admin/review" className="text-primary">
                Review
              </Link>
            </p>
          ) : null}
        </div>

        <div className="glass rounded-3xl p-6">
          <p className="text-[0.875rem] text-foreground/90">Découvrir des news</p>
          <p className="mt-2 text-[0.8125rem] text-muted-foreground">
            Sources fiables (TechCrunch, Reuters, OpenAI, Anthropic, Google…), actualités du jour,
            reformulation éditoriale, puis création News (brouillon ou publié).
          </p>
          <label className="mt-4 flex items-center gap-2 text-[0.8125rem]">
            <input
              type="checkbox"
              checked={publishDiscoveredNews}
              onChange={(e) => setPublishDiscoveredNews(e.target.checked)}
            />
            Publier directement sur Latest (sinon draft)
          </label>
          <button
            type="button"
            disabled={discoverNewsMutation.isPending}
            onClick={() => {
              discoverNewsMutation.reset();
              discoverNewsMutation.mutate();
            }}
            className="mt-4 rounded-full bg-primary px-5 py-2.5 text-[0.875rem] font-medium text-primary-foreground disabled:opacity-50"
          >
            {discoverNewsMutation.isPending ? "Recherche news…" : "Lancer scraping news"}
          </button>
          {discoverNewsMutation.isError ? (
            <p className="mt-3 text-[0.875rem] text-red-400">
              {discoverNewsMutation.error instanceof Error
                ? discoverNewsMutation.error.message
                : "News discovery failed"}
            </p>
          ) : null}
          {discoverNewsMutation.data ? (
            <div className="mt-3 space-y-2 text-[0.8125rem] text-muted-foreground">
              <p>
                day {String(discoverNewsMutation.data.stats.day ?? "—")} · created{" "}
                {String(discoverNewsMutation.data.stats.created ?? 0)} · exists{" "}
                {String(discoverNewsMutation.data.stats.skipped ?? 0)} · stale{" "}
                {String(discoverNewsMutation.data.stats.stale ?? 0)} · listing{" "}
                {String(discoverNewsMutation.data.stats.listing ?? 0)} · reformulated{" "}
                {String(discoverNewsMutation.data.stats.reformulated ?? 0)} · errors{" "}
                {String(discoverNewsMutation.data.stats.errors ?? 0)}
                {" · "}
                <Link to="/admin/news" className="text-primary">
                  News admin
                </Link>
              </p>
              {Array.isArray(discoverNewsMutation.data.results) &&
              discoverNewsMutation.data.results.length ? (
                <ul className="max-h-40 space-y-1 overflow-auto rounded-2xl bg-fill/40 px-3 py-2 font-mono text-[0.7rem]">
                  {discoverNewsMutation.data.results.slice(0, 12).map((r) => (
                    <li key={`${r.url}-${r.status}`} className="truncate">
                      <span className="text-foreground/80">{r.status}</span> · {r.url}
                      {r.error ? ` (${r.error})` : ""}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <form
        className="mt-10 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.reset();
          mutation.mutate();
        }}
      >
        <label className="block">
          <span className="text-[0.75rem] text-muted-foreground">
            URLs manuelles (optionnel — une par ligne, max 25)
          </span>
          <textarea
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            rows={8}
            placeholder={"https://example.com\nhttps://another-tool.ai"}
            className="mt-2 w-full rounded-2xl border hairline bg-transparent px-4 py-3 font-mono text-[0.8125rem] outline-none focus:border-primary"
          />
        </label>

        <button
          type="submit"
          disabled={mutation.isPending || !urls.trim()}
          className="rounded-full border hairline px-5 py-2.5 text-[0.875rem] disabled:opacity-50"
        >
          {mutation.isPending ? "Queuing scrape…" : "Queue scrape URLs"}
        </button>
      </form>

      {mutation.isError ? (
        <p className="mt-6 text-[0.875rem] text-red-400">
          {mutation.error instanceof Error ? mutation.error.message : "Ingest failed"}
        </p>
      ) : null}

      {mutation.data ? (
        <div className="glass mt-8 rounded-3xl p-6">
          <p className="text-[0.875rem]">
            Run {mutation.data.run_id.slice(0, 8)} · queued {mutation.data.stats["queued"] ?? 0} ·
            exists {mutation.data.stats["exists"] ?? 0} · duplicate{" "}
            {mutation.data.stats["duplicate"] ?? 0} · error {mutation.data.stats["error"] ?? 0}
          </p>
          <ul className="mt-4 space-y-2 text-[0.8125rem] text-muted-foreground">
            {mutation.data.results.map((r) => (
              <li key={r.url}>
                <span className="text-foreground">{r.status}</span> — {r.url}
                {r.error ? ` (${r.error})` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
