import { lazy, Suspense } from "react";

const AICoreScene = lazy(() =>
  import("./AICoreScene").then((m) => ({ default: m.AICoreScene })),
);

export function AICoreSceneLazy({
  onCategorySelect,
}: {
  onCategorySelect?: (query: string) => void;
}) {
  return (
    <Suspense
      fallback={
        <div className="hero-visual flex items-center justify-center">
          <div className="visual-glow" />
          <div className="h-40 w-40 rounded-full border border-sky-400/20 bg-sky-500/10 blur-[1px]" />
        </div>
      }
    >
      <AICoreScene {...(onCategorySelect ? { onCategorySelect } : {})} />
    </Suspense>
  );
}
