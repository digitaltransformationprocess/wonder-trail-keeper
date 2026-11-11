import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { adminDashboardQuery } from "@/lib/admin/catalog";

export const Route = createFileRoute("/admin/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(adminDashboardQuery);
  },
  head: () => ({
    meta: [{ title: "Admin dashboard | AI Discovery" }],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data, isLoading, isError, error, refetch } = useQuery(adminDashboardQuery);

  const cards = [
    { label: "Published tools", value: data?.published },
    { label: "Pending review", value: data?.pendingReview },
    { label: "Pending candidates", value: data?.pendingCandidates },
    { label: "Needs update", value: data?.needsUpdate },
    { label: "Archived", value: data?.archived },
    { label: "Total tools", value: data?.toolsTotal },
    { label: "Published news", value: data?.newsPublished },
  ];

  const latest = data?.latestIngestionRun;
  const latestStats =
    latest?.stats && typeof latest.stats === "object" && !Array.isArray(latest.stats)
      ? (latest.stats as Record<string, unknown>)
      : null;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="type-display text-clarity text-[2.5rem]">Dashboard</h1>
          <p className="mt-2 text-[0.9375rem] text-muted-foreground">
            Catalog health and editorial queue.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/import"
            className="rounded-full border hairline px-5 py-2.5 text-[0.875rem]"
          >
            Import URLs
          </Link>
          <Link
            to="/admin/review"
            className="rounded-full border hairline px-5 py-2.5 text-[0.875rem]"
          >
            Review queue
          </Link>
          <Link
            to="/admin/tools/new"
            className="rounded-full bg-primary px-5 py-2.5 text-[0.875rem] font-medium text-primary-foreground"
          >
            New tool
          </Link>
        </div>
      </div>

      {isLoading ? (
        <p className="mt-10 text-muted-foreground">Loading…</p>
      ) : isError ? (
        <div className="glass mt-10 rounded-3xl p-6">
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : "Failed to load dashboard"}
          </p>
          <button
            type="button"
            className="mt-4 text-primary"
            onClick={() => refetch()}
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <div key={card.label} className="glass rounded-3xl p-6">
                <p className="text-[0.75rem] text-muted-foreground">{card.label}</p>
                <p className="type-title mt-3 text-[2rem]">{card.value ?? 0}</p>
              </div>
            ))}
          </div>

          <div className="glass mt-6 rounded-3xl p-6">
            <p className="text-[0.75rem] text-muted-foreground">Latest ingestion run</p>
            {latest ? (
              <div className="mt-3 text-[0.875rem]">
                <p>
                  {latest.kind} · started {new Date(latest.started_at).toLocaleString()}
                  {latest.finished_at
                    ? ` · finished ${new Date(latest.finished_at).toLocaleString()}`
                    : " · running"}
                </p>
                {latest.error ? (
                  <p className="mt-2 text-amber-300">{latest.error}</p>
                ) : latestStats ? (
                  <p className="mt-2 text-muted-foreground">
                    {Object.entries(latestStats)
                      .map(([k, v]) => `${k}: ${String(v)}`)
                      .join(" · ")}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="mt-3 text-[0.875rem] text-muted-foreground">No runs yet.</p>
            )}
          </div>
        </>
      )}

      <div className="mt-10">
        <Link to="/admin/tools" className="text-[0.875rem] text-primary">
          Manage tools →
        </Link>
      </div>
    </div>
  );
}
