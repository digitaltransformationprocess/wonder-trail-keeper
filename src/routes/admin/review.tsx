import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  approveAllCandidates,
  approveCandidate,
  asPayload,
  pendingCandidatesQuery,
  rejectCandidate,
  type IngestionCandidate,
} from "@/lib/admin/ingestion";

export const Route = createFileRoute("/admin/review")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(pendingCandidatesQuery);
  },
  head: () => ({
    meta: [{ title: "Review queue | AI Discovery Admin" }],
  }),
  component: AdminReview,
});

function AdminReview() {
  const queryClient = useQueryClient();
  const { data = [], isLoading, isError, error, refetch } = useQuery(pendingCandidatesQuery);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [publishNow, setPublishNow] = useState(true);

  const selected = data.find((c) => c.id === selectedId) ?? data[0] ?? null;

  const approveMutation = useMutation({
    mutationFn: (candidate: IngestionCandidate) => approveCandidate(candidate.id, publishNow),
    onSuccess: async () => {
      setSelectedId(null);
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });

  const approveAllMutation = useMutation({
    mutationFn: () => approveAllCandidates(publishNow),
    onSuccess: async () => {
      setSelectedId(null);
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (candidate: IngestionCandidate) => rejectCandidate(candidate.id),
    onSuccess: async () => {
      setSelectedId(null);
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="type-display text-clarity text-[2.5rem]">Review</h1>
          <p className="mt-2 text-[0.9375rem] text-muted-foreground">
            Approve scraped candidates into catalog tools, or reject them.
          </p>
        </div>
        {data.length > 0 ? (
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-[0.8125rem]">
              <input
                type="checkbox"
                checked={publishNow}
                onChange={(e) => setPublishNow(e.target.checked)}
              />
              Publier par défaut
            </label>
            <button
              type="button"
              disabled={approveAllMutation.isPending}
              onClick={() => approveAllMutation.mutate()}
              className="rounded-full bg-primary px-5 py-2.5 text-[0.875rem] font-medium text-primary-foreground disabled:opacity-50"
            >
              {approveAllMutation.isPending
                ? "Approving all…"
                : `Approuver tout (${data.length})`}
            </button>
          </div>
        ) : null}
      </div>

      {approveAllMutation.isError ? (
        <p className="mt-4 text-[0.875rem] text-red-400">
          {approveAllMutation.error instanceof Error
            ? approveAllMutation.error.message
            : "Approve all failed"}
        </p>
      ) : null}
      {approveAllMutation.data ? (
        <p className="mt-4 text-[0.8125rem] text-muted-foreground">
          Approved {approveAllMutation.data.stats.approved}/
          {approveAllMutation.data.stats.considered}
          {approveAllMutation.data.stats.failed
            ? ` · failed ${approveAllMutation.data.stats.failed}`
            : ""}
        </p>
      ) : null}

      {isLoading ? (
        <p className="mt-10 text-muted-foreground">Loading…</p>
      ) : isError ? (
        <div className="glass mt-10 rounded-3xl p-6">
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : "Failed to load candidates"}
          </p>
          <button type="button" className="mt-4 text-primary" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      ) : data.length === 0 ? (
        <p className="mt-10 text-muted-foreground">
          No pending candidates.{" "}
          <Link to="/admin/import" className="text-primary">
            Run discovery
          </Link>
        </p>
      ) : (
        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="space-y-2">
            {data.map((c) => {
              const payload = asPayload(c.extracted_payload);
              const active = (selected?.id ?? "") === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    active ? "border-primary bg-primary/10" : "hairline hover:border-primary/40"
                  }`}
                >
                  <p className="text-[0.9375rem] font-medium">
                    {payload.name || c.candidate_url}
                  </p>
                  <p className="mt-1 truncate text-[0.75rem] text-muted-foreground">
                    {c.source_type} · conf {c.confidence ?? "—"} ·{" "}
                    {new Date(c.discovered_at).toLocaleString()}
                  </p>
                </button>
              );
            })}
          </div>

          {selected ? (
            <CandidateDetail
              candidate={selected}
              publishNow={publishNow}
              onPublishNowChange={setPublishNow}
              approving={approveMutation.isPending}
              rejecting={rejectMutation.isPending}
              actionError={
                approveMutation.error instanceof Error
                  ? approveMutation.error.message
                  : rejectMutation.error instanceof Error
                    ? rejectMutation.error.message
                    : null
              }
              onApprove={() => approveMutation.mutate(selected)}
              onReject={() => rejectMutation.mutate(selected)}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}

function CandidateDetail({
  candidate,
  publishNow,
  onPublishNowChange,
  approving,
  rejecting,
  actionError,
  onApprove,
  onReject,
}: {
  candidate: IngestionCandidate;
  publishNow: boolean;
  onPublishNowChange: (v: boolean) => void;
  approving: boolean;
  rejecting: boolean;
  actionError: string | null;
  onApprove: () => void;
  onReject: () => void;
}) {
  const payload = asPayload(candidate.extracted_payload);
  const busy = approving || rejecting;

  return (
    <div className="glass rounded-3xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="type-title text-[1.5rem]">{payload.name || "Untitled"}</h2>
          <a
            href={candidate.candidate_url}
            target="_blank"
            rel="noreferrer"
            className="mt-1 block break-all text-[0.8125rem] text-primary"
          >
            {candidate.candidate_url}
          </a>
        </div>
        <p className="text-[0.75rem] text-muted-foreground">
          {payload.publisher || "Unknown publisher"}
        </p>
      </div>

      <p className="mt-4 text-[0.9375rem]">{payload.summary || "No summary extracted."}</p>
      {payload.description ? (
        <p className="mt-3 whitespace-pre-wrap text-[0.8125rem] text-muted-foreground">
          {payload.description}
        </p>
      ) : null}

      <dl className="mt-6 grid gap-3 text-[0.8125rem] sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Pricing</dt>
          <dd>
            {payload.pricing_model || "Not disclosed"} · {payload.price_display || "To verify"}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Type</dt>
          <dd>{payload.type || "Tool"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Categories</dt>
          <dd>{(payload.categories ?? []).join(", ") || "—"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Platforms</dt>
          <dd>{(payload.platforms ?? []).join(", ") || "—"}</dd>
        </div>
      </dl>

      <label className="mt-6 flex items-center gap-2 text-[0.8125rem]">
        <input
          type="checkbox"
          checked={publishNow}
          onChange={(e) => onPublishNowChange(e.target.checked)}
        />
        Publier par défaut (sinon pending_review)
      </label>

      {actionError ? <p className="mt-4 text-[0.8125rem] text-red-400">{actionError}</p> : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy || !payload.name || !payload.summary}
          onClick={onApprove}
          className="rounded-full bg-primary px-5 py-2.5 text-[0.875rem] font-medium text-primary-foreground disabled:opacity-50"
        >
          {approving ? "Approving…" : "Approve"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onReject}
          className="rounded-full border hairline px-5 py-2.5 text-[0.875rem] disabled:opacity-50"
        >
          {rejecting ? "Rejecting…" : "Reject"}
        </button>
      </div>
    </div>
  );
}
