import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  approveChangeEvent,
  fieldLabel,
  pendingChangeEventsQuery,
  rejectChangeEvent,
  type PendingChangeEvent,
} from "@/lib/admin/changes";

export const Route = createFileRoute("/admin/changes")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(pendingChangeEventsQuery);
  },
  head: () => ({
    meta: [{ title: "Field changes | AI Discovery Admin" }],
  }),
  component: AdminChanges,
});

function AdminChanges() {
  const queryClient = useQueryClient();
  const { data = [], isLoading, isError, error, refetch } = useQuery(pendingChangeEventsQuery);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = data.find((c) => c.id === selectedId) ?? data[0] ?? null;

  const approveMutation = useMutation({
    mutationFn: (event: PendingChangeEvent) => approveChangeEvent(event.id),
    onSuccess: async () => {
      setSelectedId(null);
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (event: PendingChangeEvent) => rejectChangeEvent(event.id),
    onSuccess: async () => {
      setSelectedId(null);
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });

  return (
    <div>
      <div>
        <h1 className="type-display text-clarity text-[2.5rem]">Field changes</h1>
        <p className="mt-2 text-[0.9375rem] text-muted-foreground">
          Review detected changes on published tools before they go live.
        </p>
      </div>

      {isLoading ? (
        <p className="mt-10 text-muted-foreground">Loading…</p>
      ) : isError ? (
        <div className="glass mt-10 rounded-3xl p-6">
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : "Failed to load change events"}
          </p>
          <button type="button" className="mt-4 text-primary" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      ) : data.length === 0 ? (
        <p className="mt-10 text-muted-foreground">No pending field changes.</p>
      ) : (
        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="space-y-2">
            {data.map((c) => {
              const active = (selected?.id ?? "") === c.id;
              const toolName = c.tools?.name ?? "Unknown tool";
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    active ? "border-primary bg-primary/10" : "hairline hover:border-primary/40"
                  }`}
                >
                  <p className="text-[0.9375rem] font-medium">{toolName}</p>
                  <p className="mt-1 text-[0.75rem] text-muted-foreground capitalize">
                    {fieldLabel(c.field_key)} · {new Date(c.detected_at).toLocaleString()}
                  </p>
                </button>
              );
            })}
          </div>

          {selected ? (
            <ChangeDetail
              event={selected}
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

function ChangeDetail({
  event,
  approving,
  rejecting,
  actionError,
  onApprove,
  onReject,
}: {
  event: PendingChangeEvent;
  approving: boolean;
  rejecting: boolean;
  actionError: string | null;
  onApprove: () => void;
  onReject: () => void;
}) {
  const busy = approving || rejecting;
  const tool = event.tools;

  return (
    <div className="glass rounded-3xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="type-title text-[1.5rem]">{tool?.name ?? "Unknown tool"}</h2>
          {tool?.slug ? (
            <Link
              to="/admin/tools/$slug"
              params={{ slug: tool.slug }}
              className="mt-1 block text-[0.8125rem] text-primary"
            >
              Edit tool →
            </Link>
          ) : null}
        </div>
        <p className="text-[0.75rem] text-muted-foreground capitalize">
          {fieldLabel(event.field_key)}
        </p>
      </div>

      <dl className="mt-6 space-y-4 text-[0.875rem]">
        <div>
          <dt className="text-[0.75rem] text-muted-foreground">Current (published)</dt>
          <dd className="mt-1 rounded-xl border hairline bg-muted/20 px-3 py-2 whitespace-pre-wrap">
            {event.old_value ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[0.75rem] text-muted-foreground">Detected (proposed)</dt>
          <dd className="mt-1 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 whitespace-pre-wrap">
            {event.new_value ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[0.75rem] text-muted-foreground">Detected at</dt>
          <dd className="mt-1">{new Date(event.detected_at).toLocaleString()}</dd>
        </div>
      </dl>

      {actionError ? <p className="mt-4 text-[0.8125rem] text-red-400">{actionError}</p> : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy || !event.tool_id}
          onClick={onApprove}
          className="rounded-full bg-primary px-5 py-2.5 text-[0.875rem] font-medium text-primary-foreground disabled:opacity-50"
        >
          {approving ? "Approving…" : "Approve & apply"}
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
