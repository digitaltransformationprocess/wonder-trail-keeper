import { useMemo, useState } from "react";
import type {
  AdminFeatureAssignment,
  AdminPricingPlanInput,
  AdminSourceClaim,
  AdminToolInput,
  ReliabilityLevel,
  ToolStatus,
} from "@/lib/admin/catalog";
import { linesToList, listToLines, slugify } from "@/lib/admin/catalog";

const STATUSES: ToolStatus[] = [
  "discovered",
  "pending_review",
  "published",
  "needs_update",
  "archived",
];

const PRICING = ["Free", "Freemium", "Paid", "Open source", "Not disclosed"];
const CLAIM_KEYS = ["general", "pricing", "api", "features", "availability", "license"];
const AVAILABILITIES: AdminFeatureAssignment["availability"][] = [
  "available",
  "partial",
  "unavailable",
  "unknown",
];

const field =
  "w-full rounded-xl glass px-3.5 py-2.5 text-[0.875rem] outline-none transition-apple focus:ring-1 focus:ring-signal/40";
const label = "mb-1.5 block text-[0.75rem] text-muted-foreground";

function emptyClaim(officialUrl = ""): AdminSourceClaim {
  return { url: officialUrl, claimKey: "general", reliabilityLevel: "A" };
}

function emptyPlan(): AdminPricingPlanInput {
  return {
    planName: "",
    priceAmount: "",
    currency: "USD",
    billingPeriod: "month",
    pricingModel: "Freemium",
    verifiedAt: "",
  };
}

