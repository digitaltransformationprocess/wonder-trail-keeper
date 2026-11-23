/** Company / tool logo with letter fallback — used on Latest cards & detail. */
export function CompanyMark({
  name,
  logoUrl,
  size = "md",
}: {
  name: string | null | undefined;
  logoUrl: string | null | undefined;
  size?: "sm" | "md" | "lg";
}) {
  const dim = size === "sm" ? "h-7 w-7" : size === "lg" ? "h-11 w-11" : "h-9 w-9";
  const radius = size === "lg" ? "rounded-2xl" : "rounded-xl";
  const letter = (name?.trim().charAt(0) || "?").toUpperCase();

  if (logoUrl) {
    const label = name?.trim() ? `${name.trim()} logo` : "Company logo";
    return (
      <img
        src={logoUrl}
        alt={label}
        width={size === "lg" ? 44 : size === "sm" ? 28 : 36}
        height={size === "lg" ? 44 : size === "sm" ? 28 : 36}
        className={`${dim} ${radius} shrink-0 bg-fill object-contain p-1 ring-1 ring-black/5 dark:ring-white/10`}
        loading="lazy"
        decoding="async"
      />
    );
  }

  return (
    <span
      className={`inline-flex ${dim} ${radius} shrink-0 items-center justify-center bg-fill text-[0.75rem] font-medium text-muted-foreground ring-1 ring-black/5 dark:ring-white/10`}
      aria-hidden
    >
      {letter}
    </span>
  );
}
