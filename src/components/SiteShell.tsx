import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useMotionValueEvent } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { useCompare } from "@/lib/store";
import type { Solution } from "@/lib/solutions";
import { pressScale, springSnappy } from "@/lib/motion";

export function SiteShell({
  children,
  flush = false,
}: {
  children: ReactNode;
  flush?: boolean;
}) {
  const { list } = useCompare();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const [elevated, setElevated] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    setElevated(y > 8);
  });

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const nav = [
    { to: "/", label: "Discover", exact: true },
    { to: "/explore", label: "Explore", exact: false },
    { to: "/latest", label: "Latest", exact: false },
    {
      to: "/compare",
      label: list.length ? `Compare (${list.length})` : "Compare",
      exact: false,
    },
    { to: "/library", label: "Library", exact: false },
  ] as const;

  return (
    <div className="min-h-screen atmosphere text-foreground">
      <header className="sticky top-0 z-40 px-3 pt-3 md:px-6 md:pt-4">
        <div
          className={`mx-auto flex max-w-5xl items-center justify-between gap-4 rounded-full px-4 py-2.5 transition-apple md:px-5 ${
            elevated || menuOpen ? "glass-nav" : "bg-transparent"
          }`}
        >
          <Link
            to="/"
            className="type-title text-[1.05rem] tracking-[-0.03em] text-foreground transition-apple hover:opacity-70"
            onClick={() => setMenuOpen(false)}
          >
            AI Discovery
          </Link>

          <nav className="hidden items-center justify-end gap-x-5 text-[0.8125rem] text-muted-foreground md:flex">
            {nav.map((n) => {
              const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`relative py-1 transition-apple hover:text-foreground ${
                    active ? "font-medium text-foreground" : ""
                  }`}
                >
                  {n.label}
                  {active && !reduce && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-0 -bottom-0.5 h-px bg-signal"
                      transition={springSnappy}
                    />
                  )}
                  {active && reduce && (
                    <span className="absolute inset-x-0 -bottom-0.5 h-px bg-signal" />
                  )}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-apple hover:bg-fill md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-5 w-5" strokeWidth={1.75} /> : <Menu className="h-5 w-5" strokeWidth={1.75} />}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen ? (
            <motion.div
              id="mobile-nav"
              key="mobile-nav"
              initial={reduce ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={springSnappy}
              className="glass-nav mx-auto mt-2 max-w-5xl overflow-hidden rounded-3xl px-2 py-2 md:hidden"
            >
              <nav className="flex flex-col">
                {nav.map((n) => {
                  const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
                  return (
                    <Link
                      key={n.to}
                      to={n.to}
                      onClick={() => setMenuOpen(false)}
                      className={`rounded-2xl px-4 py-3 text-[0.9375rem] transition-apple ${
                        active
                          ? "bg-fill font-medium text-foreground"
                          : "text-muted-foreground hover:bg-fill/60 hover:text-foreground"
                      }`}
                    >
                      {n.label}
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>

      <main className={flush ? "" : "mx-auto max-w-5xl px-5 py-10 md:px-8 md:py-14"}>
        {children}
      </main>

      <footer className="mt-4 border-t hairline">
        <div className="mx-auto max-w-5xl px-5 py-8 text-[0.75rem] leading-relaxed text-muted-foreground md:px-8">
          Clarity over noise. Unverified information is marked “To verify”. Sponsored content is
          never mixed into recommendations.
        </div>
      </footer>
    </div>
  );
}

export function SolutionCard({ s, children }: { s: Solution; children?: ReactNode }) {
  const { has, toggle } = useCompare();
  const reduce = useReducedMotion();

  return (
    <motion.article
      {...(reduce ? {} : pressScale)}
      className="glass flex h-full flex-col rounded-3xl p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            to="/tools/$slug"
            params={{ slug: s.slug }}
            className="type-title text-[1.25rem] text-foreground transition-apple hover:text-primary"
          >
            {s.name}
          </Link>
          <p className="mt-1 text-[0.8125rem] text-muted-foreground">
            {s.publisher} · {s.type}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-fill px-2.5 py-1 text-[0.7rem] text-muted-foreground">
          {s.pricingModel}
        </span>
      </div>

      <p className="type-body mt-4 text-[0.9375rem] text-foreground/85">{s.summary}</p>
      {children}

      <div className="mt-auto flex items-center justify-between gap-3 border-t hairline pt-5 text-[0.75rem] text-muted-foreground">
        <span>
          {s.status === "Verified" ? "Verified" : "To verify"} · {s.verifiedAt}
        </span>
        <button
          type="button"
          onClick={() => toggle(s.slug)}
          className="text-primary transition-apple hover:opacity-70"
        >
          {has(s.slug) ? "Remove" : "Compare"}
        </button>
      </div>
    </motion.article>
  );
}
