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

export async function runtimeSecret(supabase: SupabaseClient, key: string) {
  const fromEnv = Deno.env.get(key);
  if (fromEnv) return fromEnv;
  const { data, error } = await supabase.from("runtime_secrets").select("value").eq("key", key).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.value) throw new Error(`${key} secret is not set`);
  return data.value as string;
}

export async function assertCronSecret(req: Request, supabase?: SupabaseClient) {
  const client = supabase ?? serviceClient();
  const expected = await runtimeSecret(client, "INGEST_CRON_SECRET");
  const provided = req.headers.get("x-ingest-secret");
  if (!provided || provided !== expected) throw new Error("Invalid cron secret");
}
