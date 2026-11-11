import { lazy, Suspense, useEffect, useState } from "react";

const AICoreScene = lazy(() =>
  import("./AICoreScene").then((m) => ({ default: m.AICoreScene })),
);

export function useIsDesktopHero() {
  const [desktop, setDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    setDesktop(media.matches);
    const update = (event: MediaQueryListEvent) => setDesktop(event.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return desktop;
}

export function AICoreSceneLazy({
  onCategorySelect,
  compact = false,
}: {
  onCategorySelect?: (query: string) => void;
  compact?: boolean;
}) {
  return (
    <Suspense
      fallback={
        <div className="hero-visual flex items-center justify-center">
          <div className="visual-glow" />
          <div className="h-40 w-40 rounded-full border border-white/10 bg-white/5" />
        </div>
      }
    >
      <AICoreScene
        compact={compact}
        {...(onCategorySelect ? { onCategorySelect } : {})}
      />
    </Suspense>
  );
}
