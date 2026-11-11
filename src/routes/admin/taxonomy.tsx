import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  adminCategoriesQuery,
  adminFeaturesQuery,
  adminTypesQuery,
  setCategoryActive,
  upsertCategory,
  upsertFeature,
  upsertSolutionType,
} from "@/lib/admin/taxonomy";
import { slugify } from "@/lib/admin/catalog";

export const Route = createFileRoute("/admin/taxonomy")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(adminCategoriesQuery),
      context.queryClient.ensureQueryData(adminTypesQuery),
      context.queryClient.ensureQueryData(adminFeaturesQuery),
    ]);
  },
  head: () => ({ meta: [{ title: "Taxonomy | Admin | AI Discovery" }] }),
  component: TaxonomyPage,
});

const field =
  "w-full rounded-xl glass px-3.5 py-2.5 text-[0.875rem] outline-none focus:ring-1 focus:ring-signal/40";

function TaxonomyPage() {
  const queryClient = useQueryClient();
  const { data: categories = [] } = useQuery(adminCategoriesQuery);
  const { data: types = [] } = useQuery(adminTypesQuery);
  const { data: features = [] } = useQuery(adminFeaturesQuery);

  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [typeName, setTypeName] = useState("");
  const [featureLabel, setFeatureLabel] = useState("");
  const [featureDesc, setFeatureDesc] = useState("");
  const [error, setError] = useState<string | null>(null);

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    await queryClient.invalidateQueries({ queryKey: ["admin", "types"] });
    await queryClient.invalidateQueries({ queryKey: ["admin", "features"] });
    await queryClient.invalidateQueries({ queryKey: ["categories"] });
    await queryClient.invalidateQueries({ queryKey: ["solution-types"] });
    await queryClient.invalidateQueries({ queryKey: ["features-catalog"] });
  };

  const saveCategory = useMutation({
    mutationFn: () =>
      upsertCategory({ name: catName, description: catDesc, slug: slugify(catName) }),
    onSuccess: async () => {
      setCatName("");
      setCatDesc("");
      setError(null);
      await invalidate();
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Save failed"),
  });

  const saveType = useMutation({
    mutationFn: () => upsertSolutionType({ name: typeName, slug: slugify(typeName) }),
    onSuccess: async () => {
      setTypeName("");
      setError(null);
      await invalidate();
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Save failed"),
  });

  const saveFeature = useMutation({
    mutationFn: () =>
      upsertFeature({
        label: featureLabel,
        key: slugify(featureLabel),
        description: featureDesc,
        sort_order: (features.at(-1)?.sort_order ?? 0) + 10,
      }),
    onSuccess: async () => {
      setFeatureLabel("");
      setFeatureDesc("");
      setError(null);
      await invalidate();
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Save failed"),
  });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="type-display text-clarity text-[2.5rem]">Taxonomy</h1>
        <p className="mt-2 text-[0.9375rem] text-muted-foreground">
          Manage categories, solution types, and capability features without code changes.
        </p>
      </div>

      {error ? <p className="text-[0.875rem] text-amber-300">{error}</p> : null}

      <section className="glass rounded-3xl p-5">
        <h2 className="type-title text-[1.25rem]">Categories</h2>
        <form
          className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            saveCategory.mutate();
          }}
        >
          <input
            className={field}
            placeholder="Name"
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            required
          />
          <input
            className={field}
            placeholder="Description (optional)"
            value={catDesc}
            onChange={(e) => setCatDesc(e.target.value)}
          />
          <button
            type="submit"
            className="rounded-full bg-primary px-5 py-2.5 text-[0.875rem] font-medium text-primary-foreground"
            disabled={saveCategory.isPending}
          >
            Add
          </button>
        </form>

        <ul className="mt-6 divide-y hairline">
          {categories.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="font-medium">
                  {c.name}{" "}
                  <span className="text-[0.75rem] text-muted-foreground">/{c.slug}</span>
                </p>
                {c.description ? (
                  <p className="text-[0.8125rem] text-muted-foreground">{c.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                className="text-[0.8125rem] text-primary"
                onClick={() => {
                  void setCategoryActive(c.id, !c.is_active)
                    .then(invalidate)
                    .catch((err) =>
                      setError(err instanceof Error ? err.message : "Update failed"),
                    );
                }}
              >
                {c.is_active ? "Disable" : "Enable"}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="glass rounded-3xl p-5">
        <h2 className="type-title text-[1.25rem]">Solution types</h2>
        <form
          className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            saveType.mutate();
          }}
        >
          <input
            className={field}
            placeholder="Type name"
            value={typeName}
            onChange={(e) => setTypeName(e.target.value)}
            required
          />
          <button
            type="submit"
            className="rounded-full bg-primary px-5 py-2.5 text-[0.875rem] font-medium text-primary-foreground"
            disabled={saveType.isPending}
          >
            Add
          </button>
        </form>
        <ul className="mt-6 divide-y hairline">
          {types.map((t) => (
            <li key={t.id} className="py-3">
              <p className="font-medium">
                {t.name} <span className="text-[0.75rem] text-muted-foreground">/{t.slug}</span>
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="glass rounded-3xl p-5">
        <h2 className="type-title text-[1.25rem]">Capabilities (features)</h2>
        <form
          className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            saveFeature.mutate();
          }}
        >
          <input
            className={field}
            placeholder="Label"
            value={featureLabel}
            onChange={(e) => setFeatureLabel(e.target.value)}
            required
          />
          <input
            className={field}
            placeholder="Description (optional)"
            value={featureDesc}
            onChange={(e) => setFeatureDesc(e.target.value)}
          />
          <button
            type="submit"
            className="rounded-full bg-primary px-5 py-2.5 text-[0.875rem] font-medium text-primary-foreground"
            disabled={saveFeature.isPending}
          >
            Add
          </button>
        </form>
        <ul className="mt-6 divide-y hairline">
          {features.map((f) => (
            <li key={f.id} className="py-3">
              <p className="font-medium">
                {f.label}{" "}
                <span className="text-[0.75rem] text-muted-foreground">{f.key}</span>
              </p>
              {f.description ? (
                <p className="text-[0.8125rem] text-muted-foreground">{f.description}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
