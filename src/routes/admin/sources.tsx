import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  adminSourcesQuery,
  updateAdminSource,
  type ReliabilityLevel,
} from "@/lib/admin/sources";

export const Route = createFileRoute("/admin/sources")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(adminSourcesQuery);
  },
  head: () => ({ meta: [{ title: "Sources | Admin | AI Discovery" }] }),
  component: SourcesPage,
});

const field =
  "rounded-xl glass px-3 py-2 text-[0.8125rem] outline-none focus:ring-1 focus:ring-signal/40";

function SourcesPage() {
  const queryClient = useQueryClient();
  const { data: sources = [], isLoading } = useQuery(adminSourcesQuery);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  return (
    <div>
      <h1 className="type-display text-clarity text-[2.5rem]">Sources</h1>
      <p className="mt-2 text-[0.9375rem] text-muted-foreground">
        Reliability levels A–D for evidence linked to catalog claims.
      </p>

      {error ? <p className="mt-4 text-[0.875rem] text-amber-300">{error}</p> : null}

      {isLoading ? (
        <p className="mt-8 text-muted-foreground">Loading sources…</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {sources.map((s) => (
            <li key={s.id} className="glass rounded-3xl p-4">
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="break-all text-[0.875rem] text-primary"
              >
                {s.url}
              </a>
              <p className="mt-1 text-[0.75rem] text-muted-foreground">
                Linked to {s.tool_count} tool{s.tool_count === 1 ? "" : "s"}
              </p>
              <div className="mt-3 flex flex-wrap items-end gap-3">
                <label className="text-[0.75rem] text-muted-foreground">
                  Publisher
                  <input
                    className={`${field} mt-1 block min-w-[10rem]`}
                    defaultValue={s.publisher ?? ""}
                    id={`pub-${s.id}`}
                  />
                </label>
                <label className="text-[0.75rem] text-muted-foreground">
                  Type
                  <input
                    className={`${field} mt-1 block min-w-[8rem]`}
                    defaultValue={s.source_type}
                    id={`type-${s.id}`}
                  />
                </label>
                <label className="text-[0.75rem] text-muted-foreground">
                  Reliability
                  <select
                    className={`${field} mt-1 block`}
                    defaultValue={s.reliability_level}
                    id={`rel-${s.id}`}
                  >
                    {(["A", "B", "C", "D"] as ReliabilityLevel[]).map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  disabled={busyId === s.id}
                  className="rounded-full bg-primary px-4 py-2 text-[0.8125rem] font-medium text-primary-foreground disabled:opacity-60"
                  onClick={() => {
                    const publisher = (
                      document.getElementById(`pub-${s.id}`) as HTMLInputElement
                    ).value;
                    const source_type = (
                      document.getElementById(`type-${s.id}`) as HTMLInputElement
                    ).value;
                    const reliability_level = (
                      document.getElementById(`rel-${s.id}`) as HTMLSelectElement
                    ).value as ReliabilityLevel;
                    setBusyId(s.id);
                    setError(null);
                    void updateAdminSource(s.id, {
                      publisher,
                      source_type,
                      reliability_level,
                    })
                      .then(async () => {
                        await queryClient.invalidateQueries({ queryKey: ["admin", "sources"] });
                      })
                      .catch((err) =>
                        setError(err instanceof Error ? err.message : "Update failed"),
                      )
                      .finally(() => setBusyId(null));
                  }}
                >
                  Save
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
