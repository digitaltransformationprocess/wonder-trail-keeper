import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

export function serviceClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function userClient(authHeader: string): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !anon) throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
  return createClient(url, anon, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function requireStaff(authHeader: string | null) {
  if (!authHeader) throw new Error("Missing Authorization header");
  const supabase = userClient(authHeader);
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error("Unauthorized");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, email")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profileError) throw new Error(profileError.message);
  if (!profile || !["editor", "admin", "owner"].includes(profile.role)) {
    throw new Error("Forbidden: staff role required");
  }

  return { supabase, user: userData.user, profile, service: serviceClient() };
}

export function assertCronSecret(req: Request) {
  const expected = Deno.env.get("INGEST_CRON_SECRET");
  if (!expected) throw new Error("INGEST_CRON_SECRET is not configured");
  const provided = req.headers.get("x-ingest-secret");
  if (!provided || provided !== expected) throw new Error("Invalid cron secret");
}
