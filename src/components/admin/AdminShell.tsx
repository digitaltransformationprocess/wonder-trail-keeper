import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { signOut, useAuth } from "@/lib/auth";

export function AdminShell({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const nav = [
    { to: "/admin", label: "Dashboard", exact: true },
    { to: "/admin/tools", label: "Tools", exact: false },
    { to: "/admin/news", label: "News", exact: false },
    { to: "/admin/import", label: "Import", exact: false },
    { to: "/admin/review", label: "Review", exact: false },
    { to: "/admin/changes", label: "Changes", exact: false },
  ] as const;

  return (
    <div className="min-h-screen atmosphere text-foreground">
      <header className="border-b hairline">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-8">
          <div className="flex items-center gap-6">
            <Link to="/admin" className="type-title text-[1.05rem] tracking-[-0.03em]">
              AI Discovery Admin
            </Link>
            <nav className="flex gap-4 text-[0.8125rem] text-muted-foreground">
              {nav.map((n) => {
                const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={active ? "font-medium text-foreground" : "hover:text-foreground"}
                  >
                    {n.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-[0.8125rem] text-muted-foreground">
            <span>
              {profile?.display_name ?? profile?.email} · {profile?.role}
            </span>
            <Link to="/" className="hover:text-foreground">
              Public site
            </Link>
            <button
              type="button"
              className="text-primary hover:opacity-70"
              onClick={() => void signOut()}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-12">{children}</main>
    </div>
  );
}
