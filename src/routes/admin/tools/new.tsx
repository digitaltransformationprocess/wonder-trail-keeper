import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ToolForm } from "@/components/admin/ToolForm";
import { createAdminTool, listPlatforms } from "@/lib/admin/catalog";
import { categoriesQuery, solutionTypesQuery } from "@/lib/solutions";

export const Route = createFileRoute("/admin/tools/new")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(categoriesQuery),
      context.queryClient.ensureQueryData(solutionTypesQuery),
    ]);
  },
  head: () => ({
    meta: [{ title: "New tool | Admin | AI Discovery" }],
  }),
  component: NewToolPage,
});

function NewToolPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: categories = [] } = useQuery(categoriesQuery);
  const { data: types = [] } = useQuery(solutionTypesQuery);
  const { data: platforms = [] } = useQuery({
    queryKey: ["admin", "platforms"],
    queryFn: listPlatforms,
  });
  const [submitting, setSubmitting] = useState(false);

  return (
    <div>
      <h1 className="type-display text-clarity text-[2.5rem]">New tool</h1>
      <p className="mt-2 text-[0.9375rem] text-muted-foreground">
        Draft entries stay unpublished until you set status to published.
      </p>
      <div className="mt-8">
        <ToolForm
          categories={categories}
          types={types}
          platforms={platforms}
          submitting={submitting}
          submitLabel="Create tool"
          onSubmit={async (value) => {
            setSubmitting(true);
            try {
              const slug = await createAdminTool(value);
              await queryClient.invalidateQueries({ queryKey: ["admin"] });
              await queryClient.invalidateQueries({ queryKey: ["solutions"] });
              await navigate({ to: "/admin/tools/$slug", params: { slug } });
            } finally {
              setSubmitting(false);
            }
          }}
        />
      </div>
    </div>
  );
}
