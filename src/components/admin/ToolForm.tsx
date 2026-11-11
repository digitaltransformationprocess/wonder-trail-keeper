import { useMemo, useState } from "react";
import type { AdminToolInput, ToolStatus } from "@/lib/admin/catalog";
import { linesToList, listToLines, slugify } from "@/lib/admin/catalog";

const STATUSES: ToolStatus[] = [
  "discovered",
  "pending_review",
  "published",
  "needs_update",
  "archived",
];

const PRICING = ["Free", "Freemium", "Paid", "Open source", "Not disclosed"];

const field =
  "w-full rounded-xl glass px-3.5 py-2.5 text-[0.875rem] outline-none transition-apple focus:ring-1 focus:ring-signal/40";
const label = "mb-1.5 block text-[0.75rem] text-muted-foreground";

export function ToolForm({
  initial,
  categories,
  types,
  platforms,
  submitting,
  submitLabel,
  onSubmit,
}: {
  initial?: Partial<AdminToolInput>;
  categories: Array<{ name: string }>;
  types: Array<{ name: string }>;
  platforms: Array<{ label: string }>;
  submitting?: boolean;
  submitLabel: string;
  onSubmit: (value: AdminToolInput) => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [publisherName, setPublisherName] = useState(initial?.publisherName ?? "");
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [officialUrl, setOfficialUrl] = useState(initial?.officialUrl ?? "");
  const [sourceUrl, setSourceUrl] = useState(initial?.sourceUrl ?? initial?.officialUrl ?? "");
  const [status, setStatus] = useState<ToolStatus>(initial?.status ?? "pending_review");
  const [pricingModel, setPricingModel] = useState(initial?.pricingModel ?? "Not disclosed");
  const [priceDisplay, setPriceDisplay] = useState(initial?.priceDisplay ?? "To verify");
  const [apiAvailable, setApiAvailable] = useState(initial?.apiAvailable ?? false);
  const [openSource, setOpenSource] = useState(initial?.openSource ?? false);
  const [localAvailable, setLocalAvailable] = useState(initial?.localAvailable ?? false);
  const [typeName, setTypeName] = useState(initial?.typeName ?? types[0]?.name ?? "Tool");
  const [categoryNames, setCategoryNames] = useState<string[]>(initial?.categoryNames ?? []);
  const [platformLabels, setPlatformLabels] = useState<string[]>(initial?.platformLabels ?? []);
  const [keywords, setKeywords] = useState(listToLines(initial?.keywords ?? []));
  const [strengths, setStrengths] = useState(listToLines(initial?.strengths ?? []));
  const [limits, setLimits] = useState(listToLines(initial?.limits ?? []));
  const [audience, setAudience] = useState(listToLines(initial?.audience ?? []));
  const [alternatives, setAlternatives] = useState(listToLines(initial?.alternativeSlugs ?? []));
  const [lastVerifiedAt, setLastVerifiedAt] = useState(initial?.lastVerifiedAt ?? "");
  const [error, setError] = useState<string | null>(null);

  const previewSlug = useMemo(() => (slugTouched ? slug : slugify(name)), [slugTouched, slug, name]);

  const toggle = (list: string[], value: string, setter: (next: string[]) => void) => {
    setter(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  };

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const payload: AdminToolInput = {
          name,
          slug: previewSlug,
          publisherName,
          summary,
          description,
          officialUrl,
          status,
          pricingModel,
          priceDisplay,
          apiAvailable,
          openSource,
          localAvailable,
          keywords: linesToList(keywords),
          strengths: linesToList(strengths),
          limits: linesToList(limits),
          audience: linesToList(audience),
          typeName,
          categoryNames,
          platformLabels,
          sourceUrl: sourceUrl || officialUrl,
          lastVerifiedAt: lastVerifiedAt || null,
          alternativeSlugs: linesToList(alternatives),
        };
        if (!payload.name || !payload.slug || !payload.publisherName || !payload.summary || !payload.officialUrl) {
          setError("Name, slug, publisher, summary and official URL are required.");
          return;
        }
        if (!payload.categoryNames.length) {
          setError("Select at least one category.");
          return;
        }
        void onSubmit(payload).catch((err) => {
          setError(err instanceof Error ? err.message : "Save failed");
        });
      }}
    >
      <section className="glass grid gap-4 rounded-3xl p-5 md:grid-cols-2">
        <div>
          <label className={label}>Name</label>
          <input
            className={field}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            required
          />
        </div>
        <div>
          <label className={label}>Slug</label>
          <input
            className={field}
            value={previewSlug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
            required
          />
        </div>
        <div>
          <label className={label}>Publisher</label>
          <input
            className={field}
            value={publisherName}
            onChange={(e) => setPublisherName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={label}>Official URL</label>
          <input
            className={field}
            value={officialUrl}
            onChange={(e) => setOfficialUrl(e.target.value)}
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className={label}>Summary</label>
          <input
            className={field}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className={label}>Description</label>
          <textarea
            className={`${field} min-h-28`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
      </section>

      <section className="glass grid gap-4 rounded-3xl p-5 md:grid-cols-3">
        <div>
          <label className={label}>Status</label>
          <select className={field} value={status} onChange={(e) => setStatus(e.target.value as ToolStatus)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Type</label>
          <select className={field} value={typeName} onChange={(e) => setTypeName(e.target.value)}>
            {types.map((t) => (
              <option key={t.name} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Last verified</label>
          <input
            type="date"
            className={field}
            value={lastVerifiedAt ?? ""}
            onChange={(e) => setLastVerifiedAt(e.target.value)}
          />
        </div>
        <div>
          <label className={label}>Pricing model</label>
          <select
            className={field}
            value={pricingModel}
            onChange={(e) => setPricingModel(e.target.value)}
          >
            {PRICING.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Price display</label>
          <input
            className={field}
            value={priceDisplay}
            onChange={(e) => setPriceDisplay(e.target.value)}
          />
        </div>
        <div>
          <label className={label}>Source URL</label>
          <input className={field} value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />
        </div>
        <div className="flex flex-wrap items-center gap-4 md:col-span-3">
          {(
            [
              ["api", apiAvailable, setApiAvailable, "API available"],
              ["oss", openSource, setOpenSource, "Open source"],
              ["local", localAvailable, setLocalAvailable, "Local available"],
            ] as const
          ).map(([key, value, setter, text]) => (
            <label key={key} className="flex items-center gap-2 text-[0.875rem] text-muted-foreground">
              <input
                type="checkbox"
                className="accent-primary"
                checked={value}
                onChange={(e) => setter(e.target.checked)}
              />
              {text}
            </label>
          ))}
        </div>
      </section>

      <section className="glass rounded-3xl p-5">
        <h2 className="type-title text-[1.125rem]">Categories</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((c) => {
            const active = categoryNames.includes(c.name);
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => toggle(categoryNames, c.name, setCategoryNames)}
                className={`rounded-full px-3 py-1.5 text-[0.75rem] transition-apple ${
                  active ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </section>

      <section className="glass rounded-3xl p-5">
        <h2 className="type-title text-[1.125rem]">Platforms</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {platforms.map((p) => {
            const active = platformLabels.includes(p.label);
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => toggle(platformLabels, p.label, setPlatformLabels)}
                className={`rounded-full px-3 py-1.5 text-[0.75rem] transition-apple ${
                  active ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="glass grid gap-4 rounded-3xl p-5 md:grid-cols-2">
        <div>
          <label className={label}>Keywords (comma or newline)</label>
          <textarea className={`${field} min-h-24`} value={keywords} onChange={(e) => setKeywords(e.target.value)} />
        </div>
        <div>
          <label className={label}>Audience</label>
          <textarea className={`${field} min-h-24`} value={audience} onChange={(e) => setAudience(e.target.value)} />
        </div>
        <div>
          <label className={label}>Strengths</label>
          <textarea className={`${field} min-h-24`} value={strengths} onChange={(e) => setStrengths(e.target.value)} />
        </div>
        <div>
          <label className={label}>Limitations</label>
          <textarea className={`${field} min-h-24`} value={limits} onChange={(e) => setLimits(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className={label}>Alternative slugs</label>
          <textarea
            className={`${field} min-h-20`}
            value={alternatives}
            onChange={(e) => setAlternatives(e.target.value)}
            placeholder="claude&#10;gemini"
          />
        </div>
      </section>

      {error && <p className="text-[0.875rem] text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-primary px-6 py-2.5 text-[0.875rem] font-medium text-primary-foreground disabled:opacity-60"
      >
        {submitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
