import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import { Suspense } from "react";
import { SiteShell, SolutionCard } from "@/components/SiteShell";
import {
  categoryQuery,
  filterSolutions,
  solutionsQuery,
} from "@/lib/solutions";
import { fadeUp, springSoft, staggerChildren } from "@/lib/motion";

export const Route = createFileRoute("/categories/$slug")({
  loader: async ({ context, params }) => {
    try {
      const [category] = await Promise.all([
        context.queryClient.ensureQueryData(categoryQuery(params.slug)),
        context.queryClient.ensureQueryData(solutionsQuery),
      ]);
      return category;
    } catch (error) {
      if (error instanceof Error && error.message === "NOT_FOUND") throw notFound();
      throw error;
    }
  },
  head: ({ loaderData, params }) => {
    const name = loaderData?.name ?? params.slug;
    return {
      meta: [
        { title: `${name} — AI category | AI Discovery` },
        {
          name: "description",
          content: `Browse verified AI solutions in the ${name} category.`,
        },
      ],
    };
  },
  notFoundComponent: () => (
    <SiteShell>
      <p className="text-muted-foreground">
        Category not found.{" "}
        <Link to="/explore" className="text-primary">
          Back to Explore
        </Link>
      </p>
    </SiteShell>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  return (
    <SiteShell>
      <Suspense fallback={<p className="text-muted-foreground">Loading category…</p>}>
        <CategoryView />
      </Suspense>
    </SiteShell>
  );
}

function CategoryView() {
  const { slug } = Route.useParams();
  const { data: category } = useSuspenseQuery(categoryQuery(slug));
  const { data: solutions } = useSuspenseQuery(solutionsQuery);
  const list = filterSolutions(solutions, { cat: slug, sort: "name" });
  const reduce = useReducedMotion();

  return (
    <motion.div initial={reduce ? false : "hidden"} animate="show" variants={staggerChildren}>
      <motion.p variants={fadeUp} className="text-[0.8125rem] text-muted-foreground">
        <Link to="/explore" className="hover:text-foreground">
          Explore
        </Link>{" "}
        / Category
      </motion.p>
      <motion.h1
        variants={fadeUp}
        className="type-display text-clarity mt-3 text-[3rem] md:text-[4.5rem]"
      >
        {category.name}
      </motion.h1>
      <motion.p variants={fadeUp} className="mt-4 max-w-2xl text-[1.0625rem] text-muted-foreground">
        {category.description?.trim() ||
          `Verified AI solutions classified under ${category.name}.`}
      </motion.p>
      <motion.p variants={fadeUp} className="mt-3 text-[0.875rem] text-muted-foreground">
        {list.length} solution{list.length === 1 ? "" : "s"}
      </motion.p>

      {list.length === 0 ? (
        <motion.p variants={fadeUp} className="mt-10 text-muted-foreground">
          No published solutions in this category yet.{" "}
          <Link to="/explore" className="text-primary">
            Browse the full catalog
          </Link>
          .
        </motion.p>
      ) : (
        <motion.div variants={staggerChildren} className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => (
            <motion.div key={s.slug} variants={fadeUp} transition={springSoft}>
              <SolutionCard s={s} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
