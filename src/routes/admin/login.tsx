import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { signIn, signUp, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [{ title: "Admin login | AI Discovery" }],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const { user, profile, loading, isStaff } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user && isStaff) {
      void navigate({ to: "/admin" });
    }
  }, [loading, user, isStaff, navigate]);

  const field =
    "w-full rounded-xl glass px-3.5 py-2.5 text-[0.875rem] outline-none transition-apple focus:ring-1 focus:ring-signal/40";

  return (
    <div className="relative flex min-h-screen items-center justify-center atmosphere px-5">
      <div className="absolute right-4 top-4 md:right-6 md:top-6">
        <ThemeToggle />
      </div>
      <div className="glass w-full max-w-md rounded-3xl p-8">
        <h1 className="type-display text-clarity text-[2rem]">Admin</h1>
        <p className="mt-2 text-[0.875rem] text-muted-foreground">
          Staff access for catalog operations. The first account created becomes owner.
        </p>

        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setBusy(true);
            setError(null);
            setInfo(null);
            const action = mode === "signin" ? signIn(email, password) : signUp(email, password);
            void action
              .then((result) => {
                if (mode === "signup" && !result.session) {
                  setInfo("Account created. Confirm your email if required, then sign in.");
                  setMode("signin");
                  return;
                }
                void navigate({ to: "/admin" });
              })
              .catch((err) => {
                setError(err instanceof Error ? err.message : "Authentication failed");
              })
              .finally(() => setBusy(false));
          }}
        >
          <div>
            <label className="mb-1.5 block text-[0.75rem] text-muted-foreground">Email</label>
            <input
              className={field}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[0.75rem] text-muted-foreground">Password</label>
            <input
              className={field}
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>

          {error && <p className="text-[0.8125rem] text-destructive">{error}</p>}
          {info && <p className="text-[0.8125rem] text-primary">{info}</p>}
          {!loading && user && profile && !isStaff && (
            <p className="text-[0.8125rem] text-muted-foreground">
              Signed in as {profile.email}, but role “{profile.role}” has no admin access.
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-primary px-5 py-2.5 text-[0.875rem] font-medium text-primary-foreground disabled:opacity-60"
          >
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create first account"}
          </button>
        </form>

        <button
          type="button"
          className="mt-4 text-[0.8125rem] text-muted-foreground hover:text-foreground"
          onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
        >
          {mode === "signin" ? "Need the first owner account? Sign up" : "Already have an account? Sign in"}
        </button>

        <div className="mt-6">
          <Link to="/" className="text-[0.8125rem] text-primary">
            ← Back to public site
          </Link>
        </div>
      </div>
    </div>
  );
}
