import { useMemo, useState } from "react";
import type { AdminNewsInput, NewsStatus } from "@/lib/admin/news";
import { slugify } from "@/lib/admin/catalog";

const STATUSES: NewsStatus[] = ["draft", "published", "archived"];

const field =
  "w-full rounded-xl glass px-3.5 py-2.5 text-[0.875rem] outline-none transition-apple focus:ring-1 focus:ring-signal/40";
const label = "mb-1.5 block text-[0.75rem] text-muted-foreground";

export function NewsForm({
  initial,
  submitting,
  submitLabel,
  onSubmit,
}: {
  initial?: Partial<AdminNewsInput>;
  submitting?: boolean;
  submitLabel: string;
  onSubmit: (value: AdminNewsInput) => Promise<void>;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [kind, setKind] = useState(initial?.kind ?? "release");
  const [eventType, setEventType] = useState(initial?.eventType ?? "");
  const [publishedAt, setPublishedAt] = useState(
    initial?.publishedAt ?? new Date().toISOString().slice(0, 10),
  );
  const [sourceUrl, setSourceUrl] = useState(initial?.sourceUrl ?? "");
  const [solutionSlug, setSolutionSlug] = useState(initial?.solutionSlug ?? "");
  const [status, setStatus] = useState<NewsStatus>(initial?.status ?? "draft");
  const [error, setError] = useState<string | null>(null);

  const previewSlug = useMemo(
    () => (slugTouched ? slug.trim() || null : slugify(title) || null),
    [slugTouched, slug, title],
  );

  return (
    <form
      className="glass space-y-6 rounded-3xl p-6 md:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        if (!title.trim()) {
          setError("Title is required");
          return;
        }
        if (!summary.trim()) {
          setError("Summary is required");
          return;
        }
        if (!sourceUrl.trim()) {
          setError("Source URL is required");
          return;
        }
        const nextSlug = (slugTouched ? slug.trim() : previewSlug)?.trim() || null;
        void onSubmit({
          title,
          slug: nextSlug,
          summary,
          body: body.trim() || null,
          kind,
          eventType: eventType.trim() || null,
          publishedAt,
          sourceUrl,
          solutionSlug: solutionSlug.trim() || null,
          status,
        }).catch((err) => {
          setError(err instanceof Error ? err.message : "Save failed");
        });
      }}
    >
      {error ? <p className="text-[0.875rem] text-amber-300">{error}</p> : null}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className={label}>Title</label>
          <input className={field} value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className={label}>Slug (optional — for detail page)</label>
          <input
            className={field}
            value={slugTouched ? slug : previewSlug ?? ""}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            placeholder={previewSlug ?? "auto-from-title"}
          />
        </div>
        <div>
          <label className={label}>Published date</label>
          <input
            className={field}
            type="date"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={label}>Kind</label>
          <input
            className={field}
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            placeholder="release, pricing, launch…"
            required
          />
        </div>
        <div>
          <label className={label}>Event type (optional)</label>
          <input className={field} value={eventType} onChange={(e) => setEventType(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className={label}>Summary</label>
          <textarea
            className={`${field} min-h-[88px]`}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className={label}>Body (optional)</label>
          <textarea
            className={`${field} min-h-[140px]`}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label className={label}>Source URL</label>
          <input
            className={field}
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={label}>Linked tool slug (optional)</label>
          <input
            className={field}
            value={solutionSlug}
            onChange={(e) => setSolutionSlug(e.target.value)}
            placeholder="e.g. cursor"
          />
        </div>
        <div>
          <label className={label}>Status</label>
          <select
            className={field}
            value={status}
            onChange={(e) => setStatus(e.target.value as NewsStatus)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-primary px-5 py-2.5 text-[0.875rem] font-medium text-primary-foreground disabled:opacity-60"
      >
        {submitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
