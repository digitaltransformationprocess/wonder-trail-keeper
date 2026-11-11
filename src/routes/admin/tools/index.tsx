import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminToolsQuery,
  archiveAdminTool,
  setToolStatus,
  type ToolStatus,
} from "@/lib/admin/catalog";

export const Route = createFileRoute("/admin/tools/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(adminToolsQuery);
  },
  head: () => ({
    meta: [{ title: "Admin tools | AI Discovery" }],
  }),
  component: AdminTools,
});

function statusClass(status: ToolStatus) {
  switch (status) {
    case "published":
      return "text-primary";
    case "pending_review":
    case "needs_update":
      return "text-amber-300";
    case "archived":
      return "text-muted-foreground";
    default:
      return "text-foreground";
  }
}

function AdminTools() {
  const queryClient = useQueryClient();
  const { data = [], isLoading, isError, error, refetch } = useQuery(adminToolsQuery);
  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ToolStatus }) => setToolStatus(id, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
      await queryClient.invalidateQueries({ queryKey: ["solutions"] });
    },
  });
  const archiveMutation = useMutation({
    mutationFn: (id: string) => archiveAdminTool(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
      await queryClient.invalidateQueries({ queryKey: ["solutions"] });
    },
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="type-display text-clarity text-[2.5rem]">Tools</h1>
          <p className="mt-2 text-[0.9375rem] text-muted-foreground">
            Create, review, publish and archive catalog entries.
          </p>
        </div>
        <Link
          to="/admin/tools/new"
          className="rounded-full bg-primary px-5 py-2.5 text-[0.875rem] font-medium text-primary-foreground"
        >
          New tool
        </Link>
      </div>

      {isLoading ? (
        <p className="mt-10 text-muted-foreground">Loading…</p>
      ) : isError ? (
        <div className="glass mt-10 rounded-3xl p-6">
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : "Failed to load tools"}
          </p>
          <button type="button" className="mt-4 text-primary" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      ) : (
        <div className="glass mt-10 overflow-x-auto rounded-3xl">
          <table className="w-full min-w-[720px] border-collapse text-[0.875rem]">
            <thead>
              <tr className="border-b hairline text-left text-muted-foreground">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Publisher</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Verified</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((tool) => (
                <tr key={tool.id} className="border-b hairline">
                  <td className="p-4">
                    <Link
                      to="/admin/tools/$slug"
                      params={{ slug: tool.slug }}
                      className="font-medium hover:text-primary"
                    >
                      {tool.name}
                    </Link>
                    <div className="text-[0.75rem] text-muted-foreground">{tool.slug}</div>
                  </td>
                  <td className="p-4 text-muted-foreground">{tool.publisher ?? "—"}</td>
                  <td className={`p-4 ${statusClass(tool.status)}`}>{tool.status}</td>
                  <td className="p-4 text-muted-foreground">{tool.last_verified_at ?? "—"}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to="/admin/tools/$slug"
                        params={{ slug: tool.slug }}
                        className="text-primary"
                      >
                        Edit
                      </Link>
                      {tool.status !== "published" && (
                        <button
                          type="button"
                          className="text-primary"
                          disabled={mutation.isPending || archiveMutation.isPending}
                          onClick={() => mutation.mutate({ id: tool.id, status: "published" })}
                        >
                          Publish
                        </button>
                      )}
                      {tool.status !== "archived" && (
                        <button
                          type="button"
                          className="text-muted-foreground"
                          disabled={mutation.isPending || archiveMutation.isPending}
                          onClick={() => {
                            if (
                              !window.confirm(
                                `Archive “${tool.name}”? It will leave the public catalog.`,
                              )
                            ) {
                              return;
                            }
                            archiveMutation.mutate(tool.id);
                          }}
                        >
                          Archive
                        </button>
                      )}
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
