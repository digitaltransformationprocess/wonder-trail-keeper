import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { NewsForm } from "@/components/admin/NewsForm";
import { createAdminNews } from "@/lib/admin/news";

export const Route = createFileRoute("/admin/news/new")({
  head: () => ({
    meta: [{ title: "New news | Admin | AI Discovery" }],
  }),
  component: NewNewsPage,
});

function NewNewsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);

  return (
    <div>
      <h1 className="type-display text-clarity text-[2.5rem]">New news item</h1>
      <p className="mt-2 text-[0.9375rem] text-muted-foreground">
        Draft items stay off Latest until published.
      </p>
      <div className="mt-8">
        <NewsForm
          submitting={submitting}
          submitLabel="Create item"
          onSubmit={async (value) => {
            setSubmitting(true);
            try {
              const id = await createAdminNews(value);
              await queryClient.invalidateQueries({ queryKey: ["admin"] });
              await queryClient.invalidateQueries({ queryKey: ["news"] });
              await navigate({ to: "/admin/news/$id", params: { id } });
            } finally {
              setSubmitting(false);
            }
          }}
        />
      </div>
    </div>
  );
}
