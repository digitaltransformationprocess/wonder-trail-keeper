import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";
import { LEGAL, LEGAL_DOCS } from "@/lib/legal/config";
import { fadeUp, staggerChildren } from "@/lib/motion";
import { mergeHead, pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/legal/")({
  head: () =>
    mergeHead(
      {
        meta: [
          { title: `Legal — ${LEGAL.productName}` },
          {
            name: "description",
            content: "Terms of Use, Privacy Policy, Cookie Notice, Acceptable Use, and Disclaimer.",
          },
        ],
      },
      pageSeo({ path: "/legal" }),
    ),
  component: LegalIndex,
});

function LegalIndex() {
  const reduce = useReducedMotion();

  return (
    <motion.div initial={reduce ? false : "hidden"} animate="show" variants={staggerChildren}>
      <motion.p
        variants={fadeUp}
        className="text-[0.75rem] font-medium uppercase tracking-[0.12em] text-muted-foreground"
      >
        {LEGAL.productName}
      </motion.p>
      <motion.h1
        variants={fadeUp}
        className="type-display text-clarity mt-2 text-[2.5rem] md:text-[3.25rem]"
      >
        Legal
      </motion.h1>
      <motion.p variants={fadeUp} className="mt-4 max-w-2xl text-[1.05rem] leading-8 text-muted-foreground">
        Policies that govern use of the catalog, accounts, cookies, and third-party tool links.
        Effective {LEGAL.effectiveDate}.
      </motion.p>

      <motion.ul variants={staggerChildren} className="mt-10 space-y-3">
        {LEGAL_DOCS.map((doc) => (
          <motion.li key={doc.id} variants={fadeUp}>
            <Link
              to="/legal/$slug"
              params={{ slug: doc.id }}
              className="glass group block rounded-3xl px-5 py-5 transition-apple hover:bg-fill/50 md:px-6"
            >
              <h2 className="type-title text-[1.2rem] tracking-[-0.02em] group-hover:text-primary">
                {doc.title}
              </h2>
              <p className="mt-1.5 text-[0.875rem] text-muted-foreground">{doc.short}</p>
            </Link>
          </motion.li>
        ))}
      </motion.ul>

      <motion.p variants={fadeUp} className="mt-10 text-[0.75rem] text-muted-foreground">
        Questions:{" "}
        <a href={`mailto:${LEGAL.contactEmail}`} className="text-primary hover:underline">
          {LEGAL.contactEmail}
        </a>
      </motion.p>
    </motion.div>
  );
}
