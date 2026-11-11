import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { queueIngestUrls } from "@/lib/admin/ingestion";

export const Route = createFileRoute("/admin/import")({
  head: () => ({
    meta: [{ title: "Import URLs | AI Discovery Admin" }],
  }),
  component: AdminImport,
});

function AdminImport() {
  const [urls, setUrls] = useState("");
  const mutation = useMutation({
    mutationFn: () => queueIngestUrls(urls),
  });

  return (
    <div>
      <div>
        <h1 className="type-display text-clarity text-[2.5rem]">Import</h1>
        <p className="mt-2 max-w-2xl text-[0.9375rem] text-muted-foreground">
          Paste official tool URLs. Firecrawl scrapes each page into the review queue —
          nothing is published until an editor approves it.
        </p>
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
          <span className="text-[0.75rem] text-muted-foreground">URLs (one per line, max 25)</span>
          <textarea
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            rows={12}
            placeholder={"https://example.com\nhttps://another-tool.ai"}
            className="mt-2 w-full rounded-2xl border hairline bg-transparent px-4 py-3 font-mono text-[0.8125rem] outline-none focus:border-primary"
          />
        </label>

        <button
          type="submit"
          disabled={mutation.isPending || !urls.trim()}
          className="rounded-full bg-primary px-5 py-2.5 text-[0.875rem] font-medium text-primary-foreground disabled:opacity-50"
        >
          {mutation.isPending ? "Queuing scrape…" : "Queue scrape"}
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
            exists {mutation.data.stats["exists"] ?? 0} · duplicate {mutation.data.stats["duplicate"] ?? 0} ·
            error {mutation.data.stats["error"] ?? 0}
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
