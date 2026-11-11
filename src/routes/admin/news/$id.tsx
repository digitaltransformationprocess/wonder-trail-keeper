import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { NewsForm } from "@/components/admin/NewsForm";
import {
  adminNewsItemQuery,
  deleteAdminNews,
  setNewsStatus,
  updateAdminNews,
  type NewsStatus,
} from "@/lib/admin/news";

export const Route = createFileRoute("/admin/news/$id")({
  loader: async ({ context, params }) => {
    try {
      await context.queryClient.ensureQueryData(adminNewsItemQuery(params.id));
    } catch (error) {
      if (error instanceof Error && error.message === "NOT_FOUND") throw notFound();
      throw error;
    }
  },
  head: ({ params }) => ({
    meta: [{ title: `Edit news ${params.id.slice(0, 8)}… | Admin | AI Discovery` }],
  }),
  notFoundComponent: () => (
    <p className="text-muted-foreground">
      News item not found. <Link to="/admin/news">Back to news</Link>
    </p>
  ),
  component: EditNewsPage,
});

function EditNewsPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
      <EditNews />
    </Suspense>
  );
}

function EditNews() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: item } = useSuspenseQuery(adminNewsItemQuery(id));
  const [submitting, setSubmitting] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const setStatus = (status: NewsStatus) => {
    setStatusBusy(true);
    setStatusError(null);
    void setNewsStatus(id, status)
      .then(async () => {
        await queryClient.invalidateQueries({ queryKey: ["admin"] });
        await queryClient.invalidateQueries({ queryKey: ["news"] });
        await queryClient.invalidateQueries({ queryKey: adminNewsItemQuery(id).queryKey });
      })
      .catch((err) => {
        setStatusError(err instanceof Error ? err.message : "Status update failed");
      })
      .finally(() => setStatusBusy(false));
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.8125rem] text-muted-foreground">{item.status}</p>
          <h1 className="type-display text-clarity text-[2.5rem]">{item.title}</h1>
          <p className="mt-2 text-[0.9375rem] text-muted-foreground">Edit news item</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {item.slug && item.status === "published" ? (
            <Link to="/latest/$slug" params={{ slug: item.slug }} className="glass rounded-full px-4 py-2 text-[0.8125rem]">
              View public
            </Link>
          ) : null}
          {item.status !== "published" ? (
            <button
              type="button"
              disabled={statusBusy || deleteBusy}
              className="rounded-full bg-primary px-4 py-2 text-[0.8125rem] font-medium text-primary-foreground disabled:opacity-60"
              onClick={() => setStatus("published")}
            >
              Publish
            </button>
          ) : (
            <>
              <button
                type="button"
                disabled={statusBusy || deleteBusy}
                className="glass rounded-full px-4 py-2 text-[0.8125rem] disabled:opacity-60"
                onClick={() => setStatus("draft")}
              >
                Unpublish (draft)
              </button>
              <button
                type="button"
                disabled={statusBusy || deleteBusy}
                className="glass rounded-full px-4 py-2 text-[0.8125rem] disabled:opacity-60"
                onClick={() => setStatus("archived")}
              >
                Archive
              </button>
            </>
          )}
          {item.status === "archived" ? (
            <button
              type="button"
              disabled={statusBusy || deleteBusy}
              className="rounded-full bg-primary px-4 py-2 text-[0.8125rem] font-medium text-primary-foreground disabled:opacity-60"
              onClick={() => setStatus("draft")}
            >
              Restore to draft
            </button>
          ) : null}
          <button
            type="button"
            disabled={statusBusy || deleteBusy}
            className="rounded-full border border-red-400/40 px-4 py-2 text-[0.8125rem] text-red-300 disabled:opacity-60"
            onClick={() => {
              if (
                !window.confirm(
                  `Delete “${item.title}” permanently? This cannot be undone.`,
                )
              ) {
                return;
              }
              setDeleteBusy(true);
              setStatusError(null);
              void deleteAdminNews(id)
                .then(async () => {
                  await queryClient.invalidateQueries({ queryKey: ["admin"] });
                  await queryClient.invalidateQueries({ queryKey: ["news"] });
                  await navigate({ to: "/admin/news" });
                })
                .catch((err) => {
                  setStatusError(err instanceof Error ? err.message : "Delete failed");
                })
                .finally(() => setDeleteBusy(false));
            }}
          >
            {deleteBusy ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>

      {statusError ? (
        <p className="mt-4 text-[0.875rem] text-amber-300">{statusError}</p>
      ) : null}

      <div className="mt-8">
        <NewsForm
          initial={item}
          submitting={submitting}
          submitLabel="Save changes"
          onSubmit={async (value) => {
            setSubmitting(true);
            try {
              await updateAdminNews(id, value);
              await queryClient.invalidateQueries({ queryKey: ["admin"] });
              await queryClient.invalidateQueries({ queryKey: ["news"] });
              await queryClient.invalidateQueries({ queryKey: adminNewsItemQuery(id).queryKey });
            } finally {
              setSubmitting(false);
            }
          }}
        />
      </div>
    </div>
  );
}
