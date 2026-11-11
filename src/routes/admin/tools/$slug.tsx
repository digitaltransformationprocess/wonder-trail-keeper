import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { ToolForm } from "@/components/admin/ToolForm";
import {
  adminToolQuery,
  adminToolsQuery,
  archiveAdminTool,
  listPlatforms,
  mergeTools,
  setToolStatus,
  updateAdminTool,
} from "@/lib/admin/catalog";
import { categoriesQuery, featuresCatalogQuery, solutionTypesQuery } from "@/lib/solutions";

export const Route = createFileRoute("/admin/tools/$slug")({
  loader: async ({ context, params }) => {
    try {
      await Promise.all([
        context.queryClient.ensureQueryData(adminToolQuery(params.slug)),
        context.queryClient.ensureQueryData(categoriesQuery),
        context.queryClient.ensureQueryData(solutionTypesQuery),
        context.queryClient.ensureQueryData(featuresCatalogQuery),
        context.queryClient.ensureQueryData(adminToolsQuery),
      ]);
    } catch (error) {
      if (error instanceof Error && error.message === "NOT_FOUND") throw notFound();
      throw error;
    }
  },
  head: ({ params }) => ({
    meta: [{ title: `Edit ${params.slug} | Admin | AI Discovery` }],
  }),
  notFoundComponent: () => (
    <p className="text-muted-foreground">
      Tool not found. <Link to="/admin/tools">Back to tools</Link>
    </p>
  ),
  component: EditToolPage,
});

function EditToolPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Loading tool…</p>}>
      <EditTool />
    </Suspense>
  );
}

function EditTool() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: tool } = useSuspenseQuery(adminToolQuery(slug));
  const { data: categories = [] } = useQuery(categoriesQuery);
  const { data: types = [] } = useQuery(solutionTypesQuery);
  const { data: features = [] } = useQuery(featuresCatalogQuery);
  const { data: allTools = [] } = useQuery(adminToolsQuery);
  const { data: platforms = [] } = useQuery({
    queryKey: ["admin", "platforms"],
    queryFn: listPlatforms,
  });
  const [submitting, setSubmitting] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);
  const [mergeBusy, setMergeBusy] = useState(false);
  const [mergeTargetId, setMergeTargetId] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin"] });
    await queryClient.invalidateQueries({ queryKey: ["solutions"] });
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.8125rem] text-muted-foreground">{tool.status}</p>
          <h1 className="type-display text-clarity text-[2.5rem]">{tool.name}</h1>
          <p className="mt-2 text-[0.9375rem] text-muted-foreground">Edit catalog entry</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/tools/$slug"
            params={{ slug: tool.slug }}
            className="glass rounded-full px-4 py-2 text-[0.8125rem]"
          >
            View public
          </Link>
          {tool.status !== "published" && (
            <button
              type="button"
              disabled={statusBusy || mergeBusy}
              className="rounded-full bg-primary px-4 py-2 text-[0.8125rem] font-medium text-primary-foreground disabled:opacity-60"
              onClick={() => {
                setStatusBusy(true);
                setActionError(null);
                void setToolStatus(tool.id, "published")
                  .then(refresh)
                  .catch((err) => {
                    setActionError(err instanceof Error ? err.message : "Publish failed");
                  })
                  .finally(() => setStatusBusy(false));
              }}
            >
              Publish
            </button>
          )}
          {tool.status !== "archived" && (
            <button
              type="button"
              disabled={statusBusy || mergeBusy}
              className="glass rounded-full px-4 py-2 text-[0.8125rem] disabled:opacity-60"
              onClick={() => {
                if (!window.confirm(`Archive “${tool.name}”? It will leave the public catalog.`)) {
                  return;
                }
                setStatusBusy(true);
                setActionError(null);
                void archiveAdminTool(tool.id)
                  .then(refresh)
                  .catch((err) => {
                    setActionError(err instanceof Error ? err.message : "Archive failed");
                  })
                  .finally(() => setStatusBusy(false));
              }}
            >
              Archive
            </button>
          )}
        </div>
      </div>

      {actionError ? (
        <p className="mt-4 text-[0.875rem] text-amber-300">{actionError}</p>
      ) : null}

      <section className="glass mt-6 rounded-3xl p-5">
        <h2 className="type-title text-[1.125rem]">Merge into another tool</h2>
        <p className="mt-2 text-[0.8125rem] text-muted-foreground">
          Archives this entry and redirects its slug to the target tool.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <select
            className="min-w-[16rem] rounded-xl glass px-3.5 py-2.5 text-[0.875rem]"
            value={mergeTargetId}
            onChange={(e) => setMergeTargetId(e.target.value)}
          >
            <option value="">Select target…</option>
            {allTools
              .filter((t) => t.id !== tool.id && t.status !== "archived")
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.slug})
                </option>
              ))}
          </select>
          <button
            type="button"
            disabled={!mergeTargetId || mergeBusy || statusBusy}
            className="rounded-full border border-amber-400/40 px-4 py-2 text-[0.8125rem] text-amber-200 disabled:opacity-60"
            onClick={() => {
              if (
                !window.confirm(
                  `Merge “${tool.name}” into the selected tool? This archives the current entry.`,
                )
              ) {
                return;
              }
              setMergeBusy(true);
              setActionError(null);
              void mergeTools(tool.id, mergeTargetId)
                .then(async (result) => {
                  await refresh();
                  await navigate({
                    to: "/admin/tools/$slug",
                    params: { slug: result.targetSlug },
                  });
                })
                .catch((err) => {
                  setActionError(err instanceof Error ? err.message : "Merge failed");
                })
                .finally(() => setMergeBusy(false));
            }}
          >
            {mergeBusy ? "Merging…" : "Merge"}
          </button>
        </div>
      </section>

      <div className="mt-8">
        <ToolForm
          initial={tool}
          categories={categories}
          types={types}
          platforms={platforms}
          features={features}
          submitting={submitting}
          submitLabel="Save changes"
          onSubmit={async (value) => {
            setSubmitting(true);
            try {
              const nextSlug = await updateAdminTool(tool.id, value);
              await refresh();
              if (nextSlug !== slug) {
                await navigate({ to: "/admin/tools/$slug", params: { slug: nextSlug } });
              }
            } finally {
              setSubmitting(false);
            }
          }}
        />
      </div>
    </div>
  );
}
