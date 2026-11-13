import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { SiteShell, SolutionCard } from "@/components/SiteShell";
import { signIn, signOut, signUp, useAuth } from "@/lib/auth";
import {
  addCollectionItem,
  createCollection,
  listCollectionItems,
  listCollections,
  removeCollectionItem,
  type Collection,
} from "@/lib/library";
import { fadeUp, springSoft, staggerChildren } from "@/lib/motion";
import { solutionsBySlugsQuery } from "@/lib/solutions";
import { mergeHead, pageSeo } from "@/lib/seo";
import { useFavorites } from "@/lib/store";

export const Route = createFileRoute("/library")({
  head: () =>
    mergeHead(
      {
        meta: [
          { title: "My Library — Your saved AI solutions | AI Discovery" },
          { name: "description", content: "Find the AI solutions you have saved." },
        ],
      },
      pageSeo({ path: "/library", noindex: true }),
    ),
  component: Library,
});

function LibraryAuthCard() {
  const { user, profile, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const field =
    "w-full rounded-xl glass px-3.5 py-2.5 text-[0.875rem] outline-none transition-apple focus:ring-1 focus:ring-signal/40";

  if (loading) {
    return (
      <motion.div variants={fadeUp} className="glass mt-8 max-w-md rounded-3xl p-6">
        <p className="text-[0.875rem] text-muted-foreground">Checking account…</p>
      </motion.div>
    );
  }

  if (user) {
    return (
      <motion.div variants={fadeUp} className="glass mt-8 max-w-md rounded-3xl p-6">
        <p className="text-[0.9375rem] text-foreground/90">
          Signed in{profile?.email ? ` as ${profile.email}` : ""}. Favorites sync to your account.
        </p>
        <button
          type="button"
          className="mt-4 text-[0.8125rem] text-muted-foreground transition-apple hover:text-foreground"
          onClick={() => {
            void signOut().catch((err) =>
              setError(err instanceof Error ? err.message : "Sign out failed"),
            );
          }}
        >
          Sign out
        </button>
        {error && <p className="mt-2 text-[0.8125rem] text-destructive">{error}</p>}
      </motion.div>
    );
  }

  return (
    <motion.div variants={fadeUp} className="glass mt-8 max-w-md rounded-3xl p-6">
      <h2 className="type-title text-[1.125rem]">Save across devices</h2>
      <p className="mt-2 text-[0.8125rem] text-muted-foreground">
        Create a free account to sync favorites and organize collections. Local saves stay on this
        device until you sign in.
      </p>

      <form
        className="mt-6 space-y-3"
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
            })
            .catch((err) => {
              setError(err instanceof Error ? err.message : "Authentication failed");
            })
            .finally(() => setBusy(false));
        }}
      >
        <div>
          <label className="mb-1 block text-[0.75rem] text-muted-foreground">Email</label>
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
          <label className="mb-1 block text-[0.75rem] text-muted-foreground">Password</label>
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
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-primary px-5 py-2.5 text-[0.875rem] font-medium text-primary-foreground disabled:opacity-60"
        >
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <button
        type="button"
        className="mt-3 text-[0.8125rem] text-muted-foreground hover:text-foreground"
        onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
      >
        {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
      </button>
    </motion.div>
  );
}

