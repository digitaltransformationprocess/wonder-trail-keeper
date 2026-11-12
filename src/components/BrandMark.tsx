import { useTheme } from "@/lib/theme";

type BrandMarkProps = {
  className?: string;
  title?: string;
};

/** AI Discov mark — cool slate palette, swaps light/dark asset. */
export function BrandMark({
  className = "h-8 w-8 md:h-9 md:w-9",
  title = "AI Discov",
}: BrandMarkProps) {
  const { resolved } = useTheme();
  const src =
    resolved === "dark" ? "/brand/aidiscov-mark-dark.png" : "/brand/aidiscov-mark-light.png";

  return (
    <img
      src={src}
      alt=""
      width={128}
      height={128}
      className={`shrink-0 rounded-[22%] ${className}`}
      aria-hidden={title ? undefined : true}
      title={title}
    />
  );
}

export function BrandLockup({
  className = "",
  markClassName = "h-8 w-8 md:h-9 md:w-9",
  admin = false,
}: {
  className?: string;
  markClassName?: string;
  admin?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 md:gap-3 ${className}`}>
      <BrandMark className={markClassName} />
      <span className="type-title text-[1.05rem] tracking-[-0.03em] text-foreground md:text-[1.1rem]">
        AI Discov{admin ? " Admin" : ""}
      </span>
    </span>
  );
}
