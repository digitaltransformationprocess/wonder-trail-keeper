import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "visitor" | "user" | "contributor" | "editor" | "admin" | "owner";

export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  role: AppRole;
}

const STAFF_ROLES: AppRole[] = ["editor", "admin", "owner"];

export function isStaffRole(role: AppRole | null | undefined): boolean {
  return !!role && STAFF_ROLES.includes(role);
}

export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, display_name, role")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error(`Profile unavailable: ${error.message}`);
  return data as Profile | null;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadProfile = async (nextUser: User | null) => {
      if (!nextUser) {
        if (active) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }
      try {
        const nextProfile = await getProfile(nextUser.id);
        if (active) {
          setProfile(nextProfile);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setProfile(null);
          setError(err instanceof Error ? err.message : "Auth error");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      void loadProfile(data.session?.user ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(true);
      void loadProfile(nextSession?.user ?? null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return {
    session,
    user,
    profile,
    loading,
    error,
    isStaff: isStaffRole(profile?.role),
  };
}
