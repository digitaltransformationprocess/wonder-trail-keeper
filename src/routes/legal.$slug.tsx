import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";
import { BlogContent } from "@/components/BlogContent";
import { LEGAL, LEGAL_DOCS } from "@/lib/legal/config";
import { getLegalDoc } from "@/lib/legal/documents";
import { fadeUp, staggerChildren } from "@/lib/motion";

export const Route = createFileRoute("/legal/$slug")({
  loader: ({ params }) => {
    const doc = getLegalDoc(params.slug);
    if (!doc) throw notFound();
    return doc;
  },
  head: ({ params }) => {
    const doc = getLegalDoc(params.slug);
    return {
      meta: [
        { title: `${doc?.title ?? "Legal"} — ${LEGAL.productName}` },
        { name: "description", content: doc?.subtitle ?? "Legal document" },
      ],
    };
  },
  notFoundComponent: () => (
    <p className="text-muted-foreground">
      Document not found.{" "}
      <Link to="/legal" className="text-primary">
        Back to Legal
      </Link>
    </p>
  ),
  component: LegalDocPage,
});

function LegalDocPage() {
  const { slug } = Route.useParams();
  const doc = getLegalDoc(slug)!;
  const reduce = useReducedMotion();

  return (
    <motion.article
      initial={reduce ? false : "hidden"}
      animate="show"
      variants={staggerChildren}
      className="mx-auto max-w-3xl"
    >
      <motion.p variants={fadeUp} className="text-[0.8125rem] text-muted-foreground">
        <Link to="/legal" className="hover:text-primary">
          Legal
        </Link>
        {" · "}
        {doc.title}
      </motion.p>
      <motion.h1
        variants={fadeUp}
        className="type-display text-clarity mt-4 text-[2.35rem] leading-[1.1] md:text-[3rem]"
      >
        {doc.title}
      </motion.h1>
      <motion.p variants={fadeUp} className="mt-3 text-[0.875rem] text-muted-foreground">
        {doc.subtitle}
      </motion.p>

      <motion.nav variants={fadeUp} className="mt-8 flex flex-wrap gap-2">
        {LEGAL_DOCS.map((item) => (
          <Link
            key={item.id}
            to="/legal/$slug"
            params={{ slug: item.id }}
            className={`rounded-full px-3 py-1 text-[0.75rem] transition-apple ${
              item.id === slug
                ? "bg-primary text-primary-foreground"
                : "glass text-muted-foreground hover:text-foreground"
            }`}
          >
            {item.title}
          </Link>
        ))}
      </motion.nav>

      <motion.div variants={fadeUp} className="mt-10">
        <BlogContent content={doc.body} />
      </motion.div>
    </motion.article>
  );
}
