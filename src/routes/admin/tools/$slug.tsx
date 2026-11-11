import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { ToolForm } from "@/components/admin/ToolForm";
import {
  adminToolQuery,
  listPlatforms,
  setToolStatus,
  updateAdminTool,
} from "@/lib/admin/catalog";
import { categoriesQuery, solutionTypesQuery } from "@/lib/solutions";

export const Route = createFileRoute("/admin/tools/$slug")({
  loader: async ({ context, params }) => {
    try {
      await Promise.all([
        context.queryClient.ensureQueryData(adminToolQuery(params.slug)),
        context.queryClient.ensureQueryData(categoriesQuery),
        context.queryClient.ensureQueryData(solutionTypesQuery),
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
  const { data: platforms = [] } = useQuery({
    queryKey: ["admin", "platforms"],
    queryFn: listPlatforms,
  });
  const [submitting, setSubmitting] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);

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
              disabled={statusBusy}
              className="rounded-full bg-primary px-4 py-2 text-[0.8125rem] font-medium text-primary-foreground disabled:opacity-60"
              onClick={() => {
                setStatusBusy(true);
                void setToolStatus(tool.id, "published")
                  .then(async () => {
                    await queryClient.invalidateQueries({ queryKey: ["admin"] });
                    await queryClient.invalidateQueries({ queryKey: ["solutions"] });
                  })
                  .finally(() => setStatusBusy(false));
              }}
            >
              Publish
            </button>
          )}
          {tool.status === "published" && (
            <button
              type="button"
              disabled={statusBusy}
              className="glass rounded-full px-4 py-2 text-[0.8125rem] disabled:opacity-60"
              onClick={() => {
                setStatusBusy(true);
                void setToolStatus(tool.id, "archived")
                  .then(async () => {
                    await queryClient.invalidateQueries({ queryKey: ["admin"] });
                    await queryClient.invalidateQueries({ queryKey: ["solutions"] });
                  })
                  .finally(() => setStatusBusy(false));
              }}
            >
              Archive
            </button>
          )}
        </div>
      </div>

      <div className="mt-8">
        <ToolForm
          initial={tool}
          categories={categories}
          types={types}
          platforms={platforms}
          submitting={submitting}
          submitLabel="Save changes"
          onSubmit={async (value) => {
            setSubmitting(true);
            try {
              const nextSlug = await updateAdminTool(tool.id, value);
              await queryClient.invalidateQueries({ queryKey: ["admin"] });
              await queryClient.invalidateQueries({ queryKey: ["solutions"] });
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
