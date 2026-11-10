import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";

export const Route = createFileRoute("/api/public/jobs/veille")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authFailure = await authenticateCronRequest(request);
        if (authFailure) return authFailure;
        const { runWatch } = await import("@/lib/watch.server");
        const r = await runWatch();
        return Response.json({ message: r.message }, { status: r.status });
      },
    },
  },
});
