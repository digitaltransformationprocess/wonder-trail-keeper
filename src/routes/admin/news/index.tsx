import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  adminNewsQuery,
  deleteAdminNews,
  publishAllDraftNews,
  type NewsStatus,
} from "@/lib/admin/news";

export const Route = createFileRoute("/admin/news/")({
  validateSearch: z.object({
    status: z.enum(["all", "draft", "published", "archived"]).optional(),
  }),
  loaderDeps: ({ search }) => ({ status: search.status ?? "all" }),
  loader: async ({ context, deps }) => {
    await context.queryClient.ensureQueryData(
      adminNewsQuery(deps.status as NewsStatus | "all"),
    );
  },
  head: () => ({
    meta: [{ title: "Admin news | AI Discovery" }],
  }),
  component: AdminNewsList,
});

function statusClass(status: NewsStatus) {
  switch (status) {
    case "published":
      return "text-primary";
    case "draft":
      return "text-amber-300";
    case "archived":
      return "text-muted-foreground";
    default:
      return "text-foreground";
  }
}

const FILTERS: Array<{ value: NewsStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

function AdminNewsList() {
  const search = Route.useSearch();
  const status = (search.status ?? "all") as NewsStatus | "all";
  const navigate = useNavigate({ from: "/admin/news" });
  const queryClient = useQueryClient();
  const { data = [], isLoading, isError, error, refetch } = useQuery(adminNewsQuery(status));
  const publishAllMutation = useMutation({
    mutationFn: publishAllDraftNews,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
      await queryClient.invalidateQueries({ queryKey: ["news"] });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminNews(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
      await queryClient.invalidateQueries({ queryKey: ["news"] });
    },
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="type-display text-clarity text-[2.5rem]">News</h1>
          <p className="mt-2 text-[0.9375rem] text-muted-foreground">
            Draft, publish, and archive verified updates for Latest.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={publishAllMutation.isPending}
            onClick={() => publishAllMutation.mutate()}
            className="rounded-full border hairline px-5 py-2.5 text-[0.875rem] disabled:opacity-50"
          >
            {publishAllMutation.isPending ? "Publishing…" : "Publier tous les brouillons"}
          </button>
          <Link
            to="/admin/news/new"
            className="rounded-full bg-primary px-5 py-2.5 text-[0.875rem] font-medium text-primary-foreground"
          >
            New item
          </Link>
        </div>
      </div>

      {publishAllMutation.isError ? (
        <p className="mt-4 text-[0.875rem] text-red-400">
          {publishAllMutation.error instanceof Error
            ? publishAllMutation.error.message
            : "Publish all failed"}
        </p>
      ) : null}
      {publishAllMutation.data ? (
        <p className="mt-4 text-[0.8125rem] text-muted-foreground">
          Published {publishAllMutation.data.published} draft
          {publishAllMutation.data.published === 1 ? "" : "s"}.
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className={
              status === f.value
                ? "rounded-full bg-primary px-4 py-2 text-[0.8125rem] font-medium text-primary-foreground"
                : "glass rounded-full px-4 py-2 text-[0.8125rem] text-muted-foreground hover:text-foreground"
            }
            onClick={() =>
              navigate({
                search: (prev) => ({ ...prev, status: f.value === "all" ? undefined : f.value }),
                replace: true,
              })
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="mt-10 text-muted-foreground">Loading…</p>
      ) : isError ? (
        <div className="glass mt-10 rounded-3xl p-6">
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : "Failed to load news"}
          </p>
          <button type="button" className="mt-4 text-primary" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      ) : data.length === 0 ? (
        <p className="glass mt-10 rounded-3xl px-6 py-12 text-center text-muted-foreground">
          No news items{status !== "all" ? ` with status “${status}”` : ""}.
        </p>
      ) : (
        <div className="glass mt-10 overflow-x-auto rounded-3xl">
          <table className="w-full min-w-[640px] border-collapse text-[0.875rem]">
            <thead>
              <tr className="border-b hairline text-left text-muted-foreground">
                <th className="p-4 font-medium">Title</th>
                <th className="p-4 font-medium">Kind</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Published</th>
                <th className="p-4 font-medium">Tool</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id} className="border-b hairline">
                  <td className="p-4">
                    <Link
                      to="/admin/news/$id"
                      params={{ id: item.id }}
                      className="font-medium hover:text-primary"
                    >
                      {item.title}
                    </Link>
                    {item.slug ? (
                      <div className="text-[0.75rem] text-muted-foreground">{item.slug}</div>
                    ) : null}
                  </td>
                  <td className="p-4 text-muted-foreground">{item.kind}</td>
                  <td className={`p-4 ${statusClass(item.status)}`}>{item.status}</td>
                  <td className="p-4 text-muted-foreground">{item.published_at}</td>
                  <td className="p-4 text-muted-foreground">{item.solution_slug ?? "—"}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      <Link to="/admin/news/$id" params={{ id: item.id }} className="text-primary">
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="text-red-300"
                        disabled={deleteMutation.isPending}
                        onClick={() => {
                          if (
                            !window.confirm(
                              `Delete “${item.title}” permanently? This cannot be undone.`,
                            )
                          ) {
                            return;
                          }
                          deleteMutation.mutate(item.id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