function CollectionCard({
  collection,
  favoriteSlugs,
}: {
  collection: Collection;
  favoriteSlugs: string[];
}) {
  const queryClient = useQueryClient();
  const [addSlug, setAddSlug] = useState(favoriteSlugs[0] ?? "");
  const [err, setErr] = useState<string | null>(null);

  const itemsQuery = useQuery({
    queryKey: ["collection-items", collection.id],
    queryFn: () => listCollectionItems(collection.id),
  });

  const addMut = useMutation({
    mutationFn: (slug: string) => addCollectionItem(collection.id, slug),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["collection-items", collection.id] });
      void queryClient.invalidateQueries({ queryKey: ["collections"] });
      setErr(null);
    },
    onError: (e) => setErr(e instanceof Error ? e.message : "Could not add item"),
  });

  const removeMut = useMutation({
    mutationFn: (slug: string) => removeCollectionItem(collection.id, slug),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["collection-items", collection.id] });
      void queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });

  const items = itemsQuery.data ?? [];

  return (
    <div className="glass rounded-3xl p-5">
      <h3 className="type-title text-[1.0625rem]">{collection.name}</h3>
      <p className="mt-1 text-[0.75rem] text-muted-foreground">{items.length} items</p>

      {items.length > 0 && (
        <ul className="mt-3 space-y-1.5 text-[0.8125rem]">
          {items.map((item) => (
            <li key={item.slug} className="flex items-center justify-between gap-2">
              <Link to="/tools/$slug" params={{ slug: item.slug }} className="text-primary hover:opacity-80">
                {item.slug}
              </Link>
              <button
                type="button"
                className="text-[0.75rem] text-muted-foreground hover:text-foreground"
                disabled={removeMut.isPending}
                onClick={() => removeMut.mutate(item.slug)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {favoriteSlugs.length > 0 && (
        <div className="mt-4 flex flex-wrap items-end gap-2">
          <div className="min-w-[10rem] flex-1">
            <label className="mb-1 block text-[0.7rem] text-muted-foreground">Add from favorites</label>
            <select
              className="w-full rounded-xl glass px-3 py-2 text-[0.8125rem] outline-none"
              value={addSlug}
              onChange={(e) => setAddSlug(e.target.value)}
            >
              {favoriteSlugs.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            disabled={!addSlug || addMut.isPending}
            className="rounded-full bg-primary px-4 py-2 text-[0.8125rem] font-medium text-primary-foreground disabled:opacity-50"
            onClick={() => addMut.mutate(addSlug)}
          >
            Add
          </button>
        </div>
      )}

      {err && <p className="mt-2 text-[0.75rem] text-destructive">{err}</p>}
    </div>
  );
}

function CollectionsPanel({ favoriteSlugs }: { favoriteSlugs: string[] }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [createErr, setCreateErr] = useState<string | null>(null);

  const collectionsQuery = useQuery({
    queryKey: ["collections"],
    queryFn: listCollections,
    enabled: !!user,
  });

  const createMut = useMutation({
    mutationFn: () => createCollection(name),
    onSuccess: () => {
      setName("");
      setCreateErr(null);
      void queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
    onError: (e) => setCreateErr(e instanceof Error ? e.message : "Could not create collection"),
  });

  if (!user) return null;

  return (
    <motion.div variants={fadeUp} className="mt-12">
      <h2 className="type-title text-[1.375rem]">Collections</h2>
      <p className="mt-2 max-w-lg text-[0.8125rem] text-muted-foreground">
        Group favorites into named lists — stored in your account.
      </p>

      <form
        className="mt-5 flex max-w-md flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          createMut.mutate();
        }}
      >
        <div className="min-w-[12rem] flex-1">
          <label className="mb-1 block text-[0.75rem] text-muted-foreground">New collection</label>
          <input
            className="w-full rounded-xl glass px-3.5 py-2.5 text-[0.875rem] outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Writing stack"
          />
        </div>
        <button
          type="submit"
          disabled={!name.trim() || createMut.isPending}
          className="rounded-full bg-primary px-5 py-2.5 text-[0.875rem] font-medium text-primary-foreground disabled:opacity-50"
        >
          Create
        </button>
      </form>
      {createErr && <p className="mt-2 text-[0.8125rem] text-destructive">{createErr}</p>}

      {collectionsQuery.isLoading ? (
        <p className="mt-6 text-[0.875rem] text-muted-foreground">Loading collections…</p>
      ) : collectionsQuery.isError ? (
        <p className="mt-6 text-[0.875rem] text-destructive">Could not load collections.</p>
      ) : (collectionsQuery.data?.length ?? 0) === 0 ? (
        <p className="mt-6 text-[0.875rem] text-muted-foreground">No collections yet.</p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {collectionsQuery.data!.map((c) => (
            <CollectionCard key={c.id} collection={c} favoriteSlugs={favoriteSlugs} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function Library() {
  const { list } = useFavorites();
  const { data: items = [], isLoading, isError, error, refetch } = useQuery(
    solutionsBySlugsQuery(list),
  );
  const reduce = useReducedMotion();

  return (
    <SiteShell>
      <motion.div initial={reduce ? false : "hidden"} animate="show" variants={staggerChildren}>
        <motion.h1 variants={fadeUp} className="type-display text-clarity text-[2.5rem] md:text-[3.25rem]">
          Library
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-3 max-w-xl text-[0.9375rem] text-muted-foreground">
          Your kept signals — saved on this device. Sign in to sync favorites and build collections.
        </motion.p>

        <LibraryAuthCard />
        <CollectionsPanel favoriteSlugs={list} />

        <motion.h2 variants={fadeUp} className="type-title mt-12 text-[1.375rem]">
          Favorites
        </motion.h2>

        {list.length === 0 ? (
          <motion.div variants={fadeUp} className="glass mt-6 max-w-md rounded-3xl p-8">
            <p className="text-[1.0625rem] text-foreground/90">Nothing saved yet.</p>
            <Link
              to="/explore"
              className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-[0.875rem] font-medium text-primary-foreground transition-apple hover:brightness-110"
            >
              Explore the catalog
            </Link>
          </motion.div>
        ) : isLoading ? (
          <motion.p variants={fadeUp} className="mt-6 text-muted-foreground">
            Loading library…
          </motion.p>
        ) : isError ? (
          <motion.div variants={fadeUp} className="glass mt-6 max-w-md rounded-3xl p-8">
            <p className="text-muted-foreground">
              Couldn’t load saved solutions{error instanceof Error ? `: ${error.message}` : "."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 rounded-full bg-primary px-5 py-2.5 text-[0.875rem] font-medium text-primary-foreground"
            >
              Retry
            </button>
          </motion.div>
        ) : items.length === 0 ? (
          <motion.div variants={fadeUp} className="glass mt-6 max-w-md rounded-3xl p-8">
            <p className="text-[1.0625rem] text-foreground/90">
              Saved items are no longer published in the catalog.
            </p>
            <Link
              to="/explore"
              className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-[0.875rem] font-medium text-primary-foreground transition-apple hover:brightness-110"
            >
              Explore the catalog
            </Link>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerChildren}
            className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {items.map((s) => (
              <motion.div key={s.slug} variants={fadeUp} transition={springSoft}>
                <SolutionCard s={s} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </SiteShell>
  );
}
