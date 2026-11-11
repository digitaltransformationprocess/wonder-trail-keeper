import { Outlet, createFileRoute, redirect, useRouterState } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { getProfile, getSession, isStaffRole } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    // Login is public; all other /admin routes require staff.
    if (location.pathname === "/admin/login") return;

    const session = await getSession();
    if (!session?.user) {
      throw redirect({ to: "/admin/login" });
    }

    const profile = await getProfile(session.user.id);
    if (!isStaffRole(profile?.role)) {
      throw redirect({ to: "/admin/login" });
    }

    return { profile };
  },
  component: AdminLayout,
});

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname === "/admin/login") return <Outlet />;
  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}