export function ToolForm({
  initial,
  categories,
  types,
  platforms,
  features = [],
  submitting,
  submitLabel,
  onSubmit,
}: {
  initial?: Partial<AdminToolInput>;
  categories: Array<{ name: string }>;
  types: Array<{ name: string }>;
  platforms: Array<{ label: string }>;
  features?: Array<{ key: string; label: string }>;
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
  const [logoUrl, setLogoUrl] = useState(initial?.logoUrl ?? "");
  const [apiDocsUrl, setApiDocsUrl] = useState(initial?.apiDocsUrl ?? "");
  const [repositoryUrl, setRepositoryUrl] = useState(initial?.repositoryUrl ?? "");
  const [license, setLicense] = useState(initial?.license ?? "");
  const [status, setStatus] = useState<ToolStatus>(initial?.status ?? "pending_review");
  const [pricingModel, setPricingModel] = useState(initial?.pricingModel ?? "Not disclosed");
  const [priceDisplay, setPriceDisplay] = useState(initial?.priceDisplay ?? "To verify");
  const [apiAvailable, setApiAvailable] = useState(initial?.apiAvailable ?? false);
  const [openSource, setOpenSource] = useState(initial?.openSource ?? false);
  const [localAvailable, setLocalAvailable] = useState(initial?.localAvailable ?? false);
  const [typeName, setTypeName] = useState(initial?.typeName ?? types[0]?.name ?? "Tool");
  const [categoryNames, setCategoryNames] = useState<string[]>(initial?.categoryNames ?? []);
  const [platformLabels, setPlatformLabels] = useState<string[]>(initial?.platformLabels ?? []);
  const [featureAssignments, setFeatureAssignments] = useState<AdminFeatureAssignment[]>(
    initial?.featureAssignments ??
      (initial?.featureKeys ?? []).map((key) => ({
        key,
        availability: "available" as const,
        notes: "",
      })),
  );
  const [sourceClaims, setSourceClaims] = useState<AdminSourceClaim[]>(
    initial?.sourceClaims?.length
      ? initial.sourceClaims
      : [emptyClaim(initial?.sourceUrl || initial?.officialUrl || "")],
  );
  const [pricingPlans, setPricingPlans] = useState<AdminPricingPlanInput[]>(
    initial?.pricingPlans?.length ? initial.pricingPlans : [],
  );
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

  const toggleFeature = (key: string) => {
    setFeatureAssignments((prev) => {
      const exists = prev.find((f) => f.key === key);
      if (exists) return prev.filter((f) => f.key !== key);
      return [...prev, { key, availability: "available", notes: "" }];
    });
  };

  const updateFeature = (key: string, patch: Partial<AdminFeatureAssignment>) => {
    setFeatureAssignments((prev) =>
      prev.map((f) => (f.key === key ? { ...f, ...patch } : f)),
    );
  };

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const cleanClaims = sourceClaims.filter((c) => c.url.trim());
        const payload: AdminToolInput = {
          name,
          slug: previewSlug,
          publisherName,
          summary,
          description,
          officialUrl,
          logoUrl,
          apiDocsUrl,
          repositoryUrl,
          license,
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
          featureKeys: featureAssignments.map((f) => f.key),
          featureAssignments,
          sourceUrl: cleanClaims[0]?.url || officialUrl,
          sourceClaims: cleanClaims,
          pricingPlans: pricingPlans.filter((p) => p.planName.trim()),
          lastVerifiedAt: lastVerifiedAt || null,
          alternativeSlugs: linesToList(alternatives),
        };
        if (!payload.name || !payload.slug || !payload.publisherName || !payload.summary || !payload.officialUrl) {
          setError("Name, slug, publisher, summary and official URL are required.");
          return;
        }
        if (!payload.description.trim()) {
          setError("Description is required.");
          return;
        }
        if (!payload.categoryNames.length) {
          setError("Select at least one category.");
          return;
        }
        if (payload.status === "published" && !payload.sourceClaims.length) {
          setError("At least one source claim is required before publishing.");
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
        <div>
          <label className={label}>Logo URL</label>
          <input className={field} value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
        </div>
        <div>
          <label className={label}>API docs URL</label>
          <input className={field} value={apiDocsUrl} onChange={(e) => setApiDocsUrl(e.target.value)} />
        </div>
        <div>
          <label className={label}>Repository URL</label>
          <input
            className={field}
            value={repositoryUrl}
            onChange={(e) => setRepositoryUrl(e.target.value)}
          />
        </div>
        <div>
          <label className={label}>License</label>
          <input className={field} value={license} onChange={(e) => setLicense(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className={label}>Summary</label>
          <input className={field} value={summary} onChange={(e) => setSummary(e.target.value)} required />
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
          <select className={field} value={pricingModel} onChange={(e) => setPricingModel(e.target.value)}>
            {PRICING.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Price display</label>
          <input className={field} value={priceDisplay} onChange={(e) => setPriceDisplay(e.target.value)} />
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="type-title text-[1.125rem]">Sources (claim evidence)</h2>
          <button
            type="button"
            className="text-[0.8125rem] text-primary"
            onClick={() => setSourceClaims((prev) => [...prev, emptyClaim(officialUrl)])}
          >
            Add claim
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {sourceClaims.map((claim, index) => (
            <div key={index} className="grid gap-3 rounded-2xl border hairline p-3 md:grid-cols-[1.4fr_0.7fr_0.5fr_auto]">
              <input
                className={field}
                placeholder="https://…"
                value={claim.url}
                onChange={(e) =>
                  setSourceClaims((prev) =>
                    prev.map((c, i) => (i === index ? { ...c, url: e.target.value } : c)),
                  )
                }
              />
              <select
                className={field}
                value={claim.claimKey}
                onChange={(e) =>
                  setSourceClaims((prev) =>
                    prev.map((c, i) => (i === index ? { ...c, claimKey: e.target.value } : c)),
                  )
                }
              >
                {CLAIM_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
              <select
                className={field}
                value={claim.reliabilityLevel}
                onChange={(e) =>
                  setSourceClaims((prev) =>
                    prev.map((c, i) =>
                      i === index
                        ? { ...c, reliabilityLevel: e.target.value as ReliabilityLevel }
                        : c,
                    ),
                  )
                }
              >
                {(["A", "B", "C", "D"] as ReliabilityLevel[]).map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="text-[0.8125rem] text-muted-foreground"
                onClick={() => setSourceClaims((prev) => prev.filter((_, i) => i !== index))}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="glass rounded-3xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="type-title text-[1.125rem]">Pricing plans</h2>
          <button
            type="button"
            className="text-[0.8125rem] text-primary"
            onClick={() => setPricingPlans((prev) => [...prev, emptyPlan()])}
          >
            Add plan
          </button>
        </div>
        {pricingPlans.length === 0 ? (
          <p className="mt-3 text-[0.8125rem] text-muted-foreground">
            Optional. Public page shows “To verify” when empty.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {pricingPlans.map((plan, index) => (
              <div key={index} className="grid gap-3 rounded-2xl border hairline p-3 md:grid-cols-3">
                <input
                  className={field}
                  placeholder="Plan name"
                  value={plan.planName}
                  onChange={(e) =>
                    setPricingPlans((prev) =>
                      prev.map((p, i) => (i === index ? { ...p, planName: e.target.value } : p)),
                    )
                  }
                />
                <input
                  className={field}
                  placeholder="Amount"
                  value={plan.priceAmount}
                  onChange={(e) =>
                    setPricingPlans((prev) =>
                      prev.map((p, i) => (i === index ? { ...p, priceAmount: e.target.value } : p)),
                    )
                  }
                />
                <input
                  className={field}
                  placeholder="Currency"
                  value={plan.currency}
                  onChange={(e) =>
                    setPricingPlans((prev) =>
                      prev.map((p, i) => (i === index ? { ...p, currency: e.target.value } : p)),
                    )
                  }
                />
                <input
                  className={field}
                  placeholder="Billing period"
                  value={plan.billingPeriod}
                  onChange={(e) =>
                    setPricingPlans((prev) =>
                      prev.map((p, i) =>
                        i === index ? { ...p, billingPeriod: e.target.value } : p,
                      ),
                    )
                  }
                />
                <select
                  className={field}
                  value={plan.pricingModel}
                  onChange={(e) =>
                    setPricingPlans((prev) =>
                      prev.map((p, i) =>
                        i === index ? { ...p, pricingModel: e.target.value } : p,
                      ),
                    )
                  }
                >
                  {PRICING.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <input
                    type="date"
                    className={field}
                    value={plan.verifiedAt}
                    onChange={(e) =>
                      setPricingPlans((prev) =>
                        prev.map((p, i) =>
                          i === index ? { ...p, verifiedAt: e.target.value } : p,
                        ),
                      )
                    }
                  />
                  <button
                    type="button"
                    className="shrink-0 text-[0.8125rem] text-muted-foreground"
                    onClick={() => setPricingPlans((prev) => prev.filter((_, i) => i !== index))}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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

      {features.length > 0 ? (
        <section className="glass rounded-3xl p-5">
          <h2 className="type-title text-[1.125rem]">Capabilities</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {features.map((f) => {
              const active = featureAssignments.some((a) => a.key === f.key);
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => toggleFeature(f.key)}
                  className={`rounded-full px-3 py-1.5 text-[0.75rem] transition-apple ${
                    active ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
          {featureAssignments.length > 0 ? (
            <div className="mt-4 space-y-3">
              {featureAssignments.map((assignment) => {
                const meta = features.find((f) => f.key === assignment.key);
                return (
                  <div
                    key={assignment.key}
                    className="grid gap-3 rounded-2xl border hairline p-3 md:grid-cols-[1fr_0.7fr_1.2fr]"
                  >
                    <p className="self-center text-[0.875rem] font-medium">
                      {meta?.label ?? assignment.key}
                    </p>
                    <select
                      className={field}
                      value={assignment.availability}
                      onChange={(e) =>
                        updateFeature(assignment.key, {
                          availability: e.target.value as AdminFeatureAssignment["availability"],
                        })
                      }
                    >
                      {AVAILABILITIES.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                    <input
                      className={field}
                      placeholder="Notes (optional)"
                      value={assignment.notes}
                      onChange={(e) => updateFeature(assignment.key, { notes: e.target.value })}
                    />
                  </div>
                );
              })}
            </div>
          ) : null}
        </section>
      ) : null}

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
